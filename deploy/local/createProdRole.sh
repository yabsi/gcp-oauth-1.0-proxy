#!/bin/bash
set -e

echo "Creating Role..."
aws iam create-role --role-name basic-lambda-execution-role \
--assume-role-policy-document file://../Lambda_execution.JSON \

echo "Creating Policy..."
aws iam create-policy --policy-name basic-lambda-execution-managed-policy \
--policy-document file://../policy.JSON \

echo "Attaching Policy..."
aws iam attach-role-policy --role-name basic-lambda-execution-role \
--policy-arn arn:aws:iam::{unique-iam-policy-id}:policy/basic-lambda-execution-managed-policy \

echo "Successfully Created Role"
