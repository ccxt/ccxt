#!/usr/bin/env python3
"""
Astralx CCXT异步客户端简单演示脚本
演示如何使用刚实现的Astralx CCXT异步客户端调用各种接口
"""

import asyncio
import os
import sys
from datetime import datetime

try:
    import ccxt.async_support as ccxt
except ImportError:
    print("错误: 无法导入ccxt库，请确保在CCXT项目根目录运行此脚本")
    sys.exit(1)


class AstralxSimpleDemo:
    def __init__(self):
        # API密钥配置
        self.api_key = 'Tood595p6iXeptc2L16fbP72ikX02EaOLxS5YlVBolZ42b5W0cnut5jKxbjdJa8d'
        self.secret = 'Ni34OAt65jIYXuPC4uxctkoT9hKF9LMMoxGr22JisvPmDx8xSUQBky03HsLTc2Ja'

        # 创建异步客户端
        self.exchange = ccxt.astralx({
            'apiKey': self.api_key,
            'secret': self.secret,
            'sandbox': False,
            'verbose': False,
        })

    async def test_public_api(self):
        """测试公有API接口"""
        print("🔍 测试公有API接口...")
        try:
            # 1. 获取服务器时间
            server_time = await self.exchange.fetch_time()
            print(f"✅ 服务器时间: {datetime.fromtimestamp(server_time / 1000)}")

            # 2. 获取市场信息
            markets = await self.exchange.fetch_markets()
            print(f"✅ 市场数量: {len(markets)}")

            # 显示几个市场示例
            sample_markets = [m for m in markets if 'BTC' in m['symbol']][:3]
            for market in sample_markets:
                print(f"   📊 {market['symbol']} - {market['type']}")

            # 3. 获取BTC/USDT:USDT的ticker
            symbol = 'BTC/USDT:USDT'
            ticker = await self.exchange.fetch_ticker(symbol)
            print(f"✅ {symbol} Ticker:")
            print(f"   最新价: {ticker['last'] or 'N/A'}")
            print(f"   24h最高: {ticker['high'] or 'N/A'}")
            print(f"   24h最低: {ticker['low'] or 'N/A'}")
            print(f"   24h成交量: {ticker['baseVolume'] or 0:.2f}")

            # 4. 获取深度数据
            orderbook = await self.exchange.fetch_order_book(symbol, limit=3)
            print(f"✅ {symbol} 深度数据:")
            print("   买盘:")
            for i, bid in enumerate(orderbook['bids'][:3]):
                print(f"     {i + 1}. {bid[0]} × {bid[1]}")
            print("   卖盘:")
            for i, ask in enumerate(orderbook['asks'][:3]):
                print(f"     {i + 1}. {ask[0]} × {ask[1]}")

            return True

        except Exception as e:
            print(f"❌ 公有API测试失败: {e}")
            return False

    async def test_private_api(self):
        """测试私有API接口"""
        print("\n🔐 测试私有API接口...")
        try:
            # 1. 获取账户余额
            balance = await self.exchange.fetch_balance()
            print("✅ 账户余额:")
            total_balance = {k: v for k, v in balance['total'].items() if v > 0}
            if total_balance:
                for currency, amount in total_balance.items():
                    free = balance['free'].get(currency, 0)
                    used = balance['used'].get(currency, 0)
                    print(f"   💰 {currency}: 总额={amount}, 可用={free}, 冻结={used}")
            else:
                print("   💰 账户余额为空")

            # 2. 获取持仓信息
            positions = await self.exchange.fetch_positions()
            print("✅ 持仓信息:")
            if positions:
                for position in positions:
                    if position['contracts'] > 0:
                        print(f"   📈 {position['symbol']}: {position['side']} {position['contracts']}张")
                        print(f"      入场价: {position['entryPrice']}, 未实现盈亏: {position['unrealizedPnl']}")
            else:
                print("   📈 当前无持仓")

            # 3. 获取当前委托
            open_orders = await self.exchange.fetch_open_orders()
            print("✅ 当前委托:")
            if open_orders:
                for order in open_orders[:2]:  # 显示前2个
                    print(f"   📋 {order['symbol']}: {order['side']} {order['type']}")
                    print(f"      数量: {order['amount']}, 价格: {order['price']}")
            else:
                print("   📋 当前无委托")

            # 4. 获取成交记录
            trades = await self.exchange.fetch_my_trades(limit=2)
            print("✅ 最近成交:")
            if trades:
                for trade in trades:
                    dt = datetime.fromtimestamp(trade['timestamp'] / 1000)
                    print(f"   💸 {trade['symbol']}: {trade['side']} {trade['amount']} @ {trade['price']}")
                    print(f"      时间: {dt}")
            else:
                print("   💸 最近无成交")

            return True

        except Exception as e:
            print(f"❌ 私有API测试失败: {e}")
            return False

    async def test_market_data(self):
        """测试市场数据接口"""
        print("\n📈 测试市场数据接口...")
        try:
            symbol = 'BTC/USDT:USDT'

            # 1. 获取K线数据
            ohlcv = await self.exchange.fetch_ohlcv(symbol, '1h', limit=2)
            print("✅ K线数据:")
            for i, candle in enumerate(ohlcv):
                dt = datetime.fromtimestamp(candle[0] / 1000)
                print(f"   {i + 1}. {dt}: 开={candle[1]}, 高={candle[2]}, 低={candle[3]}, 收={candle[4]}")

            # 2. 获取最新交易
            trades = await self.exchange.fetch_trades(symbol, limit=2)
            print("✅ 最新交易:")
            for i, trade in enumerate(trades):
                dt = datetime.fromtimestamp(trade['timestamp'] / 1000)
                print(f"   {i + 1}. {dt}: {trade['side']} {trade['amount']} @ {trade['price']}")

            # 3. 获取资金费率
            try:
                funding_rate = await self.exchange.fetch_funding_rate(symbol)
                print("✅ 资金费率:")
                print(f"   当前费率: {funding_rate['fundingRate'] or 'N/A'}")
                if funding_rate['nextFundingTimestamp']:
                    next_time = datetime.fromtimestamp(funding_rate['nextFundingTimestamp'] / 1000)
                    print(f"   下次费率时间: {next_time}")
                else:
                    print("   下次费率时间: N/A")
            except Exception as e:
                print(f"⚠️  资金费率获取失败: {e}")

            return True

        except Exception as e:
            print(f"❌ 市场数据测试失败: {e}")
            return False

    async def run_demo(self):
        """运行完整的演示"""
        print("🚀 Astralx CCXT异步客户端演示")
        print("=" * 50)
        print(f"开始时间: {datetime.now()}")
        print()

        success_count = 0
        total_tests = 3

        try:
            # 测试公有API
            if await self.test_public_api():
                success_count += 1

            # 测试私有API
            if await self.test_private_api():
                success_count += 1

            # 测试市场数据
            if await self.test_market_data():
                success_count += 1

            # 显示测试结果
            print("\n" + "=" * 50)
            print(f"测试结果: {success_count}/{total_tests} 通过")

            if success_count == total_tests:
                print("🎉 所有测试通过！Astralx CCXT客户端工作正常")
            else:
                print("⚠️  部分测试失败，请检查API密钥和网络连接")

        except Exception as e:
            print(f"💥 演示过程中发生严重错误: {e}")
        finally:
            # 关闭连接
            await self.exchange.close()
            print(f"\n结束时间: {datetime.now()}")


async def main():
    """主函数"""
    demo = AstralxSimpleDemo()
    await demo.run_demo()


if __name__ == "__main__":
    # 运行异步演示
    asyncio.run(main())
