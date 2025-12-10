import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for set_player_settings tool
 */
const SetPlayerSettingsToolArgsSchema = z.object({
  companyName: z.string().optional().describe('Company name for the project'),
  productName: z.string().optional().describe('Product name for the project'),
  version: z.string().optional().describe('Version string (e.g., "1.0.0")'),
  defaultScreenWidth: z.number().int().optional().default(0).describe('Default screen width. 0 means no change. Default: 0'),
  defaultScreenHeight: z.number().int().optional().default(0).describe('Default screen height. 0 means no change. Default: 0'),
  fullscreen: z.boolean().optional().default(true).describe('Whether to start in fullscreen mode. Default: true')
});

/**
 * SetPlayerSettings Tool
 * Sets player settings
 */
@Tool({
  name: 'set_player_settings',
  description: 'Sets player settings',
  category: 'build',
  version: '1.0.0'
})
@Tags(['unity', 'build', 'settings'])
export class SetPlayerSettingsTool extends BaseTool {
  get name() {
    return 'set_player_settings';
  }

  get description() {
    return 'Sets player settings';
  }

  get inputSchema() {
    return SetPlayerSettingsToolArgsSchema;
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
