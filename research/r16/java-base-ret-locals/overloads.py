# same-name same-arity method declarations per class file (overload traps for typed args)
import re,subprocess,collections,sys
ref=sys.argv[1] if len(sys.argv)>1 else 'HEAD'
files=subprocess.check_output(['git','ls-tree','-r','--name-only',ref,'java/lib/src/main/java/io/github/ccxt/']).decode().split()
pat=re.compile(r'^\s+public (?:static |final |synchronized |abstract )*[\w.<>, ?\[\]]+ (\w+)\(([^)]*)\)',re.M)
tot=0
for f in files:
    if not f.endswith('.java'): continue
    s=subprocess.check_output(['git','show',f'{ref}:{f}']).decode(errors='replace')
    c=collections.defaultdict(list)
    for m in pat.finditer(s):
        a=m.group(2).strip(); n=0 if not a else len(re.split(r',(?![^<]*>)',a))
        c[(m.group(1),n)].append(a)
    for k,v in c.items():
        if len(v)>1: tot+=1; print(f,k,v[:3]) if tot<40 else None
print('total',tot)
