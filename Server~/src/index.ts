// Import MCP SDK components
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { McpUnity } from './unity/mcpUnity.js';
import { Logger, LogLevel } from './utils/logger.js';
// Legacy tool imports - commented out, now using BaseTool versions
// import { registerCreateSceneTool } from './tools/createSceneTool.js';
// import { registerMenuItemTool } from './tools/menuItemTool.js';
// import { registerSelectGameObjectTool } from './tools/selectGameObjectTool.js';
// import { registerAddPackageTool } from './tools/addPackageTool.js';
// import { registerRunTestsTool } from './tools/runTestsTool.js';
// import { registerSendConsoleLogTool } from './tools/sendConsoleLogTool.js';
// import { registerGetConsoleLogsTool } from './tools/getConsoleLogsTool.js';
// import { registerUpdateComponentTool } from './tools/updateComponentTool.js';
// import { registerAddAssetToSceneTool } from './tools/addAssetToSceneTool.js';
// import { registerUpdateGameObjectTool } from './tools/updateGameObjectTool.js';
// import { registerCreatePrefabTool } from './tools/createPrefabTool.js';
// import { registerDeleteSceneTool } from './tools/deleteSceneTool.js';
// import { registerLoadSceneTool } from './tools/loadSceneTool.js';
// import { registerRecompileScriptsTool } from './tools/recompileScriptsTool.js';
import { registerGetMenuItemsResource } from './resources/getMenuItemResource.js';
import { registerGetConsoleLogsResource } from './resources/getConsoleLogsResource.js';
import { registerGetHierarchyResource } from './resources/getScenesHierarchyResource.js';
import { registerGetPackagesResource } from './resources/getPackagesResource.js';
import { registerGetAssetsResource } from './resources/getAssetsResource.js';
import { registerGetTestsResource } from './resources/getTestsResource.js';
import { registerGetGameObjectResource } from './resources/getGameObjectResource.js';
import { registerGetGameObjectSimpleResource } from './resources/getGameObjectSimpleResource.js';
// import { registerGetToolCategoriesResource } from './resources/getToolCategoriesResource.js';
// import { registerGetToolsByCategoryResource } from './resources/getToolsByCategoryResource.js'; // ❌ Removed - too verbose
import { registerGetToolNamesResource } from './resources/getToolNamesResource.js';
import { registerGetToolSchemaResource } from './resources/getToolSchemaResource.js';
import { registerGetUsageGuideResource } from './resources/getUsageGuideResource.js';
import { registerGetGettingStartedResource } from './resources/getGettingStartedResource.js';
import { registerGetAllToolsResource } from './resources/getAllToolsResource.js';
import { registerGetToolCategoriesResource } from './resources/getToolCategoriesResource.js';
// ❌ Removed: Prompts are redundant - workflow is in server description and resource responses
// import { registerSessionStartPrompt } from './prompts/sessionStartPrompt.js';
// import { registerToolDiscoveryPrompt } from './prompts/toolDiscoveryPrompt.js';
// import { registerGameObjectHandlingPrompt } from './prompts/gameobjectHandlingPrompt.js';

// No need to import individual tools anymore - ToolRegistry handles it automatically

// Initialize loggers
const serverLogger = new Logger('Server', LogLevel.INFO);
const unityLogger = new Logger('Unity', LogLevel.INFO);
const toolLogger = new Logger('Tools', LogLevel.INFO);
const resourceLogger = new Logger('Resources', LogLevel.INFO);

// Initialize the MCP server
 const server = new McpServer (
  {
    name: "MCP Unity Server",
    version: "1.0.0",
    description: `Unity Editor MCP. ⚠️ DO NOT guess tool names!

PLAN FIRST, THEN EXECUTE:
1. list_categories - get available categories
2. get_tool_names({category}) - get exact tool names
3. Plan all tools needed
4. get_tool_schemas([tools]) - get parameter definitions if needed
5. discover_and_use_batch - execute with correct tool names
`
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  }
);

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

// ⚡ RECOMMENDED: Get tool categories overview (merged from getAllToolsResource)
registerGetToolCategoriesResource(server, resourceLogger);

// Compatibility: legacy clients/prompts may still query unity://all-tools
registerGetAllToolsResource(server, resourceLogger);

// 🎯 Query by category for specific tool details
registerGetToolNamesResource(server, resourceLogger);

// 🎯 Optional: Query specific tool schema (only when needed, ~150 tokens/tool)
registerGetToolSchemaResource(server, resourceLogger);

// 🎯 Execution: Use tools via discover_and_use_tool/batch (already registered as meta tools)

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

// ❌ Removed prompts - workflow integrated into:
// 1. Server description (shows in MCP client)
// 2. Resource responses (_instruction, _workflow fields)
// 3. Tool descriptions
// This eliminates redundancy and reduces token usage

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
    
  } catch (error) {
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
