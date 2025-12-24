import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for create_ui_scroll_view tool
 */
const CreateUIScrollViewToolArgsSchema = z.object({
  scrollViewName: z.string().optional().default('ScrollView').describe('Name for the ScrollView GameObject. Default: "ScrollView"'),
  position: z.array(z.number()).length(3).optional().describe('Position as [x, y, z]. Fallback to posX/posY/posZ if not provided'),
  posX: z.number().optional().default(0).describe('X position in canvas space. Default: 0'),
  posY: z.number().optional().default(0).describe('Y position in canvas space. Default: 0'),
  width: z.number().optional().default(300).describe('Width of the scroll view. Default: 300'),
  height: z.number().optional().default(200).describe('Height of the scroll view. Default: 200')
});

/**
 * CreateUIScrollView Tool
 * Creates a UI Scroll View
 */
@Tool({
  name: 'create_ui_scroll_view',
  description: 'Creates a UI Scroll View',
  category: 'ui',
  version: '1.0.0'
})
@Tags(['unity', 'ui', 'scrollview'])
export class CreateUIScrollViewTool extends BaseTool {
  get name() {
    return 'create_ui_scroll_view';
  }

  get description() {
    return 'Creates a UI Scroll View';
  }

  get inputSchema() {
    return CreateUIScrollViewToolArgsSchema;
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
