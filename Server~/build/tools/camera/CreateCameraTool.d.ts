import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * CreateCamera Tool
 * Creates a camera
 */
export declare class CreateCameraTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        cameraName: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        position: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        posX: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        posY: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        posZ: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        fov: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        isMainCamera: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        posX: number;
        posY: number;
        posZ: number;
        cameraName: string;
        fov: number;
        isMainCamera: boolean;
        position?: number[] | undefined;
    }, {
        position?: number[] | undefined;
        posX?: number | undefined;
        posY?: number | undefined;
        posZ?: number | undefined;
        cameraName?: string | undefined;
        fov?: number | undefined;
        isMainCamera?: boolean | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
