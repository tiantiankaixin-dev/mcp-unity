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
                float posX = parameters["posX"]?.ToObject<float>() ?? 0f;
                float posY = parameters["posY"]?.ToObject<float>() ?? 0f;
                int fontSize = parameters["fontSize"]?.ToObject<int>() ?? 14;
                string colorHex = parameters["color"]?.ToObject<string>() ?? "#000000";

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

                Color color;
                if (!ColorUtility.TryParseHtmlString(colorHex, out color))
                {
                    color = Color.black;
                }

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

