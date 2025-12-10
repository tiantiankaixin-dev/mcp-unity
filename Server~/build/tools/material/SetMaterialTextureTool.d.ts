import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * SetMaterialTexture Tool
 * Sets a texture on a material or GameObjects' materials
 */
export declare class SetMaterialTextureTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        texturePath: z.ZodString;
        materialPath: z.ZodOptional<z.ZodString>;
        instanceIds: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        propertyName: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        propertyName: string;
        texturePath: string;
        instanceIds?: number[] | undefined;
        materialPath?: string | undefined;
    }, {
        texturePath: string;
        instanceIds?: number[] | undefined;
        materialPath?: string | undefined;
        propertyName?: string | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
