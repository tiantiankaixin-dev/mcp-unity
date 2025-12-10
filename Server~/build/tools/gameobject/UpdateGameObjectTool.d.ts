import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * UpdateGameObject Tool
 * Updates GameObject properties
 */
export declare class UpdateGameObjectTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        instanceId: z.ZodOptional<z.ZodNumber>;
        objectPath: z.ZodOptional<z.ZodString>;
        gameObjectData: z.ZodObject<{
            name: z.ZodOptional<z.ZodString>;
            tag: z.ZodOptional<z.ZodString>;
            layer: z.ZodOptional<z.ZodNumber>;
            isActiveSelf: z.ZodOptional<z.ZodBoolean>;
            isStatic: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            name?: string | undefined;
            tag?: string | undefined;
            layer?: number | undefined;
            isActiveSelf?: boolean | undefined;
            isStatic?: boolean | undefined;
        }, {
            name?: string | undefined;
            tag?: string | undefined;
            layer?: number | undefined;
            isActiveSelf?: boolean | undefined;
            isStatic?: boolean | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        gameObjectData: {
            name?: string | undefined;
            tag?: string | undefined;
            layer?: number | undefined;
            isActiveSelf?: boolean | undefined;
            isStatic?: boolean | undefined;
        };
        instanceId?: number | undefined;
        objectPath?: string | undefined;
    }, {
        gameObjectData: {
            name?: string | undefined;
            tag?: string | undefined;
            layer?: number | undefined;
            isActiveSelf?: boolean | undefined;
            isStatic?: boolean | undefined;
        };
        instanceId?: number | undefined;
        objectPath?: string | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
