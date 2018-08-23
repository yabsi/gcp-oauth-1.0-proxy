#!/bin/bash
set -e

# Extract bamboo variables
deployEnvironment=$bamboo_deploy_environment # DEV, QUAL, or PROD
releaseVersion=$bamboo_deploy_release

# Extract environment variables
bucketName="${bamboo_BUCKET_NAME}-${deployEnvironment,,}"
stackName=$bamboo_STACK_NAME
clientKey=$bamboo_CLIENT_KEY
clientSecret=$bamboo_CLIENT_SECRET
apiUrl=$bamboo_API_URL
authorizeCallbackUri=$bamboo_AUTHORIZE_CALLBACK_URI
oAuthCustomHeaders=$bamboo_OAUTH_CUSTOM_HEADERS

# Look up the ARN for the environment we are deploying into
adminARN="$(printenv bamboo_SAI_${deployEnvironment}_ADMIN_ARN )"
echo "Assuming role: $adminARN"
source /bin/assumeRole $adminARN

echo "Removing the S3 bucket..."
aws s3 rb s3://$bucketName --force
aws s3api wait bucket-not-exists --bucket $bucketName

echo "Creating a new S3 bucket..."
aws s3 mb s3://$bucketName
aws s3api wait bucket-exists --bucket $bucketName

echo "Putting the zipped code into the S3 bucket..."
aws s3api put-object --bucket $bucketName --key artifact.zip --body ../artifact.zip

echo "Creating the lambdas..."
aws cloudformation deploy --stack-name $stackName \
    --template-file cloudformation.template.JSON \
    --tags \
        Customer=SAI \
        Name=AgPoint \
        Contact=AgPoint \
        ContactEmail=agpoint@sourceallies.com \
        Release=$releaseVersion \
    --parameter-overrides \
        ClientKey=$clientKey \
        ClientSecret=$clientSecret \
        BucketName=$bucketName \
        ApiUrl=$apiUrl \
        AuthorizeCallbackUri=$authorizeCallbackUri \
        OAuthCustomHeaders=$oAuthCustomHeaders \
    --no-fail-on-empty-changeset \

echo "Describing stack events..."
aws cloudformation describe-stack-events --stack-name $stackName

echo "Deploy successful"
