import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for build_project tool
 */
const BuildProjectToolArgsSchema = z.object({
  buildPath: z.string().optional().default('Builds/Game').describe('Path where the build will be saved. Default: "Builds/Game"'),
  buildTarget: z.string().optional().default('windows').describe('Build target platform: "windows", "mac", "linux", "android", "ios", "webgl". Default: "windows"'),
  developmentBuild: z.boolean().optional().default(false).describe('Whether to create a development build. Default: false')
});

/**
 * BuildProject Tool
 * Builds the Unity project
 */
@Tool({
  name: 'build_project',
  description: 'Builds the Unity project',
  category: 'build',
  version: '1.0.0'
})
@Tags(['unity', 'build', 'compile'])
export class BuildProjectTool extends BaseTool {
  get name() {
    return 'build_project';
  }

  get description() {
    return 'Builds the Unity project';
  }

  get inputSchema() {
    return BuildProjectToolArgsSchema;
  }

  get category() {
    return 'build';
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
