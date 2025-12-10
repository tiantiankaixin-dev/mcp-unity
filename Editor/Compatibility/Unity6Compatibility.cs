using UnityEngine;
using UnityEditor;

namespace McpUnity.Editor.Compatibility
{
    /// <summary>
    /// Compatibility helper for Unity 2022.3+ and Unity 6
    /// </summary>
    public static class Unity6Compatibility
    {
        /// <summary>
        /// Get Unity Object from instance ID (compatible with Unity 2022.3+ and Unity 6)
        /// </summary>
        /// <param name="instanceId">The instance ID of the object</param>
        /// <returns>The Unity Object, or null if not found</returns>
        public static UnityEngine.Object InstanceIDToObject(int instanceId)
        {
            // Use InstanceIDToObject which works in all Unity versions
            // In Unity 6 it's deprecated but still functional
            #pragma warning disable CS0618
            return EditorUtility.InstanceIDToObject(instanceId);
            #pragma warning restore CS0618
        }
        
        /// <summary>
        /// Get multiple objects from instance IDs (batch operation)
        /// </summary>
        /// <param name="instanceIds">Array of instance IDs</param>
        /// <returns>Array of Unity Objects</returns>
        public static UnityEngine.Object[] InstanceIDsToObjects(int[] instanceIds)
        {
            var objects = new UnityEngine.Object[instanceIds.Length];
            #pragma warning disable CS0618
            for (int i = 0; i < instanceIds.Length; i++)
            {
                objects[i] = EditorUtility.InstanceIDToObject(instanceIds[i]);
            }
            #pragma warning restore CS0618
            return objects;
        }
        
        /// <summary>
        /// Get GameObject from instance ID
        /// </summary>
        /// <param name="instanceId">The instance ID of the GameObject</param>
        /// <returns>The GameObject, or null if not found</returns>
        public static GameObject GetGameObject(int instanceId)
        {
            return InstanceIDToObject(instanceId) as GameObject;
        }
    }
}
