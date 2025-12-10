using System;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class OptimizeTexturesTool : McpToolBase
    {
        public OptimizeTexturesTool()
        {
            Name = "optimize_textures";
            Description = "Optimize texture import settings for better performance.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string folderPath = parameters["folderPath"]?.ToObject<string>() ?? "Assets";
                int maxSize = parameters["maxSize"]?.ToObject<int>() ?? 2048;
                string compressionFormat = parameters["compressionFormat"]?.ToObject<string>() ?? "Automatic";
                bool generateMipmaps = parameters["generateMipmaps"]?.ToObject<bool>() ?? true;

                string[] textureGuids = AssetDatabase.FindAssets("t:Texture2D", new[] { folderPath });
                JArray optimizedArray = new JArray();
                int count = 0;

                foreach (string guid in textureGuids)
                {
                    string path = AssetDatabase.GUIDToAssetPath(guid);
                    TextureImporter importer = AssetImporter.GetAtPath(path) as TextureImporter;
                    
                    if (importer != null)
                    {
                        bool changed = false;

                        if (importer.maxTextureSize != maxSize)
                        {
                            importer.maxTextureSize = maxSize;
                            changed = true;
                        }

                        if (importer.mipmapEnabled != generateMipmaps)
                        {
                            importer.mipmapEnabled = generateMipmaps;
                            changed = true;
                        }

                        TextureImporterCompression compression = compressionFormat.ToLower() switch
                        {
                            "uncompressed" => TextureImporterCompression.Uncompressed,
                            "compressed" => TextureImporterCompression.Compressed,
                            "compressedhq" => TextureImporterCompression.CompressedHQ,
                            "compressedlq" => TextureImporterCompression.CompressedLQ,
                            _ => TextureImporterCompression.Compressed
                        };

                        if (importer.textureCompression != compression)
                        {
                            importer.textureCompression = compression;
                            changed = true;
                        }

                        if (changed)
                        {
                            importer.SaveAndReimport();
                            optimizedArray.Add(new JObject
                            {
                                ["path"] = path,
                                ["name"] = System.IO.Path.GetFileName(path)
                            });
                            count++;
                        }
                    }
                }

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Optimized {count} texture(s) in '{folderPath}'.",
                    ["count"] = count,
                    ["optimizedTextures"] = optimizedArray
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"OptimizeTexturesTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

