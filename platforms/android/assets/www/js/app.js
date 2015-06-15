// 应用入口
// Module: gulu
// Dependencies:
//    ngRoute, httpInterceptors, gulu.missing

/* global fallbackHash */
angular
  .module('gulu', [
    'ui.router',
    'ngLocale',
    'toastr',
    'ui.bootstrap',
    'custom.directives',
    'httpInterceptors',
    'LocalStorageModule',
    'chieffancypants.loadingBar',
    'util.filters',
    'util.date',
    'util.filer',
    'util.uploader',
    'util.keymgr',
    'gulu.indent',
    'gulu.report',
    'gulu.login',
    'gulu.missing'
  ])
  .config(["$locationProvider", "$urlRouterProvider", "$logProvider", "localStorageServiceProvider", function($locationProvider, $urlRouterProvider, $logProvider, localStorageServiceProvider) {
    // not use html5 history api
    // but use hashbang
    $locationProvider
      .html5Mode(false)
      .hashPrefix('!');

    // define 404
    $urlRouterProvider
      .otherwise('/login');

    // logger
    $logProvider.debugEnabled(true);

    // localStorage prefix
    localStorageServiceProvider
      .setPrefix('gulu.tester')
      .setNotify(true, true);

    // API Server
    API_SERVERS = {
      tester: 'http://t.ifdiu.com'
      // tester: 'http://o.dp:3000'
    }

    angular.element(document).on('deviceready', function() {
      angular.element(document).on('backbutton', function(e) {
        e.preventDefault();

        return false;
      });
    });
  }])
  .run(["$rootScope", "$location", "$state", "$stateParams", function($rootScope, $location, $state, $stateParams) {
    var reg = /[\&\?]_=\d+/;

    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $rootScope.isCollapsed = true;

    // 用于返回上层页面
    $rootScope
      .$watch(function() {
        return $location.url();
      }, function(current, old) {
        if (current.replace(reg, '') === old.replace(reg, '')) {
          return;
        }

        $rootScope.backUrl = old;
      });

    $rootScope.back = function() {
      $location.url($rootScope.backUrl);
    }
  }]);


angular
  .module('gulu.login', [
    'ui.router',
    'gulu.login.svcs'
  ])

  .config(["$stateProvider", function($stateProvider) {
    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'login/login.htm',
        controller: 'LoginCtrl'
      });
  }]);

angular
  .module('gulu.report', [
    'ui.router',
    'util.vm',
    'util.keymgr',
    'gulu.report.svcs',
    'gulu.indent.enums'
  ])
  .config(["$stateProvider", function($stateProvider) {
    $stateProvider
      .state('indents.input_report', {
        url: '/{indent_id:[0-9]+}/car/{car_id:[0-9]+}/report',
        templateUrl: 'report/input_dashboard.htm',
        controller: 'InputDashboardCtrl'
      })
      .state('indents.input_report.photo', {
        url: '/photo',
        templateUrl: 'report/input_photo.htm',
        controller: 'PhotoReportEditCtrl'
      })
      .state('indents.input_report.part', {
        url: '/{part_id:[0-9a-zA-Z]+}',
        templateUrl: 'report/input.htm',
        controller: 'ReportEditCtrl'
      })
      .state('indents.reports', {
        url: '/reports',
        templateUrl: 'report/list.htm',
        controller: 'ReportListCtrl'
      });
  }]);

angular
  .module('gulu.indent', [
    'ui.router',
    'util.uploader',
    'util.filer',
    'util.keymgr',
    'gulu.indent.svcs',
    'gulu.indent.enums'
  ])
  .config(["$stateProvider", function($stateProvider) {
    $stateProvider
      .state('indents', {
        abstract: true,
        url: '/indents',
        templateUrl: 'indent/dashboard.htm',
        resolve: {
          IndentEnums: 'IndentEnums'
        }
      })
      .state('indents.list', {
        url: '',
        templateUrl: 'indent/search.htm',
        controller: 'IndentListCtrl'
      })
      .state('indents.unconfirmed', {
        url: '/unconfirmed',
        templateUrl: 'indent/list_unconfirmed.htm',
        controller: 'IndentListCtrl'
      })
      .state('indents.untested', {
        url: '/untested',
        templateUrl: 'indent/list_untested.htm',
        controller: 'UntestedIndentListCtrl'
      });
  }]);

// 404 页面
// Module: gulu.missing
// Dependencies: ngRoute

angular
  .module('gulu.missing', ['ui.router'])

  // 配置 route
  .config(["$stateProvider", function ($stateProvider) {
    $stateProvider
      .state('missing', {
        url: '/missing',
        templateUrl: '404/404.htm',
        controller: 'MissingCtrl'
      });
  }])

  // 404 controller
  .controller('MissingCtrl', ["$scope", function ($scope) {
    console.log('I`m here');
    // TODO:
    // 1. show last path and page name
  }]);

// 自定义 directives

angular
  .module('custom.directives', [])
  .directive('ngIndeterminate', ["$compile", function($compile) {
    return {
      restrict: 'A',
      link: function(scope, element, attributes) {
        scope.$watch(attributes['ngIndeterminate'], function(value) {
          element.prop('indeterminate', !!value);
        });
      }
    };
  }]);

angular
  .module('util.filters', [])

  .filter('mobile', function() {
    return function(s) {
      if (s == null) {
        return '';
      }

      s = s.replace(/[\s\-]+/g, '');

      if (s.length < 3) {
        return s;
      }

      var sa = s.split('');

      sa.splice(3, 0, '-');

      if (s.length >= 7) {
        sa.splice(8, 0, '-');
      }

      return sa.join('');
    };
  });

angular
  .module('util.date', [])
  .factory('DateUtil', function () {
    var toString = function (date, s) {
      return date.getFullYear() + s + (date.getMonth() + 1) + s + date.getDate();
    }

    return {
      toLocalDateString: function (date) {
        return toString(date, '-');
      },

      toLocalTimeString: function(date) {
        var h = date.getHours();
        var m = date.getMinutes();

        if (h < 10) {
          h = '0' + h;
        }

        if (m < 10) {
          m = '0' + m;
        }

        return [toString(date, '-'), h + ':' + m].join(' ');
      }
    }
  });
// 枚举 Service
angular
  .module('util.enums', [])
  .factory('Enums', function () {
    return function (ENUMS) {
      return {
        val: function (name, text) {
          return ENUMS[name].find(function (item) {
            return item.text === text;
          }).value;
        },
        text: function (name, val) {
          return ENUMS[name].find(function (item) {
            return item.value === val;
          }).text;
        },
        item: function (name, val) {
          return ENUMS[name].find(function (item) {
            return item.value === val;
          });
        },
        item4text: function(name, text) {
          return ENUMS[name].find(function(item) {
            return item.text === text;
          });
        },
        list: function (name) {
          return ENUMS[name];
        },
        items: function (name, vals) {
          return ENUMS[name].filter(function (item) {
            return vals.indexOf(item.value) !== -1;
          });
        }
      };
    };
  });
/* global angular*/
angular
  .module('util.filer', [])
  .factory('Filer', ["$window", "$log", function($window, $log) {
    var filer = {};
    filer.remove = function(url) {
      $window.resolveLocalFileSystemURL(url, filer.fsSuccess, filer.fsError);
    };

    filer.fsSuccess = function(fileEntry) {
      fileEntry.remove(function() {
        $log.info('删除本地图片成功: ' + fileEntry.fullPath);
      }, function() {
        $log.info('删除本地图片失败: ' + fileEntry.fullPath);
      });
    };

    filer.fsError = function(evt) {
      $log.info('获取本地图片失败: ' + JSON.stringify(evt.target));
    };

    return filer;
  }]);
angular
  .module('httpInterceptors', [])

  .config(["$httpProvider", function($httpProvider) {
    $httpProvider.interceptors.push('httpInterceptor');
    
    // Angular $http isn’t appending the header X-Requested-With = XMLHttpRequest since Angular 1.3.0
    $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
    $httpProvider.defaults.transformRequest = [function(data) {
        var str = [];
        
        angular.forEach(data, function(value, key) {
          this.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
        }, str);

        return str.join('&');
    }];
  }])

  .factory('httpInterceptor', ["$q", "$rootScope", "$location", function($q, $rootScope, $location) {
    return {
      // 请求前修改 request 配置
      'request': function(config) {
        config.headers.Authorization = window.Authorization || null;
        config.headers.CSRFToken = window.CSRFToken || null;
        
        // 若请求的是模板，或已加上时间戳的 url 地址，则不需要加时间戳
        if (config.url.indexOf('.htm') !== -1 || config.url.indexOf('?_=') !== -1) {
          return config;
        }

        config.url = config.url + '?_=' + new Date().getTime();

        return config;
      },

      // 请求出错，交给 error callback 处理
      'requestError': function(rejection) {
        return $q.reject(rejection);
      },

      // 响应数据按约定处理
      // {
      //   code: 200, // 自定义状态码，200 成功，非 200 均不成功
      //   msg: '操作提示', // 不能和 data 共存
      //   data: {} // 用户数据
      // }
      'response': function(response) {
        // 服务端返回的有效用户数据
        var data, code;

        if (angular.isObject(response.data)) {
          code = response.data.code;
          data = response.data.data;

          // 若 status 200, 且 code !200，则返回的是操作错误提示信息
          // 那么，callback 会接收到下面形式的参数：
          // { code: 20001, msg: '操作失败' }
          if (code !== 200) {
            return $q.reject(response);
          }

          // 若服务端返回的 data !null，则返回的是有效地用户数据
          // 那么，callback 会接收到下面形式参数：
          // { items: [...], total_count: 100 }
          if (data != null) {
            response.data = data;
          }

          // 若服务端返回的 data 值为 null，则返回的是提示信息
          // 那么 callback 会接收到下面形式的参数：
          // { code: 200, msg: '操作成功' }
          // 默认为此
        }

        return response;
      },

      // 响应出错，交给 error callback 处理
      'responseError': function(rejection) {
        var current_path = $location.path();

        if (rejection.status === 401) {
          $location.url('/login');
          $location.search('redirect', current_path);
        }

        return $q.reject(rejection);
      }
    };
  }]);
/* global angular*/
angular
  .module('util.keymgr', [])
  .factory('KeyMgr', ["$log", "localStorageService", function($log, localStorageService) {
    var KeyMgr = {
      __connector: '_',
      
      report: function(order_id, car_id) {
        if (arguments.length !== 2) {
          throw new Error('KeyMgr.report() 参数非法');
        }

        return [order_id, car_id].join(KeyMgr.__connector);
      },

      __type: function(fix, order_id, car_id) {
        if (arguments.length === 1) {
          throw new Error('KeyMgr.' + fix + '() 参数非法');
        }

        // 第一个参数是 report KeyMgr
        if (arguments.length === 2) {
          return [order_id, fix].join(KeyMgr.__connector);
        }

        return [order_id, car_id, fix].join(KeyMgr.__connector);
      }
    };

    angular.extend(KeyMgr, {
      err: KeyMgr.__type.bind(KeyMgr, 'err'),

      status: KeyMgr.__type.bind(KeyMgr, 'status'),

      submit: KeyMgr.__type.bind(KeyMgr, 'submit'),

      clear: function(order_id, car_id) {
        localStorageService.remove(KeyMgr.report(order_id, car_id));
        localStorageService.remove(KeyMgr.status(order_id, car_id));
        localStorageService.remove(KeyMgr.submit(order_id, car_id));
        localStorageService.remove(KeyMgr.err(order_id, car_id));
      }
    });
      
    return KeyMgr;
  }]);
/* global angular, FileUploadOptions, FileTransfer*/
// 附件上传器
angular
  .module('util.uploader', [])
  .factory('Uploader', ["$rootScope", "$log", function($rootScope, $log) {
    var vm = $rootScope;
    var noop = function() {};

    var uploader = {
      // 批量上传附件
      // 依赖 $scope 的 observer
      // 
      // attachments: 需要上传的附件列表
      // bandwidth: 同时上传的数量
      // done: 所有附件上传完成的回调函数
      batch: function(opt) {
        if (!opt.attachments || !opt.url) {
          throw new Error('上传附件缺少参数');
        }

        var count = opt.attachments.length;
        var index;
        var completed_count = 0;

        // 没有附件
        if (count === 0) {
          return;
        }

        var defaultOpt = {
          bandwidth: 3,
          done: noop,
          one: noop,
          error: noop
        };

        opt = angular.extend({}, defaultOpt, opt);

        var complete = function(attachment) {
          // 更新 attachment 触发下一个上传
          attachment.uploaded = true;

          opt.one.apply(uploader, arguments);

          completed_count++;

          opt.onprogress({
            loaded: completed_count,
            total: count,
            percent: parseInt(completed_count / count * 100)
          });

          if (index === count - 1) {
            if (vm.__attachments__) {
              vm.__attachments__ = null;
              delete vm.__attachments__;
            }

            opt.done();
          }
        };

        opt.attachments = angular.copy(opt.attachments, []);

        // 只有一个附件
        if (count === 1) {
          index = 0;
          uploader.one({
            attachment: opt.attachments[0],
            success: complete,
            url: opt.url,
            error: opt.error
          });

          return;
        }
        
        // 附件数量少于同时上传的数量
        if (count < opt.bandwidth) {
          index = count - 1;
          for (var i = 0; i < count; i++) {
            uploader.one({
              attachment: opt.attachments[i],
              success: complete,
              url: opt.url,
              error: opt.error
            });
          }

          return;
        }

        
        index = opt.bandwidth - 1;
        vm.__attachments__ = opt.attachments;

        // 上传完一个后，从 attachments 中取出下一个上传
        // 始终保持同时上传的数量为 bandwidth
        vm.$watchCollection('__attachments__', function(newAttachments) {
          // 批量上传完成，会删除 __attachments__
          if (!newAttachments) {
            return;
          }

          uploader.one({
            attachment: opt.attachments[++index],
            success: complete,
            url: opt.url,
            error: opt.error
          });
        });

        for (var k = 0; k < opt.bandwidth; k++) {
          uploader.one({
            attachment: opt.attachments[k],
            success: complete,
            url: opt.url,
            error: opt.error
          });
        }

        return;
      },

      // 单个上传
      one: function(opt) {
        if (!opt.attachment || !opt.url) {
          throw new Error('上传附件缺少参数');
        }

        $log.debug('attachment: ' + JSON.stringify(opt.attachment));
        
        var defaultOpt = {
          success: noop,
          error: noop,
          fileKey: 'fileKey',
          fileName: opt.attachment.url.substr(opt.attachment.url.lastIndexOf('/') + 1)
        };
        var custom_onprogress = opt.onprogress;
        opt = angular.extend({}, defaultOpt, opt);
        opt.onprogerss = function(progressEvent) {
          if (progressEvent.lengthComputable) {  
            //已经上传  
            var loaded = progressEvent.loaded;  
            //文件总长度  
            var total = progressEvent.total;  
            //计算百分比，用于显示进度条  
            var percent = parseInt((loaded / total) * 100);

            custom_onprogress({
              loaded: loaded,
              total: total,
              percent: percent
            });
          }
        };
        
        var fUOpts = new FileUploadOptions();
        fUOpts.fileKey = opt.fileKey;
        fUOpts.fileName = opt.fileName;

        var ft = new FileTransfer();
        ft.onprogress = opt.onprogress;
        ft.upload(
          opt.attachment.url,
          encodeURI(opt.url),
          opt.success.bind(uploader, opt.attachment),
          opt.error.bind(uploader, opt.attachment),
          fUOpts
        );
      }
    };
    
    return uploader; 
  }]);

// $scope 增强
angular
  .module('util.vm', [])
  .factory('VM', ["$log", function ($log) {
    return {
      to_json: function(vm, fields) {
        var ret = {};

        if (angular.isString(fields)) {
          fields = fields.split(',');
        }

        if (fields.length === 1 && fields[0] === '') {
          $log.warn('您调用方法 VM.to_json 时，没有传入 fields 参数');
          return;
        }

        if (!angular.isArray(fields)) {
          $log.error('方法 VM.to_json 只接受字符串数组或逗号分隔的字符串或一个不含逗号的字符串');
          return;
        }

        fields.map(function(field) {
          return ret[field] = vm[field];
        });

        return ret;
      }
    };
  }]);
'use strict';
angular.module("ngLocale", [], ["$provide", function($provide) {
  var PLURAL_CATEGORY = {
    ZERO: "zero",
    ONE: "one",
    TWO: "two",
    FEW: "few",
    MANY: "many",
    OTHER: "other"
  };
  $provide.value("$locale", {
    "DATETIME_FORMATS": {
      "AMPMS": [
        "\u4e0a\u5348",
        "\u4e0b\u5348"
      ],
      "DAY": [
        "\u661f\u671f\u65e5",
        "\u661f\u671f\u4e00",
        "\u661f\u671f\u4e8c",
        "\u661f\u671f\u4e09",
        "\u661f\u671f\u56db",
        "\u661f\u671f\u4e94",
        "\u661f\u671f\u516d"
      ],
      "MONTH": [
        "1\u6708",
        "2\u6708",
        "3\u6708",
        "4\u6708",
        "5\u6708",
        "6\u6708",
        "7\u6708",
        "8\u6708",
        "9\u6708",
        "10\u6708",
        "11\u6708",
        "12\u6708"
      ],
      "SHORTDAY": [
        "\u5468\u65e5",
        "\u5468\u4e00",
        "\u5468\u4e8c",
        "\u5468\u4e09",
        "\u5468\u56db",
        "\u5468\u4e94",
        "\u5468\u516d"
      ],
      "SHORTMONTH": [
        "1\u6708",
        "2\u6708",
        "3\u6708",
        "4\u6708",
        "5\u6708",
        "6\u6708",
        "7\u6708",
        "8\u6708",
        "9\u6708",
        "10\u6708",
        "11\u6708",
        "12\u6708"
      ],
      "fullDate": "y\u5e74M\u6708d\u65e5EEEE",
      "longDate": "y\u5e74M\u6708d\u65e5",
      "medium": "yyyy-M-d ah:mm:ss",
      "mediumDate": "yyyy-M-d",
      "mediumTime": "ah:mm:ss",
      "short": "yy-M-d ah:mm",
      "shortDate": "yy-M-d",
      "shortTime": "ah:mm"
    },
    "NUMBER_FORMATS": {
      "CURRENCY_SYM": "\u00a5",
      "DECIMAL_SEP": ".",
      "GROUP_SEP": ",",
      "PATTERNS": [{
        "gSize": 3,
        "lgSize": 3,
        "macFrac": 0,
        "maxFrac": 3,
        "minFrac": 0,
        "minInt": 1,
        "negPre": "-",
        "negSuf": "",
        "posPre": "",
        "posSuf": ""
      }, {
        "gSize": 3,
        "lgSize": 3,
        "macFrac": 0,
        "maxFrac": 2,
        "minFrac": 2,
        "minInt": 1,
        "negPre": "(\u00a4",
        "negSuf": ")",
        "posPre": "\u00a4",
        "posSuf": ""
      }]
    },
    "id": "zh-cn",
    "pluralCat": function(n) {
      return PLURAL_CATEGORY.OTHER;
    }
  });
}]);

angular
  .module('gulu.login')
  
  .controller('LoginCtrl', ["$scope", "$q", "$location", "$timeout", "toastr", "LoginSvc", function ($scope, $q, $location, $timeout, toastr, LoginSvc) {
    var vm = $scope;

    vm.login = login;

    function login() {
      return LoginSvc
        .save({
          job_no: vm.job_no,
          password: vm.password
        })
        .$promise
        .then(function(res) {
          window.Authorization = res.Authorization;
          window.CSRFToken = res.CSRFToken;
          
          toastr.success(res.msg || '登录成功，正在为你跳转...');

          var qs = $location.search()

          $location.url(qs.redirect || '/indents');
        })
        .catch(function(res) {
          toastr.error(res.msg || '登录失败，请重试');
        });
    }
  }]);
angular
  .module('gulu.login.svcs', ['ngResource'])
  .service('LoginSvc', ["$resource", function ($resource) {
    return $resource(API_SERVERS.tester + '/account/login');
  }])
angular
  .module('gulu.report')

  .factory('ReportInputer', ["$log", "$stateParams", "$interval", "VM", "localStorageService", function($log, $stateParams, $interval, VM, localStorageService) {
    return function(vm, fields, report_type) {
      var indent_id = $stateParams.indent_id;
      var car_id = $stateParams.car_id;

      var store_key = [indent_id, car_id].join('_');

      var init_data = localStorageService.get(store_key);
      // 设置初始化值
      angular.extend(vm, init_data && init_data[report_type] || {});

      // 保存到 localStorage
      function save() {
        var data = localStorageService.get(store_key) || {};
        data[report_type] = VM.to_json(vm, fields);

        localStorageService.set(store_key, data);

        $log.log('录入检测报告 - ' + store_key, data[report_type]);
      }

      var timer = $interval(save, 3000);

      // 切换页面时，取消自动保存(清除定时器)
      vm.$on('$locationChangeStart', function() {
        $interval.cancel(timer);
      });
    }
  }]);


/* global angular, Camera, _*/
angular
  .module('gulu.report')

  .controller('InputDashboardCtrl', ["$scope", "$stateParams", "$location", "$templateCache", "localStorageService", "KeyMgr", function($scope, $stateParams, $location, $templateCache, localStorageService, KeyMgr) {
    var vm = $scope;

    var indent_id = $stateParams.indent_id;
    var car_id = $stateParams.car_id;
    var report_status_key = KeyMgr.status(indent_id, car_id);

    vm.parts = JSON.parse($templateCache.get('report/i.json'));
    // 不用展示照片
    // vm.parts.pop();
    
    // 默认展开
    vm.test_step_nav_open = true;
    vm.toggle_nav_open = toggle_nav_open;
    vm.submit_preview = submit_preview;

    function toggle_nav_open() {
      vm.test_step_nav_open = !vm.test_step_nav_open;
    }

    function submit_preview() {
      // 临时方案
      localStorageService.set(report_status_key, {
        submited: true
      });

      $location.url('/indents/untested');

      // TODO
      // 1. 跳转到报告展示页面(确认提交，可返回)
      // 2. 将设置 reprot status submited 移到点击确认提交后
      // 3. 确认提交则跳转到当天任务界面
    }
  }])

  .controller('PhotoReportEditCtrl', ["$scope", "$log", "$stateParams", "$templateCache", "localStorageService", function($scope, $log, $stateParams, $templateCache, localStorageService) {
    var vm = $scope;

    var current_part = 'photo';
    var indent_id = $stateParams.indent_id;
    var car_id = $stateParams.car_id;
    // 表单项数据存储到本地的 key 的生成规则
    var store_key = [indent_id, car_id].join('_');
    var store_key_err = [store_key, 'err'].join('_');
    var init_data = localStorageService.get(store_key);

    var part_json = JSON.parse($templateCache.get('report/i.json'));
    var parent_part = part_json.find(function(part) {
      return part.id === current_part;
    });
    vm.parts = parent_part && parent_part.children;

    vm.data = {};
    // 设置初始化值
    angular.extend(vm.data, init_data && init_data[current_part] || {});

    var photo_of_group = localStorageService.get(store_key_err);
    vm.part_photos = _.map(photo_of_group, function(item, key) {
      return {
        id: key,
        name: get_part_name(key),
        photos: item
      };
    });

    vm.parts.forEach(function(part) {
      part.image.forEach(function(item) {
        vm.data[item.id] = vm.data[item.id] || { image: null };
      });
    });

    vm.take_photo = take_photo;
    
    function get_part_name(part_id) {
      return part_json.find(function(part) { return part.id === part_id; }).name;
    }

    function take_photo(part, item) {
      navigator.camera.getPicture(take_photo_success, take_photo_error, {
        quality : 100,
        destinationType : Camera.DestinationType.FILE_URI,
        sourceType : Camera.PictureSourceType.CAMERA,
        allowEdit : true,
        encodingType: Camera.EncodingType.PNG,
        // targetWidth: 100,
        // targetHeight: 100,
        saveToPhotoAlbum: false
      });

      function take_photo_success(imgurl) {
        vm.data[item.id] = vm.data[item.id] || {};
        vm.data[item.id].image = imgurl;
        vm.$apply();

        init_data[part.id] = init_data[part.id] || {};
        init_data[part.id][item.id] = angular.extend(init_data[part.id][item.id] || {}, vm.data[item.id]);

        localStorageService.set(store_key, init_data);
      }

      function take_photo_error() {
        $log.error('拍照失败, 分类 - ' + part.name + ', 项 - ' + item.name);
      }
    }
  }])

  .controller('ReportEditCtrl', ["$scope", "$log", "$stateParams", "$templateCache", "$modal", "localStorageService", "KeyMgr", function($scope, $log, $stateParams, $templateCache, $modal, localStorageService, KeyMgr) {
    var vm = $scope;

    var current_part = parseInt($stateParams.part_id);
    var order_id = $stateParams.indent_id;
    var car_id = $stateParams.car_id;
    // 表单项数据存储到本地的 key 的生成规则
    // var store_key = [indent_id, car_id].join('_');
    // var store_key_err = [store_key, 'err'].join('_');

    var report_key = KeyMgr.report(order_id, car_id);
    var report_err_key = KeyMgr.err(report_key);
    var init_data = localStorageService.get(report_key);

    // 获取报告输入项数据
    var parent_part = 
    JSON
      .parse($templateCache.get('report/i.json'))
      .find(function(part) {
        return part.id === current_part;
      });
    vm.parts = parent_part && parent_part.children;

    // 第一条默认展开
    if (vm.parts && vm.parts.length) {
      vm.parts[0].is_open = true;
    }

    vm.data = {};

    // 设置初始化值
    angular.extend(vm.data, init_data && init_data[current_part] || {});

    vm.parts.forEach(function(part) {
      if (part.radio_with_status_degrees && part.radio_with_status_degrees.length) {
        part.radio_with_status_degrees.forEach(function(item) {
          vm.data[item.id] = vm.data[item.id] || {};

          if (vm.data[item.id].result == null) {
            vm.data[item.id].result = "1";
          }
        });
      }
    });

    // data 改变则将其保存到 local storage
    vm.$watch('data', function(v) {
      $log.log('form data: ', JSON.stringify(v));

      save();

      save_err();
    }, true);

    
    // 保存到 localStorage
    // 数据格式为：
    // {
    //   "r1": {
    //     "result": 1,
    //     "state": 1,
    //     "degree": 1,
    //     "memo": "xxx",
    //     "image": ""
    //   }
    // }
    function save() {
      var data = localStorageService.get(report_key) || {};
      data[current_part] = vm.data;

      localStorageService.set(report_key, data);

      $log.log('录入检测报告 - ' + report_key, data[current_part]);
    }

    function save_err() {
      var data = localStorageService.get(report_err_key) || {};
      var err_items = [];

      _.each(vm.data, function(item, key) {
        if (parseInt(item.result) === 0) {
          item.id = key;
          err_items.push(item);
        }
      });

      data[current_part] = err_items || [];

      localStorageService.set(report_err_key, data);

      $log.log('录入检测报告问题项 - ' + report_err_key, data[current_part]);
    }

    vm.show_detail = show_detail;
    vm.should_clear = should_clear;
    vm.take_photo = take_photo;
    vm.open_datepicker = open_datepicker;
    vm.show_take_photo = show_take_photo;
    vm.show_photo = show_photo;

    // 避免展示两次 modal
    function show_detail(index, part, check_item) {
      // change 事件发生在 click 之后
      setTimeout(function() {
        // 其他选项不应该弹出
        if (show_detail.is_show || parseInt(vm.data[check_item.id].result) !== 2) {
          return;
        }

        show_detail.is_show = true;

        var input_detail_ins = $modal.open({
          templateUrl: 'report/input_detail.htm',
          controller: 'ItemInputDetailCtrl',
          backdrop: 'static',
          resolve: {
            item_detail: function() {
              return angular.extend({
                part_name: part.name,
                part_alias: part.alias,
                index: index
              }, check_item, vm.data[check_item.id]);
            }
          }
        });

        input_detail_ins.result.then(function(item) {
          angular.extend(vm.data[check_item.id], item, {
            name: check_item.name
          });

          show_detail.is_show = false;
        }, function() {
          show_detail.is_show = false;
        });
      });
    }

    show_detail.is_show = false;

    function should_clear(item) {
      // 若检测无问题，则清除之前填写的损伤数据
      if (parseInt(vm.data[item.id].result) !== 0) {
        angular.extend(vm.data[item.id], {
          state: null,
          degree: null,
          memo: null,
          image: null
        });
      }
    }

    // TODO
    // 图片预览
    function show_photo(field) {

    }

    function take_photo(part, item) {
      navigator.camera.getPicture(take_photo_success, take_photo_error, {
        quality : 100,
        destinationType : Camera.DestinationType.FILE_URI,
        sourceType : Camera.PictureSourceType.CAMERA,
        allowEdit : true,
        encodingType: Camera.EncodingType.PNG,
        // targetWidth: 100,
        // targetHeight: 100,
        saveToPhotoAlbum: false
      });

      function take_photo_success(imgurl) {
        vm.data[item.id] = vm.data[item.id] || {};
        vm.data[item.id].image = imgurl;
        vm.$apply();
      }

      function take_photo_error() {
        $log.error('拍照失败, 分类 - ' + part.name + ', 项 - ' + item.name);
      }
    }

    // 日期控件显示/隐藏/禁用
    vm.dp_params = {};
    function open_datepicker($event, dp) {
      $event.preventDefault();
      $event.stopPropagation();

      vm.dp_params[dp] = true;
    };

    function show_take_photo(index, part, check_item) {
      setTimeout(function() {
        if (show_take_photo.is_show || parseInt(vm.data[check_item.id].result) !== 5) {
          return;
        }

        show_take_photo.is_show = true;

        var take_photo_modal = $modal.open({
          templateUrl: 'report/take_photo_modal.htm',
          controller: 'ItemTakePhotoCtrl',
          backdrop: 'static',
          resolve: {
            item_detail: function() {
              return angular.extend({
                part_name: part.name,
                part_alias: part.alias,
                index: index
              }, check_item, vm.data[check_item.id]);
            }
          }
        });

        take_photo_modal.result.then(function(item) {
          angular.extend(vm.data[check_item.id], item, {
            name: check_item.name
          });

          show_take_photo.is_show = false;
        }, function() {
          show_take_photo.is_show = false;
        });
      });
    }

    show_take_photo.is_show = false;
  }])

  .controller('ItemInputDetailCtrl', ["$scope", "$log", "$modalInstance", "item_detail", function($scope, $log, $modalInstance, item_detail) {
    var vm = $scope;

    angular.extend(vm, item_detail);

    vm.submit = submit;
    vm.cancel = cancel;
    vm.take_photo = take_photo;

    function submit() {
      $modalInstance.close({
        state: vm.state,
        degree: vm.degree,
        memo: vm.memo,
        image: vm.image
      });
    }

    function cancel() {
      $modalInstance.dismiss();
    }

    function take_photo() {
      navigator.camera.getPicture(take_photo_success, take_photo_error, {
        quality : 100,
        destinationType : Camera.DestinationType.FILE_URI,
        sourceType : Camera.PictureSourceType.CAMERA,
        allowEdit : true,
        encodingType: Camera.EncodingType.PNG,
        // targetWidth: 100,
        // targetHeight: 100,
        saveToPhotoAlbum: false
      });

      function take_photo_success(imgurl) {
        vm.image = imgurl;
        vm.$apply();
      }

      function take_photo_error() {
        $log.error('拍照失败, 分类 - ' + item_detail.part_name + ', 项 - ' + item_detail.name);
      }
    }
  }])

  .controller('ItemTakePhotoCtrl', ["$scope", "$log", "$modalInstance", "item_detail", function($scope, $log, $modalInstance, item_detail) {
      var vm = $scope;

      angular.extend(vm, item_detail);

      vm.submit = submit;
      vm.cancel = cancel;
      vm.take_photo = take_photo;

      function submit() {
        $modalInstance.close({
          image: vm.image
        });
      }

      function cancel() {
        $modalInstance.dismiss();
      }

      function take_photo() {
        navigator.camera.getPicture(take_photo_success, take_photo_error, {
          quality : 100,
          destinationType : Camera.DestinationType.FILE_URI,
          sourceType : Camera.PictureSourceType.CAMERA,
          allowEdit : true,
          encodingType: Camera.EncodingType.PNG,
          // targetWidth: 100,
          // targetHeight: 100,
          saveToPhotoAlbum: false
        });

        function take_photo_success(imgurl) {
          vm.image = imgurl;
          vm.$apply();
        }

        function take_photo_error() {
          $log.error('拍照失败, 分类 - ' + item_detail.part_name + ', 项 - ' + item_detail.name);
        }
      }
    }])

  .controller('ReportListCtrl', ["$scope", "$location", "ReportsSvc", "IndentEnums", "toastr", function($scope, $location, ReportsSvc, IndentEnums, toastr) {
    var vm = $scope;
    var qso = $location.search();

    vm.page = parseInt(qso.page) || 1;
    vm.size = parseInt(qso.size) || 20;
    vm.sizes = IndentEnums.list('size');
    vm.size_item = IndentEnums.item('size', vm.size);

    vm.size_change = size_change;
    vm.page_change = page_change;

    query();

    function query() {
      var params = {
        items_page: vm.size,
        page: vm.page,
      };
      
      $location.search(params);

      ReportsSvc
        .query(params)
        .$promise
        .then(function(rs) {
          rs.items.forEach(function(item) {
            item.status_text = IndentEnums.text('order_status', item.status_id);
          });

          vm.items = rs.items;
          vm.total_count = rs.total_count;

          var tmp = rs.total_count / vm.size;
          vm.page_count = rs.total_count % vm.size === 0 ? tmp : (Math.floor(tmp) + 1);
        })
        .catch(function(res) {
          toastr.error(res.msg || '查询失败，服务器发生未知错误，请重试');
        });
    }

    // 每页条数改变
    function size_change(size) {
      vm.size = size;
      vm.page = 1;

      query();
    }

    // 翻页
    function page_change(page) {
      vm.page = page;

      query();
    }
  }]);






angular
  .module('gulu.report.svcs', ['ngResource'])

  .service('ReportsSvc', ["$resource", function($resource) {
    return $resource(API_SERVERS.tester + '/reports', {}, {
      query: {
        isArray: false
      }
    });
  }])

  .service('ReportSvc', ["$resource", function($resource) {
    return $resource(API_SERVERS.tester + '/report');
  }]);
angular
  .module('gulu.indent.enums', ['util.enums', ])

.factory('IndentEnums', ["Enums", "IndentEnumsSvc", "toastr", function(Enums, IndentEnumsSvc, toastr) {
  return IndentEnumsSvc
      .get()
      .$promise
      .then(function(res) {
        var all_preins = 'order_type order_status city inspector user_type order_through'.split(' ');

        all_preins.forEach(function(key) {
          res[key].unshift({
            text: '全部',
            value: null
          });
        });

        res['size'] = [{
          text: 10,
          value: 10
        }, {
          text: 15,
          value: 15
        }, {
          text: 20,
          value: 20
        }, {
          text: 50,
          value: 50
        }, {
          text: 100,
          value: 100
        }];

        return Enums(res.toJSON());
      })
      .catch(function(res) {
        toastr.error(res.msg || '获取枚举失败');
      });
}]);

angular
  .module('gulu.indent.svcs', ['ngResource'])

  .service('IndentEnumsSvc', ["$resource", function($resource) {
    return $resource(API_SERVERS.tester + '/parameters');
  }])
  
  .service('IndentsSvc', ["$resource", function($resource) {
    return $resource(API_SERVERS.tester + '/orders', {}, {
      query: {
        isArray: false
      }
    });
  }])

  .service('IndentSvc', ["$resource", function($resource) {
    return $resource(API_SERVERS.tester + '/order/:id', {
      id: '@id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }])

  .service('IndentAcceptSvc', ["$resource", function($resource) {
    return $resource(API_SERVERS.tester + '/order/:id/inspector_accepted', {
      id: '@id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }])

  .service('IndentRevokeRequestSvc', ["$resource", function($resource) {
    return $resource(API_SERVERS.tester + '/order/:id/revoke_requested', {
      id: '@id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }])

  .service('TestersSvc', ["$resource", function($resource) {
    return $resource(API_SERVERS.tester + '/testers', {}, {
      query: {
        isArray: false
      }
    });
  }])

  .service('UntestedIndentsSvc', ["$resource", function($resource) {
    return $resource(API_SERVERS.tester + '/orders/inspector_task_today');
  }])

  .service('IndentCarsSvc', ["$resource", function($resource) {
    return $resource(API_SERVERS.tester + '/order/:order_id/car', {
      order_id: '@order_id'
    })
  }])

  .service('IndentCarSvc', ["$resource", function($resource) {
    return $resource(API_SERVERS.tester + '/order/:order_id/car/:car_id', {
      order_id: '@order_id',
      car_id: '@car_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }]);
/* global angular, confirm, _ */
angular
  .module('gulu.indent')
  
  .controller('IndentListCtrl', ["$scope", "$location", "toastr", "$modal", "IndentsSvc", "IndentSvc", "IndentAcceptSvc", "IndentEnums", function($scope, $location, toastr, $modal,
    IndentsSvc, IndentSvc, IndentAcceptSvc, IndentEnums) {
    var vm = $scope;
    var qso = $location.search();

    vm.status_id = parseInt(qso.status_id) || null;
    
    if (vm.$state.includes('indents.unconfirmed')) {
      vm.status_id = 4;
    } else {
      vm.city_id = parseInt(qso.city_id) || null;
      vm.inspector_id = parseInt(qso.inspector_id) || null;
      // vm.role_id = parseInt(qso.role_id) || null;
      vm.requester_mobile = qso.requester_mobile || null;

      vm.status = IndentEnums.item('order_status', vm.status_id);
      vm.status_list = IndentEnums.list('order_status');
      vm.city = IndentEnums.item('city', vm.city_id);
      vm.city_list = IndentEnums.list('city');
      // vm.role = IndentEnums.item('role', vm.role_id);
      // vm.role_list = IndentEnums.list('role');
      vm.inspector = IndentEnums.item('inspector', vm.inspector_id);
      vm.inspector_list = IndentEnums.list('inspector');

      watch_list('status', 'status_id');
      watch_list('city', 'city_id');
      // watch_list('role', 'role_id');
      watch_list('inspector', 'inspector_id');

      vm.search = search;
    }

    vm.page = parseInt(qso.page) || 1;
    vm.size = parseInt(qso.size) || 20;
    vm.sizes = IndentEnums.list('size');
    vm.size_item = IndentEnums.item('size', vm.size);

    vm.size_change = size_change;
    vm.page_change = page_change;
    vm.cancel_order = cancel_order;
    vm.confirm_order = confirm_order;

    query();

    function query() {
      var params = {
        city_id: vm.city_id,
        items_page: vm.size,
        page: vm.page,

        status_id: vm.status_id
      };

      if (vm.$state.includes('indents.list')) {
        angular.extend(params, {
          city_id: vm.city_id,
          inspector_id: vm.inspector_id,
          // role_id: vm.role_id,
          requester_mobile: vm.requester_mobile
        });
      }
      
      $location.search(params);

      IndentsSvc
        .query(params)
        .$promise
        .then(function(rs) {
          rs.items.forEach(function(item) {
            item.status_text = IndentEnums.text('order_status', item.status_id);
          });

          vm.items = rs.items;
          vm.total_count = rs.total_count;

          var tmp = rs.total_count / vm.size;
          vm.page_count = rs.total_count % vm.size === 0 ? tmp : (Math.floor(tmp) + 1);
        })
        .catch(function(res) {
          toastr.error(res.data.msg || '查询失败，服务器发生未知错误，请重试');
        });
    }

    function watch_list(name, field) {
      vm.$watch(name, function(item) {
        if (!item) {
          return;
        }

        vm[field] = item.value;
      });
    }

    // 确认订单
    function confirm_order(item) {
      if (confirm('确认接受该订单?')) {
        IndentAcceptSvc
          .update({
            id: item.id
          })
          .$promise
          .then(function(res) {
            toastr.success(res.msg || '确认订单成功');

            query();
          })
          .catch(function(res) {
            toastr.error(res.msg || '确认订单失败，请重试');
          });
      }
    }

    // 取消订单
    function cancel_order(item) {
      var cancel_order_ins = $modal.open({
        templateUrl: 'indent/cancel_order.htm',
        controller: 'CancelOrderCtrl',
        backdrop: 'static',
        resolve: {
          indent_info: function() {
            return item;
          }
        }
      });

      cancel_order_ins.result.then(function() {
        // TODO:
        // 更新预约单状态
        query();
      });
    }

    // 每页条数改变
    function size_change(size) {
      vm.size = size;
      vm.page = 1;

      query();
    }

    // 翻页
    function page_change(page) {
      vm.page = page;

      query();
    }

    // 查询提交
    function search() {
      vm.page = 1;

      query();
    }
  }])

  .controller('UntestedIndentListCtrl', ["$scope", "$log", "$location", "$modal", "$templateCache", "toastr", "Filer", "Uploader", "KeyMgr", "localStorageService", "UntestedIndentsSvc", "IndentEnums", "IndentCarSvc", "ReportSvc", function($scope, $log, $location, $modal, $templateCache, toastr,
    Filer, Uploader, KeyMgr, localStorageService, UntestedIndentsSvc, IndentEnums,
    IndentCarSvc, ReportSvc) {
    var vm = $scope;
    var parts = JSON.parse($templateCache.get('report/i.json'));

    if (parts && parts.length) {
      vm.first_part_id = parts[0].id;
    }

    vm.cancel_order = cancel_order;
    vm.del_car = del_car;
    vm.edit_car = edit_car;
    vm.upload_report = upload_report;
    vm.clear_local = clear_local;

    query();

    function query() {
      return UntestedIndentsSvc
        .query()
        .$promise
        .then(function(res) {
          res.forEach(function(order) {
            order.auto.forEach(function(car) {
              var report_status_key = KeyMgr.status(order.id, car.id);
              car.report_status = localStorageService.get(report_status_key);
            });
          });

          vm.items = res;
        })
        .catch(function(res) {
          toastr.error(res.msg || '获取待检测订单失败');
        });
    }

    // 加车 或 编辑车
    function edit_car(id, car) {
      var edit_car_ins = $modal.open({
        templateUrl: 'indent/edit_car.htm',
        controller: 'IndentCarEditCtrl',
        backdrop: 'static',
        resolve: {
          IndentEnums: function() {
            return IndentEnums;
          },
          indent_info: function() {
            return {
              id: id,
              car: car
            };
          }
        }
      });

      edit_car_ins.result.then(function() {
        query();
      });
    }

    // 删除车
    function del_car(order_id, car) {
      if (confirm('确认删除 "' + [car.brand, car.series, car.model].join('-') + '"')) {
        return IndentCarSvc
          .remove({
            order_id: order_id,
            car_id: car.id
          })
          .$promise
          .then(function(res) {
            KeyMgr.clear(order_id, car.id);

            toastr.success(res.msg || '删除车成功');

            query();
          })
          .catch(function(res) {
            toastr.error(res.msg || '删除车失败，请重试');
          });  
      }
    }

    // 清除local
    function clear_local(order_id, car) {
      KeyMgr.clear(order_id, car.id);
      toastr.success('清理本地数据完成');
    }

    // 取消订单
    function cancel_order(item) {
      var cancel_order_ins = $modal.open({
        templateUrl: 'indent/cancel_order.htm',
        controller: 'CancelOrderCtrl',
        backdrop: 'static',
        resolve: {
          indent_info: function() {
            return item;
          }
        }
      });

      cancel_order_ins.result.then(function() {
        // 删除所有本地报告相关数据
        item.auto.forEach(function(car) {
          KeyMgr.clear(item.id, car.id);
        });

        query();
      });
    }

    // 上传报告
    function upload_report(order, car) {
      var order_id = order.id;
      var car_id = car.id;

      var report_key = KeyMgr.report(order_id, car_id);
      var report_submit_key = KeyMgr.submit(report_key);
      var report_data = localStorageService.get(report_key);

      $log.info('准备上传报告: ' + report_key);
      $log.info('报告分类数据: ' + JSON.stringify(report_data));

      if (!report_data) {
        $log.info('报告数据为空，不用上传');
        return;
      }

      car.report_status.upload_status = 0;
      car.report_status.uploading = true;

      var submit_data = {};

      Object.keys(report_data).forEach(function(key) {
        angular.extend(submit_data, report_data[key]);
      });

      $log.info('报告待提交数据: ' + JSON.stringify(submit_data));

      var image_fields = {};
      Object.keys(submit_data).forEach(function(key) {
        if (submit_data[key].image) {
          image_fields[key] = angular.extend({
            url: submit_data[key].image
          }, submit_data[key]);
        }
      });

      var images = _.values(image_fields);

      // 没有图片需要上传，直接上传报告内容
      if (!images.length) {
        submit_report();

        return;
      }

      $log.info('报告图片数据: ' + JSON.stringify(image_fields));
      $log.info('开始上传照片数据');
      Uploader.batch({
        url: 'http://f.ifdiu.com',
        attachments: images,
        done: upload_done,
        one: upload_one,
        onprogress: onprogress,
        error: upload_error
      });

      function onprogress(progress) {
        // 1. update progress status to page
        $log.info('上传进度: ' + progress.percent);
        car.report_status.upload_status = parseInt(progress.percent * 0.8);
        vm.$apply();
      }

      function upload_one(image, file) {
        // You can do something on image with file object
        image.file_id = file.id;
        $log.info('成功上传图片: ' + JSON.stringify(image));
      }

      function upload_error(image) {
        $log.info('上传图片出错: ' + JSON.stringify(image));
      }

      function upload_done() {
        // 1. combine image fileid to submit_data
        // 2. store image data to localstorage
        // 3. submit report data
        $log.info('成功上传所有图片');

        // 1
        images.forEach(function(image) {
          submit_data[image.id] = image;
        });

        $log.info('回写图片数据到 localstorage');

        // 2
        localStorageService.set(report_submit_key, submit_data);

        // 3
        submit_report();
      }

      // 1. submit report data
      // 2. remove image from cache
      // 3. clear report local data
      // 4. update order status 
      function submit_report() {
        $log.info('开始上传报告内容');
        // 1
        return ReportSvc
          .save({
            order_id: order_id,
            car_id: car_id
          }, submit_data)
          .$promise
          .then(function() {
            $log.info('上传报告内容成功');

            // 2
            if (images.length) {
              images.forEach(function(image) {
                Filer.remove(image.url);
              });  
            }

            // 3
            KeyMgr.clear(order_id, car_id);

            // 4
            car.report_status.upload_status = 100;
            car.report_status.uploaded = true;

            // query();
          })
          .catch(function(res) {
            $log.info('上传报告内容失败: ' + JSON.stringify(arguments));
            toastr.error(res.msg || '上传过程中发生错误，请重试');
            // 4
            car.report_status.uploading = false;
          });
      }
    }
  }])
  
  // 取消订单
  .controller('CancelOrderCtrl', ["$scope", "$modalInstance", "toastr", "IndentRevokeRequestSvc", "indent_info", function($scope, $modalInstance, toastr, IndentRevokeRequestSvc, indent_info) {
    var vm = $scope;

    angular.extend(vm, indent_info);

    vm.cancel_order = cancel_order;
    vm.cancel = cancel;

    function cancel_order() {
      vm.cancel_order_status = true;

      IndentRevokeRequestSvc
        .update({
          id: indent_info.id
        }, {
          memo: vm.reason
        })
        .$promise
        .then(function(res) {
          toastr.success(res.msg || '订单取消成功');

          $modalInstance.close();
        })
        .catch(function(res) {
          vm.cancel_order_status = false;

          toastr.error(res.msg || '订单取消失败，请重试');
        });
    }

    function cancel() {
      $modalInstance.dismiss();
    }
  }])

  // 加车 或 编辑车
  .controller('IndentCarEditCtrl', ["$scope", "$modalInstance", "toastr", "IndentCarsSvc", "IndentCarSvc", "IndentEnums", "indent_info", function($scope, $modalInstance, toastr, IndentCarsSvc,
    IndentCarSvc, IndentEnums, indent_info) {
    var vm = $scope;

    vm.brand_list = IndentEnums.list('brand');
    vm.series_list = IndentEnums.list('series');
    vm.model_list = IndentEnums.list('model');

    if (indent_info.car) {
      vm.title = '编辑车信息';

      select_item('brand', indent_info.car.brand);
      select_item('series', indent_info.car.series);
      select_item('model', indent_info.car.model);  
    } else {
      vm.title = '加车';
    }

    vm.cancel = cancel;
    vm.submit = submit;

    function submit() {
      if (indent_info.car) {
        IndentCarSvc
          .update({
            order_id: indent_info.id,
            car_id: indent_info.car.id
          }, {
            brand: vm.brand.value,
            series: vm.brand.value,
            model: vm.model.value
          })
          .$promise
          .then(function(res) {
            toastr.success(res.msg || '编辑车辆信息保存成功');

            $modalInstance.close();
          })
          .catch(function(res) {
            toastr.error(res.msg || '编辑车辆信息保存失败');
          });
      } else {
        IndentCarsSvc
          .save({
            order_id: indent_info.id
          }, {
            brand: vm.brand.value,
            series: vm.brand.value,
            model: vm.model.value
          })
          .$promise
          .then(function(res) {
            toastr.success(res.msg || '加车信息保存成功');

            $modalInstance.close();
          })
          .catch(function(res) {
            toastr.error(res.msg || '加车信息保存失败');
          });
      }
    }

    function select_item(list_name, value) {
      vm[list_name] = IndentEnums.item4text(list_name, value);
    }

    function cancel() {
      $modalInstance.dismiss();
    }

  }]);


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImxvZ2luL2xvZ2luX21vZHVsZS5qcyIsInJlcG9ydC9yZXBvcnRfbW9kdWxlLmpzIiwiaW5kZW50L2luZGVudF9tb2R1bGUuanMiLCI0MDQvNDA0X2N0cmwuanMiLCJjb21wb25lbnQvY3VzdG9tLWRpcmVjdGl2ZS5qcyIsImNvbXBvbmVudC9jdXN0b20tZmlsdGVyLmpzIiwiY29tcG9uZW50L2RhdGUuanMiLCJjb21wb25lbnQvZW51bXMuanMiLCJjb21wb25lbnQvZmlsZXIuanMiLCJjb21wb25lbnQvaHR0cC5qcyIsImNvbXBvbmVudC9rZXltZ3IuanMiLCJjb21wb25lbnQvdXBsb2FkZXIuanMiLCJjb21wb25lbnQvdm0uanMiLCJjb21wb25lbnQvemgtY24uanMiLCJsb2dpbi9sb2dpbl9jdHJsLmpzIiwibG9naW4vbG9naW5fc3Zjcy5qcyIsInJlcG9ydC9pbnB1dF9yZXBvcnQuanMiLCJyZXBvcnQvcmVwb3J0X2N0cmwuanMiLCJyZXBvcnQvcmVwb3J0X3N2Y3MuanMiLCJpbmRlbnQvZW51bXMuanMiLCJpbmRlbnQvaW5kZW50X3N2Y3MuanMiLCJpbmRlbnQvbGlzdF9jdHJsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7QUFNQTtHQUNBLE9BQUEsUUFBQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7O0dBRUEsa0dBQUEsU0FBQSxtQkFBQSxvQkFBQSxjQUFBLDZCQUFBOzs7SUFHQTtPQUNBLFVBQUE7T0FDQSxXQUFBOzs7SUFHQTtPQUNBLFVBQUE7OztJQUdBLGFBQUEsYUFBQTs7O0lBR0E7T0FDQSxVQUFBO09BQ0EsVUFBQSxNQUFBOzs7SUFHQSxjQUFBO01BQ0EsUUFBQTs7OztJQUlBLFFBQUEsUUFBQSxVQUFBLEdBQUEsZUFBQSxXQUFBO01BQ0EsUUFBQSxRQUFBLFVBQUEsR0FBQSxjQUFBLFNB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QSxJQUFBLEtBQUE7O1FBRUEsSUFBQSxJQUFBLElBQUE7VUFDQSxJQUFBLE1BQUE7OztRQUdBLElBQUEsSUFBQSxJQUFBO1VBQ0EsSUFBQSxNQUFBOzs7UUFHQSxPQUFBLENBQUEsU0FBQSxNQUFBLE1BQUEsSUFBQSxNQUFBLEdBQUEsS0FBQTs7Ozs7QUN2QkE7R0FDQSxPQUFBLGNBQUE7R0FDQSxRQUFBLFNBQUEsWUFBQTtJQUNBLE9BQUEsVUFBQSxPQUFBO01BQ0EsT0FBQTtRQUNBLEtBQUEsVUFBQSxNQUFBLE1BQUE7VUFDQSxPQUFBLE1BQUEsTUFBQSxLQUFBLFVBQUEsTUFBQTtZQUNBLE9BQUEsS0FBQSxTQUFBO2FBQ0E7O1FBRUEsTUFBQSxVQUFBLE1BQUEsS0FBQTtVQUNBLE9BQUEsTUFBQSxNQUFBLEtBQUEsVUFBQSxNQUFBO1lBQ0EsT0FBQSxLQUFBLFVBQUE7YUFDQTs7UUFFQSxNQUFBLFVBQUEsTUFBQSxLQUFBO1VBQ0EsT0FBQSxNQUFBLE1BQUEsS0FBQSxVQUFBLE1BQUE7WUFDQSxPQUFBLEtBQUEsVUFBQTs7O1FBR0EsV0FBQSxTQUFBLE1BQUEsTUFBQTtVQUNBLE9BQUEsTUFBQSxNQUFBLEtBQUEsU0FBQSxNQUFBO1lBQ0EsT0FBQSxLQUFBLFNBQUE7OztRQUdBLE1BQUEsVUFBQSxNQUFBO1VBQ0EsT0FBQSxNQUFBOztRQUVBLE9BQUEsVUFBQSxNQUFBLE1BQUE7VUFDQSxPQUFBLE1BQUEsTUFBQSxPQUFBLFVBQUEsTUFBQTtZQUNBLE9BQUEsS0FBQSxRQUFBLEtBQUEsV0FBQSxDQUFBOzs7Ozs7O0FDOUJBO0dBQ0EsT0FBQSxjQUFBO0dBQ0EsUUFBQSw2QkFBQSxTQUFBLFNBQUEsTUFBQTtJQUNBLElBQUEsUUFBQTtJQUNBLE1BQUEsU0FBQSxTQUFBLEtBQUE7TUFDQSxRQUFBLDBCQUFBLEtBQUEsTUFBQSxXQUFBLE1BQUE7OztJQUdBLE1BQUEsWUFBQSxTQUFBLFdBQUE7TUFDQSxVQUFBLE9BQUEsV0FBQTtRQUNBLEtBQUEsS0FBQSxlQUFBLFVBQUE7U0FDQSxXQUFBO1FBQ0EsS0FBQSxLQUFBLGVBQUEsVUFBQTs7OztJQUlBLE1BQUEsVUFBQSxTQUFBLEtBQUE7TUFDQSxLQUFBLEtBQUEsZUFBQSxLQUFBLFVBQUEsSUFBQTs7O0lBR0EsT0FBQTs7QUNyQkE7R0FDQSxPQUFBLG9CQUFBOztHQUVBLHlCQUFBLFNBQUEsZUFBQTtJQUNBLGNBQUEsYUFBQSxLQUFBOzs7SUFHQSxjQUFBLFNBQUEsUUFBQSxPQUFBLHNCQUFBO0lBQ0EsY0FBQSxTQUFBLFFBQUEsS0FBQSxrQkFBQTtJQUNBLGNBQUEsU0FBQSxtQkFBQSxDQUFBLFNBQUEsTUFBQTtRQUNBLElBQUEsTUFBQTs7UUFFQSxRQUFBLFFBQUEsTUFBQSxTQUFBLE9BQUEsS0FBQTtVQUNBLEtBQUEsS0FBQSxtQkFBQSxPQUFBLE1BQUEsbUJBQUE7V0FDQTs7UUFFQSxPQUFBLElBQUEsS0FBQTs7OztHQUlBLFFBQUEscURBQUEsU0FBQSxJQUFBLFlBQUEsV0FBQTtJQUNBLE9BQUE7O01BRUEsV0FBQSxTQUFBLFFBQUE7UUFDQSxPQUFBLFFBQUEsZ0JBQUEsT0FBQSxpQkFBQTtRQUNBLE9BQUEsUUFBQSxZQUFBLE9BQUEsYUFBQTs7O1FBR0EsSUFBQSxPQUFBLElBQUEsUUFBQSxZQUFBLENBQUEsS0FBQSxPQUFBLElBQUEsUUFBQSxXQUFBLENBQUEsR0FBQTtVQUNBLE9BQUE7OztRQUdBLE9BQUEsTUFBQSxPQUFBLE1BQUEsUUFBQSxJQUFBLE9BQUE7O1FBRUEsT0FBQTs7OztNQUlBLGdCQUFBLFNBQUEsV0FBQTtRQUNBLE9BQUEsR0FBQSxPQUFBOzs7Ozs7Ozs7TUFTQSxZQUFBLFNBQUEsVUFBQTs7UUFFQSxJQUFBLE1BQUE7O1FBRUEsSUFBQSxRQUFBLFNBQUEsU0FBQSxPQUFBO1VBQ0EsT0FBQSxTQUFBLEtBQUE7VUFDQSxPQUFBLFNBQUEsS0FBQTs7Ozs7VUFLQSxJQUFBLFNBQUEsS0FBQTtZQUNBLE9BQUEsR0FBQSxPQUFBOzs7Ozs7VUFNQSxJQUFBLFFBQUEsTUFBQTtZQUNBLFNBQUEsT0FBQTs7Ozs7Ozs7O1FBU0EsT0FBQTs7OztNQUlBLGlCQUFBLFNBQUEsV0FBQTtRQUNBLElBQUEsZUFBQSxVQUFBOztRQUVBLElBQUEsVUFBQSxXQUFBLEtBQUE7VUFDQSxVQUFBLElBQUE7VUFDQSxVQUFBLE9BQUEsWUFBQTs7O1FBR0EsT0FBQSxHQUFBLE9BQUE7Ozs7O0FDdkZBO0dBQ0EsT0FBQSxlQUFBO0dBQ0EsUUFBQSwwQ0FBQSxTQUFBLE1BQUEscUJBQUE7SUFDQSxJQUFBLFNBQUE7TUFDQSxhQUFBOztNQUVBLFFBQUEsU0FBQSxVQUFBLFFBQUE7UUFDQSxJQUFBLFVBQUEsV0FBQSxHQUFBO1VBQ0EsTUFBQSxJQUFBLE1BQUE7OztRQUdBLE9BQUEsQ0FBQSxVQUFBLFFBQUEsS0FBQSxPQUFBOzs7TUFHQSxRQUFBLFNBQUEsS0FBQSxVQUFBLFFBQUE7UUFDQSxJQUFBLFVBQUEsV0FBQSxHQUFBO1VBQ0EsTUFBQSxJQUFBLE1BQUEsWUFBQSxNQUFBOzs7O1FBSUEsSUFBQSxVQUFBLFdBQUEsR0FBQTtVQUNBLE9BQUEsQ0FBQSxVQUFBLEtBQUEsS0FBQSxPQUFBOzs7UUFHQSxPQUFBLENBQUEsVUFBQSxRQUFBLEtBQUEsS0FBQSxPQUFBOzs7O0lBSUEsUUFBQSxPQUFBLFFBQUE7TUFDQSxLQUFBLE9BQUEsT0FBQSxLQUFBLFFBQUE7O01BRUEsUUFBQSxPQUFBLE9BQUEsS0FBQSxRQUFBOztNQUVBLFFBQUEsT0FBQSxPQUFBLEtBQUEsUUFBQTs7TUFFQSxPQUFBLFNBQUEsVUFBQSxRQUFBO1FBQ0Esb0JBQUEsT0FBQSxPQUFBLE9BQUEsVUFBQTtRQUNBLG9CQUFBLE9BQUEsT0FBQSxPQUFBLFVBQUE7UUFDQSxvQkFBQSxPQUFBLE9BQUEsT0FBQSxVQUFBO1FBQ0Esb0JBQUEsT0FBQSxPQUFBLElBQUEsVUFBQTs7OztJQUlBLE9BQUE7Ozs7QUMxQ0E7R0FDQSxPQUFBLGlCQUFBO0dBQ0EsUUFBQSxtQ0FBQSxTQUFBLFlBQUEsTUFBQTtJQUNBLElBQUEsS0FBQTtJQUNBLElBQUEsT0FBQSxXQUFBOztJQUVBLElBQUEsV0FBQTs7Ozs7OztNQU9BLE9BQUEsU0FBQSxLQUFBO1FBQ0EsSUFBQSxDQUFBLElBQUEsZUFBQSxDQUFBLElBQUEsS0FBQTtVQUNBLE1BQUEsSUFBQSxNQUFBOzs7UUFHQSxJQUFBLFFBQUEsSUFBQSxZQUFBO1FBQ0EsSUFBQTtRQUNBLElBQUEsa0JBQUE7OztRQUdBLElBQUEsVUFBQSxHQUFBO1VBQ0E7OztRQUdBLElBQUEsYUFBQTtVQUNBLFdBQUE7VUFDQSxNQUFBO1VBQ0EsS0FBQTtVQUNBLE9BQUE7OztRQUdBLE1BQUEsUUFBQSxPQUFBLElBQUEsWUFBQTs7UUFFQSxJQUFBLFdBQUEsU0FBQSxZQUFBOztVQUVBLFdBQUEsV0FBQTs7VUFFQSxJQUFBLElBQUEsTUFBQSxVQUFBOztVQUVBOztVQUVBLElBQUEsV0FBQTtZQUNBLFFBQUE7WUFDQSxPQUFBO1lBQ0EsU0FBQSxTQUFBLGtCQUFBLFFBQUE7OztVQUdBLElBQUEsVUFBQSxRQUFBLEdBQUE7WUFDQSxJQUFBLEdBQUEsaUJBQUE7Y0FDQSxHQUFBLGtCQUFBO2NBQ0EsT0FBQSxHQUFBOzs7WUFHQSxJQUFBOzs7O1FBSUEsSUFBQSxjQUFBLFFBQUEsS0FBQSxJQUFBLGFBQUE7OztRQUdBLElBQUEsVUFBQSxHQUFBO1VBQ0EsUUFBQTtVQUNBLFNBQUEsSUFBQTtZQUNBLFlBQUEsSUFBQSxZQUFBO1lBQ0EsU0FBQTtZQUNBLEtBQUEsSUFBQTtZQUNBLE9BQUEsSUFBQTs7O1VBR0E7Ozs7UUFJQSxJQUFBLFFBQUEsSUFBQSxXQUFBO1VBQ0EsUUFBQSxRQUFBO1VBQ0EsS0FBQSxJQUFBLElBQUEsR0FBQSxJQUFBLE9BQUEsS0FBQTtZQUNBLFNBQUEsSUFBQTtjQUNBLFlBQUEsSUFBQSxZQUFBO2NBQ0EsU0FBQTtjQUNBLEtBQUEsSUFBQTtjQUNBLE9BQUEsSUFBQTs7OztVQUlBOzs7O1FBSUEsUUFBQSxJQUFBLFlBQUE7UUFDQSxHQUFBLGtCQUFBLElBQUE7Ozs7UUFJQSxHQUFBLGlCQUFBLG1CQUFBLFNBQUEsZ0JBQUE7O1VBRUEsSUFBQSxDQUFBLGdCQUFBO1lBQ0E7OztVQUdBLFNBQUEsSUFBQTtZQUNBLFlBQUEsSUFBQSxZQUFBLEVBQUE7WUFDQSxTQUFBO1lBQ0EsS0FBQSxJQUFBO1lBQ0EsT0FBQSxJQUFBOzs7O1FBSUEsS0FBQSxJQUFBLElBQUEsR0FBQSxJQUFBLElBQUEsV0FBQSxLQUFBO1VBQ0EsU0FBQSxJQUFBO1lBQ0EsWUFBQSxJQUFBLFlBQUE7WUFDQSxTQUFBO1lBQ0EsS0FBQSxJQUFBO1lBQ0EsT0FBQSxJQUFBOzs7O1FBSUE7Ozs7TUFJQSxLQUFBLFNBQUEsS0FBQTtRQUNBLElBQUEsQ0FBQSxJQUFBLGNBQUEsQ0FBQSxJQUFBLEtBQUE7VUFDQSxNQUFBLElBQUEsTUFBQTs7O1FBR0EsS0FBQSxNQUFBLGlCQUFBLEtBQUEsVUFBQSxJQUFBOztRQUVBLElBQUEsYUFBQTtVQUNBLFNBQUE7VUFDQSxPQUFBO1VBQ0EsU0FBQTtVQUNBLFVBQUEsSUFBQSxXQUFBLElBQUEsT0FBQSxJQUFBLFdBQUEsSUFBQSxZQUFBLE9BQUE7O1FBRUEsSUFBQSxvQkFBQSxJQUFBO1FBQ0EsTUFBQSxRQUFBLE9BQUEsSUFBQSxZQUFBO1FBQ0EsSUFBQSxhQUFBLFNBQUEsZUFBQTtVQUNBLElBQUEsY0FBQSxrQkFBQTs7WUFFQSxJQUFBLFNBQUEsY0FBQTs7WUFFQSxJQUFBLFFBQUEsY0FBQTs7WUFFQSxJQUFBLFVBQUEsU0FBQSxDQUFBLFNBQUEsU0FBQTs7WUFFQSxrQkFBQTtjQUNBLFFBQUE7Y0FDQSxPQUFBO2NBQ0EsU0FBQTs7Ozs7UUFLQSxJQUFBLFNBQUEsSUFBQTtRQUNBLE9BQUEsVUFBQSxJQUFBO1FBQ0EsT0FBQSxXQUFBLElBQUE7O1FBRUEsSUFBQSxLQUFBLElBQUE7UUFDQSxHQUFBLGFBQUEsSUFBQTtRQUNBLEdBQUE7VUFDQSxJQUFBLFdBQUE7VUFDQSxVQUFBLElBQUE7VUFDQSxJQUFBLFFBQUEsS0FBQSxVQUFBLElBQUE7VUFDQSxJQUFBLE1BQUEsS0FBQSxVQUFBLElBQUE7VUFDQTs7Ozs7SUFLQSxPQUFBOzs7O0FDNUtBO0dBQ0EsT0FBQSxXQUFBO0dBQ0EsUUFBQSxlQUFBLFVBQUEsTUFBQTtJQUNBLE9BQUE7TUFDQSxTQUFBLFNBQUEsSUFBQSxRQUFBO1FBQ0EsSUFBQSxNQUFBOztRQUVBLElBQUEsUUFBQSxTQUFBLFNBQUE7VUFDQSxTQUFBLE9BQUEsTUFBQTs7O1FBR0EsSUFBQSxPQUFBLFdBQUEsS0FBQSxPQUFBLE9BQUEsSUFBQTtVQUNBLEtBQUEsS0FBQTtVQUNBOzs7UUFHQSxJQUFBLENBQUEsUUFBQSxRQUFBLFNBQUE7VUFDQSxLQUFBLE1BQUE7VUFDQTs7O1FBR0EsT0FBQSxJQUFBLFNBQUEsT0FBQTtVQUNBLE9BQUEsSUFBQSxTQUFBLEdBQUE7OztRQUdBLE9BQUE7Ozs7QUMxQkE7QUFDQSxRQUFBLE9BQUEsWUFBQSxJQUFBLENBQUEsWUFBQSxTQUFBLFVBQUE7RUFDQSxJQUFBLGtCQUFBO0lBQ0EsTUFBQTtJQUNBLEtBQUE7SUFDQSxLQUFBO0lBQ0EsS0FBQTtJQUNBLE1BQUE7SUFDQSxPQUFBOztFQUVBLFNBQUEsTUFBQSxXQUFBO0lBQ0Esb0JBQUE7TUFDQSxTQUFBO1FBQ0E7UUFDQTs7TUFFQSxPQUFBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7O01BRUEsU0FBQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7TUFFQSxZQUFBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7O01BRUEsY0FBQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7TUFFQSxZQUFBO01BQ0EsWUFBQTtNQUNBLFVBQUE7TUFDQSxjQUFBO01BQ0EsY0FBQTtNQUNBLFNBQUE7TUFDQSxhQUFBO01BQ0EsYUFBQTs7SUFFQSxrQkFBQTtNQUNBLGdCQUFBO01BQ0EsZUFBQTtNQUNBLGFBQUE7TUFDQSxZQUFBLENBQUE7UUFDQSxTQUFBO1FBQ0EsVUFBQTtRQUNBLFdBQUE7UUFDQSxXQUFBO1FBQ0EsV0FBQTtRQUNBLFVBQUE7UUFDQSxVQUFBO1FBQ0EsVUFBQTtRQUNBLFVBQUE7UUFDQSxVQUFBO1NBQ0E7UUFDQSxTQUFBO1FBQ0EsVUFBQTtRQUNBLFdBQUE7UUFDQSxXQUFBO1FBQ0EsV0FBQTtRQUNBLFVBQUE7UUFDQSxVQUFBO1FBQ0EsVUFBQTtRQUNBLFVBQUE7UUFDQSxVQUFBOzs7SUFHQSxNQUFBO0lBQ0EsYUFBQSxTQUFBLEdBQUE7TUFDQSxPQUFBLGdCQUFBOzs7OztBQ3JHQTtHQUNBLE9BQUE7O0dBRUEsV0FBQSw2RUFBQSxVQUFBLFFBQUEsSUFBQSxXQUFBLFVBQUEsUUFBQSxVQUFBO0lBQ0EsSUFBQSxLQUFBOztJQUVBLEdBQUEsUUFBQTs7SUFFQSxTQUFBLFFBQUE7TUFDQSxPQUFBO1NBQ0EsS0FBQTtVQUNBLFFBQUEsR0FBQTtVQUNBLFVBQUEsR0FBQTs7U0FFQTtTQUNBLEtBQUEsU0FBQSxLQUFBO1VBQ0EsT0FBQSxnQkFBQSxJQUFBO1VBQ0EsT0FBQSxZQUFBLElBQUE7O1VBRUEsT0FBQSxRQUFBLElBQUEsT0FBQTs7VUFFQSxJQUFBLEtBQUEsVUFBQTs7VUFFQSxVQUFBLElBQUEsR0FBQSxZQUFBOztTQUVBLE1BQUEsU0FBQSxLQUFBO1VBQ0EsT0FBQSxNQUFBLElBQUEsT0FBQTs7OztBQzFCQTtHQUNBLE9BQUEsbUJBQUEsQ0FBQTtHQUNBLFFBQUEsMEJBQUEsVUFBQSxXQUFBO0lBQ0EsT0FBQSxVQUFBLFlBQUEsU0FBQTs7QUNIQTtHQUNBLE9BQUE7O0dBRUEsUUFBQSxvRkFBQSxTQUFBLE1BQUEsY0FBQSxXQUFBLElBQUEscUJBQUE7SUFDQSxPQUFBLFNBQUEsSUFBQSxRQUFBLGFBQUE7TUFDQSxJQUFBLFlBQUEsYUFBQTtNQUNBLElBQUEsU0FBQSxhQUFBOztNQUVBLElBQUEsWUFBQSxDQUFBLFdBQUEsUUFBQSxLQUFBOztNQUVBLElBQUEsWUFBQSxvQkFBQSxJQUFBOztNQUVBLFFBQUEsT0FBQSxJQUFBLGFBQUEsVUFBQSxnQkFBQTs7O01BR0EsU0FBQSxPQUFBO1FBQ0EsSUFBQSxPQUFBLG9CQUFBLElBQUEsY0FBQTtRQUNBLEtBQUEsZUFBQSxHQUFBLFFBQUEsSUFBQTs7UUFFQSxvQkFBQSxJQUFBLFdBQUE7O1FBRUEsS0FBQSxJQUFBLGNBQUEsV0FBQSxLQUFBOzs7TUFHQSxJQUFBLFFBQUEsVUFBQSxNQUFBOzs7TUFHQSxHQUFBLElBQUEsd0JBQUEsV0FBQTtRQUNBLFVBQUEsT0FBQTs7Ozs7OztBQzNCQTtHQUNBLE9BQUE7O0dBRUEsV0FBQSxpSEFBQSxTQUFBLFFBQUEsY0FBQSxXQUFBLGdCQUFBLHFCQUFBLFFBQUE7SUFDQSxJQUFBLEtBQUE7O0lBRUEsSUFBQSxZQUFBLGFBQUE7SUFDQSxJQUFBLFNBQUEsYUFBQTtJQUNBLElBQUEsb0JBQUEsT0FBQSxPQUFBLFdBQUE7O0lBRUEsR0FBQSxRQUFBLEtBQUEsTUFBQSxlQUFBLElBQUE7Ozs7O0lBS0EsR0FBQSxxQkFBQTtJQUNBLEdBQUEsa0JBQUE7SUFDQSxHQUFBLGlCQUFBOztJQUVBLFNBQUEsa0JBQUE7TUFDQSxHQUFBLHFCQUFBLENBQUEsR0FBQTs7O0lBR0EsU0FBQSxpQkFBQTs7TUFFQSxvQkFBQSxJQUFBLG1CQUFBO1FBQ0EsVUFBQTs7O01BR0EsVUFBQSxJQUFBOzs7Ozs7Ozs7R0FTQSxXQUFBLG1HQUFBLFNBQUEsUUFBQSxNQUFBLGNBQUEsZ0JBQUEscUJBQUE7SUFDQSxJQUFBLEtBQUE7O0lBRUEsSUFBQSxlQUFBO0lBQ0EsSUFBQSxZQUFBLGFBQUE7SUFDQSxJQUFBLFNBQUEsYUFBQTs7SUFFQSxJQUFBLFlBQUEsQ0FBQSxXQUFBLFFBQUEsS0FBQTtJQUNBLElBQUEsZ0JBQUEsQ0FBQSxXQUFBLE9BQUEsS0FBQTtJQUNBLElBQUEsWUFBQSxvQkFBQSxJQUFBOztJQUVBLElBQUEsWUFBQSxLQUFBLE1BQUEsZUFBQSxJQUFBO0lBQ0EsSUFBQSxjQUFBLFVBQUEsS0FBQSxTQUFBLE1BQUE7TUFDQSxPQUFBLEtBQUEsT0FBQTs7SUFFQSxHQUFBLFFBQUEsZUFBQSxZQUFBOztJQUVBLEdBQUEsT0FBQTs7SUFFQSxRQUFBLE9BQUEsR0FBQSxNQUFBLGFBQUEsVUFBQSxpQkFBQTs7SUFFQSxJQUFBLGlCQUFBLG9CQUFBLElBQUE7SUFDQSxHQUFBLGNBQUEsRUFBQSxJQUFBLGdCQUFBLFNBQUEsTUFBQSxLQUFBO01BQ0EsT0FBQTtRQUNBLElBQUE7UUFDQSxNQUFBLGNBQUE7UUFDQSxRQUFBOzs7O0lBSUEsR0FBQSxNQUFBLFFBQUEsU0FBQSxNQUFBO01BQ0EsS0FBQSxNQUFBLFFBQUEsU0FBQSxNQUFBO1FBQ0EsR0FBQSxLQUFBLEtBQUEsTUFBQSxHQUFBLEtBQUEsS0FBQSxPQUFBLEVBQUEsT0FBQTs7OztJQUlBLEdBQUEsYUFBQTs7SUFFQSxTQUFBLGNBQUEsU0FBQTtNQUNBLE9BQUEsVUFBQSxLQUFBLFNBQUEsTUFBQSxFQUFBLE9BQUEsS0FBQSxPQUFBLFlBQUE7OztJQUdBLFNBQUEsV0FBQSxNQUFBLE1BQUE7TUFDQSxVQUFBLE9BQUEsV0FBQSxvQkFBQSxrQkFBQTtRQUNBLFVBQUE7UUFDQSxrQkFBQSxPQUFBLGdCQUFBO1FBQ0EsYUFBQSxPQUFBLGtCQUFBO1FBQ0EsWUFBQTtRQUNBLGNBQUEsT0FBQSxhQUFBOzs7UUFHQSxrQkFBQTs7O01BR0EsU0FBQSxtQkFBQSxRQUFBO1FBQ0EsR0FBQSxLQUFBLEtBQUEsTUFBQSxHQUFBLEtBQUEsS0FBQSxPQUFBO1FBQ0EsR0FBQSxLQUFBLEtBQUEsSUFBQSxRQUFBO1FBQ0EsR0FBQTs7UUFFQSxVQUFBLEtBQUEsTUFBQSxVQUFBLEtBQUEsT0FBQTtRQUNBLFVBQUEsS0FBQSxJQUFBLEtBQUEsTUFBQSxRQUFBLE9BQUEsVUFBQSxLQUFBLElBQUEsS0FBQSxPQUFBLElBQUEsR0FBQSxLQUFBLEtBQUE7O1FBRUEsb0JBQUEsSUFBQSxXQUFBOzs7TUFHQSxTQUFBLG1CQUFBO1FBQ0EsS0FBQSxNQUFBLGdCQUFBLEtBQUEsT0FBQSxXQUFBLEtBQUE7Ozs7O0dBS0EsV0FBQSxrSEFBQSxTQUFBLFFBQUEsTUFBQSxjQUFBLGdCQUFBLFFBQUEscUJBQUEsUUFB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R0FLQSxXQUFBLGlGQUFBLFNBQUEsUUFBQSxXQUFBLFlBQUEsYUFBQSxRQUFBO0lBQ0EsSUFBQSxLQUFBO0lBQ0EsSUFBQSxNQUFBLFVBQUE7O0lBRUEsR0FBQSxPQUFBLFNBQUEsSUFBQSxTQUFBO0lBQ0EsR0FBQSxPQUFBLFNBQUEsSUFBQSxTQUFBO0lBQ0EsR0FBQSxRQUFBLFlBQUEsS0FBQTtJQUNBLEdBQUEsWUFBQSxZQUFBLEtBQUEsUUFBQSxHQUFBOztJQUVBLEdBQUEsY0FBQTtJQUNBLEdBQUEsY0FBQTs7SUFFQTs7SUFFQSxTQUFBLFFBQUE7TUFDQSxJQUFBLFNBQUE7UUFDQSxZQUFBLEdBQUE7UUFDQSxNQUFBLEdBQUE7OztNQUdBLFVBQUEsT0FBQTs7TUFFQTtTQUNBLE1BQUE7U0FDQTtTQUNBLEtBQUEsU0FBQSxJQUFBO1VBQ0EsR0FBQSxNQUFBLFFBQUEsU0FBQSxNQUFBO1lBQ0EsS0FBQSxjQUFBLFlBQUEsS0FBQSxnQkFBQSxLQUFBOzs7VUFHQSxHQUFBLFFBQUEsR0FBQTtVQUNBLEdBQUEsY0FBQSxHQUFBOztVQUVBLElBQUEsTUFBQSxHQUFBLGNBQUEsR0FBQTtVQUNBLEdBQUEsYUFBQSxHQUFBLGNBQUEsR0FBQSxTQUFBLElBQUEsT0FBQSxLQUFBLE1BQUEsT0FBQTs7U0FFQSxNQUFBLFNBQUEsS0FBQTtVQUNBLE9BQUEsTUFBQSxJQUFBLE9BQUE7Ozs7O0lBS0EsU0FBQSxZQUFBLE1BQUE7TUFDQSxHQUFBLE9BQUE7TUFDQSxHQUFBLE9BQUE7O01BRUE7Ozs7SUFJQSxTQUFBLFlBQUEsTUFBQTtNQUNBLEdBQUEsT0FBQTs7TUFFQTs7Ozs7Ozs7O0FDOWRBO0dBQ0EsT0FBQSxvQkFBQSxDQUFBOztHQUVBLFFBQUEsNEJBQUEsU0FBQSxXQUFBO0lBQ0EsT0FBQSxVQUFBLFlBQUEsU0FBQSxZQUFBLElBQUE7TUFDQSxPQUFBO1FBQ0EsU0FBQTs7Ozs7R0FLQSxRQUFBLDJCQUFBLFNBQUEsV0FBQTtJQUNBLE9BQUEsVUFBQSxZQUFBLFNBQUE7O0FDWkE7R0FDQSxPQUFBLHFCQUFBLENBQUE7O0NBRUEsUUFBQSxxREFBQSxTQUFBLE9BQUEsZ0JBQUEsUUFBQTtFQUNBLE9BQUE7T0FDQTtPQUNBO09BQ0EsS0FBQSxTQUFBLEtBQUE7UUFDQSxJQUFBLGFBQUEsaUVBQUEsTUFBQTs7UUFFQSxXQUFBLFFBQUEsU0FBQSxLQUFBO1VBQ0EsSUFBQSxLQUFBLFFBQUE7WUFDQSxNQUFBO1lBQ0EsT0FBQTs7OztRQUlBLElBQUEsVUFBQSxDQUFBO1VBQ0EsTUFBQTtVQUNBLE9BQUE7V0FDQTtVQUNBLE1BQUE7VUFDQSxPQUFBO1dBQ0E7VUFDQSxNQUFBO1VBQ0EsT0FBQTtXQUNBO1VBQ0EsTUFBQTtVQUNBLE9BQUE7V0FDQTtVQUNBLE1BQUE7VUFDQSxPQUFBOzs7UUFHQSxPQUFBLE1BQUEsSUFBQTs7T0FFQSxNQUFBLFNBQUEsS0FBQTtRQUNBLE9BQUEsTUFBQSxJQUFBLE9BQUE7Ozs7QUNyQ0E7R0FDQSxPQUFBLG9CQUFBLENBQUE7O0dBRUEsUUFBQSxnQ0FBQSxTQUFBLFdBQUE7SUFDQSxPQUFBLFVBQUEsWUFBQSxTQUFBOzs7R0FHQSxRQUFBLDRCQUFBLFNBQUEsV0FBQTtJQUNBLE9BQUEsVUFBQSxZQUFBLFNBQUEsV0FBQSxJQUFBO01BQ0EsT0FBQTtRQUNBLFNBQUE7Ozs7O0dBS0EsUUFBQSwyQkFBQSxTQUFBLFdBQUE7SUFDQSxPQUFBLFVBQUEsWUFBQSxTQUFBLGNBQUE7TUFDQSxJQUFBO09BQ0E7TUFDQSxRQUFBO1FBQ0EsUUFBQTs7Ozs7R0FLQSxRQUFBLGlDQUFBLFNBQUEsV0FBQTtJQUNBLE9BQUEsVUFBQSxZQUFBLFNBQUEsaUNBQUE7TUFDQSxJQUFBO09BQ0E7TUFDQSxRQUFBO1FBQ0EsUUFBQTs7Ozs7R0FLQSxRQUFBLHdDQUFBLFNBQUEsV0FBQTtJQUNBLE9BQUEsVUFBQSxZQUFBLFNBQUEsK0JBQUE7TUFDQSxJQUFBO09BQ0E7TUFDQSxRQUFBO1FBQ0EsUUFBQTs7Ozs7R0FLQSxRQUFBLDRCQUFBLFNBQUEsV0FBQTtJQUNBLE9BQUEsVUFBQSxZQUFBLFNBQUEsWUFBQSxJQUFBO01BQ0EsT0FBQTtRQUNBLFNBQUE7Ozs7O0dBS0EsUUFBQSxvQ0FBQSxTQUFBLFdBQUE7SUFDQSxPQUFBLFVBQUEsWUFBQSxTQUFBOzs7R0FHQSxRQUFBLCtCQUFBLFNBQUEsV0FBQTtJQUNBLE9BQUEsVUFBQSxZQUFBLFNBQUEsd0JBQUE7TUFDQSxVQUFBOzs7O0dBSUEsUUFBQSw4QkFBQSxTQUFBLFdBQUE7SUFDQSxPQUFBLFVBQUEsWUFBQSxTQUFBLGdDQUFBO01BQ0EsVUFBQTtNQUNBLFFBQUE7T0FDQTtNQUNBLFFBQUE7UUFDQSxRQUFBOzs7OztBQ3BFQTtHQUNBLE9BQUE7O0dBRUEsV0FBQSwySEFBQSxTQUFBLFFBQUEsV0FBQSxRQUFBO0lBQ0EsWUFBQSxXQUFBLGlCQUFBLGFBQUE7SUFDQSxJQUFBLEtBQUE7SUFDQSxJQUFBLE1BQUEsVUFBQTs7SUFFQSxHQUFBLFlBQUEsU0FBQSxJQUFBLGNBQUE7O0lBRUEsSUFBQSxHQUFBLE9BQUEsU0FBQSx3QkFBQTtNQUNBLEdBQUEsWUFBQTtXQUNBO01BQ0EsR0FBQSxVQUFBLFNBQUEsSUFBQSxZQUFBO01BQ0EsR0FBQSxlQUFBLFNBQUEsSUFBQSxpQkFBQTs7TUFFQSxHQUFBLG1CQUFBLElBQUEsb0JBQUE7O01BRUEsR0FBQSxTQUFBLFlBQUEsS0FBQSxnQkFBQSxHQUFBO01BQ0EsR0FBQSxjQUFBLFlBQUEsS0FBQTtNQUNBLEdBQUEsT0FBQSxZQUFBLEtBQUEsUUFBQSxHQUFBO01BQ0EsR0FBQSxZQUFBLFlBQUEsS0FBQTs7O01BR0EsR0FBQSxZQUFBLFlBQUEsS0FBQSxhQUFBLEdBQUE7TUFDQSxHQUFBLGlCQUFBLFlBQUEsS0FBQTs7TUFFQSxXQUFBLFVBQUE7TUFDQSxXQUFBLFFBQUE7O01BRUEsV0FBQSxhQUFBOztNQUVBLEdBQUEsU0FBQTs7O0lBR0EsR0FBQSxPQUFBLFNBQUEsSUFBQSxTQUFBO0lBQ0EsR0FBQSxPQUFBLFNBQUEsSUFBQSxTQUFBO0lBQ0EsR0FBQSxRQUFBLFlBQUEsS0FBQTtJQUNBLEdBQUEsWUFBQSxZQUFBLEtBQUEsUUFBQSxHQUFBOztJQUVBLEdBQUEsY0FBQTtJQUNBLEdBQUEsY0FBQTtJQUNBLEdBQUEsZUFBQTtJQUNBLEdBQUEsZ0JBQUE7O0lBRUE7O0lBRUEsU0FBQSxRQUFBO01BQ0EsSUFBQSxTQUFBO1FBQ0EsU0FBQSxHQUFBO1FBQ0EsWUFBQSxHQUFBO1FBQ0EsTUFBQSxHQUFBOztRQUVBLFdBQUEsR0FBQTs7O01BR0EsSUFBQSxHQUFBLE9BQUEsU0FBQSxpQkFBQTtRQUNBLFFBQUEsT0FBQSxRQUFBO1VBQ0EsU0FBQSxHQUFBO1VBQ0EsY0FBQSxHQUFBOztVQUVBLGtCQUFBLEdBQUE7Ozs7TUFJQSxVQUFBLE9BQUE7O01BRUE7U0FDQSxNQUFBO1NBQ0E7U0FDQSxLQUFBLFNBQUEsSUFBQTtVQUNBLEdBQUEsTUFBQSxRQUFBLFNBQUEsTUFBQTtZQUNBLEtBQUEsY0FBQSxZQUFBLEtBQUEsZ0JBQUEsS0FBQTs7O1VBR0EsR0FBQSxRQUFBLEdBQUE7VUFDQSxHQUFBLGNBQUEsR0FBQTs7VUFFQSxJQUFBLE1BQUEsR0FBQSxjQUFBLEdBQUE7VUFDQSxHQUFBLGFBQUEsR0FBQSxjQUFBLEdBQUEsU0FBQSxJQUFBLE9BQUEsS0FBQSxNQUFBLE9BQUE7O1NBRUEsTUFBQSxTQUFBLEtBQUE7VUFDQSxPQUFBLE1BQUEsSUFBQSxLQUFBLE9BQUE7Ozs7SUFJQSxTQUFBLFdBQUEsTUFBQSxPQUFBO01BQ0EsR0FBQSxPQUFBLE1BQUEsU0FBQSxNQUFBO1FBQ0EsSUFBQSxDQUFBLE1BQUE7VUFDQTs7O1FBR0EsR0FBQSxTQUFBLEtBQUE7Ozs7O0lBS0EsU0FBQSxjQUFBLE1BQUE7TUFDQSxJQUFBLFFBQUEsYUFBQTtRQUNBO1dBQ0EsT0FBQTtZQUNBLElBQUEsS0FBQTs7V0FFQTtXQUNBLEtBQUEsU0FBQSxLQUFBO1lBQ0EsT0FBQSxRQUFBLElBQUEsT0FBQTs7WUFFQTs7V0FFQSxNQUFBLFNBQUEsS0FBQTtZQUNBLE9BQUEsTUFBQSxJQUFBLE9BQUE7Ozs7OztJQU1BLFNBQUEsYUFBQSxNQUFBO01BQ0EsSUFBQSxtQkFBQSxPQUFBLEtBQUE7UUFDQSxhQUFBO1FBQ0EsWUFBQTtRQUNBLFVBQUE7UUFDQSxTQUFBO1VBQ0EsYUFBQSxXQUFBO1lBQ0EsT0FBQTs7Ozs7TUFLQSxpQkFBQSxPQUFBLEtBQUEsV0FBQTs7O1FBR0E7Ozs7O0lBS0EsU0FBQSxZQUFBLE1BQUE7TUFDQSxHQUFBLE9BQUE7TUFDQSxHQUFBLE9BQUE7O01BRUE7Ozs7SUFJQSxTQUFBLFlBQUEsTUFBQTtNQUNBLEdBQUEsT0FBQTs7TUFFQTs7OztJQUlBLFNBQUEsU0FBQTtNQUNBLEdBQUEsT0FBQTs7TUFFQTs7OztHQUlBLFdBQUEsd05BQUEsU0FBQSxRQUFBLE1BQUEsV0FBQSxRQUFBLGdCQUFBO0lBQ0EsT0FBQSxVQUFBLFFBQUEscUJBQUEsb0JBQUE7SUFDQSxjQUFBLFdBQUE7SUFDQSxJQUFBLEtBQUE7SUFDQSxJQUFBLFFBQUEsS0FBQSxNQUFBLGVBQUEsSUFBQTs7SUFFQSxJQUFBLFNBQUEsTUFBQSxRQUFBO01BQ0EsR0FBQSxnQkFBQSxNQUFBLEdBQUE7OztJQUdBLEdBQUEsZUFBQTtJQUNBLEdBQUEsVUFBQTtJQUNBLEdBQUEsV0FBQTtJQUNBLEdBQUEsZ0JBQUE7SUFDQSxHQUFBLGNBQUE7O0lBRUE7O0lBRUEsU0FBQSxRQUFBO01BQ0EsT0FBQTtTQUNBO1NBQ0E7U0FDQSxLQUFBLFNBQUEsS0FBQTtVQUNBLElBQUEsUUFBQSxTQUFBLE9BQUE7WUFDQSxNQUFBLEtBQUEsUUFBQSxTQUFBLEtBQUE7Y0FDQSxJQUFBLG9CQUFBLE9BQUEsT0FBQSxNQUFBLElBQUEsSUFBQTtjQUNBLElBQUEsZ0JBQUEsb0JBQUEsSUFBQTs7OztVQUlBLEdBQUEsUUFBQTs7U0FFQSxNQUFBLFNBQUEsS0FBQTtVQUNBLE9BQUEsTUFBQSxJQUFBLE9BQUE7Ozs7O0lBS0EsU0FBQSxTQUFBLElBQUEsS0FBQTtNQUNBLElBQUEsZUFBQSxPQUFBLEtBQUE7UUFDQSxhQUFBO1FBQ0EsWUFBQTtRQUNBLFVBQUE7UUFDQSxTQUFBO1VBQ0EsYUFBQSxXQUFBO1lBQ0EsT0FBQTs7VUFFQSxhQUFBLFdBQUE7WUFDQSxPQUFBO2NBQ0EsSUFBQTtjQUNBLEtBQUE7Ozs7OztNQU1BLGFBQUEsT0FBQSxLQUFBLFdBQUE7UUFDQTs7Ozs7SUFLQSxTQUFBLFFBQUEsVUFBQSxLQUFBO01BQ0EsSUFBQSxRQUFBLFdBQUEsQ0FBQSxJQUFBLE9BQUEsSUFBQSxRQUFBLElBQUEsT0FBQSxLQUFBLE9BQUEsTUFBQTtRQUNBLE9BQUE7V0FDQSxPQUFBO1lBQ0EsVUFBQTtZQUNBLFFBQUEsSUFBQTs7V0FFQTtXQUNBLEtBQUEsU0FBQSxLQUFBO1lBQ0EsT0FBQSxNQUFBLFVBQUEsSUFBQTs7WUFFQSxPQUFBLFFBQUEsSUFBQSxPQUFBOztZQUVBOztXQUVBLE1BQUEsU0FBQSxLQUFBO1lBQ0EsT0FBQSxNQUFBLElBQUEsT0FBQTs7Ozs7O0lBTUEsU0FBQSxZQUFBLFVBQUEsS0FBQTtNQUNBLE9BQUEsTUFBQSxVQUFBLElBQUE7TUFDQSxPQUFBLFFBQUE7Ozs7SUFJQSxTQUFBLGFBQUEsTUFBQTtNQUNBLElBQUEsbUJBQUEsT0FBQSxLQUFBO1FBQ0EsYUFBQTtRQUNBLFlBQUE7UUFDQSxVQUFBO1FBQ0EsU0FBQTtVQUNBLGFBQUEsV0FBQTtZQUNBLE9BQUE7Ozs7O01BS0EsaUJBQUEsT0FBQSxLQUFBLFdBQUE7O1FBRUEsS0FBQSxLQUFBLFFBQUEsU0FBQSxLQUFBO1VBQ0EsT0FBQSxNQUFBLEtBQUEsSUFBQSxJQUFBOzs7UUFHQTs7Ozs7SUFLQSxTQUFBLGNBQUEsT0FBQSxLQUFBO01BQ0EsSUFBQSxXQUFBLE1BQUE7TUFDQSxJQUFBLFNBQUEsSUFBQTs7TUFFQSxJQUFBLGFBQUEsT0FBQSxPQUFBLFVBQUE7TUFDQSxJQUFBLG9CQUFBLE9BQUEsT0FBQTtNQUNBLElBQUEsY0FBQSxvQkFBQSxJQUFBOztNQUVBLEtBQUEsS0FBQSxhQUFBO01BQ0EsS0FBQSxLQUFBLGFBQUEsS0FBQSxVQUFBOztNQUVBLElBQUEsQ0FBQSxhQUFBO1FBQ0EsS0FBQSxLQUFBO1FBQ0E7OztNQUdBLElBQUEsY0FBQSxnQkFBQTtNQUNBLElBQUEsY0FBQSxZQUFBOztNQUVBLElBQUEsY0FBQTs7TUFFQSxPQUFBLEtBQUEsYUFBQSxRQUFBLFNBQUEsS0FBQTtRQUNBLFFBQUEsT0FBQSxhQUFBLFlBQUE7OztNQUdBLEtBQUEsS0FBQSxjQUFBLEtBQUEsVUFBQTs7TUFFQSxJQUFBLGVBQUE7TUFDQSxPQUFBLEtBQUEsYUFBQSxRQUFBLFNBQUEsS0FBQTtRQUNBLElBQUEsWUFBQSxLQUFBLE9BQUE7VUFDQSxhQUFBLE9BQUEsUUFBQSxPQUFBO1lBQ0EsS0FBQSxZQUFBLEtBQUE7YUFDQSxZQUFBOzs7O01BSUEsSUFBQSxTQUFBLEVBQUEsT0FBQTs7O01BR0EsSUFBQSxDQUFBLE9BQUEsUUFBQTtRQUNBOztRQUVBOzs7TUFHQSxLQUFBLEtBQUEsYUFBQSxLQUFBLFVBQUE7TUFDQSxLQUFBLEtBQUE7TUFDQSxTQUFBLE1BQUE7UUFDQSxLQUFBO1FBQ0EsYUFBQTtRQUNBLE1BQUE7UUFDQSxLQUFBO1FBQ0EsWUFBQTtRQUNBLE9BQUE7OztNQUdBLFNBQUEsV0FBQSxVQUFBOztRQUVBLEtBQUEsS0FBQSxXQUFBLFNBQUE7UUFDQSxJQUFBLGNBQUEsZ0JBQUEsU0FBQSxTQUFBLFVBQUE7UUFDQSxHQUFBOzs7TUFHQSxTQUFBLFdBQUEsT0FBQSxNQUFBOztRQUVBLE1BQUEsVUFBQSxLQUFBO1FBQ0EsS0FBQSxLQUFBLGFBQUEsS0FBQSxVQUFBOzs7TUFHQSxTQUFBLGFBQUEsT0FBQTtRQUNBLEtBQUEsS0FBQSxhQUFBLEtBQUEsVUFBQTs7O01BR0EsU0FBQSxjQUFBOzs7O1FBSUEsS0FBQSxLQUFBOzs7UUFHQSxPQUFBLFFBQUEsU0FBQSxPQUFBO1VBQ0EsWUFBQSxNQUFBLE1BQUE7OztRQUdBLEtBQUEsS0FBQTs7O1FBR0Esb0JBQUEsSUFBQSxtQkFBQTs7O1FBR0E7Ozs7Ozs7TUFPQSxTQUFBLGdCQUFBO1FBQ0EsS0FBQSxLQUFBOztRQUVBLE9BQUE7V0FDQSxLQUFBO1lBQ0EsVUFBQTtZQUNBLFFBQUE7YUFDQTtXQUNBO1dBQ0EsS0FBQSxXQUFBO1lBQ0EsS0FBQSxLQUFBOzs7WUFHQSxJQUFBLE9BQUEsUUFBQTtjQUNBLE9BQUEsUUFBQSxTQUFBLE9BQUE7Z0JBQ0EsTUFBQSxPQUFBLE1BQUE7Ozs7O1lBS0EsT0FBQSxNQUFBLFVBQUE7OztZQUdBLElBQUEsY0FBQSxnQkFBQTtZQUNBLElBQUEsY0FBQSxXQUFBOzs7O1dBSUEsTUFBQSxTQUFBLEtBQUE7WUFDQSxLQUFBLEtBQUEsZUFBQSxLQUFBLFVBQUE7WUFDQSxPQUFBLE1BQUEsSUFBQSxPQUFBOztZQUVBLElBQUEsY0FBQSxZQUFBOzs7Ozs7O0dBT0EsV0FBQSxtR0FBQSxTQUFBLFFBQUEsZ0JBQUEsUUFBQSx3QkFBQSxhQUFBO0lBQ0EsSUFBQSxLQUFBOztJQUVBLFFBQUEsT0FBQSxJQUFBOztJQUVBLEdBQUEsZUFBQTtJQUNBLEdBQUEsU0FBQTs7SUFFQSxTQUFBLGVBQUE7TUFDQSxHQUFBLHNCQUFBOztNQUVBO1NBQ0EsT0FBQTtVQUNBLElBQUEsWUFBQTtXQUNBO1VBQ0EsTUFBQSxHQUFBOztTQUVBO1NBQ0EsS0FBQSxTQUFBLEtBQUE7VUFDQSxPQUFBLFFBQUEsSUFBQSxPQUFBOztVQUVBLGVBQUE7O1NBRUEsTUFBQSxTQUFBLEtBQUE7VUFDQSxHQUFBLHNCQUFBOztVQUVBLE9BQUEsTUFBQSxJQUFBLE9BQUE7Ozs7SUFJQSxTQUFBLFNBQUE7TUFDQSxlQUFBOzs7OztHQUtBLFdBQUEsMkhBQUEsU0FBQSxRQUFBLGdCQUFBLFFBQUE7SUFDQSxjQUFBLGFBQUEsYUFBQTtJQUNBLElBQUEsS0FBQTs7SUFFQSxHQUFBLGFBQUEsWUFBQSxLQUFBO0lBQ0EsR0FBQSxjQUFBLFlBQUEsS0FBQTtJQUNBLEdBQUEsYUFBQSxZQUFBLEtBQUE7O0lBRUEsSUFBQSxZQUFBLEtBQUE7TUFDQSxHQUFBLFFBQUE7O01BRUEsWUFBQSxTQUFBLFlBQUEsSUFBQTtNQUNBLFlBQUEsVUFBQSxZQUFBLElBQUE7TUFDQSxZQUFBLFNBQUEsWUFBQSxJQUFBO1dBQ0E7TUFDQSxHQUFBLFFBQUE7OztJQUdBLEdBQUEsU0FBQTtJQUNBLEdBQUEsU0FBQTs7SUFFQSxTQUFBLFNBQUE7TUFDQSxJQUFBLFlBQUEsS0FBQTtRQUNBO1dBQ0EsT0FBQTtZQUNBLFVBQUEsWUFBQTtZQUNBLFFBQUEsWUFBQSxJQUFBO2FBQ0E7WUFDQSxPQUFBLEdBQUEsTUFBQTtZQUNBLFFBQUEsR0FBQSxNQUFBO1lBQ0EsT0FBQSxHQUFBLE1BQUE7O1dBRUE7V0FDQSxLQUFBLFNBQUEsS0FBQTtZQUNBLE9BQUEsUUFBQSxJQUFBLE9BQUE7O1lBRUEsZUFBQTs7V0FFQSxNQUFBLFNBQUEsS0FBQTtZQUNBLE9BQUEsTUFBQSxJQUFBLE9BQUE7O2FBRUE7UUFDQTtXQUNBLEtBQUE7WUFDQSxVQUFBLFlBQUE7YUFDQTtZQUNBLE9BQUEsR0FBQSxNQUFBO1lBQ0EsUUFBQSxHQUFBLE1BQUE7WUFDQSxPQUFBLEdBQUEsTUFBQTs7V0FFQTtXQUNBLEtBQUEsU0FBQSxLQUFBO1lBQ0EsT0FBQSxRQUFBLElBQUEsT0FBQTs7WUFFQSxlQUFBOztXQUVBLE1BQUEsU0FBQSxLQUFBO1lBQ0EsT0FBQSxNQUFBLElBQUEsT0FBQTs7Ozs7SUFLQSxTQUFBLFlBQUEsV0FBQSxPQUFBO01BQ0EsR0FBQSxhQUFBLFlBQUEsVUFBQSxXQUFBOzs7SUFHQSxTQUFBLFNBQUE7TUFDQSxlQUFBOzs7OztBQUtBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIOW6lOeUqOWFpeWPo1xuLy8gTW9kdWxlOiBndWx1XG4vLyBEZXBlbmRlbmNpZXM6XG4vLyAgICBuZ1JvdXRlLCBodHRwSW50ZXJjZXB0b3JzLCBndWx1Lm1pc3NpbmdcblxuLyogZ2xvYmFsIGZhbGxiYWNrSGFzaCAqL1xuYW5ndWxhclxuICAubW9kdWxlKCdndWx1JywgW1xuICAgICd1aS5yb3V0ZXInLFxuICAgICduZ0xvY2FsZScsXG4gICAgJ3RvYXN0cicsXG4gICAgJ3VpLmJvb3RzdHJhcCcsXG4gICAgJ2N1c3RvbS5kaXJlY3RpdmVzJyxcbiAgICAnaHR0cEludGVyY2VwdG9ycycsXG4gICAgJ0xvY2FsU3RvcmFnZU1vZHVsZScsXG4gICAgJ2NoaWVmZmFuY3lwYW50cy5sb2FkaW5nQmFyJyxcbiAgICAndXRpbC5maWx0ZXJzJyxcbiAgICAndXRpbC5kYXRlJyxcbiAgICAndXRpbC5maWxlcicsXG4gICAgJ3V0aWwudXBsb2FkZXInLFxuICAgICd1dGlsLmtleW1ncicsXG4gICAgJ2d1bHUuaW5kZW50JyxcbiAgICAnZ3VsdS5yZXBvcnQnLFxuICAgICdndWx1LmxvZ2luJyxcbiAgICAnZ3VsdS5taXNzaW5nJ1xuICBdKVxuICAuY29uZmlnKGZ1bmN0aW9uKCRsb2NhdGlvblByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIsICRsb2dQcm92aWRlciwgbG9jYWxTdG9yYWdlU2VydmljZVByb3ZpZGVyKSB7XG4gICAgLy8gbm90IHVzZSBodG1sNSBoaXN0b3J5IGFwaVxuICAgIC8vIGJ1dCB1c2UgaGFzaGJhbmdcbiAgICAkbG9jYXRpb25Qcm92aWRlclxuICAgICAgLmh0bWw1TW9kZShmYWxzZSlcbiAgICAgIC5oYXNoUHJlZml4KCchJyk7XG5cbiAgICAvLyBkZWZpbmUgNDA0XG4gICAgJHVybFJvdXRlclByb3ZpZGVyXG4gICAgICAub3RoZXJ3aXNlKCcvbG9naW4nKTtcblxuICAgIC8vIGxvZ2dlclxuICAgICRsb2dQcm92aWRlci5kZWJ1Z0VuYWJsZWQodHJ1ZSk7XG5cbiAgICAvLyBsb2NhbFN0b3JhZ2UgcHJlZml4XG4gICAgbG9jYWxTdG9yYWdlU2VydmljZVByb3ZpZGVyXG4gICAgICAuc2V0UHJlZml4KCdndWx1LnRlc3RlcicpXG4gICAgICAuc2V0Tm90aWZ5KHRydWUsIHRydWUpO1xuXG4gICAgLy8gQVBJIFNlcnZlclxuICAgIEFQSV9TRVJWRVJTID0ge1xuICAgICAgdGVzdGVyOiAnaHR0cDovL3QuaWZkaXUuY29tJ1xuICAgICAgLy8gdGVzdGVyOiAnaHR0cDovL28uZHA6MzAwMCdcbiAgICB9XG5cbiAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQpLm9uKCdkZXZpY2VyZWFkeScsIGZ1bmN0aW9uKCkge1xuICAgICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50KS5vbignYmFja2J1dHRvbicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KVxuICAucnVuKGZ1bmN0aW9uKCRyb290U2NvcGUsICRsb2NhdGlvbiwgJHN0YXRlLCAkc3RhdGVQYXJhbXMpIHtcbiAgICB2YXIgcmVnID0gL1tcXCZcXD9dXz1cXGQrLztcblxuICAgICRyb290U2NvcGUuJHN0YXRlID0gJHN0YXRlO1xuICAgICRyb290U2NvcGUuJHN0YXRlUGFyYW1zID0gJHN0YXRlUGFyYW1zO1xuICAgICRyb290U2NvcGUuaXNDb2xsYXBzZWQgPSB0cnVlO1xuXG4gICAgLy8g55So5LqO6L+U5Zue5LiK5bGC6aG16Z2iXG4gICAgJHJvb3RTY29wZVxuICAgICAgLiR3YXRjaChmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuICRsb2NhdGlvbi51cmwoKTtcbiAgICAgIH0sIGZ1bmN0aW9uKGN1cnJlbnQsIG9sZCkge1xuICAgICAgICBpZiAoY3VycmVudC5yZXBsYWNlKHJlZywgJycpID09PSBvbGQucmVwbGFjZShyZWcsICcnKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgICRyb290U2NvcGUuYmFja1VybCA9IG9sZDtcbiAgICAgIH0pO1xuXG4gICAgJHJvb3RTY29wZS5iYWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICAkbG9jYXRpb24udXJsKCRyb290U2NvcGUuYmFja1VybCk7XG4gICAgfVxuICB9KTtcblxuIiwiYW5ndWxhclxuICAubW9kdWxlKCdndWx1LmxvZ2luJywgW1xuICAgICd1aS5yb3V0ZXInLFxuICAgICdndWx1LmxvZ2luLnN2Y3MnXG4gIF0pXG5cbiAgLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyXG4gICAgICAuc3RhdGUoJ2xvZ2luJywge1xuICAgICAgICB1cmw6ICcvbG9naW4nLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2xvZ2luL2xvZ2luLmh0bScsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdMb2dpbkN0cmwnXG4gICAgICB9KTtcbiAgfSk7XG4iLCJhbmd1bGFyXG4gIC5tb2R1bGUoJ2d1bHUucmVwb3J0JywgW1xuICAgICd1aS5yb3V0ZXInLFxuICAgICd1dGlsLnZtJyxcbiAgICAndXRpbC5rZXltZ3InLFxuICAgICdndWx1LnJlcG9ydC5zdmNzJyxcbiAgICAnZ3VsdS5pbmRlbnQuZW51bXMnXG4gIF0pXG4gIC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlclxuICAgICAgLnN0YXRlKCdpbmRlbnRzLmlucHV0X3JlcG9ydCcsIHtcbiAgICAgICAgdXJsOiAnL3tpbmRlbnRfaWQ6WzAtOV0rfS9jYXIve2Nhcl9pZDpbMC05XSt9L3JlcG9ydCcsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAncmVwb3J0L2lucHV0X2Rhc2hib2FyZC5odG0nLFxuICAgICAgICBjb250cm9sbGVyOiAnSW5wdXREYXNoYm9hcmRDdHJsJ1xuICAgICAgfSlcbiAgICAgIC5zdGF0ZSgnaW5kZW50cy5pbnB1dF9yZXBvcnQucGhvdG8nLCB7XG4gICAgICAgIHVybDogJy9waG90bycsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAncmVwb3J0L2lucHV0X3Bob3RvLmh0bScsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdQaG90b1JlcG9ydEVkaXRDdHJsJ1xuICAgICAgfSlcbiAgICAgIC5zdGF0ZSgnaW5kZW50cy5pbnB1dF9yZXBvcnQucGFydCcsIHtcbiAgICAgICAgdXJsOiAnL3twYXJ0X2lkOlswLTlhLXpBLVpdK30nLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ3JlcG9ydC9pbnB1dC5odG0nLFxuICAgICAgICBjb250cm9sbGVyOiAnUmVwb3J0RWRpdEN0cmwnXG4gICAgICB9KVxuICAgICAgLnN0YXRlKCdpbmRlbnRzLnJlcG9ydHMnLCB7XG4gICAgICAgIHVybDogJy9yZXBvcnRzJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdyZXBvcnQvbGlzdC5odG0nLFxuICAgICAgICBjb250cm9sbGVyOiAnUmVwb3J0TGlzdEN0cmwnXG4gICAgICB9KTtcbiAgfSk7XG4iLCJhbmd1bGFyXG4gIC5tb2R1bGUoJ2d1bHUuaW5kZW50JywgW1xuICAgICd1aS5yb3V0ZXInLFxuICAgICd1dGlsLnVwbG9hZGVyJyxcbiAgICAndXRpbC5maWxlcicsXG4gICAgJ3V0aWwua2V5bWdyJyxcbiAgICAnZ3VsdS5pbmRlbnQuc3ZjcycsXG4gICAgJ2d1bHUuaW5kZW50LmVudW1zJ1xuICBdKVxuICAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXJcbiAgICAgIC5zdGF0ZSgnaW5kZW50cycsIHtcbiAgICAgICAgYWJzdHJhY3Q6IHRydWUsXG4gICAgICAgIHVybDogJy9pbmRlbnRzJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdpbmRlbnQvZGFzaGJvYXJkLmh0bScsXG4gICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICBJbmRlbnRFbnVtczogJ0luZGVudEVudW1zJ1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLnN0YXRlKCdpbmRlbnRzLmxpc3QnLCB7XG4gICAgICAgIHVybDogJycsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnaW5kZW50L3NlYXJjaC5odG0nLFxuICAgICAgICBjb250cm9sbGVyOiAnSW5kZW50TGlzdEN0cmwnXG4gICAgICB9KVxuICAgICAgLnN0YXRlKCdpbmRlbnRzLnVuY29uZmlybWVkJywge1xuICAgICAgICB1cmw6ICcvdW5jb25maXJtZWQnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2luZGVudC9saXN0X3VuY29uZmlybWVkLmh0bScsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdJbmRlbnRMaXN0Q3RybCdcbiAgICAgIH0pXG4gICAgICAuc3RhdGUoJ2luZGVudHMudW50ZXN0ZWQnLCB7XG4gICAgICAgIHVybDogJy91bnRlc3RlZCcsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnaW5kZW50L2xpc3RfdW50ZXN0ZWQuaHRtJyxcbiAgICAgICAgY29udHJvbGxlcjogJ1VudGVzdGVkSW5kZW50TGlzdEN0cmwnXG4gICAgICB9KTtcbiAgfSk7XG4iLCIvLyA0MDQg6aG16Z2iXG4vLyBNb2R1bGU6IGd1bHUubWlzc2luZ1xuLy8gRGVwZW5kZW5jaWVzOiBuZ1JvdXRlXG5cbmFuZ3VsYXJcbiAgLm1vZHVsZSgnZ3VsdS5taXNzaW5nJywgWyd1aS5yb3V0ZXInXSlcblxuICAvLyDphY3nva4gcm91dGVcbiAgLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlclxuICAgICAgLnN0YXRlKCdtaXNzaW5nJywge1xuICAgICAgICB1cmw6ICcvbWlzc2luZycsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnNDA0LzQwNC5odG0nLFxuICAgICAgICBjb250cm9sbGVyOiAnTWlzc2luZ0N0cmwnXG4gICAgICB9KTtcbiAgfSlcblxuICAvLyA0MDQgY29udHJvbGxlclxuICAuY29udHJvbGxlcignTWlzc2luZ0N0cmwnLCBmdW5jdGlvbiAoJHNjb3BlKSB7XG4gICAgY29uc29sZS5sb2coJ0lgbSBoZXJlJyk7XG4gICAgLy8gVE9ETzpcbiAgICAvLyAxLiBzaG93IGxhc3QgcGF0aCBhbmQgcGFnZSBuYW1lXG4gIH0pO1xuIiwiLy8g6Ieq5a6a5LmJIGRpcmVjdGl2ZXNcblxuYW5ndWxhclxuICAubW9kdWxlKCdjdXN0b20uZGlyZWN0aXZlcycsIFtdKVxuICAuZGlyZWN0aXZlKCduZ0luZGV0ZXJtaW5hdGUnLCBmdW5jdGlvbigkY29tcGlsZSkge1xuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgc2NvcGUuJHdhdGNoKGF0dHJpYnV0ZXNbJ25nSW5kZXRlcm1pbmF0ZSddLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgIGVsZW1lbnQucHJvcCgnaW5kZXRlcm1pbmF0ZScsICEhdmFsdWUpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICB9KTtcbiIsImFuZ3VsYXJcbiAgLm1vZHVsZSgndXRpbC5maWx0ZXJzJywgW10pXG5cbiAgLmZpbHRlcignbW9iaWxlJywgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHMpIHtcbiAgICAgIGlmIChzID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfVxuXG4gICAgICBzID0gcy5yZXBsYWNlKC9bXFxzXFwtXSsvZywgJycpO1xuXG4gICAgICBpZiAocy5sZW5ndGggPCAzKSB7XG4gICAgICAgIHJldHVybiBzO1xuICAgICAgfVxuXG4gICAgICB2YXIgc2EgPSBzLnNwbGl0KCcnKTtcblxuICAgICAgc2Euc3BsaWNlKDMsIDAsICctJyk7XG5cbiAgICAgIGlmIChzLmxlbmd0aCA+PSA3KSB7XG4gICAgICAgIHNhLnNwbGljZSg4LCAwLCAnLScpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2Euam9pbignJyk7XG4gICAgfTtcbiAgfSk7XG4iLCJhbmd1bGFyXG4gIC5tb2R1bGUoJ3V0aWwuZGF0ZScsIFtdKVxuICAuZmFjdG9yeSgnRGF0ZVV0aWwnLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRvU3RyaW5nID0gZnVuY3Rpb24gKGRhdGUsIHMpIHtcbiAgICAgIHJldHVybiBkYXRlLmdldEZ1bGxZZWFyKCkgKyBzICsgKGRhdGUuZ2V0TW9udGgoKSArIDEpICsgcyArIGRhdGUuZ2V0RGF0ZSgpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICB0b0xvY2FsRGF0ZVN0cmluZzogZnVuY3Rpb24gKGRhdGUpIHtcbiAgICAgICAgcmV0dXJuIHRvU3RyaW5nKGRhdGUsICctJyk7XG4gICAgICB9LFxuXG4gICAgICB0b0xvY2FsVGltZVN0cmluZzogZnVuY3Rpb24oZGF0ZSkge1xuICAgICAgICB2YXIgaCA9IGRhdGUuZ2V0SG91cnMoKTtcbiAgICAgICAgdmFyIG0gPSBkYXRlLmdldE1pbnV0ZXMoKTtcblxuICAgICAgICBpZiAoaCA8IDEwKSB7XG4gICAgICAgICAgaCA9ICcwJyArIGg7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobSA8IDEwKSB7XG4gICAgICAgICAgbSA9ICcwJyArIG07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gW3RvU3RyaW5nKGRhdGUsICctJyksIGggKyAnOicgKyBtXS5qb2luKCcgJyk7XG4gICAgICB9XG4gICAgfVxuICB9KTsiLCIvLyDmnprkuL4gU2VydmljZVxuYW5ndWxhclxuICAubW9kdWxlKCd1dGlsLmVudW1zJywgW10pXG4gIC5mYWN0b3J5KCdFbnVtcycsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKEVOVU1TKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB2YWw6IGZ1bmN0aW9uIChuYW1lLCB0ZXh0KSB7XG4gICAgICAgICAgcmV0dXJuIEVOVU1TW25hbWVdLmZpbmQoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtLnRleHQgPT09IHRleHQ7XG4gICAgICAgICAgfSkudmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIHRleHQ6IGZ1bmN0aW9uIChuYW1lLCB2YWwpIHtcbiAgICAgICAgICByZXR1cm4gRU5VTVNbbmFtZV0uZmluZChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW0udmFsdWUgPT09IHZhbDtcbiAgICAgICAgICB9KS50ZXh0O1xuICAgICAgICB9LFxuICAgICAgICBpdGVtOiBmdW5jdGlvbiAobmFtZSwgdmFsKSB7XG4gICAgICAgICAgcmV0dXJuIEVOVU1TW25hbWVdLmZpbmQoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtLnZhbHVlID09PSB2YWw7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGl0ZW00dGV4dDogZnVuY3Rpb24obmFtZSwgdGV4dCkge1xuICAgICAgICAgIHJldHVybiBFTlVNU1tuYW1lXS5maW5kKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtLnRleHQgPT09IHRleHQ7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGxpc3Q6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgcmV0dXJuIEVOVU1TW25hbWVdO1xuICAgICAgICB9LFxuICAgICAgICBpdGVtczogZnVuY3Rpb24gKG5hbWUsIHZhbHMpIHtcbiAgICAgICAgICByZXR1cm4gRU5VTVNbbmFtZV0uZmlsdGVyKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFscy5pbmRleE9mKGl0ZW0udmFsdWUpICE9PSAtMTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9O1xuICB9KTsiLCIvKiBnbG9iYWwgYW5ndWxhciovXG5hbmd1bGFyXG4gIC5tb2R1bGUoJ3V0aWwuZmlsZXInLCBbXSlcbiAgLmZhY3RvcnkoJ0ZpbGVyJywgZnVuY3Rpb24oJHdpbmRvdywgJGxvZykge1xuICAgIHZhciBmaWxlciA9IHt9O1xuICAgIGZpbGVyLnJlbW92ZSA9IGZ1bmN0aW9uKHVybCkge1xuICAgICAgJHdpbmRvdy5yZXNvbHZlTG9jYWxGaWxlU3lzdGVtVVJMKHVybCwgZmlsZXIuZnNTdWNjZXNzLCBmaWxlci5mc0Vycm9yKTtcbiAgICB9O1xuXG4gICAgZmlsZXIuZnNTdWNjZXNzID0gZnVuY3Rpb24oZmlsZUVudHJ5KSB7XG4gICAgICBmaWxlRW50cnkucmVtb3ZlKGZ1bmN0aW9uKCkge1xuICAgICAgICAkbG9nLmluZm8oJ+WIoOmZpOacrOWcsOWbvueJh+aIkOWKnzogJyArIGZpbGVFbnRyeS5mdWxsUGF0aCk7XG4gICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgJGxvZy5pbmZvKCfliKDpmaTmnKzlnLDlm77niYflpLHotKU6ICcgKyBmaWxlRW50cnkuZnVsbFBhdGgpO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIGZpbGVyLmZzRXJyb3IgPSBmdW5jdGlvbihldnQpIHtcbiAgICAgICRsb2cuaW5mbygn6I635Y+W5pys5Zyw5Zu+54mH5aSx6LSlOiAnICsgSlNPTi5zdHJpbmdpZnkoZXZ0LnRhcmdldCkpO1xuICAgIH07XG5cbiAgICByZXR1cm4gZmlsZXI7XG4gIH0pOyIsImFuZ3VsYXJcbiAgLm1vZHVsZSgnaHR0cEludGVyY2VwdG9ycycsIFtdKVxuXG4gIC5jb25maWcoZnVuY3Rpb24oJGh0dHBQcm92aWRlcikge1xuICAgICRodHRwUHJvdmlkZXIuaW50ZXJjZXB0b3JzLnB1c2goJ2h0dHBJbnRlcmNlcHRvcicpO1xuICAgIFxuICAgIC8vIEFuZ3VsYXIgJGh0dHAgaXNu4oCZdCBhcHBlbmRpbmcgdGhlIGhlYWRlciBYLVJlcXVlc3RlZC1XaXRoID0gWE1MSHR0cFJlcXVlc3Qgc2luY2UgQW5ndWxhciAxLjMuMFxuICAgICRodHRwUHJvdmlkZXIuZGVmYXVsdHMuaGVhZGVycy5jb21tb25bXCJYLVJlcXVlc3RlZC1XaXRoXCJdID0gJ1hNTEh0dHBSZXF1ZXN0JztcbiAgICAkaHR0cFByb3ZpZGVyLmRlZmF1bHRzLmhlYWRlcnMucG9zdFsnQ29udGVudC1UeXBlJ10gPSAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9dXRmLTgnO1xuICAgICRodHRwUHJvdmlkZXIuZGVmYXVsdHMudHJhbnNmb3JtUmVxdWVzdCA9IFtmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBzdHIgPSBbXTtcbiAgICAgICAgXG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaChkYXRhLCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICAgICAgdGhpcy5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChrZXkpICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKSk7XG4gICAgICAgIH0sIHN0cik7XG5cbiAgICAgICAgcmV0dXJuIHN0ci5qb2luKCcmJyk7XG4gICAgfV07XG4gIH0pXG5cbiAgLmZhY3RvcnkoJ2h0dHBJbnRlcmNlcHRvcicsIGZ1bmN0aW9uKCRxLCAkcm9vdFNjb3BlLCAkbG9jYXRpb24pIHtcbiAgICByZXR1cm4ge1xuICAgICAgLy8g6K+35rGC5YmN5L+u5pS5IHJlcXVlc3Qg6YWN572uXG4gICAgICAncmVxdWVzdCc6IGZ1bmN0aW9uKGNvbmZpZykge1xuICAgICAgICBjb25maWcuaGVhZGVycy5BdXRob3JpemF0aW9uID0gd2luZG93LkF1dGhvcml6YXRpb24gfHwgbnVsbDtcbiAgICAgICAgY29uZmlnLmhlYWRlcnMuQ1NSRlRva2VuID0gd2luZG93LkNTUkZUb2tlbiB8fCBudWxsO1xuICAgICAgICBcbiAgICAgICAgLy8g6Iul6K+35rGC55qE5piv5qih5p2/77yM5oiW5bey5Yqg5LiK5pe26Ze05oiz55qEIHVybCDlnLDlnYDvvIzliJnkuI3pnIDopoHliqDml7bpl7TmiLNcbiAgICAgICAgaWYgKGNvbmZpZy51cmwuaW5kZXhPZignLmh0bScpICE9PSAtMSB8fCBjb25maWcudXJsLmluZGV4T2YoJz9fPScpICE9PSAtMSkge1xuICAgICAgICAgIHJldHVybiBjb25maWc7XG4gICAgICAgIH1cblxuICAgICAgICBjb25maWcudXJsID0gY29uZmlnLnVybCArICc/Xz0nICsgbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cbiAgICAgICAgcmV0dXJuIGNvbmZpZztcbiAgICAgIH0sXG5cbiAgICAgIC8vIOivt+axguWHuumUme+8jOS6pOe7mSBlcnJvciBjYWxsYmFjayDlpITnkIZcbiAgICAgICdyZXF1ZXN0RXJyb3InOiBmdW5jdGlvbihyZWplY3Rpb24pIHtcbiAgICAgICAgcmV0dXJuICRxLnJlamVjdChyZWplY3Rpb24pO1xuICAgICAgfSxcblxuICAgICAgLy8g5ZON5bqU5pWw5o2u5oyJ57qm5a6a5aSE55CGXG4gICAgICAvLyB7XG4gICAgICAvLyAgIGNvZGU6IDIwMCwgLy8g6Ieq5a6a5LmJ54q25oCB56CB77yMMjAwIOaIkOWKn++8jOmdniAyMDAg5Z2H5LiN5oiQ5YqfXG4gICAgICAvLyAgIG1zZzogJ+aTjeS9nOaPkOekuicsIC8vIOS4jeiDveWSjCBkYXRhIOWFseWtmFxuICAgICAgLy8gICBkYXRhOiB7fSAvLyDnlKjmiLfmlbDmja5cbiAgICAgIC8vIH1cbiAgICAgICdyZXNwb25zZSc6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgIC8vIOacjeWKoeerr+i/lOWbnueahOacieaViOeUqOaIt+aVsOaNrlxuICAgICAgICB2YXIgZGF0YSwgY29kZTtcblxuICAgICAgICBpZiAoYW5ndWxhci5pc09iamVjdChyZXNwb25zZS5kYXRhKSkge1xuICAgICAgICAgIGNvZGUgPSByZXNwb25zZS5kYXRhLmNvZGU7XG4gICAgICAgICAgZGF0YSA9IHJlc3BvbnNlLmRhdGEuZGF0YTtcblxuICAgICAgICAgIC8vIOiLpSBzdGF0dXMgMjAwLCDkuJQgY29kZSAhMjAw77yM5YiZ6L+U5Zue55qE5piv5pON5L2c6ZSZ6K+v5o+Q56S65L+h5oGvXG4gICAgICAgICAgLy8g6YKj5LmI77yMY2FsbGJhY2sg5Lya5o6l5pS25Yiw5LiL6Z2i5b2i5byP55qE5Y+C5pWw77yaXG4gICAgICAgICAgLy8geyBjb2RlOiAyMDAwMSwgbXNnOiAn5pON5L2c5aSx6LSlJyB9XG4gICAgICAgICAgaWYgKGNvZGUgIT09IDIwMCkge1xuICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdChyZXNwb25zZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g6Iul5pyN5Yqh56uv6L+U5Zue55qEIGRhdGEgIW51bGzvvIzliJnov5Tlm57nmoTmmK/mnInmlYjlnLDnlKjmiLfmlbDmja5cbiAgICAgICAgICAvLyDpgqPkuYjvvIxjYWxsYmFjayDkvJrmjqXmlLbliLDkuIvpnaLlvaLlvI/lj4LmlbDvvJpcbiAgICAgICAgICAvLyB7IGl0ZW1zOiBbLi4uXSwgdG90YWxfY291bnQ6IDEwMCB9XG4gICAgICAgICAgaWYgKGRhdGEgIT0gbnVsbCkge1xuICAgICAgICAgICAgcmVzcG9uc2UuZGF0YSA9IGRhdGE7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g6Iul5pyN5Yqh56uv6L+U5Zue55qEIGRhdGEg5YC85Li6IG51bGzvvIzliJnov5Tlm57nmoTmmK/mj5DnpLrkv6Hmga9cbiAgICAgICAgICAvLyDpgqPkuYggY2FsbGJhY2sg5Lya5o6l5pS25Yiw5LiL6Z2i5b2i5byP55qE5Y+C5pWw77yaXG4gICAgICAgICAgLy8geyBjb2RlOiAyMDAsIG1zZzogJ+aTjeS9nOaIkOWKnycgfVxuICAgICAgICAgIC8vIOm7mOiupOS4uuatpFxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgICAgfSxcblxuICAgICAgLy8g5ZON5bqU5Ye66ZSZ77yM5Lqk57uZIGVycm9yIGNhbGxiYWNrIOWkhOeQhlxuICAgICAgJ3Jlc3BvbnNlRXJyb3InOiBmdW5jdGlvbihyZWplY3Rpb24pIHtcbiAgICAgICAgdmFyIGN1cnJlbnRfcGF0aCA9ICRsb2NhdGlvbi5wYXRoKCk7XG5cbiAgICAgICAgaWYgKHJlamVjdGlvbi5zdGF0dXMgPT09IDQwMSkge1xuICAgICAgICAgICRsb2NhdGlvbi51cmwoJy9sb2dpbicpO1xuICAgICAgICAgICRsb2NhdGlvbi5zZWFyY2goJ3JlZGlyZWN0JywgY3VycmVudF9wYXRoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAkcS5yZWplY3QocmVqZWN0aW9uKTtcbiAgICAgIH1cbiAgICB9O1xuICB9KTsiLCIvKiBnbG9iYWwgYW5ndWxhciovXG5hbmd1bGFyXG4gIC5tb2R1bGUoJ3V0aWwua2V5bWdyJywgW10pXG4gIC5mYWN0b3J5KCdLZXlNZ3InLCBmdW5jdGlvbigkbG9nLCBsb2NhbFN0b3JhZ2VTZXJ2aWNlKSB7XG4gICAgdmFyIEtleU1nciA9IHtcbiAgICAgIF9fY29ubmVjdG9yOiAnXycsXG4gICAgICBcbiAgICAgIHJlcG9ydDogZnVuY3Rpb24ob3JkZXJfaWQsIGNhcl9pZCkge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCAhPT0gMikge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignS2V5TWdyLnJlcG9ydCgpIOWPguaVsOmdnuazlScpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFtvcmRlcl9pZCwgY2FyX2lkXS5qb2luKEtleU1nci5fX2Nvbm5lY3Rvcik7XG4gICAgICB9LFxuXG4gICAgICBfX3R5cGU6IGZ1bmN0aW9uKGZpeCwgb3JkZXJfaWQsIGNhcl9pZCkge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignS2V5TWdyLicgKyBmaXggKyAnKCkg5Y+C5pWw6Z2e5rOVJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDnrKzkuIDkuKrlj4LmlbDmmK8gcmVwb3J0IEtleU1nclxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgIHJldHVybiBbb3JkZXJfaWQsIGZpeF0uam9pbihLZXlNZ3IuX19jb25uZWN0b3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFtvcmRlcl9pZCwgY2FyX2lkLCBmaXhdLmpvaW4oS2V5TWdyLl9fY29ubmVjdG9yKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgYW5ndWxhci5leHRlbmQoS2V5TWdyLCB7XG4gICAgICBlcnI6IEtleU1nci5fX3R5cGUuYmluZChLZXlNZ3IsICdlcnInKSxcblxuICAgICAgc3RhdHVzOiBLZXlNZ3IuX190eXBlLmJpbmQoS2V5TWdyLCAnc3RhdHVzJyksXG5cbiAgICAgIHN1Ym1pdDogS2V5TWdyLl9fdHlwZS5iaW5kKEtleU1nciwgJ3N1Ym1pdCcpLFxuXG4gICAgICBjbGVhcjogZnVuY3Rpb24ob3JkZXJfaWQsIGNhcl9pZCkge1xuICAgICAgICBsb2NhbFN0b3JhZ2VTZXJ2aWNlLnJlbW92ZShLZXlNZ3IucmVwb3J0KG9yZGVyX2lkLCBjYXJfaWQpKTtcbiAgICAgICAgbG9jYWxTdG9yYWdlU2VydmljZS5yZW1vdmUoS2V5TWdyLnN0YXR1cyhvcmRlcl9pZCwgY2FyX2lkKSk7XG4gICAgICAgIGxvY2FsU3RvcmFnZVNlcnZpY2UucmVtb3ZlKEtleU1nci5zdWJtaXQob3JkZXJfaWQsIGNhcl9pZCkpO1xuICAgICAgICBsb2NhbFN0b3JhZ2VTZXJ2aWNlLnJlbW92ZShLZXlNZ3IuZXJyKG9yZGVyX2lkLCBjYXJfaWQpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICAgIFxuICAgIHJldHVybiBLZXlNZ3I7XG4gIH0pOyIsIi8qIGdsb2JhbCBhbmd1bGFyLCBGaWxlVXBsb2FkT3B0aW9ucywgRmlsZVRyYW5zZmVyKi9cbi8vIOmZhOS7tuS4iuS8oOWZqFxuYW5ndWxhclxuICAubW9kdWxlKCd1dGlsLnVwbG9hZGVyJywgW10pXG4gIC5mYWN0b3J5KCdVcGxvYWRlcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRsb2cpIHtcbiAgICB2YXIgdm0gPSAkcm9vdFNjb3BlO1xuICAgIHZhciBub29wID0gZnVuY3Rpb24oKSB7fTtcblxuICAgIHZhciB1cGxvYWRlciA9IHtcbiAgICAgIC8vIOaJuemHj+S4iuS8oOmZhOS7tlxuICAgICAgLy8g5L6d6LWWICRzY29wZSDnmoQgb2JzZXJ2ZXJcbiAgICAgIC8vIFxuICAgICAgLy8gYXR0YWNobWVudHM6IOmcgOimgeS4iuS8oOeahOmZhOS7tuWIl+ihqFxuICAgICAgLy8gYmFuZHdpZHRoOiDlkIzml7bkuIrkvKDnmoTmlbDph49cbiAgICAgIC8vIGRvbmU6IOaJgOaciemZhOS7tuS4iuS8oOWujOaIkOeahOWbnuiwg+WHveaVsFxuICAgICAgYmF0Y2g6IGZ1bmN0aW9uKG9wdCkge1xuICAgICAgICBpZiAoIW9wdC5hdHRhY2htZW50cyB8fCAhb3B0LnVybCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcign5LiK5Lyg6ZmE5Lu257y65bCR5Y+C5pWwJyk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgY291bnQgPSBvcHQuYXR0YWNobWVudHMubGVuZ3RoO1xuICAgICAgICB2YXIgaW5kZXg7XG4gICAgICAgIHZhciBjb21wbGV0ZWRfY291bnQgPSAwO1xuXG4gICAgICAgIC8vIOayoeaciemZhOS7tlxuICAgICAgICBpZiAoY291bnQgPT09IDApIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZGVmYXVsdE9wdCA9IHtcbiAgICAgICAgICBiYW5kd2lkdGg6IDMsXG4gICAgICAgICAgZG9uZTogbm9vcCxcbiAgICAgICAgICBvbmU6IG5vb3AsXG4gICAgICAgICAgZXJyb3I6IG5vb3BcbiAgICAgICAgfTtcblxuICAgICAgICBvcHQgPSBhbmd1bGFyLmV4dGVuZCh7fSwgZGVmYXVsdE9wdCwgb3B0KTtcblxuICAgICAgICB2YXIgY29tcGxldGUgPSBmdW5jdGlvbihhdHRhY2htZW50KSB7XG4gICAgICAgICAgLy8g5pu05pawIGF0dGFjaG1lbnQg6Kem5Y+R5LiL5LiA5Liq5LiK5LygXG4gICAgICAgICAgYXR0YWNobWVudC51cGxvYWRlZCA9IHRydWU7XG5cbiAgICAgICAgICBvcHQub25lLmFwcGx5KHVwbG9hZGVyLCBhcmd1bWVudHMpO1xuXG4gICAgICAgICAgY29tcGxldGVkX2NvdW50Kys7XG5cbiAgICAgICAgICBvcHQub25wcm9ncmVzcyh7XG4gICAgICAgICAgICBsb2FkZWQ6IGNvbXBsZXRlZF9jb3VudCxcbiAgICAgICAgICAgIHRvdGFsOiBjb3VudCxcbiAgICAgICAgICAgIHBlcmNlbnQ6IHBhcnNlSW50KGNvbXBsZXRlZF9jb3VudCAvIGNvdW50ICogMTAwKVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgaWYgKGluZGV4ID09PSBjb3VudCAtIDEpIHtcbiAgICAgICAgICAgIGlmICh2bS5fX2F0dGFjaG1lbnRzX18pIHtcbiAgICAgICAgICAgICAgdm0uX19hdHRhY2htZW50c19fID0gbnVsbDtcbiAgICAgICAgICAgICAgZGVsZXRlIHZtLl9fYXR0YWNobWVudHNfXztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgb3B0LmRvbmUoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgb3B0LmF0dGFjaG1lbnRzID0gYW5ndWxhci5jb3B5KG9wdC5hdHRhY2htZW50cywgW10pO1xuXG4gICAgICAgIC8vIOWPquacieS4gOS4qumZhOS7tlxuICAgICAgICBpZiAoY291bnQgPT09IDEpIHtcbiAgICAgICAgICBpbmRleCA9IDA7XG4gICAgICAgICAgdXBsb2FkZXIub25lKHtcbiAgICAgICAgICAgIGF0dGFjaG1lbnQ6IG9wdC5hdHRhY2htZW50c1swXSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGNvbXBsZXRlLFxuICAgICAgICAgICAgdXJsOiBvcHQudXJsLFxuICAgICAgICAgICAgZXJyb3I6IG9wdC5lcnJvclxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDpmYTku7bmlbDph4/lsJHkuo7lkIzml7bkuIrkvKDnmoTmlbDph49cbiAgICAgICAgaWYgKGNvdW50IDwgb3B0LmJhbmR3aWR0aCkge1xuICAgICAgICAgIGluZGV4ID0gY291bnQgLSAxO1xuICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgICAgICAgdXBsb2FkZXIub25lKHtcbiAgICAgICAgICAgICAgYXR0YWNobWVudDogb3B0LmF0dGFjaG1lbnRzW2ldLFxuICAgICAgICAgICAgICBzdWNjZXNzOiBjb21wbGV0ZSxcbiAgICAgICAgICAgICAgdXJsOiBvcHQudXJsLFxuICAgICAgICAgICAgICBlcnJvcjogb3B0LmVycm9yXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBcbiAgICAgICAgaW5kZXggPSBvcHQuYmFuZHdpZHRoIC0gMTtcbiAgICAgICAgdm0uX19hdHRhY2htZW50c19fID0gb3B0LmF0dGFjaG1lbnRzO1xuXG4gICAgICAgIC8vIOS4iuS8oOWujOS4gOS4quWQju+8jOS7jiBhdHRhY2htZW50cyDkuK3lj5blh7rkuIvkuIDkuKrkuIrkvKBcbiAgICAgICAgLy8g5aeL57uI5L+d5oyB5ZCM5pe25LiK5Lyg55qE5pWw6YeP5Li6IGJhbmR3aWR0aFxuICAgICAgICB2bS4kd2F0Y2hDb2xsZWN0aW9uKCdfX2F0dGFjaG1lbnRzX18nLCBmdW5jdGlvbihuZXdBdHRhY2htZW50cykge1xuICAgICAgICAgIC8vIOaJuemHj+S4iuS8oOWujOaIkO+8jOS8muWIoOmZpCBfX2F0dGFjaG1lbnRzX19cbiAgICAgICAgICBpZiAoIW5ld0F0dGFjaG1lbnRzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdXBsb2FkZXIub25lKHtcbiAgICAgICAgICAgIGF0dGFjaG1lbnQ6IG9wdC5hdHRhY2htZW50c1srK2luZGV4XSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGNvbXBsZXRlLFxuICAgICAgICAgICAgdXJsOiBvcHQudXJsLFxuICAgICAgICAgICAgZXJyb3I6IG9wdC5lcnJvclxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBmb3IgKHZhciBrID0gMDsgayA8IG9wdC5iYW5kd2lkdGg7IGsrKykge1xuICAgICAgICAgIHVwbG9hZGVyLm9uZSh7XG4gICAgICAgICAgICBhdHRhY2htZW50OiBvcHQuYXR0YWNobWVudHNba10sXG4gICAgICAgICAgICBzdWNjZXNzOiBjb21wbGV0ZSxcbiAgICAgICAgICAgIHVybDogb3B0LnVybCxcbiAgICAgICAgICAgIGVycm9yOiBvcHQuZXJyb3JcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH0sXG5cbiAgICAgIC8vIOWNleS4quS4iuS8oFxuICAgICAgb25lOiBmdW5jdGlvbihvcHQpIHtcbiAgICAgICAgaWYgKCFvcHQuYXR0YWNobWVudCB8fCAhb3B0LnVybCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcign5LiK5Lyg6ZmE5Lu257y65bCR5Y+C5pWwJyk7XG4gICAgICAgIH1cblxuICAgICAgICAkbG9nLmRlYnVnKCdhdHRhY2htZW50OiAnICsgSlNPTi5zdHJpbmdpZnkob3B0LmF0dGFjaG1lbnQpKTtcbiAgICAgICAgXG4gICAgICAgIHZhciBkZWZhdWx0T3B0ID0ge1xuICAgICAgICAgIHN1Y2Nlc3M6IG5vb3AsXG4gICAgICAgICAgZXJyb3I6IG5vb3AsXG4gICAgICAgICAgZmlsZUtleTogJ2ZpbGVLZXknLFxuICAgICAgICAgIGZpbGVOYW1lOiBvcHQuYXR0YWNobWVudC51cmwuc3Vic3RyKG9wdC5hdHRhY2htZW50LnVybC5sYXN0SW5kZXhPZignLycpICsgMSlcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIGN1c3RvbV9vbnByb2dyZXNzID0gb3B0Lm9ucHJvZ3Jlc3M7XG4gICAgICAgIG9wdCA9IGFuZ3VsYXIuZXh0ZW5kKHt9LCBkZWZhdWx0T3B0LCBvcHQpO1xuICAgICAgICBvcHQub25wcm9nZXJzcyA9IGZ1bmN0aW9uKHByb2dyZXNzRXZlbnQpIHtcbiAgICAgICAgICBpZiAocHJvZ3Jlc3NFdmVudC5sZW5ndGhDb21wdXRhYmxlKSB7ICBcbiAgICAgICAgICAgIC8v5bey57uP5LiK5LygICBcbiAgICAgICAgICAgIHZhciBsb2FkZWQgPSBwcm9ncmVzc0V2ZW50LmxvYWRlZDsgIFxuICAgICAgICAgICAgLy/mlofku7bmgLvplb/luqYgIFxuICAgICAgICAgICAgdmFyIHRvdGFsID0gcHJvZ3Jlc3NFdmVudC50b3RhbDsgIFxuICAgICAgICAgICAgLy/orqHnrpfnmb7liIbmr5TvvIznlKjkuo7mmL7npLrov5vluqbmnaEgIFxuICAgICAgICAgICAgdmFyIHBlcmNlbnQgPSBwYXJzZUludCgobG9hZGVkIC8gdG90YWwpICogMTAwKTtcblxuICAgICAgICAgICAgY3VzdG9tX29ucHJvZ3Jlc3Moe1xuICAgICAgICAgICAgICBsb2FkZWQ6IGxvYWRlZCxcbiAgICAgICAgICAgICAgdG90YWw6IHRvdGFsLFxuICAgICAgICAgICAgICBwZXJjZW50OiBwZXJjZW50XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICB2YXIgZlVPcHRzID0gbmV3IEZpbGVVcGxvYWRPcHRpb25zKCk7XG4gICAgICAgIGZVT3B0cy5maWxlS2V5ID0gb3B0LmZpbGVLZXk7XG4gICAgICAgIGZVT3B0cy5maWxlTmFtZSA9IG9wdC5maWxlTmFtZTtcblxuICAgICAgICB2YXIgZnQgPSBuZXcgRmlsZVRyYW5zZmVyKCk7XG4gICAgICAgIGZ0Lm9ucHJvZ3Jlc3MgPSBvcHQub25wcm9ncmVzcztcbiAgICAgICAgZnQudXBsb2FkKFxuICAgICAgICAgIG9wdC5hdHRhY2htZW50LnVybCxcbiAgICAgICAgICBlbmNvZGVVUkkob3B0LnVybCksXG4gICAgICAgICAgb3B0LnN1Y2Nlc3MuYmluZCh1cGxvYWRlciwgb3B0LmF0dGFjaG1lbnQpLFxuICAgICAgICAgIG9wdC5lcnJvci5iaW5kKHVwbG9hZGVyLCBvcHQuYXR0YWNobWVudCksXG4gICAgICAgICAgZlVPcHRzXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfTtcbiAgICBcbiAgICByZXR1cm4gdXBsb2FkZXI7IFxuICB9KTtcbiIsIi8vICRzY29wZSDlop7lvLpcbmFuZ3VsYXJcbiAgLm1vZHVsZSgndXRpbC52bScsIFtdKVxuICAuZmFjdG9yeSgnVk0nLCBmdW5jdGlvbiAoJGxvZykge1xuICAgIHJldHVybiB7XG4gICAgICB0b19qc29uOiBmdW5jdGlvbih2bSwgZmllbGRzKSB7XG4gICAgICAgIHZhciByZXQgPSB7fTtcblxuICAgICAgICBpZiAoYW5ndWxhci5pc1N0cmluZyhmaWVsZHMpKSB7XG4gICAgICAgICAgZmllbGRzID0gZmllbGRzLnNwbGl0KCcsJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZmllbGRzLmxlbmd0aCA9PT0gMSAmJiBmaWVsZHNbMF0gPT09ICcnKSB7XG4gICAgICAgICAgJGxvZy53YXJuKCfmgqjosIPnlKjmlrnms5UgVk0udG9fanNvbiDml7bvvIzmsqHmnInkvKDlhaUgZmllbGRzIOWPguaVsCcpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghYW5ndWxhci5pc0FycmF5KGZpZWxkcykpIHtcbiAgICAgICAgICAkbG9nLmVycm9yKCfmlrnms5UgVk0udG9fanNvbiDlj6rmjqXlj5flrZfnrKbkuLLmlbDnu4TmiJbpgJflj7fliIbpmpTnmoTlrZfnrKbkuLLmiJbkuIDkuKrkuI3lkKvpgJflj7fnmoTlrZfnrKbkuLInKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBmaWVsZHMubWFwKGZ1bmN0aW9uKGZpZWxkKSB7XG4gICAgICAgICAgcmV0dXJuIHJldFtmaWVsZF0gPSB2bVtmaWVsZF07XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgICB9XG4gICAgfTtcbiAgfSk7IiwiJ3VzZSBzdHJpY3QnO1xuYW5ndWxhci5tb2R1bGUoXCJuZ0xvY2FsZVwiLCBbXSwgW1wiJHByb3ZpZGVcIiwgZnVuY3Rpb24oJHByb3ZpZGUpIHtcbiAgdmFyIFBMVVJBTF9DQVRFR09SWSA9IHtcbiAgICBaRVJPOiBcInplcm9cIixcbiAgICBPTkU6IFwib25lXCIsXG4gICAgVFdPOiBcInR3b1wiLFxuICAgIEZFVzogXCJmZXdcIixcbiAgICBNQU5ZOiBcIm1hbnlcIixcbiAgICBPVEhFUjogXCJvdGhlclwiXG4gIH07XG4gICRwcm92aWRlLnZhbHVlKFwiJGxvY2FsZVwiLCB7XG4gICAgXCJEQVRFVElNRV9GT1JNQVRTXCI6IHtcbiAgICAgIFwiQU1QTVNcIjogW1xuICAgICAgICBcIlxcdTRlMGFcXHU1MzQ4XCIsXG4gICAgICAgIFwiXFx1NGUwYlxcdTUzNDhcIlxuICAgICAgXSxcbiAgICAgIFwiREFZXCI6IFtcbiAgICAgICAgXCJcXHU2NjFmXFx1NjcxZlxcdTY1ZTVcIixcbiAgICAgICAgXCJcXHU2NjFmXFx1NjcxZlxcdTRlMDBcIixcbiAgICAgICAgXCJcXHU2NjFmXFx1NjcxZlxcdTRlOGNcIixcbiAgICAgICAgXCJcXHU2NjFmXFx1NjcxZlxcdTRlMDlcIixcbiAgICAgICAgXCJcXHU2NjFmXFx1NjcxZlxcdTU2ZGJcIixcbiAgICAgICAgXCJcXHU2NjFmXFx1NjcxZlxcdTRlOTRcIixcbiAgICAgICAgXCJcXHU2NjFmXFx1NjcxZlxcdTUxNmRcIlxuICAgICAgXSxcbiAgICAgIFwiTU9OVEhcIjogW1xuICAgICAgICBcIjFcXHU2NzA4XCIsXG4gICAgICAgIFwiMlxcdTY3MDhcIixcbiAgICAgICAgXCIzXFx1NjcwOFwiLFxuICAgICAgICBcIjRcXHU2NzA4XCIsXG4gICAgICAgIFwiNVxcdTY3MDhcIixcbiAgICAgICAgXCI2XFx1NjcwOFwiLFxuICAgICAgICBcIjdcXHU2NzA4XCIsXG4gICAgICAgIFwiOFxcdTY3MDhcIixcbiAgICAgICAgXCI5XFx1NjcwOFwiLFxuICAgICAgICBcIjEwXFx1NjcwOFwiLFxuICAgICAgICBcIjExXFx1NjcwOFwiLFxuICAgICAgICBcIjEyXFx1NjcwOFwiXG4gICAgICBdLFxuICAgICAgXCJTSE9SVERBWVwiOiBbXG4gICAgICAgIFwiXFx1NTQ2OFxcdTY1ZTVcIixcbiAgICAgICAgXCJcXHU1NDY4XFx1NGUwMFwiLFxuICAgICAgICBcIlxcdTU0NjhcXHU0ZThjXCIsXG4gICAgICAgIFwiXFx1NTQ2OFxcdTRlMDlcIixcbiAgICAgICAgXCJcXHU1NDY4XFx1NTZkYlwiLFxuICAgICAgICBcIlxcdTU0NjhcXHU0ZTk0XCIsXG4gICAgICAgIFwiXFx1NTQ2OFxcdTUxNmRcIlxuICAgICAgXSxcbiAgICAgIFwiU0hPUlRNT05USFwiOiBbXG4gICAgICAgIFwiMVxcdTY3MDhcIixcbiAgICAgICAgXCIyXFx1NjcwOFwiLFxuICAgICAgICBcIjNcXHU2NzA4XCIsXG4gICAgICAgIFwiNFxcdTY3MDhcIixcbiAgICAgICAgXCI1XFx1NjcwOFwiLFxuICAgICAgICBcIjZcXHU2NzA4XCIsXG4gICAgICAgIFwiN1xcdTY3MDhcIixcbiAgICAgICAgXCI4XFx1NjcwOFwiLFxuICAgICAgICBcIjlcXHU2NzA4XCIsXG4gICAgICAgIFwiMTBcXHU2NzA4XCIsXG4gICAgICAgIFwiMTFcXHU2NzA4XCIsXG4gICAgICAgIFwiMTJcXHU2NzA4XCJcbiAgICAgIF0sXG4gICAgICBcImZ1bGxEYXRlXCI6IFwieVxcdTVlNzRNXFx1NjcwOGRcXHU2NWU1RUVFRVwiLFxuICAgICAgXCJsb25nRGF0ZVwiOiBcInlcXHU1ZTc0TVxcdTY3MDhkXFx1NjVlNVwiLFxuICAgICAgXCJtZWRpdW1cIjogXCJ5eXl5LU0tZCBhaDptbTpzc1wiLFxuICAgICAgXCJtZWRpdW1EYXRlXCI6IFwieXl5eS1NLWRcIixcbiAgICAgIFwibWVkaXVtVGltZVwiOiBcImFoOm1tOnNzXCIsXG4gICAgICBcInNob3J0XCI6IFwieXktTS1kIGFoOm1tXCIsXG4gICAgICBcInNob3J0RGF0ZVwiOiBcInl5LU0tZFwiLFxuICAgICAgXCJzaG9ydFRpbWVcIjogXCJhaDptbVwiXG4gICAgfSxcbiAgICBcIk5VTUJFUl9GT1JNQVRTXCI6IHtcbiAgICAgIFwiQ1VSUkVOQ1lfU1lNXCI6IFwiXFx1MDBhNVwiLFxuICAgICAgXCJERUNJTUFMX1NFUFwiOiBcIi5cIixcbiAgICAgIFwiR1JPVVBfU0VQXCI6IFwiLFwiLFxuICAgICAgXCJQQVRURVJOU1wiOiBbe1xuICAgICAgICBcImdTaXplXCI6IDMsXG4gICAgICAgIFwibGdTaXplXCI6IDMsXG4gICAgICAgIFwibWFjRnJhY1wiOiAwLFxuICAgICAgICBcIm1heEZyYWNcIjogMyxcbiAgICAgICAgXCJtaW5GcmFjXCI6IDAsXG4gICAgICAgIFwibWluSW50XCI6IDEsXG4gICAgICAgIFwibmVnUHJlXCI6IFwiLVwiLFxuICAgICAgICBcIm5lZ1N1ZlwiOiBcIlwiLFxuICAgICAgICBcInBvc1ByZVwiOiBcIlwiLFxuICAgICAgICBcInBvc1N1ZlwiOiBcIlwiXG4gICAgICB9LCB7XG4gICAgICAgIFwiZ1NpemVcIjogMyxcbiAgICAgICAgXCJsZ1NpemVcIjogMyxcbiAgICAgICAgXCJtYWNGcmFjXCI6IDAsXG4gICAgICAgIFwibWF4RnJhY1wiOiAyLFxuICAgICAgICBcIm1pbkZyYWNcIjogMixcbiAgICAgICAgXCJtaW5JbnRcIjogMSxcbiAgICAgICAgXCJuZWdQcmVcIjogXCIoXFx1MDBhNFwiLFxuICAgICAgICBcIm5lZ1N1ZlwiOiBcIilcIixcbiAgICAgICAgXCJwb3NQcmVcIjogXCJcXHUwMGE0XCIsXG4gICAgICAgIFwicG9zU3VmXCI6IFwiXCJcbiAgICAgIH1dXG4gICAgfSxcbiAgICBcImlkXCI6IFwiemgtY25cIixcbiAgICBcInBsdXJhbENhdFwiOiBmdW5jdGlvbihuKSB7XG4gICAgICByZXR1cm4gUExVUkFMX0NBVEVHT1JZLk9USEVSO1xuICAgIH1cbiAgfSk7XG59XSk7XG4iLCJhbmd1bGFyXG4gIC5tb2R1bGUoJ2d1bHUubG9naW4nKVxuICBcbiAgLmNvbnRyb2xsZXIoJ0xvZ2luQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsICRxLCAkbG9jYXRpb24sICR0aW1lb3V0LCB0b2FzdHIsIExvZ2luU3ZjKSB7XG4gICAgdmFyIHZtID0gJHNjb3BlO1xuXG4gICAgdm0ubG9naW4gPSBsb2dpbjtcblxuICAgIGZ1bmN0aW9uIGxvZ2luKCkge1xuICAgICAgcmV0dXJuIExvZ2luU3ZjXG4gICAgICAgIC5zYXZlKHtcbiAgICAgICAgICBqb2Jfbm86IHZtLmpvYl9ubyxcbiAgICAgICAgICBwYXNzd29yZDogdm0ucGFzc3dvcmRcbiAgICAgICAgfSlcbiAgICAgICAgLiRwcm9taXNlXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIHdpbmRvdy5BdXRob3JpemF0aW9uID0gcmVzLkF1dGhvcml6YXRpb247XG4gICAgICAgICAgd2luZG93LkNTUkZUb2tlbiA9IHJlcy5DU1JGVG9rZW47XG4gICAgICAgICAgXG4gICAgICAgICAgdG9hc3RyLnN1Y2Nlc3MocmVzLm1zZyB8fCAn55m75b2V5oiQ5Yqf77yM5q2j5Zyo5Li65L2g6Lez6L2sLi4uJyk7XG5cbiAgICAgICAgICB2YXIgcXMgPSAkbG9jYXRpb24uc2VhcmNoKClcblxuICAgICAgICAgICRsb2NhdGlvbi51cmwocXMucmVkaXJlY3QgfHwgJy9pbmRlbnRzJyk7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICB0b2FzdHIuZXJyb3IocmVzLm1zZyB8fCAn55m75b2V5aSx6LSl77yM6K+36YeN6K+VJyk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgfSk7IiwiYW5ndWxhclxuICAubW9kdWxlKCdndWx1LmxvZ2luLnN2Y3MnLCBbJ25nUmVzb3VyY2UnXSlcbiAgLnNlcnZpY2UoJ0xvZ2luU3ZjJywgZnVuY3Rpb24gKCRyZXNvdXJjZSkge1xuICAgIHJldHVybiAkcmVzb3VyY2UoQVBJX1NFUlZFUlMudGVzdGVyICsgJy9hY2NvdW50L2xvZ2luJyk7XG4gIH0pIiwiYW5ndWxhclxuICAubW9kdWxlKCdndWx1LnJlcG9ydCcpXG5cbiAgLmZhY3RvcnkoJ1JlcG9ydElucHV0ZXInLCBmdW5jdGlvbigkbG9nLCAkc3RhdGVQYXJhbXMsICRpbnRlcnZhbCwgVk0sIGxvY2FsU3RvcmFnZVNlcnZpY2UpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24odm0sIGZpZWxkcywgcmVwb3J0X3R5cGUpIHtcbiAgICAgIHZhciBpbmRlbnRfaWQgPSAkc3RhdGVQYXJhbXMuaW5kZW50X2lkO1xuICAgICAgdmFyIGNhcl9pZCA9ICRzdGF0ZVBhcmFtcy5jYXJfaWQ7XG5cbiAgICAgIHZhciBzdG9yZV9rZXkgPSBbaW5kZW50X2lkLCBjYXJfaWRdLmpvaW4oJ18nKTtcblxuICAgICAgdmFyIGluaXRfZGF0YSA9IGxvY2FsU3RvcmFnZVNlcnZpY2UuZ2V0KHN0b3JlX2tleSk7XG4gICAgICAvLyDorr7nva7liJ3lp4vljJblgLxcbiAgICAgIGFuZ3VsYXIuZXh0ZW5kKHZtLCBpbml0X2RhdGEgJiYgaW5pdF9kYXRhW3JlcG9ydF90eXBlXSB8fCB7fSk7XG5cbiAgICAgIC8vIOS/neWtmOWIsCBsb2NhbFN0b3JhZ2VcbiAgICAgIGZ1bmN0aW9uIHNhdmUoKSB7XG4gICAgICAgIHZhciBkYXRhID0gbG9jYWxTdG9yYWdlU2VydmljZS5nZXQoc3RvcmVfa2V5KSB8fCB7fTtcbiAgICAgICAgZGF0YVtyZXBvcnRfdHlwZV0gPSBWTS50b19qc29uKHZtLCBmaWVsZHMpO1xuXG4gICAgICAgIGxvY2FsU3RvcmFnZVNlcnZpY2Uuc2V0KHN0b3JlX2tleSwgZGF0YSk7XG5cbiAgICAgICAgJGxvZy5sb2coJ+W9leWFpeajgOa1i+aKpeWRiiAtICcgKyBzdG9yZV9rZXksIGRhdGFbcmVwb3J0X3R5cGVdKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHRpbWVyID0gJGludGVydmFsKHNhdmUsIDMwMDApO1xuXG4gICAgICAvLyDliIfmjaLpobXpnaLml7bvvIzlj5bmtojoh6rliqjkv53lrZgo5riF6Zmk5a6a5pe25ZmoKVxuICAgICAgdm0uJG9uKCckbG9jYXRpb25DaGFuZ2VTdGFydCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAkaW50ZXJ2YWwuY2FuY2VsKHRpbWVyKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG5cbiIsIi8qIGdsb2JhbCBhbmd1bGFyLCBDYW1lcmEsIF8qL1xuYW5ndWxhclxuICAubW9kdWxlKCdndWx1LnJlcG9ydCcpXG5cbiAgLmNvbnRyb2xsZXIoJ0lucHV0RGFzaGJvYXJkQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlUGFyYW1zLCAkbG9jYXRpb24sICR0ZW1wbGF0ZUNhY2hlLCBsb2NhbFN0b3JhZ2VTZXJ2aWNlLCBLZXlNZ3IpIHtcbiAgICB2YXIgdm0gPSAkc2NvcGU7XG5cbiAgICB2YXIgaW5kZW50X2lkID0gJHN0YXRlUGFyYW1zLmluZGVudF9pZDtcbiAgICB2YXIgY2FyX2lkID0gJHN0YXRlUGFyYW1zLmNhcl9pZDtcbiAgICB2YXIgcmVwb3J0X3N0YXR1c19rZXkgPSBLZXlNZ3Iuc3RhdHVzKGluZGVudF9pZCwgY2FyX2lkKTtcblxuICAgIHZtLnBhcnRzID0gSlNPTi5wYXJzZSgkdGVtcGxhdGVDYWNoZS5nZXQoJ3JlcG9ydC9pLmpzb24nKSk7XG4gICAgLy8g5LiN55So5bGV56S654Wn54mHXG4gICAgLy8gdm0ucGFydHMucG9wKCk7XG4gICAgXG4gICAgLy8g6buY6K6k5bGV5byAXG4gICAgdm0udGVzdF9zdGVwX25hdl9vcGVuID0gdHJ1ZTtcbiAgICB2bS50b2dnbGVfbmF2X29wZW4gPSB0b2dnbGVfbmF2X29wZW47XG4gICAgdm0uc3VibWl0X3ByZXZpZXcgPSBzdWJtaXRfcHJldmlldztcblxuICAgIGZ1bmN0aW9uIHRvZ2dsZV9uYXZfb3BlbigpIHtcbiAgICAgIHZtLnRlc3Rfc3RlcF9uYXZfb3BlbiA9ICF2bS50ZXN0X3N0ZXBfbmF2X29wZW47XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc3VibWl0X3ByZXZpZXcoKSB7XG4gICAgICAvLyDkuLTml7bmlrnmoYhcbiAgICAgIGxvY2FsU3RvcmFnZVNlcnZpY2Uuc2V0KHJlcG9ydF9zdGF0dXNfa2V5LCB7XG4gICAgICAgIHN1Ym1pdGVkOiB0cnVlXG4gICAgICB9KTtcblxuICAgICAgJGxvY2F0aW9uLnVybCgnL2luZGVudHMvdW50ZXN0ZWQnKTtcblxuICAgICAgLy8gVE9ET1xuICAgICAgLy8gMS4g6Lez6L2s5Yiw5oql5ZGK5bGV56S66aG16Z2iKOehruiupOaPkOS6pO+8jOWPr+i/lOWbnilcbiAgICAgIC8vIDIuIOWwhuiuvue9riByZXByb3Qgc3RhdHVzIHN1Ym1pdGVkIOenu+WIsOeCueWHu+ehruiupOaPkOS6pOWQjlxuICAgICAgLy8gMy4g56Gu6K6k5o+Q5Lqk5YiZ6Lez6L2s5Yiw5b2T5aSp5Lu75Yqh55WM6Z2iXG4gICAgfVxuICB9KVxuXG4gIC5jb250cm9sbGVyKCdQaG90b1JlcG9ydEVkaXRDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkbG9nLCAkc3RhdGVQYXJhbXMsICR0ZW1wbGF0ZUNhY2hlLCBsb2NhbFN0b3JhZ2VTZXJ2aWNlKSB7XG4gICAgdmFyIHZtID0gJHNjb3BlO1xuXG4gICAgdmFyIGN1cnJlbnRfcGFydCA9ICdwaG90byc7XG4gICAgdmFyIGluZGVudF9pZCA9ICRzdGF0ZVBhcmFtcy5pbmRlbnRfaWQ7XG4gICAgdmFyIGNhcl9pZCA9ICRzdGF0ZVBhcmFtcy5jYXJfaWQ7XG4gICAgLy8g6KGo5Y2V6aG55pWw5o2u5a2Y5YKo5Yiw5pys5Zyw55qEIGtleSDnmoTnlJ/miJDop4TliJlcbiAgICB2YXIgc3RvcmVfa2V5ID0gW2luZGVudF9pZCwgY2FyX2lkXS5qb2luKCdfJyk7XG4gICAgdmFyIHN0b3JlX2tleV9lcnIgPSBbc3RvcmVfa2V5LCAnZXJyJ10uam9pbignXycpO1xuICAgIHZhciBpbml0X2RhdGEgPSBsb2NhbFN0b3JhZ2VTZXJ2aWNlLmdldChzdG9yZV9rZXkpO1xuXG4gICAgdmFyIHBhcnRfanNvbiA9IEpTT04ucGFyc2UoJHRlbXBsYXRlQ2FjaGUuZ2V0KCdyZXBvcnQvaS5qc29uJykpO1xuICAgIHZhciBwYXJlbnRfcGFydCA9IHBhcnRfanNvbi5maW5kKGZ1bmN0aW9uKHBhcnQpIHtcbiAgICAgIHJldHVybiBwYXJ0LmlkID09PSBjdXJyZW50X3BhcnQ7XG4gICAgfSk7XG4gICAgdm0ucGFydHMgPSBwYXJlbnRfcGFydCAmJiBwYXJlbnRfcGFydC5jaGlsZHJlbjtcblxuICAgIHZtLmRhdGEgPSB7fTtcbiAgICAvLyDorr7nva7liJ3lp4vljJblgLxcbiAgICBhbmd1bGFyLmV4dGVuZCh2bS5kYXRhLCBpbml0X2RhdGEgJiYgaW5pdF9kYXRhW2N1cnJlbnRfcGFydF0gfHwge30pO1xuXG4gICAgdmFyIHBob3RvX29mX2dyb3VwID0gbG9jYWxTdG9yYWdlU2VydmljZS5nZXQoc3RvcmVfa2V5X2Vycik7XG4gICAgdm0ucGFydF9waG90b3MgPSBfLm1hcChwaG90b19vZl9ncm91cCwgZnVuY3Rpb24oaXRlbSwga2V5KSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBpZDoga2V5LFxuICAgICAgICBuYW1lOiBnZXRfcGFydF9uYW1lKGtleSksXG4gICAgICAgIHBob3RvczogaXRlbVxuICAgICAgfTtcbiAgICB9KTtcblxuICAgIHZtLnBhcnRzLmZvckVhY2goZnVuY3Rpb24ocGFydCkge1xuICAgICAgcGFydC5pbWFnZS5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgdm0uZGF0YVtpdGVtLmlkXSA9IHZtLmRhdGFbaXRlbS5pZF0gfHwgeyBpbWFnZTogbnVsbCB9O1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICB2bS50YWtlX3Bob3RvID0gdGFrZV9waG90bztcbiAgICBcbiAgICBmdW5jdGlvbiBnZXRfcGFydF9uYW1lKHBhcnRfaWQpIHtcbiAgICAgIHJldHVybiBwYXJ0X2pzb24uZmluZChmdW5jdGlvbihwYXJ0KSB7IHJldHVybiBwYXJ0LmlkID09PSBwYXJ0X2lkOyB9KS5uYW1lO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRha2VfcGhvdG8ocGFydCwgaXRlbSkge1xuICAgICAgbmF2aWdhdG9yLmNhbWVyYS5nZXRQaWN0dXJlKHRha2VfcGhvdG9fc3VjY2VzcywgdGFrZV9waG90b19lcnJvciwge1xuICAgICAgICBxdWFsaXR5IDogMTAwLFxuICAgICAgICBkZXN0aW5hdGlvblR5cGUgOiBDYW1lcmEuRGVzdGluYXRpb25UeXBlLkZJTEVfVVJJLFxuICAgICAgICBzb3VyY2VUeXBlIDogQ2FtZXJhLlBpY3R1cmVTb3VyY2VUeXBlLkNBTUVSQSxcbiAgICAgICAgYWxsb3dFZGl0IDogdHJ1ZSxcbiAgICAgICAgZW5jb2RpbmdUeXBlOiBDYW1lcmEuRW5jb2RpbmdUeXBlLlBORyxcbiAgICAgICAgLy8gdGFyZ2V0V2lkdGg6IDEwMCxcbiAgICAgICAgLy8gdGFyZ2V0SGVpZ2h0OiAxMDAsXG4gICAgICAgIHNhdmVUb1Bob3RvQWxidW06IGZhbHNlXG4gICAgICB9KTtcblxuICAgICAgZnVuY3Rpb24gdGFrZV9waG90b19zdWNjZXNzKGltZ3VybCkge1xuICAgICAgICB2bS5kYXRhW2l0ZW0uaWRdID0gdm0uZGF0YVtpdGVtLmlkXSB8fCB7fTtcbiAgICAgICAgdm0uZGF0YVtpdGVtLmlkXS5pbWFnZSA9IGltZ3VybDtcbiAgICAgICAgdm0uJGFwcGx5KCk7XG5cbiAgICAgICAgaW5pdF9kYXRhW3BhcnQuaWRdID0gaW5pdF9kYXRhW3BhcnQuaWRdIHx8IHt9O1xuICAgICAgICBpbml0X2RhdGFbcGFydC5pZF1baXRlbS5pZF0gPSBhbmd1bGFyLmV4dGVuZChpbml0X2RhdGFbcGFydC5pZF1baXRlbS5pZF0gfHwge30sIHZtLmRhdGFbaXRlbS5pZF0pO1xuXG4gICAgICAgIGxvY2FsU3RvcmFnZVNlcnZpY2Uuc2V0KHN0b3JlX2tleSwgaW5pdF9kYXRhKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gdGFrZV9waG90b19lcnJvcigpIHtcbiAgICAgICAgJGxvZy5lcnJvcign5ouN54Wn5aSx6LSlLCDliIbnsbsgLSAnICsgcGFydC5uYW1lICsgJywg6aG5IC0gJyArIGl0ZW0ubmFtZSk7XG4gICAgICB9XG4gICAgfVxuICB9KVxuXG4gIC5jb250cm9sbGVyKCdSZXBvcnRFZGl0Q3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJGxvZywgJHN0YXRlUGFyYW1zLCAkdGVtcGxhdGVDYWNoZSwgJG1vZGFsLCBsb2NhbFN0b3JhZ2VTZXJ2aWNlLCBLZXlNZ3IpIHtcbiAgICB2YXIgdm0gPSAkc2NvcGU7XG5cbiAgICB2YXIgY3VycmVudF9wYXJ0ID0gcGFyc2VJbnQoJHN0YXRlUGFyYW1zLnBhcnRfaWQpO1xuICAgIHZhciBvcmRlcl9pZCA9ICRzdGF0ZVBhcmFtcy5pbmRlbnRfaWQ7XG4gICAgdmFyIGNhcl9pZCA9ICRzdGF0ZVBhcmFtcy5jYXJfaWQ7XG4gICAgLy8g6KGo5Y2V6aG55pWw5o2u5a2Y5YKo5Yiw5pys5Zyw55qEIGtleSDnmoTnlJ/miJDop4TliJlcbiAgICAvLyB2YXIgc3RvcmVfa2V5ID0gW2luZGVudF9pZCwgY2FyX2lkXS5qb2luKCdfJyk7XG4gICAgLy8gdmFyIHN0b3JlX2tleV9lcnIgPSBbc3RvcmVfa2V5LCAnZXJyJ10uam9pbignXycpO1xuXG4gICAgdmFyIHJlcG9ydF9rZXkgPSBLZXlNZ3IucmVwb3J0KG9yZGVyX2lkLCBjYXJfaWQpO1xuICAgIHZhciByZXBvcnRfZXJyX2tleSA9IEtleU1nci5lcnIocmVwb3J0X2tleSk7XG4gICAgdmFyIGluaXRfZGF0YSA9IGxvY2FsU3RvcmFnZVNlcnZpY2UuZ2V0KHJlcG9ydF9rZXkpO1xuXG4gICAgLy8g6I635Y+W5oql5ZGK6L6T5YWl6aG55pWw5o2uXG4gICAgdmFyIHBhcmVudF9wYXJ0ID0gXG4gICAgSlNPTlxuICAgICAgLnBhcnNlKCR0ZW1wbGF0ZUNhY2hlLmdldCgncmVwb3J0L2kuanNvbicpKVxuICAgICAgLmZpbmQoZnVuY3Rpb24ocGFydCkge1xuICAgICAgICByZXR1cm4gcGFydC5pZCA9PT0gY3VycmVudF9wYXJ0O1xuICAgICAgfSk7XG4gICAgdm0ucGFydHMgPSBwYXJlbnRfcGFydCAmJiBwYXJlbnRfcGFydC5jaGlsZHJlbjtcblxuICAgIC8vIOesrOS4gOadoem7mOiupOWxleW8gFxuICAgIGlmICh2bS5wYXJ0cyAmJiB2bS5wYXJ0cy5sZW5ndGgpIHtcbiAgICAgIHZtLnBhcnRzWzBdLmlzX29wZW4gPSB0cnVlO1xuICAgIH1cblxuICAgIHZtLmRhdGEgPSB7fTtcblxuICAgIC8vIOiuvue9ruWIneWni+WMluWAvFxuICAgIGFuZ3VsYXIuZXh0ZW5kKHZtLmRhdGEsIGluaXRfZGF0YSAmJiBpbml0X2RhdGFbY3VycmVudF9wYXJ0XSB8fCB7fSk7XG5cbiAgICB2bS5wYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uKHBhcnQpIHtcbiAgICAgIGlmIChwYXJ0LnJhZGlvX3dpdGhfc3RhdHVzX2RlZ3JlZXMgJiYgcGFydC5yYWRpb193aXRoX3N0YXR1c19kZWdyZWVzLmxlbmd0aCkge1xuICAgICAgICBwYXJ0LnJhZGlvX3dpdGhfc3RhdHVzX2RlZ3JlZXMuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgdm0uZGF0YVtpdGVtLmlkXSA9IHZtLmRhdGFbaXRlbS5pZF0gfHwge307XG5cbiAgICAgICAgICBpZiAodm0uZGF0YVtpdGVtLmlkXS5yZXN1bHQgPT0gbnVsbCkge1xuICAgICAgICAgICAgdm0uZGF0YVtpdGVtLmlkXS5yZXN1bHQgPSBcIjFcIjtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gZGF0YSDmlLnlj5jliJnlsIblhbbkv53lrZjliLAgbG9jYWwgc3RvcmFnZVxuICAgIHZtLiR3YXRjaCgnZGF0YScsIGZ1bmN0aW9uKHYpIHtcbiAgICAgICRsb2cubG9nKCdmb3JtIGRhdGE6ICcsIEpTT04uc3RyaW5naWZ5KHYpKTtcblxuICAgICAgc2F2ZSgpO1xuXG4gICAgICBzYXZlX2VycigpO1xuICAgIH0sIHRydWUpO1xuXG4gICAgXG4gICAgLy8g5L+d5a2Y5YiwIGxvY2FsU3RvcmFnZVxuICAgIC8vIOaVsOaNruagvOW8j+S4uu+8mlxuICAgIC8vIHtcbiAgICAvLyAgIFwicjFcIjoge1xuICAgIC8vICAgICBcInJlc3VsdFwiOiAxLFxuICAgIC8vICAgICBcInN0YXRlXCI6IDEsXG4gICAgLy8gICAgIFwiZGVncmVlXCI6IDEsXG4gICAgLy8gICAgIFwibWVtb1wiOiBcInh4eFwiLFxuICAgIC8vICAgICBcImltYWdlXCI6IFwiXCJcbiAgICAvLyAgIH1cbiAgICAvLyB9XG4gICAgZnVuY3Rpb24gc2F2ZSgpIHtcbiAgICAgIHZhciBkYXRhID0gbG9jYWxTdG9yYWdlU2VydmljZS5nZXQocmVwb3J0X2tleSkgfHwge307XG4gICAgICBkYXRhW2N1cnJlbnRfcGFydF0gPSB2bS5kYXRhO1xuXG4gICAgICBsb2NhbFN0b3JhZ2VTZXJ2aWNlLnNldChyZXBvcnRfa2V5LCBkYXRhKTtcblxuICAgICAgJGxvZy5sb2coJ+W9leWFpeajgOa1i+aKpeWRiiAtICcgKyByZXBvcnRfa2V5LCBkYXRhW2N1cnJlbnRfcGFydF0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNhdmVfZXJyKCkge1xuICAgICAgdmFyIGRhdGEgPSBsb2NhbFN0b3JhZ2VTZXJ2aWNlLmdldChyZXBvcnRfZXJyX2tleSkgfHwge307XG4gICAgICB2YXIgZXJyX2l0ZW1zID0gW107XG5cbiAgICAgIF8uZWFjaCh2bS5kYXRhLCBmdW5jdGlvbihpdGVtLCBrZXkpIHtcbiAgICAgICAgaWYgKHBhcnNlSW50KGl0ZW0ucmVzdWx0KSA9PT0gMCkge1xuICAgICAgICAgIGl0ZW0uaWQgPSBrZXk7XG4gICAgICAgICAgZXJyX2l0ZW1zLnB1c2goaXRlbSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBkYXRhW2N1cnJlbnRfcGFydF0gPSBlcnJfaXRlbXMgfHwgW107XG5cbiAgICAgIGxvY2FsU3RvcmFnZVNlcnZpY2Uuc2V0KHJlcG9ydF9lcnJfa2V5LCBkYXRhKTtcblxuICAgICAgJGxvZy5sb2coJ+W9leWFpeajgOa1i+aKpeWRiumXrumimOmhuSAtICcgKyByZXBvcnRfZXJyX2tleSwgZGF0YVtjdXJyZW50X3BhcnRdKTtcbiAgICB9XG5cbiAgICB2bS5zaG93X2RldGFpbCA9IHNob3dfZGV0YWlsO1xuICAgIHZtLnNob3VsZF9jbGVhciA9IHNob3VsZF9jbGVhcjtcbiAgICB2bS50YWtlX3Bob3RvID0gdGFrZV9waG90bztcbiAgICB2bS5vcGVuX2RhdGVwaWNrZXIgPSBvcGVuX2RhdGVwaWNrZXI7XG4gICAgdm0uc2hvd190YWtlX3Bob3RvID0gc2hvd190YWtlX3Bob3RvO1xuICAgIHZtLnNob3dfcGhvdG8gPSBzaG93X3Bob3RvO1xuXG4gICAgLy8g6YG/5YWN5bGV56S65Lik5qyhIG1vZGFsXG4gICAgZnVuY3Rpb24gc2hvd19kZXRhaWwoaW5kZXgsIHBhcnQsIGNoZWNrX2l0ZW0pIHtcbiAgICAgIC8vIGNoYW5nZSDkuovku7blj5HnlJ/lnKggY2xpY2sg5LmL5ZCOXG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyDlhbbku5bpgInpobnkuI3lupTor6XlvLnlh7pcbiAgICAgICAgaWYgKHNob3dfZGV0YWlsLmlzX3Nob3cgfHwgcGFyc2VJbnQodm0uZGF0YVtjaGVja19pdGVtLmlkXS5yZXN1bHQpICE9PSAyKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgc2hvd19kZXRhaWwuaXNfc2hvdyA9IHRydWU7XG5cbiAgICAgICAgdmFyIGlucHV0X2RldGFpbF9pbnMgPSAkbW9kYWwub3Blbih7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICdyZXBvcnQvaW5wdXRfZGV0YWlsLmh0bScsXG4gICAgICAgICAgY29udHJvbGxlcjogJ0l0ZW1JbnB1dERldGFpbEN0cmwnLFxuICAgICAgICAgIGJhY2tkcm9wOiAnc3RhdGljJyxcbiAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICBpdGVtX2RldGFpbDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBhbmd1bGFyLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgcGFydF9uYW1lOiBwYXJ0Lm5hbWUsXG4gICAgICAgICAgICAgICAgcGFydF9hbGlhczogcGFydC5hbGlhcyxcbiAgICAgICAgICAgICAgICBpbmRleDogaW5kZXhcbiAgICAgICAgICAgICAgfSwgY2hlY2tfaXRlbSwgdm0uZGF0YVtjaGVja19pdGVtLmlkXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpbnB1dF9kZXRhaWxfaW5zLnJlc3VsdC50aGVuKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICBhbmd1bGFyLmV4dGVuZCh2bS5kYXRhW2NoZWNrX2l0ZW0uaWRdLCBpdGVtLCB7XG4gICAgICAgICAgICBuYW1lOiBjaGVja19pdGVtLm5hbWVcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHNob3dfZGV0YWlsLmlzX3Nob3cgPSBmYWxzZTtcbiAgICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgc2hvd19kZXRhaWwuaXNfc2hvdyA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHNob3dfZGV0YWlsLmlzX3Nob3cgPSBmYWxzZTtcblxuICAgIGZ1bmN0aW9uIHNob3VsZF9jbGVhcihpdGVtKSB7XG4gICAgICAvLyDoi6Xmo4DmtYvml6Dpl67popjvvIzliJnmuIXpmaTkuYvliY3loavlhpnnmoTmjZ/kvKTmlbDmja5cbiAgICAgIGlmIChwYXJzZUludCh2bS5kYXRhW2l0ZW0uaWRdLnJlc3VsdCkgIT09IDApIHtcbiAgICAgICAgYW5ndWxhci5leHRlbmQodm0uZGF0YVtpdGVtLmlkXSwge1xuICAgICAgICAgIHN0YXRlOiBudWxsLFxuICAgICAgICAgIGRlZ3JlZTogbnVsbCxcbiAgICAgICAgICBtZW1vOiBudWxsLFxuICAgICAgICAgIGltYWdlOiBudWxsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFRPRE9cbiAgICAvLyDlm77niYfpooTop4hcbiAgICBmdW5jdGlvbiBzaG93X3Bob3RvKGZpZWxkKSB7XG5cbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0YWtlX3Bob3RvKHBhcnQsIGl0ZW0pIHtcbiAgICAgIG5hdmlnYXRvci5jYW1lcmEuZ2V0UGljdHVyZSh0YWtlX3Bob3RvX3N1Y2Nlc3MsIHRha2VfcGhvdG9fZXJyb3IsIHtcbiAgICAgICAgcXVhbGl0eSA6IDEwMCxcbiAgICAgICAgZGVzdGluYXRpb25UeXBlIDogQ2FtZXJhLkRlc3RpbmF0aW9uVHlwZS5GSUxFX1VSSSxcbiAgICAgICAgc291cmNlVHlwZSA6IENhbWVyYS5QaWN0dXJlU291cmNlVHlwZS5DQU1FUkEsXG4gICAgICAgIGFsbG93RWRpdCA6IHRydWUsXG4gICAgICAgIGVuY29kaW5nVHlwZTogQ2FtZXJhLkVuY29kaW5nVHlwZS5QTkcsXG4gICAgICAgIC8vIHRhcmdldFdpZHRoOiAxMDAsXG4gICAgICAgIC8vIHRhcmdldEhlaWdodDogMTAwLFxuICAgICAgICBzYXZlVG9QaG90b0FsYnVtOiBmYWxzZVxuICAgICAgfSk7XG5cbiAgICAgIGZ1bmN0aW9uIHRha2VfcGhvdG9fc3VjY2VzcyhpbWd1cmwpIHtcbiAgICAgICAgdm0uZGF0YVtpdGVtLmlkXSA9IHZtLmRhdGFbaXRlbS5pZF0gfHwge307XG4gICAgICAgIHZtLmRhdGFbaXRlbS5pZF0uaW1hZ2UgPSBpbWd1cmw7XG4gICAgICAgIHZtLiRhcHBseSgpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiB0YWtlX3Bob3RvX2Vycm9yKCkge1xuICAgICAgICAkbG9nLmVycm9yKCfmi43nhaflpLHotKUsIOWIhuexuyAtICcgKyBwYXJ0Lm5hbWUgKyAnLCDpobkgLSAnICsgaXRlbS5uYW1lKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDml6XmnJ/mjqfku7bmmL7npLov6ZqQ6JePL+emgeeUqFxuICAgIHZtLmRwX3BhcmFtcyA9IHt9O1xuICAgIGZ1bmN0aW9uIG9wZW5fZGF0ZXBpY2tlcigkZXZlbnQsIGRwKSB7XG4gICAgICAkZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgdm0uZHBfcGFyYW1zW2RwXSA9IHRydWU7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIHNob3dfdGFrZV9waG90byhpbmRleCwgcGFydCwgY2hlY2tfaXRlbSkge1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHNob3dfdGFrZV9waG90by5pc19zaG93IHx8IHBhcnNlSW50KHZtLmRhdGFbY2hlY2tfaXRlbS5pZF0ucmVzdWx0KSAhPT0gNSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHNob3dfdGFrZV9waG90by5pc19zaG93ID0gdHJ1ZTtcblxuICAgICAgICB2YXIgdGFrZV9waG90b19tb2RhbCA9ICRtb2RhbC5vcGVuKHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3JlcG9ydC90YWtlX3Bob3RvX21vZGFsLmh0bScsXG4gICAgICAgICAgY29udHJvbGxlcjogJ0l0ZW1UYWtlUGhvdG9DdHJsJyxcbiAgICAgICAgICBiYWNrZHJvcDogJ3N0YXRpYycsXG4gICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgaXRlbV9kZXRhaWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gYW5ndWxhci5leHRlbmQoe1xuICAgICAgICAgICAgICAgIHBhcnRfbmFtZTogcGFydC5uYW1lLFxuICAgICAgICAgICAgICAgIHBhcnRfYWxpYXM6IHBhcnQuYWxpYXMsXG4gICAgICAgICAgICAgICAgaW5kZXg6IGluZGV4XG4gICAgICAgICAgICAgIH0sIGNoZWNrX2l0ZW0sIHZtLmRhdGFbY2hlY2tfaXRlbS5pZF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGFrZV9waG90b19tb2RhbC5yZXN1bHQudGhlbihmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgYW5ndWxhci5leHRlbmQodm0uZGF0YVtjaGVja19pdGVtLmlkXSwgaXRlbSwge1xuICAgICAgICAgICAgbmFtZTogY2hlY2tfaXRlbS5uYW1lXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBzaG93X3Rha2VfcGhvdG8uaXNfc2hvdyA9IGZhbHNlO1xuICAgICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBzaG93X3Rha2VfcGhvdG8uaXNfc2hvdyA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHNob3dfdGFrZV9waG90by5pc19zaG93ID0gZmFsc2U7XG4gIH0pXG5cbiAgLmNvbnRyb2xsZXIoJ0l0ZW1JbnB1dERldGFpbEN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRsb2csICRtb2RhbEluc3RhbmNlLCBpdGVtX2RldGFpbCkge1xuICAgIHZhciB2bSA9ICRzY29wZTtcblxuICAgIGFuZ3VsYXIuZXh0ZW5kKHZtLCBpdGVtX2RldGFpbCk7XG5cbiAgICB2bS5zdWJtaXQgPSBzdWJtaXQ7XG4gICAgdm0uY2FuY2VsID0gY2FuY2VsO1xuICAgIHZtLnRha2VfcGhvdG8gPSB0YWtlX3Bob3RvO1xuXG4gICAgZnVuY3Rpb24gc3VibWl0KCkge1xuICAgICAgJG1vZGFsSW5zdGFuY2UuY2xvc2Uoe1xuICAgICAgICBzdGF0ZTogdm0uc3RhdGUsXG4gICAgICAgIGRlZ3JlZTogdm0uZGVncmVlLFxuICAgICAgICBtZW1vOiB2bS5tZW1vLFxuICAgICAgICBpbWFnZTogdm0uaW1hZ2VcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNhbmNlbCgpIHtcbiAgICAgICRtb2RhbEluc3RhbmNlLmRpc21pc3MoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0YWtlX3Bob3RvKCkge1xuICAgICAgbmF2aWdhdG9yLmNhbWVyYS5nZXRQaWN0dXJlKHRha2VfcGhvdG9fc3VjY2VzcywgdGFrZV9waG90b19lcnJvciwge1xuICAgICAgICBxdWFsaXR5IDogMTAwLFxuICAgICAgICBkZXN0aW5hdGlvblR5cGUgOiBDYW1lcmEuRGVzdGluYXRpb25UeXBlLkZJTEVfVVJJLFxuICAgICAgICBzb3VyY2VUeXBlIDogQ2FtZXJhLlBpY3R1cmVTb3VyY2VUeXBlLkNBTUVSQSxcbiAgICAgICAgYWxsb3dFZGl0IDogdHJ1ZSxcbiAgICAgICAgZW5jb2RpbmdUeXBlOiBDYW1lcmEuRW5jb2RpbmdUeXBlLlBORyxcbiAgICAgICAgLy8gdGFyZ2V0V2lkdGg6IDEwMCxcbiAgICAgICAgLy8gdGFyZ2V0SGVpZ2h0OiAxMDAsXG4gICAgICAgIHNhdmVUb1Bob3RvQWxidW06IGZhbHNlXG4gICAgICB9KTtcblxuICAgICAgZnVuY3Rpb24gdGFrZV9waG90b19zdWNjZXNzKGltZ3VybCkge1xuICAgICAgICB2bS5pbWFnZSA9IGltZ3VybDtcbiAgICAgICAgdm0uJGFwcGx5KCk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHRha2VfcGhvdG9fZXJyb3IoKSB7XG4gICAgICAgICRsb2cuZXJyb3IoJ+aLjeeFp+Wksei0pSwg5YiG57G7IC0gJyArIGl0ZW1fZGV0YWlsLnBhcnRfbmFtZSArICcsIOmhuSAtICcgKyBpdGVtX2RldGFpbC5uYW1lKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cbiAgLmNvbnRyb2xsZXIoJ0l0ZW1UYWtlUGhvdG9DdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkbG9nLCAkbW9kYWxJbnN0YW5jZSwgaXRlbV9kZXRhaWwpIHtcbiAgICAgIHZhciB2bSA9ICRzY29wZTtcblxuICAgICAgYW5ndWxhci5leHRlbmQodm0sIGl0ZW1fZGV0YWlsKTtcblxuICAgICAgdm0uc3VibWl0ID0gc3VibWl0O1xuICAgICAgdm0uY2FuY2VsID0gY2FuY2VsO1xuICAgICAgdm0udGFrZV9waG90byA9IHRha2VfcGhvdG87XG5cbiAgICAgIGZ1bmN0aW9uIHN1Ym1pdCgpIHtcbiAgICAgICAgJG1vZGFsSW5zdGFuY2UuY2xvc2Uoe1xuICAgICAgICAgIGltYWdlOiB2bS5pbWFnZVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gY2FuY2VsKCkge1xuICAgICAgICAkbW9kYWxJbnN0YW5jZS5kaXNtaXNzKCk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHRha2VfcGhvdG8oKSB7XG4gICAgICAgIG5hdmlnYXRvci5jYW1lcmEuZ2V0UGljdHVyZSh0YWtlX3Bob3RvX3N1Y2Nlc3MsIHRha2VfcGhvdG9fZXJyb3IsIHtcbiAgICAgICAgICBxdWFsaXR5IDogMTAwLFxuICAgICAgICAgIGRlc3RpbmF0aW9uVHlwZSA6IENhbWVyYS5EZXN0aW5hdGlvblR5cGUuRklMRV9VUkksXG4gICAgICAgICAgc291cmNlVHlwZSA6IENhbWVyYS5QaWN0dXJlU291cmNlVHlwZS5DQU1FUkEsXG4gICAgICAgICAgYWxsb3dFZGl0IDogdHJ1ZSxcbiAgICAgICAgICBlbmNvZGluZ1R5cGU6IENhbWVyYS5FbmNvZGluZ1R5cGUuUE5HLFxuICAgICAgICAgIC8vIHRhcmdldFdpZHRoOiAxMDAsXG4gICAgICAgICAgLy8gdGFyZ2V0SGVpZ2h0OiAxMDAsXG4gICAgICAgICAgc2F2ZVRvUGhvdG9BbGJ1bTogZmFsc2VcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZnVuY3Rpb24gdGFrZV9waG90b19zdWNjZXNzKGltZ3VybCkge1xuICAgICAgICAgIHZtLmltYWdlID0gaW1ndXJsO1xuICAgICAgICAgIHZtLiRhcHBseSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gdGFrZV9waG90b19lcnJvcigpIHtcbiAgICAgICAgICAkbG9nLmVycm9yKCfmi43nhaflpLHotKUsIOWIhuexuyAtICcgKyBpdGVtX2RldGFpbC5wYXJ0X25hbWUgKyAnLCDpobkgLSAnICsgaXRlbV9kZXRhaWwubmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuXG4gIC5jb250cm9sbGVyKCdSZXBvcnRMaXN0Q3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJGxvY2F0aW9uLCBSZXBvcnRzU3ZjLCBJbmRlbnRFbnVtcywgdG9hc3RyKSB7XG4gICAgdmFyIHZtID0gJHNjb3BlO1xuICAgIHZhciBxc28gPSAkbG9jYXRpb24uc2VhcmNoKCk7XG5cbiAgICB2bS5wYWdlID0gcGFyc2VJbnQocXNvLnBhZ2UpIHx8IDE7XG4gICAgdm0uc2l6ZSA9IHBhcnNlSW50KHFzby5zaXplKSB8fCAyMDtcbiAgICB2bS5zaXplcyA9IEluZGVudEVudW1zLmxpc3QoJ3NpemUnKTtcbiAgICB2bS5zaXplX2l0ZW0gPSBJbmRlbnRFbnVtcy5pdGVtKCdzaXplJywgdm0uc2l6ZSk7XG5cbiAgICB2bS5zaXplX2NoYW5nZSA9IHNpemVfY2hhbmdlO1xuICAgIHZtLnBhZ2VfY2hhbmdlID0gcGFnZV9jaGFuZ2U7XG5cbiAgICBxdWVyeSgpO1xuXG4gICAgZnVuY3Rpb24gcXVlcnkoKSB7XG4gICAgICB2YXIgcGFyYW1zID0ge1xuICAgICAgICBpdGVtc19wYWdlOiB2bS5zaXplLFxuICAgICAgICBwYWdlOiB2bS5wYWdlLFxuICAgICAgfTtcbiAgICAgIFxuICAgICAgJGxvY2F0aW9uLnNlYXJjaChwYXJhbXMpO1xuXG4gICAgICBSZXBvcnRzU3ZjXG4gICAgICAgIC5xdWVyeShwYXJhbXMpXG4gICAgICAgIC4kcHJvbWlzZVxuICAgICAgICAudGhlbihmdW5jdGlvbihycykge1xuICAgICAgICAgIHJzLml0ZW1zLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgaXRlbS5zdGF0dXNfdGV4dCA9IEluZGVudEVudW1zLnRleHQoJ29yZGVyX3N0YXR1cycsIGl0ZW0uc3RhdHVzX2lkKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHZtLml0ZW1zID0gcnMuaXRlbXM7XG4gICAgICAgICAgdm0udG90YWxfY291bnQgPSBycy50b3RhbF9jb3VudDtcblxuICAgICAgICAgIHZhciB0bXAgPSBycy50b3RhbF9jb3VudCAvIHZtLnNpemU7XG4gICAgICAgICAgdm0ucGFnZV9jb3VudCA9IHJzLnRvdGFsX2NvdW50ICUgdm0uc2l6ZSA9PT0gMCA/IHRtcCA6IChNYXRoLmZsb29yKHRtcCkgKyAxKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIHRvYXN0ci5lcnJvcihyZXMubXNnIHx8ICfmn6Xor6LlpLHotKXvvIzmnI3liqHlmajlj5HnlJ/mnKrnn6XplJnor6/vvIzor7fph43or5UnKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8g5q+P6aG15p2h5pWw5pS55Y+YXG4gICAgZnVuY3Rpb24gc2l6ZV9jaGFuZ2Uoc2l6ZSkge1xuICAgICAgdm0uc2l6ZSA9IHNpemU7XG4gICAgICB2bS5wYWdlID0gMTtcblxuICAgICAgcXVlcnkoKTtcbiAgICB9XG5cbiAgICAvLyDnv7vpobVcbiAgICBmdW5jdGlvbiBwYWdlX2NoYW5nZShwYWdlKSB7XG4gICAgICB2bS5wYWdlID0gcGFnZTtcblxuICAgICAgcXVlcnkoKTtcbiAgICB9XG4gIH0pO1xuXG5cblxuXG5cbiIsImFuZ3VsYXJcbiAgLm1vZHVsZSgnZ3VsdS5yZXBvcnQuc3ZjcycsIFsnbmdSZXNvdXJjZSddKVxuXG4gIC5zZXJ2aWNlKCdSZXBvcnRzU3ZjJywgZnVuY3Rpb24oJHJlc291cmNlKSB7XG4gICAgcmV0dXJuICRyZXNvdXJjZShBUElfU0VSVkVSUy50ZXN0ZXIgKyAnL3JlcG9ydHMnLCB7fSwge1xuICAgICAgcXVlcnk6IHtcbiAgICAgICAgaXNBcnJheTogZmFsc2VcbiAgICAgIH1cbiAgICB9KTtcbiAgfSlcblxuICAuc2VydmljZSgnUmVwb3J0U3ZjJywgZnVuY3Rpb24oJHJlc291cmNlKSB7XG4gICAgcmV0dXJuICRyZXNvdXJjZShBUElfU0VSVkVSUy50ZXN0ZXIgKyAnL3JlcG9ydCcpO1xuICB9KTsiLCJhbmd1bGFyXG4gIC5tb2R1bGUoJ2d1bHUuaW5kZW50LmVudW1zJywgWyd1dGlsLmVudW1zJywgXSlcblxuLmZhY3RvcnkoJ0luZGVudEVudW1zJywgZnVuY3Rpb24oRW51bXMsIEluZGVudEVudW1zU3ZjLCB0b2FzdHIpIHtcbiAgcmV0dXJuIEluZGVudEVudW1zU3ZjXG4gICAgICAuZ2V0KClcbiAgICAgIC4kcHJvbWlzZVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgIHZhciBhbGxfcHJlaW5zID0gJ29yZGVyX3R5cGUgb3JkZXJfc3RhdHVzIGNpdHkgaW5zcGVjdG9yIHVzZXJfdHlwZSBvcmRlcl90aHJvdWdoJy5zcGxpdCgnICcpO1xuXG4gICAgICAgIGFsbF9wcmVpbnMuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgICByZXNba2V5XS51bnNoaWZ0KHtcbiAgICAgICAgICAgIHRleHQ6ICflhajpg6gnLFxuICAgICAgICAgICAgdmFsdWU6IG51bGxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmVzWydzaXplJ10gPSBbe1xuICAgICAgICAgIHRleHQ6IDEwLFxuICAgICAgICAgIHZhbHVlOiAxMFxuICAgICAgICB9LCB7XG4gICAgICAgICAgdGV4dDogMTUsXG4gICAgICAgICAgdmFsdWU6IDE1XG4gICAgICAgIH0sIHtcbiAgICAgICAgICB0ZXh0OiAyMCxcbiAgICAgICAgICB2YWx1ZTogMjBcbiAgICAgICAgfSwge1xuICAgICAgICAgIHRleHQ6IDUwLFxuICAgICAgICAgIHZhbHVlOiA1MFxuICAgICAgICB9LCB7XG4gICAgICAgICAgdGV4dDogMTAwLFxuICAgICAgICAgIHZhbHVlOiAxMDBcbiAgICAgICAgfV07XG5cbiAgICAgICAgcmV0dXJuIEVudW1zKHJlcy50b0pTT04oKSk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICB0b2FzdHIuZXJyb3IocmVzLm1zZyB8fCAn6I635Y+W5p6a5Li+5aSx6LSlJyk7XG4gICAgICB9KTtcbn0pO1xuIiwiYW5ndWxhclxuICAubW9kdWxlKCdndWx1LmluZGVudC5zdmNzJywgWyduZ1Jlc291cmNlJ10pXG5cbiAgLnNlcnZpY2UoJ0luZGVudEVudW1zU3ZjJywgZnVuY3Rpb24oJHJlc291cmNlKSB7XG4gICAgcmV0dXJuICRyZXNvdXJjZShBUElfU0VSVkVSUy50ZXN0ZXIgKyAnL3BhcmFtZXRlcnMnKTtcbiAgfSlcbiAgXG4gIC5zZXJ2aWNlKCdJbmRlbnRzU3ZjJywgZnVuY3Rpb24oJHJlc291cmNlKSB7XG4gICAgcmV0dXJuICRyZXNvdXJjZShBUElfU0VSVkVSUy50ZXN0ZXIgKyAnL29yZGVycycsIHt9LCB7XG4gICAgICBxdWVyeToge1xuICAgICAgICBpc0FycmF5OiBmYWxzZVxuICAgICAgfVxuICAgIH0pO1xuICB9KVxuXG4gIC5zZXJ2aWNlKCdJbmRlbnRTdmMnLCBmdW5jdGlvbigkcmVzb3VyY2UpIHtcbiAgICByZXR1cm4gJHJlc291cmNlKEFQSV9TRVJWRVJTLnRlc3RlciArICcvb3JkZXIvOmlkJywge1xuICAgICAgaWQ6ICdAaWQnXG4gICAgfSwge1xuICAgICAgdXBkYXRlOiB7XG4gICAgICAgIG1ldGhvZDogJ1BVVCdcbiAgICAgIH1cbiAgICB9KTtcbiAgfSlcblxuICAuc2VydmljZSgnSW5kZW50QWNjZXB0U3ZjJywgZnVuY3Rpb24oJHJlc291cmNlKSB7XG4gICAgcmV0dXJuICRyZXNvdXJjZShBUElfU0VSVkVSUy50ZXN0ZXIgKyAnL29yZGVyLzppZC9pbnNwZWN0b3JfYWNjZXB0ZWQnLCB7XG4gICAgICBpZDogJ0BpZCdcbiAgICB9LCB7XG4gICAgICB1cGRhdGU6IHtcbiAgICAgICAgbWV0aG9kOiAnUFVUJ1xuICAgICAgfVxuICAgIH0pO1xuICB9KVxuXG4gIC5zZXJ2aWNlKCdJbmRlbnRSZXZva2VSZXF1ZXN0U3ZjJywgZnVuY3Rpb24oJHJlc291cmNlKSB7XG4gICAgcmV0dXJuICRyZXNvdXJjZShBUElfU0VSVkVSUy50ZXN0ZXIgKyAnL29yZGVyLzppZC9yZXZva2VfcmVxdWVzdGVkJywge1xuICAgICAgaWQ6ICdAaWQnXG4gICAgfSwge1xuICAgICAgdXBkYXRlOiB7XG4gICAgICAgIG1ldGhvZDogJ1BVVCdcbiAgICAgIH1cbiAgICB9KTtcbiAgfSlcblxuICAuc2VydmljZSgnVGVzdGVyc1N2YycsIGZ1bmN0aW9uKCRyZXNvdXJjZSkge1xuICAgIHJldHVybiAkcmVzb3VyY2UoQVBJX1NFUlZFUlMudGVzdGVyICsgJy90ZXN0ZXJzJywge30sIHtcbiAgICAgIHF1ZXJ5OiB7XG4gICAgICAgIGlzQXJyYXk6IGZhbHNlXG4gICAgICB9XG4gICAgfSk7XG4gIH0pXG5cbiAgLnNlcnZpY2UoJ1VudGVzdGVkSW5kZW50c1N2YycsIGZ1bmN0aW9uKCRyZXNvdXJjZSkge1xuICAgIHJldHVybiAkcmVzb3VyY2UoQVBJX1NFUlZFUlMudGVzdGVyICsgJy9vcmRlcnMvaW5zcGVjdG9yX3Rhc2tfdG9kYXknKTtcbiAgfSlcblxuICAuc2VydmljZSgnSW5kZW50Q2Fyc1N2YycsIGZ1bmN0aW9uKCRyZXNvdXJjZSkge1xuICAgIHJldHVybiAkcmVzb3VyY2UoQVBJX1NFUlZFUlMudGVzdGVyICsgJy9vcmRlci86b3JkZXJfaWQvY2FyJywge1xuICAgICAgb3JkZXJfaWQ6ICdAb3JkZXJfaWQnXG4gICAgfSlcbiAgfSlcblxuICAuc2VydmljZSgnSW5kZW50Q2FyU3ZjJywgZnVuY3Rpb24oJHJlc291cmNlKSB7XG4gICAgcmV0dXJuICRyZXNvdXJjZShBUElfU0VSVkVSUy50ZXN0ZXIgKyAnL29yZGVyLzpvcmRlcl9pZC9jYXIvOmNhcl9pZCcsIHtcbiAgICAgIG9yZGVyX2lkOiAnQG9yZGVyX2lkJyxcbiAgICAgIGNhcl9pZDogJ0BjYXJfaWQnXG4gICAgfSwge1xuICAgICAgdXBkYXRlOiB7XG4gICAgICAgIG1ldGhvZDogJ1BVVCdcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7IiwiLyogZ2xvYmFsIGFuZ3VsYXIsIGNvbmZpcm0sIF8gKi9cbmFuZ3VsYXJcbiAgLm1vZHVsZSgnZ3VsdS5pbmRlbnQnKVxuICBcbiAgLmNvbnRyb2xsZXIoJ0luZGVudExpc3RDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkbG9jYXRpb24sIHRvYXN0ciwgJG1vZGFsLFxuICAgIEluZGVudHNTdmMsIEluZGVudFN2YywgSW5kZW50QWNjZXB0U3ZjLCBJbmRlbnRFbnVtcykge1xuICAgIHZhciB2bSA9ICRzY29wZTtcbiAgICB2YXIgcXNvID0gJGxvY2F0aW9uLnNlYXJjaCgpO1xuXG4gICAgdm0uc3RhdHVzX2lkID0gcGFyc2VJbnQocXNvLnN0YXR1c19pZCkgfHwgbnVsbDtcbiAgICBcbiAgICBpZiAodm0uJHN0YXRlLmluY2x1ZGVzKCdpbmRlbnRzLnVuY29uZmlybWVkJykpIHtcbiAgICAgIHZtLnN0YXR1c19pZCA9IDQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZtLmNpdHlfaWQgPSBwYXJzZUludChxc28uY2l0eV9pZCkgfHwgbnVsbDtcbiAgICAgIHZtLmluc3BlY3Rvcl9pZCA9IHBhcnNlSW50KHFzby5pbnNwZWN0b3JfaWQpIHx8IG51bGw7XG4gICAgICAvLyB2bS5yb2xlX2lkID0gcGFyc2VJbnQocXNvLnJvbGVfaWQpIHx8IG51bGw7XG4gICAgICB2bS5yZXF1ZXN0ZXJfbW9iaWxlID0gcXNvLnJlcXVlc3Rlcl9tb2JpbGUgfHwgbnVsbDtcblxuICAgICAgdm0uc3RhdHVzID0gSW5kZW50RW51bXMuaXRlbSgnb3JkZXJfc3RhdHVzJywgdm0uc3RhdHVzX2lkKTtcbiAgICAgIHZtLnN0YXR1c19saXN0ID0gSW5kZW50RW51bXMubGlzdCgnb3JkZXJfc3RhdHVzJyk7XG4gICAgICB2bS5jaXR5ID0gSW5kZW50RW51bXMuaXRlbSgnY2l0eScsIHZtLmNpdHlfaWQpO1xuICAgICAgdm0uY2l0eV9saXN0ID0gSW5kZW50RW51bXMubGlzdCgnY2l0eScpO1xuICAgICAgLy8gdm0ucm9sZSA9IEluZGVudEVudW1zLml0ZW0oJ3JvbGUnLCB2bS5yb2xlX2lkKTtcbiAgICAgIC8vIHZtLnJvbGVfbGlzdCA9IEluZGVudEVudW1zLmxpc3QoJ3JvbGUnKTtcbiAgICAgIHZtLmluc3BlY3RvciA9IEluZGVudEVudW1zLml0ZW0oJ2luc3BlY3RvcicsIHZtLmluc3BlY3Rvcl9pZCk7XG4gICAgICB2bS5pbnNwZWN0b3JfbGlzdCA9IEluZGVudEVudW1zLmxpc3QoJ2luc3BlY3RvcicpO1xuXG4gICAgICB3YXRjaF9saXN0KCdzdGF0dXMnLCAnc3RhdHVzX2lkJyk7XG4gICAgICB3YXRjaF9saXN0KCdjaXR5JywgJ2NpdHlfaWQnKTtcbiAgICAgIC8vIHdhdGNoX2xpc3QoJ3JvbGUnLCAncm9sZV9pZCcpO1xuICAgICAgd2F0Y2hfbGlzdCgnaW5zcGVjdG9yJywgJ2luc3BlY3Rvcl9pZCcpO1xuXG4gICAgICB2bS5zZWFyY2ggPSBzZWFyY2g7XG4gICAgfVxuXG4gICAgdm0ucGFnZSA9IHBhcnNlSW50KHFzby5wYWdlKSB8fCAxO1xuICAgIHZtLnNpemUgPSBwYXJzZUludChxc28uc2l6ZSkgfHwgMjA7XG4gICAgdm0uc2l6ZXMgPSBJbmRlbnRFbnVtcy5saXN0KCdzaXplJyk7XG4gICAgdm0uc2l6ZV9pdGVtID0gSW5kZW50RW51bXMuaXRlbSgnc2l6ZScsIHZtLnNpemUpO1xuXG4gICAgdm0uc2l6ZV9jaGFuZ2UgPSBzaXplX2NoYW5nZTtcbiAgICB2bS5wYWdlX2NoYW5nZSA9IHBhZ2VfY2hhbmdlO1xuICAgIHZtLmNhbmNlbF9vcmRlciA9IGNhbmNlbF9vcmRlcjtcbiAgICB2bS5jb25maXJtX29yZGVyID0gY29uZmlybV9vcmRlcjtcblxuICAgIHF1ZXJ5KCk7XG5cbiAgICBmdW5jdGlvbiBxdWVyeSgpIHtcbiAgICAgIHZhciBwYXJhbXMgPSB7XG4gICAgICAgIGNpdHlfaWQ6IHZtLmNpdHlfaWQsXG4gICAgICAgIGl0ZW1zX3BhZ2U6IHZtLnNpemUsXG4gICAgICAgIHBhZ2U6IHZtLnBhZ2UsXG5cbiAgICAgICAgc3RhdHVzX2lkOiB2bS5zdGF0dXNfaWRcbiAgICAgIH07XG5cbiAgICAgIGlmICh2bS4kc3RhdGUuaW5jbHVkZXMoJ2luZGVudHMubGlzdCcpKSB7XG4gICAgICAgIGFuZ3VsYXIuZXh0ZW5kKHBhcmFtcywge1xuICAgICAgICAgIGNpdHlfaWQ6IHZtLmNpdHlfaWQsXG4gICAgICAgICAgaW5zcGVjdG9yX2lkOiB2bS5pbnNwZWN0b3JfaWQsXG4gICAgICAgICAgLy8gcm9sZV9pZDogdm0ucm9sZV9pZCxcbiAgICAgICAgICByZXF1ZXN0ZXJfbW9iaWxlOiB2bS5yZXF1ZXN0ZXJfbW9iaWxlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgXG4gICAgICAkbG9jYXRpb24uc2VhcmNoKHBhcmFtcyk7XG5cbiAgICAgIEluZGVudHNTdmNcbiAgICAgICAgLnF1ZXJ5KHBhcmFtcylcbiAgICAgICAgLiRwcm9taXNlXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJzKSB7XG4gICAgICAgICAgcnMuaXRlbXMuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICBpdGVtLnN0YXR1c190ZXh0ID0gSW5kZW50RW51bXMudGV4dCgnb3JkZXJfc3RhdHVzJywgaXRlbS5zdGF0dXNfaWQpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgdm0uaXRlbXMgPSBycy5pdGVtcztcbiAgICAgICAgICB2bS50b3RhbF9jb3VudCA9IHJzLnRvdGFsX2NvdW50O1xuXG4gICAgICAgICAgdmFyIHRtcCA9IHJzLnRvdGFsX2NvdW50IC8gdm0uc2l6ZTtcbiAgICAgICAgICB2bS5wYWdlX2NvdW50ID0gcnMudG90YWxfY291bnQgJSB2bS5zaXplID09PSAwID8gdG1wIDogKE1hdGguZmxvb3IodG1wKSArIDEpO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgdG9hc3RyLmVycm9yKHJlcy5kYXRhLm1zZyB8fCAn5p+l6K+i5aSx6LSl77yM5pyN5Yqh5Zmo5Y+R55Sf5pyq55+l6ZSZ6K+v77yM6K+36YeN6K+VJyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHdhdGNoX2xpc3QobmFtZSwgZmllbGQpIHtcbiAgICAgIHZtLiR3YXRjaChuYW1lLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIGlmICghaXRlbSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZtW2ZpZWxkXSA9IGl0ZW0udmFsdWU7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyDnoa7orqTorqLljZVcbiAgICBmdW5jdGlvbiBjb25maXJtX29yZGVyKGl0ZW0pIHtcbiAgICAgIGlmIChjb25maXJtKCfnoa7orqTmjqXlj5for6XorqLljZU/JykpIHtcbiAgICAgICAgSW5kZW50QWNjZXB0U3ZjXG4gICAgICAgICAgLnVwZGF0ZSh7XG4gICAgICAgICAgICBpZDogaXRlbS5pZFxuICAgICAgICAgIH0pXG4gICAgICAgICAgLiRwcm9taXNlXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICB0b2FzdHIuc3VjY2VzcyhyZXMubXNnIHx8ICfnoa7orqTorqLljZXmiJDlip8nKTtcblxuICAgICAgICAgICAgcXVlcnkoKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5jYXRjaChmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgIHRvYXN0ci5lcnJvcihyZXMubXNnIHx8ICfnoa7orqTorqLljZXlpLHotKXvvIzor7fph43or5UnKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDlj5bmtojorqLljZVcbiAgICBmdW5jdGlvbiBjYW5jZWxfb3JkZXIoaXRlbSkge1xuICAgICAgdmFyIGNhbmNlbF9vcmRlcl9pbnMgPSAkbW9kYWwub3Blbih7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnaW5kZW50L2NhbmNlbF9vcmRlci5odG0nLFxuICAgICAgICBjb250cm9sbGVyOiAnQ2FuY2VsT3JkZXJDdHJsJyxcbiAgICAgICAgYmFja2Ryb3A6ICdzdGF0aWMnLFxuICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgaW5kZW50X2luZm86IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgY2FuY2VsX29yZGVyX2lucy5yZXN1bHQudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gVE9ETzpcbiAgICAgICAgLy8g5pu05paw6aKE57qm5Y2V54q25oCBXG4gICAgICAgIHF1ZXJ5KCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyDmr4/pobXmnaHmlbDmlLnlj5hcbiAgICBmdW5jdGlvbiBzaXplX2NoYW5nZShzaXplKSB7XG4gICAgICB2bS5zaXplID0gc2l6ZTtcbiAgICAgIHZtLnBhZ2UgPSAxO1xuXG4gICAgICBxdWVyeSgpO1xuICAgIH1cblxuICAgIC8vIOe/u+mhtVxuICAgIGZ1bmN0aW9uIHBhZ2VfY2hhbmdlKHBhZ2UpIHtcbiAgICAgIHZtLnBhZ2UgPSBwYWdlO1xuXG4gICAgICBxdWVyeSgpO1xuICAgIH1cblxuICAgIC8vIOafpeivouaPkOS6pFxuICAgIGZ1bmN0aW9uIHNlYXJjaCgpIHtcbiAgICAgIHZtLnBhZ2UgPSAxO1xuXG4gICAgICBxdWVyeSgpO1xuICAgIH1cbiAgfSlcblxuICAuY29udHJvbGxlcignVW50ZXN0ZWRJbmRlbnRMaXN0Q3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJGxvZywgJGxvY2F0aW9uLCAkbW9kYWwsICR0ZW1wbGF0ZUNhY2hlLCB0b2FzdHIsXG4gICAgRmlsZXIsIFVwbG9hZGVyLCBLZXlNZ3IsIGxvY2FsU3RvcmFnZVNlcnZpY2UsIFVudGVzdGVkSW5kZW50c1N2YywgSW5kZW50RW51bXMsXG4gICAgSW5kZW50Q2FyU3ZjLCBSZXBvcnRTdmMpIHtcbiAgICB2YXIgdm0gPSAkc2NvcGU7XG4gICAgdmFyIHBhcnRzID0gSlNPTi5wYXJzZSgkdGVtcGxhdGVDYWNoZS5nZXQoJ3JlcG9ydC9pLmpzb24nKSk7XG5cbiAgICBpZiAocGFydHMgJiYgcGFydHMubGVuZ3RoKSB7XG4gICAgICB2bS5maXJzdF9wYXJ0X2lkID0gcGFydHNbMF0uaWQ7XG4gICAgfVxuXG4gICAgdm0uY2FuY2VsX29yZGVyID0gY2FuY2VsX29yZGVyO1xuICAgIHZtLmRlbF9jYXIgPSBkZWxfY2FyO1xuICAgIHZtLmVkaXRfY2FyID0gZWRpdF9jYXI7XG4gICAgdm0udXBsb2FkX3JlcG9ydCA9IHVwbG9hZF9yZXBvcnQ7XG4gICAgdm0uY2xlYXJfbG9jYWwgPSBjbGVhcl9sb2NhbDtcblxuICAgIHF1ZXJ5KCk7XG5cbiAgICBmdW5jdGlvbiBxdWVyeSgpIHtcbiAgICAgIHJldHVybiBVbnRlc3RlZEluZGVudHNTdmNcbiAgICAgICAgLnF1ZXJ5KClcbiAgICAgICAgLiRwcm9taXNlXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIHJlcy5mb3JFYWNoKGZ1bmN0aW9uKG9yZGVyKSB7XG4gICAgICAgICAgICBvcmRlci5hdXRvLmZvckVhY2goZnVuY3Rpb24oY2FyKSB7XG4gICAgICAgICAgICAgIHZhciByZXBvcnRfc3RhdHVzX2tleSA9IEtleU1nci5zdGF0dXMob3JkZXIuaWQsIGNhci5pZCk7XG4gICAgICAgICAgICAgIGNhci5yZXBvcnRfc3RhdHVzID0gbG9jYWxTdG9yYWdlU2VydmljZS5nZXQocmVwb3J0X3N0YXR1c19rZXkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICB2bS5pdGVtcyA9IHJlcztcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIHRvYXN0ci5lcnJvcihyZXMubXNnIHx8ICfojrflj5blvoXmo4DmtYvorqLljZXlpLHotKUnKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8g5Yqg6L2mIOaIliDnvJbovpHovaZcbiAgICBmdW5jdGlvbiBlZGl0X2NhcihpZCwgY2FyKSB7XG4gICAgICB2YXIgZWRpdF9jYXJfaW5zID0gJG1vZGFsLm9wZW4oe1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2luZGVudC9lZGl0X2Nhci5odG0nLFxuICAgICAgICBjb250cm9sbGVyOiAnSW5kZW50Q2FyRWRpdEN0cmwnLFxuICAgICAgICBiYWNrZHJvcDogJ3N0YXRpYycsXG4gICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICBJbmRlbnRFbnVtczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gSW5kZW50RW51bXM7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBpbmRlbnRfaW5mbzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBpZDogaWQsXG4gICAgICAgICAgICAgIGNhcjogY2FyXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGVkaXRfY2FyX2lucy5yZXN1bHQudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgcXVlcnkoKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIOWIoOmZpOi9plxuICAgIGZ1bmN0aW9uIGRlbF9jYXIob3JkZXJfaWQsIGNhcikge1xuICAgICAgaWYgKGNvbmZpcm0oJ+ehruiupOWIoOmZpCBcIicgKyBbY2FyLmJyYW5kLCBjYXIuc2VyaWVzLCBjYXIubW9kZWxdLmpvaW4oJy0nKSArICdcIicpKSB7XG4gICAgICAgIHJldHVybiBJbmRlbnRDYXJTdmNcbiAgICAgICAgICAucmVtb3ZlKHtcbiAgICAgICAgICAgIG9yZGVyX2lkOiBvcmRlcl9pZCxcbiAgICAgICAgICAgIGNhcl9pZDogY2FyLmlkXG4gICAgICAgICAgfSlcbiAgICAgICAgICAuJHByb21pc2VcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgIEtleU1nci5jbGVhcihvcmRlcl9pZCwgY2FyLmlkKTtcblxuICAgICAgICAgICAgdG9hc3RyLnN1Y2Nlc3MocmVzLm1zZyB8fCAn5Yig6Zmk6L2m5oiQ5YqfJyk7XG5cbiAgICAgICAgICAgIHF1ZXJ5KCk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICB0b2FzdHIuZXJyb3IocmVzLm1zZyB8fCAn5Yig6Zmk6L2m5aSx6LSl77yM6K+36YeN6K+VJyk7XG4gICAgICAgICAgfSk7ICBcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDmuIXpmaRsb2NhbFxuICAgIGZ1bmN0aW9uIGNsZWFyX2xvY2FsKG9yZGVyX2lkLCBjYXIpIHtcbiAgICAgIEtleU1nci5jbGVhcihvcmRlcl9pZCwgY2FyLmlkKTtcbiAgICAgIHRvYXN0ci5zdWNjZXNzKCfmuIXnkIbmnKzlnLDmlbDmja7lrozmiJAnKTtcbiAgICB9XG5cbiAgICAvLyDlj5bmtojorqLljZVcbiAgICBmdW5jdGlvbiBjYW5jZWxfb3JkZXIoaXRlbSkge1xuICAgICAgdmFyIGNhbmNlbF9vcmRlcl9pbnMgPSAkbW9kYWwub3Blbih7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnaW5kZW50L2NhbmNlbF9vcmRlci5odG0nLFxuICAgICAgICBjb250cm9sbGVyOiAnQ2FuY2VsT3JkZXJDdHJsJyxcbiAgICAgICAgYmFja2Ryb3A6ICdzdGF0aWMnLFxuICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgaW5kZW50X2luZm86IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgY2FuY2VsX29yZGVyX2lucy5yZXN1bHQudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgLy8g5Yig6Zmk5omA5pyJ5pys5Zyw5oql5ZGK55u45YWz5pWw5o2uXG4gICAgICAgIGl0ZW0uYXV0by5mb3JFYWNoKGZ1bmN0aW9uKGNhcikge1xuICAgICAgICAgIEtleU1nci5jbGVhcihpdGVtLmlkLCBjYXIuaWQpO1xuICAgICAgICB9KTtcblxuICAgICAgICBxdWVyeSgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8g5LiK5Lyg5oql5ZGKXG4gICAgZnVuY3Rpb24gdXBsb2FkX3JlcG9ydChvcmRlciwgY2FyKSB7XG4gICAgICB2YXIgb3JkZXJfaWQgPSBvcmRlci5pZDtcbiAgICAgIHZhciBjYXJfaWQgPSBjYXIuaWQ7XG5cbiAgICAgIHZhciByZXBvcnRfa2V5ID0gS2V5TWdyLnJlcG9ydChvcmRlcl9pZCwgY2FyX2lkKTtcbiAgICAgIHZhciByZXBvcnRfc3VibWl0X2tleSA9IEtleU1nci5zdWJtaXQocmVwb3J0X2tleSk7XG4gICAgICB2YXIgcmVwb3J0X2RhdGEgPSBsb2NhbFN0b3JhZ2VTZXJ2aWNlLmdldChyZXBvcnRfa2V5KTtcblxuICAgICAgJGxvZy5pbmZvKCflh4blpIfkuIrkvKDmiqXlkYo6ICcgKyByZXBvcnRfa2V5KTtcbiAgICAgICRsb2cuaW5mbygn5oql5ZGK5YiG57G75pWw5o2uOiAnICsgSlNPTi5zdHJpbmdpZnkocmVwb3J0X2RhdGEpKTtcblxuICAgICAgaWYgKCFyZXBvcnRfZGF0YSkge1xuICAgICAgICAkbG9nLmluZm8oJ+aKpeWRiuaVsOaNruS4uuepuu+8jOS4jeeUqOS4iuS8oCcpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNhci5yZXBvcnRfc3RhdHVzLnVwbG9hZF9zdGF0dXMgPSAwO1xuICAgICAgY2FyLnJlcG9ydF9zdGF0dXMudXBsb2FkaW5nID0gdHJ1ZTtcblxuICAgICAgdmFyIHN1Ym1pdF9kYXRhID0ge307XG5cbiAgICAgIE9iamVjdC5rZXlzKHJlcG9ydF9kYXRhKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgICAgICBhbmd1bGFyLmV4dGVuZChzdWJtaXRfZGF0YSwgcmVwb3J0X2RhdGFba2V5XSk7XG4gICAgICB9KTtcblxuICAgICAgJGxvZy5pbmZvKCfmiqXlkYrlvoXmj5DkuqTmlbDmja46ICcgKyBKU09OLnN0cmluZ2lmeShzdWJtaXRfZGF0YSkpO1xuXG4gICAgICB2YXIgaW1hZ2VfZmllbGRzID0ge307XG4gICAgICBPYmplY3Qua2V5cyhzdWJtaXRfZGF0YSkuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgaWYgKHN1Ym1pdF9kYXRhW2tleV0uaW1hZ2UpIHtcbiAgICAgICAgICBpbWFnZV9maWVsZHNba2V5XSA9IGFuZ3VsYXIuZXh0ZW5kKHtcbiAgICAgICAgICAgIHVybDogc3VibWl0X2RhdGFba2V5XS5pbWFnZVxuICAgICAgICAgIH0sIHN1Ym1pdF9kYXRhW2tleV0pO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgdmFyIGltYWdlcyA9IF8udmFsdWVzKGltYWdlX2ZpZWxkcyk7XG5cbiAgICAgIC8vIOayoeacieWbvueJh+mcgOimgeS4iuS8oO+8jOebtOaOpeS4iuS8oOaKpeWRiuWGheWuuVxuICAgICAgaWYgKCFpbWFnZXMubGVuZ3RoKSB7XG4gICAgICAgIHN1Ym1pdF9yZXBvcnQoKTtcblxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgICRsb2cuaW5mbygn5oql5ZGK5Zu+54mH5pWw5o2uOiAnICsgSlNPTi5zdHJpbmdpZnkoaW1hZ2VfZmllbGRzKSk7XG4gICAgICAkbG9nLmluZm8oJ+W8gOWni+S4iuS8oOeFp+eJh+aVsOaNricpO1xuICAgICAgVXBsb2FkZXIuYmF0Y2goe1xuICAgICAgICB1cmw6ICdodHRwOi8vZi5pZmRpdS5jb20nLFxuICAgICAgICBhdHRhY2htZW50czogaW1hZ2VzLFxuICAgICAgICBkb25lOiB1cGxvYWRfZG9uZSxcbiAgICAgICAgb25lOiB1cGxvYWRfb25lLFxuICAgICAgICBvbnByb2dyZXNzOiBvbnByb2dyZXNzLFxuICAgICAgICBlcnJvcjogdXBsb2FkX2Vycm9yXG4gICAgICB9KTtcblxuICAgICAgZnVuY3Rpb24gb25wcm9ncmVzcyhwcm9ncmVzcykge1xuICAgICAgICAvLyAxLiB1cGRhdGUgcHJvZ3Jlc3Mgc3RhdHVzIHRvIHBhZ2VcbiAgICAgICAgJGxvZy5pbmZvKCfkuIrkvKDov5vluqY6ICcgKyBwcm9ncmVzcy5wZXJjZW50KTtcbiAgICAgICAgY2FyLnJlcG9ydF9zdGF0dXMudXBsb2FkX3N0YXR1cyA9IHBhcnNlSW50KHByb2dyZXNzLnBlcmNlbnQgKiAwLjgpO1xuICAgICAgICB2bS4kYXBwbHkoKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gdXBsb2FkX29uZShpbWFnZSwgZmlsZSkge1xuICAgICAgICAvLyBZb3UgY2FuIGRvIHNvbWV0aGluZyBvbiBpbWFnZSB3aXRoIGZpbGUgb2JqZWN0XG4gICAgICAgIGltYWdlLmZpbGVfaWQgPSBmaWxlLmlkO1xuICAgICAgICAkbG9nLmluZm8oJ+aIkOWKn+S4iuS8oOWbvueJhzogJyArIEpTT04uc3RyaW5naWZ5KGltYWdlKSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHVwbG9hZF9lcnJvcihpbWFnZSkge1xuICAgICAgICAkbG9nLmluZm8oJ+S4iuS8oOWbvueJh+WHuumUmTogJyArIEpTT04uc3RyaW5naWZ5KGltYWdlKSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHVwbG9hZF9kb25lKCkge1xuICAgICAgICAvLyAxLiBjb21iaW5lIGltYWdlIGZpbGVpZCB0byBzdWJtaXRfZGF0YVxuICAgICAgICAvLyAyLiBzdG9yZSBpbWFnZSBkYXRhIHRvIGxvY2Fsc3RvcmFnZVxuICAgICAgICAvLyAzLiBzdWJtaXQgcmVwb3J0IGRhdGFcbiAgICAgICAgJGxvZy5pbmZvKCfmiJDlip/kuIrkvKDmiYDmnInlm77niYcnKTtcblxuICAgICAgICAvLyAxXG4gICAgICAgIGltYWdlcy5mb3JFYWNoKGZ1bmN0aW9uKGltYWdlKSB7XG4gICAgICAgICAgc3VibWl0X2RhdGFbaW1hZ2UuaWRdID0gaW1hZ2U7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICRsb2cuaW5mbygn5Zue5YaZ5Zu+54mH5pWw5o2u5YiwIGxvY2Fsc3RvcmFnZScpO1xuXG4gICAgICAgIC8vIDJcbiAgICAgICAgbG9jYWxTdG9yYWdlU2VydmljZS5zZXQocmVwb3J0X3N1Ym1pdF9rZXksIHN1Ym1pdF9kYXRhKTtcblxuICAgICAgICAvLyAzXG4gICAgICAgIHN1Ym1pdF9yZXBvcnQoKTtcbiAgICAgIH1cblxuICAgICAgLy8gMS4gc3VibWl0IHJlcG9ydCBkYXRhXG4gICAgICAvLyAyLiByZW1vdmUgaW1hZ2UgZnJvbSBjYWNoZVxuICAgICAgLy8gMy4gY2xlYXIgcmVwb3J0IGxvY2FsIGRhdGFcbiAgICAgIC8vIDQuIHVwZGF0ZSBvcmRlciBzdGF0dXMgXG4gICAgICBmdW5jdGlvbiBzdWJtaXRfcmVwb3J0KCkge1xuICAgICAgICAkbG9nLmluZm8oJ+W8gOWni+S4iuS8oOaKpeWRiuWGheWuuScpO1xuICAgICAgICAvLyAxXG4gICAgICAgIHJldHVybiBSZXBvcnRTdmNcbiAgICAgICAgICAuc2F2ZSh7XG4gICAgICAgICAgICBvcmRlcl9pZDogb3JkZXJfaWQsXG4gICAgICAgICAgICBjYXJfaWQ6IGNhcl9pZFxuICAgICAgICAgIH0sIHN1Ym1pdF9kYXRhKVxuICAgICAgICAgIC4kcHJvbWlzZVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJGxvZy5pbmZvKCfkuIrkvKDmiqXlkYrlhoXlrrnmiJDlip8nKTtcblxuICAgICAgICAgICAgLy8gMlxuICAgICAgICAgICAgaWYgKGltYWdlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgaW1hZ2VzLmZvckVhY2goZnVuY3Rpb24oaW1hZ2UpIHtcbiAgICAgICAgICAgICAgICBGaWxlci5yZW1vdmUoaW1hZ2UudXJsKTtcbiAgICAgICAgICAgICAgfSk7ICBcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gM1xuICAgICAgICAgICAgS2V5TWdyLmNsZWFyKG9yZGVyX2lkLCBjYXJfaWQpO1xuXG4gICAgICAgICAgICAvLyA0XG4gICAgICAgICAgICBjYXIucmVwb3J0X3N0YXR1cy51cGxvYWRfc3RhdHVzID0gMTAwO1xuICAgICAgICAgICAgY2FyLnJlcG9ydF9zdGF0dXMudXBsb2FkZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICAvLyBxdWVyeSgpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgJGxvZy5pbmZvKCfkuIrkvKDmiqXlkYrlhoXlrrnlpLHotKU6ICcgKyBKU09OLnN0cmluZ2lmeShhcmd1bWVudHMpKTtcbiAgICAgICAgICAgIHRvYXN0ci5lcnJvcihyZXMubXNnIHx8ICfkuIrkvKDov4fnqIvkuK3lj5HnlJ/plJnor6/vvIzor7fph43or5UnKTtcbiAgICAgICAgICAgIC8vIDRcbiAgICAgICAgICAgIGNhci5yZXBvcnRfc3RhdHVzLnVwbG9hZGluZyA9IGZhbHNlO1xuICAgICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfSlcbiAgXG4gIC8vIOWPlua2iOiuouWNlVxuICAuY29udHJvbGxlcignQ2FuY2VsT3JkZXJDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkbW9kYWxJbnN0YW5jZSwgdG9hc3RyLCBJbmRlbnRSZXZva2VSZXF1ZXN0U3ZjLCBpbmRlbnRfaW5mbykge1xuICAgIHZhciB2bSA9ICRzY29wZTtcblxuICAgIGFuZ3VsYXIuZXh0ZW5kKHZtLCBpbmRlbnRfaW5mbyk7XG5cbiAgICB2bS5jYW5jZWxfb3JkZXIgPSBjYW5jZWxfb3JkZXI7XG4gICAgdm0uY2FuY2VsID0gY2FuY2VsO1xuXG4gICAgZnVuY3Rpb24gY2FuY2VsX29yZGVyKCkge1xuICAgICAgdm0uY2FuY2VsX29yZGVyX3N0YXR1cyA9IHRydWU7XG5cbiAgICAgIEluZGVudFJldm9rZVJlcXVlc3RTdmNcbiAgICAgICAgLnVwZGF0ZSh7XG4gICAgICAgICAgaWQ6IGluZGVudF9pbmZvLmlkXG4gICAgICAgIH0sIHtcbiAgICAgICAgICBtZW1vOiB2bS5yZWFzb25cbiAgICAgICAgfSlcbiAgICAgICAgLiRwcm9taXNlXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIHRvYXN0ci5zdWNjZXNzKHJlcy5tc2cgfHwgJ+iuouWNleWPlua2iOaIkOWKnycpO1xuXG4gICAgICAgICAgJG1vZGFsSW5zdGFuY2UuY2xvc2UoKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIHZtLmNhbmNlbF9vcmRlcl9zdGF0dXMgPSBmYWxzZTtcblxuICAgICAgICAgIHRvYXN0ci5lcnJvcihyZXMubXNnIHx8ICforqLljZXlj5bmtojlpLHotKXvvIzor7fph43or5UnKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2FuY2VsKCkge1xuICAgICAgJG1vZGFsSW5zdGFuY2UuZGlzbWlzcygpO1xuICAgIH1cbiAgfSlcblxuICAvLyDliqDovaYg5oiWIOe8lui+kei9plxuICAuY29udHJvbGxlcignSW5kZW50Q2FyRWRpdEN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRtb2RhbEluc3RhbmNlLCB0b2FzdHIsIEluZGVudENhcnNTdmMsXG4gICAgSW5kZW50Q2FyU3ZjLCBJbmRlbnRFbnVtcywgaW5kZW50X2luZm8pIHtcbiAgICB2YXIgdm0gPSAkc2NvcGU7XG5cbiAgICB2bS5icmFuZF9saXN0ID0gSW5kZW50RW51bXMubGlzdCgnYnJhbmQnKTtcbiAgICB2bS5zZXJpZXNfbGlzdCA9IEluZGVudEVudW1zLmxpc3QoJ3NlcmllcycpO1xuICAgIHZtLm1vZGVsX2xpc3QgPSBJbmRlbnRFbnVtcy5saXN0KCdtb2RlbCcpO1xuXG4gICAgaWYgKGluZGVudF9pbmZvLmNhcikge1xuICAgICAgdm0udGl0bGUgPSAn57yW6L6R6L2m5L+h5oGvJztcblxuICAgICAgc2VsZWN0X2l0ZW0oJ2JyYW5kJywgaW5kZW50X2luZm8uY2FyLmJyYW5kKTtcbiAgICAgIHNlbGVjdF9pdGVtKCdzZXJpZXMnLCBpbmRlbnRfaW5mby5jYXIuc2VyaWVzKTtcbiAgICAgIHNlbGVjdF9pdGVtKCdtb2RlbCcsIGluZGVudF9pbmZvLmNhci5tb2RlbCk7ICBcbiAgICB9IGVsc2Uge1xuICAgICAgdm0udGl0bGUgPSAn5Yqg6L2mJztcbiAgICB9XG5cbiAgICB2bS5jYW5jZWwgPSBjYW5jZWw7XG4gICAgdm0uc3VibWl0ID0gc3VibWl0O1xuXG4gICAgZnVuY3Rpb24gc3VibWl0KCkge1xuICAgICAgaWYgKGluZGVudF9pbmZvLmNhcikge1xuICAgICAgICBJbmRlbnRDYXJTdmNcbiAgICAgICAgICAudXBkYXRlKHtcbiAgICAgICAgICAgIG9yZGVyX2lkOiBpbmRlbnRfaW5mby5pZCxcbiAgICAgICAgICAgIGNhcl9pZDogaW5kZW50X2luZm8uY2FyLmlkXG4gICAgICAgICAgfSwge1xuICAgICAgICAgICAgYnJhbmQ6IHZtLmJyYW5kLnZhbHVlLFxuICAgICAgICAgICAgc2VyaWVzOiB2bS5icmFuZC52YWx1ZSxcbiAgICAgICAgICAgIG1vZGVsOiB2bS5tb2RlbC52YWx1ZVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLiRwcm9taXNlXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICB0b2FzdHIuc3VjY2VzcyhyZXMubXNnIHx8ICfnvJbovpHovabovobkv6Hmga/kv53lrZjmiJDlip8nKTtcblxuICAgICAgICAgICAgJG1vZGFsSW5zdGFuY2UuY2xvc2UoKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5jYXRjaChmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgIHRvYXN0ci5lcnJvcihyZXMubXNnIHx8ICfnvJbovpHovabovobkv6Hmga/kv53lrZjlpLHotKUnKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIEluZGVudENhcnNTdmNcbiAgICAgICAgICAuc2F2ZSh7XG4gICAgICAgICAgICBvcmRlcl9pZDogaW5kZW50X2luZm8uaWRcbiAgICAgICAgICB9LCB7XG4gICAgICAgICAgICBicmFuZDogdm0uYnJhbmQudmFsdWUsXG4gICAgICAgICAgICBzZXJpZXM6IHZtLmJyYW5kLnZhbHVlLFxuICAgICAgICAgICAgbW9kZWw6IHZtLm1vZGVsLnZhbHVlXG4gICAgICAgICAgfSlcbiAgICAgICAgICAuJHByb21pc2VcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgIHRvYXN0ci5zdWNjZXNzKHJlcy5tc2cgfHwgJ+WKoOi9puS/oeaBr+S/neWtmOaIkOWKnycpO1xuXG4gICAgICAgICAgICAkbW9kYWxJbnN0YW5jZS5jbG9zZSgpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgdG9hc3RyLmVycm9yKHJlcy5tc2cgfHwgJ+WKoOi9puS/oeaBr+S/neWtmOWksei0pScpO1xuICAgICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNlbGVjdF9pdGVtKGxpc3RfbmFtZSwgdmFsdWUpIHtcbiAgICAgIHZtW2xpc3RfbmFtZV0gPSBJbmRlbnRFbnVtcy5pdGVtNHRleHQobGlzdF9uYW1lLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2FuY2VsKCkge1xuICAgICAgJG1vZGFsSW5zdGFuY2UuZGlzbWlzcygpO1xuICAgIH1cblxuICB9KTtcblxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9