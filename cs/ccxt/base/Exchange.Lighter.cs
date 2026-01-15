
namespace ccxt;
using Lighter;
using System.Linq;
using System.Text;
using System.Numerics;

public partial class Exchange
{
    public object loadLighterLibrary(object path, object chainId, object privateKey, object apiKeyIndex, object accountIndex) {
        LighterSigner lighterSigner = Lighter.LighterSigner.GetInstance((string) path);

        string url = (string) this.implodeHostname(getValue(getValue(this.urls, "api"), "public"));
        lighterSigner.CreateClient(
            url,
            (string) privateKey,
            Convert.ToInt32(chainId),
            Convert.ToInt32(apiKeyIndex),
            (long) accountIndex
        );
        return lighterSigner;
    }

    private object formatSignedLighterTx (Lighter.LighterSigner.SignedTx signedTx) {
        object res = new List<object>() {};
        ((IList<object>)res).Add(signedTx.TxType);
        ((IList<object>)res).Add(signedTx.TxInfo);
        return res;
    }

    public object lighterSignCreateGroupedOrders(object signer, object request) {
        List<Lighter.LighterSigner.CreateOrderTxReq> ordersArr = new List<Lighter.LighterSigner.CreateOrderTxReq>() {};
        var ordersList = (IList<object>) getValue(request, "orders");
        foreach (var order in ordersList) {
            ordersArr.Add(new Lighter.LighterSigner.CreateOrderTxReq{
                MarketIndex      = Convert.ToByte(getValue(order, "market_index")),
                ClientOrderIndex = Convert.ToInt64(getValue(order, "client_order_index")),
                BaseAmount       = Convert.ToInt64(getValue(order, "base_amount")),
                Price            = Convert.ToUInt32(getValue(order, "avg_execution_price")),
                IsAsk            = Convert.ToByte(getValue(order, "is_ask")),
                Type             = Convert.ToByte(getValue(order, "order_type")),
                TimeInForce      = Convert.ToByte(getValue(order, "time_in_force")),
                ReduceOnly       = Convert.ToByte(getValue(order, "reduce_only")),
                TriggerPrice     = Convert.ToUInt32(getValue(order, "trigger_price")),
                OrderExpiry      = Convert.ToInt64(getValue(order, "order_expiry"))
            });
        }
        Lighter.LighterSigner.SignedTx signedTx = ((LighterSigner) signer).SignCreateGroupedOrders(
            Convert.ToByte(getValue(request, "grouping_type")), ordersArr, Convert.ToInt64(getValue(request, "nonce")), Convert.ToInt32(getValue(request, "api_key_index")), Convert.ToInt64(getValue(request, "account_index"))
        );
        return this.formatSignedLighterTx(signedTx);
    }

    public object lighterSignCreateOrder(object signer, object request) {
        Lighter.LighterSigner.SignedTx signedTx = ((LighterSigner) signer).SignCreateOrder(
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

    public object lighterSignCancelOrder(object signer, object request) {
        // tx_type, tx_info, tx_hash, error = decode_tx_info(signer.SignCancelOrder(
        //     getValue(request, "market_index"),
        //     getValue(request, "order_index"),
        //     getValue(request, "nonce"),
        //     getValue(request, "api_key_index"),
        //     getValue(request, "account_index"),
        // ))
        // print(tx_type, tx_info, tx_hash, error)
        // return [tx_type, tx_info]
        return null;
    }

    public object lighterSignWithdraw(object signer, object request) {
        // tx_type, tx_info, tx_hash, error = decode_tx_info(signer.SignWithdraw(
        //     getValue(request, "asset_index"),
        //     getValue(request, "route_type"),
        //     getValue(request, "amount"),
        //     getValue(request, "nonce"),
        //     getValue(request, "api_key_index"),
        //     getValue(request, "account_index"),
        // ))
        // print(tx_type, tx_info, tx_hash, error)
        // return [tx_type, tx_info]
        return null;
    }

    public object lighterSignCreateSubAccount(object signer, object request) {
        // tx_type, tx_info, tx_hash, error = decode_tx_info(signer.SignCreateSubAccount(
        //     getValue(request, "nonce"),
        //     getValue(request, "api_key_index"),
        //     getValue(request, "account_index"),
        // ))
        // print(tx_type, tx_info, tx_hash, error)
        // return [tx_type, tx_info]
        return null;
    }

    public object lighterSignCancelAllOrders(object signer, object request) {
        // tx_type, tx_info, tx_hash, error = decode_tx_info(signer.SignCancelAllOrders(
        //     getValue(request, "time_in_force"),
        //     getValue(request, "time"),
        //     getValue(request, "nonce"),
        //     getValue(request, "api_key_index"),
        //     getValue(request, "account_index"),
        // ))
        // print(tx_type, tx_info, tx_hash, error)
        // return [tx_type, tx_info]
        return null;
    }

    public object lighterSignModifyOrder(object signer, object request) {
        Lighter.LighterSigner.SignedTx signedTx = ((LighterSigner) signer).SignModifyOrder(
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

    public object lighterSignTransfer(object signer, object request) {
        // tx_type, tx_info, tx_hash, error = decode_tx_info(signer.SignTransfer(
        //     getValue(request, "to_account_index"),
        //     getValue(request, "asset_index"),
        //     getValue(request, "from_route_type"),
        //     getValue(request, "to_route_type"),
        //     getValue(request, "amount"),
        //     getValue(request, "usdc_fee"),
        //     getValue(request, "memo"),
        //     getValue(request, "nonce"),
        //     getValue(request, "api_key_index"),
        //     getValue(request, "account_index"),
        // ))
        // print(tx_type, tx_info, tx_hash, error)
        // return [tx_type, tx_info]
        return null;
    }

    public object lighterSignUpdateLeverage(object signer, object request) {
        // tx_type, tx_info, tx_hash, error = decode_tx_info(signer.SignUpdateLeverage(
        //     getValue(request, "market_index"),
        //     getValue(request, "initial_margin_fraction"),
        //     getValue(request, "margin_mode"),
        //     getValue(request, "nonce"),
        //     getValue(request, "api_key_index"),
        //     getValue(request, "account_index"),
        // ))
        // print(tx_type, tx_info, tx_hash, error)
        // return [tx_type, tx_info]
        return null;
    }

    public object lighterCreateAuthToken(object signer, object request) {
        string authToken = ((LighterSigner) signer).CreateAuthToken(
            Convert.ToInt64(getValue(request, "deadline")),
            Convert.ToInt32(getValue(request, "api_key_index")),
            Convert.ToInt64(getValue(request, "account_index"))
        );
        return authToken;
    }

    public object lighterSignUpdateMargin(object signer, object request) {
        // tx_type, tx_info, tx_hash, error = decode_tx_info(signer.SignUpdateMargin(
        //     getValue(request, "market_index"),
        //     getValue(request, "usdc_amount"),
        //     getValue(request, "direction"),
        //     getValue(request, "nonce"),
        //     getValue(request, "api_key_index"),
        //     getValue(request, "account_index"),
        // ))
        // print(tx_type, tx_info, tx_hash, error)
        // return [tx_type, tx_info]
        return null;
    }
}