using System;
using UnityEngine;
using UnityEngine.UI;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class CreateUIImageTool : McpToolBase
    {
        public CreateUIImageTool()
        {
            Name = "create_ui_image";
            Description = "Create a UI Image element for displaying sprites or textures.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string imageName = parameters["imageName"]?.ToObject<string>() ?? "Image";
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
                float width = parameters["width"]?.ToObject<float>() ?? 100f;
                float height = parameters["height"]?.ToObject<float>() ?? 100f;
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
                string spritePath = parameters["spritePath"]?.ToObject<string>();

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

                GameObject imageObj = new GameObject(imageName);
                imageObj.transform.SetParent(canvas.transform, false);

                RectTransform rectTransform = imageObj.AddComponent<RectTransform>();
                rectTransform.anchoredPosition = new Vector2(posX, posY);
                rectTransform.sizeDelta = new Vector2(width, height);

                Image image = imageObj.AddComponent<Image>();
                image.color = color;

                // 加载精灵
                if (!string.IsNullOrEmpty(spritePath))
                {
                    Sprite sprite = AssetDatabase.LoadAssetAtPath<Sprite>(spritePath);
                    if (sprite != null)
                    {
                        image.sprite = sprite;
                    }
                }

                Undo.RegisterCreatedObjectUndo(imageObj, "Create UI Image");

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Created UI Image '{imageName}'.",
                    ["imageName"] = imageName,
                    ["instanceId"] = imageObj.GetInstanceID(),
                    ["size"] = $"({width}, {height})"
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"CreateUIImageTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

