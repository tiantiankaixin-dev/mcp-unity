import { z } from 'zod';
import { GameObjectCreationTool } from '../base/BaseTool.js';
/**
 * CreateUIButton Tool
 * Creates a UI Button
 */
export declare class CreateUIButtonTool extends GameObjectCreationTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        buttonText: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        posX: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        posY: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        width: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        height: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        parentInstanceId: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        posX: number;
        posY: number;
        width: number;
        height: number;
        parentInstanceId: number;
        buttonText: string;
    }, {
        posX?: number | undefined;
        posY?: number | undefined;
        width?: number | undefined;
        height?: number | undefined;
        parentInstanceId?: number | undefined;
        buttonText?: string | undefined;
    }>;
    get category(): string;
}
