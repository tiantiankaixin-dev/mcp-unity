import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
export declare class SetAnimatorParameterTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        instanceId: z.ZodOptional<z.ZodNumber>;
        gameObjectPath: z.ZodOptional<z.ZodString>;
        parameterName: z.ZodString;
        parameterType: z.ZodEnum<["Float", "Int", "Bool", "Trigger"]>;
        value: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodBoolean]>>;
        createIfNotExists: z.ZodDefault<z.ZodBoolean>;
        defaultValue: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodBoolean]>>;
    }, "strip", z.ZodTypeAny, {
        parameterName: string;
        parameterType: "Float" | "Int" | "Bool" | "Trigger";
        createIfNotExists: boolean;
        value?: number | boolean | undefined;
        instanceId?: number | undefined;
        gameObjectPath?: string | undefined;
        defaultValue?: number | boolean | undefined;
    }, {
        parameterName: string;
        parameterType: "Float" | "Int" | "Bool" | "Trigger";
        value?: number | boolean | undefined;
        instanceId?: number | undefined;
        gameObjectPath?: string | undefined;
        createIfNotExists?: boolean | undefined;
        defaultValue?: number | boolean | undefined;
    }>;
    get category(): string;
    protected beforeExecute(args: any): Promise<void>;
    protected formatSuccessResponse(result: any): CallToolResult;
    protected formatErrorResponse(error: any): CallToolResult;
}
