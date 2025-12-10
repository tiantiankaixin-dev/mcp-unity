import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * AddNavMeshAgent Tool
 * Adds NavMesh Agent component
 */
export declare class AddNavMeshAgentTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        instanceIds: z.ZodArray<z.ZodNumber, "many">;
        speed: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        acceleration: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        stoppingDistance: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        instanceIds: number[];
        speed: number;
        acceleration: number;
        stoppingDistance: number;
    }, {
        instanceIds: number[];
        speed?: number | undefined;
        acceleration?: number | undefined;
        stoppingDistance?: number | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
