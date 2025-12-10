import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * CopyTransform Tool
 * Copies transform from one GameObject to another
 */
export declare class CopyTransformTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodObject<{
        sourceInstanceId: z.ZodOptional<z.ZodNumber>;
        sourceObjectPath: z.ZodOptional<z.ZodString>;
        sourceObjectName: z.ZodOptional<z.ZodString>;
        targetInstanceId: z.ZodOptional<z.ZodNumber>;
        targetObjectPath: z.ZodOptional<z.ZodString>;
        targetObjectName: z.ZodOptional<z.ZodString>;
        targetInstanceIds: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        copyPosition: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        copyRotation: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        copyScale: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        useLocal: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        copyPosition: boolean;
        copyRotation: boolean;
        copyScale: boolean;
        useLocal: boolean;
        targetInstanceId?: number | undefined;
        targetObjectPath?: string | undefined;
        sourceInstanceId?: number | undefined;
        sourceObjectPath?: string | undefined;
        sourceObjectName?: string | undefined;
        targetObjectName?: string | undefined;
        targetInstanceIds?: number[] | undefined;
    }, {
        targetInstanceId?: number | undefined;
        targetObjectPath?: string | undefined;
        sourceInstanceId?: number | undefined;
        sourceObjectPath?: string | undefined;
        sourceObjectName?: string | undefined;
        targetObjectName?: string | undefined;
        targetInstanceIds?: number[] | undefined;
        copyPosition?: boolean | undefined;
        copyRotation?: boolean | undefined;
        copyScale?: boolean | undefined;
        useLocal?: boolean | undefined;
    }>, {
        copyPosition: boolean;
        copyRotation: boolean;
        copyScale: boolean;
        useLocal: boolean;
        targetInstanceId?: number | undefined;
        targetObjectPath?: string | undefined;
        sourceInstanceId?: number | undefined;
        sourceObjectPath?: string | undefined;
        sourceObjectName?: string | undefined;
        targetObjectName?: string | undefined;
        targetInstanceIds?: number[] | undefined;
    }, {
        targetInstanceId?: number | undefined;
        targetObjectPath?: string | undefined;
        sourceInstanceId?: number | undefined;
        sourceObjectPath?: string | undefined;
        sourceObjectName?: string | undefined;
        targetObjectName?: string | undefined;
        targetInstanceIds?: number[] | undefined;
        copyPosition?: boolean | undefined;
        copyRotation?: boolean | undefined;
        copyScale?: boolean | undefined;
        useLocal?: boolean | undefined;
    }>, {
        copyPosition: boolean;
        copyRotation: boolean;
        copyScale: boolean;
        useLocal: boolean;
        targetInstanceId?: number | undefined;
        targetObjectPath?: string | undefined;
        sourceInstanceId?: number | undefined;
        sourceObjectPath?: string | undefined;
        sourceObjectName?: string | undefined;
        targetObjectName?: string | undefined;
        targetInstanceIds?: number[] | undefined;
    }, {
        targetInstanceId?: number | undefined;
        targetObjectPath?: string | undefined;
        sourceInstanceId?: number | undefined;
        sourceObjectPath?: string | undefined;
        sourceObjectName?: string | undefined;
        targetObjectName?: string | undefined;
        targetInstanceIds?: number[] | undefined;
        copyPosition?: boolean | undefined;
        copyRotation?: boolean | undefined;
        copyScale?: boolean | undefined;
        useLocal?: boolean | undefined;
    }>, {
        sourceInstanceId: number;
        sourceObjectPath: string | undefined;
        sourceObjectName: string | undefined;
        targetInstanceId: number;
        targetObjectPath: string | undefined;
        targetObjectName: string | undefined;
        targetInstanceIds: number[];
        copyPosition: boolean;
        copyRotation: boolean;
        copyScale: boolean;
        useLocal: boolean;
    }, {
        targetInstanceId?: number | undefined;
        targetObjectPath?: string | undefined;
        sourceInstanceId?: number | undefined;
        sourceObjectPath?: string | undefined;
        sourceObjectName?: string | undefined;
        targetObjectName?: string | undefined;
        targetInstanceIds?: number[] | undefined;
        copyPosition?: boolean | undefined;
        copyRotation?: boolean | undefined;
        copyScale?: boolean | undefined;
        useLocal?: boolean | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
