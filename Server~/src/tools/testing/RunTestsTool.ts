import { z } from 'zod';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpUnity } from '../../unity/mcpUnity.js';
import { Logger } from '../../utils/logger.js';
import { McpUnityError, ErrorType } from '../../utils/errors.js';

/**
 * Tool for running Unity Test Runner tests
 *
 * Uses Unity's TestRunnerApi to execute EditMode or PlayMode tests.
 *
 * Unity API: UnityEditor.TestTools.TestRunner.Api.TestRunnerApi
 * C# Handler: Editor/Tools/RunTestsTool.cs
 *
 * @see https://docs.unity3d.com/Packages/com.unity.test-framework@latest
 *
 * @example
 * // Run all EditMode tests
 * { testMode: "EditMode" }
 *
 * @example
 * // Run specific test with filter
 * { testMode: "EditMode", testFilter: "MyNamespace.MyTestClass.MyTestMethod" }
 *
 * @category testing
 */
@Tool({
  name: 'run_tests',
  description: 'Runs Unity\'s Test Runner tests',
  category: 'testing',
  version: '1.0.0'
})
@Tags(['unity', 'testing', 'test-runner'])
export class RunTestsTool extends BaseTool {
  get name(): string {
    return 'run_tests';
  }

  get description(): string {
    return 'Runs Unity\'s Test Runner tests';
  }

  get category(): string {
    return 'testing';
  }

  get inputSchema() {
    return z.object({
      testMode: z.string().optional().default('EditMode').describe('The test mode to run (EditMode or PlayMode) - defaults to EditMode (optional)'),
      testFilter: z.string().optional().default('').describe('The specific test filter to run (e.g. specific test name or class name, must include namespace) (optional)'),
      returnOnlyFailures: z.boolean().optional().default(true).describe('Whether to show only failed tests in the results (optional)'),
      returnWithLogs: z.boolean().optional().default(false).describe('Whether to return the test logs in the results (optional)')
    });
  }

  /**
   * Custom execution logic preserved from legacy implementation
   * Handles test execution and formats results with detailed statistics
   */
  protected async execute(args: any): Promise<CallToolResult> {
    try {
      // Validate arguments
      const validatedArgs = this.inputSchema.parse(args);
      
      // Extract parameters with defaults
      const {
        testMode = 'EditMode',
        testFilter = '',
        returnOnlyFailures = true,
        returnWithLogs = false
      } = validatedArgs;

      this.logger.debug(`Executing ${this.name}`, { testMode, testFilter, returnOnlyFailures, returnWithLogs });

      // Send request to Unity
      const response = await this.mcpUnity.sendRequest({
        method: this.name,
        params: { 
          testMode,
          testFilter,
          returnOnlyFailures,
          returnWithLogs
        }
      });

      // Check if execution was successful
      if (!response.success) {
        throw new McpUnityError(
          ErrorType.TOOL_EXECUTION,
          response.message || `Failed to run tests: Mode=${testMode}, Filter=${testFilter || 'none'}`
        );
      }

      // Extract test results
      const testResults = response.results || [];
      const testCount = response.testCount || 0;
      const passCount = response.passCount || 0;
      const failCount = response.failCount || 0;
      const skipCount = response.skipCount || 0;

      // Return formatted response with test statistics
      return {
        content: [
          {
            type: 'text',
            text: response.message
          },
          {
            type: 'text',
            text: JSON.stringify({
              testCount,
              passCount,
              failCount,
              skipCount,
              results: testResults
            }, null, 2)
          }
        ]
      };

    } catch (error: any) {
      this.logger.error(`Error in ${this.name}:`, error);
      
      // Preserve error type if it's already a McpUnityError
      if (error instanceof McpUnityError) {
        throw error;
      }
      
      return this.formatErrorResponse(error);
    }
  }
}

