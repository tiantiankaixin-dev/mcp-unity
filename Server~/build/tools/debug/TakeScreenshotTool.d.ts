import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
export declare class TakeScreenshotTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        source: z.ZodDefault<z.ZodOptional<z.ZodEnum<["scene", "game"]>>>;
        width: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        height: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        saveToFile: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        folder: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        filename: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        folder: string;
        source: "scene" | "game";
        width: number;
        height: number;
        saveToFile: boolean;
        filename?: string | undefined;
    }, {
        folder?: string | undefined;
        source?: "scene" | "game" | undefined;
        width?: number | undefined;
        height?: number | undefined;
        saveToFile?: boolean | undefined;
        filename?: string | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
