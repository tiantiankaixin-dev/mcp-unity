import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * OptimizeTextures Tool
 * Optimizes textures
 */
export declare class OptimizeTexturesTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        folderPath: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        maxSize: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        compressionFormat: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        generateMipmaps: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        folderPath: string;
        maxSize: number;
        compressionFormat: string;
        generateMipmaps: boolean;
    }, {
        folderPath?: string | undefined;
        maxSize?: number | undefined;
        compressionFormat?: string | undefined;
        generateMipmaps?: boolean | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
