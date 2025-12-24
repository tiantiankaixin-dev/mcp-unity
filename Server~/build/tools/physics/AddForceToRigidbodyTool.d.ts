import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
export declare class AddForceToRigidbodyTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodEffects<z.ZodObject<{
        instanceId: z.ZodOptional<z.ZodNumber>;
        gameObjectPath: z.ZodOptional<z.ZodString>;
        force: z.ZodObject<{
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
        forceMode: z.ZodDefault<z.ZodEnum<["Force", "Acceleration", "Impulse", "VelocityChange"]>>;
        forceType: z.ZodDefault<z.ZodEnum<["Force", "RelativeForce", "Torque", "RelativeTorque"]>>;
        position: z.ZodOptional<z.ZodObject<{
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
        wakeUp: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        force: {
            x: number;
            y: number;
            z: number;
        };
        forceMode: "Force" | "Acceleration" | "Impulse" | "VelocityChange";
        forceType: "Force" | "RelativeForce" | "Torque" | "RelativeTorque";
        wakeUp: boolean;
        position?: {
            x: number;
            y: number;
            z: number;
        } | undefined;
        instanceId?: number | undefined;
        gameObjectPath?: string | undefined;
    }, {
        force: {
            x: number;
            y: number;
            z: number;
        };
        position?: {
            x: number;
            y: number;
            z: number;
        } | undefined;
        instanceId?: number | undefined;
        gameObjectPath?: string | undefined;
        forceMode?: "Force" | "Acceleration" | "Impulse" | "VelocityChange" | undefined;
        forceType?: "Force" | "RelativeForce" | "Torque" | "RelativeTorque" | undefined;
        wakeUp?: boolean | undefined;
    }>, {
        force: {
            x: number;
            y: number;
            z: number;
        };
        forceMode: "Force" | "Acceleration" | "Impulse" | "VelocityChange";
        forceType: "Force" | "RelativeForce" | "Torque" | "RelativeTorque";
        wakeUp: boolean;
        position?: {
            x: number;
            y: number;
            z: number;
        } | undefined;
        instanceId?: number | undefined;
        gameObjectPath?: string | undefined;
    }, {
        force: {
            x: number;
            y: number;
            z: number;
        };
        position?: {
            x: number;
            y: number;
            z: number;
        } | undefined;
        instanceId?: number | undefined;
        gameObjectPath?: string | undefined;
        forceMode?: "Force" | "Acceleration" | "Impulse" | "VelocityChange" | undefined;
        forceType?: "Force" | "RelativeForce" | "Torque" | "RelativeTorque" | undefined;
        wakeUp?: boolean | undefined;
    }>;
    get category(): string;
    protected beforeExecute(args: any): Promise<void>;
    protected formatSuccessResponse(result: any): CallToolResult;
    protected formatErrorResponse(error: any): CallToolResult;
}
