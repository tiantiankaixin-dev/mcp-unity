import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * SetTag Tool
 * Sets GameObject tag
 */
export declare class SetTagTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodObject<{
        instanceIds: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        instanceId: z.ZodOptional<z.ZodNumber>;
        tagName: z.ZodOptional<z.ZodString>;
        tag: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        instanceIds?: number[] | undefined;
        instanceId?: number | undefined;
        tag?: string | undefined;
        tagName?: string | undefined;
    }, {
        instanceIds?: number[] | undefined;
        instanceId?: number | undefined;
        tag?: string | undefined;
        tagName?: string | undefined;
    }>, {
        instanceIds?: number[] | undefined;
        instanceId?: number | undefined;
        tag?: string | undefined;
        tagName?: string | undefined;
    }, {
        instanceIds?: number[] | undefined;
        instanceId?: number | undefined;
        tag?: string | undefined;
        tagName?: string | undefined;
    }>, {
        instanceIds?: number[] | undefined;
        instanceId?: number | undefined;
        tag?: string | undefined;
        tagName?: string | undefined;
    }, {
        instanceIds?: number[] | undefined;
        instanceId?: number | undefined;
        tag?: string | undefined;
        tagName?: string | undefined;
    }>, {
        instanceIds: number[];
        tagName: string;
    }, {
        instanceIds?: number[] | undefined;
        instanceId?: number | undefined;
        tag?: string | undefined;
        tagName?: string | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
