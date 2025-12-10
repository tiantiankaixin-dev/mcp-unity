import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for generate_lod_group tool
 */
const GenerateLODGroupToolArgsSchema = z.object({
  instanceIds: z.array(z.number().int()).min(1).describe('Array of GameObject instance IDs to create LOD group from'),
  lodCount: z.number().int().optional().default(3).describe('Number of LOD levels (1-8). Default: 3')
});

/**
 * GenerateLODGroup Tool
 * Generates LOD Group
 */
@Tool({
  name: 'generate_lod_group',
  description: 'Generates LOD Group',
  category: 'asset',
  version: '1.0.0'
})
@Tags(['unity', 'asset', 'lod', 'optimization'])
export class GenerateLODGroupTool extends BaseTool {
  get name() {
    return 'generate_lod_group';
  }

  get description() {
    return 'Generates LOD Group';
  }

  get inputSchema() {
    return GenerateLODGroupToolArgsSchema;
  }

  get category() {
    return 'asset';
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
