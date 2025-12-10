import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

const CreateEmptyGameObjectToolArgsSchema = z.object({
  objectName: z.string().optional().default('GameObject').describe('Name for the new GameObject. Default: "GameObject"'),
  posX: z.number().optional().default(0).describe('X position. Default: 0'),
  posY: z.number().optional().default(0).describe('Y position. Default: 0'),
  posZ: z.number().optional().default(0).describe('Z position. Default: 0'),
  parentInstanceId: z.number().int().optional().describe('Instance ID of the parent GameObject')
});

@Tool({
  name: 'create_empty_gameobject',
  description: 'Create an empty GameObject with only a Transform component.',
  category: 'gameobject',
  version: '1.0.0'
})
@Tags(['unity', 'gameobject', 'create', 'empty'])
export class CreateEmptyGameObjectTool extends BaseTool {
  get name() { return 'create_empty_gameobject'; }
  get description() { return 'Create an empty GameObject with only a Transform component.'; }
  get inputSchema() { return CreateEmptyGameObjectToolArgsSchema; }
  get category() { return 'gameobject'; }
}
