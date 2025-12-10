import { Logger } from '../utils/logger.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
/**
 * Creates and registers the tool names resource
 * Returns tool names WITH parameter schemas for AI to use correct parameter names
 *
 * @param server The MCP server instance to register with
 * @param logger The logger instance for diagnostic information
 */
export declare function registerGetToolNamesResource(server: McpServer, logger: Logger): void;
