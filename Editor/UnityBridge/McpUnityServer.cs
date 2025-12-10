using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using UnityEditor;
using McpUnity.Tools;
using McpUnity.Resources;
using McpUnity.Services;
using McpUnity.Utils;
using WebSocketSharp.Server;
using System.IO;
using System.Net.Sockets;
using UnityEditor.Callbacks;
using System.Diagnostics;

namespace McpUnity.Unity
{
    /// <summary>
    /// MCP Unity Server to communicate Node.js MCP server.
    /// Uses WebSockets to communicate with Node.js.
    /// </summary>
    [InitializeOnLoad]
    public class McpUnityServer : IDisposable
    {
        private static McpUnityServer _instance;
        
        private readonly Dictionary<string, McpToolBase> _tools = new Dictionary<string, McpToolBase>();
        private readonly Dictionary<string, McpResourceBase> _resources = new Dictionary<string, McpResourceBase>();
        
        private WebSocketServer _webSocketServer;
        private CancellationTokenSource _cts;
        private TestRunnerService _testRunnerService;
        private ConsoleLogsService _consoleLogsService;
        private Process _mcpWebSocketProcess;
        
        /// <summary>
        /// Called after every domain reload
        /// </summary>
        [DidReloadScripts]
        private static void AfterReload()
        {
            // Ensure Instance is created and hooks are set up after initial domain load
            var currentInstance = Instance;
        }
        
        /// <summary>
        /// Singleton instance accessor
        /// </summary>
        public static McpUnityServer Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = new McpUnityServer();
                }
                return _instance;
            }
        }

        /// <summary>
        /// Current Listening state
        /// </summary>
        public bool IsListening => _webSocketServer?.IsListening ?? false;

        /// <summary>
        /// Check if Node.js MCP WebSocket Server is running
        /// </summary>
        public bool IsMcpWebSocketServerRunning => _mcpWebSocketProcess != null && !_mcpWebSocketProcess.HasExited;

        /// <summary>
        /// Dictionary of connected clients with this server
        /// </summary>
        public Dictionary<string, string> Clients { get; } = new Dictionary<string, string>();

        /// <summary>
        /// Get actual active session count from WebSocket server
        /// </summary>
        public int ActiveSessionCount
        {
            get
            {
                try
                {
                    if (_webSocketServer != null && _webSocketServer.IsListening)
                    {
                        var host = _webSocketServer.WebSocketServices["/McpUnity"];
                        return host?.Sessions?.Count ?? 0;
                    }
                }
                catch { }
                return 0;
            }
        }

        /// <summary>
        /// Sync clients dictionary with actual WebSocket sessions
        /// Removes stale entries that no longer have active connections
        /// </summary>
        public void SyncClientsWithSessions()
        {
            if (!IsListening) return;
            
            int actualCount = ActiveSessionCount;
            if (Clients.Count > actualCount)
            {
                McpLogger.LogInfo($"Syncing clients: {Clients.Count} registered, {actualCount} active. Clearing stale entries.");
                Clients.Clear();
            }
        }

        /// <summary>
        /// Private constructor to enforce singleton pattern
        /// </summary>
        private McpUnityServer()
        {
            EditorApplication.quitting -= OnEditorQuitting; // Prevent multiple subscriptions on domain reload
            EditorApplication.quitting += OnEditorQuitting;

            AssemblyReloadEvents.beforeAssemblyReload -= OnBeforeAssemblyReload;
            AssemblyReloadEvents.beforeAssemblyReload += OnBeforeAssemblyReload;

            AssemblyReloadEvents.afterAssemblyReload -= OnAfterAssemblyReload;
            AssemblyReloadEvents.afterAssemblyReload += OnAfterAssemblyReload;

            EditorApplication.playModeStateChanged -= OnPlayModeStateChanged;
            EditorApplication.playModeStateChanged += OnPlayModeStateChanged;

            InstallServer();
            InitializeServices();
            RegisterResources();
            RegisterTools();

            // Initial start if auto-start is enabled and not recovering from a reload where it was off
            if (McpUnitySettings.Instance.AutoStartServer)
            {
                 StartServer();
            }

            // Auto-start Node.js MCP WebSocket Server if enabled
            if (McpUnitySettings.Instance.AutoStartMcpWebSocketServer)
            {
                StartMcpWebSocketServer();
            }
        }

        /// <summary>
        /// Disposes the McpUnityServer instance, stopping the WebSocket server and unsubscribing from Unity Editor events.
        /// This method ensures proper cleanup of resources and prevents memory leaks or unexpected behavior during domain reloads or editor shutdown.
        /// </summary>
        public void Dispose()
        {
            StopServer();
            StopMcpWebSocketServer();

            EditorApplication.quitting -= OnEditorQuitting;
            AssemblyReloadEvents.beforeAssemblyReload -= OnBeforeAssemblyReload;
            AssemblyReloadEvents.afterAssemblyReload -= OnAfterAssemblyReload;
            EditorApplication.playModeStateChanged -= OnPlayModeStateChanged;

            GC.SuppressFinalize(this);
        }
        
        /// <summary>
        /// Start the WebSocket Server to communicate with Node.js
        /// </summary>
        public void StartServer()
        {
            if (IsListening)
            {
                McpLogger.LogInfo($"Server start requested, but already listening on port {McpUnitySettings.Instance.Port}.");
                return;
            }

            // Clear stale client connections from previous sessions
            if (Clients.Count > 0)
            {
                McpLogger.LogInfo($"Clearing {Clients.Count} stale client connection(s) from previous session.");
                Clients.Clear();
            }

            try
            {
                var host = McpUnitySettings.Instance.AllowRemoteConnections ? "0.0.0.0" : "localhost";
                _webSocketServer = new WebSocketServer($"ws://{host}:{McpUnitySettings.Instance.Port}");
                _webSocketServer.ReuseAddress = true;
                _webSocketServer.AddWebSocketService("/McpUnity", () => new McpUnitySocketHandler(this));
                _webSocketServer.Start();
                McpLogger.LogInfo($"WebSocket server started successfully on {host}:{McpUnitySettings.Instance.Port}.");
            }
            catch (SocketException ex) when (ex.SocketErrorCode == SocketError.AddressAlreadyInUse)
            {
                McpLogger.LogError($"Failed to start WebSocket server: Port {McpUnitySettings.Instance.Port} is already in use. {ex.Message}");
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"Failed to start WebSocket server: {ex.Message}\n{ex.StackTrace}");
            }
        }
        
        /// <summary>
        /// Stop the WebSocket server
        /// </summary>
        public void StopServer()
        {
            if (!IsListening)
            {
                return;
            }

            try
            {
                _webSocketServer?.Stop();

                McpLogger.LogInfo("WebSocket server stopped");
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"Error during WebSocketServer.Stop(): {ex.Message}\n{ex.StackTrace}");
            }
            finally
            {
                _webSocketServer = null;
                Clients.Clear();
                McpLogger.LogInfo("WebSocket server stopped and resources cleaned up.");
            }
        }

        /// <summary>
        /// Start Node.js MCP Server in WebSocket mode
        /// </summary>
        public void StartMcpWebSocketServer()
        {
            if (IsMcpWebSocketServerRunning)
            {
                McpLogger.LogInfo("Node.js MCP WebSocket Server is already running.");
                return;
            }

            try
            {
                string serverPath = McpUtils.GetServerPath();
                if (string.IsNullOrEmpty(serverPath) || !Directory.Exists(serverPath))
                {
                    McpLogger.LogError($"Server path not found: {serverPath}");
                    return;
                }

                string indexJsPath = Path.Combine(serverPath, "build", "index.js");
                if (!File.Exists(indexJsPath))
                {
                    McpLogger.LogError($"MCP Server build not found at: {indexJsPath}. Please run 'npm run build' first.");
                    return;
                }

                // Find node executable
                string nodeExecutable = FindNodeExecutable();
                if (string.IsNullOrEmpty(nodeExecutable))
                {
                    McpLogger.LogError("Node.js executable not found. Please install Node.js.");
                    return;
                }

                // Prepare process start info
                ProcessStartInfo startInfo = new ProcessStartInfo
                {
                    FileName = nodeExecutable,
                    Arguments = $"\"{indexJsPath}\"",
                    WorkingDirectory = serverPath,
                    UseShellExecute = false,
                    CreateNoWindow = false, // Show console window for debugging
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    RedirectStandardInput = false
                };

                // Set environment variables
                startInfo.EnvironmentVariables["UNITY_PORT"] = McpUnitySettings.Instance.Port.ToString();
                startInfo.EnvironmentVariables["MCP_TRANSPORT"] = "websocket";
                startInfo.EnvironmentVariables["MCP_WS_PORT"] = McpUnitySettings.Instance.McpWebSocketPort.ToString();
                startInfo.EnvironmentVariables["MCP_WS_HOST"] = McpUnitySettings.Instance.McpWebSocketHost;
                startInfo.EnvironmentVariables["LOG_LEVEL"] = "INFO";

                // Start the process
                _mcpWebSocketProcess = new Process { StartInfo = startInfo };

                // Handle output
                _mcpWebSocketProcess.OutputDataReceived += (sender, e) =>
                {
                    if (!string.IsNullOrEmpty(e.Data))
                    {
                        McpLogger.LogInfo($"[MCP WS] {e.Data}");
                    }
                };

                _mcpWebSocketProcess.ErrorDataReceived += (sender, e) =>
                {
                    if (!string.IsNullOrEmpty(e.Data))
                    {
                        // Node.js often writes normal logs to stderr, so use Info level
                        McpLogger.LogInfo($"[MCP WS] {e.Data}");
                    }
                };

                _mcpWebSocketProcess.Start();
                _mcpWebSocketProcess.BeginOutputReadLine();
                _mcpWebSocketProcess.BeginErrorReadLine();

                McpLogger.LogInfo($"Node.js MCP WebSocket Server started on {McpUnitySettings.Instance.McpWebSocketHost}:{McpUnitySettings.Instance.McpWebSocketPort}");
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"Failed to start Node.js MCP WebSocket Server: {ex.Message}\n{ex.StackTrace}");
                _mcpWebSocketProcess = null;
            }
        }

        /// <summary>
        /// Stop Node.js MCP WebSocket Server
        /// </summary>
        public void StopMcpWebSocketServer()
        {
            if (_mcpWebSocketProcess == null)
            {
                return;
            }

            try
            {
                if (!_mcpWebSocketProcess.HasExited)
                {
                    _mcpWebSocketProcess.Kill();
                    _mcpWebSocketProcess.WaitForExit(5000); // Wait up to 5 seconds
                }

                _mcpWebSocketProcess.Dispose();
                _mcpWebSocketProcess = null;

                McpLogger.LogInfo("Node.js MCP WebSocket Server stopped");
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"Error stopping Node.js MCP WebSocket Server: {ex.Message}");
                _mcpWebSocketProcess = null;
            }
        }

        /// <summary>
        /// Find Node.js executable
        /// </summary>
        private string FindNodeExecutable()
        {
            // Try common locations
            string[] possiblePaths = new string[]
            {
                "node", // System PATH
                "node.exe", // Windows
                "/usr/local/bin/node", // macOS/Linux
                "/usr/bin/node", // Linux
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), "nodejs", "node.exe"), // Windows Program Files
            };

            foreach (string path in possiblePaths)
            {
                try
                {
                    ProcessStartInfo testInfo = new ProcessStartInfo
                    {
                        FileName = path,
                        Arguments = "--version",
                        UseShellExecute = false,
                        CreateNoWindow = true,
                        RedirectStandardOutput = true
                    };

                    using (Process testProcess = Process.Start(testInfo))
                    {
                        if (testProcess != null)
                        {
                            testProcess.WaitForExit(1000);
                            if (testProcess.ExitCode == 0)
                            {
                                return path;
                            }
                        }
                    }
                }
                catch
                {
                    // Continue to next path
                }
            }

            return null;
        }

        /// <summary>
        /// Try to get a tool by name
        /// </summary>
        public bool TryGetTool(string name, out McpToolBase tool)
        {
            return _tools.TryGetValue(name, out tool);
        }
        
        /// <summary>
        /// Try to get a resource by name
        /// </summary>
        public bool TryGetResource(string name, out McpResourceBase resource)
        {
            return _resources.TryGetValue(name, out resource);
        }

        /// <summary>
        /// Installs the MCP Node.js server by running 'npm install' and 'npm run build'
        /// in the server directory if 'node_modules' or 'build' folders are missing.
        /// </summary>
        public void InstallServer()
        {
            string serverPath = McpUtils.GetServerPath();

            if (string.IsNullOrEmpty(serverPath) || !Directory.Exists(serverPath))
            {
                McpLogger.LogError($"Server path not found or invalid: {serverPath}. Make sure that MCP Node.js server is installed.");
                return;
            }

            string nodeModulesPath = Path.Combine(serverPath, "node_modules");
            if (!Directory.Exists(nodeModulesPath))
            {
                McpUtils.RunNpmCommand("install", serverPath);
            }

            string buildPath = Path.Combine(serverPath, "build");
            if (!Directory.Exists(buildPath))
            {
                McpUtils.RunNpmCommand("run build", serverPath);
            }
        }
        
        /// <summary>
        /// Register all available tools
        /// </summary>
        private void RegisterTools()
        {
            // 1. Register tools with dependencies manually first
            if (_testRunnerService != null)
            {
                RunTestsTool runTestsTool = new RunTestsTool(_testRunnerService);
                if (!_tools.ContainsKey(runTestsTool.Name))
                {
                    _tools.Add(runTestsTool.Name, runTestsTool);
                }
            }

            // 2. Auto-register all other tools using Reflection
            var toolType = typeof(McpToolBase);
            var types = AppDomain.CurrentDomain.GetAssemblies()
                .SelectMany(s => s.GetTypes())
                .Where(p => toolType.IsAssignableFrom(p) && !p.IsInterface && !p.IsAbstract);

            foreach (var type in types)
            {
                // Skip if constructor requires parameters (handled manually above)
                if (type.GetConstructor(Type.EmptyTypes) == null)
                {
                    continue;
                }

                try
                {
                    McpToolBase toolInstance = (McpToolBase)Activator.CreateInstance(type);
                    
                    // Skip if already registered (e.g. manually registered above)
                    if (_tools.ContainsKey(toolInstance.Name))
                    {
                        continue;
                    }

                    _tools.Add(toolInstance.Name, toolInstance);
                }
                catch (Exception ex)
                {
                    McpLogger.LogError($"Failed to auto-register tool {type.Name}: {ex.Message}");
                }
            }

            McpLogger.LogInfo($"Registered {_tools.Count} tools.");
        }
        
        /// <summary>
        /// Register all available resources
        /// </summary>
        private void RegisterResources()
        {
            // Register GetMenuItemsResource
            GetMenuItemsResource getMenuItemsResource = new GetMenuItemsResource();
            _resources.Add(getMenuItemsResource.Name, getMenuItemsResource);
            
            // Register GetConsoleLogsResource
            GetConsoleLogsResource getConsoleLogsResource = new GetConsoleLogsResource(_consoleLogsService);
            _resources.Add(getConsoleLogsResource.Name, getConsoleLogsResource);
            
            // Register GetScenesHierarchyResource
            GetScenesHierarchyResource getScenesHierarchyResource = new GetScenesHierarchyResource();
            _resources.Add(getScenesHierarchyResource.Name, getScenesHierarchyResource);
            
            // Register GetPackagesResource
            GetPackagesResource getPackagesResource = new GetPackagesResource();
            _resources.Add(getPackagesResource.Name, getPackagesResource);
            
            // Register GetAssetsResource
            GetAssetsResource getAssetsResource = new GetAssetsResource();
            _resources.Add(getAssetsResource.Name, getAssetsResource);
            
            // Register GetTestsResource
            GetTestsResource getTestsResource = new GetTestsResource(_testRunnerService);
            _resources.Add(getTestsResource.Name, getTestsResource);
            
            // Register GetGameObjectResource
            GetGameObjectResource getGameObjectResource = new GetGameObjectResource();
            _resources.Add(getGameObjectResource.Name, getGameObjectResource);
            
            // Register GetGameObjectSimpleResource (⚡ Optimized - saves 89.5% tokens)
            GetGameObjectSimpleResource getGameObjectSimpleResource = new GetGameObjectSimpleResource();
            _resources.Add(getGameObjectSimpleResource.Name, getGameObjectSimpleResource);
        }
        
        /// <summary>
        /// Initialize services used by the server
        /// </summary>
        private void InitializeServices()
        {
            // Initialize the test runner service
            _testRunnerService = new TestRunnerService();
            
            // Initialize the console logs service
            _consoleLogsService = new ConsoleLogsService();
        }

        /// <summary>
        /// Handles the Unity Editor quitting event. Ensures the server is properly stopped and disposed.
        /// </summary>
        private static void OnEditorQuitting()
        {
            McpLogger.LogInfo("Editor is quitting. Ensuring server is stopped.");
            Instance.Dispose();
        }

        /// <summary>
        /// Handles the Unity Editor's 'before assembly reload' event.
        /// Stops the WebSocket server to prevent port conflicts and ensure a clean state before scripts are recompiled.
        /// </summary>
        private static void OnBeforeAssemblyReload()
        {
            if (Instance.IsListening)
            {
                Instance.StopServer();
            }
        }

        /// <summary>
        /// Handles the Unity Editor's 'after assembly reload' event.
        /// If auto-start is enabled, attempts to restart the WebSocket server if it's not already listening.
        /// This ensures the server is operational after script recompilation.
        /// </summary>
        private static void OnAfterAssemblyReload()
        {
            if (McpUnitySettings.Instance.AutoStartServer && !Instance.IsListening)
            {
                Instance.StartServer();
            }
        }

        /// <summary>
        /// Handles changes in Unity Editor's play mode state.
        /// Stops the server when exiting Edit Mode if configured, and restarts it when entering Play Mode or returning to Edit Mode if auto-start is enabled.
        /// </summary>
        /// <param name="state">The current play mode state change.</param>
        private static void OnPlayModeStateChanged(PlayModeStateChange state)
        {
            switch (state)
            {
                case PlayModeStateChange.ExitingEditMode:
                    // About to enter Play Mode
                    if (Instance.IsListening)
                    {
                        Instance.StopServer();
                    }
                    break;
                case PlayModeStateChange.EnteredPlayMode:
                case PlayModeStateChange.ExitingPlayMode:
                    // Server is disabled during play mode as domain reload will be triggered again when stopped.
                    break;
                case PlayModeStateChange.EnteredEditMode:
                    // Returned to Edit Mode
                    if (!Instance.IsListening && McpUnitySettings.Instance.AutoStartServer)
                    {
                        Instance.StartServer();
                    }
                    break;
            }
        }
    }
}
