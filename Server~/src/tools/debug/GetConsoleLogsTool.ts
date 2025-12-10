import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for get_console_logs tool
 */
const GetConsoleLogsToolArgsSchema = z.object({
  // No parameters required - retrieves all console logs
});

/**
 * GetConsoleLogs Tool
 * Gets console logs
 */
@Tool({
  name: 'get_console_logs',
  description: 'Gets console logs',
  category: 'debug',
  version: '1.0.0'
})
@Tags(['unity', 'debug', 'console', 'logs'])
export class GetConsoleLogsTool extends BaseTool {
  get name() {
    return 'get_console_logs';
  }

  get description() {
    return 'Gets console logs';
  }

  get inputSchema() {
    return GetConsoleLogsToolArgsSchema;
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
