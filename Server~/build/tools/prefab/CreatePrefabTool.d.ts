import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * CreatePrefab Tool
 * Creates a prefab from GameObject
 */
export declare class CreatePrefabTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodEffects<z.ZodObject<{
        instanceId: z.ZodOptional<z.ZodNumber>;
        gameObjectPath: z.ZodOptional<z.ZodString>;
        prefabName: z.ZodString;
        savePath: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        componentName: z.ZodOptional<z.ZodString>;
        fieldValues: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        overwrite: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        savePath: string;
        prefabName: string;
        overwrite: boolean;
        instanceId?: number | undefined;
        gameObjectPath?: string | undefined;
        componentName?: string | undefined;
        fieldValues?: Record<string, any> | undefined;
    }, {
        prefabName: string;
        savePath?: string | undefined;
        instanceId?: number | undefined;
        gameObjectPath?: string | undefined;
        componentName?: string | undefined;
        fieldValues?: Record<string, any> | undefined;
        overwrite?: boolean | undefined;
    }>, {
        savePath: string;
        prefabName: string;
        overwrite: boolean;
        instanceId?: number | undefined;
        gameObjectPath?: string | undefined;
        componentName?: string | undefined;
        fieldValues?: Record<string, any> | undefined;
    }, {
        prefabName: string;
        savePath?: string | undefined;
        instanceId?: number | undefined;
        gameObjectPath?: string | undefined;
        componentName?: string | undefined;
        fieldValues?: Record<string, any> | undefined;
        overwrite?: boolean | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
