import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
export declare class BlendAnimationsTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        animatorControllerPath: z.ZodString;
        blendTreeName: z.ZodString;
        blendType: z.ZodEnum<["1D", "2D_Simple_Directional", "2D_Freeform_Directional", "2D_Freeform_Cartesian", "Direct"]>;
        layerIndex: z.ZodDefault<z.ZodNumber>;
        parameter: z.ZodOptional<z.ZodString>;
        parameterX: z.ZodOptional<z.ZodString>;
        parameterY: z.ZodOptional<z.ZodString>;
        children: z.ZodArray<z.ZodObject<{
            animationClipPath: z.ZodString;
            threshold: z.ZodOptional<z.ZodNumber>;
            position: z.ZodOptional<z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>>;
            timeScale: z.ZodDefault<z.ZodNumber>;
            mirror: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            animationClipPath: string;
            mirror: boolean;
            timeScale: number;
            position?: {
                x: number;
                y: number;
            } | undefined;
            threshold?: number | undefined;
        }, {
            animationClipPath: string;
            position?: {
                x: number;
                y: number;
            } | undefined;
            mirror?: boolean | undefined;
            threshold?: number | undefined;
            timeScale?: number | undefined;
        }>, "many">;
        position: z.ZodOptional<z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
        }, {
            x: number;
            y: number;
        }>>;
        isDefaultState: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        animatorControllerPath: string;
        layerIndex: number;
        isDefaultState: boolean;
        blendTreeName: string;
        blendType: "1D" | "2D_Simple_Directional" | "2D_Freeform_Directional" | "2D_Freeform_Cartesian" | "Direct";
        children: {
            animationClipPath: string;
            mirror: boolean;
            timeScale: number;
            position?: {
                x: number;
                y: number;
            } | undefined;
            threshold?: number | undefined;
        }[];
        position?: {
            x: number;
            y: number;
        } | undefined;
        parameter?: string | undefined;
        parameterX?: string | undefined;
        parameterY?: string | undefined;
    }, {
        animatorControllerPath: string;
        blendTreeName: string;
        blendType: "1D" | "2D_Simple_Directional" | "2D_Freeform_Directional" | "2D_Freeform_Cartesian" | "Direct";
        children: {
            animationClipPath: string;
            position?: {
                x: number;
                y: number;
            } | undefined;
            mirror?: boolean | undefined;
            threshold?: number | undefined;
            timeScale?: number | undefined;
        }[];
        position?: {
            x: number;
            y: number;
        } | undefined;
        layerIndex?: number | undefined;
        isDefaultState?: boolean | undefined;
        parameter?: string | undefined;
        parameterX?: string | undefined;
        parameterY?: string | undefined;
    }>;
    get category(): string;
    protected beforeExecute(args: any): Promise<void>;
    protected formatSuccessResponse(result: any): CallToolResult;
    protected formatErrorResponse(error: any): CallToolResult;
}
