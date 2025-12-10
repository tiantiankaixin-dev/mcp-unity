import { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import { JSONRPCMessage } from '@modelcontextprotocol/sdk/types.js';
import { Logger } from '../utils/logger.js';
/**
 * WebSocket Server Transport for MCP
 * Supports multiple simultaneous client connections with connection management
 */
export declare class WebSocketServerTransport implements Transport {
    private wss;
    private clients;
    private logger;
    private port;
    private host;
    private heartbeatInterval;
    private readonly HEARTBEAT_INTERVAL;
    private readonly HEARTBEAT_TIMEOUT;
    onclose?: () => void;
    onerror?: (error: Error) => void;
    onmessage?: (message: JSONRPCMessage) => void;
    constructor(port?: number, host?: string, logger?: Logger);
    /**
     * Start the WebSocket server and begin accepting connections
     */
    start(): Promise<void>;
    /**
     * Send a message to all connected clients
     */
    send(message: JSONRPCMessage): Promise<void>;
    /**
     * Close the WebSocket server and all client connections
     */
    close(): Promise<void>;
    /**
     * Start heartbeat mechanism to detect dead connections
     */
    private startHeartbeat;
    /**
     * Generate a unique client ID
     */
    private generateClientId;
    /**
     * Get the number of connected clients
     */
    getClientCount(): number;
    /**
     * Get list of connected client IDs
     */
    getClientIds(): string[];
    /**
     * Send a message to a specific client
     */
    sendToClient(clientId: string, message: JSONRPCMessage): Promise<void>;
    /**
     * Broadcast a message to all clients except one
     */
    broadcast(message: JSONRPCMessage, excludeClientId?: string): Promise<void>;
}
