const reg = /let ([a-z0-9]+\$1) = class ([a-z0-9]+) /
export default {
  name: 'rename-class-conflict-for-exchanges',
  renderChunk(code) {
    const matches = code.match(reg)
    if (!!!matches) return
    return code.replace(reg, 'class $1 ')
  }
}