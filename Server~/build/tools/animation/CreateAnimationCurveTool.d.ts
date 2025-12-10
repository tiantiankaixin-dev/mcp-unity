import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
export declare class CreateAnimationCurveTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        animationClipPath: z.ZodString;
        propertyPath: z.ZodString;
        targetType: z.ZodString;
        keyframes: z.ZodArray<z.ZodObject<{
            time: z.ZodNumber;
            value: z.ZodNumber;
            inTangent: z.ZodOptional<z.ZodNumber>;
            outTangent: z.ZodOptional<z.ZodNumber>;
            weightedMode: z.ZodOptional<z.ZodEnum<["None", "In", "Out", "Both"]>>;
        }, "strip", z.ZodTypeAny, {
            value: number;
            time: number;
            inTangent?: number | undefined;
            outTangent?: number | undefined;
            weightedMode?: "None" | "In" | "Out" | "Both" | undefined;
        }, {
            value: number;
            time: number;
            inTangent?: number | undefined;
            outTangent?: number | undefined;
            weightedMode?: "None" | "In" | "Out" | "Both" | undefined;
        }>, "many">;
        preWrapMode: z.ZodDefault<z.ZodEnum<["Once", "Loop", "PingPong", "ClampForever"]>>;
        postWrapMode: z.ZodDefault<z.ZodEnum<["Once", "Loop", "PingPong", "ClampForever"]>>;
        createIfNotExists: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        animationClipPath: string;
        createIfNotExists: boolean;
        propertyPath: string;
        targetType: string;
        keyframes: {
            value: number;
            time: number;
            inTangent?: number | undefined;
            outTangent?: number | undefined;
            weightedMode?: "None" | "In" | "Out" | "Both" | undefined;
        }[];
        preWrapMode: "Once" | "Loop" | "PingPong" | "ClampForever";
        postWrapMode: "Once" | "Loop" | "PingPong" | "ClampForever";
    }, {
        animationClipPath: string;
        propertyPath: string;
        targetType: string;
        keyframes: {
            value: number;
            time: number;
            inTangent?: number | undefined;
            outTangent?: number | undefined;
            weightedMode?: "None" | "In" | "Out" | "Both" | undefined;
        }[];
        createIfNotExists?: boolean | undefined;
        preWrapMode?: "Once" | "Loop" | "PingPong" | "ClampForever" | undefined;
        postWrapMode?: "Once" | "Loop" | "PingPong" | "ClampForever" | undefined;
    }>;
    get category(): string;
    protected beforeExecute(args: any): Promise<void>;
    protected formatSuccessResponse(result: any): CallToolResult;
    protected formatErrorResponse(error: any): CallToolResult;
}
