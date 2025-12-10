using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class SetLightmapStaticTool : McpToolBase
    {
        public SetLightmapStaticTool()
        {
            Name = "set_lightmap_static";
            Description = "Mark GameObjects as Lightmap Static for baked lighting.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                JArray instanceIdsArray = parameters["instanceIds"] as JArray;
                bool isStatic = parameters["isStatic"]?.ToObject<bool>() ?? true;
                bool includeChildren = parameters["includeChildren"]?.ToObject<bool>() ?? false;

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
                    Undo.RecordObject(obj, "Set Lightmap Static");
                    
                    StaticEditorFlags flags = GameObjectUtility.GetStaticEditorFlags(obj);
                    if (isStatic)
                    {
                        flags |= StaticEditorFlags.ContributeGI;
                    }
                    else
                    {
                        flags &= ~StaticEditorFlags.ContributeGI;
                    }
                    GameObjectUtility.SetStaticEditorFlags(obj, flags);

                    if (includeChildren)
                    {
                        Transform[] children = obj.GetComponentsInChildren<Transform>(true);
                        foreach (Transform child in children)
                        {
                            if (child.gameObject != obj)
                            {
                                Undo.RecordObject(child.gameObject, "Set Lightmap Static");
                                StaticEditorFlags childFlags = GameObjectUtility.GetStaticEditorFlags(child.gameObject);
                                if (isStatic)
                                {
                                    childFlags |= StaticEditorFlags.ContributeGI;
                                }
                                else
                                {
                                    childFlags &= ~StaticEditorFlags.ContributeGI;
                                }
                                GameObjectUtility.SetStaticEditorFlags(child.gameObject, childFlags);
                            }
                        }
                    }

                    EditorUtility.SetDirty(obj);

                    changedArray.Add(new JObject
                    {
                        ["objectName"] = obj.name,
                        ["isStatic"] = isStatic
                    });
                    count++;
                }

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Set Lightmap Static to {isStatic} on {count} GameObject(s).",
                    ["isStatic"] = isStatic,
                    ["count"] = count,
                    ["changedObjects"] = changedArray
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"SetLightmapStaticTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

