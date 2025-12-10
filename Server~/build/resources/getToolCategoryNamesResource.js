import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ToolRegistry } from '../tools/base/ToolRegistry.js';
// Constants for the resource
const resourceName = 'get_tool_category_names';
const resourceUri = 'unity://tool-category-names/{category}';
const resourceMimeType = 'application/json';
/**
 * Creates and registers the tool category names resource with the MCP server
 * Returns only tool names without descriptions for minimal token usage
 *
 * @param server The MCP server instance to register with
 * @param logger The logger instance for diagnostic information
 */
export function registerGetToolCategoryNamesResource(server, logger) {
    logger.info(`Registering templated resource: ${resourceName}`);
    // Create a resource template with the MCP SDK
    // Note: Return empty list to avoid expanding 23 categories in list_resources
    // AI should use unity://tool-categories to discover categories
    const resourceTemplate = new ResourceTemplate(resourceUri, {
        list: async () => ({ resources: [] })
    });
    // Register this templated resource with the MCP server
    server.resource(resourceName, resourceTemplate, {
        description: 'Get tool names only from a specific category (minimal token usage for quick discovery)',
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
 * List all available categories
 */
async function listCategories(mimeType) {
    const categories = ToolRegistry.getCategories();
    return {
        resources: categories.map(category => ({
            uri: `unity://tool-category-names/${category}`,
            name: category,
            description: `Tool names in the ${category} category`,
            mimeType: mimeType
        }))
    };
}
/**
 * Handles requests for tool names by category
 */
async function resourceHandler(uri, variables, logger) {
    const category = variables["category"];
    if (!category) {
        return {
            contents: [{
                    uri: uri.toString(),
                    mimeType: 'text/plain',
                    text: 'Error: Invalid URI format'
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
                    })
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
                        count: 0,
                        tools: []
                    })
                }]
        };
    }
    // Get only tool names (no descriptions)
    const toolNames = toolClasses.map(ToolClass => {
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
            return instance.name;
        }
        catch (error) {
            logger.error(`Failed to get name for tool in ${category}:`, error);
            return 'Unknown';
        }
    });
    const response = {
        category: category,
        count: toolNames.length,
        msg: `Load tool params: unity://tool/{toolName}`,
        tools: toolNames
    };
    return {
        contents: [{
                uri: uri.toString(),
                mimeType: resourceMimeType,
                text: JSON.stringify(response)
            }]
    };
}
