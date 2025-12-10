import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for set_component_reference tool
 */
const SetComponentReferenceToolArgsSchema = z.object({
  targetObjectPath: z.string().describe('Hierarchy path to the target GameObject (e.g., "Canvas/MyButton")'),
  componentName: z.string().describe('Name of the component on the target GameObject (e.g., "Button", "Image")'),
  fieldName: z.string().describe('Name of the field to set. Can use property name (e.g., "targetGraphic") or serialized name (e.g., "m_TargetGraphic"). Auto-converts to m_ prefix if needed.'),
  referenceObjectPath: z.string().describe('Hierarchy path to the GameObject to reference (e.g., "Canvas/MyImage")')
});

/**
 * SetComponentReference Tool
 * Sets a GameObject or Component reference on a component field using Unity's SerializedProperty
 */
@Tool({
  name: 'set_component_reference',
  description: 'Sets a GameObject or Component reference on a component field (e.g., setting menuPanel field to reference another GameObject)',
  category: 'component',
  version: '1.0.0'
})
@Tags(['unity', 'component', 'reference', 'serialization'])
export class SetComponentReferenceTool extends BaseTool {
  get name() {
    return 'set_component_reference';
  }

  get description() {
    return 'Sets a GameObject or Component reference on a component field using Unity\'s SerializedProperty system';
  }

  get inputSchema() {
    return SetComponentReferenceToolArgsSchema;
  }

  get category() {
    return 'component';
  }

  protected formatSuccessResponse(result: any): CallToolResult {
    return {
      content: [{
        type: 'text',
        text: `✅ ${result.message || 'Successfully set component reference'}`
      }]
    };
  }
}
