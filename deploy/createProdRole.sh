#!/bin/bash
set -e

echo "Loading environment variables from .env file..."
set -o allexport
source .env
set +o allexport

echo "Assuming IAM Admin Role..."
source /bin/assumeRole $ADMIN_ARN

echo "Creating Role..."
aws iam create-role --role-name basic-lambda-execution-role \
--assume-role-policy-document file://deploy/Lambda_execution.JSON \

echo "Creating Policy..."
aws iam create-policy --policy-name basic-lambda-execution-managed-policy \
--policy-document file://deploy/policy.JSON \

echo "Attaching Policy..."
aws iam attach-role-policy --role-name basic-lambda-execution-role \
--policy-arn arn:aws:iam::$AWS_USER_ID:policy/basic-lambda-execution-managed-policy \

echo "Successfully Created Role"
