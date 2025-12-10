import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

const TakeScreenshotToolArgsSchema = z.object({
  source: z.enum(['scene', 'game']).optional().default('scene').describe('Source: "scene" for Scene View, "game" for Game View (requires Play mode). Default: "scene"'),
  width: z.number().int().min(100).max(4096).optional().default(800).describe('Screenshot width. Default: 800'),
  height: z.number().int().min(100).max(4096).optional().default(600).describe('Screenshot height. Default: 600'),
  saveToFile: z.boolean().optional().default(true).describe('Save to file for AI to read. Default: true'),
  folder: z.string().optional().default('Assets/Screenshots').describe('Folder to save screenshot'),
  filename: z.string().optional().describe('Filename. Auto-generated if not provided.')
});

@Tool({
  name: 'take_screenshot',
  description: 'Take a screenshot and return as image for AI to view.',
  category: 'debug',
  version: '1.0.0'
})
@Tags(['unity', 'debug', 'screenshot', 'capture', 'image', 'view'])
export class TakeScreenshotTool extends BaseTool {
  get name() { return 'take_screenshot'; }
  get description() { return 'Take a screenshot from Scene View or Game View and return as image data for AI to view.'; }
  get inputSchema() { return TakeScreenshotToolArgsSchema; }
  get category() { return 'debug'; }

  protected formatSuccessResponse(result: any): CallToolResult {
    const content: any[] = [];
    
    // Add text message with path info for AI to read the file
    let message = `✅ ${result.message || 'Screenshot captured'} (${result.width}x${result.height})`;
    
    if (result.absolutePath) {
      message += `\n📁 File: ${result.absolutePath}`;
      message += `\n💡 Use read_file tool to view the screenshot.`;
    }

    content.push({
      type: 'text',
      text: message
    });

    // Add image if base64 data is available (when not saved to file)
    if (result.imageBase64) {
      content.push({
        type: 'image',
        data: result.imageBase64,
        mimeType: result.mimeType || 'image/png'
      });
    }

    return { content };
  }
}
