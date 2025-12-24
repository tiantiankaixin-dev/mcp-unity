import { z } from 'zod';
import { DataTool } from '../base/BaseTool.js';
import { Tool } from '../base/ToolDecorators.js';
import { ToolRegistry } from '../base/ToolRegistry.js';

@Tool({
  name: 'get_tool_names',
  description: '📋 STEP 2: Get tool names and descriptions. Supports multiple categories in one call. 📖 unity_tool_discovery',
  category: 'meta',
  version: '1.0.0'
})
export class GetToolNamesTool extends DataTool {
  get name() { return 'get_tool_names'; }
  get description() { return '📋 STEP 2: Get tool names and descriptions. Supports multiple categories in one call. 📖 unity_tool_discovery'; }
  get inputSchema() { 
    return z.object({ 
      category: z.string().optional().describe('Single category name'),
      categories: z.array(z.string()).optional().describe('Multiple categories array, e.g., ["gameobject", "component", "material"]')
    }); 
  }
  get category() { return 'meta'; }

  protected async execute(args: { category?: string; categories?: string[] }): Promise<any> {
    const allCategories = ToolRegistry.getCategories();
    
    // Support both single category and multiple categories
    let requestedCategories: string[] = [];
    if (args.categories && args.categories.length > 0) {
      requestedCategories = args.categories;
    } else if (args.category) {
      requestedCategories = [args.category.trim()];
    } else {
      return this.formatSuccessResponse({
        error: true,
        message: 'Provide category or categories',
        availableCategories: allCategories
      });
    }

    const results: Record<string, any[]> = {};
    const invalidCategories: string[] = [];

    for (const category of requestedCategories) {
      const cat = category.trim();
      if (!allCategories.includes(cat)) {
        invalidCategories.push(cat);
        continue;
      }

      const toolClasses = ToolRegistry.getToolsByCategory(cat);
      results[cat] = toolClasses.map((ToolClass: any) => {
        try {
          const instance: any = new ToolClass(this.server, this.mcpUnity, this.logger);
          const metadata = instance.getMetadata?.() || {};
          return {
            name: metadata.name || instance.name || 'unknown',
            desc: metadata.description || instance.description || ''
          };
        } catch (err) {
          return { name: 'unknown', desc: '' };
        }
      });
    }

    const response: any = {
      _next: "get_tool_schemas([tools]) or discover_and_use_batch",
      ...results
    };
    
    if (invalidCategories.length > 0) {
      response._invalid = invalidCategories;
    }

    return this.formatSuccessResponse(response);
  }
}

