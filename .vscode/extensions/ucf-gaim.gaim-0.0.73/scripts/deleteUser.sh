#!/bin/env bash
source .env
echo "Deleting user $1"
echo $token
# First, delete the repository.
  # -i \
curl \
  -H "Authorization: token $token" \
  -H "Accept: application/vnd.github.v3+json" \
  -X DELETE \
 https://api.github.com/repos/UCF-GaiM/dig3480-sb21-$2-$1
curl \
  -i \
  -X DELETE \
 https://plato.mrl.ai:8081/git/user/$1

curl \
  -i \
  -X DELETE \
 https://plato.mrl.ai:8081/git/repo/https%3A%2F%2Fgithub.com%2FUCF-GaiM%2Fdig3480-sb21-$2-$1
