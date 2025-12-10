import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * CreateProBuilderShape Tool
 * Creates ProBuilder shape
 */
export declare class CreateProBuilderShapeTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        shapeName: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        shapeType: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        posX: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        posY: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        posZ: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        size: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        shapeName: string;
        shapeType: string;
        posX: number;
        posY: number;
        posZ: number;
        size: number;
    }, {
        shapeName?: string | undefined;
        shapeType?: string | undefined;
        posX?: number | undefined;
        posY?: number | undefined;
        posZ?: number | undefined;
        size?: number | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
