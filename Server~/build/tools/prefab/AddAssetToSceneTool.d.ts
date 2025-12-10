import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * AddAssetToScene Tool
 * Adds asset to scene
 */
export declare class AddAssetToSceneTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        assetPath: z.ZodOptional<z.ZodString>;
        guid: z.ZodOptional<z.ZodString>;
        position: z.ZodOptional<z.ZodObject<{
            x: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
            y: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
            z: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
            z: number;
        }, {
            x?: number | undefined;
            y?: number | undefined;
            z?: number | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        position?: {
            x: number;
            y: number;
            z: number;
        } | undefined;
        assetPath?: string | undefined;
        guid?: string | undefined;
    }, {
        position?: {
            x?: number | undefined;
            y?: number | undefined;
            z?: number | undefined;
        } | undefined;
        assetPath?: string | undefined;
        guid?: string | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
