import { z } from 'zod';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpUnity } from '../../unity/mcpUnity.js';
import { Logger } from '../../utils/logger.js';
import { McpUnityError, ErrorType } from '../../utils/errors.js';

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
@Tool({
  name: 'execute_menu_item',
  description: 'Executes a Unity menu item by path',
  category: 'menu',
  version: '1.0.0'
})
@Tags(['unity', 'editor', 'menu'])
export class ExecuteMenuItemTool extends BaseTool {
  get name(): string {
    return 'execute_menu_item';
  }

  get description(): string {
    return 'Executes a Unity menu item by path';
  }

  get category(): string {
    return 'menu';
  }

  get inputSchema() {
    return z.object({
      menuPath: z.string().describe('The path to the menu item to execute (e.g. "GameObject/Create Empty")')
    });
  }

  /**
   * Custom execution logic with enhanced error handling
   * Preserves the original behavior from the legacy implementation
   */
  protected async execute(args: any): Promise<CallToolResult> {
    try {
      // Validate arguments
      const validatedArgs = this.inputSchema.parse(args);
      const { menuPath } = validatedArgs;

      this.logger.debug(`Executing menu item: ${menuPath}`);

      // Send request to Unity
      const response = await this.mcpUnity.sendRequest({
        method: this.name,
        params: { menuPath }
      });

      // Check if execution was successful
      if (!response.success) {
        throw new McpUnityError(
          ErrorType.TOOL_EXECUTION,
          response.message || `Failed to execute menu item: ${menuPath}`
        );
      }

      // Return formatted response
      return {
        content: [{
          type: response.type || 'text',
          text: response.message || `Successfully executed menu item: ${menuPath}`
        }]
      };

    } catch (error: any) {
      this.logger.error(`Error in ${this.name}:`, error);
      
      // Preserve error type if it's already a McpUnityError
      if (error instanceof McpUnityError) {
        throw error;
      }
      
      return this.formatErrorResponse(error);
    }
  }
}

