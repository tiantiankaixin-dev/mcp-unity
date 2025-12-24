import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * CreateGridLayoutGroup Tool
 * Creates a Grid Layout Group
 */
export declare class CreateGridLayoutGroupTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        panelName: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        position: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        posX: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        posY: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        width: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        height: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        cellWidth: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        cellHeight: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        spacing: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        posX: number;
        posY: number;
        width: number;
        height: number;
        spacing: number;
        panelName: string;
        cellWidth: number;
        cellHeight: number;
        position?: number[] | undefined;
    }, {
        position?: number[] | undefined;
        posX?: number | undefined;
        posY?: number | undefined;
        width?: number | undefined;
        height?: number | undefined;
        spacing?: number | undefined;
        panelName?: string | undefined;
        cellWidth?: number | undefined;
        cellHeight?: number | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
