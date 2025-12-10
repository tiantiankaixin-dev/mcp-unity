import { Logger } from '../utils/logger.js';
interface UnityRequest {
    id?: string;
    method: string;
    params: any;
}
export declare class McpUnity {
    private logger;
    private port;
    private host;
    private ws;
    private pendingRequests;
    private requestTimeout;
    private retryDelay;
    constructor(logger: Logger);
    /**
     * Start the Unity connection with retry mechanism
     * @param clientName Optional name of the MCP client connecting to Unity
     */
    start(clientName?: string): Promise<void>;
    /**
     * Reads our configuration file and sets parameters of the server based on them.
     */
    private parseAndSetConfig;
    /**
     * Connect to the Unity WebSocket
     * @param clientName Optional name of the MCP client connecting to Unity
     */
    private connect;
    /**
     * Handle messages received from Unity
     */
    private handleMessage;
    /**
     * Disconnect from Unity
     */
    private disconnect;
    /**
     * Tries to reconnect to Unity
     */
    private reconnect;
    /**
     * Stop the Unity connection
     */
    stop(): Promise<void>;
    /**
     * Send a request to the Unity server
     */
    sendRequest(request: UnityRequest): Promise<any>;
    /**
     * Check if connected to Unity
     * Only returns true if the connection is guaranteed to be active
     */
    get isConnected(): boolean;
    /**
     * Read the McpUnitySettings.json file and return its contents as a JSON object.
     * @returns a JSON object with the contents of the McpUnitySettings.json file.
     */
    private readConfigFileAsJson;
}
export {};
