import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * CreateUIToggle Tool
 * Creates a UI Toggle
 */
export declare class CreateUIToggleTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        toggleName: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        posX: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        posY: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        labelText: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        isOn: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        posX: number;
        posY: number;
        toggleName: string;
        labelText: string;
        isOn: boolean;
    }, {
        posX?: number | undefined;
        posY?: number | undefined;
        toggleName?: string | undefined;
        labelText?: string | undefined;
        isOn?: boolean | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
