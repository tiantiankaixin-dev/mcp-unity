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
  position: z.array(z.number()).length(2).optional().describe('Position as [x, y] in canvas space. Fallback to posX/posY if not provided'),
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
  color: z.array(z.number()).length(4).optional().default([0, 0, 0, 1]).describe('Text color as RGBA [r,g,b,a] (0-1). Default: [0,0,0,1] (black)')
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
