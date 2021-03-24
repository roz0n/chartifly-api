function Token(token, type, expiration) {
  this.token = token;
  this.type = type;
  this.expiration = expiration;
}

module.exports.Token = Token;