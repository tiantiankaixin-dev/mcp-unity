// Constants for the resource
const resourceName = 'get_getting_started';
const resourceUri = 'unity://tool-category/getting-started';
const resourceMimeType = 'text/markdown';
/**
 * Creates and registers the Getting Started guide as a virtual tool category
 * This appears first in the categories list to guide new users
 *
 * @param server The MCP server instance to register with
 * @param logger The logger instance for diagnostic information
 */
export function registerGetGettingStartedResource(server, logger) {
    logger.info(`Registering resource: ${resourceName}`);
    // Register this resource with the MCP server
    server.resource(resourceName, resourceUri, {
        description: '⭐ START HERE! Essential guide for efficiently using Unity MCP tools and optimizing token usage.',
        mimeType: resourceMimeType
    }, async () => {
        try {
            return await resourceHandler(logger);
        }
        catch (error) {
            logger.error(`Error handling resource ${resourceName}: ${error}`);
            throw error;
        }
    });
}
/**
 * Handles requests for the getting started guide
 *
 * @param logger The logger instance for diagnostic information
 * @returns A promise that resolves to the getting started guide content
 */
async function resourceHandler(logger) {
    const guideContent = `# 🚀 Unity MCP Getting Started Guide

## ⚡ Quick Start (Saves 80-90% Tokens!)

Welcome to Unity MCP! This guide will help you use tools efficiently and minimize token consumption.

## 📚 How to Discover and Use Tools

### Step 1: Browse Categories
**Resource:** \`unity://tool-categories\`
- See ALL available tool categories in one compact view
- Each category shows name, description, and tool count
- Only ~500 tokens instead of 10,000+

**Example output:**
\`\`\`json
{
  "total": 100,
  "categories": [
    {"name": "ui", "desc": "UI elements", "count": 15},
    {"name": "physics", "desc": "Physics & colliders", "count": 12}
  ]
}
\`\`\`

### Step 2: Load Specific Categories
**Resource:** \`unity://tool-category/{category}\`
- Load detailed information for ONE category at a time
- Shows all tools with full descriptions and parameters
- Only load what you need for your current task

**Examples:**
- \`unity://tool-category/ui\` - All UI tools (buttons, panels, etc.)
- \`unity://tool-category/physics\` - All physics tools (rigidbody, colliders, etc.)
- \`unity://tool-category/animation\` - All animation tools

### Step 3: Use the Tools
- After loading a category, directly call any tool from that category
- All 100 tools are always available - categories just help you find them

## 🎯 Workflow Example

**Task: Create a UI button**

1. **Discover:** \`unity://tool-categories\` → See "ui" category
2. **Load:** \`unity://tool-category/ui\` → See \`create_ui_button\` tool
3. **Use:** Call \`create_ui_button\` with parameters

## 💡 Token Optimization Tips

### 1. GameObject Queries
**Use simplified mode when possible:**
- ❌ \`unity://gameobject/{name}\` - Detailed (2,347 tokens)
- ✅ \`unity://gameobject-simple/{name}\` - Basic info (247 tokens)
- **Saves 85% tokens!**

Simplified mode gives you: name, ID, position, component list
Detailed mode adds: all component properties, hierarchy info, etc.

### 2. Avoid Expensive Resources
- ❌ \`unity://scenes_hierarchy\` - Very large, avoid unless absolutely needed
- ✅ Use targeted GameObject queries instead

### 3. Category Loading Strategy
- ✅ Load categories on-demand
- ✅ Batch load if you need multiple categories
- ❌ Don't reload categories you already know

## 📖 Available Tool Categories

Here are the main categories (see \`unity://tool-categories\` for complete list):

- **ui** - Buttons, panels, text, images, sliders, etc.
- **gameobject** - Create, modify, organize GameObjects
- **physics** - Rigidbodies, colliders, forces, joints
- **animation** - Animation clips, animators, blend trees
- **material** - Materials, shaders, colors
- **scripting** - Create, modify, validate C# scripts
- **scene** - Scene management and navigation
- **camera** - Cameras and Cinemachine
- **audio** - Audio sources and clips
- **lighting** - Lights, baking, reflection probes
- **build** - Building and player settings
- **asset** - Asset management and optimization

## 🎓 Best Practices

1. **Start with categories** - Always check \`unity://tool-categories\` first
2. **Load selectively** - Only load categories you need
3. **Use simplified mode** - For GameObjects when you don't need full details
4. **Batch operations** - Load multiple categories at once if needed
5. **Reuse knowledge** - Don't reload categories you already explored

## 📊 Token Savings Comparison

**Traditional approach:**
- Load all 100 tool definitions: ~10,000 tokens
- Query GameObject detailed: ~2,347 tokens
- **Total: ~12,347 tokens**

**Optimized approach:**
- Browse categories: ~500 tokens
- Load 1-2 categories: ~1,000-2,000 tokens
- Query GameObject simplified: ~247 tokens
- **Total: ~1,747-2,747 tokens**

**Savings: 78-85% reduction! 🎉**

## 🔗 Important Resources

- \`unity://tool-categories\` - Browse all categories
- \`unity://tool-category/{name}\` - Load specific category
- \`unity://gameobject-simple/{name}\` - Fast GameObject lookup
- \`unity://usage-guide\` - Complete usage documentation

## ⚠️ Remember

- The 📖 icon in tool descriptions points here for guidance
- System loads tool definitions once per conversation
- Optimization saves tokens in YOUR queries and responses
- Categories help organize, but all tools are always available

---

**Ready to start?** Try: \`unity://tool-categories\`
`;
    return {
        contents: [{
                uri: resourceUri,
                mimeType: resourceMimeType,
                text: guideContent
            }]
    };
}
