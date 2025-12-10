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
const KeyframeSchema = z.object({
    time: z.number().describe('Time in seconds'),
    value: z.number().describe('Value at this time'),
    inTangent: z.number().optional().describe('In tangent (slope)'),
    outTangent: z.number().optional().describe('Out tangent (slope)'),
    weightedMode: z.enum(['None', 'In', 'Out', 'Both']).optional().describe('Weighted mode')
});
const CreateAnimationCurveArgsSchema = z.object({
    animationClipPath: z.string().describe('Path to the animation clip'),
    propertyPath: z.string().describe('Property path (e.g., "m_LocalPosition.x")'),
    targetType: z.string().describe('Target component type (e.g., "Transform", "Renderer")'),
    keyframes: z.array(KeyframeSchema).describe('Array of keyframes'),
    preWrapMode: z.enum(['Once', 'Loop', 'PingPong', 'ClampForever']).default('ClampForever')
        .describe('Behavior before first keyframe'),
    postWrapMode: z.enum(['Once', 'Loop', 'PingPong', 'ClampForever']).default('ClampForever')
        .describe('Behavior after last keyframe'),
    createIfNotExists: z.boolean().default(false).describe('Create animation clip if it does not exist')
});
let CreateAnimationCurveTool = (() => {
    let _classDecorators = [Tool({
            name: 'create_animation_curve',
            description: 'Create and edit animation curves with keyframes for animating properties',
            category: 'animation',
            version: '1.0.0'
        }), Tags(['unity', 'animation', 'curve', 'keyframe', 'timeline']), Examples([
            {
                description: 'Animate position X with linear movement',
                args: {
                    animationClipPath: 'Assets/Animations/MoveRight.anim',
                    propertyPath: 'm_LocalPosition.x',
                    targetType: 'Transform',
                    keyframes: [
                        { time: 0, value: 0 },
                        { time: 1, value: 5 },
                        { time: 2, value: 10 }
                    ]
                }
            },
            {
                description: 'Animate scale with ease in/out',
                args: {
                    animationClipPath: 'Assets/Animations/Pulse.anim',
                    propertyPath: 'm_LocalScale.x',
                    targetType: 'Transform',
                    keyframes: [
                        { time: 0, value: 1, outTangent: 0 },
                        { time: 0.5, value: 1.5, inTangent: 2, outTangent: -2 },
                        { time: 1, value: 1, inTangent: 0 }
                    ],
                    postWrapMode: 'Loop'
                }
            },
            {
                description: 'Animate material color alpha',
                args: {
                    animationClipPath: 'Assets/Animations/FadeOut.anim',
                    propertyPath: 'material._Color.a',
                    targetType: 'Renderer',
                    keyframes: [
                        { time: 0, value: 1 },
                        { time: 1, value: 0 }
                    ]
                }
            },
            {
                description: 'Create bouncing animation',
                args: {
                    animationClipPath: 'Assets/Animations/Bounce.anim',
                    propertyPath: 'm_LocalPosition.y',
                    targetType: 'Transform',
                    keyframes: [
                        { time: 0, value: 0 },
                        { time: 0.3, value: 2, outTangent: 0 },
                        { time: 0.6, value: 0 },
                        { time: 0.8, value: 1, outTangent: 0 },
                        { time: 1, value: 0 }
                    ],
                    postWrapMode: 'Loop'
                }
            }
        ])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseTool;
    var CreateAnimationCurveTool = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            CreateAnimationCurveTool = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        get name() { return 'create_animation_curve'; }
        get description() { return 'Create and edit animation curves with keyframes for animating properties'; }
        get inputSchema() { return CreateAnimationCurveArgsSchema; }
        get category() { return 'animation'; }
        async beforeExecute(args) {
            if (!args.animationClipPath || !args.animationClipPath.endsWith('.anim')) {
                throw new Error('Animation clip path must end with .anim extension');
            }
            if (!args.animationClipPath.startsWith('Assets/')) {
                throw new Error('Animation clip path must start with "Assets/"');
            }
            if (!args.propertyPath || args.propertyPath.trim() === '') {
                throw new Error('Property path cannot be empty');
            }
            if (!args.targetType || args.targetType.trim() === '') {
                throw new Error('Target type cannot be empty');
            }
            if (!args.keyframes || args.keyframes.length < 2) {
                throw new Error('At least 2 keyframes are required to create a curve');
            }
            // Validate keyframes are in chronological order
            for (let i = 1; i < args.keyframes.length; i++) {
                if (args.keyframes[i].time <= args.keyframes[i - 1].time) {
                    throw new Error('Keyframes must be in chronological order (increasing time)');
                }
            }
            // Validate time values are non-negative
            if (args.keyframes.some((kf) => kf.time < 0)) {
                throw new Error('Keyframe time values must be non-negative');
            }
        }
        formatSuccessResponse(result) {
            const { animationClipPath, propertyPath, keyframesAdded, duration } = result;
            let output = `Success! Created animation curve\n`;
            output += `Animation Clip: ${animationClipPath}\n`;
            output += `Property: ${propertyPath}\n`;
            output += `Keyframes: ${keyframesAdded}\n`;
            output += `Duration: ${duration.toFixed(2)}s\n`;
            output += `\nTip: You can preview the animation in the Animation window.`;
            return {
                content: [{ type: 'text', text: output }]
            };
        }
        formatErrorResponse(error) {
            const errorMessage = error.message || 'Unknown error occurred';
            let helpText = '';
            if (errorMessage.includes('not found')) {
                helpText = '\n\nTip: Set createClipIfNotExists to true to create the animation clip.';
            }
            else if (errorMessage.includes('invalid property')) {
                helpText = '\n\nTip: Make sure the property path is valid for the target type.';
            }
            else if (errorMessage.includes('chronological order')) {
                helpText = '\n\nTip: Keyframes must be sorted by time in ascending order.';
            }
            return {
                content: [{ type: 'text', text: `Error creating animation curve: ${errorMessage}${helpText}` }],
                isError: true
            };
        }
    };
    return CreateAnimationCurveTool = _classThis;
})();
export { CreateAnimationCurveTool };
