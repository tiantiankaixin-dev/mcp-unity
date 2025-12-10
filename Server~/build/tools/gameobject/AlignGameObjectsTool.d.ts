import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * AlignGameObjects Tool
 * Aligns multiple GameObjects
 */
export declare class AlignGameObjectsTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        instanceIds: z.ZodArray<z.ZodNumber, "many">;
        axis: z.ZodDefault<z.ZodEnum<["X", "Y", "Z", "x", "y", "z"]>>;
        alignMode: z.ZodDefault<z.ZodEnum<["min", "max", "center", "average"]>>;
    }, "strip", z.ZodTypeAny, {
        instanceIds: number[];
        axis: "x" | "y" | "X" | "Y" | "Z" | "z";
        alignMode: "min" | "max" | "center" | "average";
    }, {
        instanceIds: number[];
        axis?: "x" | "y" | "X" | "Y" | "Z" | "z" | undefined;
        alignMode?: "min" | "max" | "center" | "average" | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
