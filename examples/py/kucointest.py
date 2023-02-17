import requests
from time import sleep
from datetime import datetime

print(f'{datetime.now()} - Starting rate limit test\n')

sleepDelay = 0.05 # 50ms
num = 0
while True:
    response = requests.get('https://api.kucoin.com/api/v1/market/candles?type=1min&symbol=BTC-USDT')
    print(response.status_code)
    if (response.status_code == 429):
        # "Once the rate limit is exceeded, the system will restrict your use of your IP or account for 10s."
        sleep(10)
        print(f'{datetime.now()} - Too many requests (rate limit: {sleepDelay} seconds)')
        sleepDelay += 0.01 # increase by 10ms everytime we get an error
    sleep(sleepDelay)