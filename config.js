const config = {
  oAuthVersion: '1.0',
  oAuthSignatureMethod: 'HMAC-SHA1',
  oAuthNonceSize: undefined,
  oAuthCustomHeaders: {
    Accept: process.env.CONTENT_TYPE_HEADER,
  },
  contentTypeHeader: process.env.CONTENT_TYPE_HEADER,
  accessControlAllowOriginHeader: process.env.ACCESS_CONTROL_ALLOW_ORIGIN_HEADER,
  clientKey: process.env.CLIENT_KEY,
  clientSecret: process.env.CLIENT_SECRET,
  platformBaseUri: `${process.env.API_URL}/`,
  firstLegUri: `${process.env.API_URL}/oauth/request_token`,
  thirdLegUri: `${process.env.API_URL}/oauth/access_token`,
  authorizeCallbackUri: process.env.AUTHORIZE_CALLBACK_URI,
};

module.exports = config;
