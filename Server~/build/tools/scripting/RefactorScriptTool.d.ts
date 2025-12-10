import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
export declare class RefactorScriptTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        scriptPath: z.ZodString;
        operation: z.ZodEnum<["rename_symbol", "extract_method", "inline_variable", "move_to_namespace", "organize_usings", "format_code", "remove_unused_usings", "add_regions", "convert_to_property"]>;
        oldName: z.ZodOptional<z.ZodString>;
        newName: z.ZodOptional<z.ZodString>;
        symbolType: z.ZodOptional<z.ZodEnum<["field", "method", "class", "variable"]>>;
        startLine: z.ZodOptional<z.ZodNumber>;
        endLine: z.ZodOptional<z.ZodNumber>;
        methodName: z.ZodOptional<z.ZodString>;
        targetNamespace: z.ZodOptional<z.ZodString>;
        fieldName: z.ZodOptional<z.ZodString>;
        propertyAccessors: z.ZodOptional<z.ZodEnum<["get", "set", "get_set"]>>;
        updateReferences: z.ZodDefault<z.ZodBoolean>;
        createBackup: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        scriptPath: string;
        operation: "rename_symbol" | "extract_method" | "inline_variable" | "move_to_namespace" | "organize_usings" | "format_code" | "remove_unused_usings" | "add_regions" | "convert_to_property";
        updateReferences: boolean;
        createBackup: boolean;
        fieldName?: string | undefined;
        oldName?: string | undefined;
        newName?: string | undefined;
        symbolType?: "field" | "method" | "class" | "variable" | undefined;
        startLine?: number | undefined;
        endLine?: number | undefined;
        methodName?: string | undefined;
        targetNamespace?: string | undefined;
        propertyAccessors?: "set" | "get" | "get_set" | undefined;
    }, {
        scriptPath: string;
        operation: "rename_symbol" | "extract_method" | "inline_variable" | "move_to_namespace" | "organize_usings" | "format_code" | "remove_unused_usings" | "add_regions" | "convert_to_property";
        fieldName?: string | undefined;
        oldName?: string | undefined;
        newName?: string | undefined;
        symbolType?: "field" | "method" | "class" | "variable" | undefined;
        startLine?: number | undefined;
        endLine?: number | undefined;
        methodName?: string | undefined;
        targetNamespace?: string | undefined;
        propertyAccessors?: "set" | "get" | "get_set" | undefined;
        updateReferences?: boolean | undefined;
        createBackup?: boolean | undefined;
    }>;
    get category(): string;
    protected beforeExecute(args: any): Promise<void>;
    protected formatSuccessResponse(result: any): CallToolResult;
    protected formatErrorResponse(error: any): CallToolResult;
}
