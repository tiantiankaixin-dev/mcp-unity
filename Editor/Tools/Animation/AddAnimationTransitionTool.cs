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
    /// Add a transition between animation states in an Animator Controller
    /// Unity API: https://docs.unity3d.com/ScriptReference/Animations.AnimatorState.AddTransition.html
    /// </summary>
    public class AddAnimationTransitionTool : McpToolBase
    {
        public AddAnimationTransitionTool()
        {
            Name = "add_animation_transition";
            Description = "Add a transition between animation states in an Animator Controller";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string animatorControllerPath = parameters["animatorControllerPath"]?.ToString();
                string fromState = parameters["fromState"]?.ToString();
                string toState = parameters["toState"]?.ToString();
                
                if (string.IsNullOrEmpty(animatorControllerPath))
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "animatorControllerPath is required", "validation_error");
                }

                if (string.IsNullOrEmpty(fromState) || string.IsNullOrEmpty(toState))
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "Both fromState and toState are required", "validation_error");
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

                // Find source state
                AnimatorState sourceState = null;
                if (fromState == "Any State")
                {
                    // Use Any State transition
                }
                else if (fromState == "Entry")
                {
                    // Entry state transition
                }
                else
                {
                    sourceState = FindState(stateMachine, fromState);
                    if (sourceState == null)
                    {
                        return McpUnitySocketHandler.CreateErrorResponse(
                            $"Source state not found: {fromState}", "not_found");
                    }
                }

                // Find destination state
                AnimatorState destinationState = FindState(stateMachine, toState);
                if (destinationState == null)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        $"Destination state not found: {toState}", "not_found");
                }

                // Create transition
                AnimatorTransitionBase transition = null;
                
                if (fromState == "Any State")
                {
                    transition = stateMachine.AddAnyStateTransition(destinationState);
                }
                else if (fromState == "Entry")
                {
                    transition = stateMachine.AddEntryTransition(destinationState);
                }
                else
                {
                    transition = sourceState.AddTransition(destinationState);
                }

                // Configure transition properties (only for AnimatorStateTransition)
                if (transition is AnimatorStateTransition stateTransition)
                {
                    if (parameters["hasExitTime"] != null)
                        stateTransition.hasExitTime = parameters["hasExitTime"].ToObject<bool>();
                    else
                        stateTransition.hasExitTime = true;

                    if (parameters["exitTime"] != null)
                        stateTransition.exitTime = parameters["exitTime"].ToObject<float>();

                    if (parameters["duration"] != null)
                        stateTransition.duration = parameters["duration"].ToObject<float>();

                    if (parameters["offset"] != null)
                        stateTransition.offset = parameters["offset"].ToObject<float>();

                    if (parameters["interruptionSource"] != null)
                    {
                        string interruptionSource = parameters["interruptionSource"].ToString();
                        stateTransition.interruptionSource = ParseInterruptionSource(interruptionSource);
                    }

                    if (parameters["orderedInterruption"] != null)
                        stateTransition.orderedInterruption = parameters["orderedInterruption"].ToObject<bool>();

                    if (parameters["canTransitionToSelf"] != null)
                        stateTransition.canTransitionToSelf = parameters["canTransitionToSelf"].ToObject<bool>();
                }

                // Add conditions if provided
                if (parameters["conditions"] != null && parameters["conditions"] is JArray conditionsArray)
                {
                    foreach (var conditionObj in conditionsArray)
                    {
                        string parameterName = conditionObj["parameter"]?.ToString();
                        string mode = conditionObj["mode"]?.ToString();
                        float threshold = conditionObj["threshold"]?.ToObject<float>() ?? 0f;

                        if (!string.IsNullOrEmpty(parameterName) && !string.IsNullOrEmpty(mode))
                        {
                            AnimatorConditionMode conditionMode = ParseConditionMode(mode);
                            transition.AddCondition(conditionMode, threshold, parameterName);
                        }
                    }
                }

                EditorUtility.SetDirty(controller);
                AssetDatabase.SaveAssets();

                McpLogger.LogInfo($"Added transition from '{fromState}' to '{toState}'");

                bool hasExitTime = true;
                float duration = 0f;

                if (transition is AnimatorStateTransition stateTrans)
                {
                    hasExitTime = stateTrans.hasExitTime;
                    duration = stateTrans.duration;
                }

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Added transition from '{fromState}' to '{toState}'",
                    ["fromState"] = fromState,
                    ["toState"] = toState,
                    ["layerIndex"] = layerIndex,
                    ["hasExitTime"] = hasExitTime,
                    ["duration"] = duration
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"AddAnimationTransitionTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }

        private AnimatorState FindState(AnimatorStateMachine stateMachine, string stateName)
        {
            foreach (var childState in stateMachine.states)
            {
                if (childState.state.name == stateName)
                {
                    return childState.state;
                }
            }

            // Search in sub state machines
            foreach (var childStateMachine in stateMachine.stateMachines)
            {
                AnimatorState state = FindState(childStateMachine.stateMachine, stateName);
                if (state != null)
                {
                    return state;
                }
            }

            return null;
        }

        private TransitionInterruptionSource ParseInterruptionSource(string source)
        {
            switch (source)
            {
                case "None": return TransitionInterruptionSource.None;
                case "Source": return TransitionInterruptionSource.Source;
                case "Destination": return TransitionInterruptionSource.Destination;
                case "SourceThenDestination": return TransitionInterruptionSource.SourceThenDestination;
                case "DestinationThenSource": return TransitionInterruptionSource.DestinationThenSource;
                default: return TransitionInterruptionSource.None;
            }
        }

        private AnimatorConditionMode ParseConditionMode(string mode)
        {
            switch (mode)
            {
                case "If": return AnimatorConditionMode.If;
                case "IfNot": return AnimatorConditionMode.IfNot;
                case "Greater": return AnimatorConditionMode.Greater;
                case "Less": return AnimatorConditionMode.Less;
                case "Equals": return AnimatorConditionMode.Equals;
                case "NotEqual": return AnimatorConditionMode.NotEqual;
                default: return AnimatorConditionMode.If;
            }
        }
    }
}
