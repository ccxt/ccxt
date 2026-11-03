import testValidateServerSsl from './test.validateServerSsl.js';

testValidateServerSsl ().then (() => { console.log ('TS validateServerSsl OK'); process.exit (0); }).catch ((e) => { console.error ('FAIL', e); process.exit (1); });
