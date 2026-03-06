const bcrypt = require('bcryptjs');
module.exports = {
  hash: (pw) => bcrypt.hash(pw, 10),
  compare: (pw, hashed) => bcrypt.compare(pw, hashed)
};