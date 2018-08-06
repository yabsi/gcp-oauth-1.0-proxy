#!/bin/bash
set -e

# Look up the ARN for the environment we are deploying into

adminARN="$(printenv bamboo_SAI_${bamboo_deploy_environment}_ADMIN_ARN )"
echo "Assuming role: $adminARN"
source /bin/assumeRole $adminARN
release=$bamboo_deploy_release
stackName=$bamboo_StackName
bucketName="${bamboo_BucketNamePrefix}-${bamboo_deploy_environment,,}"
aws s3 rb s3://$bucketName --force
echo Waiting bucket to be deleted
aws s3api wait bucket-not-exists --bucket $bucketName
echo Making the stack and s3 bucket
aws s3 mb s3://$bucketName
echo $bucketName
aws s3api wait bucket-exists --bucket $bucketName
echo "This is putting the file into the S3 bucket"
aws s3api put-object --bucket $bucketName --key artifact.zip --body ../artifact.zip

echo "Making the lambdas"
aws cloudformation deploy --stack-name $stackName \
    --template-file cloudformation.template.JSON \
    --tags \
        Customer=SAI \
        Name=AgPoint \
        Contact=AgPoint \
        ContactEmail=agpoint@sourceallies.com \
        Release=$release \
    --parameter-overrides \
        CLIENTKEY=$bamboo_CLIENTKEY \
        CLIENTSECRET=$bamboo_CLIENTSECRET \
        BucketName=$bucketName \
    --no-fail-on-empty-changeset \

echo "Describing stack events"
aws cloudformation describe-stack-events --stack-name sai-find-things-auth
