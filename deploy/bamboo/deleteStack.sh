#!/bin/bash
set -e

# Extract bamboo variables
DEPLOY_ENVIRONMENT=$bamboo_deploy_environment

# Extract environment variables
STACK_NAME=$bamboo_STACK_NAME

# Look up the IAM admin role ARN for the environment we are deploying into
ADMIN_ARN="$(printenv bamboo_SAI_${DEPLOY_ENVIRONMENT}_ADMIN_ARN )"

# Write environment variables to .env file
echo "DEPLOY_ENVIRONMENT=${DEPLOY_ENVIRONMENT}" > .env
echo "STACK_NAME=${STACK_NAME}" >> .env
echo "ADMIN_ARN=${ADMIN_ARN}" >> .env

# Run deleteStack script
bash deploy/deleteStack.sh
