var spawn = require('child_process').spawn;
var node = process.execPath;
var f = 'build/export-exchanges.js';
spawn(node, [f, undefined], {stdio: 'inherit'}).on('exit', function(code) {
  console.log('ok -exited with %d', code);
})