"""
Failsafe DNS Resolver for aiohttp.

Wraps the default AsyncResolver with a persistent in-memory cache.
If a live DNS lookup fails, returns the last known good result.
DNS is never on the critical path — cached IPs are always available.

Usage:
    from failsafe_resolver import DnsResolver

    resolver = DnsResolver()
    connector = aiohttp.TCPConnector(resolver=resolver, ttl_dns_cache=0)  # let DnsResolver manage caching
    session = aiohttp.ClientSession(connector=connector)
"""

import asyncio
import logging
import socket
import time
from typing import Any, Dict, List, Optional, Tuple

from aiohttp.abc import AbstractResolver


class DnsResolver(AbstractResolver):
    """
    DNS resolver that never fails.

    Strategy:
    1. On first call: resolve via system DNS (socket.getaddrinfo), cache result
    2. On subsequent calls: return cache if fresh (< ttl seconds old)
    3. If cache is stale: try live DNS in background, return stale cache immediately
    4. If live DNS fails: return last known good result (any age)
    5. Only fails if DNS has NEVER succeeded for a host (first ever call fails)
    """

    def __init__(
        self, ttl: int = 300, prefetch_hosts: List[str] = None, loop: Optional[asyncio.AbstractEventLoop] = None
    ):
        """
        Args:
            ttl: Cache TTL in seconds. Stale entries are still returned if refresh fails.
            prefetch_hosts: Hosts to resolve at init time (warmup).
        """
        self.ttl = ttl
        self._cache: Dict[str, Tuple[List, float]] = {}  # host -> (results, timestamp)
        self._lock = asyncio.Lock()
        self._refresh_tasks: Dict[str, asyncio.Task] = {}
        self._refresh_locks: Dict[str, asyncio.Lock] = {}

        self.logger = logging.getLogger(__class__.__name__)
        self.loop = loop or asyncio.get_running_loop()

        # Prefetch: resolve synchronously at init to warm cache
        for host in prefetch_hosts or []:
            try:
                results = self._sync_resolve(host)
                if results:
                    self._cache[host] = (results, time.monotonic())
                    ips = [r['host'] for r in results]
                    self.logger.info(f"prefetched {host} -> {ips}")
            except Exception as e:
                self.logger.warning(f"prefetch failed for {host}: {e}")

    def _sync_resolve(self, host: str, port: Optional[int] = None) -> List[Dict[str, Any]]:
        """Synchronous DNS resolution using system getaddrinfo."""
        infos = socket.getaddrinfo(host, port, socket.AF_INET, socket.SOCK_STREAM)
        results = []
        seen = set()
        for family, type_, proto, canonname, sockaddr in infos:
            ip = sockaddr[0]
            if ip not in seen:
                seen.add(ip)
                results.append(
                    {
                        'hostname': host,
                        'host': ip,
                        'port': port,
                        'family': family,
                        'proto': proto,
                        'flags': socket.AI_NUMERICHOST,
                    }
                )
        return results

    async def _async_resolve(self, host: str, port: Optional[int] = None) -> List[Dict[str, Any]]:
        """Async DNS resolution in thread pool."""
        return await self.loop.run_in_executor(None, self._sync_resolve, host, port)

    async def _background_refresh(self, host: str, port: Optional[int] = None):
        """Refresh cache in background. Never raises."""
        try:
            results = await self._async_resolve(host, port)
            if results:
                self._cache[host] = (results, time.monotonic())
                self.logger.debug(f"refreshed {host} -> {len(results)} addresses")
        except Exception as e:
            self.logger.warning(f"background refresh failed for {host}: {e}")
        finally:
            self._refresh_tasks.pop(host, None)

    async def resolve(self, host: str, port: int = 0, family: int = socket.AF_INET) -> List[Dict[str, Any]]:
        now = time.monotonic()
        cached = self._cache.get(host)

        if cached is not None:
            results, ts = cached
            age = now - ts

            if age < self.ttl:
                return [{**r, 'port': port} for r in results]

            if host not in self._refresh_tasks:
                self._refresh_tasks[host] = asyncio.create_task(self._background_refresh(host, port))
            return [{**r, 'port': port} for r in results]

        async with self._lock:
            cached = self._cache.get(host)
            if cached is not None:
                return [{**r, 'port': port} for r in cached[0]]

            try:
                results = await asyncio.wait_for(self._async_resolve(host, port), timeout=5.0)
                if results:
                    self._cache[host] = (results, time.monotonic())
                    return [{**r, 'port': port} for r in results]
            except Exception as e:
                self.logger.warning(f"async resolve failed for {host}: {e}, trying sync")

            try:
                results = self._sync_resolve(host, port)
                if results:
                    self._cache[host] = (results, time.monotonic())
                    return [{**r, 'port': port} for r in results]
            except Exception as e:
                self.logger.error(f"all DNS resolution failed for {host}: {e}")
                raise OSError(f"Failed to resolve {host}") from e

    async def force_refresh(self, host: str, port: Optional[int] = None):
        """Call this when a connection fails — forces immediate DNS refresh.
        Lock prevents concurrent refreshes for the same host."""
        if host not in self._refresh_locks:
            self._refresh_locks[host] = asyncio.Lock()

        if self._refresh_locks[host].locked():
            return  # another task is already refreshing, skip

        async with self._refresh_locks[host]:
            try:
                results = await self._async_resolve(host, port)
                if results:
                    old = self._cache.get(host)
                    old_ips = [r['host'] for r in old[0]] if old else []
                    new_ips = [r['host'] for r in results]
                    self._cache[host] = (results, time.monotonic())
                    if set(old_ips) != set(new_ips):
                        self.logger.warning(f"IPs changed for {host}: {old_ips} -> {new_ips}")
            except Exception as e:
                self.logger.warning(f"force refresh failed for {host}: {e}")

    async def close(self) -> None:
        """Cancel any pending refresh tasks."""
        for task in self._refresh_tasks.values():
            task.cancel()
        self._refresh_tasks.clear()
