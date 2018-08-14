#!/bin/bash
set -e

set -o allexport
source ../../.env
set +o allexport

echo "Removing the S3 bucket..."
bucketName=$BUCKET_NAME
aws s3 rb s3://$bucketName --force
aws s3api wait bucket-not-exists --bucket $bucketName

echo "Creating a new S3 bucket..."
aws s3 mb s3://$bucketName
aws s3api wait bucket-exists --bucket $bucketName
echo $bucketName

echo "Putting the zipped code into the S3 bucket..."
aws s3api put-object --bucket $bucketName --key artifact.zip --body ../../artifact.zip

echo "Creating the lambdas..."
stackName=$STACK_NAME
release="1.0.0"
aws cloudformation deploy --stack-name $stackName \
    --template-file ../cloudformation.template.JSON \
    --tags \
        Customer=SAI \
        Name=AgPoint \
        Contact=AgPoint \
        ContactEmail=agpoint@sourceallies.com \
        Release=$release \
    --parameter-overrides \
        ClientKey=$CLIENT_KEY \
        ClientSecret=$CLIENT_SECRET \
        BucketName=$bucketName \
        ApiUrl=$API_URL \
        OAuthCustomHeaders="application/x-www-form-urlencoded" \
        AuthorizeCallbackUri=$AUTHORIZE_CALLBACK_URI \
    --no-fail-on-empty-changeset \

echo "Describing stack events..."
aws cloudformation describe-stack-events --stack-name $stackName

echo "Deploy successful"
