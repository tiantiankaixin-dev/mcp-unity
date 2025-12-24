import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * CreateUIDropdown Tool
 * Creates a UI Dropdown
 */
export declare class CreateUIDropdownTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        dropdownName: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        position: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        posX: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        posY: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        width: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        height: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        posX: number;
        posY: number;
        width: number;
        height: number;
        dropdownName: string;
        options?: string[] | undefined;
        position?: number[] | undefined;
    }, {
        options?: string[] | undefined;
        position?: number[] | undefined;
        posX?: number | undefined;
        posY?: number | undefined;
        width?: number | undefined;
        height?: number | undefined;
        dropdownName?: string | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
