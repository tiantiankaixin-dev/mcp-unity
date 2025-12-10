import { Logger } from '../utils/logger.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpUnity } from '../unity/mcpUnity.js';
/**
 * Creates and registers the simplified GameObject resource with the MCP server
 * This resource provides minimal GameObject information to save tokens (89.5% savings)
 *
 * Returns only: name, id, position, active state, and component names (not full details)
 *
 * @param server The MCP server instance to register with
 * @param mcpUnity The McpUnity instance to communicate with Unity
 * @param logger The logger instance for diagnostic information
 */
export declare function registerGetGameObjectSimpleResource(server: McpServer, mcpUnity: McpUnity, logger: Logger): void;
