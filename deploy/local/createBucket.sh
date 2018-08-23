#!/bin/bash
set -e

set -o allexport
source ../../.env
set +o allexport

echo "Creating Bucket..."
bucketName="${BUCKET_NAME}-${DEPLOY_ENVIRONMENT,,}"
aws s3 mb s3://$bucketName

echo "Successfully Created Bucket"
