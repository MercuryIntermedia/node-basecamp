var basecamp = require('./lib/basecamp');

module.exports = function(url, apiKey, oauth) {
  return new basecamp(url, apiKey, oauth);
}