import { z } from 'zod';
import { DataTool } from '../base/BaseTool.js';
import { Tool } from '../base/ToolDecorators.js';
import { ToolRegistry } from '../base/ToolRegistry.js';

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'advanced': 'ProBuilder shapes',
  'animation': 'Animations & timeline',
  'asset': 'Asset management',
  'audio': 'Audio sources',
  'build': 'Project building',
  'camera': 'Cameras',
  'component': 'Component operations',
  'components': 'Add components',
  'debug': 'Debugging tools',
  'gameobject': 'GameObject management',
  'lighting': 'Lighting & baking',
  'material': 'Materials & colors',
  'menu': 'Menu execution',
  'meta': 'Meta tools',
  'physics': 'Physics & colliders',
  'prefab': 'Prefabs',
  'scene': 'Scene management',
  'scripting': 'C# scripts',
  'terrain': 'Terrain',
  'testing': 'Testing',
  'ui': 'UI elements',
  'vfx': 'Visual effects'
};

@Tool({
  name: 'list_categories',
  description: '📋 STEP 1: List all Unity tool categories. Use this first to explore available tools.',
  category: 'meta',
  version: '1.0.0'
})
export class ListCategoriesTool extends DataTool {
  get name() { return 'list_categories'; }
  get description() { return '📋 STEP 1: List all Unity tool categories. Use this first to explore available tools.'; }
  get inputSchema() { return z.object({}); }
  get category() { return 'meta'; }

  protected async execute(): Promise<any> {
    const categories = ToolRegistry.getCategories();
    const categorySummary: Record<string, { description: string; toolCount: number }> = {};
    let totalToolCount = 0;
    for (const cat of categories) {
      const toolClasses = ToolRegistry.getToolsByCategory(cat);
      if (!toolClasses || toolClasses.length === 0) continue;
      categorySummary[cat] = {
        description: CATEGORY_DESCRIPTIONS[cat] || 'Tools',
        toolCount: toolClasses.length,
      };
      totalToolCount += toolClasses.length;
    }
    const response = {
      _workflow: "📋 STEP 1/4: Choose category → STEP 2: get_tool_names({category}) → STEP 3: discover_and_use_batch (2+ tools, chain with $.{index}.field)",
      totalToolCount,
      categoryCount: Object.keys(categorySummary).length,
      categories: categorySummary,
    };
    return this.formatSuccessResponse(response);
  }
}



