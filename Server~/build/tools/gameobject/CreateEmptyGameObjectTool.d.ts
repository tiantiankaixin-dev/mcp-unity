import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
export declare class CreateEmptyGameObjectTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        objectName: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        position: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        posX: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        posY: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        posZ: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        parentInstanceId: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        posX: number;
        posY: number;
        posZ: number;
        objectName: string;
        position?: number[] | undefined;
        parentInstanceId?: number | undefined;
    }, {
        position?: number[] | undefined;
        posX?: number | undefined;
        posY?: number | undefined;
        posZ?: number | undefined;
        objectName?: string | undefined;
        parentInstanceId?: number | undefined;
    }>;
    get category(): string;
}
