import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
export declare class AddJointTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodEffects<z.ZodObject<{
        instanceId: z.ZodOptional<z.ZodNumber>;
        gameObjectPath: z.ZodOptional<z.ZodString>;
        jointType: z.ZodEnum<["FixedJoint", "HingeJoint", "SpringJoint", "CharacterJoint", "ConfigurableJoint"]>;
        connectedInstanceId: z.ZodOptional<z.ZodNumber>;
        connectedBodyPath: z.ZodOptional<z.ZodString>;
        anchor: z.ZodOptional<z.ZodObject<{
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
        connectedAnchor: z.ZodOptional<z.ZodObject<{
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
        axis: z.ZodOptional<z.ZodObject<{
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
        breakForce: z.ZodOptional<z.ZodNumber>;
        breakTorque: z.ZodOptional<z.ZodNumber>;
        hingeJoint: z.ZodOptional<z.ZodObject<{
            useMotor: z.ZodOptional<z.ZodBoolean>;
            motorTargetVelocity: z.ZodOptional<z.ZodNumber>;
            motorForce: z.ZodOptional<z.ZodNumber>;
            useLimits: z.ZodOptional<z.ZodBoolean>;
            minAngle: z.ZodOptional<z.ZodNumber>;
            maxAngle: z.ZodOptional<z.ZodNumber>;
            useSpring: z.ZodOptional<z.ZodBoolean>;
            springForce: z.ZodOptional<z.ZodNumber>;
            springDamper: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            useMotor?: boolean | undefined;
            motorTargetVelocity?: number | undefined;
            motorForce?: number | undefined;
            useLimits?: boolean | undefined;
            minAngle?: number | undefined;
            maxAngle?: number | undefined;
            useSpring?: boolean | undefined;
            springForce?: number | undefined;
            springDamper?: number | undefined;
        }, {
            useMotor?: boolean | undefined;
            motorTargetVelocity?: number | undefined;
            motorForce?: number | undefined;
            useLimits?: boolean | undefined;
            minAngle?: number | undefined;
            maxAngle?: number | undefined;
            useSpring?: boolean | undefined;
            springForce?: number | undefined;
            springDamper?: number | undefined;
        }>>;
        springJoint: z.ZodOptional<z.ZodObject<{
            spring: z.ZodOptional<z.ZodNumber>;
            damper: z.ZodOptional<z.ZodNumber>;
            minDistance: z.ZodOptional<z.ZodNumber>;
            maxDistance: z.ZodOptional<z.ZodNumber>;
            tolerance: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            spring?: number | undefined;
            damper?: number | undefined;
            minDistance?: number | undefined;
            maxDistance?: number | undefined;
            tolerance?: number | undefined;
        }, {
            spring?: number | undefined;
            damper?: number | undefined;
            minDistance?: number | undefined;
            maxDistance?: number | undefined;
            tolerance?: number | undefined;
        }>>;
        configurableJoint: z.ZodOptional<z.ZodObject<{
            xMotion: z.ZodOptional<z.ZodEnum<["Locked", "Limited", "Free"]>>;
            yMotion: z.ZodOptional<z.ZodEnum<["Locked", "Limited", "Free"]>>;
            zMotion: z.ZodOptional<z.ZodEnum<["Locked", "Limited", "Free"]>>;
            angularXMotion: z.ZodOptional<z.ZodEnum<["Locked", "Limited", "Free"]>>;
            angularYMotion: z.ZodOptional<z.ZodEnum<["Locked", "Limited", "Free"]>>;
            angularZMotion: z.ZodOptional<z.ZodEnum<["Locked", "Limited", "Free"]>>;
        }, "strip", z.ZodTypeAny, {
            xMotion?: "Locked" | "Limited" | "Free" | undefined;
            yMotion?: "Locked" | "Limited" | "Free" | undefined;
            zMotion?: "Locked" | "Limited" | "Free" | undefined;
            angularXMotion?: "Locked" | "Limited" | "Free" | undefined;
            angularYMotion?: "Locked" | "Limited" | "Free" | undefined;
            angularZMotion?: "Locked" | "Limited" | "Free" | undefined;
        }, {
            xMotion?: "Locked" | "Limited" | "Free" | undefined;
            yMotion?: "Locked" | "Limited" | "Free" | undefined;
            zMotion?: "Locked" | "Limited" | "Free" | undefined;
            angularXMotion?: "Locked" | "Limited" | "Free" | undefined;
            angularYMotion?: "Locked" | "Limited" | "Free" | undefined;
            angularZMotion?: "Locked" | "Limited" | "Free" | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        jointType: "FixedJoint" | "HingeJoint" | "SpringJoint" | "CharacterJoint" | "ConfigurableJoint";
        anchor?: {
            x: number;
            y: number;
            z: number;
        } | undefined;
        instanceId?: number | undefined;
        gameObjectPath?: string | undefined;
        axis?: {
            x: number;
            y: number;
            z: number;
        } | undefined;
        connectedInstanceId?: number | undefined;
        connectedBodyPath?: string | undefined;
        connectedAnchor?: {
            x: number;
            y: number;
            z: number;
        } | undefined;
        breakForce?: number | undefined;
        breakTorque?: number | undefined;
        hingeJoint?: {
            useMotor?: boolean | undefined;
            motorTargetVelocity?: number | undefined;
            motorForce?: number | undefined;
            useLimits?: boolean | undefined;
            minAngle?: number | undefined;
            maxAngle?: number | undefined;
            useSpring?: boolean | undefined;
            springForce?: number | undefined;
            springDamper?: number | undefined;
        } | undefined;
        springJoint?: {
            spring?: number | undefined;
            damper?: number | undefined;
            minDistance?: number | undefined;
            maxDistance?: number | undefined;
            tolerance?: number | undefined;
        } | undefined;
        configurableJoint?: {
            xMotion?: "Locked" | "Limited" | "Free" | undefined;
            yMotion?: "Locked" | "Limited" | "Free" | undefined;
            zMotion?: "Locked" | "Limited" | "Free" | undefined;
            angularXMotion?: "Locked" | "Limited" | "Free" | undefined;
            angularYMotion?: "Locked" | "Limited" | "Free" | undefined;
            angularZMotion?: "Locked" | "Limited" | "Free" | undefined;
        } | undefined;
    }, {
        jointType: "FixedJoint" | "HingeJoint" | "SpringJoint" | "CharacterJoint" | "ConfigurableJoint";
        anchor?: {
            x: number;
            y: number;
            z: number;
        } | undefined;
        instanceId?: number | undefined;
        gameObjectPath?: string | undefined;
        axis?: {
            x: number;
            y: number;
            z: number;
        } | undefined;
        connectedInstanceId?: number | undefined;
        connectedBodyPath?: string | undefined;
        connectedAnchor?: {
            x: number;
            y: number;
            z: number;
        } | undefined;
        breakForce?: number | undefined;
        breakTorque?: number | undefined;
        hingeJoint?: {
            useMotor?: boolean | undefined;
            motorTargetVelocity?: number | undefined;
            motorForce?: number | undefined;
            useLimits?: boolean | undefined;
            minAngle?: number | undefined;
            maxAngle?: number | undefined;
            useSpring?: boolean | undefined;
            springForce?: number | undefined;
            springDamper?: number | undefined;
        } | undefined;
        springJoint?: {
            spring?: number | undefined;
            damper?: number | undefined;
            minDistance?: number | undefined;
            maxDistance?: number | undefined;
            tolerance?: number | undefined;
        } | undefined;
        configurableJoint?: {
            xMotion?: "Locked" | "Limited" | "Free" | undefined;
            yMotion?: "Locked" | "Limited" | "Free" | undefined;
            zMotion?: "Locked" | "Limited" | "Free" | undefined;
            angularXMotion?: "Locked" | "Limited" | "Free" | undefined;
            angularYMotion?: "Locked" | "Limited" | "Free" | undefined;
            angularZMotion?: "Locked" | "Limited" | "Free" | undefined;
        } | undefined;
    }>, {
        jointType: "FixedJoint" | "HingeJoint" | "SpringJoint" | "CharacterJoint" | "ConfigurableJoint";
        anchor?: {
            x: number;
            y: number;
            z: number;
        } | undefined;
        instanceId?: number | undefined;
        gameObjectPath?: string | undefined;
        axis?: {
            x: number;
            y: number;
            z: number;
        } | undefined;
        connectedInstanceId?: number | undefined;
        connectedBodyPath?: string | undefined;
        connectedAnchor?: {
            x: number;
            y: number;
            z: number;
        } | undefined;
        breakForce?: number | undefined;
        breakTorque?: number | undefined;
        hingeJoint?: {
            useMotor?: boolean | undefined;
            motorTargetVelocity?: number | undefined;
            motorForce?: number | undefined;
            useLimits?: boolean | undefined;
            minAngle?: number | undefined;
            maxAngle?: number | undefined;
            useSpring?: boolean | undefined;
            springForce?: number | undefined;
            springDamper?: number | undefined;
        } | undefined;
        springJoint?: {
            spring?: number | undefined;
            damper?: number | undefined;
            minDistance?: number | undefined;
            maxDistance?: number | undefined;
            tolerance?: number | undefined;
        } | undefined;
        configurableJoint?: {
            xMotion?: "Locked" | "Limited" | "Free" | undefined;
            yMotion?: "Locked" | "Limited" | "Free" | undefined;
            zMotion?: "Locked" | "Limited" | "Free" | undefined;
            angularXMotion?: "Locked" | "Limited" | "Free" | undefined;
            angularYMotion?: "Locked" | "Limited" | "Free" | undefined;
            angularZMotion?: "Locked" | "Limited" | "Free" | undefined;
        } | undefined;
    }, {
        jointType: "FixedJoint" | "HingeJoint" | "SpringJoint" | "CharacterJoint" | "ConfigurableJoint";
        anchor?: {
            x: number;
            y: number;
            z: number;
        } | undefined;
        instanceId?: number | undefined;
        gameObjectPath?: string | undefined;
        axis?: {
            x: number;
            y: number;
            z: number;
        } | undefined;
        connectedInstanceId?: number | undefined;
        connectedBodyPath?: string | undefined;
        connectedAnchor?: {
            x: number;
            y: number;
            z: number;
        } | undefined;
        breakForce?: number | undefined;
        breakTorque?: number | undefined;
        hingeJoint?: {
            useMotor?: boolean | undefined;
            motorTargetVelocity?: number | undefined;
            motorForce?: number | undefined;
            useLimits?: boolean | undefined;
            minAngle?: number | undefined;
            maxAngle?: number | undefined;
            useSpring?: boolean | undefined;
            springForce?: number | undefined;
            springDamper?: number | undefined;
        } | undefined;
        springJoint?: {
            spring?: number | undefined;
            damper?: number | undefined;
            minDistance?: number | undefined;
            maxDistance?: number | undefined;
            tolerance?: number | undefined;
        } | undefined;
        configurableJoint?: {
            xMotion?: "Locked" | "Limited" | "Free" | undefined;
            yMotion?: "Locked" | "Limited" | "Free" | undefined;
            zMotion?: "Locked" | "Limited" | "Free" | undefined;
            angularXMotion?: "Locked" | "Limited" | "Free" | undefined;
            angularYMotion?: "Locked" | "Limited" | "Free" | undefined;
            angularZMotion?: "Locked" | "Limited" | "Free" | undefined;
        } | undefined;
    }>;
    get category(): string;
    protected beforeExecute(args: any): Promise<void>;
    protected formatSuccessResponse(result: any): CallToolResult;
    protected formatErrorResponse(error: any): CallToolResult;
}
