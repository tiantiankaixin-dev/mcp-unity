import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * CreateLight Tool
 * Creates a light source
 */
export declare class CreateLightTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        lightType: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        lightName: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        intensity: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        color: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>>;
        position: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        posX: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        posY: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        posZ: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        posX: number;
        posY: number;
        posZ: number;
        lightType: string;
        lightName: string;
        intensity: number;
        color: number[];
        position?: number[] | undefined;
    }, {
        position?: number[] | undefined;
        posX?: number | undefined;
        posY?: number | undefined;
        posZ?: number | undefined;
        lightType?: string | undefined;
        lightName?: string | undefined;
        intensity?: number | undefined;
        color?: number[] | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
