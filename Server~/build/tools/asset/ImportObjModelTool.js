var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
import { z } from 'zod';
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
let ImportObjModelTool = (() => {
    let _classDecorators = [Tool({
            name: 'import_obj_model',
            description: 'Import an OBJ model from external folder, apply textures, and create a prefab',
            category: 'asset',
            version: '1.0.0'
        }), Tags(['unity', 'asset', 'import', 'model', 'obj', 'prefab', '3d'])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseTool;
    var ImportObjModelTool = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ImportObjModelTool = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        get name() {
            return 'import_obj_model';
        }
        get description() {
            return 'Import an OBJ model from external folder, apply textures (diffuse, normal, metallic, roughness), and optionally create a prefab';
        }
        get category() {
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
            }
            catch (error) {
                this.logger.error(`Error in ${this.name}:`, error);
                return this.formatErrorResponse(error);
            }
        }
    };
    return ImportObjModelTool = _classThis;
})();
export { ImportObjModelTool };
