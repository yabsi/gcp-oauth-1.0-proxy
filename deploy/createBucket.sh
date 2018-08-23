#!/bin/bash
set -e

adminARN="$(printenv bamboo_SAI_${bamboo_deploy_environment}_ADMIN_ARN )"
echo "Assuming role: $adminARN"
source /bin/assumeRole $adminARN

echo "Creating Bucket..."
bucketName="${bamboo_BUCKET_NAME}-${bamboo_deploy_environment,,}"
aws s3 mb s3://$bucketName

echo "Successfully Created Bucket"
