/**
 * 参数映射解析器
 * 用于解析链式调用中的参数映射规则
 *
 * 支持的映射语法：
 * - 静态值: 直接使用，如 1.0, "hello", true
 * - JSONPath: 以 $ 开头，如 $.step1.instanceId, $.step1.results[0].path
 */
export declare class ParamResolver {
    /**
     * 解析参数映射，将映射规则转换为实际参数值
     *
     * @param paramsMapping 参数映射定义（可能包含JSONPath表达式）
     * @param context 上下文对象，包含前序步骤的执行结果
     * @returns 解析后的实际参数对象
     */
    static resolve(paramsMapping: Record<string, any> | undefined, context: Record<string, any>): Record<string, any>;
    /**
     * 解析单个值
     *
     * @param value 待解析的值（可能是JSONPath表达式或静态值）
     * @param context 上下文对象
     * @returns 解析后的实际值
     */
    private static resolveValue;
    /**
     * 解析JSONPath表达式
     *
     * @param expression JSONPath表达式，如 $.step1.instanceId
     * @param context 上下文对象
     * @returns 解析结果
     */
    private static resolveJsonPath;
    /**
     * 验证参数映射中的JSONPath表达式是否有效
     *
     * @param paramsMapping 参数映射定义
     * @param availableSteps 当前可用的步骤名称列表
     * @returns 验证结果
     */
    static validate(paramsMapping: Record<string, any> | undefined, availableSteps: string[]): {
        valid: boolean;
        errors: string[];
    };
    /**
     * 验证单个值
     */
    private static validateValue;
}
