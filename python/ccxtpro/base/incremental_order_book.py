class IncrementalOrderBook:
    def __init__(self, snapshot=None):
        self.orderBook = snapshot if snapshot else {
            'bids': [[0, 0]],
            'asks': [[float('inf'), 0]],
            'timestamp': None,
            'datetime': None,
            'nonce': None
        }

    def incrementOrderBook(self, nonce, operation, side, price, amount):
        if nonce is not None and self.orderBook['nonce'] is not None and nonce <= self.orderBook['nonce']:
            return
        self.orderBook['nonce'] = nonce

        book_side = self.orderBook[side]
        for i, order in enumerate(book_side):
            if order[0] > price if side == 'bids' else order[0] <= price:
                continue
            if operation == 'add':
                if order[0] == price:
                    order[1] += amount
                    return
                else:
                    book_side.insert(i, [price, amount])
                    return
            elif operation == 'delete':
                book_side.pop(i)
                return
            elif operation == 'absolute':
                order[1] = amount
                return

    def update(self, deltas):
        for delta in deltas:
            self.incrementOrderBook(*delta)
        self.clean_abstraction('bids')
        self.clean_abstraction('asks')

    def clean_abstraction(self, side):
        book_side = self.orderBook[side]
        if book_side[-1][1] == 0:
            book_side.pop()
