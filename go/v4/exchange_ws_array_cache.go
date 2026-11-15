package ccxt

// WsArrayCache is the shape of the list caches that BaseExchange.Orders and MyTrades hold:
// *ArrayCache and the ByTimestamp / BySymbolById / ByOutcomeById variants all satisfy it.
type WsArrayCache interface {
	Append(item any)
	ToArray() []any
	GetLimit(symbol any, limit any) *int64
}
