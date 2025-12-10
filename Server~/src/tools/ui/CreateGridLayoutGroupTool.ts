import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for create_grid_layout_group tool
 */
const CreateGridLayoutGroupToolArgsSchema = z.object({
  panelName: z.string().optional().default('GridPanel').describe('Name for the Grid Panel GameObject. Default: "GridPanel"'),
  posX: z.number().optional().default(0).describe('X position in canvas space. Default: 0'),
  posY: z.number().optional().default(0).describe('Y position in canvas space. Default: 0'),
  width: z.number().optional().default(400).describe('Width of the panel. Default: 400'),
  height: z.number().optional().default(300).describe('Height of the panel. Default: 300'),
  cellWidth: z.number().optional().default(100).describe('Width of each grid cell. Default: 100'),
  cellHeight: z.number().optional().default(100).describe('Height of each grid cell. Default: 100'),
  spacing: z.number().optional().default(10).describe('Spacing between grid cells. Default: 10')
});

/**
 * CreateGridLayoutGroup Tool
 * Creates a Grid Layout Group
 */
@Tool({
  name: 'create_grid_layout_group',
  description: 'Creates a Grid Layout Group',
  category: 'ui',
  version: '1.0.0'
})
@Tags(['unity', 'ui', 'layout'])
export class CreateGridLayoutGroupTool extends BaseTool {
  get name() {
    return 'create_grid_layout_group';
  }

  get description() {
    return 'Creates a Grid Layout Group';
  }

  get inputSchema() {
    return CreateGridLayoutGroupToolArgsSchema;
  }

  get category() {
    return 'ui';
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
