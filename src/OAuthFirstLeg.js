const { getStatusText } = require('../src/HttpResponses');

const getTemporaryOAuthTokens = (error, responseData, result) => {
  if (result.statusCode < 200 || result.statusCode >= 300) {
    return getStatusText(result.statusCode);
  }
  const temporaryTokens = {};
  const apiCatalog = JSON.parse(responseData);

  apiCatalog.links.forEach((link) => {
    if (link.rel === 'oauthRequestToken') {
      temporaryTokens.oauthRequestTokenUri = link.uri;
    } else if (link.rel === 'oauthAuthorizeRequestToken') {
      temporaryTokens.oauthAuthorizeRequestTokenUri = link.uri;
    } else if (link.rel === 'oauthAccessToken') {
      temporaryTokens.oauthAccessTokenUri = link.uri;
    }
  });

  return temporaryTokens;
};

const getTemporaryUserTokens = (error, token, secret) => {
  const userTokens = {};

  userTokens.requestToken = token;
  userTokens.requestTokenSecret = secret;

  return userTokens;
};

module.exports = {
  getTemporaryOAuthTokens,
  getTemporaryUserTokens,
};
