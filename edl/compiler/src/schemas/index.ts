/**
 * EDL Schemas
 * Export all schema definitions
 */

export * from './websocket-messages.js';
export * from './algorithmic-orders.js';
export * from './order-endpoints.js';
export * from './batch-operations.js';
export * from './fragments.js';
export * from './rate-limits.js';
export * from './has-flags.js';
export * from './parameter-translation.js';

// Export wallet and margin schemas with specific exports to avoid naming conflicts
export type {
    WalletEndpointSchema,
    TransferSchema,
    WithdrawalSchema,
    DepositAddressSchema,
    BalanceSchema,
    FieldMapping as WalletFieldMapping,
    ResponseMapping as WalletResponseMapping,
} from './wallet-operations.js';

export type {
    MarginEndpointSchema,
    BorrowSchema,
    RepaySchema,
    MarginModeSchema,
    SetLeverageSchema,
    LeverageSchema,
} from './margin-methods.js';
export * from './auth-modes.js';
