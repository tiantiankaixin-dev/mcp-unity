import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * CreateCinemachineVirtualCamera Tool
 * Creates a Cinemachine Virtual Camera
 */
export declare class CreateCinemachineVirtualCameraTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        cameraName: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        position: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        posX: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        posY: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        posZ: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        priority: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        posX: number;
        posY: number;
        posZ: number;
        cameraName: string;
        priority: number;
        position?: number[] | undefined;
    }, {
        position?: number[] | undefined;
        posX?: number | undefined;
        posY?: number | undefined;
        posZ?: number | undefined;
        cameraName?: string | undefined;
        priority?: number | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
