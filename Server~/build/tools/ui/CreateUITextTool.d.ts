import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * CreateUIText Tool
 * Creates a UI Text element
 */
export declare class CreateUITextTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        text: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        posX: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        posY: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        fontSize: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        color: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        text: string;
        posX: number;
        posY: number;
        color: string;
        fontSize: number;
    }, {
        text?: string | undefined;
        posX?: number | undefined;
        posY?: number | undefined;
        color?: string | undefined;
        fontSize?: number | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
