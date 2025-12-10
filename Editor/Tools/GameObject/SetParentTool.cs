using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    /// <summary>
    /// Tool to set the parent of GameObjects
    /// Based on Unity API: Transform.SetParent
    /// https://docs.unity3d.com/ScriptReference/Transform.SetParent.html
    /// </summary>
    public class SetParentTool : McpToolBase
    {
        public SetParentTool()
        {
            Name = "set_parent";
            Description = "Set the parent of GameObjects. Use null/0 to unparent (move to root).";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                JArray instanceIdsArray = parameters["instanceIds"] as JArray;
                int? childInstanceId = parameters["childInstanceId"]?.ToObject<int>();
                int? parentInstanceId = parameters["parentInstanceId"]?.ToObject<int>();
                string parentPath = parameters["parentPath"]?.ToObject<string>();
                bool worldPositionStays = parameters["worldPositionStays"]?.ToObject<bool>() ?? true;

                // Get parent (null means unparent to root)
                Transform parentTransform = null;
                if (parentInstanceId.HasValue && parentInstanceId.Value != 0)
                {
                    GameObject parent = EditorUtility.InstanceIDToObject(parentInstanceId.Value) as GameObject;
                    if (parent != null)
                    {
                        parentTransform = parent.transform;
                    }
                }
                else if (!string.IsNullOrEmpty(parentPath))
                {
                    GameObject parent = GameObject.Find(parentPath);
                    if (parent != null)
                    {
                        parentTransform = parent.transform;
                    }
                }

                // Collect children to reparent
                List<GameObject> children = new List<GameObject>();
                
                if (childInstanceId.HasValue)
                {
                    GameObject child = EditorUtility.InstanceIDToObject(childInstanceId.Value) as GameObject;
                    if (child != null) children.Add(child);
                }

                if (instanceIdsArray != null)
                {
                    foreach (var id in instanceIdsArray)
                    {
                        GameObject child = EditorUtility.InstanceIDToObject(id.ToObject<int>()) as GameObject;
                        if (child != null && !children.Contains(child))
                        {
                            children.Add(child);
                        }
                    }
                }

                if (children.Count == 0)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "No child GameObjects found. Provide 'childInstanceId' or 'instanceIds'.",
                        "validation_error");
                }

                JArray reparentedArray = new JArray();
                foreach (GameObject child in children)
                {
                    Undo.SetTransformParent(child.transform, parentTransform, "Set Parent");
                    child.transform.SetParent(parentTransform, worldPositionStays);

                    reparentedArray.Add(new JObject
                    {
                        ["childName"] = child.name,
                        ["childInstanceId"] = child.GetInstanceID(),
                        ["parentName"] = parentTransform != null ? parentTransform.name : "(Root)",
                        ["parentInstanceId"] = parentTransform != null ? parentTransform.gameObject.GetInstanceID() : 0
                    });
                }

                string parentName = parentTransform != null ? parentTransform.name : "Root";
                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Set parent to '{parentName}' for {children.Count} GameObject(s).",
                    ["parentName"] = parentName,
                    ["count"] = children.Count,
                    ["reparentedObjects"] = reparentedArray
                };
            }
            catch (Exception ex)
            {
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}
