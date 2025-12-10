import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for delete_scene tool
 */
const DeleteSceneToolArgsSchema = z.object({
  scenePath: z
    .string()
    .optional()
    .describe("Full asset path to the scene (e.g., 'Assets/Scenes/MyScene.unity')"),
  sceneName: z
    .string()
    .optional()
    .describe('Scene name without extension (used if scenePath not provided)'),
  folderPath: z
    .string()
    .optional()
    .describe("Optional folder scope to resolve sceneName under 'Assets'")
});

/**
 * DeleteScene Tool
 * Deletes a scene from the project
 */
@Tool({
  name: 'delete_scene',
  description: 'Deletes a scene from the project',
  category: 'scene',
  version: '1.0.0'
})
@Tags(['unity', 'scene', 'delete'])
export class DeleteSceneTool extends BaseTool {
  get name() {
    return 'delete_scene';
  }

  get description() {
    return 'Deletes a scene from the project';
  }

  get inputSchema() {
    return DeleteSceneToolArgsSchema;
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
