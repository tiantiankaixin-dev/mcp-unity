import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * SetActiveState Tool
 * Sets GameObject active/inactive state
 */
export declare class SetActiveStateTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodEffects<z.ZodEffects<z.ZodObject<{
        instanceIds: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        instanceId: z.ZodOptional<z.ZodNumber>;
        active: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        active: boolean;
        instanceIds?: number[] | undefined;
        instanceId?: number | undefined;
    }, {
        instanceIds?: number[] | undefined;
        instanceId?: number | undefined;
        active?: boolean | undefined;
    }>, {
        active: boolean;
        instanceIds?: number[] | undefined;
        instanceId?: number | undefined;
    }, {
        instanceIds?: number[] | undefined;
        instanceId?: number | undefined;
        active?: boolean | undefined;
    }>, {
        instanceIds: number[];
        active: boolean;
    }, {
        instanceIds?: number[] | undefined;
        instanceId?: number | undefined;
        active?: boolean | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
