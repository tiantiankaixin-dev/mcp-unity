import { z } from 'zod';
import { GameObjectCreationTool } from '../base/BaseTool.js';
/**
 * CreatePrimitiveObject Tool
 * Creates primitive GameObject (Cube, Sphere, etc.)
 */
export declare class CreatePrimitiveObjectTool extends GameObjectCreationTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        primitiveType: z.ZodDefault<z.ZodEnum<["cube", "sphere", "capsule", "cylinder", "plane", "quad"]>>;
        objectName: z.ZodOptional<z.ZodString>;
        posX: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        posY: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        posZ: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        posX: number;
        posY: number;
        posZ: number;
        primitiveType: "cube" | "sphere" | "capsule" | "cylinder" | "plane" | "quad";
        objectName?: string | undefined;
    }, {
        posX?: number | undefined;
        posY?: number | undefined;
        posZ?: number | undefined;
        objectName?: string | undefined;
        primitiveType?: "cube" | "sphere" | "capsule" | "cylinder" | "plane" | "quad" | undefined;
    }>;
    get category(): string;
}
