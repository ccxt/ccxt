# CCXT Integration, Certification And Promotion FAQ

-------------------------------------------------------------------------------------

## Integration

### What does it mean to get listed or integrated with CCXT?

Please, see the description of our offer here: https://ccxt.trade/offer

Integrating an exchange API means implementing it within the CCXT framework and adding the support for automated algorithmic trading with the exchange using the CCXT. Upon integration, the exchange is placed on the list of [Supported Exchanges](https://github.com/ccxt/ccxt#supported-cryptocurrency-exchange-markets).

### How to integrate an exchange with the CCXT library?

In general, there are two ways to get an exchange integrated with CCXT.

The first is to submit a Pull Request via GitHub. If you haven't had a chance yet, please look at our [CONTRIBUTING](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md) guidelines and [Requirements](https://github.com/ccxt/ccxt/wiki/Requirements). They should provide you with the information you need to make the Javascript submission we require.

When you submit the `.js` code it will be automatically checked by our CI system. If it fails, it will show where your code doesn't follow our requirements. Errors will be outlined for you, and you will be able to fix those and resubmit again. A final human review will be done after it passes all automated testing, and our Dev Team is very active in commenting on PRs and providing feedback to questions as you are working on the submission.

One key note is that the `.js` used for submission is a restricted and formalized subset of Javascript. This is because our transpiler needs to understand 100% of the code in order to generate the PHP and Python code from it. As a result, all submissions need to follow the rules as described in our [CONTRIBUTING](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md) doc, **literally, to a word**.

Forcing devs to work in this subset of `.js` often causes delays, but it is the only way for us to get all three languages for each integration into the CCXT library. PRs that violate the [CONTRIBUTING](https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md) guidelines have to be fixed before they get merged.

In our experience it takes external devs between 6-8 weeks to successfully pass the automated testing, and even then this is usually without all methods implemented properly. This may be fine for some contributors, but we also understand that sometimes an exchange wants to get an integration done quickly so that they can take advantage of an opportunity.

So, the second option is to hire the CCXT Dev Team to do the integration for you. All of the CCXT Certified integrations were done by our Dev Team, as well as many more of the more popular exchanges. We do not charge for integrating the implementations done by the exchanges themselves or by other contributors. We only charge if the exchange wants the CCXT Dev Team to do a high quality job quickly in a guaranteed time.

### How much does it cost to hire the CCXT Dev Team?

Our pricing on integrations starts at **$10000** for prioritizing and integrating a standard and conventional centralized RESTful Exchange API.

Non-standard, non-conventional, and decentralized APIs have their own complexities, therefore the costs for integrating distributed REST APIs start at **$15000** and the final quote depends on the specifics of the API in question. We require a 50% prepayment to commence work on our side. The integration is paid in stablecoins.

### How long does it take to get integrated after hiring the CCXT Dev Team?

If you hire us to do the integration, we will have it done and published usually within 10-12 days with all available methods. Non-standard integrations can take longer. We guarantee the work if bugs are later found.

### We don't have a REST API, but we have a WebSocket API, is it possible to integrate a WS API?

CCXT is currently a REST-only library, however, the CCXT Dev Team recognizes the demand for WS APIs and has [announced plans on the release of **CCXT Pro**](https://github.com/ccxt/ccxt/issues/56#issuecomment-507290536), which is a professional addon to CCXT with support for WebSockets and more. CCXT Pro will be released before the end of 2019.

CCXT Pro WebSocket integration costs:

- a sub-only WS API, **$10000+**
- a sub+pub WS API, **$15000+**

-------------------------------------------------------------------------------------

## Certification

### What does it mean to get Certified with CCXT?

To exchanges we also offer the [Certification](https://github.com/ccxt/ccxt/wiki/Certification) program.

That puts the exchange on our list of [Certified Exchanges](https://github.com/ccxt/ccxt#certified-cryptocurrency-exchanges) on the top of our main page, and highlights the exchange for the users with a distinct and immediately noticeable "Certified" badge. Certification helps exchanges get liquidity and expand the userbase.

The Certified badge is a quality trademark, therefore the exchange API has to conform to [Requirements](https://github.com/ccxt/ccxt/wiki/Requirements).

### How much does it cost to be Certified?

The Certification is prepaid on a yearly basis, so it's a recurring payment. It costs **$5000/year**, and over that year the CCXT Dev Team will guarantee the support, updates, quickfixes, and maintenance to ensure the best API experience for algotraders.

### How long does it take to get Certified?

For integrations done by the CCXT Dev Team – can get you Certified immediately after your Certification payment. For integrations submitted via PRs it can take time to clean up the code first.

### Can we get higher in the list of Certified exchanges?

No, all lists are ordered in a natural alphanumeric order.

-------------------------------------------------------------------------------------

## Promotion

### What kinds of advertisement or promotion do you offer?

We have the following advertising options:

- The main banner in the "Sponsored Promotion" section at the top of our page on GitHub: https://github.com/ccxt/ccxt#sponsored-promotion
- The "See Also" section that contains one-liner ads: https://github.com/ccxt/ccxt#see-also

### How much does promotion cost?

- The Sponsored Promotion banner costs **$3000/month**, prepaid, with a minimum of 1 month.
- The "See Also" one-liner advertisement costs **$500/month** with a minimum of 3 months prepaid.

-------------------------------------------------------------------------------------

## Statistics

### Can you provide statistics on the user response the exchange after the integration?

- We are #3 after bitcoin here: https://github.com/topics/bitcoin
- We are #2 after ethereum here: https://github.com/topics/ethereum

We currently serve more than 500k downloads every month. Earlier this year we've hit 1M downloads per month. More of our stats: https://github.com/ccxt/ccxt/wiki/Stats.

### Regarding ads possibilities, can you share some numbers of clicks / views monthly for each one, please?

The monthly pageview stats are over 100000 views each month, of those 20000-25000 are unique hosts. The links from our GitHub page are direct links, we do not control the clickthrough. Our traffic is a highly-concentrated professional algotrading traffic, that means that it brings liquidity and trading capital with it, as the CCXT library is used by companies and private traders on a daily basis.
