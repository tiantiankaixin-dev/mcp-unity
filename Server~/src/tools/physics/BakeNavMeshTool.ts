import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for bake_navmesh tool
 */
const BakeNavMeshToolArgsSchema = z.object({
  agentRadius: z.number().optional().default(0.5).describe('Agent radius for NavMesh. Default: 0.5'),
  agentHeight: z.number().optional().default(2).describe('Agent height for NavMesh. Default: 2'),
  maxSlope: z.number().optional().default(45).describe('Maximum slope angle in degrees. Default: 45'),
  stepHeight: z.number().optional().default(0.4).describe('Maximum step height. Default: 0.4')
});

/**
 * BakeNavMesh Tool
 * Bakes NavMesh for navigation
 */
@Tool({
  name: 'bake_navmesh',
  description: 'Bakes NavMesh for navigation',
  category: 'physics',
  version: '1.0.0'
})
@Tags(['unity', 'physics', 'navmesh', 'bake'])
export class BakeNavMeshTool extends BaseTool {
  get name() {
    return 'bake_navmesh';
  }

  get description() {
    return 'Bakes NavMesh for navigation';
  }

  get inputSchema() {
    return BakeNavMeshToolArgsSchema;
  }

  get category() {
    return 'physics';
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
