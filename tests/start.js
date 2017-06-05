var fs = require('fs');
var path = require('path');

/**
 * Import specs
 */

var dirs = [
  'configure',
  'utils',
  'parser'
];
dirs.forEach((dir) => {
  let where = './tests/specs/' + dir;
  if (fs.existsSync(where)) {
    fs.readdirSync(where).forEach((file) => {
      if (path.extname(file) === '.js') {
        require(path.join('.' + where, file));
      }
    });
  }
});
