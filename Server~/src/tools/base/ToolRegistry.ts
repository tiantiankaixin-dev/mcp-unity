import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpUnity } from '../../unity/mcpUnity.js';
import { Logger } from '../../utils/logger.js';
import { BaseTool } from './BaseTool.js';

/**
 * Metadata about a tool
 */
export interface ToolMetadata {
  name: string;
  description: string;
  category: string;
  version?: string;
  deprecated?: boolean;
  tags?: string[];
  serverOnly?: boolean;
}

/**
 * Constructor type for tool classes
 */
export interface ToolConstructor {
  new (server: McpServer, mcpUnity: McpUnity, logger: Logger): BaseTool;
  metadata?: ToolMetadata;
}

/**
 * Central registry for all MCP tools
 * Handles automatic tool discovery and registration
 */
export class ToolRegistry {
  private static tools: Map<string, ToolConstructor> = new Map();
  private static categories: Map<string, Set<string>> = new Map();

  /**
   * Register a tool class
   */
  static register(toolClass: ToolConstructor) {
    const instance = this.createTemporaryInstance(toolClass);
    const name = instance.name;
    const category = instance.category;

    // Store the tool
    this.tools.set(name, toolClass);

    // Update category index
    if (!this.categories.has(category)) {
      this.categories.set(category, new Set());
    }
    this.categories.get(category)!.add(name);

    // Don't log here - logging happens in BaseTool.register() when actually registered with MCP server
  }

  /**
   * Register all tools with the MCP server
   */
  static registerAll(server: McpServer, mcpUnity: McpUnity, logger: Logger): number {
    let successCount = 0;
    let failCount = 0;

    logger.info(`Registering ${this.tools.size} tools...`);

    for (const [name, ToolClass] of this.tools) {
      try {
        const tool = new ToolClass(server, mcpUnity, logger);
        tool.register();
        successCount++;
      } catch (error: any) {
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
  static getToolsByCategory(category: string): ToolConstructor[] {
    const toolNames = this.categories.get(category);
    if (!toolNames) {
      return [];
    }

    return Array.from(toolNames)
      .map(name => this.tools.get(name))
      .filter((tool): tool is ToolConstructor => tool !== undefined);
  }

  /**
   * Get all registered categories
   */
  static getCategories(): string[] {
    return Array.from(this.categories.keys()).sort();
  }

  /**
   * Get metadata for all tools
   */
  static getAllToolsMetadata(): ToolMetadata[] {
    const metadata: ToolMetadata[] = [];

    for (const [name, ToolClass] of this.tools) {
      try {
        const instance = this.createTemporaryInstance(ToolClass);
        metadata.push(instance.getMetadata());
      } catch (error) {
        // Silently ignore errors to avoid interfering with MCP protocol
      }
    }

    return metadata.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get a tool by name
   */
  static getTool(name: string): ToolConstructor | undefined {
    return this.tools.get(name);
  }

  /**
   * Check if a tool is registered
   */
  static hasTool(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Get count of registered tools
   */
  static getToolCount(): number {
    return this.tools.size;
  }

  /**
   * Get tools by tag
   */
  static getToolsByTag(tag: string): ToolConstructor[] {
    const tools: ToolConstructor[] = [];

    for (const [name, ToolClass] of this.tools) {
      try {
        const instance = this.createTemporaryInstance(ToolClass);
        if (instance.tags.includes(tag)) {
          tools.push(ToolClass);
        }
      } catch (error) {
        // Silently ignore errors to avoid interfering with MCP protocol
      }
    }

    return tools;
  }

  /**
   * Search tools by name or description
   */
  static searchTools(query: string): ToolMetadata[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllToolsMetadata().filter(tool =>
      tool.name.toLowerCase().includes(lowerQuery) ||
      tool.description.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get statistics about registered tools
   */
  static getStatistics() {
    const stats = {
      totalTools: this.tools.size,
      categories: this.categories.size,
      toolsByCategory: {} as Record<string, number>,
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
      } catch (error) {
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
  private static createTemporaryInstance(ToolClass: ToolConstructor): BaseTool {
    const mockServer = {} as McpServer;
    const mockMcpUnity = {} as McpUnity;
    const mockLogger = {
      debug: () => {},
      info: () => {},
      warn: () => {},
      error: () => {},
      log: () => {},
      isLoggingEnabled: () => true,
      isLoggingFileEnabled: () => false
    } as unknown as Logger;

    return new ToolClass(mockServer, mockMcpUnity, mockLogger);
  }

  /**
   * Generate a markdown documentation of all tools
   */
  static generateDocumentation(): string {
    const lines: string[] = [];

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
        } catch (error) {
          // Silently ignore errors to avoid interfering with MCP protocol
        }
      }

      lines.push('');
    }

    return lines.join('\n');
  }
}

