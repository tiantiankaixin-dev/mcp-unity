import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for send_console_log tool
 */
const SendConsoleLogToolArgsSchema = z.object({
  message: z.string().optional().describe('Message to log to Unity console'),
  type: z.string().optional().default('info').describe('Log type: "info", "warning", "error". Default: "info"')
});

/**
 * SendConsoleLog Tool
 * Sends a message to console
 */
@Tool({
  name: 'send_console_log',
  description: 'Sends a message to console',
  category: 'debug',
  version: '1.0.0'
})
@Tags(['unity', 'debug', 'console'])
export class SendConsoleLogTool extends BaseTool {
  get name() {
    return 'send_console_log';
  }

  get description() {
    return 'Sends a message to console';
  }

  get inputSchema() {
    return SendConsoleLogToolArgsSchema;
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
