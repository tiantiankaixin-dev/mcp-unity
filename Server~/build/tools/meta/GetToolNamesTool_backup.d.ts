import { z } from 'zod';
import { DataTool } from '../base/BaseTool.js';
export declare class ListCategoriesTool extends DataTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
    get category(): string;
    protected execute(): Promise<any>;
}
