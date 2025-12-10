using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    // Unity 2023.3+ renamed PhysicMaterial to PhysicsMaterial
#if UNITY_2023_3_OR_NEWER
    using PhysicMaterialType = UnityEngine.PhysicsMaterial;
#else
    using PhysicMaterialType = UnityEngine.PhysicMaterial;
#endif

    public class SetPhysicsMaterialTool : McpToolBase
    {
        public SetPhysicsMaterialTool()
        {
            Name = "set_physics_material";
            Description = "Create and apply a Physics Material to colliders with custom friction and bounciness.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                JArray instanceIdsArray = parameters["instanceIds"] as JArray;
                float dynamicFriction = parameters["dynamicFriction"]?.ToObject<float>() ?? 0.6f;
                float staticFriction = parameters["staticFriction"]?.ToObject<float>() ?? 0.6f;
                float bounciness = parameters["bounciness"]?.ToObject<float>() ?? 0f;

                if (instanceIdsArray == null || instanceIdsArray.Count == 0)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "At least 1 GameObject required.", "validation_error");
                }

                // 创建PhysicMaterial (Unity 2023.3+ renamed to PhysicsMaterial)
                PhysicMaterialType physicsMaterial = new PhysicMaterialType("CustomPhysicsMaterial");
                physicsMaterial.dynamicFriction = dynamicFriction;
                physicsMaterial.staticFriction = staticFriction;
                physicsMaterial.bounciness = bounciness;

                List<GameObject> objects = new List<GameObject>();
                foreach (var id in instanceIdsArray)
                {
                    GameObject obj = EditorUtility.InstanceIDToObject(id.ToObject<int>()) as GameObject;
                    if (obj != null) objects.Add(obj);
                }

                JArray appliedArray = new JArray();
                int count = 0;

                foreach (GameObject obj in objects)
                {
                    Collider collider = obj.GetComponent<Collider>();
                    if (collider != null)
                    {
                        Undo.RecordObject(collider, "Set Physics Material");
                        collider.material = physicsMaterial;
                        EditorUtility.SetDirty(collider);

                        appliedArray.Add(new JObject
                        {
                            ["objectName"] = obj.name,
                            ["friction"] = dynamicFriction,
                            ["bounciness"] = bounciness
                        });
                        count++;
                    }
                }

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Applied Physics Material to {count} GameObject(s).",
                    ["count"] = count,
                    ["dynamicFriction"] = dynamicFriction,
                    ["bounciness"] = bounciness,
                    ["appliedObjects"] = appliedArray
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"SetPhysicsMaterialTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}
