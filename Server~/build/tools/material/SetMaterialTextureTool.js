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
 * Input schema for set_material_texture tool
 */
const SetMaterialTextureToolArgsSchema = z.object({
    texturePath: z.string().describe('Path to the texture asset. Example: "Assets/Textures/MyTexture.png"'),
    materialPath: z.string().optional().describe('Path to the material asset to modify. Example: "Assets/Materials/MyMaterial.mat"'),
    instanceIds: z.array(z.number().int()).optional().describe('Array of GameObject instance IDs to set texture on their materials'),
    propertyName: z.string().optional().default('_MainTex').describe('Material texture property name. Common values: "_MainTex" (albedo), "_BumpMap" (normal), "_MetallicGlossMap", "_EmissionMap". Default: "_MainTex"')
});
/**
 * SetMaterialTexture Tool
 * Sets a texture on a material or GameObjects' materials
 */
let SetMaterialTextureTool = (() => {
    let _classDecorators = [Tool({
            name: 'set_material_texture',
            description: 'Sets a texture on a material asset or on GameObjects\' materials. Supports main texture, normal map, and other texture properties.',
            category: 'material',
            version: '1.0.0'
        }), Tags(['unity', 'material', 'texture', 'apply'])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseTool;
    var SetMaterialTextureTool = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            SetMaterialTextureTool = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        get name() {
            return 'set_material_texture';
        }
        get description() {
            return 'Sets a texture on a material asset or on GameObjects\' materials. Supports main texture (_MainTex), normal map (_BumpMap), and other texture properties.';
        }
        get inputSchema() {
            return SetMaterialTextureToolArgsSchema;
        }
        get category() {
            return 'material';
        }
        formatSuccessResponse(result) {
            return {
                content: [{
                        type: 'text',
                        text: `✅ ${result.message || 'Texture applied successfully'}`
                    }]
            };
        }
    };
    return SetMaterialTextureTool = _classThis;
})();
export { SetMaterialTextureTool };
