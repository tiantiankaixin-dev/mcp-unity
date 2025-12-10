import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for snap_to_grid tool
 */
const SnapToGridToolArgsSchema = z.object({
  instanceIds: z
    .array(z.number().int())
    .min(1)
    .describe('Array of GameObject instance IDs to snap to grid'),
  gridSize: z
    .number()
    .optional()
    .default(1)
    .describe('Grid size for snapping. Default: 1')
});

/**
 * SnapToGrid Tool
 * Snaps GameObject to grid
 */
@Tool({
  name: 'snap_to_grid',
  description: 'Snaps GameObject to grid',
  category: 'gameobject',
  version: '1.0.0'
})
@Tags(['unity', 'gameobject', 'transform', 'snap'])
export class SnapToGridTool extends BaseTool {
  get name() {
    return 'snap_to_grid';
  }

  get description() {
    return 'Snaps GameObject to grid';
  }

  get inputSchema() {
    return SnapToGridToolArgsSchema;
  }

  get category() {
    return 'gameobject';
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
