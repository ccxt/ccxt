from ctypes import c_char_p, string_at, cdll
import os
import platform
import threading

curDir = os.path.dirname(__file__)


class bytetradelib(object):
    def __init__(self):
        self.libbytetradepython = 0
        if(platform.system() == 'Linux'):
            self.libbytetradepython = cdll.LoadLibrary(curDir + '/libbytetradepython.so')
        elif(platform.system() == 'Windows'):
            if(platform.architecture()[0] == '64bit'):
                self.libbytetradepython = cdll.LoadLibrary(curDir + '/libbytetradepython.dll')
            else:
                self.libbytetradepython = cdll.LoadLibrary(curDir + '/libbytetradepython32.dll')
        elif(platform.system() == 'Darwin'):
            self.libbytetradepython = cdll.LoadLibrary(curDir + '/libbytetradepython.dylib')
        self.lock = threading.Lock()

    def get_address_from_wif_private_key(self, private_key):
        with self.lock:
            g = self.libbytetradepython.get_address_from_wif_private_key
            g.restype = c_char_p
            ret = g(bytes(private_key.encode('utf-8')), len(private_key))
            return ret.decode('utf-8')

    def get_publickey_from_wif_private_key(self, private_key):
        with self.lock:
            g = self.libbytetradepython.get_publickey_from_wif_private_key
            g.restype = c_char_p
            ret = g(bytes(private_key.encode('utf-8')), len(private_key))
            return ret.decode('utf-8')

    def get_order_id_from_tx_id(self, tx_id_str, op_id):
        with self.lock:
            g = self.libbytetradepython.get_order_id_from_tx_id
            g.restype = c_char_p
            ret = g(bytes(tx_id_str.encode('utf-8')), op_id)
            ret_string = string_at(ret)
            return ret_string.decode('utf-8')

    def create_order_transaction(self, fee, creator, side, order_type, market_name, amount, price, use_btt_as_fee, freeze_btt_fee, dapp, private_key):
        with self.lock:
            c = self.libbytetradepython.create_order_transaction
            c.restype = c_char_p
            ret = c(
                bytes(fee.encode('utf-8')),
                bytes(creator.encode('utf-8')),
                side,
                order_type,
                bytes(market_name.encode('utf-8')),
                bytes(amount.encode('utf-8')),
                bytes(price.encode('utf-8')),
                use_btt_as_fee,
                bytes(freeze_btt_fee.encode('utf-8')),
                bytes(dapp.encode('utf-8')),
                bytes(private_key.encode('utf-8')),
                len(private_key)
            )
            return ret.decode('utf-8')

    def create_order3_transaction(self, fee, creator, side, order_type, market_name, amount, price, use_btt_as_fee, freeze_btt_fee, custom_btt_fee_rate, custom_no_btt_fee_rate, money_id, stock_id, dapp, private_key):
        with self.lock:
            c = self.libbytetradepython.create_order3_transaction
            c.restype = c_char_p
            ret = c(
                bytes(fee.encode('utf-8')),
                bytes(creator.encode('utf-8')),
                side,
                order_type,
                bytes(market_name.encode('utf-8')),
                bytes(amount.encode('utf-8')),
                bytes(price.encode('utf-8')),
                use_btt_as_fee,
                bytes(freeze_btt_fee.encode('utf-8')),
                custom_btt_fee_rate,
                custom_no_btt_fee_rate,
                money_id,
                stock_id,
                bytes(dapp.encode('utf-8')),
                bytes(private_key.encode('utf-8')),
                len(private_key)
            )
            return ret.decode('utf-8')

    def cancel_order_transaction(self, fee, creator, market_name, order_id, dapp, private_key):
        with self.lock:
            c = self.libbytetradepython.cancel_order_transaction
            c.restype = c_char_p
            ret = c(
                bytes(fee.encode('utf-8')),
                bytes(creator.encode('utf-8')),
                bytes(market_name.encode('utf-8')),
                bytes(order_id.encode('utf-8')),
                bytes(dapp.encode('utf-8')),
                bytes(private_key.encode('utf-8')),
                len(private_key)
            )
            return ret.decode('utf-8')

    def cancel_order2_transaction(self, fee, creator, market_name, order_id, money_id, stock_id, dapp, private_key):
        with self.lock:
            c = self.libbytetradepython.cancel_order2_transaction
            c.restype = c_char_p
            ret = c(
                bytes(fee.encode('utf-8')),
                bytes(creator.encode('utf-8')),
                bytes(market_name.encode('utf-8')),
                bytes(order_id.encode('utf-8')),
                money_id,
                stock_id,
                bytes(dapp.encode('utf-8')),
                bytes(private_key.encode('utf-8')),
                len(private_key)
            )
            return ret.decode('utf-8')

    def transfer_order_transaction(self, fee, from_id, to_id, asset_type, amount, dapp, private_key):
        with self.lock:
            t = self.libbytetradepython.transfer_order_transaction
            t.restype = c_char_p
            ret = t(
                bytes(fee.encode('utf-8')),
                bytes(from_id.encode('utf-8')),
                bytes(to_id.encode('utf-8')),
                asset_type,
                bytes(amount.encode('utf-8')),
                bytes(dapp.encode('utf-8')),
                bytes(private_key.encode('utf-8')),
                len(private_key)
            )
            return ret.decode('utf-8')

    def transfer2_order_transaction(self, fee, from_id, to_id, asset_type, amount, dapp, message, private_key):
        with self.lock:
            t = self.libbytetradepython.transfer2_order_transaction
            t.restype = c_char_p
            ret = t(
                bytes(fee.encode('utf-8')),
                bytes(from_id.encode('utf-8')),
                bytes(to_id.encode('utf-8')),
                asset_type,
                bytes(amount.encode('utf-8')),
                bytes(dapp.encode('utf-8')),
                bytes(message.encode('utf-8')),
                bytes(private_key.encode('utf-8')),
                len(private_key)
            )
            return ret.decode('utf-8')

    def propose_withdraw_transaction(self, fee, from_id, to_external_address, asset_type, amount, dapp, private_key):
        with self.lock:
            t = self.libbytetradepython.propose_transaction
            t.restype = c_char_p
            ret = t(
                bytes(fee.encode('utf-8')),
                bytes(from_id.encode('utf-8')),
                bytes(to_external_address.encode('utf-8')),
                asset_type,
                bytes(amount.encode('utf-8')),
                bytes(dapp.encode('utf-8')),
                bytes(private_key.encode('utf-8')),
                len(private_key)
            )
            return ret.decode('utf-8')

    def withdraw2_transaction(self, fee, from_id, to_external_address, asset_type, amount, asset_fee, dapp, private_key):
        with self.lock:
            t = self.libbytetradepython.withdraw2_transaction
            t.restype = c_char_p
            ret = t(
                bytes(fee.encode('utf-8')),
                bytes(from_id.encode('utf-8')),
                bytes(to_external_address.encode('utf-8')),
                asset_type,
                bytes(amount.encode('utf-8')),
                bytes(asset_fee.encode('utf-8')),
                bytes(dapp.encode('utf-8')),
                bytes(private_key.encode('utf-8')),
                len(private_key)
            )
            return ret.decode('utf-8')
