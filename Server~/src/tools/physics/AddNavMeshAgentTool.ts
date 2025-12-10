import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for add_navmesh_agent tool
 */
const AddNavMeshAgentToolArgsSchema = z.object({
  instanceIds: z.array(z.number().int()).min(1).describe('Array of GameObject instance IDs to add NavMeshAgent to'),
  speed: z.number().optional().default(3.5).describe('Maximum movement speed. Default: 3.5'),
  acceleration: z.number().optional().default(8).describe('Maximum acceleration. Default: 8'),
  stoppingDistance: z.number().optional().default(0).describe('Stop within this distance from target. Default: 0')
});

/**
 * AddNavMeshAgent Tool
 * Adds NavMesh Agent component
 */
@Tool({
  name: 'add_navmesh_agent',
  description: 'Adds NavMesh Agent component',
  category: 'physics',
  version: '1.0.0'
})
@Tags(['unity', 'physics', 'navmesh', 'ai'])
export class AddNavMeshAgentTool extends BaseTool {
  get name() {
    return 'add_navmesh_agent';
  }

  get description() {
    return 'Adds NavMesh Agent component';
  }

  get inputSchema() {
    return AddNavMeshAgentToolArgsSchema;
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
