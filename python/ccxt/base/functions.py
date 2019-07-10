# the @staticmethods of the exchange class should live here for more clarity (less code) in the exchange class
# we should probably try to do the same with php...


def captialize(string):
    # first character only, rest characters unchanged
    # the native pythonic .capitalize() method lowercases all other characters
    # which is an unwanted behaviour, therefore we use this custom implementation
    # check it yourself: print('foobar'.capitalize(), 'fooBar'.capitalize())
    if len(string) > 1:
        return "%s%s" % (string[0].upper(), string[1:])
    return string.upper()


def to_camelcase(underscore):
    parts = underscore.split('_')
    return parts[0] + ''.join(map(captialize, parts[1:]))
