import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * CreateAudioSource Tool
 * Creates an Audio Source
 */
export declare class CreateAudioSourceTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        targetInstanceId: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        audioClipPath: z.ZodOptional<z.ZodString>;
        volume: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        loop: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        playOnAwake: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        targetInstanceId: number;
        volume: number;
        loop: boolean;
        playOnAwake: boolean;
        audioClipPath?: string | undefined;
    }, {
        targetInstanceId?: number | undefined;
        audioClipPath?: string | undefined;
        volume?: number | undefined;
        loop?: boolean | undefined;
        playOnAwake?: boolean | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
