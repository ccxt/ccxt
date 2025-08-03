#include <ccxt/base/exchange.h>
#include <url.h>

namespace ccxt {

class binance : public Exchange 
{
public:
    binance(bool verbose = false);
    virtual ~binance() {};
        
    // fetches the current timestamp in milliseconds from the exchange server
    long fetchTime(boost::beast::net::thread_pool& ioc) override;

    // fetches all available currencies on an exchange
    std::map<std::string, Currency> fetchCurrencies();

    // Retrieves data on all markets for binance
    std::map<MarketType, std::vector<Market>> fetchMarkets(boost::beast::net::thread_pool& ioc);

private:
    // Exchange-specific options
    bool _sandboxMode{false};
    std::vector<MarketType> _fetchMarkets{MarketType::SPOT, MarketType::LINEAR, MarketType::INVERSE};
    bool _fetchCurrencies{true};
    std::string _defaultTimeInForce{"GTC"};
    MarketType _defaultType{MarketType::SPOT};
    MarketType _defaultSubType;
    bool _hasAlreadyAuthenticatedSuccessfully{false};
    bool _throwMarginModeAlreadySet{false};
    std::string _fetchPositions{"positionRisk"};
    int _recvWindow{10 * 1000};
    int _timeDifference{0};
    bool _adjustForTimeDifference{false};

    void initFees() override;
    bool isInverse(const MarketType type, const std::string& subType = "") const;
    bool isLinear(const MarketType type, const std::string& subType = "") const;
    void setSandboxMode(bool enabled) override;
    long convertExpireDate(const std::string& date) const;  // parse YYMMDD to timestamp
    Market createExpiredOptionMarket(const std::string& symbol); // support expired option contracts
    Market market(const std::string& symbol);
    nlohmann::json fetchMarket(boost::beast::net::thread_pool& ioc, Url& url);
    std::vector<Market> parseMarkets(const nlohmann::json& markets, MarketType type);
    Market parseMarket(const nlohmann::json& market, MarketType type);

    std::map<std::string, std::string> _newOrderRespType{
                    {"market", "FULL"},
                    {"limit",  "FULL"} // we change it from "ACK" by default to "FULL" (returns immediately if limit is not hit)
                };
    bool _quoteOrderQty{true};
    std::map<std::string, std::string> _broker {
                    {"spot", "x-R4BD3S82"},
                    {"margin", "x-R4BD3S82"},
                    {"future", "x-xcKtGhcu"},
                    {"delivery", "x-xcKtGhcu"}
                };
    std::map<std::string, std::string> _accountsByType {
                    {"main", "MAIN"},
                    {"spot", "MAIN"},
                    {"funding", "FUNDING"},
                    {"margin", "MARGIN"},
                    {"cross", "MARGIN"},
                    {"future", "UMFUTURE"},
                    {"delivery", "CMFUTURE"},
                    {"linear", "UMFUTURE"},
                    {"inverse", "CMFUTURE"}
                };
    std::map<std::string, std::string> _accountsById {
                    {"MAIN", "spot"},
                    {"FUNDING", "funding"},
                    {"MARGIN", "margin"},
                    {"UMFUTURE", "linear"},
                    {"CMFUTURE", "inverse"}
                };
    std::map<std::string, std::string> _networks {
                    {"ERC20", "ETH"},
                    {"TRC20", "TRX"},
                    {"BEP2", "BNB"},
                    {"BEP20", "BSC"},
                    {"OMNI", "OMNI"},
                    {"EOS", "EOS"},
                    {"SPL", "SOL"}
                };

    std::map<std::string, std::string> _networksById {
                    {"tronscan.org", "TRC20"},
                    {"etherscan.io", "ERC20"},
                    {"bscscan.com", "BSC"},
                    {"explorer.binance.org", "BEP2"},
                    {"bithomp.com", "XRP"},
                    {"bloks.io", "EOS"},
                    {"stellar.expert", "XLM"},
                    {"blockchair.com/bitcoin", "BTC"},
                    {"blockchair.com/bitcoin-cash", "BCH"},
                    {"blockchair.com/ecash", "XEC"},
                    {"explorer.litecoin.net", "LTC"},
                    {"explorer.avax.network", "AVAX"},                
                    {"solscan.io", "SO"},
                    {"polkadot.subscan.io", "DOT"},
                    {"dashboard.internetcomputer.org", "ICP"},
                    {"explorer.chiliz.com", "CHZ"},
                    {"cardanoscan.io", "ADA"},
                    {"mainnet.theoan.com", "AION"},
                    {"algoexplorer.io", "ALGO"},
                    {"explorer.ambrosus.com", "AMB"},
                    {"viewblock.io/zilliqa", "ZI"},
                    {"viewblock.io/arweave", "AR"},
                    {"explorer.ark.io", "ARK"},
                    {"atomscan.com", "ATOM"},
                    {"www.mintscan.io", "CTK"},
                    {"explorer.bitcoindiamond.org", "BCD"},
                    {"btgexplorer.com", "BTG"},
                    {"bts.ai", "BTS"},
                    {"explorer.celo.org", "CELO"},
                    {"explorer.nervos.org", "CKB"},
                    {"cerebro.cortexlabs.ai", "CTXC"},
                    {"chainz.cryptoid.info", "VIA"},
                    {"explorer.dcrdata.org", "DCR"},
                    {"digiexplorer.info", "DGB"},
                    {"dock.subscan.io", "DOCK"},
                    {"dogechain.info", "DOGE"},
                    {"explorer.elrond.com", "EGLD"},
                    {"blockscout.com", "ETC"},
                    {"explore-fetchhub.fetch.ai", "FET"},
                    {"filfox.info", "FI"},
                    {"fio.bloks.io", "FIO"},
                    {"explorer.firo.org", "FIRO"},
                    {"neoscan.io", "NEO"},
                    {"ftmscan.com", "FTM"},
                    {"explorer.gochain.io", "GO"},
                    {"block.gxb.io", "GXS"},
                    {"hash-hash.info", "HBAR"},
                    {"www.hiveblockexplorer.com", "HIVE"},
                    {"explorer.helium.com", "HNT"},
                    {"tracker.icon.foundation", "ICX"},
                    {"www.iostabc.com", "IOST"},
                    {"explorer.iota.org", "IOTA"},
                    {"iotexscan.io", "IOTX"},
                    {"irishub.iobscan.io", "IRIS"},
                    {"kava.mintscan.io", "KAVA"},
                    {"scope.klaytn.com", "KLAY"},
                    {"kmdexplorer.io", "KMD"},
                    {"kusama.subscan.io", "KSM"},
                    {"explorer.lto.network", "LTO"},
                    {"polygonscan.com", "POLYGON"},
                    {"explorer.ont.io", "ONT"},
                    {"minaexplorer.com", "MINA"},
                    {"nanolooker.com", "NANO"},
                    {"explorer.nebulas.io", "NAS"},
                    {"explorer.nbs.plus", "NBS"},
                    {"explorer.nebl.io", "NEB"},
                    {"nulscan.io", "NULS"},
                    {"nxscan.com", "NXS"},
                    {"explorer.harmony.one", "ONE"},
                    {"explorer.poa.network", "POA"},
                    {"qtum.info", "QTUM"},
                    {"explorer.rsk.co", "RSK"},
                    {"www.oasisscan.com", "ROSE"},
                    {"ravencoin.network", "RVN"},
                    {"sc.tokenview.com", "SC"},
                    {"secretnodes.com", "SCRT"},
                    {"explorer.skycoin.com", "SKY"},
                    {"steemscan.com", "STEEM"},
                    {"explorer.stacks.co", "STX"},
                    {"www.thetascan.io", "THETA"},
                    {"scan.tomochain.com", "TOMO"},
                    {"explore.vechain.org", "VET"},
                    {"explorer.vite.net", "VITE"},
                    {"www.wanscan.org", "WAN"},
                    {"wavesexplorer.com", "WAVES"},
                    {"wax.eosx.io", "WAXP"},
                    {"waltonchain.pro", "WTC"},
                    {"chain.nem.ninja", "XEM"},
                    {"verge-blockchain.info", "XVG"},
                    {"explorer.yoyow.org", "YOYOW"},
                    {"explorer.zcha.in", "ZEC"},
                    {"explorer.zensystem.io", "ZEN"}
                };
    std::map<std::string, std::map<std::string, std::string>> _impliedNetworks {
                    {"ETH", {{ "ERC20", "ETH" }}},
                    {"TRX", {{ "TRC20", "TRX" }}}
                };
    std::map<std::string, bool> _legalMoney {
                    {"MXN", true},
                    {"UGX", true},
                    {"SEK", true},
                    {"CHF", true},
                    {"VND", true},
                    {"AED", true},
                    {"DKK", true},
                    {"KZT", true},
                    {"HUF", true},
                    {"PEN", true},
                    {"PHP", true},
                    {"USD", true},
                    {"TRY", true},
                    {"EUR", true},
                    {"NGN", true},
                    {"PLN", true},
                    {"BRL", true},
                    {"ZAR", true},
                    {"KES", true},
                    {"ARS", true},
                    {"RUB", true},
                    {"AUD", true},
                    {"NOK", true},
                    {"CZK", true},
                    {"GBP", true},
                    {"UAH", true},
                    {"GHS", true},
                    {"HKD", true},
                    {"CAD", true},
                    {"INR", true},
                    {"JPY", true},
                    {"NZD", true}
                };
    std::map<std::string, std::string> _legalMoneyCurrenciesById { {"BUSD", "USD"} };
    // https://binance-docs.github.io/apidocs/spot/en/#error-codes-2
    std::string _exceptions{};
};
}
