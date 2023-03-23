const ch2: Record<string, string> = {};

export default <T>(c: string, id: number, msg: unknown, transfer: ArrayBuffer[], cb: (err: Error, msg: T) => void) => {
  const w = new Worker(ch2[id] ||= URL.createObjectURL(
    new Blob([
      c + ';addEventListener("error",function(e){e=e.error;postMessage({$e$:[e.message,e.code,e.stack]})})'
    ], { type: 'text/javascript' })
  ));
  w.onmessage = e => {
    const d = e.data, ed = d.$e$;
    if (ed) {
      const err = new Error(ed[0]);
      err['code'] = ed[1];
      err.stack = ed[2];
      cb(err, null);
    } else cb(null, d);
  }
  w.postMessage(msg, transfer);
  return w;
}