import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

const LoadSceneToolArgsSchema = z.object({
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
    .describe("Optional folder scope to resolve sceneName under 'Assets'"),
  additive: z
    .boolean()
    .optional()
    .default(false)
    .describe('Load additively if true; default false (Single mode)')
});

@Tool({
  name: 'load_scene',
  description: 'Loads a scene in the Unity Editor',
  category: 'scene',
  version: '1.0.0'
})
@Tags(['unity', 'scene', 'load'])
export class LoadSceneTool extends BaseTool {
  get name() {
    return 'load_scene';
  }

  get description() {
    return 'Loads a scene in the Unity Editor';
  }

  get inputSchema() {
    return LoadSceneToolArgsSchema;
  }

  get category() {
    return 'scene';
  }

  protected formatSuccessResponse(result: any): CallToolResult {
    return {
      content: [{
        type: 'text',
        text: `✅ Successfully loaded scene: ${result.scenePath}\n📂 Mode: ${result.additive ? 'Additive' : 'Single'}`
      }]
    };
  }
}

