#!/bin/bash
set -e

# Look up the ARN for the environment we are deploying into

adminARN="$(printenv bamboo_SAI_${bamboo_deploy_environment}_ADMIN_ARN )"
echo "Assuming role: $adminARN"
source /bin/assumeRole $adminARN

echo "Removing the S3 bucket..."
bucketName="sai-find-things-auth-${bamboo_deploy_environment,,}"
aws s3 rb s3://$bucketName --force
aws s3api wait bucket-not-exists --bucket $bucketName

echo "Creating a new S3 bucket..."
aws s3 mb s3://$bucketName
aws s3api wait bucket-exists --bucket $bucketName
echo $bucketName

echo "Putting the zipped code into the S3 bucket..."
aws s3api put-object --bucket $bucketName --key artifact.zip --body ../artifact.zip

echo "Creating the lambdas..."
stackName=$bamboo_STACK_NAME
release=$bamboo_deploy_release
aws cloudformation deploy --stack-name $stackName \
    --template-file cloudformation.template.JSON \
    --tags \
        Customer=SAI \
        Name=AgPoint \
        Contact=AgPoint \
        ContactEmail=agpoint@sourceallies.com \
        Release=$release \
    --parameter-overrides \
        ClientKey=$bamboo_CLIENT_KEY \
        ClientSecret=$bamboo_CLIENT_SECRET \
        BucketName=$bucketName \
        ApiUrl=$bamboo_API_URL \
        OAuthCustomHeaders=$bamboo_OAUTH_CUSTOM_HEADERS \
        AuthorizeCallbackUri=$bamboo_AUTHORIZE_CALLBACK_URI \
    --no-fail-on-empty-changeset \

echo "Describing stack events..."
aws cloudformation describe-stack-events --stack-name $stackName

echo "Deploy successful"
