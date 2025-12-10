import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for optimize_mesh tool
 */
const OptimizeMeshToolArgsSchema = z.object({
  instanceIds: z.array(z.number().int()).min(1).describe('Array of GameObject instance IDs with MeshFilter components to optimize')
});

/**
 * OptimizeMesh Tool
 * Optimizes mesh
 */
@Tool({
  name: 'optimize_mesh',
  description: 'Optimizes mesh',
  category: 'asset',
  version: '1.0.0'
})
@Tags(['unity', 'asset', 'mesh', 'optimize'])
export class OptimizeMeshTool extends BaseTool {
  get name() {
    return 'optimize_mesh';
  }

  get description() {
    return 'Optimizes mesh';
  }

  get inputSchema() {
    return OptimizeMeshToolArgsSchema;
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
