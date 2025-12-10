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
import { Tool } from '../base/ToolDecorators.js';
import { ParamResolver } from '../../utils/paramResolver.js';
/**
 * 单个步骤的Schema定义
 */
const ChainStepSchema = z.object({
    step: z
        .string()
        .describe('Unique identifier for this step, used to reference its output in subsequent steps'),
    tool: z
        .string()
        .describe('Name of the Unity tool to execute'),
    params: z
        .record(z.any())
        .optional()
        .describe('Static parameters to pass to the tool'),
    params_mapping: z
        .record(z.any())
        .optional()
        .describe('Dynamic parameters with JSONPath references to previous step outputs. Use $.stepName.fieldName syntax')
});
/**
 * 链式执行器的输入Schema
 */
const ChainExecutorArgsSchema = z.object({
    chain: z
        .array(ChainStepSchema)
        .min(1)
        .max(20)
        .describe('Array of tool execution steps. Each step can reference outputs from previous steps using JSONPath syntax ($.stepName.fieldName)')
});
/**
 * ChainExecutorTool - 链式工具执行器
 *
 * 允许AI一次性定义多个工具的调用链，MCP服务器自动按顺序执行。
 * 前一个工具的输出可以通过JSONPath语法映射到下一个工具的输入参数。
 *
 * **核心优势**：
 * - 减少AI与MCP之间的往返次数，节省60-70% token
 * - 前序步骤的结果自动传递，无需AI再次处理
 * - 错误时立即停止，返回已执行结果
 *
 * **参数映射语法**：
 * - 静态值: 直接写值，如 `"primitiveType": "cube"`
 * - 动态值: 使用JSONPath，如 `"instanceId": "$.step1.instanceId"`
 *
 * **使用示例**：
 * ```json
 * {
 *   "chain": [
 *     {
 *       "step": "create",
 *       "tool": "create_primitive_object",
 *       "params": { "primitiveType": "cube", "posY": 1 }
 *     },
 *     {
 *       "step": "color",
 *       "tool": "change_material_color",
 *       "params_mapping": {
 *         "instanceId": "$.create.instanceId",
 *         "colorR": 1.0,
 *         "colorG": 0.0,
 *         "colorB": 0.0
 *       }
 *     },
 *     {
 *       "step": "physics",
 *       "tool": "add_rigidbody",
 *       "params_mapping": {
 *         "instanceId": "$.create.instanceId",
 *         "mass": 2.0
 *       }
 *     }
 *   ]
 * }
 * ```
 */
let ChainExecutorTool = (() => {
    let _classDecorators = [Tool({
            name: 'execute_tool_chain',
            description: 'Execute multiple Unity tools in sequence with automatic parameter passing between steps. Use JSONPath ($.stepName.field) to reference previous outputs. Stops on first error.',
            category: 'meta',
            version: '1.0.0'
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseTool;
    var ChainExecutorTool = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ChainExecutorTool = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        get name() {
            return 'execute_tool_chain';
        }
        get description() {
            return 'Execute a chain of Unity tools with automatic parameter passing. Use $.stepName.field to reference previous step outputs.';
        }
        get inputSchema() {
            return ChainExecutorArgsSchema;
        }
        get category() {
            return 'meta';
        }
        /**
         * 执行工具链
         */
        async execute(args) {
            const { chain } = args;
            const startTime = Date.now();
            // 存储每个步骤的执行结果
            const context = {};
            const stepDetails = [];
            this.logger.info(`[ChainExecutor] Starting chain execution with ${chain.length} steps`);
            // 预验证：检查步骤名称唯一性
            const stepNames = new Set();
            for (const step of chain) {
                if (stepNames.has(step.step)) {
                    return this.formatChainError(`Duplicate step name: '${step.step}'`, chain.length, 0, [], Date.now() - startTime);
                }
                stepNames.add(step.step);
            }
            // 顺序执行每个步骤
            for (let i = 0; i < chain.length; i++) {
                const step = chain[i];
                const stepStartTime = Date.now();
                this.logger.info(`[ChainExecutor] Step ${i + 1}/${chain.length}: ${step.step} -> ${step.tool}`);
                try {
                    // 1. 验证参数映射引用的步骤是否存在
                    if (step.params_mapping) {
                        const availableSteps = Object.keys(context);
                        const validation = ParamResolver.validate(step.params_mapping, availableSteps);
                        if (!validation.valid) {
                            throw new Error(`Parameter mapping error: ${validation.errors.join('; ')}`);
                        }
                    }
                    // 2. 解析参数：合并静态参数和映射参数
                    const staticParams = step.params || {};
                    const mappedParams = ParamResolver.resolve(step.params_mapping, context);
                    const finalParams = { ...staticParams, ...mappedParams };
                    this.logger.debug(`[ChainExecutor] Resolved params for ${step.tool}:`, finalParams);
                    // 3. 调用Unity执行工具
                    const result = await this.mcpUnity.sendRequest({
                        method: step.tool,
                        params: finalParams
                    });
                    // 4. 存储结果到context
                    context[step.step] = result;
                    const stepDuration = Date.now() - stepStartTime;
                    stepDetails.push({
                        step: step.step,
                        tool: step.tool,
                        success: true,
                        result: result,
                        duration_ms: stepDuration
                    });
                    this.logger.info(`[ChainExecutor] Step '${step.step}' completed in ${stepDuration}ms`);
                }
                catch (error) {
                    // 错误处理：立即停止，返回已执行结果
                    const stepDuration = Date.now() - stepStartTime;
                    const errorMessage = error?.message || String(error);
                    stepDetails.push({
                        step: step.step,
                        tool: step.tool,
                        success: false,
                        error: errorMessage,
                        duration_ms: stepDuration
                    });
                    this.logger.error(`[ChainExecutor] Step '${step.step}' failed: ${errorMessage}`);
                    return this.formatChainResult({
                        success: false,
                        total_steps: chain.length,
                        completed_steps: i,
                        failed_step: step.step,
                        error: errorMessage,
                        results: context,
                        step_details: stepDetails,
                        total_duration_ms: Date.now() - startTime
                    });
                }
            }
            // 全部成功
            const totalDuration = Date.now() - startTime;
            this.logger.info(`[ChainExecutor] Chain completed successfully in ${totalDuration}ms`);
            return this.formatChainResult({
                success: true,
                total_steps: chain.length,
                completed_steps: chain.length,
                results: context,
                step_details: stepDetails,
                total_duration_ms: totalDuration
            });
        }
        /**
         * 格式化链式执行结果
         */
        formatChainResult(result) {
            const statusIcon = result.success ? '✅' : '❌';
            const statusText = result.success ? 'Chain completed successfully' : `Chain failed at step '${result.failed_step}'`;
            // 构建步骤摘要
            const stepSummary = result.step_details.map((s, i) => {
                const icon = s.success ? '✓' : '✗';
                const status = s.success ? 'OK' : `FAILED: ${s.error}`;
                return `  ${i + 1}. [${icon}] ${s.step} (${s.tool}) - ${status} [${s.duration_ms}ms]`;
            }).join('\n');
            // 构建输出文本
            let text = `${statusIcon} ${statusText}\n\n`;
            text += `**Execution Summary:**\n`;
            text += `- Total Steps: ${result.total_steps}\n`;
            text += `- Completed: ${result.completed_steps}\n`;
            text += `- Duration: ${result.total_duration_ms}ms\n\n`;
            text += `**Step Details:**\n${stepSummary}\n\n`;
            // 添加结果数据（精简格式）
            text += `**Results:**\n`;
            text += '```json\n';
            text += JSON.stringify(result.results, null, 2);
            text += '\n```';
            if (!result.success && result.error) {
                text += `\n\n**Error:** ${result.error}`;
            }
            return {
                content: [{
                        type: 'text',
                        text: text
                    }],
                isError: !result.success
            };
        }
        /**
         * 格式化链式执行错误（用于预验证失败）
         */
        formatChainError(error, totalSteps, completedSteps, stepDetails, durationMs) {
            return this.formatChainResult({
                success: false,
                total_steps: totalSteps,
                completed_steps: completedSteps,
                error: error,
                results: {},
                step_details: stepDetails,
                total_duration_ms: durationMs
            });
        }
    };
    return ChainExecutorTool = _classThis;
})();
export { ChainExecutorTool };
