import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
/**
 * Tool for creating ScriptableObject assets
 *
 * Creates a new ScriptableObject asset for data storage in Unity.
 *
 * Unity API: UnityEngine.ScriptableObject, UnityEditor.AssetDatabase
 * C# Handler: Editor/Tools/CreateScriptableObjectTool.cs
 *
 * @see https://docs.unity3d.com/ScriptReference/ScriptableObject.html
 * @see https://docs.unity3d.com/ScriptReference/AssetDatabase.html
 *
 * @example
 * // Create with default settings
 * { assetName: "MyData" }
 *
 * @example
 * // Create with custom type and path
 * { assetName: "GameConfig", savePath: "Assets/Data", typeName: "MyGame.GameConfigData" }
 *
 * @category scripting
 */
export class CreateScriptableObjectTool extends BaseTool {
    get name() {
        return 'create_scriptable_object';
    }
    get description() {
        return 'Create a ScriptableObject asset for data storage';
    }
    get category() {
        return 'scripting';
    }
    get inputSchema() {
        return z.object({
            assetName: z.string().optional().describe('Name for the ScriptableObject asset. Default: "NewScriptableObject"'),
            savePath: z.string().optional().describe('Path to save the asset. Default: "Assets/ScriptableObjects"'),
            typeName: z.string().optional().describe('Fully qualified type name of the ScriptableObject class. Example: "MyNamespace.MyScriptableObject"')
        });
    }
    /**
     * Execution logic for creating ScriptableObject assets
     */
    async execute(args) {
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
                return {
                    content: [{
                            type: 'text',
                            text: `❌ Error: ${response.message || 'Failed to create ScriptableObject'}`
                        }],
                    isError: true
                };
            }
            // Return success response
            return {
                content: [{
                        type: 'text',
                        text: `✅ ${response.message}`
                    }]
            };
        }
        catch (error) {
            this.logger.error(`Error in ${this.name}:`, error);
            return this.formatErrorResponse(error);
        }
    }
}
