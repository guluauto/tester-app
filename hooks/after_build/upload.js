#!/usr/local/bin/node

var shell = require('shelljs');

upload();

function upload() {
  shell.cp('-rf', 'platforms/android/ant-build/MainActivity-debug.apk', './');
  shell.mv('MainActivity-debug.apk', 'tester.apk');
  var scp = shell.exec('scp ./tester.apk xyh@guluabc.com:/home/xyh/vermgr/public/tester.apk');
  console.log(scp.output);
  shell.exec('rm -rf ./tester.apk');
}

