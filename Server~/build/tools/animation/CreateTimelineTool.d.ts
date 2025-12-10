import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * CreateTimeline Tool
 * Creates a Timeline asset
 */
export declare class CreateTimelineTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        timelineName: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        savePath: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        createDirector: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        savePath: string;
        timelineName: string;
        createDirector: boolean;
    }, {
        savePath?: string | undefined;
        timelineName?: string | undefined;
        createDirector?: boolean | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
