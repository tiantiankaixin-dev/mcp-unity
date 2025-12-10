import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * CreateScriptableObject Tool
 * Creates a ScriptableObject
 */
export declare class CreateScriptableObjectTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        assetName: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        savePath: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        typeName: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        savePath: string;
        assetName: string;
        typeName?: string | undefined;
    }, {
        typeName?: string | undefined;
        savePath?: string | undefined;
        assetName?: string | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
