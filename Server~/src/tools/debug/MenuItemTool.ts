import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for menu_item tool
 */
const MenuItemToolArgsSchema = z.object({
  menuPath: z.string().optional().describe('Path to the menu item to execute. Example: "Assets/Refresh"')
});

/**
 * MenuItem Tool
 * Executes a menu item
 */
@Tool({
  name: 'menu_item',
  description: 'Executes a menu item',
  category: 'debug',
  version: '1.0.0'
})
@Tags(['unity', 'debug', 'menu'])
export class MenuItemTool extends BaseTool {
  get name() {
    return 'menu_item';
  }

  get description() {
    return 'Executes a menu item';
  }

  get inputSchema() {
    return MenuItemToolArgsSchema;
  }

  get category() {
    return 'debug';
  }

  protected formatSuccessResponse(result: any): CallToolResult {
    return {
      content: [{
        type: 'text',
        text: `✅ ${result.message || 'Operation completed successfully'}`
      }]
    };
  }
}
