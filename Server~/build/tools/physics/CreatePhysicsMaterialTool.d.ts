import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
export declare class CreatePhysicsMaterialTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        materialName: z.ZodString;
        savePath: z.ZodDefault<z.ZodString>;
        dynamicFriction: z.ZodDefault<z.ZodNumber>;
        staticFriction: z.ZodDefault<z.ZodNumber>;
        frictionCombine: z.ZodDefault<z.ZodEnum<["Average", "Minimum", "Maximum", "Multiply"]>>;
        bounciness: z.ZodDefault<z.ZodNumber>;
        bounceCombine: z.ZodDefault<z.ZodEnum<["Average", "Minimum", "Maximum", "Multiply"]>>;
    }, "strip", z.ZodTypeAny, {
        savePath: string;
        materialName: string;
        dynamicFriction: number;
        staticFriction: number;
        bounciness: number;
        frictionCombine: "Average" | "Minimum" | "Maximum" | "Multiply";
        bounceCombine: "Average" | "Minimum" | "Maximum" | "Multiply";
    }, {
        materialName: string;
        savePath?: string | undefined;
        dynamicFriction?: number | undefined;
        staticFriction?: number | undefined;
        bounciness?: number | undefined;
        frictionCombine?: "Average" | "Minimum" | "Maximum" | "Multiply" | undefined;
        bounceCombine?: "Average" | "Minimum" | "Maximum" | "Multiply" | undefined;
    }>;
    get category(): string;
    protected beforeExecute(args: any): Promise<void>;
    protected formatSuccessResponse(result: any): CallToolResult;
    protected formatErrorResponse(error: any): CallToolResult;
}
