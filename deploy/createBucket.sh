#!/bin/bash
set -e
echo "Creating Stack"

adminARN="$(printenv bamboo_SAI_${bamboo_deploy_environment}_ADMIN_ARN )"
echo "Assuming role: $adminARN"
source /bin/assumeRole $adminARN
bucketName="${bamboo_BUCKET_NAME}-${bamboo_deploy_environment,,}"
aws s3 mb s3://$bucketName
