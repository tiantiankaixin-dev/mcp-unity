import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
export declare class GetComponentsTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        instanceId: z.ZodOptional<z.ZodNumber>;
        objectPath: z.ZodOptional<z.ZodString>;
        includeChildren: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        includeChildren: boolean;
        instanceId?: number | undefined;
        objectPath?: string | undefined;
    }, {
        instanceId?: number | undefined;
        objectPath?: string | undefined;
        includeChildren?: boolean | undefined;
    }>;
    get category(): string;
}
