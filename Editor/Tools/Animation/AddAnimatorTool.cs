using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class AddAnimatorTool : McpToolBase
    {
        public AddAnimatorTool()
        {
            Name = "add_animator";
            Description = "Add Animator component to GameObjects with optional controller.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                JArray instanceIdsArray = parameters["instanceIds"] as JArray;
                string controllerPath = parameters["controllerPath"]?.ToObject<string>();

                if (instanceIdsArray == null || instanceIdsArray.Count == 0)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "At least 1 GameObject required.", "validation_error");
                }

                RuntimeAnimatorController controller = null;
                if (!string.IsNullOrEmpty(controllerPath))
                {
                    controller = AssetDatabase.LoadAssetAtPath<RuntimeAnimatorController>(controllerPath);
                }

                List<GameObject> objects = new List<GameObject>();
                foreach (var id in instanceIdsArray)
                {
                    GameObject obj = EditorUtility.InstanceIDToObject(id.ToObject<int>()) as GameObject;
                    if (obj != null) objects.Add(obj);
                }

                JArray addedArray = new JArray();
                int count = 0;

                foreach (GameObject obj in objects)
                {
                    Animator animator = obj.GetComponent<Animator>();
                    if (animator == null)
                    {
                        animator = Undo.AddComponent<Animator>(obj);
                    }
                    else
                    {
                        Undo.RecordObject(animator, "Modify Animator");
                    }

                    if (controller != null)
                    {
                        animator.runtimeAnimatorController = controller;
                    }

                    EditorUtility.SetDirty(obj);

                    addedArray.Add(new JObject
                    {
                        ["objectName"] = obj.name,
                        ["hasController"] = controller != null
                    });
                    count++;
                }

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Added/Updated Animator on {count} GameObject(s).",
                    ["count"] = count,
                    ["animators"] = addedArray
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"AddAnimatorTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

