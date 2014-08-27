var fs = require('fs');
var format = require('date-format');

var errLogFile = fs.createWriteStream(__dirname + '/logs/error.log',
                                      {flags: 'a'});
module.exports = function(errMsg) {
  errLogFile.write('['
                    + format.asString('yyyy-MM-dd hh:mm:ss.SSSO', new Date())
                    + ']' + errMsg + '\n'
                  );
}
