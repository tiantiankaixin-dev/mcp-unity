import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
export declare class SetParentTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        instanceIds: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        childInstanceId: z.ZodOptional<z.ZodNumber>;
        parentInstanceId: z.ZodOptional<z.ZodNumber>;
        parentPath: z.ZodOptional<z.ZodString>;
        worldPositionStays: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        worldPositionStays: boolean;
        instanceIds?: number[] | undefined;
        parentInstanceId?: number | undefined;
        childInstanceId?: number | undefined;
        parentPath?: string | undefined;
    }, {
        instanceIds?: number[] | undefined;
        parentInstanceId?: number | undefined;
        childInstanceId?: number | undefined;
        parentPath?: string | undefined;
        worldPositionStays?: boolean | undefined;
    }>;
    get category(): string;
}
