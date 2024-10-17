function isBuffer(obj) {
    return obj != null && obj.constructor != null &&
        typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj);
}
export default isBuffer;
