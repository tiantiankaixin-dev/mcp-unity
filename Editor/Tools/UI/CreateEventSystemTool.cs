using System;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class CreateEventSystemTool : McpToolBase
    {
        public CreateEventSystemTool()
        {
            Name = "create_event_system";
            Description = "Create an EventSystem for UI input handling.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                // 检查是否已存在EventSystem
                EventSystem existingEventSystem = UnityEngine.Object.FindFirstObjectByType<EventSystem>();
                
                if (existingEventSystem != null)
                {
                    return new JObject
                    {
                        ["success"] = true,
                        ["message"] = "EventSystem already exists in the scene.",
                        ["instanceId"] = existingEventSystem.gameObject.GetInstanceID(),
                        ["alreadyExists"] = true
                    };
                }

                // 创建EventSystem
                GameObject eventSystemObj = new GameObject("EventSystem");
                EventSystem eventSystem = eventSystemObj.AddComponent<EventSystem>();
                eventSystemObj.AddComponent<StandaloneInputModule>();

                Undo.RegisterCreatedObjectUndo(eventSystemObj, "Create EventSystem");

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = "Created EventSystem for UI input handling.",
                    ["instanceId"] = eventSystemObj.GetInstanceID(),
                    ["alreadyExists"] = false
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"CreateEventSystemTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

