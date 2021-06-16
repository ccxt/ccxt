import re
import m2r2
import os

files = [
    'wiki/Manual',
    'wiki/Exchange-Markets-By-Country',
    'wiki/Exchange-Markets',
    'README',
]

for file in files:
    rst = m2r2.parse_from_file(file + '.md', 'utf-8', parse_relative_links=True, anonymous_references=True)
    blank_lines = re.sub('- \n {5}.. image', '- .. image', rst)
    indent_level = re.sub(':(target|alt):', r'  :\1:', blank_lines)
    reference_links = re.sub(r'<(\w+)-(\w+)-(\w+)-(\w+)>`', r'<\1 \2 \3 \4>`', indent_level)
    reference_links2 = re.sub(r'<(\w+)-(\w+)-(\w+)>`', r'<\1 \2 \3>`', reference_links)
    reference_links3 = re.sub(r'<(\w+)-(\w+)>`', r'<\1 \2>`', reference_links2)
    remove_sublinks = re.sub(r'^\* :ref:`.+`$\n', '', reference_links3, 0, re.MULTILINE)
    fix_table = re.sub(r' {5}\n\n', '     -\n\n', remove_sublinks)
    basename = os.path.basename(file)
    lowername = basename.lower()
    with open('./doc/' + lowername + '.rst', 'w') as f:
        f.write(fix_table)
