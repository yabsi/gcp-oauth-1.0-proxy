const config = require('../config');
const { getStatusText } = require('../src/HttpResponses');

describe('Lambda handlers', () => {
  afterEach(() => {
    jest.resetModules();
  });

  describe('OAuth First Leg Handler', () => {
    it('Gives back the temporary tokens', () => {
      const event = chance.string();
      const context = chance.string();
      const callback = jest.fn();

      const fakeError = null;
      const fakeResponseData = chance.string();
      const fakeResult = { statusCode: chance.natural({ min: 200, max: 299 }) };

      const fakeUserToken = chance.string();
      const fakeUserTokenSecret = chance.string();

      const fakeGet = jest.fn().mockImplementation((link, accessToken,
        accessTokenSecret, tokenCallback) => {
        tokenCallback(fakeError, fakeResponseData, fakeResult);
      });

      const fakeGetOAuthRequestToken = jest.fn().mockImplementation((userTokenCallback) => {
        userTokenCallback(fakeError, fakeUserToken, fakeUserTokenSecret);
      });

      /* eslint-disable global-require */
      const OAuth = require('oauth');

      OAuth.OAuth = jest.fn().mockImplementation(() => ({
        get: fakeGet,
        getOAuthRequestToken: fakeGetOAuthRequestToken,
      }));

      /* eslint-disable global-require */
      const FirstLeg = require('../src/OAuthFirstLeg');

      const fakeOAuthTokens = {
        oauthRequestTokenUri: chance.url(),
        oauthAccessTokenUri: chance.url(),
      };
      const fakeTokens = chance.string();

      FirstLeg.getTemporaryOAuthTokens = jest.fn().mockReturnValue(fakeOAuthTokens);
      FirstLeg.getTemporaryUserTokens = jest.fn().mockReturnValue(fakeTokens);

      /* eslint-disable global-require */
      const { firstLegHandler } = require('../app');

      firstLegHandler(event, context, callback);

      const oAuthFirstCallParameters = OAuth.OAuth.mock.calls[0];

      expect(oAuthFirstCallParameters).toEqual([
        undefined,
        undefined,
        config.clientKey,
        config.clientSecret,
        config.oAuthVersion,
        config.authorizeCallbackUri,
        config.oAuthSignatureMethod,
        config.oAuthNonceSize,
        config.oAuthCustomHeaders,
      ]);

      expect(FirstLeg.getTemporaryOAuthTokens)
        .toBeCalledWith(fakeError, fakeResponseData, fakeResult);

      const oAuthSecondCallParameters = OAuth.OAuth.mock.calls[1];

      expect(oAuthSecondCallParameters).toEqual([
        fakeOAuthTokens.oauthRequestTokenUri,
        fakeOAuthTokens.oauthAccessTokenUri,
        config.clientKey,
        config.clientSecret,
        config.oAuthVersion,
        config.authorizeCallbackUri,
        config.oAuthSignatureMethod,
        config.oAuthNonceSize,
        config.oAuthCustomHeaders,
      ]);

      expect(FirstLeg.getTemporaryUserTokens)
        .toBeCalledWith(fakeError, fakeUserToken, fakeUserTokenSecret);
      const response = {
        statusCode: 200,
        headers: {
          success: 'true',
        },
        body: JSON.stringify(fakeTokens),
        isBase64Encoded: false,
      };

      expect(callback).toBeCalledWith(null, response);
    });

    it('Gives back the temporary tokens', () => {
      const event = chance.string();
      const context = chance.string();
      const callback = jest.fn();

      const fakeError = null;
      const fakeResponseData = chance.string();

      let statusCode = chance.natural({ min: 0, max: 500 });

      while (statusCode > 200 && statusCode < 300) {
        statusCode = chance.natural({ min: 0, max: 500 });
      }

      const fakeGet = jest.fn()
        .mockImplementation((link, accessToken, accessTokenSecret, tokenCallback) => {
          tokenCallback(fakeError, fakeResponseData, { statusCode });
        });

      /* eslint-disable global-require */
      const OAuth = require('oauth');

      OAuth.OAuth = jest.fn().mockImplementation(() => ({
        get: fakeGet,
        getOAuthRequestToken: jest.fn(),
      }));

      /* eslint-disable global-require */
      const FirstLeg = require('../src/OAuthFirstLeg');

      const fakeTokens = chance.string();
      const fakeOAuthTokens = chance.string();

      FirstLeg.getTemporaryOAuthTokens = jest.fn().mockReturnValue(fakeOAuthTokens);
      FirstLeg.getTemporaryUserTokens = jest.fn().mockReturnValue(fakeTokens);

      /* eslint-disable global-require */
      const { firstLegHandler } = require('../app');

      firstLegHandler(event, context, callback);

      expect(fakeGet).toHaveBeenCalled();

      const response1 = {
        statusCode: 200,
        headers: {
          success: 'HttpError',
        },
        body: JSON.stringify(getStatusText(statusCode)),
        isBase64Encoded: false,
      };

      const response2 = {
        statusCode: 200,
        headers: {
          success: 'HttpError',
        },
        body: JSON.stringify(fakeOAuthTokens),
        isBase64Encoded: false,
      };

      expect(callback).toBeCalledWith(null, response1);
      expect(callback).toBeCalledWith(null, response2);
    });
  });

  describe('OAuth Third Leg Handler', () => {
    const generateFakeEvent = () => ({
      body: JSON.stringify({
        requestToken: chance.string(),
        requestTokenSecret: chance.string(),
        verifier: chance.string(),
      }),
    });

    it('is a function', () => {
      /* eslint-disable global-require */
      const { thirdLegHandler } = require('../app');

      expect(thirdLegHandler).toEqual(expect.any(Function));
    });

    it('gets the oauth token', () => {
      /* eslint-disable global-require */
      const OAuth = require('oauth');

      const mockGetOAuthAccessToken = jest.fn();

      OAuth.OAuth = jest.fn().mockImplementation(() => ({
        getOAuthAccessToken: mockGetOAuthAccessToken,
      }));

      const { thirdLegHandler } = require('../app');

      const event = generateFakeEvent();
      const {
        requestToken,
        requestTokenSecret,
        verifier,
      } = JSON.parse(event.body);

      thirdLegHandler(event);

      expect(mockGetOAuthAccessToken)
        .toBeCalledWith(requestToken, requestTokenSecret, verifier, expect.any(Function));
    });

    it('sends back the correct response when there is an error', () => {
      const OAuth = require('oauth');

      const fakeError = new Error(chance.sentence());

      const mockGetOAuthAccessToken = jest.fn()
        .mockImplementation((token, secret, verifier, callback) => {
          callback(fakeError);
        });

      OAuth.OAuth = jest.fn().mockImplementation(() => ({
        getOAuthAccessToken: mockGetOAuthAccessToken,
      }));

      const context = undefined;
      const fakeCallback = jest.fn();

      const { thirdLegHandler } = require('../app');

      thirdLegHandler(generateFakeEvent(), context, fakeCallback);
      const expectedResponse = {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(fakeError),
        isBase64Encoded: false,
      };

      expect(fakeCallback).toBeCalledWith(null, expectedResponse);
    });

    it('sends back the correct response when the request is successful', () => {
      const OAuth = require('oauth');

      const fakeAccessToken = chance.string();
      const fakeAccessTokenSecret = chance.string();

      const mockGetOAuthAccessToken = jest.fn()
        .mockImplementation((token, secret, verifier, callback) => {
          callback(undefined, fakeAccessToken, fakeAccessTokenSecret);
        });

      OAuth.OAuth = jest.fn().mockImplementation(() => ({
        getOAuthAccessToken: mockGetOAuthAccessToken,
      }));

      const context = undefined;
      const fakeCallback = jest.fn();

      const { thirdLegHandler } = require('../app');

      thirdLegHandler(generateFakeEvent(), context, fakeCallback);
      const expectedResponse = {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          accessToken: fakeAccessToken,
          accessTokenSecret: fakeAccessTokenSecret,
        }),
        isBase64Encoded: false,
      };

      expect(fakeCallback).toBeCalledWith(null, expectedResponse);
    });
  });

  describe('OAuth Sign Request Get Handler', () => {
    it('signs and gets the request, then returns the response', async () => {
      const url = chance.url();
      const accessToken = chance.string();
      const accessTokenSecret = chance.string();

      const event = {
        queryStringParameters: {
          url,
          accessToken,
          accessTokenSecret,
        },
      };

      const OAuthSignRequest = require('../src/OAuthSignRequest');

      const fakeResponseData = {};
      const numberOfResponseDataKeys = chance.natural({ min: 2, max: 5 });

      for (let i = 0; i < numberOfResponseDataKeys; i += 1) {
        fakeResponseData[chance.string()] = chance.string();
      }

      fakeResponseData.status = chance.natural();

      OAuthSignRequest.doSignAndGet = jest.fn().mockResolvedValue(fakeResponseData);

      const { oAuthSignRequestGet } = require('../app');

      const responseData = await oAuthSignRequestGet(event);

      expect(OAuthSignRequest.doSignAndGet).toBeCalledWith(url, accessToken, accessTokenSecret);
      const response = {
        statusCode: fakeResponseData.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(fakeResponseData),
        isBase64Encoded: false,
      };

      expect(responseData).toEqual(response);
    });

    it('returns an error when an error occurs during the signing and get', async () => {
      const url = chance.url();
      const accessToken = chance.string();
      const accessTokenSecret = chance.string();

      const event = {
        queryStringParameters: {
          url,
          accessToken,
          accessTokenSecret,
        },
      };

      const OAuthSignRequest = require('../src/OAuthSignRequest');

      const fakeError = new Error(chance.sentence());

      OAuthSignRequest.doSignAndGet = jest.fn().mockRejectedValue(fakeError);

      const { oAuthSignRequestGet } = require('../app');

      const error = await oAuthSignRequestGet(event);

      expect(OAuthSignRequest.doSignAndGet).toBeCalledWith(url, accessToken, accessTokenSecret);
      const response = {
        statusCode: 502,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: `${fakeError}`,
        isBase64Encoded: false,
      };

      expect(error).toEqual(response);
    });
  });

  describe('OAuth Sign Request Post Handler', () => {
    let oAuthSignRequestPost;

    const createFakeEvent = (options = {}) => ({
      body: JSON.stringify({
        url: options.url || chance.url(),
        accessToken: options.accessToken || chance.string(),
        accessTokenSecret: options.accessTokenSecret || chance.string(),
        data: options.data || chance.string(),
      }),
    });

    beforeEach(() => {
      const OAuthSignRequest = require('../src/OAuthSignRequest');

      OAuthSignRequest.doSignAndPost = jest.fn().mockResolvedValue(chance.string());

      /* eslint-disable prefer-destructuring */
      oAuthSignRequestPost = require('../app').oAuthSignRequestPost;
    });

    it('is a function', () => {
      expect(typeof oAuthSignRequestPost).toEqual('function');
    });

    it('returns a promise', () => {
      const response = oAuthSignRequestPost(createFakeEvent());

      expect(response instanceof Promise).toEqual(true);
    });

    it('calls doSignAndPost correctly', () => {
      jest.resetModules();

      const OAuthSignRequest = require('../src/OAuthSignRequest');

      OAuthSignRequest.doSignAndPost = jest.fn().mockResolvedValue(chance.string());

      /* eslint-disable prefer-destructuring */
      oAuthSignRequestPost = require('../app').oAuthSignRequestPost;

      const url = chance.url();
      const accessToken = chance.string();
      const accessTokenSecret = chance.string();
      const data = chance.string();
      const expectedContentType = process.env.OAUTH_CUSTOM_HEADERS;
      const fakeEvent = createFakeEvent({
        url,
        accessToken,
        accessTokenSecret,
        data,
      });

      oAuthSignRequestPost(fakeEvent);

      expect(OAuthSignRequest.doSignAndPost)
        .toBeCalledWith(url, accessToken, accessTokenSecret,
          JSON.stringify(data), expectedContentType);
    });

    it('returns the correct response when the post works', async () => {
      jest.resetModules();

      const OAuthSignRequest = require('../src/OAuthSignRequest');
      const status = 200;
      const fakeResponseData = JSON.stringify({ body: chance.string() });
      const fakeLocation = chance.string();
      const fakeResponse = {
        status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          location: fakeLocation,
        },
        body: fakeResponseData,
        isBase64Encoded: false,
      };

      OAuthSignRequest.doSignAndPost = jest.fn().mockResolvedValue(fakeResponse);

      /* eslint-disable prefer-destructuring */
      oAuthSignRequestPost = require('../app').oAuthSignRequestPost;

      const response = await oAuthSignRequestPost(createFakeEvent());
      const expectedResponse = {
        statusCode: status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          location: response.headers.location,
        },
        body: JSON.stringify(fakeResponseData),
        isBase64Encoded: false,
      };

      expect(response).toEqual(expectedResponse);
    });

    it('returns an error when does not resolve', async () => {
      jest.resetModules();

      const OAuthSignRequest = require('../src/OAuthSignRequest');

      const fakeError = {};
      const numberOfErrorKeys = chance.natural({ min: 2, max: 5 });

      for (let i = 0; i < numberOfErrorKeys; i += 1) {
        fakeError[chance.string()] = chance.string();
      }

      const fakeErrorResponse = {
        statusCode: 502,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(fakeError),
        isBase64Encoded: false,
      };

      OAuthSignRequest.doSignAndPost = jest.fn().mockRejectedValue(fakeError);

      /* eslint-disable prefer-destructuring */
      oAuthSignRequestPost = require('../app').oAuthSignRequestPost;

      expect.assertions(1);

      const returnedError = await oAuthSignRequestPost(createFakeEvent());

      expect(returnedError).toEqual(fakeErrorResponse);
    });
  });
});
