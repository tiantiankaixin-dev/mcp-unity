import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * FindMissingReferences Tool
 * Finds missing references
 */
export declare class FindMissingReferencesTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        scanProject: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        includeInactive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        scanProject: boolean;
        includeInactive: boolean;
    }, {
        scanProject?: boolean | undefined;
        includeInactive?: boolean | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
