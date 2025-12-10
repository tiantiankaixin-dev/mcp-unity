using System;
using UnityEngine;
using UnityEngine.UI;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class CreateUIPanelTool : McpToolBase
    {
        public CreateUIPanelTool()
        {
            Name = "create_ui_panel";
            Description = "Create a UI Panel for grouping UI elements.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string panelName = parameters["panelName"]?.ToObject<string>() ?? "Panel";
                float posX = parameters["posX"]?.ToObject<float>() ?? 0f;
                float posY = parameters["posY"]?.ToObject<float>() ?? 0f;
                float width = parameters["width"]?.ToObject<float>() ?? 400f;
                float height = parameters["height"]?.ToObject<float>() ?? 300f;
                string colorHex = parameters["color"]?.ToObject<string>() ?? "#FFFFFF80";

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
                
                // 解析颜色
                if (ColorUtility.TryParseHtmlString(colorHex, out Color color))
                {
                    image.color = color;
                }
                else
                {
                    image.color = new Color(1, 1, 1, 0.5f);
                }

                Undo.RegisterCreatedObjectUndo(panelObj, "Create UI Panel");

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Created UI Panel '{panelName}'.",
                    ["panelName"] = panelName,
                    ["instanceId"] = panelObj.GetInstanceID(),
                    ["position"] = $"({posX}, {posY})",
                    ["size"] = $"({width}, {height})"
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"CreateUIPanelTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

