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
const AddAnimationStateArgsSchema = z.object({
    animatorControllerPath: z.string().optional().describe('Path to the Animator Controller asset'),
    controllerPath: z.string().optional().describe('Alias for animatorControllerPath'),
    stateName: z.string().describe('Name of the animation state'),
    animationClipPath: z.string().optional().describe('Path to the animation clip to use'),
    clipPath: z.string().optional().describe('Alias for animationClipPath'),
    layerIndex: z.number().default(0).describe('Layer index (0 = Base Layer)'),
    position: z.object({ x: z.number(), y: z.number() }).optional().describe('Position in the Animator window'),
    speed: z.number().default(1).describe('Animation playback speed'),
    cycleOffset: z.number().default(0).describe('Cycle offset (0-1)'),
    mirror: z.boolean().default(false).describe('Mirror animation'),
    iKOnFeet: z.boolean().default(false).describe('Enable IK on feet'),
    writeDefaultValues: z.boolean().default(true).describe('Write default values'),
    tag: z.string().optional().describe('State tag'),
    isDefaultState: z.boolean().default(false).describe('Set as default state')
}).refine(data => data.animatorControllerPath || data.controllerPath, {
    message: 'Either animatorControllerPath or controllerPath is required'
}).transform(data => ({
    ...data,
    animatorControllerPath: data.animatorControllerPath || data.controllerPath || '',
    animationClipPath: data.animationClipPath || data.clipPath
}));
let AddAnimationStateTool = (() => {
    let _classDecorators = [Tool({
            name: 'add_animation_state',
            description: 'Add a new animation state to an Animator Controller',
            category: 'animation',
            version: '1.0.0'
        }), Tags(['unity', 'animation', 'animator', 'state-machine']), Examples([
            {
                description: 'Add idle animation state',
                args: {
                    animatorControllerPath: 'Assets/Animations/PlayerAnimator.controller',
                    stateName: 'Idle',
                    animationClipPath: 'Assets/Animations/Idle.anim',
                    isDefaultState: true
                }
            },
            {
                description: 'Add running animation with custom speed',
                args: {
                    animatorControllerPath: 'Assets/Animations/PlayerAnimator.controller',
                    stateName: 'Run',
                    animationClipPath: 'Assets/Animations/Run.anim',
                    speed: 1.5,
                    position: { x: 300, y: 100 }
                }
            },
            {
                description: 'Add mirrored attack animation',
                args: {
                    animatorControllerPath: 'Assets/Animations/EnemyAnimator.controller',
                    stateName: 'AttackLeft',
                    animationClipPath: 'Assets/Animations/AttackRight.anim',
                    mirror: true
                }
            }
        ])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseTool;
    var AddAnimationStateTool = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AddAnimationStateTool = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        get name() { return 'add_animation_state'; }
        get description() { return 'Add a new animation state to an Animator Controller'; }
        get inputSchema() { return AddAnimationStateArgsSchema; }
        get category() { return 'animation'; }
        async beforeExecute(args) {
            if (!args.animatorControllerPath || !args.animatorControllerPath.endsWith('.controller')) {
                throw new Error('Animator Controller path must end with .controller extension');
            }
            if (!args.animatorControllerPath.startsWith('Assets/')) {
                throw new Error('Animator Controller path must start with "Assets/"');
            }
            if (!args.stateName || args.stateName.trim() === '') {
                throw new Error('State name cannot be empty');
            }
            if (args.animationClipPath && !args.animationClipPath.endsWith('.anim')) {
                throw new Error('Animation clip path must end with .anim extension');
            }
            if (args.speed < 0) {
                throw new Error('Speed must be non-negative');
            }
            if (args.cycleOffset < 0 || args.cycleOffset > 1) {
                throw new Error('Cycle offset must be between 0 and 1');
            }
        }
        formatSuccessResponse(result) {
            const { animatorControllerPath, stateName, layerName, isDefaultState } = result;
            let output = `Success! Added animation state\n`;
            output += `Animator Controller: ${animatorControllerPath}\n`;
            output += `State: ${stateName}\n`;
            output += `Layer: ${layerName || 'Base Layer'}\n`;
            if (isDefaultState) {
                output += `Status: Set as default state\n`;
            }
            output += `\nTip: You can now add transitions to/from this state.`;
            return {
                content: [{ type: 'text', text: output }]
            };
        }
        formatErrorResponse(error) {
            const errorMessage = error.message || 'Unknown error occurred';
            let helpText = '';
            if (errorMessage.includes('not found')) {
                helpText = '\n\nTip: Make sure the Animator Controller exists at the specified path.';
            }
            else if (errorMessage.includes('already exists')) {
                helpText = '\n\nTip: A state with this name already exists in the layer.';
            }
            else if (errorMessage.includes('invalid layer')) {
                helpText = '\n\nTip: The layer index is out of range.';
            }
            return {
                content: [{ type: 'text', text: `Error adding animation state: ${errorMessage}${helpText}` }],
                isError: true
            };
        }
    };
    return AddAnimationStateTool = _classThis;
})();
export { AddAnimationStateTool };
