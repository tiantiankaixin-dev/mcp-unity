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
    /// Add a new animation state to an Animator Controller
    /// Unity API: https://docs.unity3d.com/ScriptReference/Animations.AnimatorStateMachine.AddState.html
    /// </summary>
    public class AddAnimationStateTool : McpToolBase
    {
        public AddAnimationStateTool()
        {
            Name = "add_animation_state";
            Description = "Add a new animation state to an Animator Controller";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string animatorControllerPath = parameters["animatorControllerPath"]?.ToString();
                string stateName = parameters["stateName"]?.ToString();
                
                if (string.IsNullOrEmpty(animatorControllerPath))
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "animatorControllerPath is required", "validation_error");
                }

                if (string.IsNullOrEmpty(stateName))
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "stateName is required", "validation_error");
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

                // Create position for the state
                Vector3 position = Vector3.zero;
                if (parameters["position"] != null)
                {
                    var pos = parameters["position"];
                    position = new Vector3(
                        pos["x"]?.ToObject<float>() ?? 0,
                        pos["y"]?.ToObject<float>() ?? 0,
                        pos["z"]?.ToObject<float>() ?? 0
                    );
                }
                else
                {
                    // Auto-position based on existing states
                    position = new Vector3(300, 100 + stateMachine.states.Length * 80, 0);
                }

                // Create state
                AnimatorState state = stateMachine.AddState(stateName, position);

                // Set animation clip if provided
                if (parameters["animationClipPath"] != null)
                {
                    string clipPath = parameters["animationClipPath"].ToString();
                    AnimationClip clip = AssetDatabase.LoadAssetAtPath<AnimationClip>(clipPath);
                    if (clip != null)
                    {
                        state.motion = clip;
                    }
                }

                // Configure state properties
                if (parameters["speed"] != null)
                    state.speed = parameters["speed"].ToObject<float>();

                if (parameters["cycleOffset"] != null)
                    state.cycleOffset = parameters["cycleOffset"].ToObject<float>();

                if (parameters["mirror"] != null)
                    state.mirror = parameters["mirror"].ToObject<bool>();

                if (parameters["iKOnFeet"] != null)
                    state.iKOnFeet = parameters["iKOnFeet"].ToObject<bool>();

                if (parameters["writeDefaultValues"] != null)
                    state.writeDefaultValues = parameters["writeDefaultValues"].ToObject<bool>();

                if (parameters["tag"] != null)
                    state.tag = parameters["tag"].ToString();

                // Set as default state if requested
                bool isDefaultState = parameters["isDefaultState"]?.ToObject<bool>() ?? false;
                if (isDefaultState)
                {
                    stateMachine.defaultState = state;
                }

                EditorUtility.SetDirty(controller);
                AssetDatabase.SaveAssets();

                McpLogger.LogInfo($"Added animation state '{stateName}' to controller '{controller.name}'");

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Added state '{stateName}' to layer {layerIndex}",
                    ["stateName"] = stateName,
                    ["layerIndex"] = layerIndex,
                    ["isDefaultState"] = isDefaultState,
                    ["position"] = new JObject { ["x"] = position.x, ["y"] = position.y }
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"AddAnimationStateTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}
