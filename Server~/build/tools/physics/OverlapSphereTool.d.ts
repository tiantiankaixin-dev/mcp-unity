import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
export declare class OverlapSphereTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        position: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
            z: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
            z: number;
        }, {
            x: number;
            y: number;
            z: number;
        }>;
        radius: z.ZodNumber;
        layerMask: z.ZodOptional<z.ZodString>;
        queryTriggerInteraction: z.ZodDefault<z.ZodEnum<["UseGlobal", "Ignore", "Collide"]>>;
        includeDetails: z.ZodDefault<z.ZodBoolean>;
        drawDebugSphere: z.ZodDefault<z.ZodBoolean>;
        debugSphereColor: z.ZodDefault<z.ZodString>;
        debugSphereDuration: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        position: {
            x: number;
            y: number;
            z: number;
        };
        queryTriggerInteraction: "UseGlobal" | "Ignore" | "Collide";
        radius: number;
        includeDetails: boolean;
        drawDebugSphere: boolean;
        debugSphereColor: string;
        debugSphereDuration: number;
        layerMask?: string | undefined;
    }, {
        position: {
            x: number;
            y: number;
            z: number;
        };
        radius: number;
        layerMask?: string | undefined;
        queryTriggerInteraction?: "UseGlobal" | "Ignore" | "Collide" | undefined;
        includeDetails?: boolean | undefined;
        drawDebugSphere?: boolean | undefined;
        debugSphereColor?: string | undefined;
        debugSphereDuration?: number | undefined;
    }>;
    get category(): string;
    protected beforeExecute(args: any): Promise<void>;
    protected formatSuccessResponse(result: any): CallToolResult;
    protected formatErrorResponse(error: any): CallToolResult;
}
