import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
export declare class UpdateScriptTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        scriptPath: z.ZodString;
        operation: z.ZodEnum<["add_field", "add_method", "add_using", "rename_class", "add_namespace", "remove_field", "remove_method"]>;
        field: z.ZodOptional<z.ZodObject<{
            name: z.ZodString;
            type: z.ZodString;
            isPublic: z.ZodDefault<z.ZodBoolean>;
            isSerializeField: z.ZodDefault<z.ZodBoolean>;
            defaultValue: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            type: string;
            isPublic: boolean;
            isSerializeField: boolean;
            defaultValue?: string | undefined;
        }, {
            name: string;
            type: string;
            defaultValue?: string | undefined;
            isPublic?: boolean | undefined;
            isSerializeField?: boolean | undefined;
        }>>;
        method: z.ZodOptional<z.ZodObject<{
            name: z.ZodString;
            returnType: z.ZodDefault<z.ZodString>;
            parameters: z.ZodOptional<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                type: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                name: string;
                type: string;
            }, {
                name: string;
                type: string;
            }>, "many">>;
            body: z.ZodOptional<z.ZodString>;
            isPublic: z.ZodDefault<z.ZodBoolean>;
            isStatic: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            isStatic: boolean;
            isPublic: boolean;
            returnType: string;
            parameters?: {
                name: string;
                type: string;
            }[] | undefined;
            body?: string | undefined;
        }, {
            name: string;
            isStatic?: boolean | undefined;
            isPublic?: boolean | undefined;
            returnType?: string | undefined;
            parameters?: {
                name: string;
                type: string;
            }[] | undefined;
            body?: string | undefined;
        }>>;
        usingStatement: z.ZodOptional<z.ZodString>;
        newClassName: z.ZodOptional<z.ZodString>;
        namespace: z.ZodOptional<z.ZodString>;
        targetName: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        scriptPath: string;
        operation: "add_field" | "add_method" | "add_using" | "rename_class" | "add_namespace" | "remove_field" | "remove_method";
        field?: {
            name: string;
            type: string;
            isPublic: boolean;
            isSerializeField: boolean;
            defaultValue?: string | undefined;
        } | undefined;
        method?: {
            name: string;
            isStatic: boolean;
            isPublic: boolean;
            returnType: string;
            parameters?: {
                name: string;
                type: string;
            }[] | undefined;
            body?: string | undefined;
        } | undefined;
        usingStatement?: string | undefined;
        newClassName?: string | undefined;
        namespace?: string | undefined;
        targetName?: string | undefined;
    }, {
        scriptPath: string;
        operation: "add_field" | "add_method" | "add_using" | "rename_class" | "add_namespace" | "remove_field" | "remove_method";
        field?: {
            name: string;
            type: string;
            defaultValue?: string | undefined;
            isPublic?: boolean | undefined;
            isSerializeField?: boolean | undefined;
        } | undefined;
        method?: {
            name: string;
            isStatic?: boolean | undefined;
            isPublic?: boolean | undefined;
            returnType?: string | undefined;
            parameters?: {
                name: string;
                type: string;
            }[] | undefined;
            body?: string | undefined;
        } | undefined;
        usingStatement?: string | undefined;
        newClassName?: string | undefined;
        namespace?: string | undefined;
        targetName?: string | undefined;
    }>;
    get category(): string;
    protected beforeExecute(args: any): Promise<void>;
    protected formatSuccessResponse(result: any): CallToolResult;
    protected formatErrorResponse(error: any): CallToolResult;
}
