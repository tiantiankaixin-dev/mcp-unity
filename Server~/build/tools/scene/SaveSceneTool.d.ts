import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
export declare class SaveSceneTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        saveAll: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        savePath: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        saveAll: boolean;
        savePath?: string | undefined;
    }, {
        savePath?: string | undefined;
        saveAll?: boolean | undefined;
    }>;
    get category(): string;
}
