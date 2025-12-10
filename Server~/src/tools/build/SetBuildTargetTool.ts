import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for set_build_target tool
 */
const SetBuildTargetToolArgsSchema = z.object({
  platform: z.string().optional().default('windows').describe('Target platform: "windows", "mac", "linux", "android", "ios", "webgl". Default: "windows"')
});

/**
 * SetBuildTarget Tool
 * Sets the build target platform
 */
@Tool({
  name: 'set_build_target',
  description: 'Sets the build target platform',
  category: 'build',
  version: '1.0.0'
})
@Tags(['unity', 'build', 'platform'])
export class SetBuildTargetTool extends BaseTool {
  get name() {
    return 'set_build_target';
  }

  get description() {
    return 'Sets the build target platform';
  }

  get inputSchema() {
    return SetBuildTargetToolArgsSchema;
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
