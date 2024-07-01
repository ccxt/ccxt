import asyncio
from typing import AsyncIterator, Callable, Optional, TypeVar

NodeType = TypeVar("NodeType")


class AbortWorker:
    """
    Aborts a worker.
    """

    def __lt__(self, other):
        return True


async def traverse_tree(
    get_children_callback: Callable[[NodeType], AsyncIterator[NodeType]],
    root: NodeType,
    n_workers: Optional[int] = None,
):
    """
    Traverses a tree as follows:
    1. Starts by calling get_children_callback(root). This function should return the children of
    root in the tree that you want to visit.
    2. Call get_children_callback() on each of the children to get more nodes, and repeat.

    The order of execution is not guaranteed, except that it is more similar to DFS than BFS in
    terms of memory consumption.
    """
    if n_workers is None:
        n_workers = 128

    # Keep the visited nodes in a priority queue so that children will be prioritized over their
    # parents. This keeps the behavior similar to DFS rather than BFS (e.g., with one worker this
    # is exactly DFS).
    queue: asyncio.PriorityQueue = asyncio.PriorityQueue()
    await queue.put((0, root))

    async def worker_func():
        while True:
            item = await queue.get()
            try:
                if isinstance(item, AbortWorker):
                    return

                height, node = item
                async for child in get_children_callback(node):
                    await queue.put((height - 1, child))
            finally:
                queue.task_done()

    async def closer(n_workers: int):
        # Wait for all tasks to be marked with task_done. This guarantees that all tasks were
        # completed, and no new task will be created.
        await queue.join()
        # Push n_workers dummy objects to the queue, which will make the workers exit nicely.
        for _ in range(n_workers):
            await queue.put(AbortWorker())

    assert n_workers is not None
    await asyncio.gather(closer(n_workers=n_workers), *(worker_func() for _ in range(n_workers)))
    assert queue.empty()
