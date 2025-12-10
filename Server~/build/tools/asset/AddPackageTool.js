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
import { McpUnityError, ErrorType } from '../../utils/errors.js';
/**
 * Tool for adding packages to Unity Package Manager
 *
 * Supports three sources: registry, github, and disk.
 *
 * Unity API: UnityEditor.PackageManager.Client.Add
 * C# Handler: Editor/Tools/AddPackageTool.cs
 *
 * @see https://docs.unity3d.com/ScriptReference/PackageManager.Client.Add.html
 *
 * @example
 * // Add from Unity Registry
 * { source: "registry", packageName: "com.unity.textmeshpro", version: "3.0.6" }
 *
 * @example
 * // Add from GitHub
 * { source: "github", repositoryUrl: "https://github.com/username/repo.git", branch: "main" }
 *
 * @example
 * // Add from disk
 * { source: "disk", path: "C:/MyPackages/com.mycompany.mypackage" }
 *
 * @category asset
 */
let AddPackageTool = (() => {
    let _classDecorators = [Tool({
            name: 'add_package',
            description: 'Adds packages into the Unity Package Manager',
            category: 'asset',
            version: '1.0.0'
        }), Tags(['unity', 'asset', 'package', 'package-manager'])];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseTool;
    var AddPackageTool = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AddPackageTool = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        get name() {
            return 'add_package';
        }
        get description() {
            return 'Adds packages into the Unity Package Manager';
        }
        get category() {
            return 'asset';
        }
        get inputSchema() {
            return z.object({
                source: z.string().describe('The source to use (registry, github, or disk) to add the package'),
                packageName: z.string().optional().describe('The package name to add from Unity registry (e.g. com.unity.textmeshpro)'),
                version: z.string().optional().describe('The version to use for registry packages (optional)'),
                repositoryUrl: z.string().optional().describe('The GitHub repository URL (e.g. https://github.com/username/repo.git)'),
                branch: z.string().optional().describe('The branch to use for GitHub packages (optional)'),
                path: z.string().optional().describe('The path to use (folder path for disk method or subfolder for GitHub)')
            });
        }
        /**
         * Custom execution logic preserved from legacy implementation
         * Validates required parameters based on source type
         */
        async execute(args) {
            try {
                // Validate arguments
                const validatedArgs = this.inputSchema.parse(args);
                const { source, packageName, version, repositoryUrl, branch, path } = validatedArgs;
                // Validate required parameters based on source
                if (source === 'registry' && !packageName) {
                    throw new McpUnityError(ErrorType.VALIDATION, 'Required parameter "packageName" not provided for registry source');
                }
                else if (source === 'github' && !repositoryUrl) {
                    throw new McpUnityError(ErrorType.VALIDATION, 'Required parameter "repositoryUrl" not provided for github source');
                }
                else if (source === 'disk' && !path) {
                    throw new McpUnityError(ErrorType.VALIDATION, 'Required parameter "path" not provided for disk source');
                }
                this.logger.debug(`Executing ${this.name}`, { source, packageName, repositoryUrl, path });
                // Send request to Unity
                const response = await this.mcpUnity.sendRequest({
                    method: this.name,
                    params: validatedArgs
                });
                // Check if execution was successful
                if (!response.success) {
                    throw new McpUnityError(ErrorType.TOOL_EXECUTION, response.message || `Failed to manage package with source: ${source}`);
                }
                // Return formatted response with custom type
                return {
                    content: [{
                            type: response.type || 'text',
                            text: response.message
                        }]
                };
            }
            catch (error) {
                this.logger.error(`Error in ${this.name}:`, error);
                // Preserve error type if it's already a McpUnityError
                if (error instanceof McpUnityError) {
                    throw error;
                }
                return this.formatErrorResponse(error);
            }
        }
    };
    return AddPackageTool = _classThis;
})();
export { AddPackageTool };
