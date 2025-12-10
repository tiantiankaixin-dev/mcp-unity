import { z } from 'zod';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { BaseTool } from '../base/BaseTool.js';
import { Tool, Tags } from '../base/ToolDecorators.js';

/**
 * Tool for importing OBJ models and creating prefabs with materials
 *
 * Imports an OBJ model from an external folder, automatically applies textures
 * (diffuse, normal, metallic, roughness), and creates a prefab.
 *
 * Unity API: ModelImporter, AssetDatabase, PrefabUtility
 * C# Handler: Editor/Tools/Asset/ImportObjModelTool.cs
 *
 * @see https://docs.unity3d.com/ScriptReference/ModelImporter.html
 * @see https://docs.unity3d.com/ScriptReference/PrefabUtility.SaveAsPrefabAsset.html
 *
 * @example
 * // Import robot model with default settings
 * { sourceFolderPath: "C:/Models/Robot" }
 *
 * @example
 * // Import with custom settings
 * { 
 *   sourceFolderPath: "C:/Models/Zombie",
 *   targetFolderPath: "Assets/Characters/Zombie",
 *   prefabName: "ZombieEnemy",
 *   scale: 0.01,
 *   createPrefab: true,
 *   addCollider: true
 * }
 *
 * @category asset
 */
@Tool({
  name: 'import_obj_model',
  description: 'Import an OBJ model from external folder, apply textures, and create a prefab',
  category: 'asset',
  version: '1.0.0'
})
@Tags(['unity', 'asset', 'import', 'model', 'obj', 'prefab', '3d'])
export class ImportObjModelTool extends BaseTool {
  get name(): string {
    return 'import_obj_model';
  }

  get description(): string {
    return 'Import an OBJ model from external folder, apply textures (diffuse, normal, metallic, roughness), and optionally create a prefab';
  }

  get category(): string {
    return 'asset';
  }

  get inputSchema() {
    return z.object({
      sourceFolderPath: z.string().describe('Full path to folder containing OBJ file and textures (e.g., "C:/Models/Robot")'),
      targetFolderPath: z.string().optional().default('Assets/Models').describe('Target folder path in Unity project'),
      prefabName: z.string().optional().describe('Name for the prefab. If not provided, uses OBJ filename'),
      scale: z.number().optional().default(1).describe('Global scale for the model. Default: 1'),
      createPrefab: z.boolean().optional().default(true).describe('Whether to create a prefab from the imported model. Default: true'),
      addCollider: z.boolean().optional().default(true).describe('Whether to add MeshCollider to the model. Default: true')
    });
  }

  /**
   * Custom execution logic for OBJ model import
   */
  protected async execute(args: any): Promise<CallToolResult> {
    try {
      // Validate arguments
      const validatedArgs = this.inputSchema.parse(args);

      this.logger.debug(`Executing ${this.name}`, validatedArgs);

      // Send request to Unity
      const response = await this.mcpUnity.sendRequest({
        method: this.name,
        params: validatedArgs
      });

      // Check if execution was successful
      if (!response.success) {
        throw new Error(response.message || 'Failed to import OBJ model');
      }

      // Format detailed response
      let resultText = `✅ ${response.message}\n\n`;
      resultText += `**Model Details:**\n`;
      resultText += `- Name: ${response.modelName}\n`;
      resultText += `- Folder: ${response.modelFolder}\n`;
      resultText += `- OBJ Path: ${response.objAssetPath}\n`;
      
      if (response.materialPath) {
        resultText += `- Material: ${response.materialPath}\n`;
      }
      
      if (response.prefabPath) {
        resultText += `- Prefab: ${response.prefabPath}\n`;
        resultText += `- Instance ID: ${response.instanceId}\n`;
      }
      
      resultText += `- Files Imported: ${response.fileCount}`;

      return {
        content: [{
          type: 'text',
          text: resultText
        }]
      };

    } catch (error: any) {
      this.logger.error(`Error in ${this.name}:`, error);
      return this.formatErrorResponse(error);
    }
  }
}
