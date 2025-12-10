import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * DistributeGameObjects Tool
 * Distributes GameObjects evenly
 */
export declare class DistributeGameObjectsTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        instanceIds: z.ZodArray<z.ZodNumber, "many">;
        axis: z.ZodDefault<z.ZodEnum<["X", "Y", "Z", "x", "y", "z"]>>;
        spacing: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        useWorldSpace: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        instanceIds: number[];
        axis: "x" | "y" | "X" | "Y" | "Z" | "z";
        spacing: number;
        useWorldSpace: boolean;
    }, {
        instanceIds: number[];
        axis?: "x" | "y" | "X" | "Y" | "Z" | "z" | undefined;
        spacing?: number | undefined;
        useWorldSpace?: boolean | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
