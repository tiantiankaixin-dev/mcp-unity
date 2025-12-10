import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * SetLayer Tool
 * Sets GameObject layer
 */
export declare class SetLayerTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodObject<{
        instanceIds: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        instanceId: z.ZodOptional<z.ZodNumber>;
        layerName: z.ZodOptional<z.ZodString>;
        layer: z.ZodOptional<z.ZodString>;
        includeChildren: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        includeChildren: boolean;
        instanceIds?: number[] | undefined;
        instanceId?: number | undefined;
        layerName?: string | undefined;
        layer?: string | undefined;
    }, {
        instanceIds?: number[] | undefined;
        instanceId?: number | undefined;
        layerName?: string | undefined;
        includeChildren?: boolean | undefined;
        layer?: string | undefined;
    }>, {
        includeChildren: boolean;
        instanceIds?: number[] | undefined;
        instanceId?: number | undefined;
        layerName?: string | undefined;
        layer?: string | undefined;
    }, {
        instanceIds?: number[] | undefined;
        instanceId?: number | undefined;
        layerName?: string | undefined;
        includeChildren?: boolean | undefined;
        layer?: string | undefined;
    }>, {
        includeChildren: boolean;
        instanceIds?: number[] | undefined;
        instanceId?: number | undefined;
        layerName?: string | undefined;
        layer?: string | undefined;
    }, {
        instanceIds?: number[] | undefined;
        instanceId?: number | undefined;
        layerName?: string | undefined;
        includeChildren?: boolean | undefined;
        layer?: string | undefined;
    }>, {
        instanceIds: number[];
        layerName: string;
        includeChildren: boolean;
    }, {
        instanceIds?: number[] | undefined;
        instanceId?: number | undefined;
        layerName?: string | undefined;
        includeChildren?: boolean | undefined;
        layer?: string | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
