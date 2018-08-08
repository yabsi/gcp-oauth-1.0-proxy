# OAuth 1.0a Proxy

This project serves as a proxy for OAuth 1.0a requests. It uses AWS Lambdas to sign requests using the specified app ID and secret. The Lambdas cover the first and third legs of OAuth 1.0a authentication as well as sign and proxy GET and POST requests.

## Initial Setup

1. Clone git repo: `git clone https://github.com/sourceallies/aws-oauth-1.0-proxy.git`
2. cd to the git repository
3. `npm install`

## Environment Configuration

Set up environment variables for deployment:

- For local deployments, create an .env file based on .env.example
- For deployment via CI, add environment variables to your build and deploy plans

See [Environment Configuration](https://github.com/sourceallies/aws-oauth-1.0-proxy/wiki/Environment-Configuration) for more details.

## Deploy Steps

The build and deploy scripts in the project are written for Bamboo CI. Thus, for projects deployed locally or using a different CI, the scripts should be treated as a template and should be updated to match your usage of environment variables.

1. Run `./build/build.sh`
    - Installs dependencies
    - Runs tests
    - Webpacks the project
2. Create a `.zip` file containing the project code
3. Run `./deploy/deploy.sh`
    - Removes the old S3 bucket
    - Creates a new S3 bucket
    - Adds the zipped code to the S3 bucket
    - Creates the lambdas

## Endpoints

#### First Leg OAuth: POST

Path: `/firstLegAuth`

Get the temporary oAuth tokens needed for the second leg.

Example Request:

``` json
POST /Prod/firstLegAuth HTTP/1.1
Host: **.execute-api.us-east-1.amazonaws.com
Cache-Control: no-cache
```

Example Response:

``` json
{
    "requestToken": "$tempToken",
    "requestTokenSecret": "$tempSecret"
}
```

#### Third Leg OAuth: POST

Path: `/thirdLegAuth`

Use the temporary oAuth tokens and verifier from the second leg to get the access token and access token secret.

Example Request:

``` json
POST /Prod/thirdLegAuth HTTP/1.1
Host: **.execute-api.us-east-1.amazonaws.com
Content-Type: application/json
Cache-Control: no-cache

{
  "requestToken": "$tempToken",
  "requestTokenSecret": "$tempSecret",
  "verifier": "$verifier"
}
```

Example Response:

``` json
{
    "accessToken": "$accessToken",
    "accessTokenSecret": "$accessTokenSecret"
}
```

#### Sign Request: GET

Path: `/oAuthSignRequest`

Signs the GET request with the app ID and app secret. Provide access tokens and the url to proxy as query parameters.

Example Request:

``` json
GET /Prod/oAuthSignRequest?accessToken=<access_token>&accessTokenSecret=<access_token_secret>&url=<url_to_proxy> HTTP/1.1
Host: **.execute-api.us-east-1.amazonaws.com
Accept: application/json
Content-Type: application/json
Cache-Control: no-cache
```

Response will be the same as what you expect from the url that is being proxied.

If there is an error connecting to the url that is being proxied, the response status code will be 502.

#### Sign Request: POST

Path: `/oAuthSignRequest`

Signs the POST request with the app ID and app secret. Provide access tokens and the url to proxy in the body of the request along with the body that you want to post to the url that is being proxied.

Example Request:

``` json
POST /Prod/oAuthSignRequest HTTP/1.1
Host: **.execute-api.us-east-1.amazonaws.com
Accept: application/json
Content-Type: application/json
Cache-Control: no-cache

{
  "accessToken": "$accessToken",
  "accessTokenSecret": "$accessTokenSecret",
  "url": "$urlToProxy",
  "data": "$postBody"
}
```

A successful response will have a status code of 200. The rest of the response will be what you expect from the url that is being proxied.

If there is an error connecting to the url that is being proxied, the response status code will be 502.

## Testing

#### Unit Tests

Run the [Jest](https://github.com/facebook/jest) test runner:

`npm run test`


#### Linting

Lint repo using [ES Lint](https://github.com/eslint/eslint):

`npm run lint`

## Contribution

Fork the repo and create a pull request describing your contribution.

## License
This project is licensed under the terms of the [Apache 2.0](https://github.com/sourceallies/aws-oauth-1.0-proxy/blob/master/LICENSE) license.
