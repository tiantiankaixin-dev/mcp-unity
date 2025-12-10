import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * SetComponentReference Tool
 * Sets a GameObject or Component reference on a component field using Unity's SerializedProperty
 */
export declare class SetComponentReferenceTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        targetObjectPath: z.ZodString;
        componentName: z.ZodString;
        fieldName: z.ZodString;
        referenceObjectPath: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        componentName: string;
        targetObjectPath: string;
        fieldName: string;
        referenceObjectPath: string;
    }, {
        componentName: string;
        targetObjectPath: string;
        fieldName: string;
        referenceObjectPath: string;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
