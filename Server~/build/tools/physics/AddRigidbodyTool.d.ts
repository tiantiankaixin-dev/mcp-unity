import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * AddRigidbody Tool
 * Adds Rigidbody component to GameObject
 */
export declare class AddRigidbodyTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        instanceIds: z.ZodArray<z.ZodNumber, "many">;
        mass: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        drag: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        useGravity: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        isKinematic: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        instanceIds: number[];
        mass: number;
        drag: number;
        useGravity: boolean;
        isKinematic: boolean;
    }, {
        instanceIds: number[];
        mass?: number | undefined;
        drag?: number | undefined;
        useGravity?: boolean | undefined;
        isKinematic?: boolean | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
