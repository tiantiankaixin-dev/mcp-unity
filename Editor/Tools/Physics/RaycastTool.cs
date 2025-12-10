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
    /// Perform raycasting to detect colliders along a ray, useful for line-of-sight, shooting, and ground detection
    /// Unity API: https://docs.unity3d.com/ScriptReference/Physics.Raycast.html
    /// </summary>
    public class RaycastTool : McpToolBase
    {
        public RaycastTool()
        {
            Name = "raycast";
            Description = "Perform raycasting to detect colliders along a ray, useful for line-of-sight, shooting, and ground detection";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                // Parse origin
                var originObj = parameters["origin"];
                if (originObj == null)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "origin is required", "validation_error");
                }

                Vector3 origin = new Vector3(
                    originObj["x"]?.ToObject<float>() ?? 0,
                    originObj["y"]?.ToObject<float>() ?? 0,
                    originObj["z"]?.ToObject<float>() ?? 0
                );

                // Parse direction
                var directionObj = parameters["direction"];
                if (directionObj == null)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "direction is required", "validation_error");
                }

                Vector3 direction = new Vector3(
                    directionObj["x"]?.ToObject<float>() ?? 0,
                    directionObj["y"]?.ToObject<float>() ?? -1,
                    directionObj["z"]?.ToObject<float>() ?? 0
                ).normalized;

                float maxDistance = parameters["maxDistance"]?.ToObject<float>() ?? Mathf.Infinity;
                bool returnAllHits = parameters["returnAllHits"]?.ToObject<bool>() ?? false;
                bool drawDebugRay = parameters["drawDebugRay"]?.ToObject<bool>() ?? false;
                string debugRayColor = parameters["debugRayColor"]?.ToString() ?? "red";
                float debugRayDuration = parameters["debugRayDuration"]?.ToObject<float>() ?? 2f;

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

                JArray hitsArray = new JArray();
                int hitCount = 0;

                if (returnAllHits)
                {
                    RaycastHit[] hits = Physics.RaycastAll(origin, direction, maxDistance, layerMask, queryTriggerInteraction);
                    hitCount = hits.Length;

                    foreach (var hit in hits)
                    {
                        hitsArray.Add(CreateHitObject(hit));
                    }
                }
                else
                {
                    RaycastHit hit;
                    if (Physics.Raycast(origin, direction, out hit, maxDistance, layerMask, queryTriggerInteraction))
                    {
                        hitCount = 1;
                        hitsArray.Add(CreateHitObject(hit));
                    }
                }

                // Draw debug ray
                if (drawDebugRay)
                {
                    Color color = ParseColor(debugRayColor);
                    Vector3 endPoint = hitCount > 0 ? origin + direction * ((JObject)hitsArray[0])["distance"].ToObject<float>() : origin + direction * maxDistance;
                    Debug.DrawLine(origin, endPoint, color, debugRayDuration);
                }

                return new JObject
                {
                    ["success"] = true,
                    ["hitCount"] = hitCount,
                    ["hits"] = hitsArray,
                    ["origin"] = new JObject { ["x"] = origin.x, ["y"] = origin.y, ["z"] = origin.z },
                    ["direction"] = new JObject { ["x"] = direction.x, ["y"] = direction.y, ["z"] = direction.z },
                    ["maxDistance"] = maxDistance
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"RaycastTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }

        private JObject CreateHitObject(RaycastHit hit)
        {
            return new JObject
            {
                ["collider"] = hit.collider.name,
                ["distance"] = hit.distance,
                ["point"] = new JObject { ["x"] = hit.point.x, ["y"] = hit.point.y, ["z"] = hit.point.z },
                ["normal"] = new JObject { ["x"] = hit.normal.x, ["y"] = hit.normal.y, ["z"] = hit.normal.z },
                ["gameObject"] = hit.collider.gameObject.name,
                ["tag"] = hit.collider.tag,
                ["layer"] = LayerMask.LayerToName(hit.collider.gameObject.layer)
            };
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
                default: return Color.red;
            }
        }
    }
}
