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
            };
            OperationRejected: {
                NoChange: {
                    MarginModeAlreadySet: {};
                };
                MarketClosed: {};
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
            ProxyError: {};
            ExchangeClosedByUser: {};
        };
        OperationFailed: {
            NetworkError: {
                DDoSProtection: {};
                RateLimitExceeded: {};
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
