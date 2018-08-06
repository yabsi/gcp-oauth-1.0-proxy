# OAuth 1.0a Lambdas

[Coveralls]

This repo serves as a proxy for oAuth 1.0a requests. It uses AWS Lambdas to sign requests using the specified app ID and secret. The Lambdas cover the first and third legs of oAuth 1.0a authentication and sign and proxy GET and POST requests.

## Initial Setup

1. Install [Node](https://nodejs.org/en/download/)
2. Clone git repo: `git clone https://github.com/sourceallies/sai-find-things-auth`
3. cd to the git repository
4. `npm install`
5. Create a .env file based on .env.example

## Deploy Steps

1. `./build/build.sh` to webpack the project
2. `./deploy/deploy.sh` to deploy the Lambdas

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

Run the [jest](https://github.com/facebook/jest) test runner:

`npm run test`


#### Linting

Lint repo using ES Lint:

`npm run lint`

## Contribution

Fork the repo and create a pull request describing your contribution.
