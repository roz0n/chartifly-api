class Token {
  constructor(token, type, creationDate, expirationDate) {
    this.token = token;
    this.type = type;
    this.creationDate = creationDate;
    this.expirationDate = expirationDate;
  }
}

module.exports = Token;
