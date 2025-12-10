import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * DeleteGameObject Tool
 * Deletes GameObjects from the scene with Undo support
 */
export declare class DeleteGameObjectTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        instanceIds: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        objectPath: z.ZodOptional<z.ZodString>;
        objectName: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        instanceIds?: number[] | undefined;
        objectPath?: string | undefined;
        objectName?: string | undefined;
    }, {
        instanceIds?: number[] | undefined;
        objectPath?: string | undefined;
        objectName?: string | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
