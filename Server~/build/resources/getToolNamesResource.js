import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ToolRegistry } from '../tools/base/ToolRegistry.js';
import { zodToReadableSchema } from '../utils/zodToJsonSchema.js';
// Constants for the resource
const resourceName = 'get_tool_names';
const resourceUri = 'unity://tool-names/{category}';
const resourceMimeType = 'application/json';
/**
 * Creates and registers the tool names resource
 * Returns tool names WITH parameter schemas for AI to use correct parameter names
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
        description: 'Get tool schemas. MUST use discover_and_use_batch for 2+ operations! Categories: gameobject, material, physics, ui, terrain, animation, scripting, scene, prefab, lighting, camera, audio, vfx',
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
 * Handles requests for tool names only
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
    // Get names, descriptions AND parameter schemas
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
            // Convert Zod schema to readable format
            let parameters;
            try {
                const inputSchema = instance.inputSchema;
                parameters = zodToReadableSchema(inputSchema);
            }
            catch (error) {
                logger.warn(`Failed to convert schema for ${metadata.name}:`, error);
                parameters = undefined;
            }
            return {
                name: metadata.name,
                description: metadata.description,
                ...(parameters && Object.keys(parameters).length > 0 && { parameters })
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
        // CRITICAL instruction for AI
        _batch: "⚠️ ALWAYS use discover_and_use_batch for 2+ operations! Chain outputs with $.{index}.field",
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
