using System;
using System.Collections.Generic;
using System.Linq;
using McpUnity.Unity;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace McpUnity.Resources
{
    public class GetAllToolsResource : McpResourceBase
    {
        protected McpUnityServer Server { get; private set; }

        public GetAllToolsResource(McpUnityServer server)
        {
            Server = server;
            Uri = "unity://all-tools";
            Name = "get_all_tools";
            Description = "Get category overview with tool counts (no individual tool details). Use unity://tool-names/{category} to see tools in a category.";
        }

        public override JObject Fetch(JObject parameters)
        {
            try
            {
                var categorySummary = new Dictionary<string, object>();
                var toolCount = 0;

                // Get all tool categories
                var categories = new[]
                {
                    new { name = "scene", desc = "Scene management" },
                    new { name = "gameobject", desc = "GameObject management" },
                    new { name = "physics", desc = "Physics & colliders" },
                    new { name = "ui", desc = "UI elements" },
                    new { name = "scripting", desc = "C# scripts" },
                    new { name = "component", desc = "Component operations" },
                    new { name = "components", desc = "Add components" },
                    new { name = "material", desc = "Materials & colors" },
                    new { name = "camera", desc = "Cameras" },
                    new { name = "lighting", desc = "Lighting & baking" },
                    new { name = "audio", desc = "Audio sources" },
                    new { name = "animation", desc = "Animations & timeline" },
                    new { name = "prefab", desc = "Prefabs" },
                    new { name = "asset", desc = "Asset management" },
                    new { name = "terrain", desc = "Terrain" },
                    new { name = "vfx", desc = "Visual effects" },
                    new { name = "build", desc = "Project building" },
                    new { name = "testing", desc = "Testing" },
                    new { name = "debug", desc = "Debugging tools" },
                    new { name = "menu", desc = "Menu execution" },
                    new { name = "advanced", desc = "ProBuilder shapes" },
                    new { name = "meta", desc = "Meta tools" }
                };

                // Get all registered tools from server
                var allRegisteredTools = Server.GetAllTools();

                // Count tools per category (don't include individual tool details)
                foreach (var category in categories)
                {
                    int categoryToolCount = 0;

                    // Count tools in this category
                    foreach (var tool in allRegisteredTools.Values)
                    {
                        var toolCategory = GetToolCategory(tool.Name);
                        if (toolCategory == category.name)
                        {
                            categoryToolCount++;
                            toolCount++;
                        }
                    }

                    if (categoryToolCount > 0)
                    {
                        categorySummary[category.name] = new
                        {
                            description = category.desc,
                            toolCount = categoryToolCount
                        };
                    }
                }

                var result = new
                {
                    _workflow = "📋 STEP 1/4: Choose category → STEP 2: get_tool_names({category}) → STEP 3: discover_and_use_batch (2+ tools, chain with $.{index}.field)",
                    totalToolCount = toolCount,
                    categoryCount = categorySummary.Count,
                    categories = categorySummary
                };

                return JObject.FromObject(result);
            }
            catch (Exception ex)
            {
                return new JObject
                {
                    ["error"] = true,
                    ["message"] = $"Failed to get all tools: {ex.Message}",
                    ["stackTrace"] = ex.StackTrace
                };
            }
        }

        private string GetToolCategory(string toolName)
        {
            // Scene tools
            if (toolName.Contains("scene") || toolName == "save_scene" || toolName == "add_scenes_to_build")
                return "scene";

            // GameObject tools
            if (toolName.Contains("gameobject") || toolName.Contains("primitive") || toolName.Contains("empty") ||
                toolName == "select_gameobject" || toolName == "update_gameobject" || toolName == "group_gameobjects" ||
                toolName == "align_gameobjects" || toolName == "distribute_gameobjects" || toolName == "replace_gameobjects" ||
                toolName == "batch_rename_gameobjects" || toolName == "cleanup_empty_gameobjects" || toolName == "set_active_state" ||
                toolName == "set_layer" || toolName == "set_tag" || toolName == "copy_transform" || toolName == "snap_to_grid" ||
                toolName == "randomize_transform" || toolName == "delete_gameobject" || toolName == "duplicate_gameobject" ||
                toolName == "set_parent" || toolName == "find_gameobjects")
                return "gameobject";

            // Physics tools
            if (toolName.Contains("rigidbody") || toolName.Contains("collider") || toolName.Contains("physics") ||
                toolName.Contains("navmesh") || toolName.Contains("joint") || toolName.Contains("force") ||
                toolName == "raycast" || toolName == "overlap_sphere")
                return "physics";

            // UI tools
            if (toolName.Contains("ui_") || toolName.Contains("create_event_system") || toolName.Contains("toggle_panel"))
                return "ui";

            // Scripting tools
            if (toolName.Contains("script") || toolName == "recompile_scripts")
                return "scripting";

            // Component tools
            if (toolName.Contains("component") && !toolName.Contains("add_"))
                return "component";

            // Add component tools
            if (toolName.StartsWith("add_") && !toolName.Contains("scene"))
                return "components";

            // Material tools
            if (toolName.Contains("material") || toolName.Contains("color") || toolName.Contains("shader"))
                return "material";

            // Camera tools
            if (toolName.Contains("camera"))
                return "camera";

            // Lighting tools
            if (toolName.Contains("light") || toolName.Contains("bake"))
                return "lighting";

            // Audio tools
            if (toolName.Contains("audio") || toolName.Contains("sound"))
                return "audio";

            // Animation tools
            if (toolName.Contains("animation") || toolName.Contains("animator") || toolName.Contains("timeline"))
                return "animation";

            // Prefab tools
            if (toolName.Contains("prefab"))
                return "prefab";

            // Asset tools
            if (toolName.Contains("asset") || toolName.Contains("import") || toolName.Contains("export"))
                return "asset";

            // Terrain tools
            if (toolName.Contains("terrain"))
                return "terrain";

            // VFX tools
            if (toolName.Contains("vfx") || toolName.Contains("particle"))
                return "vfx";

            // Build tools
            if (toolName.Contains("build"))
                return "build";

            // Testing tools
            if (toolName.Contains("test"))
                return "testing";

            // Debug tools
            if (toolName.Contains("debug") || toolName.Contains("log"))
                return "debug";

            // Menu tools
            if (toolName.Contains("menu"))
                return "menu";

            // Advanced tools
            if (toolName.Contains("probuilder"))
                return "advanced";

            // Meta tools
            if (toolName.Contains("discover_and_use"))
                return "meta";

            return "other";
        }
    }
}
