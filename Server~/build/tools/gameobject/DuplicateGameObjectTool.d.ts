import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * DuplicateGameObject Tool
 * Duplicates/clones GameObjects in the scene
 */
export declare class DuplicateGameObjectTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        instanceId: z.ZodOptional<z.ZodNumber>;
        instanceIds: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        objectPath: z.ZodOptional<z.ZodString>;
        count: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        keepParent: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        offsetX: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        offsetY: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        offsetZ: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        count: number;
        keepParent: boolean;
        offsetX: number;
        offsetY: number;
        offsetZ: number;
        instanceIds?: number[] | undefined;
        instanceId?: number | undefined;
        objectPath?: string | undefined;
    }, {
        instanceIds?: number[] | undefined;
        instanceId?: number | undefined;
        objectPath?: string | undefined;
        count?: number | undefined;
        keepParent?: boolean | undefined;
        offsetX?: number | undefined;
        offsetY?: number | undefined;
        offsetZ?: number | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
