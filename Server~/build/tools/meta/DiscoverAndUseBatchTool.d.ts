import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * DiscoverAndUseBatchTool - Execute multiple Unity tools in sequence with parameter chaining
 *
 * **Chained Execution**:
 * Execute multiple Unity tools where later tools can reference outputs from earlier tools.
 * Use `params_mapping` with JSONPath syntax `$.{index}.fieldName` to chain results.
 *
 * **Parameter Chaining**:
 * - `$.0.instanceId` - Get instanceId from first tool's result
 * - `$.1.results[0].path` - Get first path from second tool's results array
 * - Static values can be mixed with mappings in params_mapping
 *
 * **Example - Create red cube with physics**:
 * ```
 * discover_and_use_batch({
 *   tools: [
 *     {
 *       toolName: "create_primitive_object",
 *       params: { primitiveType: "cube", objectName: "Player", posY: 1 }
 *     },
 *     {
 *       toolName: "change_material_color",
 *       params_mapping: {
 *         instanceId: "$.0.instanceId",  // Chain from first tool
 *         colorR: 1.0, colorG: 0, colorB: 0
 *       }
 *     },
 *     {
 *       toolName: "add_rigidbody",
 *       params_mapping: {
 *         instanceId: "$.0.instanceId",  // Chain from first tool
 *         mass: 2.0
 *       }
 *     }
 *   ]
 * })
 * ```
 *
 * **Error Handling**:
 * Stops on first error, returns completed results + error info.
 */
export declare class DiscoverAndUseBatchTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        tools: z.ZodArray<z.ZodObject<{
            toolName: z.ZodString;
            params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            params_mapping: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, "strip", z.ZodTypeAny, {
            toolName: string;
            params?: Record<string, any> | undefined;
            params_mapping?: Record<string, any> | undefined;
        }, {
            toolName: string;
            params?: Record<string, any> | undefined;
            params_mapping?: Record<string, any> | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        tools: {
            toolName: string;
            params?: Record<string, any> | undefined;
            params_mapping?: Record<string, any> | undefined;
        }[];
    }, {
        tools: {
            toolName: string;
            params?: Record<string, any> | undefined;
            params_mapping?: Record<string, any> | undefined;
        }[];
    }>;
    get category(): string;
    /**
     * Execute multiple tools sequentially with parameter chaining
     */
    protected execute(args: any): Promise<CallToolResult>;
    /**
     * Extract key information from result for summary display
     */
    private extractKeyInfo;
}
