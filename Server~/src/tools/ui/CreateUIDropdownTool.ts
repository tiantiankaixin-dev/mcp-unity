import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for create_ui_dropdown tool
 */
const CreateUIDropdownToolArgsSchema = z.object({
  dropdownName: z.string().optional().default('Dropdown').describe('Name for the Dropdown GameObject. Default: "Dropdown"'),
  posX: z.number().optional().default(0).describe('X position in canvas space. Default: 0'),
  posY: z.number().optional().default(0).describe('Y position in canvas space. Default: 0'),
  width: z.number().optional().default(160).describe('Width of the dropdown. Default: 160'),
  height: z.number().optional().default(30).describe('Height of the dropdown. Default: 30'),
  options: z.array(z.string()).optional().describe('Array of dropdown options. Example: ["Option 1", "Option 2", "Option 3"]')
});

/**
 * CreateUIDropdown Tool
 * Creates a UI Dropdown
 */
@Tool({
  name: 'create_ui_dropdown',
  description: 'Creates a UI Dropdown',
  category: 'ui',
  version: '1.0.0'
})
@Tags(['unity', 'ui', 'dropdown'])
export class CreateUIDropdownTool extends BaseTool {
  get name() {
    return 'create_ui_dropdown';
  }

  get description() {
    return 'Creates a UI Dropdown';
  }

  get inputSchema() {
    return CreateUIDropdownToolArgsSchema;
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
