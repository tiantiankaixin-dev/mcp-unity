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
    /// Set animator parameters (Float, Int, Bool, Trigger) on a GameObject at runtime or in edit mode
    /// Unity API: https://docs.unity3d.com/ScriptReference/Animator.SetFloat.html
    /// </summary>
    public class SetAnimatorParameterTool : McpToolBase
    {
        public SetAnimatorParameterTool()
        {
            Name = "set_animator_parameter";
            Description = "Set animator parameters (Float, Int, Bool, Trigger) on a GameObject at runtime or in edit mode";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                // Support both instanceId and gameObjectPath
                int? instanceId = parameters["instanceId"]?.ToObject<int?>();
                string gameObjectPath = parameters["gameObjectPath"]?.ToString();
                string parameterName = parameters["parameterName"]?.ToString();
                string parameterType = parameters["parameterType"]?.ToString();
                
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

                if (string.IsNullOrEmpty(parameterName))
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "parameterName is required", "validation_error");
                }

                if (string.IsNullOrEmpty(parameterType))
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "parameterType is required (Float, Int, Bool, Trigger)", "validation_error");
                }

                if (obj == null)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        $"GameObject not found: {identifier}", "not_found");
                }

                Animator animator = obj.GetComponent<Animator>();
                if (animator == null)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        $"Animator component not found on {gameObjectPath}", "not_found");
                }

                AnimatorController controller = animator.runtimeAnimatorController as AnimatorController;
                bool createIfNotExists = parameters["createIfNotExists"]?.ToObject<bool>() ?? false;

                // Check if parameter exists or create it
                if (controller != null && createIfNotExists)
                {
                    bool parameterExists = false;
                    foreach (var param in controller.parameters)
                    {
                        if (param.name == parameterName)
                        {
                            parameterExists = true;
                            break;
                        }
                    }

                    if (!parameterExists)
                    {
                        AnimatorControllerParameterType type = ParseParameterType(parameterType);
                        object defaultValue = parameters["defaultValue"]?.ToObject<object>();
                        
                        AnimatorControllerParameter newParam = new AnimatorControllerParameter
                        {
                            name = parameterName,
                            type = type
                        };

                        // Set default value
                        if (defaultValue != null)
                        {
                            switch (type)
                            {
                                case AnimatorControllerParameterType.Float:
                                    newParam.defaultFloat = Convert.ToSingle(defaultValue);
                                    break;
                                case AnimatorControllerParameterType.Int:
                                    newParam.defaultInt = Convert.ToInt32(defaultValue);
                                    break;
                                case AnimatorControllerParameterType.Bool:
                                    newParam.defaultBool = Convert.ToBoolean(defaultValue);
                                    break;
                            }
                        }

                        controller.AddParameter(newParam);
                        EditorUtility.SetDirty(controller);
                        AssetDatabase.SaveAssets();
                    }
                }

                // Set parameter value
                object value = null;
                switch (parameterType)
                {
                    case "Float":
                        float floatValue = parameters["value"]?.ToObject<float>() ?? 0f;
                        animator.SetFloat(parameterName, floatValue);
                        value = floatValue;
                        break;

                    case "Int":
                        int intValue = parameters["value"]?.ToObject<int>() ?? 0;
                        animator.SetInteger(parameterName, intValue);
                        value = intValue;
                        break;

                    case "Bool":
                        bool boolValue = parameters["value"]?.ToObject<bool>() ?? false;
                        animator.SetBool(parameterName, boolValue);
                        value = boolValue;
                        break;

                    case "Trigger":
                        animator.SetTrigger(parameterName);
                        value = "triggered";
                        break;

                    default:
                        return McpUnitySocketHandler.CreateErrorResponse(
                            $"Unknown parameter type: {parameterType}. Use Float, Int, Bool, or Trigger", 
                            "validation_error");
                }

                EditorUtility.SetDirty(obj);

                McpLogger.LogInfo($"Set animator parameter '{parameterName}' ({parameterType}) on '{obj.name}'");

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Set parameter '{parameterName}' to {value}",
                    ["parameterName"] = parameterName,
                    ["parameterType"] = parameterType,
                    ["value"] = value?.ToString(),
                    ["objectName"] = obj.name
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"SetAnimatorParameterTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }

        private AnimatorControllerParameterType ParseParameterType(string type)
        {
            switch (type)
            {
                case "Float": return AnimatorControllerParameterType.Float;
                case "Int": return AnimatorControllerParameterType.Int;
                case "Bool": return AnimatorControllerParameterType.Bool;
                case "Trigger": return AnimatorControllerParameterType.Trigger;
                default: return AnimatorControllerParameterType.Float;
            }
        }
    }
}
