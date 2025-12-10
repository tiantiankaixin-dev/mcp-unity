import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * RandomizeTransform Tool
 * Randomizes GameObject transform
 */
export declare class RandomizeTransformTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        instanceIds: z.ZodArray<z.ZodNumber, "many">;
        randomizePosition: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        randomizeRotation: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        randomizeScale: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        positionRange: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        rotationRange: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        scaleMin: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        scaleMax: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        instanceIds: number[];
        randomizePosition: boolean;
        randomizeRotation: boolean;
        randomizeScale: boolean;
        positionRange: number;
        rotationRange: number;
        scaleMin: number;
        scaleMax: number;
    }, {
        instanceIds: number[];
        randomizePosition?: boolean | undefined;
        randomizeRotation?: boolean | undefined;
        randomizeScale?: boolean | undefined;
        positionRange?: number | undefined;
        rotationRange?: number | undefined;
        scaleMin?: number | undefined;
        scaleMax?: number | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
