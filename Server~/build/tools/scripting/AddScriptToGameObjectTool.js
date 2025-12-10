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
const AddScriptToGameObjectArgsSchema = z.object({
    instanceId: z.number().int().optional().describe('Instance ID of the GameObject (preferred)'),
    gameObjectPath: z.string().optional().describe('Hierarchy path to the GameObject (alternative to instanceId)'),
    scriptPath: z.string().optional().describe('Path to the script file (e.g., "Assets/Scripts/PlayerController.cs")'),
    scriptName: z.string().optional().describe('Name of the script class (if different from file name)'),
    namespace: z.string().optional().describe('Namespace of the script class'),
    initialValues: z.record(z.any()).optional().describe('Initial values for public/serialized fields'),
    createIfNotExists: z.boolean().default(false).describe('Create GameObject if it does not exist'),
    parentPath: z.string().optional().describe('Parent path if creating new GameObject')
});
let AddScriptToGameObjectTool = (() => {
    let _classDecorators = [Tool({
            name: 'add_script_to_gameobject',
            description: 'Attach a C# script component to a GameObject in the scene hierarchy',
            category: 'scripting',
            version: '1.0.0'
        }), Tags(['unity', 'scripting', 'component', 'gameobject', 'attach']), Examples([
            {
                description: 'Add script to existing GameObject',
                args: {
                    gameObjectPath: 'Player',
                    scriptPath: 'Assets/Scripts/PlayerController.cs'
                }
            },
            {
                description: 'Add script with initial values',
                args: {
                    gameObjectPath: 'Enemy',
                    scriptPath: 'Assets/Scripts/EnemyAI.cs',
                    initialValues: {
                        health: 100,
                        speed: 5.0,
                        attackDamage: 10
                    }
                }
            },
            {
                description: 'Add script and create GameObject if needed',
                args: {
                    gameObjectPath: 'GameManager',
                    scriptPath: 'Assets/Scripts/GameManager.cs',
                    createIfNotExists: true
                }
            },
            {
                description: 'Add script to nested GameObject',
                args: {
                    gameObjectPath: 'Environment/Buildings/House',
                    scriptPath: 'Assets/Scripts/InteractableObject.cs',
                    initialValues: {
                        interactionText: 'Press E to enter'
                    }
                }
            }
        ])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseTool;
    var AddScriptToGameObjectTool = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AddScriptToGameObjectTool = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        get name() { return 'add_script_to_gameobject'; }
        get description() { return 'Attach a C# script component to a GameObject in the scene hierarchy'; }
        get inputSchema() { return AddScriptToGameObjectArgsSchema; }
        get category() { return 'scripting'; }
        async beforeExecute(args) {
            if (!args.gameObjectPath || args.gameObjectPath.trim() === '') {
                throw new Error('GameObject path cannot be empty');
            }
            if (!args.scriptPath || !args.scriptPath.endsWith('.cs')) {
                throw new Error('Script path must end with .cs extension');
            }
            if (!args.scriptPath.startsWith('Assets/')) {
                throw new Error('Script path must start with "Assets/"');
            }
            if (args.scriptName && !/^[A-Z][a-zA-Z0-9]*$/.test(args.scriptName)) {
                throw new Error('Script name must start with uppercase letter and contain only alphanumeric characters');
            }
        }
        formatSuccessResponse(result) {
            const { gameObjectPath, scriptName, componentAdded, initialValuesSet } = result;
            let output = `Success! Attached script to GameObject\n`;
            output += `GameObject: ${gameObjectPath}\n`;
            output += `Script: ${scriptName}\n`;
            if (componentAdded) {
                output += `Status: Component added successfully\n`;
            }
            if (initialValuesSet && Object.keys(initialValuesSet).length > 0) {
                output += `\nInitial values set:\n`;
                for (const [key, value] of Object.entries(initialValuesSet)) {
                    output += `  • ${key}: ${JSON.stringify(value)}\n`;
                }
            }
            output += `\nTip: The script component is now active on the GameObject.`;
            return {
                content: [{ type: 'text', text: output }]
            };
        }
        formatErrorResponse(error) {
            const errorMessage = error.message || 'Unknown error occurred';
            let helpText = '';
            if (errorMessage.includes('GameObject not found')) {
                helpText = '\n\nTip: Make sure the GameObject exists in the scene hierarchy, or set createIfNotExists to true.';
            }
            else if (errorMessage.includes('script not found')) {
                helpText = '\n\nTip: Make sure the script file exists at the specified path and has been compiled by Unity.';
            }
            else if (errorMessage.includes('already attached')) {
                helpText = '\n\nTip: The script component is already attached to this GameObject.';
            }
            else if (errorMessage.includes('compilation error')) {
                helpText = '\n\nTip: The script has compilation errors. Fix the errors in the script first.';
            }
            else if (errorMessage.includes('invalid field')) {
                helpText = '\n\nTip: One or more field names in initialValues do not exist in the script.';
            }
            return {
                content: [{ type: 'text', text: `Error attaching script: ${errorMessage}${helpText}` }],
                isError: true
            };
        }
    };
    return AddScriptToGameObjectTool = _classThis;
})();
export { AddScriptToGameObjectTool };
