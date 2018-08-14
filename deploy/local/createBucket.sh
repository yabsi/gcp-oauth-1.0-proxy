#!/bin/bash
set -o allexport
source ../../.env
set +o allexport

echo "Creating Bucket..."
aws s3 mb s3://$BUCKET_NAME

echo "Successfully Created Bucket"
