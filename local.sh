#!/bin/bash

rm -rf ./www/*
mv hooks/before_build hooks/before_build_bak
mv hooks/after_build hooks/after_build_bak

cp -rf ../demigod-tester/dist/* ./www
grep -rl "o.dp:3000" ./www | xargs sed -i '' 's/o.dp:3000/gulu.0yuchen.com/g'
cordova build android --debug

mv hooks/before_build_bak hooks/before_build
mv hooks/after_build_bak hooks/after_build

scp ./platforms/android/ant-build/MainActivity-debug.apk xyh@guluabc.com:/home/xyh/app-getter/public/tester-local.apk
exit
