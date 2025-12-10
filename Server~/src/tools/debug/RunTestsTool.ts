import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for run_tests tool
 */
const RunTestsToolArgsSchema = z.object({
  testMode: z.string().optional().default('EditMode').describe('Test mode: "EditMode" or "PlayMode". Default: "EditMode"'),
  testFilter: z.string().optional().describe('Optional filter to run specific tests'),
  returnOnlyFailures: z.boolean().optional().default(false).describe('Whether to return only failed tests. Default: false'),
  returnWithLogs: z.boolean().optional().default(false).describe('Whether to include test logs. Default: false')
});

/**
 * RunTests Tool
 * Runs Unity tests
 */
@Tool({
  name: 'run_tests',
  description: 'Runs Unity tests',
  category: 'debug',
  version: '1.0.0'
})
@Tags(['unity', 'debug', 'test'])
export class RunTestsTool extends BaseTool {
  get name() {
    return 'run_tests';
  }

  get description() {
    return 'Runs Unity tests';
  }

  get inputSchema() {
    return RunTestsToolArgsSchema;
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
