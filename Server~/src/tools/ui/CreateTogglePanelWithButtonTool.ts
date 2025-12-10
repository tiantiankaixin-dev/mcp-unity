import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for create_toggle_panel_with_button tool
 */
const CreateTogglePanelWithButtonToolArgsSchema = z.object({
  panelName: z.string().optional().default('TogglePanel').describe('Name for the Panel GameObject. Default: "TogglePanel"'),
  buttonText: z.string().optional().default('Toggle Panel').describe('Text to display on the toggle button. Default: "Toggle Panel"'),
  panelPosX: z.number().optional().default(0).describe('X position of panel in canvas space. Default: 0'),
  panelPosY: z.number().optional().default(0).describe('Y position of panel in canvas space. Default: 0'),
  panelWidth: z.number().optional().default(400).describe('Width of the panel. Default: 400'),
  panelHeight: z.number().optional().default(300).describe('Height of the panel. Default: 300'),
  panelColor: z.string().optional().default('#333333D9').describe('Panel color in hex format with alpha. Default: "#333333D9" (dark gray, 85% opacity)'),
  buttonPosX: z.number().optional().default(0).describe('X position of button in canvas space. Default: 0'),
  buttonPosY: z.number().optional().default(200).describe('Y position of button in canvas space. Default: 200'),
  buttonWidth: z.number().optional().default(160).describe('Width of the button. Default: 160'),
  buttonHeight: z.number().optional().default(40).describe('Height of the button. Default: 40'),
  panelInitiallyActive: z.boolean().optional().default(true).describe('Whether the panel should be initially visible. Default: true')
});

/**
 * CreateTogglePanelWithButton Tool
 * Creates a dark gray semi-transparent panel with a button that toggles its visibility
 */
@Tool({
  name: 'create_toggle_panel_with_button',
  description: 'Creates a dark gray semi-transparent panel with a button that toggles its visibility',
  category: 'ui',
  version: '1.0.0'
})
@Tags(['unity', 'ui', 'panel', 'button', 'toggle'])
export class CreateTogglePanelWithButtonTool extends BaseTool {
  get name() {
    return 'create_toggle_panel_with_button';
  }

  get description() {
    return 'Creates a dark gray semi-transparent panel with a button that toggles its visibility';
  }

  get inputSchema() {
    return CreateTogglePanelWithButtonToolArgsSchema;
  }

  get category() {
    return 'ui';
  }

  protected formatSuccessResponse(result: any): CallToolResult {
    return {
      content: [{
        type: 'text',
        text: `✅ ${result.message || 'Operation completed successfully'}\n` +
              `Panel: ${result.panelName} (ID: ${result.panelInstanceId})\n` +
              `Button: ${result.buttonText} (ID: ${result.buttonInstanceId})\n` +
              `Click the button to toggle panel visibility.`
      }]
    };
  }
}

