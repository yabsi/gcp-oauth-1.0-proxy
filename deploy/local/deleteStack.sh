#!/bin/bash
set -e

set -o allexport
source ../../.env
set +o allexport

echo "Deleting Stack..."
aws cloudformation delete-stack --stack-name $STACK_NAME

echo "Successfully Deleted Stack"
