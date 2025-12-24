import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
export declare class ConfigureRigidbodyTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodEffects<z.ZodObject<{
        instanceId: z.ZodOptional<z.ZodNumber>;
        gameObjectPath: z.ZodOptional<z.ZodString>;
        mass: z.ZodOptional<z.ZodNumber>;
        drag: z.ZodOptional<z.ZodNumber>;
        angularDrag: z.ZodOptional<z.ZodNumber>;
        useGravity: z.ZodOptional<z.ZodBoolean>;
        isKinematic: z.ZodOptional<z.ZodBoolean>;
        centerOfMass: z.ZodOptional<z.ZodObject<{
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
        }>>;
        constraints: z.ZodOptional<z.ZodArray<z.ZodEnum<["None", "FreezePositionX", "FreezePositionY", "FreezePositionZ", "FreezeRotationX", "FreezeRotationY", "FreezeRotationZ", "FreezePosition", "FreezeRotation", "FreezeAll"]>, "many">>;
        collisionDetectionMode: z.ZodOptional<z.ZodEnum<["Discrete", "Continuous", "ContinuousDynamic", "ContinuousSpeculative"]>>;
        interpolation: z.ZodOptional<z.ZodEnum<["None", "Interpolate", "Extrapolate"]>>;
        maxAngularVelocity: z.ZodOptional<z.ZodNumber>;
        sleepThreshold: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        instanceId?: number | undefined;
        gameObjectPath?: string | undefined;
        mass?: number | undefined;
        drag?: number | undefined;
        useGravity?: boolean | undefined;
        isKinematic?: boolean | undefined;
        angularDrag?: number | undefined;
        centerOfMass?: {
            x: number;
            y: number;
            z: number;
        } | undefined;
        constraints?: ("None" | "FreezePositionX" | "FreezePositionY" | "FreezePositionZ" | "FreezeRotationX" | "FreezeRotationY" | "FreezeRotationZ" | "FreezePosition" | "FreezeRotation" | "FreezeAll")[] | undefined;
        collisionDetectionMode?: "Discrete" | "Continuous" | "ContinuousDynamic" | "ContinuousSpeculative" | undefined;
        interpolation?: "None" | "Interpolate" | "Extrapolate" | undefined;
        maxAngularVelocity?: number | undefined;
        sleepThreshold?: number | undefined;
    }, {
        instanceId?: number | undefined;
        gameObjectPath?: string | undefined;
        mass?: number | undefined;
        drag?: number | undefined;
        useGravity?: boolean | undefined;
        isKinematic?: boolean | undefined;
        angularDrag?: number | undefined;
        centerOfMass?: {
            x: number;
            y: number;
            z: number;
        } | undefined;
        constraints?: ("None" | "FreezePositionX" | "FreezePositionY" | "FreezePositionZ" | "FreezeRotationX" | "FreezeRotationY" | "FreezeRotationZ" | "FreezePosition" | "FreezeRotation" | "FreezeAll")[] | undefined;
        collisionDetectionMode?: "Discrete" | "Continuous" | "ContinuousDynamic" | "ContinuousSpeculative" | undefined;
        interpolation?: "None" | "Interpolate" | "Extrapolate" | undefined;
        maxAngularVelocity?: number | undefined;
        sleepThreshold?: number | undefined;
    }>, {
        instanceId?: number | undefined;
        gameObjectPath?: string | undefined;
        mass?: number | undefined;
        drag?: number | undefined;
        useGravity?: boolean | undefined;
        isKinematic?: boolean | undefined;
        angularDrag?: number | undefined;
        centerOfMass?: {
            x: number;
            y: number;
            z: number;
        } | undefined;
        constraints?: ("None" | "FreezePositionX" | "FreezePositionY" | "FreezePositionZ" | "FreezeRotationX" | "FreezeRotationY" | "FreezeRotationZ" | "FreezePosition" | "FreezeRotation" | "FreezeAll")[] | undefined;
        collisionDetectionMode?: "Discrete" | "Continuous" | "ContinuousDynamic" | "ContinuousSpeculative" | undefined;
        interpolation?: "None" | "Interpolate" | "Extrapolate" | undefined;
        maxAngularVelocity?: number | undefined;
        sleepThreshold?: number | undefined;
    }, {
        instanceId?: number | undefined;
        gameObjectPath?: string | undefined;
        mass?: number | undefined;
        drag?: number | undefined;
        useGravity?: boolean | undefined;
        isKinematic?: boolean | undefined;
        angularDrag?: number | undefined;
        centerOfMass?: {
            x: number;
            y: number;
            z: number;
        } | undefined;
        constraints?: ("None" | "FreezePositionX" | "FreezePositionY" | "FreezePositionZ" | "FreezeRotationX" | "FreezeRotationY" | "FreezeRotationZ" | "FreezePosition" | "FreezeRotation" | "FreezeAll")[] | undefined;
        collisionDetectionMode?: "Discrete" | "Continuous" | "ContinuousDynamic" | "ContinuousSpeculative" | undefined;
        interpolation?: "None" | "Interpolate" | "Extrapolate" | undefined;
        maxAngularVelocity?: number | undefined;
        sleepThreshold?: number | undefined;
    }>;
    get category(): string;
    protected beforeExecute(args: any): Promise<void>;
    protected formatSuccessResponse(result: any): CallToolResult;
    protected formatErrorResponse(error: any): CallToolResult;
}
