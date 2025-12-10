import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * CreateAnimationClip Tool
 * Creates a new animation clip
 */
export declare class CreateAnimationClipTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        clipName: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        savePath: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        length: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        looping: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        length: number;
        clipName: string;
        savePath: string;
        looping: boolean;
    }, {
        length?: number | undefined;
        clipName?: string | undefined;
        savePath?: string | undefined;
        looping?: boolean | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
