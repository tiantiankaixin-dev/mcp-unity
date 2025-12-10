import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for set_physics_material tool
 */
const SetPhysicsMaterialToolArgsSchema = z.object({
  instanceIds: z.array(z.number().int()).min(1).describe('Array of GameObject instance IDs to set physics material on'),
  dynamicFriction: z.number().optional().default(0.6).describe('Dynamic friction coefficient. Default: 0.6'),
  staticFriction: z.number().optional().default(0.6).describe('Static friction coefficient. Default: 0.6'),
  bounciness: z.number().optional().default(0).describe('Bounciness (0-1). Default: 0')
});

/**
 * SetPhysicsMaterial Tool
 * Sets physics material on collider
 */
@Tool({
  name: 'set_physics_material',
  description: 'Sets physics material on collider',
  category: 'physics',
  version: '1.0.0'
})
@Tags(['unity', 'physics', 'material'])
export class SetPhysicsMaterialTool extends BaseTool {
  get name() {
    return 'set_physics_material';
  }

  get description() {
    return 'Sets physics material on collider';
  }

  get inputSchema() {
    return SetPhysicsMaterialToolArgsSchema;
  }

  get category() {
    return 'physics';
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
