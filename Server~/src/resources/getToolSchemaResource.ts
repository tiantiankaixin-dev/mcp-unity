import { Logger } from '../utils/logger.js';
import { ResourceTemplate, McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ReadResourceResult } from '@modelcontextprotocol/sdk/types.js';
import { Variables } from '@modelcontextprotocol/sdk/shared/uriTemplate.js';
import { ToolRegistry } from '../tools/base/ToolRegistry.js';
import { zodToReadableSchema } from '../utils/zodToJsonSchema.js';

// Constants for the resource
const resourceName = 'get_tool_schema';
const resourceUri = 'unity://tool/{toolName}';
const resourceMimeType = 'application/json';

/**
 * Creates and registers the single tool schema resource
 * Returns detailed schema for ONE specific tool (minimal token usage)
 * 
 * @param server The MCP server instance to register with
 * @param logger The logger instance for diagnostic information
 */
export function registerGetToolSchemaResource(server: McpServer, logger: Logger) {
  logger.info(`Registering templated resource: ${resourceName}`);
  
  // Create a resource template with the MCP SDK
  const resourceTemplate = new ResourceTemplate(
    resourceUri,
    {
      list: async () => ({ resources: [] })
    }
  );
      
  // Register this templated resource with the MCP server
  server.resource(
    resourceName,
    resourceTemplate,
    {
      description: 'Get detailed parameter schema for a tool. Use this only if tool execution fails due to parameter errors.',
      mimeType: resourceMimeType
    },
    async (uri: URL, variables: Variables) => {
      try {
        return await resourceHandler(uri, variables, logger);
      } catch (error) {
        logger.error(`Error handling resource ${resourceName}: ${error}`);
        throw error;
      }
    }
  );
}

/**
 * Handles requests for single tool schema
 */
async function resourceHandler(uri: URL, variables: Variables, logger: Logger): Promise<ReadResourceResult> {
  const toolName = variables["toolName"] as string;
  
  if (!toolName) {
    return {
      contents: [{
        uri: uri.toString(),
        mimeType: 'text/plain',
        text: 'Error: Invalid URI format. Expected: unity://tool/{toolName}'
      }]
    };
  }
  
  // Try to get the tool from registry
  const ToolClass = ToolRegistry.getTool(toolName);
  
  if (!ToolClass) {
    // Return available tools hint
    const stats = ToolRegistry.getStatistics();
    return {
      contents: [{
        uri: uri.toString(),
        mimeType: resourceMimeType,
        text: JSON.stringify({
          error: true,
          message: `Tool '${toolName}' not found`,
          hint: `Use unity://tool-categories to discover available tools. Total tools: ${stats.totalTools}`
        }, null, 2)
      }]
    };
  }
  
  try {
    // Create temporary instance to get metadata
    const mockServer = {} as any;
    const mockMcpUnity = {} as any;
    const mockLogger = {
      debug: () => {},
      info: () => {},
      warn: () => {},
      error: () => {}
    } as any;
    
    const instance = new ToolClass(mockServer, mockMcpUnity, mockLogger);
    const metadata = instance.getMetadata();
    
    // Convert Zod schema to readable JSON format
    const inputSchema = instance.inputSchema;
    let parameters;
    
    try {
      parameters = zodToReadableSchema(inputSchema);
    } catch (error) {
      logger.warn(`Failed to convert schema for ${metadata.name}:`, error);
      parameters = undefined;
    }
    
    const response = {
      name: metadata.name,
      description: metadata.description,
      category: metadata.category,
      ...(parameters && Object.keys(parameters).length > 0 && { parameters })
    };
    
    return {
      contents: [{
        uri: uri.toString(),
        mimeType: resourceMimeType,
        text: JSON.stringify(response)
      }]
    };
  } catch (error) {
    logger.error(`Failed to get schema for tool ${toolName}:`, error);
    return {
      contents: [{
        uri: uri.toString(),
        mimeType: resourceMimeType,
        text: JSON.stringify({
          error: true,
          message: `Failed to load tool schema for '${toolName}'`
        }, null, 2)
      }]
    };
  }
}
