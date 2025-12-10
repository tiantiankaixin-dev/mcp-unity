import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { McpUnity } from '../../unity/mcpUnity.js';
import { Logger } from '../../utils/logger.js';
/**
 * Base class for all MCP Unity tools
 * Provides common functionality for tool registration and execution
 */
export declare abstract class BaseTool {
    protected server: McpServer;
    protected mcpUnity: McpUnity;
    protected logger: Logger;
    constructor(server: McpServer, mcpUnity: McpUnity, logger: Logger);
    /**
     * The unique name of the tool (e.g., 'create_script')
     */
    abstract get name(): string;
    /**
     * Human-readable description of what the tool does
     */
    abstract get description(): string;
    /**
     * Zod schema defining the input parameters for this tool
     * Can be a ZodObject or ZodEffects (from .refine())
     */
    abstract get inputSchema(): z.ZodObject<any> | z.ZodEffects<any>;
    /**
     * Optional: Category for grouping tools (e.g., 'scripting', 'physics')
     */
    get category(): string;
    /**
     * Optional: Version of the tool
     */
    get version(): string;
    /**
     * Optional: Whether this tool is deprecated
     */
    get deprecated(): boolean;
    /**
     * Optional: Tags for searching and filtering
     */
    get tags(): string[];
    /**
     * Register this tool with the MCP server
     */
    register(): void;
    /**
     * Extract the shape from a Zod schema
     * Handles ZodObject, ZodEffects, and other schema types
     */
    private extractSchemaShape;
    /**
     * Execute the tool with the given arguments
     * This method handles the communication with Unity and error handling
     */
    protected execute(args: any): Promise<CallToolResult>;
    /**
     * Hook called before executing the tool
     * Override this to add custom pre-execution logic
     */
    protected beforeExecute(args: any): Promise<void>;
    /**
     * Hook called after successful execution
     * Override this to add custom post-execution logic
     */
    protected afterExecute(args: any, result: any): Promise<void>;
    /**
     * Format a successful response
     * Override this to customize success response formatting
     */
    protected formatSuccessResponse(result: any): CallToolResult;
    /**
     * Format an error response
     * Override this to customize error response formatting
     */
    protected formatErrorResponse(error: any): CallToolResult;
    /**
     * Get metadata about this tool
     */
    getMetadata(): {
        name: string;
        description: string;
        category: string;
        version: string;
        deprecated: boolean;
        tags: string[];
        schema: z.ZodObject<any, z.UnknownKeysParam, z.ZodTypeAny, {
            [x: string]: any;
        }, {
            [x: string]: any;
        }> | z.ZodEffects<any, any, any>;
    };
    /**
     * Validate input arguments without executing
     * Useful for testing
     */
    validateInput(args: any): {
        valid: boolean;
        error?: string;
    };
    /**
     * Execute the tool with mock Unity connection (for testing)
     * Override this in tests to provide mock responses
     */
    executeWithMock(args: any, mockResponse: any): Promise<CallToolResult>;
}
/**
 * Base class for tools that return structured data
 */
export declare abstract class DataTool extends BaseTool {
    protected formatSuccessResponse(result: any): CallToolResult;
}
/**
 * Base class for tools that perform batch operations
 */
export declare abstract class BatchTool extends BaseTool {
    protected formatSuccessResponse(result: any): CallToolResult;
}
/**
 * Base class for tools that create GameObjects
 * Automatically includes instanceId and other metadata in the response
 */
export declare abstract class GameObjectCreationTool extends BaseTool {
    protected formatSuccessResponse(result: any): CallToolResult;
}
