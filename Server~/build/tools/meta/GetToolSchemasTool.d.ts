import { z } from 'zod';
import { DataTool } from '../base/BaseTool.js';
export declare class GetToolSchemasTool extends DataTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        tools: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        tools: string[];
    }, {
        tools: string[];
    }>;
    get category(): string;
    protected execute(args: {
        tools: string[];
    }): Promise<any>;
}
