import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

const FindGameObjectsToolArgsSchema = z.object({
  objectName: z.string().optional().describe('Name or partial name to search for'),
  tag: z.string().optional().describe('Tag to filter by. Example: "Player", "Enemy"'),
  layer: z.string().optional().describe('Layer to filter by. Example: "Default", "UI"'),
  componentType: z.string().optional().describe('Component type to filter by. Example: "Rigidbody", "Camera"'),
  includeInactive: z.boolean().optional().default(false).describe('Include inactive objects. Default: false'),
  maxResults: z.number().int().optional().default(100).describe('Maximum results to return. Default: 100')
});

@Tool({
  name: 'find_gameobjects',
  description: 'Find GameObjects by name, tag, layer, or component type.',
  category: 'gameobject',
  version: '1.0.0'
})
@Tags(['unity', 'gameobject', 'find', 'search', 'query'])
export class FindGameObjectsTool extends BaseTool {
  get name() { return 'find_gameobjects'; }
  get description() { return 'Find GameObjects by name, tag, layer, or component type.'; }
  get inputSchema() { return FindGameObjectsToolArgsSchema; }
  get category() { return 'gameobject'; }
}
