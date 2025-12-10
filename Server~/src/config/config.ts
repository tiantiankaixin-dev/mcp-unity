import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface ServerConfig {
  // Unity connection settings
  unity: {
    host: string;
    port: number;
    reconnectDelay: number;
    requestTimeout: number;
  };

  // Logging settings
  logging: {
    level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
    enableFileLogging: boolean;
    logFilePath?: string;
  };

  // Feature flags
  features: {
    enableMetrics: boolean;
    enableAutoReconnect: boolean;
  };
}

export const DEFAULT_CONFIG: ServerConfig = {
  unity: {
    host: 'localhost',
    port: 8090,
    reconnectDelay: 5000,
    requestTimeout: 30000,
  },
  logging: {
    level: 'INFO',
    enableFileLogging: false,
  },
  features: {
    enableMetrics: false,
    enableAutoReconnect: true,
  },
};

export class ConfigManager {
  private config: ServerConfig;
  private configPath: string;

  constructor(configPath?: string) {
    this.configPath = configPath || join(__dirname, '../../config.json');
    this.config = this.loadConfig();
  }

  /**
   * Load configuration from file or use defaults
   */
  private loadConfig(): ServerConfig {
    try {
      if (existsSync(this.configPath)) {
        const fileContent = readFileSync(this.configPath, 'utf-8');
        const loadedConfig = JSON.parse(fileContent);
        
        // Merge with defaults to ensure all fields exist
        return this.mergeWithDefaults(loadedConfig);
      }
    } catch (error) {
      console.warn(`Failed to load config from ${this.configPath}, using defaults:`, error);
    }

    return { ...DEFAULT_CONFIG };
  }

  /**
   * Merge loaded config with defaults
   */
  private mergeWithDefaults(loadedConfig: Partial<ServerConfig>): ServerConfig {
    return {
      unity: {
        ...DEFAULT_CONFIG.unity,
        ...loadedConfig.unity,
      },
      logging: {
        ...DEFAULT_CONFIG.logging,
        ...loadedConfig.logging,
      },
      features: {
        ...DEFAULT_CONFIG.features,
        ...loadedConfig.features,
      },
    };
  }

  /**
   * Save current configuration to file
   */
  saveConfig(): void {
    try {
      writeFileSync(this.configPath, JSON.stringify(this.config, null, 2), 'utf-8');
      console.log(`Configuration saved to ${this.configPath}`);
    } catch (error) {
      console.error(`Failed to save config to ${this.configPath}:`, error);
      throw error;
    }
  }

  /**
   * Get the current configuration
   */
  getConfig(): ServerConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<ServerConfig>): void {
    this.config = this.mergeWithDefaults({ ...this.config, ...updates });
  }

  /**
   * Get configuration from environment variables
   */
  static fromEnvironment(): ServerConfig {
    const config = { ...DEFAULT_CONFIG };

    // Unity settings
    if (process.env.UNITY_HOST) {
      config.unity.host = process.env.UNITY_HOST;
    }
    if (process.env.UNITY_PORT) {
      config.unity.port = parseInt(process.env.UNITY_PORT, 10);
    }

    // Logging settings
    if (process.env.LOG_LEVEL) {
      config.logging.level = process.env.LOG_LEVEL as 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
    }

    return config;
  }

  /**
   * Create a default config file
   */
  static createDefaultConfigFile(path?: string): void {
    const configPath = path || join(__dirname, '../../config.json');
    try {
      writeFileSync(configPath, JSON.stringify(DEFAULT_CONFIG, null, 2), 'utf-8');
      console.log(`Default configuration created at ${configPath}`);
    } catch (error) {
      console.error(`Failed to create default config at ${configPath}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const configManager = new ConfigManager();

