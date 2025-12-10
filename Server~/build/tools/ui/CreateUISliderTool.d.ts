import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * CreateUISlider Tool
 * Creates a UI Slider
 */
export declare class CreateUISliderTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        sliderName: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        posX: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        posY: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        minValue: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        maxValue: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        defaultValue: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        posX: number;
        posY: number;
        defaultValue: number;
        sliderName: string;
        minValue: number;
        maxValue: number;
    }, {
        posX?: number | undefined;
        posY?: number | undefined;
        defaultValue?: number | undefined;
        sliderName?: string | undefined;
        minValue?: number | undefined;
        maxValue?: number | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
