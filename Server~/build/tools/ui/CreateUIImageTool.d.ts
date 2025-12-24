import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * CreateUIImage Tool
 * Creates a UI Image
 */
export declare class CreateUIImageTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        imageName: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        position: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        posX: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        posY: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        width: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        height: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        color: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>>;
        spritePath: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        posX: number;
        posY: number;
        width: number;
        height: number;
        color: number[];
        imageName: string;
        position?: number[] | undefined;
        spritePath?: string | undefined;
    }, {
        position?: number[] | undefined;
        posX?: number | undefined;
        posY?: number | undefined;
        width?: number | undefined;
        height?: number | undefined;
        color?: number[] | undefined;
        imageName?: string | undefined;
        spritePath?: string | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
