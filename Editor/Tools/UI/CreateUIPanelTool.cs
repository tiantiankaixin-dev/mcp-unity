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
                // ✅ 支持两种颜色格式

                Color color = Color.white;

                if (parameters["color"] != null)

                {

                    var colorToken = parameters["color"];

                    if (colorToken.Type == JTokenType.Array)

                    {

                        var rgba = colorToken.ToObject<float[]>();

                        if (rgba.Length >= 3)

                        {

                            color = new Color(rgba[0], rgba[1], rgba[2], rgba.Length > 3 ? rgba[3] : 1f);

                        }

                    }

                    else if (colorToken.Type == JTokenType.String)

                    {

                        string colorHex = colorToken.ToObject<string>();

                        if (!ColorUtility.TryParseHtmlString(colorHex, out color))

                        {

                            color = Color.white;

                        }

                    }

                }

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
                image.color = color;

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

