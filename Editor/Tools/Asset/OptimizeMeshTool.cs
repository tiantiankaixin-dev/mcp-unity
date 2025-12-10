using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class OptimizeMeshTool : McpToolBase
    {
        public OptimizeMeshTool()
        {
            Name = "optimize_mesh";
            Description = "Optimize meshes on GameObjects for better performance.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                JArray instanceIdsArray = parameters["instanceIds"] as JArray;

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

                JArray optimizedArray = new JArray();
                int count = 0;

                foreach (GameObject obj in objects)
                {
                    MeshFilter meshFilter = obj.GetComponent<MeshFilter>();
                    if (meshFilter != null && meshFilter.sharedMesh != null)
                    {
                        Mesh mesh = meshFilter.sharedMesh;
                        int originalVertexCount = mesh.vertexCount;
                        int originalTriangleCount = mesh.triangles.Length / 3;

                        // 优化网格
                        mesh.Optimize();
                        mesh.RecalculateBounds();
                        mesh.RecalculateNormals();
                        mesh.RecalculateTangents();

                        EditorUtility.SetDirty(mesh);

                        optimizedArray.Add(new JObject
                        {
                            ["objectName"] = obj.name,
                            ["vertexCount"] = mesh.vertexCount,
                            ["triangleCount"] = mesh.triangles.Length / 3,
                            ["originalVertexCount"] = originalVertexCount,
                            ["originalTriangleCount"] = originalTriangleCount
                        });
                        count++;
                    }
                }

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Optimized meshes on {count} GameObject(s).",
                    ["count"] = count,
                    ["optimizedMeshes"] = optimizedArray
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"OptimizeMeshTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

