import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
export declare class RecordAnimationTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        instanceId: z.ZodOptional<z.ZodNumber>;
        gameObjectPath: z.ZodOptional<z.ZodString>;
        animationClipPath: z.ZodString;
        duration: z.ZodNumber;
        frameRate: z.ZodDefault<z.ZodNumber>;
        recordChildren: z.ZodDefault<z.ZodBoolean>;
        recordProperties: z.ZodDefault<z.ZodArray<z.ZodEnum<["Position", "Rotation", "Scale", "ActiveState", "Material", "Color", "All"]>, "many">>;
        startImmediately: z.ZodDefault<z.ZodBoolean>;
        overwriteExisting: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        animationClipPath: string;
        duration: number;
        frameRate: number;
        recordChildren: boolean;
        recordProperties: ("Position" | "Rotation" | "Scale" | "ActiveState" | "Material" | "Color" | "All")[];
        startImmediately: boolean;
        overwriteExisting: boolean;
        instanceId?: number | undefined;
        gameObjectPath?: string | undefined;
    }, {
        animationClipPath: string;
        duration: number;
        instanceId?: number | undefined;
        gameObjectPath?: string | undefined;
        frameRate?: number | undefined;
        recordChildren?: boolean | undefined;
        recordProperties?: ("Position" | "Rotation" | "Scale" | "ActiveState" | "Material" | "Color" | "All")[] | undefined;
        startImmediately?: boolean | undefined;
        overwriteExisting?: boolean | undefined;
    }>;
    get category(): string;
    protected beforeExecute(args: any): Promise<void>;
    protected formatSuccessResponse(result: any): CallToolResult;
    protected formatErrorResponse(error: any): CallToolResult;
}
