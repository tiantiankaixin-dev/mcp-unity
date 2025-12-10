import { z } from 'zod';
import { BaseTool } from '../base/BaseTool.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
export declare class AddAnimationTransitionTool extends BaseTool {
    get name(): string;
    get description(): string;
    get inputSchema(): z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodObject<{
        animatorControllerPath: z.ZodOptional<z.ZodString>;
        controllerPath: z.ZodOptional<z.ZodString>;
        fromState: z.ZodOptional<z.ZodString>;
        sourceStateName: z.ZodOptional<z.ZodString>;
        toState: z.ZodOptional<z.ZodString>;
        destinationStateName: z.ZodOptional<z.ZodString>;
        layerIndex: z.ZodDefault<z.ZodNumber>;
        hasExitTime: z.ZodDefault<z.ZodBoolean>;
        exitTime: z.ZodDefault<z.ZodNumber>;
        duration: z.ZodDefault<z.ZodNumber>;
        offset: z.ZodDefault<z.ZodNumber>;
        interruptionSource: z.ZodDefault<z.ZodEnum<["None", "Source", "Destination", "SourceThenDestination", "DestinationThenSource"]>>;
        orderedInterruption: z.ZodDefault<z.ZodBoolean>;
        canTransitionToSelf: z.ZodDefault<z.ZodBoolean>;
        conditions: z.ZodOptional<z.ZodArray<z.ZodObject<{
            parameter: z.ZodString;
            mode: z.ZodEnum<["If", "IfNot", "Greater", "Less", "Equals", "NotEqual"]>;
            threshold: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodBoolean, z.ZodString]>>;
        }, "strip", z.ZodTypeAny, {
            parameter: string;
            mode: "If" | "IfNot" | "Greater" | "Less" | "Equals" | "NotEqual";
            threshold?: string | number | boolean | undefined;
        }, {
            parameter: string;
            mode: "If" | "IfNot" | "Greater" | "Less" | "Equals" | "NotEqual";
            threshold?: string | number | boolean | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        offset: number;
        layerIndex: number;
        hasExitTime: boolean;
        exitTime: number;
        duration: number;
        interruptionSource: "None" | "Source" | "Destination" | "SourceThenDestination" | "DestinationThenSource";
        orderedInterruption: boolean;
        canTransitionToSelf: boolean;
        fromState?: string | undefined;
        sourceStateName?: string | undefined;
        toState?: string | undefined;
        destinationStateName?: string | undefined;
        controllerPath?: string | undefined;
        animatorControllerPath?: string | undefined;
        conditions?: {
            parameter: string;
            mode: "If" | "IfNot" | "Greater" | "Less" | "Equals" | "NotEqual";
            threshold?: string | number | boolean | undefined;
        }[] | undefined;
    }, {
        offset?: number | undefined;
        fromState?: string | undefined;
        sourceStateName?: string | undefined;
        toState?: string | undefined;
        destinationStateName?: string | undefined;
        controllerPath?: string | undefined;
        animatorControllerPath?: string | undefined;
        layerIndex?: number | undefined;
        hasExitTime?: boolean | undefined;
        exitTime?: number | undefined;
        duration?: number | undefined;
        interruptionSource?: "None" | "Source" | "Destination" | "SourceThenDestination" | "DestinationThenSource" | undefined;
        orderedInterruption?: boolean | undefined;
        canTransitionToSelf?: boolean | undefined;
        conditions?: {
            parameter: string;
            mode: "If" | "IfNot" | "Greater" | "Less" | "Equals" | "NotEqual";
            threshold?: string | number | boolean | undefined;
        }[] | undefined;
    }>, {
        offset: number;
        layerIndex: number;
        hasExitTime: boolean;
        exitTime: number;
        duration: number;
        interruptionSource: "None" | "Source" | "Destination" | "SourceThenDestination" | "DestinationThenSource";
        orderedInterruption: boolean;
        canTransitionToSelf: boolean;
        fromState?: string | undefined;
        sourceStateName?: string | undefined;
        toState?: string | undefined;
        destinationStateName?: string | undefined;
        controllerPath?: string | undefined;
        animatorControllerPath?: string | undefined;
        conditions?: {
            parameter: string;
            mode: "If" | "IfNot" | "Greater" | "Less" | "Equals" | "NotEqual";
            threshold?: string | number | boolean | undefined;
        }[] | undefined;
    }, {
        offset?: number | undefined;
        fromState?: string | undefined;
        sourceStateName?: string | undefined;
        toState?: string | undefined;
        destinationStateName?: string | undefined;
        controllerPath?: string | undefined;
        animatorControllerPath?: string | undefined;
        layerIndex?: number | undefined;
        hasExitTime?: boolean | undefined;
        exitTime?: number | undefined;
        duration?: number | undefined;
        interruptionSource?: "None" | "Source" | "Destination" | "SourceThenDestination" | "DestinationThenSource" | undefined;
        orderedInterruption?: boolean | undefined;
        canTransitionToSelf?: boolean | undefined;
        conditions?: {
            parameter: string;
            mode: "If" | "IfNot" | "Greater" | "Less" | "Equals" | "NotEqual";
            threshold?: string | number | boolean | undefined;
        }[] | undefined;
    }>, {
        offset: number;
        layerIndex: number;
        hasExitTime: boolean;
        exitTime: number;
        duration: number;
        interruptionSource: "None" | "Source" | "Destination" | "SourceThenDestination" | "DestinationThenSource";
        orderedInterruption: boolean;
        canTransitionToSelf: boolean;
        fromState?: string | undefined;
        sourceStateName?: string | undefined;
        toState?: string | undefined;
        destinationStateName?: string | undefined;
        controllerPath?: string | undefined;
        animatorControllerPath?: string | undefined;
        conditions?: {
            parameter: string;
            mode: "If" | "IfNot" | "Greater" | "Less" | "Equals" | "NotEqual";
            threshold?: string | number | boolean | undefined;
        }[] | undefined;
    }, {
        offset?: number | undefined;
        fromState?: string | undefined;
        sourceStateName?: string | undefined;
        toState?: string | undefined;
        destinationStateName?: string | undefined;
        controllerPath?: string | undefined;
        animatorControllerPath?: string | undefined;
        layerIndex?: number | undefined;
        hasExitTime?: boolean | undefined;
        exitTime?: number | undefined;
        duration?: number | undefined;
        interruptionSource?: "None" | "Source" | "Destination" | "SourceThenDestination" | "DestinationThenSource" | undefined;
        orderedInterruption?: boolean | undefined;
        canTransitionToSelf?: boolean | undefined;
        conditions?: {
            parameter: string;
            mode: "If" | "IfNot" | "Greater" | "Less" | "Equals" | "NotEqual";
            threshold?: string | number | boolean | undefined;
        }[] | undefined;
    }>, {
        offset: number;
        layerIndex: number;
        hasExitTime: boolean;
        exitTime: number;
        duration: number;
        interruptionSource: "None" | "Source" | "Destination" | "SourceThenDestination" | "DestinationThenSource";
        orderedInterruption: boolean;
        canTransitionToSelf: boolean;
        fromState?: string | undefined;
        sourceStateName?: string | undefined;
        toState?: string | undefined;
        destinationStateName?: string | undefined;
        controllerPath?: string | undefined;
        animatorControllerPath?: string | undefined;
        conditions?: {
            parameter: string;
            mode: "If" | "IfNot" | "Greater" | "Less" | "Equals" | "NotEqual";
            threshold?: string | number | boolean | undefined;
        }[] | undefined;
    }, {
        offset?: number | undefined;
        fromState?: string | undefined;
        sourceStateName?: string | undefined;
        toState?: string | undefined;
        destinationStateName?: string | undefined;
        controllerPath?: string | undefined;
        animatorControllerPath?: string | undefined;
        layerIndex?: number | undefined;
        hasExitTime?: boolean | undefined;
        exitTime?: number | undefined;
        duration?: number | undefined;
        interruptionSource?: "None" | "Source" | "Destination" | "SourceThenDestination" | "DestinationThenSource" | undefined;
        orderedInterruption?: boolean | undefined;
        canTransitionToSelf?: boolean | undefined;
        conditions?: {
            parameter: string;
            mode: "If" | "IfNot" | "Greater" | "Less" | "Equals" | "NotEqual";
            threshold?: string | number | boolean | undefined;
        }[] | undefined;
    }>, {
        animatorControllerPath: string;
        fromState: string;
        toState: string;
        offset: number;
        layerIndex: number;
        hasExitTime: boolean;
        exitTime: number;
        duration: number;
        interruptionSource: "None" | "Source" | "Destination" | "SourceThenDestination" | "DestinationThenSource";
        orderedInterruption: boolean;
        canTransitionToSelf: boolean;
        sourceStateName?: string | undefined;
        destinationStateName?: string | undefined;
        controllerPath?: string | undefined;
        conditions?: {
            parameter: string;
            mode: "If" | "IfNot" | "Greater" | "Less" | "Equals" | "NotEqual";
            threshold?: string | number | boolean | undefined;
        }[] | undefined;
    }, {
        offset?: number | undefined;
        fromState?: string | undefined;
        sourceStateName?: string | undefined;
        toState?: string | undefined;
        destinationStateName?: string | undefined;
        controllerPath?: string | undefined;
        animatorControllerPath?: string | undefined;
        layerIndex?: number | undefined;
        hasExitTime?: boolean | undefined;
        exitTime?: number | undefined;
        duration?: number | undefined;
        interruptionSource?: "None" | "Source" | "Destination" | "SourceThenDestination" | "DestinationThenSource" | undefined;
        orderedInterruption?: boolean | undefined;
        canTransitionToSelf?: boolean | undefined;
        conditions?: {
            parameter: string;
            mode: "If" | "IfNot" | "Greater" | "Less" | "Equals" | "NotEqual";
            threshold?: string | number | boolean | undefined;
        }[] | undefined;
    }>;
    get category(): string;
    protected beforeExecute(args: any): Promise<void>;
    protected formatSuccessResponse(result: any): CallToolResult;
    protected formatErrorResponse(error: any): CallToolResult;
}
