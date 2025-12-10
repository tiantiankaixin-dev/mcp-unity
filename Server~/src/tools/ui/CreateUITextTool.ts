import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for create_ui_text tool
 */
const CreateUITextToolArgsSchema = z.object({
  text: z
    .string()
    .optional()
    .default('Text')
    .describe('Text content to display. Default: "Text"'),
  posX: z
    .number()
    .optional()
    .default(0)
    .describe('X position in canvas space. Default: 0'),
  posY: z
    .number()
    .optional()
    .default(0)
    .describe('Y position in canvas space. Default: 0'),
  fontSize: z
    .number()
    .int()
    .optional()
    .default(14)
    .describe('Font size. Default: 14'),
  color: z
    .string()
    .optional()
    .default('#000000')
    .describe('Text color in hex format. Example: "#000000". Default: "#000000"')
});

/**
 * CreateUIText Tool
 * Creates a UI Text element
 */
@Tool({
  name: 'create_ui_text',
  description: 'Creates a UI Text element',
  category: 'ui',
  version: '1.0.0'
})
@Tags(['unity', 'ui', 'text'])
export class CreateUITextTool extends BaseTool {
  get name() {
    return 'create_ui_text';
  }

  get description() {
    return 'Creates a UI Text element';
  }

  get inputSchema() {
    return CreateUITextToolArgsSchema;
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
