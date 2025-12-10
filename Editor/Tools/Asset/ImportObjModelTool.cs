using System;
using System.IO;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    /// <summary>
    /// Tool for importing OBJ models and creating prefabs with materials
    /// </summary>
    public class ImportObjModelTool : McpToolBase
    {
        public ImportObjModelTool()
        {
            Name = "import_obj_model";
            Description = "Import an OBJ model from external folder, apply textures, and create a prefab";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                // Get parameters
                string sourceFolderPath = parameters["sourceFolderPath"]?.ToObject<string>();
                string targetFolderPath = parameters["targetFolderPath"]?.ToObject<string>() ?? "Assets/Models";
                string prefabName = parameters["prefabName"]?.ToObject<string>();
                float scale = parameters["scale"]?.ToObject<float>() ?? 1f;
                bool createPrefab = parameters["createPrefab"]?.ToObject<bool>() ?? true;
                bool addCollider = parameters["addCollider"]?.ToObject<bool>() ?? true;

                if (string.IsNullOrEmpty(sourceFolderPath))
                {
                    return McpUnitySocketHandler.CreateErrorResponse("sourceFolderPath is required", "validation_error");
                }

                // Normalize path
                sourceFolderPath = sourceFolderPath.Replace("\\", "/");

                // Check if source folder exists
                if (!Directory.Exists(sourceFolderPath))
                {
                    return McpUnitySocketHandler.CreateErrorResponse($"Source folder not found: {sourceFolderPath}", "not_found");
                }

                // Ensure target folder exists
                if (!targetFolderPath.StartsWith("Assets"))
                {
                    targetFolderPath = "Assets/" + targetFolderPath;
                }
                EnsureFolderExists(targetFolderPath);

                // Find OBJ file
                string[] objFiles = Directory.GetFiles(sourceFolderPath, "*.obj");
                if (objFiles.Length == 0)
                {
                    return McpUnitySocketHandler.CreateErrorResponse("No OBJ file found in source folder", "not_found");
                }

                string objFilePath = objFiles[0];
                string modelName = prefabName ?? Path.GetFileNameWithoutExtension(objFilePath);

                // Copy all files to Unity project
                string modelFolder = targetFolderPath + "/" + modelName;
                EnsureFolderExists(modelFolder);

                JArray importedFiles = new JArray();
                string objAssetPath = null;

                // Copy files
                foreach (string file in Directory.GetFiles(sourceFolderPath))
                {
                    string fileName = Path.GetFileName(file);
                    string destPath = modelFolder + "/" + fileName;
                    string fullDestPath = Path.Combine(Application.dataPath, destPath.Substring(7)); // Remove "Assets/"
                    
                    File.Copy(file, fullDestPath, true);
                    importedFiles.Add(destPath);

                    if (file.EndsWith(".obj", StringComparison.OrdinalIgnoreCase))
                    {
                        objAssetPath = destPath;
                    }
                }

                AssetDatabase.Refresh();

                // Configure model import settings
                if (!string.IsNullOrEmpty(objAssetPath))
                {
                    ModelImporter importer = AssetImporter.GetAtPath(objAssetPath) as ModelImporter;
                    if (importer != null)
                    {
                        importer.globalScale = scale;
                        importer.importNormals = ModelImporterNormals.Import;
                        importer.importTangents = ModelImporterTangents.CalculateMikk;
                        importer.materialImportMode = ModelImporterMaterialImportMode.ImportViaMaterialDescription;
                        importer.SaveAndReimport();
                    }
                }

                AssetDatabase.Refresh();

                // Create material with textures
                string materialPath = modelFolder + "/" + modelName + "_Material.mat";
                Material material = CreateMaterialFromTextures(modelFolder, modelName);
                if (material != null)
                {
                    AssetDatabase.CreateAsset(material, materialPath);
                    AssetDatabase.SaveAssets();
                }

                // Create prefab
                string prefabPath = null;
                int instanceId = 0;

                if (createPrefab && !string.IsNullOrEmpty(objAssetPath))
                {
                    GameObject modelAsset = AssetDatabase.LoadAssetAtPath<GameObject>(objAssetPath);
                    if (modelAsset != null)
                    {
                        GameObject instance = UnityEngine.Object.Instantiate(modelAsset);
                        instance.name = modelName;

                        // Apply material
                        if (material != null)
                        {
                            Renderer[] renderers = instance.GetComponentsInChildren<Renderer>();
                            foreach (Renderer renderer in renderers)
                            {
                                Material[] mats = new Material[renderer.sharedMaterials.Length];
                                for (int i = 0; i < mats.Length; i++)
                                {
                                    mats[i] = material;
                                }
                                renderer.sharedMaterials = mats;
                            }
                        }

                        // Add collider
                        if (addCollider)
                        {
                            MeshFilter[] meshFilters = instance.GetComponentsInChildren<MeshFilter>();
                            foreach (MeshFilter mf in meshFilters)
                            {
                                if (mf.GetComponent<Collider>() == null)
                                {
                                    mf.gameObject.AddComponent<MeshCollider>();
                                }
                            }
                        }

                        // Save prefab
                        prefabPath = modelFolder + "/" + modelName + ".prefab";
                        GameObject prefab = PrefabUtility.SaveAsPrefabAsset(instance, prefabPath);
                        instanceId = prefab.GetInstanceID();

                        UnityEngine.Object.DestroyImmediate(instance);
                    }
                }

                AssetDatabase.Refresh();

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Successfully imported OBJ model '{modelName}'",
                    ["modelName"] = modelName,
                    ["modelFolder"] = modelFolder,
                    ["objAssetPath"] = objAssetPath,
                    ["materialPath"] = materialPath,
                    ["prefabPath"] = prefabPath,
                    ["instanceId"] = instanceId,
                    ["importedFiles"] = importedFiles,
                    ["fileCount"] = importedFiles.Count
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"ImportObjModelTool error: {ex.Message}\n{ex.StackTrace}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }

        private void EnsureFolderExists(string folderPath)
        {
            if (!AssetDatabase.IsValidFolder(folderPath))
            {
                string[] parts = folderPath.Split('/');
                string currentPath = parts[0];
                for (int i = 1; i < parts.Length; i++)
                {
                    string newPath = currentPath + "/" + parts[i];
                    if (!AssetDatabase.IsValidFolder(newPath))
                    {
                        AssetDatabase.CreateFolder(currentPath, parts[i]);
                    }
                    currentPath = newPath;
                }
            }
        }

        private Material CreateMaterialFromTextures(string folderPath, string modelName)
        {
            Material material = new Material(Shader.Find("Standard"));
            
            // Find textures
            string[] textureFiles = new string[]
            {
                "texture_diffuse", "diffuse", "albedo", "basecolor", "base_color",
                "shaded", "color", "tex"
            };

            string[] normalFiles = new string[]
            {
                "texture_normal", "normal", "normalmap", "normal_map", "bump"
            };

            string[] metallicFiles = new string[]
            {
                "texture_metallic", "metallic", "metal", "metalness"
            };

            string[] roughnessFiles = new string[]
            {
                "texture_roughness", "roughness", "rough", "glossiness"
            };

            // Find and apply diffuse/albedo texture
            Texture2D diffuse = FindTexture(folderPath, textureFiles);
            if (diffuse != null)
            {
                material.mainTexture = diffuse;
                material.color = Color.white;
            }

            // Find and apply normal map
            Texture2D normal = FindTexture(folderPath, normalFiles);
            if (normal != null)
            {
                // Set texture import settings for normal map
                string normalPath = AssetDatabase.GetAssetPath(normal);
                TextureImporter normalImporter = AssetImporter.GetAtPath(normalPath) as TextureImporter;
                if (normalImporter != null && normalImporter.textureType != TextureImporterType.NormalMap)
                {
                    normalImporter.textureType = TextureImporterType.NormalMap;
                    normalImporter.SaveAndReimport();
                    normal = AssetDatabase.LoadAssetAtPath<Texture2D>(normalPath);
                }
                
                material.SetTexture("_BumpMap", normal);
                material.EnableKeyword("_NORMALMAP");
            }

            // Find and apply metallic texture
            Texture2D metallic = FindTexture(folderPath, metallicFiles);
            if (metallic != null)
            {
                material.SetTexture("_MetallicGlossMap", metallic);
                material.EnableKeyword("_METALLICGLOSSMAP");
            }
            else
            {
                material.SetFloat("_Metallic", 0.1f);
            }

            // Set smoothness
            material.SetFloat("_Glossiness", 0.5f);

            return material;
        }

        private Texture2D FindTexture(string folderPath, string[] possibleNames)
        {
            string[] guids = AssetDatabase.FindAssets("t:Texture2D", new[] { folderPath });
            
            foreach (string guid in guids)
            {
                string path = AssetDatabase.GUIDToAssetPath(guid);
                string fileName = Path.GetFileNameWithoutExtension(path).ToLower();
                
                foreach (string name in possibleNames)
                {
                    if (fileName.Contains(name.ToLower()))
                    {
                        return AssetDatabase.LoadAssetAtPath<Texture2D>(path);
                    }
                }
            }
            
            return null;
        }
    }
}
