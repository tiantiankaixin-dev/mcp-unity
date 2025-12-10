import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for merge_scenes tool
 */
const MergeScenesToolArgsSchema = z.object({
  sourceScenePaths: z
    .array(z.string())
    .min(1)
    .describe('Array of source scene paths to merge. Example: ["Assets/Scenes/Level1.unity", "Assets/Scenes/Level2.unity"]'),
  targetScenePath: z
    .string()
    .describe('Target scene path where all scenes will be merged. Example: "Assets/Scenes/MergedLevel.unity"'),
  createNew: z
    .boolean()
    .optional()
    .default(false)
    .describe('Whether to create a new empty scene as target. Default: false (use existing or create)'),
  saveAfterMerge: z
    .boolean()
    .optional()
    .default(true)
    .describe('Whether to save the target scene after merging. Default: true')
});

/**
 * MergeScenes Tool
 * Merges multiple scenes into one
 */
@Tool({
  name: 'merge_scenes',
  description: 'Merges multiple scenes into one',
  category: 'scene',
  version: '1.0.0'
})
@Tags(['unity', 'scene', 'merge'])
export class MergeScenesTool extends BaseTool {
  get name() {
    return 'merge_scenes';
  }

  get description() {
    return 'Merges multiple scenes into one';
  }

  get inputSchema() {
    return MergeScenesToolArgsSchema;
  }

  get category() {
    return 'scene';
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
