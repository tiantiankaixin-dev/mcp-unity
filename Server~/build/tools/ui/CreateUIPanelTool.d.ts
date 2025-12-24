import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * CreateUIPanel Tool
 * Creates a UI Panel
 */
export declare class CreateUIPanelTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        panelName: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        position: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        posX: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        posY: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        width: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        height: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        color: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>>;
    }, "strip", z.ZodTypeAny, {
        posX: number;
        posY: number;
        width: number;
        height: number;
        color: number[];
        panelName: string;
        position?: number[] | undefined;
    }, {
        position?: number[] | undefined;
        posX?: number | undefined;
        posY?: number | undefined;
        width?: number | undefined;
        height?: number | undefined;
        color?: number[] | undefined;
        panelName?: string | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
