import re
import m2r2
import os

files = [
    'wiki/Manual',
    'wiki/Exchange-Markets-By-Country',
    'wiki/Exchange-Markets',
    'wiki/ccxt.pro.manual',
    'README',
]

for file in files:
    with open(file + '.md', 'r') as f:
        contents = f.read()

    # .md parsing stage
    stripped = re.sub(r'</?su[bp]>', r'', contents)
    remove_italic_links = re.sub(r'\*\*\[', '[', stripped)
    remove_italic_links2 = re.sub(r'\)\*\*', ')', remove_italic_links)
    remove_overview = re.sub(r'# Overview\n', '', remove_italic_links2)

    rst = m2r2.convert(remove_overview, parse_relative_links=True, anonymous_references=True)

    # .rst parsing stage
    blank_lines = re.sub(r'([-*]) \n {2,5}.. image', r'\1 .. image', rst)
    indent_level = re.sub(r':(target|alt):', r'  :\1:', blank_lines)
    reference_links = re.sub(r'<(\w+)-(\w+)-(\w+)-(\w+)>`', r'<\1 \2 \3 \4>`', indent_level)
    reference_links2 = re.sub(r'<(\w+)-(\w+)-(\w+)>`', r'<\1 \2 \3>`', reference_links)
    reference_links3 = re.sub(r'<(\w+)-(\w+)>`', r'<\1 \2>`', reference_links2)
    remove_sublinks = re.sub(r'^\* :ref:`.+`$\n', '', reference_links3, flags=re.MULTILINE)
    remove_newline = re.sub(r'\n(Supported Cryptocurrency Exchange Markets)', r'\1', remove_sublinks)
    add_space = re.sub(r'^\*', r' *', remove_newline, flags=re.MULTILINE)
    fix_list = re.sub(r'^   `', r'\n   `', add_space, flags=re.MULTILINE)
    # fix_table = re.sub(r' {5}\n\n\n', '     -\n\n\n', fix_list)
    basename = os.path.basename(file)
    lowername = basename.lower()
    with open('./doc/' + lowername + '.rst', 'w') as f:
        f.write(fix_list)
