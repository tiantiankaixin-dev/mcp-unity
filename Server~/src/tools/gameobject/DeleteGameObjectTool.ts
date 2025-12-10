import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for delete_gameobject tool
 * Based on Unity API: Undo.DestroyObjectImmediate
 * https://docs.unity3d.com/ScriptReference/Undo.DestroyObjectImmediate.html
 */
const DeleteGameObjectToolArgsSchema = z.object({
  instanceIds: z.array(z.number().int()).optional().describe('Array of GameObject instance IDs to delete'),
  objectPath: z.string().optional().describe('Hierarchy path to the GameObject to delete. Example: "Parent/Child"'),
  objectName: z.string().optional().describe('Name of the GameObject(s) to delete. Deletes all matching objects.')
});

/**
 * DeleteGameObject Tool
 * Deletes GameObjects from the scene with Undo support
 */
@Tool({
  name: 'delete_gameobject',
  description: 'Delete GameObjects from the scene. Supports Undo/Redo.',
  category: 'gameobject',
  version: '1.0.0'
})
@Tags(['unity', 'gameobject', 'delete', 'destroy'])
export class DeleteGameObjectTool extends BaseTool {
  get name() {
    return 'delete_gameobject';
  }

  get description() {
    return 'Delete GameObjects from the scene. Supports Undo/Redo. Use Edit > Undo to restore deleted objects.';
  }

  get inputSchema() {
    return DeleteGameObjectToolArgsSchema;
  }

  get category() {
    return 'gameobject';
  }

  protected formatSuccessResponse(result: any): CallToolResult {
    return {
      content: [{
        type: 'text',
        text: `✅ ${result.message || 'GameObjects deleted successfully'}`
      }]
    };
  }
}
