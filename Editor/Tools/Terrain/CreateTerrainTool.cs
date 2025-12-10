using System;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    public class CreateTerrainTool : McpToolBase
    {
        public CreateTerrainTool()
        {
            Name = "create_terrain";
            Description = "Create a Terrain object for landscape design.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                string terrainName = parameters["terrainName"]?.ToObject<string>() ?? "Terrain";
                int width = parameters["width"]?.ToObject<int>() ?? 500;
                int length = parameters["length"]?.ToObject<int>() ?? 500;
                int height = parameters["height"]?.ToObject<int>() ?? 600;
                float posX = parameters["posX"]?.ToObject<float>() ?? 0f;
                float posY = parameters["posY"]?.ToObject<float>() ?? 0f;
                float posZ = parameters["posZ"]?.ToObject<float>() ?? 0f;

                TerrainData terrainData = new TerrainData();
                terrainData.size = new Vector3(width, height, length);
                terrainData.heightmapResolution = 513;
                terrainData.baseMapResolution = 1024;

                GameObject terrainObj = Terrain.CreateTerrainGameObject(terrainData);
                terrainObj.name = terrainName;
                terrainObj.transform.position = new Vector3(posX, posY, posZ);

                // 保存TerrainData资源
                string terrainDataPath = $"Assets/{terrainName}_Data.asset";
                AssetDatabase.CreateAsset(terrainData, terrainDataPath);
                AssetDatabase.SaveAssets();

                Undo.RegisterCreatedObjectUndo(terrainObj, "Create Terrain");

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Created Terrain '{terrainName}'.",
                    ["terrainName"] = terrainName,
                    ["instanceId"] = terrainObj.GetInstanceID(),
                    ["size"] = $"({width}, {height}, {length})",
                    ["terrainDataPath"] = terrainDataPath
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"CreateTerrainTool error: {ex.Message}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed: {ex.Message}", "execution_error");
            }
        }
    }
}

