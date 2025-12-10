using System;
using UnityEngine;
using UnityEngine.UI;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class CreateUIScrollViewTool : McpToolBase
    {
        public CreateUIScrollViewTool()
        {
            Name = "create_ui_scroll_view";
            Description = "Create a UI Scroll View for scrollable content.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string scrollViewName = parameters["scrollViewName"]?.ToObject<string>() ?? "ScrollView";
                float posX = parameters["posX"]?.ToObject<float>() ?? 0f;
                float posY = parameters["posY"]?.ToObject<float>() ?? 0f;
                float width = parameters["width"]?.ToObject<float>() ?? 300f;
                float height = parameters["height"]?.ToObject<float>() ?? 200f;

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

                // 使用DefaultControls创建ScrollView
                GameObject scrollViewObj = DefaultControls.CreateScrollView(new DefaultControls.Resources());
                scrollViewObj.name = scrollViewName;
                scrollViewObj.transform.SetParent(canvas.transform, false);

                RectTransform rectTransform = scrollViewObj.GetComponent<RectTransform>();
                rectTransform.anchoredPosition = new Vector2(posX, posY);
                rectTransform.sizeDelta = new Vector2(width, height);

                Undo.RegisterCreatedObjectUndo(scrollViewObj, "Create UI Scroll View");

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Created UI Scroll View '{scrollViewName}'.",
                    ["scrollViewName"] = scrollViewName,
                    ["instanceId"] = scrollViewObj.GetInstanceID(),
                    ["size"] = $"({width}, {height})"
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"CreateUIScrollViewTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

