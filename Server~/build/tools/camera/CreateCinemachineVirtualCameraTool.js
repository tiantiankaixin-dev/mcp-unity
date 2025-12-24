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
import { Tool, Tags } from '../base/ToolDecorators.js';
/**
 * Input schema for create_cinemachine_virtual_camera tool
 */
const CreateCinemachineVirtualCameraToolArgsSchema = z.object({
    cameraName: z.string().optional().default('VirtualCamera').describe('Name for the virtual camera GameObject. Default: "VirtualCamera"'),
    position: z.array(z.number()).length(3).optional().describe('Position as [x, y, z]. Fallback to posX/posY/posZ if not provided'),
    posX: z.number().optional().default(0).describe('X position. Default: 0'),
    posY: z.number().optional().default(1.5).describe('Y position. Default: 1.5'),
    posZ: z.number().optional().default(-10).describe('Z position. Default: -10'),
    priority: z.number().int().optional().default(10).describe('Camera priority. Default: 10')
});
/**
 * CreateCinemachineVirtualCamera Tool
 * Creates a Cinemachine Virtual Camera
 */
let CreateCinemachineVirtualCameraTool = (() => {
    let _classDecorators = [Tool({
            name: 'create_cinemachine_virtual_camera',
            description: 'Creates a Cinemachine Virtual Camera',
            category: 'camera',
            version: '1.0.0'
        }), Tags(['unity', 'camera', 'cinemachine'])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseTool;
    var CreateCinemachineVirtualCameraTool = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            CreateCinemachineVirtualCameraTool = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        get name() {
            return 'create_cinemachine_virtual_camera';
        }
        get description() {
            return 'Creates a Cinemachine Virtual Camera';
        }
        get inputSchema() {
            return CreateCinemachineVirtualCameraToolArgsSchema;
        }
        get category() {
            return 'camera';
        }
        formatSuccessResponse(result) {
            return {
                content: [{
                        type: 'text',
                        text: `✅ ${result.message || 'Operation completed successfully'}`
                    }]
            };
        }
    };
    return CreateCinemachineVirtualCameraTool = _classThis;
})();
export { CreateCinemachineVirtualCameraTool };
