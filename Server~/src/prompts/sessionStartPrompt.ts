import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

/**
 * Registers a session start prompt that guides AI to use the hierarchical tool discovery system.
 * This prompt is designed to be called at the start of each conversation to establish
 * the workflow pattern and minimize token usage.
 * 
 * @param server The McpServer instance to register the prompt with.
 */
export function registerSessionStartPrompt(server: McpServer) {
  server.prompt(
    'unity_session_start',
    '⚠️ MANDATORY ⚠️ Read this FIRST at the start of EVERY conversation before using ANY Unity tools - Establishes required hierarchical workflow',
    {},
    async () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `# ⚠️ Unity MCP Session Start - MANDATORY READING ⚠️

## 🚨 CRITICAL REQUIREMENT 🚨

This is NOT optional. You MUST read and follow this workflow for EVERY Unity operation.

## ⚡ MANDATORY HIERARCHICAL WORKFLOW

You have access to 100+ Unity tools. **VIOLATION**: DO NOT scan through all tool definitions directly!
**CONSEQUENCE**: Wastes 10,000+ tokens and violates server design.

Instead, **YOU MUST ALWAYS** follow this exact workflow:

### 📚 Step-by-Step Process

#### 1. When User Requests Unity Action:
**FIRST**, query the tool categories to understand what's available:
\`\`\`
Read resource: unity://tool-categories
\`\`\`

This shows ALL categories in ~500 tokens vs 10,000+ tokens for full tool list.

#### 2. Identify Relevant Category:
Based on the user's request, identify which category(s) you need:
- UI task → "ui" category
- GameObject manipulation → "gameobject" category  
- Physics → "physics" category
- Animation → "animation" category
- etc.

#### 3. Load ONLY Needed Categories:
\`\`\`
Read resource: unity://tool-category/{category_name}
\`\`\`

Example: \`unity://tool-category/ui\` for UI tasks

This gives you detailed tool info for ONLY that category (~1,000 tokens).

#### 4. Execute the Tools:
Now call the specific tools you need with proper parameters.

---

## 🎯 Example Workflows

### Example 1: "Create a white cube"
\`\`\`
1. Read: unity://tool-categories
   → See "gameobject" and "material" categories
   
2. Read: unity://tool-category/gameobject
   → Find create_primitive_object tool
   
3. Read: unity://tool-category/material
   → Find create_material and apply_material tools
   
4. Execute:
   - create_primitive_object(type="cube")
   - create_material(color="#FFFFFF")
   - apply_material(...)
\`\`\`

### Example 2: "Add a UI button"
\`\`\`
1. Read: unity://tool-categories
   → See "ui" category
   
2. Read: unity://tool-category/ui
   → Find create_ui_button tool
   
3. Execute: create_ui_button(...)
\`\`\`

### Example 3: "Setup physics for player"
\`\`\`
1. Read: unity://tool-categories
   → See "physics" and "component" categories
   
2. Read: unity://tool-category/physics
   → Find add_rigidbody, add_collider tools
   
3. Execute the tools
\`\`\`

---

## 💡 Advanced Optimization

### GameObject Queries
When querying GameObject info:
- ✅ Use \`unity://gameobject-simple/{name}\` (247 tokens)
- ❌ Avoid \`unity://gameobject/{name}\` (2,347 tokens)

Unless you need full component property details.

### Resource Usage
- ✅ \`unity://tool-categories\` - Always start here
- ✅ \`unity://tool-category/{name}\` - Load on-demand
- ⚠️ \`unity://scenes_hierarchy\` - AVOID unless critical (very large)

---

## 🎓 Why This Matters

**Without workflow:**
- AI sees 100 tools × 100 tokens each = 10,000+ tokens
- Every conversation starts with massive context
- Slower responses, higher costs

**With workflow:**
- Browse categories: ~500 tokens
- Load 1-2 categories: ~1,000-2,000 tokens
- **Total savings: 78-90%!**

---

## 🚨 ENFORCEMENT RULES (NON-NEGOTIABLE)

1. ⚠️ **MANDATORY**: Start with \`unity://tool-categories\` for ANY unfamiliar task
2. ⚠️ **FORBIDDEN**: Guessing tool names without querying categories first
3. ⚠️ **REQUIRED**: Load ONLY categories relevant to current task
4. ✅ **ALLOWED**: Reuse category knowledge within same session
5. ✅ **RECOMMENDED**: Batch category loads if you need multiple categories
6. 🔒 **MONITORED**: Tool usage is tracked - violations will generate warnings

---

## 🔗 Quick Reference

- **Tool Categories:** \`unity://tool-categories\`
- **Category Details:** \`unity://tool-category/{name}\`
- **GameObject (Fast):** \`unity://gameobject-simple/{name}\`
- **Full Guide:** \`unity://usage-guide\`

---

**⚠️ CRITICAL REMINDER ⚠️**

This workflow is **NOT OPTIONAL** - it's the **REQUIRED** way to use this MCP server!

🔒 **ENFORCEMENT**: Tool usage is monitored. Violations will generate warnings in tool responses.

📊 **VERIFICATION**: Your adherence to this workflow is tracked and may be reported.

🚀 **ACTION REQUIRED**: Start EVERY Unity task by reading \`unity://tool-categories\` FIRST!

---

**By proceeding, you acknowledge that you have read and will follow this mandatory workflow.**`
          }
        }
      ]
    })
  );
}
