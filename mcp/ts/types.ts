export type TierFlag = false | true | 'live';

export interface AccountConfig {
    name: string;
    exchange: string;
    prediction?: boolean;
    apiKey?: string;
    secret?: string;
    password?: string;
    uid?: string;
    login?: string;
    token?: string;
    twofa?: string;
    walletAddress?: string;
    privateKey?: string;
    sandbox?: boolean;
    demo?: boolean;
    trading?: TierFlag;
    funds?: TierFlag;
    implicitWrites?: boolean;
    dryRun?: boolean;
    maxOrderValue?: number | null;
    maxTransferValue?: number | null;
    maxDailyValue?: number | null;
    allowedSymbols?: string[];
    deniedSymbols?: string[];
    confirm?: 'always' | 'live' | 'never';
    defaultType?: string;
    options?: Record<string, any>;
    timeout?: number;
    rateLimit?: number;
}

export interface ServerSettings {
    refreshMarketsTimeout: number;
    maxResults: number;
    strictPermissions: boolean;
    exchangeOptions: Record<string, Record<string, any>>;
}

export interface ResolvedConfig {
    accounts: Record<string, AccountConfig>;
    settings: ServerSettings;
    problems: string[];
    configPath: string | undefined;
}

// non-secret projection of an account, safe to return from tools
export interface AccountSummary {
    name: string;
    exchange: string;
    prediction: boolean;
    environment: 'live' | 'sandbox' | 'demo';
    trading: TierFlag;
    funds: TierFlag;
    implicitWrites: boolean;
    dryRun: boolean;
    confirm: string;
    defaultType: string | undefined;
    maxOrderValue: number | null | undefined;
    maxTransferValue: number | null | undefined;
    maxDailyValue: number | null | undefined;
    allowedSymbols: string[] | undefined;
    credentials: string[]; // names of the credential fields that are set — never values
}

export interface ServerContext {
    ccxt: any;
    config: ResolvedConfig;
    pools: any;    // ExchangePools — typed loosely to keep the fake-ccxt test injection trivial
    safety: any;   // Safety
    journal: any;  // Journal
    version: string;
    elicitationSupported: () => boolean;
    elicit: (message: string, schema: any) => Promise<any>;
}

export function accountEnvironment (account: AccountConfig): 'live' | 'sandbox' | 'demo' {
    if (account.sandbox) {
        return 'sandbox';
    }
    if (account.demo) {
        return 'demo';
    }
    return 'live';
}

export const CREDENTIAL_FIELDS = [ 'apiKey', 'secret', 'password', 'uid', 'login', 'token', 'twofa', 'walletAddress', 'privateKey' ] as const;

export function accountSummary (account: AccountConfig): AccountSummary {
    return {
        'name': account.name,
        'exchange': account.exchange,
        'prediction': !!account.prediction,
        'environment': accountEnvironment (account),
        'trading': account.trading ?? false,
        'funds': account.funds ?? false,
        'implicitWrites': !!account.implicitWrites,
        'dryRun': !!account.dryRun,
        'confirm': account.confirm ?? 'live',
        'defaultType': account.defaultType,
        'maxOrderValue': account.maxOrderValue,
        'maxTransferValue': account.maxTransferValue,
        'maxDailyValue': account.maxDailyValue,
        'allowedSymbols': account.allowedSymbols,
        'credentials': CREDENTIAL_FIELDS.filter ((field) => (account as any)[field] !== undefined),
    };
}
