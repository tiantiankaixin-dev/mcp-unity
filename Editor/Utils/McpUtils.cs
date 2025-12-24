using System;
using System.IO;
using System.Collections.Generic;
using McpUnity.Unity;
using UnityEngine;
using UnityEditor;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace McpUnity.Utils
{
    /// <summary>
    /// Utility class for MCP configuration operations
    /// </summary>
    /// <summary>
    /// Utility class for MCP configuration and system operations
    /// </summary>
    public static class McpUtils
    {
        /// <summary>
        /// Generates the MCP configuration JSON to setup the Unity MCP server in different AI Clients
        /// </summary>
        public static string GenerateMcpConfigJson(bool useTabsIndentation)
        {
            string serverPath = GetServerPath();

            // Check if server path was found
            if (string.IsNullOrEmpty(serverPath))
            {
                Debug.LogError("[MCP Unity] Cannot generate config: Server~ directory not found!");
                return null;
            }

            string serverIndexPath = Path.Combine(serverPath, "build", "index.js");

            // Verify that index.js exists
            if (!File.Exists(serverIndexPath))
            {
                Debug.LogError($"[MCP Unity] Cannot generate config: index.js not found at {serverIndexPath}");
                Debug.LogError("[MCP Unity] Please run 'npm install' and 'npm run build' in the Server~ directory");
                return null;
            }

            Debug.Log($"[MCP Unity] Generating config with server path: {serverIndexPath}");

            var config = new Dictionary<string, object>
            {
                { "mcpServers", new Dictionary<string, object>
                    {
                        { "mcp-unity", new Dictionary<string, object>
                            {
                                { "command", "node" },
                                { "args", new[] { serverIndexPath } },
                                { "env", new Dictionary<string, string>
                                    {
                                        { "UNITY_PORT", "8090" },
                                        { "TRANSPORT_MODE", "stdio" },
                                        { "LOG_LEVEL", "INFO" }
                                    }
                                }
                            }
                        }
                    }
                }
            };

            // Initialize string writer with proper indentation
            var stringWriter = new StringWriter();
            using (var jsonWriter = new JsonTextWriter(stringWriter))
            {
                jsonWriter.Formatting = Formatting.Indented;

                // Set indentation character and count
                if (useTabsIndentation)
                {
                    jsonWriter.IndentChar = '\t';
                    jsonWriter.Indentation = 1;
                }
                else
                {
                    jsonWriter.IndentChar = ' ';
                    jsonWriter.Indentation = 2;
                }

                // Serialize directly to the JsonTextWriter
                var serializer = new JsonSerializer();
                serializer.Serialize(jsonWriter, config);
            }

            return stringWriter.ToString().Replace("\\", "/").Replace("//", "/");
        }

        /// <summary>
        /// Gets the absolute path to the Server directory containing package.json (root server dir).
        /// Works whether MCP Unity is installed via Package Manager or directly in the Assets folder
        /// </summary>
        public static string GetServerPath()
        {
            // Strategy 1: Try to find via this script's location (most reliable for Assets installation)
            string[] scriptGuids = AssetDatabase.FindAssets("t:Script McpUtils");
            if (scriptGuids.Length > 0)
            {
                string scriptPath = AssetDatabase.GUIDToAssetPath(scriptGuids[0]);
                Debug.Log($"[MCP Unity] Found McpUtils at: {scriptPath}");

                string fullScriptPath = Path.GetFullPath(Path.Combine(Application.dataPath, "..", scriptPath));
                Debug.Log($"[MCP Unity] Full script path: {fullScriptPath}");

                // Navigate up from Editor/Utils/McpUtils.cs to the package root
                string packageRoot = Path.GetDirectoryName(Path.GetDirectoryName(Path.GetDirectoryName(fullScriptPath)));
                Debug.Log($"[MCP Unity] Package root: {packageRoot}");

                string serverPath = Path.Combine(packageRoot, "Server~");
                Debug.Log($"[MCP Unity] Checking server path: {serverPath}");

                if (Directory.Exists(serverPath))
                {
                    Debug.Log($"[MCP Unity] ✅ Found Server~ at: {serverPath}");
                    return CleanPathPrefix(serverPath);
                }
                else
                {
                    Debug.LogWarning($"[MCP Unity] Server~ directory not found at: {serverPath}");
                }
            }

            // Strategy 2: Try to find the package info via Package Manager
            var packageInfo = UnityEditor.PackageManager.PackageInfo.FindForAssetPath($"Packages/{McpUnitySettings.PackageName}");

            if (packageInfo != null && !string.IsNullOrEmpty(packageInfo.resolvedPath))
            {
                string serverPath = Path.Combine(packageInfo.resolvedPath, "Server~");
                if (Directory.Exists(serverPath))
                {
                    Debug.Log($"[MCP Unity] ✅ Found Server~ via Package Manager at: {serverPath}");
                    return CleanPathPrefix(serverPath);
                }
            }

            // Strategy 3: Try to find in Assets/mcp/mcp-unity folder
            string assetsServerPath = Path.Combine(Application.dataPath, "mcp", "mcp-unity", "Server~");
            Debug.Log($"[MCP Unity] Checking Assets/mcp/mcp-unity: {assetsServerPath}");
            if (Directory.Exists(assetsServerPath))
            {
                Debug.Log($"[MCP Unity] ✅ Found Server~ in Assets/mcp/mcp-unity at: {assetsServerPath}");
                return CleanPathPrefix(assetsServerPath);
            }

            // Strategy 4: Fallback - Try to find in Assets/mcp-unity folder
            string assetsServerPath2 = Path.Combine(Application.dataPath, "mcp-unity", "Server~");
            Debug.Log($"[MCP Unity] Checking Assets/mcp-unity: {assetsServerPath2}");
            if (Directory.Exists(assetsServerPath2))
            {
                Debug.Log($"[MCP Unity] ✅ Found Server~ in Assets/mcp-unity at: {assetsServerPath2}");
                return CleanPathPrefix(assetsServerPath2);
            }

            // Strategy 5: Try Packages folder
            string packagesServerPath = Path.GetFullPath(Path.Combine(Application.dataPath, "..", "Packages", "mcp-unity", "Server~"));
            Debug.Log($"[MCP Unity] Checking Packages/mcp-unity: {packagesServerPath}");
            if (Directory.Exists(packagesServerPath))
            {
                Debug.Log($"[MCP Unity] ✅ Found Server~ in Packages/mcp-unity at: {packagesServerPath}");
                return CleanPathPrefix(packagesServerPath);
            }

            // If we get here, we couldn't find the server path
            var errorString = "[MCP Unity] ❌ Could not locate Server~ directory. Please check the installation of the MCP Unity package.";

            Debug.LogError(errorString);
            Debug.LogError($"[MCP Unity] Searched locations:\n" +
                          $"1. Script location strategy\n" +
                          $"2. Package Manager\n" +
                          $"3. {assetsServerPath}\n" +
                          $"4. {assetsServerPath2}\n" +
                          $"5. {packagesServerPath}");

            return null; // Return null instead of error string to prevent invalid config generation
        }

        /// <summary>
        /// Cleans the path prefix by removing a leading "~" character if present on macOS.
        /// </summary>
        /// <param name="path">The path to clean.</param>
        /// <returns>The cleaned path.</returns>
        private static string CleanPathPrefix(string path)
        {
            if (path.StartsWith("~"))
            {
                return path.Substring(1);
            }
            return path;
        }

        /// <summary>
        /// Normalizes a Unity asset path by ensuring it starts with "Assets/".
        /// This allows users to provide paths like "Materials" instead of "Assets/Materials".
        /// </summary>
        /// <param name="path">The path to normalize.</param>
        /// <returns>The normalized path starting with "Assets/" or "Assets".</returns>
        public static string NormalizeAssetPath(string path)
        {
            if (string.IsNullOrEmpty(path))
            {
                return "Assets";
            }
            
            // Already properly formatted
            if (path.StartsWith("Assets/") || path.StartsWith("Assets\\") || path == "Assets")
            {
                return path.Replace("\\", "/");
            }
            
            // Prepend "Assets/"
            return "Assets/" + path.Replace("\\", "/");
        }

        /// <summary>
        /// Ensures a folder path exists, creating it if necessary.
        /// Automatically normalizes the path to start with "Assets/".
        /// </summary>
        /// <param name="folderPath">The folder path to ensure exists.</param>
        /// <returns>The normalized folder path.</returns>
        public static string EnsureFolderExists(string folderPath)
        {
            string normalizedPath = NormalizeAssetPath(folderPath);
            
            if (!AssetDatabase.IsValidFolder(normalizedPath))
            {
                string[] folders = normalizedPath.Split('/');
                string currentPath = folders[0]; // "Assets"
                
                for (int i = 1; i < folders.Length; i++)
                {
                    string newPath = currentPath + "/" + folders[i];
                    if (!AssetDatabase.IsValidFolder(newPath))
                    {
                        AssetDatabase.CreateFolder(currentPath, folders[i]);
                    }
                    currentPath = newPath;
                }
            }
            
            return normalizedPath;
        }

        /// <summary>
        /// Adds the MCP configuration to the Windsurf MCP config file
        /// </summary>
        public static bool AddToWindsurfIdeConfig(bool useTabsIndentation)
        {
            string configFilePath = GetWindsurfMcpConfigPath();
            return AddToConfigFile(configFilePath, useTabsIndentation, "Windsurf");
        }
        
        /// <summary>
        /// Adds the MCP configuration to the Claude Desktop config file
        /// </summary>
        public static bool AddToClaudeDesktopConfig(bool useTabsIndentation)
        {
            string configFilePath = GetClaudeDesktopConfigPath();
            return AddToConfigFile(configFilePath, useTabsIndentation, "Claude Desktop");
        }
        
        /// <summary>
        /// Adds the MCP configuration to the Cursor config file
        /// </summary>
        public static bool AddToCursorConfig(bool useTabsIndentation)
        {
            string configFilePath = GetCursorConfigPath();
            return AddToConfigFile(configFilePath, useTabsIndentation, "Cursor");
        }
        
        /// <summary>
        /// Adds the MCP configuration to the Claude Code config file
        /// </summary>
        public static bool AddToClaudeCodeConfig(bool useTabsIndentation)
        {
            string configFilePath = GetClaudeCodeConfigPath();
            return AddToConfigFile(configFilePath, useTabsIndentation, "Claude Code");
        }

        /// <summary>
        /// Adds the MCP configuration to the GitHub Copilot config file
        /// </summary>
        public static bool AddToGitHubCopilotConfig(bool useTabsIndentation)
        {
            string configFilePath = GetGitHubCopilotConfigPath();
            return AddToConfigFile(configFilePath, useTabsIndentation, "GitHub Copilot");
        }

        /// <summary>
        /// Adds the MCP configuration to the Antigravity config file
        /// </summary>
        public static bool AddToAntigravityConfig(bool useTabsIndentation)
        {
            string configFilePath = GetAntigravityConfigPath();
            return AddToConfigFile(configFilePath, useTabsIndentation, "Antigravity");
        }
        
        /// <summary>
        /// Adds the MCP configuration to Augment
        /// Uses Node.js script to generate configuration (more reliable than Unity API)
        /// </summary>
        public static bool AddToAugmentConfig(bool useTabsIndentation)
        {
            // Use Node.js script to generate configuration
            // This is more reliable than using Unity API which may not work in all contexts
            string packagePath = GetPackageRootPath();
            if (string.IsNullOrEmpty(packagePath))
            {
                Debug.LogError("❌ 无法找到mcp-unity包路径！");
                return false;
            }

            string scriptPath = Path.Combine(packagePath, "generate-augment-config.js");
            if (!File.Exists(scriptPath))
            {
                Debug.LogError($"❌ 配置生成脚本不存在: {scriptPath}");
                return false;
            }

            try
            {
                // Run the Node.js script to generate configuration
                var processInfo = new System.Diagnostics.ProcessStartInfo
                {
                    FileName = "node",
                    Arguments = $"\"{scriptPath}\"",
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    CreateNoWindow = true,
                    WorkingDirectory = packagePath
                };

                using (var process = System.Diagnostics.Process.Start(processInfo))
                {
                    string output = process.StandardOutput.ReadToEnd();
                    string error = process.StandardError.ReadToEnd();
                    process.WaitForExit();

                    if (process.ExitCode == 0)
                    {
                        Debug.Log("✅ MCP配置已生成并复制到剪贴板！\n\n" + output);

                        // Also try to write to Augment config file
                        string configFilePath = GetAugmentConfigPath();
                        if (!string.IsNullOrEmpty(configFilePath))
                        {
                            string generatedConfigPath = Path.Combine(packagePath, "augment-config.json");
                            if (File.Exists(generatedConfigPath))
                            {
                                try
                                {
                                    string configContent = File.ReadAllText(generatedConfigPath);

                                    // Try to merge with existing config
                                    if (File.Exists(configFilePath))
                                    {
                                        string existingConfig = File.ReadAllText(configFilePath);
                                        // Simple merge: just add our server to mcpServers
                                        // This is a simplified approach - in production you'd want proper JSON merging
                                        File.WriteAllText(configFilePath, configContent);
                                        Debug.Log($"✅ 配置已写入Augment配置文件: {configFilePath}");
                                    }
                                    else
                                    {
                                        File.WriteAllText(configFilePath, configContent);
                                        Debug.Log($"✅ 配置已写入Augment配置文件: {configFilePath}");
                                    }
                                }
                                catch (Exception ex)
                                {
                                    Debug.LogWarning($"⚠️ 无法写入Augment配置文件: {ex.Message}\n请手动导入剪贴板中的配置");
                                }
                            }
                        }

                        return true;
                    }
                    else
                    {
                        Debug.LogError($"❌ 配置生成失败:\n{error}");
                        return false;
                    }
                }
            }
            catch (Exception ex)
            {
                Debug.LogError($"❌ 运行配置生成脚本时出错: {ex.Message}\n\n" +
                              "请确保已安装Node.js并添加到PATH环境变量");
                return false;
            }
        }

        /// <summary>
        /// Gets the root path of the mcp-unity package
        /// </summary>
        private static string GetPackageRootPath()
        {
            // Try Package Manager first
            var packageInfo = UnityEditor.PackageManager.PackageInfo.FindForAssetPath($"Packages/{McpUnitySettings.PackageName}");
            if (packageInfo != null && !string.IsNullOrEmpty(packageInfo.resolvedPath))
            {
                return packageInfo.resolvedPath;
            }

            // Try to find via this script's location
            string[] scriptGuids = AssetDatabase.FindAssets("t:Script McpUtils");
            if (scriptGuids.Length > 0)
            {
                string scriptPath = AssetDatabase.GUIDToAssetPath(scriptGuids[0]);
                string fullScriptPath = Path.GetFullPath(Path.Combine(Application.dataPath, "..", scriptPath));

                // Navigate up from Editor/Utils/McpUtils.cs to the package root
                return Path.GetDirectoryName(Path.GetDirectoryName(Path.GetDirectoryName(fullScriptPath)));
            }

            return null;
        }

        /// <summary>
        /// Gets the path to the Antigravity config file based on the current OS
        /// </summary>
        /// <returns>The path to the Antigravity MCP config file</returns>
        private static string GetAntigravityConfigPath()
        {
            // Base path depends on the OS
            string basePath;
            
            if (Application.platform == RuntimePlatform.WindowsEditor)
            {
                // Windows: %USERPROFILE%/.gemini/antigravity/mcp_config.json
                string userProfile = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
                basePath = Path.Combine(userProfile, ".gemini", "antigravity");
            }
            else if (Application.platform == RuntimePlatform.OSXEditor)
            {
                // macOS: ~/.gemini/antigravity/mcp_config.json
                string homeDir = Environment.GetFolderPath(Environment.SpecialFolder.Personal);
                basePath = Path.Combine(homeDir, ".gemini", "antigravity");
            }
            else
            {
                // Linux: ~/.gemini/antigravity/mcp_config.json
                string homeDir = Environment.GetFolderPath(Environment.SpecialFolder.Personal);
                basePath = Path.Combine(homeDir, ".gemini", "antigravity");
            }
            
            // Return the path to the mcp_config.json file
            return Path.Combine(basePath, "mcp_config.json");
        }
        
        /// <summary>
        /// Gets the path to the Augment config file based on the current OS
        /// </summary>
        /// <returns>The path to the Augment config file, or null if not found</returns>
        private static string GetAugmentConfigPath()
        {
            string[] possiblePaths;

            if (Application.platform == RuntimePlatform.WindowsEditor)
            {
                // Windows: Try multiple possible locations
                string appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
                string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);

                possiblePaths = new string[]
                {
                    Path.Combine(appData, "Code", "User", "globalStorage", "augment.augment-vscode", "mcp-settings.json"),
                    Path.Combine(localAppData, "Programs", "augment", "mcp_settings.json"),
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), ".config", "augment", "mcp_settings.json")
                };
            }
            else if (Application.platform == RuntimePlatform.OSXEditor)
            {
                // macOS: Try multiple possible locations
                string homeDir = Environment.GetFolderPath(Environment.SpecialFolder.Personal);

                possiblePaths = new string[]
                {
                    Path.Combine(homeDir, "Library", "Application Support", "Code", "User", "globalStorage", "augment.augment-vscode", "mcp-settings.json"),
                    Path.Combine(homeDir, ".config", "augment", "mcp_settings.json")
                };
            }
            else
            {
                // Linux: Try multiple possible locations
                string homeDir = Environment.GetFolderPath(Environment.SpecialFolder.Personal);

                possiblePaths = new string[]
                {
                    Path.Combine(homeDir, ".config", "Code", "User", "globalStorage", "augment.augment-vscode", "mcp-settings.json"),
                    Path.Combine(homeDir, ".config", "augment", "mcp_settings.json")
                };
            }

            // Check each possible path
            foreach (string path in possiblePaths)
            {
                // Check if file exists
                if (File.Exists(path))
                {
                    Debug.Log($"找到Augment配置文件: {path}");
                    return path;
                }

                // Check if directory exists (we can create the file)
                string directory = Path.GetDirectoryName(path);
                if (Directory.Exists(directory))
                {
                    Debug.Log($"找到Augment配置目录: {directory}");
                    return path;
                }
            }

            Debug.LogWarning("未找到Augment配置文件，将使用剪贴板方式");
            return null;
        }

        /// <summary>
        /// Common method to add MCP configuration to a specified config file
        /// </summary>
        /// <param name="configFilePath">Path to the config file</param>
        /// <param name="useTabsIndentation">Whether to use tabs for indentation</param>
        /// <param name="productName">Name of the product (for error messages)</param>
        /// <returns>True if successfuly added the config, false otherwise</returns>
        private static bool AddToConfigFile(string configFilePath, bool useTabsIndentation, string productName)
        {
            if (string.IsNullOrEmpty(configFilePath))
            {
                Debug.LogError($"{productName} config file not found. Please make sure {productName} is installed.");
                return false;
            }
                
            // Generate fresh MCP config JSON
            string mcpConfigJson = GenerateMcpConfigJson(useTabsIndentation);
            
            try
            {
                // Parse the MCP config JSON
                JObject mcpConfig = JObject.Parse(mcpConfigJson);

                // Check if the file exists
                if (File.Exists(configFilePath))
                {
                    return TryMergeMcpServers(configFilePath, mcpConfig, productName);
                }
                else if(Directory.Exists(Path.GetDirectoryName(configFilePath)))
                {
                    // Create a new config file with just our config (UTF-8 without BOM for JSON)
                    File.WriteAllText(configFilePath, mcpConfigJson, new System.Text.UTF8Encoding(false));
                    return true;
                }
                else
                {
                    Debug.LogError($"Cannot find {productName} config file or {productName} is currently not installed. Expecting {productName} to be installed in the {configFilePath} path");
                }
            }
            catch (Exception ex)
            {
                Debug.LogError($"Failed to add MCP configuration to {productName}: {ex}");
            }

            return false;
        }
        
        /// <summary>
        /// Gets the path to the Windsurf MCP config file based on the current OS
        /// </summary>
        /// <returns>The path to the Windsurf MCP config file</returns>
        private static string GetWindsurfMcpConfigPath()
        {
            // Base path depends on the OS
            string basePath;
            
            if (Application.platform == RuntimePlatform.WindowsEditor)
            {
                // Windows: %USERPROFILE%/.codeium/windsurf
                basePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), ".codeium/windsurf");
            }
            else if (Application.platform == RuntimePlatform.OSXEditor)
            {
                // macOS: ~/Library/Application Support/.codeium/windsurf
                string homeDir = Environment.GetFolderPath(Environment.SpecialFolder.Personal);
                basePath = Path.Combine(homeDir, ".codeium/windsurf");
            }
            else
            {
                // Unsupported platform
                Debug.LogError("Unsupported platform for Windsurf MCP config");
                return null;
            }
            
            // Return the path to the mcp_config.json file
            return Path.Combine(basePath, "mcp_config.json");
        }
        
        /// <summary>
        /// Gets the path to the Claude Desktop config file based on the current OS
        /// </summary>
        /// <returns>The path to the Claude Desktop config file</returns>
        private static string GetClaudeDesktopConfigPath()
        {
            // Base path depends on the OS
            string basePath;
            
            if (Application.platform == RuntimePlatform.WindowsEditor)
            {
                // Windows: %USERPROFILE%/AppData/Roaming/Claude
                basePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "Claude");
            }
            else if (Application.platform == RuntimePlatform.OSXEditor)
            {
                // macOS: ~/Library/Application Support/Claude
                string homeDir = Environment.GetFolderPath(Environment.SpecialFolder.Personal);
                basePath = Path.Combine(homeDir, "Library", "Application Support", "Claude");
            }
            else
            {
                // Unsupported platform
                Debug.LogError("Unsupported platform for Claude Desktop config");
                return null;
            }
            
            // Return the path to the claude_desktop_config.json file
            return Path.Combine(basePath, "claude_desktop_config.json");
        }

        /// <summary>
        /// Gets the path to the Cursor config file based on the current OS
        /// </summary>
        /// <returns>The path to the Cursor config file</returns>
        private static string GetCursorConfigPath()
        {
            // Base path depends on the OS
            string basePath;
            
            if (Application.platform == RuntimePlatform.WindowsEditor)
            {
                // Windows: %USERPROFILE%/.cursor
                basePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), ".cursor");
            }
            else if (Application.platform == RuntimePlatform.OSXEditor)
            {
                // macOS: ~/.cursor
                string homeDir = Environment.GetFolderPath(Environment.SpecialFolder.Personal);
                basePath = Path.Combine(homeDir, ".cursor");
            }
            else
            {
                // Unsupported platform
                Debug.LogError("Unsupported platform for Cursor MCP config");
                return null;
            }
            
            // Return the path to the mcp_config.json file
            return Path.Combine(basePath, "mcp.json");
        }

        /// <summary>
        /// Gets the path to the Claude Code config file based on the current OS
        /// </summary>
        /// <returns>The path to the Claude Code config file</returns>
        private static string GetClaudeCodeConfigPath()
        {
            // Returns the absolute path to the global Claude configuration file.
            // Windows: %USERPROFILE%\.claude.json
            // macOS/Linux: $HOME/.claude.json
            string homeDir;

            if (Application.platform == RuntimePlatform.WindowsEditor)
            {
                // Windows: %USERPROFILE%\.claude.json
                homeDir = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
            }
            else if (Application.platform == RuntimePlatform.OSXEditor)
            {
                // macOS: ~/.claude.json
                homeDir = Environment.GetFolderPath(Environment.SpecialFolder.Personal);
            }
            else
            {
                Debug.LogError("Unsupported platform for Claude configuration path resolution");
                return null;
            }

            return Path.Combine(homeDir, ".claude.json");
        }

        /// <summary>
        /// Gets the path to the GitHub Copilot config file (workspace .vscode/mcp.json)
        /// </summary>
        /// <returns>The path to the GitHub Copilot config file</returns>
        private static string GetGitHubCopilotConfigPath()
        {
            // Default to current Unity project root/.vscode/mcp.json
            string projectRoot = Directory.GetParent(Application.dataPath).FullName;
            string vscodeDir = Path.Combine(projectRoot, ".vscode");
            return Path.Combine(vscodeDir, "mcp.json");
        }

        /// <summary>
        /// Runs an npm command (such as install or build) in the specified working directory.
        /// Handles cross-platform compatibility (Windows/macOS/Linux) for invoking npm.
        /// Logs output and errors to the Unity console.
        /// </summary>
        /// <param name="arguments">Arguments to pass to npm (e.g., "install" or "run build").</param>
        /// <param name="workingDirectory">The working directory where the npm command should be executed.</param>
        public static void RunNpmCommand(string arguments, string workingDirectory)
        {
            string npmExecutable = McpUnitySettings.Instance.NpmExecutablePath;
            bool useCustomNpmPath = !string.IsNullOrWhiteSpace(npmExecutable);

            System.Diagnostics.ProcessStartInfo startInfo = new System.Diagnostics.ProcessStartInfo
            {
                WorkingDirectory = workingDirectory,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false, // Important for redirection and direct execution
                CreateNoWindow = true
            };

            if (useCustomNpmPath)
            {
                // Use the custom path directly
                startInfo.FileName = npmExecutable;
                startInfo.Arguments = arguments;
            }
            else if (Application.platform == RuntimePlatform.WindowsEditor)
            {
                // Fallback to cmd.exe to find 'npm' in PATH
                startInfo.FileName = "cmd.exe";
                startInfo.Arguments = $"/c npm {arguments}";
            }
            else // macOS / Linux
            {
                // Fallback to /bin/bash to find 'npm' in PATH
                startInfo.FileName = "/bin/bash";
                startInfo.Arguments = $"-c \"npm {arguments}\"";

                // Ensure PATH includes common npm locations and current PATH
                string currentPath = Environment.GetEnvironmentVariable("PATH") ?? string.Empty;
                string extraPaths = "/usr/local/bin:/opt/homebrew/bin";
                startInfo.EnvironmentVariables["PATH"] = $"{extraPaths}:{currentPath}";
            }

            try
            {
                using (var process = System.Diagnostics.Process.Start(startInfo))
                {
                    if (process == null)
                    {
                        Debug.LogError($"[MCP Unity] Failed to start npm process with arguments: {arguments} in {workingDirectory}. Process object is null.");
                        return;
                    }

                    string output = process.StandardOutput.ReadToEnd();
                    string error = process.StandardError.ReadToEnd();

                    process.WaitForExit();

                    if (process.ExitCode == 0)
                    {
                        Debug.Log($"[MCP Unity] npm {arguments} completed successfully in {workingDirectory}.\n{output}");
                    }
                    else
                    {
                        Debug.LogError($"[MCP Unity] npm {arguments} failed in {workingDirectory}. Exit Code: {process.ExitCode}. Error: {error}");
                    }
                }
            }
            catch (Exception ex)
            {
                // Use commandToLog here
                Debug.LogError($"[MCP Unity] Exception while running npm {arguments} in {workingDirectory}. Error: {ex.Message}");
            }
        }

        /// <summary>
        /// Returns the appropriate config JObject for merging MCP server settings,
        /// with special handling for "Claude Code":
        /// - For most products, returns the root config object.
        /// - For "Claude Code", returns the project-specific config under "projects/[serverPathParent]".
        /// Throws a MissingMemberException if the expected project entry does not exist.
        /// </summary>
        private static JObject GetMcpServersConfig(JObject existingConfig, string productName)
        {
            // For most products, use the root config object.
            if (productName != "Claude Code")
            {
                return existingConfig;
            }

            // For Claude Code, use the project-specific config.
            if (existingConfig["projects"] == null)
            {
                throw new MissingMemberException("Claude Code config error: Could not find 'projects' entry in existing config.");
            }

            string serverPath = GetServerPath();
            string serverPathParent = Path.GetDirectoryName(serverPath)?.Replace("\\", "/");
            var projectConfig = existingConfig["projects"][serverPathParent];

            if (projectConfig == null)
            {
                throw new MissingMemberException(
                    $"Claude Code config error: Could not find project entry for parent directory '{serverPathParent}' in existing config."
                );
            }

            return (JObject)projectConfig;
        }

        /// <summary>
        /// Helper to merge mcpServers from mcpConfig into the existing config file.
        /// </summary>
        private static bool TryMergeMcpServers(string configFilePath, JObject mcpConfig, string productName)
        {
            // Read the existing config
            string existingConfigJson = File.ReadAllText(configFilePath);
            JObject existingConfig = string.IsNullOrEmpty(existingConfigJson) ? new JObject() : JObject.Parse(existingConfigJson);
            JObject mcpServersConfig = GetMcpServersConfig(existingConfig, productName);

            // Merge the mcpServers from our config into the existing config
            if (mcpConfig["mcpServers"] != null && mcpConfig["mcpServers"] is JObject mcpServers)
            {
                // Create mcpServers object if it doesn't exist
                if (mcpServersConfig["mcpServers"] == null)
                {
                    mcpServersConfig["mcpServers"] = new JObject();
                }

                // Add or update the mcp-unity server config
                if (mcpServers["mcp-unity"] != null)
                {
                    ((JObject)mcpServersConfig["mcpServers"])["mcp-unity"] = mcpServers["mcp-unity"];
                }

                // Write the updated config back to the file (UTF-8 without BOM for JSON)
                File.WriteAllText(configFilePath, existingConfig.ToString(Formatting.Indented), new System.Text.UTF8Encoding(false));
                return true;
            }

            return false;
        }

        /// <summary>
        /// Runs an npm command asynchronously to avoid blocking the main thread.
        /// Uses System.Threading.Tasks for background execution.
        /// </summary>
        /// <param name="arguments">Arguments to pass to npm (e.g., "install" or "run build").</param>
        /// <param name="workingDirectory">The working directory where the npm command should be executed.</param>
        /// <param name="timeoutSeconds">Maximum time to wait for command completion (default: 300 seconds / 5 minutes).</param>
        /// <param name="onComplete">Callback invoked on completion with success status and message.</param>
        public static void RunNpmCommandAsync(string arguments, string workingDirectory, int timeoutSeconds = 300, Action<bool, string> onComplete = null)
        {
            System.Threading.Tasks.Task.Run(() =>
            {
                string npmExecutable = McpUnitySettings.Instance.NpmExecutablePath;
                bool useCustomNpmPath = !string.IsNullOrWhiteSpace(npmExecutable);

                System.Diagnostics.ProcessStartInfo startInfo = new System.Diagnostics.ProcessStartInfo
                {
                    WorkingDirectory = workingDirectory,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                if (useCustomNpmPath)
                {
                    startInfo.FileName = npmExecutable;
                    startInfo.Arguments = arguments;
                }
                else if (Application.platform == RuntimePlatform.WindowsEditor)
                {
                    startInfo.FileName = "cmd.exe";
                    startInfo.Arguments = $"/c npm {arguments}";
                }
                else
                {
                    startInfo.FileName = "/bin/bash";
                    startInfo.Arguments = $"-c \"npm {arguments}\"";
                    
                    string currentPath = Environment.GetEnvironmentVariable("PATH") ?? string.Empty;
                    string extraPaths = "/usr/local/bin:/opt/homebrew/bin";
                    startInfo.EnvironmentVariables["PATH"] = $"{extraPaths}:{currentPath}";
                }

                try
                {
                    using (var process = System.Diagnostics.Process.Start(startInfo))
                    {
                        if (process == null)
                        {
                            string errorMsg = $"[MCP Unity] Failed to start npm process with arguments: {arguments} in {workingDirectory}. Process object is null.";
                            EditorApplication.delayCall += () => Debug.LogError(errorMsg);
                            onComplete?.Invoke(false, errorMsg);
                            return;
                        }

                        bool completed = process.WaitForExit(timeoutSeconds * 1000);
                        
                        if (!completed)
                        {
                            process.Kill();
                            string timeoutMsg = $"[MCP Unity] npm {arguments} timed out after {timeoutSeconds} seconds in {workingDirectory}.";
                            EditorApplication.delayCall += () => Debug.LogWarning(timeoutMsg);
                            onComplete?.Invoke(false, timeoutMsg);
                            return;
                        }

                        string output = process.StandardOutput.ReadToEnd();
                        string error = process.StandardError.ReadToEnd();

                        if (process.ExitCode == 0)
                        {
                            string successMsg = $"[MCP Unity] npm {arguments} completed successfully in {workingDirectory}.\n{output}";
                            EditorApplication.delayCall += () => Debug.Log(successMsg);
                            onComplete?.Invoke(true, successMsg);
                        }
                        else
                        {
                            string errorMsg = $"[MCP Unity] npm {arguments} failed in {workingDirectory}. Exit Code: {process.ExitCode}. Error: {error}";
                            EditorApplication.delayCall += () => Debug.LogError(errorMsg);
                            onComplete?.Invoke(false, errorMsg);
                        }
                    }
                }
                catch (Exception ex)
                {
                    string exceptionMsg = $"[MCP Unity] Exception while running npm {arguments} in {workingDirectory}. Error: {ex.Message}";
                    EditorApplication.delayCall += () => Debug.LogError(exceptionMsg);
                    onComplete?.Invoke(false, exceptionMsg);
                }
            });
        }
    }
}
