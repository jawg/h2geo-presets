#!/usr/bin/env bash
SOURCE_BRANCH="master"
TARGET_BRANCH="gh-pages"

npm install
# Pull requests and commits to other branches shouldn't try to deploy, just build to verify
if [ "$TRAVIS_PULL_REQUEST" != "false" -o "$TRAVIS_BRANCH" != "$SOURCE_BRANCH" ]; then
    echo "Skipping deploy."
    exit 0
fi

openssl aes-256-cbc -K $encrypted_20aefe02d3a5_key -iv $encrypted_20aefe02d3a5_iv -in deploy_key.enc -out deploy_key -d
