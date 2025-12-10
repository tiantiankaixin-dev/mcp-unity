using System;
using UnityEngine;
using UnityEditor;
using UnityEditor.Animations;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    /// <summary>
    /// Create blend trees for smooth animation blending based on parameters
    /// Unity API: https://docs.unity3d.com/ScriptReference/Animations.BlendTree.html
    /// </summary>
    public class BlendAnimationsTool : McpToolBase
    {
        public BlendAnimationsTool()
        {
            Name = "blend_animations";
            Description = "Create blend trees for smooth animation blending based on parameters";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string animatorControllerPath = parameters["animatorControllerPath"]?.ToString();
                string blendTreeName = parameters["blendTreeName"]?.ToString();
                string blendType = parameters["blendType"]?.ToString();
                
                if (string.IsNullOrEmpty(animatorControllerPath))
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "animatorControllerPath is required", "validation_error");
                }

                if (string.IsNullOrEmpty(blendTreeName))
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "blendTreeName is required", "validation_error");
                }

                AnimatorController controller = AssetDatabase.LoadAssetAtPath<AnimatorController>(animatorControllerPath);
                if (controller == null)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        $"Animator Controller not found: {animatorControllerPath}", "not_found");
                }

                int layerIndex = parameters["layerIndex"]?.ToObject<int>() ?? 0;
                if (layerIndex < 0 || layerIndex >= controller.layers.Length)
                {
                    layerIndex = 0;
                }

                AnimatorControllerLayer layer = controller.layers[layerIndex];
                AnimatorStateMachine stateMachine = layer.stateMachine;

                // Create blend tree state
                Vector3 position = Vector3.zero;
                if (parameters["position"] != null)
                {
                    var pos = parameters["position"];
                    position = new Vector3(
                        pos["x"]?.ToObject<float>() ?? 300,
                        pos["y"]?.ToObject<float>() ?? 100,
                        pos["z"]?.ToObject<float>() ?? 0
                    );
                }

                BlendTree blendTree = new BlendTree();
                blendTree.name = blendTreeName;
                blendTree.blendType = ParseBlendTreeType(blendType ?? "Simple1D");

                // Set blend parameter(s)
                if (parameters["parameter"] != null)
                {
                    blendTree.blendParameter = parameters["parameter"].ToString();
                }

                if (parameters["parameterX"] != null)
                {
                    blendTree.blendParameter = parameters["parameterX"].ToString();
                }

                if (parameters["parameterY"] != null)
                {
                    blendTree.blendParameterY = parameters["parameterY"].ToString();
                }

                // Add children if provided
                if (parameters["children"] != null && parameters["children"] is JArray childrenArray)
                {
                    foreach (var child in childrenArray)
                    {
                        string motionPath = child["motion"]?.ToString();
                        float threshold = child["threshold"]?.ToObject<float>() ?? 0f;

                        if (!string.IsNullOrEmpty(motionPath))
                        {
                            AnimationClip motion = AssetDatabase.LoadAssetAtPath<AnimationClip>(motionPath);
                            if (motion != null)
                            {
                                blendTree.AddChild(motion, threshold);
                            }
                        }
                    }
                }

                // Create state with blend tree
                AnimatorState state = stateMachine.AddState(blendTreeName, position);
                state.motion = blendTree;

                // Set as default if requested
                bool isDefaultState = parameters["isDefaultState"]?.ToObject<bool>() ?? false;
                if (isDefaultState)
                {
                    stateMachine.defaultState = state;
                }

                AssetDatabase.AddObjectToAsset(blendTree, controller);
                EditorUtility.SetDirty(controller);
                AssetDatabase.SaveAssets();

                McpLogger.LogInfo($"Created blend tree '{blendTreeName}' in controller '{controller.name}'");

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Created blend tree '{blendTreeName}'",
                    ["blendTreeName"] = blendTreeName,
                    ["blendType"] = blendTree.blendType.ToString(),
                    ["layerIndex"] = layerIndex,
                    ["childCount"] = blendTree.children.Length
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"BlendAnimationsTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }

        private BlendTreeType ParseBlendTreeType(string type)
        {
            switch (type)
            {
                case "Simple1D": return BlendTreeType.Simple1D;
                case "SimpleDirectional2D": return BlendTreeType.SimpleDirectional2D;
                case "FreeformDirectional2D": return BlendTreeType.FreeformDirectional2D;
                case "FreeformCartesian2D": return BlendTreeType.FreeformCartesian2D;
                case "Direct": return BlendTreeType.Direct;
                default: return BlendTreeType.Simple1D;
            }
        }
    }
}
