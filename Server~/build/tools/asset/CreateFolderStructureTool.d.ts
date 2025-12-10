import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * CreateFolderStructure Tool
 * Creates folder structure
 */
export declare class CreateFolderStructureTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        rootPath: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        folderNames: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        rootPath: string;
        folderNames?: string[] | undefined;
    }, {
        rootPath?: string | undefined;
        folderNames?: string[] | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
