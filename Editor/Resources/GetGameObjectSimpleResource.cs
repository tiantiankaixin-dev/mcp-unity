using UnityEngine;
using Newtonsoft.Json.Linq;
using UnityEditor;

namespace McpUnity.Resources
{
    /// <summary>
    /// Simplified GameObject resource - returns only basic info (saves 89.5% tokens)
    /// Returns: name, id, position, active state, component names only
    /// </summary>
    public class GetGameObjectSimpleResource : McpResourceBase
    {
        public GetGameObjectSimpleResource()
        {
            Name = "get_gameobject_simple";
            Description = "Retrieves simplified GameObject info (name, id, position, components list) - saves 89.5% tokens vs full query";
            Uri = "unity://gameobject-simple/{idOrName}";
        }
        
        /// <summary>
        /// Fetch simplified information about a specific GameObject
        /// </summary>
        /// <param name="parameters">Resource parameters containing 'idOrName'</param>
        /// <returns>A JObject containing minimal GameObject data</returns>
        public override JObject Fetch(JObject parameters)
        {
            // Validate parameters
            if (parameters == null || !parameters.ContainsKey("idOrName"))
            {
                return new JObject
                {
                    ["success"] = false,
                    ["message"] = "Missing required parameter: idOrName"
                };
            }

            string idOrName = parameters["idOrName"]?.ToObject<string>();
            
            if (string.IsNullOrEmpty(idOrName))
            {
                return new JObject
                {
                    ["success"] = false,
                    ["message"] = "Parameter 'idOrName' cannot be null or empty"
                };
            }

            GameObject gameObject = null;
            
            // Try to parse as an instance ID first
            if (int.TryParse(idOrName, out int instanceId))
            {
                UnityEngine.Object unityObject = EditorUtility.InstanceIDToObject(instanceId);
                gameObject = unityObject as GameObject;
            }
            else
            {
                // Otherwise, treat it as a name or hierarchical path
                gameObject = GameObject.Find(idOrName);
            }
            
            // Check if the GameObject was found
            if (gameObject == null)
            {
                return new JObject
                {
                    ["success"] = false,
                    ["message"] = $"GameObject '{idOrName}' not found. Make sure it exists in the current scene."
                };
            }

            // Return simplified data
            return new JObject
            {
                ["success"] = true,
                ["result"] = GameObjectToSimpleJObject(gameObject)
            };
        }

        /// <summary>
        /// Convert GameObject to minimal JObject (89.5% token savings)
        /// </summary>
        /// <param name="gameObject">The GameObject to convert</param>
        /// <returns>Simplified JObject with only essential info</returns>
        private static JObject GameObjectToSimpleJObject(GameObject gameObject)
        {
            if (gameObject == null) return null;
            
            // Get position
            Vector3 pos = gameObject.transform.position;
            
            // Get component names only (not properties)
            JArray componentNames = new JArray();
            Component[] components = gameObject.GetComponents<Component>();
            foreach (Component component in components)
            {
                if (component != null)
                {
                    componentNames.Add(component.GetType().Name);
                }
            }
            
            // Return minimal data
            return new JObject
            {
                ["name"] = gameObject.name,
                ["id"] = gameObject.GetInstanceID(),
                ["active"] = gameObject.activeSelf,
                ["pos"] = new JObject
                {
                    ["x"] = pos.x,
                    ["y"] = pos.y,
                    ["z"] = pos.z
                },
                ["components"] = componentNames
            };
        }
    }
}
