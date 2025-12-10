import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { DynamicToolManager } from '../base/DynamicToolManager.js';

/**
 * Input schema for discover_and_use_tool
 */
const DiscoverAndUseToolArgsSchema = z.object({
  toolName: z
    .string()
    .describe('Name of the Unity tool to execute. Query available tools via unity://tool-names/{category} resources first.'),
  params: z
    .record(z.any())
    .describe('Parameters to pass to the tool. Schema varies by tool - check resource documentation.')
});

/**
 * DiscoverAndUseTool - Execute Unity tools on-demand without MCP registration
 * 
 * **Zero-Registration Architecture**:
 * This is the ONLY tool registered in MCP at startup (along with batch variant).
 * It acts as a proxy to execute any Unity tool without requiring that tool
 * to be registered in the MCP tool list.
 * 
 * **How it works**:
 * 1. AI queries resources: unity://tool-names/gameobject
 * 2. AI learns available tools: create_primitive_object, add_rigidbody, etc.
 * 3. AI calls: discover_and_use_tool({ toolName: "create_primitive_object", params: {...} })
 * 4. This tool directly calls Unity Bridge via DynamicToolManager
 * 5. Result returned immediately without MCP tool registration overhead
 * 
 * **Token Optimization**:
 * - Traditional: 100 tools registered = ~10,000 tokens/conversation
 * - Zero-registration: 2 tools registered = ~200 tokens/conversation
 * - Savings: 98%
 * 
 * **Workflow**:
 * ```
 * // Step 1: Discover available tools
 * read_resource('unity://tool-names/gameobject')
 * 
 * // Step 2: Execute tool on-demand
 * discover_and_use_tool({
 *   toolName: "create_primitive_object",
 *   params: { primitiveType: "cube", posX: 0, posY: 1, posZ: 0 }
 * })
 * ```
 */
@Tool({
  name: 'discover_and_use_tool',
  description: '⚠️ SINGLE TOOL ONLY! Use discover_and_use_batch for 2+ operations. 🔴 MUST READ FIRST: Use read_resource("unity://tool-names/{category}") to get exact tool names before calling. DO NOT guess tool names! 📖 unity_tool_discovery 📖 unity_tool_discovery',
  category: 'meta',
  version: '1.0.0'
})
export class DiscoverAndUseToolTool extends BaseTool {
  get name() {
    return 'discover_and_use_tool';
  }

  get description() {
    return '⚠️ SINGLE TOOL ONLY! Use discover_and_use_batch for 2+ operations. 🔴 MUST READ FIRST: Use read_resource("unity://tool-names/{category}") to get exact tool names before calling. DO NOT guess tool names! 📖 unity_tool_discovery 📖 unity_tool_discovery';
  }

  get inputSchema() {
    return DiscoverAndUseToolArgsSchema;
  }

  get category() {
    return 'meta';
  }

  /**
   * Execute tool via DynamicToolManager
   */
  protected async execute(args: any): Promise<CallToolResult> {
    const { toolName, params } = args;

    try {
      this.logger.info(`[Zero-Registration] Executing tool: ${toolName}`);

      // Get DynamicToolManager instance
      const manager = DynamicToolManager.getInstance(
        this.server,
        this.mcpUnity,
        this.logger
      );

      // Execute tool directly without MCP registration
      const result = await manager.discoverAndUseTool(toolName, params);

      this.logger.info(`[Zero-Registration] Tool '${toolName}' executed successfully`);
      
      // Add batch reminder to successful results
      if (result.content && result.content.length > 0 && result.content[0].type === 'text') {
        result.content[0].text += '\n\n💡 Tip: Need more tools? Query unity://tool-names/{category} for related tools, or unity://tool-categories for all categories.';
        result.content[0].text += '\n⚡ For multiple operations, use discover_and_use_batch for better efficiency!';
      }
      
      return result;
      
    } catch (error: any) {
      this.logger.error(`[Zero-Registration] Failed to execute '${toolName}':`, error);
      
      return {
        content: [{
          type: 'text',
          text: `❌ Failed to execute tool '${toolName}': ${error.message}\n\n` +
                `💡 Tips:\n` +
                `- Query available tools: read_resource('unity://tool-names/{category}')\n` +
                `- Check tool name spelling\n` +
                `- Verify Unity Editor is running and connected`
        }],
        isError: true
      };
    }
  }
}
