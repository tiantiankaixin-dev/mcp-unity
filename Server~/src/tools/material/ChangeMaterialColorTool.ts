import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for change_material_color tool
 */
const ChangeMaterialColorToolArgsSchema = z.object({
  instanceIds: z.array(z.number().int()).min(1).describe('Array of GameObject instance IDs to change material color'),
  color: z.array(z.number()).length(4).optional().default([1, 1, 1, 1]).describe('Color as RGBA [r,g,b,a] (0-1). Default: [1,1,1,1]'),
  propertyName: z.string().optional().default('_Color').describe('Material property name. Default: "_Color"')
});

/**
 * ChangeMaterialColor Tool
 * Changes material color
 */
@Tool({
  name: 'change_material_color',
  description: 'Changes material color. Params: instanceIds (array), color ([r,g,b,a] 0-1, e.g. [1,0,0,1] for red)',
  category: 'material',
  version: '1.0.0'
})
@Tags(['unity', 'material', 'color'])
export class ChangeMaterialColorTool extends BaseTool {
  get name() {
    return 'change_material_color';
  }

  get description() {
    return 'Changes material color. Params: instanceIds (array), color ([r,g,b,a] 0-1, e.g. [1,0,0,1] for red)';
  }

  get inputSchema() {
    return ChangeMaterialColorToolArgsSchema;
  }

  get category() {
    return 'material';
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
