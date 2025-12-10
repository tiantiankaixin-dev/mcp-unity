import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
/**
 * Registers a session start prompt that guides AI to use the hierarchical tool discovery system.
 * This prompt is designed to be called at the start of each conversation to establish
 * the workflow pattern and minimize token usage.
 *
 * @param server The McpServer instance to register the prompt with.
 */
export declare function registerSessionStartPrompt(server: McpServer): void;
