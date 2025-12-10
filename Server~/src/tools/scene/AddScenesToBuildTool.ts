import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for add_scenes_to_build tool
 */
const AddScenesToBuildToolArgsSchema = z.object({
  scenePaths: z
    .array(z.string())
    .min(1)
    .describe('Array of scene paths to add to Build Settings. Example: ["Assets/Scenes/MainMenu.unity", "Assets/Scenes/Level1.unity"]')
});

/**
 * AddScenesToBuild Tool
 * Adds scenes to build settings
 */
@Tool({
  name: 'add_scenes_to_build',
  description: 'Adds scenes to build settings',
  category: 'scene',
  version: '1.0.0'
})
@Tags(['unity', 'scene', 'build'])
export class AddScenesToBuildTool extends BaseTool {
  get name() {
    return 'add_scenes_to_build';
  }

  get description() {
    return 'Adds scenes to build settings';
  }

  get inputSchema() {
    return AddScenesToBuildToolArgsSchema;
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
