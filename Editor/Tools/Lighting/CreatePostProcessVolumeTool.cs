using System;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class CreatePostProcessVolumeTool : McpToolBase
    {
        public CreatePostProcessVolumeTool()
        {
            Name = "create_post_process_volume";
            Description = "Create a Post Process Volume for visual effects (requires Post Processing package).";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string volumeName = parameters["volumeName"]?.ToObject<string>() ?? "PostProcessVolume";
                // ✅ 支持两种位置格式 (2D UI)

                float posX = 0f, posY = 0f;

                if (parameters["position"] != null && parameters["position"].Type == JTokenType.Array)

                {

                    var pos = parameters["position"].ToObject<float[]>();

                    if (pos.Length >= 2)

                    {

                        posX = pos[0];

                        posY = pos[1];

                    }

                }

                else

                {

                    posX = parameters["posX"]?.ToObject<float>() ?? 0f;

                    posY = parameters["posY"]?.ToObject<float>() ?? 0f;

                }
                float posZ = parameters["posZ"]?.ToObject<float>() ?? 0f;
                bool isGlobal = parameters["isGlobal"]?.ToObject<bool>() ?? true;

                GameObject volumeObj = new GameObject(volumeName);
                volumeObj.transform.position = new Vector3(posX, posY, posZ);

                // 尝试添加Post Process Volume组件
                // 注意：这需要Post Processing包已安装
                var postProcessVolumeType = System.Type.GetType("UnityEngine.Rendering.PostProcessing.PostProcessVolume, Unity.Postprocessing.Runtime");
                
                if (postProcessVolumeType != null)
                {
                    var volume = volumeObj.AddComponent(postProcessVolumeType);
                    
                    // 使用反射设置isGlobal属性
                    var isGlobalProperty = postProcessVolumeType.GetField("isGlobal");
                    if (isGlobalProperty != null)
                    {
                        isGlobalProperty.SetValue(volume, isGlobal);
                    }

                    Undo.RegisterCreatedObjectUndo(volumeObj, "Create Post Process Volume");

                    return new JObject
                    {
                        ["success"] = true,
                        ["message"] = $"Created Post Process Volume '{volumeName}'.",
                        ["volumeName"] = volumeName,
                        ["instanceId"] = volumeObj.GetInstanceID(),
                        ["isGlobal"] = isGlobal
                    };
                }
                else
                {
                    // 如果没有Post Processing包，创建一个空对象作为占位符
                    Undo.RegisterCreatedObjectUndo(volumeObj, "Create Post Process Volume Placeholder");

                    return new JObject
                    {
                        ["success"] = true,
                        ["message"] = $"Created placeholder for Post Process Volume '{volumeName}'. Note: Post Processing package not installed.",
                        ["volumeName"] = volumeName,
                        ["instanceId"] = volumeObj.GetInstanceID(),
                        ["warning"] = "Post Processing package not found. Install it via Package Manager."
                    };
                }
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"CreatePostProcessVolumeTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

