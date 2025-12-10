import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for recompile_scripts tool
 */
const RecompileScriptsToolArgsSchema = z.object({
  returnWithLogs: z.boolean().optional().default(true).describe('Whether to return compilation logs. Default: true'),
  logsLimit: z.number().int().optional().default(100).describe('Maximum number of logs to return (0-1000). Default: 100')
});

/**
 * RecompileScripts Tool
 * Recompiles scripts
 */
@Tool({
  name: 'recompile_scripts',
  description: 'Recompiles scripts',
  category: 'debug',
  version: '1.0.0'
})
@Tags(['unity', 'debug', 'compile'])
export class RecompileScriptsTool extends BaseTool {
  get name() {
    return 'recompile_scripts';
  }

  get description() {
    return 'Recompiles scripts';
  }

  get inputSchema() {
    return RecompileScriptsToolArgsSchema;
  }

  get category() {
    return 'debug';
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
