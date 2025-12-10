using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class SnapToGridTool : McpToolBase
    {
        public SnapToGridTool()
        {
            Name = "snap_to_grid";
            Description = "Snap GameObjects to a grid with specified cell size.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                JArray instanceIdsArray = parameters["instanceIds"] as JArray;
                float gridSize = parameters["gridSize"]?.ToObject<float>() ?? 1f;

                if (instanceIdsArray == null || instanceIdsArray.Count == 0)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "At least 1 GameObject required.", "validation_error");
                }

                List<GameObject> objects = new List<GameObject>();
                foreach (var id in instanceIdsArray)
                {
                    GameObject obj = EditorUtility.InstanceIDToObject(id.ToObject<int>()) as GameObject;
                    if (obj != null) objects.Add(obj);
                }

                JArray snappedArray = new JArray();
                int count = 0;

                foreach (GameObject obj in objects)
                {
                    Undo.RecordObject(obj.transform, "Snap to Grid");
                    
                    Vector3 pos = obj.transform.position;
                    Vector3 oldPos = pos;
                    
                    pos.x = Mathf.Round(pos.x / gridSize) * gridSize;
                    pos.y = Mathf.Round(pos.y / gridSize) * gridSize;
                    pos.z = Mathf.Round(pos.z / gridSize) * gridSize;
                    
                    obj.transform.position = pos;
                    EditorUtility.SetDirty(obj);

                    snappedArray.Add(new JObject
                    {
                        ["objectName"] = obj.name,
                        ["oldPosition"] = $"({oldPos.x:F2}, {oldPos.y:F2}, {oldPos.z:F2})",
                        ["newPosition"] = $"({pos.x:F2}, {pos.y:F2}, {pos.z:F2})"
                    });
                    count++;
                }

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Snapped {count} GameObject(s) to grid (size: {gridSize}).",
                    ["gridSize"] = gridSize,
                    ["count"] = count,
                    ["snappedObjects"] = snappedArray
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"SnapToGridTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

