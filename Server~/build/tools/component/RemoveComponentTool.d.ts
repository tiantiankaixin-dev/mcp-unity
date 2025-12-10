import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
export declare class RemoveComponentTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        instanceId: z.ZodOptional<z.ZodNumber>;
        objectPath: z.ZodOptional<z.ZodString>;
        componentType: z.ZodString;
        removeAll: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        componentType: string;
        removeAll: boolean;
        instanceId?: number | undefined;
        objectPath?: string | undefined;
    }, {
        componentType: string;
        instanceId?: number | undefined;
        objectPath?: string | undefined;
        removeAll?: boolean | undefined;
    }>;
    get category(): string;
}
