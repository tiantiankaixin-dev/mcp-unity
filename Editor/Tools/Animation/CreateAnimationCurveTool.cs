using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    /// <summary>
    /// Create and edit animation curves with keyframes for animating properties
    /// Unity API: https://docs.unity3d.com/ScriptReference/AnimationClip.SetCurve.html
    /// </summary>
    public class CreateAnimationCurveTool : McpToolBase
    {
        public CreateAnimationCurveTool()
        {
            Name = "create_animation_curve";
            Description = "Create and edit animation curves with keyframes for animating properties";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string animationClipPath = parameters["animationClipPath"]?.ToString();
                string propertyPath = parameters["propertyPath"]?.ToString();
                string targetType = parameters["targetType"]?.ToString();
                
                if (string.IsNullOrEmpty(animationClipPath))
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "animationClipPath is required", "validation_error");
                }

                if (string.IsNullOrEmpty(propertyPath))
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "propertyPath is required (e.g., 'm_LocalPosition.x')", "validation_error");
                }

                if (string.IsNullOrEmpty(targetType))
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "targetType is required (e.g., 'Transform', 'Renderer')", "validation_error");
                }

                bool createIfNotExists = parameters["createIfNotExists"]?.ToObject<bool>() ?? false;
                AnimationClip clip = AssetDatabase.LoadAssetAtPath<AnimationClip>(animationClipPath);

                if (clip == null)
                {
                    if (createIfNotExists)
                    {
                        clip = new AnimationClip();
                        AssetDatabase.CreateAsset(clip, animationClipPath);
                        AssetDatabase.SaveAssets();
                    }
                    else
                    {
                        return McpUnitySocketHandler.CreateErrorResponse(
                            $"Animation clip not found: {animationClipPath}", "not_found");
                    }
                }

                // Parse keyframes
                if (parameters["keyframes"] == null || !(parameters["keyframes"] is JArray keyframesArray))
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "keyframes array is required", "validation_error");
                }

                List<Keyframe> keyframes = new List<Keyframe>();
                foreach (var kfObj in keyframesArray)
                {
                    float time = kfObj["time"]?.ToObject<float>() ?? 0f;
                    float value = kfObj["value"]?.ToObject<float>() ?? 0f;
                    float inTangent = kfObj["inTangent"]?.ToObject<float>() ?? 0f;
                    float outTangent = kfObj["outTangent"]?.ToObject<float>() ?? 0f;

                    keyframes.Add(new Keyframe(time, value, inTangent, outTangent));
                }

                if (keyframes.Count == 0)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "At least one keyframe is required", "validation_error");
                }

                // Create animation curve
                AnimationCurve curve = new AnimationCurve(keyframes.ToArray());

                // Set wrap modes
                string preWrapMode = parameters["preWrapMode"]?.ToString() ?? "ClampForever";
                string postWrapMode = parameters["postWrapMode"]?.ToString() ?? "ClampForever";
                curve.preWrapMode = ParseWrapMode(preWrapMode);
                curve.postWrapMode = ParseWrapMode(postWrapMode);

                // Set curve on clip
                Type type = Type.GetType($"UnityEngine.{targetType}, UnityEngine");
                if (type == null)
                {
                    type = Type.GetType($"UnityEngine.{targetType}, UnityEngine.CoreModule");
                }

                if (type == null)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        $"Unknown type: {targetType}", "validation_error");
                }

                clip.SetCurve("", type, propertyPath, curve);
                
                EditorUtility.SetDirty(clip);
                AssetDatabase.SaveAssets();

                McpLogger.LogInfo($"Created animation curve for {propertyPath} on {type.Name}");

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Created curve for '{propertyPath}' with {keyframes.Count} keyframes",
                    ["animationClipPath"] = animationClipPath,
                    ["propertyPath"] = propertyPath,
                    ["targetType"] = targetType,
                    ["keyframeCount"] = keyframes.Count,
                    ["duration"] = clip.length
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"CreateAnimationCurveTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }

        private WrapMode ParseWrapMode(string mode)
        {
            switch (mode)
            {
                case "Once": return WrapMode.Once;
                case "Loop": return WrapMode.Loop;
                case "PingPong": return WrapMode.PingPong;
                case "ClampForever": return WrapMode.ClampForever;
                default: return WrapMode.ClampForever;
            }
        }
    }
}
