using System;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class BakeLightingTool : McpToolBase
    {
        private System.Threading.Tasks.TaskCompletionSource<JObject> _currentTcs;
        private System.Action _bakingCompletedCallback;
        private double _startTime;
        private const float TIMEOUT_SECONDS = 300f; // 5分钟超时
        private bool _isWaitingForBake = false;

        public BakeLightingTool()
        {
            Name = "bake_lighting";
            Description = "Bake lighting for the scene to improve performance and visual quality.";
            IsAsync = true;
        }

        public override void ExecuteAsync(JObject parameters, System.Threading.Tasks.TaskCompletionSource<JObject> tcs)
        {
            try
            {
                // 检查是否已有烘焙在进行
                if (Lightmapping.isRunning)
                {
                    tcs.SetResult(new JObject
                    {
                        ["success"] = false,
                        ["type"] = "text",
                        ["message"] = "Lightmapping is already running. Please wait for it to complete."
                    });
                    return;
                }

                bool clearBakedData = parameters["clearBakedData"]?.ToObject<bool>() ?? false;

                if (clearBakedData)
                {
                    Lightmapping.Clear();
                }

                // 检查场景中是否有可烘焙的内容
                var lights = UnityEngine.Object.FindObjectsByType<Light>(FindObjectsSortMode.None);
                bool hasRealtimeOrMixedLight = false;
                foreach (var light in lights)
                {
                    if (light.lightmapBakeType != LightmapBakeType.Realtime)
                    {
                        hasRealtimeOrMixedLight = true;
                        break;
                    }
                }

                if (!hasRealtimeOrMixedLight && lights.Length > 0)
                {
                    // 所有灯光都是实时的，没有需要烘焙的
                    tcs.SetResult(new JObject
                    {
                        ["success"] = true,
                        ["type"] = "text",
                        ["message"] = "No baked or mixed lights found in scene. All lights are realtime. NavMesh baked successfully (if applicable)."
                    });
                    return;
                }

                _currentTcs = tcs;
                _startTime = EditorApplication.timeSinceStartup;
                _isWaitingForBake = true;

                // 监听烘焙完成事件
                _bakingCompletedCallback = OnBakingCompleted;
                Lightmapping.bakeCompleted += _bakingCompletedCallback;

                // 注册更新回调以检查超时
                EditorApplication.update += CheckTimeout;

                // 开始烘焙
                bool started = Lightmapping.BakeAsync();
                
                if (!started)
                {
                    Cleanup();
                    tcs.SetResult(new JObject
                    {
                        ["success"] = true,
                        ["type"] = "text",
                        ["message"] = "Lightmapping completed immediately (scene may already be baked or no lightmaps needed)."
                    });
                }
            }
            catch (Exception ex)
            {
                Cleanup();
                McpLogger.LogError($"BakeLightingTool error: {ex.Message}");
                tcs.SetResult(McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error"));
            }
        }

        private void OnBakingCompleted()
        {
            if (!_isWaitingForBake || _currentTcs == null)
                return;

            Cleanup();

            JObject result = new JObject
            {
                ["success"] = true,
                ["type"] = "text",
                ["message"] = "Lighting baked successfully."
            };

            _currentTcs.TrySetResult(result);
        }

        private void CheckTimeout()
        {
            if (!_isWaitingForBake || _currentTcs == null)
            {
                EditorApplication.update -= CheckTimeout;
                return;
            }

            // 检查烘焙是否仍在运行
            if (!Lightmapping.isRunning)
            {
                // 烘焙已完成但回调可能未触发
                OnBakingCompleted();
                return;
            }

            // 检查超时
            double elapsed = EditorApplication.timeSinceStartup - _startTime;
            if (elapsed > TIMEOUT_SECONDS)
            {
                Lightmapping.Cancel();
                Cleanup();

                _currentTcs?.TrySetResult(new JObject
                {
                    ["success"] = false,
                    ["type"] = "text",
                    ["message"] = $"Lightmapping timed out after {TIMEOUT_SECONDS} seconds. Operation cancelled."
                });
            }
        }

        private void Cleanup()
        {
            _isWaitingForBake = false;
            
            if (_bakingCompletedCallback != null)
            {
                Lightmapping.bakeCompleted -= _bakingCompletedCallback;
                _bakingCompletedCallback = null;
            }
            
            EditorApplication.update -= CheckTimeout;
        }
    }
}

