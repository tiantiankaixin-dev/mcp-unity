using UnityEditor;
using UnityEngine;
using McpUnity.Unity;

namespace McpUnity.Editor
{
    /// <summary>
    /// 自动修复 MCP 服务器启动问题
    /// 确保在 Unity 编辑器启动后服务器能够正确运行
    /// </summary>
    [InitializeOnLoad]
    public static class McpServerAutoFix
    {
        private static bool _hasChecked = false;
        
        static McpServerAutoFix()
        {
            // 延迟检查，确保所有初始化完成
            EditorApplication.delayCall += CheckAndRestartServer;
        }
        
        private static void CheckAndRestartServer()
        {
            if (_hasChecked) return;
            _hasChecked = true;
            
            // 等待一小段时间，确保 McpUnityServer 已经初始化
            EditorApplication.delayCall += () =>
            {
                var server = McpUnityServer.Instance;
                var settings = McpUnitySettings.Instance;
                
                // 如果自动启动已启用但服务器没有运行，强制启动
                if (settings.AutoStartServer && !server.IsListening)
                {
                    Debug.Log("[MCP Auto-Fix] 检测到服务器未运行，正在启动...");
                    server.StartServer();
                    
                    // 验证启动是否成功
                    EditorApplication.delayCall += () =>
                    {
                        if (server.IsListening)
                        {
                            Debug.Log("[MCP Auto-Fix] ✅ 服务器已成功启动！");
                        }
                        else
                        {
                            Debug.LogWarning("[MCP Auto-Fix] ⚠️ 服务器启动失败，请手动在 Tools > MCP Unity > Server Window 中启动");
                        }
                    };
                }
                else if (server.IsListening)
                {
                    Debug.Log("[MCP Auto-Fix] ✅ 服务器已正常运行");
                }
            };
        }
    }
}
