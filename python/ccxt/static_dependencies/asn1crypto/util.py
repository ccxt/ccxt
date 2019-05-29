# coding: utf-8

"""
Miscellaneous data helpers, including functions for converting integers to and
from bytes and UTC timezone. Exports the following items:

 - OrderedDict()
 - int_from_bytes()
 - int_to_bytes()
 - timezone.utc
 - inet_ntop()
 - inet_pton()
 - uri_to_iri()
 - iri_to_uri()
"""

from __future__ import unicode_literals, division, absolute_import, print_function

import math
import sys
from datetime import datetime, date, time

from ._errors import unwrap
from ._iri import iri_to_uri, uri_to_iri  # noqa
from ._ordereddict import OrderedDict  # noqa
from ._types import type_name

if sys.platform == 'win32':
    from ._inet import inet_ntop, inet_pton
else:
    from socket import inet_ntop, inet_pton  # noqa


# Python 2
if sys.version_info <= (3,):

    from datetime import timedelta, tzinfo

    py2 = True

    def int_to_bytes(value, signed=False, width=None):
        """
        Converts an integer to a byte string

        :param value:
            The integer to convert

        :param signed:
            If the byte string should be encoded using two's complement

        :param width:
            None == auto, otherwise an integer of the byte width for the return
            value

        :return:
            A byte string
        """

        # Handle negatives in two's complement
        is_neg = False
        if signed and value < 0:
            is_neg = True
            bits = int(math.ceil(len('%x' % abs(value)) / 2.0) * 8)
            value = (value + (1 << bits)) % (1 << bits)

        hex_str = '%x' % value
        if len(hex_str) & 1:
            hex_str = '0' + hex_str

        output = hex_str.decode('hex')

        if signed and not is_neg and ord(output[0:1]) & 0x80:
            output = b'\x00' + output

        if width is not None:
            if is_neg:
                pad_char = b'\xFF'
            else:
                pad_char = b'\x00'
            output = (pad_char * (width - len(output))) + output
        elif is_neg and ord(output[0:1]) & 0x80 == 0:
            output = b'\xFF' + output

        return output

    def int_from_bytes(value, signed=False):
        """
        Converts a byte string to an integer

        :param value:
            The byte string to convert

        :param signed:
            If the byte string should be interpreted using two's complement

        :return:
            An integer
        """

        if value == b'':
            return 0

        num = long(value.encode("hex"), 16)  # noqa

        if not signed:
            return num

        # Check for sign bit and handle two's complement
        if ord(value[0:1]) & 0x80:
            bit_len = len(value) * 8
            return num - (1 << bit_len)

        return num

    class utc(tzinfo):  # noqa

        def tzname(self, _):
            return b'UTC+00:00'

        def utcoffset(self, _):
            return timedelta(0)

        def dst(self, _):
            return timedelta(0)

    class timezone():  # noqa

        utc = utc()


# Python 3
else:

    from datetime import timezone  # noqa

    py2 = False

    def int_to_bytes(value, signed=False, width=None):
        """
        Converts an integer to a byte string

        :param value:
            The integer to convert

        :param signed:
            If the byte string should be encoded using two's complement

        :param width:
            None == auto, otherwise an integer of the byte width for the return
            value

        :return:
            A byte string
        """

        if width is None:
            if signed:
                if value < 0:
                    bits_required = abs(value + 1).bit_length()
                else:
                    bits_required = value.bit_length()
                if bits_required % 8 == 0:
                    bits_required += 1
            else:
                bits_required = value.bit_length()
            width = math.ceil(bits_required / 8) or 1
        return value.to_bytes(width, byteorder='big', signed=signed)

    def int_from_bytes(value, signed=False):
        """
        Converts a byte string to an integer

        :param value:
            The byte string to convert

        :param signed:
            If the byte string should be interpreted using two's complement

        :return:
            An integer
        """

        return int.from_bytes(value, 'big', signed=signed)


_DAYS_PER_MONTH_YEAR_0 = {
    1: 31,
    2: 29,  # Year 0 was a leap year
    3: 31,
    4: 30,
    5: 31,
    6: 30,
    7: 31,
    8: 31,
    9: 30,
    10: 31,
    11: 30,
    12: 31
}


class extended_date(object):
    """
    A datetime.date-like object that can represent the year 0. This is just
    to handle 0000-01-01 found in some certificates.
    """

    year = None
    month = None
    day = None

    def __init__(self, year, month, day):
        """
        :param year:
            The integer 0

        :param month:
            An integer from 1 to 12

        :param day:
            An integer from 1 to 31
        """

        if year != 0:
            raise ValueError('year must be 0')

        if month < 1 or month > 12:
            raise ValueError('month is out of range')

        if day < 0 or day > _DAYS_PER_MONTH_YEAR_0[month]:
            raise ValueError('day is out of range')

        self.year = year
        self.month = month
        self.day = day

    def _format(self, format):
        """
        Performs strftime(), always returning a unicode string

        :param format:
            A strftime() format string

        :return:
            A unicode string of the formatted date
        """

        format = format.replace('%Y', '0000')
        # Year 0 is 1BC and a leap year. Leap years repeat themselves
        # every 28 years. Because of adjustments and the proleptic gregorian
        # calendar, the simplest way to format is to substitute year 2000.
        temp = date(2000, self.month, self.day)
        if '%c' in format:
            c_out = temp.strftime('%c')
            # Handle full years
            c_out = c_out.replace('2000', '0000')
            c_out = c_out.replace('%', '%%')
            format = format.replace('%c', c_out)
        if '%x' in format:
            x_out = temp.strftime('%x')
            # Handle formats such as 08/16/2000 or 16.08.2000
            x_out = x_out.replace('2000', '0000')
            x_out = x_out.replace('%', '%%')
            format = format.replace('%x', x_out)
        return temp.strftime(format)

    def isoformat(self):
        """
        Formats the date as %Y-%m-%d

        :return:
            The date formatted to %Y-%m-%d as a unicode string in Python 3
            and a byte string in Python 2
        """

        return self.strftime('0000-%m-%d')

    def strftime(self, format):
        """
        Formats the date using strftime()

        :param format:
            The strftime() format string

        :return:
            The formatted date as a unicode string in Python 3 and a byte
            string in Python 2
        """

        output = self._format(format)
        if py2:
            return output.encode('utf-8')
        return output

    def replace(self, year=None, month=None, day=None):
        """
        Returns a new datetime.date or asn1crypto.util.extended_date
        object with the specified components replaced

        :return:
            A datetime.date or asn1crypto.util.extended_date object
        """

        if year is None:
            year = self.year
        if month is None:
            month = self.month
        if day is None:
            day = self.day

        if year > 0:
            cls = date
        else:
            cls = extended_date

        return cls(
            year,
            month,
            day
        )

    def __str__(self):
        if py2:
            return self.__bytes__()
        else:
            return self.__unicode__()

    def __bytes__(self):
        return self.__unicode__().encode('utf-8')

    def __unicode__(self):
        return self._format('%Y-%m-%d')

    def __eq__(self, other):
        if not isinstance(other, self.__class__):
            return False
        return self.__cmp__(other) == 0

    def __ne__(self, other):
        return not self.__eq__(other)

    def _comparison_error(self, other):
        raise TypeError(unwrap(
            '''
            An asn1crypto.util.extended_date object can only be compared to
            an asn1crypto.util.extended_date or datetime.date object, not %s
            ''',
            type_name(other)
        ))

    def __cmp__(self, other):
        if isinstance(other, date):
            return -1

        if not isinstance(other, self.__class__):
            self._comparison_error(other)

        st = (
            self.year,
            self.month,
            self.day
        )
        ot = (
            other.year,
            other.month,
            other.day
        )

        if st < ot:
            return -1
        if st > ot:
            return 1
        return 0

    def __lt__(self, other):
        return self.__cmp__(other) < 0

    def __le__(self, other):
        return self.__cmp__(other) <= 0

    def __gt__(self, other):
        return self.__cmp__(other) > 0

    def __ge__(self, other):
        return self.__cmp__(other) >= 0


class extended_datetime(object):
    """
    A datetime.datetime-like object that can represent the year 0. This is just
    to handle 0000-01-01 found in some certificates.
    """

    year = None
    month = None
    day = None
    hour = None
    minute = None
    second = None
    microsecond = None
    tzinfo = None

    def __init__(self, year, month, day, hour=0, minute=0, second=0, microsecond=0, tzinfo=None):
        """
        :param year:
            The integer 0

        :param month:
            An integer from 1 to 12

        :param day:
            An integer from 1 to 31

        :param hour:
            An integer from 0 to 23

        :param minute:
            An integer from 0 to 59

        :param second:
            An integer from 0 to 59

        :param microsecond:
            An integer from 0 to 999999
        """

        if year != 0:
            raise ValueError('year must be 0')

        if month < 1 or month > 12:
            raise ValueError('month is out of range')

        if day < 0 or day > _DAYS_PER_MONTH_YEAR_0[month]:
            raise ValueError('day is out of range')

        if hour < 0 or hour > 23:
            raise ValueError('hour is out of range')

        if minute < 0 or minute > 59:
            raise ValueError('minute is out of range')

        if second < 0 or second > 59:
            raise ValueError('second is out of range')

        if microsecond < 0 or microsecond > 999999:
            raise ValueError('microsecond is out of range')

        self.year = year
        self.month = month
        self.day = day
        self.hour = hour
        self.minute = minute
        self.second = second
        self.microsecond = microsecond
        self.tzinfo = tzinfo

    def date(self):
        """
        :return:
            An asn1crypto.util.extended_date of the date
        """

        return extended_date(self.year, self.month, self.day)

    def time(self):
        """
        :return:
            A datetime.time object of the time
        """

        return time(self.hour, self.minute, self.second, self.microsecond, self.tzinfo)

    def utcoffset(self):
        """
        :return:
            None or a datetime.timedelta() of the offset from UTC
        """

        if self.tzinfo is None:
            return None
        return self.tzinfo.utcoffset(self.replace(year=2000))

    def dst(self):
        """
        :return:
            None or a datetime.timedelta() of the daylight savings time offset
        """

        if self.tzinfo is None:
            return None
        return self.tzinfo.dst(self.replace(year=2000))

    def tzname(self):
        """
        :return:
            None or the name of the timezone as a unicode string in Python 3
            and a byte string in Python 2
        """

        if self.tzinfo is None:
            return None
        return self.tzinfo.tzname(self.replace(year=2000))

    def _format(self, format):
        """
        Performs strftime(), always returning a unicode string

        :param format:
            A strftime() format string

        :return:
            A unicode string of the formatted datetime
        """

        format = format.replace('%Y', '0000')
        # Year 0 is 1BC and a leap year. Leap years repeat themselves
        # every 28 years. Because of adjustments and the proleptic gregorian
        # calendar, the simplest way to format is to substitute year 2000.
        temp = datetime(
            2000,
            self.month,
            self.day,
            self.hour,
            self.minute,
            self.second,
            self.microsecond,
            self.tzinfo
        )
        if '%c' in format:
            c_out = temp.strftime('%c')
            # Handle full years
            c_out = c_out.replace('2000', '0000')
            c_out = c_out.replace('%', '%%')
            format = format.replace('%c', c_out)
        if '%x' in format:
            x_out = temp.strftime('%x')
            # Handle formats such as 08/16/2000 or 16.08.2000
            x_out = x_out.replace('2000', '0000')
            x_out = x_out.replace('%', '%%')
            format = format.replace('%x', x_out)
        return temp.strftime(format)

    def isoformat(self, sep='T'):
        """
        Formats the date as "%Y-%m-%d %H:%M:%S" with the sep param between the
        date and time portions

        :param set:
            A single character of the separator to place between the date and
            time

        :return:
            The formatted datetime as a unicode string in Python 3 and a byte
            string in Python 2
        """

        if self.microsecond == 0:
            return self.strftime('0000-%%m-%%d%s%%H:%%M:%%S' % sep)
        return self.strftime('0000-%%m-%%d%s%%H:%%M:%%S.%%f' % sep)

    def strftime(self, format):
        """
        Formats the date using strftime()

        :param format:
            The strftime() format string

        :return:
            The formatted date as a unicode string in Python 3 and a byte
            string in Python 2
        """

        output = self._format(format)
        if py2:
            return output.encode('utf-8')
        return output

    def replace(self, year=None, month=None, day=None, hour=None, minute=None,
                second=None, microsecond=None, tzinfo=None):
        """
        Returns a new datetime.datetime or asn1crypto.util.extended_datetime
        object with the specified components replaced

        :return:
            A datetime.datetime or asn1crypto.util.extended_datetime object
        """

        if year is None:
            year = self.year
        if month is None:
            month = self.month
        if day is None:
            day = self.day
        if hour is None:
            hour = self.hour
        if minute is None:
            minute = self.minute
        if second is None:
            second = self.second
        if microsecond is None:
            microsecond = self.microsecond
        if tzinfo is None:
            tzinfo = self.tzinfo

        if year > 0:
            cls = datetime
        else:
            cls = extended_datetime

        return cls(
            year,
            month,
            day,
            hour,
            minute,
            second,
            microsecond,
            tzinfo
        )

    def __str__(self):
        if py2:
            return self.__bytes__()
        else:
            return self.__unicode__()

    def __bytes__(self):
        return self.__unicode__().encode('utf-8')

    def __unicode__(self):
        format = '%Y-%m-%d %H:%M:%S'
        if self.microsecond != 0:
            format += '.%f'
        return self._format(format)

    def __eq__(self, other):
        if not isinstance(other, self.__class__):
            return False
        return self.__cmp__(other) == 0

    def __ne__(self, other):
        return not self.__eq__(other)

    def _comparison_error(self, other):
        """
        Raises a TypeError about the other object not being suitable for
        comparison

        :param other:
            The object being compared to
        """

        raise TypeError(unwrap(
            '''
            An asn1crypto.util.extended_datetime object can only be compared to
            an asn1crypto.util.extended_datetime or datetime.datetime object,
            not %s
            ''',
            type_name(other)
        ))

    def __cmp__(self, other):
        so = self.utcoffset()
        oo = other.utcoffset()

        if (so is not None and oo is None) or (so is None and oo is not None):
            raise TypeError("can't compare offset-naive and offset-aware datetimes")

        if isinstance(other, datetime):
            return -1

        if not isinstance(other, self.__class__):
            self._comparison_error(other)

        st = (
            self.year,
            self.month,
            self.day,
            self.hour,
            self.minute,
            self.second,
            self.microsecond,
            so
        )
        ot = (
            other.year,
            other.month,
            other.day,
            other.hour,
            other.minute,
            other.second,
            other.microsecond,
            oo
        )

        if st < ot:
            return -1
        if st > ot:
            return 1
        return 0

    def __lt__(self, other):
        return self.__cmp__(other) < 0

    def __le__(self, other):
        return self.__cmp__(other) <= 0

    def __gt__(self, other):
        return self.__cmp__(other) > 0

    def __ge__(self, other):
        return self.__cmp__(other) >= 0
