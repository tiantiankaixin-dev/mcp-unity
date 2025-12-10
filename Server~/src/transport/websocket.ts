import { WebSocketServer, WebSocket } from 'ws';
import { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import { JSONRPCMessage, JSONRPCMessageSchema } from '@modelcontextprotocol/sdk/types.js';
import { Logger } from '../utils/logger.js';

/**
 * WebSocket Server Transport for MCP
 * Supports multiple simultaneous client connections with connection management
 */
export class WebSocketServerTransport implements Transport {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, WebSocket> = new Map();
  private logger: Logger;
  private port: number;
  private host: string;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private readonly HEARTBEAT_INTERVAL = 30000; // 30 seconds
  private readonly HEARTBEAT_TIMEOUT = 10000; // 10 seconds

  // Transport interface callbacks
  onclose?: () => void;
  onerror?: (error: Error) => void;
  onmessage?: (message: JSONRPCMessage) => void;

  constructor(port: number = 3000, host: string = '0.0.0.0', logger?: Logger) {
    this.port = port;
    this.host = host;
    this.logger = logger || new Logger('WebSocketTransport');
  }

  /**
   * Start the WebSocket server and begin accepting connections
   */
  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Check if server is already running
        if (this.wss !== null) {
          const error = new Error(`WebSocketServer already started on ${this.host}:${this.port}`);
          this.logger.error('Attempted to start server twice!', error);
          reject(error);
          return;
        }

        this.logger.info(`Starting WebSocket server on ${this.host}:${this.port}...`);

        this.wss = new WebSocketServer({
          port: this.port,
          host: this.host,
        });

        this.wss.on('listening', () => {
          this.logger.info(`WebSocket server listening on ${this.host}:${this.port}`);
          this.startHeartbeat();
          resolve();
        });

        this.wss.on('connection', (ws: WebSocket, req) => {
          const clientId = this.generateClientId();
          const clientIp = req.socket.remoteAddress;
          
          this.logger.info(`New client connected: ${clientId} from ${clientIp}`);
          this.clients.set(clientId, ws);

          // Set up client-specific properties
          (ws as any).clientId = clientId;
          (ws as any).isAlive = true;

          // Handle incoming messages from this client
          ws.on('message', (data: Buffer) => {
            try {
              const message = JSON.parse(data.toString());
              const validatedMessage = JSONRPCMessageSchema.parse(message);
              
              this.logger.debug(`Message received from ${clientId}:`, validatedMessage);
              
              // Call the onmessage callback if set
              if (this.onmessage) {
                this.onmessage(validatedMessage);
              }
            } catch (error) {
              this.logger.error(`Invalid message from ${clientId}:`, error);
              if (this.onerror) {
                this.onerror(error instanceof Error ? error : new Error(String(error)));
              }
            }
          });

          // Handle pong responses for heartbeat
          ws.on('pong', () => {
            (ws as any).isAlive = true;
          });

          // Handle client disconnection
          ws.on('close', () => {
            this.logger.info(`Client disconnected: ${clientId}`);
            this.clients.delete(clientId);
            
            // If all clients disconnected, call onclose
            if (this.clients.size === 0 && this.onclose) {
              this.onclose();
            }
          });

          // Handle client errors
          ws.on('error', (error) => {
            this.logger.error(`Client error ${clientId}:`, error);
            this.clients.delete(clientId);
            if (this.onerror) {
              this.onerror(error);
            }
          });
        });

        this.wss.on('error', (error) => {
          this.logger.error('WebSocket server error:', error);
          if (this.onerror) {
            this.onerror(error);
          }
          reject(error);
        });

      } catch (error) {
        this.logger.error('Failed to start WebSocket server:', error);
        reject(error);
      }
    });
  }

  /**
   * Send a message to all connected clients
   */
  async send(message: JSONRPCMessage): Promise<void> {
    const data = JSON.stringify(message);
    const promises: Promise<void>[] = [];

    this.clients.forEach((ws, clientId) => {
      if (ws.readyState === WebSocket.OPEN) {
        promises.push(
          new Promise((resolve, reject) => {
            ws.send(data, (error) => {
              if (error) {
                this.logger.error(`Failed to send message to ${clientId}:`, error);
                reject(error);
              } else {
                this.logger.debug(`Message sent to ${clientId}`);
                resolve();
              }
            });
          })
        );
      }
    });

    // Wait for all sends to complete
    await Promise.all(promises);
  }

  /**
   * Close the WebSocket server and all client connections
   */
  async close(): Promise<void> {
    return new Promise((resolve) => {
      this.logger.info('Closing WebSocket server...');

      // Stop heartbeat
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
      }

      // Close all client connections
      this.clients.forEach((ws, clientId) => {
        this.logger.debug(`Closing connection to ${clientId}`);
        ws.close();
      });
      this.clients.clear();

      // Close the server
      if (this.wss) {
        this.wss.close(() => {
          this.logger.info('WebSocket server closed');
          if (this.onclose) {
            this.onclose();
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Start heartbeat mechanism to detect dead connections
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach((ws, clientId) => {
        if ((ws as any).isAlive === false) {
          this.logger.warn(`Client ${clientId} failed heartbeat, terminating`);
          ws.terminate();
          this.clients.delete(clientId);
          return;
        }

        (ws as any).isAlive = false;
        ws.ping();
      });
    }, this.HEARTBEAT_INTERVAL);
  }

  /**
   * Generate a unique client ID
   */
  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get the number of connected clients
   */
  getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Get list of connected client IDs
   */
  getClientIds(): string[] {
    return Array.from(this.clients.keys());
  }

  /**
   * Send a message to a specific client
   */
  async sendToClient(clientId: string, message: JSONRPCMessage): Promise<void> {
    const ws = this.clients.get(clientId);
    if (!ws) {
      throw new Error(`Client ${clientId} not found`);
    }

    if (ws.readyState !== WebSocket.OPEN) {
      throw new Error(`Client ${clientId} is not connected`);
    }

    return new Promise((resolve, reject) => {
      ws.send(JSON.stringify(message), (error) => {
        if (error) {
          this.logger.error(`Failed to send message to ${clientId}:`, error);
          reject(error);
        } else {
          this.logger.debug(`Message sent to ${clientId}`);
          resolve();
        }
      });
    });
  }

  /**
   * Broadcast a message to all clients except one
   */
  async broadcast(message: JSONRPCMessage, excludeClientId?: string): Promise<void> {
    const data = JSON.stringify(message);
    const promises: Promise<void>[] = [];

    this.clients.forEach((ws, clientId) => {
      if (clientId !== excludeClientId && ws.readyState === WebSocket.OPEN) {
        promises.push(
          new Promise((resolve, reject) => {
            ws.send(data, (error) => {
              if (error) {
                this.logger.error(`Failed to broadcast to ${clientId}:`, error);
                reject(error);
              } else {
                resolve();
              }
            });
          })
        );
      }
    });

    await Promise.all(promises);
  }
}

