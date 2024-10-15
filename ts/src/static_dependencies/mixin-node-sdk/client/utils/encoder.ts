export const putUvarInt = (x: number) => {
    const buf = [];
    let i = 0;
    while (x >= 0x80) {
        buf[i] = x | 0x80;
        x >>= 7;
        i++;
    }
    buf[i] = x;
    return buf;
};