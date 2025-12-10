import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
export declare class AddScriptToGameObjectTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        instanceId: z.ZodOptional<z.ZodNumber>;
        gameObjectPath: z.ZodOptional<z.ZodString>;
        scriptPath: z.ZodOptional<z.ZodString>;
        scriptName: z.ZodOptional<z.ZodString>;
        namespace: z.ZodOptional<z.ZodString>;
        initialValues: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        createIfNotExists: z.ZodDefault<z.ZodBoolean>;
        parentPath: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        createIfNotExists: boolean;
        instanceId?: number | undefined;
        gameObjectPath?: string | undefined;
        parentPath?: string | undefined;
        scriptPath?: string | undefined;
        namespace?: string | undefined;
        scriptName?: string | undefined;
        initialValues?: Record<string, any> | undefined;
    }, {
        instanceId?: number | undefined;
        gameObjectPath?: string | undefined;
        createIfNotExists?: boolean | undefined;
        parentPath?: string | undefined;
        scriptPath?: string | undefined;
        namespace?: string | undefined;
        scriptName?: string | undefined;
        initialValues?: Record<string, any> | undefined;
    }>;
    get category(): string;
    protected beforeExecute(args: any): Promise<void>;
    protected formatSuccessResponse(result: any): CallToolResult;
    protected formatErrorResponse(error: any): CallToolResult;
}
