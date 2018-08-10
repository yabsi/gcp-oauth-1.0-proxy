#!/bin/bash
set -e

echo "Deleting Stack..."
aws cloudformation delete-stack --stack-name aws-oauth-proxy-stack

echo "Successfully Deleted Stack"
