#!/bin/bash
set -e

echo "Removing the S3 bucket..."
bucketName="aws-oauth-1.0-proxy-test"
aws s3 rb s3://$bucketName --force
aws s3api wait bucket-not-exists --bucket $bucketName

echo "Creating a new S3 bucket..."
aws s3 mb s3://$bucketName
aws s3api wait bucket-exists --bucket $bucketName
echo $bucketName

echo "Putting the zipped code into the S3 bucket..."
aws s3api put-object --bucket $bucketName --key artifact.zip --body ../../artifact.zip

echo "Creating the lambdas..."
stackName="aws-oauth-proxy-stack"
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
        ClientKey="cdMaZqU0sMr9qep1GdJeu5TEZ" \
        ClientSecret="TQkIOM3pfXZ4YfonweaIROKtSxJpJYgWijYzF6ciqlwKzD6TNZ" \
        BucketName=$bucketName \
        ApiUrl="https://api.twitter.com" \
        OAuthCustomHeaders="application/x-www-form-urlencoded" \
        AuthorizeCallbackUri="https://maxwelltalley.com" \
    --no-fail-on-empty-changeset \

echo "Describing stack events..."
aws cloudformation describe-stack-events --stack-name $stackName

echo "Deploy successful"
