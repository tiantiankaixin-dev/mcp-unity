/**
 * Central registry for all MCP tools
 * Handles automatic tool discovery and registration
 */
export class ToolRegistry {
    static tools = new Map();
    static categories = new Map();
    /**
     * Register a tool class
     */
    static register(toolClass) {
        const instance = this.createTemporaryInstance(toolClass);
        const name = instance.name;
        const category = instance.category;
        // Store the tool
        this.tools.set(name, toolClass);
        // Update category index
        if (!this.categories.has(category)) {
            this.categories.set(category, new Set());
        }
        this.categories.get(category).add(name);
        // Don't log here - logging happens in BaseTool.register() when actually registered with MCP server
    }
    /**
     * Register all tools with the MCP server
     */
    static registerAll(server, mcpUnity, logger) {
        let successCount = 0;
        let failCount = 0;
        logger.info(`Registering ${this.tools.size} tools...`);
        for (const [name, ToolClass] of this.tools) {
            try {
                const tool = new ToolClass(server, mcpUnity, logger);
                tool.register();
                successCount++;
            }
            catch (error) {
                logger.error(`Failed to register tool ${name}:`, error);
                failCount++;
            }
        }
        logger.info(`✅ Registered ${successCount} tools successfully`);
        if (failCount > 0) {
            logger.warn(`⚠️  Failed to register ${failCount} tools`);
        }
        return successCount;
    }
    /**
     * Get all tools in a specific category
     */
    static getToolsByCategory(category) {
        const toolNames = this.categories.get(category);
        if (!toolNames) {
            return [];
        }
        return Array.from(toolNames)
            .map(name => this.tools.get(name))
            .filter((tool) => tool !== undefined);
    }
    /**
     * Get all registered categories
     */
    static getCategories() {
        return Array.from(this.categories.keys()).sort();
    }
    /**
     * Get metadata for all tools
     */
    static getAllToolsMetadata() {
        const metadata = [];
        for (const [name, ToolClass] of this.tools) {
            try {
                const instance = this.createTemporaryInstance(ToolClass);
                metadata.push(instance.getMetadata());
            }
            catch (error) {
                // Silently ignore errors to avoid interfering with MCP protocol
            }
        }
        return metadata.sort((a, b) => a.name.localeCompare(b.name));
    }
    /**
     * Get a tool by name
     */
    static getTool(name) {
        return this.tools.get(name);
    }
    /**
     * Check if a tool is registered
     */
    static hasTool(name) {
        return this.tools.has(name);
    }
    /**
     * Get count of registered tools
     */
    static getToolCount() {
        return this.tools.size;
    }
    /**
     * Get tools by tag
     */
    static getToolsByTag(tag) {
        const tools = [];
        for (const [name, ToolClass] of this.tools) {
            try {
                const instance = this.createTemporaryInstance(ToolClass);
                if (instance.tags.includes(tag)) {
                    tools.push(ToolClass);
                }
            }
            catch (error) {
                // Silently ignore errors to avoid interfering with MCP protocol
            }
        }
        return tools;
    }
    /**
     * Search tools by name or description
     */
    static searchTools(query) {
        const lowerQuery = query.toLowerCase();
        return this.getAllToolsMetadata().filter(tool => tool.name.toLowerCase().includes(lowerQuery) ||
            tool.description.toLowerCase().includes(lowerQuery));
    }
    /**
     * Get statistics about registered tools
     */
    static getStatistics() {
        const stats = {
            totalTools: this.tools.size,
            categories: this.categories.size,
            toolsByCategory: {},
            deprecatedTools: 0
        };
        for (const [category, tools] of this.categories) {
            stats.toolsByCategory[category] = tools.size;
        }
        for (const [name, ToolClass] of this.tools) {
            try {
                const instance = this.createTemporaryInstance(ToolClass);
                if (instance.deprecated) {
                    stats.deprecatedTools++;
                }
            }
            catch (error) {
                // Ignore errors
            }
        }
        return stats;
    }
    /**
     * Clear all registered tools (useful for testing)
     */
    static clear() {
        this.tools.clear();
        this.categories.clear();
    }
    /**
     * Create a temporary instance for metadata extraction
     * Uses a mock server, mcpUnity, and logger
     */
    static createTemporaryInstance(ToolClass) {
        const mockServer = {};
        const mockMcpUnity = {};
        const mockLogger = {
            debug: () => { },
            info: () => { },
            warn: () => { },
            error: () => { },
            log: () => { },
            isLoggingEnabled: () => true,
            isLoggingFileEnabled: () => false
        };
        return new ToolClass(mockServer, mockMcpUnity, mockLogger);
    }
    /**
     * Generate a markdown documentation of all tools
     */
    static generateDocumentation() {
        const lines = [];
        lines.push('# MCP Unity Tools Documentation\n');
        lines.push(`Total Tools: ${this.tools.size}\n`);
        lines.push('---\n');
        for (const category of this.getCategories()) {
            const tools = this.getToolsByCategory(category);
            lines.push(`## ${category.charAt(0).toUpperCase() + category.slice(1)}\n`);
            for (const ToolClass of tools) {
                try {
                    const instance = this.createTemporaryInstance(ToolClass);
                    const metadata = instance.getMetadata();
                    lines.push(`### ${metadata.name}\n`);
                    lines.push(`**Description:** ${metadata.description}\n`);
                    lines.push(`**Version:** ${metadata.version}\n`);
                    if (metadata.deprecated) {
                        lines.push(`**Status:** ⚠️ DEPRECATED\n`);
                    }
                    if (metadata.tags && metadata.tags.length > 0) {
                        lines.push(`**Tags:** ${metadata.tags.join(', ')}\n`);
                    }
                    lines.push('');
                }
                catch (error) {
                    // Silently ignore errors to avoid interfering with MCP protocol
                }
            }
            lines.push('');
        }
        return lines.join('\n');
    }
}
