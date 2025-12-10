import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for create_ui_image tool
 */
const CreateUIImageToolArgsSchema = z.object({
  imageName: z
    .string()
    .optional()
    .default('Image')
    .describe('Name for the Image GameObject. Default: "Image"'),
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
    .default(100)
    .describe('Width of the image. Default: 100'),
  height: z
    .number()
    .optional()
    .default(100)
    .describe('Height of the image. Default: 100'),
  color: z
    .string()
    .optional()
    .default('#FFFFFF')
    .describe('Color in hex format. Example: "#FFFFFF". Default: "#FFFFFF"'),
  spritePath: z
    .string()
    .optional()
    .describe('Optional asset path to a sprite. Example: "Assets/Sprites/MySprite.png"')
});

/**
 * CreateUIImage Tool
 * Creates a UI Image
 */
@Tool({
  name: 'create_ui_image',
  description: 'Creates a UI Image',
  category: 'ui',
  version: '1.0.0'
})
@Tags(['unity', 'ui', 'image'])
export class CreateUIImageTool extends BaseTool {
  get name() {
    return 'create_ui_image';
  }

  get description() {
    return 'Creates a UI Image';
  }

  get inputSchema() {
    return CreateUIImageToolArgsSchema;
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
