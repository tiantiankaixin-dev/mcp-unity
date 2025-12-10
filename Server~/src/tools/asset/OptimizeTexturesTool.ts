import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/**
 * Input schema for optimize_textures tool
 */
const OptimizeTexturesToolArgsSchema = z.object({
  folderPath: z.string().optional().default('Assets').describe('Folder path to scan for textures. Default: "Assets"'),
  maxSize: z.number().int().optional().default(2048).describe('Maximum texture size. Default: 2048'),
  compressionFormat: z.string().optional().default('Automatic').describe('Compression format. Default: "Automatic"'),
  generateMipmaps: z.boolean().optional().default(true).describe('Whether to generate mipmaps. Default: true')
});

/**
 * OptimizeTextures Tool
 * Optimizes textures
 */
@Tool({
  name: 'optimize_textures',
  description: 'Optimizes textures',
  category: 'asset',
  version: '1.0.0'
})
@Tags(['unity', 'asset', 'texture', 'optimize'])
export class OptimizeTexturesTool extends BaseTool {
  get name() {
    return 'optimize_textures';
  }

  get description() {
    return 'Optimizes textures';
  }

  get inputSchema() {
    return OptimizeTexturesToolArgsSchema;
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
