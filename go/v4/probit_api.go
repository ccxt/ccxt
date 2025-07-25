// -------------------------------------------------------------------------------

// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:
// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code

// -------------------------------------------------------------------------------

package ccxt

func (this *probit) PublicGetMarket (args ...interface{}) <-chan interface{} {
   return this.callEndpointAsync("publicGetMarket", args...)
}

func (this *probit) PublicGetCurrency (args ...interface{}) <-chan interface{} {
   return this.callEndpointAsync("publicGetCurrency", args...)
}

func (this *probit) PublicGetCurrencyWithPlatform (args ...interface{}) <-chan interface{} {
   return this.callEndpointAsync("publicGetCurrencyWithPlatform", args...)
}

func (this *probit) PublicGetTime (args ...interface{}) <-chan interface{} {
   return this.callEndpointAsync("publicGetTime", args...)
}

func (this *probit) PublicGetTicker (args ...interface{}) <-chan interface{} {
   return this.callEndpointAsync("publicGetTicker", args...)
}

func (this *probit) PublicGetOrderBook (args ...interface{}) <-chan interface{} {
   return this.callEndpointAsync("publicGetOrderBook", args...)
}

func (this *probit) PublicGetTrade (args ...interface{}) <-chan interface{} {
   return this.callEndpointAsync("publicGetTrade", args...)
}

func (this *probit) PublicGetCandle (args ...interface{}) <-chan interface{} {
   return this.callEndpointAsync("publicGetCandle", args...)
}

func (this *probit) PrivatePostNewOrder (args ...interface{}) <-chan interface{} {
   return this.callEndpointAsync("privatePostNewOrder", args...)
}

func (this *probit) PrivatePostCancelOrder (args ...interface{}) <-chan interface{} {
   return this.callEndpointAsync("privatePostCancelOrder", args...)
}

func (this *probit) PrivatePostWithdrawal (args ...interface{}) <-chan interface{} {
   return this.callEndpointAsync("privatePostWithdrawal", args...)
}

func (this *probit) PrivateGetBalance (args ...interface{}) <-chan interface{} {
   return this.callEndpointAsync("privateGetBalance", args...)
}

func (this *probit) PrivateGetOrder (args ...interface{}) <-chan interface{} {
   return this.callEndpointAsync("privateGetOrder", args...)
}

func (this *probit) PrivateGetOpenOrder (args ...interface{}) <-chan interface{} {
   return this.callEndpointAsync("privateGetOpenOrder", args...)
}

func (this *probit) PrivateGetOrderHistory (args ...interface{}) <-chan interface{} {
   return this.callEndpointAsync("privateGetOrderHistory", args...)
}

func (this *probit) PrivateGetTradeHistory (args ...interface{}) <-chan interface{} {
   return this.callEndpointAsync("privateGetTradeHistory", args...)
}

func (this *probit) PrivateGetDepositAddress (args ...interface{}) <-chan interface{} {
   return this.callEndpointAsync("privateGetDepositAddress", args...)
}

func (this *probit) PrivateGetTransferPayment (args ...interface{}) <-chan interface{} {
   return this.callEndpointAsync("privateGetTransferPayment", args...)
}

func (this *probit) AccountsPostToken (args ...interface{}) <-chan interface{} {
   return this.callEndpointAsync("accountsPostToken", args...)
}
