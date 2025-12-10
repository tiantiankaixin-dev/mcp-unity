using System;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class CreateAudioSourceTool : McpToolBase
    {
        public CreateAudioSourceTool()
        {
            Name = "create_audio_source";
            Description = "Create an AudioSource component for playing sounds.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                int targetInstanceId = parameters["targetInstanceId"]?.ToObject<int>() ?? 0;
                string audioClipPath = parameters["audioClipPath"]?.ToObject<string>();
                float volume = parameters["volume"]?.ToObject<float>() ?? 1f;
                bool loop = parameters["loop"]?.ToObject<bool>() ?? false;
                bool playOnAwake = parameters["playOnAwake"]?.ToObject<bool>() ?? true;

                GameObject targetObj = null;
                if (targetInstanceId != 0)
                {
                    targetObj = EditorUtility.InstanceIDToObject(targetInstanceId) as GameObject;
                }

                if (targetObj == null)
                {
                    targetObj = new GameObject("AudioSource");
                    Undo.RegisterCreatedObjectUndo(targetObj, "Create AudioSource GameObject");
                }

                AudioSource audioSource = targetObj.GetComponent<AudioSource>();
                if (audioSource == null)
                {
                    audioSource = Undo.AddComponent<AudioSource>(targetObj);
                }
                else
                {
                    Undo.RecordObject(audioSource, "Modify AudioSource");
                }

                audioSource.volume = volume;
                audioSource.loop = loop;
                audioSource.playOnAwake = playOnAwake;

                if (!string.IsNullOrEmpty(audioClipPath))
                {
                    AudioClip clip = AssetDatabase.LoadAssetAtPath<AudioClip>(audioClipPath);
                    if (clip != null)
                    {
                        audioSource.clip = clip;
                    }
                }

                EditorUtility.SetDirty(targetObj);

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Created AudioSource on '{targetObj.name}'.",
                    ["objectName"] = targetObj.name,
                    ["instanceId"] = targetObj.GetInstanceID(),
                    ["volume"] = volume,
                    ["loop"] = loop
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"CreateAudioSourceTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

