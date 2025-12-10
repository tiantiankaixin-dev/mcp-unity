using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class AddColliderTool : McpToolBase
    {
        public AddColliderTool()
        {
            Name = "add_collider";
            Description = "Add Collider component (Box, Sphere, Capsule, Mesh) to GameObjects.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                JArray instanceIdsArray = parameters["instanceIds"] as JArray;
                string colliderType = parameters["colliderType"]?.ToObject<string>()?.ToLower() ?? "box";
                bool isTrigger = parameters["isTrigger"]?.ToObject<bool>() ?? false;

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
                    Collider collider = null;

                    switch (colliderType)
                    {
                        case "box":
                            collider = obj.GetComponent<BoxCollider>();
                            if (collider == null) collider = Undo.AddComponent<BoxCollider>(obj);
                            break;
                        case "sphere":
                            collider = obj.GetComponent<SphereCollider>();
                            if (collider == null) collider = Undo.AddComponent<SphereCollider>(obj);
                            break;
                        case "capsule":
                            collider = obj.GetComponent<CapsuleCollider>();
                            if (collider == null) collider = Undo.AddComponent<CapsuleCollider>(obj);
                            break;
                        case "mesh":
                            collider = obj.GetComponent<MeshCollider>();
                            if (collider == null) collider = Undo.AddComponent<MeshCollider>(obj);
                            break;
                        default:
                            collider = obj.GetComponent<BoxCollider>();
                            if (collider == null) collider = Undo.AddComponent<BoxCollider>(obj);
                            break;
                    }

                    if (collider != null)
                    {
                        collider.isTrigger = isTrigger;
                        EditorUtility.SetDirty(obj);

                        addedArray.Add(new JObject
                        {
                            ["objectName"] = obj.name,
                            ["colliderType"] = colliderType,
                            ["isTrigger"] = isTrigger
                        });
                        count++;
                    }
                }

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Added {colliderType} Collider to {count} GameObject(s).",
                    ["colliderType"] = colliderType,
                    ["count"] = count,
                    ["addedColliders"] = addedArray
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"AddColliderTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

