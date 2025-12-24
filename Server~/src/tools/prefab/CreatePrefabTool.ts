import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for create_prefab tool
 */
const CreatePrefabToolArgsSchema = z.object({
  instanceId: z
    .number()
    .int()
    .optional()
    .describe('Instance ID of the GameObject to create prefab from'),
  gameObjectPath: z
    .string()
    .optional()
    .describe('Hierarchy path to the GameObject (alternative to instanceId)'),
  prefabName: z
    .string()
    .describe('Name for the prefab asset (required)'),
  savePath: z
    .string()
    .optional()
    .default('Assets/Prefabs')
    .describe('Folder path to save the prefab. Default: "Assets/Prefabs". Example: "Assets/MCP_Test/Prefabs"'),
  componentName: z
    .string()
    .optional()
    .describe('Name of the component type to add to the prefab'),
  fieldValues: z
    .record(z.any())
    .optional()
    .describe('Object containing field/property values to set on the component'),
  overwrite: z
    .boolean()
    .optional()
    .default(false)
    .describe('Whether to overwrite existing prefab with same name. Default: false')
}).refine(data => data.instanceId !== undefined || data.gameObjectPath, {
  message: "Either 'instanceId' or 'gameObjectPath' is required"
});

/**
 * CreatePrefab Tool
 * Creates a prefab from GameObject
 */
@Tool({
  name: 'create_prefab',
  description: 'Creates a prefab from GameObject',
  category: 'prefab',
  version: '1.0.0'
})
@Tags(['unity', 'prefab', 'creation'])
export class CreatePrefabTool extends BaseTool {
  get name() {
    return 'create_prefab';
  }

  get description() {
    return 'Creates a prefab from GameObject';
  }

  get inputSchema() {
    return CreatePrefabToolArgsSchema;
  }

  get category() {
    return 'prefab';
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
