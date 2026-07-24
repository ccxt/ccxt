# Changelog

## 1.1.0 - 2026-04-20

### Scene 1: Order Query & Appeal Handling
- Added: Order detail query by order number (`getUserOrderDetail`)
- Added: Order list with rich filters — status, trade type, asset, date range (`listOrders`)
- Added: Enhanced order history with counterpart nickname and advertisement role (`listUserOrderHistory`)
- Added: Complaint/appeal status query with pagination and filters (`query-complaints`)
- Added: Order status branch handling (completed → timeline, in-progress → countdown, appealing → auto-show appeal)

### Scene 2: Ad Publish & Management (Merchant Only)
- Added: Market reference price query for pricing decisions (`getReferencePrice`)
- Added: Market ad search with advertiser info (`search`)
- Added: Get available ad categories for current user (`getAvailableAdsCategory`)
- Added: Get user's configured payment methods (`getPayMethodByUserId`)
- Added: List all system trade methods (`listAllTradeMethods`)
- Added: Publish new advertisements with confirmation flow (`post`) **[write operation]**
- Added: Update existing ad parameters with diff display (`update`) **[write operation]**
- Added: Batch update ad status — online/offline/close (`updateStatus`) **[write operation]**

### Merchant & Support
- Added: Merchant profile and ad listings query (`getAdDetails`)
- Added: List supported digital currencies (`digitalCurrency/list`)
- Added: List supported fiat currencies (`fiatCurrency/list`)

## 1.0.1 - 2026-03-25

- Changed: Update order placement link format from filtered list page to ad-specific detail page using `adNo` parameter (`https://c2c.binance.com/en/adv?code={adNo}`)

## 1.0.0 - 2026-03-24

- Initial release
