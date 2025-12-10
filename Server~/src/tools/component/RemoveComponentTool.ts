import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';

const RemoveComponentToolArgsSchema = z.object({
  instanceId: z.number().int().optional().describe('Instance ID of the GameObject'),
  objectPath: z.string().optional().describe('Hierarchy path to the GameObject'),
  componentType: z.string().describe('Type of component to remove. Example: "Rigidbody", "BoxCollider"'),
  removeAll: z.boolean().optional().default(false).describe('Remove all components of this type. Default: false (remove first only)')
});

@Tool({
  name: 'remove_component',
  description: 'Remove a component from a GameObject. Supports Undo/Redo.',
  category: 'component',
  version: '1.0.0'
})
@Tags(['unity', 'component', 'remove', 'delete', 'destroy'])
export class RemoveComponentTool extends BaseTool {
  get name() { return 'remove_component'; }
  get description() { return 'Remove a component from a GameObject. Supports Undo/Redo.'; }
  get inputSchema() { return RemoveComponentToolArgsSchema; }
  get category() { return 'component'; }
}
