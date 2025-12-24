import { Logger } from '../utils/logger.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
/**
 * Creates and registers the All Tools resource with the MCP server
 * This resource provides ALL tools in ONE request for maximum efficiency
 *
 * @param server The MCP server instance to register with
 * @param logger The logger instance for diagnostic information
 */
export declare function registerGetAllToolsResource(server: McpServer, logger: Logger): void;
