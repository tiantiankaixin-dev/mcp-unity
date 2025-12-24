import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for create_ui_slider tool
 */
const CreateUISliderToolArgsSchema = z.object({
  sliderName: z.string().optional().default('Slider').describe('Name for the Slider GameObject. Default: "Slider"'),
  position: z.array(z.number()).length(3).optional().describe('Position as [x, y, z]. Fallback to posX/posY/posZ if not provided'),
  posX: z.number().optional().default(0).describe('X position in canvas space. Default: 0'),
  posY: z.number().optional().default(0).describe('Y position in canvas space. Default: 0'),
  minValue: z.number().optional().default(0).describe('Minimum slider value. Default: 0'),
  maxValue: z.number().optional().default(1).describe('Maximum slider value. Default: 1'),
  defaultValue: z.number().optional().default(0.5).describe('Default slider value. Default: 0.5')
});

/**
 * CreateUISlider Tool
 * Creates a UI Slider
 */
@Tool({
  name: 'create_ui_slider',
  description: 'Creates a UI Slider',
  category: 'ui',
  version: '1.0.0'
})
@Tags(['unity', 'ui', 'slider'])
export class CreateUISliderTool extends BaseTool {
  get name() {
    return 'create_ui_slider';
  }

  get description() {
    return 'Creates a UI Slider';
  }

  get inputSchema() {
    return CreateUISliderToolArgsSchema;
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
