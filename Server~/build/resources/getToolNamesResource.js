import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ToolRegistry } from '../tools/base/ToolRegistry.js';
// Constants for the resource
const resourceName = 'get_tool_names';
const resourceUri = 'unity://tool-names/{category}';
const resourceMimeType = 'application/json';
/**
 * Creates and registers the tool names resource
 * Returns tool names and descriptions only (no parameter schemas)
 *
 * @param server The MCP server instance to register with
 * @param logger The logger instance for diagnostic information
 */
export function registerGetToolNamesResource(server, logger) {
    logger.info(`Registering templated resource: ${resourceName}`);
    // Create a resource template with the MCP SDK
    const resourceTemplate = new ResourceTemplate(resourceUri, {
        list: async () => ({ resources: [] })
    });
    // Register this templated resource with the MCP server
    server.resource(resourceName, resourceTemplate, {
        description: 'Returns tool names for a category. Go directly to discover_and_use_batch after this.',
        mimeType: resourceMimeType
    }, async (uri, variables) => {
        try {
            return await resourceHandler(uri, variables, logger);
        }
        catch (error) {
            logger.error(`Error handling resource ${resourceName}: ${error}`);
            throw error;
        }
    });
}
/**
 * Handles requests for tool names and descriptions only
 */
async function resourceHandler(uri, variables, logger) {
    const category = variables["category"];
    if (!category) {
        return {
            contents: [{
                    uri: uri.toString(),
                    mimeType: 'text/plain',
                    text: 'Error: Invalid URI format. Expected: unity://tool-names/{categoryName}'
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
                        tools: []
                    })
                }]
        };
    }
    // Get names and descriptions only (no parameter schemas)
    const tools = toolClasses.map(ToolClass => {
        try {
            const mockServer = {};
            const mockMcpUnity = {};
            const mockLogger = {
                debug: () => { },
                info: () => { },
                warn: () => { },
                error: () => { }
            };
            const instance = new ToolClass(mockServer, mockMcpUnity, mockLogger);
            const metadata = instance.getMetadata();
            return {
                name: metadata.name,
                description: metadata.description
            };
        }
        catch (error) {
            logger.error(`Failed to get metadata for tool in ${category}:`, error);
            return {
                name: 'Unknown',
                description: 'Failed to load tool metadata'
            };
        }
    });
    const response = {
        _workflow: "✅ STEP 2 done → Go to STEP 3: discover_and_use_batch",
        category: category,
        toolCount: tools.length,
        tools: tools
    };
    return {
        contents: [{
                uri: uri.toString(),
                mimeType: resourceMimeType,
                text: JSON.stringify(response)
            }]
    };
}
