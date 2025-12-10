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
const TransitionConditionSchema = z.object({
    parameter: z.string().describe('Parameter name'),
    mode: z.enum(['If', 'IfNot', 'Greater', 'Less', 'Equals', 'NotEqual']).describe('Condition mode'),
    threshold: z.union([z.number(), z.boolean(), z.string()]).optional().describe('Threshold value')
});
const AddAnimationTransitionArgsSchema = z.object({
    animatorControllerPath: z.string().optional().describe('Path to the Animator Controller asset'),
    controllerPath: z.string().optional().describe('Alias for animatorControllerPath'),
    fromState: z.string().optional().describe('Source state name (use "Any State" or "Entry" for special states)'),
    sourceStateName: z.string().optional().describe('Alias for fromState'),
    toState: z.string().optional().describe('Destination state name'),
    destinationStateName: z.string().optional().describe('Alias for toState'),
    layerIndex: z.number().default(0).describe('Layer index (0 = Base Layer)'),
    hasExitTime: z.boolean().default(true).describe('Has exit time'),
    exitTime: z.number().default(0.75).describe('Exit time (0-1)'),
    duration: z.number().default(0.25).describe('Transition duration in seconds'),
    offset: z.number().default(0).describe('Transition offset (0-1)'),
    interruptionSource: z.enum(['None', 'Source', 'Destination', 'SourceThenDestination', 'DestinationThenSource'])
        .default('None').describe('Interruption source'),
    orderedInterruption: z.boolean().default(true).describe('Ordered interruption'),
    canTransitionToSelf: z.boolean().default(false).describe('Can transition to self'),
    conditions: z.array(TransitionConditionSchema).optional().describe('Transition conditions')
}).refine(data => data.animatorControllerPath || data.controllerPath, {
    message: 'Either animatorControllerPath or controllerPath is required'
}).refine(data => data.fromState || data.sourceStateName, {
    message: 'Either fromState or sourceStateName is required'
}).refine(data => data.toState || data.destinationStateName, {
    message: 'Either toState or destinationStateName is required'
}).transform(data => ({
    ...data,
    animatorControllerPath: data.animatorControllerPath || data.controllerPath || '',
    fromState: data.fromState || data.sourceStateName || '',
    toState: data.toState || data.destinationStateName || ''
}));
let AddAnimationTransitionTool = (() => {
    let _classDecorators = [Tool({
            name: 'add_animation_transition',
            description: 'Add a transition between animation states in an Animator Controller',
            category: 'animation',
            version: '1.0.0'
        }), Tags(['unity', 'animation', 'animator', 'transition', 'state-machine']), Examples([
            {
                description: 'Add transition from Idle to Run',
                args: {
                    animatorControllerPath: 'Assets/Animations/PlayerAnimator.controller',
                    fromState: 'Idle',
                    toState: 'Run',
                    hasExitTime: false,
                    duration: 0.1,
                    conditions: [
                        { parameter: 'Speed', mode: 'Greater', threshold: 0.1 }
                    ]
                }
            },
            {
                description: 'Add transition with exit time',
                args: {
                    animatorControllerPath: 'Assets/Animations/PlayerAnimator.controller',
                    fromState: 'Attack',
                    toState: 'Idle',
                    hasExitTime: true,
                    exitTime: 0.9,
                    duration: 0.2
                }
            },
            {
                description: 'Add Any State transition',
                args: {
                    animatorControllerPath: 'Assets/Animations/PlayerAnimator.controller',
                    fromState: 'Any State',
                    toState: 'Death',
                    hasExitTime: false,
                    conditions: [
                        { parameter: 'IsDead', mode: 'If' }
                    ]
                }
            },
            {
                description: 'Add transition with multiple conditions',
                args: {
                    animatorControllerPath: 'Assets/Animations/EnemyAnimator.controller',
                    fromState: 'Patrol',
                    toState: 'Chase',
                    hasExitTime: false,
                    conditions: [
                        { parameter: 'PlayerDetected', mode: 'If' },
                        { parameter: 'Health', mode: 'Greater', threshold: 0 }
                    ]
                }
            }
        ])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseTool;
    var AddAnimationTransitionTool = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AddAnimationTransitionTool = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        get name() { return 'add_animation_transition'; }
        get description() { return 'Add a transition between animation states in an Animator Controller'; }
        get inputSchema() { return AddAnimationTransitionArgsSchema; }
        get category() { return 'animation'; }
        async beforeExecute(args) {
            if (!args.animatorControllerPath || !args.animatorControllerPath.endsWith('.controller')) {
                throw new Error('Animator Controller path must end with .controller extension');
            }
            if (!args.animatorControllerPath.startsWith('Assets/')) {
                throw new Error('Animator Controller path must start with "Assets/"');
            }
            if (!args.fromState || args.fromState.trim() === '') {
                throw new Error('From state cannot be empty');
            }
            if (!args.toState || args.toState.trim() === '') {
                throw new Error('To state cannot be empty');
            }
            if (args.exitTime < 0 || args.exitTime > 1) {
                throw new Error('Exit time must be between 0 and 1');
            }
            if (args.duration < 0) {
                throw new Error('Duration must be non-negative');
            }
            if (args.offset < 0 || args.offset > 1) {
                throw new Error('Offset must be between 0 and 1');
            }
        }
        formatSuccessResponse(result) {
            const { animatorControllerPath, fromState, toState, conditionsAdded } = result;
            let output = `Success! Added animation transition\n`;
            output += `Animator Controller: ${animatorControllerPath}\n`;
            output += `From: ${fromState}\n`;
            output += `To: ${toState}\n`;
            if (conditionsAdded && conditionsAdded.length > 0) {
                output += `\nConditions:\n`;
                conditionsAdded.forEach((condition, index) => {
                    output += `  ${index + 1}. ${condition.parameter} ${condition.mode}`;
                    if (condition.threshold !== undefined) {
                        output += ` ${condition.threshold}`;
                    }
                    output += '\n';
                });
            }
            output += `\nTip: The transition is now active in the Animator Controller.`;
            return {
                content: [{ type: 'text', text: output }]
            };
        }
        formatErrorResponse(error) {
            const errorMessage = error.message || 'Unknown error occurred';
            let helpText = '';
            if (errorMessage.includes('state not found')) {
                helpText = '\n\nTip: Make sure both states exist in the Animator Controller.';
            }
            else if (errorMessage.includes('parameter not found')) {
                helpText = '\n\nTip: The parameter used in conditions does not exist. Add it first.';
            }
            else if (errorMessage.includes('already exists')) {
                helpText = '\n\nTip: A transition between these states already exists.';
            }
            return {
                content: [{ type: 'text', text: `Error adding transition: ${errorMessage}${helpText}` }],
                isError: true
            };
        }
    };
    return AddAnimationTransitionTool = _classThis;
})();
export { AddAnimationTransitionTool };
