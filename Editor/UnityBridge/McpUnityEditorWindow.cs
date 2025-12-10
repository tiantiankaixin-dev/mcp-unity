using System;
using McpUnity.Utils;
using UnityEngine;
using UnityEditor;

namespace McpUnity.Unity
{
    /// <summary>
    /// Editor window for controlling the MCP Unity Server.
    /// Provides UI for starting/stopping the server and configuring settings.
    /// </summary>
    public class McpUnityEditorWindow : EditorWindow
    {
        private GUIStyle _headerStyle;
        private GUIStyle _subHeaderStyle;
        private GUIStyle _boxStyle;
        private GUIStyle _wrappedLabelStyle;
        private GUIStyle _connectedClientBoxStyle; // Style for individual connected clients
        private GUIStyle _connectedClientLabelStyle; // Style for labels in connected client boxes
        private int _selectedTab = 0;
        private readonly string[] _tabNames = { "服务器", "帮助" };
        private bool _isInitialized = false;
        private string _mcpConfigJson = "";
        private bool _tabsIndentationJson = false;
        private Vector2 _helpTabScrollPosition = Vector2.zero;
        private Vector2 _serverTabScrollPosition = Vector2.zero;
        private double _lastRepaintTime = 0;
        private const double RepaintInterval = 1.0; // 每秒刷新一次

        [MenuItem("Tools/MCP Unity/服务器窗口", false, 1)]
        public static void ShowWindow()
        {
            var window = GetWindow<McpUnityEditorWindow>("MCP Unity");
            window.minSize = new Vector2(600, 400);
        }

        private void OnEnable()
        {
            // 注册编辑器更新回调以定时刷新UI
            EditorApplication.update += OnEditorUpdate;
        }

        private void OnDisable()
        {
            EditorApplication.update -= OnEditorUpdate;
        }

        private void OnEditorUpdate()
        {
            // 定时刷新以更新服务器状态
            if (EditorApplication.timeSinceStartup - _lastRepaintTime > RepaintInterval)
            {
                _lastRepaintTime = EditorApplication.timeSinceStartup;
                
                // 同步客户端列表与实际WebSocket会话
                McpUnityServer.Instance.SyncClientsWithSessions();
                
                Repaint();
            }
        }

        private void OnGUI()
        {
            InitializeStyles();

            EditorGUILayout.BeginVertical();
            
            // Header
            EditorGUILayout.Space();
            WrappedLabel("MCP Unity", _headerStyle);
            EditorGUILayout.Space();
            
            // Tabs
            _selectedTab = GUILayout.Toolbar(_selectedTab, _tabNames);
            EditorGUILayout.Space();
            
            switch (_selectedTab)
            {
                case 0: // Server tab
                    DrawServerTab();
                    break;
                case 1: // Help tab
                    DrawHelpTab();
                    break;
            }

            // Version info at the bottom
            GUILayout.FlexibleSpace();
            WrappedLabel($"MCP Unity v{McpUnitySettings.ServerVersion}", EditorStyles.miniLabel, GUILayout.Width(150));
            
            EditorGUILayout.EndVertical();
        }

        #region Tab Drawing Methods

        private void DrawServerTab()
        {
            _serverTabScrollPosition = EditorGUILayout.BeginScrollView(_serverTabScrollPosition);
            EditorGUILayout.BeginVertical("box");
            
            // Server status
            EditorGUILayout.BeginHorizontal();
            EditorGUILayout.LabelField("状态:", GUILayout.Width(120));

            McpUnitySettings settings = McpUnitySettings.Instance;
            McpUnityServer mcpUnityServer = McpUnityServer.Instance;
            string statusText = mcpUnityServer.IsListening ? "服务器在线" : "服务器离线";
            Color statusColor = mcpUnityServer.IsListening  ? Color.green : Color.red;

            GUIStyle statusStyle = new GUIStyle(EditorStyles.boldLabel);
            statusStyle.normal.textColor = statusColor;

            EditorGUILayout.LabelField(statusText, statusStyle);
            EditorGUILayout.EndHorizontal();

            EditorGUILayout.Space();

            // Port configuration
            EditorGUILayout.BeginHorizontal();
            int newPort = EditorGUILayout.IntField("连接端口", settings.Port);
            if (newPort < 1 || newPort > 65536)
            {
                newPort = settings.Port;
                Debug.LogError($"{newPort} is an invalid port number. Please enter a number between 1 and 65535.");
            }
            
            if (newPort != settings.Port)
            {
                settings.Port = newPort;
                settings.SaveSettings();
                mcpUnityServer.StopServer();
                mcpUnityServer.StartServer(); // Restart the server.newPort
            }
            EditorGUILayout.EndHorizontal();
            
            EditorGUILayout.Space();
            
            // Test timeout setting
            EditorGUILayout.BeginHorizontal();
            int newTimeout = EditorGUILayout.IntField(new GUIContent("请求超时（秒）", "工具请求的超时时间（秒）"), settings.RequestTimeoutSeconds);
            if (newTimeout < McpUnitySettings.RequestTimeoutMinimum)
            {
                newTimeout = McpUnitySettings.RequestTimeoutMinimum;
                Debug.LogError($"请求超时时间必须至少为 {McpUnitySettings.RequestTimeoutMinimum} 秒。");
            }

            if (newTimeout != settings.RequestTimeoutSeconds)
            {
                settings.RequestTimeoutSeconds = newTimeout;
                settings.SaveSettings();
            }
            EditorGUILayout.EndHorizontal();

            EditorGUILayout.Space();

            // Auto start server toggle
            bool autoStartServer = EditorGUILayout.Toggle(new GUIContent("自动启动服务器", "Unity打开时自动启动MCP服务器"), settings.AutoStartServer);
            if (autoStartServer != settings.AutoStartServer)
            {
                settings.AutoStartServer = autoStartServer;
                settings.SaveSettings();
            }

            EditorGUILayout.Space();

            // Allow remote connections toggle
            bool allowRemoteConnections = EditorGUILayout.Toggle(new GUIContent("允许远程连接", "允许来自远程MCP客户端的连接。禁用时，仅允许本地连接（默认）。"), settings.AllowRemoteConnections);
            if (allowRemoteConnections != settings.AllowRemoteConnections)
            {
                settings.AllowRemoteConnections = allowRemoteConnections;
                settings.SaveSettings();
                // Restart server to apply binding change
                mcpUnityServer.StopServer();
                mcpUnityServer.StartServer();
            }

            EditorGUILayout.Space();

            // Enable info logs toggle
            bool enableInfoLogs = EditorGUILayout.Toggle(new GUIContent("启用信息日志", "在Unity控制台中显示信息日志"), settings.EnableInfoLogs);
            if (enableInfoLogs != settings.EnableInfoLogs)
            {
                settings.EnableInfoLogs = enableInfoLogs;
                settings.SaveSettings();
            }

            EditorGUILayout.Space();

            // Server control buttons
            EditorGUILayout.BeginHorizontal();

            // Connect button - enabled only when disconnected
            GUI.enabled = !mcpUnityServer.IsListening;
            if (GUILayout.Button("启动服务器", GUILayout.Height(30)))
            {
                mcpUnityServer.StartServer();
            }

            // Disconnect button - enabled only when connected
            GUI.enabled = mcpUnityServer.IsListening;
            if (GUILayout.Button("停止服务器", GUILayout.Height(30)))
            {
                mcpUnityServer.StopServer();
            }

            //Repaint();

            GUI.enabled = true;
            EditorGUILayout.EndHorizontal();

            EditorGUILayout.Space();

            // MCP WebSocket Server Section
            EditorGUILayout.LabelField("Node.js MCP WebSocket 服务器", EditorStyles.boldLabel);
            EditorGUILayout.BeginVertical("box");

            // MCP WebSocket Server status
            EditorGUILayout.BeginHorizontal();
            EditorGUILayout.LabelField("状态:", GUILayout.Width(120));

            string mcpWsStatusText = mcpUnityServer.IsMcpWebSocketServerRunning ? "运行中" : "已停止";
            Color mcpWsStatusColor = mcpUnityServer.IsMcpWebSocketServerRunning ? Color.green : Color.red;

            GUIStyle mcpWsStatusStyle = new GUIStyle(EditorStyles.boldLabel);
            mcpWsStatusStyle.normal.textColor = mcpWsStatusColor;

            EditorGUILayout.LabelField(mcpWsStatusText, mcpWsStatusStyle);
            EditorGUILayout.EndHorizontal();

            EditorGUILayout.Space();

            // MCP WebSocket Port configuration
            EditorGUILayout.BeginHorizontal();
            int newMcpWsPort = EditorGUILayout.IntField("WebSocket 端口", settings.McpWebSocketPort);
            if (newMcpWsPort < 1 || newMcpWsPort > 65536)
            {
                newMcpWsPort = settings.McpWebSocketPort;
                Debug.LogError($"{newMcpWsPort} 是无效的端口号。请输入 1-65535 之间的数字。");
            }

            if (newMcpWsPort != settings.McpWebSocketPort)
            {
                settings.McpWebSocketPort = newMcpWsPort;
                settings.SaveSettings();
            }
            EditorGUILayout.EndHorizontal();

            EditorGUILayout.Space();

            // MCP WebSocket Host configuration
            EditorGUILayout.BeginHorizontal();
            string newMcpWsHost = EditorGUILayout.TextField("WebSocket 主机", settings.McpWebSocketHost);
            if (newMcpWsHost != settings.McpWebSocketHost)
            {
                settings.McpWebSocketHost = newMcpWsHost;
                settings.SaveSettings();
            }
            EditorGUILayout.EndHorizontal();

            EditorGUILayout.Space();

            // Auto start MCP WebSocket Server toggle
            bool autoStartMcpWs = EditorGUILayout.Toggle(new GUIContent("自动启动 MCP WebSocket", "Unity Bridge 启动时自动启动 Node.js MCP WebSocket 服务器"), settings.AutoStartMcpWebSocketServer);
            if (autoStartMcpWs != settings.AutoStartMcpWebSocketServer)
            {
                settings.AutoStartMcpWebSocketServer = autoStartMcpWs;
                settings.SaveSettings();
            }

            EditorGUILayout.Space();

            // MCP WebSocket Server control buttons
            EditorGUILayout.BeginHorizontal();

            // Start button - enabled only when not running
            GUI.enabled = !mcpUnityServer.IsMcpWebSocketServerRunning;
            if (GUILayout.Button("启动 MCP WebSocket", GUILayout.Height(30)))
            {
                mcpUnityServer.StartMcpWebSocketServer();
            }

            // Stop button - enabled only when running
            GUI.enabled = mcpUnityServer.IsMcpWebSocketServerRunning;
            if (GUILayout.Button("停止 MCP WebSocket", GUILayout.Height(30)))
            {
                mcpUnityServer.StopMcpWebSocketServer();
            }

            GUI.enabled = true;
            EditorGUILayout.EndHorizontal();

            EditorGUILayout.Space();

            // Connection info
            if (mcpUnityServer.IsMcpWebSocketServerRunning)
            {
                EditorGUILayout.HelpBox($"MCP 客户端可以连接到: ws://{(settings.McpWebSocketHost == "0.0.0.0" ? "localhost" : settings.McpWebSocketHost)}:{settings.McpWebSocketPort}", MessageType.Info);
            }

            EditorGUILayout.EndVertical();

            EditorGUILayout.Space();

            EditorGUILayout.LabelField("已连接的客户端", EditorStyles.boldLabel);
            EditorGUILayout.BeginVertical("box"); // Keep the default gray box for the container

            var clients = mcpUnityServer.Clients;
            
            if (clients.Count > 0)
            {
                foreach (var client in clients)
                {
                    EditorGUILayout.BeginVertical(_connectedClientBoxStyle); // Use green background for each client
                    
                    EditorGUILayout.BeginHorizontal();
                    EditorGUILayout.LabelField("ID:", _connectedClientLabelStyle, GUILayout.Width(50));                    
                    EditorGUILayout.LabelField(client.Key, EditorStyles.boldLabel);
                    EditorGUILayout.EndHorizontal();
                    
                    EditorGUILayout.BeginHorizontal();
                    EditorGUILayout.LabelField("Name:", _connectedClientLabelStyle, GUILayout.Width(50));
                    EditorGUILayout.LabelField(client.Value, _connectedClientLabelStyle);
                    EditorGUILayout.EndHorizontal();
                    
                    EditorGUILayout.EndVertical();
                    EditorGUILayout.Space();
                }
            }
            else
            {
                GUIStyle wrapStyle = new GUIStyle(EditorStyles.centeredGreyMiniLabel);
                wrapStyle.wordWrap = true;
                GUILayout.Label("没有客户端连接\n从MCP客户端调用工具以连接", wrapStyle, GUILayout.ExpandWidth(true));
            }
                
            EditorGUILayout.EndVertical();

            // NPM Executable Path
            string newNpmPath = EditorGUILayout.TextField(new GUIContent("NPM可执行文件路径", "可选：npm可执行文件的完整路径（例如：/Users/user/.asdf/shims/npm 或 C:\\path\\to\\npm.cmd）。如果未设置，将使用系统PATH中的'npm'。"), settings.NpmExecutablePath);
            if (newNpmPath != settings.NpmExecutablePath)
            {
                settings.NpmExecutablePath = newNpmPath;
                settings.SaveSettings();
            }

            EditorGUILayout.Space();

            // MCP Config generation section
            EditorGUILayout.Space();
            EditorGUILayout.LabelField("MCP配置", EditorStyles.boldLabel);

            var before = _tabsIndentationJson;
            _tabsIndentationJson = EditorGUILayout.Toggle("使用Tab缩进", _tabsIndentationJson);

            if (string.IsNullOrEmpty(_mcpConfigJson) || before != _tabsIndentationJson)
            {
                _mcpConfigJson = McpUtils.GenerateMcpConfigJson(_tabsIndentationJson);
            }

            if (GUILayout.Button("复制到剪贴板", GUILayout.Height(30)))
            {
                EditorGUIUtility.systemCopyBuffer = _mcpConfigJson;
            }

            EditorGUILayout.TextArea(_mcpConfigJson, GUILayout.Height(200));

            EditorGUILayout.Space();

            ShowConfigButton("Windsurf", McpUtils.AddToWindsurfIdeConfig);

            EditorGUILayout.Space();

            ShowConfigButton("Claude Desktop", McpUtils.AddToClaudeDesktopConfig);

            EditorGUILayout.Space();

            ShowConfigButton("Cursor", McpUtils.AddToCursorConfig);

            EditorGUILayout.Space();

            ShowConfigButton("Claude Code", McpUtils.AddToClaudeCodeConfig);

            EditorGUILayout.Space();

            ShowConfigButton("GitHub Copilot", McpUtils.AddToGitHubCopilotConfig);

            EditorGUILayout.Space();

            ShowConfigButton("Augment", McpUtils.AddToAugmentConfig);

            EditorGUILayout.Space();

            ShowConfigButton("Antigravity", McpUtils.AddToAntigravityConfig);

            EditorGUILayout.Space();

            // VSCode configuration button
            if (GUILayout.Button("配置 VSCode", GUILayout.Height(30)))
            {
                bool added = VsCodeWorkspaceUtils.AddMcpConfigToVSCode(_tabsIndentationJson);
                if (added)
                {
                    EditorUtility.DisplayDialog("成功", "MCP配置已成功添加到VSCode配置文件。\n\n位置: .vscode/settings.json", "确定");
                }
                else
                {
                    EditorUtility.DisplayDialog("错误", "无法将MCP配置添加到VSCode配置文件。", "确定");
                }
            }

            EditorGUILayout.Separator();
            EditorGUILayout.Separator();

            EditorGUILayout.Space();

            // Force Install Server button
            if (GUILayout.Button("强制安装服务器", GUILayout.Height(30)))
            {
                McpUnityServer.Instance.InstallServer();
                McpLogger.LogInfo("MCP Unity服务器安装成功。");
            }
            
            EditorGUILayout.EndVertical();
            EditorGUILayout.EndScrollView();
        }
        
        private void DrawHelpTab()
        {
            // Begin scrollable area
            _helpTabScrollPosition = EditorGUILayout.BeginScrollView(_helpTabScrollPosition);

            WrappedLabel("关于 MCP Unity", _subHeaderStyle);
            EditorGUILayout.BeginVertical(_boxStyle);
            WrappedLabel("MCP Unity 是模型上下文协议（MCP）的Unity编辑器集成，它实现了AI模型与应用程序之间的标准化通信。");
            EditorGUILayout.Space();

            if (GUILayout.Button("打开MCP协议文档"))
            {
                Application.OpenURL("https://modelcontextprotocol.io");
            }

            EditorGUILayout.EndVertical();

            // IDE Integration settings
            EditorGUILayout.Space();
            WrappedLabel("IDE集成设置", _subHeaderStyle);

            EditorGUILayout.BeginVertical(_boxStyle);
            string ideIntegrationTooltip = "将Library/PackedCache文件夹添加到VSCode类IDE工作区，以便AI可以索引代码。这可以改善VSCode、Cursor等IDE中Unity包的代码智能。";

            WrappedLabel("这些设置通过将Unity包缓存添加到工作区来帮助改善VSCode类IDE中的代码智能。当在Unity中打开MCP Unity工具时，这会自动配置。");
            EditorGUILayout.Space();

            // Add button to manually update workspace
            if (GUILayout.Button(new GUIContent("立即更新工作区缓存", ideIntegrationTooltip), GUILayout.Height(24)))
            {
                bool updated = VsCodeWorkspaceUtils.AddPackageCacheToWorkspace();
                if (updated)
                {
                    EditorUtility.DisplayDialog("工作区已更新", "成功将Library/PackedCache添加到工作区文件。请重启IDE并打开工作区。", "确定");
                }
                else
                {
                    EditorUtility.DisplayDialog("工作区更新失败", "未找到工作区文件或无需更新。", "确定");
                }
            }

            EditorGUILayout.EndVertical();

            EditorGUILayout.Space();
            WrappedLabel("可用工具", _subHeaderStyle);
            
            EditorGUILayout.BeginVertical(_boxStyle);
            
            // execute_menu_item
            WrappedLabel("execute_menu_item", EditorStyles.boldLabel);
            WrappedLabel("执行项目中或Unity编辑器菜单路径中标记了MenuItem属性的函数");
            EditorGUILayout.BeginVertical(EditorStyles.helpBox);
            EditorGUILayout.LabelField("示例提示:", EditorStyles.miniLabel);
            WrappedLabel("执行菜单项'GameObject/Create Empty'来创建一个新的空GameObject", new GUIStyle(EditorStyles.miniLabel) { fontStyle = FontStyle.Italic });
            EditorGUILayout.EndVertical();
            EditorGUILayout.Space();

            // select_gameobject
            WrappedLabel("select_gameobject", EditorStyles.boldLabel);
            WrappedLabel("通过路径或实例ID在Unity层级中选择游戏对象");
            EditorGUILayout.BeginVertical(EditorStyles.helpBox);
            EditorGUILayout.LabelField("示例提示:", EditorStyles.miniLabel);
            WrappedLabel("选择场景中的Main Camera对象", new GUIStyle(EditorStyles.miniLabel) { fontStyle = FontStyle.Italic });
            EditorGUILayout.EndVertical();
            EditorGUILayout.Space();

            // update_gameobject
            WrappedLabel("update_gameobject", EditorStyles.boldLabel);
            WrappedLabel("更新GameObject的核心属性（名称、标签、层、激活/静态状态），如果不存在则创建GameObject");
            EditorGUILayout.BeginVertical(EditorStyles.helpBox);
            EditorGUILayout.LabelField("示例提示:", EditorStyles.miniLabel);
            WrappedLabel("将Player对象的标签设置为'Enemy'并使其不激活", new GUIStyle(EditorStyles.miniLabel) { fontStyle = FontStyle.Italic });
            EditorGUILayout.EndVertical();
            EditorGUILayout.Space();

            // update_component
            WrappedLabel("update_component", EditorStyles.boldLabel);
            WrappedLabel("更新GameObject上的组件字段，如果GameObject不包含该组件则添加它");
            EditorGUILayout.BeginVertical(EditorStyles.helpBox);
            EditorGUILayout.LabelField("示例提示:", EditorStyles.miniLabel);
            WrappedLabel("向Player对象添加Rigidbody组件并将其质量设置为5", new GUIStyle(EditorStyles.miniLabel) { fontStyle = FontStyle.Italic });
            EditorGUILayout.EndVertical();
            EditorGUILayout.Space();

            // add_package
            WrappedLabel("add_package", EditorStyles.boldLabel);
            WrappedLabel("在Unity包管理器中安装新包");
            EditorGUILayout.BeginVertical(EditorStyles.helpBox);
            EditorGUILayout.LabelField("示例提示:", EditorStyles.miniLabel);
            WrappedLabel("将TextMeshPro包添加到我的项目", new GUIStyle(EditorStyles.miniLabel) { fontStyle = FontStyle.Italic });
            EditorGUILayout.EndVertical();
            EditorGUILayout.Space();

            // run_tests
            WrappedLabel("run_tests", EditorStyles.boldLabel);
            WrappedLabel("使用Unity测试运行器运行测试");
            EditorGUILayout.BeginVertical(EditorStyles.helpBox);
            EditorGUILayout.LabelField("示例提示:", EditorStyles.miniLabel);
            WrappedLabel("运行项目中的所有EditMode测试", new GUIStyle(EditorStyles.miniLabel) { fontStyle = FontStyle.Italic });
            EditorGUILayout.EndVertical();
            EditorGUILayout.Space();

            // send_console_log
            WrappedLabel("send_console_log", EditorStyles.boldLabel);
            WrappedLabel("向Unity编辑器控制台发送控制台日志");
            EditorGUILayout.BeginVertical(EditorStyles.helpBox);
            EditorGUILayout.LabelField("示例提示:", EditorStyles.miniLabel);
            WrappedLabel("向Unity发送一条控制台日志，表示任务已完成", new GUIStyle(EditorStyles.miniLabel) { fontStyle = FontStyle.Italic });
            EditorGUILayout.EndVertical();
            EditorGUILayout.Space();

            // add_asset_to_scene
            WrappedLabel("add_asset_to_scene", EditorStyles.boldLabel);
            WrappedLabel("从AssetDatabase将资源添加到Unity场景");
            EditorGUILayout.BeginVertical(EditorStyles.helpBox);
            EditorGUILayout.LabelField("示例提示:", EditorStyles.miniLabel);
            WrappedLabel("将项目中的Player预制体添加到当前场景", new GUIStyle(EditorStyles.miniLabel) { fontStyle = FontStyle.Italic });
            EditorGUILayout.EndVertical();

            // recompile_scripts
            WrappedLabel("recompile_scripts", EditorStyles.boldLabel);
            WrappedLabel("重新编译Unity项目中的所有脚本");
            EditorGUILayout.BeginVertical(EditorStyles.helpBox);
            EditorGUILayout.LabelField("示例提示:", EditorStyles.miniLabel);
            WrappedLabel("重新编译项目中的脚本", new GUIStyle(EditorStyles.miniLabel) { fontStyle = FontStyle.Italic });
            EditorGUILayout.EndVertical();
            
            EditorGUILayout.EndVertical();
            
            // Available Resources section
            EditorGUILayout.Space();
            WrappedLabel("可用资源", _subHeaderStyle);

            EditorGUILayout.BeginVertical(_boxStyle);

            // unity://menu-items
            WrappedLabel("unity://menu-items", EditorStyles.boldLabel);
            WrappedLabel("检索Unity编辑器中所有可用菜单项的列表");
            EditorGUILayout.BeginVertical(EditorStyles.helpBox);
            EditorGUILayout.LabelField("示例提示:", EditorStyles.miniLabel);
            WrappedLabel("显示所有与GameObject创建相关的可用菜单项", new GUIStyle(EditorStyles.miniLabel) { fontStyle = FontStyle.Italic });
            EditorGUILayout.EndVertical();
            EditorGUILayout.Space();

            // unity://hierarchy
            WrappedLabel("unity://hierarchy", EditorStyles.boldLabel);
            WrappedLabel("检索Unity层级中所有游戏对象的列表");
            EditorGUILayout.BeginVertical(EditorStyles.helpBox);
            EditorGUILayout.LabelField("示例提示:", EditorStyles.miniLabel);
            WrappedLabel("显示当前场景的层级结构", new GUIStyle(EditorStyles.miniLabel) { fontStyle = FontStyle.Italic });
            EditorGUILayout.EndVertical();
            EditorGUILayout.Space();

            // unity://gameobject/{id}
            WrappedLabel("unity://gameobject/{id}", EditorStyles.boldLabel);
            WrappedLabel("检索特定GameObject的详细信息，包括所有组件及其序列化属性和字段");
            EditorGUILayout.BeginVertical(EditorStyles.helpBox);
            EditorGUILayout.LabelField("示例提示:", EditorStyles.miniLabel);
            WrappedLabel("获取Player GameObject的详细信息", new GUIStyle(EditorStyles.miniLabel) { fontStyle = FontStyle.Italic });
            EditorGUILayout.EndVertical();
            EditorGUILayout.Space();

            // unity://logs
            WrappedLabel("unity://logs", EditorStyles.boldLabel);
            WrappedLabel("检索Unity控制台中所有日志的列表");
            EditorGUILayout.BeginVertical(EditorStyles.helpBox);
            EditorGUILayout.LabelField("示例提示:", EditorStyles.miniLabel);
            WrappedLabel("显示Unity控制台中最近的错误消息", new GUIStyle(EditorStyles.miniLabel) { fontStyle = FontStyle.Italic });
            EditorGUILayout.EndVertical();
            EditorGUILayout.Space();

            // unity://packages
            WrappedLabel("unity://packages", EditorStyles.boldLabel);
            WrappedLabel("从Unity包管理器检索已安装和可用包的信息");
            EditorGUILayout.BeginVertical(EditorStyles.helpBox);
            EditorGUILayout.LabelField("示例提示:", EditorStyles.miniLabel);
            WrappedLabel("列出Unity项目中当前安装的所有包", new GUIStyle(EditorStyles.miniLabel) { fontStyle = FontStyle.Italic });
            EditorGUILayout.EndVertical();
            EditorGUILayout.Space();

            // unity://assets
            WrappedLabel("unity://assets", EditorStyles.boldLabel);
            WrappedLabel("检索Unity资源数据库中资源的信息");
            EditorGUILayout.BeginVertical(EditorStyles.helpBox);
            EditorGUILayout.LabelField("示例提示:", EditorStyles.miniLabel);
            WrappedLabel("查找项目中的所有纹理资源", new GUIStyle(EditorStyles.miniLabel) { fontStyle = FontStyle.Italic });
            EditorGUILayout.EndVertical();
            EditorGUILayout.Space();

            // unity://tests/{testMode}
            WrappedLabel("unity://tests/{testMode}", EditorStyles.boldLabel);
            WrappedLabel("检索Unity测试运行器中测试的信息");
            EditorGUILayout.BeginVertical(EditorStyles.helpBox);
            EditorGUILayout.LabelField("示例提示:", EditorStyles.miniLabel);
            WrappedLabel("列出Unity项目中所有可用的测试", new GUIStyle(EditorStyles.miniLabel) { fontStyle = FontStyle.Italic });
            EditorGUILayout.EndVertical();
            EditorGUILayout.Space();

            EditorGUILayout.EndVertical();

            // Author information
            EditorGUILayout.Space();
            WrappedLabel("作者", _subHeaderStyle);

            EditorGUILayout.BeginVertical(_boxStyle);

            WrappedLabel("由 CoderGamester 创建", EditorStyles.boldLabel);
            EditorGUILayout.Space();

            WrappedLabel("如有问题、反馈或贡献，请访问：");

            // Begin horizontal layout for buttons
            EditorGUILayout.BeginHorizontal();

            if (GUILayout.Button("GitHub: https://github.com/CoderGamester", GUILayout.Height(30)))
            {
                Application.OpenURL("https://github.com/CoderGamester");
            }

            if (GUILayout.Button("LinkedIn: Miguel Tomás", GUILayout.Height(30)))
            {
                Application.OpenURL("https://www.linkedin.com/in/miguel-tomas/");
            }

            // End horizontal layout
            EditorGUILayout.EndHorizontal();
            
            EditorGUILayout.EndVertical();
            
            // End scrollable area
            EditorGUILayout.EndScrollView();
        }

        #endregion

        #region Helper Methods

        private void InitializeStyles()
        {
            if (_isInitialized) return;
            
            // Window title
            titleContent = new GUIContent("MCP Unity");
            
            // Header style
            _headerStyle = new GUIStyle(EditorStyles.largeLabel)
            {
                fontSize = 20,
                fontStyle = FontStyle.Bold,
                alignment = TextAnchor.MiddleCenter,
                margin = new RectOffset(0, 0, 10, 10)
            };
            
            // Sub-header style
            _subHeaderStyle = new GUIStyle(EditorStyles.boldLabel)
            {
                fontSize = 14,
                margin = new RectOffset(0, 0, 10, 5)
            };
            
            // Box style
            _boxStyle = new GUIStyle(EditorStyles.helpBox)
            {
                padding = new RectOffset(10, 10, 10, 10),
                margin = new RectOffset(0, 0, 10, 10)
            };
            
            // Connected client box style with green background
            _connectedClientBoxStyle = new GUIStyle(EditorStyles.helpBox)
            {
                padding = new RectOffset(10, 10, 10, 10),
                margin = new RectOffset(0, 0, 5, 5)
            };
            
            // Create a light green texture for the background
            Texture2D greenTexture = new Texture2D(1, 1);
            greenTexture.SetPixel(0, 0, new Color(0.8f, 1.0f, 0.8f, 1.0f)); // Light green color
            greenTexture.Apply();
            
            _connectedClientBoxStyle.normal.background = greenTexture;
            
            // Label style for text in connected client boxes (black text for contrast)
            _connectedClientLabelStyle = new GUIStyle(EditorStyles.label)
            {
                normal = { textColor = Color.black }
            };
            
            // Wrapped label style for text that needs to wrap
            _wrappedLabelStyle = new GUIStyle(EditorStyles.label)
            {
                wordWrap = true,
                richText = true
            };
            
            _isInitialized = true;
        }
        
        /// <summary>
        /// Creates a label with text that properly wraps based on available width
        /// </summary>
        /// <param name="text">The text to display</param>
        /// <param name="style">Optional style override (wordWrap will be forced true)</param>
        /// <param name="options">Layout options</param>
        private void WrappedLabel(string text, GUIStyle style = null, params GUILayoutOption[] options)
        {
            if (style == null)
            {
                // Use our predefined wrapped label style
                EditorGUILayout.LabelField(text, _wrappedLabelStyle, options);
                return;
            }
            
            // Create a temporary style with wordWrap enabled based on the provided style
            GUIStyle wrappedStyle = new GUIStyle(style)
            {
                wordWrap = true
            };
            
            EditorGUILayout.LabelField(text, wrappedStyle, options);
        }



        // Helper to show a config button with unified logic
        private void ShowConfigButton(string configLabel, Func<bool, bool> configAction)
        {
            if (GUILayout.Button($"配置 {configLabel}", GUILayout.Height(30)))
            {
                bool added = configAction(_tabsIndentationJson);
                if (added)
                {
                    EditorUtility.DisplayDialog("成功", $"MCP配置已成功添加到{configLabel}配置文件。", "确定");
                }
                else
                {
                    EditorUtility.DisplayDialog("错误", $"无法将MCP配置添加到{configLabel}配置文件。", "确定");
                }
            }
        }

        
        #endregion
    }
}
