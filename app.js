const { OAuth } = require('oauth');
const config = require('./config');
const { doSignAndGet } = require('./src/OAuthSignRequest');
const { doSignAndPost } = require('./src/OAuthSignRequest');
const { getStatusText } = require('./src/HttpResponses');
require('dotenv').config();

exports.firstLegHandler = (event, context, callback) => {
  const tokenlessOauthSession = new OAuth(
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

  const responseCallback = (error, requestToken, requestTokenSecret) => {
    let body = {
      requestToken,
      requestTokenSecret,
    };

    if (error) {
      body = error;
    }

    const response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(body),
      isBase64Encoded: false,
    };

    callback(null, response);
  };

  tokenlessOauthSession.getOAuthRequestToken(responseCallback);
};

exports.thirdLegHandler = (event, context, callback) => {
  const receivedBody = JSON.parse(event.body);

  const {
    requestToken,
    requestTokenSecret,
    verifier,
  } = receivedBody;

  const oAuthSession = new OAuth(
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

  const responseCallback = (error, accessToken, accessTokenSecret) => {
    let body = {
      accessToken,
      accessTokenSecret,
    };

    if (error) {
      body = error;
    }

    const response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(body),
      isBase64Encoded: false,
    };

    callback(null, response);
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
      statusCode: responseData.status,
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
