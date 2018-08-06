const { getTemporaryOAuthTokens } = require('../src/OAuthFirstLeg');
const { getTemporaryUserTokens } = require('../src/OAuthFirstLeg');
const { getStatusText } = require('../src/HttpResponses');

describe('OAuth first leg', () => {
  it('Gets a set of temporary OAuth tokens', () => {
    const fakeOAuthRequestTokenUri = chance.url();
    const fakeOAuthAuthorizeRequestTokenUri = chance.url();
    const fakeOAuthAccessTokenUri = chance.url();

    const fakeResponseData = JSON.stringify({
      links: [
        {
          rel: 'oauthRequestToken',
          uri: fakeOAuthRequestTokenUri,
        },
        {
          rel: 'oauthAuthorizeRequestToken',
          uri: fakeOAuthAuthorizeRequestTokenUri,
        },
        {
          rel: 'oauthAccessToken',
          uri: fakeOAuthAccessTokenUri,
        },
        {
          rel: 'thisIsNotReached',
          uri: chance.url(),
        },
      ],
    });

    const expectedTokens = {
      oauthRequestTokenUri: fakeOAuthRequestTokenUri,
      oauthAuthorizeRequestTokenUri: fakeOAuthAuthorizeRequestTokenUri,
      oauthAccessTokenUri: fakeOAuthAccessTokenUri,
    };
    const actualTokens = getTemporaryOAuthTokens(null, fakeResponseData, { statusCode: 200 });

    expect(actualTokens).toEqual(expectedTokens);
  });

  it('Sets userTokens according to received tokens', () => {
    const token = chance.string();
    const secret = chance.string();
    const TemporaryUserTokens = getTemporaryUserTokens(null, token, secret);

    expect(TemporaryUserTokens.requestToken).toEqual(token);
    expect(TemporaryUserTokens.requestTokenSecret).toEqual(secret);
  });

  it('Returns an error message if status code isn\'t in the 200 range', () => {
    const statusCode = chance.natural({ min: 300, max: 500 });
    const result = {
      statusCode,
    };
    const errorMessage = getTemporaryOAuthTokens(null, null, result);

    expect(errorMessage).toEqual(getStatusText(statusCode));
  });
});
