import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
export declare class AddAnimationStateTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodEffects<z.ZodEffects<z.ZodObject<{
        animatorControllerPath: z.ZodOptional<z.ZodString>;
        controllerPath: z.ZodOptional<z.ZodString>;
        stateName: z.ZodString;
        animationClipPath: z.ZodOptional<z.ZodString>;
        clipPath: z.ZodOptional<z.ZodString>;
        layerIndex: z.ZodDefault<z.ZodNumber>;
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
        speed: z.ZodDefault<z.ZodNumber>;
        cycleOffset: z.ZodDefault<z.ZodNumber>;
        mirror: z.ZodDefault<z.ZodBoolean>;
        iKOnFeet: z.ZodDefault<z.ZodBoolean>;
        writeDefaultValues: z.ZodDefault<z.ZodBoolean>;
        tag: z.ZodOptional<z.ZodString>;
        isDefaultState: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        stateName: string;
        layerIndex: number;
        speed: number;
        cycleOffset: number;
        mirror: boolean;
        iKOnFeet: boolean;
        writeDefaultValues: boolean;
        isDefaultState: boolean;
        animationClipPath?: string | undefined;
        clipPath?: string | undefined;
        position?: {
            x: number;
            y: number;
        } | undefined;
        controllerPath?: string | undefined;
        animatorControllerPath?: string | undefined;
        tag?: string | undefined;
    }, {
        stateName: string;
        animationClipPath?: string | undefined;
        clipPath?: string | undefined;
        position?: {
            x: number;
            y: number;
        } | undefined;
        controllerPath?: string | undefined;
        animatorControllerPath?: string | undefined;
        layerIndex?: number | undefined;
        speed?: number | undefined;
        cycleOffset?: number | undefined;
        mirror?: boolean | undefined;
        iKOnFeet?: boolean | undefined;
        writeDefaultValues?: boolean | undefined;
        tag?: string | undefined;
        isDefaultState?: boolean | undefined;
    }>, {
        stateName: string;
        layerIndex: number;
        speed: number;
        cycleOffset: number;
        mirror: boolean;
        iKOnFeet: boolean;
        writeDefaultValues: boolean;
        isDefaultState: boolean;
        animationClipPath?: string | undefined;
        clipPath?: string | undefined;
        position?: {
            x: number;
            y: number;
        } | undefined;
        controllerPath?: string | undefined;
        animatorControllerPath?: string | undefined;
        tag?: string | undefined;
    }, {
        stateName: string;
        animationClipPath?: string | undefined;
        clipPath?: string | undefined;
        position?: {
            x: number;
            y: number;
        } | undefined;
        controllerPath?: string | undefined;
        animatorControllerPath?: string | undefined;
        layerIndex?: number | undefined;
        speed?: number | undefined;
        cycleOffset?: number | undefined;
        mirror?: boolean | undefined;
        iKOnFeet?: boolean | undefined;
        writeDefaultValues?: boolean | undefined;
        tag?: string | undefined;
        isDefaultState?: boolean | undefined;
    }>, {
        animatorControllerPath: string;
        animationClipPath: string | undefined;
        stateName: string;
        layerIndex: number;
        speed: number;
        cycleOffset: number;
        mirror: boolean;
        iKOnFeet: boolean;
        writeDefaultValues: boolean;
        isDefaultState: boolean;
        clipPath?: string | undefined;
        position?: {
            x: number;
            y: number;
        } | undefined;
        controllerPath?: string | undefined;
        tag?: string | undefined;
    }, {
        stateName: string;
        animationClipPath?: string | undefined;
        clipPath?: string | undefined;
        position?: {
            x: number;
            y: number;
        } | undefined;
        controllerPath?: string | undefined;
        animatorControllerPath?: string | undefined;
        layerIndex?: number | undefined;
        speed?: number | undefined;
        cycleOffset?: number | undefined;
        mirror?: boolean | undefined;
        iKOnFeet?: boolean | undefined;
        writeDefaultValues?: boolean | undefined;
        tag?: string | undefined;
        isDefaultState?: boolean | undefined;
    }>;
    get category(): string;
    protected beforeExecute(args: any): Promise<void>;
    protected formatSuccessResponse(result: any): CallToolResult;
    protected formatErrorResponse(error: any): CallToolResult;
}
