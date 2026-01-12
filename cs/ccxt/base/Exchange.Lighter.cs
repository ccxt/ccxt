
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

    public object lighterSignCreateGroupedOrders(object signer, object grouping_type, object orders, object nonce, object api_key_index, object account_index) {
        // arr_type = CreateOrderTxReq * len(orders)
        // orders_arr = []
        // for order in orders:
        //     orders_arr.append(CreateOrderTxReq(
        //         MarketIndex=int(order['market_index']),
        //         ClientOrderIndex=order['client_order_index'],
        //         BaseAmount=order['base_amount'],
        //         Price=order['avg_execution_price'],
        //         IsAsk=order['is_ask'],
        //         Type=order['order_type'],
        //         TimeInForce=order['time_in_force'],
        //         ReduceOnly=order['reduce_only'],
        //         TriggerPrice=order['trigger_price'],
        //         OrderExpiry=order['order_expiry'],
        //     ))
        // orders_carr = arr_type(*orders_arr)
        // tx_type, tx_info, tx_hash, error = decode_tx_info(signer.SignCreateGroupedOrders(
        //     grouping_type, orders_carr, len(orders), nonce, api_key_index, account_index
        // ))
        // print(tx_type, tx_info, tx_hash, error)
        // return [tx_type, tx_info]
        return null;
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
        object res = new List<object>() {};
        ((IList<object>)res).Add(signedTx.TxType);
        ((IList<object>)res).Add(signedTx.TxInfo);
        return res;
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
        // tx_type, tx_info, tx_hash, error = decode_tx_info(signer.SignModifyOrder(
        //     getValue(request, "market_index"),
        //     getValue(request, "index"),
        //     getValue(request, "base_amount"),
        //     getValue(request, "price"),
        //     getValue(request, "trigger_price"),
        //     getValue(request, "nonce"),
        //     getValue(request, "api_key_index"),
        //     getValue(request, "account_index"),
        // ))
        // print(tx_type, tx_info, tx_hash, error)
        // return [tx_type, tx_info]
        return null;
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
        // auth, error = decode_auth(signer.CreateAuthToken(
        //     getValue(request, "deadline"),
        //     getValue(request, "api_key_index"),
        //     getValue(request, "account_index"),
        // ))
        // return auth
        return null;
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