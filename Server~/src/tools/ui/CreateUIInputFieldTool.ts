import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for create_ui_input_field tool
 */
const CreateUIInputFieldToolArgsSchema = z.object({
  inputFieldName: z.string().optional().default('InputField').describe('Name for the InputField GameObject. Default: "InputField"'),
  posX: z.number().optional().default(0).describe('X position in canvas space. Default: 0'),
  posY: z.number().optional().default(0).describe('Y position in canvas space. Default: 0'),
  width: z.number().optional().default(200).describe('Width of the input field. Default: 200'),
  height: z.number().optional().default(30).describe('Height of the input field. Default: 30'),
  placeholder: z.string().optional().default('Enter text...').describe('Placeholder text. Default: "Enter text..."')
});

/**
 * CreateUIInputField Tool
 * Creates a UI Input Field
 */
@Tool({
  name: 'create_ui_input_field',
  description: 'Creates a UI Input Field',
  category: 'ui',
  version: '1.0.0'
})
@Tags(['unity', 'ui', 'input'])
export class CreateUIInputFieldTool extends BaseTool {
  get name() {
    return 'create_ui_input_field';
  }

  get description() {
    return 'Creates a UI Input Field';
  }

  get inputSchema() {
    return CreateUIInputFieldToolArgsSchema;
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
