using System;
using System.Diagnostics;
using System.IO;
using UnityEditor;
using UnityEngine;
using Debug = UnityEngine.Debug;

namespace McpUnity.Editor
{
    /// <summary>
    /// 自动安装器 - 在包导入时自动安装Node.js依赖并启动服务器
    /// </summary>
    [InitializeOnLoad]
    public class AutoInstaller
    {
        private static readonly string ServerPath;
        private static readonly string PackageJsonPath;
        private static readonly string NodeModulesPath;
        private static readonly string InstallFlagPath;
        private static readonly string WizardShownFlagPath;
        
        static AutoInstaller()
        {
            // 获取Server~目录路径
            var packageInfo = UnityEditor.PackageManager.PackageInfo.FindForAssetPath("Packages/com.gamelovers.mcp-unity");

            if (packageInfo != null && !string.IsNullOrEmpty(packageInfo.resolvedPath))
            {
                ServerPath = Path.Combine(packageInfo.resolvedPath, "Server~");
            }
            else
            {
                // 如果是Assets中的包
                var assets = AssetDatabase.FindAssets("package t:TextAsset");
                foreach (var assetGuid in assets)
                {
                    var assetPath = AssetDatabase.GUIDToAssetPath(assetGuid);
                    if (assetPath.Contains("mcp-unity") && assetPath.EndsWith("package.json"))
                    {
                        var packageDir = Path.GetDirectoryName(assetPath);
                        ServerPath = Path.Combine(Path.GetDirectoryName(Application.dataPath), packageDir, "Server~");
                        break;
                    }
                }
            }

            if (string.IsNullOrEmpty(ServerPath) || !Directory.Exists(ServerPath))
            {
                Debug.LogWarning("[MCP Unity Auto Installer] Server~ directory not found. Skipping auto installation.");
                return;
            }

            PackageJsonPath = Path.Combine(ServerPath, "package.json");
            NodeModulesPath = Path.Combine(ServerPath, "node_modules");
            InstallFlagPath = Path.Combine(ServerPath, ".installed");
            WizardShownFlagPath = Path.Combine(ServerPath, ".wizard_shown");

            // 首次启动时显示设置向导（只显示一次）
            EditorApplication.delayCall += ShowSetupWizardIfNeeded;
        }
        
        private static void AutoInstall()
        {
            if (!File.Exists(PackageJsonPath))
            {
                Debug.LogError("[MCP Unity Auto Installer] package.json not found in Server~ directory.");
                return;
            }
            
            // 检查Node.js是否安装
            if (!IsNodeInstalled())
            {
                Debug.LogError("[MCP Unity Auto Installer] Node.js is not installed or not in PATH. Please install Node.js 18+ from https://nodejs.org/");

                // 打开设置向导
                EditorApplication.delayCall += () =>
                {
                    SetupWizard.ShowWindow();
                };

                return;
            }
            
            Debug.Log("[MCP Unity Auto Installer] Node.js detected. Installing npm dependencies...");
            
            // 显示进度条
            EditorUtility.DisplayProgressBar("MCP Unity Auto Installer", "Installing npm dependencies...", 0.5f);
            
            try
            {
                // 运行npm install
                var success = RunNpmInstall();
                
                EditorUtility.ClearProgressBar();
                
                if (success)
                {
                    // 创建安装标记文件
                    File.WriteAllText(InstallFlagPath, DateTime.Now.ToString());
                    
                    Debug.Log("[MCP Unity Auto Installer] ✅ Installation completed successfully!");
                    Debug.Log("[MCP Unity Auto Installer] MCP Unity Server is ready to use.");
                    
                    EditorUtility.DisplayDialog(
                        "MCP Unity - Installation Complete",
                        "✅ MCP Unity has been installed successfully!\n\n" +
                        "The WebSocket server will start automatically.\n" +
                        "You can now connect to ws://localhost:8090/McpUnity",
                        "OK"
                    );
                }
                else
                {
                    Debug.LogError("[MCP Unity Auto Installer] ❌ Installation failed. Please check the console for errors.");
                    
                    EditorUtility.DisplayDialog(
                        "MCP Unity - Installation Failed",
                        "❌ Failed to install npm dependencies.\n\n" +
                        "Please try manual installation:\n" +
                        "1. Open terminal/command prompt\n" +
                        "2. Navigate to: " + ServerPath + "\n" +
                        "3. Run: npm install",
                        "OK"
                    );
                }
            }
            catch (Exception e)
            {
                EditorUtility.ClearProgressBar();
                Debug.LogError($"[MCP Unity Auto Installer] Exception during installation: {e.Message}");
            }
        }
        
        public static bool IsNodeInstalled()
        {
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
                var output = process.StandardOutput.ReadToEnd();
                process.WaitForExit();

                return process.ExitCode == 0 && !string.IsNullOrEmpty(output);
            }
            catch
            {
                return false;
            }
        }
        
        private static bool RunNpmInstall()
        {
            try
            {
                var npmCommand = Application.platform == RuntimePlatform.WindowsEditor ? "npm.cmd" : "npm";
                
                var process = new Process
                {
                    StartInfo = new ProcessStartInfo
                    {
                        FileName = npmCommand,
                        Arguments = "install",
                        WorkingDirectory = ServerPath,
                        UseShellExecute = false,
                        RedirectStandardOutput = true,
                        RedirectStandardError = true,
                        CreateNoWindow = true
                    }
                };
                
                var output = "";
                var error = "";
                
                process.OutputDataReceived += (sender, args) =>
                {
                    if (!string.IsNullOrEmpty(args.Data))
                    {
                        output += args.Data + "\n";
                        Debug.Log($"[npm] {args.Data}");
                    }
                };
                
                process.ErrorDataReceived += (sender, args) =>
                {
                    if (!string.IsNullOrEmpty(args.Data))
                    {
                        error += args.Data + "\n";
                        // npm有时会把正常信息输出到stderr，所以这里用Log而不是LogError
                        Debug.Log($"[npm] {args.Data}");
                    }
                };
                
                process.Start();
                process.BeginOutputReadLine();
                process.BeginErrorReadLine();
                
                // 等待最多5分钟
                var timeout = TimeSpan.FromMinutes(5);
                if (!process.WaitForExit((int)timeout.TotalMilliseconds))
                {
                    Debug.LogError("[MCP Unity Auto Installer] npm install timed out after 5 minutes.");
                    process.Kill();
                    return false;
                }
                
                if (process.ExitCode != 0)
                {
                    Debug.LogError($"[MCP Unity Auto Installer] npm install failed with exit code {process.ExitCode}");
                    if (!string.IsNullOrEmpty(error))
                    {
                        Debug.LogError($"[MCP Unity Auto Installer] Error output:\n{error}");
                    }
                    return false;
                }
                
                return true;
            }
            catch (Exception e)
            {
                Debug.LogError($"[MCP Unity Auto Installer] Exception running npm install: {e.Message}");
                return false;
            }
        }
        
        [MenuItem("Tools/MCP Unity/高级/重新安装依赖")]
        public static void ForceReinstall()
        {
            if (EditorUtility.DisplayDialog(
                "MCP Unity - 重新安装依赖",
                "这将删除现有的 node_modules 并重新安装所有依赖。\n\n" +
                "这可能需要几分钟时间。是否继续？",
                "是", "取消"))
            {
                // 删除安装标记
                if (File.Exists(InstallFlagPath))
                {
                    File.Delete(InstallFlagPath);
                }

                // 删除node_modules
                if (Directory.Exists(NodeModulesPath))
                {
                    Debug.Log("[MCP Unity Auto Installer] Deleting existing node_modules...");
                    Directory.Delete(NodeModulesPath, true);
                }

                // 重新安装
                AutoInstall();
            }
        }
        
        [MenuItem("Tools/MCP Unity/高级/重置设置向导")]
        private static void ResetSetupWizard()
        {
            if (EditorUtility.DisplayDialog("重置设置向导",
                "这将重置设置向导的显示状态，下次启动Unity时会再次显示设置向导。\n\n确定要继续吗？",
                "是", "否"))
            {
                try
                {
                    if (File.Exists(WizardShownFlagPath))
                    {
                        File.Delete(WizardShownFlagPath);
                        Debug.Log("[MCP Unity Auto Installer] 设置向导已重置，下次启动时会再次显示。");
                        EditorUtility.DisplayDialog("成功", "设置向导已重置。\n\n下次启动Unity时会再次显示设置向导。", "确定");
                    }
                    else
                    {
                        EditorUtility.DisplayDialog("提示", "设置向导尚未显示过，无需重置。", "确定");
                    }
                }
                catch (Exception ex)
                {
                    Debug.LogError($"[MCP Unity Auto Installer] 重置设置向导失败: {ex.Message}");
                    EditorUtility.DisplayDialog("错误", $"重置设置向导失败: {ex.Message}", "确定");
                }
            }
        }

        [MenuItem("Tools/MCP Unity/高级/检查安装状态")]
        private static void CheckInstallationStatus()
        {
            var status = "MCP Unity 安装状态：\n\n";

            status += $"服务器路径: {ServerPath}\n";
            status += $"服务器路径存在: {Directory.Exists(ServerPath)}\n";
            status += $"package.json 存在: {File.Exists(PackageJsonPath)}\n";
            status += $"node_modules 存在: {Directory.Exists(NodeModulesPath)}\n";
            status += $"安装标记存在: {File.Exists(InstallFlagPath)}\n";
            status += $"向导已显示: {File.Exists(WizardShownFlagPath)}\n";

            if (File.Exists(InstallFlagPath))
            {
                var installDate = File.ReadAllText(InstallFlagPath);
                status += $"安装时间: {installDate}\n";
            }

            if (File.Exists(WizardShownFlagPath))
            {
                var wizardDate = File.ReadAllText(WizardShownFlagPath);
                status += $"向导显示时间: {wizardDate}\n";
            }

            status += $"\nNode.js 已安装: {IsNodeInstalled()}\n";

            if (IsNodeInstalled())
            {
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
                            CreateNoWindow = true
                        }
                    };
                    process.Start();
                    var version = process.StandardOutput.ReadToEnd().Trim();
                    process.WaitForExit();
                    status += $"Node.js 版本: {version}\n";
                }
                catch { }
            }

            Debug.Log(status);
            EditorUtility.DisplayDialog("MCP Unity - 安装状态", status, "确定");
        }

        private static void ShowSetupWizardIfNeeded()
        {
            // 检查向导是否已经显示过
            bool wizardAlreadyShown = File.Exists(WizardShownFlagPath);

            if (wizardAlreadyShown)
            {
                // 向导已经显示过，不再显示
                return;
            }

            // 检查是否是首次启动（没有安装标记）
            bool isFirstTime = !File.Exists(InstallFlagPath) || !Directory.Exists(NodeModulesPath);

            if (isFirstTime)
            {
                Debug.Log("[MCP Unity Auto Installer] 首次启动检测到，打开设置向导...");
                SetupWizard.ShowWindow();

                // 标记向导已显示
                try
                {
                    File.WriteAllText(WizardShownFlagPath, DateTime.Now.ToString());
                }
                catch (Exception ex)
                {
                    Debug.LogWarning($"[MCP Unity Auto Installer] 无法创建向导标记文件: {ex.Message}");
                }
            }
            else if (!IsNodeInstalled())
            {
                // 如果Node.js未安装，也显示向导（只显示一次）
                Debug.LogWarning("[MCP Unity Auto Installer] Node.js 未检测到，打开设置向导...");
                SetupWizard.ShowWindow();

                // 标记向导已显示
                try
                {
                    File.WriteAllText(WizardShownFlagPath, DateTime.Now.ToString());
                }
                catch (Exception ex)
                {
                    Debug.LogWarning($"[MCP Unity Auto Installer] 无法创建向导标记文件: {ex.Message}");
                }
            }
        }
    }
}

