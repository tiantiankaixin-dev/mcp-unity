using UnityEngine;
using UnityEditor;

namespace McpUnity.Editor.Compatibility
{
    public static class UnityVersionFixes
    {
        public static void BakeNavMesh()
        {
            // Use the NavMeshBuilder from UnityEditor.AI namespace
            UnityEditor.AI.NavMeshBuilder.BuildNavMesh();
        }
        
        public static Font GetDefaultFont()
        {
            return UnityEngine.Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf") ??
                   UnityEngine.Resources.GetBuiltinResource<Font>("Arial.ttf");
        }

        public static Sprite GetDefaultSprite()
        {
            return UnityEngine.Resources.GetBuiltinResource<Sprite>("UI/Skin/UISprite.psd") ??
                   AssetDatabase.GetBuiltinExtraResource<Sprite>("UI/Skin/UISprite.psd");
        }
    }
}