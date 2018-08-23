#!/bin/bash
set -e

adminARN="$(printenv bamboo_SAI_${bamboo_deploy_environment}_ADMIN_ARN )"
echo "Assuming role: $adminARN"
source /bin/assumeRole $adminARN

echo "Deleting Stack..."
aws cloudformation delete-stack --stack-name $bamboo_STACK_NAME

echo "Successfully Deleted Stack"
