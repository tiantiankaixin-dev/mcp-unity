using System;
using UnityEngine;
using UnityEngine.UI;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;
using TMPro;

namespace McpUnity.Tools
{
    public class CreateUITextTool : McpToolBase
    {
        public CreateUITextTool()
        {
            Name = "create_ui_text";
            Description = "Create UI Text element for displaying information.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string text = parameters["text"]?.ToObject<string>() ?? "Text";
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
                int fontSize = parameters["fontSize"]?.ToObject<int>() ?? 14;
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

                GameObject textObj = new GameObject("Text");
                textObj.transform.SetParent(canvas.transform, false);

                RectTransform rectTransform = textObj.AddComponent<RectTransform>();
                rectTransform.anchoredPosition = new Vector2(posX, posY);
                rectTransform.sizeDelta = new Vector2(200, 50);

                // 尝试使用TextMeshPro
                try
                {
                    TextMeshProUGUI tmpText = textObj.AddComponent<TextMeshProUGUI>();
                    tmpText.text = text;
                    tmpText.fontSize = fontSize;
                    tmpText.color = color;
                    tmpText.alignment = TextAlignmentOptions.Center;
                }
                catch
                {
                    Text uiText = textObj.AddComponent<Text>();
                    uiText.text = text;
                    uiText.fontSize = fontSize;
                    uiText.color = color;
                    uiText.alignment = TextAnchor.MiddleCenter;
                    uiText.font = UnityEngine.Resources.GetBuiltinResource<Font>("Arial.ttf");
                }

                Undo.RegisterCreatedObjectUndo(textObj, "Create UI Text");

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Created UI Text '{text}'.",
                    ["text"] = text,
                    ["instanceId"] = textObj.GetInstanceID(),
                    ["fontSize"] = fontSize
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"CreateUITextTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

