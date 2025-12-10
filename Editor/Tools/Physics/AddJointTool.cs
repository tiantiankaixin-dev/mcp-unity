using System;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    /// <summary>
    /// Add physics joints (Fixed, Hinge, Spring, Character, Configurable) to connect Rigidbodies
    /// Unity API: https://docs.unity3d.com/ScriptReference/Joint.html
    /// </summary>
    public class AddJointTool : McpToolBase
    {
        public AddJointTool()
        {
            Name = "add_joint";
            Description = "Add physics joints (Fixed, Hinge, Spring, Character, Configurable) to connect Rigidbodies";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                // Support both instanceId and gameObjectPath
                int? instanceId = parameters["instanceId"]?.ToObject<int?>();
                string gameObjectPath = parameters["gameObjectPath"]?.ToString();
                string jointType = parameters["jointType"]?.ToString();
                
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

                if (string.IsNullOrEmpty(jointType))
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "jointType is required", "validation_error");
                }

                if (obj == null)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        $"GameObject not found: {identifier}", "not_found");
                }

                Joint joint = null;
                
                // Create appropriate joint type
                switch (jointType)
                {
                    case "Fixed":
                        joint = Undo.AddComponent<FixedJoint>(obj);
                        break;
                    case "Hinge":
                        joint = Undo.AddComponent<HingeJoint>(obj);
                        ConfigureHingeJoint(joint as HingeJoint, parameters);
                        break;
                    case "Spring":
                        joint = Undo.AddComponent<SpringJoint>(obj);
                        ConfigureSpringJoint(joint as SpringJoint, parameters);
                        break;
                    case "Character":
                        joint = Undo.AddComponent<CharacterJoint>(obj);
                        break;
                    case "Configurable":
                        joint = Undo.AddComponent<ConfigurableJoint>(obj);
                        break;
                    default:
                        return McpUnitySocketHandler.CreateErrorResponse(
                            $"Unknown joint type: {jointType}", "validation_error");
                }

                // Set connected body - support both connectedInstanceId and connectedBodyPath
                int? connectedInstanceId = parameters["connectedInstanceId"]?.ToObject<int?>();
                string connectedBodyPath = parameters["connectedBodyPath"]?.ToString();
                
                GameObject connectedObj = null;
                if (connectedInstanceId.HasValue && connectedInstanceId.Value != 0)
                {
                    connectedObj = EditorUtility.InstanceIDToObject(connectedInstanceId.Value) as GameObject;
                }
                else if (!string.IsNullOrEmpty(connectedBodyPath))
                {
                    connectedObj = GameObject.Find(connectedBodyPath);
                }
                
                if (connectedObj != null)
                {
                    Rigidbody connectedRb = connectedObj.GetComponent<Rigidbody>();
                    if (connectedRb != null)
                    {
                        joint.connectedBody = connectedRb;
                    }
                }

                if (parameters["anchor"] != null)
                {
                    var anchor = parameters["anchor"];
                    joint.anchor = new Vector3(
                        anchor["x"]?.ToObject<float>() ?? 0,
                        anchor["y"]?.ToObject<float>() ?? 0,
                        anchor["z"]?.ToObject<float>() ?? 0
                    );
                }

                if (parameters["connectedAnchor"] != null)
                {
                    var connectedAnchor = parameters["connectedAnchor"];
                    joint.connectedAnchor = new Vector3(
                        connectedAnchor["x"]?.ToObject<float>() ?? 0,
                        connectedAnchor["y"]?.ToObject<float>() ?? 0,
                        connectedAnchor["z"]?.ToObject<float>() ?? 0
                    );
                }

                if (parameters["breakForce"] != null)
                    joint.breakForce = parameters["breakForce"].ToObject<float>();

                if (parameters["breakTorque"] != null)
                    joint.breakTorque = parameters["breakTorque"].ToObject<float>();

                EditorUtility.SetDirty(obj);

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Added {jointType} joint to '{obj.name}'",
                    ["jointType"] = jointType,
                    ["objectName"] = obj.name
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"AddJointTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }

        private void ConfigureHingeJoint(HingeJoint hinge, JObject parameters)
        {
            if (hinge == null) return;

            if (parameters["axis"] != null)
            {
                var axis = parameters["axis"];
                hinge.axis = new Vector3(
                    axis["x"]?.ToObject<float>() ?? 0,
                    axis["y"]?.ToObject<float>() ?? 1,
                    axis["z"]?.ToObject<float>() ?? 0
                );
            }

            var hingeParams = parameters["hingeJoint"];
            if (hingeParams != null)
            {
                if (hingeParams["useSpring"] != null)
                    hinge.useSpring = hingeParams["useSpring"].ToObject<bool>();
                
                if (hingeParams["useLimits"] != null)
                    hinge.useLimits = hingeParams["useLimits"].ToObject<bool>();
            }
        }

        private void ConfigureSpringJoint(SpringJoint spring, JObject parameters)
        {
            if (spring == null) return;

            var springParams = parameters["springJoint"];
            if (springParams != null)
            {
                if (springParams["spring"] != null)
                    spring.spring = springParams["spring"].ToObject<float>();
                
                if (springParams["damper"] != null)
                    spring.damper = springParams["damper"].ToObject<float>();
                
                if (springParams["minDistance"] != null)
                    spring.minDistance = springParams["minDistance"].ToObject<float>();
                
                if (springParams["maxDistance"] != null)
                    spring.maxDistance = springParams["maxDistance"].ToObject<float>();
            }
        }
    }
}
