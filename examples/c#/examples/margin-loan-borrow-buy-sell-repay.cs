using ccxt;
using ccxt.pro;

namespace examples;

partial class Examples
{
// AUTO-TRANSPILE //
// Note, this is just an example and might not yet work on other exchanges, which are being still unified.
    async public Task marginLoanBorrowBuySellRepay()
    {
        // ########## user inputs ##########
        var exchange = new ccxt.binance(new Dictionary<string, object>()
        {
            { "apiKey", "xxx" },
            { "secret", "xxx" },
        });
        var symbol = "BUSD/USDT"; // set target symbol
        var marginMode = "isolated"; // margin mode (cross or isolated)
        var collateral_coin = "USDT"; // which asset you want to use for margin-borrow collateral
        var borrow_coin = "BUSD"; // which coin to borrow
        var order_side = "sell"; // which side to trade
        var amount_to_trade = 14; // how many coins to sell
        var order_type = "limit"; // order type (can be market, limit or etc)
        var limit_price = 0.99; // price to sell at (set undefined/null/None if market-order)
        var
            margin_magnitude =
                5; // target margin (aka 'leverage'). This might also be obtainable using other unified methods, but for example purposes, we set here manually
        // ########## end of user-inputs ##########
        //
        // for example purposes, let's also check available balance at first
        var balance_margin = await exchange.fetchBalance(new Dictionary<string, object>()
        {
            { "defaultType", "margin" },
            { "marginMode", marginMode },
        }); // use `defaultType` because of temporary bug, otherwise, after several days, you can use `type` too.
        // if we don't have enought coins, then we have to borrow at first
        var needed_amount_to_borrow = null; // will be auto-set below
        if (isTrue(isGreaterThan(amount_to_trade,
                getValue(getValue(getValue(balance_margin, symbol), borrow_coin), "free"))))
        {
            needed_amount_to_borrow = subtract(amount_to_trade,
                getValue(getValue(getValue(balance_margin, symbol), borrow_coin), "free"));
            Console.WriteLine("hmm, I have only ",
                getValue(getValue(getValue(balance_margin, symbol), borrow_coin), "free"), " ", borrow_coin,
                " in margin balance, and still need additional ", needed_amount_to_borrow,
                " to make an order. Lets borrow it.");
            // To initate a borrow, at first, check if we have enough collateral (for this example, as we make a sell-short, we need '-1' to keep for collateral currency)
            var needed_collateral_amount = divide(needed_amount_to_borrow, (subtract(margin_magnitude, 1)));
            // Check if we have any collateral to get permission for borrow
            if (isTrue(isLessThan(getValue(getValue(getValue(balance_margin, symbol), collateral_coin), "free"),
                    needed_collateral_amount)))
            {
                // If we don't have enough collateral, then let's try to transfer collateral-asset from spot-balance to margin-balance
                Console.WriteLine("hmm, I have only ",
                    getValue(getValue(getValue(balance_margin, symbol), collateral_coin), "free"), " in balance, but ",
                    needed_collateral_amount, " collateral is needed. I should transfer ", needed_collateral_amount,
                    " from spot");
                // let's check if we have spot balance at all
                var balance_spot = await exchange.fetchBalance(new Dictionary<string, object>()
                {
                    { "type", "spot" },
                });
                if (isTrue(isLessThan(exchange.parseNumber(getValue(getValue(balance_spot, collateral_coin), "free")),
                        needed_collateral_amount)))
                {
                    Console.WriteLine("hmm, I neither do have enough balance on spot - only ",
                        getValue(getValue(balance_spot, collateral_coin), "free"), ". Script can not continue...");
                    return;
                }
                else
                {
                    Console.WriteLine("Transferring  ", needed_collateral_amount, " to margin account");
                    await exchange.transfer(collateral_coin, needed_collateral_amount, "spot", marginMode,
                        new Dictionary<string, object>()
                        {
                            { "symbol", symbol },
                        });
                }
            }

            // now, as we have enough margin collateral, initiate borrow
            Console.WriteLine("Initiating margin borrow of ", needed_amount_to_borrow, " ", borrow_coin);
            var borrowResult = await exchange.borrowMargin(borrow_coin, needed_amount_to_borrow, symbol,
                new Dictionary<string, object>()
                {
                    { "marginMode", marginMode },
                });
        }

        Console.WriteLine("Submitting order.");
        var order = await exchange.createOrder(symbol, order_type, order_side, amount_to_trade, limit_price,
            new Dictionary<string, object>()
            {
                { "marginMode", marginMode },
            });
        Console.WriteLine("Order was submitted !", getValue(order, "id"));
        //
        //
        // ...
        // ...
        // some time later, if you want to repay the loan back (like 'close the position')...
        // ...
        // ...
        //
        //
        // set the "repay-back" amount (for this example snippet, this will be same amount that we borrowed above)
        if (isTrue(!isEqual(needed_amount_to_borrow, null)))
        {
            var amount_to_repay_back = needed_amount_to_borrow;
            // At first, you need to get back the borrowed coin, by making an opposide trade
            Console.WriteLine("Making purchase back of ", amount_to_repay_back, " ", borrow_coin, " to repay it back.");
            var purchase_back_price = 1.01;
            var order_back = await exchange.createOrder(symbol, order_type,
                (((bool)isTrue(isEqual(order_side, "buy"))) ? "sell" : "buy"), amount_to_repay_back,
                purchase_back_price, new Dictionary<string, object>()
                {
                    { "marginMode", marginMode },
                });
            Console.WriteLine("Now, repaying the loan.");
            var repayResult = await exchange.repayMargin(borrow_coin, amount_to_repay_back, symbol,
                new Dictionary<string, object>()
                {
                    { "marginMode", marginMode },
                });
            Console.WriteLine("finished.");
        }
    }
}