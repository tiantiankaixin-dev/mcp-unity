import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for batch_rename_materials tool
 */
const BatchRenameMaterialsToolArgsSchema = z.object({
  folderPath: z.string().optional().default('Assets').describe('Folder path to search for materials. Default: "Assets"'),
  newNamePrefix: z.string().optional().default('Material_').describe('Prefix for renamed materials. Default: "Material_"'),
  startNumber: z.number().int().optional().default(1).describe('Starting number for sequential naming. Default: 1')
});

/**
 * BatchRenameMaterials Tool
 * Batch renames materials
 */
@Tool({
  name: 'batch_rename_materials',
  description: 'Batch renames materials',
  category: 'material',
  version: '1.0.0'
})
@Tags(['unity', 'material', 'rename', 'batch'])
export class BatchRenameMaterialsTool extends BaseTool {
  get name() {
    return 'batch_rename_materials';
  }

  get description() {
    return 'Batch renames materials';
  }

  get inputSchema() {
    return BatchRenameMaterialsToolArgsSchema;
  }

  get category() {
    return 'material';
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
