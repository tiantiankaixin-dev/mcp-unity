import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for create_ui_toggle tool
 */
const CreateUIToggleToolArgsSchema = z.object({
  toggleName: z.string().optional().default('Toggle').describe('Name for the Toggle GameObject. Default: "Toggle"'),
  posX: z.number().optional().default(0).describe('X position in canvas space. Default: 0'),
  posY: z.number().optional().default(0).describe('Y position in canvas space. Default: 0'),
  labelText: z.string().optional().default('Toggle').describe('Label text for the toggle. Default: "Toggle"'),
  isOn: z.boolean().optional().default(false).describe('Initial toggle state. Default: false')
});

/**
 * CreateUIToggle Tool
 * Creates a UI Toggle
 */
@Tool({
  name: 'create_ui_toggle',
  description: 'Creates a UI Toggle',
  category: 'ui',
  version: '1.0.0'
})
@Tags(['unity', 'ui', 'toggle'])
export class CreateUIToggleTool extends BaseTool {
  get name() {
    return 'create_ui_toggle';
  }

  get description() {
    return 'Creates a UI Toggle';
  }

  get inputSchema() {
    return CreateUIToggleToolArgsSchema;
  }

  get category() {
    return 'ui';
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
