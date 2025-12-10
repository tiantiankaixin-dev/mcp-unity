import { Logger } from '../utils/logger.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
/**
 * Creates and registers the Tool Categories resource with the MCP server
 * This resource provides a high-level overview of available tool categories
 *
 * @param server The MCP server instance to register with
 * @param logger The logger instance for diagnostic information
 */
export declare function registerGetToolCategoriesResource(server: McpServer, logger: Logger): void;
