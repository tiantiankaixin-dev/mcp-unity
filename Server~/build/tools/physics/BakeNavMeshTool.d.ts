import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * BakeNavMesh Tool
 * Bakes NavMesh for navigation
 */
export declare class BakeNavMeshTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        agentRadius: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        agentHeight: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        maxSlope: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        stepHeight: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        agentRadius: number;
        agentHeight: number;
        maxSlope: number;
        stepHeight: number;
    }, {
        agentRadius?: number | undefined;
        agentHeight?: number | undefined;
        maxSlope?: number | undefined;
        stepHeight?: number | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
