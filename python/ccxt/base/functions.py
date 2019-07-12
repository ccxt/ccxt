# the s of the class should live here for more clarity (less code) in the class
# we should probably try to do the same with php...

import collections
import uuid as uniqueid
import hashlib
import datetime
import base64
import time
import json as jason
from numbers import Number
import re
import calendar

try:
    import urllib.parse as _urlencode    # Python 3
except ImportError:
    import urllib as _urlencode          # Python 2

try:
    basestring  # basestring was removed in Python 3
except NameError:
    basestring = str

try:
    long  # long integer was removed in Python 3
except NameError:
    long = int



def capitalize(string):
    # first character only, rest characters unchanged
    # the native pythonic .capitalize() method lowercases all other characters
    # which is an unwanted behaviour, therefore we use this custom implementation
    # check it yourself: print('foobar'.capitalize(), 'fooBar'.capitalize())
    if len(string) > 1:
        return "%s%s" % (string[0].upper(), string[1:])
    return string.upper()


def to_camelcase(underscore):
    parts = underscore.split('_')
    return parts[0] + ''.join(map(capitalize, parts[1:]))


def extend(*args):
    if args is not None:
        result = None
        if type(args[0]) is collections.OrderedDict:
            result = collections.OrderedDict()
        else:
            result = {}
        for arg in args:
            result.update(arg)
        return result
    return {}


def deep_extend(*args):
    result = None
    for arg in args:
        if isinstance(arg, dict):
            if not isinstance(result, dict):
                result = {}
            for key in arg:
                result[key] = deep_extend(result[key] if key in result else None, arg[key])
        else:
            result = arg
    return result


def filter_by(array, key, value=None):
    if value:
        grouped = group_by(array, key)
        if value in grouped:
            return grouped[value]
        return []
    return array


def group_by(array, key):
    result = {}
    array = to_array(array)
    array = [entry for entry in array if (key in entry) and (entry[key] is not None)]
    for entry in array:
        if entry[key] not in result:
            result[entry[key]] = []
        result[entry[key]].append(entry)
    return result


def to_array(value):
    return list(value.values()) if type(value) is dict else value


def index_by(array, key):
    result = {}
    if type(array) is dict:
        array = keysort(array).values()
    for element in array:
        if (key in element) and (element[key] is not None):
            k = element[key]
            result[k] = element
    return result


def keysort(dictionary):
    return collections.OrderedDict(sorted(dictionary.items(), key=lambda t: t[0]))


def sort_by(array, key, descending=False):
    return sorted(array, key=lambda k: k[key] if k[key] is not None else "", reverse=descending)


def uuid():
    return str(uniqueid.uuid4())


def array_concat(a, b):
    return a + b


def in_array(needle, haystack):
    return needle in haystack


def is_empty(object):
    return not object


def safe_string(dictionary, key, default_value=None):
    return str(dictionary[key]) if key is not None and (key in dictionary) and dictionary[key] is not None else default_value


def safe_integer(dictionary, key, default_value=None):
    if key is None or (key not in dictionary):
        return default_value
    value = dictionary[key]
    if isinstance(value, Number) or (isinstance(value, basestring) and value.isnumeric()):
        return int(value)
    return default_value


def safe_value(dictionary, key, default_value=None):
    return dictionary[key] if key is not None and (key in dictionary) and dictionary[key] is not None else default_value

# we're not using safe_floats with a list argument as we're trying to save some cycles here
# we're not using safe_float_3 either because those cases are too rare to deserve their own optimization

def safe_float(dictionary, key, default_value=None):
    value = default_value
    try:
        if isinstance(dictionary, list) and isinstance(key, int) and len(dictionary) > key:
            value = float(dictionary[key])
        else:
            value = float(dictionary[key]) if (key is not None) and (key in dictionary) and (dictionary[key] is not None) else default_value
    except ValueError as e:
        value = default_value
    return value


def safe_float_2(dictionary, key1, key2, default_value=None):
    return safe_either(safe_float, dictionary, key1, key2, default_value)


def safe_string_2(dictionary, key1, key2, default_value=None):
    return safe_either(safe_string, dictionary, key1, key2, default_value)


def safe_integer_2(dictionary, key1, key2, default_value=None):
    return safe_either(safe_integer, dictionary, key1, key2, default_value)


def safe_value_2(dictionary, key1, key2, default_value=None):
    return safe_either(safe_value, dictionary, key1, key2, default_value)


def safe_either(method, dictionary, key1, key2, default_value=None):
    """A helper-wrapper for the safe_value_2() family."""
    value = method(dictionary, key1)
    return value if value is not None else method(dictionary, key2, default_value)


def truncate(num, precision=0):
    """Deprecated, use decimal_to_precision instead"""
    if precision > 0:
        decimal_precision = math.pow(10, precision)
        return math.trunc(num * decimal_precision) / decimal_precision
    return int(truncate_to_string(num, precision))


def truncate_to_string(num, precision=0):
    """Deprecated, todo: remove references from subclasses"""
    if precision > 0:
        parts = ('{0:.%df}' % precision).format(Decimal(num)).split('.')
        decimal_digits = parts[1][:precision].rstrip('0')
        decimal_digits = decimal_digits if len(decimal_digits) else '0'
        return parts[0] + '.' + decimal_digits
    return ('%d' % num)



def extract_params(string):
    return re.findall(r'{([\w-]+)}', string)


def implode_params(string, params):
    if isinstance(params, dict):
        for key in params:
            if not isinstance(params[key], list):
                string = string.replace('{' + key + '}', str(params[key]))
    return string


def url(path, params={}):
    result = implode_params(path, params)
    query = omit(params, extract_params(path))
    if query:
        result += '?' + _urlencode.urlencode(query)
    return result


def urlencode(params={}):
    if (type(params) is dict) or isinstance(params, collections.OrderedDict):
        return _urlencode.urlencode(params)
    return params


def rawencode(params={}):
    return _urlencode.unquote(urlencode(params))


def encode_uri_component(uri):
    return _urlencode.quote(uri, safe="~()*!.'")


def omit(d, *args):
    if isinstance(d, dict):
        result = d.copy()
        for arg in args:
            if type(arg) is list:
                for key in arg:
                    if key in result:
                        del result[key]
            else:
                if arg in result:
                    del result[arg]
        return result
    return d


def unique(array):
    return list(set(array))


def pluck(array, key):
    return [
        element[key]
        for element in array
        if (key in element) and (element[key] is not None)
    ]


def sum(*args):
    return __builtins__['sum']([arg for arg in args if isinstance(arg, (float, int))])


def ordered(array):
    return collections.OrderedDict(array)


def aggregate(bidasks):
    ordered_dict = ordered({})
    for [price, volume] in bidasks:
        if volume > 0:
            ordered_dict[price] = (ordered_dict[price] if price in ordered_dict else 0) + volume
    result = []
    items = list(ordered_dict.items())
    for price, volume in items:
        result.append([price, volume])
    return result


def sec():
    return seconds()


def msec():
    return milliseconds()


def usec():
    return microseconds()


def seconds():
    return int(time.time())


def milliseconds():
    return int(time.time() * 1000)


def microseconds():
    return int(time.time() * 1000000)


def iso8601(timestamp=None):
    if timestamp is None:
        return timestamp
    if not isinstance(timestamp, (int, long)):
        return None
    if int(timestamp) < 0:
        return None

    try:
        utc = datetime.datetime.utcfromtimestamp(timestamp // 1000)
        return utc.strftime('%Y-%m-%dT%H:%M:%S.%f')[:-6] + "{:03d}".format(int(timestamp) % 1000) + 'Z'
    except (TypeError, OverflowError, OSError):
        return None


def dmy(timestamp, infix='-'):
    utc_datetime = datetime.datetime.utcfromtimestamp(int(round(timestamp / 1000)))
    return utc_datetime.strftime('%m' + infix + '%d' + infix + '%Y')


def ymd(timestamp, infix='-'):
    utc_datetime = datetime.datetime.utcfromtimestamp(int(round(timestamp / 1000)))
    return utc_datetime.strftime('%Y' + infix + '%m' + infix + '%d')


def ymdhms(timestamp, infix=' '):
    utc_datetime = datetime.datetime.utcfromtimestamp(int(round(timestamp / 1000)))
    return utc_datetime.strftime('%Y-%m-%d' + infix + '%H:%M:%S')


def parse_date(timestamp=None):
    if timestamp is None:
        return timestamp
    if not isinstance(timestamp, str):
        return None
    if 'GMT' in timestamp:
        try:
            string = ''.join([str(value) for value in parsedate(timestamp)[:6]]) + '.000Z'
            dt = datetime.datetime.strptime(string, "%Y%m%d%H%M%S.%fZ")
            return calendar.timegm(dt.utctimetuple()) * 1000
        except (TypeError, OverflowError, OSError):
            return None
    else:
        return parse8601(timestamp)


def parse8601(timestamp=None):
    if timestamp is None:
        return timestamp
    yyyy = '([0-9]{4})-?'
    mm = '([0-9]{2})-?'
    dd = '([0-9]{2})(?:T|[\\s])?'
    h = '([0-9]{2}):?'
    m = '([0-9]{2}):?'
    s = '([0-9]{2})'
    ms = '(\\.[0-9]{1,3})?'
    tz = '(?:(\\+|\\-)([0-9]{2})\\:?([0-9]{2})|Z)?'
    regex = r'' + yyyy + mm + dd + h + m + s + ms + tz
    try:
        match = re.search(regex, timestamp, re.IGNORECASE)
        if match is None:
            return None
        yyyy, mm, dd, h, m, s, ms, sign, hours, minutes = match.groups()
        ms = ms or '.000'
        msint = int(ms[1:])
        sign = sign or ''
        sign = int(sign + '1') * -1
        hours = int(hours or 0) * sign
        minutes = int(minutes or 0) * sign
        offset = datetime.timedelta(hours=hours, minutes=minutes)
        string = yyyy + mm + dd + h + m + s + ms + 'Z'
        dt = datetime.datetime.strptime(string, "%Y%m%d%H%M%S.%fZ")
        dt = dt + offset
        return calendar.timegm(dt.utctimetuple()) * 1000 + msint
    except (TypeError, OverflowError, OSError, ValueError):
        return None


def hash(request, algorithm='md5', digest='hex'):
    h = hashlib.new(algorithm, request)
    if digest == 'hex':
        return h.hexdigest()
    elif digest == 'base64':
        return base64.b64encode(h.digest())
    return h.digest()


def hmac(request, secret, algorithm=hashlib.sha256, digest='hex'):
    h = hmac.new(secret, request, algorithm)
    if digest == 'hex':
        return h.hexdigest()
    elif digest == 'base64':
        return base64.b64encode(h.digest())
    return h.digest()


def binary_concat(*args):
    result = bytes()
    for arg in args:
        result = result + arg
    return result


def base64urlencode(s):
    return decode(base64.urlsafe_b64encode(s)).replace('=', '')


def binary_to_base64(s):
    return decode(base64.standard_b64encode(s))


def encode(string):
    return string.encode()


def decode(string):
    return string.decode()


def is_json_encoded_object(input):
    return (isinstance(input, basestring) and
            (len(input) >= 2) and
            ((input[0] == '{') or (input[0] == '[')))


def unjson(input):
    return jason.loads(input)


def json(data, params=None):
    return jason.dumps(data, separators=(',', ':'))
