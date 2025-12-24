using System;
using UnityEngine;
using UnityEditor;
using McpUnity.Utils;
using McpUnity.Unity;
using Newtonsoft.Json.Linq;

namespace McpUnity.Tools
{
    /// <summary>
    /// MCP Tool for creating infinite procedural mountain terrain.
    /// The terrain automatically generates and loads/unloads chunks based on viewer position.
    /// </summary>
    public class CreateInfiniteMountainTool : McpToolBase
    {
        public CreateInfiniteMountainTool()
        {
            Name = "create_infinite_mountain";
            Description = "Create an infinite procedural mountain terrain that generates dynamically as the player moves. Features rocky mountain landscapes with realistic textures.";
            IsAsync = false;
        }

        public override JObject Execute(JObject parameters)
        {
            try
            {
                // Parse parameters with defaults
                string terrainName = parameters["terrainName"]?.ToObject<string>() ?? "InfiniteMountain";
                int chunkSize = parameters["chunkSize"]?.ToObject<int>() ?? 256;
                float terrainHeight = parameters["terrainHeight"]?.ToObject<float>() ?? 300f;
                int viewDistance = parameters["viewDistance"]?.ToObject<int>() ?? 2;
                float mountainScale = parameters["mountainScale"]?.ToObject<float>() ?? 0.005f;
                float detailScale = parameters["detailScale"]?.ToObject<float>() ?? 0.02f;
                float ridgeIntensity = parameters["ridgeIntensity"]?.ToObject<float>() ?? 0.3f;
                int seed = parameters["seed"]?.ToObject<int>() ?? UnityEngine.Random.Range(1, 99999);
                // ✅ 支持两种位置格式

                float posX = 0f, posY = 0f, posZ = 0f;

                if (parameters["position"] != null && parameters["position"].Type == JTokenType.Array)

                {

                    // 数组格式: position: [x, y, z]

                    var pos = parameters["position"].ToObject<float[]>();

                    if (pos.Length >= 3)

                    {

                        posX = pos[0];

                        posY = pos[1];

                        posZ = pos[2];

                    }

                }

                else

                {

                    // 分离格式: posX, posY, posZ

                    posX = parameters["posX"]?.ToObject<float>() ?? 0f;

                    posY = parameters["posY"]?.ToObject<float>() ?? 0f;

                    posZ = parameters["posZ"]?.ToObject<float>() ?? 0f;

                }
                bool createViewer = parameters["createViewer"]?.ToObject<bool>() ?? true;

                // Check if InfiniteTerrainGenerator script exists
                string scriptPath = "Assets/InfiniteTerrainGenerator.cs";
                MonoScript script = AssetDatabase.LoadAssetAtPath<MonoScript>(scriptPath);
                
                if (script == null)
                {
                    // Try to create the script if it doesn't exist
                    CreateInfiniteTerrainScript(scriptPath);
                    AssetDatabase.Refresh();
                    script = AssetDatabase.LoadAssetAtPath<MonoScript>(scriptPath);
                    
                    if (script == null)
                    {
                        return new JObject
                        {
                            ["success"] = false,
                            ["message"] = "InfiniteTerrainGenerator script not found. Please ensure the script exists at Assets/InfiniteTerrainGenerator.cs",
                            ["hint"] = "The script should be automatically created. Try recompiling scripts."
                        };
                    }
                }

                // Create the terrain manager GameObject
                GameObject terrainManager = new GameObject(terrainName);
                terrainManager.transform.position = new Vector3(posX, posY, posZ);

                // Add the InfiniteTerrainGenerator component
                var generatorType = script.GetClass();
                if (generatorType == null)
                {
                    UnityEngine.Object.DestroyImmediate(terrainManager);
                    return new JObject
                    {
                        ["success"] = false,
                        ["message"] = "Failed to load InfiniteTerrainGenerator class. Please recompile scripts.",
                        ["hint"] = "Try using recompile_scripts tool first."
                    };
                }

                Component generator = terrainManager.AddComponent(generatorType);

                // Configure the generator using reflection (since the type is loaded dynamically)
                SetFieldValue(generator, "chunkSize", chunkSize);
                SetFieldValue(generator, "terrainHeight", terrainHeight);
                SetFieldValue(generator, "viewDistance", viewDistance);
                SetFieldValue(generator, "mountainScale", mountainScale);
                SetFieldValue(generator, "detailScale", detailScale);
                SetFieldValue(generator, "ridgeIntensity", ridgeIntensity);
                SetFieldValue(generator, "seed", seed);

                // Create a viewer/camera if requested
                GameObject viewerObj = null;
                if (createViewer)
                {
                    viewerObj = CreateViewerCamera(terrainManager.transform, chunkSize, terrainHeight);
                    SetFieldValue(generator, "viewer", viewerObj.transform);
                }

                Undo.RegisterCreatedObjectUndo(terrainManager, "Create Infinite Mountain");

                return new JObject
                {
                    ["success"] = true,
                    ["message"] = $"Created infinite mountain terrain '{terrainName}' with seed {seed}.",
                    ["terrainName"] = terrainName,
                    ["instanceId"] = terrainManager.GetInstanceID(),
                    ["settings"] = new JObject
                    {
                        ["chunkSize"] = chunkSize,
                        ["terrainHeight"] = terrainHeight,
                        ["viewDistance"] = viewDistance,
                        ["mountainScale"] = mountainScale,
                        ["seed"] = seed
                    },
                    ["viewerInstanceId"] = viewerObj?.GetInstanceID() ?? 0,
                    ["hint"] = "Enter Play mode to see the infinite terrain generation in action. Move the viewer to generate new terrain chunks."
                };
            }
            catch (Exception ex)
            {
                McpLogger.LogError($"CreateInfiniteMountainTool error: {ex.Message}\n{ex.StackTrace}");
                return McpUnitySocketHandler.CreateErrorResponse($"Failed to create infinite mountain: {ex.Message}", "execution_error");
            }
        }

        private void SetFieldValue(Component component, string fieldName, object value)
        {
            var field = component.GetType().GetField(fieldName);
            if (field != null)
            {
                field.SetValue(component, value);
            }
        }

        private GameObject CreateViewerCamera(Transform parent, int chunkSize, float terrainHeight)
        {
            // Create a camera to serve as the viewer
            GameObject cameraObj = new GameObject("MountainViewer");
            Camera cam = cameraObj.AddComponent<Camera>();
            cam.clearFlags = CameraClearFlags.Skybox;
            cam.fieldOfView = 60f;
            cam.nearClipPlane = 0.3f;
            cam.farClipPlane = 2000f;

            // Position camera above the center of the first chunk
            float startHeight = terrainHeight * 0.6f + 50f;
            cameraObj.transform.position = new Vector3(chunkSize / 2f, startHeight, chunkSize / 2f);
            cameraObj.transform.rotation = Quaternion.Euler(30f, 0f, 0f);

            // Add a simple fly camera controller
            AddFlyCameraController(cameraObj);

            // Set as main camera
            cameraObj.tag = "MainCamera";

            Undo.RegisterCreatedObjectUndo(cameraObj, "Create Mountain Viewer");

            return cameraObj;
        }

        private void AddFlyCameraController(GameObject cameraObj)
        {
            // Create a simple fly camera script inline
            string scriptContent = @"using UnityEngine;

public class SimpleFlyCam : MonoBehaviour
{
    public float moveSpeed = 50f;
    public float fastSpeed = 150f;
    public float lookSpeed = 3f;
    
    private float rotX, rotY;
    
    void Start()
    {
        rotX = transform.eulerAngles.y;
        rotY = transform.eulerAngles.x;
    }
    
    void Update()
    {
        // Mouse look
        if (Input.GetMouseButton(1))
        {
            rotX += Input.GetAxis(""Mouse X"") * lookSpeed;
            rotY -= Input.GetAxis(""Mouse Y"") * lookSpeed;
            rotY = Mathf.Clamp(rotY, -90f, 90f);
            transform.rotation = Quaternion.Euler(rotY, rotX, 0f);
        }
        
        // Movement
        float speed = Input.GetKey(KeyCode.LeftShift) ? fastSpeed : moveSpeed;
        Vector3 move = Vector3.zero;
        
        if (Input.GetKey(KeyCode.W)) move += transform.forward;
        if (Input.GetKey(KeyCode.S)) move -= transform.forward;
        if (Input.GetKey(KeyCode.A)) move -= transform.right;
        if (Input.GetKey(KeyCode.D)) move += transform.right;
        if (Input.GetKey(KeyCode.E)) move += Vector3.up;
        if (Input.GetKey(KeyCode.Q)) move -= Vector3.up;
        
        transform.position += move.normalized * speed * Time.deltaTime;
    }
}";
            string scriptPath = "Assets/SimpleFlyCam.cs";
            
            if (!System.IO.File.Exists(Application.dataPath + "/SimpleFlyCam.cs"))
            {
                System.IO.File.WriteAllText(Application.dataPath + "/SimpleFlyCam.cs", scriptContent);
                AssetDatabase.Refresh();
            }

            MonoScript script = AssetDatabase.LoadAssetAtPath<MonoScript>(scriptPath);
            if (script != null && script.GetClass() != null)
            {
                cameraObj.AddComponent(script.GetClass());
            }
        }

        private void CreateInfiniteTerrainScript(string path)
        {
            string fullPath = Application.dataPath + "/" + path.Substring("Assets/".Length);
            
            // The script content is too long to embed here, so we'll check if it exists
            // and provide guidance if it doesn't
            if (!System.IO.File.Exists(fullPath))
            {
                McpLogger.LogWarning("InfiniteTerrainGenerator.cs not found. It should be created separately.");
            }
        }
    }
}
