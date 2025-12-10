import { JSONPath } from 'jsonpath-plus';
/**
 * 参数映射解析器
 * 用于解析链式调用中的参数映射规则
 *
 * 支持的映射语法：
 * - 静态值: 直接使用，如 1.0, "hello", true
 * - JSONPath: 以 $ 开头，如 $.step1.instanceId, $.step1.results[0].path
 */
export class ParamResolver {
    /**
     * 解析参数映射，将映射规则转换为实际参数值
     *
     * @param paramsMapping 参数映射定义（可能包含JSONPath表达式）
     * @param context 上下文对象，包含前序步骤的执行结果
     * @returns 解析后的实际参数对象
     */
    static resolve(paramsMapping, context) {
        if (!paramsMapping) {
            return {};
        }
        const resolved = {};
        for (const [key, value] of Object.entries(paramsMapping)) {
            let resolvedValue = this.resolveValue(value, context);
            // ✅ Auto-wrap: if param name ends with "Ids" and value is not array, wrap it
            // This fixes common mistake: instanceIds: "$.0.instanceId" → instanceIds: [-123]
            if (key.endsWith('Ids') && !Array.isArray(resolvedValue) && resolvedValue !== null && resolvedValue !== undefined) {
                resolvedValue = [resolvedValue];
            }
            resolved[key] = resolvedValue;
        }
        return resolved;
    }
    /**
     * 解析单个值
     *
     * @param value 待解析的值（可能是JSONPath表达式或静态值）
     * @param context 上下文对象
     * @returns 解析后的实际值
     */
    static resolveValue(value, context) {
        // 如果是字符串且以 $ 开头，视为JSONPath表达式
        if (typeof value === 'string' && value.startsWith('$')) {
            return this.resolveJsonPath(value, context);
        }
        // 如果是数组，递归解析每个元素
        if (Array.isArray(value)) {
            return value.map(item => this.resolveValue(item, context));
        }
        // 如果是对象，递归解析每个属性
        if (value !== null && typeof value === 'object') {
            const resolved = {};
            for (const [k, v] of Object.entries(value)) {
                resolved[k] = this.resolveValue(v, context);
            }
            return resolved;
        }
        // 静态值直接返回
        return value;
    }
    /**
     * 解析JSONPath表达式
     *
     * @param expression JSONPath表达式，如 $.step1.instanceId
     * @param context 上下文对象
     * @returns 解析结果
     */
    static resolveJsonPath(expression, context) {
        try {
            // JSONPath-plus 需要从根对象查询
            // 我们的表达式格式: $.stepName.field
            // 需要将 context 作为根对象
            const results = JSONPath({
                path: expression,
                json: context,
                wrap: false // 单个结果时不包装成数组
            });
            if (results === undefined) {
                throw new Error(`JSONPath expression '${expression}' returned no results`);
            }
            return results;
        }
        catch (error) {
            throw new Error(`Failed to resolve JSONPath '${expression}': ${error.message}`);
        }
    }
    /**
     * 验证参数映射中的JSONPath表达式是否有效
     *
     * @param paramsMapping 参数映射定义
     * @param availableSteps 当前可用的步骤名称列表
     * @returns 验证结果
     */
    static validate(paramsMapping, availableSteps) {
        if (!paramsMapping) {
            return { valid: true, errors: [] };
        }
        const errors = [];
        for (const [key, value] of Object.entries(paramsMapping)) {
            this.validateValue(value, availableSteps, key, errors);
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
    /**
     * 验证单个值
     */
    static validateValue(value, availableSteps, path, errors) {
        if (typeof value === 'string' && value.startsWith('$')) {
            // 提取步骤名称: $.stepName.xxx -> stepName
            const match = value.match(/^\$\.(\w+)/);
            if (match) {
                const stepName = match[1];
                if (!availableSteps.includes(stepName)) {
                    errors.push(`Parameter '${path}': references unknown step '${stepName}'. ` +
                        `Available steps: ${availableSteps.join(', ')}`);
                }
            }
        }
        else if (Array.isArray(value)) {
            value.forEach((item, index) => {
                this.validateValue(item, availableSteps, `${path}[${index}]`, errors);
            });
        }
        else if (value !== null && typeof value === 'object') {
            for (const [k, v] of Object.entries(value)) {
                this.validateValue(v, availableSteps, `${path}.${k}`, errors);
            }
        }
    }
}
