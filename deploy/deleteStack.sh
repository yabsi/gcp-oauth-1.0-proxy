#!/bin/bash
set -e

# Extract bamboo variables
deployEnvironment=$bamboo_deploy_environment

# Extract environment variables
stackName=$bamboo_STACK_NAME

# Look up the ARN for the environment we are deploying into
adminARN="$(printenv bamboo_SAI_${deployEnvironment}_ADMIN_ARN )"
echo "Assuming role: $adminARN"
source /bin/assumeRole $adminARN

echo "Deleting Stack..."
aws cloudformation delete-stack --stack-name $stackName

echo "Successfully Deleted Stack"
