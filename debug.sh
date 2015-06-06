#!/bin/bash

mv hooks/before_build hooks/before_build_bak
cp -rf ../demigod-tester/dist/* ./www
cordova build
cordova run android
mv hooks/before_build_bak hooks/before_build
