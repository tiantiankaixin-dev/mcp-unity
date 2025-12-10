using System;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    /// <summary>
    /// Apply force, acceleration, impulse, or torque to a Rigidbody for physics-based movement
    /// Unity API: https://docs.unity3d.com/ScriptReference/Rigidbody.AddForce.html
    /// </summary>
    public class AddForceToRigidbodyTool : McpToolBase
    {
        public AddForceToRigidbodyTool()
        {
            Name = "add_force_to_rigidbody";
            Description = "Apply force, acceleration, impulse, or torque to a Rigidbody for physics-based movement";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                // Support both instanceId and gameObjectPath (Unity API: EditorUtility.InstanceIDToObject)
                int? instanceId = parameters["instanceId"]?.ToObject<int?>();
                string gameObjectPath = parameters["gameObjectPath"]?.ToString();
                
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

                if (obj == null)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        $"GameObject not found: {identifier}", "not_found");
                }

                Rigidbody rb = obj.GetComponent<Rigidbody>();
                if (rb == null)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        $"Rigidbody component not found on {gameObjectPath}", "not_found");
                }

                // Parse force vector
                var forceObj = parameters["force"];
                if (forceObj == null)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "force vector is required", "validation_error");
                }

                Vector3 force = new Vector3(
                    forceObj["x"]?.ToObject<float>() ?? 0,
                    forceObj["y"]?.ToObject<float>() ?? 0,
                    forceObj["z"]?.ToObject<float>() ?? 0
                );

                // Parse force mode
                string forceModeStr = parameters["forceMode"]?.ToString() ?? "Force";
                ForceMode forceMode = ParseForceMode(forceModeStr);

                // Parse force type
                string forceType = parameters["forceType"]?.ToString() ?? "Force";
                
                bool wakeUp = parameters["wakeUp"]?.ToObject<bool>() ?? true;
                if (wakeUp && rb.IsSleeping())
                {
                    rb.WakeUp();
                }

                // Apply force based on type
                switch (forceType)
                {
                    case "Force":
                        rb.AddForce(force, forceMode);
                        break;
                    case "RelativeForce":
                        rb.AddRelativeForce(force, forceMode);
                        break;
                    case "Torque":
                        rb.AddTorque(force, forceMode);
                        break;
                    case "RelativeTorque":
                        rb.AddRelativeTorque(force, forceMode);
                        break;
                    case "ForceAtPosition":
                        var posObj = parameters["position"];
                        if (posObj != null)
                        {
                            Vector3 position = new Vector3(
                                posObj["x"]?.ToObject<float>() ?? 0,
                                posObj["y"]?.ToObject<float>() ?? 0,
                                posObj["z"]?.ToObject<float>() ?? 0
                            );
                            rb.AddForceAtPosition(force, position, forceMode);
                        }
                        else
                        {
                            rb.AddForce(force, forceMode);
                        }
                        break;
                    default:
                        rb.AddForce(force, forceMode);
                        break;
                }

                EditorUtility.SetDirty(obj);

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Applied {forceType} to '{obj.name}'",
                    ["objectName"] = obj.name,
                    ["forceType"] = forceType,
                    ["forceMode"] = forceMode.ToString(),
                    ["force"] = new JObject
                    {
                        ["x"] = force.x,
                        ["y"] = force.y,
                        ["z"] = force.z
                    }
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"AddForceToRigidbodyTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }

        private ForceMode ParseForceMode(string mode)
        {
            switch (mode)
            {
                case "Force": return ForceMode.Force;
                case "Acceleration": return ForceMode.Acceleration;
                case "Impulse": return ForceMode.Impulse;
                case "VelocityChange": return ForceMode.VelocityChange;
                default: return ForceMode.Force;
            }
        }
    }
}
