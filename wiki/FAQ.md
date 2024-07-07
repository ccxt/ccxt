  # Frequently Asked Questions

  ## How to create an order with takeProfit+stopLoss?
  To create an order with both takeProfit and stopLoss parameters, you'll need to use a method that supports setting these parameters directly if the exchange allows it. You can check by looking at `exchange.has['createOrderWithTakeProfitAndStopLoss']`, `exchange.has['createStopLossOrder']` and `exchange.has['createTakeProfitOrder']`.

  Some exchanges might require you to create separate orders for takeProfit and stopLoss. For exchanges that support it directly, you would typically use the createOrder method with additional parameters for takeProfit and stopLoss.
  See more at [StopLoss And TakeProfit Orders Attached To A Position](Manual.md#stoploss-and-takeprofit-orders-attached-to-a-position)

  ## How to create a spot market buy with cost?
  To create a market-buy order with cost, first, you need to check if the exchange supports that feature (`exchange.has['createMarketBuyOrderWithCost']).
  If it does, then you can use the `createMarketBuyOrderWithCost` method.
  Example:
  ```Python
  order = await exchange.createMarketBuyOrderWithCost(symbol, cost)
  ```

  See more: [Market Buys](Manual.md#market-buys)

  ## What's the difference between trading spot and swap/perpetual futures?
  Spot trading involves buying or selling a financial instrument (like a cryptocurrency) for immediate delivery. It's straightforward, involving the direct exchange of assets.

  Swap trading, on the other hand, involves derivative contracts where two parties exchange financial instruments or cash flows at a set date in the future, based on the underlying asset. Swaps are often used for leverage, speculation, or hedging and do not necessarily involve the exchange of the underlying asset until the contract expires.


  Besides that, you will be handling contracts if you're trading swaps and not the base currency (e.g., BTC) directly, so if you create an order with `amount = 1`, the amount in BTC will vary depending on the `contractSize`. You can check the contract size by doing:

  ```Python
  await exchange.loadMarkets()
  symbol = 'XRP/USDT:USDT'
  market = exchange.market(symbol)
  print(market['contractSize'])
  ```

  ## How to place a reduceOnly order?
  A reduceOnly order is a type of order that can only reduce a position, not increase it. To place a reduceOnly order, you typically use the createOrder method with a reduceOnly parameter set to true. This ensures that the order will only execute if it decreases the size of an open position, and it will either partially fill or not fill at all if executing it would increase the position size.

<!-- tabs:start -->
#### **Javascript**
```javascript
const params = {
    'reduceOnly': true, // set to true if you want to close a position, set to false if you want to open a new position
}
const order = await exchange.createOrder (symbol, type, side, amount, price, params)
```
#### **Python**
```python
params = {
    'reduceOnly': True, # set to True if you want to close a position, set to False if you want to open a new position
}
order = exchange.create_order (symbol, type, side, amount, price, params)
```
#### **PHP**
```php
$params = {
    'reduceOnly': true, // set to true if you want to close a position, set to false if you want to open a new position
}
$order = $exchange->create_order ($symbol, $type, $side, $amount, $price, $params);
```
<!-- tabs:end -->


  See more: [Trailing Orders](Manual.md#trailing-orders)

  ## How to check the endpoint used by the unified method?
  To check the endpoint used by a unified method in the CCXT library, you would typically need to refer to the source code of the library for the specific exchange implementation you're interested in. The unified methods in CCXT abstract away the details of the specific endpoints they interact with, so this information is not directly exposed via the library's API. For detailed inspection, you can look at the implementation of the method for the particular exchange in the CCXT library's source code on GitHub.

  See more: [Unified API](Manual.md#unified-api)

  ## I'm trying to run the code, but it's not working, how do I fix it?

  If your question is formulated in a short manner like the above, we won't help. We don't teach programming. If you're unable to read and understand the [Manual](https://github.com/ccxt/ccxt/wiki) or you can't follow precisely the guides from the [CONTRIBUTING](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md) doc on how to report an issue, we won't help either. Read the CONTRIBUTING guides on how to report an issue and read the Manual. You should not risk anyone's money and time without reading the entire Manual very carefully. You should not risk anything if you're not used to a lot of reading with tons of details. Also, if you don't have the confidence with the programming language you're using, there are much better places for coding fundamentals and practice. Search for `python tutorials`, `js videos`, play with examples, this is how other people climb up the learning curve. No shortcuts, if you want to learn something.

  ## What is required to get help?

  When asking a question:

  - Use the search button for duplicates first!
  - **Post your request and response in `verbose` mode!** Add `exchange.verbose = true` right before the line you're having issues with, and copypaste what you see on your screen. It's written and mentioned everywhere, in the [Troubleshooting](https://github.com/ccxt/ccxt/wiki/Manual#troubleshooting) section, in the [README](https://github.com/ccxt/ccxt/blob/master/README.md) and in many answers to similar questions among [previous issues](https://github.com/ccxt/ccxt/issues) and [pull requests](https://github.com/ccxt/ccxt/pulls). No excuses. The verbose output should include both the request and response from the exchange.
  - Include the full error callstack!
  - Write your programming language **and language version number**
  - Write the CCXT / CCXT Pro library version number
  - Which exchange it is
  - Which method you're trying to call

  - **Post your code** to reproduce the problem. Make it a complete short runnable program, don't swallow the lines and make it as compact as you can (5-10 lines of code), including the exchange instantation code. Remove all irrelevant parts from it, leaving just the essence of the code to reproduce the issue.
    - **DON'T POST SCREENSHOTS OF CODE OR ERRORS, POST THE OUTPUT AND CODE IN PLAIN TEXT!**
    - **Surround code and output with triple backticks: &#096;&#096;&#096;GOOD&#096;&#096;&#096;**.
    - Don't confuse the backtick symbol (&#096;) with the quote symbol (\'): '''BAD'''
    - Don't confuse a single backtick with triple backticks: &#096;BAD&#096;

  - **DO NOT POST YOUR `apiKey` AND `secret`!** Keep them safe (remove them before posting)!

  ## I am calling a method and I get an error, what am I doing wrong?

  You're not reporting the issue properly ) Please, help the community to help you ) Read this and follow the steps: https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-submit-an-issue. Once again, your code to reproduce the issue and your verbose request and response **ARE REQUIRED**. *Just the error traceback, or just the response, or just the request, or just the code – is not enough!*

  ## I got an incorrect result from a method call, can you help?

  Basically the same answer as the previous question. Read and follow **precisely**: https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-submit-an-issue. Once again, your code to reproduce the issue and your verbose request and response **ARE REQUIRED**. *Just the error traceback, or just the response, or just the request, or just the code – is not enough!*

  ## Can you implement feature `foo` in exchange `bar`?

  Yes, we can. And we will, if nobody else does that before us. There's very little point in asking this type of questions, because the answer is always positive. When someone asks if we can do this or that, the question is not about our abilities, it all boils down to time and management needed for implementing all accumulated feature requests.

  Moreover, this is an open-source library which is a work in progress. This means, that this project is intended to be developed by the community of users, who are using it. What you're asking is not whether we can or cannot implement it, in fact you're actually telling us to go do that particular task and this is not how we see a voluntary collaboration. Your contributions, PRs and commits are welcome: https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code.

  We don't give promises or estimates on the free open-source work. If you wish to speed it up, feel free to reach out to us via info@ccxt.trade.

  ## When will you add feature `foo` for exchange `bar` ? What's the estimated time? When should we expect this?

  We don't give promises or estimates on the open-source work. The reasoning behind this is explained in the previous paragraph.

  ## When will you add the support for an exchange requested in the Issues?

  Again, we can't promise on the dates for adding this or that exchange, due to reasons outlined above. The answer will always remain the same: _as soon as we can_.

  ## How long should I wait for a feature to be added? I need to decide whether to implement it myself or to wait for the CCXT Dev Team to implement it for me.

  Please, go for implemeting it yourself, do not wait for us. We will add it as soon as we can. Also, your contributions are very welcome:

  - https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code

  ## What's your progress on adding the feature `foo` that was requested earlier? How do you do implementing exchange `bar`?

  This type of questions is usually a waste of time, because answering it usually requires too much time for context-switching, and it often takes more time to answer this question, than to actually satisfy the request with code for a new feature or a new exchange. The progress of this open-source project is also open, so, whenever you're wondering how it is doing, take a look into commit history.

  ## What is the status of this PR? Any update?

  If it is not merged, it means that the PR contains errors, that should be fixed first. If it could be merged as is – we would merge it, and you wouldn't have asked this question in the first place. The most frequent reason for not merging a PR is a violation of any of the [CONTRIBUTING guidelines](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#derived-exchange-classes). Those guidelines should be taken literally, cannot skip a single line or word from there if you want your PR to be merged quickly. Code contributions that do not break the guidelines get merged almost immediately (usually, within hours).

  ## Can you point out the errors or what should I edit in my PR to get it merged into master branch?

  Unfortunately, we don't always have the time to quickly list out each and every single error in the code that prevents it from merging. It is often easier and faster to just go and fix the error rather than explain what one should do to fix it. Most of them are already outlined in the [CONTRIBUTING guidelines](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#derived-exchange-classes). The main rule of thumb is to follow **all guidelines literally**.

  ## Hey! The fix you've uploaded is in TypeScript, would you fix JavaScript / Python / PHP as well, please?

  Our build system generates exchange-specific JavaScript, Python and PHP code for us automatically, so it is transpiled from TypeScript, and there's no need to fix all languages separately one by one.

  Thus, if it is fixed in TypeScript, it is fixed in JavaScript NPM, Python pip and PHP Composer as well. The automatic build usually takes 15-20 minutes. Just upgrade your version with `npm`, `pip` or `composer` **after the new version arrives** and you'll be fine.

  More about it here:

  - https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#multilanguage-support
  - https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#transpiled-generated-files
