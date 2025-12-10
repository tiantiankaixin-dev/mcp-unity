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
import { Tool, Tags, Examples } from '../base/ToolDecorators.js';
const PhysicMaterialCombineSchema = z.enum(['Average', 'Minimum', 'Maximum', 'Multiply']);
const CreatePhysicsMaterialArgsSchema = z.object({
    materialName: z.string().describe('Name of the physics material'),
    savePath: z.string().default('Assets/Physics').describe('Path where the material will be saved'),
    dynamicFriction: z.number().min(0).max(1).default(0.6).describe('Dynamic friction coefficient (0-1)'),
    staticFriction: z.number().min(0).max(1).default(0.6).describe('Static friction coefficient (0-1)'),
    frictionCombine: PhysicMaterialCombineSchema.default('Average').describe('How friction is combined'),
    bounciness: z.number().min(0).max(1).default(0).describe('Bounciness/restitution coefficient (0-1)'),
    bounceCombine: PhysicMaterialCombineSchema.default('Average').describe('How bounciness is combined')
});
let CreatePhysicsMaterialTool = (() => {
    let _classDecorators = [Tool({
            name: 'create_physics_material',
            description: 'Create a new PhysicMaterial asset with friction and bounciness properties',
            category: 'physics',
            version: '1.0.0'
        }), Tags(['unity', 'physics', 'material', 'friction', 'bounciness']), Examples([
            {
                description: 'Create a bouncy material',
                args: {
                    materialName: 'Bouncy',
                    savePath: 'Assets/Physics',
                    bounciness: 0.9,
                    dynamicFriction: 0.3,
                    staticFriction: 0.3,
                    bounceCombine: 'Maximum'
                }
            },
            {
                description: 'Create an icy (slippery) material',
                args: {
                    materialName: 'Ice',
                    savePath: 'Assets/Physics',
                    dynamicFriction: 0.05,
                    staticFriction: 0.05,
                    bounciness: 0.1,
                    frictionCombine: 'Minimum'
                }
            },
            {
                description: 'Create a rubber material',
                args: {
                    materialName: 'Rubber',
                    dynamicFriction: 0.8,
                    staticFriction: 0.9,
                    bounciness: 0.7
                }
            }
        ])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseTool;
    var CreatePhysicsMaterialTool = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            CreatePhysicsMaterialTool = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        get name() { return 'create_physics_material'; }
        get description() { return 'Create a new PhysicMaterial asset with friction and bounciness properties'; }
        get inputSchema() { return CreatePhysicsMaterialArgsSchema; }
        get category() { return 'physics'; }
        async beforeExecute(args) {
            if (!/^[A-Z][a-zA-Z0-9]*$/.test(args.materialName)) {
                throw new Error('Material name must start with an uppercase letter and contain only alphanumeric characters');
            }
            if (!args.savePath.startsWith('Assets/')) {
                throw new Error('Save path must start with "Assets/"');
            }
        }
        formatSuccessResponse(result) {
            const { materialPath, materialName, properties } = result;
            let propertiesText = '';
            if (properties) {
                propertiesText = '\n\n📝 Properties:\n';
                propertiesText += `  • Dynamic Friction: ${properties.dynamicFriction}\n`;
                propertiesText += `  • Static Friction: ${properties.staticFriction}\n`;
                propertiesText += `  • Bounciness: ${properties.bounciness}\n`;
                propertiesText += `  • Friction Combine: ${properties.frictionCombine}\n`;
                propertiesText += `  • Bounce Combine: ${properties.bounceCombine}\n`;
            }
            return {
                content: [{
                        type: 'text',
                        text: `✅ Successfully created PhysicMaterial: ${materialName}\n📁 Location: ${materialPath}${propertiesText}\n\n💡 Tip: Apply this material to colliders to change their physical properties.`
                    }]
            };
        }
        formatErrorResponse(error) {
            const errorMessage = error.message || 'Unknown error occurred';
            let helpText = '';
            if (errorMessage.includes('already exists')) {
                helpText = '\n\n💡 Tip: Choose a different name or delete the existing material first.';
            }
            else if (errorMessage.includes('invalid path')) {
                helpText = '\n\n💡 Tip: Make sure the path starts with "Assets/" and the directory exists.';
            }
            return {
                content: [{ type: 'text', text: `❌ Error creating PhysicMaterial: ${errorMessage}${helpText}` }],
                isError: true
            };
        }
    };
    return CreatePhysicsMaterialTool = _classThis;
})();
export { CreatePhysicsMaterialTool };
