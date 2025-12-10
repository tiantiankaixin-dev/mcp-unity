using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class AddRigidbodyTool : McpToolBase
    {
        public AddRigidbodyTool()
        {
            Name = "add_rigidbody";
            Description = "Add Rigidbody component to GameObjects with custom physics settings.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                JArray instanceIdsArray = parameters["instanceIds"] as JArray;
                float mass = parameters["mass"]?.ToObject<float>() ?? 1f;
                float drag = parameters["drag"]?.ToObject<float>() ?? 0f;
                bool useGravity = parameters["useGravity"]?.ToObject<bool>() ?? true;
                bool isKinematic = parameters["isKinematic"]?.ToObject<bool>() ?? false;

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

                JArray addedArray = new JArray();
                int count = 0;

                foreach (GameObject obj in objects)
                {
                    Rigidbody rb = obj.GetComponent<Rigidbody>();
                    if (rb == null)
                    {
                        rb = Undo.AddComponent<Rigidbody>(obj);
                    }
                    else
                    {
                        Undo.RecordObject(rb, "Modify Rigidbody");
                    }

                    rb.mass = mass;
#if UNITY_6000_0_OR_NEWER
                    rb.linearDamping = drag;
#else
                    rb.drag = drag;
#endif
                    rb.useGravity = useGravity;
                    rb.isKinematic = isKinematic;

                    EditorUtility.SetDirty(obj);

                    addedArray.Add(new JObject
                    {
                        ["objectName"] = obj.name,
                        ["mass"] = mass,
#if UNITY_6000_0_OR_NEWER
                        ["drag"] = rb.linearDamping,
#else
                        ["drag"] = rb.drag,
#endif
                        ["useGravity"] = useGravity
                    });
                    count++;
                }

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Added/Updated Rigidbody on {count} GameObject(s).",
                    ["count"] = count,
                    ["rigidbodies"] = addedArray
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"AddRigidbodyTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

