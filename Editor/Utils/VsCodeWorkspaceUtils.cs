using System;
using System.IO;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Linq;

namespace McpUnity.Utils
{
    /// <summary>
    /// Manages VSCode-like IDE workspace integration for Unity projects
    /// </summary>
    public class VsCodeWorkspaceUtils
    {
        /// <summary>
        /// The default folder structure for code-workspace files
        /// </summary>
        private static readonly JArray DefaultFolders = JArray.Parse(@"[
            {
                ""path"": ""Assets""
            },
            {
                ""path"": ""Packages""
            },
            {
                ""path"": ""Library/PackageCache""
            }
        ]");

        /// <summary>
        /// Add MCP Unity configuration to VSCode settings.json
        /// VSCode uses a different format: settings.json with mcp.servers
        /// </summary>
        public static bool AddMcpConfigToVSCode(bool useTabsIndentation = false)
        {
            try
            {
                // Get the project root directory
                string projectRoot = Directory.GetParent(Application.dataPath).FullName;
                string vscodeDir = Path.Combine(projectRoot, ".vscode");
                string settingsPath = Path.Combine(vscodeDir, "settings.json");

                // Create .vscode directory if it doesn't exist
                if (!Directory.Exists(vscodeDir))
                {
                    Directory.CreateDirectory(vscodeDir);
                }

                // Get server path
                string serverPath = McpUtils.GetServerPath();
                if (string.IsNullOrEmpty(serverPath) || serverPath.Contains("Could not locate"))
                {
                    Debug.LogError("[MCP Unity] Could not locate Server directory for VSCode configuration.");
                    return false;
                }

                string indexPath = Path.Combine(serverPath, "build", "index.js");

                // Create MCP server configuration for VSCode
                JObject mcpConfig = new JObject
                {
                    ["mcp-unity"] = new JObject
                    {
                        ["command"] = "node",
                        ["args"] = new JArray { indexPath }
                    }
                };

                JObject settings;

                // If settings.json exists, update it
                if (File.Exists(settingsPath))
                {
                    string existingContent = File.ReadAllText(settingsPath);
                    settings = JObject.Parse(existingContent);

                    // Add or update mcp.servers
                    if (settings["mcp.servers"] == null)
                    {
                        settings["mcp.servers"] = new JObject();
                    }

                    // Merge MCP config
                    foreach (var property in mcpConfig)
                    {
                        settings["mcp.servers"][property.Key] = property.Value;
                    }
                }
                else
                {
                    // Create new settings.json
                    settings = new JObject
                    {
                        ["mcp.servers"] = mcpConfig
                    };
                }

                // Write settings.json
                var formatting = useTabsIndentation ? Formatting.Indented : Formatting.Indented;
                string jsonContent = settings.ToString(formatting);

                // Replace spaces with tabs if needed
                if (useTabsIndentation)
                {
                    jsonContent = ConvertSpacesToTabs(jsonContent);
                }

                File.WriteAllText(settingsPath, jsonContent);
                Debug.Log($"[MCP Unity] VSCode settings.json updated at {settingsPath}");
                return true;
            }
            catch (Exception ex)
            {
                Debug.LogError($"[MCP Unity] Error updating VSCode settings.json: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Convert spaces to tabs in JSON string
        /// </summary>
        private static string ConvertSpacesToTabs(string json)
        {
            var lines = json.Split('\n');
            for (int i = 0; i < lines.Length; i++)
            {
                int leadingSpaces = 0;
                while (leadingSpaces < lines[i].Length && lines[i][leadingSpaces] == ' ')
                {
                    leadingSpaces++;
                }

                if (leadingSpaces > 0)
                {
                    int tabs = leadingSpaces / 2; // Assuming 2 spaces per indent level
                    lines[i] = new string('\t', tabs) + lines[i].Substring(leadingSpaces);
                }
            }
            return string.Join("\n", lines);
        }
        
        /// <summary>
        /// Add the Library/PackageCache folder to the .code-workspace file if not already present
        /// This ensures that the Unity cache is available to code intelligence tools
        /// </summary>
        public static bool AddPackageCacheToWorkspace()
        {
            try
            {
                // Get the project root directory
                string projectRoot = Directory.GetParent(Application.dataPath).FullName;
                
                // Determine the workspace filename based on the project directory name
                string projectDirName = new DirectoryInfo(projectRoot).Name;
                string workspaceFilename = $"{projectDirName}.code-workspace";
                string workspacePath = Path.Combine(projectRoot, workspaceFilename);
                JObject workspaceConfig = new JObject
                {
                    ["folders"] = DefaultFolders.DeepClone(),
                    ["settings"] = new JObject()
                };
                
                // If file exists, update it rather than overwriting
                if (File.Exists(workspacePath))
                {
                    string existingContent = File.ReadAllText(workspacePath);
                    JObject existingWorkspace = JObject.Parse(existingContent);
                    
                    // Merge the new config with the existing one
                    MergeWorkspaceConfigs(existingWorkspace, workspaceConfig);
                    workspaceConfig = existingWorkspace;
                }
                
                // Write the updated workspace file
                File.WriteAllText(workspacePath, workspaceConfig.ToString(Formatting.Indented));
                Debug.Log($"[MCP Unity] Updated workspace configuration in {workspacePath}");
                return true;
            }
            catch (Exception ex)
            {
                Debug.LogError($"[MCP Unity] Error updating workspace file: {ex.Message}");
                return false;
            }
        }
        
        /// <summary>
        /// Merges a source workspace config into a target workspace config
        /// Ensures folders are uniquely added based on path properties
        /// </summary>
        private static void MergeWorkspaceConfigs(JObject target, JObject source)
        {
            // Merge folders array if both exist
            if (source["folders"] != null && source["folders"].Type == JTokenType.Array)
            {
                if (target["folders"] == null || target["folders"].Type != JTokenType.Array)
                {
                    target["folders"] = new JArray();
                }
                
                // Get existing folder paths
                var existingPaths = new HashSet<string>();
                foreach (var folder in target["folders"])
                {
                    if (folder.Type == JTokenType.Object && folder["path"] != null)
                    {
                        existingPaths.Add(folder["path"].ToString());
                    }
                }
                
                // Add new folders if they don't exist
                foreach (var folder in source["folders"])
                {
                    if (folder.Type == JTokenType.Object && folder["path"] != null)
                    {
                        string path = folder["path"].ToString();
                        if (!existingPaths.Contains(path))
                        {
                            ((JArray)target["folders"]).Add(folder.DeepClone());
                            existingPaths.Add(path);
                        }
                    }
                }
            }
            
            // Merge settings if both exist
            if (source["settings"] != null && source["settings"].Type == JTokenType.Object)
            {
                if (target["settings"] == null || target["settings"].Type != JTokenType.Object)
                {
                    target["settings"] = new JObject();
                }
                
                // Deep merge settings
                foreach (var property in (JObject)source["settings"])
                {
                    target["settings"][property.Key] = property.Value.DeepClone();
                }
            }
            
            // Merge any other top-level properties
            foreach (var property in source)
            {
                if (property.Key != "folders" && property.Key != "settings")
                {
                    target[property.Key] = property.Value.DeepClone();
                }
            }
        }
    }
}
