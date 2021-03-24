class Token {
  constructor(token, type, creationDate, expirationDate) {
    this.token = token;
    this.type = type;
    this.creationDate = creationDate;
    this.expirationDate = expirationDate;
  }

  calculateExpirationDate(currentTime, expirationTime) {
    const expirationMs = expirationTime * 1000;
    return new Date(currentTime.getTime() + expirationMs);
  }
}

module.exports = Token;
