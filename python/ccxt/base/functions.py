import re

#    , unCamelCase: s => s.match (/^[A-Z0-9_]+$/) ? s : (s.replace (/([a-z0-9])([A-Z])/g, '$1_$2').replace (/([A-Z0-9])([A-Z0-9][a-z])/g, '$1_$2').toLowerCase ())


def un_camel_case(string):
    if re.match(r'^[A-Z0-9_]+$', string):
        return string
    first = re.sub(r'([a-z0-9])([A-Z])', r'\1_\2', string)
    second = re.sub(r'([A-Z0-9])([A-Z0-9][a-z])', r'\1_\2', first)
    return second.lower()
