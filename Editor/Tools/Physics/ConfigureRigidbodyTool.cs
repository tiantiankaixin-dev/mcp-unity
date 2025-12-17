using System;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    /// <summary>
    /// Configure detailed Rigidbody properties including mass, drag, constraints, and collision detection
    /// Unity API: https://docs.unity3d.com/ScriptReference/Rigidbody.html
    /// </summary>
    public class ConfigureRigidbodyTool : McpToolBase
    {
        public ConfigureRigidbodyTool()
        {
            Name = "configure_rigidbody";
            Description = "Configure detailed Rigidbody properties including mass, drag, constraints, and collision detection";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                // Support both instanceId and gameObjectPath
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
                        $"Rigidbody component not found on '{obj.name}'. Please add a Rigidbody component first using 'add_rigidbody' tool.", "not_found");
                }

                Undo.RecordObject(rb, "Configure Rigidbody");

                // Set properties if provided
                if (parameters["mass"] != null)
                    rb.mass = parameters["mass"].ToObject<float>();
                
#if UNITY_6000_0_OR_NEWER
                if (parameters["drag"] != null)
                    rb.linearDamping = parameters["drag"].ToObject<float>();
                
                if (parameters["angularDrag"] != null)
                    rb.angularDamping = parameters["angularDrag"].ToObject<float>();
#else
                if (parameters["drag"] != null)
                    rb.drag = parameters["drag"].ToObject<float>();
                
                if (parameters["angularDrag"] != null)
                    rb.angularDrag = parameters["angularDrag"].ToObject<float>();
#endif
                
                if (parameters["useGravity"] != null)
                    rb.useGravity = parameters["useGravity"].ToObject<bool>();
                
                if (parameters["isKinematic"] != null)
                    rb.isKinematic = parameters["isKinematic"].ToObject<bool>();
                
                if (parameters["centerOfMass"] != null)
                {
                    var com = parameters["centerOfMass"];
                    rb.centerOfMass = new Vector3(
                        com["x"]?.ToObject<float>() ?? 0,
                        com["y"]?.ToObject<float>() ?? 0,
                        com["z"]?.ToObject<float>() ?? 0
                    );
                }
                
                if (parameters["constraints"] != null)
                {
                    rb.constraints = ParseConstraints(parameters["constraints"] as JArray);
                }
                
                if (parameters["collisionDetectionMode"] != null)
                {
                    string mode = parameters["collisionDetectionMode"].ToString();
                    rb.collisionDetectionMode = ParseCollisionDetectionMode(mode);
                }
                
                if (parameters["interpolation"] != null)
                {
                    string interp = parameters["interpolation"].ToString();
                    rb.interpolation = ParseInterpolation(interp);
                }
                
                if (parameters["maxAngularVelocity"] != null)
                    rb.maxAngularVelocity = parameters["maxAngularVelocity"].ToObject<float>();

                EditorUtility.SetDirty(obj);

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Configured Rigidbody on '{obj.name}'",
                    ["properties"] = new JObject
                    {
                        ["mass"] = rb.mass,
#if UNITY_6000_0_OR_NEWER
                        ["drag"] = rb.linearDamping,
                        ["angularDrag"] = rb.angularDamping,
#else
                        ["drag"] = rb.drag,
                        ["angularDrag"] = rb.angularDrag,
#endif
                        ["useGravity"] = rb.useGravity,
                        ["isKinematic"] = rb.isKinematic,
                        ["constraints"] = rb.constraints.ToString(),
                        ["collisionDetectionMode"] = rb.collisionDetectionMode.ToString(),
                        ["interpolation"] = rb.interpolation.ToString()
                    }
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"ConfigureRigidbodyTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }

        private RigidbodyConstraints ParseConstraints(JArray constraintsArray)
        {
            RigidbodyConstraints result = RigidbodyConstraints.None;
            if (constraintsArray == null) return result;

            foreach (var item in constraintsArray)
            {
                string constraint = item.ToString();
                switch (constraint)
                {
                    case "FreezePositionX": result |= RigidbodyConstraints.FreezePositionX; break;
                    case "FreezePositionY": result |= RigidbodyConstraints.FreezePositionY; break;
                    case "FreezePositionZ": result |= RigidbodyConstraints.FreezePositionZ; break;
                    case "FreezeRotationX": result |= RigidbodyConstraints.FreezeRotationX; break;
                    case "FreezeRotationY": result |= RigidbodyConstraints.FreezeRotationY; break;
                    case "FreezeRotationZ": result |= RigidbodyConstraints.FreezeRotationZ; break;
                    case "FreezePosition": result |= RigidbodyConstraints.FreezePosition; break;
                    case "FreezeRotation": result |= RigidbodyConstraints.FreezeRotation; break;
                    case "FreezeAll": result |= RigidbodyConstraints.FreezeAll; break;
                }
            }
            return result;
        }

        private CollisionDetectionMode ParseCollisionDetectionMode(string mode)
        {
            switch (mode)
            {
                case "Discrete": return CollisionDetectionMode.Discrete;
                case "Continuous": return CollisionDetectionMode.Continuous;
                case "ContinuousDynamic": return CollisionDetectionMode.ContinuousDynamic;
                case "ContinuousSpeculative": return CollisionDetectionMode.ContinuousSpeculative;
                default: return CollisionDetectionMode.Discrete;
            }
        }

        private RigidbodyInterpolation ParseInterpolation(string interp)
        {
            switch (interp)
            {
                case "None": return RigidbodyInterpolation.None;
                case "Interpolate": return RigidbodyInterpolation.Interpolate;
                case "Extrapolate": return RigidbodyInterpolation.Extrapolate;
                default: return RigidbodyInterpolation.None;
            }
        }
    }
}
