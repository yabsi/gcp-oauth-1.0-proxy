const Chance = require('chance');
const config = require('../config');
const { getStatusText } = require('../src/HttpResponses');

describe('OAuth Sign Request', () => {
  let chance;

  beforeEach(() => {
    chance = Chance();
  });

  afterEach(() => {
    jest.resetModules();
  });

  describe('Do Sign and Get', () => {
    it('gets a set of temporary OAuth tokens', async () => {
      const fakeLink = chance.url();
      const fakeAccessToken = chance.string();
      const fakeAccessTokenSecret = chance.string();

      const fakeResponseData = chance.string();

      const OAuth = require('oauth');

      OAuth.OAuth = jest.fn().mockImplementation(() => ({
        get: (link, accessToken, accessTokenSecret, callback) => {
          callback(null, fakeResponseData, { statusCode: 200 });
        },
      }));

      const { doSignAndGet } = require('../src/OAuthSignRequest');

      const response = await doSignAndGet(fakeLink, fakeAccessToken, fakeAccessTokenSecret);

      expect(OAuth.OAuth).toBeCalledWith(
        config.firstLegUri,
        config.thirdLegUri,
        config.clientKey,
        config.clientSecret,
        config.oAuthVersion,
        config.authorizeCallbackUri,
        config.oAuthSignatureMethod,
        config.oAuthNonceSize,
        config.oAuthCustomHeaders,
      );
      expect(response).toEqual(fakeResponseData);
    });

    it('throws an error when there is an error in the response', async () => {
      const fakeLink = chance.url();
      const fakeAccessToken = chance.string();
      const fakeAccessTokenSecret = chance.string();

      const fakeError = chance.string();

      const OAuth = require('oauth');

      OAuth.OAuth = jest.fn().mockImplementation(() => ({
        get: (link, accessToken, accessTokenSecret, callback) => {
          callback(fakeError, null, { statusCode: 200 });
        },
      }));

      const { doSignAndGet } = require('../src/OAuthSignRequest');

      await expect(doSignAndGet(fakeLink, fakeAccessToken, fakeAccessTokenSecret))
        .rejects.toMatch(fakeError);
    });

    it('return an error when there is an http error from OAuth Sign Request endpoint', async () => {
      const fakeLink = chance.url();
      const fakeAccessToken = chance.string();
      const fakeAccessTokenSecret = chance.string();

      const fakeError = chance.string();

      const OAuth = require('oauth');
      let statusCode = chance.natural({ min: 0, max: 500 });

      while (statusCode > 200 && statusCode < 300) {
        statusCode = chance.natural({ min: 0, max: 500 });
      }

      OAuth.OAuth = jest.fn().mockImplementation(() => ({
        get: (link, accessToken, accessTokenSecret, callback) => {
          callback(fakeError, null, { statusCode });
        },
      }));

      const { doSignAndGet } = require('../src/OAuthSignRequest');
      const doSignandGet = doSignAndGet(fakeLink, fakeAccessToken, fakeAccessTokenSecret);

      await expect(doSignandGet).resolves.toMatch(getStatusText(statusCode));
    });
  });

  describe('Do Sign and Post', () => {
    const mockOAuth = (fakeResponseData = chance.string()) => {
      const OAuth = require('oauth');

      OAuth.OAuth = jest.fn().mockImplementation(() => ({
        post: (fakeLink, fakeAccessToken, fakeAccessTokenSecret,
          fakePostBody, fakePostBodyContentType, callback) => {
          callback(null, fakeResponseData, { statusCode: 200 });
        },
      }));

      return OAuth;
    };

    it('is a function', () => {
      const { doSignAndPost } = require('../src/OAuthSignRequest');

      expect(doSignAndPost).toEqual(expect.any(Function));
    });

    it('creat an Oauth correctly with correct params', () => {
      process.env.CLIENT_KEY = chance.string();
      process.env.CLIENT_SECRET = chance.string();

      jest.resetModules();

      const oauthConfig = require('../config');

      oauthConfig.oAuthNonceSize = chance.string();
      const OAuth = mockOAuth();

      const { doSignAndPost } = require('../src/OAuthSignRequest');

      doSignAndPost();

      expect(OAuth.OAuth).toBeCalledWith(
        config.firstLegUri,
        config.thirdLegUri,
        oauthConfig.clientKey,
        oauthConfig.clientSecret,
        oauthConfig.oAuthVersion,
        oauthConfig.authorizeCallbackUri,
        oauthConfig.oAuthSignatureMethod,
        oauthConfig.oAuthNonceSize,
        oauthConfig.oAuthCustomHeaders,
      );

      delete process.env.CLIENT_KEY;
      delete process.env.CLIENT_SECRET;
    });

    it('posts correctly', () => {
      const OAuth = require('oauth');
      const fakeResponseData = chance.string();
      const mockPost = jest.fn().mockResolvedValue(fakeResponseData);

      OAuth.OAuth = jest.fn().mockImplementation(() => ({
        post: mockPost,
      }));

      const { doSignAndPost } = require('../src/OAuthSignRequest');

      const fakeLink = chance.url();
      const fakeAccessToken = chance.string();
      const fakeAccessTokenSecret = chance.string();
      const fakePostBody = chance.string();
      const fakePostBodyContentType = chance.string();

      doSignAndPost(fakeLink, fakeAccessToken, fakeAccessTokenSecret,
        fakePostBody, fakePostBodyContentType);

      expect(mockPost).toBeCalledWith(fakeLink, fakeAccessToken,
        fakeAccessTokenSecret, fakePostBody, fakePostBodyContentType,
        expect.any(Function));
    });

    it('returns an error', () => {
      expect.assertions(1);

      const OAuth = require('oauth');
      const error = chance.string();

      let statusCode = chance.natural({ min: 0, max: 500 });

      while (statusCode > 200 && statusCode < 300) {
        statusCode = chance.natural({ min: 0, max: 500 });
      }

      OAuth.OAuth = jest.fn().mockImplementation(() => ({
        post: (fakeLink, fakeAccessToken, fakeAccessTokenSecret,
          fakePostBody, fakePostBodyContentType, callback) => {
          callback(error, null, { statusCode });
        },
      }));

      const { doSignAndPost } = require('../src/OAuthSignRequest');

      const fakeLink = chance.url();
      const fakeAccessToken = chance.string();
      const fakeAccessTokenSecret = chance.string();
      const fakePostBody = chance.string();
      const fakePostBodyContentType = chance.string();

      expect(doSignAndPost(fakeLink, fakeAccessToken, fakeAccessTokenSecret,
        fakePostBody, fakePostBodyContentType))
        .resolves.toMatch(getStatusText(statusCode));
    });

    it('returns an error', () => {
      expect.assertions(1);

      const OAuth = require('oauth');
      const error = chance.string();

      OAuth.OAuth = jest.fn().mockImplementation(() => ({
        post: (fakeLink, fakeAccessToken, fakeAccessTokenSecret, fakePostBody,
          fakePostBodyContentType, callback) => {
          callback(error, null, { statusCode: 200 });
        },
      }));

      const { doSignAndPost } = require('../src/OAuthSignRequest');

      const fakeLink = chance.url();
      const fakeAccessToken = chance.string();
      const fakeAccessTokenSecret = chance.string();
      const fakePostBody = chance.string();
      const fakePostBodyContentType = chance.string();

      expect(doSignAndPost(fakeLink, fakeAccessToken, fakeAccessTokenSecret,
        fakePostBody, fakePostBodyContentType)).rejects.toMatch(error);
    });

    it('returns a promise', () => {
      mockOAuth();

      const { doSignAndPost } = require('../src/OAuthSignRequest');

      const promise = doSignAndPost();

      expect(promise instanceof Promise).toEqual(true);
    });

    it('returns a promise that resolves with the post response data', async () => {
      const fakeResponseData = chance.string();

      mockOAuth(fakeResponseData);

      const { doSignAndPost } = require('../src/OAuthSignRequest');

      const responseData = await doSignAndPost();

      expect(responseData.body).toEqual(fakeResponseData);
    });
  });
});
