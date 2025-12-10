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
export declare class ConnectionManager extends EventEmitter {
    private connections;
    private stats;
    private logger;
    constructor(logger?: Logger);
    /**
     * Register a new connection
     */
    addConnection(clientId: string, clientInfo?: ConnectionInfo['clientInfo']): void;
    /**
     * Remove a connection
     */
    removeConnection(clientId: string): void;
    /**
     * Update connection activity
     */
    updateActivity(clientId: string): void;
    /**
     * Get connection info
     */
    getConnection(clientId: string): ConnectionInfo | undefined;
    /**
     * Get all connections
     */
    getAllConnections(): ConnectionInfo[];
    /**
     * Get connection statistics
     */
    getStats(): ConnectionStats;
    /**
     * Check for idle connections
     */
    getIdleConnections(idleTimeMs?: number): ConnectionInfo[];
    /**
     * Clear all connections
     */
    clear(): void;
    /**
     * Get connection count
     */
    getConnectionCount(): number;
    /**
     * Check if a connection exists
     */
    hasConnection(clientId: string): boolean;
    /**
     * Get formatted connection summary
     */
    getSummary(): string;
}
