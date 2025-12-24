using System;
using UnityEngine;
using UnityEngine.UI;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class CreateGridLayoutGroupTool : McpToolBase
    {
        public CreateGridLayoutGroupTool()
        {
            Name = "create_grid_layout_group";
            Description = "Create a UI Panel with GridLayoutGroup for organizing UI elements in a grid.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string panelName = parameters["panelName"]?.ToObject<string>() ?? "GridPanel";
                // ✅ 支持两种位置格式 (2D UI)

                float posX = 0f, posY = 0f;

                if (parameters["position"] != null && parameters["position"].Type == JTokenType.Array)

                {

                    var pos = parameters["position"].ToObject<float[]>();

                    if (pos.Length >= 2)

                    {

                        posX = pos[0];

                        posY = pos[1];

                    }

                }

                else

                {

                    posX = parameters["posX"]?.ToObject<float>() ?? 0f;

                    posY = parameters["posY"]?.ToObject<float>() ?? 0f;

                }
                float width = parameters["width"]?.ToObject<float>() ?? 400f;
                float height = parameters["height"]?.ToObject<float>() ?? 300f;
                float cellWidth = parameters["cellWidth"]?.ToObject<float>() ?? 100f;
                float cellHeight = parameters["cellHeight"]?.ToObject<float>() ?? 100f;
                float spacing = parameters["spacing"]?.ToObject<float>() ?? 10f;

                Canvas canvas = UnityEngine.Object.FindFirstObjectByType<Canvas>();
                if (canvas == null)
                {
                    GameObject canvasObj = new GameObject("Canvas");
                    canvas = canvasObj.AddComponent<Canvas>();
                    canvas.renderMode = RenderMode.ScreenSpaceOverlay;
                    canvasObj.AddComponent<CanvasScaler>();
                    canvasObj.AddComponent<GraphicRaycaster>();
                    Undo.RegisterCreatedObjectUndo(canvasObj, "Create Canvas");
                }

                GameObject panelObj = new GameObject(panelName);
                panelObj.transform.SetParent(canvas.transform, false);

                RectTransform rectTransform = panelObj.AddComponent<RectTransform>();
                rectTransform.anchoredPosition = new Vector2(posX, posY);
                rectTransform.sizeDelta = new Vector2(width, height);

                Image image = panelObj.AddComponent<Image>();
                image.color = new Color(1f, 1f, 1f, 0.1f);

                GridLayoutGroup gridLayout = panelObj.AddComponent<GridLayoutGroup>();
                gridLayout.cellSize = new Vector2(cellWidth, cellHeight);
                gridLayout.spacing = new Vector2(spacing, spacing);
                gridLayout.constraint = GridLayoutGroup.Constraint.Flexible;

                Undo.RegisterCreatedObjectUndo(panelObj, "Create Grid Layout Group");

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Created Grid Layout Group '{panelName}'.",
                    ["panelName"] = panelName,
                    ["instanceId"] = panelObj.GetInstanceID(),
                    ["cellSize"] = $"({cellWidth}, {cellHeight})",
                    ["spacing"] = spacing
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"CreateGridLayoutGroupTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

