import { z } from 'zod';
import { DataTool } from '../base/BaseTool.js';
export declare class GetToolNamesTool extends DataTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        category: z.ZodOptional<z.ZodString>;
        categories: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        category?: string | undefined;
        categories?: string[] | undefined;
    }, {
        category?: string | undefined;
        categories?: string[] | undefined;
    }>;
    get category(): string;
    protected execute(args: {
        category?: string;
        categories?: string[];
    }): Promise<any>;
}
