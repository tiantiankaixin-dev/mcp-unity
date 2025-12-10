import { Logger } from '../utils/logger.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
/**
 * Creates and registers the tool category names resource with the MCP server
 * Returns only tool names without descriptions for minimal token usage
 *
 * @param server The MCP server instance to register with
 * @param logger The logger instance for diagnostic information
 */
export declare function registerGetToolCategoryNamesResource(server: McpServer, logger: Logger): void;
