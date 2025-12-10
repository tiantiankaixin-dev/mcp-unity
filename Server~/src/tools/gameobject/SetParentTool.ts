import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

const SetParentToolArgsSchema = z.object({
  instanceIds: z.array(z.number().int()).optional().describe('Array of child GameObject instance IDs'),
  childInstanceId: z.number().int().optional().describe('Single child instance ID'),
  parentInstanceId: z.number().int().optional().describe('Parent instance ID. Use 0 or omit to unparent to root.'),
  parentPath: z.string().optional().describe('Hierarchy path to parent. Example: "Environment/Props"'),
  worldPositionStays: z.boolean().optional().default(true).describe('Keep world position when reparenting. Default: true')
});

@Tool({
  name: 'set_parent',
  description: 'Set the parent of GameObjects. Use null/0 to unparent (move to root).',
  category: 'gameobject',
  version: '1.0.0'
})
@Tags(['unity', 'gameobject', 'parent', 'hierarchy'])
export class SetParentTool extends BaseTool {
  get name() { return 'set_parent'; }
  get description() { return 'Set the parent of GameObjects. Use null/0 to unparent (move to root).'; }
  get inputSchema() { return SetParentToolArgsSchema; }
  get category() { return 'gameobject'; }
}
