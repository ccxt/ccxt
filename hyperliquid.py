import requests
import json

INDEXER_URL = "https://api.hyperliquid.xyz/info"

def query_rewards():
    resp = requests.post(INDEXER_URL, json={"type":"broker", "brokerCode": 1})
    return json.loads(resp.text)

if __name__ == "__main__":
    rewards = query_rewards()
    client_states = rewards["clientStates"]
    print('clients:', len(client_states))
    fee = 0
    for reward in client_states:
        fee += float(reward["cumFeesRewardedToBroker"])
    print("fees received", fee)