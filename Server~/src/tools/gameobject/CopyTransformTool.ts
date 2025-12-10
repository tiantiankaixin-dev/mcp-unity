import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for copy_transform tool
 */
const CopyTransformToolArgsSchema = z.object({
  // Source identification - at least one required
  sourceInstanceId: z
    .number()
    .int()
    .optional()
    .describe('Instance ID of the source GameObject to copy transform from'),
  sourceObjectPath: z
    .string()
    .optional()
    .describe('Hierarchy path to the source GameObject (alternative to sourceInstanceId)'),
  sourceObjectName: z
    .string()
    .optional()
    .describe('Name of the source GameObject to find (alternative to sourceInstanceId)'),
  // Target identification - at least one required
  targetInstanceId: z
    .number()
    .int()
    .optional()
    .describe('Instance ID of the target GameObject to copy transform to'),
  targetObjectPath: z
    .string()
    .optional()
    .describe('Hierarchy path to the target GameObject (alternative to targetInstanceId)'),
  targetObjectName: z
    .string()
    .optional()
    .describe('Name of the target GameObject to find (alternative to targetInstanceId)'),
  targetInstanceIds: z
    .array(z.number().int())
    .optional()
    .describe('Array of target GameObject instance IDs (alternative to targetInstanceId for batch copy)'),
  copyPosition: z
    .boolean()
    .optional()
    .default(true)
    .describe('Whether to copy position. Default: true'),
  copyRotation: z
    .boolean()
    .optional()
    .default(true)
    .describe('Whether to copy rotation. Default: true'),
  copyScale: z
    .boolean()
    .optional()
    .default(true)
    .describe('Whether to copy scale. Default: true'),
  useLocal: z
    .boolean()
    .optional()
    .default(false)
    .describe('Whether to use local space (true) or world space (false). Default: false (world space)')
}).refine(data => data.sourceInstanceId || data.sourceObjectPath || data.sourceObjectName, {
  message: 'Either sourceInstanceId, sourceObjectPath or sourceObjectName is required'
}).refine(data => data.targetInstanceId || data.targetInstanceIds || data.targetObjectPath || data.targetObjectName, {
  message: 'Either targetInstanceId, targetInstanceIds, targetObjectPath or targetObjectName is required'
}).transform(data => ({
  sourceInstanceId: data.sourceInstanceId || 0,
  sourceObjectPath: data.sourceObjectPath,
  sourceObjectName: data.sourceObjectName,
  targetInstanceId: data.targetInstanceId || (data.targetInstanceIds ? data.targetInstanceIds[0] : 0),
  targetObjectPath: data.targetObjectPath,
  targetObjectName: data.targetObjectName,
  targetInstanceIds: data.targetInstanceIds || (data.targetInstanceId ? [data.targetInstanceId] : []),
  copyPosition: data.copyPosition,
  copyRotation: data.copyRotation,
  copyScale: data.copyScale,
  useLocal: data.useLocal
}));

/**
 * CopyTransform Tool
 * Copies transform from one GameObject to another
 */
@Tool({
  name: 'copy_transform',
  description: 'Copies transform from one GameObject to another',
  category: 'gameobject',
  version: '1.0.0'
})
@Tags(['unity', 'gameobject', 'transform', 'copy'])
export class CopyTransformTool extends BaseTool {
  get name() {
    return 'copy_transform';
  }

  get description() {
    return 'Copies transform from one GameObject to another';
  }

  get inputSchema() {
    return CopyTransformToolArgsSchema;
  }

  get category() {
    return 'gameobject';
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
