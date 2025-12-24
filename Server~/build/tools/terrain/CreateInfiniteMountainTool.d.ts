import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * CreateInfiniteMountain Tool
 * Creates an infinite procedural mountain terrain that generates dynamically as the player moves.
 */
export declare class CreateInfiniteMountainTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        terrainName: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        chunkSize: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        terrainHeight: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        viewDistance: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        mountainScale: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        detailScale: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        ridgeIntensity: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        seed: z.ZodOptional<z.ZodNumber>;
        position: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        posX: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        posY: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        posZ: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        createViewer: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        posX: number;
        posY: number;
        posZ: number;
        terrainName: string;
        chunkSize: number;
        terrainHeight: number;
        viewDistance: number;
        mountainScale: number;
        detailScale: number;
        ridgeIntensity: number;
        createViewer: boolean;
        position?: number[] | undefined;
        seed?: number | undefined;
    }, {
        position?: number[] | undefined;
        posX?: number | undefined;
        posY?: number | undefined;
        posZ?: number | undefined;
        terrainName?: string | undefined;
        chunkSize?: number | undefined;
        terrainHeight?: number | undefined;
        viewDistance?: number | undefined;
        mountainScale?: number | undefined;
        detailScale?: number | undefined;
        ridgeIntensity?: number | undefined;
        seed?: number | undefined;
        createViewer?: boolean | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
