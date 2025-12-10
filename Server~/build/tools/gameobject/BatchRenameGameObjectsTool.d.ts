import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * BatchRenameGameObjects Tool
 * Batch renames GameObjects
 */
export declare class BatchRenameGameObjectsTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodObject<{
        instanceIds: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        instanceId: z.ZodOptional<z.ZodNumber>;
        oldNamePattern: z.ZodOptional<z.ZodString>;
        newNamePrefix: z.ZodOptional<z.ZodString>;
        baseName: z.ZodOptional<z.ZodString>;
        newNamePattern: z.ZodOptional<z.ZodString>;
        newNameSuffix: z.ZodOptional<z.ZodString>;
        startNumber: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        startIndex: z.ZodOptional<z.ZodNumber>;
        includeChildren: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        includeChildren: boolean;
        startNumber: number;
        instanceIds?: number[] | undefined;
        instanceId?: number | undefined;
        oldNamePattern?: string | undefined;
        newNamePrefix?: string | undefined;
        baseName?: string | undefined;
        newNamePattern?: string | undefined;
        newNameSuffix?: string | undefined;
        startIndex?: number | undefined;
    }, {
        instanceIds?: number[] | undefined;
        instanceId?: number | undefined;
        includeChildren?: boolean | undefined;
        oldNamePattern?: string | undefined;
        newNamePrefix?: string | undefined;
        baseName?: string | undefined;
        newNamePattern?: string | undefined;
        newNameSuffix?: string | undefined;
        startNumber?: number | undefined;
        startIndex?: number | undefined;
    }>, {
        includeChildren: boolean;
        startNumber: number;
        instanceIds?: number[] | undefined;
        instanceId?: number | undefined;
        oldNamePattern?: string | undefined;
        newNamePrefix?: string | undefined;
        baseName?: string | undefined;
        newNamePattern?: string | undefined;
        newNameSuffix?: string | undefined;
        startIndex?: number | undefined;
    }, {
        instanceIds?: number[] | undefined;
        instanceId?: number | undefined;
        includeChildren?: boolean | undefined;
        oldNamePattern?: string | undefined;
        newNamePrefix?: string | undefined;
        baseName?: string | undefined;
        newNamePattern?: string | undefined;
        newNameSuffix?: string | undefined;
        startNumber?: number | undefined;
        startIndex?: number | undefined;
    }>, {
        includeChildren: boolean;
        startNumber: number;
        instanceIds?: number[] | undefined;
        instanceId?: number | undefined;
        oldNamePattern?: string | undefined;
        newNamePrefix?: string | undefined;
        baseName?: string | undefined;
        newNamePattern?: string | undefined;
        newNameSuffix?: string | undefined;
        startIndex?: number | undefined;
    }, {
        instanceIds?: number[] | undefined;
        instanceId?: number | undefined;
        includeChildren?: boolean | undefined;
        oldNamePattern?: string | undefined;
        newNamePrefix?: string | undefined;
        baseName?: string | undefined;
        newNamePattern?: string | undefined;
        newNameSuffix?: string | undefined;
        startNumber?: number | undefined;
        startIndex?: number | undefined;
    }>, {
        instanceIds: number[] | undefined;
        oldNamePattern: string | undefined;
        newNamePrefix: string;
        newNameSuffix: string | undefined;
        startNumber: number;
        includeChildren: boolean;
    }, {
        instanceIds?: number[] | undefined;
        instanceId?: number | undefined;
        includeChildren?: boolean | undefined;
        oldNamePattern?: string | undefined;
        newNamePrefix?: string | undefined;
        baseName?: string | undefined;
        newNamePattern?: string | undefined;
        newNameSuffix?: string | undefined;
        startNumber?: number | undefined;
        startIndex?: number | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
