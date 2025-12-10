import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * CreateEventSystem Tool
 * Creates an Event System
 */
export declare class CreateEventSystemTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
