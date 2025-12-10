import { Logger } from '../utils/logger.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
/**
 * Creates and registers the Tools by Category resource with the MCP server
 * This resource provides detailed information about tools in a specific category
 *
 * @param server The MCP server instance to register with
 * @param logger The logger instance for diagnostic information
 */
export declare function registerGetToolsByCategoryResource(server: McpServer, logger: Logger): void;
