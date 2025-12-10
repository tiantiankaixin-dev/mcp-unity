import { z } from 'zod';
import { GameObjectCreationTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for create_ui_button tool
 */
const CreateUIButtonToolArgsSchema = z.object({
  buttonText: z
    .string()
    .optional()
    .default('Button')
    .describe('Text to display on the button. Default: "Button"'),
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
  width: z
    .number()
    .optional()
    .default(160)
    .describe('Width of the button. Default: 160'),
  height: z
    .number()
    .optional()
    .default(30)
    .describe('Height of the button. Default: 30'),
  parentInstanceId: z
    .number()
    .int()
    .optional()
    .default(0)
    .describe('Instance ID of parent Canvas GameObject. If 0, will find or create Canvas. Default: 0')
});

/**
 * CreateUIButton Tool
 * Creates a UI Button
 */
@Tool({
  name: 'create_ui_button',
  description: 'Creates a UI Button',
  category: 'ui',
  version: '1.0.0'
})
@Tags(['unity', 'ui', 'button'])
export class CreateUIButtonTool extends GameObjectCreationTool {
  get name() {
    return 'create_ui_button';
  }

  get description() {
    return 'Creates a UI Button';
  }

  get inputSchema() {
    return CreateUIButtonToolArgsSchema;
  }

  get category() {
    return 'ui';
  }
  
  // GameObjectCreationTool base class handles formatSuccessResponse automatically
}
