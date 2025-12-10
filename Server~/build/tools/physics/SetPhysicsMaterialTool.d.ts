import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * SetPhysicsMaterial Tool
 * Sets physics material on collider
 */
export declare class SetPhysicsMaterialTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        instanceIds: z.ZodArray<z.ZodNumber, "many">;
        dynamicFriction: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        staticFriction: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        bounciness: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        instanceIds: number[];
        dynamicFriction: number;
        staticFriction: number;
        bounciness: number;
    }, {
        instanceIds: number[];
        dynamicFriction?: number | undefined;
        staticFriction?: number | undefined;
        bounciness?: number | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
