using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class SetTagTool : McpToolBase
    {
        public SetTagTool()
        {
            Name = "set_tag";
            Description = "Set the tag of GameObjects.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                JArray instanceIdsArray = parameters["instanceIds"] as JArray;
                string tagName = parameters["tagName"]?.ToObject<string>();

                if (instanceIdsArray == null || instanceIdsArray.Count == 0)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "At least 1 GameObject required.", "validation_error");
                }

                if (string.IsNullOrEmpty(tagName))
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "'tagName' is required.", "validation_error");
                }

                // 检查标签是否存在
                try
                {
                    GameObject.FindWithTag(tagName);
                }
                catch
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        $"Tag '{tagName}' does not exist.", "validation_error");
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
                    Undo.RecordObject(obj, "Set Tag");
                    obj.tag = tagName;
                    EditorUtility.SetDirty(obj);

                    changedArray.Add(new JObject
                    {
                        ["objectName"] = obj.name,
                        ["tag"] = tagName
                    });
                    count++;
                }

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Set tag to '{tagName}' on {count} GameObject(s).",
                    ["tagName"] = tagName,
                    ["count"] = count,
                    ["changedObjects"] = changedArray
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"SetTagTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

