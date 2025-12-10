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
const RigidbodyConstraintsSchema = z.enum([
    'None', 'FreezePositionX', 'FreezePositionY', 'FreezePositionZ',
    'FreezeRotationX', 'FreezeRotationY', 'FreezeRotationZ',
    'FreezePosition', 'FreezeRotation', 'FreezeAll'
]);
const CollisionDetectionModeSchema = z.enum([
    'Discrete', 'Continuous', 'ContinuousDynamic', 'ContinuousSpeculative'
]);
const ConfigureRigidbodyArgsSchema = z.object({
    instanceId: z.number().int().optional().describe('Instance ID of the GameObject (preferred, returned from create_primitive_object etc.)'),
    gameObjectPath: z.string().optional().describe('Hierarchy path to the GameObject (alternative to instanceId)'),
    mass: z.number().positive().optional().describe('Mass in kilograms'),
    drag: z.number().min(0).optional().describe('Drag coefficient'),
    angularDrag: z.number().min(0).optional().describe('Angular drag coefficient'),
    useGravity: z.boolean().optional().describe('Use gravity'),
    isKinematic: z.boolean().optional().describe('Is kinematic'),
    centerOfMass: z.object({ x: z.number(), y: z.number(), z: z.number() }).optional(),
    constraints: z.array(RigidbodyConstraintsSchema).optional(),
    collisionDetectionMode: CollisionDetectionModeSchema.optional(),
    interpolation: z.enum(['None', 'Interpolate', 'Extrapolate']).optional(),
    maxAngularVelocity: z.number().positive().optional(),
    sleepThreshold: z.number().min(0).optional()
});
let ConfigureRigidbodyTool = (() => {
    let _classDecorators = [Tool({
            name: 'configure_rigidbody',
            description: 'Configure detailed Rigidbody properties including mass, drag, constraints, and collision detection',
            category: 'physics',
            version: '1.0.0'
        }), Tags(['unity', 'physics', 'rigidbody', 'configuration']), Examples([
            {
                description: 'Configure basic rigidbody properties',
                args: {
                    gameObjectPath: 'Player',
                    mass: 75,
                    drag: 0.5,
                    useGravity: true
                }
            },
            {
                description: 'Create kinematic rigidbody with constraints',
                args: {
                    gameObjectPath: 'Door',
                    isKinematic: false,
                    constraints: ['FreezePositionX', 'FreezePositionZ'],
                    collisionDetectionMode: 'Continuous'
                }
            }
        ])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseTool;
    var ConfigureRigidbodyTool = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ConfigureRigidbodyTool = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        get name() { return 'configure_rigidbody'; }
        get description() { return 'Configure detailed Rigidbody properties including mass, drag, constraints, and collision detection'; }
        get inputSchema() { return ConfigureRigidbodyArgsSchema; }
        get category() { return 'physics'; }
        async beforeExecute(args) {
            if (!args.gameObjectPath || args.gameObjectPath.trim() === '') {
                throw new Error('GameObject path cannot be empty');
            }
            if (args.mass !== undefined && args.mass <= 0) {
                throw new Error('Mass must be greater than 0');
            }
        }
        formatSuccessResponse(result) {
            const { gameObjectPath, configuredProperties } = result;
            let propertiesText = '';
            if (configuredProperties && Object.keys(configuredProperties).length > 0) {
                propertiesText = '\n\n📝 Configured properties:\n';
                for (const [key, value] of Object.entries(configuredProperties)) {
                    propertiesText += `  • ${key}: ${JSON.stringify(value)}\n`;
                }
            }
            return {
                content: [{
                        type: 'text',
                        text: `✅ Successfully configured Rigidbody\n🎮 GameObject: ${gameObjectPath}${propertiesText}\n\n💡 Tip: The physics simulation will use these settings in Play mode.`
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
            return {
                content: [{ type: 'text', text: `❌ Error configuring Rigidbody: ${errorMessage}${helpText}` }],
                isError: true
            };
        }
    };
    return ConfigureRigidbodyTool = _classThis;
})();
export { ConfigureRigidbodyTool };
