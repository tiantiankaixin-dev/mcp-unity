using System;
using UnityEngine;
using UnityEditor;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    /// <summary>
    /// Tool to create an empty GameObject
    /// Based on Unity API: new GameObject()
    /// https://docs.unity3d.com/ScriptReference/GameObject-ctor.html
    /// </summary>
    public class CreateEmptyGameObjectTool : McpToolBase
    {
        public CreateEmptyGameObjectTool()
        {
            Name = "create_empty_gameobject";
            Description = "Create an empty GameObject with only a Transform component.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string objectName = parameters["objectName"]?.ToObject<string>() ?? "GameObject";
                float posX = parameters["posX"]?.ToObject<float>() ?? 0f;
                float posY = parameters["posY"]?.ToObject<float>() ?? 0f;
                float posZ = parameters["posZ"]?.ToObject<float>() ?? 0f;
                int? parentInstanceId = parameters["parentInstanceId"]?.ToObject<int>();

                // Create empty GameObject
                GameObject newObject = new GameObject(objectName);
                newObject.transform.position = new Vector3(posX, posY, posZ);

                // Set parent if specified
                if (parentInstanceId.HasValue)
                {
                    GameObject parent = EditorUtility.InstanceIDToObject(parentInstanceId.Value) as GameObject;
                    if (parent != null)
                    {
                        newObject.transform.SetParent(parent.transform, true);
                    }
                }

                // Register for undo
                Undo.RegisterCreatedObjectUndo(newObject, "Create Empty GameObject");

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Created empty GameObject '{objectName}'.",
                    ["objectName"] = newObject.name,
                    ["instanceId"] = newObject.GetInstanceID(),
                    ["position"] = new JObject
                    {
                        ["x"] = newObject.transform.position.x,
                        ["y"] = newObject.transform.position.y,
                        ["z"] = newObject.transform.position.z
                    }
                };
            }
            catch (Exception ex)
            {
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}
