
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
            (int) chainId,
            (int) apiKeyIndex,
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
        // tx_type, tx_info, tx_hash, error = decode_tx_info(signer.SignCreateOrder(
        //     int(request['market_index']),
        //     request['client_order_index'],
        //     request['base_amount'],
        //     request['avg_execution_price'],
        //     request['is_ask'],
        //     request['order_type'],
        //     request['time_in_force'],
        //     request['reduce_only'],
        //     request['trigger_price'],
        //     request['order_expiry'],
        //     request['nonce'],
        //     request['api_key_index'],
        //     request['account_index'],
        // ))
        // print(tx_type, tx_info, tx_hash, error)
        // return [tx_type, tx_info]
        return null;
    }

    public object lighterSignCancelOrder(object signer, object request) {
        // tx_type, tx_info, tx_hash, error = decode_tx_info(signer.SignCancelOrder(
        //     request['market_index'],
        //     request['order_index'],
        //     request['nonce'],
        //     request['api_key_index'],
        //     request['account_index'],
        // ))
        // print(tx_type, tx_info, tx_hash, error)
        // return [tx_type, tx_info]
        return null;
    }

    public object lighterSignWithdraw(object signer, object request) {
        // tx_type, tx_info, tx_hash, error = decode_tx_info(signer.SignWithdraw(
        //     request['asset_index'],
        //     request['route_type'],
        //     request['amount'],
        //     request['nonce'],
        //     request['api_key_index'],
        //     request['account_index'],
        // ))
        // print(tx_type, tx_info, tx_hash, error)
        // return [tx_type, tx_info]
        return null;
    }

    public object lighterSignCreateSubAccount(object signer, object request) {
        // tx_type, tx_info, tx_hash, error = decode_tx_info(signer.SignCreateSubAccount(
        //     request['nonce'],
        //     request['api_key_index'],
        //     request['account_index'],
        // ))
        // print(tx_type, tx_info, tx_hash, error)
        // return [tx_type, tx_info]
        return null;
    }

    public object lighterSignCancelAllOrders(object signer, object request) {
        // tx_type, tx_info, tx_hash, error = decode_tx_info(signer.SignCancelAllOrders(
        //     request['time_in_force'],
        //     request['time'],
        //     request['nonce'],
        //     request['api_key_index'],
        //     request['account_index'],
        // ))
        // print(tx_type, tx_info, tx_hash, error)
        // return [tx_type, tx_info]
        return null;
    }

    public object lighterSignModifyOrder(object signer, object request) {
        // tx_type, tx_info, tx_hash, error = decode_tx_info(signer.SignModifyOrder(
        //     request['market_index'],
        //     request['index'],
        //     request['base_amount'],
        //     request['price'],
        //     request['trigger_price'],
        //     request['nonce'],
        //     request['api_key_index'],
        //     request['account_index'],
        // ))
        // print(tx_type, tx_info, tx_hash, error)
        // return [tx_type, tx_info]
        return null;
    }

    public object lighterSignTransfer(object signer, object request) {
        // tx_type, tx_info, tx_hash, error = decode_tx_info(signer.SignTransfer(
        //     request['to_account_index'],
        //     request['asset_index'],
        //     request['from_route_type'],
        //     request['to_route_type'],
        //     request['amount'],
        //     request['usdc_fee'],
        //     request['memo'],
        //     request['nonce'],
        //     request['api_key_index'],
        //     request['account_index'],
        // ))
        // print(tx_type, tx_info, tx_hash, error)
        // return [tx_type, tx_info]
        return null;
    }

    public object lighterSignUpdateLeverage(object signer, object request) {
        // tx_type, tx_info, tx_hash, error = decode_tx_info(signer.SignUpdateLeverage(
        //     request['market_index'],
        //     request['initial_margin_fraction'],
        //     request['margin_mode'],
        //     request['nonce'],
        //     request['api_key_index'],
        //     request['account_index'],
        // ))
        // print(tx_type, tx_info, tx_hash, error)
        // return [tx_type, tx_info]
        return null;
    }

    public object lighterCreateAuthToken(object signer, object request) {
        // auth, error = decode_auth(signer.CreateAuthToken(
        //     request['deadline'],
        //     request['api_key_index'],
        //     request['account_index'],
        // ))
        // return auth
        return null;
    }

    public object lighterSignUpdateMargin(object signer, object request) {
        // tx_type, tx_info, tx_hash, error = decode_tx_info(signer.SignUpdateMargin(
        //     request['market_index'],
        //     request['usdc_amount'],
        //     request['direction'],
        //     request['nonce'],
        //     request['api_key_index'],
        //     request['account_index'],
        // ))
        // print(tx_type, tx_info, tx_hash, error)
        // return [tx_type, tx_info]
        return null;
    }
}