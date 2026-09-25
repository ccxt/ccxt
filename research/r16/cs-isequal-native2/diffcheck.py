# every changed line = its predecessor with isEqual(x, lit) rewritten by the literal rule or the existing operator rule
import re,subprocess,sys
d=subprocess.run(['git','diff','-U0','--','cs'],capture_output=True,text=True).stdout
minus=[];plus=[];bad=0;pairs=0
def norm(s):
    s=re.sub(r'\(\((\w+) as (?:string|bool\?)\) == ("(?:[^"\\]|\\.)*"|true|false)\)',r'isEqual(\1, \2)',s)
    s=re.sub(r'\((\w+) == (null|"(?:[^"\\]|\\.)*"|\w+)\)',r'isEqual(\1, \2)',s)
    return s
def flush():
    global bad,pairs,minus,plus
    if len(minus)!=len(plus): bad+=1; print('COUNT',minus[:1],plus[:1])
    else:
        for a,b in zip(minus,plus):
            pairs+=1
            if norm(b)!=norm(a): bad+=1; print('-',a,'\n+',b)
    minus=[];plus=[]
for l in d.split('\n'):
    if l.startswith('@@') or l.startswith('diff'): flush()
    elif l.startswith('-') and not l.startswith('---'): minus.append(l[1:])
    elif l.startswith('+') and not l.startswith('+++'): plus.append(l[1:])
flush();print('pairs',pairs,'anomalies',bad)
