import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
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
export declare class DiscoverAndUseToolTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        toolName: z.ZodString;
        params: z.ZodRecord<z.ZodString, z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        params: Record<string, any>;
        toolName: string;
    }, {
        params: Record<string, any>;
        toolName: string;
    }>;
    get category(): string;
    /**
     * Execute tool via DynamicToolManager
     */
    protected execute(args: any): Promise<CallToolResult>;
}
