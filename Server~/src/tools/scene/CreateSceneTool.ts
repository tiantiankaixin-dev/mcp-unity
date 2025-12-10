import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for create_scene tool
 */
const CreateSceneToolArgsSchema = z.object({
  sceneName: z
    .string()
    .describe('The name of the scene to create (without extension)'),
  folderPath: z
    .string()
    .optional()
    .default('Assets')
    .describe('The folder path under Assets to save into (default: Assets)'),
  addToBuildSettings: z
    .boolean()
    .optional()
    .default(false)
    .describe('Whether to add the scene to Build Settings'),
  makeActive: z
    .boolean()
    .optional()
    .default(true)
    .describe('Whether to open/make the new scene active after creating it')
});

/**
 * Create Scene Tool
 * Creates a new scene and saves it to the specified path
 */
@Tool({
  name: 'create_scene',
  description: 'Creates a new scene and saves it to the specified path',
  category: 'scene',
  version: '1.0.0'
})
@Tags(['unity', 'scene', 'creation'])
export class CreateSceneTool extends BaseTool {
  get name() {
    return 'create_scene';
  }

  get description() {
    return 'Creates a new scene and saves it to the specified path';
  }

  get inputSchema() {
    return CreateSceneToolArgsSchema;
  }

  get category() {
    return 'scene';
  }

  protected formatSuccessResponse(result: any): CallToolResult {
    return {
      content: [{
        type: 'text',
        text: `✅ Successfully created scene: ${result.sceneName}\n📁 Path: ${result.scenePath}${result.addedToBuild ? '\n🔨 Added to Build Settings' : ''}`
      }]
    };
  }
}

