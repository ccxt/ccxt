import asyncio
from pprint import pprint

import random


async def coro(tag):
    # print(">", tag)
    await asyncio.sleep(1)
    print("<Finished tag:", tag)
    return tag


loop = asyncio.get_event_loop()

group1 = asyncio.gather(*[coro(i) for i in range(1, 6)])

results = loop.run_until_complete(group1)

loop.close()

pprint(results)