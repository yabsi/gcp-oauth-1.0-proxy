#!/bin/bash
set -e

# Extract bamboo variables
DEPLOY_ENVIRONMENT=$bamboo_deploy_environment

# Extract environment variables
AWS_USER_ID=$bamboo_AWS_USER_ID

# Look up the IAM admin role ARN for the environment we are deploying into
ADMIN_ARN="$(printenv bamboo_SAI_${DEPLOY_ENVIRONMENT}_ADMIN_ARN )"

# Write environment variables to .env file
echo "DEPLOY_ENVIRONMENT=${DEPLOY_ENVIRONMENT}" > .env
echo "AWS_USER_ID=${AWS_USER_ID}" >> .env
echo "ADMIN_ARN=${ADMIN_ARN}" >> .env

# Run createProdRole script
bash deploy/createProdRole.sh
