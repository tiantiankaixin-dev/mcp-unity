import { z } from 'zod';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { BaseTool } from '../base/BaseTool.js';
/**
 * Tool for executing Unity Editor menu items
 *
 * Uses Unity's EditorApplication.ExecuteMenuItem API to invoke menu items by path.
 *
 * @see https://docs.unity3d.com/ScriptReference/EditorApplication.ExecuteMenuItem.html
 *
 * @example
 * // Create a cube
 * { menuPath: "GameObject/3D Object/Cube" }
 *
 * @example
 * // Create empty GameObject
 * { menuPath: "GameObject/Create Empty" }
 *
 * @category menu
 */
export declare class ExecuteMenuItemTool extends BaseTool {
    get name(): string;
    get description(): string;
    get category(): string;
    get inputSchema(): z.ZodObject<{
        menuPath: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        menuPath: string;
    }, {
        menuPath: string;
    }>;
    /**
     * Custom execution logic with enhanced error handling
     * Preserves the original behavior from the legacy implementation
     */
    protected execute(args: any): Promise<CallToolResult>;
}
