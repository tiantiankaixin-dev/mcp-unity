import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * GetConsoleLogs Tool
 * Gets console logs
 */
export declare class GetConsoleLogsTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
