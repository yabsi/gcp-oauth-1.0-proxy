#!/bin/sh
echo "Starting install"
npm install
echo "Starting test install is over"
chmod -r 500:501 node_modules
npm run test
echo "Tests over"
echo "Running Webpack"
npm run build
echo "Finished running Webpack"
