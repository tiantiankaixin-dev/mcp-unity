import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for batch_add_component tool
 */
const BatchAddComponentToolArgsSchema = z.object({
  instanceIds: z
    .array(z.number().int())
    .optional()
    .describe('Array of GameObject instance IDs to add components to'),
  instanceId: z
    .number()
    .int()
    .optional()
    .describe('Single GameObject instance ID (alternative to instanceIds)'),
  componentTypeName: z
    .string()
    .optional()
    .describe('Component type name (without namespace). Examples: "Rigidbody", "BoxCollider", "AudioSource", "MeshRenderer"'),
  componentType: z
    .string()
    .optional()
    .describe('Alias for componentTypeName - Component type name')
}).refine(data => data.instanceIds || data.instanceId, {
  message: 'Either instanceIds or instanceId is required'
}).refine(data => data.componentTypeName || data.componentType, {
  message: 'Either componentTypeName or componentType is required'
}).transform(data => ({
  instanceIds: data.instanceIds || (data.instanceId ? [data.instanceId] : []),
  componentTypeName: data.componentTypeName || data.componentType || ''
}));

/**
 * BatchAddComponent Tool
 * Batch adds components
 */
@Tool({
  name: 'batch_add_component',
  description: 'Batch adds components',
  category: 'component',
  version: '1.0.0'
})
@Tags(['unity', 'component', 'batch'])
export class BatchAddComponentTool extends BaseTool {
  get name() {
    return 'batch_add_component';
  }

  get description() {
    return 'Batch adds components';
  }

  get inputSchema() {
    return BatchAddComponentToolArgsSchema;
  }

  get category() {
    return 'component';
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
