using System;
using UnityEngine;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine.SceneManagement;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    /// <summary>
    /// Tool to save the current scene
    /// Based on Unity API: EditorSceneManager.SaveScene
    /// https://docs.unity3d.com/ScriptReference/SceneManagement.EditorSceneManager.SaveScene.html
    /// </summary>
    public class SaveSceneTool : McpToolBase
    {
        public SaveSceneTool()
        {
            Name = "save_scene";
            Description = "Save the current scene or all open scenes.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                bool saveAll = parameters["saveAll"]?.ToObject<bool>() ?? false;
                string savePath = parameters["savePath"]?.ToObject<string>();

                if (saveAll)
                {
                    // Save all open scenes
                    bool success = EditorSceneManager.SaveOpenScenes();
                    
                    JArray savedScenes = new JArray();
                    for (int i = 0; i < SceneManager.sceneCount; i++)
                    {
                        Scene scene = SceneManager.GetSceneAt(i);
                        savedScenes.Add(new JObject
                        {
                            ["name"] = scene.name,
                            ["path"] = scene.path
                        });
                    }

                    return new JObject
                    {
                        ["success"] = success,
                        ["message"] = success ? $"Saved {SceneManager.sceneCount} scene(s)." : "Failed to save some scenes.",
                        ["count"] = SceneManager.sceneCount,
                        ["savedScenes"] = savedScenes
                    };
                }
                else
                {
                    // Save active scene
                    Scene activeScene = SceneManager.GetActiveScene();
                    
                    bool success;
                    if (!string.IsNullOrEmpty(savePath))
                    {
                        // Save to new path
                        success = EditorSceneManager.SaveScene(activeScene, savePath);
                    }
                    else
                    {
                        // Save to current path
                        success = EditorSceneManager.SaveScene(activeScene);
                    }

                    return new JObject
                    {
                        ["success"] = success,
                        ["message"] = success ? $"Saved scene '{activeScene.name}'." : "Failed to save scene.",
                        ["sceneName"] = activeScene.name,
                        ["scenePath"] = activeScene.path
                    };
                }
            }
            catch (Exception ex)
            {
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}
