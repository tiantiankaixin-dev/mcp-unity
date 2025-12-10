import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * SetPlayerSettings Tool
 * Sets player settings
 */
export declare class SetPlayerSettingsTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        companyName: z.ZodOptional<z.ZodString>;
        productName: z.ZodOptional<z.ZodString>;
        version: z.ZodOptional<z.ZodString>;
        defaultScreenWidth: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        defaultScreenHeight: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        fullscreen: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        defaultScreenWidth: number;
        defaultScreenHeight: number;
        fullscreen: boolean;
        version?: string | undefined;
        companyName?: string | undefined;
        productName?: string | undefined;
    }, {
        version?: string | undefined;
        companyName?: string | undefined;
        productName?: string | undefined;
        defaultScreenWidth?: number | undefined;
        defaultScreenHeight?: number | undefined;
        fullscreen?: boolean | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
