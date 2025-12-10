using UnityEngine;
using System.Collections.Generic;

/// <summary>
/// Infinite procedural terrain generator that creates rocky mountain landscapes.
/// Terrain chunks are dynamically loaded/unloaded based on player position.
/// </summary>
public class InfiniteTerrainGenerator : MonoBehaviour
{
    [Header("Terrain Settings")]
    [Tooltip("Size of each terrain chunk")]
    public int chunkSize = 256;
    
    [Tooltip("Maximum height of mountains")]
    public float terrainHeight = 300f;
    
    [Tooltip("Heightmap resolution per chunk")]
    public int heightmapResolution = 257;
    
    [Tooltip("View distance in chunks")]
    public int viewDistance = 2;

    [Header("Mountain Generation")]
    [Tooltip("Scale of the main mountain features")]
    public float mountainScale = 0.005f;
    
    [Tooltip("Scale of detail noise")]
    public float detailScale = 0.02f;
    
    [Tooltip("Intensity of mountain ridges")]
    public float ridgeIntensity = 0.3f;
    
    [Tooltip("Random seed for terrain generation")]
    public int seed = 12345;

    [Header("Texture Settings")]
    [Tooltip("Rock texture tiling size")]
    public Vector2 textureTileSize = new Vector2(20f, 20f);

    [Header("References")]
    [Tooltip("Transform to track for infinite terrain (usually player or camera)")]
    public Transform viewer;

    // Internal state
    private Dictionary<Vector2Int, TerrainChunk> terrainChunks = new Dictionary<Vector2Int, TerrainChunk>();
    private Vector2Int currentChunkCoord;
    private TerrainLayer rockLayer;
    private float offsetX, offsetZ;

    void Start()
    {
        // Initialize random offsets based on seed
        Random.InitState(seed);
        offsetX = Random.Range(0f, 10000f);
        offsetZ = Random.Range(0f, 10000f);

        // Create rock terrain layer
        CreateRockTerrainLayer();

        // If no viewer assigned, try to find main camera
        if (viewer == null)
        {
            Camera mainCam = Camera.main;
            if (mainCam != null)
                viewer = mainCam.transform;
            else
                viewer = transform; // Use self as fallback
        }

        // Initial terrain generation
        UpdateVisibleChunks();
    }

    void Update()
    {
        if (viewer == null) return;

        Vector2Int viewerChunkCoord = GetChunkCoord(viewer.position);
        
        if (viewerChunkCoord != currentChunkCoord)
        {
            currentChunkCoord = viewerChunkCoord;
            UpdateVisibleChunks();
        }
    }

    Vector2Int GetChunkCoord(Vector3 position)
    {
        return new Vector2Int(
            Mathf.FloorToInt(position.x / chunkSize),
            Mathf.FloorToInt(position.z / chunkSize)
        );
    }

    void UpdateVisibleChunks()
    {
        HashSet<Vector2Int> visibleCoords = new HashSet<Vector2Int>();

        // Determine which chunks should be visible
        for (int x = -viewDistance; x <= viewDistance; x++)
        {
            for (int z = -viewDistance; z <= viewDistance; z++)
            {
                Vector2Int coord = new Vector2Int(currentChunkCoord.x + x, currentChunkCoord.y + z);
                visibleCoords.Add(coord);

                if (!terrainChunks.ContainsKey(coord))
                {
                    CreateChunk(coord);
                }
                else
                {
                    terrainChunks[coord].SetVisible(true);
                }
            }
        }

        // Hide chunks that are out of view distance
        List<Vector2Int> chunksToRemove = new List<Vector2Int>();
        foreach (var kvp in terrainChunks)
        {
            if (!visibleCoords.Contains(kvp.Key))
            {
                float dist = Vector2Int.Distance(kvp.Key, currentChunkCoord);
                if (dist > viewDistance + 2)
                {
                    // Too far, destroy the chunk
                    kvp.Value.Destroy();
                    chunksToRemove.Add(kvp.Key);
                }
                else
                {
                    // Just hide it
                    kvp.Value.SetVisible(false);
                }
            }
        }

        foreach (var coord in chunksToRemove)
        {
            terrainChunks.Remove(coord);
        }
    }

    void CreateChunk(Vector2Int coord)
    {
        Vector3 position = new Vector3(coord.x * chunkSize, 0, coord.y * chunkSize);
        
        TerrainData terrainData = GenerateTerrainData(coord);
        GameObject terrainObj = Terrain.CreateTerrainGameObject(terrainData);
        terrainObj.name = $"Terrain_Chunk_{coord.x}_{coord.y}";
        terrainObj.transform.position = position;
        terrainObj.transform.parent = transform;

        Terrain terrain = terrainObj.GetComponent<Terrain>();
        terrain.allowAutoConnect = true;

        TerrainChunk chunk = new TerrainChunk(terrainObj, terrain, terrainData);
        terrainChunks[coord] = chunk;

        // Connect to neighbors
        ConnectNeighbors(coord);
    }

    TerrainData GenerateTerrainData(Vector2Int coord)
    {
        TerrainData terrainData = new TerrainData();
        terrainData.heightmapResolution = heightmapResolution;
        terrainData.size = new Vector3(chunkSize, terrainHeight, chunkSize);
        terrainData.baseMapResolution = 512;

        // Generate heightmap
        float[,] heights = GenerateHeights(coord);
        terrainData.SetHeights(0, 0, heights);

        // Apply rock texture
        if (rockLayer != null)
        {
            terrainData.terrainLayers = new TerrainLayer[] { rockLayer };
            
            int alphamapRes = terrainData.alphamapResolution;
            float[,,] alphamaps = new float[alphamapRes, alphamapRes, 1];
            for (int y = 0; y < alphamapRes; y++)
                for (int x = 0; x < alphamapRes; x++)
                    alphamaps[y, x, 0] = 1f;
            terrainData.SetAlphamaps(0, 0, alphamaps);
        }

        return terrainData;
    }

    float[,] GenerateHeights(Vector2Int chunkCoord)
    {
        float[,] heights = new float[heightmapResolution, heightmapResolution];
        
        float worldOffsetX = chunkCoord.x * chunkSize + offsetX;
        float worldOffsetZ = chunkCoord.y * chunkSize + offsetZ;

        for (int z = 0; z < heightmapResolution; z++)
        {
            for (int x = 0; x < heightmapResolution; x++)
            {
                float worldX = worldOffsetX + (float)x / (heightmapResolution - 1) * chunkSize;
                float worldZ = worldOffsetZ + (float)z / (heightmapResolution - 1) * chunkSize;

                float height = CalculateHeight(worldX, worldZ);
                heights[z, x] = height;
            }
        }

        return heights;
    }

    float CalculateHeight(float x, float z)
    {
        float height = 0f;

        // Large-scale mountain features using FBM (Fractal Brownian Motion)
        float amplitude = 1f;
        float frequency = mountainScale;
        float persistence = 0.5f;
        int octaves = 6;

        for (int i = 0; i < octaves; i++)
        {
            float sampleX = x * frequency;
            float sampleZ = z * frequency;
            
            float perlinValue = Mathf.PerlinNoise(sampleX, sampleZ);
            height += perlinValue * amplitude;

            amplitude *= persistence;
            frequency *= 2f;
        }

        // Normalize FBM result
        height /= 2f;

        // Add ridge noise for rocky mountain appearance
        float ridgeNoise = 1f - Mathf.Abs(Mathf.PerlinNoise(x * mountainScale * 2f + 500f, z * mountainScale * 2f + 500f) * 2f - 1f);
        ridgeNoise = Mathf.Pow(ridgeNoise, 2f) * ridgeIntensity;
        height += ridgeNoise * height;

        // Add detail noise
        float detail1 = Mathf.PerlinNoise(x * detailScale, z * detailScale) * 0.1f;
        float detail2 = Mathf.PerlinNoise(x * detailScale * 2f + 100f, z * detailScale * 2f + 100f) * 0.05f;
        height += (detail1 + detail2) * height;

        // Add some variation for peaks
        float peakNoise = Mathf.PerlinNoise(x * mountainScale * 0.5f + 1000f, z * mountainScale * 0.5f + 1000f);
        if (peakNoise > 0.6f)
        {
            height *= 1f + (peakNoise - 0.6f) * 0.5f;
        }

        return Mathf.Clamp01(height);
    }

    void CreateRockTerrainLayer()
    {
        rockLayer = new TerrainLayer();
        rockLayer.diffuseTexture = CreateProceduralRockTexture();
        rockLayer.tileSize = textureTileSize;
        rockLayer.metallic = 0.1f;
        rockLayer.smoothness = 0.2f;
    }

    Texture2D CreateProceduralRockTexture()
    {
        int size = 256;
        Texture2D texture = new Texture2D(size, size, TextureFormat.RGBA32, true);
        Color[] pixels = new Color[size * size];

        for (int y = 0; y < size; y++)
        {
            for (int x = 0; x < size; x++)
            {
                float nx = (float)x / size;
                float ny = (float)y / size;

                // Base rock color
                float baseValue = 0.35f;

                // Multiple noise layers
                float noise1 = Mathf.PerlinNoise(nx * 8f + offsetX, ny * 8f) * 0.25f;
                float noise2 = Mathf.PerlinNoise(nx * 16f + 50f, ny * 16f + 50f) * 0.15f;
                float noise3 = Mathf.PerlinNoise(nx * 32f + 100f, ny * 32f + 100f) * 0.1f;
                float noise4 = Mathf.PerlinNoise(nx * 64f + 150f, ny * 64f + 150f) * 0.05f;

                // Crack effect
                float crack = 1f - Mathf.Abs(Mathf.Sin(nx * 20f + noise1 * 10f) * Mathf.Cos(ny * 20f + noise2 * 10f));
                crack = Mathf.Pow(crack, 3f) * 0.1f;

                float value = baseValue + noise1 + noise2 + noise3 + noise4 - crack;

                // Color variation
                float r = value * (1.0f + Mathf.PerlinNoise(nx * 4f, ny * 4f) * 0.15f);
                float g = value * (0.95f + Mathf.PerlinNoise(nx * 4f + 10f, ny * 4f + 10f) * 0.1f);
                float b = value * (0.88f + Mathf.PerlinNoise(nx * 4f + 20f, ny * 4f + 20f) * 0.08f);

                pixels[y * size + x] = new Color(
                    Mathf.Clamp01(r),
                    Mathf.Clamp01(g),
                    Mathf.Clamp01(b),
                    1f
                );
            }
        }

        texture.SetPixels(pixels);
        texture.wrapMode = TextureWrapMode.Repeat;
        texture.filterMode = FilterMode.Bilinear;
        texture.Apply(true);

        return texture;
    }

    void ConnectNeighbors(Vector2Int coord)
    {
        if (!terrainChunks.ContainsKey(coord)) return;

        Terrain current = terrainChunks[coord].terrain;
        
        // Get neighbors
        Terrain left = GetTerrainAt(new Vector2Int(coord.x - 1, coord.y));
        Terrain right = GetTerrainAt(new Vector2Int(coord.x + 1, coord.y));
        Terrain top = GetTerrainAt(new Vector2Int(coord.x, coord.y + 1));
        Terrain bottom = GetTerrainAt(new Vector2Int(coord.x, coord.y - 1));

        current.SetNeighbors(left, top, right, bottom);

        // Also update neighbors to connect to this terrain
        if (left != null) left.SetNeighbors(GetTerrainAt(new Vector2Int(coord.x - 2, coord.y)), 
            GetTerrainAt(new Vector2Int(coord.x - 1, coord.y + 1)), current, 
            GetTerrainAt(new Vector2Int(coord.x - 1, coord.y - 1)));
        if (right != null) right.SetNeighbors(current, 
            GetTerrainAt(new Vector2Int(coord.x + 1, coord.y + 1)), 
            GetTerrainAt(new Vector2Int(coord.x + 2, coord.y)), 
            GetTerrainAt(new Vector2Int(coord.x + 1, coord.y - 1)));
    }

    Terrain GetTerrainAt(Vector2Int coord)
    {
        if (terrainChunks.ContainsKey(coord))
            return terrainChunks[coord].terrain;
        return null;
    }

    /// <summary>
    /// Regenerate all terrain with new settings
    /// </summary>
    public void RegenerateAll()
    {
        // Destroy all existing chunks
        foreach (var chunk in terrainChunks.Values)
        {
            chunk.Destroy();
        }
        terrainChunks.Clear();

        // Regenerate
        Random.InitState(seed);
        offsetX = Random.Range(0f, 10000f);
        offsetZ = Random.Range(0f, 10000f);
        
        CreateRockTerrainLayer();
        UpdateVisibleChunks();
    }

    // Helper class to manage terrain chunks
    private class TerrainChunk
    {
        public GameObject gameObject;
        public Terrain terrain;
        public TerrainData terrainData;

        public TerrainChunk(GameObject obj, Terrain terr, TerrainData data)
        {
            gameObject = obj;
            terrain = terr;
            terrainData = data;
        }

        public void SetVisible(bool visible)
        {
            if (gameObject != null)
                gameObject.SetActive(visible);
        }

        public void Destroy()
        {
            if (gameObject != null)
            {
                Object.DestroyImmediate(gameObject);
            }
        }
    }
}
