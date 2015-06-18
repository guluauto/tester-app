#!/bin/bash

rm -rf ./www/*
mv hooks/before_build hooks/before_build_bak
cp -rf ../demigod-tester/dist/* ./www
grep -rl "o.dp:3000" ./www | xargs sed -i '' 's/o.dp:3000/t.ifdiu.com/g'
cordova build android --release
mv hooks/before_build_bak hooks/before_build
cp -rf platforms/android/ant-build/MainActivity-release.apk ./tester.apk
scp -i ~/.ssh/yunhua926.pem ./tester.apk ubuntu@54.64.95.11:/home/ubuntu/demigod-tester/dist
exit
