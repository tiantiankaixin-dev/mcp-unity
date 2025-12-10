using System;
using UnityEngine;
using UnityEditor;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    /// <summary>
    /// Tool to get all components on a GameObject
    /// Based on Unity API: GameObject.GetComponents
    /// https://docs.unity3d.com/ScriptReference/GameObject.GetComponents.html
    /// </summary>
    public class GetComponentsTool : McpToolBase
    {
        public GetComponentsTool()
        {
            Name = "get_components";
            Description = "Get all components attached to a GameObject.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                int? instanceId = parameters["instanceId"]?.ToObject<int>();
                string objectPath = parameters["objectPath"]?.ToObject<string>();
                bool includeChildren = parameters["includeChildren"]?.ToObject<bool>() ?? false;

                GameObject target = null;

                if (instanceId.HasValue)
                {
                    target = EditorUtility.InstanceIDToObject(instanceId.Value) as GameObject;
                }
                else if (!string.IsNullOrEmpty(objectPath))
                {
                    target = GameObject.Find(objectPath);
                }

                if (target == null)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "GameObject not found. Provide valid 'instanceId' or 'objectPath'.",
                        "validation_error");
                }

                Component[] components = includeChildren 
                    ? target.GetComponentsInChildren<Component>(true)
                    : target.GetComponents<Component>();

                JArray componentsArray = new JArray();
                foreach (Component comp in components)
                {
                    if (comp == null) continue; // Skip missing scripts
                    
                    JObject compInfo = new JObject
                    {
                        ["type"] = comp.GetType().Name,
                        ["fullType"] = comp.GetType().FullName,
                        ["gameObject"] = comp.gameObject.name,
                        ["enabled"] = true
                    };

                    // Check if component has enabled property
                    if (comp is Behaviour behaviour)
                    {
                        compInfo["enabled"] = behaviour.enabled;
                    }
                    else if (comp is Renderer renderer)
                    {
                        compInfo["enabled"] = renderer.enabled;
                    }
                    else if (comp is Collider collider)
                    {
                        compInfo["enabled"] = collider.enabled;
                    }

                    componentsArray.Add(compInfo);
                }

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Found {componentsArray.Count} component(s) on '{target.name}'.",
                    ["gameObjectName"] = target.name,
                    ["instanceId"] = target.GetInstanceID(),
                    ["count"] = componentsArray.Count,
                    ["components"] = componentsArray
                };
            }
            catch (Exception ex)
            {
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}
