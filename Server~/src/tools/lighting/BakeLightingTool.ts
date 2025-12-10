import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for bake_lighting tool
 */
const BakeLightingToolArgsSchema = z.object({
  clearBakedData: z.boolean().optional().default(false).describe('Whether to clear existing baked data before baking. Default: false')
});

/**
 * BakeLighting Tool
 * Bakes lighting for the scene
 */
@Tool({
  name: 'bake_lighting',
  description: 'Bakes lighting for the scene',
  category: 'lighting',
  version: '1.0.0'
})
@Tags(['unity', 'lighting', 'bake'])
export class BakeLightingTool extends BaseTool {
  get name() {
    return 'bake_lighting';
  }

  get description() {
    return 'Bakes lighting for the scene';
  }

  get inputSchema() {
    return BakeLightingToolArgsSchema;
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
