#!/bin/bash
set -e
echo "Deleting Stack"

adminARN="$(printenv bamboo_SAI_${bamboo_deploy_environment}_ADMIN_ARN )"
echo "Assuming role: $adminARN"
source /bin/assumeRole $adminARN
aws cloudformation delete-stack --stack-name $bamboo_STACK_NAME
