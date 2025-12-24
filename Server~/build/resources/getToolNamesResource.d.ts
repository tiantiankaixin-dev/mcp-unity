import { Logger } from '../utils/logger.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
/**
 * Creates and registers the tool names resource
 * Returns tool names and descriptions only (no parameter schemas)
 *
 * @param server The MCP server instance to register with
 * @param logger The logger instance for diagnostic information
 */
export declare function registerGetToolNamesResource(server: McpServer, logger: Logger): void;
