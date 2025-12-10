using System;
using System.IO;
using UnityEngine;
using UnityEditor;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    /// <summary>
    /// Tool to take screenshots of the Scene or Game view
    /// Returns base64 encoded image data for AI viewing
    /// Based on Unity API: Camera.Render, RenderTexture
    /// </summary>
    public class TakeScreenshotTool : McpToolBase
    {
        public TakeScreenshotTool()
        {
            Name = "take_screenshot";
            Description = "Take a screenshot and return as base64 image data for AI to view.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string source = parameters["source"]?.ToObject<string>()?.ToLower() ?? "scene";
                int width = parameters["width"]?.ToObject<int>() ?? 800;
                int height = parameters["height"]?.ToObject<int>() ?? 600;
                bool saveToFile = parameters["saveToFile"]?.ToObject<bool>() ?? true; // 默认保存文件
                string folder = parameters["folder"]?.ToObject<string>() ?? "Assets/Screenshots";
                string filename = parameters["filename"]?.ToObject<string>();

                Texture2D screenshot = null;
                string captureSource = "";

                if (source == "game" && EditorApplication.isPlaying)
                {
                    // Capture from Game view during Play mode
                    screenshot = ScreenCapture.CaptureScreenshotAsTexture();
                    captureSource = "Game View";
                }
                else
                {
                    // Capture from Scene view camera
                    SceneView sceneView = SceneView.lastActiveSceneView;
                    if (sceneView != null && sceneView.camera != null)
                    {
                        Camera cam = sceneView.camera;
                        
                        RenderTexture rt = new RenderTexture(width, height, 24);
                        cam.targetTexture = rt;
                        cam.Render();
                        
                        RenderTexture.active = rt;
                        screenshot = new Texture2D(width, height, TextureFormat.RGB24, false);
                        screenshot.ReadPixels(new Rect(0, 0, width, height), 0, 0);
                        screenshot.Apply();
                        
                        cam.targetTexture = null;
                        RenderTexture.active = null;
                        UnityEngine.Object.DestroyImmediate(rt);
                        
                        captureSource = "Scene View";
                    }
                    else
                    {
                        // Fallback: use main camera or any camera
                        Camera cam = Camera.main;
                        if (cam == null)
                        {
                            Camera[] cameras = UnityEngine.Object.FindObjectsByType<Camera>(FindObjectsSortMode.None);
                            if (cameras.Length > 0) cam = cameras[0];
                        }

                        if (cam != null)
                        {
                            RenderTexture rt = new RenderTexture(width, height, 24);
                            cam.targetTexture = rt;
                            cam.Render();
                            
                            RenderTexture.active = rt;
                            screenshot = new Texture2D(width, height, TextureFormat.RGB24, false);
                            screenshot.ReadPixels(new Rect(0, 0, width, height), 0, 0);
                            screenshot.Apply();
                            
                            cam.targetTexture = null;
                            RenderTexture.active = null;
                            UnityEngine.Object.DestroyImmediate(rt);
                            
                            captureSource = $"Camera: {cam.name}";
                        }
                        else
                        {
                            return McpUnitySocketHandler.CreateErrorResponse(
                                "No camera available for screenshot.", "execution_error");
                        }
                    }
                }

                if (screenshot == null)
                {
                    return McpUnitySocketHandler.CreateErrorResponse(
                        "Failed to capture screenshot.", "execution_error");
                }

                // Convert to PNG and then base64
                byte[] pngData = screenshot.EncodeToPNG();
                string base64Image = Convert.ToBase64String(pngData);
                
                // Save to file
                string savedPath = "";
                string absoluteFilePath = "";
                
                if (string.IsNullOrEmpty(filename))
                {
                    string timestamp = DateTime.Now.ToString("yyyy-MM-dd_HH-mm-ss");
                    filename = $"Screenshot_{timestamp}.png";
                }
                if (!filename.EndsWith(".png", StringComparison.OrdinalIgnoreCase))
                {
                    filename += ".png";
                }

                if (saveToFile)
                {
                    string fullFolder = folder.StartsWith("Assets/") ? folder : "Assets/" + folder;
                    string absoluteFolder = Path.Combine(Application.dataPath.Replace("/Assets", ""), fullFolder);
                    if (!Directory.Exists(absoluteFolder))
                    {
                        Directory.CreateDirectory(absoluteFolder);
                    }

                    absoluteFilePath = Path.Combine(absoluteFolder, filename).Replace("\\", "/");
                    File.WriteAllBytes(absoluteFilePath, pngData);
                    AssetDatabase.Refresh();
                    savedPath = Path.Combine(fullFolder, filename).Replace("\\", "/");
                }

                // Cleanup
                UnityEngine.Object.DestroyImmediate(screenshot);

                JObject result = new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Screenshot captured from {captureSource}.",
                    ["source"] = captureSource,
                    ["width"] = width,
                    ["height"] = height
                };

                if (saveToFile && !string.IsNullOrEmpty(savedPath))
                {
                    result["savedPath"] = savedPath;
                    result["absolutePath"] = absoluteFilePath;
                }
                else
                {
                    // 只有不保存文件时才返回 base64
                    result["imageBase64"] = base64Image;
                    result["mimeType"] = "image/png";
                }

                return result;
            }
            catch (Exception ex)
            {
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}
