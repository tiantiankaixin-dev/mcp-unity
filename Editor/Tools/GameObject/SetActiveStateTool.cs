using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class SetActiveStateTool : McpToolBase
    {
        public SetActiveStateTool()
        {
            Name = "set_active_state";
            Description = "Set the active state (enabled/disabled) of GameObjects.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                JArray instanceIdsArray = parameters["instanceIds"] as JArray;
                bool active = parameters["active"]?.ToObject<bool>() ?? true;

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

                JArray changedArray = new JArray();
                int count = 0;

                foreach (GameObject obj in objects)
                {
                    Undo.RecordObject(obj, "Set Active State");
                    obj.SetActive(active);
                    EditorUtility.SetDirty(obj);

                    changedArray.Add(new JObject
                    {
                        ["objectName"] = obj.name,
                        ["active"] = active
                    });
                    count++;
                }

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Set active state to {active} on {count} GameObject(s).",
                    ["active"] = active,
                    ["count"] = count,
                    ["changedObjects"] = changedArray
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"SetActiveStateTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

