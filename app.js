const { OAuth } = require('oauth');
const config = require('./config');
const { doSignAndGet } = require('./src/OAuthSignRequest');
const { doSignAndPost } = require('./src/OAuthSignRequest');
const { getTemporaryOAuthTokens, getTemporaryUserTokens } = require('./src/OAuthFirstLeg');
const { getStatusText } = require('./src/HttpResponses');
require('dotenv').config();

exports.firstLegHandler = (event, context, callback) => {
  let tokens;
  const tokenlessOauthSession = new OAuth(
    undefined,
    undefined,
    config.clientKey,
    config.clientSecret,
    config.oAuthVersion,
    config.authorizeCallbackUri,
    config.oAuthSignatureMethod,
    config.oAuthNonceSize,
    config.oAuthCustomHeaders,
  );

  tokenlessOauthSession.get(config.platformBaseUri, null, null, (error, responseData, result) => {
    if (result.statusCode < 200 || result.statusCode >= 300) {
      const response = {
        statusCode: 200,
        headers: {
          success: 'HttpError',
        },
        body: JSON.stringify(getStatusText(result.statusCode)),
        isBase64Encoded: false,
      };

      callback(null, response);
    }
    const temporaryTokens = getTemporaryOAuthTokens(error, responseData, result);

    if (typeof temporaryTokens === 'string') {
      const response = {
        statusCode: 200,
        headers: {
          success: 'HttpError',
        },
        body: JSON.stringify(temporaryTokens),
        isBase64Encoded: false,
      };

      callback(null, response);
    }

    Object.keys(temporaryTokens).forEach((key) => {
      config[key] = temporaryTokens[key];
    });

    const userTokenOAuthSession = new OAuth(
      config.oauthRequestTokenUri,
      config.oauthAccessTokenUri,
      config.clientKey,
      config.clientSecret,
      config.oAuthVersion,
      config.authorizeCallbackUri,
      config.oAuthSignatureMethod,
      config.oAuthNonceSize,
      config.oAuthCustomHeaders,
    );

    userTokenOAuthSession.getOAuthRequestToken((userTokenError, token, secret) => {
      tokens = getTemporaryUserTokens(userTokenError, token, secret);
      const response = {
        statusCode: 200,
        headers: {
          success: 'true',
        },
        body: JSON.stringify(tokens),
        isBase64Encoded: false,
      };

      callback(null, response);
    });
  });
};

exports.thirdLegHandler = (event, context, callback) => {
  const receivedBody = JSON.parse(event.body);

  const {
    requestToken,
    requestTokenSecret,
    verifier,
  } = receivedBody;

  const oAuthSession = new OAuth(
    `${process.env.API_URL}/oauth/request_token`,
    `${process.env.API_URL}/oauth/access_token`,
    config.clientKey,
    config.clientSecret,
    config.oAuthVersion,
    config.authorizeCallbackUri,
    config.oAuthSignatureMethod,
    config.oAuthNonceSize,
    config.oAuthCustomHeaders,
  );

  const responseCallback = (error, accessToken, accessTokenSecret) => {
    let body = {
      accessToken,
      accessTokenSecret,
    };

    if (error) {
      body = error;
    }

    callback(null, {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(body),
      isBase64Encoded: false,
    });
  };

  oAuthSession.getOAuthAccessToken(requestToken, requestTokenSecret, verifier, responseCallback);
};

exports.oAuthSignRequestGet = async (event) => {
  const receivedResponse = JSON.parse(JSON.stringify(event));

  const {
    url,
    accessToken,
    accessTokenSecret,
  } = receivedResponse.queryStringParameters;

  const response = await doSignAndGet(url, accessToken, accessTokenSecret)
    .then(responseData => ({
      statusCode: responseData.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(responseData),
      isBase64Encoded: false,
    }))
    .catch(error => ({
      statusCode: 502,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: `${error}`,
      isBase64Encoded: false,
    }));

  return response;
};

exports.oAuthSignRequestPost = async (event) => {
  const receivedBody = JSON.parse(event.body);

  const {
    url,
    accessToken,
    accessTokenSecret,
    data,
  } = receivedBody;

  const response = await doSignAndPost(url, accessToken, accessTokenSecret, JSON.stringify(data),
    process.env.OAUTH_CUSTOM_HEADERS)
    .then(responseData => ({
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        location: responseData.headers.location,
      },
      body: JSON.stringify(responseData.body),
      isBase64Encoded: false,
    }))
    .catch(error => ({
      statusCode: 502,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(error),
      isBase64Encoded: false,
    }));
  return response;
};
