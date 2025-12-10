import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * BatchAddComponent Tool
 * Batch adds components
 */
export declare class BatchAddComponentTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodObject<{
        instanceIds: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        instanceId: z.ZodOptional<z.ZodNumber>;
        componentTypeName: z.ZodOptional<z.ZodString>;
        componentType: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        instanceIds?: number[] | undefined;
        instanceId?: number | undefined;
        componentTypeName?: string | undefined;
        componentType?: string | undefined;
    }, {
        instanceIds?: number[] | undefined;
        instanceId?: number | undefined;
        componentTypeName?: string | undefined;
        componentType?: string | undefined;
    }>, {
        instanceIds?: number[] | undefined;
        instanceId?: number | undefined;
        componentTypeName?: string | undefined;
        componentType?: string | undefined;
    }, {
        instanceIds?: number[] | undefined;
        instanceId?: number | undefined;
        componentTypeName?: string | undefined;
        componentType?: string | undefined;
    }>, {
        instanceIds?: number[] | undefined;
        instanceId?: number | undefined;
        componentTypeName?: string | undefined;
        componentType?: string | undefined;
    }, {
        instanceIds?: number[] | undefined;
        instanceId?: number | undefined;
        componentTypeName?: string | undefined;
        componentType?: string | undefined;
    }>, {
        instanceIds: number[];
        componentTypeName: string;
    }, {
        instanceIds?: number[] | undefined;
        instanceId?: number | undefined;
        componentTypeName?: string | undefined;
        componentType?: string | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
