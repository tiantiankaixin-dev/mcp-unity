import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for apply_material tool
 */
const ApplyMaterialToolArgsSchema = z.object({
  instanceIds: z.array(z.number().int()).min(1).describe('Array of GameObject instance IDs to apply material to'),
  materialPath: z.string().describe('Asset path to the material. Example: "Assets/Materials/MyMaterial.mat"')
});

/**
 * ApplyMaterial Tool
 * Applies material to GameObject
 */
@Tool({
  name: 'apply_material',
  description: 'Applies material to GameObject',
  category: 'material',
  version: '1.0.0'
})
@Tags(['unity', 'material', 'apply'])
export class ApplyMaterialTool extends BaseTool {
  get name() {
    return 'apply_material';
  }

  get description() {
    return 'Applies material to GameObject';
  }

  get inputSchema() {
    return ApplyMaterialToolArgsSchema;
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
