import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * RegisterCategoryTool - Register all tools in a category to MCP
 *
 * After registration, AI can call tools directly (e.g., create_primitive_object)
 * instead of using discover_and_use_tool({ toolName, params }).
 */
export declare class RegisterCategoryTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        category: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        category: string;
    }, {
        category: string;
    }>;
    get category(): string;
    protected execute(args: {
        category: string;
    }): Promise<CallToolResult>;
}
