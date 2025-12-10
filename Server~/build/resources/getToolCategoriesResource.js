import { ToolRegistry } from '../tools/base/ToolRegistry.js';
import { UsageTracker } from '../utils/UsageTracker.js';
// Constants for the resource
const resourceName = 'get_tool_categories';
const resourceUri = 'unity://tool-categories';
const resourceMimeType = 'application/json';
/**
 * Category descriptions mapping (short versions for token efficiency)
 */
const CATEGORY_DESCRIPTIONS = {
    'advanced': 'ProBuilder shapes',
    'animation': 'Animations & timeline',
    'asset': 'Asset management',
    'audio': 'Audio sources',
    'build': 'Project building',
    'camera': 'Cameras',
    'component': 'Component operations',
    'components': 'Add components',
    'debug': 'Debugging tools',
    'gameobject': 'GameObject management',
    'lighting': 'Lighting & baking',
    'material': 'Materials & colors',
    'menu': 'Menu execution',
    'physics': 'Physics & colliders',
    'prefab': 'Prefabs',
    'scene': 'Scene management',
    'scripting': 'C# scripts',
    'terrain': 'Terrain',
    'testing': 'Testing',
    'ui': 'UI elements',
    'vfx': 'Visual effects'
};
/**
 * Creates and registers the Tool Categories resource with the MCP server
 * This resource provides a high-level overview of available tool categories
 *
 * @param server The MCP server instance to register with
 * @param logger The logger instance for diagnostic information
 */
export function registerGetToolCategoriesResource(server, logger) {
    logger.info(`Registering resource: ${resourceName}`);
    // Register this resource with the MCP server
    server.resource(resourceName, resourceUri, {
        description: 'Get Unity tool categories. IMPORTANT: Always use discover_and_use_batch for 2+ operations (mandatory). Use unity://tool-names/{cat} for schemas.',
        mimeType: resourceMimeType
    }, async () => {
        try {
            return await resourceHandler(logger);
        }
        catch (error) {
            logger.error(`Error handling resource ${resourceName}: ${error}`);
            throw error;
        }
    });
}
/**
 * Handles requests for tool categories information
 *
 * @param logger The logger instance for diagnostic information
 * @returns A promise that resolves to the tool categories data
 */
async function resourceHandler(logger) {
    // Record resource access for workflow tracking
    const tracker = UsageTracker.getInstance(logger);
    tracker.recordResourceAccess(resourceUri);
    // Get all categories from the ToolRegistry
    const categories = ToolRegistry.getCategories();
    const stats = ToolRegistry.getStatistics();
    // Build category information (minimal format for token efficiency)
    // Only name and description - count is not needed for decision making
    const categoryInfo = categories.map(category => ({
        name: category,
        desc: CATEGORY_DESCRIPTIONS[category] || 'Tools'
    }));
    // Add virtual "getting-started" category at the beginning (priority)
    const allCategories = [
        {
            name: '⭐getting-started',
            desc: 'START HERE! Quick guide & best practices'
        },
        ...categoryInfo
    ];
    // Minimal response with mandatory batch usage instruction
    const response = {
        // CRITICAL: Force AI to use batch operations
        _instruction: "⚠️ MANDATORY: Use discover_and_use_batch for 2+ tool calls. Chain with $.{index}.field (e.g., $.0.instanceId). Single tool only for 1 operation.",
        categories: allCategories
    };
    return {
        contents: [{
                uri: resourceUri,
                mimeType: resourceMimeType,
                text: JSON.stringify(response) // No formatting to save tokens
            }]
    };
}
