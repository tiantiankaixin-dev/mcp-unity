import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for batch_rename_gameobjects tool
 */
const BatchRenameGameObjectsToolArgsSchema = z.object({
  // Option 1: Use instanceIds directly
  instanceIds: z
    .array(z.number().int())
    .optional()
    .describe('Array of GameObject instance IDs to rename'),
  instanceId: z
    .number()
    .int()
    .optional()
    .describe('Single GameObject instance ID to rename'),
  // Option 2: Use name pattern matching
  oldNamePattern: z
    .string()
    .optional()
    .describe('The name pattern to match (supports wildcard *). Example: "Cube" or "Enemy_*"'),
  // New name configuration
  newNamePrefix: z
    .string()
    .optional()
    .describe('The prefix for the new names. Example: "Player_"'),
  baseName: z
    .string()
    .optional()
    .describe('Alias for newNamePrefix - Base name for the renamed objects'),
  newNamePattern: z
    .string()
    .optional()
    .describe('Alias for newNamePrefix - New name pattern for objects'),
  newNameSuffix: z
    .string()
    .optional()
    .describe('Optional suffix for the new names. Example: "_Prefab"'),
  startNumber: z
    .number()
    .int()
    .optional()
    .default(1)
    .describe('Starting number for sequential naming. Default: 1'),
  startIndex: z
    .number()
    .int()
    .optional()
    .describe('Alias for startNumber - Starting index for naming'),
  includeChildren: z
    .boolean()
    .optional()
    .default(false)
    .describe('Whether to include child GameObjects in the search. Default: false')
}).refine(data => data.instanceIds || data.instanceId || data.oldNamePattern, {
  message: 'Either instanceIds, instanceId, or oldNamePattern is required'
}).refine(data => data.newNamePrefix || data.baseName || data.newNamePattern, {
  message: 'Either newNamePrefix, baseName, or newNamePattern is required'
}).transform(data => ({
  instanceIds: data.instanceIds || (data.instanceId ? [data.instanceId] : undefined),
  oldNamePattern: data.oldNamePattern,  // Don't set default, let C# handle the logic
  newNamePrefix: data.newNamePrefix || data.baseName || data.newNamePattern || '',
  newNameSuffix: data.newNameSuffix,
  startNumber: data.startNumber ?? data.startIndex ?? 1,
  includeChildren: data.includeChildren
}));

/**
 * BatchRenameGameObjects Tool
 * Batch renames GameObjects
 */
@Tool({
  name: 'batch_rename_gameobjects',
  description: 'Batch renames GameObjects',
  category: 'gameobject',
  version: '1.0.0'
})
@Tags(['unity', 'gameobject', 'rename', 'batch'])
export class BatchRenameGameObjectsTool extends BaseTool {
  get name() {
    return 'batch_rename_gameobjects';
  }

  get description() {
    return 'Batch renames GameObjects';
  }

  get inputSchema() {
    return BatchRenameGameObjectsToolArgsSchema;
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
