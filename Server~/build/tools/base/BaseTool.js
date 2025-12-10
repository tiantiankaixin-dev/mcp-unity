import { UsageTracker } from '../../utils/UsageTracker.js';
/**
 * Base class for all MCP Unity tools
 * Provides common functionality for tool registration and execution
 */
export class BaseTool {
    server;
    mcpUnity;
    logger;
    constructor(server, mcpUnity, logger) {
        this.server = server;
        this.mcpUnity = mcpUnity;
        this.logger = logger;
    }
    /**
     * Optional: Category for grouping tools (e.g., 'scripting', 'physics')
     */
    get category() {
        return 'general';
    }
    /**
     * Optional: Version of the tool
     */
    get version() {
        return '1.0.0';
    }
    /**
     * Optional: Whether this tool is deprecated
     */
    get deprecated() {
        return false;
    }
    /**
     * Optional: Tags for searching and filtering
     */
    get tags() {
        return [];
    }
    /**
     * Register this tool with the MCP server
     */
    register() {
        if (this.deprecated) {
            this.logger.warn(`Tool ${this.name} is deprecated`);
        }
        // Get the input schema
        const schema = this.inputSchema;
        // Validate that the schema exists
        if (!schema) {
            this.logger.error(`Tool ${this.name} has no inputSchema defined`);
            throw new Error(`Tool ${this.name} has no inputSchema defined`);
        }
        // Extract the shape from the schema
        const schemaShape = this.extractSchemaShape(schema);
        // Optimize description: Add guidance to prompt for detailed info
        // This reduces token usage by ~70% while maintaining discoverability
        const optimizedDescription = `${this.description} 📖 unity_tool_discovery`;
        this.server.tool(this.name, optimizedDescription, schemaShape, async (params) => {
            try {
                // Get tracker instance
                const tracker = UsageTracker.getInstance(this.logger);
                // Check hierarchical workflow compliance
                const workflowCheck = tracker.checkHierarchicalWorkflow(this.name);
                // If workflow is not allowed, BLOCK execution and return error
                if (!workflowCheck.allowed) {
                    this.logger.warn(`Tool '${this.name}' execution BLOCKED due to workflow violation`);
                    return {
                        content: [{
                                type: 'text',
                                text: `🚫 TOOL EXECUTION BLOCKED\n\n${workflowCheck.warning || 'Hierarchical workflow not followed.'}`
                            }],
                        isError: true
                    };
                }
                // Record tool usage (only if allowed)
                tracker.recordToolUsage(this.name);
                // Execute the tool
                const result = await this.execute(params);
                // If there was a workflow warning (lighter violations), append it to the result
                if (workflowCheck.warning) {
                    // Prepend warning to the result
                    if (result.content && result.content.length > 0) {
                        const originalText = result.content[0].text || '';
                        result.content[0].text = `${workflowCheck.warning}\n\n${originalText}`;
                    }
                }
                return result;
            }
            catch (error) {
                this.logger.error(`Tool execution failed: ${this.name}`, error);
                throw error;
            }
        });
        // Use logger instead of console to avoid interfering with MCP protocol
        this.logger.info(`✓ Registered tool: ${this.name} (${this.category})`);
    }
    /**
     * Extract the shape from a Zod schema
     * Handles ZodObject, ZodEffects, and other schema types
     */
    extractSchemaShape(schema) {
        // Handle ZodObject (has .shape)
        if ('shape' in schema && schema.shape) {
            return schema.shape;
        }
        // Handle ZodEffects (from .refine(), has ._def.schema.shape)
        if ('_def' in schema && schema._def && 'schema' in schema._def) {
            const innerSchema = schema._def.schema;
            if ('shape' in innerSchema && innerSchema.shape) {
                return innerSchema.shape;
            }
        }
        // If no shape found, throw error
        this.logger.error(`Tool ${this.name} inputSchema has no accessible shape property`);
        throw new Error(`Tool ${this.name} inputSchema has no accessible shape property`);
    }
    /**
     * Execute the tool with the given arguments
     * This method handles the communication with Unity and error handling
     */
    async execute(args) {
        try {
            // Validate arguments
            const validatedArgs = this.inputSchema.parse(args);
            // Log execution
            this.logger.debug(`Executing tool: ${this.name}`, validatedArgs);
            // Pre-execution hook
            await this.beforeExecute(validatedArgs);
            // Send request to Unity
            const result = await this.mcpUnity.sendRequest({
                method: this.name,
                params: validatedArgs
            });
            // Post-execution hook
            await this.afterExecute(validatedArgs, result);
            // Format success response
            return this.formatSuccessResponse(result);
        }
        catch (error) {
            this.logger.error(`Error in ${this.name}:`, error);
            return this.formatErrorResponse(error);
        }
    }
    /**
     * Hook called before executing the tool
     * Override this to add custom pre-execution logic
     */
    async beforeExecute(args) {
        // Default: do nothing
    }
    /**
     * Hook called after successful execution
     * Override this to add custom post-execution logic
     */
    async afterExecute(args, result) {
        // Default: do nothing
    }
    /**
     * Format a successful response
     * Override this to customize success response formatting
     */
    formatSuccessResponse(result) {
        return {
            content: [{
                    type: 'text',
                    text: `✅ ${result.message || 'Operation completed successfully'}`
                }]
        };
    }
    /**
     * Format an error response
     * Override this to customize error response formatting
     */
    formatErrorResponse(error) {
        const errorMessage = error.message || 'Unknown error occurred';
        return {
            content: [{
                    type: 'text',
                    text: `❌ Error: ${errorMessage}`
                }],
            isError: true
        };
    }
    /**
     * Get metadata about this tool
     */
    getMetadata() {
        return {
            name: this.name,
            description: this.description,
            category: this.category,
            version: this.version,
            deprecated: this.deprecated,
            tags: this.tags,
            schema: this.inputSchema
        };
    }
    /**
     * Validate input arguments without executing
     * Useful for testing
     */
    validateInput(args) {
        try {
            this.inputSchema.parse(args);
            return { valid: true };
        }
        catch (error) {
            return { valid: false, error: error.message };
        }
    }
    /**
     * Execute the tool with mock Unity connection (for testing)
     * Override this in tests to provide mock responses
     */
    async executeWithMock(args, mockResponse) {
        const originalSendRequest = this.mcpUnity.sendRequest;
        // Temporarily replace sendRequest with mock
        this.mcpUnity.sendRequest = async () => mockResponse;
        try {
            return await this.execute(args);
        }
        finally {
            // Restore original sendRequest
            this.mcpUnity.sendRequest = originalSendRequest;
        }
    }
}
/**
 * Base class for tools that return structured data
 */
export class DataTool extends BaseTool {
    formatSuccessResponse(result) {
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                }]
        };
    }
}
/**
 * Base class for tools that perform batch operations
 */
export class BatchTool extends BaseTool {
    formatSuccessResponse(result) {
        const { success, failed, total } = result;
        return {
            content: [{
                    type: 'text',
                    text: `✅ Batch operation completed: ${success}/${total} succeeded, ${failed} failed`
                }]
        };
    }
}
/**
 * Base class for tools that create GameObjects
 * Automatically includes instanceId and other metadata in the response
 */
export class GameObjectCreationTool extends BaseTool {
    formatSuccessResponse(result) {
        const message = `✅ ${result.message || 'GameObject created successfully'}`;
        // Build metadata section if instanceId is present
        let metadata = '';
        if (result.instanceId) {
            metadata = '\n\n**GameObject Details:**';
            if (result.objectName || result.toggleName || result.buttonName ||
                result.panelName || result.imageName || result.textName ||
                result.sliderName || result.dropdownName || result.inputFieldName ||
                result.scrollViewName || result.particleName || result.windZoneName) {
                const name = result.objectName || result.toggleName || result.buttonName ||
                    result.panelName || result.imageName || result.textName ||
                    result.sliderName || result.dropdownName || result.inputFieldName ||
                    result.scrollViewName || result.particleName || result.windZoneName;
                metadata += `\n- Name: ${name}`;
            }
            metadata += `\n- Instance ID: ${result.instanceId}`;
            if (result.position) {
                metadata += `\n- Position: ${result.position}`;
            }
            if (result.size) {
                metadata += `\n- Size: ${result.size}`;
            }
            metadata += `\n\n💡 Tip: Use \`instanceId=${result.instanceId}\` for operations like \`change_material_color\`, \`set_active_state\`, etc.`;
        }
        return {
            content: [{
                    type: 'text',
                    text: message + metadata
                }]
        };
    }
}
