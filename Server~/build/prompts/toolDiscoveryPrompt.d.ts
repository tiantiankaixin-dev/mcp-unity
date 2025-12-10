import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
/**
 * Registers the tool discovery prompt with the MCP server.
 * This prompt guides AI on how to efficiently discover and use Unity MCP tools
 * using the hierarchical tool indexing system.
 *
 * @param server The McpServer instance to register the prompt with.
 */
export declare function registerToolDiscoveryPrompt(server: McpServer): void;
