import os
import sys


# ------------------------------------------------------------------------------

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
sys.path.append(root)

import ccxt.pro as ccxt
import logging
import psutil
import socket

KILL_EVERY = 5


def tcp_kill():
    current_process = psutil.Process(os.getpid())
    connections = current_process.net_connections(kind='tcp')
    for conn in connections:
        if conn.status == psutil.CONN_ESTABLISHED:
            try:
                sock = socket.fromfd(conn.fd, socket.AF_INET, socket.SOCK_STREAM)
                local_address = conn.laddr.ip
                local_port = conn.laddr.port
                sock.shutdown(socket.SHUT_RDWR)
                sock.close()
                logging.info(f"Connection closed: {local_address}:{local_port} -> {conn.raddr.ip}:{conn.raddr.port}")
            except Exception as e:
                logging.error(f"Error closing connection: {e}")


async def test_abnormal_close():
    print('test_abnormal_close')
    just_reconnected = False
    ex = ccxt.binance()
    last_kill = None
    while True:
        if not last_kill:
            last_kill = ex.seconds()
        if ex.seconds() - last_kill > KILL_EVERY:
            tcp_kill()
            last_kill = None
        try:
            await ex.watch_trades('BTC/USDT:USDT')
            if just_reconnected:
                break
        except Exception as e:
            just_reconnected = True
    assert just_reconnected, "Failed to reconnect"
    await ex.close()
