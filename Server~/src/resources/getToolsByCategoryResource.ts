import { Logger } from '../utils/logger.js';
import { ResourceTemplate, McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ReadResourceResult } from '@modelcontextprotocol/sdk/types.js';
import { Variables } from '@modelcontextprotocol/sdk/shared/uriTemplate.js';
import { ToolRegistry } from '../tools/base/ToolRegistry.js';
import { UsageTracker } from '../utils/UsageTracker.js';
import { zodToReadableSchema } from '../utils/zodToJsonSchema.js';

// Constants for the resource
const resourceName = 'get_tools_by_category';
const resourceUri = 'unity://tool-category/{category}';
const resourceMimeType = 'application/json';

/**
 * Creates and registers the Tools by Category resource with the MCP server
 * This resource provides detailed information about tools in a specific category
 * 
 * @param server The MCP server instance to register with
 * @param logger The logger instance for diagnostic information
 */
export function registerGetToolsByCategoryResource(server: McpServer, logger: Logger) {
  logger.info(`Registering templated resource: ${resourceName}`);
  
  // Create a resource template with the MCP SDK
  // Note: Return empty list to avoid expanding 23 categories in list_resources
  // AI should use unity://tool-categories to discover categories
  const resourceTemplate = new ResourceTemplate(resourceUri, {
    list: async () => ({ resources: [] })
  });
      
  // Register this templated resource with the MCP server
  server.resource(
    resourceName,
    resourceTemplate,
    {
      description: 'Get detailed information about all tools in a specific category (e.g., unity://tool-category/ui). ⚠️ MUST call in same batch as unity://tool-categories and your tool to avoid workflow violations!',
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
 * List all available categories for the resource template
 */
async function listCategories(mimeType: string) {
  const categories = ToolRegistry.getCategories();
  return {
    resources: categories.map(category => ({
      uri: `unity://tool-category/${category}`,
      name: category,
      description: `Tools in the ${category} category`,
      mimeType: mimeType
    }))
  };
}

/**
 * Handles requests for tools by category
 * 
 * @param uri The resource URI containing the category parameter
 * @param variables Variables extracted from the URI template
 * @param logger The logger instance for diagnostic information
 * @returns A promise that resolves to the tools data
 */
async function resourceHandler(uri: URL, variables: Variables, logger: Logger): Promise<ReadResourceResult> {
  // Extract category from variables
  const category = variables["category"] as string;
  
  // Record resource access for workflow tracking
  const tracker = UsageTracker.getInstance(logger);
  tracker.recordResourceAccess(uri.toString());
  
  if (!category) {
    return {
      contents: [{
        uri: uri.toString(),
        mimeType: 'text/plain',
        text: 'Error: Invalid URI format. Expected: unity://tool-category/{categoryName}'
      }]
    };
  }
  
  // Check if category exists
  const allCategories = ToolRegistry.getCategories();
  if (!allCategories.includes(category)) {
    return {
      contents: [{
        uri: uri.toString(),
        mimeType: resourceMimeType,
        text: JSON.stringify({
          error: true,
          message: `Category '${category}' not found`,
          availableCategories: allCategories
        }, null, 2)
      }]
    };
  }
  
  // Get tools in this category
  const toolClasses = ToolRegistry.getToolsByCategory(category);
  
  if (toolClasses.length === 0) {
    return {
      contents: [{
        uri: uri.toString(),
        mimeType: resourceMimeType,
        text: JSON.stringify({
          category: category,
          toolCount: 0,
          message: 'No tools found in this category',
          tools: []
        }, null, 2)
      }]
    };
  }
  
  // Get detailed metadata for each tool
  const tools = toolClasses.map(ToolClass => {
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
      
      // Enhanced metadata with parameter schema for better AI usability
      // Convert Zod schema to readable JSON format
      const inputSchema = instance.inputSchema;
      let parameters;
      
      try {
        parameters = zodToReadableSchema(inputSchema);
      } catch (error) {
        logger.warn(`Failed to convert schema for ${metadata.name}:`, error);
        parameters = undefined;
      }
      
      return {
        name: metadata.name,
        description: metadata.description,
        ...(parameters && Object.keys(parameters).length > 0 && { parameters })
      };
    } catch (error) {
      logger.error(`Failed to get metadata for tool in ${category}:`, error);
      return {
        name: 'Unknown',
        description: 'Failed to load tool metadata',
        error: true
      };
    }
  });
  
  const response = {
    category: category,
    toolCount: tools.length,
    tools: tools
  };
  
  return {
    contents: [{
      uri: uri.toString(),
      mimeType: resourceMimeType,
      text: JSON.stringify(response) // Compact format for token efficiency
    }]
  };
}
