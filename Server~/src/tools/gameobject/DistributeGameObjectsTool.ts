import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for distribute_gameobjects tool
 */
const DistributeGameObjectsToolArgsSchema = z.object({
  instanceIds: z
    .array(z.number().int())
    .min(2)
    .describe('Array of GameObject instance IDs to distribute (minimum 2 required)'),
  axis: z
    .enum(['X', 'Y', 'Z', 'x', 'y', 'z'])
    .default('X')
    .describe('Axis along which to distribute the GameObjects (X, Y, or Z). Default: X'),
  spacing: z
    .number()
    .optional()
    .default(1.0)
    .describe('Spacing between GameObjects. Default: 1.0'),
  useWorldSpace: z
    .boolean()
    .optional()
    .default(true)
    .describe('Whether to use world space (true) or local space (false). Default: true')
});

/**
 * DistributeGameObjects Tool
 * Distributes GameObjects evenly
 */
@Tool({
  name: 'distribute_gameobjects',
  description: 'Distributes GameObjects evenly',
  category: 'gameobject',
  version: '1.0.0'
})
@Tags(['unity', 'gameobject', 'distribute'])
export class DistributeGameObjectsTool extends BaseTool {
  get name() {
    return 'distribute_gameobjects';
  }

  get description() {
    return 'Distributes GameObjects evenly';
  }

  get inputSchema() {
    return DistributeGameObjectsToolArgsSchema;
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
