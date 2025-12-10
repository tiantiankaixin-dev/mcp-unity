import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * MenuItem Tool
 * Executes a menu item
 */
export declare class MenuItemTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        menuPath: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        menuPath?: string | undefined;
    }, {
        menuPath?: string | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
