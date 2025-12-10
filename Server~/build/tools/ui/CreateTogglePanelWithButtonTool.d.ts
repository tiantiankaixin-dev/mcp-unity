import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
/**
 * CreateTogglePanelWithButton Tool
 * Creates a dark gray semi-transparent panel with a button that toggles its visibility
 */
export declare class CreateTogglePanelWithButtonTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        panelName: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        buttonText: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        panelPosX: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        panelPosY: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        panelWidth: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        panelHeight: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        panelColor: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        buttonPosX: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        buttonPosY: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        buttonWidth: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        buttonHeight: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        panelInitiallyActive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        buttonText: string;
        panelName: string;
        panelPosX: number;
        panelPosY: number;
        panelWidth: number;
        panelHeight: number;
        panelColor: string;
        buttonPosX: number;
        buttonPosY: number;
        buttonWidth: number;
        buttonHeight: number;
        panelInitiallyActive: boolean;
    }, {
        buttonText?: string | undefined;
        panelName?: string | undefined;
        panelPosX?: number | undefined;
        panelPosY?: number | undefined;
        panelWidth?: number | undefined;
        panelHeight?: number | undefined;
        panelColor?: string | undefined;
        buttonPosX?: number | undefined;
        buttonPosY?: number | undefined;
        buttonWidth?: number | undefined;
        buttonHeight?: number | undefined;
        panelInitiallyActive?: boolean | undefined;
    }>;
    get category(): string;
    protected formatSuccessResponse(result: any): CallToolResult;
}
