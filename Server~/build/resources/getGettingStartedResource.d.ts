import { Logger } from '../utils/logger.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
/**
 * Creates and registers the Getting Started guide as a virtual tool category
 * This appears first in the categories list to guide new users
 *
 * @param server The MCP server instance to register with
 * @param logger The logger instance for diagnostic information
 */
export declare function registerGetGettingStartedResource(server: McpServer, logger: Logger): void;
