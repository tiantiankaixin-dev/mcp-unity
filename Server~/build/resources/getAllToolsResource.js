import { ToolRegistry } from '../tools/base/ToolRegistry.js';
import { UsageTracker } from '../utils/UsageTracker.js';
// Constants for the resource
const resourceName = 'get_all_tools';
const resourceUri = 'unity://all-tools';
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
    'meta': 'Meta tools',
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
 * Creates and registers the All Tools resource with the MCP server
 * This resource provides ALL tools in ONE request for maximum efficiency
 *
 * @param server The MCP server instance to register with
 * @param logger The logger instance for diagnostic information
 */
export function registerGetAllToolsResource(server, logger) {
    logger.info(`Registering resource: ${resourceName}`);
    // Register this resource with the MCP server
    server.resource(resourceName, resourceUri, {
        description: 'Compatibility resource (legacy): categories overview. Prefer unity://tool-categories, then unity://tool-names/{category}. Use discover_and_use_batch for 2+ operations.',
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
 * Handles requests for all tools information
 * Returns ALL tools organized by category in a single response
 *
 * @param logger The logger instance for diagnostic information
 * @returns A promise that resolves to all tools data
 */
async function resourceHandler(logger) {
    // Record resource access for workflow tracking
    const tracker = UsageTracker.getInstance(logger);
    tracker.recordResourceAccess(resourceUri);
    // Get all categories from the ToolRegistry
    const categories = ToolRegistry.getCategories();
    const stats = ToolRegistry.getStatistics();
    // Build category summary with tool counts only (no individual tools to save tokens)
    const categorySummary = {};
    let totalToolCount = 0;
    // Process each category
    for (const category of categories) {
        const toolClasses = ToolRegistry.getToolsByCategory(category);
        if (toolClasses.length === 0)
            continue;
        const toolCount = toolClasses.length;
        totalToolCount += toolCount;
        categorySummary[category] = {
            description: CATEGORY_DESCRIPTIONS[category] || 'Tools',
            toolCount: toolCount
        };
    }
    // Build response (minimal format to save tokens)
    // Merged from getToolCategoriesResource for simplicity
    const response = {
        _instruction: "🚨 WORKFLOW: 1) Query unity://tool-names/{category} for specific tools, 2) Use discover_and_use_batch for 2+ tools with $.{index}.field chaining, 3) Max 100 tools per batch",
        totalToolCount: totalToolCount,
        categoryCount: Object.keys(categorySummary).length,
        categories: categorySummary
    };
    return {
        contents: [{
                uri: resourceUri,
                mimeType: resourceMimeType,
                text: JSON.stringify(response) // No formatting to save tokens
            }]
    };
}
