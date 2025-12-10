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
const BlendTreeChildSchema = z.object({
    animationClipPath: z.string().describe('Path to animation clip'),
    threshold: z.number().optional().describe('Threshold value for 1D blend tree'),
    position: z.object({ x: z.number(), y: z.number() }).optional().describe('Position for 2D blend tree'),
    timeScale: z.number().default(1).describe('Time scale multiplier'),
    mirror: z.boolean().default(false).describe('Mirror animation')
});
const BlendAnimationsArgsSchema = z.object({
    animatorControllerPath: z.string().describe('Path to the Animator Controller asset'),
    blendTreeName: z.string().describe('Name of the blend tree state'),
    blendType: z.enum(['1D', '2D_Simple_Directional', '2D_Freeform_Directional', '2D_Freeform_Cartesian', 'Direct'])
        .describe('Type of blend tree'),
    layerIndex: z.number().default(0).describe('Layer index (0 = Base Layer)'),
    parameter: z.string().optional().describe('Blend parameter name (for 1D blend tree)'),
    parameterX: z.string().optional().describe('X-axis parameter name (for 2D blend tree)'),
    parameterY: z.string().optional().describe('Y-axis parameter name (for 2D blend tree)'),
    children: z.array(BlendTreeChildSchema).describe('Animation clips to blend'),
    position: z.object({ x: z.number(), y: z.number() }).optional().describe('Position in Animator window'),
    isDefaultState: z.boolean().default(false).describe('Set as default state')
});
let BlendAnimationsTool = (() => {
    let _classDecorators = [Tool({
            name: 'blend_animations',
            description: 'Create blend trees for smooth animation blending based on parameters',
            category: 'animation',
            version: '1.0.0'
        }), Tags(['unity', 'animation', 'blend-tree', 'animator', 'blending']), Examples([
            {
                description: 'Create 1D blend tree for movement speed',
                args: {
                    animatorControllerPath: 'Assets/Animations/PlayerAnimator.controller',
                    blendTreeName: 'Movement',
                    blendType: '1D',
                    parameter: 'Speed',
                    children: [
                        { animationClipPath: 'Assets/Animations/Idle.anim', threshold: 0 },
                        { animationClipPath: 'Assets/Animations/Walk.anim', threshold: 2 },
                        { animationClipPath: 'Assets/Animations/Run.anim', threshold: 5 },
                        { animationClipPath: 'Assets/Animations/Sprint.anim', threshold: 8 }
                    ]
                }
            },
            {
                description: 'Create 2D directional blend tree for strafing',
                args: {
                    animatorControllerPath: 'Assets/Animations/PlayerAnimator.controller',
                    blendTreeName: 'Strafe',
                    blendType: '2D_Simple_Directional',
                    parameterX: 'Horizontal',
                    parameterY: 'Vertical',
                    children: [
                        { animationClipPath: 'Assets/Animations/WalkForward.anim', position: { x: 0, y: 1 } },
                        { animationClipPath: 'Assets/Animations/WalkBack.anim', position: { x: 0, y: -1 } },
                        { animationClipPath: 'Assets/Animations/WalkLeft.anim', position: { x: -1, y: 0 } },
                        { animationClipPath: 'Assets/Animations/WalkRight.anim', position: { x: 1, y: 0 } }
                    ]
                }
            },
            {
                description: 'Create 2D freeform blend tree for aiming',
                args: {
                    animatorControllerPath: 'Assets/Animations/ShooterAnimator.controller',
                    blendTreeName: 'Aim',
                    blendType: '2D_Freeform_Cartesian',
                    parameterX: 'AimHorizontal',
                    parameterY: 'AimVertical',
                    children: [
                        { animationClipPath: 'Assets/Animations/AimCenter.anim', position: { x: 0, y: 0 } },
                        { animationClipPath: 'Assets/Animations/AimUp.anim', position: { x: 0, y: 1 } },
                        { animationClipPath: 'Assets/Animations/AimDown.anim', position: { x: 0, y: -1 } },
                        { animationClipPath: 'Assets/Animations/AimLeft.anim', position: { x: -1, y: 0 } },
                        { animationClipPath: 'Assets/Animations/AimRight.anim', position: { x: 1, y: 0 } }
                    ]
                }
            },
            {
                description: 'Create direct blend tree for layered animations',
                args: {
                    animatorControllerPath: 'Assets/Animations/CharacterAnimator.controller',
                    blendTreeName: 'UpperBodyActions',
                    blendType: 'Direct',
                    children: [
                        { animationClipPath: 'Assets/Animations/Wave.anim' },
                        { animationClipPath: 'Assets/Animations/Point.anim' },
                        { animationClipPath: 'Assets/Animations/Salute.anim' }
                    ]
                }
            }
        ])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseTool;
    var BlendAnimationsTool = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            BlendAnimationsTool = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        get name() { return 'blend_animations'; }
        get description() { return 'Create blend trees for smooth animation blending based on parameters'; }
        get inputSchema() { return BlendAnimationsArgsSchema; }
        get category() { return 'animation'; }
        async beforeExecute(args) {
            if (!args.animatorControllerPath || !args.animatorControllerPath.endsWith('.controller')) {
                throw new Error('Animator Controller path must end with .controller extension');
            }
            if (!args.animatorControllerPath.startsWith('Assets/')) {
                throw new Error('Animator Controller path must start with "Assets/"');
            }
            if (!args.blendTreeName || args.blendTreeName.trim() === '') {
                throw new Error('Blend tree name cannot be empty');
            }
            if (!args.children || args.children.length < 2) {
                throw new Error('At least 2 animation clips are required for blending');
            }
            // Validate parameters based on blend type
            if (args.blendType === '1D') {
                if (!args.parameter) {
                    throw new Error('parameter is required for 1D blend tree');
                }
                // Validate thresholds are provided
                if (args.children.some((child) => child.threshold === undefined)) {
                    throw new Error('All children must have threshold values for 1D blend tree');
                }
            }
            else if (args.blendType.startsWith('2D')) {
                if (!args.parameterX || !args.parameterY) {
                    throw new Error('parameterX and parameterY are required for 2D blend tree');
                }
                // Validate positions are provided
                if (args.children.some((child) => !child.position)) {
                    throw new Error('All children must have position values for 2D blend tree');
                }
            }
            // Validate animation clip paths
            for (const child of args.children) {
                if (!child.animationClipPath.endsWith('.anim')) {
                    throw new Error(`Invalid animation clip path: ${child.animationClipPath}`);
                }
            }
        }
        formatSuccessResponse(result) {
            const { animatorControllerPath, blendTreeName, blendType, childrenAdded, parametersUsed } = result;
            let output = `Success! Created blend tree\n`;
            output += `Animator Controller: ${animatorControllerPath}\n`;
            output += `Blend Tree: ${blendTreeName}\n`;
            output += `Type: ${blendType}\n`;
            output += `Children: ${childrenAdded} animations\n`;
            if (parametersUsed && parametersUsed.length > 0) {
                output += `\nParameters:\n`;
                parametersUsed.forEach((param) => {
                    output += `  • ${param}\n`;
                });
            }
            output += `\nTip: Adjust the blend parameter values to see smooth transitions between animations.`;
            return {
                content: [{ type: 'text', text: output }]
            };
        }
        formatErrorResponse(error) {
            const errorMessage = error.message || 'Unknown error occurred';
            let helpText = '';
            if (errorMessage.includes('not found')) {
                helpText = '\n\nTip: Make sure the Animator Controller and all animation clips exist.';
            }
            else if (errorMessage.includes('parameter')) {
                helpText = '\n\nTip: Make sure the blend parameters exist in the Animator Controller.';
            }
            else if (errorMessage.includes('already exists')) {
                helpText = '\n\nTip: A blend tree with this name already exists in the layer.';
            }
            else if (errorMessage.includes('threshold')) {
                helpText = '\n\nTip: For 1D blend trees, all children must have threshold values.';
            }
            else if (errorMessage.includes('position')) {
                helpText = '\n\nTip: For 2D blend trees, all children must have position values.';
            }
            return {
                content: [{ type: 'text', text: `Error creating blend tree: ${errorMessage}${helpText}` }],
                isError: true
            };
        }
    };
    return BlendAnimationsTool = _classThis;
})();
export { BlendAnimationsTool };
