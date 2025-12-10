import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for create_scriptable_object tool
 */
const CreateScriptableObjectToolArgsSchema = z.object({
  assetName: z.string().optional().default('NewScriptableObject').describe('Name for the ScriptableObject asset. Default: "NewScriptableObject"'),
  savePath: z.string().optional().default('Assets/ScriptableObjects').describe('Path to save the asset. Default: "Assets/ScriptableObjects"'),
  typeName: z.string().optional().describe('Fully qualified type name of the ScriptableObject class')
});

/**
 * CreateScriptableObject Tool
 * Creates a ScriptableObject
 */
@Tool({
  name: 'create_scriptable_object',
  description: 'Creates a ScriptableObject',
  category: 'asset',
  version: '1.0.0'
})
@Tags(['unity', 'asset', 'scriptableobject'])
export class CreateScriptableObjectTool extends BaseTool {
  get name() {
    return 'create_scriptable_object';
  }

  get description() {
    return 'Creates a ScriptableObject';
  }

  get inputSchema() {
    return CreateScriptableObjectToolArgsSchema;
  }

  get category() {
    return 'asset';
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
