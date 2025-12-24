import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpUnity } from '../../unity/mcpUnity.js';
import { Logger } from '../../utils/logger.js';
/**
 * Dynamic Tool Manager
 * Manages runtime tool registration and automatic unloading
 */
export declare class DynamicToolManager {
    private server;
    private mcpUnity;
    private logger;
    private static instance;
    private registeredTools;
    private categoryTools;
    private cleanupInterval;
    private readonly TOOL_TIMEOUT_MS;
    private readonly CLEANUP_INTERVAL_MS;
    private constructor();
    /**
     * Get singleton instance
     */
    static getInstance(server: McpServer, mcpUnity: McpUnity, logger: Logger): DynamicToolManager;
    /**
     * Discover and execute a tool without MCP registration
     * This is the core of zero-registration architecture
     */
    discoverAndUseTool(toolName: string, params: any): Promise<any>;
    /**
     * Discover and execute a tool, returning RAW Unity result (for chaining)
     * Unlike discoverAndUseTool, this returns the actual Unity response object
     * without formatting, making it suitable for parameter chaining between tools.
     */
    discoverAndUseToolRaw(toolName: string, params: any): Promise<any>;
    /**
     * Register all tools in a category
     */
    registerCategory(category: string): Promise<{
        success: boolean;
        message: string;
        toolsRegistered: string[];
        toolsAlreadyRegistered: string[];
    }>;
    /**
     * Record that a tool was used
     */
    recordToolUsage(toolName: string): void;
    /**
     * Manually unregister a category
     */
    unregisterCategory(category: string): {
        success: boolean;
        message: string;
        toolsUnregistered: string[];
    };
    /**
     * Unregister a single tool
     */
    private unregisterTool;
    /**
     * Cleanup expired tools
     */
    private cleanupExpiredTools;
    /**
     * Start automatic cleanup timer
     */
    private startCleanupTimer;
    /**
     * Stop cleanup timer
     */
    stopCleanupTimer(): void;
    /**
     * Send tool list changed notification
     */
    private sendToolListChanged;
    /**
     * Get statistics
     */
    getStatistics(): {
        totalRegistered: number;
        categoriesActive: number;
        toolsByCategory: Record<string, number>;
        toolDetails: Array<{
            name: string;
            category: string;
            idleTimeSeconds: number;
        }>;
    };
    /**
     * Create temporary instance for metadata extraction
     */
    private createTempInstance;
    /**
     * Normalize parameter names from snake_case to camelCase based on tool schema
     * This allows AI to use either format without errors
     */
    private normalizeParams;
    /**
     * Reset (for testing)
     */
    reset(): void;
}
