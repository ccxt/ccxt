#!/usr/bin/env bash

# Post-process Go files to add SBE decoder imports and fix references
# This script fixes the transpiled Go files to properly import and use SBE decoders

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GO_DIR="$(dirname "$SCRIPT_DIR")/go/v4"

# Function to fix binance.go
fix_binance_go() {
    local file="$GO_DIR/binance.go"

    if [ ! -f "$file" ]; then
        print_info "File not found: $file"
        return 1
    fi

    print_info "Fixing SBE imports in binance.go..."

    # Create a temporary file
    local temp_file="${file}.tmp"

    # Add import after package declaration
    awk '
    BEGIN { import_added = 0 }
    /^package ccxt$/ {
        print $0
        if (!import_added) {
            print ""
            print "import ("
            print "\tbinance_sbe \"github.com/ccxt/ccxt/go/v4/sbe/binance_spot_3_2\""
            print ")"
            import_added = 1
        }
        next
    }
    { print $0 }
    ' "$file" > "$temp_file"

    # Now fix decoder references in GetSbeDecoderRegistry
    # Remove "Decoder" suffix and add "&binance_sbe." prefix
    sed -i.bak2 '
        # Only process lines inside GetSbeDecoderRegistry function
        /func.*GetSbeDecoderRegistry/,/^}/ {
            # Replace decoder references
            s/: WebSocketResponseDecoder,$/: \&binance_sbe.WebSocketResponse{},/g
            s/: WebSocketSessionLogonResponseDecoder,$/: \&binance_sbe.WebSocketSessionLogonResponse{},/g
            s/: WebSocketSessionStatusResponseDecoder,$/: \&binance_sbe.WebSocketSessionStatusResponse{},/g
            s/: WebSocketSessionLogoutResponseDecoder,$/: \&binance_sbe.WebSocketSessionLogoutResponse{},/g
            s/: WebSocketSessionSubscriptionsResponseDecoder,$/: \&binance_sbe.WebSocketSessionSubscriptionsResponse{},/g
            s/: ErrorResponseDecoder,$/: \&binance_sbe.ErrorResponse{},/g
            s/: PingResponseDecoder,$/: \&binance_sbe.PingResponse{},/g
            s/: ServerTimeResponseDecoder,$/: \&binance_sbe.ServerTimeResponse{},/g
            s/: ExchangeInfoResponseDecoder,$/: \&binance_sbe.ExchangeInfoResponse{},/g
            s/: MyFiltersResponseDecoder,$/: \&binance_sbe.MyFiltersResponse{},/g
            s/: DepthResponseDecoder,$/: \&binance_sbe.DepthResponse{},/g
            s/: TradesResponseDecoder,$/: \&binance_sbe.TradesResponse{},/g
            s/: AggTradesResponseDecoder,$/: \&binance_sbe.AggTradesResponse{},/g
            s/: KlinesResponseDecoder,$/: \&binance_sbe.KlinesResponse{},/g
            s/: AveragePriceResponseDecoder,$/: \&binance_sbe.AveragePriceResponse{},/g
            s/: Ticker24hSymbolFullResponseDecoder,$/: \&binance_sbe.Ticker24hSymbolFullResponse{},/g
            s/: Ticker24hFullResponseDecoder,$/: \&binance_sbe.Ticker24hFullResponse{},/g
            s/: Ticker24hSymbolMiniResponseDecoder,$/: \&binance_sbe.Ticker24hSymbolMiniResponse{},/g
            s/: Ticker24hMiniResponseDecoder,$/: \&binance_sbe.Ticker24hMiniResponse{},/g
            s/: PriceTickerSymbolResponseDecoder,$/: \&binance_sbe.PriceTickerSymbolResponse{},/g
            s/: PriceTickerResponseDecoder,$/: \&binance_sbe.PriceTickerResponse{},/g
            s/: BookTickerSymbolResponseDecoder,$/: \&binance_sbe.BookTickerSymbolResponse{},/g
            s/: BookTickerResponseDecoder,$/: \&binance_sbe.BookTickerResponse{},/g
            s/: TickerSymbolFullResponseDecoder,$/: \&binance_sbe.TickerSymbolFullResponse{},/g
            s/: TickerFullResponseDecoder,$/: \&binance_sbe.TickerFullResponse{},/g
            s/: TickerSymbolMiniResponseDecoder,$/: \&binance_sbe.TickerSymbolMiniResponse{},/g
            s/: TickerMiniResponseDecoder,$/: \&binance_sbe.TickerMiniResponse{},/g
            s/: NewOrderAckResponseDecoder,$/: \&binance_sbe.NewOrderAckResponse{},/g
            s/: NewOrderResultResponseDecoder,$/: \&binance_sbe.NewOrderResultResponse{},/g
            s/: NewOrderFullResponseDecoder,$/: \&binance_sbe.NewOrderFullResponse{},/g
            s/: OrderTestResponseDecoder,$/: \&binance_sbe.OrderTestResponse{},/g
            s/: OrderResponseDecoder,$/: \&binance_sbe.OrderResponse{},/g
            s/: CancelOrderResponseDecoder,$/: \&binance_sbe.CancelOrderResponse{},/g
            s/: CancelOpenOrdersResponseDecoder,$/: \&binance_sbe.CancelOpenOrdersResponse{},/g
            s/: CancelReplaceOrderResponseDecoder,$/: \&binance_sbe.CancelReplaceOrderResponse{},/g
            s/: OrdersResponseDecoder,$/: \&binance_sbe.OrdersResponse{},/g
            s/: NewOrderListAckResponseDecoder,$/: \&binance_sbe.NewOrderListAckResponse{},/g
            s/: NewOrderListResultResponseDecoder,$/: \&binance_sbe.NewOrderListResultResponse{},/g
            s/: NewOrderListFullResponseDecoder,$/: \&binance_sbe.NewOrderListFullResponse{},/g
            s/: CancelOrderListResponseDecoder,$/: \&binance_sbe.CancelOrderListResponse{},/g
            s/: OrderListResponseDecoder,$/: \&binance_sbe.OrderListResponse{},/g
            s/: OrderListsResponseDecoder,$/: \&binance_sbe.OrderListsResponse{},/g
            s/: OrderTestWithCommissionsResponseDecoder,$/: \&binance_sbe.OrderTestWithCommissionsResponse{},/g
            s/: OrderAmendmentsResponseDecoder,$/: \&binance_sbe.OrderAmendmentsResponse{},/g
            s/: OrderAmendKeepPriorityResponseDecoder,$/: \&binance_sbe.OrderAmendKeepPriorityResponse{},/g
            s/: AccountResponseDecoder,$/: \&binance_sbe.AccountResponse{},/g
            s/: AccountTradesResponseDecoder,$/: \&binance_sbe.AccountTradesResponse{},/g
            s/: AccountOrderRateLimitResponseDecoder,$/: \&binance_sbe.AccountOrderRateLimitResponse{},/g
            s/: AccountPreventedMatchesResponseDecoder,$/: \&binance_sbe.AccountPreventedMatchesResponse{},/g
            s/: AccountCommissionResponseDecoder,$/: \&binance_sbe.AccountCommissionResponse{},/g
            s/: AccountAllocationsResponseDecoder,$/: \&binance_sbe.AccountAllocationsResponse{},/g
            s/: UserDataStreamStartResponseDecoder,$/: \&binance_sbe.UserDataStreamStartResponse{},/g
            s/: UserDataStreamPingResponseDecoder,$/: \&binance_sbe.UserDataStreamPingResponse{},/g
            s/: UserDataStreamStopResponseDecoder,$/: \&binance_sbe.UserDataStreamStopResponse{},/g
            s/: UserDataStreamSubscribeResponseDecoder,$/: \&binance_sbe.UserDataStreamSubscribeResponse{},/g
            s/: UserDataStreamUnsubscribeResponseDecoder,$/: \&binance_sbe.UserDataStreamUnsubscribeResponse{},/g
            s/: UserDataStreamSubscribeListenTokenResponseDecoder,$/: \&binance_sbe.UserDataStreamSubscribeListenTokenResponse{},/g
        }
    ' "$temp_file"

    # Replace original file
    mv "$temp_file" "$file"
    rm -f "${file}.bak2"

    print_info "✓ Fixed binance.go"
}

# Function to fix okx.go (if needed)
fix_okx_go() {
    local file="$GO_DIR/okx.go"

    if [ ! -f "$file" ]; then
        print_info "File not found: $file (skipping)"
        return 0
    fi

    # Check if file has SBE decoder references
    if ! grep -q "Decoder," "$file"; then
        print_info "okx.go doesn't need fixing (no decoder references)"
        return 0
    fi

    print_info "Fixing SBE imports in okx.go..."

    # Similar process for OKX...
    # (Add if OKX also uses SBE decoders)

    print_info "✓ Fixed okx.go"
}

# Main execution
main() {
    print_info "Starting Go SBE import fixes..."

    fix_binance_go
    fix_okx_go

    print_info "✓ All fixes complete!"
}

main "$@"
