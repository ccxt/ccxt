# DRAFT — for legal review, not published

> This is a working draft of the terms of service for the hosted CCXT MCP server. It is **not** in force and makes no commitment until legal review approves it and it is published at `https://docs.ccxt.com/docs/mcp-terms` (the URL both plugin manifests already point to).
>
> It is written from what the Service does today (phase 1: anonymous, read-only public market data). Items in **[brackets]** are open questions for legal review; nothing in brackets is decided. Phase 2 (sign-in and server-stored exchange keys) would need new terms before launch.
>
> Do not reuse `https://ccxt.com/terms`: that page is the CCXT Terminal terms of service, a different product.

---

# Terms of service — hosted CCXT MCP server

Last updated: **[date of publication]**

These terms govern your use of the hosted CCXT MCP server at `https://docs.ccxt.com/mcp` (the "Service"), which you use through an AI assistant such as Claude or ChatGPT. **[Legal entity name]** ("we") operates the Service. By adding the Service to an assistant or using it, you accept these terms.

The CCXT library and the local CCXT MCP server are open-source software under the MIT License. That license covers the software; these terms cover the hosted Service.

## 1. What the Service does

The Service gives AI assistants read-only access to public market data (prices, order books, candles, trades and market lists) from a selection of cryptocurrency exchanges, with optional interactive views. It does not place orders, move funds, access exchange accounts or accept credentials.

## 2. Not financial advice

The Service provides data, not advice. Nothing it returns, and nothing an assistant says based on it, is investment, financial, legal or tax advice, or a recommendation to buy or sell anything. You are responsible for your own decisions. **[Legal review: jurisdiction-specific wording for financial-data services.]**

## 3. Data accuracy and availability

- Market data comes from third-party exchanges. It may be delayed (responses can be cached for a few seconds, candles for up to a minute), incomplete, inaccurate or unavailable, and exchanges may change or withdraw it at any time.
- The set of exchanges, markets and tools offered may change without notice.
- The Service is provided free of charge, "as is" and "as available", without any warranty and without a service level. We may limit, suspend or stop it at any time. **[Legal review: warranty disclaimer and limitation of liability wording.]**

## 4. Fair use

The Service is shared by everyone who uses it, and every request reaches the exchanges from our servers. To keep it working for everyone, you agree not to:

- exceed or try to get around the Service's rate limits, for example by spreading requests across many addresses;
- use the Service to scrape or bulk-download market data, or to run automated trading or high-frequency systems (use the open-source CCXT library directly for that);
- send credentials, personal data or other content the Service does not ask for;
- interfere with, probe or attack the Service, or use it to breach any exchange's terms of service;
- use the Service unlawfully.

We may block requests or clients that break these rules.

## 5. Third parties

The exchanges are independent third parties; their own terms apply to their data. Your AI assistant's provider (for example Anthropic or OpenAI) is also a third party, and its terms govern your use of the assistant. We are not responsible for either. **[Legal review: whether the exchanges' API terms permit redistributing their public data through the Service; see POLICY-RISKS.md.]**

## 6. Privacy

The privacy policy at `https://docs.ccxt.com/docs/mcp-privacy` describes what the Service records.

## 7. Changes

We may change these terms by publishing a new version at this address. Continued use after a change means you accept it. **[Legal review: notice period.]**

## 8. Law and disputes

**[Legal review: governing law, venue, and any consumer-protection carve-outs.]**

## 9. Contact

**[Contact email.]** Issues and questions: https://github.com/ccxt/ccxt/issues.
