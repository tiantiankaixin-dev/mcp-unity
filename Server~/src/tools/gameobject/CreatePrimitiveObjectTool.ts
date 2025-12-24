import { z } from 'zod';
import { GameObjectCreationTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for create_primitive_object tool
 */
const CreatePrimitiveObjectToolArgsSchema = z.object({
  primitiveType: z
    .enum(['cube', 'sphere', 'capsule', 'cylinder', 'plane', 'quad'])
    .default('cube')
    .describe('Type of primitive (lowercase). Options: cube, sphere, capsule, cylinder, plane, quad. Default: cube'),
  objectName: z
    .string()
    .optional()
    .describe('Optional name for the GameObject. If not provided, Unity default name will be used'),
  position: z.array(z.number()).length(3).optional().describe('Position as [x, y, z]. Fallback to posX/posY/posZ if not provided'),
  posX: z
    .number()
    .optional()
    .default(0)
    .describe('X position in world space. Default: 0'),
  posY: z
    .number()
    .optional()
    .default(0)
    .describe('Y position in world space. Default: 0'),
  posZ: z
    .number()
    .optional()
    .default(0)
    .describe('Z position in world space. Default: 0')
});

/**
 * CreatePrimitiveObject Tool
 * Creates primitive GameObject (Cube, Sphere, etc.)
 */
@Tool({
  name: 'create_primitive_object',
  description: 'Creates primitive (cube/sphere/capsule/cylinder/plane/quad). No scale param - use update_component with Transform.localScale after creation.',
  category: 'gameobject',
  version: '1.0.0'
})
@Tags(['unity', 'gameobject', 'primitive', 'creation'])
export class CreatePrimitiveObjectTool extends GameObjectCreationTool {
  get name() {
    return 'create_primitive_object';
  }

  get description() {
    return 'Creates primitive (cube/sphere/capsule/cylinder/plane/quad). No scale param - use update_component with Transform.localScale after creation.';
  }

  get inputSchema() {
    return CreatePrimitiveObjectToolArgsSchema;
  }

  get category() {
    return 'gameobject';
  }
  
  // GameObjectCreationTool base class handles formatSuccessResponse automatically
}
