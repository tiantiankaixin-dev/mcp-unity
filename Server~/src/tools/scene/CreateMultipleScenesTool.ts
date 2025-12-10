import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for create_multiple_scenes tool
 */
const CreateMultipleScenesToolArgsSchema = z.object({
  baseName: z
    .string()
    .optional()
    .describe('Base name for the scenes. Example: "Level" will create "Level1", "Level2", etc.'),
  sceneNames: z
    .array(z.string())
    .optional()
    .describe('Array of specific scene names to create (alternative to baseName+count)'),
  count: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .describe('Number of scenes to create (1-100), used with baseName'),
  startNumber: z
    .number()
    .int()
    .optional()
    .default(1)
    .describe('Starting number for scene naming. Default: 1'),
  folderPath: z
    .string()
    .optional()
    .default('Assets/Scenes')
    .describe('Folder path to save scenes. Default: "Assets/Scenes"'),
  basePath: z
    .string()
    .optional()
    .describe('Alias for folderPath - Folder path to save scenes'),
  addToBuild: z
    .boolean()
    .optional()
    .default(false)
    .describe('Whether to add created scenes to build settings. Default: false')
}).refine(data => data.sceneNames || (data.baseName && data.count), {
  message: 'Either sceneNames array or baseName with count is required'
}).transform(data => ({
  baseName: data.baseName || '',
  sceneNames: data.sceneNames,
  count: data.count || (data.sceneNames ? data.sceneNames.length : 0),
  startNumber: data.startNumber,
  folderPath: data.folderPath || data.basePath || 'Assets/Scenes',
  addToBuild: data.addToBuild
}));

/**
 * CreateMultipleScenes Tool
 * Creates multiple scenes at once
 */
@Tool({
  name: 'create_multiple_scenes',
  description: 'Creates multiple scenes at once',
  category: 'scene',
  version: '1.0.0'
})
@Tags(['unity', 'scene', 'batch'])
export class CreateMultipleScenesTool extends BaseTool {
  get name() {
    return 'create_multiple_scenes';
  }

  get description() {
    return 'Creates multiple scenes at once';
  }

  get inputSchema() {
    return CreateMultipleScenesToolArgsSchema;
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
