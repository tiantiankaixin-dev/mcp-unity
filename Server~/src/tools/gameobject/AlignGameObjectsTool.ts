import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for align_gameobjects tool
 */
const AlignGameObjectsToolArgsSchema = z.object({
  instanceIds: z
    .array(z.number().int())
    .min(2)
    .describe('Array of GameObject instance IDs to align (minimum 2 required)'),
  axis: z
    .enum(['X', 'Y', 'Z', 'x', 'y', 'z'])
    .default('Y')
    .describe('Axis along which to align the GameObjects (X, Y, or Z). Default: Y'),
  alignMode: z
    .enum(['min', 'max', 'center', 'average'])
    .default('min')
    .describe('Alignment mode: min (leftmost/bottom), max (rightmost/top), center (geometric center), average (average position). Default: min')
});

/**
 * AlignGameObjects Tool
 * Aligns multiple GameObjects
 */
@Tool({
  name: 'align_gameobjects',
  description: 'Aligns multiple GameObjects',
  category: 'gameobject',
  version: '1.0.0'
})
@Tags(['unity', 'gameobject', 'align'])
export class AlignGameObjectsTool extends BaseTool {
  get name() {
    return 'align_gameobjects';
  }

  get description() {
    return 'Aligns multiple GameObjects';
  }

  get inputSchema() {
    return AlignGameObjectsToolArgsSchema;
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
