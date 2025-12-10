import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for create_event_system tool
 * EventSystem has no parameters - it's a singleton that either exists or doesn't
 */
const CreateEventSystemToolArgsSchema = z.object({});

/**
 * CreateEventSystem Tool
 * Creates an Event System
 */
@Tool({
  name: 'create_event_system',
  description: 'Creates an Event System',
  category: 'ui',
  version: '1.0.0'
})
@Tags(['unity', 'ui', 'events'])
export class CreateEventSystemTool extends BaseTool {
  get name() {
    return 'create_event_system';
  }

  get description() {
    return 'Creates an Event System';
  }

  get inputSchema() {
    return CreateEventSystemToolArgsSchema;
  }

  get category() {
    return 'ui';
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
