import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for set_quality_settings tool
 */
const SetQualitySettingsToolArgsSchema = z.object({
  qualityLevel: z.string().optional().default('medium').describe('Quality level: "low", "medium", "high", "very high", "ultra". Default: "medium"')
});

/**
 * SetQualitySettings Tool
 * Sets quality settings
 */
@Tool({
  name: 'set_quality_settings',
  description: 'Sets quality settings',
  category: 'build',
  version: '1.0.0'
})
@Tags(['unity', 'build', 'quality'])
export class SetQualitySettingsTool extends BaseTool {
  get name() {
    return 'set_quality_settings';
  }

  get description() {
    return 'Sets quality settings';
  }

  get inputSchema() {
    return SetQualitySettingsToolArgsSchema;
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
