import re
import m2r2

files = [
    'Manual',
    'Exchange-Markets-By-Country',
    'Exchange-Markets',
]

for file in files:
    rst = m2r2.parse_from_file('./wiki/' + file + '.md', 'utf-8', parse_relative_links=True, anonymous_references=True)
    blank_lines = re.sub('- \n {5}.. image', '- .. image', rst)
    indent_level = re.sub(':(target|alt):', r'  :\1:', blank_lines)
    reference_links = re.sub(r'<(\w+)-(\w+)-(\w+)-(\w+)>`', r'<\1 \2 \3 \4>`', indent_level)
    reference_links2 = re.sub(r'<(\w+)-(\w+)-(\w+)>`', r'<\1 \2 \3>`', reference_links)
    reference_links3 = re.sub(r'<(\w+)-(\w+)>`', r'<\1 \2>`', reference_links2)
    remove_sublinks = re.sub(r'^\* :ref:`.+`$\n', '', reference_links3, 0, re.MULTILINE)

    with open('./doc/' + file + '.rst', 'w') as f:
        f.write(remove_sublinks)
