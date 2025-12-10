import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
export declare class FindGameObjectsTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        objectName: z.ZodOptional<z.ZodString>;
        tag: z.ZodOptional<z.ZodString>;
        layer: z.ZodOptional<z.ZodString>;
        componentType: z.ZodOptional<z.ZodString>;
        includeInactive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        maxResults: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        includeInactive: boolean;
        maxResults: number;
        tag?: string | undefined;
        componentType?: string | undefined;
        objectName?: string | undefined;
        layer?: string | undefined;
    }, {
        tag?: string | undefined;
        includeInactive?: boolean | undefined;
        componentType?: string | undefined;
        objectName?: string | undefined;
        layer?: string | undefined;
        maxResults?: number | undefined;
    }>;
    get category(): string;
}
