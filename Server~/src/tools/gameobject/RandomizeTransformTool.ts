import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for randomize_transform tool
 */
const RandomizeTransformToolArgsSchema = z.object({
  instanceIds: z
    .array(z.number().int())
    .min(1)
    .describe('Array of GameObject instance IDs to randomize'),
  randomizePosition: z
    .boolean()
    .optional()
    .default(false)
    .describe('Whether to randomize position. Default: false'),
  randomizeRotation: z
    .boolean()
    .optional()
    .default(false)
    .describe('Whether to randomize rotation. Default: false'),
  randomizeScale: z
    .boolean()
    .optional()
    .default(false)
    .describe('Whether to randomize scale. Default: false'),
  positionRange: z
    .number()
    .optional()
    .default(5)
    .describe('Range for position randomization (±range). Default: 5'),
  rotationRange: z
    .number()
    .optional()
    .default(360)
    .describe('Range for rotation randomization (0-range degrees). Default: 360'),
  scaleMin: z
    .number()
    .optional()
    .default(0.5)
    .describe('Minimum scale multiplier. Default: 0.5'),
  scaleMax: z
    .number()
    .optional()
    .default(2)
    .describe('Maximum scale multiplier. Default: 2')
});

/**
 * RandomizeTransform Tool
 * Randomizes GameObject transform
 */
@Tool({
  name: 'randomize_transform',
  description: 'Randomizes GameObject transform',
  category: 'gameobject',
  version: '1.0.0'
})
@Tags(['unity', 'gameobject', 'transform', 'random'])
export class RandomizeTransformTool extends BaseTool {
  get name() {
    return 'randomize_transform';
  }

  get description() {
    return 'Randomizes GameObject transform';
  }

  get inputSchema() {
    return RandomizeTransformToolArgsSchema;
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
