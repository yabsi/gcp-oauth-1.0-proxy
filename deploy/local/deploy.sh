#!/bin/bash
set -e

set -o allexport
source ../../.env
set +o allexport

echo "Removing the S3 bucket..."
bucketName="${BUCKET_NAME}-${DEPLOY_ENVIRONMENT,,}"
aws s3 rb s3://$bucketName --force
aws s3api wait bucket-not-exists --bucket $bucketName

echo "Creating a new S3 bucket..."
aws s3 mb s3://$bucketName
aws s3api wait bucket-exists --bucket $bucketName

echo "Putting the zipped code into the S3 bucket..."
aws s3api put-object --bucket $bucketName --key artifact.zip --body ../../artifact.zip

echo "Creating the lambdas..."
stackName=$STACK_NAME
aws cloudformation deploy --stack-name $stackName \
    --template-file ../cloudformation.template.JSON \
    --tags \
        Customer=SAI \
        Name=AgPoint \
        Contact=AgPoint \
        ContactEmail=agpoint@sourceallies.com \
        Release=$RELEASE_NUMBER \
    --parameter-overrides \
        ClientKey=$CLIENT_KEY \
        ClientSecret=$CLIENT_SECRET \
        BucketName=$bucketName \
        ApiUrl=$API_URL \
        OAuthCustomHeaders=$OAUTH_CUSTOM_HEADERS \
        AuthorizeCallbackUri=$AUTHORIZE_CALLBACK_URI \
    --no-fail-on-empty-changeset \

echo "Describing stack events..."
aws cloudformation describe-stack-events --stack-name $stackName

echo "Deploy successful"
