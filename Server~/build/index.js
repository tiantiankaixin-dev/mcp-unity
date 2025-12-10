// Import MCP SDK components
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { McpUnity } from './unity/mcpUnity.js';
import { Logger, LogLevel } from './utils/logger.js';
import { registerGetGameObjectSimpleResource } from './resources/getGameObjectSimpleResource.js';
import { registerGetToolCategoriesResource } from './resources/getToolCategoriesResource.js';
// import { registerGetToolsByCategoryResource } from './resources/getToolsByCategoryResource.js'; // ❌ Removed - too verbose
import { registerGetToolNamesResource } from './resources/getToolNamesResource.js';
import { registerGetToolSchemaResource } from './resources/getToolSchemaResource.js';
// No need to import individual tools anymore - ToolRegistry handles it automatically
// Initialize loggers
const serverLogger = new Logger('Server', LogLevel.INFO);
const unityLogger = new Logger('Unity', LogLevel.INFO);
const toolLogger = new Logger('Tools', LogLevel.INFO);
const resourceLogger = new Logger('Resources', LogLevel.INFO);
// Initialize the MCP server
const server = new McpServer({
    name: "MCP Unity Server",
    version: "1.0.0",
    description: `Unity Editor MCP with 100+ tools. Zero-registration architecture.

⚠️ **FIRST STEP - ALWAYS QUERY BEFORE EXECUTE:**
read_resource('unity://tool-names/gameobject')  // or: material, physics, ui, terrain, etc.

📖 WORKFLOW:
1. QUERY: read_resource('unity://tool-names/{category}') → get tool names
2. PLAN: List tools needed for the task
3. EXECUTE: ONE discover_and_use_batch call with params_mapping

📚 RESOURCES:
- unity://tool-categories → all categories
- unity://tool-names/{cat} → tool list (QUERY THIS FIRST!)
- unity://tool/{name} → tool params`
}, {
    capabilities: {
        tools: {},
        resources: {},
        prompts: {},
    },
});
// Initialize MCP HTTP bridge with Unity editor
const mcpUnity = new McpUnity(unityLogger);
// Import all tools to trigger @Tool decorator registration (populates ToolRegistry)
import './tools/index.js';
// Import ToolRegistry for selective registration
import { ToolRegistry } from './tools/base/ToolRegistry.js';
// 🚀 ZERO-REGISTRATION ARCHITECTURE
// Only register 2 meta tools instead of all 100 tools
// Token optimization: ~200 tokens vs ~10,000 tokens (98% reduction)
toolLogger.info('🎯 Initializing zero-registration architecture...');
// Get meta tools from ToolRegistry (they were registered via @Tool decorator)
const metaTools = ToolRegistry.getToolsByCategory('meta');
toolLogger.info(`Found ${metaTools.length} meta tools in registry`);
// Register ONLY meta tools to MCP Server
// Note: DynamicToolManager will be initialized lazily when tools are executed
let registeredCount = 0;
for (const ToolClass of metaTools) {
    const tool = new ToolClass(server, mcpUnity, toolLogger);
    tool.register();
    registeredCount++;
}
toolLogger.info(`✅ Zero-registration mode: ${registeredCount} meta tools registered to MCP`);
toolLogger.info('📖 Use discover_and_use_tool or discover_and_use_batch to execute Unity tools');
toolLogger.info('💡 Token consumption: ~100-200 tokens/conversation (vs 10,000+ traditional)');
toolLogger.info('📚 Other 100+ tools available via: unity://tool-names/{category} resources');
// Register ONLY essential resources for the optimized workflow
// 🎯 Step 1: Query tool categories
registerGetToolCategoriesResource(server, resourceLogger);
// 🎯 Step 2a: Query tool names in category (lightweight, ~50 tokens/category)
registerGetToolNamesResource(server, resourceLogger);
// 🎯 Step 2b: Query specific tool schema (only when needed, ~150 tokens/tool)
registerGetToolSchemaResource(server, resourceLogger);
// 🎯 Step 3: Use tools via discover_and_use_tool (already registered as meta tools)
// 🔍 Optional: Query specific GameObject (for getting instanceId after creation)
registerGetGameObjectSimpleResource(server, mcpUnity, resourceLogger);
// ❌ Removed heavy resource: unity://tool-category/{name} (too verbose, wastes tokens)
// Use unity://tool-names/{name} + unity://tool/{toolName} instead
// ❌ Removed non-essential resources to minimize list_resources output:
// - usage-guide (too verbose)
// - getting-started (redundant)
// - tool-category-names (tool-category is enough)
// - scenes_hierarchy (use gameobject-simple instead)
// - tests, menu-items, console-logs, packages, assets (not core workflow)
// ❌ Removed prompts to minimize list_resources output
// AI should follow the server description instead of reading prompts
// Server startup function
async function startServer() {
    try {
        // Initialize STDIO transport for MCP client communication
        const stdioTransport = new StdioServerTransport();
        // Connect the server to the transport
        await server.connect(stdioTransport);
        serverLogger.info('MCP Server started');
        // Get the client name from the MCP server
        const clientName = server.server.getClientVersion()?.name || 'Unknown MCP Client';
        serverLogger.info(`Connected MCP client: ${clientName}`);
        // Unity connection is now lazy - only connects on first tool call
        // This ensures MCP server starts reliably without any Unity dependencies
    }
    catch (error) {
        serverLogger.error('Failed to start server', error);
        process.exit(1);
    }
}
// Start the server
startServer();
// Handle shutdown
process.on('SIGINT', async () => {
    serverLogger.info('Shutting down...');
    await mcpUnity.stop();
    process.exit(0);
});
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    serverLogger.error('Uncaught exception', error);
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
    serverLogger.error('Unhandled rejection', reason);
});
