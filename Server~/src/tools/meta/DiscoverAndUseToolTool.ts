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
    .optional()
    .default({})
    .describe('Parameters to pass to the tool. Optional - defaults to empty object. Params are auto-normalized (snake_case → camelCase).')
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
  description: '⚠️ SINGLE TOOL ONLY! 🔧 STEP 3: Execute ONE Unity tool. For 2+ tools, use discover_and_use_batch instead. 📖 unity_tool_discovery',
  category: 'meta',
  version: '1.0.0'
})
export class DiscoverAndUseToolTool extends BaseTool {
  get name() {
    return 'discover_and_use_tool';
  }

  get description() {
    return '⚠️ SINGLE TOOL ONLY! 🔧 STEP 3: Execute ONE Unity tool. For 2+ tools, use discover_and_use_batch instead. 📖 unity_tool_discovery';
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

      // Result already contains workflow hint from DynamicToolManager
      return result;

    } catch (error: any) {
      this.logger.error(`[Zero-Registration] Failed to execute '${toolName}':`, error);

      return {
        content: [{
          type: 'text',
          text: `❌ Failed to execute tool '${toolName}': ${error.message}\n\n` +
                `💡 Check: tool name spelling, Unity Editor connection\n` +
                `📋 Workflow: list_categories → get_tool_names({category}) → discover_and_use_batch`
        }],
        isError: true
      };
    }
  }
}
