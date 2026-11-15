namespace ccxt;

// Exchange is a thin concrete tier over BaseExchange (which holds all shared infra). Regular
// exchanges extend Exchange; the prediction tier (PredictionExchange) extends BaseExchange as an
// independent sibling — so a prediction instance is NOT an Exchange, while still reusing every
// base helper via BaseExchange.
public partial class Exchange : BaseExchange
{
    public Exchange(object userConfig2 = null) : base(userConfig2) { }
}
