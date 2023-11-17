declare const errorHierarchy: {
    BaseError: {
        ExchangeError: {
            AuthenticationError: {
                PermissionDenied: {
                    AccountNotEnabled: {};
                };
                AccountSuspended: {};
            };
            ArgumentsRequired: {};
            BadRequest: {
                BadSymbol: {};
                MarginModeAlreadySet: {};
                NoChange: {};
                OperationRejected: {};
            };
            BadResponse: {
                NullResponse: {};
            };
            InsufficientFunds: {};
            InvalidAddress: {
                AddressPending: {};
            };
            InvalidOrder: {
                OrderNotFound: {};
                OrderNotCached: {};
                CancelPending: {};
                OrderImmediatelyFillable: {};
                OrderNotFillable: {};
                DuplicateOrderId: {};
                ContractUnavailable: {};
            };
            NotSupported: {};
        };
        OperationFailed: {
            NetworkError: {
                DDoSProtection: {
                    RateLimitExceeded: {};
                };
                ExchangeNotAvailable: {
                    OnMaintenance: {};
                };
                InvalidNonce: {};
                RequestTimeout: {};
            };
        };
    };
};
export default errorHierarchy;
