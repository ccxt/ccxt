
namespace ccxt;

using LighterSigner;

using System.Linq;
using System.Text;
using System.Numerics;

public partial class BaseExchange
{

    public bool isLighterLibraryPathRequired()
    {
        return true; // not supported for now
    }

    public async Task<LighterSigner.Signer> loadLighterLibrary(object path, object chainId, object privateKey, object apiKeyIndex, object accountIndex, bool createClient = false)
    {
        if (path == null || path.ToString() == "")
        {
            throw new NotSupportedException(this.id + " loadLighterLibrary() requires a path to the lighter library. You can find it here https://github.com/elliottech/lighter-python/tree/main/lighter/signers. Please download the appropriate library for your system and provide the path to it.\nExample: exchange.options[\"libraryPath\"] = \"path/to/lighter-signer-linux-arm64.so\"");

        }
        LighterSigner.Signer lighterSigner = LighterSigner.Signer.GetInstance((string)path);

        if (createClient) {
            this.lighterCreateClient(
                lighterSigner,
                chainId,
                privateKey,
                apiKeyIndex,
                accountIndex
            );
        }
        return lighterSigner;
    }

    public LighterSigner.Signer lighterCreateClient(object signer, object chainId, object privateKey, object apiKeyIndex, object accountIndex)
    {
        string url = (string)this.implodeHostname((this.urlsApi != null && this.urlsApi.ContainsKey("public") ? this.urlsApi["public"] : null));
        ((LighterSigner.Signer)signer).CreateClient(
            url,
            (string)privateKey,
            Convert.ToInt32(chainId),
            Convert.ToInt32(apiKeyIndex),
            (long)accountIndex
        );
        return (LighterSigner.Signer)signer;
    }

    // every path hands back the 3-element list the generated lighter destructuring reads
    // by index, so the signature names the box the value already has
    private List<object> formatSignedLighterTx(LighterSigner.Signer.SignedTx signedTx)
    {
        List<object> res = new List<object>() { };
        ((IList<object>)res).Add(signedTx.TxType);
        ((IList<object>)res).Add(signedTx.TxInfo);
        ((IList<object>)res).Add(signedTx.MessageToSign);
        return res;
    }

    public List<object> lighterSignCreateGroupedOrders(object signer, IDictionary<string, object> request)
    {
        List<LighterSigner.Signer.CreateOrderTxReq> ordersArr = new List<LighterSigner.Signer.CreateOrderTxReq>() { };
        var ordersList = (IList<object>)(request != null && request.ContainsKey("orders") ? request["orders"] : null);
        // every element is a Dictionary built by lighter createOrderRequest (extend / safeDict rows)
        foreach (IDictionary<string, object> order in ordersList)
        {
            ordersArr.Add(new LighterSigner.Signer.CreateOrderTxReq
            {
                MarketIndex = Convert.ToInt16((order.ContainsKey("market_index") ? order["market_index"] : null)),
                ClientOrderIndex = Convert.ToInt64((order.ContainsKey("client_order_index") ? order["client_order_index"] : null)),
                BaseAmount = Convert.ToInt64((order.ContainsKey("base_amount") ? order["base_amount"] : null)),
                Price = Convert.ToUInt32((order.ContainsKey("avg_execution_price") ? order["avg_execution_price"] : null)),
                IsAsk = Convert.ToByte((order.ContainsKey("is_ask") ? order["is_ask"] : null)),
                Type = Convert.ToByte((order.ContainsKey("order_type") ? order["order_type"] : null)),
                TimeInForce = Convert.ToByte((order.ContainsKey("time_in_force") ? order["time_in_force"] : null)),
                ReduceOnly = Convert.ToByte((order.ContainsKey("reduce_only") ? order["reduce_only"] : null)),
                TriggerPrice = Convert.ToUInt32((order.ContainsKey("trigger_price") ? order["trigger_price"] : null)),
                OrderExpiry = Convert.ToInt64((order.ContainsKey("order_expiry") ? order["order_expiry"] : null))
            });
        }
        LighterSigner.Signer.SignedTx signedTx = ((LighterSigner.Signer)signer).SignCreateGroupedOrders(
            Convert.ToByte((request != null && request.ContainsKey("grouping_type") ? request["grouping_type"] : null)), ordersArr,
            Convert.ToInt64((request != null && request.ContainsKey("integrator_account_index") ? request["integrator_account_index"] : null)),
            Convert.ToInt32((request != null && request.ContainsKey("integrator_taker_fee") ? request["integrator_taker_fee"] : null)),
            Convert.ToInt32((request != null && request.ContainsKey("integrator_maker_fee") ? request["integrator_maker_fee"] : null)),
            Convert.ToByte(this.safeInteger(request, "self_trade_behavior_mode", 0)), // SelfTradeBehaviorExpireMaker
            Convert.ToByte(this.safeInteger(request, "self_trade_equality_mode", 0)), // SelfTradeEqualityAccountIndex
            0x1, // skip nonce
            Convert.ToInt64((request != null && request.ContainsKey("nonce") ? request["nonce"] : null)), Convert.ToInt32((request != null && request.ContainsKey("api_key_index") ? request["api_key_index"] : null)), Convert.ToInt64((request != null && request.ContainsKey("account_index") ? request["account_index"] : null))
        );
        return this.formatSignedLighterTx(signedTx);
    }

    public List<object> lighterSignCreateOrder(object signer, IDictionary<string, object> request)
    {
        LighterSigner.Signer.SignedTx signedTx = ((LighterSigner.Signer)signer).SignCreateOrder(
            Convert.ToInt32((request != null && request.ContainsKey("market_index") ? request["market_index"] : null)),
            Convert.ToInt64((request != null && request.ContainsKey("client_order_index") ? request["client_order_index"] : null)),
            Convert.ToInt64((request != null && request.ContainsKey("base_amount") ? request["base_amount"] : null)),
            Convert.ToInt32((request != null && request.ContainsKey("avg_execution_price") ? request["avg_execution_price"] : null)),
            Convert.ToInt32((request != null && request.ContainsKey("is_ask") ? request["is_ask"] : null)),
            Convert.ToInt32((request != null && request.ContainsKey("order_type") ? request["order_type"] : null)),
            Convert.ToInt32((request != null && request.ContainsKey("time_in_force") ? request["time_in_force"] : null)),
            Convert.ToInt32((request != null && request.ContainsKey("reduce_only") ? request["reduce_only"] : null)),
            Convert.ToInt32((request != null && request.ContainsKey("trigger_price") ? request["trigger_price"] : null)),
            Convert.ToInt64((request != null && request.ContainsKey("order_expiry") ? request["order_expiry"] : null)),
            Convert.ToInt64((request != null && request.ContainsKey("integrator_account_index") ? request["integrator_account_index"] : null)),
            Convert.ToInt32((request != null && request.ContainsKey("integrator_taker_fee") ? request["integrator_taker_fee"] : null)),
            Convert.ToInt32((request != null && request.ContainsKey("integrator_maker_fee") ? request["integrator_maker_fee"] : null)),
            Convert.ToByte(this.safeInteger(request, "self_trade_behavior_mode", 0)), // SelfTradeBehaviorExpireMaker
            Convert.ToByte(this.safeInteger(request, "self_trade_equality_mode", 0)), // SelfTradeEqualityAccountIndex
            0x1, // skip nonce
            Convert.ToInt64((request != null && request.ContainsKey("nonce") ? request["nonce"] : null)),
            Convert.ToInt32((request != null && request.ContainsKey("api_key_index") ? request["api_key_index"] : null)),
            Convert.ToInt64((request != null && request.ContainsKey("account_index") ? request["account_index"] : null))
        );
        return this.formatSignedLighterTx(signedTx);
    }

    public List<object> lighterSignCancelOrder(object signer, IDictionary<string, object> request)
    {
        LighterSigner.Signer.SignedTx signedTx = ((LighterSigner.Signer)signer).SignCancelOrder(
            Convert.ToInt32((request != null && request.ContainsKey("market_index") ? request["market_index"] : null)),
            Convert.ToInt64((request != null && request.ContainsKey("order_index") ? request["order_index"] : null)),
            0x1, // skip nonce
            Convert.ToInt64((request != null && request.ContainsKey("nonce") ? request["nonce"] : null)),
            Convert.ToInt32((request != null && request.ContainsKey("api_key_index") ? request["api_key_index"] : null)),
            Convert.ToInt64((request != null && request.ContainsKey("account_index") ? request["account_index"] : null))
        );
        return this.formatSignedLighterTx(signedTx);
    }

    public List<object> lighterSignWithdraw(object signer, IDictionary<string, object> request)
    {
        LighterSigner.Signer.SignedTx signedTx = ((LighterSigner.Signer)signer).SignWithdraw(
            Convert.ToInt32((request != null && request.ContainsKey("asset_index") ? request["asset_index"] : null)),
            Convert.ToInt32((request != null && request.ContainsKey("route_type") ? request["route_type"] : null)),
            Convert.ToUInt64((request != null && request.ContainsKey("amount") ? request["amount"] : null)),
            0x1, // skip nonce
            Convert.ToInt64((request != null && request.ContainsKey("nonce") ? request["nonce"] : null)),
            Convert.ToInt32((request != null && request.ContainsKey("api_key_index") ? request["api_key_index"] : null)),
            Convert.ToInt64((request != null && request.ContainsKey("account_index") ? request["account_index"] : null))
        );
        return this.formatSignedLighterTx(signedTx);
    }

    public List<object> lighterSignCreateSubAccount(object signer, IDictionary<string, object> request)
    {
        LighterSigner.Signer.SignedTx signedTx = ((LighterSigner.Signer)signer).SignCreateSubAccount(
            0x1, // skip nonce
            Convert.ToInt64((request != null && request.ContainsKey("nonce") ? request["nonce"] : null)),
            Convert.ToInt32((request != null && request.ContainsKey("api_key_index") ? request["api_key_index"] : null)),
            Convert.ToInt64((request != null && request.ContainsKey("account_index") ? request["account_index"] : null))
        );
        return this.formatSignedLighterTx(signedTx);
    }

    public List<object> lighterSignCancelAllOrders(object signer, IDictionary<string, object> request)
    {
        LighterSigner.Signer.SignedTx signedTx = ((LighterSigner.Signer)signer).SignCancelAllOrders(
            Convert.ToInt32((request != null && request.ContainsKey("time_in_force") ? request["time_in_force"] : null)),
            Convert.ToInt64((request != null && request.ContainsKey("time") ? request["time"] : null)),
            Convert.ToInt32(this.safeInteger(request, "cancel_all_market_index", 255)), // NilMarketIndex, every market
            0x1, // skip nonce
            Convert.ToInt64((request != null && request.ContainsKey("nonce") ? request["nonce"] : null)),
            Convert.ToInt32((request != null && request.ContainsKey("api_key_index") ? request["api_key_index"] : null)),
            Convert.ToInt64((request != null && request.ContainsKey("account_index") ? request["account_index"] : null))
        );
        return this.formatSignedLighterTx(signedTx);
    }

    public List<object> lighterSignModifyOrder(object signer, IDictionary<string, object> request)
    {
        LighterSigner.Signer.SignedTx signedTx = ((LighterSigner.Signer)signer).SignModifyOrder(
            Convert.ToInt32((request != null && request.ContainsKey("market_index") ? request["market_index"] : null)),
            Convert.ToInt64((request != null && request.ContainsKey("index") ? request["index"] : null)),
            Convert.ToInt64((request != null && request.ContainsKey("base_amount") ? request["base_amount"] : null)),
            Convert.ToInt64((request != null && request.ContainsKey("price") ? request["price"] : null)),
            Convert.ToInt64((request != null && request.ContainsKey("trigger_price") ? request["trigger_price"] : null)),
            Convert.ToInt64(this.safeInteger(request, "integrator_account_index", 0)),
            Convert.ToInt32(this.safeInteger(request, "integrator_taker_fee", 0)),
            Convert.ToInt32(this.safeInteger(request, "integrator_maker_fee", 0)),
            Convert.ToByte(this.safeInteger(request, "self_trade_behavior_mode", 0)), // SelfTradeBehaviorExpireMaker
            Convert.ToByte(this.safeInteger(request, "self_trade_equality_mode", 0)), // SelfTradeEqualityAccountIndex
            0x1, // skip nonce
            Convert.ToInt64((request != null && request.ContainsKey("nonce") ? request["nonce"] : null)),
            Convert.ToInt64(this.safeInteger(request, "order_version", 0)), // NilOrderVersion
            Convert.ToInt32((request != null && request.ContainsKey("api_key_index") ? request["api_key_index"] : null)),
            Convert.ToInt64((request != null && request.ContainsKey("account_index") ? request["account_index"] : null))
        );
        return this.formatSignedLighterTx(signedTx);
    }

    public List<object> lighterSignTransfer(object signer, IDictionary<string, object> request)
    {
        LighterSigner.Signer.SignedTx signedTx = ((LighterSigner.Signer)signer).SignTransfer(
            Convert.ToInt32((request != null && request.ContainsKey("to_account_index") ? request["to_account_index"] : null)),
            Convert.ToInt16((request != null && request.ContainsKey("asset_index") ? request["asset_index"] : null)),
            Convert.ToByte((request != null && request.ContainsKey("from_route_type") ? request["from_route_type"] : null)),
            Convert.ToByte((request != null && request.ContainsKey("to_route_type") ? request["to_route_type"] : null)),
            Convert.ToInt64((request != null && request.ContainsKey("amount") ? request["amount"] : null)),
            Convert.ToInt64((request != null && request.ContainsKey("usdc_fee") ? request["usdc_fee"] : null)),
            (request != null && request.ContainsKey("memo") ? request["memo"] : null).ToString(),
            0x1, // skip nonce
            Convert.ToInt64((request != null && request.ContainsKey("nonce") ? request["nonce"] : null)),
            Convert.ToInt32((request != null && request.ContainsKey("api_key_index") ? request["api_key_index"] : null)),
            Convert.ToInt64((request != null && request.ContainsKey("account_index") ? request["account_index"] : null))
        );
        return this.formatSignedLighterTx(signedTx);
    }

    public List<object> lighterSignUpdateLeverage(object signer, IDictionary<string, object> request)
    {
        LighterSigner.Signer.SignedTx signedTx = ((LighterSigner.Signer)signer).SignUpdateLeverage(
            Convert.ToInt32((request != null && request.ContainsKey("market_index") ? request["market_index"] : null)),
            Convert.ToInt32((request != null && request.ContainsKey("initial_margin_fraction") ? request["initial_margin_fraction"] : null)),
            Convert.ToInt32((request != null && request.ContainsKey("margin_mode") ? request["margin_mode"] : null)),
            0x1, // skip nonce
            Convert.ToInt64((request != null && request.ContainsKey("nonce") ? request["nonce"] : null)),
            Convert.ToInt32((request != null && request.ContainsKey("api_key_index") ? request["api_key_index"] : null)),
            Convert.ToInt64((request != null && request.ContainsKey("account_index") ? request["account_index"] : null))
        );
        return this.formatSignedLighterTx(signedTx);
    }

    public string lighterCreateAuthToken(object signer, IDictionary<string, object> request)
    {
        string authToken = ((LighterSigner.Signer)signer).CreateAuthToken(
            Convert.ToInt64((request != null && request.ContainsKey("deadline") ? request["deadline"] : null)),
            Convert.ToInt32((request != null && request.ContainsKey("api_key_index") ? request["api_key_index"] : null)),
            Convert.ToInt64((request != null && request.ContainsKey("account_index") ? request["account_index"] : null))
        );
        return authToken;
    }

    public List<object> lighterSignUpdateMargin(object signer, IDictionary<string, object> request)
    {
        LighterSigner.Signer.SignedTx signedTx = ((LighterSigner.Signer)signer).SignUpdateMargin(
            Convert.ToInt32((request != null && request.ContainsKey("market_index") ? request["market_index"] : null)),
            Convert.ToInt64((request != null && request.ContainsKey("usdc_amount") ? request["usdc_amount"] : null)),
            Convert.ToInt32((request != null && request.ContainsKey("direction") ? request["direction"] : null)),
            0x1, // skip nonce
            Convert.ToInt64((request != null && request.ContainsKey("nonce") ? request["nonce"] : null)),
            Convert.ToInt32((request != null && request.ContainsKey("api_key_index") ? request["api_key_index"] : null)),
            Convert.ToInt64((request != null && request.ContainsKey("account_index") ? request["account_index"] : null))
        );
        return this.formatSignedLighterTx(signedTx);
    }

    public List<object> lighterSignApproveIntegrator(object signer, IDictionary<string, object> request)
    {
        LighterSigner.Signer.SignedTx signedTx = ((LighterSigner.Signer)signer).SignApproveIntegrator(
            Convert.ToInt64((request != null && request.ContainsKey("integrator_account_index") ? request["integrator_account_index"] : null)),
            Convert.ToInt32((request != null && request.ContainsKey("integrator_taker_fee") ? request["integrator_taker_fee"] : null)),
            Convert.ToInt32((request != null && request.ContainsKey("integrator_maker_fee") ? request["integrator_maker_fee"] : null)),
            Convert.ToInt64((request != null && request.ContainsKey("approval_expiry") ? request["approval_expiry"] : null)),
            0x1, // skip nonce
            Convert.ToInt64((request != null && request.ContainsKey("nonce") ? request["nonce"] : null)),
            Convert.ToInt32((request != null && request.ContainsKey("api_key_index") ? request["api_key_index"] : null)),
            Convert.ToInt64((request != null && request.ContainsKey("account_index") ? request["account_index"] : null))
        );
        return this.formatSignedLighterTx(signedTx);
    }

    // same shape as formatSignedLighterTx: { privateKey, publicKey } list, every path a list
    public List<object> lighterGenerateApiKey(object signer)
    {
        var (PrivateKey, PublicKey) = ((LighterSigner.Signer)signer).GenerateAPIKey();
        List<object> res = new List<object>() { };
        ((IList<object>)res).Add(PrivateKey);
        ((IList<object>)res).Add(PublicKey);
        return res;
    }

    public List<object> lighterSignChangePubkey(object signer, IDictionary<string, object> request)
    {
        LighterSigner.Signer.SignedTx signedTx = ((LighterSigner.Signer)signer).SignChangePubKey(
            (request != null && request.ContainsKey("pubkey") ? request["pubkey"] : null).ToString(),
            0x1, // skip nonce
            Convert.ToInt64((request != null && request.ContainsKey("nonce") ? request["nonce"] : null)),
            Convert.ToInt32((request != null && request.ContainsKey("api_key_index") ? request["api_key_index"] : null)),
            Convert.ToInt64((request != null && request.ContainsKey("account_index") ? request["account_index"] : null))
        );
        return this.formatSignedLighterTx(signedTx);
    }
}