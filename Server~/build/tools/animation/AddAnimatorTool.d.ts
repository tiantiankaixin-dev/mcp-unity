import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * AddAnimator Tool
 * Adds Animator component to GameObject
 */
export declare class AddAnimatorTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodEffects<z.ZodEffects<z.ZodObject<{
        instanceIds: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        instanceId: z.ZodOptional<z.ZodNumber>;
        controllerPath: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        instanceIds?: number[] | undefined;
        instanceId?: number | undefined;
        controllerPath?: string | undefined;
    }, {
        instanceIds?: number[] | undefined;
        instanceId?: number | undefined;
        controllerPath?: string | undefined;
    }>, {
        instanceIds?: number[] | undefined;
        instanceId?: number | undefined;
        controllerPath?: string | undefined;
    }, {
        instanceIds?: number[] | undefined;
        instanceId?: number | undefined;
        controllerPath?: string | undefined;
    }>, {
        instanceIds: number[];
        controllerPath: string | undefined;
    }, {
        instanceIds?: number[] | undefined;
        instanceId?: number | undefined;
        controllerPath?: string | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
