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
const ForceModeSchema = z.enum(['Force', 'Acceleration', 'Impulse', 'VelocityChange']);
const AddForceToRigidbodyArgsSchema = z.object({
    instanceId: z.number().int().optional().describe('Instance ID of the GameObject (preferred, returned from create_primitive_object etc.)'),
    gameObjectPath: z.string().optional().describe('Hierarchy path to the GameObject (alternative to instanceId)'),
    force: z.object({
        x: z.number(),
        y: z.number(),
        z: z.number()
    }).describe('Force vector in world coordinates'),
    forceMode: ForceModeSchema.default('Force').describe('Type of force to apply'),
    forceType: z.enum(['Force', 'RelativeForce', 'Torque', 'RelativeTorque']).default('Force')
        .describe('Whether to apply force, relative force, torque, or relative torque'),
    position: z.object({
        x: z.number(),
        y: z.number(),
        z: z.number()
    }).optional().describe('Position in world coordinates (for ForceAtPosition)'),
    wakeUp: z.boolean().default(true).describe('Wake up the rigidbody if sleeping')
});
let AddForceToRigidbodyTool = (() => {
    let _classDecorators = [Tool({
            name: 'add_force_to_rigidbody',
            description: 'Apply force, acceleration, impulse, or torque to a Rigidbody for physics-based movement',
            category: 'physics',
            version: '1.0.0'
        }), Tags(['unity', 'physics', 'rigidbody', 'force', 'impulse', 'torque']), Examples([
            {
                description: 'Apply upward force for jumping',
                args: {
                    gameObjectPath: 'Player',
                    force: { x: 0, y: 500, z: 0 },
                    forceMode: 'Impulse'
                }
            },
            {
                description: 'Apply continuous forward force',
                args: {
                    gameObjectPath: 'Car',
                    force: { x: 0, y: 0, z: 1000 },
                    forceMode: 'Force',
                    forceType: 'RelativeForce'
                }
            },
            {
                description: 'Apply torque for rotation',
                args: {
                    gameObjectPath: 'Wheel',
                    force: { x: 0, y: 100, z: 0 },
                    forceMode: 'Force',
                    forceType: 'Torque'
                }
            }
        ])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseTool;
    var AddForceToRigidbodyTool = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AddForceToRigidbodyTool = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        get name() { return 'add_force_to_rigidbody'; }
        get description() { return 'Apply force, acceleration, impulse, or torque to a Rigidbody for physics-based movement'; }
        get inputSchema() { return AddForceToRigidbodyArgsSchema; }
        get category() { return 'physics'; }
        async beforeExecute(args) {
            if (!args.gameObjectPath || args.gameObjectPath.trim() === '') {
                throw new Error('GameObject path cannot be empty');
            }
            const forceMagnitude = Math.sqrt(args.force.x * args.force.x +
                args.force.y * args.force.y +
                args.force.z * args.force.z);
            if (forceMagnitude === 0) {
                this.logger.warn('Force magnitude is zero, no effect will be applied');
            }
        }
        formatSuccessResponse(result) {
            const { gameObjectPath, forceApplied, forceMode, forceType } = result;
            let forceModeDescription = '';
            switch (forceMode) {
                case 'Force':
                    forceModeDescription = 'continuous force (considers mass and time)';
                    break;
                case 'Acceleration':
                    forceModeDescription = 'continuous acceleration (ignores mass)';
                    break;
                case 'Impulse':
                    forceModeDescription = 'instant impulse (considers mass)';
                    break;
                case 'VelocityChange':
                    forceModeDescription = 'instant velocity change (ignores mass)';
                    break;
            }
            return {
                content: [{
                        type: 'text',
                        text: `✅ Successfully applied ${forceType} to Rigidbody\n🎮 GameObject: ${gameObjectPath}\n⚡ Force: (${forceApplied.x}, ${forceApplied.y}, ${forceApplied.z})\n📊 Mode: ${forceMode} (${forceModeDescription})\n\n💡 Tip: Use FixedUpdate for consistent physics-based forces.`
                    }]
            };
        }
        formatErrorResponse(error) {
            const errorMessage = error.message || 'Unknown error occurred';
            let helpText = '';
            if (errorMessage.includes('not found')) {
                helpText = '\n\n💡 Tip: Make sure the GameObject exists in the scene hierarchy.';
            }
            else if (errorMessage.includes('no Rigidbody')) {
                helpText = '\n\n💡 Tip: Add a Rigidbody component first using add_rigidbody tool.';
            }
            else if (errorMessage.includes('kinematic')) {
                helpText = '\n\n💡 Tip: Cannot apply forces to kinematic Rigidbodies. Set isKinematic to false.';
            }
            return {
                content: [{ type: 'text', text: `❌ Error applying force: ${errorMessage}${helpText}` }],
                isError: true
            };
        }
    };
    return AddForceToRigidbodyTool = _classThis;
})();
export { AddForceToRigidbodyTool };
