import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for replace_gameobjects tool
 */
const ReplaceGameObjectsToolArgsSchema = z.object({
  instanceIds: z
    .array(z.number().int())
    .min(1)
    .describe('Array of GameObject instance IDs to replace'),
  replacementPrefabPath: z
    .string()
    .describe('Asset path to the replacement prefab. Example: "Assets/Prefabs/MyPrefab.prefab"'),
  keepTransform: z
    .boolean()
    .optional()
    .default(true)
    .describe('Whether to keep the original transform (position, rotation, scale). Default: true'),
  keepName: z
    .boolean()
    .optional()
    .default(false)
    .describe('Whether to keep the original GameObject name. Default: false')
});

/**
 * ReplaceGameObjects Tool
 * Replaces GameObjects with prefabs
 */
@Tool({
  name: 'replace_gameobjects',
  description: 'Replaces GameObjects with prefabs',
  category: 'gameobject',
  version: '1.0.0'
})
@Tags(['unity', 'gameobject', 'replace'])
export class ReplaceGameObjectsTool extends BaseTool {
  get name() {
    return 'replace_gameobjects';
  }

  get description() {
    return 'Replaces GameObjects with prefabs';
  }

  get inputSchema() {
    return ReplaceGameObjectsToolArgsSchema;
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
