# Changelog

## 0.1.2 - 2026-06-15

### Fixed
- **Pre-order endpoint pointed at gray environment**: Switched the documented pre-order path from `papi/v1/ramp/connect/gray/buy/pre-order` to the production path `papi/v1/ramp/connect/buy/pre-order` (Quick Reference table + bash example). Merchants copying the previous example would have integrated against the gray test environment.

### Changed
- Removed `connect-gray` / `GrayTest` / `your-api-key` example values from the bash example and `merchantCode` / `merchantName` parameter descriptions; replaced with neutral placeholders (`<YOUR_CLIENT_ID>`, `<YOUR_API_KEY>`, `<YOUR_MERCHANT_CODE>`, `<YOUR_MERCHANT_NAME>`) so users supply their own Binance-issued credentials.
- Reworded the Customization "Testing" note to drop the `connect-gray` reference.
- Bumped User-Agent string to `onchain-pay-open-api/0.1.2 (Skill)` in `scripts/sign_and_call.sh`.

## 0.1.1 - 2026-03-17

### Fixed
- **Cross-platform timestamp generation**: Fixed `date +%s000` to use `$(($(date +%s) * 1000))` for proper millisecond timestamp on macOS, Linux, and BSD
- **Documentation updates**: Updated all examples in SKILL.md and authentication.md to use cross-platform compatible timestamp generation
- **Improved error handling**: Added notes about common JSON parsing errors caused by incorrect timestamp format

### Changed
- Updated `scripts/sign_and_call.sh` to use arithmetic expansion for timestamp generation
- Added troubleshooting section in SKILL.md for timestamp-related issues

## 0.1.0 - 2026-03-11

- Initial release
- Support for Payment Method List (v1/v2), Trading Pairs, Estimated Quote, Pre-order, Get Order, Crypto Network, P2P Trading Pairs endpoints
- RSA SHA256 request signing via bundled script
- Multi-account credential management via `.local.md`
- Customization options for pre-order (Onchain-Pay Easy, P2P Express, Skip Cashier, etc.)
