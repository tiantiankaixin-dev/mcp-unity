import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for duplicate_scene tool
 */
const DuplicateSceneToolArgsSchema = z.object({
  sourceScenePath: z
    .string()
    .optional()
    .describe("Full asset path to the source scene (e.g., 'Assets/Scenes/MyScene.unity')"),
  scenePath: z
    .string()
    .optional()
    .describe("Alias for sourceScenePath - Full asset path to the source scene"),
  targetScenePath: z
    .string()
    .optional()
    .describe("Full asset path for the duplicated scene (e.g., 'Assets/Scenes/MyScene_Copy.unity')"),
  newSceneName: z
    .string()
    .optional()
    .describe("Name for the duplicated scene (will be saved in same folder as source)"),
  overwrite: z
    .boolean()
    .optional()
    .default(false)
    .describe('Whether to overwrite the target scene if it already exists (default: false)')
}).refine(data => data.sourceScenePath || data.scenePath, {
  message: 'Either sourceScenePath or scenePath is required'
}).refine(data => data.targetScenePath || data.newSceneName, {
  message: 'Either targetScenePath or newSceneName is required'
});
// 注意：不使用 transform，直接让 C# 端处理 newSceneName 参数
// C# 端会自动将 newSceneName 转换为 targetScenePath

/**
 * DuplicateScene Tool
 * Duplicates an existing scene
 */
@Tool({
  name: 'duplicate_scene',
  description: 'Duplicates an existing scene',
  category: 'scene',
  version: '1.0.0'
})
@Tags(['unity', 'scene', 'duplicate'])
export class DuplicateSceneTool extends BaseTool {
  get name() {
    return 'duplicate_scene';
  }

  get description() {
    return 'Duplicates an existing scene';
  }

  get inputSchema() {
    return DuplicateSceneToolArgsSchema;
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
