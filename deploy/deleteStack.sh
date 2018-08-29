#!/bin/bash
set -e

echo "Loading environment variables from .env file..."
set -o allexport
source .env
set +o allexport

echo "Assuming IAM Admin Role..."
source /bin/assumeRole $ADMIN_ARN

echo "Deleting Stack..."
aws cloudformation delete-stack --stack-name $STACK_NAME

echo "Successfully Deleted Stack"
