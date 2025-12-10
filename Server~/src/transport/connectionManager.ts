import { EventEmitter } from 'events';
import { Logger } from '../utils/logger.js';

export interface ConnectionInfo {
  id: string;
  connectedAt: Date;
  lastActivity: Date;
  messageCount: number;
  clientInfo?: {
    name?: string;
    version?: string;
    userAgent?: string;
    ip?: string;
  };
}

export interface ConnectionStats {
  totalConnections: number;
  activeConnections: number;
  totalMessages: number;
  uptime: number;
  startTime: Date;
}

/**
 * Connection Manager for tracking and managing client connections
 */
export class ConnectionManager extends EventEmitter {
  private connections: Map<string, ConnectionInfo> = new Map();
  private stats: ConnectionStats;
  private logger: Logger;

  constructor(logger?: Logger) {
    super();
    this.logger = logger || new Logger('ConnectionManager');
    this.stats = {
      totalConnections: 0,
      activeConnections: 0,
      totalMessages: 0,
      uptime: 0,
      startTime: new Date(),
    };
  }

  /**
   * Register a new connection
   */
  addConnection(clientId: string, clientInfo?: ConnectionInfo['clientInfo']): void {
    const connection: ConnectionInfo = {
      id: clientId,
      connectedAt: new Date(),
      lastActivity: new Date(),
      messageCount: 0,
      clientInfo,
    };

    this.connections.set(clientId, connection);
    this.stats.totalConnections++;
    this.stats.activeConnections++;

    this.logger.info(`Connection added: ${clientId}`, clientInfo);
    this.emit('connection:added', connection);
  }

  /**
   * Remove a connection
   */
  removeConnection(clientId: string): void {
    const connection = this.connections.get(clientId);
    if (connection) {
      this.connections.delete(clientId);
      this.stats.activeConnections--;

      this.logger.info(`Connection removed: ${clientId}`);
      this.emit('connection:removed', connection);
    }
  }

  /**
   * Update connection activity
   */
  updateActivity(clientId: string): void {
    const connection = this.connections.get(clientId);
    if (connection) {
      connection.lastActivity = new Date();
      connection.messageCount++;
      this.stats.totalMessages++;
    }
  }

  /**
   * Get connection info
   */
  getConnection(clientId: string): ConnectionInfo | undefined {
    return this.connections.get(clientId);
  }

  /**
   * Get all connections
   */
  getAllConnections(): ConnectionInfo[] {
    return Array.from(this.connections.values());
  }

  /**
   * Get connection statistics
   */
  getStats(): ConnectionStats {
    return {
      ...this.stats,
      uptime: Date.now() - this.stats.startTime.getTime(),
    };
  }

  /**
   * Check for idle connections
   */
  getIdleConnections(idleTimeMs: number = 300000): ConnectionInfo[] {
    const now = Date.now();
    return Array.from(this.connections.values()).filter(
      (conn) => now - conn.lastActivity.getTime() > idleTimeMs
    );
  }

  /**
   * Clear all connections
   */
  clear(): void {
    this.connections.clear();
    this.stats.activeConnections = 0;
    this.logger.info('All connections cleared');
  }

  /**
   * Get connection count
   */
  getConnectionCount(): number {
    return this.connections.size;
  }

  /**
   * Check if a connection exists
   */
  hasConnection(clientId: string): boolean {
    return this.connections.has(clientId);
  }

  /**
   * Get formatted connection summary
   */
  getSummary(): string {
    const stats = this.getStats();
    const uptimeHours = (stats.uptime / (1000 * 60 * 60)).toFixed(2);
    
    return `
Connection Summary:
- Active Connections: ${stats.activeConnections}
- Total Connections: ${stats.totalConnections}
- Total Messages: ${stats.totalMessages}
- Uptime: ${uptimeHours} hours
- Started: ${stats.startTime.toISOString()}
    `.trim();
  }
}

