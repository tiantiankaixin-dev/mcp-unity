export interface ServerConfig {
    unity: {
        host: string;
        port: number;
        reconnectDelay: number;
        requestTimeout: number;
    };
    logging: {
        level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
        enableFileLogging: boolean;
        logFilePath?: string;
    };
    features: {
        enableMetrics: boolean;
        enableAutoReconnect: boolean;
    };
}
export declare const DEFAULT_CONFIG: ServerConfig;
export declare class ConfigManager {
    private config;
    private configPath;
    constructor(configPath?: string);
    /**
     * Load configuration from file or use defaults
     */
    private loadConfig;
    /**
     * Merge loaded config with defaults
     */
    private mergeWithDefaults;
    /**
     * Save current configuration to file
     */
    saveConfig(): void;
    /**
     * Get the current configuration
     */
    getConfig(): ServerConfig;
    /**
     * Update configuration
     */
    updateConfig(updates: Partial<ServerConfig>): void;
    /**
     * Get configuration from environment variables
     */
    static fromEnvironment(): ServerConfig;
    /**
     * Create a default config file
     */
    static createDefaultConfigFile(path?: string): void;
}
export declare const configManager: ConfigManager;
