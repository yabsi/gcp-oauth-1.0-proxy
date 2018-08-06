const statusCodes = {};

statusCodes[202] = 'Accepted';
statusCodes[502] = 'Bad Gateway';
statusCodes[400] = 'Bad Request';
statusCodes[409] = 'Conflict';
statusCodes[100] = 'Continue';
statusCodes[201] = 'Created';
statusCodes[417] = 'Expectation Failed';
statusCodes[424] = 'Failed Dependency';
statusCodes[403] = 'Forbidden';
statusCodes[504] = 'Gateway Timeout';
statusCodes[410] = 'Gone';
statusCodes[505] = 'HTTP Version Not Supported';
statusCodes[418] = 'I\'m a teapot';
statusCodes[419] = 'Insufficient Space on Resource';
statusCodes[507] = 'Insufficient Storage';
statusCodes[500] = 'Server Error';
statusCodes[411] = 'Length Required';
statusCodes[423] = 'Locked';
statusCodes[420] = 'Method Failure';
statusCodes[405] = 'Method Not Allowed';
statusCodes[301] = 'Moved Permanently';
statusCodes[302] = 'Moved Temporarily';
statusCodes[207] = 'Multi-Status';
statusCodes[300] = 'Multiple Choices';
statusCodes[511] = 'Network Authentication Required';
statusCodes[204] = 'No Content';
statusCodes[203] = 'Non Authoritative Information';
statusCodes[406] = 'Not Acceptable';
statusCodes[404] = 'Not Found';
statusCodes[501] = 'Not Implemented';
statusCodes[304] = 'Not Modified';
statusCodes[200] = 'OK';
statusCodes[206] = 'Partial Content';
statusCodes[402] = 'Payment Required';
statusCodes[308] = 'Permanent Redirect';
statusCodes[412] = 'Precondition Failed';
statusCodes[428] = 'Precondition Required';
statusCodes[102] = 'Processing';
statusCodes[407] = 'Proxy Authentication Required';
statusCodes[431] = 'Request Header Fields Too Large';
statusCodes[408] = 'Request Timeout';
statusCodes[413] = 'Request Entity Too Large';
statusCodes[414] = 'Request-URI Too Long';
statusCodes[416] = 'Requested Range Not Satisfiable';
statusCodes[205] = 'Reset Content';
statusCodes[303] = 'See Other';
statusCodes[503] = 'Service Unavailable';
statusCodes[101] = 'Switching Protocols';
statusCodes[307] = 'Temporary Redirect';
statusCodes[429] = 'Too Many Requests';
statusCodes[401] = 'Unauthorized';
statusCodes[422] = 'Unprocessable Entity';
statusCodes[415] = 'Unsupported Media Type';
statusCodes[305] = 'Use Proxy';

exports.getStatusText = (statusCode) => {
  if (typeof statusCodes[statusCode] === 'undefined') {
    return `Status code does not exist: ${statusCode}`;
  }

  return statusCodes[statusCode];
};
