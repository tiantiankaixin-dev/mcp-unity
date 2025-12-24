import { BaseTool, DataTool } from '../base/BaseTool.js';
import { DynamicToolManager } from '../base/DynamicToolManager.js';
/**
 * Base class for meta tools - eliminates code duplication
 */
export declare abstract class MetaToolBase extends BaseTool {
    get category(): string;
    /**
     * Get DynamicToolManager instance (cached)
     */
    protected getManager(): DynamicToolManager;
}
/**
 * Base class for data-returning meta tools
 */
export declare abstract class MetaDataToolBase extends DataTool {
    get category(): string;
    /**
     * Create tool instance with metadata
     */
    protected createToolInstance(ToolClass: any): {
        parameters?: any;
        name: any;
        description: any;
    };
    /**
     * Get all categories from registry
     */
    protected getCategories(): string[];
    /**
     * Get tools by category
     */
    protected getToolsByCategory(category: string): any[];
}
