#!/bin/env bash
cd /c//Users/lucid/git/dig3480-sb21-t1-hello_csharp_world-ucf-student
git fetch
git checkout main
git branch -d working
# cat scripts/data/vsc.json > .ucf/vsc.json
git reset --hard 35bf734a0e495f656db73f47d2f0638a7e0bd657
git push --force
git config user.name ""
git config user.email ""