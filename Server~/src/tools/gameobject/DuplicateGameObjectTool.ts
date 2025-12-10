import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for duplicate_gameobject tool
 * Based on Unity API: Object.Instantiate
 * https://docs.unity3d.com/ScriptReference/Object.Instantiate.html
 */
const DuplicateGameObjectToolArgsSchema = z.object({
  instanceId: z.number().int().optional().describe('Instance ID of the GameObject to duplicate'),
  instanceIds: z.array(z.number().int()).optional().describe('Array of GameObject instance IDs to duplicate'),
  objectPath: z.string().optional().describe('Hierarchy path to the GameObject to duplicate'),
  count: z.number().int().min(1).max(100).optional().default(1).describe('Number of duplicates to create. Default: 1'),
  keepParent: z.boolean().optional().default(true).describe('Whether to keep the same parent. Default: true'),
  offsetX: z.number().optional().default(1).describe('X offset between duplicates. Default: 1'),
  offsetY: z.number().optional().default(0).describe('Y offset between duplicates. Default: 0'),
  offsetZ: z.number().optional().default(0).describe('Z offset between duplicates. Default: 0')
});

/**
 * DuplicateGameObject Tool
 * Duplicates/clones GameObjects in the scene
 */
@Tool({
  name: 'duplicate_gameobject',
  description: 'Duplicate/clone GameObjects in the scene. Supports Undo/Redo.',
  category: 'gameobject',
  version: '1.0.0'
})
@Tags(['unity', 'gameobject', 'duplicate', 'clone', 'copy'])
export class DuplicateGameObjectTool extends BaseTool {
  get name() {
    return 'duplicate_gameobject';
  }

  get description() {
    return 'Duplicate/clone GameObjects in the scene. Supports Undo/Redo.';
  }

  get inputSchema() {
    return DuplicateGameObjectToolArgsSchema;
  }

  get category() {
    return 'gameobject';
  }

  protected formatSuccessResponse(result: any): CallToolResult {
    return {
      content: [{
        type: 'text',
        text: `✅ ${result.message || 'GameObjects duplicated successfully'}`
      }]
    };
  }
}
