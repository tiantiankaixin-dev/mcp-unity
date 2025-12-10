import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for set_lightmap_static tool
 */
const SetLightmapStaticToolArgsSchema = z.object({
  instanceIds: z.array(z.number().int()).min(1).describe('Array of GameObject instance IDs to set lightmap static flag on'),
  isStatic: z.boolean().optional().default(true).describe('Whether to enable lightmap static flag. Default: true'),
  includeChildren: z.boolean().optional().default(false).describe('Whether to apply to children recursively. Default: false')
});

/**
 * SetLightmapStatic Tool
 * Sets GameObject as lightmap static
 */
@Tool({
  name: 'set_lightmap_static',
  description: 'Sets GameObject as lightmap static',
  category: 'lighting',
  version: '1.0.0'
})
@Tags(['unity', 'lighting', 'static'])
export class SetLightmapStaticTool extends BaseTool {
  get name() {
    return 'set_lightmap_static';
  }

  get description() {
    return 'Sets GameObject as lightmap static';
  }

  get inputSchema() {
    return SetLightmapStaticToolArgsSchema;
  }

  get category() {
    return 'lighting';
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
