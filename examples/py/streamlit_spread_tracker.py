"""
Streamlit Micro-Arbitrage Dashboard Example

This script demonstrates how to build a simple graphical user interface (UI)
using Streamlit to fetch and compare cryptocurrency prices across multiple
exchanges concurrently using CCXT. It calculates the maximum spread and
visualizes the data for micro-arbitrage opportunities.
"""

import streamlit as st
import ccxt
import pandas as pd

# Page configuration
st.set_page_config(page_title="Crypto Spread Tracker", layout="centered", page_icon="📊")

st.title("📊 Crypto Spread Tracker (Micro-Arbitrage)")
st.markdown("Real-time cryptocurrency price comparison across major exchanges.")

# Initialize exchanges
exchanges = {
    "Binance": ccxt.binance(),
    "Bybit": ccxt.bybit(),
    "OKX": ccxt.okx(),
    "KuCoin": ccxt.kucoin(),
    "Gate.io": ccxt.gate(),
    "Kraken": ccxt.kraken()
}

# User interface: Input field for trading pair
symbol = st.text_input("Enter trading pair (e.g., BTC/USDT, ETH/USDT, DOGE/USDT):", "BTC/USDT").upper()

if st.button("Fetch Prices", type="primary"):
    prices = {}

    with st.spinner('Fetching data from exchanges (this may take a few seconds)...'):
        for name, exchange in exchanges.items():
            try:
                # Fetch current ticker
                ticker = exchange.fetch_ticker(symbol)
                prices[name] = ticker['last']
            except Exception:
                # If the symbol is not available on this exchange or a network error occurs
                prices[name] = None

    # Filter out exchanges where the symbol was not found
    valid_prices = {k: v for k, v in prices.items() if v is not None}

    if valid_prices:
        st.subheader(f"Current prices for {symbol}")

        # Create a 3-column grid for UI layout
        cols = st.columns(3)

        for i, (name, price) in enumerate(valid_prices.items()):
            # Distribute metrics across the columns
            with cols[i % 3]:
                st.metric(label=name, value=f"${price:,.4f}")

        st.divider()

        if len(valid_prices) > 1:
            # Find minimum and maximum prices
            min_exchange = min(valid_prices, key=valid_prices.get)
            max_exchange = max(valid_prices, key=valid_prices.get)
            min_price = valid_prices[min_exchange]
            max_price = valid_prices[max_exchange]

            spread_usd = max_price - min_price
            spread_pct = (spread_usd / min_price) * 100

            st.subheader("💡 Arbitrage Analysis")
            st.success(f"**Best place to BUY:** {min_exchange} (${min_price:,.4f})")
            st.error(f"**Best place to SELL:** {max_exchange} (${max_price:,.4f})")
            st.markdown(f"### Maximum Spread: **${spread_usd:,.4f}** ({spread_pct:.3f}%)")

            # Sort prices from lowest to highest for better visualization
            sorted_prices = dict(sorted(valid_prices.items(), key=lambda item: item[1]))
            st.bar_chart(pd.Series(sorted_prices, name="Price in USD"))
        else:
            st.warning("Not enough data to calculate spread (symbol found on only one exchange).")
    else:
        st.error("Could not find this trading pair on any of the selected exchanges. Please check the symbol format.")
