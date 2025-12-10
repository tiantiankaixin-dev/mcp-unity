import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
export declare class RaycastTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        origin: z.ZodObject<{
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
        direction: z.ZodObject<{
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
        maxDistance: z.ZodDefault<z.ZodNumber>;
        layerMask: z.ZodOptional<z.ZodString>;
        queryTriggerInteraction: z.ZodDefault<z.ZodEnum<["UseGlobal", "Ignore", "Collide"]>>;
        returnAllHits: z.ZodDefault<z.ZodBoolean>;
        drawDebugRay: z.ZodDefault<z.ZodBoolean>;
        debugRayColor: z.ZodDefault<z.ZodString>;
        debugRayDuration: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        maxDistance: number;
        origin: {
            x: number;
            y: number;
            z: number;
        };
        direction: {
            x: number;
            y: number;
            z: number;
        };
        queryTriggerInteraction: "UseGlobal" | "Ignore" | "Collide";
        returnAllHits: boolean;
        drawDebugRay: boolean;
        debugRayColor: string;
        debugRayDuration: number;
        layerMask?: string | undefined;
    }, {
        origin: {
            x: number;
            y: number;
            z: number;
        };
        direction: {
            x: number;
            y: number;
            z: number;
        };
        maxDistance?: number | undefined;
        layerMask?: string | undefined;
        queryTriggerInteraction?: "UseGlobal" | "Ignore" | "Collide" | undefined;
        returnAllHits?: boolean | undefined;
        drawDebugRay?: boolean | undefined;
        debugRayColor?: string | undefined;
        debugRayDuration?: number | undefined;
    }>;
    get category(): string;
    protected beforeExecute(args: any): Promise<void>;
    protected formatSuccessResponse(result: any): CallToolResult;
    protected formatErrorResponse(error: any): CallToolResult;
}
