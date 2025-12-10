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
const JointTypeSchema = z.enum(['FixedJoint', 'HingeJoint', 'SpringJoint', 'CharacterJoint', 'ConfigurableJoint']);
const ConfigurableJointMotionSchema = z.enum(['Locked', 'Limited', 'Free']);
const AddJointArgsSchema = z.object({
    instanceId: z.number().int().optional().describe('Instance ID of the GameObject (preferred)'),
    gameObjectPath: z.string().optional().describe('Hierarchy path to the GameObject (alternative to instanceId)'),
    jointType: JointTypeSchema.describe('Type of joint to add'),
    connectedInstanceId: z.number().int().optional().describe('Instance ID of connected Rigidbody (preferred)'),
    connectedBodyPath: z.string().optional().describe('Path to connected Rigidbody (alternative to connectedInstanceId)'),
    anchor: z.object({ x: z.number(), y: z.number(), z: z.number() }).optional(),
    connectedAnchor: z.object({ x: z.number(), y: z.number(), z: z.number() }).optional(),
    axis: z.object({ x: z.number(), y: z.number(), z: z.number() }).optional(),
    breakForce: z.number().positive().optional().describe('Force required to break the joint'),
    breakTorque: z.number().positive().optional().describe('Torque required to break the joint'),
    hingeJoint: z.object({
        useMotor: z.boolean().optional(),
        motorTargetVelocity: z.number().optional(),
        motorForce: z.number().optional(),
        useLimits: z.boolean().optional(),
        minAngle: z.number().optional(),
        maxAngle: z.number().optional(),
        useSpring: z.boolean().optional(),
        springForce: z.number().optional(),
        springDamper: z.number().optional()
    }).optional(),
    springJoint: z.object({
        spring: z.number().optional(),
        damper: z.number().optional(),
        minDistance: z.number().optional(),
        maxDistance: z.number().optional(),
        tolerance: z.number().optional()
    }).optional(),
    configurableJoint: z.object({
        xMotion: ConfigurableJointMotionSchema.optional(),
        yMotion: ConfigurableJointMotionSchema.optional(),
        zMotion: ConfigurableJointMotionSchema.optional(),
        angularXMotion: ConfigurableJointMotionSchema.optional(),
        angularYMotion: ConfigurableJointMotionSchema.optional(),
        angularZMotion: ConfigurableJointMotionSchema.optional()
    }).optional()
});
let AddJointTool = (() => {
    let _classDecorators = [Tool({
            name: 'add_joint',
            description: 'Add physics joints (Fixed, Hinge, Spring, Character, Configurable) to connect Rigidbodies',
            category: 'physics',
            version: '1.0.0'
        }), Tags(['unity', 'physics', 'joint', 'constraint']), Examples([
            {
                description: 'Add a fixed joint to attach two objects',
                args: {
                    gameObjectPath: 'Cube',
                    jointType: 'FixedJoint',
                    connectedBodyPath: 'Sphere',
                    breakForce: 1000
                }
            },
            {
                description: 'Add a hinge joint for a door',
                args: {
                    gameObjectPath: 'Door',
                    jointType: 'HingeJoint',
                    axis: { x: 0, y: 1, z: 0 },
                    hingeJoint: {
                        useLimits: true,
                        minAngle: 0,
                        maxAngle: 90
                    }
                }
            }
        ])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseTool;
    var AddJointTool = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AddJointTool = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        get name() { return 'add_joint'; }
        get description() { return 'Add physics joints (Fixed, Hinge, Spring, Character, Configurable) to connect Rigidbodies'; }
        get inputSchema() { return AddJointArgsSchema; }
        get category() { return 'physics'; }
        async beforeExecute(args) {
            if (!args.gameObjectPath || args.gameObjectPath.trim() === '') {
                throw new Error('GameObject path cannot be empty');
            }
            if (args.jointType === 'HingeJoint' && args.hingeJoint?.useLimits) {
                if (args.hingeJoint.minAngle === undefined || args.hingeJoint.maxAngle === undefined) {
                    throw new Error('minAngle and maxAngle are required when useLimits is true');
                }
                if (args.hingeJoint.minAngle >= args.hingeJoint.maxAngle) {
                    throw new Error('minAngle must be less than maxAngle');
                }
            }
        }
        formatSuccessResponse(result) {
            const { gameObjectPath, jointType, connectedBodyPath } = result;
            const connectionText = connectedBodyPath
                ? `\n🔗 Connected to: ${connectedBodyPath}`
                : '\n🔗 Connected to: World (fixed anchor)';
            return {
                content: [{
                        type: 'text',
                        text: `✅ Successfully added ${jointType}\n🎮 GameObject: ${gameObjectPath}${connectionText}\n\n💡 Tip: Joints require Rigidbody components on both connected objects.`
                    }]
            };
        }
        formatErrorResponse(error) {
            const errorMessage = error.message || 'Unknown error occurred';
            let helpText = '';
            if (errorMessage.includes('not found')) {
                helpText = '\n\n💡 Tip: Make sure both GameObjects exist in the scene hierarchy.';
            }
            else if (errorMessage.includes('no Rigidbody')) {
                helpText = '\n\n💡 Tip: Both GameObjects need Rigidbody components.';
            }
            return {
                content: [{ type: 'text', text: `❌ Error adding joint: ${errorMessage}${helpText}` }],
                isError: true
            };
        }
    };
    return AddJointTool = _classThis;
})();
export { AddJointTool };
