import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
export declare class AddComponentToGameObjectTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodEffects<z.ZodObject<{
        gameObjectPath: z.ZodOptional<z.ZodString>;
        gameObjectName: z.ZodOptional<z.ZodString>;
        instanceId: z.ZodOptional<z.ZodNumber>;
        componentType: z.ZodString;
        selectAfterAdd: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        componentType: string;
        selectAfterAdd: boolean;
        instanceId?: number | undefined;
        gameObjectPath?: string | undefined;
        gameObjectName?: string | undefined;
    }, {
        componentType: string;
        instanceId?: number | undefined;
        gameObjectPath?: string | undefined;
        gameObjectName?: string | undefined;
        selectAfterAdd?: boolean | undefined;
    }>, {
        componentType: string;
        selectAfterAdd: boolean;
        instanceId?: number | undefined;
        gameObjectPath?: string | undefined;
        gameObjectName?: string | undefined;
    }, {
        componentType: string;
        instanceId?: number | undefined;
        gameObjectPath?: string | undefined;
        gameObjectName?: string | undefined;
        selectAfterAdd?: boolean | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
    protected formatErrorResponse(error: any): CallToolResult;
}
