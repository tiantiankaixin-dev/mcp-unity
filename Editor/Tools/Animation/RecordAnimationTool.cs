using System;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    /// <summary>
    /// Record animation from Transform changes and property modifications over time
    /// Note: This is a simplified implementation. Full recording requires Animation Window API.
    /// Unity API: https://docs.unity3d.com/ScriptReference/AnimationMode.html
    /// </summary>
    public class RecordAnimationTool : McpToolBase
    {
        public RecordAnimationTool()
        {
            Name = "record_animation";
            Description = "Record animation from Transform changes and property modifications over time";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                // Support both instanceId and gameObjectPath
                int? instanceId = parameters["instanceId"]?.ToObject<int?>();
                string gameObjectPath = parameters["gameObjectPath"]?.ToString();
                string animationClipPath = parameters["animationClipPath"]?.ToString();
                
                GameObject obj = null;
                string identifier = "";
                
                if (instanceId.HasValue && instanceId.Value != 0)
                {
                    obj = EditorUtility.InstanceIDToObject(instanceId.Value) as GameObject;
                    identifier = $"instanceId {instanceId.Value}";
                }
                else if (!string.IsNullOrEmpty(gameObjectPath))
                {
                    obj = GameObject.Find(gameObjectPath);
                    identifier = gameObjectPath;
                }
                else
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "Either 'instanceId' or 'gameObjectPath' is required", "validation_error");
                }

                if (string.IsNullOrEmpty(animationClipPath))
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "animationClipPath is required", "validation_error");
                }

                if (obj == null)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        $"GameObject not found: {identifier}", "not_found");
                }

                // Create or load animation clip
                AnimationClip clip = AssetDatabase.LoadAssetAtPath<AnimationClip>(animationClipPath);
                bool isNew = false;
                
                if (clip == null)
                {
                    clip = new AnimationClip();
                    AssetDatabase.CreateAsset(clip, animationClipPath);
                    isNew = true;
                }

                // Note: Full implementation would require AnimationMode.StartAnimationMode
                // and recording over time. This is a simplified version.
                
                McpLogger.LogWarning("RecordAnimationTool: Full animation recording requires Animation Window API integration.");
                McpLogger.LogInfo($"Created animation clip placeholder at {animationClipPath}");

                EditorUtility.SetDirty(clip);
                AssetDatabase.SaveAssets();

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = isNew ? $"Created animation clip at '{animationClipPath}'" : $"Animation clip exists at '{animationClipPath}'",
                    ["animationClipPath"] = animationClipPath,
                    ["note"] = "Full recording requires Animation Window integration. Use create_animation_curve for manual keyframe creation."
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"RecordAnimationTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}
