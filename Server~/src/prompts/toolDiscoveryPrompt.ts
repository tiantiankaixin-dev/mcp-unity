import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

/**
 * Registers the tool discovery prompt with the MCP server.
 * This prompt guides AI on how to efficiently discover and use Unity MCP tools
 * using the hierarchical tool indexing system.
 * 
 * @param server The McpServer instance to register the prompt with.
 */
export function registerToolDiscoveryPrompt(server: McpServer) {
  server.prompt(
    'unity_tool_discovery',
    'REQUIRED: Complete guide for discovering and using Unity MCP tools through the MANDATORY hierarchical tool system - Read this for detailed workflow',
    {},
    async () => ({
      messages: [
        {
          role: 'user', 
          content: {
            type: 'text',
            text: `# Unity MCP Tool Discovery System

## ⚠️ MANDATORY SYSTEM ⚠️
This Unity MCP server implements a **REQUIRED hierarchical tool indexing system**. This is NOT optional!

## 🎯 Purpose
- **Optimize token usage** (80-90% reduction)
- **Enforce proper tool discovery workflow**
- **Prevent inefficient direct tool scanning**
- **Track and report workflow compliance**

## 📚 How to Discover Tools

### Step 1: Browse Tool Categories
**Resource:** \`unity://tool-categories\`
- Use this resource to see ALL available tool categories
- Each category shows: name, description, and tool count
- This gives you a high-level overview without loading detailed tool information

**Example categories:**
- \`animation\` - Animation clips, animators, blend trees
- \`ui\` - UI element creation (Canvas, Button, Panel, etc.)
- \`gameobject\` - GameObject management and hierarchy
- \`physics\` - Physics simulation, colliders, rigidbodies
- \`scripting\` - C# script creation and modification
- And many more...

### Step 2: Load Specific Category Tools
**Resource Template:** \`unity://tool-category/{category}\`
- Once you know which category you need, load its detailed tool information
- This shows all tools in that category with descriptions and metadata
- Only load categories relevant to your current task

**Examples:**
- \`unity://tool-category/ui\` - Load all UI tools
- \`unity://tool-category/animation\` - Load all animation tools
- \`unity://tool-category/physics\` - Load all physics tools

### Step 3: Use the Tools
- After loading a category, you can directly use any tool from that category
- Tools are always available; the category resources just help you discover them efficiently

## 🚀 Workflow Example

**Scenario:** User wants to create a UI button

1. **Discover:** Check \`unity://tool-categories\` → See "ui" category
2. **Load:** Access \`unity://tool-category/ui\` → See \`create_ui_button\` tool
3. **Use:** Call \`create_ui_button\` with appropriate parameters

## 💡 Best Practices

1. **Start Broad:** Always check tool categories first
2. **Load Smart:** Only load categories you need for the current task
3. **Reuse Knowledge:** If you already know which tools exist, use them directly
4. **Batch Operations:** If a task needs multiple categories, load them all at once

## ⚡ Token Optimization

**Without hierarchy:**
- AI sees 100+ tools with full descriptions = ~10,000+ tokens

**With hierarchy:**
- Browse categories = ~500 tokens
- Load 1-2 relevant categories = ~1,000-2,000 tokens
- **Total savings: ~80-90% reduction**

## 📖 Additional Resources

- \`unity://scenes_hierarchy\` - Scene GameObjects ⚠️ (large, use only when needed)
- \`unity://assets\` - Project assets (use filters when possible)
- \`unity://gameobject/{name}\` - GameObject details (detailed mode)
- \`unity://gameobject/{name}?simple=true\` - GameObject details ✨ (simplified, 85% less tokens)

## 🎓 Remember

The hierarchical tool system is designed to help you:
- Discover tools efficiently
- Reduce token consumption
- Focus on relevant tools for each task
- Maintain fast response times

## 💡 Token Optimization Tips

1. ⚠️ **REQUIRED**: Always start with \`unity://tool-categories\` when exploring new functionality
2. ⚠️ **REQUIRED**: Use simplified GameObject queries when you only need basic info:
   - Use \`?simple=true\` to get just name, ID, position, and component list
   - Saves 85% tokens compared to detailed mode
3. ⚠️ **FORBIDDEN**: Using \`unity://scenes_hierarchy\` unless absolutely necessary (very large)
4. ⚠️ **REQUIRED**: Load categories on-demand - only load what you need for the current task

## 🔒 Compliance Tracking

Your usage is monitored:
- Resource access is tracked
- Tool usage is logged
- Workflow violations generate warnings
- Statistics are available for review

**This ensures everyone follows best practices and maintains optimal performance.**`
          }
        }
      ]
    })
  );
}
