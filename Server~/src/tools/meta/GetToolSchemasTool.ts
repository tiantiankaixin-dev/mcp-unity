import { z } from 'zod';
import { DataTool } from '../base/BaseTool.js';
import { Tool } from '../base/ToolDecorators.js';
import { ToolRegistry } from '../base/ToolRegistry.js';
import { zodToReadableSchema } from '../../utils/zodToJsonSchema.js';

@Tool({
  name: 'get_tool_schemas',
  description: '📋 Get detailed parameter schemas for tools. Use after get_tool_names to get full definitions.',
  category: 'meta',
  version: '1.0.0'
})
export class GetToolSchemasTool extends DataTool {
  get name() { return 'get_tool_schemas'; }
  get description() { return '📋 Get detailed parameter schemas for tools. Use after get_tool_names to get full definitions.'; }
  get inputSchema() { 
    return z.object({ 
      tools: z.array(z.string()).describe('Tool names to get schemas for, e.g., ["create_primitive_object", "update_component"]')
    }); 
  }
  get category() { return 'meta'; }

  protected async execute(args: { tools: string[] }): Promise<any> {
    if (!args.tools || args.tools.length === 0) {
      return this.formatSuccessResponse({
        error: true,
        message: 'Provide tools array'
      });
    }

    // Build tool name to class map
    const toolMap = new Map<string, any>();
    for (const cat of ToolRegistry.getCategories()) {
      for (const ToolClass of ToolRegistry.getToolsByCategory(cat)) {
        try {
          const instance: any = new ToolClass(this.server, this.mcpUnity, this.logger);
          const name = instance.name || instance.getMetadata?.()?.name;
          if (name) toolMap.set(name, ToolClass);
        } catch (e) {}
      }
    }

    const results: Record<string, any> = {};
    const notFound: string[] = [];

    for (const toolName of args.tools) {
      const name = toolName.trim();
      const ToolClass = toolMap.get(name);
      
      if (!ToolClass) {
        notFound.push(name);
        continue;
      }

      try {
        const instance: any = new ToolClass(this.server, this.mcpUnity, this.logger);
        let parameters: any = {};
        
        try {
          const inputSchema = instance.inputSchema;
          if (inputSchema) {
            parameters = zodToReadableSchema(inputSchema);
          }
        } catch (e) {}
        
        results[name] = parameters;
      } catch (err) {
        results[name] = { error: 'Failed to load' };
      }
    }

    const response: any = {
      _next: "discover_and_use_batch (one call, all tools)",
      schemas: results
    };
    
    if (notFound.length > 0) {
      response._notFound = notFound;
    }

    return this.formatSuccessResponse(response);
  }
}
