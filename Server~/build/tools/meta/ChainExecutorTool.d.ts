import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * ChainExecutorTool - 链式工具执行器
 *
 * 允许AI一次性定义多个工具的调用链，MCP服务器自动按顺序执行。
 * 前一个工具的输出可以通过JSONPath语法映射到下一个工具的输入参数。
 *
 * **核心优势**：
 * - 减少AI与MCP之间的往返次数，节省60-70% token
 * - 前序步骤的结果自动传递，无需AI再次处理
 * - 错误时立即停止，返回已执行结果
 *
 * **参数映射语法**：
 * - 静态值: 直接写值，如 `"primitiveType": "cube"`
 * - 动态值: 使用JSONPath，如 `"instanceId": "$.step1.instanceId"`
 *
 * **使用示例**：
 * ```json
 * {
 *   "chain": [
 *     {
 *       "step": "create",
 *       "tool": "create_primitive_object",
 *       "params": { "primitiveType": "cube", "posY": 1 }
 *     },
 *     {
 *       "step": "color",
 *       "tool": "change_material_color",
 *       "params_mapping": {
 *         "instanceId": "$.create.instanceId",
 *         "colorR": 1.0,
 *         "colorG": 0.0,
 *         "colorB": 0.0
 *       }
 *     },
 *     {
 *       "step": "physics",
 *       "tool": "add_rigidbody",
 *       "params_mapping": {
 *         "instanceId": "$.create.instanceId",
 *         "mass": 2.0
 *       }
 *     }
 *   ]
 * }
 * ```
 */
export declare class ChainExecutorTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        chain: z.ZodArray<z.ZodObject<{
            step: z.ZodString;
            tool: z.ZodString;
            params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            params_mapping: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, "strip", z.ZodTypeAny, {
            tool: string;
            step: string;
            params?: Record<string, any> | undefined;
            params_mapping?: Record<string, any> | undefined;
        }, {
            tool: string;
            step: string;
            params?: Record<string, any> | undefined;
            params_mapping?: Record<string, any> | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        chain: {
            tool: string;
            step: string;
            params?: Record<string, any> | undefined;
            params_mapping?: Record<string, any> | undefined;
        }[];
    }, {
        chain: {
            tool: string;
            step: string;
            params?: Record<string, any> | undefined;
            params_mapping?: Record<string, any> | undefined;
        }[];
    }>;
    get category(): string;
    /**
     * 执行工具链
     */
    protected execute(args: any): Promise<CallToolResult>;
    /**
     * 格式化链式执行结果
     */
    private formatChainResult;
    /**
     * 格式化链式执行错误（用于预验证失败）
     */
    private formatChainError;
}
