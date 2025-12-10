using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    /// <summary>
    /// Detect all colliders touching or inside a sphere, useful for explosion damage, area detection, and proximity checks
    /// Unity API: https://docs.unity3d.com/ScriptReference/Physics.OverlapSphere.html
    /// </summary>
    public class OverlapSphereTool : McpToolBase
    {
        public OverlapSphereTool()
        {
            Name = "overlap_sphere";
            Description = "Detect all colliders touching or inside a sphere, useful for explosion damage, area detection, and proximity checks";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                // Parse position
                var positionObj = parameters["position"];
                if (positionObj == null)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "position is required", "validation_error");
                }

                Vector3 position = new Vector3(
                    positionObj["x"]?.ToObject<float>() ?? 0,
                    positionObj["y"]?.ToObject<float>() ?? 0,
                    positionObj["z"]?.ToObject<float>() ?? 0
                );

                // Parse radius
                float radius = parameters["radius"]?.ToObject<float>() ?? 1f;
                if (radius <= 0)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "radius must be greater than 0", "validation_error");
                }

                bool includeDetails = parameters["includeDetails"]?.ToObject<bool>() ?? true;
                bool drawDebugSphere = parameters["drawDebugSphere"]?.ToObject<bool>() ?? false;
                string debugSphereColor = parameters["debugSphereColor"]?.ToString() ?? "yellow";
                float debugSphereDuration = parameters["debugSphereDuration"]?.ToObject<float>() ?? 2f;

                // Parse layer mask
                int layerMask = -1;
                if (parameters["layerMask"] != null)
                {
                    string layerMaskStr = parameters["layerMask"].ToString();
                    layerMask = ParseLayerMask(layerMaskStr);
                }

                // Parse query trigger interaction
                QueryTriggerInteraction queryTriggerInteraction = QueryTriggerInteraction.UseGlobal;
                if (parameters["queryTriggerInteraction"] != null)
                {
                    string qti = parameters["queryTriggerInteraction"].ToString();
                    queryTriggerInteraction = ParseQueryTriggerInteraction(qti);
                }

                // Perform overlap sphere
                Collider[] colliders = Physics.OverlapSphere(position, radius, layerMask, queryTriggerInteraction);

                JArray collidersArray = new JArray();
                foreach (var collider in colliders)
                {
                    if (collider == null) continue;

                    if (includeDetails)
                    {
                        collidersArray.Add(new JObject
                        {
                            ["name"] = collider.name,
                            ["tag"] = collider.tag,
                            ["layer"] = LayerMask.LayerToName(collider.gameObject.layer),
                            ["isTrigger"] = collider.isTrigger,
                            ["gameObject"] = collider.gameObject.name,
                            ["position"] = new JObject
                            {
                                ["x"] = collider.transform.position.x,
                                ["y"] = collider.transform.position.y,
                                ["z"] = collider.transform.position.z
                            },
                            ["distance"] = Vector3.Distance(position, collider.transform.position),
                            ["hasRigidbody"] = collider.attachedRigidbody != null
                        });
                    }
                    else
                    {
                        collidersArray.Add(new JObject
                        {
                            ["name"] = collider.name,
                            ["gameObject"] = collider.gameObject.name
                        });
                    }
                }

                // Draw debug sphere
                if (drawDebugSphere)
                {
                    Color color = ParseColor(debugSphereColor);
                    DrawDebugSphere(position, radius, color, debugSphereDuration);
                }

                return new JObject
                {
                    ["success"] = true,
                    ["colliderCount"] = colliders.Length,
                    ["colliders"] = collidersArray,
                    ["position"] = new JObject { ["x"] = position.x, ["y"] = position.y, ["z"] = position.z },
                    ["radius"] = radius
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"OverlapSphereTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }

        private int ParseLayerMask(string layerMaskStr)
        {
            if (string.IsNullOrEmpty(layerMaskStr))
                return -1;

            string[] layers = layerMaskStr.Split(',');
            int mask = 0;
            foreach (string layer in layers)
            {
                int layerIndex = LayerMask.NameToLayer(layer.Trim());
                if (layerIndex >= 0)
                {
                    mask |= (1 << layerIndex);
                }
            }
            return mask == 0 ? -1 : mask;
        }

        private QueryTriggerInteraction ParseQueryTriggerInteraction(string qti)
        {
            switch (qti)
            {
                case "UseGlobal": return QueryTriggerInteraction.UseGlobal;
                case "Ignore": return QueryTriggerInteraction.Ignore;
                case "Collide": return QueryTriggerInteraction.Collide;
                default: return QueryTriggerInteraction.UseGlobal;
            }
        }

        private Color ParseColor(string colorStr)
        {
            switch (colorStr.ToLower())
            {
                case "red": return Color.red;
                case "green": return Color.green;
                case "blue": return Color.blue;
                case "yellow": return Color.yellow;
                case "white": return Color.white;
                case "black": return Color.black;
                default: return Color.yellow;
            }
        }

        private void DrawDebugSphere(Vector3 center, float radius, Color color, float duration)
        {
            // Draw sphere using Debug.DrawLine
            int segments = 16;
            float angleStep = 360f / segments;

            // Draw horizontal circles
            for (int i = 0; i < 3; i++)
            {
                float y = (i - 1) * radius * 0.5f;
                float r = Mathf.Sqrt(radius * radius - y * y);
                
                for (int j = 0; j < segments; j++)
                {
                    float angle1 = j * angleStep * Mathf.Deg2Rad;
                    float angle2 = (j + 1) * angleStep * Mathf.Deg2Rad;

                    Vector3 p1 = center + new Vector3(Mathf.Cos(angle1) * r, y, Mathf.Sin(angle1) * r);
                    Vector3 p2 = center + new Vector3(Mathf.Cos(angle2) * r, y, Mathf.Sin(angle2) * r);

                    Debug.DrawLine(p1, p2, color, duration);
                }
            }

            // Draw vertical circles
            for (int i = 0; i < 4; i++)
            {
                float angle = i * 45f * Mathf.Deg2Rad;
                Vector3 axis1 = new Vector3(Mathf.Cos(angle), 0, Mathf.Sin(angle));
                Vector3 axis2 = Vector3.up;

                for (int j = 0; j < segments; j++)
                {
                    float angle1 = j * angleStep * Mathf.Deg2Rad;
                    float angle2 = (j + 1) * angleStep * Mathf.Deg2Rad;

                    Vector3 p1 = center + (axis2 * Mathf.Sin(angle1) + axis1 * Mathf.Cos(angle1)) * radius;
                    Vector3 p2 = center + (axis2 * Mathf.Sin(angle2) + axis1 * Mathf.Cos(angle2)) * radius;

                    Debug.DrawLine(p1, p2, color, duration);
                }
            }
        }
    }
}
