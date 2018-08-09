#!/bin/bash
set -e

# Look up the ARN for the environment we are deploying into
adminARN="$(printenv bamboo_SAI_${bamboo_deploy_environment}_ADMIN_ARN )"
echo "Assuming role: $adminARN"
source /bin/assumeRole $adminARN

echo "Creating Role..."
aws iam create-role --role-name basic-lambda-execution-role \
--assume-role-policy-document file://Lambda_execution.JSON \

echo "Creating Policy..."
aws iam create-policy --policy-name basic-lambda-execution-managed-policy \
--policy-document file://policy.JSON \

echo "Attaching Policy..."
aws iam attach-role-policy --role-name basic-lambda-execution-role \
--policy-arn arn:aws:iam::487696863217:policy/basic-lambda-execution-managed-policy \

echo "Successfully Created Role"
