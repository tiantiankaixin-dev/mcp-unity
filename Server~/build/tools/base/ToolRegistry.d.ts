import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpUnity } from '../../unity/mcpUnity.js';
import { Logger } from '../../utils/logger.js';
import { BaseTool } from './BaseTool.js';
/**
 * Metadata about a tool
 */
export interface ToolMetadata {
    name: string;
    description: string;
    category: string;
    version?: string;
    deprecated?: boolean;
    tags?: string[];
    serverOnly?: boolean;
}
/**
 * Constructor type for tool classes
 */
export interface ToolConstructor {
    new (server: McpServer, mcpUnity: McpUnity, logger: Logger): BaseTool;
    metadata?: ToolMetadata;
}
/**
 * Central registry for all MCP tools
 * Handles automatic tool discovery and registration
 */
export declare class ToolRegistry {
    private static tools;
    private static categories;
    /**
     * Register a tool class
     */
    static register(toolClass: ToolConstructor): void;
    /**
     * Register all tools with the MCP server
     */
    static registerAll(server: McpServer, mcpUnity: McpUnity, logger: Logger): number;
    /**
     * Get all tools in a specific category
     */
    static getToolsByCategory(category: string): ToolConstructor[];
    /**
     * Get all registered categories
     */
    static getCategories(): string[];
    /**
     * Get metadata for all tools
     */
    static getAllToolsMetadata(): ToolMetadata[];
    /**
     * Get a tool by name
     */
    static getTool(name: string): ToolConstructor | undefined;
    /**
     * Check if a tool is registered
     */
    static hasTool(name: string): boolean;
    /**
     * Get count of registered tools
     */
    static getToolCount(): number;
    /**
     * Get tools by tag
     */
    static getToolsByTag(tag: string): ToolConstructor[];
    /**
     * Search tools by name or description
     */
    static searchTools(query: string): ToolMetadata[];
    /**
     * Get statistics about registered tools
     */
    static getStatistics(): {
        totalTools: number;
        categories: number;
        toolsByCategory: Record<string, number>;
        deprecatedTools: number;
    };
    /**
     * Clear all registered tools (useful for testing)
     */
    static clear(): void;
    /**
     * Create a temporary instance for metadata extraction
     * Uses a mock server, mcpUnity, and logger
     */
    private static createTemporaryInstance;
    /**
     * Generate a markdown documentation of all tools
     */
    static generateDocumentation(): string;
}
