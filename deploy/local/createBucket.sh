#!/bin/bash
set -e

echo "Creating Bucket..."
bucketName="aws-oauth-1.0-proxy-test-1"
aws s3 mb s3://$bucketName

echo "Successfully Created Bucket"
