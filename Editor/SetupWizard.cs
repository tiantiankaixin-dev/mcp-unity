using System;
using System.Diagnostics;
using System.IO;
using UnityEditor;
using UnityEngine;
using Debug = UnityEngine.Debug;

namespace McpUnity.Editor
{
    /// <summary>
    /// MCP Unity 设置向导 - 检测并引导用户安装必要的依赖
    /// </summary>
    public class SetupWizard : EditorWindow
    {
        private bool _nodeJsInstalled = false;
        private bool _npmInstalled = false;
        private bool _serverInstalled = false;
        private string _nodeVersion = "";
        private string _npmVersion = "";
        
        private Vector2 _scrollPosition;
        private GUIStyle _headerStyle;
        private GUIStyle _successStyle;
        private GUIStyle _errorStyle;
        private GUIStyle _warningStyle;
        private GUIStyle _boxStyle;
        
        private bool _stylesInitialized = false;

        [MenuItem("Tools/MCP Unity/设置向导", false, 0)]
        public static void ShowWindow()
        {
            var window = GetWindow<SetupWizard>("MCP Unity 设置向导");
            window.minSize = new Vector2(600, 500);
            window.maxSize = new Vector2(600, 500);
            window.Show();
            window.CheckDependencies();
        }

        private void InitializeStyles()
        {
            if (_stylesInitialized) return;

            _headerStyle = new GUIStyle(EditorStyles.boldLabel)
            {
                fontSize = 16,
                margin = new RectOffset(0, 0, 10, 10)
            };

            _successStyle = new GUIStyle(EditorStyles.label)
            {
                normal = { textColor = new Color(0.0f, 0.8f, 0.0f) },
                fontSize = 13,
                fontStyle = FontStyle.Bold
            };

            _errorStyle = new GUIStyle(EditorStyles.label)
            {
                normal = { textColor = new Color(1.0f, 0.3f, 0.3f) },
                fontSize = 13,
                fontStyle = FontStyle.Bold
            };

            _warningStyle = new GUIStyle(EditorStyles.label)
            {
                normal = { textColor = new Color(1.0f, 0.7f, 0.0f) },
                fontSize = 12,
                wordWrap = true
            };

            _boxStyle = new GUIStyle(GUI.skin.box)
            {
                padding = new RectOffset(10, 10, 10, 10),
                margin = new RectOffset(0, 0, 5, 5)
            };

            _stylesInitialized = true;
        }

        private void OnGUI()
        {
            InitializeStyles();

            _scrollPosition = EditorGUILayout.BeginScrollView(_scrollPosition);

            // 标题
            GUILayout.Space(10);
            EditorGUILayout.LabelField("MCP Unity 设置向导", _headerStyle);
            EditorGUILayout.LabelField("此向导将帮助您设置 MCP Unity 以连接 AI 助手与 Unity 编辑器。", EditorStyles.wordWrappedLabel);
            
            GUILayout.Space(20);

            // 系统检查区域
            DrawSystemCheck();

            GUILayout.Space(20);

            // 根据不同情况显示不同内容
            if (_serverInstalled)
            {
                // 服务器已安装 - 显示成功
                DrawSuccessSection();
            }
            else if (!_nodeJsInstalled)
            {
                // Node.js未安装 - 必须先安装Node.js
                DrawMissingDependenciesWarning();
                GUILayout.Space(10);
                DrawInstallationInstructions();
            }
            else if (!_npmInstalled)
            {
                // Node.js已安装但npm未检测到 - 显示警告但允许继续
                DrawMissingDependenciesWarning();
                GUILayout.Space(10);
                DrawServerInstallationSection();
            }
            else
            {
                // Node.js和npm都已安装，但服务器依赖未安装
                DrawServerInstallationSection();
            }

            EditorGUILayout.EndScrollView();
        }

        private void DrawSystemCheck()
        {
            EditorGUILayout.BeginVertical(_boxStyle);
            
            EditorGUILayout.BeginHorizontal();
            EditorGUILayout.LabelField("系统检查", EditorStyles.boldLabel, GUILayout.Width(200));
            if (GUILayout.Button("刷新", GUILayout.Width(100)))
            {
                CheckDependencies();
            }
            EditorGUILayout.EndHorizontal();

            GUILayout.Space(10);

            // Node.js 检查
            EditorGUILayout.BeginHorizontal();
            if (_nodeJsInstalled)
            {
                EditorGUILayout.LabelField("✓", _successStyle, GUILayout.Width(20));
                EditorGUILayout.LabelField($"Node.js", _successStyle, GUILayout.Width(150));
                EditorGUILayout.LabelField(_nodeVersion, EditorStyles.label);
            }
            else
            {
                EditorGUILayout.LabelField("✗", _errorStyle, GUILayout.Width(20));
                EditorGUILayout.LabelField("Node.js", _errorStyle, GUILayout.Width(150));
                EditorGUILayout.LabelField("(未找到 Node.js，请安装)", _errorStyle);
            }
            EditorGUILayout.EndHorizontal();

            // npm 检查
            EditorGUILayout.BeginHorizontal();
            if (_npmInstalled)
            {
                EditorGUILayout.LabelField("✓", _successStyle, GUILayout.Width(20));
                EditorGUILayout.LabelField($"npm", _successStyle, GUILayout.Width(150));
                EditorGUILayout.LabelField(_npmVersion, EditorStyles.label);
            }
            else
            {
                // 如果服务器已安装，npm不是必需的
                if (_serverInstalled)
                {
                    EditorGUILayout.LabelField("○", new GUIStyle(EditorStyles.label) { normal = { textColor = Color.gray } }, GUILayout.Width(20));
                    EditorGUILayout.LabelField("npm", new GUIStyle(EditorStyles.label) { normal = { textColor = Color.gray } }, GUILayout.Width(150));
                    EditorGUILayout.LabelField("(未检测到，但不影响使用)", new GUIStyle(EditorStyles.label) { normal = { textColor = Color.gray } });
                }
                else
                {
                    EditorGUILayout.LabelField("✗", _errorStyle, GUILayout.Width(20));
                    EditorGUILayout.LabelField("npm", _errorStyle, GUILayout.Width(150));
                    EditorGUILayout.LabelField("(未找到 npm，安装依赖时需要)", _errorStyle);
                }
            }
            EditorGUILayout.EndHorizontal();

            // MCP 服务器检查
            EditorGUILayout.BeginHorizontal();
            if (_serverInstalled)
            {
                EditorGUILayout.LabelField("✓", _successStyle, GUILayout.Width(20));
                EditorGUILayout.LabelField("MCP 服务器", _successStyle, GUILayout.Width(150));
                EditorGUILayout.LabelField("(已安装)", _successStyle);
            }
            else
            {
                EditorGUILayout.LabelField("✗", _errorStyle, GUILayout.Width(20));
                EditorGUILayout.LabelField("MCP 服务器", _errorStyle, GUILayout.Width(150));
                EditorGUILayout.LabelField("(依赖未安装)", _errorStyle);
            }
            EditorGUILayout.EndHorizontal();

            EditorGUILayout.EndVertical();
        }

        private void DrawMissingDependenciesWarning()
        {
            EditorGUILayout.BeginVertical(_boxStyle);

            EditorGUILayout.BeginHorizontal();
            GUILayout.Label("⚠", new GUIStyle(EditorStyles.boldLabel) { fontSize = 24, normal = { textColor = new Color(1.0f, 0.7f, 0.0f) } }, GUILayout.Width(40));

            // 如果服务器已安装，npm不是必需的
            if (_serverInstalled)
            {
                EditorGUILayout.LabelField(
                    "提示：虽然未检测到 npm，但服务器依赖已安装，MCP Unity 可以正常使用。",
                    _warningStyle
                );
            }
            else
            {
                EditorGUILayout.LabelField(
                    "缺少依赖：MCP Unity 需要 Node.js 18+ 和 npm 才能安装服务器依赖。",
                    _warningStyle
                );
            }
            EditorGUILayout.EndHorizontal();

            EditorGUILayout.EndVertical();
        }

        private void DrawInstallationInstructions()
        {
            EditorGUILayout.BeginVertical(_boxStyle);
            
            EditorGUILayout.LabelField("✗ 需要安装", new GUIStyle(EditorStyles.boldLabel) 
            { 
                normal = { textColor = new Color(1.0f, 0.3f, 0.3f) },
                fontSize = 14
            });
            
            GUILayout.Space(10);
            
            EditorGUILayout.LabelField("Windows 安装建议：", EditorStyles.boldLabel);
            
            GUILayout.Space(5);
            
            // Node.js 安装说明
            EditorGUILayout.LabelField("1. Node.js：从官方网站下载并安装", EditorStyles.wordWrappedLabel);
            EditorGUILayout.BeginHorizontal();
            GUILayout.Space(20);
            EditorGUILayout.LabelField("• 推荐版本：Node.js 18 LTS 或更高", EditorStyles.wordWrappedLabel);
            EditorGUILayout.EndHorizontal();
            
            EditorGUILayout.BeginHorizontal();
            GUILayout.Space(20);
            EditorGUILayout.LabelField("• 下载地址：https://nodejs.org/", EditorStyles.wordWrappedLabel);
            if (GUILayout.Button("打开下载页面", GUILayout.Width(120)))
            {
                Application.OpenURL("https://nodejs.org/");
            }
            EditorGUILayout.EndHorizontal();
            
            GUILayout.Space(10);
            
            EditorGUILayout.LabelField("2. 安装完成后：", EditorStyles.wordWrappedLabel);
            EditorGUILayout.BeginHorizontal();
            GUILayout.Space(20);
            EditorGUILayout.LabelField("• 重启 Unity 编辑器", EditorStyles.wordWrappedLabel);
            EditorGUILayout.EndHorizontal();
            EditorGUILayout.BeginHorizontal();
            GUILayout.Space(20);
            EditorGUILayout.LabelField("• 点击上方的「刷新」按钮重新检测", EditorStyles.wordWrappedLabel);
            EditorGUILayout.EndHorizontal();
            
            EditorGUILayout.EndVertical();
        }

        private void DrawServerInstallationSection()
        {
            EditorGUILayout.BeginVertical(_boxStyle);
            
            EditorGUILayout.LabelField("⚠ MCP 服务器依赖未安装", new GUIStyle(EditorStyles.boldLabel) 
            { 
                normal = { textColor = new Color(1.0f, 0.7f, 0.0f) },
                fontSize = 14
            });
            
            GUILayout.Space(10);
            
            EditorGUILayout.LabelField("Node.js 和 npm 已安装，但服务器依赖尚未安装。", EditorStyles.wordWrappedLabel);
            
            GUILayout.Space(10);
            
            if (GUILayout.Button("立即安装服务器依赖", GUILayout.Height(40)))
            {
                InstallServerDependencies();
            }
            
            EditorGUILayout.EndVertical();
        }

        private void DrawSuccessSection()
        {
            EditorGUILayout.BeginVertical(_boxStyle);
            
            EditorGUILayout.LabelField("✓ 所有依赖已安装", new GUIStyle(EditorStyles.boldLabel) 
            { 
                normal = { textColor = new Color(0.0f, 0.8f, 0.0f) },
                fontSize = 14
            });
            
            GUILayout.Space(10);
            
            EditorGUILayout.LabelField("MCP Unity 已准备就绪！", EditorStyles.wordWrappedLabel);
            
            GUILayout.Space(10);
            
            EditorGUILayout.LabelField("下一步：", EditorStyles.boldLabel);
            EditorGUILayout.LabelField("• 打开 MCP Unity 服务器窗口", EditorStyles.wordWrappedLabel);
            EditorGUILayout.LabelField("• 启动 WebSocket 服务器", EditorStyles.wordWrappedLabel);
            EditorGUILayout.LabelField("• 连接到 ws://localhost:8090/McpUnity", EditorStyles.wordWrappedLabel);
            
            GUILayout.Space(10);
            
            if (GUILayout.Button("打开服务器窗口", GUILayout.Height(30)))
            {
                McpUnity.Unity.McpUnityEditorWindow.ShowWindow();
                Close();
            }
            
            EditorGUILayout.EndVertical();
        }

        private void CheckDependencies()
        {
            // 检查 Node.js
            _nodeJsInstalled = CheckNodeJs(out _nodeVersion);
            
            // 检查 npm
            _npmInstalled = CheckNpm(out _npmVersion);
            
            // 检查服务器依赖
            _serverInstalled = CheckServerInstallation();
            
            Repaint();
        }

        private bool CheckNodeJs(out string version)
        {
            version = "";
            try
            {
                var process = new Process
                {
                    StartInfo = new ProcessStartInfo
                    {
                        FileName = "node",
                        Arguments = "--version",
                        UseShellExecute = false,
                        RedirectStandardOutput = true,
                        RedirectStandardError = true,
                        CreateNoWindow = true
                    }
                };
                
                process.Start();
                version = process.StandardOutput.ReadToEnd().Trim();
                process.WaitForExit();
                
                return process.ExitCode == 0 && !string.IsNullOrEmpty(version);
            }
            catch
            {
                return false;
            }
        }

        private bool CheckNpm(out string version)
        {
            version = "";
            try
            {
                var npmCommand = Application.platform == RuntimePlatform.WindowsEditor ? "npm.cmd" : "npm";
                var process = new Process
                {
                    StartInfo = new ProcessStartInfo
                    {
                        FileName = npmCommand,
                        Arguments = "--version",
                        UseShellExecute = false,
                        RedirectStandardOutput = true,
                        RedirectStandardError = true,
                        CreateNoWindow = true
                    }
                };
                
                process.Start();
                version = process.StandardOutput.ReadToEnd().Trim();
                process.WaitForExit();
                
                return process.ExitCode == 0 && !string.IsNullOrEmpty(version);
            }
            catch
            {
                return false;
            }
        }

        private bool CheckServerInstallation()
        {
            var serverPath = McpUnity.Utils.McpUtils.GetServerPath();
            if (string.IsNullOrEmpty(serverPath) || serverPath.Contains("Could not locate"))
            {
                return false;
            }
            
            var nodeModulesPath = Path.Combine(serverPath, "node_modules");
            return Directory.Exists(nodeModulesPath);
        }

        private void InstallServerDependencies()
        {
            var serverPath = McpUnity.Utils.McpUtils.GetServerPath();
            if (string.IsNullOrEmpty(serverPath) || serverPath.Contains("Could not locate"))
            {
                EditorUtility.DisplayDialog(
                    "错误",
                    "无法找到 Server~ 目录。请确保 MCP Unity 包已正确安装。",
                    "确定"
                );
                return;
            }

            var nodeModulesPath = Path.Combine(serverPath, "node_modules");

            // 删除现有的 node_modules
            if (Directory.Exists(nodeModulesPath))
            {
                try
                {
                    Debug.Log("[MCP Unity Setup Wizard] 删除现有的 node_modules...");
                    Directory.Delete(nodeModulesPath, true);
                }
                catch (Exception ex)
                {
                    Debug.LogError($"[MCP Unity Setup Wizard] 删除 node_modules 失败: {ex.Message}");
                }
            }

            // 运行 npm install
            Debug.Log("[MCP Unity Setup Wizard] 开始安装依赖...");
            EditorUtility.DisplayProgressBar("MCP Unity", "正在安装 npm 依赖...", 0.5f);

            try
            {
                var npmCommand = Application.platform == RuntimePlatform.WindowsEditor ? "npm.cmd" : "npm";

                var process = new Process
                {
                    StartInfo = new ProcessStartInfo
                    {
                        FileName = npmCommand,
                        Arguments = "install",
                        WorkingDirectory = serverPath,
                        UseShellExecute = false,
                        RedirectStandardOutput = true,
                        RedirectStandardError = true,
                        CreateNoWindow = true
                    }
                };

                process.OutputDataReceived += (sender, args) =>
                {
                    if (!string.IsNullOrEmpty(args.Data))
                    {
                        Debug.Log($"[npm] {args.Data}");
                    }
                };

                process.ErrorDataReceived += (sender, args) =>
                {
                    if (!string.IsNullOrEmpty(args.Data))
                    {
                        Debug.Log($"[npm] {args.Data}");
                    }
                };

                process.Start();
                process.BeginOutputReadLine();
                process.BeginErrorReadLine();

                // 等待完成
                process.WaitForExit();

                EditorUtility.ClearProgressBar();

                if (process.ExitCode == 0)
                {
                    Debug.Log("[MCP Unity Setup Wizard] ✅ 依赖安装成功！");
                    EditorUtility.DisplayDialog(
                        "安装成功",
                        "npm 依赖已成功安装！\n\nMCP Unity 现在可以使用了。",
                        "确定"
                    );
                }
                else
                {
                    Debug.LogError($"[MCP Unity Setup Wizard] npm install 失败，退出代码: {process.ExitCode}");
                    EditorUtility.DisplayDialog(
                        "安装失败",
                        $"npm install 失败。\n\n请检查 Console 窗口查看详细错误信息。",
                        "确定"
                    );
                }

                // 延迟检查依赖状态
                EditorApplication.delayCall += () =>
                {
                    System.Threading.Thread.Sleep(1000);
                    CheckDependencies();
                };
            }
            catch (Exception ex)
            {
                EditorUtility.ClearProgressBar();
                Debug.LogError($"[MCP Unity Setup Wizard] 安装过程出错: {ex.Message}");
                EditorUtility.DisplayDialog(
                    "错误",
                    $"安装过程出错:\n{ex.Message}",
                    "确定"
                );
            }
        }
    }
}

