import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
export declare class PlayModeTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodObject<{
        action: z.ZodDefault<z.ZodOptional<z.ZodEnum<["enter", "play", "start", "exit", "stop", "pause", "step", "status"]>>>;
    }, "strip", z.ZodTypeAny, {
        action: "status" | "enter" | "play" | "start" | "exit" | "stop" | "pause" | "step";
    }, {
        action?: "status" | "enter" | "play" | "start" | "exit" | "stop" | "pause" | "step" | undefined;
    }>;
    get category(): string;
}
