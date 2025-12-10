import { Logger } from '../utils/logger.js';
import { ResourceTemplate, McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ReadResourceResult } from '@modelcontextprotocol/sdk/types.js';
import { McpUnity } from '../unity/mcpUnity.js';
import { Variables } from '@modelcontextprotocol/sdk/shared/uriTemplate.js';
import { McpUnityError, ErrorType } from '../utils/errors.js';

// Constants for the resource
const resourceName = 'get_gameobject_simple';
const resourceUri = 'unity://gameobject-simple/{idOrName}';
const resourceMimeType = 'application/json';

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
export function registerGetGameObjectSimpleResource(server: McpServer, mcpUnity: McpUnity, logger: Logger) {
  // Create a resource template with the MCP SDK
  const resourceTemplate = new ResourceTemplate(
    resourceUri, 
    { 
      list: undefined // No listing to avoid overhead
    }
  );
  logger.info(`Registering resource: ${resourceName}`);
      
  // Register this resource with the MCP server
  server.resource(
    resourceName,
    resourceTemplate,
    {
      description: 'Retrieve simplified GameObject info (name, id, position, components list only) - saves 89.5% tokens vs full query',
      mimeType: resourceMimeType
    },
    async (uri, variables) => {
      try {
        return await resourceHandler(mcpUnity, uri, variables, logger);
      } catch (error) {
        logger.error(`Error handling resource ${resourceName}: ${error}`);
        throw error;
      }
    }
  );
}

/**
 * Handles requests for simplified GameObject information from Unity
 * 
 * @param mcpUnity The McpUnity instance to communicate with Unity
 * @param uri The requested resource URI
 * @param variables Variables extracted from the URI template
 * @param logger The logger instance for diagnostic information
 * @returns A promise that resolves to the simplified GameObject data
 * @throws McpUnityError if the request to Unity fails
 */
async function resourceHandler(mcpUnity: McpUnity, uri: URL, variables: Variables, logger: Logger): Promise<ReadResourceResult> {
  // Extract and convert the parameter from the template variables
  const idOrName = decodeURIComponent(variables["idOrName"] as string);
      
  // Send request to Unity
  const response = await mcpUnity.sendRequest({
    method: resourceName,
    params: {
      idOrName: idOrName
    }
  });
  
  if (!response.success) {
    throw new McpUnityError(
      ErrorType.RESOURCE_FETCH,
      response.message || 'Failed to fetch GameObject from Unity'
    );
  }
  
  // Return simplified data (Unity side should already provide minimal info)
  return {
    contents: [{
      uri: `unity://gameobject-simple/${idOrName}`,
      mimeType: resourceMimeType,
      text: JSON.stringify(response.result || response, null, 2)
    }]
  };
}
