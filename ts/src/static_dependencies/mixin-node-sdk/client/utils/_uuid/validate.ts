import REGEX from './regex.js';

function validate(uuid: unknown) {
  return typeof uuid === 'string' && REGEX.test(uuid);
}

export default validate;