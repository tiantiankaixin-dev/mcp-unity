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
        description: '🚨 PLAN FIRST! Get categories, then query unity://tool-names/{category}. MANDATORY: discover_and_use_batch for 2+ tools with $.{index}.field chaining.',
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
    // Build category information with tool counts (merged from getAllToolsResource)
    const categorySummary = {};
    let totalToolCount = 0;
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
    // Minimal response with mandatory batch usage instruction
    const response = {
        // CRITICAL: Force AI to use batch operations
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
