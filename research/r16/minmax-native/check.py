# every Math.Min(x.Value ...) site: the enclosing method signature in the committed file declares `Int64? x`
import re,subprocess,sys
bad=0;n=0
for f in sys.argv[1:]:
    ex=f.split('/')[-1][:-3].split('_')[-1]; tier='pro/' if '/pro/' in f else ''
    com=subprocess.run(['git','show','HEAD:cs/ccxt/exchanges/'+tier+ex+'.cs'],capture_output=True,text=True).stdout.split('\n')
    lines=open(f).read().split('\n'); sig=None
    for l in lines:
        if re.match(r'\s*public .*\(',l): sig=re.search(r' (\w+)\(',l).group(1)
        for m in re.finditer(r'Math\.M(in|ax)\(\w*?(\w+)\.Value',l):
            n+=1; v=m.group(2)
            ok=any(re.search(r' '+sig+r'\(.*Int64\? '+v+r' = null',c,re.I) for c in com)
            if not ok: bad+=1; print('BAD',ex,sig,l.strip())
print('sites',n,'bad',bad)
