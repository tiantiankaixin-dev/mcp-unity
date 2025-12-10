import { Logger } from '../utils/logger.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
/**
 * Creates and registers the single tool schema resource
 * Returns detailed schema for ONE specific tool (minimal token usage)
 *
 * @param server The MCP server instance to register with
 * @param logger The logger instance for diagnostic information
 */
export declare function registerGetToolSchemaResource(server: McpServer, logger: Logger): void;
