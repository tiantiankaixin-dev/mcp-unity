import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * AddCollider Tool
 * Adds Collider component to GameObject
 */
export declare class AddColliderTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        instanceIds: z.ZodArray<z.ZodNumber, "many">;
        colliderType: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        isTrigger: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        instanceIds: number[];
        colliderType: string;
        isTrigger: boolean;
    }, {
        instanceIds: number[];
        colliderType?: string | undefined;
        isTrigger?: boolean | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
