import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for create_folder_structure tool
 */
const CreateFolderStructureToolArgsSchema = z.object({
  rootPath: z.string().optional().default('Assets').describe('Root path for folder structure. Default: "Assets"'),
  folderNames: z.array(z.string()).optional().describe('Array of folder names to create. If not provided, creates default Unity folders')
});

/**
 * CreateFolderStructure Tool
 * Creates folder structure
 */
@Tool({
  name: 'create_folder_structure',
  description: 'Creates folder structure',
  category: 'asset',
  version: '1.0.0'
})
@Tags(['unity', 'asset', 'folder', 'organization'])
export class CreateFolderStructureTool extends BaseTool {
  get name() {
    return 'create_folder_structure';
  }

  get description() {
    return 'Creates folder structure';
  }

  get inputSchema() {
    return CreateFolderStructureToolArgsSchema;
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
