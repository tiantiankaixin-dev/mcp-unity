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
const QueryTriggerInteractionSchema = z.enum(['UseGlobal', 'Ignore', 'Collide']);
const OverlapSphereArgsSchema = z.object({
    position: z.object({ x: z.number(), y: z.number(), z: z.number() }).describe('Center of the sphere in world coordinates'),
    radius: z.number().positive().describe('Radius of the sphere'),
    layerMask: z.string().optional().describe('Layer mask to filter colliders (e.g., "Default,Player")'),
    queryTriggerInteraction: QueryTriggerInteractionSchema.default('UseGlobal').describe('Whether to detect trigger colliders'),
    includeDetails: z.boolean().default(true).describe('Include detailed information about each collider'),
    drawDebugSphere: z.boolean().default(false).describe('Draw debug sphere in Scene view'),
    debugSphereColor: z.string().default('yellow').describe('Color of debug sphere'),
    debugSphereDuration: z.number().default(2).describe('Duration to show debug sphere in seconds')
});
let OverlapSphereTool = (() => {
    let _classDecorators = [Tool({
            name: 'overlap_sphere',
            description: 'Detect all colliders touching or inside a sphere, useful for explosion damage, area detection, and proximity checks',
            category: 'physics',
            version: '1.0.0'
        }), Tags(['unity', 'physics', 'overlap', 'detection', 'area', 'proximity']), Examples([
            {
                description: 'Detect objects in explosion radius',
                args: {
                    position: { x: 0, y: 0, z: 0 },
                    radius: 10,
                    drawDebugSphere: true,
                    debugSphereColor: 'red'
                }
            },
            {
                description: 'Find enemies near player',
                args: {
                    position: { x: 0, y: 1, z: 0 },
                    radius: 15,
                    layerMask: 'Enemy',
                    includeDetails: true
                }
            },
            {
                description: 'Detect pickups in area',
                args: {
                    position: { x: 5, y: 0, z: 5 },
                    radius: 3,
                    layerMask: 'Pickup',
                    queryTriggerInteraction: 'Collide',
                    drawDebugSphere: true
                }
            }
        ])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseTool;
    var OverlapSphereTool = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            OverlapSphereTool = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        get name() { return 'overlap_sphere'; }
        get description() { return 'Detect all colliders touching or inside a sphere, useful for explosion damage, area detection, and proximity checks'; }
        get inputSchema() { return OverlapSphereArgsSchema; }
        get category() { return 'physics'; }
        async beforeExecute(args) {
            if (args.radius <= 0) {
                throw new Error('Radius must be positive');
            }
            if (args.radius > 1000) {
                this.logger.warn('Very large radius may impact performance');
            }
        }
        formatSuccessResponse(result) {
            const { colliders, position, radius } = result;
            if (!colliders || colliders.length === 0) {
                return {
                    content: [{
                            type: 'text',
                            text: `🔍 Overlap sphere completed - No colliders found\n📍 Position: (${position.x}, ${position.y}, ${position.z})\n⭕ Radius: ${radius}\n\n💡 Tip: Try increasing the radius or adjusting the layer mask.`
                        }]
                };
            }
            let output = `✅ Found ${colliders.length} collider(s) in sphere\n📍 Position: (${position.x}, ${position.y}, ${position.z})\n⭕ Radius: ${radius}\n\n`;
            output += `🎯 Detected colliders:\n\n`;
            colliders.forEach((collider, index) => {
                output += `${index + 1}. ${collider.name || 'Unknown'}\n`;
                if (collider.gameObjectPath)
                    output += `   • GameObject: ${collider.gameObjectPath}\n`;
                if (collider.type)
                    output += `   • Type: ${collider.type}\n`;
                if (collider.isTrigger !== undefined)
                    output += `   • Is Trigger: ${collider.isTrigger}\n`;
                if (collider.distance !== undefined)
                    output += `   • Distance from center: ${collider.distance.toFixed(2)}\n`;
                output += '\n';
            });
            output += '💡 Tip: Use this for explosion damage, area effects, or proximity detection.';
            return { content: [{ type: 'text', text: output }] };
        }
        formatErrorResponse(error) {
            const errorMessage = error.message || 'Unknown error occurred';
            let helpText = '';
            if (errorMessage.includes('radius')) {
                helpText = '\n\n💡 Tip: Radius must be a positive number.';
            }
            else if (errorMessage.includes('performance')) {
                helpText = '\n\n💡 Tip: Very large overlap spheres may impact performance. Consider using a smaller radius or layer masks.';
            }
            return {
                content: [{ type: 'text', text: `❌ Error detecting colliders: ${errorMessage}${helpText}` }],
                isError: true
            };
        }
    };
    return OverlapSphereTool = _classThis;
})();
export { OverlapSphereTool };
