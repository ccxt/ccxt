
namespace ccxt;

using LighterSigner;

using System.Linq;
using System.Text;
using System.Numerics;

public partial class Exchange
{

    public bool isLighterLibraryPathRequired()
    {
        return true; // not supported for now
    }

    public async Task<LighterSigner.Signer> loadLighterLibrary(object path, object chainId, object privateKey, object apiKeyIndex, object accountIndex)
    {
        if (path == null || path.ToString() == "")
        {
            throw new NotSupportedException(this.id + " loadLighterLibrary() requires a path to the lighter library. You can find it here https://github.com/elliottech/lighter-python/tree/main/lighter/signers. Please download the appropriate library for your system and provide the path to it.\nExample: exchange.options[\"libraryPath\"] = \"path/to/lighter-signer-linux-arm64.so\"");

        }
        LighterSigner.Signer lighterSigner = LighterSigner.Signer.GetInstance((string)path);

        string url = (string)this.implodeHostname(getValue(getValue(this.urls, "api"), "public"));
        lighterSigner.CreateClient(
            url,
            (string)privateKey,
            Convert.ToInt32(chainId),
            Convert.ToInt32(apiKeyIndex),
            (long)accountIndex
        );
        return lighterSigner;
    }

    private object formatSignedLighterTx(LighterSigner.Signer.SignedTx signedTx)
    {
        object res = new List<object>() { };
        ((IList<object>)res).Add(signedTx.TxType);
        ((IList<object>)res).Add(signedTx.TxInfo);
        return res;
    }

    public object lighterSignCreateGroupedOrders(object signer, object request)
    {
        List<LighterSigner.Signer.CreateOrderTxReq> ordersArr = new List<LighterSigner.Signer.CreateOrderTxReq>() { };
        var ordersList = (IList<object>)getValue(request, "orders");
        foreach (var order in ordersList)
        {
            ordersArr.Add(new LighterSigner.Signer.CreateOrderTxReq
            {
                MarketIndex = Convert.ToByte(getValue(order, "market_index")),
                ClientOrderIndex = Convert.ToInt64(getValue(order, "client_order_index")),
                BaseAmount = Convert.ToInt64(getValue(order, "base_amount")),
                Price = Convert.ToUInt32(getValue(order, "avg_execution_price")),
                IsAsk = Convert.ToByte(getValue(order, "is_ask")),
                Type = Convert.ToByte(getValue(order, "order_type")),
                TimeInForce = Convert.ToByte(getValue(order, "time_in_force")),
                ReduceOnly = Convert.ToByte(getValue(order, "reduce_only")),
                TriggerPrice = Convert.ToUInt32(getValue(order, "trigger_price")),
                OrderExpiry = Convert.ToInt64(getValue(order, "order_expiry"))
            });
        }
        LighterSigner.Signer.SignedTx signedTx = ((LighterSigner.Signer)signer).SignCreateGroupedOrders(
            Convert.ToByte(getValue(request, "grouping_type")), ordersArr, Convert.ToInt64(getValue(request, "nonce")), Convert.ToInt32(getValue(request, "api_key_index")), Convert.ToInt64(getValue(request, "account_index"))
        );
        return this.formatSignedLighterTx(signedTx);
    }

    public object lighterSignCreateOrder(object signer, object request)
    {
        LighterSigner.Signer.SignedTx signedTx = ((LighterSigner.Signer)signer).SignCreateOrder(
            Convert.ToInt32(getValue(request, "market_index")),
            Convert.ToInt64(getValue(request, "client_order_index")),
            Convert.ToInt64(getValue(request, "base_amount")),
            Convert.ToInt32(getValue(request, "avg_execution_price")),
            Convert.ToInt32(getValue(request, "is_ask")),
            Convert.ToInt32(getValue(request, "order_type")),
            Convert.ToInt32(getValue(request, "time_in_force")),
            Convert.ToInt32(getValue(request, "reduce_only")),
            Convert.ToInt32(getValue(request, "trigger_price")),
            Convert.ToInt64(getValue(request, "order_expiry")),
            Convert.ToInt64(getValue(request, "nonce")),
            Convert.ToInt32(getValue(request, "api_key_index")),
            Convert.ToInt64(getValue(request, "account_index"))
        );
        return this.formatSignedLighterTx(signedTx);
    }

    public object lighterSignCancelOrder(object signer, object request)
    {
        LighterSigner.Signer.SignedTx signedTx = ((LighterSigner.Signer)signer).SignCancelOrder(
            Convert.ToInt32(getValue(request, "market_index")),
            Convert.ToInt64(getValue(request, "order_index")),
            Convert.ToInt64(getValue(request, "nonce")),
            Convert.ToInt32(getValue(request, "api_key_index")),
            Convert.ToInt64(getValue(request, "account_index"))
        );
        return this.formatSignedLighterTx(signedTx);
    }

    public object lighterSignWithdraw(object signer, object request)
    {
        LighterSigner.Signer.SignedTx signedTx = ((LighterSigner.Signer)signer).SignWithdraw(
            Convert.ToInt32(getValue(request, "asset_index")),
            Convert.ToInt32(getValue(request, "route_type")),
            Convert.ToUInt64(getValue(request, "amount")),
            Convert.ToInt64(getValue(request, "nonce")),
            Convert.ToInt32(getValue(request, "api_key_index")),
            Convert.ToInt64(getValue(request, "account_index"))
        );
        return this.formatSignedLighterTx(signedTx);
    }

    public object lighterSignCreateSubAccount(object signer, object request)
    {
        LighterSigner.Signer.SignedTx signedTx = ((LighterSigner.Signer)signer).SignCreateSubAccount(
            Convert.ToInt64(getValue(request, "nonce")),
            Convert.ToInt32(getValue(request, "api_key_index")),
            Convert.ToInt64(getValue(request, "account_index"))
        );
        return this.formatSignedLighterTx(signedTx);
    }

    public object lighterSignCancelAllOrders(object signer, object request)
    {
        LighterSigner.Signer.SignedTx signedTx = ((LighterSigner.Signer)signer).SignCancelAllOrders(
            Convert.ToInt32(getValue(request, "time_in_force")),
            Convert.ToInt64(getValue(request, "time")),
            Convert.ToInt64(getValue(request, "nonce")),
            Convert.ToInt32(getValue(request, "api_key_index")),
            Convert.ToInt64(getValue(request, "account_index"))
        );
        return this.formatSignedLighterTx(signedTx);
    }

    public object lighterSignModifyOrder(object signer, object request)
    {
        LighterSigner.Signer.SignedTx signedTx = ((LighterSigner.Signer)signer).SignModifyOrder(
            Convert.ToInt32(getValue(request, "market_index")),
            Convert.ToInt64(getValue(request, "index")),
            Convert.ToInt64(getValue(request, "base_amount")),
            Convert.ToInt32(getValue(request, "price")),
            Convert.ToInt32(getValue(request, "trigger_price")),
            Convert.ToInt64(getValue(request, "nonce")),
            Convert.ToInt32(getValue(request, "api_key_index")),
            Convert.ToInt64(getValue(request, "account_index"))
        );
        return this.formatSignedLighterTx(signedTx);
    }

    public object lighterSignTransfer(object signer, object request)
    {
        LighterSigner.Signer.SignedTx signedTx = ((LighterSigner.Signer)signer).SignTransfer(
            Convert.ToInt32(getValue(request, "to_account_index")),
            Convert.ToInt16(getValue(request, "asset_index")),
            Convert.ToByte(getValue(request, "from_route_type")),
            Convert.ToByte(getValue(request, "to_route_type")),
            Convert.ToInt64(getValue(request, "amount")),
            Convert.ToInt64(getValue(request, "usdc_fee")),
            getValue(request, "memo").ToString(),
            Convert.ToInt64(getValue(request, "nonce")),
            Convert.ToInt32(getValue(request, "api_key_index")),
            Convert.ToInt64(getValue(request, "account_index"))
        );
        return this.formatSignedLighterTx(signedTx);
    }

    public object lighterSignUpdateLeverage(object signer, object request)
    {
        LighterSigner.Signer.SignedTx signedTx = ((LighterSigner.Signer)signer).SignUpdateLeverage(
            Convert.ToInt32(getValue(request, "market_index")),
            Convert.ToInt32(getValue(request, "initial_margin_fraction")),
            Convert.ToInt32(getValue(request, "margin_mode")),
            Convert.ToInt64(getValue(request, "nonce")),
            Convert.ToInt32(getValue(request, "api_key_index")),
            Convert.ToInt64(getValue(request, "account_index"))
        );
        return this.formatSignedLighterTx(signedTx);
    }

    public object lighterCreateAuthToken(object signer, object request)
    {
        string authToken = ((LighterSigner.Signer)signer).CreateAuthToken(
            Convert.ToInt64(getValue(request, "deadline")),
            Convert.ToInt32(getValue(request, "api_key_index")),
            Convert.ToInt64(getValue(request, "account_index"))
        );
        return authToken;
    }

    public object lighterSignUpdateMargin(object signer, object request)
    {
        LighterSigner.Signer.SignedTx signedTx = ((LighterSigner.Signer)signer).SignUpdateMargin(
            Convert.ToInt32(getValue(request, "market_index")),
            Convert.ToInt64(getValue(request, "usdc_amount")),
            Convert.ToInt32(getValue(request, "direction")),
            Convert.ToInt64(getValue(request, "nonce")),
            Convert.ToInt32(getValue(request, "api_key_index")),
            Convert.ToInt64(getValue(request, "account_index"))
        );
        return this.formatSignedLighterTx(signedTx);
    }
}