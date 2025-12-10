using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class SetLayerTool : McpToolBase
    {
        public SetLayerTool()
        {
            Name = "set_layer";
            Description = "Set the layer of GameObjects.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                JArray instanceIdsArray = parameters["instanceIds"] as JArray;
                string layerName = parameters["layerName"]?.ToObject<string>();
                bool includeChildren = parameters["includeChildren"]?.ToObject<bool>() ?? false;

                if (instanceIdsArray == null || instanceIdsArray.Count == 0)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "At least 1 GameObject required.", "validation_error");
                }

                if (string.IsNullOrEmpty(layerName))
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "'layerName' is required.", "validation_error");
                }

                int layer = LayerMask.NameToLayer(layerName);
                if (layer == -1)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        $"Layer '{layerName}' does not exist.", "validation_error");
                }

                List<GameObject> objects = new List<GameObject>();
                foreach (var id in instanceIdsArray)
                {
                    GameObject obj = EditorUtility.InstanceIDToObject(id.ToObject<int>()) as GameObject;
                    if (obj != null) objects.Add(obj);
                }

                JArray changedArray = new JArray();
                int count = 0;

                foreach (GameObject obj in objects)
                {
                    Undo.RecordObject(obj, "Set Layer");
                    obj.layer = layer;
                    EditorUtility.SetDirty(obj);

                    if (includeChildren)
                    {
                        Transform[] children = obj.GetComponentsInChildren<Transform>(true);
                        foreach (Transform child in children)
                        {
                            Undo.RecordObject(child.gameObject, "Set Layer");
                            child.gameObject.layer = layer;
                            EditorUtility.SetDirty(child.gameObject);
                        }
                    }

                    changedArray.Add(new JObject
                    {
                        ["objectName"] = obj.name,
                        ["layer"] = layerName
                    });
                    count++;
                }

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Set layer to '{layerName}' on {count} GameObject(s).",
                    ["layerName"] = layerName,
                    ["count"] = count,
                    ["changedObjects"] = changedArray
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"SetLayerTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

