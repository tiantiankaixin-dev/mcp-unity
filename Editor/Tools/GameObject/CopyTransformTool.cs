using System;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class CopyTransformTool : McpToolBase
    {
        public CopyTransformTool()
        {
            Name = "copy_transform";
            Description = "Copy Transform values from one GameObject to another.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                // Support both instanceId and objectPath for source
                int sourceInstanceId = parameters["sourceInstanceId"]?.ToObject<int>() ?? 0;
                string sourceObjectPath = parameters["sourceObjectPath"]?.ToObject<string>();
                string sourceObjectName = parameters["sourceObjectName"]?.ToObject<string>();
                
                // Support both instanceId and objectPath for target
                int targetInstanceId = parameters["targetInstanceId"]?.ToObject<int>() ?? 0;
                string targetObjectPath = parameters["targetObjectPath"]?.ToObject<string>();
                string targetObjectName = parameters["targetObjectName"]?.ToObject<string>();
                
                bool copyPosition = parameters["copyPosition"]?.ToObject<bool>() ?? true;
                bool copyRotation = parameters["copyRotation"]?.ToObject<bool>() ?? true;
                bool copyScale = parameters["copyScale"]?.ToObject<bool>() ?? true;
                bool useLocal = parameters["useLocal"]?.ToObject<bool>() ?? false;

                // Find source GameObject
                GameObject source = null;
                if (sourceInstanceId != 0)
                {
                    source = EditorUtility.InstanceIDToObject(sourceInstanceId) as GameObject;
                }
                else if (!string.IsNullOrEmpty(sourceObjectPath))
                {
                    source = GameObject.Find(sourceObjectPath);
                }
                else if (!string.IsNullOrEmpty(sourceObjectName))
                {
                    source = GameObject.Find(sourceObjectName);
                }
                
                // Find target GameObject
                GameObject target = null;
                if (targetInstanceId != 0)
                {
                    target = EditorUtility.InstanceIDToObject(targetInstanceId) as GameObject;
                }
                else if (!string.IsNullOrEmpty(targetObjectPath))
                {
                    target = GameObject.Find(targetObjectPath);
                }
                else if (!string.IsNullOrEmpty(targetObjectName))
                {
                    target = GameObject.Find(targetObjectName);
                }

                if (source == null)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "Source GameObject not found.", "validation_error");
                }

                if (target == null)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "Target GameObject not found.", "validation_error");
                }

                Undo.RecordObject(target.transform, "Copy Transform");

                if (copyPosition)
                {
                    if (useLocal)
                        target.transform.localPosition = source.transform.localPosition;
                    else
                        target.transform.position = source.transform.position;
                }

                if (copyRotation)
                {
                    if (useLocal)
                        target.transform.localRotation = source.transform.localRotation;
                    else
                        target.transform.rotation = source.transform.rotation;
                }

                if (copyScale)
                {
                    target.transform.localScale = source.transform.localScale;
                }

                EditorUtility.SetDirty(target);

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Copied Transform from '{source.name}' to '{target.name}'.",
                    ["sourceName"] = source.name,
                    ["targetName"] = target.name
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"CopyTransformTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

