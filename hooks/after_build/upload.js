#!/usr/local/bin/node

var shell = require('shelljs');

upload();

function upload() {
  shell.cp('-rf', 'platforms/android/ant-build/MainActivity-release.apk', './');
  shell.mv('./MainActivity-release.apk', './tester.apk');
  console.log(shell.exec('scp ./tester.apk xyh@guluabc.com:/home/xyh/vermgr/public/tester.apk').output);
}

