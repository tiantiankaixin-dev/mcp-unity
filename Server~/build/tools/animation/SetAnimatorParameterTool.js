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
const SetAnimatorParameterArgsSchema = z.object({
    instanceId: z.number().int().optional().describe('Instance ID of the GameObject (preferred, returned from create_primitive_object etc.)'),
    gameObjectPath: z.string().optional().describe('Hierarchy path to the GameObject with Animator component (alternative to instanceId)'),
    parameterName: z.string().describe('Name of the animator parameter'),
    parameterType: z.enum(['Float', 'Int', 'Bool', 'Trigger']).describe('Type of parameter'),
    value: z.union([z.number(), z.boolean()]).optional().describe('Value to set (not needed for Trigger)'),
    createIfNotExists: z.boolean().default(false).describe('Create parameter if it does not exist'),
    defaultValue: z.union([z.number(), z.boolean()]).optional().describe('Default value when creating parameter')
});
let SetAnimatorParameterTool = (() => {
    let _classDecorators = [Tool({
            name: 'set_animator_parameter',
            description: 'Set animator parameters (Float, Int, Bool, Trigger) on a GameObject at runtime or in edit mode',
            category: 'animation',
            version: '1.0.0'
        }), Tags(['unity', 'animation', 'animator', 'parameter', 'runtime']), Examples([
            {
                description: 'Set float parameter (speed)',
                args: {
                    gameObjectPath: 'Player',
                    parameterName: 'Speed',
                    parameterType: 'Float',
                    value: 5.5
                }
            },
            {
                description: 'Set bool parameter (is grounded)',
                args: {
                    gameObjectPath: 'Player',
                    parameterName: 'IsGrounded',
                    parameterType: 'Bool',
                    value: true
                }
            },
            {
                description: 'Trigger animation (jump)',
                args: {
                    gameObjectPath: 'Player',
                    parameterName: 'Jump',
                    parameterType: 'Trigger'
                }
            },
            {
                description: 'Set int parameter with auto-create',
                args: {
                    gameObjectPath: 'Enemy',
                    parameterName: 'AttackType',
                    parameterType: 'Int',
                    value: 2,
                    createIfNotExists: true,
                    defaultValue: 0
                }
            }
        ])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseTool;
    var SetAnimatorParameterTool = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            SetAnimatorParameterTool = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        get name() { return 'set_animator_parameter'; }
        get description() { return 'Set animator parameters (Float, Int, Bool, Trigger) on a GameObject at runtime or in edit mode'; }
        get inputSchema() { return SetAnimatorParameterArgsSchema; }
        get category() { return 'animation'; }
        async beforeExecute(args) {
            if (!args.gameObjectPath || args.gameObjectPath.trim() === '') {
                throw new Error('GameObject path cannot be empty');
            }
            if (!args.parameterName || args.parameterName.trim() === '') {
                throw new Error('Parameter name cannot be empty');
            }
            // Validate value based on parameter type
            if (args.parameterType !== 'Trigger' && args.value === undefined) {
                throw new Error(`Value is required for ${args.parameterType} parameter`);
            }
            if (args.parameterType === 'Float' && typeof args.value !== 'number') {
                throw new Error('Value must be a number for Float parameter');
            }
            if (args.parameterType === 'Int') {
                if (typeof args.value !== 'number') {
                    throw new Error('Value must be a number for Int parameter');
                }
                if (!Number.isInteger(args.value)) {
                    throw new Error('Value must be an integer for Int parameter');
                }
            }
            if (args.parameterType === 'Bool' && typeof args.value !== 'boolean') {
                throw new Error('Value must be a boolean for Bool parameter');
            }
        }
        formatSuccessResponse(result) {
            const { gameObjectPath, parameterName, parameterType, value, created } = result;
            let output = `Success! Set animator parameter\n`;
            output += `GameObject: ${gameObjectPath}\n`;
            output += `Parameter: ${parameterName} (${parameterType})\n`;
            if (parameterType === 'Trigger') {
                output += `Action: Triggered\n`;
            }
            else {
                output += `Value: ${value}\n`;
            }
            if (created) {
                output += `Status: Parameter was created\n`;
            }
            output += `\nTip: The animator will respond to this parameter change.`;
            return {
                content: [{ type: 'text', text: output }]
            };
        }
        formatErrorResponse(error) {
            const errorMessage = error.message || 'Unknown error occurred';
            let helpText = '';
            if (errorMessage.includes('GameObject not found')) {
                helpText = '\n\nTip: Make sure the GameObject exists in the scene hierarchy.';
            }
            else if (errorMessage.includes('Animator not found')) {
                helpText = '\n\nTip: The GameObject does not have an Animator component.';
            }
            else if (errorMessage.includes('parameter not found')) {
                helpText = '\n\nTip: The parameter does not exist. Set createIfNotExists to true to create it.';
            }
            else if (errorMessage.includes('type mismatch')) {
                helpText = '\n\nTip: The parameter exists but has a different type.';
            }
            return {
                content: [{ type: 'text', text: `Error setting animator parameter: ${errorMessage}${helpText}` }],
                isError: true
            };
        }
    };
    return SetAnimatorParameterTool = _classThis;
})();
export { SetAnimatorParameterTool };
