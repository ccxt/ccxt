import { ReplayError } from './errors.js';
import { RequestDescriptor } from './canonical.js';
import { UnifiedCall } from './unified.js';

interface FaultSelector {
    unifiedMethod?: string;
    instanceId?: string;
    method?: string;
    api?: string;
    path?: string;
    requestId?: string;
    occurrence?: number;
}
interface ReplaceHttpResponseFault {
    kind: 'replaceHttpResponse';
    status: number;
    statusText?: string;
    headers?: { [key: string]: string };
    bodyText: string;
}
interface TransportErrorFault {
    kind: 'transportError';
    errorKind: 'timeout' | 'network';
    message?: string;
}
interface DelayResponseFault {
    kind: 'delayResponse';
    delayMs: number;
}
type FaultAction = ReplaceHttpResponseFault | TransportErrorFault | DelayResponseFault;
interface FaultRule {
    id: string;
    select: FaultSelector;
    action?: FaultAction;
    actions?: FaultAction[];
    times?: number;
    consume?: boolean;
}
interface FaultState {
    rule: FaultRule;
    seen: number;
    lastCallId: number;
    applied: number;
    requestIds: string[];
}
interface FaultPlan {
    delayMs: number;
    terminal: ReplaceHttpResponseFault | TransportErrorFault | undefined;
    terminalRuleId: string | undefined;
    consume: boolean;
    ruleIds: string[];
}
interface FaultSummary {
    id: string;
    kind: string;
    times: number;
    consume: boolean;
    applied: number;
    requestIds: string[];
}
const FAULT_KINDS = [ 'replaceHttpResponse', 'transportError', 'delayResponse' ];

function ruleActions (rule: FaultRule): FaultAction[] {
    return (rule.actions !== undefined) ? rule.actions : [ rule.action as FaultAction ];
}

function ruleTimes (rule: FaultRule): number {
    return (rule.times !== undefined) ? rule.times : ruleActions (rule).length;
}

function validateFaultAction (prefix: string, action: FaultAction): void {
    if (action === undefined || action === null || FAULT_KINDS.indexOf (action.kind) === -1) {
        throw new ReplayError (prefix + 'action.kind must be one of ' + FAULT_KINDS.join (', '));
    }
    if (action.kind === 'replaceHttpResponse') {
        if (!Number.isInteger (action.status)) {
            throw new ReplayError (prefix + 'replaceHttpResponse requires an integer status');
        }
        if (typeof action.bodyText !== 'string') {
            throw new ReplayError (prefix + 'replaceHttpResponse requires bodyText as a string');
        }
    }
    if (action.kind === 'transportError' && action.errorKind !== 'timeout' && action.errorKind !== 'network') {
        throw new ReplayError (prefix + 'transportError.errorKind must be timeout or network');
    }
    if (action.kind === 'delayResponse' && (typeof action.delayMs !== 'number' || !(action.delayMs >= 0))) {
        throw new ReplayError (prefix + 'delayResponse requires a non-negative delayMs');
    }
}

function validateFaultRule (rule: FaultRule): void {
    if (rule === undefined || rule === null || typeof rule !== 'object') {
        throw new ReplayError ('fault rule must be an object');
    }
    if (typeof rule.id !== 'string' || rule.id.length === 0) {
        throw new ReplayError ('fault rule requires a string id');
    }
    const prefix = 'fault rule ' + rule.id + ': ';
    if (rule.select === undefined || rule.select === null || typeof rule.select !== 'object') {
        throw new ReplayError (prefix + 'select must be an object');
    }
    if (rule.select.occurrence !== undefined && (!Number.isInteger (rule.select.occurrence) || rule.select.occurrence < 1)) {
        throw new ReplayError (prefix + 'select.occurrence must be a positive integer');
    }
    if (rule.times !== undefined && (!Number.isInteger (rule.times) || rule.times < 1)) {
        throw new ReplayError (prefix + 'times must be a positive integer');
    }
    if (rule.consume !== undefined && typeof rule.consume !== 'boolean') {
        throw new ReplayError (prefix + 'consume must be a boolean');
    }
    if ((rule.action === undefined) === (rule.actions === undefined)) {
        throw new ReplayError (prefix + 'provide either action or actions');
    }
    if (rule.actions !== undefined && (!Array.isArray (rule.actions) || rule.actions.length === 0)) {
        throw new ReplayError (prefix + 'actions must be a non-empty array');
    }
    const actions = ruleActions (rule);
    for (let i = 0; i < actions.length; i++) {
        validateFaultAction (prefix, actions[i]);
        if (actions[i].kind === 'delayResponse' && rule.consume === false) {
            throw new ReplayError (prefix + 'consume: false needs replaceHttpResponse or transportError actions');
        }
    }
}

function selectorMatches (selector: FaultSelector, instanceId: string, requestId: string, descriptor: RequestDescriptor, url: string, call: UnifiedCall | undefined): boolean {
    if (selector.unifiedMethod !== undefined && (call === undefined || call.method !== selector.unifiedMethod)) {
        return false;
    }
    if (selector.instanceId !== undefined && selector.instanceId !== instanceId) {
        return false;
    }
    if (selector.requestId !== undefined && selector.requestId !== requestId) {
        return false;
    }
    if (selector.method !== undefined && selector.method.toUpperCase () !== descriptor.method.toUpperCase ()) {
        return false;
    }
    if (selector.api !== undefined && selector.api !== descriptor.api) {
        return false;
    }
    if (selector.path !== undefined && selector.path !== descriptor.path && !url.endsWith (selector.path)) {
        return false;
    }
    return true;
}

function planFaults (states: FaultState[], instanceId: string, requestId: string, descriptor: RequestDescriptor, url: string, call: UnifiedCall | undefined): FaultPlan {
    const plan: FaultPlan = { 'delayMs': 0, 'terminal': undefined, 'terminalRuleId': undefined, 'consume': true, 'ruleIds': [] };
    for (let i = 0; i < states.length; i++) {
        const state = states[i];
        if (!selectorMatches (state.rule.select, instanceId, requestId, descriptor, url, call)) {
            continue;
        }
        if (state.rule.select.unifiedMethod !== undefined && call !== undefined) {
            if (call.callId !== state.lastCallId) {
                state.lastCallId = call.callId;
                state.seen += 1;
            }
        } else {
            state.seen += 1;
        }
        const occurrence = state.rule.select.occurrence || 1;
        if (state.seen < occurrence || state.applied >= ruleTimes (state.rule)) {
            continue;
        }
        const actions = ruleActions (state.rule);
        const action = actions[state.applied % actions.length];
        if (action.kind === 'delayResponse') {
            plan.delayMs += action.delayMs;
        } else {
            if (plan.terminal !== undefined) {
                throw new ReplayError ('fault rules ' + plan.terminalRuleId + ' and ' + state.rule.id + ' both replace the outcome of request ' + requestId);
            }
            plan.terminal = action;
            plan.terminalRuleId = state.rule.id;
            plan.consume = state.rule.consume !== false;
        }
        state.applied += 1;
        state.requestIds.push (requestId);
        plan.ruleIds.push (state.rule.id);
    }
    return plan;
}

function summarizeFaults (states: FaultState[]): FaultSummary[] {
    const result: FaultSummary[] = [];
    for (let i = 0; i < states.length; i++) {
        const state = states[i];
        const kinds = [];
        const actions = ruleActions (state.rule);
        for (let j = 0; j < actions.length; j++) {
            kinds.push (actions[j].kind);
        }
        result.push ({ 'id': state.rule.id, 'kind': kinds.join (' > '), 'times': ruleTimes (state.rule), 'consume': state.rule.consume !== false, 'applied': state.applied, 'requestIds': state.requestIds.slice () });
    }
    return result;
}

export { FaultSelector, FaultAction, FaultRule, FaultState, FaultPlan, FaultSummary, ReplaceHttpResponseFault, TransportErrorFault, DelayResponseFault, validateFaultRule, planFaults, summarizeFaults };
