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
            InsufficientFunds: {};
            InvalidAddress: {
                AddressPending: {};
            };
            InvalidOrder: {
                OrderNotFound: {};
                OrderNotCached: {};
                OrderImmediatelyFillable: {};
                OrderNotFillable: {};
                DuplicateOrderId: {};
                ContractUnavailable: {};
            };
            NotSupported: {};
            InvalidProxySettings: {};
            ExchangeClosedByUser: {};
        };
        OperationFailed: {
            NetworkError: {
                DDoSProtection: {};
                RateLimitExceeded: {};
                ExchangeNotAvailable: {
                    OnMaintenance: {};
                };
                InvalidNonce: {
                    ChecksumError: {};
                };
                RequestTimeout: {};
            };
            BadResponse: {
                NullResponse: {};
            };
            CancelPending: {};
        };
    };
};
export default errorHierarchy;
