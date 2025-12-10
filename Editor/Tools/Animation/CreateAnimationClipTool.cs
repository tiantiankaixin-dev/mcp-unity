using System;
using System.IO;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class CreateAnimationClipTool : McpToolBase
    {
        public CreateAnimationClipTool()
        {
            Name = "create_animation_clip";
            Description = "Create a new Animation Clip asset.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string clipName = parameters["clipName"]?.ToObject<string>() ?? "NewAnimation";
                string savePath = parameters["savePath"]?.ToObject<string>() ?? "Assets/Animations";
                float length = parameters["length"]?.ToObject<float>() ?? 1f;
                bool looping = parameters["looping"]?.ToObject<bool>() ?? true;

                // 确保保存路径存在 (自动补全 Assets/ 前缀)
                savePath = McpUtils.EnsureFolderExists(savePath);

                AnimationClip clip = new AnimationClip();
                clip.name = clipName;
                
                // 设置循环
                AnimationClipSettings settings = AnimationUtility.GetAnimationClipSettings(clip);
                settings.loopTime = looping;
                AnimationUtility.SetAnimationClipSettings(clip, settings);

                string fullPath = Path.Combine(savePath, clipName + ".anim").Replace("\\", "/");
                AssetDatabase.CreateAsset(clip, fullPath);
                AssetDatabase.SaveAssets();
                AssetDatabase.Refresh();

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Created Animation Clip '{clipName}' at '{fullPath}'.",
                    ["clipName"] = clipName,
                    ["path"] = fullPath,
                    ["length"] = length,
                    ["looping"] = looping
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"CreateAnimationClipTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

