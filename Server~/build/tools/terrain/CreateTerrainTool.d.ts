import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * CreateTerrain Tool
 * Creates a terrain
 */
export declare class CreateTerrainTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        terrainName: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        width: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        length: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        height: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        position: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        posX: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        posY: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        posZ: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        length: number;
        posX: number;
        posY: number;
        posZ: number;
        width: number;
        height: number;
        terrainName: string;
        position?: number[] | undefined;
    }, {
        length?: number | undefined;
        position?: number[] | undefined;
        posX?: number | undefined;
        posY?: number | undefined;
        posZ?: number | undefined;
        width?: number | undefined;
        height?: number | undefined;
        terrainName?: string | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
