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


/* global angular, Camera, _, FullScreenImage*/
angular
  .module('gulu.report')

  .controller('InputDashboardCtrl', ["$scope", "$stateParams", "$location", "$templateCache", "localStorageService", "KeyMgr", function($scope, $stateParams, $location, $templateCache, localStorageService, KeyMgr) {
    var vm = $scope;

    var indent_id = $stateParams.indent_id;
    var car_id = $stateParams.car_id;
    var report_status_key = KeyMgr.status(indent_id, car_id);

    vm.parts = JSON.parse($templateCache.get('report/i.json'));
    
    // 不用展示照片
    vm.photo_part = vm.parts.pop();
    
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

  .controller('PhotoReportEditCtrl', ["$scope", "$log", "$stateParams", "$templateCache", "localStorageService", "KeyMgr", function($scope, $log, $stateParams, $templateCache, localStorageService, KeyMgr) {
    var vm = $scope;

    var order_id = $stateParams.indent_id;
    var car_id = $stateParams.car_id;
    // 表单项数据存储到本地的 key 的生成规则
    var report_key = KeyMgr.report(order_id, car_id);
    var report_err_key = KeyMgr.err(report_key);
    var init_data = localStorageService.get(report_key);

    var part_json = JSON.parse($templateCache.get('report/i.json'));
    // 照片管理默认为最后一项
    var parent_part = part_json[part_json.length - 1];
    var current_part = parent_part.id;

    // 当前顶层分类本身临时存储空间
    vm.data = {};
    // 给当前顶层分类申请 local storage 存储空间
    init_data[current_part] = init_data[current_part] || {};
    // 将以前保存的结果取出，并写入临时存储空间
    angular.extend(vm.data, init_data[current_part]);
    // 当前的二级分类
    vm.parts = parent_part.children;

    if (vm.parts && vm.parts.length) {
      // 设置第一条默认展开
      vm.parts[0].is_open = true;

      // 初始化拍照项, 设置拍照项为本地照片或null
      vm.parts.forEach(function(part) {
        part.image.forEach(function(item) {
          vm.data[item.id] = vm.data[item.id] || { image: null };
        });
      });  
    }

    // 其他 part 临时存储空间
    vm.data_other = {};
    // 其他 part 以前保存在本地的数据
    var photo_of_group = localStorageService.get(report_err_key);
    // 格式化以前保存在本地的其他 part 数据，方便展示
    vm.part_photos = _.map(photo_of_group, function(item, key) {
      return {
        id: key,
        name: get_part_name(key),
        photos: item
      };
    });
    // 将以前保存在本地的结果取出，并写入临时存储空间
    _(photo_of_group).values().flatten().forEach(function(item) {
      vm.data_other[item.id] = item;
    });
    // 根据顶层分类 id 查找 顶层分类的 name
    function get_part_name(part_id) {
      return part_json.find(function(part) {
        return part.id == part_id;
      }).name;
    }

    // 拍照操作
    vm.take_photo = take_photo;
    // category 区分是当前顶层分类子项的拍照与其他顶层分类子项的拍照
    // self: 当前顶层分类的子项
    // other: 其他顶层分类的子项
    function take_photo(category, part, item) {
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
        // 当前顶层分类拍照
        if (category === 'self') {
          vm.data[item.id].image = imgurl;

          // 临时存储数据本地化到 localstorage
          // 方便下次进入 app 展示
          init_data[current_part] = vm.data;
        } else if (category === 'other') {
          // 其他顶层分类拍照
          vm.data_other[item.id].image = imgurl;

          // 这里的 part 是顶层分类
          var exists_item = photo_of_group[part.id].find(function(_item) {
            return _item.id === item.id;
          });

          // 本地化到照片总览 localstorage
          exists_item.image = imgurl;
          localStorageService.set(report_err_key, photo_of_group);
          
          // 本地化到报告 localstorage
          init_data[part.id][exists_item.id].image = imgurl;
        }

        localStorageService.set(report_key, init_data);
        // 手动触发页面渲染
        vm.$apply();
      }

      function take_photo_error() {
        $log.error('拍照失败, 分类 - ' + part.name + ', 项 - ' + item.name);
      }
    }

    vm.show_photo = show_photo;
    function show_photo(category, field) {
      FullScreenImage.showImageURL(vm[category === 'self' ? 'data' : 'data_other'][field.id].image);
    }
  }])

  .controller('ReportEditCtrl', ["$scope", "$log", "$stateParams", "$templateCache", "$modal", "localStorageService", "KeyMgr", function($scope, $log, $stateParams, $templateCache, $modal, localStorageService, KeyMgr) {
    var vm = $scope;

    var current_part = parseInt($stateParams.part_id);
    var order_id = $stateParams.indent_id;
    var car_id = $stateParams.car_id;

    // 表单项数据存储到本地的 key 的生成规则
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

      // 筛选出缺陷的项，或需要拍照的项
      _.each(vm.data, function(item, key) {
        if (item.image) {
          item.id = key;
          err_items.push(item);
        }
      });

      // 如果该 part 没有拍照
      if (!err_items.length) {
        return;
      }
      
      data[current_part] = err_items;

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
      var r = parseInt(vm.data[item.id].result);
      if (r !== 2 || r !== 5) {
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
      FullScreenImage.showImageURL(vm.data[field.id].image);
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
        vm.data[item.id] = angular.extend(vm.data[item.id] || {}, {
          image: imgurl,
          name: item.name
        });

        vm.$apply();
      }

      function take_photo_error() {
        $log.error('拍照失败, 分类 - ' + part.name + ', 项 - ' + item.name);
      }
    }

    // 日期控件显示/隐藏/禁用
    vm.dp_params = {
      showWeeks: false
    };
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
    vm.show_photo = show_photo;

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

    function show_photo(field) {
      FullScreenImage.showImageURL(vm.data[field.id].image);
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
      vm.show_photo = show_photo;

      function submit() {
        $modalInstance.close({
          image: vm.image
        });
      }

      function cancel() {
        $modalInstance.dismiss();
      }

      function show_photo(field) {
        FullScreenImage.showImageURL(vm.data[field.id].image);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImluZGVudC9pbmRlbnRfbW9kdWxlLmpzIiwicmVwb3J0L3JlcG9ydF9tb2R1bGUuanMiLCJsb2dpbi9sb2dpbl9tb2R1bGUuanMiLCJjb21wb25lbnQvY3VzdG9tLWRpcmVjdGl2ZS5qcyIsImNvbXBvbmVudC9jdXN0b20tZmlsdGVyLmpzIiwiY29tcG9uZW50L2RhdGUuanMiLCJjb21wb25lbnQvZW51bXMuanMiLCJjb21wb25lbnQvZmlsZXIuanMiLCJjb21wb25lbnQvaHR0cC5qcyIsImNvbXBvbmVudC9rZXltZ3IuanMiLCJjb21wb25lbnQvdXBsb2FkZXIuanMiLCJjb21wb25lbnQvdm0uanMiLCJjb21wb25lbnQvemgtY24uanMiLCI0MDQvNDA0X2N0cmwuanMiLCJpbmRlbnQvZW51bXMuanMiLCJpbmRlbnQvaW5kZW50X3N2Y3MuanMiLCJpbmRlbnQvbGlzdF9jdHJsLmpzIiwicmVwb3J0L2lucHV0X3JlcG9ydC5qcyIsInJlcG9ydC9yZXBvcnRfY3RybC5qcyIsInJlcG9ydC9yZXBvcnRfc3Zjcy5qcyIsImxvZ2luL2xvZ2luX2N0cmwuanMiLCJsb2dpbi9sb2dpbl9zdmNzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7QUFNQTtHQUNBLE9BQUEsUUFBQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7O0dBRUEsa0dBQUEsU0FBQSxtQkFBQSxvQkFBQSxjQUFBLDZCQUFBOzs7SUFHQTtPQUNBLFVBQUE7T0FDQSxXQUFBOzs7SUFHQTtPQUNBLFVBQUE7OztJQUdBLGFBQUEsYUFBQTs7O0lBR0E7T0FDQSxVQUFBO09BQ0EsVUFBQSxNQUFBOzs7SUFHQSxjQUFBO01BQ0EsUUFBQTs7OztJQUlBLFFBQUEsUUFBQSxVQUFBLEdBQUEsZUFBQSxXQUFBO01BQ0EsUUFBQSxRQUFBLFVBQUEsR0FBQSxjQUFBLFNBQUEsR0FBQTtRQUNBLEVBQUE7O1FBRUEsT0FBQTs7OztHQUlBLDBEQUFBLFNBQUEsWUFBQSxXQUFBLFFBQUEsY0FBQTtJQUNBLElBQUEsTUFBQTs7SUFFQSxXQUFBLFNBQUE7SUFDQSxXQUFBLGVBQUE7SUFDQSxXQUFBLGNBQUE7OztJQUdBO09BQ0EsT0FBQSxXQUFBO1FBQ0EsT0FBQSxVQUFBO1NBQ0EsU0FBQSxTQUFBLEtBQUE7UUFDQSxJQUFBLFFBQUEsUUFBQSxLQUFBLFFBQUEsSUFBQSxRQUFBLEtBQUEsS0FBQTtVQUNBOzs7UUFHQSxXQUFBLFVBQUE7OztJQUdBLFdBQUEsT0FBQSxXQUFBO01BQ0EsVUFBQSxJQUFBLFdBQUE7Ozs7O0FDL0VBO0dBQ0EsT0FBQSxlQUFBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBOztHQUVBLDBCQUFBLFNBQUEsZ0JBQUE7SUFDQTtPQUNBLE1BQUEsV0FBQTtRQUNBLFVBQUE7UUFDQSxLQUFBO1FBQ0EsYUFBQTtRQUNBLFNBQUE7VUFDQSxhQUFBOzs7T0FHQSxNQUFBLGdCQUFBO1FBQ0EsS0FBQTtRQUNBLGFBQUE7UUFDQSxZQUFBOztPQUVBLE1BQUEsdUJBQUE7UUFDQSxLQUFBO1FBQ0EsYUFBQTtRQUNBLFlBQUE7O09BRUEsTUFBQSxvQkFBQTtRQUNBLEtBQUE7UUFDQSxhQUFBO1FBQ0EsWUFBQTs7OztBQ2hDQTtHQUNBLE9BQUEsZUFBQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7O0dBRUEsMEJBQUEsU0FBQSxnQkFBQTtJQUNBO09BQ0EsTUFBQSx3QkFBQTtRQUNBLEtBQUE7UUFDQSxhQUFBO1FBQ0EsWUFBQTs7T0FFQSxNQUFBLDhCQUFBO1FBQ0EsS0FBQTtRQUNBLGFBQUE7UUFDQSxZQUFBOztPQUVBLE1BQUEsNkJBQUE7UUFDQSxLQUFBO1FBQ0EsYUFBQTtRQUNBLFlBQUE7O09BRUEsTUFBQSxtQkFBQTtRQUNBLEtBQUE7UUFDQSxhQUFBO1FBQ0EsWUFBQTs7OztBQzVCQTtHQUNBLE9BQUEsY0FBQTtJQUNBO0lBQ0E7OztHQUdBLDBCQUFBLFNBQUEsZ0JBQUE7SUFDQTtPQUNBLE1BQUEsU0FBQTtRQUNBLEtBQUE7UUFDQSxhQUFBO1FBQ0EsWUFBQTs7Ozs7O0FDVEE7R0FDQSxPQUFBLHFCQUFBO0dBQ0EsVUFBQSxnQ0FBQSxTQUFBLFVBQUE7SUFDQSxPQUFBO01BQ0EsVUFBQTtNQUNBLE1BQUEsU0FBQSxPQUFBLFNBQUEsWUFBQTtRQUNBLE1BQUEsT0FBQSxXQUFBLG9CQUFBLFNBQUEsT0FBQTtVQUNBLFFBQUEsS0FBQSxpQkFBQSxDQUFBLENBQUE7Ozs7OztBQ1RBO0dBQ0EsT0FBQSxnQkFBQTs7R0FFQSxPQUFBLFVBQUEsV0FBQTtJQUNBLE9BQUEsU0FBQSxHQUFBO01BQ0EsSUFBQSxLQUFBLE1BQUE7UUFDQSxPQUFBOzs7TUFHQSxJQUFBLEVBQUEsUUFBQSxZQUFBOztNQUVBLElBQUEsRUFBQSxTQUFBLEdBQUE7UUFDQSxPQUFBOzs7TUFHQSxJQUFBLEtBQUEsRUFBQSxNQUFBOztNQUVBLEdBQUEsT0FBQSxHQUFBLEdBQUE7O01BRUEsSUFBQSxFQUFBLFVBQUEsR0FBQTtRQUNBLEdBQUEsT0FBQSxHQUFBLEdBQUE7OztNQUdBLE9BQUEsR0FBQSxLQUFBOzs7O0FDdkJBO0dBQ0EsT0FBQSxhQUFBO0dBQ0EsUUFBQSxZQUFBLFlBQUE7SUFDQSxJQUFBLFdBQUEsVUFBQSxNQUFBLEdBQUE7TUFDQSxPQUFBLEtBQUEsZ0JBQUEsS0FBQSxLQUFBLGFBQUEsS0FBQSxJQUFBLEtBQUE7OztJQUdBLE9BQUE7TUFDQSxtQkFBQSxVQUFBLE1BQUE7UUFDQSxPQUFBLFNBQUEsTUFBQTs7O01BR0EsbUJBQUEsU0FBQSxNQUFBO1FBQ0EsSUFBQSxJQUFBLEtBQUE7UUFDQSxJQUFBLElBQUEsS0FBQTs7UUFFQSxJQUFBLElBQUEsSUFBQTtVQUNBLElBQUEsTUFBQTs7O1FBR0EsSUFBQSxJQUFBLElBQUE7VUFDQSxJQUFBLE1BQUE7OztRQUdBLE9BQUEsQ0FBQSxTQUFBLE1BQUEsTUFBQSxJQUFBLE1BQUEsR0FBQSxLQUFBOzs7OztBQ3ZCQTtHQUNBLE9BQUEsY0FBQTtHQUNBLFFBQUEsU0FBQSxZQUFBO0lBQ0EsT0FBQSxVQUFBLE9BQUE7TUFDQSxPQUFBO1FBQ0EsS0FBQSxVQUFBLE1BQUEsTUFBQTtVQUNBLE9BQUEsTUFBQSxNQUFBLEtBQUEsVUFBQSxNQUFBO1lBQ0EsT0FBQSxLQUFBLFNBQUE7YUFDQTs7UUFFQSxNQUFBLFVBQUEsTUFBQSxLQUFBO1VBQ0EsT0FBQSxNQUFBLE1BQUEsS0FBQSxVQUFBLE1BQUE7WUFDQSxPQUFBLEtBQUEsVUFBQTthQUNBOztRQUVBLE1BQUEsVUFBQSxNQUFBLEtBQUE7VUFDQSxPQUFBLE1BQUEsTUFBQSxLQUFBLFVBQUEsTUFBQTtZQUNBLE9BQUEsS0FBQSxVQUFBOzs7UUFHQSxXQUFBLFNBQUEsTUFBQSxNQUFBO1VBQ0EsT0FBQSxNQUFBLE1BQUEsS0FBQSxTQUFBLE1BQUE7WUFDQSxPQUFBLEtBQUEsU0FBQTs7O1FBR0EsTUFBQSxVQUFBLE1BQUE7VUFDQSxPQUFBLE1BQUE7O1FBRUEsT0FBQSxVQUFBLE1BQUEsTUFBQTtVQUNBLE9BQUEsTUFBQSxNQUFBLE9BQUEsVUFBQSxNQUFBO1lBQ0EsT0FBQSxLQUFBLFFBQUEsS0FBQSxXQUFBLENBQUE7Ozs7Ozs7QUM5QkE7R0FDQSxPQUFBLGNBQUE7R0FDQSxRQUFBLDZCQUFBLFNBQUEsU0FBQSxNQUFBO0lBQ0EsSUFBQSxRQUFBO0lBQ0EsTUFBQSxTQUFBLFNBQUEsS0FBQTtNQUNBLFFBQUEsMEJBQUEsS0FBQSxNQUFBLFdBQUEsTUFBQTs7O0lBR0EsTUFBQSxZQUFBLFNBQUEsV0FBQTtNQUNBLFVBQUEsT0FBQSxXQUFBO1FBQ0EsS0FBQSxLQUFBLGVBQUEsVUFBQTtTQUNBLFdBQUE7UUFDQSxLQUFBLEtBQUEsZUFBQSxVQUFBOzs7O0lBSUEsTUFBQSxVQUFBLFNBQUEsS0FBQTtNQUNBLEtBQUEsS0FBQSxlQUFBLEtBQUEsVUFBQSxJQUFBOzs7SUFHQSxPQUFBOztBQ3JCQTtHQUNBLE9BQUEsb0JBQUE7O0dBRUEseUJBQUEsU0FBQSxlQUFBO0lBQ0EsY0FBQSxhQUFBLEtBQUE7OztJQUdBLGNBQUEsU0FBQSxRQUFBLE9BQUEsc0JBQUE7SUFDQSxjQUFBLFNBQUEsUUFBQSxLQUFBLGtCQUFBO0lBQ0EsY0FBQSxTQUFBLG1CQUFBLENBQUEsU0FBQSxNQUFBO1FBQ0EsSUFBQSxNQUFBOztRQUVBLFFBQUEsUUFBQSxNQUFBLFNBQUEsT0FBQSxLQUFBO1VBQ0EsS0FBQSxLQUFBLG1CQUFBLE9BQUEsTUFBQSxtQkFBQTtXQUNBOztRQUVBLE9BQUEsSUFBQSxLQUFBOzs7O0dBSUEsUUFBQSxxREFBQSxTQUFBLElBQUEsWUFBQSxXQUFBO0lBQ0EsT0FBQTs7TUFFQSxXQUFBLFNBQUEsUUFBQTtRQUNBLE9BQUEsUUFBQSxnQkFBQSxPQUFBLGlCQUFBO1FBQ0EsT0FBQSxRQUFBLFlBQUEsT0FBQSxhQUFBOzs7UUFHQSxJQUFBLE9BQUEsSUFBQSxRQUFBLFlBQUEsQ0FBQSxLQUFBLE9BQUEsSUFBQSxRQUFBLFdBQUEsQ0FBQSxHQUFBO1VBQ0EsT0FBQTs7O1FBR0EsT0FBQSxNQUFBLE9BQUEsTUFBQSxRQUFBLElBQUEsT0FBQTs7UUFFQSxPQUFBOzs7O01BSUEsZ0JBQUEsU0FBQSxXQUFBO1FBQ0EsT0FBQSxHQUFBLE9BQUE7Ozs7Ozs7OztNQVNBLFlBQUEsU0FBQSxVQUFBOztRQUVBLElBQUEsTUFBQTs7UUFFQSxJQUFBLFFBQUEsU0FBQSxTQUFBLE9BQUE7VUFDQSxPQUFBLFNBQUEsS0FBQTtVQUNBLE9BQUEsU0FBQSxLQUFBOzs7OztVQUtBLElBQUEsU0FBQSxLQUFBO1lBQ0EsT0FBQSxHQUFBLE9BQUE7Ozs7OztVQU1BLElBQUEsUUFBQSxNQUFBO1lBQ0EsU0FBQSxPQUFBOzs7Ozs7Ozs7UUFTQSxPQUFBOzs7O01BSUEsaUJBQUEsU0FBQSxXQUFBO1FBQ0EsSUFBQSxlQUFBLFVBQUE7O1FBRUEsSUFBQSxVQUFBLFdBQUEsS0FBQTtVQUNBLFVBQUEsSUFBQTtVQUNBLFVBQUEsT0FBQSxZQUFBOzs7UUFHQSxPQUFBLEdBQUEsT0FBQTs7Ozs7QUN2RkE7R0FDQSxPQUFBLGVBQUE7R0FDQSxRQUFBLDBDQUFBLFNBQUEsTUFBQSxxQkFBQTtJQUNBLElBQUEsU0FBQTtNQUNBLGFBQUE7O01BRUEsUUFBQSxTQUFBLFVBQUEsUUFBQTtRQUNBLElBQUEsVUFBQSxXQUFBLEdBQUE7VUFDQSxNQUFBLElBQUEsTUFBQTs7O1FBR0EsT0FBQSxDQUFBLFVBQUEsUUFBQSxLQUFBLE9BQUE7OztNQUdBLFFBQUEsU0FBQSxLQUFBLFVBQUEsUUFBQTtRQUNBLElBQUEsVUFBQSxXQUFBLEdBQUE7VUFDQSxNQUFBLElBQUEsTUFBQSxZQUFBLE1BQUE7Ozs7UUFJQSxJQUFBLFVBQUEsV0FBQSxHQUFBO1VBQ0EsT0FBQSxDQUFBLFVBQUEsS0FBQSxLQUFBLE9BQUE7OztRQUdBLE9BQUEsQ0FBQSxVQUFBLFFBQUEsS0FBQSxLQUFBLE9BQUE7Ozs7SUFJQSxRQUFBLE9BQUEsUUFBQTtNQUNBLEtBQUEsT0FBQSxPQUFBLEtBQUEsUUFBQTs7TUFFQSxRQUFBLE9BQUEsT0FBQSxLQUFBLFFBQUE7O01BRUEsUUFBQSxPQUFBLE9BQUEsS0FBQSxRQUFBOztNQUVBLE9BQUEsU0FBQSxVQUFBLFFBQUE7UUFDQSxvQkFBQSxPQUFBLE9BQUEsT0FBQSxVQUFBO1FBQ0Esb0JBQUEsT0FBQSxPQUFBLE9BQUEsVUFBQTtRQUNBLG9CQUFBLE9BQUEsT0FBQSxPQUFBLFVBQUE7UUFDQSxvQkFBQSxPQUFBLE9BQUEsSUFBQSxVQUFBOzs7O0lBSUEsT0FBQTs7OztBQzFDQTtHQUNBLE9BQUEsaUJBQUE7R0FDQSxRQUFBLG1DQUFBLFNBQUEsWUFBQSxNQUFBO0lBQ0EsSUFBQSxLQUFBO0lBQ0EsSUFBQSxPQUFBLFdBQUE7O0lBRUEsSUFBQSxXQUFBOzs7Ozs7O01BT0EsT0FBQSxTQUFBLEtBQUE7UUFDQSxJQUFBLENBQUEsSUFBQSxlQUFBLENBQUEsSUFBQSxLQUFBO1VBQ0EsTUFBQSxJQUFBLE1BQUE7OztRQUdBLElBQUEsUUFBQSxJQUFBLFlBQUE7UUFDQSxJQUFBO1FBQ0EsSUFBQSxrQkFBQTs7O1FBR0EsSUFBQSxVQUFBLEdBQUE7VUFDQTs7O1FBR0EsSUFBQSxhQUFBO1VBQ0EsV0FBQTtVQUNBLE1BQUE7VUFDQSxLQUFBO1VBQ0EsT0FBQTs7O1FBR0EsTUFBQSxRQUFBLE9BQUEsSUFBQSxZQUFBOztRQUVBLElBQUEsV0FBQSxTQUFBLFlBQUE7O1VBRUEsV0FBQSxXQUFBOztVQUVBLElBQUEsSUFBQSxNQUFBLFVBQUE7O1VBRUE7O1VBRUEsSUFBQSxXQUFBO1lBQ0EsUUFBQTtZQUNBLE9BQUE7WUFDQSxTQUFBLFNBQUEsa0JBQUEsUUFBQTs7O1VBR0EsSUFBQSxVQUFBLFFBQUEsR0FBQTtZQUNBLElBQUEsR0FBQSxpQkFBQTtjQUNBLEdBQUEsa0JBQUE7Y0FDQSxPQUFBLEdBQUE7OztZQUdBLElBQUE7Ozs7UUFJQSxJQUFBLGNBQUEsUUFBQSxLQUFBLElBQUEsYUFBQTs7O1FBR0EsSUFBQSxVQUFBLEdBQUE7VUFDQSxRQUFBO1VBQ0EsU0FBQSxJQUFBO1lBQ0EsWUFBQSxJQUFBLFlBQUE7WUFDQSxTQUFBO1lBQ0EsS0FBQSxJQUFBO1lBQ0EsT0FBQSxJQUFBOzs7VUFHQTs7OztRQUlBLElBQUEsUUFBQSxJQUFBLFdBQUE7VUFDQSxRQUFBLFFBQUE7VUFDQSxLQUFBLElBQUEsSUFBQSxHQUFBLElBQUEsT0FBQSxLQUFBO1lBQ0EsU0FBQSxJQUFBO2NBQ0EsWUFBQSxJQUFBLFlBQUE7Y0FDQSxTQUFBO2NBQ0EsS0FBQSxJQUFBO2NBQ0EsT0FBQSxJQUFBOzs7O1VBSUE7Ozs7UUFJQSxRQUFBLElBQUEsWUFBQTtRQUNBLEdBQUEsa0JBQUEsSUFBQTs7OztRQUlBLEdBQUEsaUJBQUEsbUJBQUEsU0FBQSxnQkFBQTs7VUFFQSxJQUFBLENBQUEsZ0JBQUE7WUFDQTs7O1VBR0EsU0FBQSxJQUFBO1lBQ0EsWUFBQSxJQUFBLFlBQUEsRUFBQTtZQUNBLFNBQUE7WUFDQSxLQUFBLElBQUE7WUFDQSxPQUFBLElBQUE7Ozs7UUFJQSxLQUFBLElBQUEsSUFBQSxHQUFBLElBQUEsSUFBQSxXQUFBLEtBQUE7VUFDQSxTQUFBLElBQUE7WUFDQSxZQUFBLElBQUEsWUFBQTtZQUNBLFNBQUE7WUFDQSxLQUFBLElBQUE7WUFDQSxPQUFBLElBQUE7Ozs7UUFJQTs7OztNQUlBLEtBQUEsU0FBQSxLQUFBO1FBQ0EsSUFBQSxDQUFBLElBQUEsY0FBQSxDQUFBLElBQUEsS0FBQTtVQUNBLE1BQUEsSUFBQSxNQUFBOzs7UUFHQSxLQUFBLE1BQUEsaUJBQUEsS0FBQSxVQUFBLElBQUE7O1FBRUEsSUFBQSxhQUFBO1VBQ0EsU0FBQTtVQUNBLE9BQUE7VUFDQSxTQUFBO1VBQ0EsVUFBQSxJQUFBLFdBQUEsSUFBQSxPQUFBLElBQUEsV0FBQSxJQUFBLFlBQUEsT0FBQTs7UUFFQSxJQUFBLG9CQUFBLElBQUE7UUFDQSxNQUFBLFFBQUEsT0FBQSxJQUFBLFlBQUE7UUFDQSxJQUFBLGFBQUEsU0FBQSxlQUFBO1VBQ0EsSUFBQSxjQUFBLGtCQUFBOztZQUVBLElBQUEsU0FBQSxjQUFBOztZQUVBLElBQUEsUUFBQSxjQUFBOztZQUVBLElBQUEsVUFBQSxTQUFBLENBQUEsU0FBQSxTQUFBOztZQUVBLGtCQUFBO2NBQ0EsUUFBQTtjQUNBLE9BQUE7Y0FDQSxTQUFBOzs7OztRQUtBLElBQUEsU0FBQSxJQUFBO1FBQ0EsT0FBQSxVQUFBLElBQUE7UUFDQSxPQUFBLFdBQUEsSUFBQTs7UUFFQSxJQUFBLEtBQUEsSUFBQTtRQUNBLEdBQUEsYUFBQSxJQUFBO1FBQ0EsR0FBQTtVQUNBLElBQUEsV0FBQTtVQUNBLFVBQUEsSUFBQTtVQUNBLElBQUEsUUFBQSxLQUFBLFVBQUEsSUFBQTtVQUNBLElBQUEsTUFBQSxLQUFBLFVBQUEsSUFBQTtVQUNBOzs7OztJQUtBLE9BQUE7Ozs7QUM1S0E7R0FDQSxPQUFBLFdBQUE7R0FDQSxRQUFBLGVBQUEsVUFBQSxNQUFBO0lBQ0EsT0FBQTtNQUNBLFNBQUEsU0FBQSxJQUFBLFFBQUE7UUFDQSxJQUFBLE1BQUE7O1FBRUEsSUFBQSxRQUFBLFNBQUEsU0FBQTtVQUNBLFNBQUEsT0FBQSxNQUFBOzs7UUFHQSxJQUFBLE9BQUEsV0FBQSxLQUFBLE9BQUEsT0FBQSxJQUFBO1VBQ0EsS0FBQSxLQUFBO1VBQ0E7OztRQUdBLElBQUEsQ0FBQSxRQUFBLFFBQUEsU0FBQTtVQUNBLEtBQUEsTUFBQTtVQUNBOzs7UUFHQSxPQUFBLElBQUEsU0FBQSxPQUFBO1VBQ0EsT0FBQSxJQUFBLFNBQUEsR0FBQTs7O1FBR0EsT0FBQTs7OztBQzFCQTtBQUNBLFFBQUEsT0FBQSxZQUFBLElBQUEsQ0FBQSxZQUFBLFNBQUEsVUFBQTtFQUNBLElBQUEsa0JBQUE7SUFDQSxNQUFBO0lBQ0EsS0FBQTtJQUNBLEtBQUE7SUFDQSxLQUFBO0lBQ0EsTUFBQTtJQUNBLE9BQUE7O0VBRUEsU0FBQSxNQUFBLFdBQUE7SUFDQSxvQkFBQTtNQUNBLFNBQUE7UUFDQTtRQUNBOztNQUVBLE9BQUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7TUFFQSxTQUFBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBOztNQUVBLFlBQUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7TUFFQSxjQUFBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBOztNQUVBLFlBQUE7TUFDQSxZQUFBO01BQ0EsVUFBQTtNQUNBLGNBQUE7TUFDQSxjQUFBO01BQ0EsU0FBQTtNQUNBLGFBQUE7TUFDQSxhQUFBOztJQUVBLGtCQUFBO01BQ0EsZ0JBQUE7TUFDQSxlQUFBO01BQ0EsYUFBQTtNQUNBLFlBQUEsQ0FBQTtRQUNBLFNBQUE7UUFDQSxVQUFBO1FBQ0EsV0FBQTtRQUNBLFdBQUE7UUFDQSxXQUFBO1FBQ0EsVUFBQTtRQUNBLFVBQUE7UUFDQSxVQUFBO1FBQ0EsVUFBQTtRQUNBLFVBQUE7U0FDQTtRQUNBLFNBQUE7UUFDQSxVQUFBO1FBQ0EsV0FBQTtRQUNBLFdBQUE7UUFDQSxXQUFBO1FBQ0EsVUFBQTtRQUNBLFVBQUE7UUFDQSxVQUFBO1FBQ0EsVUFBQTtR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Ozs7TUFHQSxHQUFBLFlBQUEsWUFBQSxLQUFBLGFBQUEsR0FBQTtNQUNBLEdBQUEsaUJBQUEsWUFBQSxLQUFBOztNQUVBLFdBQUEsVUFBQTtNQUNBLFdBQUEsUUFBQTs7TUFFQSxXQUFBLGFBQUE7O01BRUEsR0FBQSxTQUFBOzs7SUFHQSxHQUFBLE9BQUEsU0FBQSxJQUFBLFNBQUE7SUFDQSxHQUFBLE9BQUEsU0FBQSxJQUFBLFNBQUE7SUFDQSxHQUFBLFFBQUEsWUFBQSxLQUFBO0lBQ0EsR0FBQSxZQUFBLFlBQUEsS0FBQSxRQUFBLEdBQUE7O0lBRUEsR0FBQSxjQUFBO0lBQ0EsR0FBQSxjQUFBO0lBQ0EsR0FBQSxlQUFBO0lBQ0EsR0FBQSxnQkFBQTs7SUFFQTs7SUFFQSxTQUFBLFFBQUE7TUFDQSxJQUFBLFNBQUE7UUFDQSxTQUFBLEdBQUE7UUFDQSxZQUFBLEdBQUE7UUFDQSxNQUFBLEdBQUE7O1FBRUEsV0FBQSxHQUFBOzs7TUFHQSxJQUFBLEdBQUEsT0FBQSxTQUFBLGlCQUFBO1FBQ0EsUUFBQSxPQUFBLFFBQUE7VUFDQSxTQUFBLEdBQUE7VUFDQSxjQUFBLEdBQUE7O1VBRUEsa0JBQUEsR0FBQTs7OztNQUlBLFVBQUEsT0FBQTs7TUFFQTtTQUNBLE1BQUE7U0FDQTtTQUNBLEtBQUEsU0FBQSxJQUFBO1VBQ0EsR0FBQSxNQUFBLFFBQUEsU0FBQSxNQUFBO1lBQ0EsS0FBQSxjQUFBLFlBQUEsS0FBQSxnQkFBQSxLQUFBOzs7VUFHQSxHQUFBLFFBQUEsR0FBQTtVQUNBLEdBQUEsY0FBQSxHQUFBOztVQUVBLElBQUEsTUFBQSxHQUFBLGNBQUEsR0FBQTtVQUNBLEdBQUEsYUFBQSxHQUFBLGNBQUEsR0FBQSxTQUFBLElBQUEsT0FBQSxLQUFBLE1BQUEsT0FBQTs7U0FFQSxNQUFBLFNBQUEsS0FBQTtVQUNBLE9BQUEsTUFBQSxJQUFBLEtBQUEsT0FBQTs7OztJQUlBLFNBQUEsV0FBQSxNQUFBLE9BQUE7TUFDQSxHQUFBLE9BQUEsTUFBQSxTQUFBLE1BQUE7UUFDQSxJQUFBLENBQUEsTUFBQTtVQUNBOzs7UUFHQSxHQUFBLFNBQUEsS0FBQTs7Ozs7SUFLQSxTQUFBLGNBQUEsTUFBQTtNQUNBLElBQUEsUUFBQSxhQUFBO1FBQ0E7V0FDQSxPQUFBO1lBQ0EsSUFBQSxLQUFBOztXQUVBO1dBQ0EsS0FBQSxTQUFBLEtBQUE7WUFDQSxPQUFBLFFBQUEsSUFBQSxPQUFBOztZQUVBOztXQUVBLE1BQUEsU0FBQSxLQUFBO1lBQ0EsT0FBQSxNQUFBLElBQUEsT0FBQTs7Ozs7O0lBTUEsU0FBQSxhQUFBLE1BQUE7TUFDQSxJQUFBLG1CQUFBLE9BQUEsS0FBQTtRQUNBLGFBQUE7UUFDQSxZQUFBO1FBQ0EsVUFBQTtRQUNBLFNBQUE7VUFDQSxhQUFBLFdBQUE7WUFDQSxPQUFBOzs7OztNQUtBLGlCQUFBLE9BQUEsS0FBQSxXQUFBOzs7UUFHQTs7Ozs7SUFLQSxTQUFBLFlBQUEsTUFBQTtNQUNBLEdBQUEsT0FBQTtNQUNBLEdBQUEsT0FBQTs7TUFFQTs7OztJQUlBLFNBQUEsWUFBQSxNQUFBO01BQ0EsR0FBQSxPQUFBOztNQUVBOzs7O0lBSUEsU0FBQSxTQUFBO01BQ0EsR0FBQSxPQUFBOztNQUVBOzs7O0dBSUEsV0FBQSx3TkFBQSxTQUFBLFFBQUEsTUFBQSxXQUFBLFFBQUEsZ0JBQUE7SUFDQSxPQUFBLFVBQUEsUUFBQSxxQkFBQSxvQkFBQTtJQUNBLGNBQUEsV0FBQTtJQUNBLElBQUEsS0FBQTtJQUNBLElBQUEsUUFBQSxLQUFBLE1BQUEsZUFBQSxJQUFBOztJQUVBLElBQUEsU0FBQSxNQUFBLFFBQUE7TUFDQSxHQUFBLGdCQUFBLE1BQUEsR0FBQTs7O0lBR0EsR0FBQSxlQUFBO0lBQ0EsR0FBQSxVQUFBO0lBQ0EsR0FBQSxXQUFBO0lBQ0EsR0FBQSxnQkFBQTtJQUNBLEdBQUEsY0FBQTs7SUFFQTs7SUFFQSxTQUFBLFFBQUE7TUFDQSxPQUFBO1NBQ0E7U0FDQTtTQUNBLEtBQUEsU0FBQSxLQUFBO1VBQ0EsSUFBQSxRQUFBLFNBQUEsT0FBQTtZQUNBLE1BQUEsS0FBQSxRQUFBLFNBQUEsS0FBQTtjQUNBLElBQUEsb0JBQUEsT0FBQSxPQUFBLE1BQUEsSUFBQSxJQUFBO2NBQ0EsSUFBQSxnQkFBQSxvQkFBQSxJQUFBOzs7O1VBSUEsR0FBQSxRQUFBOztTQUVBLE1BQUEsU0FBQSxLQUFBO1VBQ0EsT0FBQSxNQUFBLElBQUEsT0FBQTs7Ozs7SUFLQSxTQUFBLFNBQUEsSUFBQSxLQUFBO01BQ0EsSUFBQSxlQUFBLE9BQUEsS0FBQTtRQUNBLGFBQUE7UUFDQSxZQUFBO1FBQ0EsVUFBQTtRQUNBLFNBQUE7VUFDQSxhQUFBLFdBQUE7WUFDQSxPQUFBOztVQUVBLGFBQUEsV0FBQTtZQUNBLE9BQUE7Y0FDQSxJQUFBO2NBQ0EsS0FBQTs7Ozs7O01BTUEsYUFBQSxPQUFBLEtBQUEsV0FBQTtRQUNBOzs7OztJQUtBLFNBQUEsUUFBQSxVQUFBLEtBQUE7TUFDQSxJQUFBLFFBQUEsV0FBQSxDQUFBLElBQUEsT0FBQSxJQUFBLFFBQUEsSUFBQSxPQUFBLEtBQUEsT0FBQSxNQUFBO1FBQ0EsT0FBQTtXQUNBLE9BQUE7WUFDQSxVQUFBO1lBQ0EsUUFBQSxJQUFBOztXQUVBO1dBQ0EsS0FBQSxTQUFBLEtBQUE7WUFDQSxPQUFBLE1BQUEsVUFBQSxJQUFBOztZQUVBLE9BQUEsUUFBQSxJQUFBLE9BQUE7O1lBRUE7O1dBRUEsTUFBQSxTQUFBLEtBQUE7WUFDQSxPQUFBLE1BQUEsSUFBQSxPQUFBOzs7Ozs7SUFNQSxTQUFBLFlBQUEsVUFBQSxLQUFBO01BQ0EsT0FBQSxNQUFBLFVBQUEsSUFBQTtNQUNBLE9BQUEsUUFBQTs7OztJQUlBLFNBQUEsYUFBQSxNQUFBO01BQ0EsSUFBQSxtQkFBQSxPQUFBLEtBQUE7UUFDQSxhQUFBO1FBQ0EsWUFBQTtRQUNBLFVBQUE7UUFDQSxTQUFBO1VBQ0EsYUFBQSxXQUFBO1lBQ0EsT0FBQTs7Ozs7TUFLQSxpQkFBQSxPQUFBLEtBQUEsV0FBQTs7UUFFQSxLQUFBLEtBQUEsUUFBQSxTQUFBLEtBQUE7VUFDQSxPQUFBLE1BQUEsS0FBQSxJQUFBLElBQUE7OztRQUdBOzs7OztJQUtBLFNBQUEsY0FBQSxPQUFBLEtBQUE7TUFDQSxJQUFBLFdBQUEsTUFBQTtNQUNBLElBQUEsU0FBQSxJQUFBOztNQUVBLElBQUEsYUFBQSxPQUFBLE9BQUEsVUFBQTtNQUNBLElBQUEsb0JBQUEsT0FBQSxPQUFBO01BQ0EsSUFBQSxjQUFBLG9CQUFBLElBQUE7O01BRUEsS0FBQSxLQUFBLGFBQUE7TUFDQSxLQUFBLEtBQUEsYUFBQSxLQUFBLFVBQUE7O01BRUEsSUFBQSxDQUFBLGFBQUE7UUFDQSxLQUFBLEtBQUE7UUFDQTs7O01BR0EsSUFBQSxjQUFBLGdCQUFBO01BQ0EsSUFBQSxjQUFBLFlBQUE7O01BRUEsSUFBQSxjQUFBOztNQUVBLE9BQUEsS0FBQSxhQUFBLFFBQUEsU0FBQSxLQUFBO1FBQ0EsUUFBQSxPQUFBLGFBQUEsWUFBQTs7O01BR0EsS0FBQSxLQUFBLGNBQUEsS0FBQSxVQUFBOztNQUVBLElBQUEsZUFBQTtNQUNBLE9BQUEsS0FBQSxhQUFBLFFBQUEsU0FBQSxLQUFBO1FBQ0EsSUFBQSxZQUFBLEtBQUEsT0FBQTtVQUNBLGFBQUEsT0FBQSxRQUFBLE9BQUE7WUFDQSxLQUFBLFlBQUEsS0FBQTthQUNBLFlBQUE7Ozs7TUFJQSxJQUFBLFNBQUEsRUFBQSxPQUFBOzs7TUFHQSxJQUFBLENBQUEsT0FBQSxRQUFBO1FBQ0E7O1FBRUE7OztNQUdBLEtBQUEsS0FBQSxhQUFBLEtBQUEsVUFBQTtNQUNBLEtBQUEsS0FBQTtNQUNBLFNBQUEsTUFBQTtRQUNBLEtBQUE7UUFDQSxhQUFBO1FBQ0EsTUFBQTtRQUNBLEtBQUE7UUFDQSxZQUFBO1FBQ0EsT0FBQTs7O01BR0EsU0FBQSxXQUFBLFVBQUE7O1FBRUEsS0FBQSxLQUFBLFdBQUEsU0FBQTtRQUNBLElBQUEsY0FBQSxnQkFBQSxTQUFBLFNBQUEsVUFBQTtRQUNBLEdBQUE7OztNQUdBLFNBQUEsV0FBQSxPQUFBLE1BQUE7O1FBRUEsTUFBQSxVQUFBLEtBQUE7UUFDQSxLQUFBLEtBQUEsYUFBQSxLQUFBLFVBQUE7OztNQUdBLFNBQUEsYUFBQSxPQUFBO1FBQ0EsS0FBQSxLQUFBLGFBQUEsS0FBQSxVQUFBOzs7TUFHQSxTQUFBLGNBQUE7Ozs7UUFJQSxLQUFBLEtBQUE7OztRQUdBLE9BQUEsUUFBQSxTQUFBLE9BQUE7VUFDQSxZQUFBLE1BQUEsTUFBQTs7O1FBR0EsS0FBQSxLQUFBOzs7UUFHQSxvQkFBQSxJQUFBLG1CQUFBOzs7UUFHQTs7Ozs7OztNQU9BLFNBQUEsZ0JBQUE7UUFDQSxLQUFBLEtBQUE7O1FBRUEsT0FBQTtXQUNBLEtBQUE7WUFDQSxVQUFBO1lBQ0EsUUFBQTthQUNBO1dBQ0E7V0FDQSxLQUFBLFdBQUE7WUFDQSxLQUFBLEtBQUE7OztZQUdBLElBQUEsT0FBQSxRQUFBO2NBQ0EsT0FBQSxRQUFBLFNBQUEsT0FBQTtnQkFDQSxNQUFBLE9BQUEsTUFBQTs7Ozs7WUFLQSxPQUFBLE1BQUEsVUFBQTs7O1lBR0EsSUFBQSxjQUFBLGdCQUFBO1lBQ0EsSUFBQSxjQUFBLFdBQUE7Ozs7V0FJQSxNQUFBLFNBQUEsS0FBQTtZQUNBLEtBQUEsS0FBQSxlQUFBLEtBQUEsVUFBQTtZQUNBLE9BQUEsTUFBQSxJQUFBLE9BQUE7O1lBRUEsSUFBQSxjQUFBLFlBQUE7Ozs7Ozs7R0FPQSxXQUFBLG1HQUFBLFNBQUEsUUFBQSxnQkFBQSxRQUFBLHdCQUFBLGFBQUE7SUFDQSxJQUFBLEtBQUE7O0lBRUEsUUFBQSxPQUFBLElBQUE7O0lBRUEsR0FBQSxlQUFBO0lBQ0EsR0FBQSxTQUFBOztJQUVBLFNBQUEsZUFBQTtNQUNBLEdBQUEsc0JBQUE7O01BRUE7U0FDQSxPQUFBO1VBQ0EsSUFBQSxZQUFBO1dBQ0E7VUFDQSxNQUFBLEdBQUE7O1NBRUE7U0FDQSxLQUFBLFNBQUEsS0FBQTtVQUNBLE9BQUEsUUFBQSxJQUFBLE9BQUE7O1VBRUEsZUFBQTs7U0FFQSxNQUFBLFNBQUEsS0FBQTtVQUNBLEdBQUEsc0JBQUE7O1VBRUEsT0FBQSxNQUFBLElBQUEsT0FBQTs7OztJQUlBLFNBQUEsU0FBQTtNQUNBLGVBQUE7Ozs7O0dBS0EsV0FBQSwySEFBQSxTQUFBLFFBQUEsZ0JBQUEsUUFBQTtJQUNBLGNBQUEsYUFBQSxhQUFBO0lBQ0EsSUFBQSxLQUFBOztJQUVBLEdBQUEsYUFBQSxZQUFBLEtBQUE7SUFDQSxHQUFBLGNBQUEsWUFBQSxLQUFBO0lBQ0EsR0FBQSxhQUFBLFlBQUEsS0FBQTs7SUFFQSxJQUFBLFlBQUEsS0FBQTtNQUNBLEdBQUEsUUFBQTs7TUFFQSxZQUFBLFNBQUEsWUFBQSxJQUFBO01BQ0EsWUFBQSxVQUFBLFlBQUEsSUFBQTtNQUNBLFlBQUEsU0FBQSxZQUFBLElBQUE7V0FDQTtNQUNBLEdBQUEsUUFBQTs7O0lBR0EsR0FBQSxTQUFBO0lBQ0EsR0FBQSxTQUFBOztJQUVBLFNBQUEsU0FBQTtNQUNBLElBQUEsWUFBQSxLQUFBO1FBQ0E7V0FDQSxPQUFBO1lBQ0EsVUFBQSxZQUFBO1lBQ0EsUUFBQSxZQUFBLElBQUE7YUFDQTtZQUNBLE9BQUEsR0FBQSxNQUFBO1lBQ0EsUUFBQSxHQUFBLE1BQUE7WUFDQSxPQUFBLEdBQUEsTUFBQTs7V0FFQTtXQUNBLEtBQUEsU0FBQSxLQUFBO1lBQ0EsT0FBQSxRQUFBLElBQUEsT0FBQTs7WUFFQSxlQUFBOztXQUVBLE1BQUEsU0FBQSxLQUFBO1lBQ0EsT0FBQSxNQUFBLElBQUEsT0FBQTs7YUFFQTtRQUNBO1dBQ0EsS0FBQTtZQUNBLFVBQUEsWUFBQTthQUNBO1lBQ0EsT0FBQSxHQUFBLE1BQUE7WUFDQSxRQUFBLEdBQUEsTUFBQTtZQUNBLE9BQUEsR0FBQSxNQUFBOztXQUVBO1dBQ0EsS0FBQSxTQUFBLEtBQUE7WUFDQSxPQUFBLFFBQUEsSUFBQSxPQUFBOztZQUVBLGVBQUE7O1dBRUEsTUFBQSxTQUFBLEtBQUE7WUFDQSxPQUFBLE1BQUEsSUFBQSxPQUFBOzs7OztJQUtBLFNBQUEsWUFBQSxXQUFBLE9BQUE7TUFDQSxHQUFBLGFBQUEsWUFBQSxVQUFBLFdBQUE7OztJQUdBLFNBQUEsU0FBQTtNQUNBLGVBQUE7Ozs7OztBQy9mQTtHQUNBLE9BQUE7O0dBRUEsUUFBQSxvRkFBQSxTQUFBLE1BQUEsY0FBQSxXQUFBLElBQUEscUJBQUE7SUFDQSxPQUFBLFNBQUEsSUFBQSxRQUFBLGFBQUE7TUFDQSxJQUFBLFlBQUEsYUFBQTtNQUNBLElBQUEsU0FBQSxhQUFBOztNQUVBLElBQUEsWUFBQSxDQUFBLFdBQUEsUUFBQSxLQUFBOztNQUVBLElBQUEsWUFBQSxvQkFBQSxJQUFBOztNQUVBLFFBQUEsT0FBQSxJQUFBLGFBQUEsVUFBQSxnQkFBQTs7O01BR0EsU0FBQSxPQUFBO1FBQ0EsSUFBQSxPQUFBLG9CQUFBLElBQUEsY0FBQTtRQUNBLEtBQUEsZUFBQSxHQUFBLFFBQUEsSUFBQTs7UUFFQSxvQkFBQSxJQUFBLFdBQUE7O1FBRUEsS0FBQSxJQUFBLGNBQUEsV0FBQSxLQUFBOzs7TUFHQSxJQUFBLFFBQUEsVUFBQSxNQUFBOzs7TUFHQSxHQUFBLElBQUEsd0JBQUEsV0FBQTtRQUNBLFVBQUEsT0FBQTs7Ozs7OztBQzNCQTtHQUNBLE9BQUE7O0dBRUEsV0FBQSxpSEFBQSxTQUFBLFFBQUEsY0FBQSxXQUFBLGdCQUFBLHFCQUFBLFFBQUE7SUFDQSxJQUFBLEtBQUE7O0lBRUEsSUFBQSxZQUFBLGFBQUE7SUFDQSxJQUFBLFNBQUEsYUFBQTtJQUNBLElBQUEsb0JBQUEsT0FBQSxPQUFBLFdBQUE7O0lBRUEsR0FBQSxRQUFBLEtBQUEsTUFBQSxlQUFBLElBQUE7OztJQUdBLEdBQUEsYUFBQSxHQUFBLE1BQUE7OztJQUdBLEdBQUEscUJBQUE7SUFDQSxHQUFBLGtCQUFBO0lBQ0EsR0FBQSxpQkFBQTs7SUFFQSxTQUFBLGtCQUFBO01BQ0EsR0FBQSxxQkFBQSxDQUFBLEdBQUE7OztJQUdBLFNBQUEsaUJBQUE7O01BRUEsb0JBQUEsSUFBQSxtQkFBQTtRQUNBLFVBQUE7OztNQUdBLFVBQUEsSUFBQTs7Ozs7Ozs7O0dBU0EsV0FBQSw2R0FBQSxTQUFBLFFBQUEsTUFBQSxjQUFBLGdCQUFBLHFCQUFBLFFBQUE7SUFDQSxJQUFBLEtBQUE7O0lBRUEsSUFBQSxXQUFBLGFBQUE7SUFDQSxJQUFBLFNBQUEsYUFBQTs7SUFFQSxJQUFBLGFBQUEsT0FBQSxPQUFBLFVBQUE7SUFDQSxJQUFBLGlCQUFBLE9BQUEsSUFBQTtJQUNBLElBQUEsWUFBQSxvQkFBQSxJQUFBOztJQUVBLElBQUEsWUFBQSxLQUFBLE1BQUEsZUFBQSxJQUFBOztJQUVBLElBQUEsY0FBQSxVQUFBLFVBQUEsU0FBQTtJQUNBLElBQUEsZUFBQSxZQUFBOzs7SUFHQSxHQUFBLE9BQUE7O0lBRUEsVUFBQSxnQkFBQSxVQUFBLGlCQUFBOztJQUVBLFFBQUEsT0FBQSxHQUFBLE1BQUEsVUFBQTs7SUFFQSxHQUFBLFFBQUEsWUFBQTs7SUFFQSxJQUFBLEdBQUEsU0FBQSxHQUFBLE1BQUEsUUFBQTs7TUFFQSxHQUFBLE1BQUEsR0FBQSxVQUFBOzs7TUFHQSxHQUFBLE1BQUEsUUFBQSxTQUFBLE1BQUE7UUFDQSxLQUFBLE1BQUEsUUFBQSxTQUFBLE1BQUE7VUFDQSxHQUFBLEtBQUEsS0FBQSxNQUFBLEdBQUEsS0FBQSxLQUFBLE9BQUEsRUFBQSxPQUFBOzs7Ozs7SUFNQSxHQUFBLGFBQUE7O0lBRUEsSUFBQSxpQkFBQSxvQkFBQSxJQUFBOztJQUVBLEdBQUEsY0FBQSxFQUFBLElBQUEsZ0JBQUEsU0FBQSxNQUFBLEtBQUE7TUFDQSxPQUFBO1FBQ0EsSUFBQTtRQUNBLE1BQUEsY0FBQTtRQUNBLFFBQUE7Ozs7SUFJQSxFQUFBLGdCQUFBLFNBQUEsVUFBQSxRQUFBLFNBQUEsTUFBQTtNQUNBLEdBQUEsV0FBQSxLQUFBLE1BQUE7OztJQUdBLFNBQUEsY0FBQSxTQUFBO01BQ0EsT0FBQSxVQUFBLEtBQUEsU0FBQSxNQUFBO1FBQ0EsT0FBQSxLQUFBLE1BQUE7U0FDQTs7OztJQUlBLEdBQUEsYUFBQTs7OztJQUlBLFNBQUEsV0FBQSxVQUFBLE1BQUEsTUFBQTtNQUNBLFVBQUEsT0FBQSxXQUFBLG9CQUFBLGtCQUFBO1FBQ0EsVUFBQTtRQUNBLGtCQUFBLE9BQUEsZ0JBQUE7UUFDQSxhQUFBLE9BQUEsa0JBQUE7UUFDQSxZQUFBO1FBQ0EsY0FBQSxPQUFBLGFBQUE7OztRQUdBLGtCQUFBOzs7TUFHQSxTQUFBLG1CQUFBLFFBQUE7O1FBRUEsSUFBQSxhQUFBLFFBQUE7VUFDQSxHQUFBLEtBQUEsS0FBQSxJQUFBLFFBQUE7Ozs7VUFJQSxVQUFBLGdCQUFBLEdBQUE7ZUFDQSxJQUFBLGFBQUEsU0FBQTs7VUFFQSxHQUFBLFdBQUEsS0FBQSxJQUFBLFFBQUE7OztVQUdBLElBQUEsY0FBQSxlQUFBLEtBQUEsSUFBQSxLQUFBLFNBQUEsT0FBQTtZQUNBLE9BQUEsTUFBQSxPQUFBLEtBQUE7Ozs7VUFJQSxZQUFBLFFBQUE7VUFDQSxvQkFBQSxJQUFBLGdCQUFBOzs7VUFHQSxVQUFBLEtBQUEsSUFBQSxZQUFBLElBQUEsUUFBQTs7O1FBR0Esb0JBQUEsSUFBQSxZQUFBOztRQUVBLEdBQUE7OztNQUdBLFNBQUEsbUJBQUE7UUFDQSxLQUFBLE1BQUEsZ0JBQUEsS0FBQSxPQUFBLFdBQUEsS0FBQTs7OztJQUlBLEdBQUEsYUFBQTtJQUNBLFNBQUEsV0FBQSxVQUFBLE9BQUE7TUFDQSxnQkFBQSxhQUFBLEdBQUEsYUFBQSxTQUFBLFNBQUEsY0FBQSxNQUFBLElBQUE7Ozs7R0FJQSxXQUFBLGtIQUFBLFNBQUEsUUFBQSxNQUFBLGNBQUEsZ0JBQUEsUUFBQSxxQkFBQSxRQUFBO0lBQ0EsSUFBQSxLQUFBOztJQUVBLElBQUEsZUFBQSxTQUFBLGFBQUE7SUFDQSxJQUFBLFdBQUEsYUFBQTtJQUNBLElBQUEsU0FBQSxhQUFBOzs7SUFHQSxJQUFBLGFBQUEsT0FBQSxPQUFBLFVBQUE7SUFDQSxJQUFBLGlCQUFBLE9BQUEsSUFBQTtJQUNBLElBQUEsWUFBQSxvQkFBQSxJQUFBOzs7SUFHQSxJQUFBO0lBQ0E7T0FDQSxNQUFBLGVBQUEsSUFBQTtPQUNBLEtBQUEsU0FBQSxNQUFBO1FBQ0EsT0FBQSxLQUFBLE9BQUE7O0lBRUEsR0FBQSxRQUFBLGVBQUEsWUFBQTs7O0lBR0EsSUFBQSxHQUFBLFNBQUEsR0FBQSxNQUFBLFFBQUE7TUFDQSxHQUFBLE1BQUEsR0FBQSxVQUFBOzs7SUFHQSxHQUFBLE9BQUE7OztJQUdBLFFBQUEsT0FBQSxHQUFBLE1BQUEs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QSxJQUFBLFNBQUE7SUFDQSxHQUFBLFFBQUEsWUFBQSxLQUFBO0lBQ0EsR0FBQSxZQUFBLFlBQUEsS0FBQSxRQUFBLEdBQUE7O0lBRUEsR0FBQSxjQUFBO0lBQ0EsR0FBQSxjQUFBOztJQUVBOztJQUVBLFNBQUEsUUFBQTtNQUNBLElBQUEsU0FBQTtRQUNBLFlBQUEsR0FBQTtRQUNBLE1BQUEsR0FBQTs7O01BR0EsVUFBQSxPQUFBOztNQUVBO1NBQ0EsTUFBQTtTQUNBO1NBQ0EsS0FBQSxTQUFBLElBQUE7VUFDQSxHQUFBLE1BQUEsUUFBQSxTQUFBLE1BQUE7WUFDQSxLQUFBLGNBQUEsWUFBQSxLQUFBLGdCQUFBLEtBQUE7OztVQUdBLEdBQUEsUUFBQSxHQUFBO1VBQ0EsR0FBQSxjQUFBLEdBQUE7O1VBRUEsSUFBQSxNQUFBLEdBQUEsY0FBQSxHQUFBO1VBQ0EsR0FBQSxhQUFBLEdBQUEsY0FBQSxHQUFBLFNBQUEsSUFBQSxPQUFBLEtBQUEsTUFBQSxPQUFBOztTQUVBLE1BQUEsU0FBQSxLQUFBO1VBQ0EsT0FBQSxNQUFBLElBQUEsT0FBQTs7Ozs7SUFLQSxTQUFBLFlBQUEsTUFBQTtNQUNBLEdBQUEsT0FBQTtNQUNBLEdBQUEsT0FBQTs7TUFFQTs7OztJQUlBLFNBQUEsWUFBQSxNQUFBO01BQ0EsR0FBQSxPQUFBOztNQUVBOzs7Ozs7Ozs7QUNqaUJBO0dBQ0EsT0FBQSxvQkFBQSxDQUFBOztHQUVBLFFBQUEsNEJBQUEsU0FBQSxXQUFBO0lBQ0EsT0FBQSxVQUFBLFlBQUEsU0FBQSxZQUFBLElBQUE7TUFDQSxPQUFBO1FBQ0EsU0FBQTs7Ozs7R0FLQSxRQUFBLDJCQUFBLFNBQUEsV0FBQTtJQUNBLE9BQUEsVUFBQSxZQUFBLFNBQUE7O0FDWkE7R0FDQSxPQUFBOztHQUVBLFdBQUEsNkVBQUEsVUFBQSxRQUFBLElBQUEsV0FBQSxVQUFBLFFBQUEsVUFBQTtJQUNBLElBQUEsS0FBQTs7SUFFQSxHQUFBLFFBQUE7O0lBRUEsU0FBQSxRQUFBO01BQ0EsT0FBQTtTQUNBLEtBQUE7VUFDQSxRQUFBLEdBQUE7VUFDQSxVQUFBLEdBQUE7O1NBRUE7U0FDQSxLQUFBLFNBQUEsS0FBQTtVQUNBLE9BQUEsZ0JBQUEsSUFBQTtVQUNBLE9BQUEsWUFBQSxJQUFBOztVQUVBLE9BQUEsUUFBQSxJQUFBLE9BQUE7O1VBRUEsSUFBQSxLQUFBLFVBQUE7O1VBRUEsVUFBQSxJQUFBLEdBQUEsWUFBQTs7U0FFQSxNQUFBLFNBQUEsS0FBQTtVQUNBLE9BQUEsTUFBQSxJQUFBLE9BQUE7Ozs7QUMxQkE7R0FDQSxPQUFBLG1CQUFBLENBQUE7R0FDQSxRQUFBLDBCQUFBLFVBQUEsV0FBQTtJQUNBLE9BQUEsVUFBQSxZQUFBLFNBQUE7S0FDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyDlupTnlKjlhaXlj6Ncbi8vIE1vZHVsZTogZ3VsdVxuLy8gRGVwZW5kZW5jaWVzOlxuLy8gICAgbmdSb3V0ZSwgaHR0cEludGVyY2VwdG9ycywgZ3VsdS5taXNzaW5nXG5cbi8qIGdsb2JhbCBmYWxsYmFja0hhc2ggKi9cbmFuZ3VsYXJcbiAgLm1vZHVsZSgnZ3VsdScsIFtcbiAgICAndWkucm91dGVyJyxcbiAgICAnbmdMb2NhbGUnLFxuICAgICd0b2FzdHInLFxuICAgICd1aS5ib290c3RyYXAnLFxuICAgICdjdXN0b20uZGlyZWN0aXZlcycsXG4gICAgJ2h0dHBJbnRlcmNlcHRvcnMnLFxuICAgICdMb2NhbFN0b3JhZ2VNb2R1bGUnLFxuICAgICdjaGllZmZhbmN5cGFudHMubG9hZGluZ0JhcicsXG4gICAgJ3V0aWwuZmlsdGVycycsXG4gICAgJ3V0aWwuZGF0ZScsXG4gICAgJ3V0aWwuZmlsZXInLFxuICAgICd1dGlsLnVwbG9hZGVyJyxcbiAgICAndXRpbC5rZXltZ3InLFxuICAgICdndWx1LmluZGVudCcsXG4gICAgJ2d1bHUucmVwb3J0JyxcbiAgICAnZ3VsdS5sb2dpbicsXG4gICAgJ2d1bHUubWlzc2luZydcbiAgXSlcbiAgLmNvbmZpZyhmdW5jdGlvbigkbG9jYXRpb25Qcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyLCAkbG9nUHJvdmlkZXIsIGxvY2FsU3RvcmFnZVNlcnZpY2VQcm92aWRlcikge1xuICAgIC8vIG5vdCB1c2UgaHRtbDUgaGlzdG9yeSBhcGlcbiAgICAvLyBidXQgdXNlIGhhc2hiYW5nXG4gICAgJGxvY2F0aW9uUHJvdmlkZXJcbiAgICAgIC5odG1sNU1vZGUoZmFsc2UpXG4gICAgICAuaGFzaFByZWZpeCgnIScpO1xuXG4gICAgLy8gZGVmaW5lIDQwNFxuICAgICR1cmxSb3V0ZXJQcm92aWRlclxuICAgICAgLm90aGVyd2lzZSgnL2xvZ2luJyk7XG5cbiAgICAvLyBsb2dnZXJcbiAgICAkbG9nUHJvdmlkZXIuZGVidWdFbmFibGVkKHRydWUpO1xuXG4gICAgLy8gbG9jYWxTdG9yYWdlIHByZWZpeFxuICAgIGxvY2FsU3RvcmFnZVNlcnZpY2VQcm92aWRlclxuICAgICAgLnNldFByZWZpeCgnZ3VsdS50ZXN0ZXInKVxuICAgICAgLnNldE5vdGlmeSh0cnVlLCB0cnVlKTtcblxuICAgIC8vIEFQSSBTZXJ2ZXJcbiAgICBBUElfU0VSVkVSUyA9IHtcbiAgICAgIHRlc3RlcjogJ2h0dHA6Ly90LmlmZGl1LmNvbSdcbiAgICAgIC8vIHRlc3RlcjogJ2h0dHA6Ly9vLmRwOjMwMDAnXG4gICAgfVxuXG4gICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50KS5vbignZGV2aWNlcmVhZHknLCBmdW5jdGlvbigpIHtcbiAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudCkub24oJ2JhY2tidXR0b24nLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSlcbiAgLnJ1bihmdW5jdGlvbigkcm9vdFNjb3BlLCAkbG9jYXRpb24sICRzdGF0ZSwgJHN0YXRlUGFyYW1zKSB7XG4gICAgdmFyIHJlZyA9IC9bXFwmXFw/XV89XFxkKy87XG5cbiAgICAkcm9vdFNjb3BlLiRzdGF0ZSA9ICRzdGF0ZTtcbiAgICAkcm9vdFNjb3BlLiRzdGF0ZVBhcmFtcyA9ICRzdGF0ZVBhcmFtcztcbiAgICAkcm9vdFNjb3BlLmlzQ29sbGFwc2VkID0gdHJ1ZTtcblxuICAgIC8vIOeUqOS6jui/lOWbnuS4iuWxgumhtemdolxuICAgICRyb290U2NvcGVcbiAgICAgIC4kd2F0Y2goZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAkbG9jYXRpb24udXJsKCk7XG4gICAgICB9LCBmdW5jdGlvbihjdXJyZW50LCBvbGQpIHtcbiAgICAgICAgaWYgKGN1cnJlbnQucmVwbGFjZShyZWcsICcnKSA9PT0gb2xkLnJlcGxhY2UocmVnLCAnJykpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAkcm9vdFNjb3BlLmJhY2tVcmwgPSBvbGQ7XG4gICAgICB9KTtcblxuICAgICRyb290U2NvcGUuYmFjayA9IGZ1bmN0aW9uKCkge1xuICAgICAgJGxvY2F0aW9uLnVybCgkcm9vdFNjb3BlLmJhY2tVcmwpO1xuICAgIH1cbiAgfSk7XG5cbiIsImFuZ3VsYXJcbiAgLm1vZHVsZSgnZ3VsdS5pbmRlbnQnLCBbXG4gICAgJ3VpLnJvdXRlcicsXG4gICAgJ3V0aWwudXBsb2FkZXInLFxuICAgICd1dGlsLmZpbGVyJyxcbiAgICAndXRpbC5rZXltZ3InLFxuICAgICdndWx1LmluZGVudC5zdmNzJyxcbiAgICAnZ3VsdS5pbmRlbnQuZW51bXMnXG4gIF0pXG4gIC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlclxuICAgICAgLnN0YXRlKCdpbmRlbnRzJywge1xuICAgICAgICBhYnN0cmFjdDogdHJ1ZSxcbiAgICAgICAgdXJsOiAnL2luZGVudHMnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2luZGVudC9kYXNoYm9hcmQuaHRtJyxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgIEluZGVudEVudW1zOiAnSW5kZW50RW51bXMnXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAuc3RhdGUoJ2luZGVudHMubGlzdCcsIHtcbiAgICAgICAgdXJsOiAnJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdpbmRlbnQvc2VhcmNoLmh0bScsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdJbmRlbnRMaXN0Q3RybCdcbiAgICAgIH0pXG4gICAgICAuc3RhdGUoJ2luZGVudHMudW5jb25maXJtZWQnLCB7XG4gICAgICAgIHVybDogJy91bmNvbmZpcm1lZCcsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnaW5kZW50L2xpc3RfdW5jb25maXJtZWQuaHRtJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0luZGVudExpc3RDdHJsJ1xuICAgICAgfSlcbiAgICAgIC5zdGF0ZSgnaW5kZW50cy51bnRlc3RlZCcsIHtcbiAgICAgICAgdXJsOiAnL3VudGVzdGVkJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdpbmRlbnQvbGlzdF91bnRlc3RlZC5odG0nLFxuICAgICAgICBjb250cm9sbGVyOiAnVW50ZXN0ZWRJbmRlbnRMaXN0Q3RybCdcbiAgICAgIH0pO1xuICB9KTtcbiIsImFuZ3VsYXJcbiAgLm1vZHVsZSgnZ3VsdS5yZXBvcnQnLCBbXG4gICAgJ3VpLnJvdXRlcicsXG4gICAgJ3V0aWwudm0nLFxuICAgICd1dGlsLmtleW1ncicsXG4gICAgJ2d1bHUucmVwb3J0LnN2Y3MnLFxuICAgICdndWx1LmluZGVudC5lbnVtcydcbiAgXSlcbiAgLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyXG4gICAgICAuc3RhdGUoJ2luZGVudHMuaW5wdXRfcmVwb3J0Jywge1xuICAgICAgICB1cmw6ICcve2luZGVudF9pZDpbMC05XSt9L2Nhci97Y2FyX2lkOlswLTldK30vcmVwb3J0JyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdyZXBvcnQvaW5wdXRfZGFzaGJvYXJkLmh0bScsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdJbnB1dERhc2hib2FyZEN0cmwnXG4gICAgICB9KVxuICAgICAgLnN0YXRlKCdpbmRlbnRzLmlucHV0X3JlcG9ydC5waG90bycsIHtcbiAgICAgICAgdXJsOiAnL3Bob3RvJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdyZXBvcnQvaW5wdXRfcGhvdG8uaHRtJyxcbiAgICAgICAgY29udHJvbGxlcjogJ1Bob3RvUmVwb3J0RWRpdEN0cmwnXG4gICAgICB9KVxuICAgICAgLnN0YXRlKCdpbmRlbnRzLmlucHV0X3JlcG9ydC5wYXJ0Jywge1xuICAgICAgICB1cmw6ICcve3BhcnRfaWQ6WzAtOWEtekEtWl0rfScsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAncmVwb3J0L2lucHV0Lmh0bScsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdSZXBvcnRFZGl0Q3RybCdcbiAgICAgIH0pXG4gICAgICAuc3RhdGUoJ2luZGVudHMucmVwb3J0cycsIHtcbiAgICAgICAgdXJsOiAnL3JlcG9ydHMnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ3JlcG9ydC9saXN0Lmh0bScsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdSZXBvcnRMaXN0Q3RybCdcbiAgICAgIH0pO1xuICB9KTtcbiIsImFuZ3VsYXJcbiAgLm1vZHVsZSgnZ3VsdS5sb2dpbicsIFtcbiAgICAndWkucm91dGVyJyxcbiAgICAnZ3VsdS5sb2dpbi5zdmNzJ1xuICBdKVxuXG4gIC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlclxuICAgICAgLnN0YXRlKCdsb2dpbicsIHtcbiAgICAgICAgdXJsOiAnL2xvZ2luJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdsb2dpbi9sb2dpbi5odG0nLFxuICAgICAgICBjb250cm9sbGVyOiAnTG9naW5DdHJsJ1xuICAgICAgfSk7XG4gIH0pO1xuIiwiLy8g6Ieq5a6a5LmJIGRpcmVjdGl2ZXNcblxuYW5ndWxhclxuICAubW9kdWxlKCdjdXN0b20uZGlyZWN0aXZlcycsIFtdKVxuICAuZGlyZWN0aXZlKCduZ0luZGV0ZXJtaW5hdGUnLCBmdW5jdGlvbigkY29tcGlsZSkge1xuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgc2NvcGUuJHdhdGNoKGF0dHJpYnV0ZXNbJ25nSW5kZXRlcm1pbmF0ZSddLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgIGVsZW1lbnQucHJvcCgnaW5kZXRlcm1pbmF0ZScsICEhdmFsdWUpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICB9KTtcbiIsImFuZ3VsYXJcbiAgLm1vZHVsZSgndXRpbC5maWx0ZXJzJywgW10pXG5cbiAgLmZpbHRlcignbW9iaWxlJywgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHMpIHtcbiAgICAgIGlmIChzID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfVxuXG4gICAgICBzID0gcy5yZXBsYWNlKC9bXFxzXFwtXSsvZywgJycpO1xuXG4gICAgICBpZiAocy5sZW5ndGggPCAzKSB7XG4gICAgICAgIHJldHVybiBzO1xuICAgICAgfVxuXG4gICAgICB2YXIgc2EgPSBzLnNwbGl0KCcnKTtcblxuICAgICAgc2Euc3BsaWNlKDMsIDAsICctJyk7XG5cbiAgICAgIGlmIChzLmxlbmd0aCA+PSA3KSB7XG4gICAgICAgIHNhLnNwbGljZSg4LCAwLCAnLScpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2Euam9pbignJyk7XG4gICAgfTtcbiAgfSk7XG4iLCJhbmd1bGFyXG4gIC5tb2R1bGUoJ3V0aWwuZGF0ZScsIFtdKVxuICAuZmFjdG9yeSgnRGF0ZVV0aWwnLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRvU3RyaW5nID0gZnVuY3Rpb24gKGRhdGUsIHMpIHtcbiAgICAgIHJldHVybiBkYXRlLmdldEZ1bGxZZWFyKCkgKyBzICsgKGRhdGUuZ2V0TW9udGgoKSArIDEpICsgcyArIGRhdGUuZ2V0RGF0ZSgpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICB0b0xvY2FsRGF0ZVN0cmluZzogZnVuY3Rpb24gKGRhdGUpIHtcbiAgICAgICAgcmV0dXJuIHRvU3RyaW5nKGRhdGUsICctJyk7XG4gICAgICB9LFxuXG4gICAgICB0b0xvY2FsVGltZVN0cmluZzogZnVuY3Rpb24oZGF0ZSkge1xuICAgICAgICB2YXIgaCA9IGRhdGUuZ2V0SG91cnMoKTtcbiAgICAgICAgdmFyIG0gPSBkYXRlLmdldE1pbnV0ZXMoKTtcblxuICAgICAgICBpZiAoaCA8IDEwKSB7XG4gICAgICAgICAgaCA9ICcwJyArIGg7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobSA8IDEwKSB7XG4gICAgICAgICAgbSA9ICcwJyArIG07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gW3RvU3RyaW5nKGRhdGUsICctJyksIGggKyAnOicgKyBtXS5qb2luKCcgJyk7XG4gICAgICB9XG4gICAgfVxuICB9KTsiLCIvLyDmnprkuL4gU2VydmljZVxuYW5ndWxhclxuICAubW9kdWxlKCd1dGlsLmVudW1zJywgW10pXG4gIC5mYWN0b3J5KCdFbnVtcycsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKEVOVU1TKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB2YWw6IGZ1bmN0aW9uIChuYW1lLCB0ZXh0KSB7XG4gICAgICAgICAgcmV0dXJuIEVOVU1TW25hbWVdLmZpbmQoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtLnRleHQgPT09IHRleHQ7XG4gICAgICAgICAgfSkudmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIHRleHQ6IGZ1bmN0aW9uIChuYW1lLCB2YWwpIHtcbiAgICAgICAgICByZXR1cm4gRU5VTVNbbmFtZV0uZmluZChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW0udmFsdWUgPT09IHZhbDtcbiAgICAgICAgICB9KS50ZXh0O1xuICAgICAgICB9LFxuICAgICAgICBpdGVtOiBmdW5jdGlvbiAobmFtZSwgdmFsKSB7XG4gICAgICAgICAgcmV0dXJuIEVOVU1TW25hbWVdLmZpbmQoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtLnZhbHVlID09PSB2YWw7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGl0ZW00dGV4dDogZnVuY3Rpb24obmFtZSwgdGV4dCkge1xuICAgICAgICAgIHJldHVybiBFTlVNU1tuYW1lXS5maW5kKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtLnRleHQgPT09IHRleHQ7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGxpc3Q6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgcmV0dXJuIEVOVU1TW25hbWVdO1xuICAgICAgICB9LFxuICAgICAgICBpdGVtczogZnVuY3Rpb24gKG5hbWUsIHZhbHMpIHtcbiAgICAgICAgICByZXR1cm4gRU5VTVNbbmFtZV0uZmlsdGVyKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFscy5pbmRleE9mKGl0ZW0udmFsdWUpICE9PSAtMTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9O1xuICB9KTsiLCIvKiBnbG9iYWwgYW5ndWxhciovXG5hbmd1bGFyXG4gIC5tb2R1bGUoJ3V0aWwuZmlsZXInLCBbXSlcbiAgLmZhY3RvcnkoJ0ZpbGVyJywgZnVuY3Rpb24oJHdpbmRvdywgJGxvZykge1xuICAgIHZhciBmaWxlciA9IHt9O1xuICAgIGZpbGVyLnJlbW92ZSA9IGZ1bmN0aW9uKHVybCkge1xuICAgICAgJHdpbmRvdy5yZXNvbHZlTG9jYWxGaWxlU3lzdGVtVVJMKHVybCwgZmlsZXIuZnNTdWNjZXNzLCBmaWxlci5mc0Vycm9yKTtcbiAgICB9O1xuXG4gICAgZmlsZXIuZnNTdWNjZXNzID0gZnVuY3Rpb24oZmlsZUVudHJ5KSB7XG4gICAgICBmaWxlRW50cnkucmVtb3ZlKGZ1bmN0aW9uKCkge1xuICAgICAgICAkbG9nLmluZm8oJ+WIoOmZpOacrOWcsOWbvueJh+aIkOWKnzogJyArIGZpbGVFbnRyeS5mdWxsUGF0aCk7XG4gICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgJGxvZy5pbmZvKCfliKDpmaTmnKzlnLDlm77niYflpLHotKU6ICcgKyBmaWxlRW50cnkuZnVsbFBhdGgpO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIGZpbGVyLmZzRXJyb3IgPSBmdW5jdGlvbihldnQpIHtcbiAgICAgICRsb2cuaW5mbygn6I635Y+W5pys5Zyw5Zu+54mH5aSx6LSlOiAnICsgSlNPTi5zdHJpbmdpZnkoZXZ0LnRhcmdldCkpO1xuICAgIH07XG5cbiAgICByZXR1cm4gZmlsZXI7XG4gIH0pOyIsImFuZ3VsYXJcbiAgLm1vZHVsZSgnaHR0cEludGVyY2VwdG9ycycsIFtdKVxuXG4gIC5jb25maWcoZnVuY3Rpb24oJGh0dHBQcm92aWRlcikge1xuICAgICRodHRwUHJvdmlkZXIuaW50ZXJjZXB0b3JzLnB1c2goJ2h0dHBJbnRlcmNlcHRvcicpO1xuICAgIFxuICAgIC8vIEFuZ3VsYXIgJGh0dHAgaXNu4oCZdCBhcHBlbmRpbmcgdGhlIGhlYWRlciBYLVJlcXVlc3RlZC1XaXRoID0gWE1MSHR0cFJlcXVlc3Qgc2luY2UgQW5ndWxhciAxLjMuMFxuICAgICRodHRwUHJvdmlkZXIuZGVmYXVsdHMuaGVhZGVycy5jb21tb25bXCJYLVJlcXVlc3RlZC1XaXRoXCJdID0gJ1hNTEh0dHBSZXF1ZXN0JztcbiAgICAkaHR0cFByb3ZpZGVyLmRlZmF1bHRzLmhlYWRlcnMucG9zdFsnQ29udGVudC1UeXBlJ10gPSAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkO2NoYXJzZXQ9dXRmLTgnO1xuICAgICRodHRwUHJvdmlkZXIuZGVmYXVsdHMudHJhbnNmb3JtUmVxdWVzdCA9IFtmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBzdHIgPSBbXTtcbiAgICAgICAgXG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaChkYXRhLCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICAgICAgdGhpcy5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChrZXkpICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKSk7XG4gICAgICAgIH0sIHN0cik7XG5cbiAgICAgICAgcmV0dXJuIHN0ci5qb2luKCcmJyk7XG4gICAgfV07XG4gIH0pXG5cbiAgLmZhY3RvcnkoJ2h0dHBJbnRlcmNlcHRvcicsIGZ1bmN0aW9uKCRxLCAkcm9vdFNjb3BlLCAkbG9jYXRpb24pIHtcbiAgICByZXR1cm4ge1xuICAgICAgLy8g6K+35rGC5YmN5L+u5pS5IHJlcXVlc3Qg6YWN572uXG4gICAgICAncmVxdWVzdCc6IGZ1bmN0aW9uKGNvbmZpZykge1xuICAgICAgICBjb25maWcuaGVhZGVycy5BdXRob3JpemF0aW9uID0gd2luZG93LkF1dGhvcml6YXRpb24gfHwgbnVsbDtcbiAgICAgICAgY29uZmlnLmhlYWRlcnMuQ1NSRlRva2VuID0gd2luZG93LkNTUkZUb2tlbiB8fCBudWxsO1xuICAgICAgICBcbiAgICAgICAgLy8g6Iul6K+35rGC55qE5piv5qih5p2/77yM5oiW5bey5Yqg5LiK5pe26Ze05oiz55qEIHVybCDlnLDlnYDvvIzliJnkuI3pnIDopoHliqDml7bpl7TmiLNcbiAgICAgICAgaWYgKGNvbmZpZy51cmwuaW5kZXhPZignLmh0bScpICE9PSAtMSB8fCBjb25maWcudXJsLmluZGV4T2YoJz9fPScpICE9PSAtMSkge1xuICAgICAgICAgIHJldHVybiBjb25maWc7XG4gICAgICAgIH1cblxuICAgICAgICBjb25maWcudXJsID0gY29uZmlnLnVybCArICc/Xz0nICsgbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cbiAgICAgICAgcmV0dXJuIGNvbmZpZztcbiAgICAgIH0sXG5cbiAgICAgIC8vIOivt+axguWHuumUme+8jOS6pOe7mSBlcnJvciBjYWxsYmFjayDlpITnkIZcbiAgICAgICdyZXF1ZXN0RXJyb3InOiBmdW5jdGlvbihyZWplY3Rpb24pIHtcbiAgICAgICAgcmV0dXJuICRxLnJlamVjdChyZWplY3Rpb24pO1xuICAgICAgfSxcblxuICAgICAgLy8g5ZON5bqU5pWw5o2u5oyJ57qm5a6a5aSE55CGXG4gICAgICAvLyB7XG4gICAgICAvLyAgIGNvZGU6IDIwMCwgLy8g6Ieq5a6a5LmJ54q25oCB56CB77yMMjAwIOaIkOWKn++8jOmdniAyMDAg5Z2H5LiN5oiQ5YqfXG4gICAgICAvLyAgIG1zZzogJ+aTjeS9nOaPkOekuicsIC8vIOS4jeiDveWSjCBkYXRhIOWFseWtmFxuICAgICAgLy8gICBkYXRhOiB7fSAvLyDnlKjmiLfmlbDmja5cbiAgICAgIC8vIH1cbiAgICAgICdyZXNwb25zZSc6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgIC8vIOacjeWKoeerr+i/lOWbnueahOacieaViOeUqOaIt+aVsOaNrlxuICAgICAgICB2YXIgZGF0YSwgY29kZTtcblxuICAgICAgICBpZiAoYW5ndWxhci5pc09iamVjdChyZXNwb25zZS5kYXRhKSkge1xuICAgICAgICAgIGNvZGUgPSByZXNwb25zZS5kYXRhLmNvZGU7XG4gICAgICAgICAgZGF0YSA9IHJlc3BvbnNlLmRhdGEuZGF0YTtcblxuICAgICAgICAgIC8vIOiLpSBzdGF0dXMgMjAwLCDkuJQgY29kZSAhMjAw77yM5YiZ6L+U5Zue55qE5piv5pON5L2c6ZSZ6K+v5o+Q56S65L+h5oGvXG4gICAgICAgICAgLy8g6YKj5LmI77yMY2FsbGJhY2sg5Lya5o6l5pS25Yiw5LiL6Z2i5b2i5byP55qE5Y+C5pWw77yaXG4gICAgICAgICAgLy8geyBjb2RlOiAyMDAwMSwgbXNnOiAn5pON5L2c5aSx6LSlJyB9XG4gICAgICAgICAgaWYgKGNvZGUgIT09IDIwMCkge1xuICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdChyZXNwb25zZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g6Iul5pyN5Yqh56uv6L+U5Zue55qEIGRhdGEgIW51bGzvvIzliJnov5Tlm57nmoTmmK/mnInmlYjlnLDnlKjmiLfmlbDmja5cbiAgICAgICAgICAvLyDpgqPkuYjvvIxjYWxsYmFjayDkvJrmjqXmlLbliLDkuIvpnaLlvaLlvI/lj4LmlbDvvJpcbiAgICAgICAgICAvLyB7IGl0ZW1zOiBbLi4uXSwgdG90YWxfY291bnQ6IDEwMCB9XG4gICAgICAgICAgaWYgKGRhdGEgIT0gbnVsbCkge1xuICAgICAgICAgICAgcmVzcG9uc2UuZGF0YSA9IGRhdGE7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g6Iul5pyN5Yqh56uv6L+U5Zue55qEIGRhdGEg5YC85Li6IG51bGzvvIzliJnov5Tlm57nmoTmmK/mj5DnpLrkv6Hmga9cbiAgICAgICAgICAvLyDpgqPkuYggY2FsbGJhY2sg5Lya5o6l5pS25Yiw5LiL6Z2i5b2i5byP55qE5Y+C5pWw77yaXG4gICAgICAgICAgLy8geyBjb2RlOiAyMDAsIG1zZzogJ+aTjeS9nOaIkOWKnycgfVxuICAgICAgICAgIC8vIOm7mOiupOS4uuatpFxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgICAgfSxcblxuICAgICAgLy8g5ZON5bqU5Ye66ZSZ77yM5Lqk57uZIGVycm9yIGNhbGxiYWNrIOWkhOeQhlxuICAgICAgJ3Jlc3BvbnNlRXJyb3InOiBmdW5jdGlvbihyZWplY3Rpb24pIHtcbiAgICAgICAgdmFyIGN1cnJlbnRfcGF0aCA9ICRsb2NhdGlvbi5wYXRoKCk7XG5cbiAgICAgICAgaWYgKHJlamVjdGlvbi5zdGF0dXMgPT09IDQwMSkge1xuICAgICAgICAgICRsb2NhdGlvbi51cmwoJy9sb2dpbicpO1xuICAgICAgICAgICRsb2NhdGlvbi5zZWFyY2goJ3JlZGlyZWN0JywgY3VycmVudF9wYXRoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAkcS5yZWplY3QocmVqZWN0aW9uKTtcbiAgICAgIH1cbiAgICB9O1xuICB9KTsiLCIvKiBnbG9iYWwgYW5ndWxhciovXG5hbmd1bGFyXG4gIC5tb2R1bGUoJ3V0aWwua2V5bWdyJywgW10pXG4gIC5mYWN0b3J5KCdLZXlNZ3InLCBmdW5jdGlvbigkbG9nLCBsb2NhbFN0b3JhZ2VTZXJ2aWNlKSB7XG4gICAgdmFyIEtleU1nciA9IHtcbiAgICAgIF9fY29ubmVjdG9yOiAnXycsXG4gICAgICBcbiAgICAgIHJlcG9ydDogZnVuY3Rpb24ob3JkZXJfaWQsIGNhcl9pZCkge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCAhPT0gMikge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignS2V5TWdyLnJlcG9ydCgpIOWPguaVsOmdnuazlScpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFtvcmRlcl9pZCwgY2FyX2lkXS5qb2luKEtleU1nci5fX2Nvbm5lY3Rvcik7XG4gICAgICB9LFxuXG4gICAgICBfX3R5cGU6IGZ1bmN0aW9uKGZpeCwgb3JkZXJfaWQsIGNhcl9pZCkge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignS2V5TWdyLicgKyBmaXggKyAnKCkg5Y+C5pWw6Z2e5rOVJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDnrKzkuIDkuKrlj4LmlbDmmK8gcmVwb3J0IEtleU1nclxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgIHJldHVybiBbb3JkZXJfaWQsIGZpeF0uam9pbihLZXlNZ3IuX19jb25uZWN0b3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFtvcmRlcl9pZCwgY2FyX2lkLCBmaXhdLmpvaW4oS2V5TWdyLl9fY29ubmVjdG9yKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgYW5ndWxhci5leHRlbmQoS2V5TWdyLCB7XG4gICAgICBlcnI6IEtleU1nci5fX3R5cGUuYmluZChLZXlNZ3IsICdlcnInKSxcblxuICAgICAgc3RhdHVzOiBLZXlNZ3IuX190eXBlLmJpbmQoS2V5TWdyLCAnc3RhdHVzJyksXG5cbiAgICAgIHN1Ym1pdDogS2V5TWdyLl9fdHlwZS5iaW5kKEtleU1nciwgJ3N1Ym1pdCcpLFxuXG4gICAgICBjbGVhcjogZnVuY3Rpb24ob3JkZXJfaWQsIGNhcl9pZCkge1xuICAgICAgICBsb2NhbFN0b3JhZ2VTZXJ2aWNlLnJlbW92ZShLZXlNZ3IucmVwb3J0KG9yZGVyX2lkLCBjYXJfaWQpKTtcbiAgICAgICAgbG9jYWxTdG9yYWdlU2VydmljZS5yZW1vdmUoS2V5TWdyLnN0YXR1cyhvcmRlcl9pZCwgY2FyX2lkKSk7XG4gICAgICAgIGxvY2FsU3RvcmFnZVNlcnZpY2UucmVtb3ZlKEtleU1nci5zdWJtaXQob3JkZXJfaWQsIGNhcl9pZCkpO1xuICAgICAgICBsb2NhbFN0b3JhZ2VTZXJ2aWNlLnJlbW92ZShLZXlNZ3IuZXJyKG9yZGVyX2lkLCBjYXJfaWQpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICAgIFxuICAgIHJldHVybiBLZXlNZ3I7XG4gIH0pOyIsIi8qIGdsb2JhbCBhbmd1bGFyLCBGaWxlVXBsb2FkT3B0aW9ucywgRmlsZVRyYW5zZmVyKi9cbi8vIOmZhOS7tuS4iuS8oOWZqFxuYW5ndWxhclxuICAubW9kdWxlKCd1dGlsLnVwbG9hZGVyJywgW10pXG4gIC5mYWN0b3J5KCdVcGxvYWRlcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRsb2cpIHtcbiAgICB2YXIgdm0gPSAkcm9vdFNjb3BlO1xuICAgIHZhciBub29wID0gZnVuY3Rpb24oKSB7fTtcblxuICAgIHZhciB1cGxvYWRlciA9IHtcbiAgICAgIC8vIOaJuemHj+S4iuS8oOmZhOS7tlxuICAgICAgLy8g5L6d6LWWICRzY29wZSDnmoQgb2JzZXJ2ZXJcbiAgICAgIC8vIFxuICAgICAgLy8gYXR0YWNobWVudHM6IOmcgOimgeS4iuS8oOeahOmZhOS7tuWIl+ihqFxuICAgICAgLy8gYmFuZHdpZHRoOiDlkIzml7bkuIrkvKDnmoTmlbDph49cbiAgICAgIC8vIGRvbmU6IOaJgOaciemZhOS7tuS4iuS8oOWujOaIkOeahOWbnuiwg+WHveaVsFxuICAgICAgYmF0Y2g6IGZ1bmN0aW9uKG9wdCkge1xuICAgICAgICBpZiAoIW9wdC5hdHRhY2htZW50cyB8fCAhb3B0LnVybCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcign5LiK5Lyg6ZmE5Lu257y65bCR5Y+C5pWwJyk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgY291bnQgPSBvcHQuYXR0YWNobWVudHMubGVuZ3RoO1xuICAgICAgICB2YXIgaW5kZXg7XG4gICAgICAgIHZhciBjb21wbGV0ZWRfY291bnQgPSAwO1xuXG4gICAgICAgIC8vIOayoeaciemZhOS7tlxuICAgICAgICBpZiAoY291bnQgPT09IDApIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZGVmYXVsdE9wdCA9IHtcbiAgICAgICAgICBiYW5kd2lkdGg6IDMsXG4gICAgICAgICAgZG9uZTogbm9vcCxcbiAgICAgICAgICBvbmU6IG5vb3AsXG4gICAgICAgICAgZXJyb3I6IG5vb3BcbiAgICAgICAgfTtcblxuICAgICAgICBvcHQgPSBhbmd1bGFyLmV4dGVuZCh7fSwgZGVmYXVsdE9wdCwgb3B0KTtcblxuICAgICAgICB2YXIgY29tcGxldGUgPSBmdW5jdGlvbihhdHRhY2htZW50KSB7XG4gICAgICAgICAgLy8g5pu05pawIGF0dGFjaG1lbnQg6Kem5Y+R5LiL5LiA5Liq5LiK5LygXG4gICAgICAgICAgYXR0YWNobWVudC51cGxvYWRlZCA9IHRydWU7XG5cbiAgICAgICAgICBvcHQub25lLmFwcGx5KHVwbG9hZGVyLCBhcmd1bWVudHMpO1xuXG4gICAgICAgICAgY29tcGxldGVkX2NvdW50Kys7XG5cbiAgICAgICAgICBvcHQub25wcm9ncmVzcyh7XG4gICAgICAgICAgICBsb2FkZWQ6IGNvbXBsZXRlZF9jb3VudCxcbiAgICAgICAgICAgIHRvdGFsOiBjb3VudCxcbiAgICAgICAgICAgIHBlcmNlbnQ6IHBhcnNlSW50KGNvbXBsZXRlZF9jb3VudCAvIGNvdW50ICogMTAwKVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgaWYgKGluZGV4ID09PSBjb3VudCAtIDEpIHtcbiAgICAgICAgICAgIGlmICh2bS5fX2F0dGFjaG1lbnRzX18pIHtcbiAgICAgICAgICAgICAgdm0uX19hdHRhY2htZW50c19fID0gbnVsbDtcbiAgICAgICAgICAgICAgZGVsZXRlIHZtLl9fYXR0YWNobWVudHNfXztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgb3B0LmRvbmUoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgb3B0LmF0dGFjaG1lbnRzID0gYW5ndWxhci5jb3B5KG9wdC5hdHRhY2htZW50cywgW10pO1xuXG4gICAgICAgIC8vIOWPquacieS4gOS4qumZhOS7tlxuICAgICAgICBpZiAoY291bnQgPT09IDEpIHtcbiAgICAgICAgICBpbmRleCA9IDA7XG4gICAgICAgICAgdXBsb2FkZXIub25lKHtcbiAgICAgICAgICAgIGF0dGFjaG1lbnQ6IG9wdC5hdHRhY2htZW50c1swXSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGNvbXBsZXRlLFxuICAgICAgICAgICAgdXJsOiBvcHQudXJsLFxuICAgICAgICAgICAgZXJyb3I6IG9wdC5lcnJvclxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDpmYTku7bmlbDph4/lsJHkuo7lkIzml7bkuIrkvKDnmoTmlbDph49cbiAgICAgICAgaWYgKGNvdW50IDwgb3B0LmJhbmR3aWR0aCkge1xuICAgICAgICAgIGluZGV4ID0gY291bnQgLSAxO1xuICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgICAgICAgdXBsb2FkZXIub25lKHtcbiAgICAgICAgICAgICAgYXR0YWNobWVudDogb3B0LmF0dGFjaG1lbnRzW2ldLFxuICAgICAgICAgICAgICBzdWNjZXNzOiBjb21wbGV0ZSxcbiAgICAgICAgICAgICAgdXJsOiBvcHQudXJsLFxuICAgICAgICAgICAgICBlcnJvcjogb3B0LmVycm9yXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBcbiAgICAgICAgaW5kZXggPSBvcHQuYmFuZHdpZHRoIC0gMTtcbiAgICAgICAgdm0uX19hdHRhY2htZW50c19fID0gb3B0LmF0dGFjaG1lbnRzO1xuXG4gICAgICAgIC8vIOS4iuS8oOWujOS4gOS4quWQju+8jOS7jiBhdHRhY2htZW50cyDkuK3lj5blh7rkuIvkuIDkuKrkuIrkvKBcbiAgICAgICAgLy8g5aeL57uI5L+d5oyB5ZCM5pe25LiK5Lyg55qE5pWw6YeP5Li6IGJhbmR3aWR0aFxuICAgICAgICB2bS4kd2F0Y2hDb2xsZWN0aW9uKCdfX2F0dGFjaG1lbnRzX18nLCBmdW5jdGlvbihuZXdBdHRhY2htZW50cykge1xuICAgICAgICAgIC8vIOaJuemHj+S4iuS8oOWujOaIkO+8jOS8muWIoOmZpCBfX2F0dGFjaG1lbnRzX19cbiAgICAgICAgICBpZiAoIW5ld0F0dGFjaG1lbnRzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdXBsb2FkZXIub25lKHtcbiAgICAgICAgICAgIGF0dGFjaG1lbnQ6IG9wdC5hdHRhY2htZW50c1srK2luZGV4XSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGNvbXBsZXRlLFxuICAgICAgICAgICAgdXJsOiBvcHQudXJsLFxuICAgICAgICAgICAgZXJyb3I6IG9wdC5lcnJvclxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBmb3IgKHZhciBrID0gMDsgayA8IG9wdC5iYW5kd2lkdGg7IGsrKykge1xuICAgICAgICAgIHVwbG9hZGVyLm9uZSh7XG4gICAgICAgICAgICBhdHRhY2htZW50OiBvcHQuYXR0YWNobWVudHNba10sXG4gICAgICAgICAgICBzdWNjZXNzOiBjb21wbGV0ZSxcbiAgICAgICAgICAgIHVybDogb3B0LnVybCxcbiAgICAgICAgICAgIGVycm9yOiBvcHQuZXJyb3JcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH0sXG5cbiAgICAgIC8vIOWNleS4quS4iuS8oFxuICAgICAgb25lOiBmdW5jdGlvbihvcHQpIHtcbiAgICAgICAgaWYgKCFvcHQuYXR0YWNobWVudCB8fCAhb3B0LnVybCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcign5LiK5Lyg6ZmE5Lu257y65bCR5Y+C5pWwJyk7XG4gICAgICAgIH1cblxuICAgICAgICAkbG9nLmRlYnVnKCdhdHRhY2htZW50OiAnICsgSlNPTi5zdHJpbmdpZnkob3B0LmF0dGFjaG1lbnQpKTtcbiAgICAgICAgXG4gICAgICAgIHZhciBkZWZhdWx0T3B0ID0ge1xuICAgICAgICAgIHN1Y2Nlc3M6IG5vb3AsXG4gICAgICAgICAgZXJyb3I6IG5vb3AsXG4gICAgICAgICAgZmlsZUtleTogJ2ZpbGVLZXknLFxuICAgICAgICAgIGZpbGVOYW1lOiBvcHQuYXR0YWNobWVudC51cmwuc3Vic3RyKG9wdC5hdHRhY2htZW50LnVybC5sYXN0SW5kZXhPZignLycpICsgMSlcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIGN1c3RvbV9vbnByb2dyZXNzID0gb3B0Lm9ucHJvZ3Jlc3M7XG4gICAgICAgIG9wdCA9IGFuZ3VsYXIuZXh0ZW5kKHt9LCBkZWZhdWx0T3B0LCBvcHQpO1xuICAgICAgICBvcHQub25wcm9nZXJzcyA9IGZ1bmN0aW9uKHByb2dyZXNzRXZlbnQpIHtcbiAgICAgICAgICBpZiAocHJvZ3Jlc3NFdmVudC5sZW5ndGhDb21wdXRhYmxlKSB7ICBcbiAgICAgICAgICAgIC8v5bey57uP5LiK5LygICBcbiAgICAgICAgICAgIHZhciBsb2FkZWQgPSBwcm9ncmVzc0V2ZW50LmxvYWRlZDsgIFxuICAgICAgICAgICAgLy/mlofku7bmgLvplb/luqYgIFxuICAgICAgICAgICAgdmFyIHRvdGFsID0gcHJvZ3Jlc3NFdmVudC50b3RhbDsgIFxuICAgICAgICAgICAgLy/orqHnrpfnmb7liIbmr5TvvIznlKjkuo7mmL7npLrov5vluqbmnaEgIFxuICAgICAgICAgICAgdmFyIHBlcmNlbnQgPSBwYXJzZUludCgobG9hZGVkIC8gdG90YWwpICogMTAwKTtcblxuICAgICAgICAgICAgY3VzdG9tX29ucHJvZ3Jlc3Moe1xuICAgICAgICAgICAgICBsb2FkZWQ6IGxvYWRlZCxcbiAgICAgICAgICAgICAgdG90YWw6IHRvdGFsLFxuICAgICAgICAgICAgICBwZXJjZW50OiBwZXJjZW50XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICB2YXIgZlVPcHRzID0gbmV3IEZpbGVVcGxvYWRPcHRpb25zKCk7XG4gICAgICAgIGZVT3B0cy5maWxlS2V5ID0gb3B0LmZpbGVLZXk7XG4gICAgICAgIGZVT3B0cy5maWxlTmFtZSA9IG9wdC5maWxlTmFtZTtcblxuICAgICAgICB2YXIgZnQgPSBuZXcgRmlsZVRyYW5zZmVyKCk7XG4gICAgICAgIGZ0Lm9ucHJvZ3Jlc3MgPSBvcHQub25wcm9ncmVzcztcbiAgICAgICAgZnQudXBsb2FkKFxuICAgICAgICAgIG9wdC5hdHRhY2htZW50LnVybCxcbiAgICAgICAgICBlbmNvZGVVUkkob3B0LnVybCksXG4gICAgICAgICAgb3B0LnN1Y2Nlc3MuYmluZCh1cGxvYWRlciwgb3B0LmF0dGFjaG1lbnQpLFxuICAgICAgICAgIG9wdC5lcnJvci5iaW5kKHVwbG9hZGVyLCBvcHQuYXR0YWNobWVudCksXG4gICAgICAgICAgZlVPcHRzXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfTtcbiAgICBcbiAgICByZXR1cm4gdXBsb2FkZXI7IFxuICB9KTtcbiIsIi8vICRzY29wZSDlop7lvLpcbmFuZ3VsYXJcbiAgLm1vZHVsZSgndXRpbC52bScsIFtdKVxuICAuZmFjdG9yeSgnVk0nLCBmdW5jdGlvbiAoJGxvZykge1xuICAgIHJldHVybiB7XG4gICAgICB0b19qc29uOiBmdW5jdGlvbih2bSwgZmllbGRzKSB7XG4gICAgICAgIHZhciByZXQgPSB7fTtcblxuICAgICAgICBpZiAoYW5ndWxhci5pc1N0cmluZyhmaWVsZHMpKSB7XG4gICAgICAgICAgZmllbGRzID0gZmllbGRzLnNwbGl0KCcsJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZmllbGRzLmxlbmd0aCA9PT0gMSAmJiBmaWVsZHNbMF0gPT09ICcnKSB7XG4gICAgICAgICAgJGxvZy53YXJuKCfmgqjosIPnlKjmlrnms5UgVk0udG9fanNvbiDml7bvvIzmsqHmnInkvKDlhaUgZmllbGRzIOWPguaVsCcpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghYW5ndWxhci5pc0FycmF5KGZpZWxkcykpIHtcbiAgICAgICAgICAkbG9nLmVycm9yKCfmlrnms5UgVk0udG9fanNvbiDlj6rmjqXlj5flrZfnrKbkuLLmlbDnu4TmiJbpgJflj7fliIbpmpTnmoTlrZfnrKbkuLLmiJbkuIDkuKrkuI3lkKvpgJflj7fnmoTlrZfnrKbkuLInKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBmaWVsZHMubWFwKGZ1bmN0aW9uKGZpZWxkKSB7XG4gICAgICAgICAgcmV0dXJuIHJldFtmaWVsZF0gPSB2bVtmaWVsZF07XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgICB9XG4gICAgfTtcbiAgfSk7IiwiJ3VzZSBzdHJpY3QnO1xuYW5ndWxhci5tb2R1bGUoXCJuZ0xvY2FsZVwiLCBbXSwgW1wiJHByb3ZpZGVcIiwgZnVuY3Rpb24oJHByb3ZpZGUpIHtcbiAgdmFyIFBMVVJBTF9DQVRFR09SWSA9IHtcbiAgICBaRVJPOiBcInplcm9cIixcbiAgICBPTkU6IFwib25lXCIsXG4gICAgVFdPOiBcInR3b1wiLFxuICAgIEZFVzogXCJmZXdcIixcbiAgICBNQU5ZOiBcIm1hbnlcIixcbiAgICBPVEhFUjogXCJvdGhlclwiXG4gIH07XG4gICRwcm92aWRlLnZhbHVlKFwiJGxvY2FsZVwiLCB7XG4gICAgXCJEQVRFVElNRV9GT1JNQVRTXCI6IHtcbiAgICAgIFwiQU1QTVNcIjogW1xuICAgICAgICBcIlxcdTRlMGFcXHU1MzQ4XCIsXG4gICAgICAgIFwiXFx1NGUwYlxcdTUzNDhcIlxuICAgICAgXSxcbiAgICAgIFwiREFZXCI6IFtcbiAgICAgICAgXCJcXHU2NjFmXFx1NjcxZlxcdTY1ZTVcIixcbiAgICAgICAgXCJcXHU2NjFmXFx1NjcxZlxcdTRlMDBcIixcbiAgICAgICAgXCJcXHU2NjFmXFx1NjcxZlxcdTRlOGNcIixcbiAgICAgICAgXCJcXHU2NjFmXFx1NjcxZlxcdTRlMDlcIixcbiAgICAgICAgXCJcXHU2NjFmXFx1NjcxZlxcdTU2ZGJcIixcbiAgICAgICAgXCJcXHU2NjFmXFx1NjcxZlxcdTRlOTRcIixcbiAgICAgICAgXCJcXHU2NjFmXFx1NjcxZlxcdTUxNmRcIlxuICAgICAgXSxcbiAgICAgIFwiTU9OVEhcIjogW1xuICAgICAgICBcIjFcXHU2NzA4XCIsXG4gICAgICAgIFwiMlxcdTY3MDhcIixcbiAgICAgICAgXCIzXFx1NjcwOFwiLFxuICAgICAgICBcIjRcXHU2NzA4XCIsXG4gICAgICAgIFwiNVxcdTY3MDhcIixcbiAgICAgICAgXCI2XFx1NjcwOFwiLFxuICAgICAgICBcIjdcXHU2NzA4XCIsXG4gICAgICAgIFwiOFxcdTY3MDhcIixcbiAgICAgICAgXCI5XFx1NjcwOFwiLFxuICAgICAgICBcIjEwXFx1NjcwOFwiLFxuICAgICAgICBcIjExXFx1NjcwOFwiLFxuICAgICAgICBcIjEyXFx1NjcwOFwiXG4gICAgICBdLFxuICAgICAgXCJTSE9SVERBWVwiOiBbXG4gICAgICAgIFwiXFx1NTQ2OFxcdTY1ZTVcIixcbiAgICAgICAgXCJcXHU1NDY4XFx1NGUwMFwiLFxuICAgICAgICBcIlxcdTU0NjhcXHU0ZThjXCIsXG4gICAgICAgIFwiXFx1NTQ2OFxcdTRlMDlcIixcbiAgICAgICAgXCJcXHU1NDY4XFx1NTZkYlwiLFxuICAgICAgICBcIlxcdTU0NjhcXHU0ZTk0XCIsXG4gICAgICAgIFwiXFx1NTQ2OFxcdTUxNmRcIlxuICAgICAgXSxcbiAgICAgIFwiU0hPUlRNT05USFwiOiBbXG4gICAgICAgIFwiMVxcdTY3MDhcIixcbiAgICAgICAgXCIyXFx1NjcwOFwiLFxuICAgICAgICBcIjNcXHU2NzA4XCIsXG4gICAgICAgIFwiNFxcdTY3MDhcIixcbiAgICAgICAgXCI1XFx1NjcwOFwiLFxuICAgICAgICBcIjZcXHU2NzA4XCIsXG4gICAgICAgIFwiN1xcdTY3MDhcIixcbiAgICAgICAgXCI4XFx1NjcwOFwiLFxuICAgICAgICBcIjlcXHU2NzA4XCIsXG4gICAgICAgIFwiMTBcXHU2NzA4XCIsXG4gICAgICAgIFwiMTFcXHU2NzA4XCIsXG4gICAgICAgIFwiMTJcXHU2NzA4XCJcbiAgICAgIF0sXG4gICAgICBcImZ1bGxEYXRlXCI6IFwieVxcdTVlNzRNXFx1NjcwOGRcXHU2NWU1RUVFRVwiLFxuICAgICAgXCJsb25nRGF0ZVwiOiBcInlcXHU1ZTc0TVxcdTY3MDhkXFx1NjVlNVwiLFxuICAgICAgXCJtZWRpdW1cIjogXCJ5eXl5LU0tZCBhaDptbTpzc1wiLFxuICAgICAgXCJtZWRpdW1EYXRlXCI6IFwieXl5eS1NLWRcIixcbiAgICAgIFwibWVkaXVtVGltZVwiOiBcImFoOm1tOnNzXCIsXG4gICAgICBcInNob3J0XCI6IFwieXktTS1kIGFoOm1tXCIsXG4gICAgICBcInNob3J0RGF0ZVwiOiBcInl5LU0tZFwiLFxuICAgICAgXCJzaG9ydFRpbWVcIjogXCJhaDptbVwiXG4gICAgfSxcbiAgICBcIk5VTUJFUl9GT1JNQVRTXCI6IHtcbiAgICAgIFwiQ1VSUkVOQ1lfU1lNXCI6IFwiXFx1MDBhNVwiLFxuICAgICAgXCJERUNJTUFMX1NFUFwiOiBcIi5cIixcbiAgICAgIFwiR1JPVVBfU0VQXCI6IFwiLFwiLFxuICAgICAgXCJQQVRURVJOU1wiOiBbe1xuICAgICAgICBcImdTaXplXCI6IDMsXG4gICAgICAgIFwibGdTaXplXCI6IDMsXG4gICAgICAgIFwibWFjRnJhY1wiOiAwLFxuICAgICAgICBcIm1heEZyYWNcIjogMyxcbiAgICAgICAgXCJtaW5GcmFjXCI6IDAsXG4gICAgICAgIFwibWluSW50XCI6IDEsXG4gICAgICAgIFwibmVnUHJlXCI6IFwiLVwiLFxuICAgICAgICBcIm5lZ1N1ZlwiOiBcIlwiLFxuICAgICAgICBcInBvc1ByZVwiOiBcIlwiLFxuICAgICAgICBcInBvc1N1ZlwiOiBcIlwiXG4gICAgICB9LCB7XG4gICAgICAgIFwiZ1NpemVcIjogMyxcbiAgICAgICAgXCJsZ1NpemVcIjogMyxcbiAgICAgICAgXCJtYWNGcmFjXCI6IDAsXG4gICAgICAgIFwibWF4RnJhY1wiOiAyLFxuICAgICAgICBcIm1pbkZyYWNcIjogMixcbiAgICAgICAgXCJtaW5JbnRcIjogMSxcbiAgICAgICAgXCJuZWdQcmVcIjogXCIoXFx1MDBhNFwiLFxuICAgICAgICBcIm5lZ1N1ZlwiOiBcIilcIixcbiAgICAgICAgXCJwb3NQcmVcIjogXCJcXHUwMGE0XCIsXG4gICAgICAgIFwicG9zU3VmXCI6IFwiXCJcbiAgICAgIH1dXG4gICAgfSxcbiAgICBcImlkXCI6IFwiemgtY25cIixcbiAgICBcInBsdXJhbENhdFwiOiBmdW5jdGlvbihuKSB7XG4gICAgICByZXR1cm4gUExVUkFMX0NBVEVHT1JZLk9USEVSO1xuICAgIH1cbiAgfSk7XG59XSk7XG4iLCIvLyA0MDQg6aG16Z2iXG4vLyBNb2R1bGU6IGd1bHUubWlzc2luZ1xuLy8gRGVwZW5kZW5jaWVzOiBuZ1JvdXRlXG5cbmFuZ3VsYXJcbiAgLm1vZHVsZSgnZ3VsdS5taXNzaW5nJywgWyd1aS5yb3V0ZXInXSlcblxuICAvLyDphY3nva4gcm91dGVcbiAgLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlclxuICAgICAgLnN0YXRlKCdtaXNzaW5nJywge1xuICAgICAgICB1cmw6ICcvbWlzc2luZycsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnNDA0LzQwNC5odG0nLFxuICAgICAgICBjb250cm9sbGVyOiAnTWlzc2luZ0N0cmwnXG4gICAgICB9KTtcbiAgfSlcblxuICAvLyA0MDQgY29udHJvbGxlclxuICAuY29udHJvbGxlcignTWlzc2luZ0N0cmwnLCBmdW5jdGlvbiAoJHNjb3BlKSB7XG4gICAgY29uc29sZS5sb2coJ0lgbSBoZXJlJyk7XG4gICAgLy8gVE9ETzpcbiAgICAvLyAxLiBzaG93IGxhc3QgcGF0aCBhbmQgcGFnZSBuYW1lXG4gIH0pO1xuIiwiYW5ndWxhclxuICAubW9kdWxlKCdndWx1LmluZGVudC5lbnVtcycsIFsndXRpbC5lbnVtcycsIF0pXG5cbi5mYWN0b3J5KCdJbmRlbnRFbnVtcycsIGZ1bmN0aW9uKEVudW1zLCBJbmRlbnRFbnVtc1N2YywgdG9hc3RyKSB7XG4gIHJldHVybiBJbmRlbnRFbnVtc1N2Y1xuICAgICAgLmdldCgpXG4gICAgICAuJHByb21pc2VcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICB2YXIgYWxsX3ByZWlucyA9ICdvcmRlcl90eXBlIG9yZGVyX3N0YXR1cyBjaXR5IGluc3BlY3RvciB1c2VyX3R5cGUgb3JkZXJfdGhyb3VnaCcuc3BsaXQoJyAnKTtcblxuICAgICAgICBhbGxfcHJlaW5zLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgcmVzW2tleV0udW5zaGlmdCh7XG4gICAgICAgICAgICB0ZXh0OiAn5YWo6YOoJyxcbiAgICAgICAgICAgIHZhbHVlOiBudWxsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJlc1snc2l6ZSddID0gW3tcbiAgICAgICAgICB0ZXh0OiAxMCxcbiAgICAgICAgICB2YWx1ZTogMTBcbiAgICAgICAgfSwge1xuICAgICAgICAgIHRleHQ6IDE1LFxuICAgICAgICAgIHZhbHVlOiAxNVxuICAgICAgICB9LCB7XG4gICAgICAgICAgdGV4dDogMjAsXG4gICAgICAgICAgdmFsdWU6IDIwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICB0ZXh0OiA1MCxcbiAgICAgICAgICB2YWx1ZTogNTBcbiAgICAgICAgfSwge1xuICAgICAgICAgIHRleHQ6IDEwMCxcbiAgICAgICAgICB2YWx1ZTogMTAwXG4gICAgICAgIH1dO1xuXG4gICAgICAgIHJldHVybiBFbnVtcyhyZXMudG9KU09OKCkpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgdG9hc3RyLmVycm9yKHJlcy5tc2cgfHwgJ+iOt+WPluaemuS4vuWksei0pScpO1xuICAgICAgfSk7XG59KTtcbiIsImFuZ3VsYXJcbiAgLm1vZHVsZSgnZ3VsdS5pbmRlbnQuc3ZjcycsIFsnbmdSZXNvdXJjZSddKVxuXG4gIC5zZXJ2aWNlKCdJbmRlbnRFbnVtc1N2YycsIGZ1bmN0aW9uKCRyZXNvdXJjZSkge1xuICAgIHJldHVybiAkcmVzb3VyY2UoQVBJX1NFUlZFUlMudGVzdGVyICsgJy9wYXJhbWV0ZXJzJyk7XG4gIH0pXG4gIFxuICAuc2VydmljZSgnSW5kZW50c1N2YycsIGZ1bmN0aW9uKCRyZXNvdXJjZSkge1xuICAgIHJldHVybiAkcmVzb3VyY2UoQVBJX1NFUlZFUlMudGVzdGVyICsgJy9vcmRlcnMnLCB7fSwge1xuICAgICAgcXVlcnk6IHtcbiAgICAgICAgaXNBcnJheTogZmFsc2VcbiAgICAgIH1cbiAgICB9KTtcbiAgfSlcblxuICAuc2VydmljZSgnSW5kZW50U3ZjJywgZnVuY3Rpb24oJHJlc291cmNlKSB7XG4gICAgcmV0dXJuICRyZXNvdXJjZShBUElfU0VSVkVSUy50ZXN0ZXIgKyAnL29yZGVyLzppZCcsIHtcbiAgICAgIGlkOiAnQGlkJ1xuICAgIH0sIHtcbiAgICAgIHVwZGF0ZToge1xuICAgICAgICBtZXRob2Q6ICdQVVQnXG4gICAgICB9XG4gICAgfSk7XG4gIH0pXG5cbiAgLnNlcnZpY2UoJ0luZGVudEFjY2VwdFN2YycsIGZ1bmN0aW9uKCRyZXNvdXJjZSkge1xuICAgIHJldHVybiAkcmVzb3VyY2UoQVBJX1NFUlZFUlMudGVzdGVyICsgJy9vcmRlci86aWQvaW5zcGVjdG9yX2FjY2VwdGVkJywge1xuICAgICAgaWQ6ICdAaWQnXG4gICAgfSwge1xuICAgICAgdXBkYXRlOiB7XG4gICAgICAgIG1ldGhvZDogJ1BVVCdcbiAgICAgIH1cbiAgICB9KTtcbiAgfSlcblxuICAuc2VydmljZSgnSW5kZW50UmV2b2tlUmVxdWVzdFN2YycsIGZ1bmN0aW9uKCRyZXNvdXJjZSkge1xuICAgIHJldHVybiAkcmVzb3VyY2UoQVBJX1NFUlZFUlMudGVzdGVyICsgJy9vcmRlci86aWQvcmV2b2tlX3JlcXVlc3RlZCcsIHtcbiAgICAgIGlkOiAnQGlkJ1xuICAgIH0sIHtcbiAgICAgIHVwZGF0ZToge1xuICAgICAgICBtZXRob2Q6ICdQVVQnXG4gICAgICB9XG4gICAgfSk7XG4gIH0pXG5cbiAgLnNlcnZpY2UoJ1Rlc3RlcnNTdmMnLCBmdW5jdGlvbigkcmVzb3VyY2UpIHtcbiAgICByZXR1cm4gJHJlc291cmNlKEFQSV9TRVJWRVJTLnRlc3RlciArICcvdGVzdGVycycsIHt9LCB7XG4gICAgICBxdWVyeToge1xuICAgICAgICBpc0FycmF5OiBmYWxzZVxuICAgICAgfVxuICAgIH0pO1xuICB9KVxuXG4gIC5zZXJ2aWNlKCdVbnRlc3RlZEluZGVudHNTdmMnLCBmdW5jdGlvbigkcmVzb3VyY2UpIHtcbiAgICByZXR1cm4gJHJlc291cmNlKEFQSV9TRVJWRVJTLnRlc3RlciArICcvb3JkZXJzL2luc3BlY3Rvcl90YXNrX3RvZGF5Jyk7XG4gIH0pXG5cbiAgLnNlcnZpY2UoJ0luZGVudENhcnNTdmMnLCBmdW5jdGlvbigkcmVzb3VyY2UpIHtcbiAgICByZXR1cm4gJHJlc291cmNlKEFQSV9TRVJWRVJTLnRlc3RlciArICcvb3JkZXIvOm9yZGVyX2lkL2NhcicsIHtcbiAgICAgIG9yZGVyX2lkOiAnQG9yZGVyX2lkJ1xuICAgIH0pXG4gIH0pXG5cbiAgLnNlcnZpY2UoJ0luZGVudENhclN2YycsIGZ1bmN0aW9uKCRyZXNvdXJjZSkge1xuICAgIHJldHVybiAkcmVzb3VyY2UoQVBJX1NFUlZFUlMudGVzdGVyICsgJy9vcmRlci86b3JkZXJfaWQvY2FyLzpjYXJfaWQnLCB7XG4gICAgICBvcmRlcl9pZDogJ0BvcmRlcl9pZCcsXG4gICAgICBjYXJfaWQ6ICdAY2FyX2lkJ1xuICAgIH0sIHtcbiAgICAgIHVwZGF0ZToge1xuICAgICAgICBtZXRob2Q6ICdQVVQnXG4gICAgICB9XG4gICAgfSk7XG4gIH0pOyIsIi8qIGdsb2JhbCBhbmd1bGFyLCBjb25maXJtLCBfICovXG5hbmd1bGFyXG4gIC5tb2R1bGUoJ2d1bHUuaW5kZW50JylcbiAgXG4gIC5jb250cm9sbGVyKCdJbmRlbnRMaXN0Q3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJGxvY2F0aW9uLCB0b2FzdHIsICRtb2RhbCxcbiAgICBJbmRlbnRzU3ZjLCBJbmRlbnRTdmMsIEluZGVudEFjY2VwdFN2YywgSW5kZW50RW51bXMpIHtcbiAgICB2YXIgdm0gPSAkc2NvcGU7XG4gICAgdmFyIHFzbyA9ICRsb2NhdGlvbi5zZWFyY2goKTtcblxuICAgIHZtLnN0YXR1c19pZCA9IHBhcnNlSW50KHFzby5zdGF0dXNfaWQpIHx8IG51bGw7XG4gICAgXG4gICAgaWYgKHZtLiRzdGF0ZS5pbmNsdWRlcygnaW5kZW50cy51bmNvbmZpcm1lZCcpKSB7XG4gICAgICB2bS5zdGF0dXNfaWQgPSA0O1xuICAgIH0gZWxzZSB7XG4gICAgICB2bS5jaXR5X2lkID0gcGFyc2VJbnQocXNvLmNpdHlfaWQpIHx8IG51bGw7XG4gICAgICB2bS5pbnNwZWN0b3JfaWQgPSBwYXJzZUludChxc28uaW5zcGVjdG9yX2lkKSB8fCBudWxsO1xuICAgICAgLy8gdm0ucm9sZV9pZCA9IHBhcnNlSW50KHFzby5yb2xlX2lkKSB8fCBudWxsO1xuICAgICAgdm0ucmVxdWVzdGVyX21vYmlsZSA9IHFzby5yZXF1ZXN0ZXJfbW9iaWxlIHx8IG51bGw7XG5cbiAgICAgIHZtLnN0YXR1cyA9IEluZGVudEVudW1zLml0ZW0oJ29yZGVyX3N0YXR1cycsIHZtLnN0YXR1c19pZCk7XG4gICAgICB2bS5zdGF0dXNfbGlzdCA9IEluZGVudEVudW1zLmxpc3QoJ29yZGVyX3N0YXR1cycpO1xuICAgICAgdm0uY2l0eSA9IEluZGVudEVudW1zLml0ZW0oJ2NpdHknLCB2bS5jaXR5X2lkKTtcbiAgICAgIHZtLmNpdHlfbGlzdCA9IEluZGVudEVudW1zLmxpc3QoJ2NpdHknKTtcbiAgICAgIC8vIHZtLnJvbGUgPSBJbmRlbnRFbnVtcy5pdGVtKCdyb2xlJywgdm0ucm9sZV9pZCk7XG4gICAgICAvLyB2bS5yb2xlX2xpc3QgPSBJbmRlbnRFbnVtcy5saXN0KCdyb2xlJyk7XG4gICAgICB2bS5pbnNwZWN0b3IgPSBJbmRlbnRFbnVtcy5pdGVtKCdpbnNwZWN0b3InLCB2bS5pbnNwZWN0b3JfaWQpO1xuICAgICAgdm0uaW5zcGVjdG9yX2xpc3QgPSBJbmRlbnRFbnVtcy5saXN0KCdpbnNwZWN0b3InKTtcblxuICAgICAgd2F0Y2hfbGlzdCgnc3RhdHVzJywgJ3N0YXR1c19pZCcpO1xuICAgICAgd2F0Y2hfbGlzdCgnY2l0eScsICdjaXR5X2lkJyk7XG4gICAgICAvLyB3YXRjaF9saXN0KCdyb2xlJywgJ3JvbGVfaWQnKTtcbiAgICAgIHdhdGNoX2xpc3QoJ2luc3BlY3RvcicsICdpbnNwZWN0b3JfaWQnKTtcblxuICAgICAgdm0uc2VhcmNoID0gc2VhcmNoO1xuICAgIH1cblxuICAgIHZtLnBhZ2UgPSBwYXJzZUludChxc28ucGFnZSkgfHwgMTtcbiAgICB2bS5zaXplID0gcGFyc2VJbnQocXNvLnNpemUpIHx8IDIwO1xuICAgIHZtLnNpemVzID0gSW5kZW50RW51bXMubGlzdCgnc2l6ZScpO1xuICAgIHZtLnNpemVfaXRlbSA9IEluZGVudEVudW1zLml0ZW0oJ3NpemUnLCB2bS5zaXplKTtcblxuICAgIHZtLnNpemVfY2hhbmdlID0gc2l6ZV9jaGFuZ2U7XG4gICAgdm0ucGFnZV9jaGFuZ2UgPSBwYWdlX2NoYW5nZTtcbiAgICB2bS5jYW5jZWxfb3JkZXIgPSBjYW5jZWxfb3JkZXI7XG4gICAgdm0uY29uZmlybV9vcmRlciA9IGNvbmZpcm1fb3JkZXI7XG5cbiAgICBxdWVyeSgpO1xuXG4gICAgZnVuY3Rpb24gcXVlcnkoKSB7XG4gICAgICB2YXIgcGFyYW1zID0ge1xuICAgICAgICBjaXR5X2lkOiB2bS5jaXR5X2lkLFxuICAgICAgICBpdGVtc19wYWdlOiB2bS5zaXplLFxuICAgICAgICBwYWdlOiB2bS5wYWdlLFxuXG4gICAgICAgIHN0YXR1c19pZDogdm0uc3RhdHVzX2lkXG4gICAgICB9O1xuXG4gICAgICBpZiAodm0uJHN0YXRlLmluY2x1ZGVzKCdpbmRlbnRzLmxpc3QnKSkge1xuICAgICAgICBhbmd1bGFyLmV4dGVuZChwYXJhbXMsIHtcbiAgICAgICAgICBjaXR5X2lkOiB2bS5jaXR5X2lkLFxuICAgICAgICAgIGluc3BlY3Rvcl9pZDogdm0uaW5zcGVjdG9yX2lkLFxuICAgICAgICAgIC8vIHJvbGVfaWQ6IHZtLnJvbGVfaWQsXG4gICAgICAgICAgcmVxdWVzdGVyX21vYmlsZTogdm0ucmVxdWVzdGVyX21vYmlsZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgJGxvY2F0aW9uLnNlYXJjaChwYXJhbXMpO1xuXG4gICAgICBJbmRlbnRzU3ZjXG4gICAgICAgIC5xdWVyeShwYXJhbXMpXG4gICAgICAgIC4kcHJvbWlzZVxuICAgICAgICAudGhlbihmdW5jdGlvbihycykge1xuICAgICAgICAgIHJzLml0ZW1zLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgaXRlbS5zdGF0dXNfdGV4dCA9IEluZGVudEVudW1zLnRleHQoJ29yZGVyX3N0YXR1cycsIGl0ZW0uc3RhdHVzX2lkKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHZtLml0ZW1zID0gcnMuaXRlbXM7XG4gICAgICAgICAgdm0udG90YWxfY291bnQgPSBycy50b3RhbF9jb3VudDtcblxuICAgICAgICAgIHZhciB0bXAgPSBycy50b3RhbF9jb3VudCAvIHZtLnNpemU7XG4gICAgICAgICAgdm0ucGFnZV9jb3VudCA9IHJzLnRvdGFsX2NvdW50ICUgdm0uc2l6ZSA9PT0gMCA/IHRtcCA6IChNYXRoLmZsb29yKHRtcCkgKyAxKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIHRvYXN0ci5lcnJvcihyZXMuZGF0YS5tc2cgfHwgJ+afpeivouWksei0pe+8jOacjeWKoeWZqOWPkeeUn+acquefpemUmeivr++8jOivt+mHjeivlScpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB3YXRjaF9saXN0KG5hbWUsIGZpZWxkKSB7XG4gICAgICB2bS4kd2F0Y2gobmFtZSwgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICBpZiAoIWl0ZW0pIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2bVtmaWVsZF0gPSBpdGVtLnZhbHVlO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8g56Gu6K6k6K6i5Y2VXG4gICAgZnVuY3Rpb24gY29uZmlybV9vcmRlcihpdGVtKSB7XG4gICAgICBpZiAoY29uZmlybSgn56Gu6K6k5o6l5Y+X6K+l6K6i5Y2VPycpKSB7XG4gICAgICAgIEluZGVudEFjY2VwdFN2Y1xuICAgICAgICAgIC51cGRhdGUoe1xuICAgICAgICAgICAgaWQ6IGl0ZW0uaWRcbiAgICAgICAgICB9KVxuICAgICAgICAgIC4kcHJvbWlzZVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgdG9hc3RyLnN1Y2Nlc3MocmVzLm1zZyB8fCAn56Gu6K6k6K6i5Y2V5oiQ5YqfJyk7XG5cbiAgICAgICAgICAgIHF1ZXJ5KCk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICB0b2FzdHIuZXJyb3IocmVzLm1zZyB8fCAn56Gu6K6k6K6i5Y2V5aSx6LSl77yM6K+36YeN6K+VJyk7XG4gICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8g5Y+W5raI6K6i5Y2VXG4gICAgZnVuY3Rpb24gY2FuY2VsX29yZGVyKGl0ZW0pIHtcbiAgICAgIHZhciBjYW5jZWxfb3JkZXJfaW5zID0gJG1vZGFsLm9wZW4oe1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2luZGVudC9jYW5jZWxfb3JkZXIuaHRtJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0NhbmNlbE9yZGVyQ3RybCcsXG4gICAgICAgIGJhY2tkcm9wOiAnc3RhdGljJyxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgIGluZGVudF9pbmZvOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGNhbmNlbF9vcmRlcl9pbnMucmVzdWx0LnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIFRPRE86XG4gICAgICAgIC8vIOabtOaWsOmihOe6puWNleeKtuaAgVxuICAgICAgICBxdWVyeSgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8g5q+P6aG15p2h5pWw5pS55Y+YXG4gICAgZnVuY3Rpb24gc2l6ZV9jaGFuZ2Uoc2l6ZSkge1xuICAgICAgdm0uc2l6ZSA9IHNpemU7XG4gICAgICB2bS5wYWdlID0gMTtcblxuICAgICAgcXVlcnkoKTtcbiAgICB9XG5cbiAgICAvLyDnv7vpobVcbiAgICBmdW5jdGlvbiBwYWdlX2NoYW5nZShwYWdlKSB7XG4gICAgICB2bS5wYWdlID0gcGFnZTtcblxuICAgICAgcXVlcnkoKTtcbiAgICB9XG5cbiAgICAvLyDmn6Xor6Lmj5DkuqRcbiAgICBmdW5jdGlvbiBzZWFyY2goKSB7XG4gICAgICB2bS5wYWdlID0gMTtcblxuICAgICAgcXVlcnkoKTtcbiAgICB9XG4gIH0pXG5cbiAgLmNvbnRyb2xsZXIoJ1VudGVzdGVkSW5kZW50TGlzdEN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRsb2csICRsb2NhdGlvbiwgJG1vZGFsLCAkdGVtcGxhdGVDYWNoZSwgdG9hc3RyLFxuICAgIEZpbGVyLCBVcGxvYWRlciwgS2V5TWdyLCBsb2NhbFN0b3JhZ2VTZXJ2aWNlLCBVbnRlc3RlZEluZGVudHNTdmMsIEluZGVudEVudW1zLFxuICAgIEluZGVudENhclN2YywgUmVwb3J0U3ZjKSB7XG4gICAgdmFyIHZtID0gJHNjb3BlO1xuICAgIHZhciBwYXJ0cyA9IEpTT04ucGFyc2UoJHRlbXBsYXRlQ2FjaGUuZ2V0KCdyZXBvcnQvaS5qc29uJykpO1xuXG4gICAgaWYgKHBhcnRzICYmIHBhcnRzLmxlbmd0aCkge1xuICAgICAgdm0uZmlyc3RfcGFydF9pZCA9IHBhcnRzWzBdLmlkO1xuICAgIH1cblxuICAgIHZtLmNhbmNlbF9vcmRlciA9IGNhbmNlbF9vcmRlcjtcbiAgICB2bS5kZWxfY2FyID0gZGVsX2NhcjtcbiAgICB2bS5lZGl0X2NhciA9IGVkaXRfY2FyO1xuICAgIHZtLnVwbG9hZF9yZXBvcnQgPSB1cGxvYWRfcmVwb3J0O1xuICAgIHZtLmNsZWFyX2xvY2FsID0gY2xlYXJfbG9jYWw7XG5cbiAgICBxdWVyeSgpO1xuXG4gICAgZnVuY3Rpb24gcXVlcnkoKSB7XG4gICAgICByZXR1cm4gVW50ZXN0ZWRJbmRlbnRzU3ZjXG4gICAgICAgIC5xdWVyeSgpXG4gICAgICAgIC4kcHJvbWlzZVxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICByZXMuZm9yRWFjaChmdW5jdGlvbihvcmRlcikge1xuICAgICAgICAgICAgb3JkZXIuYXV0by5mb3JFYWNoKGZ1bmN0aW9uKGNhcikge1xuICAgICAgICAgICAgICB2YXIgcmVwb3J0X3N0YXR1c19rZXkgPSBLZXlNZ3Iuc3RhdHVzKG9yZGVyLmlkLCBjYXIuaWQpO1xuICAgICAgICAgICAgICBjYXIucmVwb3J0X3N0YXR1cyA9IGxvY2FsU3RvcmFnZVNlcnZpY2UuZ2V0KHJlcG9ydF9zdGF0dXNfa2V5KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgdm0uaXRlbXMgPSByZXM7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICB0b2FzdHIuZXJyb3IocmVzLm1zZyB8fCAn6I635Y+W5b6F5qOA5rWL6K6i5Y2V5aSx6LSlJyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIOWKoOi9piDmiJYg57yW6L6R6L2mXG4gICAgZnVuY3Rpb24gZWRpdF9jYXIoaWQsIGNhcikge1xuICAgICAgdmFyIGVkaXRfY2FyX2lucyA9ICRtb2RhbC5vcGVuKHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdpbmRlbnQvZWRpdF9jYXIuaHRtJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0luZGVudENhckVkaXRDdHJsJyxcbiAgICAgICAgYmFja2Ryb3A6ICdzdGF0aWMnLFxuICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgSW5kZW50RW51bXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIEluZGVudEVudW1zO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgaW5kZW50X2luZm86IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgaWQ6IGlkLFxuICAgICAgICAgICAgICBjYXI6IGNhclxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBlZGl0X2Nhcl9pbnMucmVzdWx0LnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIHF1ZXJ5KCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyDliKDpmaTovaZcbiAgICBmdW5jdGlvbiBkZWxfY2FyKG9yZGVyX2lkLCBjYXIpIHtcbiAgICAgIGlmIChjb25maXJtKCfnoa7orqTliKDpmaQgXCInICsgW2Nhci5icmFuZCwgY2FyLnNlcmllcywgY2FyLm1vZGVsXS5qb2luKCctJykgKyAnXCInKSkge1xuICAgICAgICByZXR1cm4gSW5kZW50Q2FyU3ZjXG4gICAgICAgICAgLnJlbW92ZSh7XG4gICAgICAgICAgICBvcmRlcl9pZDogb3JkZXJfaWQsXG4gICAgICAgICAgICBjYXJfaWQ6IGNhci5pZFxuICAgICAgICAgIH0pXG4gICAgICAgICAgLiRwcm9taXNlXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICBLZXlNZ3IuY2xlYXIob3JkZXJfaWQsIGNhci5pZCk7XG5cbiAgICAgICAgICAgIHRvYXN0ci5zdWNjZXNzKHJlcy5tc2cgfHwgJ+WIoOmZpOi9puaIkOWKnycpO1xuXG4gICAgICAgICAgICBxdWVyeSgpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgdG9hc3RyLmVycm9yKHJlcy5tc2cgfHwgJ+WIoOmZpOi9puWksei0pe+8jOivt+mHjeivlScpO1xuICAgICAgICAgIH0pOyAgXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8g5riF6ZmkbG9jYWxcbiAgICBmdW5jdGlvbiBjbGVhcl9sb2NhbChvcmRlcl9pZCwgY2FyKSB7XG4gICAgICBLZXlNZ3IuY2xlYXIob3JkZXJfaWQsIGNhci5pZCk7XG4gICAgICB0b2FzdHIuc3VjY2Vzcygn5riF55CG5pys5Zyw5pWw5o2u5a6M5oiQJyk7XG4gICAgfVxuXG4gICAgLy8g5Y+W5raI6K6i5Y2VXG4gICAgZnVuY3Rpb24gY2FuY2VsX29yZGVyKGl0ZW0pIHtcbiAgICAgIHZhciBjYW5jZWxfb3JkZXJfaW5zID0gJG1vZGFsLm9wZW4oe1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2luZGVudC9jYW5jZWxfb3JkZXIuaHRtJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0NhbmNlbE9yZGVyQ3RybCcsXG4gICAgICAgIGJhY2tkcm9wOiAnc3RhdGljJyxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgIGluZGVudF9pbmZvOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGNhbmNlbF9vcmRlcl9pbnMucmVzdWx0LnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIOWIoOmZpOaJgOacieacrOWcsOaKpeWRiuebuOWFs+aVsOaNrlxuICAgICAgICBpdGVtLmF1dG8uZm9yRWFjaChmdW5jdGlvbihjYXIpIHtcbiAgICAgICAgICBLZXlNZ3IuY2xlYXIoaXRlbS5pZCwgY2FyLmlkKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcXVlcnkoKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIOS4iuS8oOaKpeWRilxuICAgIGZ1bmN0aW9uIHVwbG9hZF9yZXBvcnQob3JkZXIsIGNhcikge1xuICAgICAgdmFyIG9yZGVyX2lkID0gb3JkZXIuaWQ7XG4gICAgICB2YXIgY2FyX2lkID0gY2FyLmlkO1xuXG4gICAgICB2YXIgcmVwb3J0X2tleSA9IEtleU1nci5yZXBvcnQob3JkZXJfaWQsIGNhcl9pZCk7XG4gICAgICB2YXIgcmVwb3J0X3N1Ym1pdF9rZXkgPSBLZXlNZ3Iuc3VibWl0KHJlcG9ydF9rZXkpO1xuICAgICAgdmFyIHJlcG9ydF9kYXRhID0gbG9jYWxTdG9yYWdlU2VydmljZS5nZXQocmVwb3J0X2tleSk7XG5cbiAgICAgICRsb2cuaW5mbygn5YeG5aSH5LiK5Lyg5oql5ZGKOiAnICsgcmVwb3J0X2tleSk7XG4gICAgICAkbG9nLmluZm8oJ+aKpeWRiuWIhuexu+aVsOaNrjogJyArIEpTT04uc3RyaW5naWZ5KHJlcG9ydF9kYXRhKSk7XG5cbiAgICAgIGlmICghcmVwb3J0X2RhdGEpIHtcbiAgICAgICAgJGxvZy5pbmZvKCfmiqXlkYrmlbDmja7kuLrnqbrvvIzkuI3nlKjkuIrkvKAnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjYXIucmVwb3J0X3N0YXR1cy51cGxvYWRfc3RhdHVzID0gMDtcbiAgICAgIGNhci5yZXBvcnRfc3RhdHVzLnVwbG9hZGluZyA9IHRydWU7XG5cbiAgICAgIHZhciBzdWJtaXRfZGF0YSA9IHt9O1xuXG4gICAgICBPYmplY3Qua2V5cyhyZXBvcnRfZGF0YSkuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgYW5ndWxhci5leHRlbmQoc3VibWl0X2RhdGEsIHJlcG9ydF9kYXRhW2tleV0pO1xuICAgICAgfSk7XG5cbiAgICAgICRsb2cuaW5mbygn5oql5ZGK5b6F5o+Q5Lqk5pWw5o2uOiAnICsgSlNPTi5zdHJpbmdpZnkoc3VibWl0X2RhdGEpKTtcblxuICAgICAgdmFyIGltYWdlX2ZpZWxkcyA9IHt9O1xuICAgICAgT2JqZWN0LmtleXMoc3VibWl0X2RhdGEpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgIGlmIChzdWJtaXRfZGF0YVtrZXldLmltYWdlKSB7XG4gICAgICAgICAgaW1hZ2VfZmllbGRzW2tleV0gPSBhbmd1bGFyLmV4dGVuZCh7XG4gICAgICAgICAgICB1cmw6IHN1Ym1pdF9kYXRhW2tleV0uaW1hZ2VcbiAgICAgICAgICB9LCBzdWJtaXRfZGF0YVtrZXldKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHZhciBpbWFnZXMgPSBfLnZhbHVlcyhpbWFnZV9maWVsZHMpO1xuXG4gICAgICAvLyDmsqHmnInlm77niYfpnIDopoHkuIrkvKDvvIznm7TmjqXkuIrkvKDmiqXlkYrlhoXlrrlcbiAgICAgIGlmICghaW1hZ2VzLmxlbmd0aCkge1xuICAgICAgICBzdWJtaXRfcmVwb3J0KCk7XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAkbG9nLmluZm8oJ+aKpeWRiuWbvueJh+aVsOaNrjogJyArIEpTT04uc3RyaW5naWZ5KGltYWdlX2ZpZWxkcykpO1xuICAgICAgJGxvZy5pbmZvKCflvIDlp4vkuIrkvKDnhafniYfmlbDmja4nKTtcbiAgICAgIFVwbG9hZGVyLmJhdGNoKHtcbiAgICAgICAgdXJsOiAnaHR0cDovL2YuaWZkaXUuY29tJyxcbiAgICAgICAgYXR0YWNobWVudHM6IGltYWdlcyxcbiAgICAgICAgZG9uZTogdXBsb2FkX2RvbmUsXG4gICAgICAgIG9uZTogdXBsb2FkX29uZSxcbiAgICAgICAgb25wcm9ncmVzczogb25wcm9ncmVzcyxcbiAgICAgICAgZXJyb3I6IHVwbG9hZF9lcnJvclxuICAgICAgfSk7XG5cbiAgICAgIGZ1bmN0aW9uIG9ucHJvZ3Jlc3MocHJvZ3Jlc3MpIHtcbiAgICAgICAgLy8gMS4gdXBkYXRlIHByb2dyZXNzIHN0YXR1cyB0byBwYWdlXG4gICAgICAgICRsb2cuaW5mbygn5LiK5Lyg6L+b5bqmOiAnICsgcHJvZ3Jlc3MucGVyY2VudCk7XG4gICAgICAgIGNhci5yZXBvcnRfc3RhdHVzLnVwbG9hZF9zdGF0dXMgPSBwYXJzZUludChwcm9ncmVzcy5wZXJjZW50ICogMC44KTtcbiAgICAgICAgdm0uJGFwcGx5KCk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHVwbG9hZF9vbmUoaW1hZ2UsIGZpbGUpIHtcbiAgICAgICAgLy8gWW91IGNhbiBkbyBzb21ldGhpbmcgb24gaW1hZ2Ugd2l0aCBmaWxlIG9iamVjdFxuICAgICAgICBpbWFnZS5maWxlX2lkID0gZmlsZS5pZDtcbiAgICAgICAgJGxvZy5pbmZvKCfmiJDlip/kuIrkvKDlm77niYc6ICcgKyBKU09OLnN0cmluZ2lmeShpbWFnZSkpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiB1cGxvYWRfZXJyb3IoaW1hZ2UpIHtcbiAgICAgICAgJGxvZy5pbmZvKCfkuIrkvKDlm77niYflh7rplJk6ICcgKyBKU09OLnN0cmluZ2lmeShpbWFnZSkpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiB1cGxvYWRfZG9uZSgpIHtcbiAgICAgICAgLy8gMS4gY29tYmluZSBpbWFnZSBmaWxlaWQgdG8gc3VibWl0X2RhdGFcbiAgICAgICAgLy8gMi4gc3RvcmUgaW1hZ2UgZGF0YSB0byBsb2NhbHN0b3JhZ2VcbiAgICAgICAgLy8gMy4gc3VibWl0IHJlcG9ydCBkYXRhXG4gICAgICAgICRsb2cuaW5mbygn5oiQ5Yqf5LiK5Lyg5omA5pyJ5Zu+54mHJyk7XG5cbiAgICAgICAgLy8gMVxuICAgICAgICBpbWFnZXMuZm9yRWFjaChmdW5jdGlvbihpbWFnZSkge1xuICAgICAgICAgIHN1Ym1pdF9kYXRhW2ltYWdlLmlkXSA9IGltYWdlO1xuICAgICAgICB9KTtcblxuICAgICAgICAkbG9nLmluZm8oJ+WbnuWGmeWbvueJh+aVsOaNruWIsCBsb2NhbHN0b3JhZ2UnKTtcblxuICAgICAgICAvLyAyXG4gICAgICAgIGxvY2FsU3RvcmFnZVNlcnZpY2Uuc2V0KHJlcG9ydF9zdWJtaXRfa2V5LCBzdWJtaXRfZGF0YSk7XG5cbiAgICAgICAgLy8gM1xuICAgICAgICBzdWJtaXRfcmVwb3J0KCk7XG4gICAgICB9XG5cbiAgICAgIC8vIDEuIHN1Ym1pdCByZXBvcnQgZGF0YVxuICAgICAgLy8gMi4gcmVtb3ZlIGltYWdlIGZyb20gY2FjaGVcbiAgICAgIC8vIDMuIGNsZWFyIHJlcG9ydCBsb2NhbCBkYXRhXG4gICAgICAvLyA0LiB1cGRhdGUgb3JkZXIgc3RhdHVzIFxuICAgICAgZnVuY3Rpb24gc3VibWl0X3JlcG9ydCgpIHtcbiAgICAgICAgJGxvZy5pbmZvKCflvIDlp4vkuIrkvKDmiqXlkYrlhoXlrrknKTtcbiAgICAgICAgLy8gMVxuICAgICAgICByZXR1cm4gUmVwb3J0U3ZjXG4gICAgICAgICAgLnNhdmUoe1xuICAgICAgICAgICAgb3JkZXJfaWQ6IG9yZGVyX2lkLFxuICAgICAgICAgICAgY2FyX2lkOiBjYXJfaWRcbiAgICAgICAgICB9LCBzdWJtaXRfZGF0YSlcbiAgICAgICAgICAuJHByb21pc2VcbiAgICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICRsb2cuaW5mbygn5LiK5Lyg5oql5ZGK5YaF5a655oiQ5YqfJyk7XG5cbiAgICAgICAgICAgIC8vIDJcbiAgICAgICAgICAgIGlmIChpbWFnZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGltYWdlcy5mb3JFYWNoKGZ1bmN0aW9uKGltYWdlKSB7XG4gICAgICAgICAgICAgICAgRmlsZXIucmVtb3ZlKGltYWdlLnVybCk7XG4gICAgICAgICAgICAgIH0pOyAgXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIDNcbiAgICAgICAgICAgIEtleU1nci5jbGVhcihvcmRlcl9pZCwgY2FyX2lkKTtcblxuICAgICAgICAgICAgLy8gNFxuICAgICAgICAgICAgY2FyLnJlcG9ydF9zdGF0dXMudXBsb2FkX3N0YXR1cyA9IDEwMDtcbiAgICAgICAgICAgIGNhci5yZXBvcnRfc3RhdHVzLnVwbG9hZGVkID0gdHJ1ZTtcblxuICAgICAgICAgICAgLy8gcXVlcnkoKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5jYXRjaChmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICRsb2cuaW5mbygn5LiK5Lyg5oql5ZGK5YaF5a655aSx6LSlOiAnICsgSlNPTi5zdHJpbmdpZnkoYXJndW1lbnRzKSk7XG4gICAgICAgICAgICB0b2FzdHIuZXJyb3IocmVzLm1zZyB8fCAn5LiK5Lyg6L+H56iL5Lit5Y+R55Sf6ZSZ6K+v77yM6K+36YeN6K+VJyk7XG4gICAgICAgICAgICAvLyA0XG4gICAgICAgICAgICBjYXIucmVwb3J0X3N0YXR1cy51cGxvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH0pXG4gIFxuICAvLyDlj5bmtojorqLljZVcbiAgLmNvbnRyb2xsZXIoJ0NhbmNlbE9yZGVyQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJG1vZGFsSW5zdGFuY2UsIHRvYXN0ciwgSW5kZW50UmV2b2tlUmVxdWVzdFN2YywgaW5kZW50X2luZm8pIHtcbiAgICB2YXIgdm0gPSAkc2NvcGU7XG5cbiAgICBhbmd1bGFyLmV4dGVuZCh2bSwgaW5kZW50X2luZm8pO1xuXG4gICAgdm0uY2FuY2VsX29yZGVyID0gY2FuY2VsX29yZGVyO1xuICAgIHZtLmNhbmNlbCA9IGNhbmNlbDtcblxuICAgIGZ1bmN0aW9uIGNhbmNlbF9vcmRlcigpIHtcbiAgICAgIHZtLmNhbmNlbF9vcmRlcl9zdGF0dXMgPSB0cnVlO1xuXG4gICAgICBJbmRlbnRSZXZva2VSZXF1ZXN0U3ZjXG4gICAgICAgIC51cGRhdGUoe1xuICAgICAgICAgIGlkOiBpbmRlbnRfaW5mby5pZFxuICAgICAgICB9LCB7XG4gICAgICAgICAgbWVtbzogdm0ucmVhc29uXG4gICAgICAgIH0pXG4gICAgICAgIC4kcHJvbWlzZVxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICB0b2FzdHIuc3VjY2VzcyhyZXMubXNnIHx8ICforqLljZXlj5bmtojmiJDlip8nKTtcblxuICAgICAgICAgICRtb2RhbEluc3RhbmNlLmNsb3NlKCk7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICB2bS5jYW5jZWxfb3JkZXJfc3RhdHVzID0gZmFsc2U7XG5cbiAgICAgICAgICB0b2FzdHIuZXJyb3IocmVzLm1zZyB8fCAn6K6i5Y2V5Y+W5raI5aSx6LSl77yM6K+36YeN6K+VJyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNhbmNlbCgpIHtcbiAgICAgICRtb2RhbEluc3RhbmNlLmRpc21pc3MoKTtcbiAgICB9XG4gIH0pXG5cbiAgLy8g5Yqg6L2mIOaIliDnvJbovpHovaZcbiAgLmNvbnRyb2xsZXIoJ0luZGVudENhckVkaXRDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkbW9kYWxJbnN0YW5jZSwgdG9hc3RyLCBJbmRlbnRDYXJzU3ZjLFxuICAgIEluZGVudENhclN2YywgSW5kZW50RW51bXMsIGluZGVudF9pbmZvKSB7XG4gICAgdmFyIHZtID0gJHNjb3BlO1xuXG4gICAgdm0uYnJhbmRfbGlzdCA9IEluZGVudEVudW1zLmxpc3QoJ2JyYW5kJyk7XG4gICAgdm0uc2VyaWVzX2xpc3QgPSBJbmRlbnRFbnVtcy5saXN0KCdzZXJpZXMnKTtcbiAgICB2bS5tb2RlbF9saXN0ID0gSW5kZW50RW51bXMubGlzdCgnbW9kZWwnKTtcblxuICAgIGlmIChpbmRlbnRfaW5mby5jYXIpIHtcbiAgICAgIHZtLnRpdGxlID0gJ+e8lui+kei9puS/oeaBryc7XG5cbiAgICAgIHNlbGVjdF9pdGVtKCdicmFuZCcsIGluZGVudF9pbmZvLmNhci5icmFuZCk7XG4gICAgICBzZWxlY3RfaXRlbSgnc2VyaWVzJywgaW5kZW50X2luZm8uY2FyLnNlcmllcyk7XG4gICAgICBzZWxlY3RfaXRlbSgnbW9kZWwnLCBpbmRlbnRfaW5mby5jYXIubW9kZWwpOyAgXG4gICAgfSBlbHNlIHtcbiAgICAgIHZtLnRpdGxlID0gJ+WKoOi9pic7XG4gICAgfVxuXG4gICAgdm0uY2FuY2VsID0gY2FuY2VsO1xuICAgIHZtLnN1Ym1pdCA9IHN1Ym1pdDtcblxuICAgIGZ1bmN0aW9uIHN1Ym1pdCgpIHtcbiAgICAgIGlmIChpbmRlbnRfaW5mby5jYXIpIHtcbiAgICAgICAgSW5kZW50Q2FyU3ZjXG4gICAgICAgICAgLnVwZGF0ZSh7XG4gICAgICAgICAgICBvcmRlcl9pZDogaW5kZW50X2luZm8uaWQsXG4gICAgICAgICAgICBjYXJfaWQ6IGluZGVudF9pbmZvLmNhci5pZFxuICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgIGJyYW5kOiB2bS5icmFuZC52YWx1ZSxcbiAgICAgICAgICAgIHNlcmllczogdm0uYnJhbmQudmFsdWUsXG4gICAgICAgICAgICBtb2RlbDogdm0ubW9kZWwudmFsdWVcbiAgICAgICAgICB9KVxuICAgICAgICAgIC4kcHJvbWlzZVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgdG9hc3RyLnN1Y2Nlc3MocmVzLm1zZyB8fCAn57yW6L6R6L2m6L6G5L+h5oGv5L+d5a2Y5oiQ5YqfJyk7XG5cbiAgICAgICAgICAgICRtb2RhbEluc3RhbmNlLmNsb3NlKCk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICB0b2FzdHIuZXJyb3IocmVzLm1zZyB8fCAn57yW6L6R6L2m6L6G5L+h5oGv5L+d5a2Y5aSx6LSlJyk7XG4gICAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBJbmRlbnRDYXJzU3ZjXG4gICAgICAgICAgLnNhdmUoe1xuICAgICAgICAgICAgb3JkZXJfaWQ6IGluZGVudF9pbmZvLmlkXG4gICAgICAgICAgfSwge1xuICAgICAgICAgICAgYnJhbmQ6IHZtLmJyYW5kLnZhbHVlLFxuICAgICAgICAgICAgc2VyaWVzOiB2bS5icmFuZC52YWx1ZSxcbiAgICAgICAgICAgIG1vZGVsOiB2bS5tb2RlbC52YWx1ZVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLiRwcm9taXNlXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICB0b2FzdHIuc3VjY2VzcyhyZXMubXNnIHx8ICfliqDovabkv6Hmga/kv53lrZjmiJDlip8nKTtcblxuICAgICAgICAgICAgJG1vZGFsSW5zdGFuY2UuY2xvc2UoKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5jYXRjaChmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgIHRvYXN0ci5lcnJvcihyZXMubXNnIHx8ICfliqDovabkv6Hmga/kv53lrZjlpLHotKUnKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZWxlY3RfaXRlbShsaXN0X25hbWUsIHZhbHVlKSB7XG4gICAgICB2bVtsaXN0X25hbWVdID0gSW5kZW50RW51bXMuaXRlbTR0ZXh0KGxpc3RfbmFtZSwgdmFsdWUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNhbmNlbCgpIHtcbiAgICAgICRtb2RhbEluc3RhbmNlLmRpc21pc3MoKTtcbiAgICB9XG5cbiAgfSk7XG5cbiIsImFuZ3VsYXJcbiAgLm1vZHVsZSgnZ3VsdS5yZXBvcnQnKVxuXG4gIC5mYWN0b3J5KCdSZXBvcnRJbnB1dGVyJywgZnVuY3Rpb24oJGxvZywgJHN0YXRlUGFyYW1zLCAkaW50ZXJ2YWwsIFZNLCBsb2NhbFN0b3JhZ2VTZXJ2aWNlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHZtLCBmaWVsZHMsIHJlcG9ydF90eXBlKSB7XG4gICAgICB2YXIgaW5kZW50X2lkID0gJHN0YXRlUGFyYW1zLmluZGVudF9pZDtcbiAgICAgIHZhciBjYXJfaWQgPSAkc3RhdGVQYXJhbXMuY2FyX2lkO1xuXG4gICAgICB2YXIgc3RvcmVfa2V5ID0gW2luZGVudF9pZCwgY2FyX2lkXS5qb2luKCdfJyk7XG5cbiAgICAgIHZhciBpbml0X2RhdGEgPSBsb2NhbFN0b3JhZ2VTZXJ2aWNlLmdldChzdG9yZV9rZXkpO1xuICAgICAgLy8g6K6+572u5Yid5aeL5YyW5YC8XG4gICAgICBhbmd1bGFyLmV4dGVuZCh2bSwgaW5pdF9kYXRhICYmIGluaXRfZGF0YVtyZXBvcnRfdHlwZV0gfHwge30pO1xuXG4gICAgICAvLyDkv53lrZjliLAgbG9jYWxTdG9yYWdlXG4gICAgICBmdW5jdGlvbiBzYXZlKCkge1xuICAgICAgICB2YXIgZGF0YSA9IGxvY2FsU3RvcmFnZVNlcnZpY2UuZ2V0KHN0b3JlX2tleSkgfHwge307XG4gICAgICAgIGRhdGFbcmVwb3J0X3R5cGVdID0gVk0udG9fanNvbih2bSwgZmllbGRzKTtcblxuICAgICAgICBsb2NhbFN0b3JhZ2VTZXJ2aWNlLnNldChzdG9yZV9rZXksIGRhdGEpO1xuXG4gICAgICAgICRsb2cubG9nKCflvZXlhaXmo4DmtYvmiqXlkYogLSAnICsgc3RvcmVfa2V5LCBkYXRhW3JlcG9ydF90eXBlXSk7XG4gICAgICB9XG5cbiAgICAgIHZhciB0aW1lciA9ICRpbnRlcnZhbChzYXZlLCAzMDAwKTtcblxuICAgICAgLy8g5YiH5o2i6aG16Z2i5pe277yM5Y+W5raI6Ieq5Yqo5L+d5a2YKOa4hemZpOWumuaXtuWZqClcbiAgICAgIHZtLiRvbignJGxvY2F0aW9uQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgJGludGVydmFsLmNhbmNlbCh0aW1lcik7XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuXG4iLCIvKiBnbG9iYWwgYW5ndWxhciwgQ2FtZXJhLCBfLCBGdWxsU2NyZWVuSW1hZ2UqL1xuYW5ndWxhclxuICAubW9kdWxlKCdndWx1LnJlcG9ydCcpXG5cbiAgLmNvbnRyb2xsZXIoJ0lucHV0RGFzaGJvYXJkQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlUGFyYW1zLCAkbG9jYXRpb24sICR0ZW1wbGF0ZUNhY2hlLCBsb2NhbFN0b3JhZ2VTZXJ2aWNlLCBLZXlNZ3IpIHtcbiAgICB2YXIgdm0gPSAkc2NvcGU7XG5cbiAgICB2YXIgaW5kZW50X2lkID0gJHN0YXRlUGFyYW1zLmluZGVudF9pZDtcbiAgICB2YXIgY2FyX2lkID0gJHN0YXRlUGFyYW1zLmNhcl9pZDtcbiAgICB2YXIgcmVwb3J0X3N0YXR1c19rZXkgPSBLZXlNZ3Iuc3RhdHVzKGluZGVudF9pZCwgY2FyX2lkKTtcblxuICAgIHZtLnBhcnRzID0gSlNPTi5wYXJzZSgkdGVtcGxhdGVDYWNoZS5nZXQoJ3JlcG9ydC9pLmpzb24nKSk7XG4gICAgXG4gICAgLy8g5LiN55So5bGV56S654Wn54mHXG4gICAgdm0ucGhvdG9fcGFydCA9IHZtLnBhcnRzLnBvcCgpO1xuICAgIFxuICAgIC8vIOm7mOiupOWxleW8gFxuICAgIHZtLnRlc3Rfc3RlcF9uYXZfb3BlbiA9IHRydWU7XG4gICAgdm0udG9nZ2xlX25hdl9vcGVuID0gdG9nZ2xlX25hdl9vcGVuO1xuICAgIHZtLnN1Ym1pdF9wcmV2aWV3ID0gc3VibWl0X3ByZXZpZXc7XG5cbiAgICBmdW5jdGlvbiB0b2dnbGVfbmF2X29wZW4oKSB7XG4gICAgICB2bS50ZXN0X3N0ZXBfbmF2X29wZW4gPSAhdm0udGVzdF9zdGVwX25hdl9vcGVuO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHN1Ym1pdF9wcmV2aWV3KCkge1xuICAgICAgLy8g5Li05pe25pa55qGIXG4gICAgICBsb2NhbFN0b3JhZ2VTZXJ2aWNlLnNldChyZXBvcnRfc3RhdHVzX2tleSwge1xuICAgICAgICBzdWJtaXRlZDogdHJ1ZVxuICAgICAgfSk7XG5cbiAgICAgICRsb2NhdGlvbi51cmwoJy9pbmRlbnRzL3VudGVzdGVkJyk7XG5cbiAgICAgIC8vIFRPRE9cbiAgICAgIC8vIDEuIOi3s+i9rOWIsOaKpeWRiuWxleekuumhtemdoijnoa7orqTmj5DkuqTvvIzlj6/ov5Tlm54pXG4gICAgICAvLyAyLiDlsIborr7nva4gcmVwcm90IHN0YXR1cyBzdWJtaXRlZCDnp7vliLDngrnlh7vnoa7orqTmj5DkuqTlkI5cbiAgICAgIC8vIDMuIOehruiupOaPkOS6pOWImei3s+i9rOWIsOW9k+WkqeS7u+WKoeeVjOmdolxuICAgIH1cbiAgfSlcblxuICAuY29udHJvbGxlcignUGhvdG9SZXBvcnRFZGl0Q3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJGxvZywgJHN0YXRlUGFyYW1zLCAkdGVtcGxhdGVDYWNoZSwgbG9jYWxTdG9yYWdlU2VydmljZSwgS2V5TWdyKSB7XG4gICAgdmFyIHZtID0gJHNjb3BlO1xuXG4gICAgdmFyIG9yZGVyX2lkID0gJHN0YXRlUGFyYW1zLmluZGVudF9pZDtcbiAgICB2YXIgY2FyX2lkID0gJHN0YXRlUGFyYW1zLmNhcl9pZDtcbiAgICAvLyDooajljZXpobnmlbDmja7lrZjlgqjliLDmnKzlnLDnmoQga2V5IOeahOeUn+aIkOinhOWImVxuICAgIHZhciByZXBvcnRfa2V5ID0gS2V5TWdyLnJlcG9ydChvcmRlcl9pZCwgY2FyX2lkKTtcbiAgICB2YXIgcmVwb3J0X2Vycl9rZXkgPSBLZXlNZ3IuZXJyKHJlcG9ydF9rZXkpO1xuICAgIHZhciBpbml0X2RhdGEgPSBsb2NhbFN0b3JhZ2VTZXJ2aWNlLmdldChyZXBvcnRfa2V5KTtcblxuICAgIHZhciBwYXJ0X2pzb24gPSBKU09OLnBhcnNlKCR0ZW1wbGF0ZUNhY2hlLmdldCgncmVwb3J0L2kuanNvbicpKTtcbiAgICAvLyDnhafniYfnrqHnkIbpu5jorqTkuLrmnIDlkI7kuIDpoblcbiAgICB2YXIgcGFyZW50X3BhcnQgPSBwYXJ0X2pzb25bcGFydF9qc29uLmxlbmd0aCAtIDFdO1xuICAgIHZhciBjdXJyZW50X3BhcnQgPSBwYXJlbnRfcGFydC5pZDtcblxuICAgIC8vIOW9k+WJjemhtuWxguWIhuexu+acrOi6q+S4tOaXtuWtmOWCqOepuumXtFxuICAgIHZtLmRhdGEgPSB7fTtcbiAgICAvLyDnu5nlvZPliY3pobblsYLliIbnsbvnlLPor7cgbG9jYWwgc3RvcmFnZSDlrZjlgqjnqbrpl7RcbiAgICBpbml0X2RhdGFbY3VycmVudF9wYXJ0XSA9IGluaXRfZGF0YVtjdXJyZW50X3BhcnRdIHx8IHt9O1xuICAgIC8vIOWwhuS7peWJjeS/neWtmOeahOe7k+aenOWPluWHuu+8jOW5tuWGmeWFpeS4tOaXtuWtmOWCqOepuumXtFxuICAgIGFuZ3VsYXIuZXh0ZW5kKHZtLmRhdGEsIGluaXRfZGF0YVtjdXJyZW50X3BhcnRdKTtcbiAgICAvLyDlvZPliY3nmoTkuoznuqfliIbnsbtcbiAgICB2bS5wYXJ0cyA9IHBhcmVudF9wYXJ0LmNoaWxkcmVuO1xuXG4gICAgaWYgKHZtLnBhcnRzICYmIHZtLnBhcnRzLmxlbmd0aCkge1xuICAgICAgLy8g6K6+572u56ys5LiA5p2h6buY6K6k5bGV5byAXG4gICAgICB2bS5wYXJ0c1swXS5pc19vcGVuID0gdHJ1ZTtcblxuICAgICAgLy8g5Yid5aeL5YyW5ouN54Wn6aG5LCDorr7nva7mi43nhafpobnkuLrmnKzlnLDnhafniYfmiJZudWxsXG4gICAgICB2bS5wYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uKHBhcnQpIHtcbiAgICAgICAgcGFydC5pbWFnZS5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICB2bS5kYXRhW2l0ZW0uaWRdID0gdm0uZGF0YVtpdGVtLmlkXSB8fCB7IGltYWdlOiBudWxsIH07XG4gICAgICAgIH0pO1xuICAgICAgfSk7ICBcbiAgICB9XG5cbiAgICAvLyDlhbbku5YgcGFydCDkuLTml7blrZjlgqjnqbrpl7RcbiAgICB2bS5kYXRhX290aGVyID0ge307XG4gICAgLy8g5YW25LuWIHBhcnQg5Lul5YmN5L+d5a2Y5Zyo5pys5Zyw55qE5pWw5o2uXG4gICAgdmFyIHBob3RvX29mX2dyb3VwID0gbG9jYWxTdG9yYWdlU2VydmljZS5nZXQocmVwb3J0X2Vycl9rZXkpO1xuICAgIC8vIOagvOW8j+WMluS7peWJjeS/neWtmOWcqOacrOWcsOeahOWFtuS7liBwYXJ0IOaVsOaNru+8jOaWueS+v+WxleekulxuICAgIHZtLnBhcnRfcGhvdG9zID0gXy5tYXAocGhvdG9fb2ZfZ3JvdXAsIGZ1bmN0aW9uKGl0ZW0sIGtleSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaWQ6IGtleSxcbiAgICAgICAgbmFtZTogZ2V0X3BhcnRfbmFtZShrZXkpLFxuICAgICAgICBwaG90b3M6IGl0ZW1cbiAgICAgIH07XG4gICAgfSk7XG4gICAgLy8g5bCG5Lul5YmN5L+d5a2Y5Zyo5pys5Zyw55qE57uT5p6c5Y+W5Ye677yM5bm25YaZ5YWl5Li05pe25a2Y5YKo56m66Ze0XG4gICAgXyhwaG90b19vZl9ncm91cCkudmFsdWVzKCkuZmxhdHRlbigpLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgdm0uZGF0YV9vdGhlcltpdGVtLmlkXSA9IGl0ZW07XG4gICAgfSk7XG4gICAgLy8g5qC55o2u6aG25bGC5YiG57G7IGlkIOafpeaJviDpobblsYLliIbnsbvnmoQgbmFtZVxuICAgIGZ1bmN0aW9uIGdldF9wYXJ0X25hbWUocGFydF9pZCkge1xuICAgICAgcmV0dXJuIHBhcnRfanNvbi5maW5kKGZ1bmN0aW9uKHBhcnQpIHtcbiAgICAgICAgcmV0dXJuIHBhcnQuaWQgPT0gcGFydF9pZDtcbiAgICAgIH0pLm5hbWU7XG4gICAgfVxuXG4gICAgLy8g5ouN54Wn5pON5L2cXG4gICAgdm0udGFrZV9waG90byA9IHRha2VfcGhvdG87XG4gICAgLy8gY2F0ZWdvcnkg5Yy65YiG5piv5b2T5YmN6aG25bGC5YiG57G75a2Q6aG555qE5ouN54Wn5LiO5YW25LuW6aG25bGC5YiG57G75a2Q6aG555qE5ouN54WnXG4gICAgLy8gc2VsZjog5b2T5YmN6aG25bGC5YiG57G755qE5a2Q6aG5XG4gICAgLy8gb3RoZXI6IOWFtuS7lumhtuWxguWIhuexu+eahOWtkOmhuVxuICAgIGZ1bmN0aW9uIHRha2VfcGhvdG8oY2F0ZWdvcnksIHBhcnQsIGl0ZW0pIHtcbiAgICAgIG5hdmlnYXRvci5jYW1lcmEuZ2V0UGljdHVyZSh0YWtlX3Bob3RvX3N1Y2Nlc3MsIHRha2VfcGhvdG9fZXJyb3IsIHtcbiAgICAgICAgcXVhbGl0eSA6IDEwMCxcbiAgICAgICAgZGVzdGluYXRpb25UeXBlIDogQ2FtZXJhLkRlc3RpbmF0aW9uVHlwZS5GSUxFX1VSSSxcbiAgICAgICAgc291cmNlVHlwZSA6IENhbWVyYS5QaWN0dXJlU291cmNlVHlwZS5DQU1FUkEsXG4gICAgICAgIGFsbG93RWRpdCA6IHRydWUsXG4gICAgICAgIGVuY29kaW5nVHlwZTogQ2FtZXJhLkVuY29kaW5nVHlwZS5QTkcsXG4gICAgICAgIC8vIHRhcmdldFdpZHRoOiAxMDAsXG4gICAgICAgIC8vIHRhcmdldEhlaWdodDogMTAwLFxuICAgICAgICBzYXZlVG9QaG90b0FsYnVtOiBmYWxzZVxuICAgICAgfSk7XG5cbiAgICAgIGZ1bmN0aW9uIHRha2VfcGhvdG9fc3VjY2VzcyhpbWd1cmwpIHtcbiAgICAgICAgLy8g5b2T5YmN6aG25bGC5YiG57G75ouN54WnXG4gICAgICAgIGlmIChjYXRlZ29yeSA9PT0gJ3NlbGYnKSB7XG4gICAgICAgICAgdm0uZGF0YVtpdGVtLmlkXS5pbWFnZSA9IGltZ3VybDtcblxuICAgICAgICAgIC8vIOS4tOaXtuWtmOWCqOaVsOaNruacrOWcsOWMluWIsCBsb2NhbHN0b3JhZ2VcbiAgICAgICAgICAvLyDmlrnkvr/kuIvmrKHov5vlhaUgYXBwIOWxleekulxuICAgICAgICAgIGluaXRfZGF0YVtjdXJyZW50X3BhcnRdID0gdm0uZGF0YTtcbiAgICAgICAgfSBlbHNlIGlmIChjYXRlZ29yeSA9PT0gJ290aGVyJykge1xuICAgICAgICAgIC8vIOWFtuS7lumhtuWxguWIhuexu+aLjeeFp1xuICAgICAgICAgIHZtLmRhdGFfb3RoZXJbaXRlbS5pZF0uaW1hZ2UgPSBpbWd1cmw7XG5cbiAgICAgICAgICAvLyDov5nph4znmoQgcGFydCDmmK/pobblsYLliIbnsbtcbiAgICAgICAgICB2YXIgZXhpc3RzX2l0ZW0gPSBwaG90b19vZl9ncm91cFtwYXJ0LmlkXS5maW5kKGZ1bmN0aW9uKF9pdGVtKSB7XG4gICAgICAgICAgICByZXR1cm4gX2l0ZW0uaWQgPT09IGl0ZW0uaWQ7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyDmnKzlnLDljJbliLDnhafniYfmgLvop4ggbG9jYWxzdG9yYWdlXG4gICAgICAgICAgZXhpc3RzX2l0ZW0uaW1hZ2UgPSBpbWd1cmw7XG4gICAgICAgICAgbG9jYWxTdG9yYWdlU2VydmljZS5zZXQocmVwb3J0X2Vycl9rZXksIHBob3RvX29mX2dyb3VwKTtcbiAgICAgICAgICBcbiAgICAgICAgICAvLyDmnKzlnLDljJbliLDmiqXlkYogbG9jYWxzdG9yYWdlXG4gICAgICAgICAgaW5pdF9kYXRhW3BhcnQuaWRdW2V4aXN0c19pdGVtLmlkXS5pbWFnZSA9IGltZ3VybDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxvY2FsU3RvcmFnZVNlcnZpY2Uuc2V0KHJlcG9ydF9rZXksIGluaXRfZGF0YSk7XG4gICAgICAgIC8vIOaJi+WKqOinpuWPkemhtemdoua4suafk1xuICAgICAgICB2bS4kYXBwbHkoKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gdGFrZV9waG90b19lcnJvcigpIHtcbiAgICAgICAgJGxvZy5lcnJvcign5ouN54Wn5aSx6LSlLCDliIbnsbsgLSAnICsgcGFydC5uYW1lICsgJywg6aG5IC0gJyArIGl0ZW0ubmFtZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdm0uc2hvd19waG90byA9IHNob3dfcGhvdG87XG4gICAgZnVuY3Rpb24gc2hvd19waG90byhjYXRlZ29yeSwgZmllbGQpIHtcbiAgICAgIEZ1bGxTY3JlZW5JbWFnZS5zaG93SW1hZ2VVUkwodm1bY2F0ZWdvcnkgPT09ICdzZWxmJyA/ICdkYXRhJyA6ICdkYXRhX290aGVyJ11bZmllbGQuaWRdLmltYWdlKTtcbiAgICB9XG4gIH0pXG5cbiAgLmNvbnRyb2xsZXIoJ1JlcG9ydEVkaXRDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkbG9nLCAkc3RhdGVQYXJhbXMsICR0ZW1wbGF0ZUNhY2hlLCAkbW9kYWwsIGxvY2FsU3RvcmFnZVNlcnZpY2UsIEtleU1ncikge1xuICAgIHZhciB2bSA9ICRzY29wZTtcblxuICAgIHZhciBjdXJyZW50X3BhcnQgPSBwYXJzZUludCgkc3RhdGVQYXJhbXMucGFydF9pZCk7XG4gICAgdmFyIG9yZGVyX2lkID0gJHN0YXRlUGFyYW1zLmluZGVudF9pZDtcbiAgICB2YXIgY2FyX2lkID0gJHN0YXRlUGFyYW1zLmNhcl9pZDtcblxuICAgIC8vIOihqOWNlemhueaVsOaNruWtmOWCqOWIsOacrOWcsOeahCBrZXkg55qE55Sf5oiQ6KeE5YiZXG4gICAgdmFyIHJlcG9ydF9rZXkgPSBLZXlNZ3IucmVwb3J0KG9yZGVyX2lkLCBjYXJfaWQpO1xuICAgIHZhciByZXBvcnRfZXJyX2tleSA9IEtleU1nci5lcnIocmVwb3J0X2tleSk7XG4gICAgdmFyIGluaXRfZGF0YSA9IGxvY2FsU3RvcmFnZVNlcnZpY2UuZ2V0KHJlcG9ydF9rZXkpO1xuXG4gICAgLy8g6I635Y+W5oql5ZGK6L6T5YWl6aG55pWw5o2uXG4gICAgdmFyIHBhcmVudF9wYXJ0ID0gXG4gICAgSlNPTlxuICAgICAgLnBhcnNlKCR0ZW1wbGF0ZUNhY2hlLmdldCgncmVwb3J0L2kuanNvbicpKVxuICAgICAgLmZpbmQoZnVuY3Rpb24ocGFydCkge1xuICAgICAgICByZXR1cm4gcGFydC5pZCA9PT0gY3VycmVudF9wYXJ0O1xuICAgICAgfSk7XG4gICAgdm0ucGFydHMgPSBwYXJlbnRfcGFydCAmJiBwYXJlbnRfcGFydC5jaGlsZHJlbjtcblxuICAgIC8vIOesrOS4gOadoem7mOiupOWxleW8gFxuICAgIGlmICh2bS5wYXJ0cyAmJiB2bS5wYXJ0cy5sZW5ndGgpIHtcbiAgICAgIHZtLnBhcnRzWzBdLmlzX29wZW4gPSB0cnVlO1xuICAgIH1cblxuICAgIHZtLmRhdGEgPSB7fTtcblxuICAgIC8vIOiuvue9ruWIneWni+WMluWAvFxuICAgIGFuZ3VsYXIuZXh0ZW5kKHZtLmRhdGEsIGluaXRfZGF0YSAmJiBpbml0X2RhdGFbY3VycmVudF9wYXJ0XSB8fCB7fSk7XG5cbiAgICB2bS5wYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uKHBhcnQpIHtcbiAgICAgIGlmIChwYXJ0LnJhZGlvX3dpdGhfc3RhdHVzX2RlZ3JlZXMgJiYgcGFydC5yYWRpb193aXRoX3N0YXR1c19kZWdyZWVzLmxlbmd0aCkge1xuICAgICAgICBwYXJ0LnJhZGlvX3dpdGhfc3RhdHVzX2RlZ3JlZXMuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgdm0uZGF0YVtpdGVtLmlkXSA9IHZtLmRhdGFbaXRlbS5pZF0gfHwge307XG5cbiAgICAgICAgICBpZiAodm0uZGF0YVtpdGVtLmlkXS5yZXN1bHQgPT0gbnVsbCkge1xuICAgICAgICAgICAgdm0uZGF0YVtpdGVtLmlkXS5yZXN1bHQgPSBcIjFcIjtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gZGF0YSDmlLnlj5jliJnlsIblhbbkv53lrZjliLAgbG9jYWwgc3RvcmFnZVxuICAgIHZtLiR3YXRjaCgnZGF0YScsIGZ1bmN0aW9uKHYpIHtcbiAgICAgICRsb2cubG9nKCdmb3JtIGRhdGE6ICcsIEpTT04uc3RyaW5naWZ5KHYpKTtcblxuICAgICAgc2F2ZSgpO1xuXG4gICAgICBzYXZlX2VycigpO1xuICAgIH0sIHRydWUpO1xuXG4gICAgXG4gICAgLy8g5L+d5a2Y5YiwIGxvY2FsU3RvcmFnZVxuICAgIC8vIOaVsOaNruagvOW8j+S4uu+8mlxuICAgIC8vIHtcbiAgICAvLyAgIFwicjFcIjoge1xuICAgIC8vICAgICBcInJlc3VsdFwiOiAxLFxuICAgIC8vICAgICBcInN0YXRlXCI6IDEsXG4gICAgLy8gICAgIFwiZGVncmVlXCI6IDEsXG4gICAgLy8gICAgIFwibWVtb1wiOiBcInh4eFwiLFxuICAgIC8vICAgICBcImltYWdlXCI6IFwiXCJcbiAgICAvLyAgIH1cbiAgICAvLyB9XG4gICAgZnVuY3Rpb24gc2F2ZSgpIHtcbiAgICAgIHZhciBkYXRhID0gbG9jYWxTdG9yYWdlU2VydmljZS5nZXQocmVwb3J0X2tleSkgfHwge307XG4gICAgICBkYXRhW2N1cnJlbnRfcGFydF0gPSB2bS5kYXRhO1xuXG4gICAgICBsb2NhbFN0b3JhZ2VTZXJ2aWNlLnNldChyZXBvcnRfa2V5LCBkYXRhKTtcblxuICAgICAgJGxvZy5sb2coJ+W9leWFpeajgOa1i+aKpeWRiiAtICcgKyByZXBvcnRfa2V5LCBkYXRhW2N1cnJlbnRfcGFydF0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNhdmVfZXJyKCkge1xuICAgICAgdmFyIGRhdGEgPSBsb2NhbFN0b3JhZ2VTZXJ2aWNlLmdldChyZXBvcnRfZXJyX2tleSkgfHwge307XG4gICAgICB2YXIgZXJyX2l0ZW1zID0gW107XG5cbiAgICAgIC8vIOetm+mAieWHuue8uumZt+eahOmhue+8jOaIlumcgOimgeaLjeeFp+eahOmhuVxuICAgICAgXy5lYWNoKHZtLmRhdGEsIGZ1bmN0aW9uKGl0ZW0sIGtleSkge1xuICAgICAgICBpZiAoaXRlbS5pbWFnZSkge1xuICAgICAgICAgIGl0ZW0uaWQgPSBrZXk7XG4gICAgICAgICAgZXJyX2l0ZW1zLnB1c2goaXRlbSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyDlpoLmnpzor6UgcGFydCDmsqHmnInmi43nhadcbiAgICAgIGlmICghZXJyX2l0ZW1zLmxlbmd0aCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBcbiAgICAgIGRhdGFbY3VycmVudF9wYXJ0XSA9IGVycl9pdGVtcztcblxuICAgICAgbG9jYWxTdG9yYWdlU2VydmljZS5zZXQocmVwb3J0X2Vycl9rZXksIGRhdGEpO1xuXG4gICAgICAkbG9nLmxvZygn5b2V5YWl5qOA5rWL5oql5ZGK6Zeu6aKY6aG5IC0gJyArIHJlcG9ydF9lcnJfa2V5LCBkYXRhW2N1cnJlbnRfcGFydF0pO1xuICAgIH1cblxuICAgIHZtLnNob3dfZGV0YWlsID0gc2hvd19kZXRhaWw7XG4gICAgdm0uc2hvdWxkX2NsZWFyID0gc2hvdWxkX2NsZWFyO1xuICAgIHZtLnRha2VfcGhvdG8gPSB0YWtlX3Bob3RvO1xuICAgIHZtLm9wZW5fZGF0ZXBpY2tlciA9IG9wZW5fZGF0ZXBpY2tlcjtcbiAgICB2bS5zaG93X3Rha2VfcGhvdG8gPSBzaG93X3Rha2VfcGhvdG87XG4gICAgdm0uc2hvd19waG90byA9IHNob3dfcGhvdG87XG5cbiAgICAvLyDpgb/lhY3lsZXnpLrkuKTmrKEgbW9kYWxcbiAgICBmdW5jdGlvbiBzaG93X2RldGFpbChpbmRleCwgcGFydCwgY2hlY2tfaXRlbSkge1xuICAgICAgLy8gY2hhbmdlIOS6i+S7tuWPkeeUn+WcqCBjbGljayDkuYvlkI5cbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIOWFtuS7lumAiemhueS4jeW6lOivpeW8ueWHulxuICAgICAgICBpZiAoc2hvd19kZXRhaWwuaXNfc2hvdyB8fCBwYXJzZUludCh2bS5kYXRhW2NoZWNrX2l0ZW0uaWRdLnJlc3VsdCkgIT09IDIpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBzaG93X2RldGFpbC5pc19zaG93ID0gdHJ1ZTtcblxuICAgICAgICB2YXIgaW5wdXRfZGV0YWlsX2lucyA9ICRtb2RhbC5vcGVuKHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3JlcG9ydC9pbnB1dF9kZXRhaWwuaHRtJyxcbiAgICAgICAgICBjb250cm9sbGVyOiAnSXRlbUlucHV0RGV0YWlsQ3RybCcsXG4gICAgICAgICAgYmFja2Ryb3A6ICdzdGF0aWMnLFxuICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgIGl0ZW1fZGV0YWlsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGFuZ3VsYXIuZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICBwYXJ0X25hbWU6IHBhcnQubmFtZSxcbiAgICAgICAgICAgICAgICBwYXJ0X2FsaWFzOiBwYXJ0LmFsaWFzLFxuICAgICAgICAgICAgICAgIGluZGV4OiBpbmRleFxuICAgICAgICAgICAgICB9LCBjaGVja19pdGVtLCB2bS5kYXRhW2NoZWNrX2l0ZW0uaWRdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlucHV0X2RldGFpbF9pbnMucmVzdWx0LnRoZW4oZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgIGFuZ3VsYXIuZXh0ZW5kKHZtLmRhdGFbY2hlY2tfaXRlbS5pZF0sIGl0ZW0sIHtcbiAgICAgICAgICAgIG5hbWU6IGNoZWNrX2l0ZW0ubmFtZVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgc2hvd19kZXRhaWwuaXNfc2hvdyA9IGZhbHNlO1xuICAgICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBzaG93X2RldGFpbC5pc19zaG93ID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2hvd19kZXRhaWwuaXNfc2hvdyA9IGZhbHNlO1xuXG4gICAgZnVuY3Rpb24gc2hvdWxkX2NsZWFyKGl0ZW0pIHtcbiAgICAgIC8vIOiLpeajgOa1i+aXoOmXrumimO+8jOWImea4hemZpOS5i+WJjeWhq+WGmeeahOaNn+S8pOaVsOaNrlxuICAgICAgdmFyIHIgPSBwYXJzZUludCh2bS5kYXRhW2l0ZW0uaWRdLnJlc3VsdCk7XG4gICAgICBpZiAociAhPT0gMiB8fCByICE9PSA1KSB7XG4gICAgICAgIGFuZ3VsYXIuZXh0ZW5kKHZtLmRhdGFbaXRlbS5pZF0sIHtcbiAgICAgICAgICBzdGF0ZTogbnVsbCxcbiAgICAgICAgICBkZWdyZWU6IG51bGwsXG4gICAgICAgICAgbWVtbzogbnVsbCxcbiAgICAgICAgICBpbWFnZTogbnVsbFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBUT0RPXG4gICAgLy8g5Zu+54mH6aKE6KeIXG4gICAgZnVuY3Rpb24gc2hvd19waG90byhmaWVsZCkge1xuICAgICAgRnVsbFNjcmVlbkltYWdlLnNob3dJbWFnZVVSTCh2bS5kYXRhW2ZpZWxkLmlkXS5pbWFnZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdGFrZV9waG90byhwYXJ0LCBpdGVtKSB7XG4gICAgICBuYXZpZ2F0b3IuY2FtZXJhLmdldFBpY3R1cmUodGFrZV9waG90b19zdWNjZXNzLCB0YWtlX3Bob3RvX2Vycm9yLCB7XG4gICAgICAgIHF1YWxpdHkgOiAxMDAsXG4gICAgICAgIGRlc3RpbmF0aW9uVHlwZSA6IENhbWVyYS5EZXN0aW5hdGlvblR5cGUuRklMRV9VUkksXG4gICAgICAgIHNvdXJjZVR5cGUgOiBDYW1lcmEuUGljdHVyZVNvdXJjZVR5cGUuQ0FNRVJBLFxuICAgICAgICBhbGxvd0VkaXQgOiB0cnVlLFxuICAgICAgICBlbmNvZGluZ1R5cGU6IENhbWVyYS5FbmNvZGluZ1R5cGUuUE5HLFxuICAgICAgICAvLyB0YXJnZXRXaWR0aDogMTAwLFxuICAgICAgICAvLyB0YXJnZXRIZWlnaHQ6IDEwMCxcbiAgICAgICAgc2F2ZVRvUGhvdG9BbGJ1bTogZmFsc2VcbiAgICAgIH0pO1xuXG4gICAgICBmdW5jdGlvbiB0YWtlX3Bob3RvX3N1Y2Nlc3MoaW1ndXJsKSB7XG4gICAgICAgIHZtLmRhdGFbaXRlbS5pZF0gPSBhbmd1bGFyLmV4dGVuZCh2bS5kYXRhW2l0ZW0uaWRdIHx8IHt9LCB7XG4gICAgICAgICAgaW1hZ2U6IGltZ3VybCxcbiAgICAgICAgICBuYW1lOiBpdGVtLm5hbWVcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdm0uJGFwcGx5KCk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHRha2VfcGhvdG9fZXJyb3IoKSB7XG4gICAgICAgICRsb2cuZXJyb3IoJ+aLjeeFp+Wksei0pSwg5YiG57G7IC0gJyArIHBhcnQubmFtZSArICcsIOmhuSAtICcgKyBpdGVtLm5hbWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIOaXpeacn+aOp+S7tuaYvuekui/pmpDol48v56aB55SoXG4gICAgdm0uZHBfcGFyYW1zID0ge1xuICAgICAgc2hvd1dlZWtzOiBmYWxzZVxuICAgIH07XG4gICAgZnVuY3Rpb24gb3Blbl9kYXRlcGlja2VyKCRldmVudCwgZHApIHtcbiAgICAgICRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICB2bS5kcF9wYXJhbXNbZHBdID0gdHJ1ZTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gc2hvd190YWtlX3Bob3RvKGluZGV4LCBwYXJ0LCBjaGVja19pdGVtKSB7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoc2hvd190YWtlX3Bob3RvLmlzX3Nob3cgfHwgcGFyc2VJbnQodm0uZGF0YVtjaGVja19pdGVtLmlkXS5yZXN1bHQpICE9PSA1KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgc2hvd190YWtlX3Bob3RvLmlzX3Nob3cgPSB0cnVlO1xuXG4gICAgICAgIHZhciB0YWtlX3Bob3RvX21vZGFsID0gJG1vZGFsLm9wZW4oe1xuICAgICAgICAgIHRlbXBsYXRlVXJsOiAncmVwb3J0L3Rha2VfcGhvdG9fbW9kYWwuaHRtJyxcbiAgICAgICAgICBjb250cm9sbGVyOiAnSXRlbVRha2VQaG90b0N0cmwnLFxuICAgICAgICAgIGJhY2tkcm9wOiAnc3RhdGljJyxcbiAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICBpdGVtX2RldGFpbDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBhbmd1bGFyLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgcGFydF9uYW1lOiBwYXJ0Lm5hbWUsXG4gICAgICAgICAgICAgICAgcGFydF9hbGlhczogcGFydC5hbGlhcyxcbiAgICAgICAgICAgICAgICBpbmRleDogaW5kZXhcbiAgICAgICAgICAgICAgfSwgY2hlY2tfaXRlbSwgdm0uZGF0YVtjaGVja19pdGVtLmlkXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0YWtlX3Bob3RvX21vZGFsLnJlc3VsdC50aGVuKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICBhbmd1bGFyLmV4dGVuZCh2bS5kYXRhW2NoZWNrX2l0ZW0uaWRdLCBpdGVtLCB7XG4gICAgICAgICAgICBuYW1lOiBjaGVja19pdGVtLm5hbWVcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHNob3dfdGFrZV9waG90by5pc19zaG93ID0gZmFsc2U7XG4gICAgICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHNob3dfdGFrZV9waG90by5pc19zaG93ID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2hvd190YWtlX3Bob3RvLmlzX3Nob3cgPSBmYWxzZTtcbiAgfSlcblxuICAuY29udHJvbGxlcignSXRlbUlucHV0RGV0YWlsQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJGxvZywgJG1vZGFsSW5zdGFuY2UsIGl0ZW1fZGV0YWlsKSB7XG4gICAgdmFyIHZtID0gJHNjb3BlO1xuXG4gICAgYW5ndWxhci5leHRlbmQodm0sIGl0ZW1fZGV0YWlsKTtcblxuICAgIHZtLnN1Ym1pdCA9IHN1Ym1pdDtcbiAgICB2bS5jYW5jZWwgPSBjYW5jZWw7XG4gICAgdm0udGFrZV9waG90byA9IHRha2VfcGhvdG87XG4gICAgdm0uc2hvd19waG90byA9IHNob3dfcGhvdG87XG5cbiAgICBmdW5jdGlvbiBzdWJtaXQoKSB7XG4gICAgICAkbW9kYWxJbnN0YW5jZS5jbG9zZSh7XG4gICAgICAgIHN0YXRlOiB2bS5zdGF0ZSxcbiAgICAgICAgZGVncmVlOiB2bS5kZWdyZWUsXG4gICAgICAgIG1lbW86IHZtLm1lbW8sXG4gICAgICAgIGltYWdlOiB2bS5pbWFnZVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2FuY2VsKCkge1xuICAgICAgJG1vZGFsSW5zdGFuY2UuZGlzbWlzcygpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNob3dfcGhvdG8oZmllbGQpIHtcbiAgICAgIEZ1bGxTY3JlZW5JbWFnZS5zaG93SW1hZ2VVUkwodm0uZGF0YVtmaWVsZC5pZF0uaW1hZ2UpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRha2VfcGhvdG8oKSB7XG4gICAgICBuYXZpZ2F0b3IuY2FtZXJhLmdldFBpY3R1cmUodGFrZV9waG90b19zdWNjZXNzLCB0YWtlX3Bob3RvX2Vycm9yLCB7XG4gICAgICAgIHF1YWxpdHkgOiAxMDAsXG4gICAgICAgIGRlc3RpbmF0aW9uVHlwZSA6IENhbWVyYS5EZXN0aW5hdGlvblR5cGUuRklMRV9VUkksXG4gICAgICAgIHNvdXJjZVR5cGUgOiBDYW1lcmEuUGljdHVyZVNvdXJjZVR5cGUuQ0FNRVJBLFxuICAgICAgICBhbGxvd0VkaXQgOiB0cnVlLFxuICAgICAgICBlbmNvZGluZ1R5cGU6IENhbWVyYS5FbmNvZGluZ1R5cGUuUE5HLFxuICAgICAgICAvLyB0YXJnZXRXaWR0aDogMTAwLFxuICAgICAgICAvLyB0YXJnZXRIZWlnaHQ6IDEwMCxcbiAgICAgICAgc2F2ZVRvUGhvdG9BbGJ1bTogZmFsc2VcbiAgICAgIH0pO1xuXG4gICAgICBmdW5jdGlvbiB0YWtlX3Bob3RvX3N1Y2Nlc3MoaW1ndXJsKSB7XG4gICAgICAgIHZtLmltYWdlID0gaW1ndXJsO1xuICAgICAgICB2bS4kYXBwbHkoKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gdGFrZV9waG90b19lcnJvcigpIHtcbiAgICAgICAgJGxvZy5lcnJvcign5ouN54Wn5aSx6LSlLCDliIbnsbsgLSAnICsgaXRlbV9kZXRhaWwucGFydF9uYW1lICsgJywg6aG5IC0gJyArIGl0ZW1fZGV0YWlsLm5hbWUpO1xuICAgICAgfVxuICAgIH1cbiAgfSlcblxuICAuY29udHJvbGxlcignSXRlbVRha2VQaG90b0N0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRsb2csICRtb2RhbEluc3RhbmNlLCBpdGVtX2RldGFpbCkge1xuICAgICAgdmFyIHZtID0gJHNjb3BlO1xuXG4gICAgICBhbmd1bGFyLmV4dGVuZCh2bSwgaXRlbV9kZXRhaWwpO1xuXG4gICAgICB2bS5zdWJtaXQgPSBzdWJtaXQ7XG4gICAgICB2bS5jYW5jZWwgPSBjYW5jZWw7XG4gICAgICB2bS50YWtlX3Bob3RvID0gdGFrZV9waG90bztcbiAgICAgIHZtLnNob3dfcGhvdG8gPSBzaG93X3Bob3RvO1xuXG4gICAgICBmdW5jdGlvbiBzdWJtaXQoKSB7XG4gICAgICAgICRtb2RhbEluc3RhbmNlLmNsb3NlKHtcbiAgICAgICAgICBpbWFnZTogdm0uaW1hZ2VcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGNhbmNlbCgpIHtcbiAgICAgICAgJG1vZGFsSW5zdGFuY2UuZGlzbWlzcygpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBzaG93X3Bob3RvKGZpZWxkKSB7XG4gICAgICAgIEZ1bGxTY3JlZW5JbWFnZS5zaG93SW1hZ2VVUkwodm0uZGF0YVtmaWVsZC5pZF0uaW1hZ2UpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiB0YWtlX3Bob3RvKCkge1xuICAgICAgICBuYXZpZ2F0b3IuY2FtZXJhLmdldFBpY3R1cmUodGFrZV9waG90b19zdWNjZXNzLCB0YWtlX3Bob3RvX2Vycm9yLCB7XG4gICAgICAgICAgcXVhbGl0eSA6IDEwMCxcbiAgICAgICAgICBkZXN0aW5hdGlvblR5cGUgOiBDYW1lcmEuRGVzdGluYXRpb25UeXBlLkZJTEVfVVJJLFxuICAgICAgICAgIHNvdXJjZVR5cGUgOiBDYW1lcmEuUGljdHVyZVNvdXJjZVR5cGUuQ0FNRVJBLFxuICAgICAgICAgIGFsbG93RWRpdCA6IHRydWUsXG4gICAgICAgICAgZW5jb2RpbmdUeXBlOiBDYW1lcmEuRW5jb2RpbmdUeXBlLlBORyxcbiAgICAgICAgICAvLyB0YXJnZXRXaWR0aDogMTAwLFxuICAgICAgICAgIC8vIHRhcmdldEhlaWdodDogMTAwLFxuICAgICAgICAgIHNhdmVUb1Bob3RvQWxidW06IGZhbHNlXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZ1bmN0aW9uIHRha2VfcGhvdG9fc3VjY2VzcyhpbWd1cmwpIHtcbiAgICAgICAgICB2bS5pbWFnZSA9IGltZ3VybDtcbiAgICAgICAgICB2bS4kYXBwbHkoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHRha2VfcGhvdG9fZXJyb3IoKSB7XG4gICAgICAgICAgJGxvZy5lcnJvcign5ouN54Wn5aSx6LSlLCDliIbnsbsgLSAnICsgaXRlbV9kZXRhaWwucGFydF9uYW1lICsgJywg6aG5IC0gJyArIGl0ZW1fZGV0YWlsLm5hbWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gIH0pXG5cbiAgLmNvbnRyb2xsZXIoJ1JlcG9ydExpc3RDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkbG9jYXRpb24sIFJlcG9ydHNTdmMsIEluZGVudEVudW1zLCB0b2FzdHIpIHtcbiAgICB2YXIgdm0gPSAkc2NvcGU7XG4gICAgdmFyIHFzbyA9ICRsb2NhdGlvbi5zZWFyY2goKTtcblxuICAgIHZtLnBhZ2UgPSBwYXJzZUludChxc28ucGFnZSkgfHwgMTtcbiAgICB2bS5zaXplID0gcGFyc2VJbnQocXNvLnNpemUpIHx8IDIwO1xuICAgIHZtLnNpemVzID0gSW5kZW50RW51bXMubGlzdCgnc2l6ZScpO1xuICAgIHZtLnNpemVfaXRlbSA9IEluZGVudEVudW1zLml0ZW0oJ3NpemUnLCB2bS5zaXplKTtcblxuICAgIHZtLnNpemVfY2hhbmdlID0gc2l6ZV9jaGFuZ2U7XG4gICAgdm0ucGFnZV9jaGFuZ2UgPSBwYWdlX2NoYW5nZTtcblxuICAgIHF1ZXJ5KCk7XG5cbiAgICBmdW5jdGlvbiBxdWVyeSgpIHtcbiAgICAgIHZhciBwYXJhbXMgPSB7XG4gICAgICAgIGl0ZW1zX3BhZ2U6IHZtLnNpemUsXG4gICAgICAgIHBhZ2U6IHZtLnBhZ2UsXG4gICAgICB9O1xuICAgICAgXG4gICAgICAkbG9jYXRpb24uc2VhcmNoKHBhcmFtcyk7XG5cbiAgICAgIFJlcG9ydHNTdmNcbiAgICAgICAgLnF1ZXJ5KHBhcmFtcylcbiAgICAgICAgLiRwcm9taXNlXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJzKSB7XG4gICAgICAgICAgcnMuaXRlbXMuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICBpdGVtLnN0YXR1c190ZXh0ID0gSW5kZW50RW51bXMudGV4dCgnb3JkZXJfc3RhdHVzJywgaXRlbS5zdGF0dXNfaWQpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgdm0uaXRlbXMgPSBycy5pdGVtcztcbiAgICAgICAgICB2bS50b3RhbF9jb3VudCA9IHJzLnRvdGFsX2NvdW50O1xuXG4gICAgICAgICAgdmFyIHRtcCA9IHJzLnRvdGFsX2NvdW50IC8gdm0uc2l6ZTtcbiAgICAgICAgICB2bS5wYWdlX2NvdW50ID0gcnMudG90YWxfY291bnQgJSB2bS5zaXplID09PSAwID8gdG1wIDogKE1hdGguZmxvb3IodG1wKSArIDEpO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgdG9hc3RyLmVycm9yKHJlcy5tc2cgfHwgJ+afpeivouWksei0pe+8jOacjeWKoeWZqOWPkeeUn+acquefpemUmeivr++8jOivt+mHjeivlScpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyDmr4/pobXmnaHmlbDmlLnlj5hcbiAgICBmdW5jdGlvbiBzaXplX2NoYW5nZShzaXplKSB7XG4gICAgICB2bS5zaXplID0gc2l6ZTtcbiAgICAgIHZtLnBhZ2UgPSAxO1xuXG4gICAgICBxdWVyeSgpO1xuICAgIH1cblxuICAgIC8vIOe/u+mhtVxuICAgIGZ1bmN0aW9uIHBhZ2VfY2hhbmdlKHBhZ2UpIHtcbiAgICAgIHZtLnBhZ2UgPSBwYWdlO1xuXG4gICAgICBxdWVyeSgpO1xuICAgIH1cbiAgfSk7XG5cblxuXG5cblxuIiwiYW5ndWxhclxuICAubW9kdWxlKCdndWx1LnJlcG9ydC5zdmNzJywgWyduZ1Jlc291cmNlJ10pXG5cbiAgLnNlcnZpY2UoJ1JlcG9ydHNTdmMnLCBmdW5jdGlvbigkcmVzb3VyY2UpIHtcbiAgICByZXR1cm4gJHJlc291cmNlKEFQSV9TRVJWRVJTLnRlc3RlciArICcvcmVwb3J0cycsIHt9LCB7XG4gICAgICBxdWVyeToge1xuICAgICAgICBpc0FycmF5OiBmYWxzZVxuICAgICAgfVxuICAgIH0pO1xuICB9KVxuXG4gIC5zZXJ2aWNlKCdSZXBvcnRTdmMnLCBmdW5jdGlvbigkcmVzb3VyY2UpIHtcbiAgICByZXR1cm4gJHJlc291cmNlKEFQSV9TRVJWRVJTLnRlc3RlciArICcvcmVwb3J0Jyk7XG4gIH0pOyIsImFuZ3VsYXJcbiAgLm1vZHVsZSgnZ3VsdS5sb2dpbicpXG4gIFxuICAuY29udHJvbGxlcignTG9naW5DdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgJHEsICRsb2NhdGlvbiwgJHRpbWVvdXQsIHRvYXN0ciwgTG9naW5TdmMpIHtcbiAgICB2YXIgdm0gPSAkc2NvcGU7XG5cbiAgICB2bS5sb2dpbiA9IGxvZ2luO1xuXG4gICAgZnVuY3Rpb24gbG9naW4oKSB7XG4gICAgICByZXR1cm4gTG9naW5TdmNcbiAgICAgICAgLnNhdmUoe1xuICAgICAgICAgIGpvYl9ubzogdm0uam9iX25vLFxuICAgICAgICAgIHBhc3N3b3JkOiB2bS5wYXNzd29yZFxuICAgICAgICB9KVxuICAgICAgICAuJHByb21pc2VcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgd2luZG93LkF1dGhvcml6YXRpb24gPSByZXMuQXV0aG9yaXphdGlvbjtcbiAgICAgICAgICB3aW5kb3cuQ1NSRlRva2VuID0gcmVzLkNTUkZUb2tlbjtcbiAgICAgICAgICBcbiAgICAgICAgICB0b2FzdHIuc3VjY2VzcyhyZXMubXNnIHx8ICfnmbvlvZXmiJDlip/vvIzmraPlnKjkuLrkvaDot7PovawuLi4nKTtcblxuICAgICAgICAgIHZhciBxcyA9ICRsb2NhdGlvbi5zZWFyY2goKVxuXG4gICAgICAgICAgJGxvY2F0aW9uLnVybChxcy5yZWRpcmVjdCB8fCAnL2luZGVudHMnKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIHRvYXN0ci5lcnJvcihyZXMubXNnIHx8ICfnmbvlvZXlpLHotKXvvIzor7fph43or5UnKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICB9KTsiLCJhbmd1bGFyXG4gIC5tb2R1bGUoJ2d1bHUubG9naW4uc3ZjcycsIFsnbmdSZXNvdXJjZSddKVxuICAuc2VydmljZSgnTG9naW5TdmMnLCBmdW5jdGlvbiAoJHJlc291cmNlKSB7XG4gICAgcmV0dXJuICRyZXNvdXJjZShBUElfU0VSVkVSUy50ZXN0ZXIgKyAnL2FjY291bnQvbG9naW4nKTtcbiAgfSkiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=