import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';

const GetComponentsToolArgsSchema = z.object({
  instanceId: z.number().int().optional().describe('Instance ID of the GameObject'),
  objectPath: z.string().optional().describe('Hierarchy path to the GameObject'),
  includeChildren: z.boolean().optional().default(false).describe('Include components from children. Default: false')
});

@Tool({
  name: 'get_components',
  description: 'Get all components attached to a GameObject.',
  category: 'component',
  version: '1.0.0'
})
@Tags(['unity', 'component', 'get', 'list', 'query'])
export class GetComponentsTool extends BaseTool {
  get name() { return 'get_components'; }
  get description() { return 'Get all components attached to a GameObject.'; }
  get inputSchema() { return GetComponentsToolArgsSchema; }
  get category() { return 'component'; }
}
