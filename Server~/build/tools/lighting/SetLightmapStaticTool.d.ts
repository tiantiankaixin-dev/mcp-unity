import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * SetLightmapStatic Tool
 * Sets GameObject as lightmap static
 */
export declare class SetLightmapStaticTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        instanceIds: z.ZodArray<z.ZodNumber, "many">;
        isStatic: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        includeChildren: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        instanceIds: number[];
        includeChildren: boolean;
        isStatic: boolean;
    }, {
        instanceIds: number[];
        includeChildren?: boolean | undefined;
        isStatic?: boolean | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
