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
const AddComponentToGameObjectArgsSchema = z.object({
    gameObjectPath: z.string().optional().describe('Hierarchy path to the GameObject (e.g., "Canvas" or "Canvas/Panel")'),
    gameObjectName: z.string().optional().describe('Name of the GameObject to find'),
    instanceId: z.number().optional().describe('Instance ID of the GameObject'),
    componentType: z.string().describe('Type of component to add (e.g., "Rigidbody", "BoxCollider", "SettingsMenuManager")'),
    selectAfterAdd: z.boolean().default(true).describe('Whether to select the GameObject in hierarchy after adding component')
}).refine(data => data.gameObjectPath || data.gameObjectName || data.instanceId, {
    message: "At least one of gameObjectPath, gameObjectName, or instanceId must be provided"
});
let AddComponentToGameObjectTool = (() => {
    let _classDecorators = [Tool({
            name: 'add_component_to_gameobject',
            description: 'Add a component to a GameObject and optionally select it in the hierarchy',
            category: 'components',
            version: '1.0.0'
        }), Tags(['unity', 'component', 'gameobject', 'inspector']), Examples([
            {
                description: 'Add Rigidbody component to a GameObject',
                args: {
                    gameObjectPath: 'Player',
                    componentType: 'Rigidbody'
                }
            },
            {
                description: 'Add custom script component to Canvas',
                args: {
                    gameObjectPath: 'Canvas',
                    componentType: 'SettingsMenuManager',
                    selectAfterAdd: true
                }
            },
            {
                description: 'Add BoxCollider by GameObject name',
                args: {
                    gameObjectName: 'Cube',
                    componentType: 'BoxCollider'
                }
            }
        ])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseTool;
    var AddComponentToGameObjectTool = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AddComponentToGameObjectTool = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        get name() { return 'add_component_to_gameobject'; }
        get description() {
            return 'Add a component to a GameObject in the Unity Editor. Supports Undo/Redo. Based on Unity Official API: GameObject.AddComponent and Undo.AddComponent';
        }
        get inputSchema() { return AddComponentToGameObjectArgsSchema; }
        get category() { return 'components'; }
        formatSuccessResponse(result) {
            const { gameObjectName, gameObjectPath, componentType, selected } = result;
            let message = `✅ Success! Added ${componentType} component to GameObject '${gameObjectName}'\n`;
            message += `📍 Path: ${gameObjectPath}\n`;
            if (selected) {
                message += `🎯 GameObject is now selected in the hierarchy\n`;
                message += `💡 You can see the component in the Inspector panel\n`;
            }
            message += `\n↩️  Tip: You can undo this action with Ctrl+Z (Cmd+Z on Mac)`;
            return {
                content: [{
                        type: 'text',
                        text: message
                    }]
            };
        }
        formatErrorResponse(error) {
            const errorMessage = error.message || 'Unknown error occurred';
            let helpText = '';
            if (errorMessage.includes('not found')) {
                helpText = '\n\n💡 Tips:\n';
                helpText += '  • Make sure the GameObject exists in the current scene\n';
                helpText += '  • Use the correct hierarchy path (e.g., "Canvas" or "Canvas/Panel")\n';
                helpText += '  • Check if the GameObject is active in the hierarchy';
            }
            else if (errorMessage.includes('already has')) {
                helpText = '\n\n💡 Tip: This component type doesn\'t allow multiple instances on the same GameObject';
            }
            else if (errorMessage.includes('Component type') && errorMessage.includes('not found')) {
                helpText = '\n\n💡 Tips:\n';
                helpText += '  • Make sure the component type name is correct\n';
                helpText += '  • For Unity built-in components, use names like: Rigidbody, BoxCollider, AudioSource\n';
                helpText += '  • For custom scripts, use the exact class name\n';
                helpText += '  • Make sure custom scripts have been compiled successfully';
            }
            return {
                content: [{ type: 'text', text: `❌ Error: ${errorMessage}${helpText}` }],
                isError: true
            };
        }
    };
    return AddComponentToGameObjectTool = _classThis;
})();
export { AddComponentToGameObjectTool };
