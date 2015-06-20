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
      // tester: 'http://guluabc.com'
      // tester: 'http://t.ifdiu.com'
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
  .module('gulu.login', [
    'ui.router',
    'util.oauth',
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
  .module('httpInterceptors', ['LocalStorageModule', 'util.oauth'])

  .config(["$httpProvider", function($httpProvider) {
    $httpProvider.interceptors.push('httpInterceptor');
    
    // Angular $http isn’t appending the header X-Requested-With = XMLHttpRequest since Angular 1.3.0
    $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
  }])

  .factory('httpInterceptor', ["$q", "$rootScope", "$location", "OAuth", function($q, $rootScope, $location, OAuth) {
    return {
      // 请求前修改 request 配置
      'request': function(config) {
        angular.extend(config.headers, OAuth.headers());
        
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
        var current_path = $location.path();

        if (angular.isObject(response.data)) {
          // 若响应数据不符合约定
          if (response.data.code == null) {
            return response;
          }

          code = response.data.code;
          data = response.data.data;

          // 若 status 200, 且 code !200，则返回的是操作错误提示信息
          // 那么，callback 会接收到下面形式的参数：
          // { code: 20001, msg: '操作失败' }
          if (code !== 200) {
            if (code === 401) {
              OAuth.r401(current_path);
            }

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
          OAuth.r401(current_path);
        }

        return $q.reject(rejection);
      }
    };
  }]);
/* global angular*/
angular
  .module('util.keymgr', ['LocalStorageModule'])
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
/* global angular*/
angular
  .module('util.oauth', ['LocalStorageModule'])
  .factory('OAuth', ["$log", "$location", "localStorageService", function($log, $location, localStorageService) {
    var oauth_local_key = 'oauth';

    var oauth_conf = {
      client_id: 'Xeax2OMgeLQPDxfSlrIZ3BZqtFHMnBWIhpAKO7aj',
      client_secret: 'qB5fN7KfHya00ApzP9plIr3upBZoRUvi3hba8DDMf4OS8bHXRfC3Q0gGJBqNs1WnhFffFZwKVaMaAIs7vcZh4jMzbXEjFrJIZ3IpcV7cAxQovW2hUT9qmQKhjO8nAsIM',
      grant_type: 'password'
    };

    var OAuth = {
      conf: function() {
        return oauth_conf;
      },

      r401: function(cur_path) {
        $location.url('/login');
        $location.search('redirect', cur_path);
      },

      headers: function() {
        var tokens = this.local();
        var headers = {};

        if (tokens) {
          headers.Authorization = tokens.token_type + ' ' + tokens.access_token;
        }

        return headers;
      },

      local: function(tokens) {
        if (tokens) {
          localStorageService.set(oauth_local_key, tokens);

          return tokens;
        }

        return localStorageService.get(oauth_local_key);
      }
    };

    return OAuth;
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

  .service('IndentInspectSvc', ["$resource", function($resource) {
    return $resource(API_SERVERS.tester + '/order/:order_id/ongoing', {
      order_id: '@order_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
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
  
  // 全部订单列表
  .controller('IndentListCtrl', ["$scope", "$location", "toastr", "$modal", "IndentsSvc", "IndentSvc", "IndentAcceptSvc", "IndentEnums", function($scope, $location, toastr, $modal,
    IndentsSvc, IndentSvc, IndentAcceptSvc, IndentEnums) {
    var vm = $scope;
    var qso = $location.search();

    vm.status_id = parseInt(qso.status_id) || null;
    
    if (vm.$state.includes('indents.unconfirmed')) {
      vm.status_id = 3;
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
    vm.start_test = start_test;

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
            item.order_through_text = IndentEnums.text('order_through', item.order_through)
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

    // 开始检测
    function start_test() {
      $location.url('/indents/untested');
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
  
  // 当天任务
  .controller('UntestedIndentListCtrl', ["$scope", "$log", "$location", "$modal", "$templateCache", "toastr", "Filer", "Uploader", "KeyMgr", "localStorageService", "UntestedIndentsSvc", "IndentEnums", "IndentInspectSvc", "IndentCarSvc", "ReportSvc", function($scope, $log, $location, $modal, $templateCache, toastr,
    Filer, Uploader, KeyMgr, localStorageService, UntestedIndentsSvc, IndentEnums, IndentInspectSvc,
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
    vm.inspect = inspect;

    query();

    function query() {
      return UntestedIndentsSvc
        .query()
        .$promise
        .then(function(res) {
          res.forEach(function(order) {
            order.order_through_text = IndentEnums.text('order_through', order.order_through);

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

    // 检测
    function inspect(order_id, car_id) {
      return IndentInspectSvc
        .update({
          order_id: order_id
        })
        .$promise
        .then(function(res) {
          toastr.success(res.msg || '检测开始');

          $location.url('/indents/' + order_id + '/car/' + car_id + '/report/' + vm.first_part_id);
        })
        .catch(function(res) {
          toastr.error(res.msg || '订单取消失败，请重试');
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
  .module('gulu.login')
  
  .controller('LoginCtrl', ["$scope", "$q", "$location", "$timeout", "toastr", "LoginSvc", "OAuth", function ($scope, $q, $location, $timeout, toastr, LoginSvc, OAuth) {
    var vm = $scope;

    vm.login = login;

    function login() {
      return LoginSvc
        .save(angular.extend(OAuth.conf(), {
          username: vm.job_no,
          password: vm.password
        }))
        .$promise
        .then(function(res) {
          OAuth.local(res.toJSON());

          toastr.success(res.msg || '登录成功，正在为你跳转...');

          var qs = $location.search();
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
    return $resource(API_SERVERS.tester + '/oauth2/token', null, {
      save: {
        method: 'POST',
        
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
        },
        
        transformRequest: function(data) {
          var str = [];
          
          angular.forEach(data, function(value, key) {
            this.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
          }, str);

          return str.join('&');
        }
      }
    });
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
      var image = vm[category === 'self' ? 'data' : 'data_other'][field.id].image;
      
      if (!image) {
        return;
      }

      FullScreenImage.showImageURL(image);
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
                part_alias: part.aspect,
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
                part_alias: part.aspect,
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

    function show_photo(image) {
      if (!image) {
        return;
      }

      FullScreenImage.showImageURL(image);
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

      function show_photo(image) {
        if (!image) {
          return;
        }

        FullScreenImage.showImageURL(image);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImluZGVudC9pbmRlbnRfbW9kdWxlLmpzIiwibG9naW4vbG9naW5fbW9kdWxlLmpzIiwicmVwb3J0L3JlcG9ydF9tb2R1bGUuanMiLCI0MDQvNDA0X2N0cmwuanMiLCJjb21wb25lbnQvY3VzdG9tLWRpcmVjdGl2ZS5qcyIsImNvbXBvbmVudC9jdXN0b20tZmlsdGVyLmpzIiwiY29tcG9uZW50L2RhdGUuanMiLCJjb21wb25lbnQvZW51bXMuanMiLCJjb21wb25lbnQvZmlsZXIuanMiLCJjb21wb25lbnQvaHR0cC5qcyIsImNvbXBvbmVudC9rZXltZ3IuanMiLCJjb21wb25lbnQvb2F1dGguanMiLCJjb21wb25lbnQvdXBsb2FkZXIuanMiLCJjb21wb25lbnQvdm0uanMiLCJjb21wb25lbnQvemgtY24uanMiLCJpbmRlbnQvZW51bXMuanMiLCJpbmRlbnQvaW5kZW50X3N2Y3MuanMiLCJpbmRlbnQvbGlzdF9jdHJsLmpzIiwibG9naW4vbG9naW5fY3RybC5qcyIsImxvZ2luL2xvZ2luX3N2Y3MuanMiLCJyZXBvcnQvaW5wdXRfcmVwb3J0LmpzIiwicmVwb3J0L3JlcG9ydF9jdHJsLmpzIiwicmVwb3J0L3JlcG9ydF9zdmNzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7QUFNQTtHQUNBLE9BQUEsUUFBQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7O0dBRUEsa0dBQUEsU0FBQSxtQkFBQSxvQkFBQSxjQUFBLDZCQUFBOzs7SUFHQTtPQUNBLFVBQUE7T0FDQSxXQUFBOzs7SUFHQTtPQUNBLFVBQUE7OztJQUdBLGFBQUEsYUFBQTs7O0lBR0E7T0FDQSxVQUFBO09BQ0EsVUFBQSxNQUFBOzs7SUFHQSxjQUFBO01BQ0EsUUFBQTs7Ozs7SUFLQSxRQUFBLFFBQUEsVUFBQSxHQUFBLGVBQUEsV0FBQTtNQUNBLFFBQUEs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QUNBLElBQUEsSUFBQSxLQUFBO1FBQ0EsSUFBQSxJQUFBLEtBQUE7O1FBRUEsSUFBQSxJQUFBLElBQUE7VUFDQSxJQUFBLE1BQUE7OztRQUdBLElBQUEsSUFBQSxJQUFBO1VBQ0EsSUFBQSxNQUFBOzs7UUFHQSxPQUFBLENBQUEsU0FBQSxNQUFBLE1BQUEsSUFBQSxNQUFBLEdBQUEsS0FBQTs7Ozs7QUN2QkE7R0FDQSxPQUFBLGNBQUE7R0FDQSxRQUFBLFNBQUEsWUFBQTtJQUNBLE9BQUEsVUFBQSxPQUFBO01BQ0EsT0FBQTtRQUNBLEtBQUEsVUFBQSxNQUFBLE1BQUE7VUFDQSxPQUFBLE1BQUEsTUFBQSxLQUFBLFVBQUEsTUFBQTtZQUNBLE9BQUEsS0FBQSxTQUFBO2FBQ0E7O1FBRUEsTUFBQSxVQUFBLE1BQUEsS0FBQTtVQUNBLE9BQUEsTUFBQSxNQUFBLEtBQUEsVUFBQSxNQUFBO1lBQ0EsT0FBQSxLQUFBLFVBQUE7YUFDQTs7UUFFQSxNQUFBLFVBQUEsTUFBQSxLQUFBO1VBQ0EsT0FBQSxNQUFBLE1BQUEsS0FBQSxVQUFBLE1BQUE7WUFDQSxPQUFBLEtBQUEsVUFBQTs7O1FBR0EsV0FBQSxTQUFBLE1BQUEsTUFBQTtVQUNBLE9BQUEsTUFBQSxNQUFBLEtBQUEsU0FBQSxNQUFBO1lBQ0EsT0FBQSxLQUFBLFNBQUE7OztRQUdBLE1BQUEsVUFBQSxNQUFBO1VBQ0EsT0FBQSxNQUFBOztRQUVBLE9BQUEsVUFBQSxNQUFBLE1BQUE7VUFDQSxPQUFBLE1BQUEsTUFBQSxPQUFBLFVBQUEsTUFBQTtZQUNBLE9BQUEsS0FBQSxRQUFBLEtBQUEsV0FBQSxDQUFBOzs7Ozs7O0FDOUJBO0dBQ0EsT0FBQSxjQUFBO0dBQ0EsUUFBQSw2QkFBQSxTQUFBLFNBQUEsTUFBQTtJQUNBLElBQUEsUUFBQTtJQUNBLE1BQUEsU0FBQSxTQUFBLEtBQUE7TUFDQSxRQUFBLDBCQUFBLEtBQUEsTUFBQSxXQUFBLE1BQUE7OztJQUdBLE1BQUEsWUFBQSxTQUFBLFdBQUE7TUFDQSxVQUFBLE9BQUEsV0FBQTtRQUNBLEtBQUEsS0FBQSxlQUFBLFVBQUE7U0FDQSxXQUFBO1FBQ0EsS0FBQSxLQUFBLGVBQUEsVUFBQTs7OztJQUlBLE1BQUEsVUFBQSxTQUFBLEtBQUE7TUFDQSxLQUFBLEtBQUEsZUFBQSxLQUFBLFVBQUEsSUFBQTs7O0lBR0EsT0FBQTs7QUNyQkE7R0FDQSxPQUFBLG9CQUFBLENBQUEsc0JBQUE7O0dBRUEseUJBQUEsU0FBQSxlQUFBO0lBQ0EsY0FBQSxhQUFBLEtBQUE7OztJQUdBLGNBQUEsU0FBQSxRQUFBLE9BQUEsc0JBQUE7OztHQUdBLFFBQUEsOERBQUEsU0FBQSxJQUFBLFlBQUEsV0FBQSxPQUFBO0lBQ0EsT0FBQTs7TUFFQSxXQUFBLFNBQUEsUUFBQTtRQUNBLFFBQUEsT0FBQSxPQUFBLFNBQUEsTUFBQTs7O1FBR0EsSUFBQSxPQUFBLElBQUEsUUFBQSxZQUFBLENBQUEsS0FBQSxPQUFBLElBQUEsUUFBQSxXQUFBLENBQUEsR0FBQTtVQUNBLE9BQUE7OztRQUdBLE9BQUEsTUFBQSxPQUFBLE1BQUEsUUFBQSxJQUFBLE9BQUE7O1FBRUEsT0FBQTs7OztNQUlBLGdCQUFBLFNBQUEsV0FBQTtRQUNBLE9BQUEsR0FBQSxPQUFBOzs7Ozs7Ozs7TUFTQSxZQUFBLFNBQUEsVUFBQTs7UUFFQSxJQUFBLE1BQUE7UUFDQSxJQUFBLGVBQUEsVUFBQTs7UUFFQSxJQUFBLFFBQUEsU0FBQSxTQUFBLE9BQUE7O1VBRUEsSUFBQSxTQUFBLEtBQUEsUUFBQSxNQUFBO1lBQ0EsT0FBQTs7O1VBR0EsT0FBQSxTQUFBLEtBQUE7VUFDQSxPQUFBLFNBQUEsS0FBQTs7Ozs7VUFLQSxJQUFBLFNBQUEsS0FBQTtZQUNBLElBQUEsU0FBQSxLQUFBO2NBQ0EsTUFBQSxLQUFBOzs7WUFHQSxPQUFBLEdBQUEsT0FBQTs7Ozs7O1VBTUEsSUFBQSxRQUFBLE1BQUE7WUFDQSxTQUFBLE9BQUE7Ozs7Ozs7OztRQVNBLE9BQUE7Ozs7TUFJQSxpQkFBQSxTQUFBLFdBQUE7UUFDQSxJQUFBLGVBQUEsVUFBQTs7UUFFQSxJQUFBLFVBQUEsV0FBQSxLQUFBO1VBQ0EsTUFBQSxLQUFBOzs7UUFHQSxPQUFBLEdBQUEsT0FBQTs7Ozs7QUNyRkE7R0FDQSxPQUFBLGVBQUEsQ0FBQTtHQUNBLFFBQUEsMENBQUEsU0FBQSxNQUFBLHFCQUFBO0lBQ0EsSUFBQSxTQUFBO01BQ0EsYUFBQTs7TUFFQSxRQUFBLFNBQUEsVUFBQSxRQUFBO1FBQ0EsSUFBQSxVQUFBLFdBQUEsR0FBQTtVQUNBLE1BQUEsSUFBQSxNQUFBOzs7UUFHQSxPQUFBLENBQUEsVUFBQSxRQUFBLEtBQUEsT0FBQTs7O01BR0EsUUFBQSxTQUFBLEtBQUEsVUFBQSxRQUFBO1FBQ0EsSUFBQSxVQUFBLFdBQUEsR0FBQTtVQUNBLE1BQUEsSUFBQSxNQUFBLFlBQUEsTUFBQTs7OztRQUlBLElBQUEsVUFBQSxXQUFBLEdBQUE7VUFDQSxPQUFBLENBQUEsVUFBQSxLQUFBLEtBQUEsT0FBQTs7O1FBR0EsT0FBQSxDQUFBLFVBQUEsUUFBQSxLQUFBLEtBQUEsT0FBQTs7OztJQUlBLFFBQUEsT0FBQSxRQUFBO01BQ0EsS0FBQSxPQUFBLE9BQUEsS0FBQSxRQUFBOztNQUVBLFFBQUEsT0FBQSxPQUFBLEtBQUEsUUFBQTs7TUFFQSxRQUFBLE9BQUEsT0FBQSxLQUFBLFFBQUE7O01BRUEsT0FBQSxTQUFBLFVBQUEsUUFBQTtRQUNBLG9CQUFBLE9BQUEsT0FBQSxPQUFBLFVBQUE7UUFDQSxvQkFBQSxPQUFBLE9BQUEsT0FBQSxVQUFBO1FBQ0Esb0JBQUEsT0FBQSxPQUFBLE9BQUEsVUFBQTtRQUNBLG9CQUFBLE9BQUEsT0FBQSxJQUFBLFVBQUE7Ozs7SUFJQSxPQUFBOzs7QUMzQ0E7R0FDQSxPQUFBLGNBQUEsQ0FBQTtHQUNBLFFBQUEsc0RBQUEsU0FBQSxNQUFBLFdBQUEscUJBQUE7SUFDQSxJQUFBLGtCQUFBOztJQUVBLElBQUEsYUFBQTtNQUNBLFdBQUE7TUFDQSxlQUFBO01BQ0EsWUFBQTs7O0lBR0EsSUFBQSxRQUFBO01BQ0EsTUFBQSxXQUFBO1FBQ0EsT0FBQTs7O01BR0EsTUFBQSxTQUFBLFVBQUE7UUFDQSxVQUFBLElBQUE7UUFDQSxVQUFBLE9BQUEsWUFBQTs7O01BR0EsU0FBQSxXQUFBO1FBQ0EsSUFBQSxTQUFBLEtBQUE7UUFDQSxJQUFBLFVBQUE7O1FBRUEsSUFBQSxRQUFBO1VBQ0EsUUFBQSxnQkFBQSxPQUFBLGFBQUEsTUFBQSxPQUFBOzs7UUFHQSxPQUFBOzs7TUFHQSxPQUFBLFNBQUEsUUFBQTtRQUNBLElBQUEsUUFBQTtVQUNBLG9CQUFBLElBQUEsaUJBQUE7O1VBRUEsT0FBQTs7O1FBR0EsT0FBQSxvQkFBQSxJQUFBOzs7O0lBSUEsT0FBQTs7OztBQzFDQTtHQUNBLE9BQUEsaUJBQUE7R0FDQSxRQUFBLG1DQUFBLFNBQUEsWUFBQSxNQUFBO0lBQ0EsSUFBQSxLQUFBO0lBQ0EsSUFBQSxPQUFBLFdBQUE7O0lBRUEsSUFBQSxXQUFBOzs7Ozs7O01BT0EsT0FBQSxTQUFBLEtBQUE7UUFDQSxJQUFBLENBQUEsSUFBQSxlQUFBLENBQUEsSUFBQSxLQUFBO1VBQ0EsTUFBQSxJQUFBLE1BQUE7OztRQUdBLElBQUEsUUFBQSxJQUFBLFlBQUE7UUFDQSxJQUFBO1FBQ0EsSUFBQSxrQkFBQTs7O1FBR0EsSUFBQSxVQUFBLEdBQUE7VUFDQTs7O1FBR0EsSUFBQSxhQUFBO1VBQ0EsV0FBQTtVQUNBLE1BQUE7VUFDQSxLQUFBO1VBQ0EsT0FBQTs7O1FBR0EsTUFBQSxRQUFBLE9BQUEsSUFBQSxZQUFBOztRQUVBLElBQUEsV0FBQSxTQUFBLFlBQUE7O1VBRUEsV0FBQSxXQUFBOztVQUVBLElBQUEsSUFBQSxNQUFBLFVBQUE7O1VBRUE7O1VBRUEsSUFBQSxXQUFBO1lBQ0EsUUFBQTtZQUNBLE9BQUE7WUFDQSxTQUFBLFNBQUEsa0JBQUEsUUFBQTs7O1VBR0EsSUFBQSxVQUFBLFFBQUEsR0FBQTtZQUNBLElBQUEsR0FBQSxpQkFBQTtjQUNBLEdBQUEsa0JBQUE7Y0FDQSxPQUFBLEdBQUE7OztZQUdBLElBQUE7Ozs7UUFJQSxJQUFBLGNBQUEsUUFBQSxLQUFBLElBQUEsYUFBQTs7O1FBR0EsSUFBQSxVQUFBLEdBQUE7VUFDQSxRQUFBO1VBQ0EsU0FBQSxJQUFBO1lBQ0EsWUFBQSxJQUFBLFlBQUE7WUFDQSxTQUFBO1lBQ0EsS0FBQSxJQUFBO1lBQ0EsT0FBQSxJQUFBOzs7VUFHQTs7OztRQUlBLElBQUEsUUFBQSxJQUFBLFdBQUE7VUFDQSxRQUFBLFFBQUE7VUFDQSxLQUFBLElBQUEsSUFBQSxHQUFBLElBQUEsT0FBQSxLQUFBO1lBQ0EsU0FBQSxJQUFBO2NBQ0EsWUFBQSxJQUFBLFlBQUE7Y0FDQSxTQUFBO2NBQ0EsS0FBQSxJQUFBO2NBQ0EsT0FBQSxJQUFBOzs7O1VBSUE7Ozs7UUFJQSxRQUFBLElBQUEsWUFBQTtRQUNBLEdBQUEsa0JBQUEsSUFBQTs7OztRQUlBLEdBQUEsaUJBQUEsbUJBQUEsU0FBQSxnQkFBQTs7VUFFQSxJQUFBLENBQUEsZ0JBQUE7WUFDQTs7O1VBR0EsU0FBQSxJQUFBO1lBQ0EsWUFBQSxJQUFBLFlBQUEsRUFBQTtZQUNBLFNBQUE7WUFDQSxLQUFBLElBQUE7WUFDQSxPQUFBLElBQUE7Ozs7UUFJQSxLQUFBLElBQUEsSUFBQSxHQUFBLElBQUEsSUFBQSxXQUFBLEtBQUE7VUFDQSxTQUFBLElBQUE7WUFDQSxZQUFBLElBQUEsWUFBQTtZQUNBLFNBQUE7WUFDQSxLQUFBLElBQUE7WUFDQSxPQUFBLElBQUE7Ozs7UUFJQTs7OztNQUlBLEtBQUEsU0FBQSxLQUFBO1FBQ0EsSUFBQSxDQUFBLElBQUEsY0FBQSxDQUFBLElBQUEsS0FBQTtVQUNBLE1BQUEsSUFBQSxNQUFBOzs7UUFHQSxLQUFBLE1BQUEsaUJBQUEsS0FBQSxVQUFBLElBQUE7O1FBRUEsSUFBQSxhQUFBO1VBQ0EsU0FBQTtVQUNBLE9BQUE7VUFDQSxTQUFBO1VBQ0EsVUFBQSxJQUFBLFdBQUEsSUFBQSxPQUFBLElBQUEsV0FBQSxJQUFBLFlBQUEsT0FBQTs7UUFFQSxJQUFBLG9CQUFBLElBQUE7UUFDQSxNQUFBLFFBQUEsT0FBQSxJQUFBLFlBQUE7UUFDQSxJQUFBLGFBQUEsU0FBQSxlQUFBO1VBQ0EsSUFBQSxjQUFBLGtCQUFBOztZQUVBLElBQUEsU0FBQSxjQUFBOztZQUVBLElBQUEsUUFBQSxjQUFBOztZQUVBLElBQUEsVUFBQSxTQUFBLENBQUEsU0FBQSxTQUFBOztZQUVBLGtCQUFBO2NBQ0EsUUFBQTtjQUNBLE9BQUE7Y0FDQSxTQUFBOzs7OztRQUtBLElBQUEsU0FBQSxJQUFBO1FBQ0EsT0FBQSxVQUFBLElBQUE7UUFDQSxPQUFBLFdBQUEsSUFBQTs7UUFFQSxJQUFBLEtBQUEsSUFBQTtRQUNBLEdBQUEsYUFBQSxJQUFBO1FBQ0EsR0FBQTtVQUNBLElBQUEsV0FBQTtVQUNBLFVBQUEsSUFBQTtVQUNBLElBQUEsUUFBQSxLQUFBLFVBQUEsSUFBQTtVQUNBLElBQUEsTUFBQSxLQUFBLFVBQUEsSUFBQTtVQUNBOzs7OztJQUtBLE9BQUE7Ozs7QUM1S0E7R0FDQSxPQUFBLFdBQUE7R0FDQSxRQUFBLGVBQUEsVUFBQSxNQUFBO0lBQ0EsT0FBQTtNQUNBLFNBQUEsU0FBQSxJQUFBLFFBQUE7UUFDQSxJQUFBLE1BQUE7O1FBRUEsSUFBQSxRQUFBLFNBQUEsU0FBQTtVQUNBLFNBQUEsT0FBQSxNQUFBOzs7UUFHQSxJQUFBLE9BQUEsV0FBQSxLQUFBLE9BQUEsT0FBQSxJQUFBO1VBQ0EsS0FBQSxLQUFBO1VBQ0E7OztRQUdBLElBQUEsQ0FBQSxRQUFBLFFBQUEsU0FBQTtVQUNBLEtBQUEsTUFBQTtVQUNBOzs7UUFHQSxPQUFBLElBQUEsU0FBQSxPQUFBO1VBQ0EsT0FBQSxJQUFBLFNBQUEsR0FBQTs7O1FBR0EsT0FBQTs7OztBQzFCQTtBQUNBLFFBQUEsT0FBQSxZQUFBLElBQUEsQ0FBQSxZQUFBLFNBQUEsVUFBQTtFQUNBLElBQUEsa0JBQUE7SUFDQSxNQUFBO0lBQ0EsS0FBQTtJQUNBLEtBQUE7SUFDQSxLQUFBO0lBQ0EsTUFBQTtJQUNBLE9BQUE7O0VBRUEsU0FBQSxNQUFBLFdBQUE7SUFDQSxvQkFBQTtNQUNBLFNBQUE7UUFDQTtRQUNBOztNQUVBLE9BQUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7TUFFQSxTQUFBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBOztNQUVBLFlBQUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7TUFFQSxjQUFBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBOztNQUVBLFlBQUE7TUFDQSxZQUFBO01BQ0EsVUFBQTtNQUNBLGNBQUE7TUFDQSxjQUFBO01BQ0EsU0FBQTtNQUNBLGFBQUE7TUFDQSxhQUFBOztJQUVBLGtCQUFBO01BQ0EsZ0JBQUE7TUFDQSxlQUFBO01BQ0EsYUFBQTtNQUNBLFlBQUEsQ0FBQTtRQUNBLFNBQUE7UUFDQSxVQUFBO1FBQ0EsV0FBQTtRQUNBLFdBQUE7UUFDQSxXQUFBO1FBQ0EsVUFBQTtRQUNBLFVBQUE7UUFDQSxVQUFBO1FBQ0EsVUFBQTtRQUNBLFVBQUE7U0FDQTtRQUNBLFNBQUE7UUFDQSxVQUFBO1FBQ0EsV0FBQTtRQUNBLFdBQUE7UUFDQSxXQUFBO1FBQ0EsVUFBQTtRQUNBLFVBQUE7UUFDQSxVQUFBO1FBQ0EsVUFBQTtRQUNBLFVBQUE7OztJQUdBLE1BQUE7SUFDQSxhQUFBLFNBQUEsR0FBQTtNQUNBLE9BQUEsZ0JBQUE7Ozs7O0FDckdBO0dBQ0EsT0FBQSxxQkFBQSxDQUFBOztDQUVBLFFBQUEscURBQUEsU0FBQSxPQUFBLGdCQUFBLFFBQUE7RUFDQSxPQUFBO09BQ0E7T0FDQTtPQUNBLEtBQUEsU0FBQSxLQUFBO1FBQ0EsSUFBQSxhQUFBLGlFQUFBLE1BQUE7O1FBRUEsV0FBQSxRQUFBLFNBQUEsS0FBQTtVQUNBLElBQUEsS0FBQSxRQUFBO1lBQ0EsTUFBQTtZQUNBLE9BQUE7Ozs7UUFJQSxJQUFBLFVBQUEsQ0FBQTtVQUNBLE1BQUE7VUFDQSxPQUFBO1dBQ0E7VUFDQSxNQUFBO1VBQ0EsT0FBQTtXQUNBO1VBQ0EsTUFBQTtVQUNBLE9BQUE7V0FDQTtVQUNBLE1BQUE7VUFDQSxPQUFBO1dBQ0E7VUFD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T0FBQSxTQUFBLGlCQUFBO1FBQ0EsUUFBQSxPQUFBLFFBQUE7VUFDQSxTQUFBLEdBQUE7VUFDQSxjQUFBLEdBQUE7O1VBRUEsa0JBQUEsR0FBQTs7OztNQUlBLFVBQUEsT0FBQTs7TUFFQTtTQUNBLE1BQUE7U0FDQTtTQUNBLEtBQUEsU0FBQSxJQUFBO1VBQ0EsR0FBQSxNQUFBLFFBQUEsU0FBQSxNQUFBO1lBQ0EsS0FBQSxjQUFBLFlBQUEsS0FBQSxnQkFBQSxLQUFBO1lBQ0EsS0FBQSxxQkFBQSxZQUFBLEtBQUEsaUJBQUEsS0FBQTs7O1VBR0EsR0FBQSxRQUFBLEdBQUE7VUFDQSxHQUFBLGNBQUEsR0FBQTs7VUFFQSxJQUFBLE1BQUEsR0FBQSxjQUFBLEdBQUE7VUFDQSxHQUFBLGFBQUEsR0FBQSxjQUFBLEdBQUEsU0FBQSxJQUFBLE9BQUEsS0FBQSxNQUFBLE9BQUE7O1NBRUEsTUFBQSxTQUFBLEtBQUE7VUFDQSxPQUFBLE1BQUEsSUFBQSxLQUFBLE9BQUE7Ozs7SUFJQSxTQUFBLFdBQUEsTUFBQSxPQUFBO01BQ0EsR0FBQSxPQUFBLE1BQUEsU0FBQSxNQUFBO1FBQ0EsSUFBQSxDQUFBLE1BQUE7VUFDQTs7O1FBR0EsR0FBQSxTQUFBLEtBQUE7Ozs7O0lBS0EsU0FBQSxjQUFBLE1BQUE7TUFDQSxJQUFBLFFBQUEsYUFBQTtRQUNBO1dBQ0EsT0FBQTtZQUNBLElBQUEsS0FBQTs7V0FFQTtXQUNBLEtBQUEsU0FBQSxLQUFBO1lBQ0EsT0FBQSxRQUFBLElBQUEsT0FBQTs7WUFFQTs7V0FFQSxNQUFBLFNBQUEsS0FBQTtZQUNBLE9BQUEsTUFBQSxJQUFBLE9BQUE7Ozs7OztJQU1BLFNBQUEsYUFBQSxNQUFBO01BQ0EsSUFBQSxtQkFBQSxPQUFBLEtBQUE7UUFDQSxhQUFBO1FBQ0EsWUFBQTtRQUNBLFVBQUE7UUFDQSxTQUFBO1VBQ0EsYUFBQSxXQUFBO1lBQ0EsT0FBQTs7Ozs7TUFLQSxpQkFBQSxPQUFBLEtBQUEsV0FBQTs7O1FBR0E7Ozs7O0lBS0EsU0FBQSxhQUFBO01BQ0EsVUFBQSxJQUFBOzs7O0lBSUEsU0FBQSxZQUFBLE1BQUE7TUFDQSxHQUFBLE9BQUE7TUFDQSxHQUFBLE9BQUE7O01BRUE7Ozs7SUFJQSxTQUFBLFlBQUEsTUFBQTtNQUNBLEdBQUEsT0FBQTs7TUFFQTs7OztJQUlBLFNBQUEsU0FBQTtNQUNBLEdBQUEsT0FBQTs7TUFFQTs7Ozs7R0FLQSxXQUFBLDRPQUFBLFNBQUEsUUFBQSxNQUFBLFdBQUEsUUFBQSxnQkFBQTtJQUNBLE9BQUEsVUFBQSxRQUFBLHFCQUFBLG9CQUFBLGFBQUE7SUFDQSxjQUFBLFdBQUE7SUFDQSxJQUFBLEtBQUE7SUFDQSxJQUFBLFFBQUEsS0FBQSxNQUFBLGVBQUEsSUFBQTs7SUFFQSxJQUFBLFNBQUEsTUFBQSxRQUFBO01BQ0EsR0FBQSxnQkFBQSxNQUFBLEdBQUE7OztJQUdBLEdBQUEsZUFBQTtJQUNBLEdBQUEsVUFBQTtJQUNBLEdBQUEsV0FBQTtJQUNBLEdBQUEsZ0JBQUE7SUFDQSxHQUFBLGNBQUE7SUFDQSxHQUFBLFVBQUE7O0lBRUE7O0lBRUEsU0FBQSxRQUFBO01BQ0EsT0FBQTtTQUNBO1NBQ0E7U0FDQSxLQUFBLFNBQUEsS0FBQTtVQUNBLElBQUEsUUFBQSxTQUFBLE9BQUE7WUFDQSxNQUFBLHFCQUFBLFlBQUEsS0FBQSxpQkFBQSxNQUFBOztZQUVBLE1BQUEsS0FBQSxRQUFBLFNBQUEsS0FBQTtjQUNBLElBQUEsb0JBQUEsT0FBQSxPQUFBLE1BQUEsSUFBQSxJQUFBO2NBQ0EsSUFBQSxnQkFBQSxvQkFBQSxJQUFBOzs7O1VBSUEsR0FBQSxRQUFBOztTQUVBLE1BQUEsU0FBQSxLQUFBO1VBQ0EsT0FBQSxNQUFBLElBQUEsT0FBQTs7Ozs7SUFLQSxTQUFBLFNBQUEsSUFBQSxLQUFBO01BQ0EsSUFBQSxlQUFBLE9BQUEsS0FBQTtRQUNBLGFBQUE7UUFDQSxZQUFBO1FBQ0EsVUFBQTtRQUNBLFNBQUE7VUFDQSxhQUFBLFdBQUE7WUFDQSxPQUFBOztVQUVBLGFBQUEsV0FBQTtZQUNBLE9BQUE7Y0FDQSxJQUFBO2NBQ0EsS0FBQTs7Ozs7O01BTUEsYUFBQSxPQUFBLEtBQUEsV0FBQTtRQUNBOzs7OztJQUtBLFNBQUEsUUFBQSxVQUFBLEtBQUE7TUFDQSxJQUFBLFFBQUEsV0FBQSxDQUFBLElBQUEsT0FBQSxJQUFBLFFBQUEsSUFBQSxPQUFBLEtBQUEsT0FBQSxNQUFBO1FBQ0EsT0FBQTtXQUNBLE9BQUE7WUFDQSxVQUFBO1lBQ0EsUUFBQSxJQUFBOztXQUVBO1dBQ0EsS0FBQSxTQUFBLEtBQUE7WUFDQSxPQUFBLE1BQUEsVUFBQSxJQUFBOztZQUVBLE9BQUEsUUFBQSxJQUFBLE9BQUE7O1lBRUE7O1dBRUEsTUFBQSxTQUFBLEtBQUE7WUFDQSxPQUFBLE1BQUEsSUFBQSxPQUFBOzs7Ozs7SUFNQSxTQUFBLFlBQUEsVUFBQSxLQUFBO01BQ0EsT0FBQSxNQUFBLFVBQUEsSUFBQTtNQUNBLE9BQUEsUUFBQTs7OztJQUlBLFNBQUEsYUFBQSxNQUFBO01BQ0EsSUFBQSxtQkFBQSxPQUFBLEtBQUE7UUFDQSxhQUFBO1FBQ0EsWUFBQTtRQUNBLFVBQUE7UUFDQSxTQUFBO1VBQ0EsYUFBQSxXQUFBO1lBQ0EsT0FBQTs7Ozs7TUFLQSxpQkFBQSxPQUFBLEtBQUEsV0FBQTs7UUFFQSxLQUFBLEtBQUEsUUFBQSxTQUFBLEtBQUE7VUFDQSxPQUFBLE1BQUEsS0FBQSxJQUFBLElBQUE7OztRQUdBOzs7OztJQUtBLFNBQUEsUUFBQSxVQUFBLFFBQUE7TUFDQSxPQUFBO1NBQ0EsT0FBQTtVQUNBLFVBQUE7O1NBRUE7U0FDQSxLQUFBLFNBQUEsS0FBQTtVQUNBLE9BQUEsUUFBQSxJQUFBLE9BQUE7O1VBRUEsVUFBQSxJQUFBLGNBQUEsV0FBQSxVQUFBLFNBQUEsYUFBQSxHQUFBOztTQUVBLE1BQUEsU0FBQSxLQUFBO1VBQ0EsT0FBQSxNQUFBLElBQUEsT0FBQTs7Ozs7SUFLQSxTQUFBLGNBQUEsT0FBQSxLQUFBO01BQ0EsSUFBQSxXQUFBLE1BQUE7TUFDQSxJQUFBLFNBQUEsSUFBQTs7TUFFQSxJQUFBLGFBQUEsT0FBQSxPQUFBLFVBQUE7TUFDQSxJQUFBLG9CQUFBLE9BQUEsT0FBQTtNQUNBLElBQUEsY0FBQSxvQkFBQSxJQUFBOztNQUVBLEtBQUEsS0FBQSxhQUFBO01BQ0EsS0FBQSxLQUFBLGFBQUEsS0FBQSxVQUFBOztNQUVBLElBQUEsQ0FBQSxhQUFBO1FBQ0EsS0FBQSxLQUFBO1FBQ0E7OztNQUdBLElBQUEsY0FBQSxnQkFBQTtNQUNBLElBQUEsY0FBQSxZQUFBOztNQUVBLElBQUEsY0FBQTs7TUFFQSxPQUFBLEtBQUEsYUFBQSxRQUFBLFNBQUEsS0FBQTtRQUNBLFFBQUEsT0FBQSxhQUFBLFlBQUE7OztNQUdBLEtBQUEsS0FBQSxjQUFBLEtBQUEsVUFBQTs7TUFFQSxJQUFBLGVBQUE7TUFDQSxPQUFBLEtBQUEsYUFBQSxRQUFBLFNBQUEsS0FBQTtRQUNBLElBQUEsWUFBQSxLQUFBLE9BQUE7VUFDQSxhQUFBLE9BQUEsUUFBQSxPQUFBO1lBQ0EsS0FBQSxZQUFBLEtBQUE7YUFDQSxZQUFBOzs7O01BSUEsSUFBQSxTQUFBLEVBQUEsT0FBQTs7O01BR0EsSUFBQSxDQUFBLE9BQUEsUUFBQTtRQUNBOztRQUVBOzs7TUFHQSxLQUFBLEtBQUEsYUFBQSxLQUFBLFVBQUE7TUFDQSxLQUFBLEtBQUE7TUFDQSxTQUFBLE1BQUE7UUFDQSxLQUFBO1FBQ0EsYUFBQTtRQUNBLE1BQUE7UUFDQSxLQUFBO1FBQ0EsWUFBQTtRQUNBLE9BQUE7OztNQUdBLFNBQUEsV0FBQSxVQUFBOztRQUVBLEtBQUEsS0FBQSxXQUFBLFNBQUE7UUFDQSxJQUFBLGNBQUEsZ0JBQUEsU0FBQSxTQUFBLFVBQUE7UUFDQSxHQUFBOzs7TUFHQSxTQUFBLFdBQUEsT0FBQSxNQUFBOztRQUVBLE1BQUEsVUFBQSxLQUFBO1FBQ0EsS0FBQSxLQUFBLGFBQUEsS0FBQSxVQUFBOzs7TUFHQSxTQUFBLGFBQUEsT0FBQTtRQUNBLEtBQUEsS0FBQSxhQUFBLEtBQUEsVUFBQTs7O01BR0EsU0FBQSxjQUFBOzs7O1FBSUEsS0FBQSxLQUFBOzs7UUFHQSxPQUFBLFFBQUEsU0FBQSxPQUFBO1VBQ0EsWUFBQSxNQUFBLE1BQUE7OztRQUdBLEtBQUEsS0FBQTs7O1FBR0Esb0JBQUEsSUFBQSxtQkFBQTs7O1FBR0E7Ozs7Ozs7TUFPQSxTQUFBLGdCQUFBO1FBQ0EsS0FBQSxLQUFBOztRQUVBLE9BQUE7V0FDQSxLQUFBO1lBQ0EsVUFBQTtZQUNBLFFBQUE7YUFDQTtXQUNBO1dBQ0EsS0FBQSxXQUFBO1lBQ0EsS0FBQSxLQUFBOzs7WUFHQSxJQUFBLE9BQUEsUUFBQTtjQUNBLE9BQUEsUUFBQSxTQUFBLE9BQUE7Z0JBQ0EsTUFBQSxPQUFBLE1BQUE7Ozs7O1lBS0EsT0FBQSxNQUFBLFVBQUE7OztZQUdBLElBQUEsY0FBQSxnQkFBQTtZQUNBLElBQUEsY0FBQSxXQUFBOzs7O1dBSUEsTUFBQSxTQUFBLEtBQUE7WUFDQSxLQUFBLEtBQUEsZUFBQSxLQUFBLFVBQUE7WUFDQSxPQUFBLE1BQUEsSUFBQSxPQUFBOztZQUVBLElBQUEsY0FBQSxZQUFBOzs7Ozs7O0dBT0EsV0FBQSxtR0FBQSxTQUFBLFFBQUEsZ0JBQUEsUUFBQSx3QkFBQSxhQUFBO0lBQ0EsSUFBQSxLQUFBOztJQUVBLFFBQUEsT0FBQSxJQUFBOztJQUVBLEdBQUEsZUFBQTtJQUNBLEdBQUEsU0FBQTs7SUFFQSxTQUFBLGVBQUE7TUFDQSxHQUFBLHNCQUFBOztNQUVBO1NBQ0EsT0FBQTtVQUNBLElBQUEsWUFBQTtXQUNBO1VBQ0EsTUFBQSxHQUFBOztTQUVBO1NBQ0EsS0FBQSxTQUFBLEtBQUE7VUFDQSxPQUFBLFFBQUEsSUFBQSxPQUFBOztVQUVBLGVBQUE7O1NBRUEsTUFBQSxTQUFBLEtBQUE7VUFDQSxHQUFBLHNCQUFBOztVQUVBLE9BQUEsTUFBQSxJQUFBLE9BQUE7Ozs7SUFJQSxTQUFBLFNBQUE7TUFDQSxlQUFBOzs7OztHQUtBLFdBQUEsMkhBQUEsU0FBQSxRQUFBLGdCQUFBLFFBQUE7SUFDQSxjQUFBLGFBQUEsYUFBQTtJQUNBLElBQUEsS0FBQTs7SUFFQSxHQUFBLGFBQUEsWUFBQSxLQUFBO0lBQ0EsR0FBQSxjQUFBLFlBQUEsS0FBQTtJQUNBLEdBQUEsYUFBQSxZQUFBLEtBQUE7O0lBRUEsSUFBQSxZQUFBLEtBQUE7TUFDQSxHQUFBLFFBQUE7O01BRUEsWUFBQSxTQUFBLFlBQUEsSUFBQTtNQUNBLFlBQUEsVUFBQSxZQUFBLElBQUE7TUFDQSxZQUFBLFNBQUEsWUFBQSxJQUFBO1dBQ0E7TUFDQSxHQUFBLFFBQUE7OztJQUdBLEdBQUEsU0FBQTtJQUNBLEdBQUEsU0FBQTs7SUFFQSxTQUFBLFNBQUE7TUFDQSxJQUFBLFlBQUEsS0FBQTtRQUNBO1dBQ0EsT0FBQTtZQUNBLFVBQUEsWUFBQTtZQUNBLFFBQUEsWUFBQSxJQUFBO2FBQ0E7WUFDQSxPQUFBLEdBQUEsTUFBQTtZQUNBLFFBQUEsR0FBQSxNQUFBO1lBQ0EsT0FBQSxHQUFBLE1BQUE7O1dBRUE7V0FDQSxLQUFBLFNBQUEsS0FBQTtZQUNBLE9BQUEsUUFBQSxJQUFBLE9BQUE7O1lBRUEsZUFBQTs7V0FFQSxNQUFBLFNBQUEsS0FBQTtZQUNBLE9BQUEsTUFBQSxJQUFBLE9BQUE7O2FBRUE7UUFDQTtXQUNBLEtBQUE7WUFDQSxVQUFBLFlBQUE7YUFDQTtZQUNBLE9BQUEsR0FBQSxNQUFBO1lBQ0EsUUFBQSxHQUFBLE1BQUE7WUFDQSxPQUFBLEdBQUEsTUFBQTs7V0FFQTtXQUNBLEtBQUEsU0FBQSxLQUFBO1lBQ0EsT0FBQSxRQUFBLElBQUEsT0FBQTs7WUFFQSxlQUFBOztXQUVBLE1BQUEsU0FBQSxLQUFBO1lBQ0EsT0FBQSxNQUFBLElBQUEsT0FBQTs7Ozs7SUFLQSxTQUFBLFlBQUEsV0FBQSxPQUFBO01BQ0EsR0FBQSxhQUFBLFlBQUEsVUFBQSxXQUFBOzs7SUFHQSxTQUFBLFNBQUE7TUFDQSxlQUFBOzs7OztBQzVoQkE7R0FDQSxPQUFBOztHQUVBLFdBQUEsc0ZBQUEsVUFBQSxRQUFBLElBQUEsV0FBQSxVQUFBLFFBQUEsVUFBQSxPQUFBO0lBQ0EsSUFBQSxLQUFBOztJQUVBLEdBQUEsUUFBQTs7SUFFQSxTQUFBLFFBQUE7TUFDQSxPQUFBO1NBQ0EsS0FBQSxRQUFBLE9BQUEsTUFBQSxRQUFBO1VBQ0Es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QUFBLEtBQUEsS0FBQSxNQUFBLEdBQUEsS0FBQSxLQUFBLE9BQUEsRUFBQSxPQUFBOzs7Ozs7SUFNQSxHQUFBLGFBQUE7O0lBRUEsSUFBQSxpQkFBQSxvQkFBQSxJQUFBOztJQUVBLEdBQUEsY0FBQSxFQUFBLElBQUEsZ0JBQUEsU0FBQSxNQUFBLEtBQUE7TUFDQSxPQUFBO1FBQ0EsSUFBQTtRQUNBLE1BQUEsY0FBQTtRQUNBLFFBQUE7Ozs7SUFJQSxFQUFBLGdCQUFBLFNBQUEsVUFBQSxRQUFBLFNBQUEsTUFBQTtNQUNBLEdBQUEsV0FBQSxLQUFBLE1BQUE7OztJQUdBLFNBQUEsY0FBQSxTQUFBO01BQ0EsT0FBQSxVQUFBLEtBQUEsU0FBQSxNQUFBO1FBQ0EsT0FBQSxLQUFBLE1BQUE7U0FDQTs7OztJQUlBLEdBQUEsYUFBQTs7OztJQUlBLFNBQUEsV0FBQSxVQUFBLE1BQUEsTUFBQTtNQUNBLFVBQUEsT0FBQSxXQUFBLG9CQUFBLGtCQUFBO1FBQ0EsVUFBQTtRQUNBLGtCQUFBLE9BQUEsZ0JBQUE7UUFDQSxhQUFBLE9BQUEsa0JBQUE7UUFDQSxZQUFBO1FBQ0EsY0FBQSxPQUFBLGFBQUE7OztRQUdBLGtCQUFBOzs7TUFHQSxTQUFBLG1CQUFBLFFBQUE7O1FBRUEsSUFBQSxhQUFBLFFBQUE7VUFDQSxHQUFBLEtBQUEsS0FBQSxJQUFBLFFBQUE7Ozs7VUFJQSxVQUFBLGdCQUFBLEdBQUE7ZUFDQSxJQUFBLGFBQUEsU0FBQTs7VUFFQSxHQUFBLFdBQUEsS0FBQSxJQUFBLFFBQUE7OztVQUdBLElBQUEsY0FBQSxlQUFBLEtBQUEsSUFBQSxLQUFBLFNBQUEsT0FBQTtZQUNBLE9BQUEsTUFBQSxPQUFBLEtBQUE7Ozs7VUFJQSxZQUFBLFFBQUE7VUFDQSxvQkFBQSxJQUFBLGdCQUFBOzs7VUFHQSxVQUFBLEtBQUEsSUFBQSxZQUFBLElBQUEsUUFBQTs7O1FBR0Esb0JBQUEsSUFBQSxZQUFBOztRQUVBLEdBQUE7OztNQUdBLFNBQUEsbUJBQUE7UUFDQSxLQUFBLE1BQUEsZ0JBQUEsS0FBQSxPQUFBLFdBQUEsS0FBQTs7OztJQUlBLEdBQUEsYUFBQTtJQUNBLFNBQUEsV0FBQSxVQUFBLE9BQUE7TUFDQSxJQUFBLFFBQUEsR0FBQSxhQUFBLFNBQUEsU0FBQSxjQUFBLE1BQUEsSUFBQTs7TUFFQSxJQUFBLENBQUEsT0FBQTtRQUNBOzs7TUFHQSxnQkFBQSxhQUFBOzs7O0dBSUEsV0FBQSxrSEFBQSxTQUFBLFFBQUEsTUFBQSxjQUFBLGdCQUFBLFFBQUEscUJBQUEsUUFBQTtJQUNBLElBQUEsS0FBQTs7SUFFQSxJQUFBLGVBQUEsU0FBQSxhQUFBO0lBQ0EsSUFBQSxXQUFBLGFBQUE7SUFDQSxJQUFBLFNBQUEsYUFBQTs7O0lBR0EsSUFBQSxhQUFBLE9BQUEsT0FBQSxVQUFBO0lBQ0EsSUFBQSxpQkFBQSxPQUFBLElBQUE7SUFDQSxJQUFBLFlBQUEsb0JBQUEsSUFBQTs7O0lBR0EsSUFBQTtJQUNBO09BQ0EsTUFBQSxlQUFBLElBQUE7T0FDQSxLQUFBLFNBQUEsTUFBQTtRQUNBLE9BQUEsS0FBQSxPQUFBOztJQUVBLEdBQUEsUUFBQSxlQUFBLFlBQUE7OztJQUdBLElBQUEsR0FBQSxTQUFBLEdBQUEsTUFBQSxRQUFBO01BQ0EsR0FBQSxNQUFBLEdBQUEsVUFBQTs7O0lBR0EsR0FBQSxPQUFBOzs7SUFHQSxRQUFBLE9BQUEsR0FBQSxNQUFBLGFBQUEsVUFBQSxpQkFBQTs7SUFFQSxHQUFBLE1BQUEsUUFBQSxTQUFBLE1BQUE7TUFDQSxJQUFBLEtBQUEsNkJBQUEsS0FBQSwwQkFBQSxRQUFBO1FBQ0EsS0FBQSwwQkFBQSxRQUFBLFNBQUEsTUFBQTtVQUNBLEdBQUEsS0FBQSxLQUFBLE1BQUEsR0FBQSxLQUFBLEtBQUEsT0FBQTs7VUFFQSxJQUFBLEdBQUEsS0FBQSxLQUFBLElBQUEsVUFBQSxNQUFBO1lBQ0EsR0FBQSxLQUFBLEtBQUEsSUFBQSxTQUFBOzs7Ozs7O0lBT0EsR0FBQSxPQUFBLFFBQUEsU0FBQSxHQUFBO01BQ0EsS0FBQSxJQUFBLGVBQUEsS0FBQSxVQUFBOztNQUVBOztNQUVBO09BQ0E7Ozs7Ozs7Ozs7Ozs7O0lBY0EsU0FBQSxPQUFBO01BQ0EsSUFBQSxPQUFBLG9CQUFBLElBQUEsZUFBQTtNQUNBLEtBQUEsZ0JBQUEsR0FBQTs7TUFFQSxvQkFBQSxJQUFBLFlBQUE7O01BRUEsS0FBQSxJQUFBLGNBQUEsWUFBQSxLQUFBOzs7SUFHQSxTQUFBLFdBQUE7TUFDQSxJQUFBLE9BQUEsb0JBQUEsSUFBQSxtQkFBQTtNQUNBLElBQUEsWUFBQTs7O01BR0EsRUFBQSxLQUFBLEdBQUEsTUFBQSxTQUFBLE1BQUEsS0FBQTtRQUNBLElBQUEsS0FBQSxPQUFBO1VBQ0EsS0FBQSxLQUFBO1VBQ0EsVUFBQSxLQUFBOzs7OztNQUtBLElBQUEsQ0FBQSxVQUFBLFFBQUE7UUFDQTs7O01BR0EsS0FBQSxnQkFBQTs7TUFFQSxvQkFBQSxJQUFBLGdCQUFBOztNQUVBLEtBQUEsSUFBQSxpQkFBQSxnQkFBQSxLQUFBOzs7SUFHQSxHQUFBLGNBQUE7SUFDQSxHQUFBLGVBQUE7SUFDQSxHQUFBLGFBQUE7SUFDQSxHQUFBLGtCQUFBO0lBQ0EsR0FBQSxrQkFBQTtJQUNBLEdBQUEsYUFBQTs7O0lBR0EsU0FBQSxZQUFBLE9BQUEsTUFBQSxZQUFBOztNQUVBLFdBQUEsV0FBQTs7UUFFQSxJQUFBLFlBQUEsV0FBQSxTQUFBLEdBQUEsS0FBQSxXQUFBLElBQUEsWUFBQSxHQUFBO1VBQ0E7OztRQUdBLFlBQUEsVUFBQTs7UUFFQSxJQUFBLG1CQUFBLE9BQUEsS0FBQTtVQUNBLGFBQUE7VUFDQSxZQUFBO1VBQ0EsVUFBQTtVQUNBLFNBQUE7WUFDQSxhQUFBLFdBQUE7Y0FDQSxPQUFBLFFBQUEsT0FBQTtnQkFDQSxXQUFBLEtBQUE7Z0JBQ0EsWUFBQSxLQUFBO2dCQUNBLE9BQUE7aUJBQ0EsWUFBQSxHQUFBLEtBQUEsV0FBQTs7Ozs7UUFLQSxpQkFBQSxPQUFBLEtBQUEsU0FBQSxNQUFBO1VBQ0EsUUFBQSxPQUFBLEdBQUEsS0FBQSxXQUFBLEtBQUEsTUFBQTtZQUNBLE1BQUEsV0FBQTs7O1VBR0EsWUFBQSxVQUFBO1dBQ0EsV0FBQTtVQUNBLFlBQUEsVUFBQTs7Ozs7SUFLQSxZQUFBLFVBQUE7O0lBRUEsU0FBQSxhQUFBLE1BQUE7O01BRUEsSUFBQSxJQUFBLFNBQUEsR0FBQSxLQUFBLEtBQUEsSUFBQTtNQUNBLElBQUEsTUFBQSxLQUFBLE1BQUEsR0FBQTtRQUNBLFFBQUEsT0FBQSxHQUFBLEtBQUEsS0FBQSxLQUFBO1VBQ0EsT0FBQTtVQUNBLFFBQUE7VUFDQSxNQUFBO1VBQ0EsT0FBQTs7Ozs7OztJQU9BLFNBQUEsV0FBQSxPQUFBO01BQ0EsZ0JBQUEsYUFBQSxHQUFBLEtBQUEsTUFBQSxJQUFBOzs7SUFHQSxTQUFBLFdBQUEsTUFBQSxNQUFBO01BQ0EsVUFBQSxPQUFBLFdBQUEsb0JBQUEsa0JBQUE7UUFDQSxVQUFBO1FBQ0Esa0JBQUEsT0FBQSxnQkFBQTtRQUNBLGFBQUEsT0FBQSxrQkFBQTtRQUNBLFlBQUE7UUFDQSxjQUFBLE9BQUEsYUFBQTs7O1FBR0Esa0JBQUE7OztNQUdBLFNBQUEsbUJBQUEsUUFBQTtRQUNBLEdBQUEsS0FBQSxLQUFBLE1BQUEsUUFBQSxPQUFBLEdBQUEsS0FBQSxLQUFBLE9BQUEsSUFBQTtVQUNBLE9BQUE7VUFDQSxNQUFBLEtBQUE7OztRQUdBLEdBQUE7OztNQUdBLFNBQUEsbUJBQUE7UUFDQSxLQUFBLE1BQUEsZ0JBQUEsS0FBQSxPQUFBLFdBQUEsS0FBQTs7Ozs7SUFLQSxHQUFBLFlBQUE7TUFDQSxXQUFBOztJQUVBLFNBQUEsZ0JBQUEsUUFBQSxJQUFBO01BQ0EsT0FBQTtNQUNBLE9BQUE7O01BRUEsR0FBQSxVQUFBLE1BQUE7S0FDQTs7SUFFQSxTQUFBLGdCQUFBLE9BQUEsTUFBQSxZQUFBO01BQ0EsV0FBQSxXQUFBO1FBQ0EsSUFBQSxnQkFBQSxXQUFBLFNBQUEsR0FBQSxLQUFBLFdBQUEsSUFBQSxZQUFBLEdBQUE7VUFDQTs7O1FBR0EsZ0JBQUEsVUFBQTs7UUFFQSxJQUFBLG1CQUFBLE9BQUEsS0FBQTtVQUNBLGFBQUE7VUFDQSxZQUFBO1VBQ0EsVUFBQTtVQUNBLFNBQUE7WUFDQSxhQUFBLFdBQUE7Y0FDQSxPQUFBLFFBQUEsT0FBQTtnQkFDQSxXQUFBLEtBQUE7Z0JBQ0EsWUFBQSxLQUFBO2dCQUNBLE9BQUE7aUJBQ0EsWUFBQSxHQUFBLEtBQUEsV0FBQTs7Ozs7UUFLQSxpQkFBQSxPQUFBLEtBQUEsU0FBQSxNQUFBO1VBQ0EsUUFBQSxPQUFBLEdBQUEsS0FBQSxXQUFBLEtBQUEsTUFBQTtZQUNBLE1BQUEsV0FBQTs7O1VBR0EsZ0JBQUEsVUFBQTtXQUNBLFdBQUE7VUFDQSxnQkFBQSxVQUFBOzs7OztJQUtBLGdCQUFBLFVBQUE7OztHQUdBLFdBQUEsMkVBQUEsU0FBQSxRQUFBLE1BQUEsZ0JBQUEsYUFBQTtJQUNBLElBQUEsS0FBQTs7SUFFQSxRQUFBLE9BQUEsSUFBQTs7SUFFQSxHQUFBLFNBQUE7SUFDQSxHQUFBLFNBQUE7SUFDQSxHQUFBLGFBQUE7SUFDQSxHQUFBLGFBQUE7O0lBRUEsU0FBQSxTQUFBO01BQ0EsZUFBQSxNQUFBO1FBQ0EsT0FBQSxHQUFBO1FBQ0EsUUFBQSxHQUFBO1FBQ0EsTUFBQSxHQUFBO1FBQ0EsT0FBQSxHQUFBOzs7O0lBSUEsU0FBQSxTQUFBO01BQ0EsZUFBQTs7O0lBR0EsU0FBQSxXQUFBLE9BQUE7TUFDQSxJQUFBLENBQUEsT0FBQTtRQUNBOzs7TUFHQSxnQkFBQSxhQUFBOzs7SUFHQSxTQUFBLGFBQUE7TUFDQSxVQUFBLE9BQUEsV0FBQSxvQkFBQSxrQkFBQTtRQUNBLFVBQUE7UUFDQSxrQkFBQSxPQUFBLGdCQUFBO1FBQ0EsYUFBQSxPQUFBLGtCQUFBO1FBQ0EsWUFBQTtRQUNBLGNBQUEsT0FBQSxhQUFBOzs7UUFHQSxrQkFBQTs7O01BR0EsU0FBQSxtQkFBQSxRQUFBO1FBQ0EsR0FBQSxRQUFBO1FBQ0EsR0FBQTs7O01BR0EsU0FBQSxtQkFBQTtRQUNBLEtBQUEsTUFBQSxnQkFBQSxZQUFBLFlBQUEsV0FBQSxZQUFBOzs7OztHQUtBLFdBQUEseUVBQUEsU0FBQSxRQUFBLE1BQUEsZ0JBQUEsYUFBQTtNQUNBLElBQUEsS0FBQTs7TUFFQSxRQUFBLE9BQUEsSUFBQTs7TUFFQSxHQUFBLFNBQUE7TUFDQSxHQUFBLFNBQUE7TUFDQSxHQUFBLGFBQUE7TUFDQSxHQUFBLGFBQUE7O01BRUEsU0FBQSxTQUFBO1FBQ0EsZUFBQSxNQUFBO1VBQ0EsT0FBQSxHQUFBOzs7O01BSUEsU0FBQSxTQUFBO1FBQ0EsZUFBQTs7O01BR0EsU0FBQSxXQUFBLE9BQUE7UUFDQSxJQUFBLENBQUEsT0FBQTtVQUNBOzs7UUFHQSxnQkFBQSxhQUFBOzs7TUFHQSxTQUFBLGFBQUE7UUFDQSxVQUFBLE9BQUEsV0FBQSxvQkFBQSxrQkFBQTtVQUNBLFVBQUE7VUFDQSxrQkFBQSxPQUFBLGdCQUFBO1VBQ0EsYUFBQSxPQUFBLGtCQUFBO1VBQ0EsWUFBQTtVQUNBLGNBQUEsT0FBQSxhQUFBOzs7VUFHQSxrQkFBQTs7O1FBR0EsU0FBQSxtQkFBQSxRQUFBO1VBQ0EsR0FBQSxRQUFBO1VBQ0EsR0FBQTs7O1FBR0EsU0FBQSxtQkFBQTtVQUNBLEtBQUEsTUFBQSxnQkFBQSxZQUFBLFlBQUEsV0FBQSxZQUFBOzs7OztHQUtBLFdBQUEsaUZBQUEsU0FBQSxRQUFBLFdBQUEsWUFBQSxhQUFBLFFBQUE7SUFDQSxJQUFBLEtBQUE7SUFDQSxJQUFBLE1BQUEsVUFBQTs7SUFFQSxHQUFBLE9BQUEsU0FBQSxJQUFBLFNBQUE7SUFDQSxHQUFBLE9BQUEsU0FBQSxJQUFBLFNBQUE7SUFDQSxHQUFBLFFBQUEsWUFBQSxLQUFBO0lBQ0EsR0FBQSxZQUFBLFlBQUEsS0FBQSxRQUFBLEdBQUE7O0lBRUEsR0FBQSxjQUFBO0lBQ0EsR0FBQSxjQUFBOztJQUVBOztJQUVBLFNBQUEsUUFBQTtNQUNBLElBQUEsU0FBQTtRQUNBLFlBQUEsR0FBQTtRQUNBLE1BQUEsR0FBQTs7O01BR0EsVUFBQSxPQUFBOztNQUVBO1NBQ0EsTUFBQTtTQUNBO1NBQ0EsS0FBQSxTQUFBLElBQUE7VUFDQSxHQUFBLE1BQUEsUUFBQSxTQUFBLE1BQUE7WUFDQSxLQUFBLGNBQUEsWUFBQSxLQUFBLGdCQUFBLEtBQUE7OztVQUdBLEdBQUEsUUFBQSxHQUFBO1VBQ0EsR0FBQSxjQUFBLEdBQUE7O1VBRUEsSUFBQSxNQUFBLEdBQUEsY0FBQSxHQUFBO1VBQ0EsR0FBQSxhQUFBLEdBQUEsY0FBQSxHQUFBLFNBQUEsSUFBQSxPQUFBLEtBQUEsTUFBQSxPQUFBOztTQUVBLE1BQUEsU0FBQSxLQUFBO1VBQ0EsT0FBQSxNQUFBLElBQUEsT0FBQTs7Ozs7SUFLQSxTQUFBLFlBQUEsTUFBQTtNQUNBLEdBQUEsT0FBQTtNQUNBLEdBQUEsT0FBQTs7TUFFQTs7OztJQUlBLFNBQUEsWUFBQSxNQUFBO01BQ0EsR0FBQSxPQUFBOztNQUVBOzs7Ozs7Ozs7QUMvaUJBO0dBQ0EsT0FBQSxvQkFBQSxDQUFBOztHQUVBLFFBQUEsNEJBQUEsU0FBQSxXQUFBO0lBQ0EsT0FBQSxVQUFBLFlBQUEsU0FBQSxZQUFBLElBQUE7TUFDQSxPQUFBO1FBQ0EsU0FBQTs7Ozs7R0FLQSxRQUFBLDJCQUFBLFNBQUEsV0FBQTtJQUNBLE9BQUEsVUFBQSxZQUFBLFNBQUE7TUFDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyDlupTnlKjlhaXlj6Ncbi8vIE1vZHVsZTogZ3VsdVxuLy8gRGVwZW5kZW5jaWVzOlxuLy8gICAgbmdSb3V0ZSwgaHR0cEludGVyY2VwdG9ycywgZ3VsdS5taXNzaW5nXG5cbi8qIGdsb2JhbCBmYWxsYmFja0hhc2ggKi9cbmFuZ3VsYXJcbiAgLm1vZHVsZSgnZ3VsdScsIFtcbiAgICAndWkucm91dGVyJyxcbiAgICAnbmdMb2NhbGUnLFxuICAgICd0b2FzdHInLFxuICAgICd1aS5ib290c3RyYXAnLFxuICAgICdjdXN0b20uZGlyZWN0aXZlcycsXG4gICAgJ2h0dHBJbnRlcmNlcHRvcnMnLFxuICAgICdMb2NhbFN0b3JhZ2VNb2R1bGUnLFxuICAgICdjaGllZmZhbmN5cGFudHMubG9hZGluZ0JhcicsXG4gICAgJ3V0aWwuZmlsdGVycycsXG4gICAgJ3V0aWwuZGF0ZScsXG4gICAgJ3V0aWwuZmlsZXInLFxuICAgICd1dGlsLnVwbG9hZGVyJyxcbiAgICAndXRpbC5rZXltZ3InLFxuICAgICdndWx1LmluZGVudCcsXG4gICAgJ2d1bHUucmVwb3J0JyxcbiAgICAnZ3VsdS5sb2dpbicsXG4gICAgJ2d1bHUubWlzc2luZydcbiAgXSlcbiAgLmNvbmZpZyhmdW5jdGlvbigkbG9jYXRpb25Qcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyLCAkbG9nUHJvdmlkZXIsIGxvY2FsU3RvcmFnZVNlcnZpY2VQcm92aWRlcikge1xuICAgIC8vIG5vdCB1c2UgaHRtbDUgaGlzdG9yeSBhcGlcbiAgICAvLyBidXQgdXNlIGhhc2hiYW5nXG4gICAgJGxvY2F0aW9uUHJvdmlkZXJcbiAgICAgIC5odG1sNU1vZGUoZmFsc2UpXG4gICAgICAuaGFzaFByZWZpeCgnIScpO1xuXG4gICAgLy8gZGVmaW5lIDQwNFxuICAgICR1cmxSb3V0ZXJQcm92aWRlclxuICAgICAgLm90aGVyd2lzZSgnL2xvZ2luJyk7XG5cbiAgICAvLyBsb2dnZXJcbiAgICAkbG9nUHJvdmlkZXIuZGVidWdFbmFibGVkKHRydWUpO1xuXG4gICAgLy8gbG9jYWxTdG9yYWdlIHByZWZpeFxuICAgIGxvY2FsU3RvcmFnZVNlcnZpY2VQcm92aWRlclxuICAgICAgLnNldFByZWZpeCgnZ3VsdS50ZXN0ZXInKVxuICAgICAgLnNldE5vdGlmeSh0cnVlLCB0cnVlKTtcblxuICAgIC8vIEFQSSBTZXJ2ZXJcbiAgICBBUElfU0VSVkVSUyA9IHtcbiAgICAgIHRlc3RlcjogJ2h0dHA6Ly90LmlmZGl1LmNvbSdcbiAgICAgIC8vIHRlc3RlcjogJ2h0dHA6Ly9ndWx1YWJjLmNvbSdcbiAgICAgIC8vIHRlc3RlcjogJ2h0dHA6Ly9vLmRwOjMwMDAnXG4gICAgfVxuXG4gICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50KS5vbignZGV2aWNlcmVhZHknLCBmdW5jdGlvbigpIHtcbiAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudCkub24oJ2JhY2tidXR0b24nLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSlcbiAgLnJ1bihmdW5jdGlvbigkcm9vdFNjb3BlLCAkbG9jYXRpb24sICRzdGF0ZSwgJHN0YXRlUGFyYW1zKSB7XG4gICAgdmFyIHJlZyA9IC9bXFwmXFw/XV89XFxkKy87XG5cbiAgICAkcm9vdFNjb3BlLiRzdGF0ZSA9ICRzdGF0ZTtcbiAgICAkcm9vdFNjb3BlLiRzdGF0ZVBhcmFtcyA9ICRzdGF0ZVBhcmFtcztcbiAgICAkcm9vdFNjb3BlLmlzQ29sbGFwc2VkID0gdHJ1ZTtcblxuICAgIC8vIOeUqOS6jui/lOWbnuS4iuWxgumhtemdolxuICAgICRyb290U2NvcGVcbiAgICAgIC4kd2F0Y2goZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAkbG9jYXRpb24udXJsKCk7XG4gICAgICB9LCBmdW5jdGlvbihjdXJyZW50LCBvbGQpIHtcbiAgICAgICAgaWYgKGN1cnJlbnQucmVwbGFjZShyZWcsICcnKSA9PT0gb2xkLnJlcGxhY2UocmVnLCAnJykpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAkcm9vdFNjb3BlLmJhY2tVcmwgPSBvbGQ7XG4gICAgICB9KTtcblxuICAgICRyb290U2NvcGUuYmFjayA9IGZ1bmN0aW9uKCkge1xuICAgICAgJGxvY2F0aW9uLnVybCgkcm9vdFNjb3BlLmJhY2tVcmwpO1xuICAgIH1cbiAgfSk7XG5cbiIsImFuZ3VsYXJcbiAgLm1vZHVsZSgnZ3VsdS5pbmRlbnQnLCBbXG4gICAgJ3VpLnJvdXRlcicsXG4gICAgJ3V0aWwudXBsb2FkZXInLFxuICAgICd1dGlsLmZpbGVyJyxcbiAgICAndXRpbC5rZXltZ3InLFxuICAgICdndWx1LmluZGVudC5zdmNzJyxcbiAgICAnZ3VsdS5pbmRlbnQuZW51bXMnXG4gIF0pXG4gIC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlclxuICAgICAgLnN0YXRlKCdpbmRlbnRzJywge1xuICAgICAgICBhYnN0cmFjdDogdHJ1ZSxcbiAgICAgICAgdXJsOiAnL2luZGVudHMnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2luZGVudC9kYXNoYm9hcmQuaHRtJyxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgIEluZGVudEVudW1zOiAnSW5kZW50RW51bXMnXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAuc3RhdGUoJ2luZGVudHMubGlzdCcsIHtcbiAgICAgICAgdXJsOiAnJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdpbmRlbnQvc2VhcmNoLmh0bScsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdJbmRlbnRMaXN0Q3RybCdcbiAgICAgIH0pXG4gICAgICAuc3RhdGUoJ2luZGVudHMudW5jb25maXJtZWQnLCB7XG4gICAgICAgIHVybDogJy91bmNvbmZpcm1lZCcsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnaW5kZW50L2xpc3RfdW5jb25maXJtZWQuaHRtJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0luZGVudExpc3RDdHJsJ1xuICAgICAgfSlcbiAgICAgIC5zdGF0ZSgnaW5kZW50cy51bnRlc3RlZCcsIHtcbiAgICAgICAgdXJsOiAnL3VudGVzdGVkJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdpbmRlbnQvbGlzdF91bnRlc3RlZC5odG0nLFxuICAgICAgICBjb250cm9sbGVyOiAnVW50ZXN0ZWRJbmRlbnRMaXN0Q3RybCdcbiAgICAgIH0pO1xuICB9KTtcbiIsImFuZ3VsYXJcbiAgLm1vZHVsZSgnZ3VsdS5sb2dpbicsIFtcbiAgICAndWkucm91dGVyJyxcbiAgICAndXRpbC5vYXV0aCcsXG4gICAgJ2d1bHUubG9naW4uc3ZjcydcbiAgXSlcblxuICAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXJcbiAgICAgIC5zdGF0ZSgnbG9naW4nLCB7XG4gICAgICAgIHVybDogJy9sb2dpbicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnbG9naW4vbG9naW4uaHRtJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0xvZ2luQ3RybCdcbiAgICAgIH0pO1xuICB9KTtcbiIsImFuZ3VsYXJcbiAgLm1vZHVsZSgnZ3VsdS5yZXBvcnQnLCBbXG4gICAgJ3VpLnJvdXRlcicsXG4gICAgJ3V0aWwudm0nLFxuICAgICd1dGlsLmtleW1ncicsXG4gICAgJ2d1bHUucmVwb3J0LnN2Y3MnLFxuICAgICdndWx1LmluZGVudC5lbnVtcydcbiAgXSlcbiAgLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyXG4gICAgICAuc3RhdGUoJ2luZGVudHMuaW5wdXRfcmVwb3J0Jywge1xuICAgICAgICB1cmw6ICcve2luZGVudF9pZDpbMC05XSt9L2Nhci97Y2FyX2lkOlswLTldK30vcmVwb3J0JyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdyZXBvcnQvaW5wdXRfZGFzaGJvYXJkLmh0bScsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdJbnB1dERhc2hib2FyZEN0cmwnXG4gICAgICB9KVxuICAgICAgLnN0YXRlKCdpbmRlbnRzLmlucHV0X3JlcG9ydC5waG90bycsIHtcbiAgICAgICAgdXJsOiAnL3Bob3RvJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdyZXBvcnQvaW5wdXRfcGhvdG8uaHRtJyxcbiAgICAgICAgY29udHJvbGxlcjogJ1Bob3RvUmVwb3J0RWRpdEN0cmwnXG4gICAgICB9KVxuICAgICAgLnN0YXRlKCdpbmRlbnRzLmlucHV0X3JlcG9ydC5wYXJ0Jywge1xuICAgICAgICB1cmw6ICcve3BhcnRfaWQ6WzAtOWEtekEtWl0rfScsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAncmVwb3J0L2lucHV0Lmh0bScsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdSZXBvcnRFZGl0Q3RybCdcbiAgICAgIH0pXG4gICAgICAuc3RhdGUoJ2luZGVudHMucmVwb3J0cycsIHtcbiAgICAgICAgdXJsOiAnL3JlcG9ydHMnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ3JlcG9ydC9saXN0Lmh0bScsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdSZXBvcnRMaXN0Q3RybCdcbiAgICAgIH0pO1xuICB9KTtcbiIsIi8vIDQwNCDpobXpnaJcbi8vIE1vZHVsZTogZ3VsdS5taXNzaW5nXG4vLyBEZXBlbmRlbmNpZXM6IG5nUm91dGVcblxuYW5ndWxhclxuICAubW9kdWxlKCdndWx1Lm1pc3NpbmcnLCBbJ3VpLnJvdXRlciddKVxuXG4gIC8vIOmFjee9riByb3V0ZVxuICAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyXG4gICAgICAuc3RhdGUoJ21pc3NpbmcnLCB7XG4gICAgICAgIHVybDogJy9taXNzaW5nJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICc0MDQvNDA0Lmh0bScsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdNaXNzaW5nQ3RybCdcbiAgICAgIH0pO1xuICB9KVxuXG4gIC8vIDQwNCBjb250cm9sbGVyXG4gIC5jb250cm9sbGVyKCdNaXNzaW5nQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUpIHtcbiAgICBjb25zb2xlLmxvZygnSWBtIGhlcmUnKTtcbiAgICAvLyBUT0RPOlxuICAgIC8vIDEuIHNob3cgbGFzdCBwYXRoIGFuZCBwYWdlIG5hbWVcbiAgfSk7XG4iLCIvLyDoh6rlrprkuYkgZGlyZWN0aXZlc1xuXG5hbmd1bGFyXG4gIC5tb2R1bGUoJ2N1c3RvbS5kaXJlY3RpdmVzJywgW10pXG4gIC5kaXJlY3RpdmUoJ25nSW5kZXRlcm1pbmF0ZScsIGZ1bmN0aW9uKCRjb21waWxlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cmlidXRlcykge1xuICAgICAgICBzY29wZS4kd2F0Y2goYXR0cmlidXRlc1snbmdJbmRldGVybWluYXRlJ10sIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgZWxlbWVudC5wcm9wKCdpbmRldGVybWluYXRlJywgISF2YWx1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gIH0pO1xuIiwiYW5ndWxhclxuICAubW9kdWxlKCd1dGlsLmZpbHRlcnMnLCBbXSlcblxuICAuZmlsdGVyKCdtb2JpbGUnLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24ocykge1xuICAgICAgaWYgKHMgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgICB9XG5cbiAgICAgIHMgPSBzLnJlcGxhY2UoL1tcXHNcXC1dKy9nLCAnJyk7XG5cbiAgICAgIGlmIChzLmxlbmd0aCA8IDMpIHtcbiAgICAgICAgcmV0dXJuIHM7XG4gICAgICB9XG5cbiAgICAgIHZhciBzYSA9IHMuc3BsaXQoJycpO1xuXG4gICAgICBzYS5zcGxpY2UoMywgMCwgJy0nKTtcblxuICAgICAgaWYgKHMubGVuZ3RoID49IDcpIHtcbiAgICAgICAgc2Euc3BsaWNlKDgsIDAsICctJyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzYS5qb2luKCcnKTtcbiAgICB9O1xuICB9KTtcbiIsImFuZ3VsYXJcbiAgLm1vZHVsZSgndXRpbC5kYXRlJywgW10pXG4gIC5mYWN0b3J5KCdEYXRlVXRpbCcsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdG9TdHJpbmcgPSBmdW5jdGlvbiAoZGF0ZSwgcykge1xuICAgICAgcmV0dXJuIGRhdGUuZ2V0RnVsbFllYXIoKSArIHMgKyAoZGF0ZS5nZXRNb250aCgpICsgMSkgKyBzICsgZGF0ZS5nZXREYXRlKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHRvTG9jYWxEYXRlU3RyaW5nOiBmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgICByZXR1cm4gdG9TdHJpbmcoZGF0ZSwgJy0nKTtcbiAgICAgIH0sXG5cbiAgICAgIHRvTG9jYWxUaW1lU3RyaW5nOiBmdW5jdGlvbihkYXRlKSB7XG4gICAgICAgIHZhciBoID0gZGF0ZS5nZXRIb3VycygpO1xuICAgICAgICB2YXIgbSA9IGRhdGUuZ2V0TWludXRlcygpO1xuXG4gICAgICAgIGlmIChoIDwgMTApIHtcbiAgICAgICAgICBoID0gJzAnICsgaDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtIDwgMTApIHtcbiAgICAgICAgICBtID0gJzAnICsgbTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBbdG9TdHJpbmcoZGF0ZSwgJy0nKSwgaCArICc6JyArIG1dLmpvaW4oJyAnKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pOyIsIi8vIOaemuS4viBTZXJ2aWNlXG5hbmd1bGFyXG4gIC5tb2R1bGUoJ3V0aWwuZW51bXMnLCBbXSlcbiAgLmZhY3RvcnkoJ0VudW1zJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoRU5VTVMpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZhbDogZnVuY3Rpb24gKG5hbWUsIHRleHQpIHtcbiAgICAgICAgICByZXR1cm4gRU5VTVNbbmFtZV0uZmluZChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW0udGV4dCA9PT0gdGV4dDtcbiAgICAgICAgICB9KS52YWx1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgdGV4dDogZnVuY3Rpb24gKG5hbWUsIHZhbCkge1xuICAgICAgICAgIHJldHVybiBFTlVNU1tuYW1lXS5maW5kKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICByZXR1cm4gaXRlbS52YWx1ZSA9PT0gdmFsO1xuICAgICAgICAgIH0pLnRleHQ7XG4gICAgICAgIH0sXG4gICAgICAgIGl0ZW06IGZ1bmN0aW9uIChuYW1lLCB2YWwpIHtcbiAgICAgICAgICByZXR1cm4gRU5VTVNbbmFtZV0uZmluZChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW0udmFsdWUgPT09IHZhbDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgaXRlbTR0ZXh0OiBmdW5jdGlvbihuYW1lLCB0ZXh0KSB7XG4gICAgICAgICAgcmV0dXJuIEVOVU1TW25hbWVdLmZpbmQoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW0udGV4dCA9PT0gdGV4dDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgbGlzdDogZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgICByZXR1cm4gRU5VTVNbbmFtZV07XG4gICAgICAgIH0sXG4gICAgICAgIGl0ZW1zOiBmdW5jdGlvbiAobmFtZSwgdmFscykge1xuICAgICAgICAgIHJldHVybiBFTlVNU1tuYW1lXS5maWx0ZXIoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgIHJldHVybiB2YWxzLmluZGV4T2YoaXRlbS52YWx1ZSkgIT09IC0xO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH07XG4gIH0pOyIsIi8qIGdsb2JhbCBhbmd1bGFyKi9cbmFuZ3VsYXJcbiAgLm1vZHVsZSgndXRpbC5maWxlcicsIFtdKVxuICAuZmFjdG9yeSgnRmlsZXInLCBmdW5jdGlvbigkd2luZG93LCAkbG9nKSB7XG4gICAgdmFyIGZpbGVyID0ge307XG4gICAgZmlsZXIucmVtb3ZlID0gZnVuY3Rpb24odXJsKSB7XG4gICAgICAkd2luZG93LnJlc29sdmVMb2NhbEZpbGVTeXN0ZW1VUkwodXJsLCBmaWxlci5mc1N1Y2Nlc3MsIGZpbGVyLmZzRXJyb3IpO1xuICAgIH07XG5cbiAgICBmaWxlci5mc1N1Y2Nlc3MgPSBmdW5jdGlvbihmaWxlRW50cnkpIHtcbiAgICAgIGZpbGVFbnRyeS5yZW1vdmUoZnVuY3Rpb24oKSB7XG4gICAgICAgICRsb2cuaW5mbygn5Yig6Zmk5pys5Zyw5Zu+54mH5oiQ5YqfOiAnICsgZmlsZUVudHJ5LmZ1bGxQYXRoKTtcbiAgICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICAkbG9nLmluZm8oJ+WIoOmZpOacrOWcsOWbvueJh+Wksei0pTogJyArIGZpbGVFbnRyeS5mdWxsUGF0aCk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgZmlsZXIuZnNFcnJvciA9IGZ1bmN0aW9uKGV2dCkge1xuICAgICAgJGxvZy5pbmZvKCfojrflj5bmnKzlnLDlm77niYflpLHotKU6ICcgKyBKU09OLnN0cmluZ2lmeShldnQudGFyZ2V0KSk7XG4gICAgfTtcblxuICAgIHJldHVybiBmaWxlcjtcbiAgfSk7IiwiYW5ndWxhclxuICAubW9kdWxlKCdodHRwSW50ZXJjZXB0b3JzJywgWydMb2NhbFN0b3JhZ2VNb2R1bGUnLCAndXRpbC5vYXV0aCddKVxuXG4gIC5jb25maWcoZnVuY3Rpb24oJGh0dHBQcm92aWRlcikge1xuICAgICRodHRwUHJvdmlkZXIuaW50ZXJjZXB0b3JzLnB1c2goJ2h0dHBJbnRlcmNlcHRvcicpO1xuICAgIFxuICAgIC8vIEFuZ3VsYXIgJGh0dHAgaXNu4oCZdCBhcHBlbmRpbmcgdGhlIGhlYWRlciBYLVJlcXVlc3RlZC1XaXRoID0gWE1MSHR0cFJlcXVlc3Qgc2luY2UgQW5ndWxhciAxLjMuMFxuICAgICRodHRwUHJvdmlkZXIuZGVmYXVsdHMuaGVhZGVycy5jb21tb25bXCJYLVJlcXVlc3RlZC1XaXRoXCJdID0gJ1hNTEh0dHBSZXF1ZXN0JztcbiAgfSlcblxuICAuZmFjdG9yeSgnaHR0cEludGVyY2VwdG9yJywgZnVuY3Rpb24oJHEsICRyb290U2NvcGUsICRsb2NhdGlvbiwgT0F1dGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgLy8g6K+35rGC5YmN5L+u5pS5IHJlcXVlc3Qg6YWN572uXG4gICAgICAncmVxdWVzdCc6IGZ1bmN0aW9uKGNvbmZpZykge1xuICAgICAgICBhbmd1bGFyLmV4dGVuZChjb25maWcuaGVhZGVycywgT0F1dGguaGVhZGVycygpKTtcbiAgICAgICAgXG4gICAgICAgIC8vIOiLpeivt+axgueahOaYr+aooeadv++8jOaIluW3suWKoOS4iuaXtumXtOaIs+eahCB1cmwg5Zyw5Z2A77yM5YiZ5LiN6ZyA6KaB5Yqg5pe26Ze05oizXG4gICAgICAgIGlmIChjb25maWcudXJsLmluZGV4T2YoJy5odG0nKSAhPT0gLTEgfHwgY29uZmlnLnVybC5pbmRleE9mKCc/Xz0nKSAhPT0gLTEpIHtcbiAgICAgICAgICByZXR1cm4gY29uZmlnO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uZmlnLnVybCA9IGNvbmZpZy51cmwgKyAnP189JyArIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXG4gICAgICAgIHJldHVybiBjb25maWc7XG4gICAgICB9LFxuXG4gICAgICAvLyDor7fmsYLlh7rplJnvvIzkuqTnu5kgZXJyb3IgY2FsbGJhY2sg5aSE55CGXG4gICAgICAncmVxdWVzdEVycm9yJzogZnVuY3Rpb24ocmVqZWN0aW9uKSB7XG4gICAgICAgIHJldHVybiAkcS5yZWplY3QocmVqZWN0aW9uKTtcbiAgICAgIH0sXG5cbiAgICAgIC8vIOWTjeW6lOaVsOaNruaMiee6puWumuWkhOeQhlxuICAgICAgLy8ge1xuICAgICAgLy8gICBjb2RlOiAyMDAsIC8vIOiHquWumuS5ieeKtuaAgeegge+8jDIwMCDmiJDlip/vvIzpnZ4gMjAwIOWdh+S4jeaIkOWKn1xuICAgICAgLy8gICBtc2c6ICfmk43kvZzmj5DnpLonLCAvLyDkuI3og73lkowgZGF0YSDlhbHlrZhcbiAgICAgIC8vICAgZGF0YToge30gLy8g55So5oi35pWw5o2uXG4gICAgICAvLyB9XG4gICAgICAncmVzcG9uc2UnOiBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAvLyDmnI3liqHnq6/ov5Tlm57nmoTmnInmlYjnlKjmiLfmlbDmja5cbiAgICAgICAgdmFyIGRhdGEsIGNvZGU7XG4gICAgICAgIHZhciBjdXJyZW50X3BhdGggPSAkbG9jYXRpb24ucGF0aCgpO1xuXG4gICAgICAgIGlmIChhbmd1bGFyLmlzT2JqZWN0KHJlc3BvbnNlLmRhdGEpKSB7XG4gICAgICAgICAgLy8g6Iul5ZON5bqU5pWw5o2u5LiN56ym5ZCI57qm5a6aXG4gICAgICAgICAgaWYgKHJlc3BvbnNlLmRhdGEuY29kZSA9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29kZSA9IHJlc3BvbnNlLmRhdGEuY29kZTtcbiAgICAgICAgICBkYXRhID0gcmVzcG9uc2UuZGF0YS5kYXRhO1xuXG4gICAgICAgICAgLy8g6IulIHN0YXR1cyAyMDAsIOS4lCBjb2RlICEyMDDvvIzliJnov5Tlm57nmoTmmK/mk43kvZzplJnor6/mj5DnpLrkv6Hmga9cbiAgICAgICAgICAvLyDpgqPkuYjvvIxjYWxsYmFjayDkvJrmjqXmlLbliLDkuIvpnaLlvaLlvI/nmoTlj4LmlbDvvJpcbiAgICAgICAgICAvLyB7IGNvZGU6IDIwMDAxLCBtc2c6ICfmk43kvZzlpLHotKUnIH1cbiAgICAgICAgICBpZiAoY29kZSAhPT0gMjAwKSB7XG4gICAgICAgICAgICBpZiAoY29kZSA9PT0gNDAxKSB7XG4gICAgICAgICAgICAgIE9BdXRoLnI0MDEoY3VycmVudF9wYXRoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdChyZXNwb25zZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g6Iul5pyN5Yqh56uv6L+U5Zue55qEIGRhdGEgIW51bGzvvIzliJnov5Tlm57nmoTmmK/mnInmlYjlnLDnlKjmiLfmlbDmja5cbiAgICAgICAgICAvLyDpgqPkuYjvvIxjYWxsYmFjayDkvJrmjqXmlLbliLDkuIvpnaLlvaLlvI/lj4LmlbDvvJpcbiAgICAgICAgICAvLyB7IGl0ZW1zOiBbLi4uXSwgdG90YWxfY291bnQ6IDEwMCB9XG4gICAgICAgICAgaWYgKGRhdGEgIT0gbnVsbCkge1xuICAgICAgICAgICAgcmVzcG9uc2UuZGF0YSA9IGRhdGE7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g6Iul5pyN5Yqh56uv6L+U5Zue55qEIGRhdGEg5YC85Li6IG51bGzvvIzliJnov5Tlm57nmoTmmK/mj5DnpLrkv6Hmga9cbiAgICAgICAgICAvLyDpgqPkuYggY2FsbGJhY2sg5Lya5o6l5pS25Yiw5LiL6Z2i5b2i5byP55qE5Y+C5pWw77yaXG4gICAgICAgICAgLy8geyBjb2RlOiAyMDAsIG1zZzogJ+aTjeS9nOaIkOWKnycgfVxuICAgICAgICAgIC8vIOm7mOiupOS4uuatpFxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgICAgfSxcblxuICAgICAgLy8g5ZON5bqU5Ye66ZSZ77yM5Lqk57uZIGVycm9yIGNhbGxiYWNrIOWkhOeQhlxuICAgICAgJ3Jlc3BvbnNlRXJyb3InOiBmdW5jdGlvbihyZWplY3Rpb24pIHtcbiAgICAgICAgdmFyIGN1cnJlbnRfcGF0aCA9ICRsb2NhdGlvbi5wYXRoKCk7XG5cbiAgICAgICAgaWYgKHJlamVjdGlvbi5zdGF0dXMgPT09IDQwMSkge1xuICAgICAgICAgIE9BdXRoLnI0MDEoY3VycmVudF9wYXRoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAkcS5yZWplY3QocmVqZWN0aW9uKTtcbiAgICAgIH1cbiAgICB9O1xuICB9KTsiLCIvKiBnbG9iYWwgYW5ndWxhciovXG5hbmd1bGFyXG4gIC5tb2R1bGUoJ3V0aWwua2V5bWdyJywgWydMb2NhbFN0b3JhZ2VNb2R1bGUnXSlcbiAgLmZhY3RvcnkoJ0tleU1ncicsIGZ1bmN0aW9uKCRsb2csIGxvY2FsU3RvcmFnZVNlcnZpY2UpIHtcbiAgICB2YXIgS2V5TWdyID0ge1xuICAgICAgX19jb25uZWN0b3I6ICdfJyxcbiAgICAgIFxuICAgICAgcmVwb3J0OiBmdW5jdGlvbihvcmRlcl9pZCwgY2FyX2lkKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoICE9PSAyKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdLZXlNZ3IucmVwb3J0KCkg5Y+C5pWw6Z2e5rOVJyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gW29yZGVyX2lkLCBjYXJfaWRdLmpvaW4oS2V5TWdyLl9fY29ubmVjdG9yKTtcbiAgICAgIH0sXG5cbiAgICAgIF9fdHlwZTogZnVuY3Rpb24oZml4LCBvcmRlcl9pZCwgY2FyX2lkKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdLZXlNZ3IuJyArIGZpeCArICcoKSDlj4LmlbDpnZ7ms5UnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOesrOS4gOS4quWPguaVsOaYryByZXBvcnQgS2V5TWdyXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgcmV0dXJuIFtvcmRlcl9pZCwgZml4XS5qb2luKEtleU1nci5fX2Nvbm5lY3Rvcik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gW29yZGVyX2lkLCBjYXJfaWQsIGZpeF0uam9pbihLZXlNZ3IuX19jb25uZWN0b3IpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBhbmd1bGFyLmV4dGVuZChLZXlNZ3IsIHtcbiAgICAgIGVycjogS2V5TWdyLl9fdHlwZS5iaW5kKEtleU1nciwgJ2VycicpLFxuXG4gICAgICBzdGF0dXM6IEtleU1nci5fX3R5cGUuYmluZChLZXlNZ3IsICdzdGF0dXMnKSxcblxuICAgICAgc3VibWl0OiBLZXlNZ3IuX190eXBlLmJpbmQoS2V5TWdyLCAnc3VibWl0JyksXG5cbiAgICAgIGNsZWFyOiBmdW5jdGlvbihvcmRlcl9pZCwgY2FyX2lkKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZVNlcnZpY2UucmVtb3ZlKEtleU1nci5yZXBvcnQob3JkZXJfaWQsIGNhcl9pZCkpO1xuICAgICAgICBsb2NhbFN0b3JhZ2VTZXJ2aWNlLnJlbW92ZShLZXlNZ3Iuc3RhdHVzKG9yZGVyX2lkLCBjYXJfaWQpKTtcbiAgICAgICAgbG9jYWxTdG9yYWdlU2VydmljZS5yZW1vdmUoS2V5TWdyLnN1Ym1pdChvcmRlcl9pZCwgY2FyX2lkKSk7XG4gICAgICAgIGxvY2FsU3RvcmFnZVNlcnZpY2UucmVtb3ZlKEtleU1nci5lcnIob3JkZXJfaWQsIGNhcl9pZCkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgICAgXG4gICAgcmV0dXJuIEtleU1ncjtcbiAgfSk7IiwiLyogZ2xvYmFsIGFuZ3VsYXIqL1xuYW5ndWxhclxuICAubW9kdWxlKCd1dGlsLm9hdXRoJywgWydMb2NhbFN0b3JhZ2VNb2R1bGUnXSlcbiAgLmZhY3RvcnkoJ09BdXRoJywgZnVuY3Rpb24oJGxvZywgJGxvY2F0aW9uLCBsb2NhbFN0b3JhZ2VTZXJ2aWNlKSB7XG4gICAgdmFyIG9hdXRoX2xvY2FsX2tleSA9ICdvYXV0aCc7XG5cbiAgICB2YXIgb2F1dGhfY29uZiA9IHtcbiAgICAgIGNsaWVudF9pZDogJ1hlYXgyT01nZUxRUER4ZlNscklaM0JacXRGSE1uQldJaHBBS083YWonLFxuICAgICAgY2xpZW50X3NlY3JldDogJ3FCNWZON0tmSHlhMDBBcHpQOXBsSXIzdXBCWm9SVXZpM2hiYThERE1mNE9TOGJIWFJmQzNRMGdHSkJxTnMxV25oRmZmRlp3S1ZhTWFBSXM3dmNaaDRqTXpiWEVqRnJKSVozSXBjVjdjQXhRb3ZXMmhVVDlxbVFLaGpPOG5Bc0lNJyxcbiAgICAgIGdyYW50X3R5cGU6ICdwYXNzd29yZCdcbiAgICB9O1xuXG4gICAgdmFyIE9BdXRoID0ge1xuICAgICAgY29uZjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBvYXV0aF9jb25mO1xuICAgICAgfSxcblxuICAgICAgcjQwMTogZnVuY3Rpb24oY3VyX3BhdGgpIHtcbiAgICAgICAgJGxvY2F0aW9uLnVybCgnL2xvZ2luJyk7XG4gICAgICAgICRsb2NhdGlvbi5zZWFyY2goJ3JlZGlyZWN0JywgY3VyX3BhdGgpO1xuICAgICAgfSxcblxuICAgICAgaGVhZGVyczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB0b2tlbnMgPSB0aGlzLmxvY2FsKCk7XG4gICAgICAgIHZhciBoZWFkZXJzID0ge307XG5cbiAgICAgICAgaWYgKHRva2Vucykge1xuICAgICAgICAgIGhlYWRlcnMuQXV0aG9yaXphdGlvbiA9IHRva2Vucy50b2tlbl90eXBlICsgJyAnICsgdG9rZW5zLmFjY2Vzc190b2tlbjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBoZWFkZXJzO1xuICAgICAgfSxcblxuICAgICAgbG9jYWw6IGZ1bmN0aW9uKHRva2Vucykge1xuICAgICAgICBpZiAodG9rZW5zKSB7XG4gICAgICAgICAgbG9jYWxTdG9yYWdlU2VydmljZS5zZXQob2F1dGhfbG9jYWxfa2V5LCB0b2tlbnMpO1xuXG4gICAgICAgICAgcmV0dXJuIHRva2VucztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBsb2NhbFN0b3JhZ2VTZXJ2aWNlLmdldChvYXV0aF9sb2NhbF9rZXkpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gT0F1dGg7XG4gIH0pOyIsIi8qIGdsb2JhbCBhbmd1bGFyLCBGaWxlVXBsb2FkT3B0aW9ucywgRmlsZVRyYW5zZmVyKi9cbi8vIOmZhOS7tuS4iuS8oOWZqFxuYW5ndWxhclxuICAubW9kdWxlKCd1dGlsLnVwbG9hZGVyJywgW10pXG4gIC5mYWN0b3J5KCdVcGxvYWRlcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRsb2cpIHtcbiAgICB2YXIgdm0gPSAkcm9vdFNjb3BlO1xuICAgIHZhciBub29wID0gZnVuY3Rpb24oKSB7fTtcblxuICAgIHZhciB1cGxvYWRlciA9IHtcbiAgICAgIC8vIOaJuemHj+S4iuS8oOmZhOS7tlxuICAgICAgLy8g5L6d6LWWICRzY29wZSDnmoQgb2JzZXJ2ZXJcbiAgICAgIC8vIFxuICAgICAgLy8gYXR0YWNobWVudHM6IOmcgOimgeS4iuS8oOeahOmZhOS7tuWIl+ihqFxuICAgICAgLy8gYmFuZHdpZHRoOiDlkIzml7bkuIrkvKDnmoTmlbDph49cbiAgICAgIC8vIGRvbmU6IOaJgOaciemZhOS7tuS4iuS8oOWujOaIkOeahOWbnuiwg+WHveaVsFxuICAgICAgYmF0Y2g6IGZ1bmN0aW9uKG9wdCkge1xuICAgICAgICBpZiAoIW9wdC5hdHRhY2htZW50cyB8fCAhb3B0LnVybCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcign5LiK5Lyg6ZmE5Lu257y65bCR5Y+C5pWwJyk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgY291bnQgPSBvcHQuYXR0YWNobWVudHMubGVuZ3RoO1xuICAgICAgICB2YXIgaW5kZXg7XG4gICAgICAgIHZhciBjb21wbGV0ZWRfY291bnQgPSAwO1xuXG4gICAgICAgIC8vIOayoeaciemZhOS7tlxuICAgICAgICBpZiAoY291bnQgPT09IDApIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZGVmYXVsdE9wdCA9IHtcbiAgICAgICAgICBiYW5kd2lkdGg6IDMsXG4gICAgICAgICAgZG9uZTogbm9vcCxcbiAgICAgICAgICBvbmU6IG5vb3AsXG4gICAgICAgICAgZXJyb3I6IG5vb3BcbiAgICAgICAgfTtcblxuICAgICAgICBvcHQgPSBhbmd1bGFyLmV4dGVuZCh7fSwgZGVmYXVsdE9wdCwgb3B0KTtcblxuICAgICAgICB2YXIgY29tcGxldGUgPSBmdW5jdGlvbihhdHRhY2htZW50KSB7XG4gICAgICAgICAgLy8g5pu05pawIGF0dGFjaG1lbnQg6Kem5Y+R5LiL5LiA5Liq5LiK5LygXG4gICAgICAgICAgYXR0YWNobWVudC51cGxvYWRlZCA9IHRydWU7XG5cbiAgICAgICAgICBvcHQub25lLmFwcGx5KHVwbG9hZGVyLCBhcmd1bWVudHMpO1xuXG4gICAgICAgICAgY29tcGxldGVkX2NvdW50Kys7XG5cbiAgICAgICAgICBvcHQub25wcm9ncmVzcyh7XG4gICAgICAgICAgICBsb2FkZWQ6IGNvbXBsZXRlZF9jb3VudCxcbiAgICAgICAgICAgIHRvdGFsOiBjb3VudCxcbiAgICAgICAgICAgIHBlcmNlbnQ6IHBhcnNlSW50KGNvbXBsZXRlZF9jb3VudCAvIGNvdW50ICogMTAwKVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgaWYgKGluZGV4ID09PSBjb3VudCAtIDEpIHtcbiAgICAgICAgICAgIGlmICh2bS5fX2F0dGFjaG1lbnRzX18pIHtcbiAgICAgICAgICAgICAgdm0uX19hdHRhY2htZW50c19fID0gbnVsbDtcbiAgICAgICAgICAgICAgZGVsZXRlIHZtLl9fYXR0YWNobWVudHNfXztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgb3B0LmRvbmUoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgb3B0LmF0dGFjaG1lbnRzID0gYW5ndWxhci5jb3B5KG9wdC5hdHRhY2htZW50cywgW10pO1xuXG4gICAgICAgIC8vIOWPquacieS4gOS4qumZhOS7tlxuICAgICAgICBpZiAoY291bnQgPT09IDEpIHtcbiAgICAgICAgICBpbmRleCA9IDA7XG4gICAgICAgICAgdXBsb2FkZXIub25lKHtcbiAgICAgICAgICAgIGF0dGFjaG1lbnQ6IG9wdC5hdHRhY2htZW50c1swXSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGNvbXBsZXRlLFxuICAgICAgICAgICAgdXJsOiBvcHQudXJsLFxuICAgICAgICAgICAgZXJyb3I6IG9wdC5lcnJvclxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyDpmYTku7bmlbDph4/lsJHkuo7lkIzml7bkuIrkvKDnmoTmlbDph49cbiAgICAgICAgaWYgKGNvdW50IDwgb3B0LmJhbmR3aWR0aCkge1xuICAgICAgICAgIGluZGV4ID0gY291bnQgLSAxO1xuICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgICAgICAgdXBsb2FkZXIub25lKHtcbiAgICAgICAgICAgICAgYXR0YWNobWVudDogb3B0LmF0dGFjaG1lbnRzW2ldLFxuICAgICAgICAgICAgICBzdWNjZXNzOiBjb21wbGV0ZSxcbiAgICAgICAgICAgICAgdXJsOiBvcHQudXJsLFxuICAgICAgICAgICAgICBlcnJvcjogb3B0LmVycm9yXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBcbiAgICAgICAgaW5kZXggPSBvcHQuYmFuZHdpZHRoIC0gMTtcbiAgICAgICAgdm0uX19hdHRhY2htZW50c19fID0gb3B0LmF0dGFjaG1lbnRzO1xuXG4gICAgICAgIC8vIOS4iuS8oOWujOS4gOS4quWQju+8jOS7jiBhdHRhY2htZW50cyDkuK3lj5blh7rkuIvkuIDkuKrkuIrkvKBcbiAgICAgICAgLy8g5aeL57uI5L+d5oyB5ZCM5pe25LiK5Lyg55qE5pWw6YeP5Li6IGJhbmR3aWR0aFxuICAgICAgICB2bS4kd2F0Y2hDb2xsZWN0aW9uKCdfX2F0dGFjaG1lbnRzX18nLCBmdW5jdGlvbihuZXdBdHRhY2htZW50cykge1xuICAgICAgICAgIC8vIOaJuemHj+S4iuS8oOWujOaIkO+8jOS8muWIoOmZpCBfX2F0dGFjaG1lbnRzX19cbiAgICAgICAgICBpZiAoIW5ld0F0dGFjaG1lbnRzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdXBsb2FkZXIub25lKHtcbiAgICAgICAgICAgIGF0dGFjaG1lbnQ6IG9wdC5hdHRhY2htZW50c1srK2luZGV4XSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGNvbXBsZXRlLFxuICAgICAgICAgICAgdXJsOiBvcHQudXJsLFxuICAgICAgICAgICAgZXJyb3I6IG9wdC5lcnJvclxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBmb3IgKHZhciBrID0gMDsgayA8IG9wdC5iYW5kd2lkdGg7IGsrKykge1xuICAgICAgICAgIHVwbG9hZGVyLm9uZSh7XG4gICAgICAgICAgICBhdHRhY2htZW50OiBvcHQuYXR0YWNobWVudHNba10sXG4gICAgICAgICAgICBzdWNjZXNzOiBjb21wbGV0ZSxcbiAgICAgICAgICAgIHVybDogb3B0LnVybCxcbiAgICAgICAgICAgIGVycm9yOiBvcHQuZXJyb3JcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH0sXG5cbiAgICAgIC8vIOWNleS4quS4iuS8oFxuICAgICAgb25lOiBmdW5jdGlvbihvcHQpIHtcbiAgICAgICAgaWYgKCFvcHQuYXR0YWNobWVudCB8fCAhb3B0LnVybCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcign5LiK5Lyg6ZmE5Lu257y65bCR5Y+C5pWwJyk7XG4gICAgICAgIH1cblxuICAgICAgICAkbG9nLmRlYnVnKCdhdHRhY2htZW50OiAnICsgSlNPTi5zdHJpbmdpZnkob3B0LmF0dGFjaG1lbnQpKTtcbiAgICAgICAgXG4gICAgICAgIHZhciBkZWZhdWx0T3B0ID0ge1xuICAgICAgICAgIHN1Y2Nlc3M6IG5vb3AsXG4gICAgICAgICAgZXJyb3I6IG5vb3AsXG4gICAgICAgICAgZmlsZUtleTogJ2ZpbGVLZXknLFxuICAgICAgICAgIGZpbGVOYW1lOiBvcHQuYXR0YWNobWVudC51cmwuc3Vic3RyKG9wdC5hdHRhY2htZW50LnVybC5sYXN0SW5kZXhPZignLycpICsgMSlcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIGN1c3RvbV9vbnByb2dyZXNzID0gb3B0Lm9ucHJvZ3Jlc3M7XG4gICAgICAgIG9wdCA9IGFuZ3VsYXIuZXh0ZW5kKHt9LCBkZWZhdWx0T3B0LCBvcHQpO1xuICAgICAgICBvcHQub25wcm9nZXJzcyA9IGZ1bmN0aW9uKHByb2dyZXNzRXZlbnQpIHtcbiAgICAgICAgICBpZiAocHJvZ3Jlc3NFdmVudC5sZW5ndGhDb21wdXRhYmxlKSB7ICBcbiAgICAgICAgICAgIC8v5bey57uP5LiK5LygICBcbiAgICAgICAgICAgIHZhciBsb2FkZWQgPSBwcm9ncmVzc0V2ZW50LmxvYWRlZDsgIFxuICAgICAgICAgICAgLy/mlofku7bmgLvplb/luqYgIFxuICAgICAgICAgICAgdmFyIHRvdGFsID0gcHJvZ3Jlc3NFdmVudC50b3RhbDsgIFxuICAgICAgICAgICAgLy/orqHnrpfnmb7liIbmr5TvvIznlKjkuo7mmL7npLrov5vluqbmnaEgIFxuICAgICAgICAgICAgdmFyIHBlcmNlbnQgPSBwYXJzZUludCgobG9hZGVkIC8gdG90YWwpICogMTAwKTtcblxuICAgICAgICAgICAgY3VzdG9tX29ucHJvZ3Jlc3Moe1xuICAgICAgICAgICAgICBsb2FkZWQ6IGxvYWRlZCxcbiAgICAgICAgICAgICAgdG90YWw6IHRvdGFsLFxuICAgICAgICAgICAgICBwZXJjZW50OiBwZXJjZW50XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICB2YXIgZlVPcHRzID0gbmV3IEZpbGVVcGxvYWRPcHRpb25zKCk7XG4gICAgICAgIGZVT3B0cy5maWxlS2V5ID0gb3B0LmZpbGVLZXk7XG4gICAgICAgIGZVT3B0cy5maWxlTmFtZSA9IG9wdC5maWxlTmFtZTtcblxuICAgICAgICB2YXIgZnQgPSBuZXcgRmlsZVRyYW5zZmVyKCk7XG4gICAgICAgIGZ0Lm9ucHJvZ3Jlc3MgPSBvcHQub25wcm9ncmVzcztcbiAgICAgICAgZnQudXBsb2FkKFxuICAgICAgICAgIG9wdC5hdHRhY2htZW50LnVybCxcbiAgICAgICAgICBlbmNvZGVVUkkob3B0LnVybCksXG4gICAgICAgICAgb3B0LnN1Y2Nlc3MuYmluZCh1cGxvYWRlciwgb3B0LmF0dGFjaG1lbnQpLFxuICAgICAgICAgIG9wdC5lcnJvci5iaW5kKHVwbG9hZGVyLCBvcHQuYXR0YWNobWVudCksXG4gICAgICAgICAgZlVPcHRzXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfTtcbiAgICBcbiAgICByZXR1cm4gdXBsb2FkZXI7IFxuICB9KTtcbiIsIi8vICRzY29wZSDlop7lvLpcbmFuZ3VsYXJcbiAgLm1vZHVsZSgndXRpbC52bScsIFtdKVxuICAuZmFjdG9yeSgnVk0nLCBmdW5jdGlvbiAoJGxvZykge1xuICAgIHJldHVybiB7XG4gICAgICB0b19qc29uOiBmdW5jdGlvbih2bSwgZmllbGRzKSB7XG4gICAgICAgIHZhciByZXQgPSB7fTtcblxuICAgICAgICBpZiAoYW5ndWxhci5pc1N0cmluZyhmaWVsZHMpKSB7XG4gICAgICAgICAgZmllbGRzID0gZmllbGRzLnNwbGl0KCcsJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZmllbGRzLmxlbmd0aCA9PT0gMSAmJiBmaWVsZHNbMF0gPT09ICcnKSB7XG4gICAgICAgICAgJGxvZy53YXJuKCfmgqjosIPnlKjmlrnms5UgVk0udG9fanNvbiDml7bvvIzmsqHmnInkvKDlhaUgZmllbGRzIOWPguaVsCcpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghYW5ndWxhci5pc0FycmF5KGZpZWxkcykpIHtcbiAgICAgICAgICAkbG9nLmVycm9yKCfmlrnms5UgVk0udG9fanNvbiDlj6rmjqXlj5flrZfnrKbkuLLmlbDnu4TmiJbpgJflj7fliIbpmpTnmoTlrZfnrKbkuLLmiJbkuIDkuKrkuI3lkKvpgJflj7fnmoTlrZfnrKbkuLInKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBmaWVsZHMubWFwKGZ1bmN0aW9uKGZpZWxkKSB7XG4gICAgICAgICAgcmV0dXJuIHJldFtmaWVsZF0gPSB2bVtmaWVsZF07XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgICB9XG4gICAgfTtcbiAgfSk7IiwiJ3VzZSBzdHJpY3QnO1xuYW5ndWxhci5tb2R1bGUoXCJuZ0xvY2FsZVwiLCBbXSwgW1wiJHByb3ZpZGVcIiwgZnVuY3Rpb24oJHByb3ZpZGUpIHtcbiAgdmFyIFBMVVJBTF9DQVRFR09SWSA9IHtcbiAgICBaRVJPOiBcInplcm9cIixcbiAgICBPTkU6IFwib25lXCIsXG4gICAgVFdPOiBcInR3b1wiLFxuICAgIEZFVzogXCJmZXdcIixcbiAgICBNQU5ZOiBcIm1hbnlcIixcbiAgICBPVEhFUjogXCJvdGhlclwiXG4gIH07XG4gICRwcm92aWRlLnZhbHVlKFwiJGxvY2FsZVwiLCB7XG4gICAgXCJEQVRFVElNRV9GT1JNQVRTXCI6IHtcbiAgICAgIFwiQU1QTVNcIjogW1xuICAgICAgICBcIlxcdTRlMGFcXHU1MzQ4XCIsXG4gICAgICAgIFwiXFx1NGUwYlxcdTUzNDhcIlxuICAgICAgXSxcbiAgICAgIFwiREFZXCI6IFtcbiAgICAgICAgXCJcXHU2NjFmXFx1NjcxZlxcdTY1ZTVcIixcbiAgICAgICAgXCJcXHU2NjFmXFx1NjcxZlxcdTRlMDBcIixcbiAgICAgICAgXCJcXHU2NjFmXFx1NjcxZlxcdTRlOGNcIixcbiAgICAgICAgXCJcXHU2NjFmXFx1NjcxZlxcdTRlMDlcIixcbiAgICAgICAgXCJcXHU2NjFmXFx1NjcxZlxcdTU2ZGJcIixcbiAgICAgICAgXCJcXHU2NjFmXFx1NjcxZlxcdTRlOTRcIixcbiAgICAgICAgXCJcXHU2NjFmXFx1NjcxZlxcdTUxNmRcIlxuICAgICAgXSxcbiAgICAgIFwiTU9OVEhcIjogW1xuICAgICAgICBcIjFcXHU2NzA4XCIsXG4gICAgICAgIFwiMlxcdTY3MDhcIixcbiAgICAgICAgXCIzXFx1NjcwOFwiLFxuICAgICAgICBcIjRcXHU2NzA4XCIsXG4gICAgICAgIFwiNVxcdTY3MDhcIixcbiAgICAgICAgXCI2XFx1NjcwOFwiLFxuICAgICAgICBcIjdcXHU2NzA4XCIsXG4gICAgICAgIFwiOFxcdTY3MDhcIixcbiAgICAgICAgXCI5XFx1NjcwOFwiLFxuICAgICAgICBcIjEwXFx1NjcwOFwiLFxuICAgICAgICBcIjExXFx1NjcwOFwiLFxuICAgICAgICBcIjEyXFx1NjcwOFwiXG4gICAgICBdLFxuICAgICAgXCJTSE9SVERBWVwiOiBbXG4gICAgICAgIFwiXFx1NTQ2OFxcdTY1ZTVcIixcbiAgICAgICAgXCJcXHU1NDY4XFx1NGUwMFwiLFxuICAgICAgICBcIlxcdTU0NjhcXHU0ZThjXCIsXG4gICAgICAgIFwiXFx1NTQ2OFxcdTRlMDlcIixcbiAgICAgICAgXCJcXHU1NDY4XFx1NTZkYlwiLFxuICAgICAgICBcIlxcdTU0NjhcXHU0ZTk0XCIsXG4gICAgICAgIFwiXFx1NTQ2OFxcdTUxNmRcIlxuICAgICAgXSxcbiAgICAgIFwiU0hPUlRNT05USFwiOiBbXG4gICAgICAgIFwiMVxcdTY3MDhcIixcbiAgICAgICAgXCIyXFx1NjcwOFwiLFxuICAgICAgICBcIjNcXHU2NzA4XCIsXG4gICAgICAgIFwiNFxcdTY3MDhcIixcbiAgICAgICAgXCI1XFx1NjcwOFwiLFxuICAgICAgICBcIjZcXHU2NzA4XCIsXG4gICAgICAgIFwiN1xcdTY3MDhcIixcbiAgICAgICAgXCI4XFx1NjcwOFwiLFxuICAgICAgICBcIjlcXHU2NzA4XCIsXG4gICAgICAgIFwiMTBcXHU2NzA4XCIsXG4gICAgICAgIFwiMTFcXHU2NzA4XCIsXG4gICAgICAgIFwiMTJcXHU2NzA4XCJcbiAgICAgIF0sXG4gICAgICBcImZ1bGxEYXRlXCI6IFwieVxcdTVlNzRNXFx1NjcwOGRcXHU2NWU1RUVFRVwiLFxuICAgICAgXCJsb25nRGF0ZVwiOiBcInlcXHU1ZTc0TVxcdTY3MDhkXFx1NjVlNVwiLFxuICAgICAgXCJtZWRpdW1cIjogXCJ5eXl5LU0tZCBhaDptbTpzc1wiLFxuICAgICAgXCJtZWRpdW1EYXRlXCI6IFwieXl5eS1NLWRcIixcbiAgICAgIFwibWVkaXVtVGltZVwiOiBcImFoOm1tOnNzXCIsXG4gICAgICBcInNob3J0XCI6IFwieXktTS1kIGFoOm1tXCIsXG4gICAgICBcInNob3J0RGF0ZVwiOiBcInl5LU0tZFwiLFxuICAgICAgXCJzaG9ydFRpbWVcIjogXCJhaDptbVwiXG4gICAgfSxcbiAgICBcIk5VTUJFUl9GT1JNQVRTXCI6IHtcbiAgICAgIFwiQ1VSUkVOQ1lfU1lNXCI6IFwiXFx1MDBhNVwiLFxuICAgICAgXCJERUNJTUFMX1NFUFwiOiBcIi5cIixcbiAgICAgIFwiR1JPVVBfU0VQXCI6IFwiLFwiLFxuICAgICAgXCJQQVRURVJOU1wiOiBbe1xuICAgICAgICBcImdTaXplXCI6IDMsXG4gICAgICAgIFwibGdTaXplXCI6IDMsXG4gICAgICAgIFwibWFjRnJhY1wiOiAwLFxuICAgICAgICBcIm1heEZyYWNcIjogMyxcbiAgICAgICAgXCJtaW5GcmFjXCI6IDAsXG4gICAgICAgIFwibWluSW50XCI6IDEsXG4gICAgICAgIFwibmVnUHJlXCI6IFwiLVwiLFxuICAgICAgICBcIm5lZ1N1ZlwiOiBcIlwiLFxuICAgICAgICBcInBvc1ByZVwiOiBcIlwiLFxuICAgICAgICBcInBvc1N1ZlwiOiBcIlwiXG4gICAgICB9LCB7XG4gICAgICAgIFwiZ1NpemVcIjogMyxcbiAgICAgICAgXCJsZ1NpemVcIjogMyxcbiAgICAgICAgXCJtYWNGcmFjXCI6IDAsXG4gICAgICAgIFwibWF4RnJhY1wiOiAyLFxuICAgICAgICBcIm1pbkZyYWNcIjogMixcbiAgICAgICAgXCJtaW5JbnRcIjogMSxcbiAgICAgICAgXCJuZWdQcmVcIjogXCIoXFx1MDBhNFwiLFxuICAgICAgICBcIm5lZ1N1ZlwiOiBcIilcIixcbiAgICAgICAgXCJwb3NQcmVcIjogXCJcXHUwMGE0XCIsXG4gICAgICAgIFwicG9zU3VmXCI6IFwiXCJcbiAgICAgIH1dXG4gICAgfSxcbiAgICBcImlkXCI6IFwiemgtY25cIixcbiAgICBcInBsdXJhbENhdFwiOiBmdW5jdGlvbihuKSB7XG4gICAgICByZXR1cm4gUExVUkFMX0NBVEVHT1JZLk9USEVSO1xuICAgIH1cbiAgfSk7XG59XSk7XG4iLCJhbmd1bGFyXG4gIC5tb2R1bGUoJ2d1bHUuaW5kZW50LmVudW1zJywgWyd1dGlsLmVudW1zJywgXSlcblxuLmZhY3RvcnkoJ0luZGVudEVudW1zJywgZnVuY3Rpb24oRW51bXMsIEluZGVudEVudW1zU3ZjLCB0b2FzdHIpIHtcbiAgcmV0dXJuIEluZGVudEVudW1zU3ZjXG4gICAgICAuZ2V0KClcbiAgICAgIC4kcHJvbWlzZVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgIHZhciBhbGxfcHJlaW5zID0gJ29yZGVyX3R5cGUgb3JkZXJfc3RhdHVzIGNpdHkgaW5zcGVjdG9yIHVzZXJfdHlwZSBvcmRlcl90aHJvdWdoJy5zcGxpdCgnICcpO1xuXG4gICAgICAgIGFsbF9wcmVpbnMuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgICByZXNba2V5XS51bnNoaWZ0KHtcbiAgICAgICAgICAgIHRleHQ6ICflhajpg6gnLFxuICAgICAgICAgICAgdmFsdWU6IG51bGxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmVzWydzaXplJ10gPSBbe1xuICAgICAgICAgIHRleHQ6IDEwLFxuICAgICAgICAgIHZhbHVlOiAxMFxuICAgICAgICB9LCB7XG4gICAgICAgICAgdGV4dDogMTUsXG4gICAgICAgICAgdmFsdWU6IDE1XG4gICAgICAgIH0sIHtcbiAgICAgICAgICB0ZXh0OiAyMCxcbiAgICAgICAgICB2YWx1ZTogMjBcbiAgICAgICAgfSwge1xuICAgICAgICAgIHRleHQ6IDUwLFxuICAgICAgICAgIHZhbHVlOiA1MFxuICAgICAgICB9LCB7XG4gICAgICAgICAgdGV4dDogMTAwLFxuICAgICAgICAgIHZhbHVlOiAxMDBcbiAgICAgICAgfV07XG5cbiAgICAgICAgcmV0dXJuIEVudW1zKHJlcy50b0pTT04oKSk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICB0b2FzdHIuZXJyb3IocmVzLm1zZyB8fCAn6I635Y+W5p6a5Li+5aSx6LSlJyk7XG4gICAgICB9KTtcbn0pO1xuIiwiYW5ndWxhclxuICAubW9kdWxlKCdndWx1LmluZGVudC5zdmNzJywgWyduZ1Jlc291cmNlJ10pXG5cbiAgLnNlcnZpY2UoJ0luZGVudEVudW1zU3ZjJywgZnVuY3Rpb24oJHJlc291cmNlKSB7XG4gICAgcmV0dXJuICRyZXNvdXJjZShBUElfU0VSVkVSUy50ZXN0ZXIgKyAnL3BhcmFtZXRlcnMnKTtcbiAgfSlcbiAgXG4gIC5zZXJ2aWNlKCdJbmRlbnRzU3ZjJywgZnVuY3Rpb24oJHJlc291cmNlKSB7XG4gICAgcmV0dXJuICRyZXNvdXJjZShBUElfU0VSVkVSUy50ZXN0ZXIgKyAnL29yZGVycycsIHt9LCB7XG4gICAgICBxdWVyeToge1xuICAgICAgICBpc0FycmF5OiBmYWxzZVxuICAgICAgfVxuICAgIH0pO1xuICB9KVxuXG4gIC5zZXJ2aWNlKCdJbmRlbnRTdmMnLCBmdW5jdGlvbigkcmVzb3VyY2UpIHtcbiAgICByZXR1cm4gJHJlc291cmNlKEFQSV9TRVJWRVJTLnRlc3RlciArICcvb3JkZXIvOmlkJywge1xuICAgICAgaWQ6ICdAaWQnXG4gICAgfSwge1xuICAgICAgdXBkYXRlOiB7XG4gICAgICAgIG1ldGhvZDogJ1BVVCdcbiAgICAgIH1cbiAgICB9KTtcbiAgfSlcblxuICAuc2VydmljZSgnSW5kZW50QWNjZXB0U3ZjJywgZnVuY3Rpb24oJHJlc291cmNlKSB7XG4gICAgcmV0dXJuICRyZXNvdXJjZShBUElfU0VSVkVSUy50ZXN0ZXIgKyAnL29yZGVyLzppZC9pbnNwZWN0b3JfYWNjZXB0ZWQnLCB7XG4gICAgICBpZDogJ0BpZCdcbiAgICB9LCB7XG4gICAgICB1cGRhdGU6IHtcbiAgICAgICAgbWV0aG9kOiAnUFVUJ1xuICAgICAgfVxuICAgIH0pO1xuICB9KVxuXG4gIC5zZXJ2aWNlKCdJbmRlbnRSZXZva2VSZXF1ZXN0U3ZjJywgZnVuY3Rpb24oJHJlc291cmNlKSB7XG4gICAgcmV0dXJuICRyZXNvdXJjZShBUElfU0VSVkVSUy50ZXN0ZXIgKyAnL29yZGVyLzppZC9yZXZva2VfcmVxdWVzdGVkJywge1xuICAgICAgaWQ6ICdAaWQnXG4gICAgfSwge1xuICAgICAgdXBkYXRlOiB7XG4gICAgICAgIG1ldGhvZDogJ1BVVCdcbiAgICAgIH1cbiAgICB9KTtcbiAgfSlcblxuICAuc2VydmljZSgnVGVzdGVyc1N2YycsIGZ1bmN0aW9uKCRyZXNvdXJjZSkge1xuICAgIHJldHVybiAkcmVzb3VyY2UoQVBJX1NFUlZFUlMudGVzdGVyICsgJy90ZXN0ZXJzJywge30sIHtcbiAgICAgIHF1ZXJ5OiB7XG4gICAgICAgIGlzQXJyYXk6IGZhbHNlXG4gICAgICB9XG4gICAgfSk7XG4gIH0pXG5cbiAgLnNlcnZpY2UoJ1VudGVzdGVkSW5kZW50c1N2YycsIGZ1bmN0aW9uKCRyZXNvdXJjZSkge1xuICAgIHJldHVybiAkcmVzb3VyY2UoQVBJX1NFUlZFUlMudGVzdGVyICsgJy9vcmRlcnMvaW5zcGVjdG9yX3Rhc2tfdG9kYXknKTtcbiAgfSlcblxuICAuc2VydmljZSgnSW5kZW50SW5zcGVjdFN2YycsIGZ1bmN0aW9uKCRyZXNvdXJjZSkge1xuICAgIHJldHVybiAkcmVzb3VyY2UoQVBJX1NFUlZFUlMudGVzdGVyICsgJy9vcmRlci86b3JkZXJfaWQvb25nb2luZycsIHtcbiAgICAgIG9yZGVyX2lkOiAnQG9yZGVyX2lkJ1xuICAgIH0sIHtcbiAgICAgIHVwZGF0ZToge1xuICAgICAgICBtZXRob2Q6ICdQVVQnXG4gICAgICB9XG4gICAgfSk7XG4gIH0pXG5cbiAgLnNlcnZpY2UoJ0luZGVudENhcnNTdmMnLCBmdW5jdGlvbigkcmVzb3VyY2UpIHtcbiAgICByZXR1cm4gJHJlc291cmNlKEFQSV9TRVJWRVJTLnRlc3RlciArICcvb3JkZXIvOm9yZGVyX2lkL2NhcicsIHtcbiAgICAgIG9yZGVyX2lkOiAnQG9yZGVyX2lkJ1xuICAgIH0pXG4gIH0pXG5cbiAgLnNlcnZpY2UoJ0luZGVudENhclN2YycsIGZ1bmN0aW9uKCRyZXNvdXJjZSkge1xuICAgIHJldHVybiAkcmVzb3VyY2UoQVBJX1NFUlZFUlMudGVzdGVyICsgJy9vcmRlci86b3JkZXJfaWQvY2FyLzpjYXJfaWQnLCB7XG4gICAgICBvcmRlcl9pZDogJ0BvcmRlcl9pZCcsXG4gICAgICBjYXJfaWQ6ICdAY2FyX2lkJ1xuICAgIH0sIHtcbiAgICAgIHVwZGF0ZToge1xuICAgICAgICBtZXRob2Q6ICdQVVQnXG4gICAgICB9XG4gICAgfSk7XG4gIH0pOyIsIi8qIGdsb2JhbCBhbmd1bGFyLCBjb25maXJtLCBfICovXG5hbmd1bGFyXG4gIC5tb2R1bGUoJ2d1bHUuaW5kZW50JylcbiAgXG4gIC8vIOWFqOmDqOiuouWNleWIl+ihqFxuICAuY29udHJvbGxlcignSW5kZW50TGlzdEN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRsb2NhdGlvbiwgdG9hc3RyLCAkbW9kYWwsXG4gICAgSW5kZW50c1N2YywgSW5kZW50U3ZjLCBJbmRlbnRBY2NlcHRTdmMsIEluZGVudEVudW1zKSB7XG4gICAgdmFyIHZtID0gJHNjb3BlO1xuICAgIHZhciBxc28gPSAkbG9jYXRpb24uc2VhcmNoKCk7XG5cbiAgICB2bS5zdGF0dXNfaWQgPSBwYXJzZUludChxc28uc3RhdHVzX2lkKSB8fCBudWxsO1xuICAgIFxuICAgIGlmICh2bS4kc3RhdGUuaW5jbHVkZXMoJ2luZGVudHMudW5jb25maXJtZWQnKSkge1xuICAgICAgdm0uc3RhdHVzX2lkID0gMztcbiAgICB9IGVsc2Uge1xuICAgICAgdm0uY2l0eV9pZCA9IHBhcnNlSW50KHFzby5jaXR5X2lkKSB8fCBudWxsO1xuICAgICAgdm0uaW5zcGVjdG9yX2lkID0gcGFyc2VJbnQocXNvLmluc3BlY3Rvcl9pZCkgfHwgbnVsbDtcbiAgICAgIC8vIHZtLnJvbGVfaWQgPSBwYXJzZUludChxc28ucm9sZV9pZCkgfHwgbnVsbDtcbiAgICAgIHZtLnJlcXVlc3Rlcl9tb2JpbGUgPSBxc28ucmVxdWVzdGVyX21vYmlsZSB8fCBudWxsO1xuXG4gICAgICB2bS5zdGF0dXMgPSBJbmRlbnRFbnVtcy5pdGVtKCdvcmRlcl9zdGF0dXMnLCB2bS5zdGF0dXNfaWQpO1xuICAgICAgdm0uc3RhdHVzX2xpc3QgPSBJbmRlbnRFbnVtcy5saXN0KCdvcmRlcl9zdGF0dXMnKTtcbiAgICAgIHZtLmNpdHkgPSBJbmRlbnRFbnVtcy5pdGVtKCdjaXR5Jywgdm0uY2l0eV9pZCk7XG4gICAgICB2bS5jaXR5X2xpc3QgPSBJbmRlbnRFbnVtcy5saXN0KCdjaXR5Jyk7XG4gICAgICAvLyB2bS5yb2xlID0gSW5kZW50RW51bXMuaXRlbSgncm9sZScsIHZtLnJvbGVfaWQpO1xuICAgICAgLy8gdm0ucm9sZV9saXN0ID0gSW5kZW50RW51bXMubGlzdCgncm9sZScpO1xuICAgICAgdm0uaW5zcGVjdG9yID0gSW5kZW50RW51bXMuaXRlbSgnaW5zcGVjdG9yJywgdm0uaW5zcGVjdG9yX2lkKTtcbiAgICAgIHZtLmluc3BlY3Rvcl9saXN0ID0gSW5kZW50RW51bXMubGlzdCgnaW5zcGVjdG9yJyk7XG5cbiAgICAgIHdhdGNoX2xpc3QoJ3N0YXR1cycsICdzdGF0dXNfaWQnKTtcbiAgICAgIHdhdGNoX2xpc3QoJ2NpdHknLCAnY2l0eV9pZCcpO1xuICAgICAgLy8gd2F0Y2hfbGlzdCgncm9sZScsICdyb2xlX2lkJyk7XG4gICAgICB3YXRjaF9saXN0KCdpbnNwZWN0b3InLCAnaW5zcGVjdG9yX2lkJyk7XG5cbiAgICAgIHZtLnNlYXJjaCA9IHNlYXJjaDtcbiAgICB9XG5cbiAgICB2bS5wYWdlID0gcGFyc2VJbnQocXNvLnBhZ2UpIHx8IDE7XG4gICAgdm0uc2l6ZSA9IHBhcnNlSW50KHFzby5zaXplKSB8fCAyMDtcbiAgICB2bS5zaXplcyA9IEluZGVudEVudW1zLmxpc3QoJ3NpemUnKTtcbiAgICB2bS5zaXplX2l0ZW0gPSBJbmRlbnRFbnVtcy5pdGVtKCdzaXplJywgdm0uc2l6ZSk7XG5cbiAgICB2bS5zaXplX2NoYW5nZSA9IHNpemVfY2hhbmdlO1xuICAgIHZtLnBhZ2VfY2hhbmdlID0gcGFnZV9jaGFuZ2U7XG4gICAgdm0uY2FuY2VsX29yZGVyID0gY2FuY2VsX29yZGVyO1xuICAgIHZtLmNvbmZpcm1fb3JkZXIgPSBjb25maXJtX29yZGVyO1xuICAgIHZtLnN0YXJ0X3Rlc3QgPSBzdGFydF90ZXN0O1xuXG4gICAgcXVlcnkoKTtcblxuICAgIGZ1bmN0aW9uIHF1ZXJ5KCkge1xuICAgICAgdmFyIHBhcmFtcyA9IHtcbiAgICAgICAgY2l0eV9pZDogdm0uY2l0eV9pZCxcbiAgICAgICAgaXRlbXNfcGFnZTogdm0uc2l6ZSxcbiAgICAgICAgcGFnZTogdm0ucGFnZSxcblxuICAgICAgICBzdGF0dXNfaWQ6IHZtLnN0YXR1c19pZFxuICAgICAgfTtcblxuICAgICAgaWYgKHZtLiRzdGF0ZS5pbmNsdWRlcygnaW5kZW50cy5saXN0JykpIHtcbiAgICAgICAgYW5ndWxhci5leHRlbmQocGFyYW1zLCB7XG4gICAgICAgICAgY2l0eV9pZDogdm0uY2l0eV9pZCxcbiAgICAgICAgICBpbnNwZWN0b3JfaWQ6IHZtLmluc3BlY3Rvcl9pZCxcbiAgICAgICAgICAvLyByb2xlX2lkOiB2bS5yb2xlX2lkLFxuICAgICAgICAgIHJlcXVlc3Rlcl9tb2JpbGU6IHZtLnJlcXVlc3Rlcl9tb2JpbGVcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBcbiAgICAgICRsb2NhdGlvbi5zZWFyY2gocGFyYW1zKTtcblxuICAgICAgSW5kZW50c1N2Y1xuICAgICAgICAucXVlcnkocGFyYW1zKVxuICAgICAgICAuJHByb21pc2VcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocnMpIHtcbiAgICAgICAgICBycy5pdGVtcy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgIGl0ZW0uc3RhdHVzX3RleHQgPSBJbmRlbnRFbnVtcy50ZXh0KCdvcmRlcl9zdGF0dXMnLCBpdGVtLnN0YXR1c19pZCk7XG4gICAgICAgICAgICBpdGVtLm9yZGVyX3Rocm91Z2hfdGV4dCA9IEluZGVudEVudW1zLnRleHQoJ29yZGVyX3Rocm91Z2gnLCBpdGVtLm9yZGVyX3Rocm91Z2gpXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICB2bS5pdGVtcyA9IHJzLml0ZW1zO1xuICAgICAgICAgIHZtLnRvdGFsX2NvdW50ID0gcnMudG90YWxfY291bnQ7XG5cbiAgICAgICAgICB2YXIgdG1wID0gcnMudG90YWxfY291bnQgLyB2bS5zaXplO1xuICAgICAgICAgIHZtLnBhZ2VfY291bnQgPSBycy50b3RhbF9jb3VudCAlIHZtLnNpemUgPT09IDAgPyB0bXAgOiAoTWF0aC5mbG9vcih0bXApICsgMSk7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICB0b2FzdHIuZXJyb3IocmVzLmRhdGEubXNnIHx8ICfmn6Xor6LlpLHotKXvvIzmnI3liqHlmajlj5HnlJ/mnKrnn6XplJnor6/vvIzor7fph43or5UnKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gd2F0Y2hfbGlzdChuYW1lLCBmaWVsZCkge1xuICAgICAgdm0uJHdhdGNoKG5hbWUsIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgaWYgKCFpdGVtKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdm1bZmllbGRdID0gaXRlbS52YWx1ZTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIOehruiupOiuouWNlVxuICAgIGZ1bmN0aW9uIGNvbmZpcm1fb3JkZXIoaXRlbSkge1xuICAgICAgaWYgKGNvbmZpcm0oJ+ehruiupOaOpeWPl+ivpeiuouWNlT8nKSkge1xuICAgICAgICBJbmRlbnRBY2NlcHRTdmNcbiAgICAgICAgICAudXBkYXRlKHtcbiAgICAgICAgICAgIGlkOiBpdGVtLmlkXG4gICAgICAgICAgfSlcbiAgICAgICAgICAuJHByb21pc2VcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgIHRvYXN0ci5zdWNjZXNzKHJlcy5tc2cgfHwgJ+ehruiupOiuouWNleaIkOWKnycpO1xuXG4gICAgICAgICAgICBxdWVyeSgpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgdG9hc3RyLmVycm9yKHJlcy5tc2cgfHwgJ+ehruiupOiuouWNleWksei0pe+8jOivt+mHjeivlScpO1xuICAgICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIOWPlua2iOiuouWNlVxuICAgIGZ1bmN0aW9uIGNhbmNlbF9vcmRlcihpdGVtKSB7XG4gICAgICB2YXIgY2FuY2VsX29yZGVyX2lucyA9ICRtb2RhbC5vcGVuKHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdpbmRlbnQvY2FuY2VsX29yZGVyLmh0bScsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdDYW5jZWxPcmRlckN0cmwnLFxuICAgICAgICBiYWNrZHJvcDogJ3N0YXRpYycsXG4gICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICBpbmRlbnRfaW5mbzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBjYW5jZWxfb3JkZXJfaW5zLnJlc3VsdC50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBUT0RPOlxuICAgICAgICAvLyDmm7TmlrDpooTnuqbljZXnirbmgIFcbiAgICAgICAgcXVlcnkoKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIOW8gOWni+ajgOa1i1xuICAgIGZ1bmN0aW9uIHN0YXJ0X3Rlc3QoKSB7XG4gICAgICAkbG9jYXRpb24udXJsKCcvaW5kZW50cy91bnRlc3RlZCcpO1xuICAgIH1cblxuICAgIC8vIOavj+mhteadoeaVsOaUueWPmFxuICAgIGZ1bmN0aW9uIHNpemVfY2hhbmdlKHNpemUpIHtcbiAgICAgIHZtLnNpemUgPSBzaXplO1xuICAgICAgdm0ucGFnZSA9IDE7XG5cbiAgICAgIHF1ZXJ5KCk7XG4gICAgfVxuXG4gICAgLy8g57+76aG1XG4gICAgZnVuY3Rpb24gcGFnZV9jaGFuZ2UocGFnZSkge1xuICAgICAgdm0ucGFnZSA9IHBhZ2U7XG5cbiAgICAgIHF1ZXJ5KCk7XG4gICAgfVxuXG4gICAgLy8g5p+l6K+i5o+Q5LqkXG4gICAgZnVuY3Rpb24gc2VhcmNoKCkge1xuICAgICAgdm0ucGFnZSA9IDE7XG5cbiAgICAgIHF1ZXJ5KCk7XG4gICAgfVxuICB9KVxuICBcbiAgLy8g5b2T5aSp5Lu75YqhXG4gIC5jb250cm9sbGVyKCdVbnRlc3RlZEluZGVudExpc3RDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkbG9nLCAkbG9jYXRpb24sICRtb2RhbCwgJHRlbXBsYXRlQ2FjaGUsIHRvYXN0cixcbiAgICBGaWxlciwgVXBsb2FkZXIsIEtleU1nciwgbG9jYWxTdG9yYWdlU2VydmljZSwgVW50ZXN0ZWRJbmRlbnRzU3ZjLCBJbmRlbnRFbnVtcywgSW5kZW50SW5zcGVjdFN2YyxcbiAgICBJbmRlbnRDYXJTdmMsIFJlcG9ydFN2Yykge1xuICAgIHZhciB2bSA9ICRzY29wZTtcbiAgICB2YXIgcGFydHMgPSBKU09OLnBhcnNlKCR0ZW1wbGF0ZUNhY2hlLmdldCgncmVwb3J0L2kuanNvbicpKTtcblxuICAgIGlmIChwYXJ0cyAmJiBwYXJ0cy5sZW5ndGgpIHtcbiAgICAgIHZtLmZpcnN0X3BhcnRfaWQgPSBwYXJ0c1swXS5pZDtcbiAgICB9XG5cbiAgICB2bS5jYW5jZWxfb3JkZXIgPSBjYW5jZWxfb3JkZXI7XG4gICAgdm0uZGVsX2NhciA9IGRlbF9jYXI7XG4gICAgdm0uZWRpdF9jYXIgPSBlZGl0X2NhcjtcbiAgICB2bS51cGxvYWRfcmVwb3J0ID0gdXBsb2FkX3JlcG9ydDtcbiAgICB2bS5jbGVhcl9sb2NhbCA9IGNsZWFyX2xvY2FsO1xuICAgIHZtLmluc3BlY3QgPSBpbnNwZWN0O1xuXG4gICAgcXVlcnkoKTtcblxuICAgIGZ1bmN0aW9uIHF1ZXJ5KCkge1xuICAgICAgcmV0dXJuIFVudGVzdGVkSW5kZW50c1N2Y1xuICAgICAgICAucXVlcnkoKVxuICAgICAgICAuJHByb21pc2VcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgcmVzLmZvckVhY2goZnVuY3Rpb24ob3JkZXIpIHtcbiAgICAgICAgICAgIG9yZGVyLm9yZGVyX3Rocm91Z2hfdGV4dCA9IEluZGVudEVudW1zLnRleHQoJ29yZGVyX3Rocm91Z2gnLCBvcmRlci5vcmRlcl90aHJvdWdoKTtcblxuICAgICAgICAgICAgb3JkZXIuYXV0by5mb3JFYWNoKGZ1bmN0aW9uKGNhcikge1xuICAgICAgICAgICAgICB2YXIgcmVwb3J0X3N0YXR1c19rZXkgPSBLZXlNZ3Iuc3RhdHVzKG9yZGVyLmlkLCBjYXIuaWQpO1xuICAgICAgICAgICAgICBjYXIucmVwb3J0X3N0YXR1cyA9IGxvY2FsU3RvcmFnZVNlcnZpY2UuZ2V0KHJlcG9ydF9zdGF0dXNfa2V5KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgdm0uaXRlbXMgPSByZXM7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICB0b2FzdHIuZXJyb3IocmVzLm1zZyB8fCAn6I635Y+W5b6F5qOA5rWL6K6i5Y2V5aSx6LSlJyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIOWKoOi9piDmiJYg57yW6L6R6L2mXG4gICAgZnVuY3Rpb24gZWRpdF9jYXIoaWQsIGNhcikge1xuICAgICAgdmFyIGVkaXRfY2FyX2lucyA9ICRtb2RhbC5vcGVuKHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdpbmRlbnQvZWRpdF9jYXIuaHRtJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0luZGVudENhckVkaXRDdHJsJyxcbiAgICAgICAgYmFja2Ryb3A6ICdzdGF0aWMnLFxuICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgSW5kZW50RW51bXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIEluZGVudEVudW1zO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgaW5kZW50X2luZm86IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgaWQ6IGlkLFxuICAgICAgICAgICAgICBjYXI6IGNhclxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBlZGl0X2Nhcl9pbnMucmVzdWx0LnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIHF1ZXJ5KCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyDliKDpmaTovaZcbiAgICBmdW5jdGlvbiBkZWxfY2FyKG9yZGVyX2lkLCBjYXIpIHtcbiAgICAgIGlmIChjb25maXJtKCfnoa7orqTliKDpmaQgXCInICsgW2Nhci5icmFuZCwgY2FyLnNlcmllcywgY2FyLm1vZGVsXS5qb2luKCctJykgKyAnXCInKSkge1xuICAgICAgICByZXR1cm4gSW5kZW50Q2FyU3ZjXG4gICAgICAgICAgLnJlbW92ZSh7XG4gICAgICAgICAgICBvcmRlcl9pZDogb3JkZXJfaWQsXG4gICAgICAgICAgICBjYXJfaWQ6IGNhci5pZFxuICAgICAgICAgIH0pXG4gICAgICAgICAgLiRwcm9taXNlXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICBLZXlNZ3IuY2xlYXIob3JkZXJfaWQsIGNhci5pZCk7XG5cbiAgICAgICAgICAgIHRvYXN0ci5zdWNjZXNzKHJlcy5tc2cgfHwgJ+WIoOmZpOi9puaIkOWKnycpO1xuXG4gICAgICAgICAgICBxdWVyeSgpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgdG9hc3RyLmVycm9yKHJlcy5tc2cgfHwgJ+WIoOmZpOi9puWksei0pe+8jOivt+mHjeivlScpO1xuICAgICAgICAgIH0pOyAgXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8g5riF6ZmkbG9jYWxcbiAgICBmdW5jdGlvbiBjbGVhcl9sb2NhbChvcmRlcl9pZCwgY2FyKSB7XG4gICAgICBLZXlNZ3IuY2xlYXIob3JkZXJfaWQsIGNhci5pZCk7XG4gICAgICB0b2FzdHIuc3VjY2Vzcygn5riF55CG5pys5Zyw5pWw5o2u5a6M5oiQJyk7XG4gICAgfVxuXG4gICAgLy8g5Y+W5raI6K6i5Y2VXG4gICAgZnVuY3Rpb24gY2FuY2VsX29yZGVyKGl0ZW0pIHtcbiAgICAgIHZhciBjYW5jZWxfb3JkZXJfaW5zID0gJG1vZGFsLm9wZW4oe1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2luZGVudC9jYW5jZWxfb3JkZXIuaHRtJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0NhbmNlbE9yZGVyQ3RybCcsXG4gICAgICAgIGJhY2tkcm9wOiAnc3RhdGljJyxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgIGluZGVudF9pbmZvOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGNhbmNlbF9vcmRlcl9pbnMucmVzdWx0LnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIOWIoOmZpOaJgOacieacrOWcsOaKpeWRiuebuOWFs+aVsOaNrlxuICAgICAgICBpdGVtLmF1dG8uZm9yRWFjaChmdW5jdGlvbihjYXIpIHtcbiAgICAgICAgICBLZXlNZ3IuY2xlYXIoaXRlbS5pZCwgY2FyLmlkKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcXVlcnkoKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIOajgOa1i1xuICAgIGZ1bmN0aW9uIGluc3BlY3Qob3JkZXJfaWQsIGNhcl9pZCkge1xuICAgICAgcmV0dXJuIEluZGVudEluc3BlY3RTdmNcbiAgICAgICAgLnVwZGF0ZSh7XG4gICAgICAgICAgb3JkZXJfaWQ6IG9yZGVyX2lkXG4gICAgICAgIH0pXG4gICAgICAgIC4kcHJvbWlzZVxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICB0b2FzdHIuc3VjY2VzcyhyZXMubXNnIHx8ICfmo4DmtYvlvIDlp4snKTtcblxuICAgICAgICAgICRsb2NhdGlvbi51cmwoJy9pbmRlbnRzLycgKyBvcmRlcl9pZCArICcvY2FyLycgKyBjYXJfaWQgKyAnL3JlcG9ydC8nICsgdm0uZmlyc3RfcGFydF9pZCk7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICB0b2FzdHIuZXJyb3IocmVzLm1zZyB8fCAn6K6i5Y2V5Y+W5raI5aSx6LSl77yM6K+36YeN6K+VJyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIOS4iuS8oOaKpeWRilxuICAgIGZ1bmN0aW9uIHVwbG9hZF9yZXBvcnQob3JkZXIsIGNhcikge1xuICAgICAgdmFyIG9yZGVyX2lkID0gb3JkZXIuaWQ7XG4gICAgICB2YXIgY2FyX2lkID0gY2FyLmlkO1xuXG4gICAgICB2YXIgcmVwb3J0X2tleSA9IEtleU1nci5yZXBvcnQob3JkZXJfaWQsIGNhcl9pZCk7XG4gICAgICB2YXIgcmVwb3J0X3N1Ym1pdF9rZXkgPSBLZXlNZ3Iuc3VibWl0KHJlcG9ydF9rZXkpO1xuICAgICAgdmFyIHJlcG9ydF9kYXRhID0gbG9jYWxTdG9yYWdlU2VydmljZS5nZXQocmVwb3J0X2tleSk7XG5cbiAgICAgICRsb2cuaW5mbygn5YeG5aSH5LiK5Lyg5oql5ZGKOiAnICsgcmVwb3J0X2tleSk7XG4gICAgICAkbG9nLmluZm8oJ+aKpeWRiuWIhuexu+aVsOaNrjogJyArIEpTT04uc3RyaW5naWZ5KHJlcG9ydF9kYXRhKSk7XG5cbiAgICAgIGlmICghcmVwb3J0X2RhdGEpIHtcbiAgICAgICAgJGxvZy5pbmZvKCfmiqXlkYrmlbDmja7kuLrnqbrvvIzkuI3nlKjkuIrkvKAnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjYXIucmVwb3J0X3N0YXR1cy51cGxvYWRfc3RhdHVzID0gMDtcbiAgICAgIGNhci5yZXBvcnRfc3RhdHVzLnVwbG9hZGluZyA9IHRydWU7XG5cbiAgICAgIHZhciBzdWJtaXRfZGF0YSA9IHt9O1xuXG4gICAgICBPYmplY3Qua2V5cyhyZXBvcnRfZGF0YSkuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgYW5ndWxhci5leHRlbmQoc3VibWl0X2RhdGEsIHJlcG9ydF9kYXRhW2tleV0pO1xuICAgICAgfSk7XG5cbiAgICAgICRsb2cuaW5mbygn5oql5ZGK5b6F5o+Q5Lqk5pWw5o2uOiAnICsgSlNPTi5zdHJpbmdpZnkoc3VibWl0X2RhdGEpKTtcblxuICAgICAgdmFyIGltYWdlX2ZpZWxkcyA9IHt9O1xuICAgICAgT2JqZWN0LmtleXMoc3VibWl0X2RhdGEpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgIGlmIChzdWJtaXRfZGF0YVtrZXldLmltYWdlKSB7XG4gICAgICAgICAgaW1hZ2VfZmllbGRzW2tleV0gPSBhbmd1bGFyLmV4dGVuZCh7XG4gICAgICAgICAgICB1cmw6IHN1Ym1pdF9kYXRhW2tleV0uaW1hZ2VcbiAgICAgICAgICB9LCBzdWJtaXRfZGF0YVtrZXldKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHZhciBpbWFnZXMgPSBfLnZhbHVlcyhpbWFnZV9maWVsZHMpO1xuXG4gICAgICAvLyDmsqHmnInlm77niYfpnIDopoHkuIrkvKDvvIznm7TmjqXkuIrkvKDmiqXlkYrlhoXlrrlcbiAgICAgIGlmICghaW1hZ2VzLmxlbmd0aCkge1xuICAgICAgICBzdWJtaXRfcmVwb3J0KCk7XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAkbG9nLmluZm8oJ+aKpeWRiuWbvueJh+aVsOaNrjogJyArIEpTT04uc3RyaW5naWZ5KGltYWdlX2ZpZWxkcykpO1xuICAgICAgJGxvZy5pbmZvKCflvIDlp4vkuIrkvKDnhafniYfmlbDmja4nKTtcbiAgICAgIFVwbG9hZGVyLmJhdGNoKHtcbiAgICAgICAgdXJsOiAnaHR0cDovL2YuaWZkaXUuY29tJyxcbiAgICAgICAgYXR0YWNobWVudHM6IGltYWdlcyxcbiAgICAgICAgZG9uZTogdXBsb2FkX2RvbmUsXG4gICAgICAgIG9uZTogdXBsb2FkX29uZSxcbiAgICAgICAgb25wcm9ncmVzczogb25wcm9ncmVzcyxcbiAgICAgICAgZXJyb3I6IHVwbG9hZF9lcnJvclxuICAgICAgfSk7XG5cbiAgICAgIGZ1bmN0aW9uIG9ucHJvZ3Jlc3MocHJvZ3Jlc3MpIHtcbiAgICAgICAgLy8gMS4gdXBkYXRlIHByb2dyZXNzIHN0YXR1cyB0byBwYWdlXG4gICAgICAgICRsb2cuaW5mbygn5LiK5Lyg6L+b5bqmOiAnICsgcHJvZ3Jlc3MucGVyY2VudCk7XG4gICAgICAgIGNhci5yZXBvcnRfc3RhdHVzLnVwbG9hZF9zdGF0dXMgPSBwYXJzZUludChwcm9ncmVzcy5wZXJjZW50ICogMC44KTtcbiAgICAgICAgdm0uJGFwcGx5KCk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHVwbG9hZF9vbmUoaW1hZ2UsIGZpbGUpIHtcbiAgICAgICAgLy8gWW91IGNhbiBkbyBzb21ldGhpbmcgb24gaW1hZ2Ugd2l0aCBmaWxlIG9iamVjdFxuICAgICAgICBpbWFnZS5maWxlX2lkID0gZmlsZS5pZDtcbiAgICAgICAgJGxvZy5pbmZvKCfmiJDlip/kuIrkvKDlm77niYc6ICcgKyBKU09OLnN0cmluZ2lmeShpbWFnZSkpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiB1cGxvYWRfZXJyb3IoaW1hZ2UpIHtcbiAgICAgICAgJGxvZy5pbmZvKCfkuIrkvKDlm77niYflh7rplJk6ICcgKyBKU09OLnN0cmluZ2lmeShpbWFnZSkpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiB1cGxvYWRfZG9uZSgpIHtcbiAgICAgICAgLy8gMS4gY29tYmluZSBpbWFnZSBmaWxlaWQgdG8gc3VibWl0X2RhdGFcbiAgICAgICAgLy8gMi4gc3RvcmUgaW1hZ2UgZGF0YSB0byBsb2NhbHN0b3JhZ2VcbiAgICAgICAgLy8gMy4gc3VibWl0IHJlcG9ydCBkYXRhXG4gICAgICAgICRsb2cuaW5mbygn5oiQ5Yqf5LiK5Lyg5omA5pyJ5Zu+54mHJyk7XG5cbiAgICAgICAgLy8gMVxuICAgICAgICBpbWFnZXMuZm9yRWFjaChmdW5jdGlvbihpbWFnZSkge1xuICAgICAgICAgIHN1Ym1pdF9kYXRhW2ltYWdlLmlkXSA9IGltYWdlO1xuICAgICAgICB9KTtcblxuICAgICAgICAkbG9nLmluZm8oJ+WbnuWGmeWbvueJh+aVsOaNruWIsCBsb2NhbHN0b3JhZ2UnKTtcblxuICAgICAgICAvLyAyXG4gICAgICAgIGxvY2FsU3RvcmFnZVNlcnZpY2Uuc2V0KHJlcG9ydF9zdWJtaXRfa2V5LCBzdWJtaXRfZGF0YSk7XG5cbiAgICAgICAgLy8gM1xuICAgICAgICBzdWJtaXRfcmVwb3J0KCk7XG4gICAgICB9XG5cbiAgICAgIC8vIDEuIHN1Ym1pdCByZXBvcnQgZGF0YVxuICAgICAgLy8gMi4gcmVtb3ZlIGltYWdlIGZyb20gY2FjaGVcbiAgICAgIC8vIDMuIGNsZWFyIHJlcG9ydCBsb2NhbCBkYXRhXG4gICAgICAvLyA0LiB1cGRhdGUgb3JkZXIgc3RhdHVzIFxuICAgICAgZnVuY3Rpb24gc3VibWl0X3JlcG9ydCgpIHtcbiAgICAgICAgJGxvZy5pbmZvKCflvIDlp4vkuIrkvKDmiqXlkYrlhoXlrrknKTtcbiAgICAgICAgLy8gMVxuICAgICAgICByZXR1cm4gUmVwb3J0U3ZjXG4gICAgICAgICAgLnNhdmUoe1xuICAgICAgICAgICAgb3JkZXJfaWQ6IG9yZGVyX2lkLFxuICAgICAgICAgICAgY2FyX2lkOiBjYXJfaWRcbiAgICAgICAgICB9LCBzdWJtaXRfZGF0YSlcbiAgICAgICAgICAuJHByb21pc2VcbiAgICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICRsb2cuaW5mbygn5LiK5Lyg5oql5ZGK5YaF5a655oiQ5YqfJyk7XG5cbiAgICAgICAgICAgIC8vIDJcbiAgICAgICAgICAgIGlmIChpbWFnZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGltYWdlcy5mb3JFYWNoKGZ1bmN0aW9uKGltYWdlKSB7XG4gICAgICAgICAgICAgICAgRmlsZXIucmVtb3ZlKGltYWdlLnVybCk7XG4gICAgICAgICAgICAgIH0pOyAgXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIDNcbiAgICAgICAgICAgIEtleU1nci5jbGVhcihvcmRlcl9pZCwgY2FyX2lkKTtcblxuICAgICAgICAgICAgLy8gNFxuICAgICAgICAgICAgY2FyLnJlcG9ydF9zdGF0dXMudXBsb2FkX3N0YXR1cyA9IDEwMDtcbiAgICAgICAgICAgIGNhci5yZXBvcnRfc3RhdHVzLnVwbG9hZGVkID0gdHJ1ZTtcblxuICAgICAgICAgICAgLy8gcXVlcnkoKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5jYXRjaChmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICRsb2cuaW5mbygn5LiK5Lyg5oql5ZGK5YaF5a655aSx6LSlOiAnICsgSlNPTi5zdHJpbmdpZnkoYXJndW1lbnRzKSk7XG4gICAgICAgICAgICB0b2FzdHIuZXJyb3IocmVzLm1zZyB8fCAn5LiK5Lyg6L+H56iL5Lit5Y+R55Sf6ZSZ6K+v77yM6K+36YeN6K+VJyk7XG4gICAgICAgICAgICAvLyA0XG4gICAgICAgICAgICBjYXIucmVwb3J0X3N0YXR1cy51cGxvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH0pXG4gIFxuICAvLyDlj5bmtojorqLljZVcbiAgLmNvbnRyb2xsZXIoJ0NhbmNlbE9yZGVyQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJG1vZGFsSW5zdGFuY2UsIHRvYXN0ciwgSW5kZW50UmV2b2tlUmVxdWVzdFN2YywgaW5kZW50X2luZm8pIHtcbiAgICB2YXIgdm0gPSAkc2NvcGU7XG5cbiAgICBhbmd1bGFyLmV4dGVuZCh2bSwgaW5kZW50X2luZm8pO1xuXG4gICAgdm0uY2FuY2VsX29yZGVyID0gY2FuY2VsX29yZGVyO1xuICAgIHZtLmNhbmNlbCA9IGNhbmNlbDtcblxuICAgIGZ1bmN0aW9uIGNhbmNlbF9vcmRlcigpIHtcbiAgICAgIHZtLmNhbmNlbF9vcmRlcl9zdGF0dXMgPSB0cnVlO1xuXG4gICAgICBJbmRlbnRSZXZva2VSZXF1ZXN0U3ZjXG4gICAgICAgIC51cGRhdGUoe1xuICAgICAgICAgIGlkOiBpbmRlbnRfaW5mby5pZFxuICAgICAgICB9LCB7XG4gICAgICAgICAgbWVtbzogdm0ucmVhc29uXG4gICAgICAgIH0pXG4gICAgICAgIC4kcHJvbWlzZVxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICB0b2FzdHIuc3VjY2VzcyhyZXMubXNnIHx8ICforqLljZXlj5bmtojmiJDlip8nKTtcblxuICAgICAgICAgICRtb2RhbEluc3RhbmNlLmNsb3NlKCk7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICB2bS5jYW5jZWxfb3JkZXJfc3RhdHVzID0gZmFsc2U7XG5cbiAgICAgICAgICB0b2FzdHIuZXJyb3IocmVzLm1zZyB8fCAn6K6i5Y2V5Y+W5raI5aSx6LSl77yM6K+36YeN6K+VJyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNhbmNlbCgpIHtcbiAgICAgICRtb2RhbEluc3RhbmNlLmRpc21pc3MoKTtcbiAgICB9XG4gIH0pXG5cbiAgLy8g5Yqg6L2mIOaIliDnvJbovpHovaZcbiAgLmNvbnRyb2xsZXIoJ0luZGVudENhckVkaXRDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkbW9kYWxJbnN0YW5jZSwgdG9hc3RyLCBJbmRlbnRDYXJzU3ZjLFxuICAgIEluZGVudENhclN2YywgSW5kZW50RW51bXMsIGluZGVudF9pbmZvKSB7XG4gICAgdmFyIHZtID0gJHNjb3BlO1xuXG4gICAgdm0uYnJhbmRfbGlzdCA9IEluZGVudEVudW1zLmxpc3QoJ2JyYW5kJyk7XG4gICAgdm0uc2VyaWVzX2xpc3QgPSBJbmRlbnRFbnVtcy5saXN0KCdzZXJpZXMnKTtcbiAgICB2bS5tb2RlbF9saXN0ID0gSW5kZW50RW51bXMubGlzdCgnbW9kZWwnKTtcblxuICAgIGlmIChpbmRlbnRfaW5mby5jYXIpIHtcbiAgICAgIHZtLnRpdGxlID0gJ+e8lui+kei9puS/oeaBryc7XG5cbiAgICAgIHNlbGVjdF9pdGVtKCdicmFuZCcsIGluZGVudF9pbmZvLmNhci5icmFuZCk7XG4gICAgICBzZWxlY3RfaXRlbSgnc2VyaWVzJywgaW5kZW50X2luZm8uY2FyLnNlcmllcyk7XG4gICAgICBzZWxlY3RfaXRlbSgnbW9kZWwnLCBpbmRlbnRfaW5mby5jYXIubW9kZWwpOyAgXG4gICAgfSBlbHNlIHtcbiAgICAgIHZtLnRpdGxlID0gJ+WKoOi9pic7XG4gICAgfVxuXG4gICAgdm0uY2FuY2VsID0gY2FuY2VsO1xuICAgIHZtLnN1Ym1pdCA9IHN1Ym1pdDtcblxuICAgIGZ1bmN0aW9uIHN1Ym1pdCgpIHtcbiAgICAgIGlmIChpbmRlbnRfaW5mby5jYXIpIHtcbiAgICAgICAgSW5kZW50Q2FyU3ZjXG4gICAgICAgICAgLnVwZGF0ZSh7XG4gICAgICAgICAgICBvcmRlcl9pZDogaW5kZW50X2luZm8uaWQsXG4gICAgICAgICAgICBjYXJfaWQ6IGluZGVudF9pbmZvLmNhci5pZFxuICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgIGJyYW5kOiB2bS5icmFuZC52YWx1ZSxcbiAgICAgICAgICAgIHNlcmllczogdm0uYnJhbmQudmFsdWUsXG4gICAgICAgICAgICBtb2RlbDogdm0ubW9kZWwudmFsdWVcbiAgICAgICAgICB9KVxuICAgICAgICAgIC4kcHJvbWlzZVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgdG9hc3RyLnN1Y2Nlc3MocmVzLm1zZyB8fCAn57yW6L6R6L2m6L6G5L+h5oGv5L+d5a2Y5oiQ5YqfJyk7XG5cbiAgICAgICAgICAgICRtb2RhbEluc3RhbmNlLmNsb3NlKCk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICB0b2FzdHIuZXJyb3IocmVzLm1zZyB8fCAn57yW6L6R6L2m6L6G5L+h5oGv5L+d5a2Y5aSx6LSlJyk7XG4gICAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBJbmRlbnRDYXJzU3ZjXG4gICAgICAgICAgLnNhdmUoe1xuICAgICAgICAgICAgb3JkZXJfaWQ6IGluZGVudF9pbmZvLmlkXG4gICAgICAgICAgfSwge1xuICAgICAgICAgICAgYnJhbmQ6IHZtLmJyYW5kLnZhbHVlLFxuICAgICAgICAgICAgc2VyaWVzOiB2bS5icmFuZC52YWx1ZSxcbiAgICAgICAgICAgIG1vZGVsOiB2bS5tb2RlbC52YWx1ZVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLiRwcm9taXNlXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICB0b2FzdHIuc3VjY2VzcyhyZXMubXNnIHx8ICfliqDovabkv6Hmga/kv53lrZjmiJDlip8nKTtcblxuICAgICAgICAgICAgJG1vZGFsSW5zdGFuY2UuY2xvc2UoKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5jYXRjaChmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgIHRvYXN0ci5lcnJvcihyZXMubXNnIHx8ICfliqDovabkv6Hmga/kv53lrZjlpLHotKUnKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZWxlY3RfaXRlbShsaXN0X25hbWUsIHZhbHVlKSB7XG4gICAgICB2bVtsaXN0X25hbWVdID0gSW5kZW50RW51bXMuaXRlbTR0ZXh0KGxpc3RfbmFtZSwgdmFsdWUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNhbmNlbCgpIHtcbiAgICAgICRtb2RhbEluc3RhbmNlLmRpc21pc3MoKTtcbiAgICB9XG4gIH0pO1xuXG4iLCJhbmd1bGFyXG4gIC5tb2R1bGUoJ2d1bHUubG9naW4nKVxuICBcbiAgLmNvbnRyb2xsZXIoJ0xvZ2luQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsICRxLCAkbG9jYXRpb24sICR0aW1lb3V0LCB0b2FzdHIsIExvZ2luU3ZjLCBPQXV0aCkge1xuICAgIHZhciB2bSA9ICRzY29wZTtcblxuICAgIHZtLmxvZ2luID0gbG9naW47XG5cbiAgICBmdW5jdGlvbiBsb2dpbigpIHtcbiAgICAgIHJldHVybiBMb2dpblN2Y1xuICAgICAgICAuc2F2ZShhbmd1bGFyLmV4dGVuZChPQXV0aC5jb25mKCksIHtcbiAgICAgICAgICB1c2VybmFtZTogdm0uam9iX25vLFxuICAgICAgICAgIHBhc3N3b3JkOiB2bS5wYXNzd29yZFxuICAgICAgICB9KSlcbiAgICAgICAgLiRwcm9taXNlXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIE9BdXRoLmxvY2FsKHJlcy50b0pTT04oKSk7XG5cbiAgICAgICAgICB0b2FzdHIuc3VjY2VzcyhyZXMubXNnIHx8ICfnmbvlvZXmiJDlip/vvIzmraPlnKjkuLrkvaDot7PovawuLi4nKTtcblxuICAgICAgICAgIHZhciBxcyA9ICRsb2NhdGlvbi5zZWFyY2goKTtcbiAgICAgICAgICAkbG9jYXRpb24udXJsKHFzLnJlZGlyZWN0IHx8ICcvaW5kZW50cycpO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgdG9hc3RyLmVycm9yKHJlcy5tc2cgfHwgJ+eZu+W9leWksei0pe+8jOivt+mHjeivlScpO1xuICAgICAgICB9KTtcbiAgICB9XG4gIH0pOyIsImFuZ3VsYXJcbiAgLm1vZHVsZSgnZ3VsdS5sb2dpbi5zdmNzJywgWyduZ1Jlc291cmNlJ10pXG4gIC5zZXJ2aWNlKCdMb2dpblN2YycsIGZ1bmN0aW9uICgkcmVzb3VyY2UpIHtcbiAgICByZXR1cm4gJHJlc291cmNlKEFQSV9TRVJWRVJTLnRlc3RlciArICcvb2F1dGgyL3Rva2VuJywgbnVsbCwge1xuICAgICAgc2F2ZToge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDtjaGFyc2V0PXV0Zi04J1xuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgdHJhbnNmb3JtUmVxdWVzdDogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIHZhciBzdHIgPSBbXTtcbiAgICAgICAgICBcbiAgICAgICAgICBhbmd1bGFyLmZvckVhY2goZGF0YSwgZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgICAgICAgICAgdGhpcy5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChrZXkpICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKSk7XG4gICAgICAgICAgfSwgc3RyKTtcblxuICAgICAgICAgIHJldHVybiBzdHIuam9pbignJicpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH0pIiwiYW5ndWxhclxuICAubW9kdWxlKCdndWx1LnJlcG9ydCcpXG5cbiAgLmZhY3RvcnkoJ1JlcG9ydElucHV0ZXInLCBmdW5jdGlvbigkbG9nLCAkc3RhdGVQYXJhbXMsICRpbnRlcnZhbCwgVk0sIGxvY2FsU3RvcmFnZVNlcnZpY2UpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24odm0sIGZpZWxkcywgcmVwb3J0X3R5cGUpIHtcbiAgICAgIHZhciBpbmRlbnRfaWQgPSAkc3RhdGVQYXJhbXMuaW5kZW50X2lkO1xuICAgICAgdmFyIGNhcl9pZCA9ICRzdGF0ZVBhcmFtcy5jYXJfaWQ7XG5cbiAgICAgIHZhciBzdG9yZV9rZXkgPSBbaW5kZW50X2lkLCBjYXJfaWRdLmpvaW4oJ18nKTtcblxuICAgICAgdmFyIGluaXRfZGF0YSA9IGxvY2FsU3RvcmFnZVNlcnZpY2UuZ2V0KHN0b3JlX2tleSk7XG4gICAgICAvLyDorr7nva7liJ3lp4vljJblgLxcbiAgICAgIGFuZ3VsYXIuZXh0ZW5kKHZtLCBpbml0X2RhdGEgJiYgaW5pdF9kYXRhW3JlcG9ydF90eXBlXSB8fCB7fSk7XG5cbiAgICAgIC8vIOS/neWtmOWIsCBsb2NhbFN0b3JhZ2VcbiAgICAgIGZ1bmN0aW9uIHNhdmUoKSB7XG4gICAgICAgIHZhciBkYXRhID0gbG9jYWxTdG9yYWdlU2VydmljZS5nZXQoc3RvcmVfa2V5KSB8fCB7fTtcbiAgICAgICAgZGF0YVtyZXBvcnRfdHlwZV0gPSBWTS50b19qc29uKHZtLCBmaWVsZHMpO1xuXG4gICAgICAgIGxvY2FsU3RvcmFnZVNlcnZpY2Uuc2V0KHN0b3JlX2tleSwgZGF0YSk7XG5cbiAgICAgICAgJGxvZy5sb2coJ+W9leWFpeajgOa1i+aKpeWRiiAtICcgKyBzdG9yZV9rZXksIGRhdGFbcmVwb3J0X3R5cGVdKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHRpbWVyID0gJGludGVydmFsKHNhdmUsIDMwMDApO1xuXG4gICAgICAvLyDliIfmjaLpobXpnaLml7bvvIzlj5bmtojoh6rliqjkv53lrZgo5riF6Zmk5a6a5pe25ZmoKVxuICAgICAgdm0uJG9uKCckbG9jYXRpb25DaGFuZ2VTdGFydCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAkaW50ZXJ2YWwuY2FuY2VsKHRpbWVyKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG5cbiIsIi8qIGdsb2JhbCBhbmd1bGFyLCBDYW1lcmEsIF8sIEZ1bGxTY3JlZW5JbWFnZSovXG5hbmd1bGFyXG4gIC5tb2R1bGUoJ2d1bHUucmVwb3J0JylcblxuICAuY29udHJvbGxlcignSW5wdXREYXNoYm9hcmRDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGVQYXJhbXMsICRsb2NhdGlvbiwgJHRlbXBsYXRlQ2FjaGUsIGxvY2FsU3RvcmFnZVNlcnZpY2UsIEtleU1ncikge1xuICAgIHZhciB2bSA9ICRzY29wZTtcblxuICAgIHZhciBpbmRlbnRfaWQgPSAkc3RhdGVQYXJhbXMuaW5kZW50X2lkO1xuICAgIHZhciBjYXJfaWQgPSAkc3RhdGVQYXJhbXMuY2FyX2lkO1xuICAgIHZhciByZXBvcnRfc3RhdHVzX2tleSA9IEtleU1nci5zdGF0dXMoaW5kZW50X2lkLCBjYXJfaWQpO1xuXG4gICAgdm0ucGFydHMgPSBKU09OLnBhcnNlKCR0ZW1wbGF0ZUNhY2hlLmdldCgncmVwb3J0L2kuanNvbicpKTtcbiAgICBcbiAgICAvLyDkuI3nlKjlsZXnpLrnhafniYdcbiAgICB2bS5waG90b19wYXJ0ID0gdm0ucGFydHMucG9wKCk7XG4gICAgXG4gICAgLy8g6buY6K6k5bGV5byAXG4gICAgdm0udGVzdF9zdGVwX25hdl9vcGVuID0gdHJ1ZTtcbiAgICB2bS50b2dnbGVfbmF2X29wZW4gPSB0b2dnbGVfbmF2X29wZW47XG4gICAgdm0uc3VibWl0X3ByZXZpZXcgPSBzdWJtaXRfcHJldmlldztcblxuICAgIGZ1bmN0aW9uIHRvZ2dsZV9uYXZfb3BlbigpIHtcbiAgICAgIHZtLnRlc3Rfc3RlcF9uYXZfb3BlbiA9ICF2bS50ZXN0X3N0ZXBfbmF2X29wZW47XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc3VibWl0X3ByZXZpZXcoKSB7XG4gICAgICAvLyDkuLTml7bmlrnmoYhcbiAgICAgIGxvY2FsU3RvcmFnZVNlcnZpY2Uuc2V0KHJlcG9ydF9zdGF0dXNfa2V5LCB7XG4gICAgICAgIHN1Ym1pdGVkOiB0cnVlXG4gICAgICB9KTtcblxuICAgICAgJGxvY2F0aW9uLnVybCgnL2luZGVudHMvdW50ZXN0ZWQnKTtcblxuICAgICAgLy8gVE9ET1xuICAgICAgLy8gMS4g6Lez6L2s5Yiw5oql5ZGK5bGV56S66aG16Z2iKOehruiupOaPkOS6pO+8jOWPr+i/lOWbnilcbiAgICAgIC8vIDIuIOWwhuiuvue9riByZXByb3Qgc3RhdHVzIHN1Ym1pdGVkIOenu+WIsOeCueWHu+ehruiupOaPkOS6pOWQjlxuICAgICAgLy8gMy4g56Gu6K6k5o+Q5Lqk5YiZ6Lez6L2s5Yiw5b2T5aSp5Lu75Yqh55WM6Z2iXG4gICAgfVxuICB9KVxuXG4gIC5jb250cm9sbGVyKCdQaG90b1JlcG9ydEVkaXRDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkbG9nLCAkc3RhdGVQYXJhbXMsICR0ZW1wbGF0ZUNhY2hlLCBsb2NhbFN0b3JhZ2VTZXJ2aWNlLCBLZXlNZ3IpIHtcbiAgICB2YXIgdm0gPSAkc2NvcGU7XG5cbiAgICB2YXIgb3JkZXJfaWQgPSAkc3RhdGVQYXJhbXMuaW5kZW50X2lkO1xuICAgIHZhciBjYXJfaWQgPSAkc3RhdGVQYXJhbXMuY2FyX2lkO1xuICAgIC8vIOihqOWNlemhueaVsOaNruWtmOWCqOWIsOacrOWcsOeahCBrZXkg55qE55Sf5oiQ6KeE5YiZXG4gICAgdmFyIHJlcG9ydF9rZXkgPSBLZXlNZ3IucmVwb3J0KG9yZGVyX2lkLCBjYXJfaWQpO1xuICAgIHZhciByZXBvcnRfZXJyX2tleSA9IEtleU1nci5lcnIocmVwb3J0X2tleSk7XG4gICAgdmFyIGluaXRfZGF0YSA9IGxvY2FsU3RvcmFnZVNlcnZpY2UuZ2V0KHJlcG9ydF9rZXkpO1xuXG4gICAgdmFyIHBhcnRfanNvbiA9IEpTT04ucGFyc2UoJHRlbXBsYXRlQ2FjaGUuZ2V0KCdyZXBvcnQvaS5qc29uJykpO1xuICAgIC8vIOeFp+eJh+euoeeQhum7mOiupOS4uuacgOWQjuS4gOmhuVxuICAgIHZhciBwYXJlbnRfcGFydCA9IHBhcnRfanNvbltwYXJ0X2pzb24ubGVuZ3RoIC0gMV07XG4gICAgdmFyIGN1cnJlbnRfcGFydCA9IHBhcmVudF9wYXJ0LmlkO1xuXG4gICAgLy8g5b2T5YmN6aG25bGC5YiG57G75pys6Lqr5Li05pe25a2Y5YKo56m66Ze0XG4gICAgdm0uZGF0YSA9IHt9O1xuICAgIC8vIOe7meW9k+WJjemhtuWxguWIhuexu+eUs+ivtyBsb2NhbCBzdG9yYWdlIOWtmOWCqOepuumXtFxuICAgIGluaXRfZGF0YVtjdXJyZW50X3BhcnRdID0gaW5pdF9kYXRhW2N1cnJlbnRfcGFydF0gfHwge307XG4gICAgLy8g5bCG5Lul5YmN5L+d5a2Y55qE57uT5p6c5Y+W5Ye677yM5bm25YaZ5YWl5Li05pe25a2Y5YKo56m66Ze0XG4gICAgYW5ndWxhci5leHRlbmQodm0uZGF0YSwgaW5pdF9kYXRhW2N1cnJlbnRfcGFydF0pO1xuICAgIC8vIOW9k+WJjeeahOS6jOe6p+WIhuexu1xuICAgIHZtLnBhcnRzID0gcGFyZW50X3BhcnQuY2hpbGRyZW47XG5cbiAgICBpZiAodm0ucGFydHMgJiYgdm0ucGFydHMubGVuZ3RoKSB7XG4gICAgICAvLyDorr7nva7nrKzkuIDmnaHpu5jorqTlsZXlvIBcbiAgICAgIHZtLnBhcnRzWzBdLmlzX29wZW4gPSB0cnVlO1xuXG4gICAgICAvLyDliJ3lp4vljJbmi43nhafpobksIOiuvue9ruaLjeeFp+mhueS4uuacrOWcsOeFp+eJh+aIlm51bGxcbiAgICAgIHZtLnBhcnRzLmZvckVhY2goZnVuY3Rpb24ocGFydCkge1xuICAgICAgICBwYXJ0LmltYWdlLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgIHZtLmRhdGFbaXRlbS5pZF0gPSB2bS5kYXRhW2l0ZW0uaWRdIHx8IHsgaW1hZ2U6IG51bGwgfTtcbiAgICAgICAgfSk7XG4gICAgICB9KTsgIFxuICAgIH1cblxuICAgIC8vIOWFtuS7liBwYXJ0IOS4tOaXtuWtmOWCqOepuumXtFxuICAgIHZtLmRhdGFfb3RoZXIgPSB7fTtcbiAgICAvLyDlhbbku5YgcGFydCDku6XliY3kv53lrZjlnKjmnKzlnLDnmoTmlbDmja5cbiAgICB2YXIgcGhvdG9fb2ZfZ3JvdXAgPSBsb2NhbFN0b3JhZ2VTZXJ2aWNlLmdldChyZXBvcnRfZXJyX2tleSk7XG4gICAgLy8g5qC85byP5YyW5Lul5YmN5L+d5a2Y5Zyo5pys5Zyw55qE5YW25LuWIHBhcnQg5pWw5o2u77yM5pa55L6/5bGV56S6XG4gICAgdm0ucGFydF9waG90b3MgPSBfLm1hcChwaG90b19vZl9ncm91cCwgZnVuY3Rpb24oaXRlbSwga2V5KSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBpZDoga2V5LFxuICAgICAgICBuYW1lOiBnZXRfcGFydF9uYW1lKGtleSksXG4gICAgICAgIHBob3RvczogaXRlbVxuICAgICAgfTtcbiAgICB9KTtcbiAgICAvLyDlsIbku6XliY3kv53lrZjlnKjmnKzlnLDnmoTnu5Pmnpzlj5blh7rvvIzlubblhpnlhaXkuLTml7blrZjlgqjnqbrpl7RcbiAgICBfKHBob3RvX29mX2dyb3VwKS52YWx1ZXMoKS5mbGF0dGVuKCkuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICB2bS5kYXRhX290aGVyW2l0ZW0uaWRdID0gaXRlbTtcbiAgICB9KTtcbiAgICAvLyDmoLnmja7pobblsYLliIbnsbsgaWQg5p+l5om+IOmhtuWxguWIhuexu+eahCBuYW1lXG4gICAgZnVuY3Rpb24gZ2V0X3BhcnRfbmFtZShwYXJ0X2lkKSB7XG4gICAgICByZXR1cm4gcGFydF9qc29uLmZpbmQoZnVuY3Rpb24ocGFydCkge1xuICAgICAgICByZXR1cm4gcGFydC5pZCA9PSBwYXJ0X2lkO1xuICAgICAgfSkubmFtZTtcbiAgICB9XG5cbiAgICAvLyDmi43nhafmk43kvZxcbiAgICB2bS50YWtlX3Bob3RvID0gdGFrZV9waG90bztcbiAgICAvLyBjYXRlZ29yeSDljLrliIbmmK/lvZPliY3pobblsYLliIbnsbvlrZDpobnnmoTmi43nhafkuI7lhbbku5bpobblsYLliIbnsbvlrZDpobnnmoTmi43nhadcbiAgICAvLyBzZWxmOiDlvZPliY3pobblsYLliIbnsbvnmoTlrZDpoblcbiAgICAvLyBvdGhlcjog5YW25LuW6aG25bGC5YiG57G755qE5a2Q6aG5XG4gICAgZnVuY3Rpb24gdGFrZV9waG90byhjYXRlZ29yeSwgcGFydCwgaXRlbSkge1xuICAgICAgbmF2aWdhdG9yLmNhbWVyYS5nZXRQaWN0dXJlKHRha2VfcGhvdG9fc3VjY2VzcywgdGFrZV9waG90b19lcnJvciwge1xuICAgICAgICBxdWFsaXR5IDogMTAwLFxuICAgICAgICBkZXN0aW5hdGlvblR5cGUgOiBDYW1lcmEuRGVzdGluYXRpb25UeXBlLkZJTEVfVVJJLFxuICAgICAgICBzb3VyY2VUeXBlIDogQ2FtZXJhLlBpY3R1cmVTb3VyY2VUeXBlLkNBTUVSQSxcbiAgICAgICAgYWxsb3dFZGl0IDogdHJ1ZSxcbiAgICAgICAgZW5jb2RpbmdUeXBlOiBDYW1lcmEuRW5jb2RpbmdUeXBlLlBORyxcbiAgICAgICAgLy8gdGFyZ2V0V2lkdGg6IDEwMCxcbiAgICAgICAgLy8gdGFyZ2V0SGVpZ2h0OiAxMDAsXG4gICAgICAgIHNhdmVUb1Bob3RvQWxidW06IGZhbHNlXG4gICAgICB9KTtcblxuICAgICAgZnVuY3Rpb24gdGFrZV9waG90b19zdWNjZXNzKGltZ3VybCkge1xuICAgICAgICAvLyDlvZPliY3pobblsYLliIbnsbvmi43nhadcbiAgICAgICAgaWYgKGNhdGVnb3J5ID09PSAnc2VsZicpIHtcbiAgICAgICAgICB2bS5kYXRhW2l0ZW0uaWRdLmltYWdlID0gaW1ndXJsO1xuXG4gICAgICAgICAgLy8g5Li05pe25a2Y5YKo5pWw5o2u5pys5Zyw5YyW5YiwIGxvY2Fsc3RvcmFnZVxuICAgICAgICAgIC8vIOaWueS+v+S4i+asoei/m+WFpSBhcHAg5bGV56S6XG4gICAgICAgICAgaW5pdF9kYXRhW2N1cnJlbnRfcGFydF0gPSB2bS5kYXRhO1xuICAgICAgICB9IGVsc2UgaWYgKGNhdGVnb3J5ID09PSAnb3RoZXInKSB7XG4gICAgICAgICAgLy8g5YW25LuW6aG25bGC5YiG57G75ouN54WnXG4gICAgICAgICAgdm0uZGF0YV9vdGhlcltpdGVtLmlkXS5pbWFnZSA9IGltZ3VybDtcblxuICAgICAgICAgIC8vIOi/memHjOeahCBwYXJ0IOaYr+mhtuWxguWIhuexu1xuICAgICAgICAgIHZhciBleGlzdHNfaXRlbSA9IHBob3RvX29mX2dyb3VwW3BhcnQuaWRdLmZpbmQoZnVuY3Rpb24oX2l0ZW0pIHtcbiAgICAgICAgICAgIHJldHVybiBfaXRlbS5pZCA9PT0gaXRlbS5pZDtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vIOacrOWcsOWMluWIsOeFp+eJh+aAu+iniCBsb2NhbHN0b3JhZ2VcbiAgICAgICAgICBleGlzdHNfaXRlbS5pbWFnZSA9IGltZ3VybDtcbiAgICAgICAgICBsb2NhbFN0b3JhZ2VTZXJ2aWNlLnNldChyZXBvcnRfZXJyX2tleSwgcGhvdG9fb2ZfZ3JvdXApO1xuICAgICAgICAgIFxuICAgICAgICAgIC8vIOacrOWcsOWMluWIsOaKpeWRiiBsb2NhbHN0b3JhZ2VcbiAgICAgICAgICBpbml0X2RhdGFbcGFydC5pZF1bZXhpc3RzX2l0ZW0uaWRdLmltYWdlID0gaW1ndXJsO1xuICAgICAgICB9XG5cbiAgICAgICAgbG9jYWxTdG9yYWdlU2VydmljZS5zZXQocmVwb3J0X2tleSwgaW5pdF9kYXRhKTtcbiAgICAgICAgLy8g5omL5Yqo6Kem5Y+R6aG16Z2i5riy5p+TXG4gICAgICAgIHZtLiRhcHBseSgpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiB0YWtlX3Bob3RvX2Vycm9yKCkge1xuICAgICAgICAkbG9nLmVycm9yKCfmi43nhaflpLHotKUsIOWIhuexuyAtICcgKyBwYXJ0Lm5hbWUgKyAnLCDpobkgLSAnICsgaXRlbS5uYW1lKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2bS5zaG93X3Bob3RvID0gc2hvd19waG90bztcbiAgICBmdW5jdGlvbiBzaG93X3Bob3RvKGNhdGVnb3J5LCBmaWVsZCkge1xuICAgICAgdmFyIGltYWdlID0gdm1bY2F0ZWdvcnkgPT09ICdzZWxmJyA/ICdkYXRhJyA6ICdkYXRhX290aGVyJ11bZmllbGQuaWRdLmltYWdlO1xuICAgICAgXG4gICAgICBpZiAoIWltYWdlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgRnVsbFNjcmVlbkltYWdlLnNob3dJbWFnZVVSTChpbWFnZSk7XG4gICAgfVxuICB9KVxuXG4gIC5jb250cm9sbGVyKCdSZXBvcnRFZGl0Q3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJGxvZywgJHN0YXRlUGFyYW1zLCAkdGVtcGxhdGVDYWNoZSwgJG1vZGFsLCBsb2NhbFN0b3JhZ2VTZXJ2aWNlLCBLZXlNZ3IpIHtcbiAgICB2YXIgdm0gPSAkc2NvcGU7XG5cbiAgICB2YXIgY3VycmVudF9wYXJ0ID0gcGFyc2VJbnQoJHN0YXRlUGFyYW1zLnBhcnRfaWQpO1xuICAgIHZhciBvcmRlcl9pZCA9ICRzdGF0ZVBhcmFtcy5pbmRlbnRfaWQ7XG4gICAgdmFyIGNhcl9pZCA9ICRzdGF0ZVBhcmFtcy5jYXJfaWQ7XG5cbiAgICAvLyDooajljZXpobnmlbDmja7lrZjlgqjliLDmnKzlnLDnmoQga2V5IOeahOeUn+aIkOinhOWImVxuICAgIHZhciByZXBvcnRfa2V5ID0gS2V5TWdyLnJlcG9ydChvcmRlcl9pZCwgY2FyX2lkKTtcbiAgICB2YXIgcmVwb3J0X2Vycl9rZXkgPSBLZXlNZ3IuZXJyKHJlcG9ydF9rZXkpO1xuICAgIHZhciBpbml0X2RhdGEgPSBsb2NhbFN0b3JhZ2VTZXJ2aWNlLmdldChyZXBvcnRfa2V5KTtcblxuICAgIC8vIOiOt+WPluaKpeWRiui+k+WFpemhueaVsOaNrlxuICAgIHZhciBwYXJlbnRfcGFydCA9IFxuICAgIEpTT05cbiAgICAgIC5wYXJzZSgkdGVtcGxhdGVDYWNoZS5nZXQoJ3JlcG9ydC9pLmpzb24nKSlcbiAgICAgIC5maW5kKGZ1bmN0aW9uKHBhcnQpIHtcbiAgICAgICAgcmV0dXJuIHBhcnQuaWQgPT09IGN1cnJlbnRfcGFydDtcbiAgICAgIH0pO1xuICAgIHZtLnBhcnRzID0gcGFyZW50X3BhcnQgJiYgcGFyZW50X3BhcnQuY2hpbGRyZW47XG5cbiAgICAvLyDnrKzkuIDmnaHpu5jorqTlsZXlvIBcbiAgICBpZiAodm0ucGFydHMgJiYgdm0ucGFydHMubGVuZ3RoKSB7XG4gICAgICB2bS5wYXJ0c1swXS5pc19vcGVuID0gdHJ1ZTtcbiAgICB9XG5cbiAgICB2bS5kYXRhID0ge307XG5cbiAgICAvLyDorr7nva7liJ3lp4vljJblgLxcbiAgICBhbmd1bGFyLmV4dGVuZCh2bS5kYXRhLCBpbml0X2RhdGEgJiYgaW5pdF9kYXRhW2N1cnJlbnRfcGFydF0gfHwge30pO1xuXG4gICAgdm0ucGFydHMuZm9yRWFjaChmdW5jdGlvbihwYXJ0KSB7XG4gICAgICBpZiAocGFydC5yYWRpb193aXRoX3N0YXR1c19kZWdyZWVzICYmIHBhcnQucmFkaW9fd2l0aF9zdGF0dXNfZGVncmVlcy5sZW5ndGgpIHtcbiAgICAgICAgcGFydC5yYWRpb193aXRoX3N0YXR1c19kZWdyZWVzLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgIHZtLmRhdGFbaXRlbS5pZF0gPSB2bS5kYXRhW2l0ZW0uaWRdIHx8IHt9O1xuXG4gICAgICAgICAgaWYgKHZtLmRhdGFbaXRlbS5pZF0ucmVzdWx0ID09IG51bGwpIHtcbiAgICAgICAgICAgIHZtLmRhdGFbaXRlbS5pZF0ucmVzdWx0ID0gXCIxXCI7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIGRhdGEg5pS55Y+Y5YiZ5bCG5YW25L+d5a2Y5YiwIGxvY2FsIHN0b3JhZ2VcbiAgICB2bS4kd2F0Y2goJ2RhdGEnLCBmdW5jdGlvbih2KSB7XG4gICAgICAkbG9nLmxvZygnZm9ybSBkYXRhOiAnLCBKU09OLnN0cmluZ2lmeSh2KSk7XG5cbiAgICAgIHNhdmUoKTtcblxuICAgICAgc2F2ZV9lcnIoKTtcbiAgICB9LCB0cnVlKTtcblxuICAgIFxuICAgIC8vIOS/neWtmOWIsCBsb2NhbFN0b3JhZ2VcbiAgICAvLyDmlbDmja7moLzlvI/kuLrvvJpcbiAgICAvLyB7XG4gICAgLy8gICBcInIxXCI6IHtcbiAgICAvLyAgICAgXCJyZXN1bHRcIjogMSxcbiAgICAvLyAgICAgXCJzdGF0ZVwiOiAxLFxuICAgIC8vICAgICBcImRlZ3JlZVwiOiAxLFxuICAgIC8vICAgICBcIm1lbW9cIjogXCJ4eHhcIixcbiAgICAvLyAgICAgXCJpbWFnZVwiOiBcIlwiXG4gICAgLy8gICB9XG4gICAgLy8gfVxuICAgIGZ1bmN0aW9uIHNhdmUoKSB7XG4gICAgICB2YXIgZGF0YSA9IGxvY2FsU3RvcmFnZVNlcnZpY2UuZ2V0KHJlcG9ydF9rZXkpIHx8IHt9O1xuICAgICAgZGF0YVtjdXJyZW50X3BhcnRdID0gdm0uZGF0YTtcblxuICAgICAgbG9jYWxTdG9yYWdlU2VydmljZS5zZXQocmVwb3J0X2tleSwgZGF0YSk7XG5cbiAgICAgICRsb2cubG9nKCflvZXlhaXmo4DmtYvmiqXlkYogLSAnICsgcmVwb3J0X2tleSwgZGF0YVtjdXJyZW50X3BhcnRdKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzYXZlX2VycigpIHtcbiAgICAgIHZhciBkYXRhID0gbG9jYWxTdG9yYWdlU2VydmljZS5nZXQocmVwb3J0X2Vycl9rZXkpIHx8IHt9O1xuICAgICAgdmFyIGVycl9pdGVtcyA9IFtdO1xuXG4gICAgICAvLyDnrZvpgInlh7rnvLrpmbfnmoTpobnvvIzmiJbpnIDopoHmi43nhafnmoTpoblcbiAgICAgIF8uZWFjaCh2bS5kYXRhLCBmdW5jdGlvbihpdGVtLCBrZXkpIHtcbiAgICAgICAgaWYgKGl0ZW0uaW1hZ2UpIHtcbiAgICAgICAgICBpdGVtLmlkID0ga2V5O1xuICAgICAgICAgIGVycl9pdGVtcy5wdXNoKGl0ZW0pO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8g5aaC5p6c6K+lIHBhcnQg5rKh5pyJ5ouN54WnXG4gICAgICBpZiAoIWVycl9pdGVtcy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgXG4gICAgICBkYXRhW2N1cnJlbnRfcGFydF0gPSBlcnJfaXRlbXM7XG5cbiAgICAgIGxvY2FsU3RvcmFnZVNlcnZpY2Uuc2V0KHJlcG9ydF9lcnJfa2V5LCBkYXRhKTtcblxuICAgICAgJGxvZy5sb2coJ+W9leWFpeajgOa1i+aKpeWRiumXrumimOmhuSAtICcgKyByZXBvcnRfZXJyX2tleSwgZGF0YVtjdXJyZW50X3BhcnRdKTtcbiAgICB9XG5cbiAgICB2bS5zaG93X2RldGFpbCA9IHNob3dfZGV0YWlsO1xuICAgIHZtLnNob3VsZF9jbGVhciA9IHNob3VsZF9jbGVhcjtcbiAgICB2bS50YWtlX3Bob3RvID0gdGFrZV9waG90bztcbiAgICB2bS5vcGVuX2RhdGVwaWNrZXIgPSBvcGVuX2RhdGVwaWNrZXI7XG4gICAgdm0uc2hvd190YWtlX3Bob3RvID0gc2hvd190YWtlX3Bob3RvO1xuICAgIHZtLnNob3dfcGhvdG8gPSBzaG93X3Bob3RvO1xuXG4gICAgLy8g6YG/5YWN5bGV56S65Lik5qyhIG1vZGFsXG4gICAgZnVuY3Rpb24gc2hvd19kZXRhaWwoaW5kZXgsIHBhcnQsIGNoZWNrX2l0ZW0pIHtcbiAgICAgIC8vIGNoYW5nZSDkuovku7blj5HnlJ/lnKggY2xpY2sg5LmL5ZCOXG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyDlhbbku5bpgInpobnkuI3lupTor6XlvLnlh7pcbiAgICAgICAgaWYgKHNob3dfZGV0YWlsLmlzX3Nob3cgfHwgcGFyc2VJbnQodm0uZGF0YVtjaGVja19pdGVtLmlkXS5yZXN1bHQpICE9PSAyKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgc2hvd19kZXRhaWwuaXNfc2hvdyA9IHRydWU7XG5cbiAgICAgICAgdmFyIGlucHV0X2RldGFpbF9pbnMgPSAkbW9kYWwub3Blbih7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICdyZXBvcnQvaW5wdXRfZGV0YWlsLmh0bScsXG4gICAgICAgICAgY29udHJvbGxlcjogJ0l0ZW1JbnB1dERldGFpbEN0cmwnLFxuICAgICAgICAgIGJhY2tkcm9wOiAnc3RhdGljJyxcbiAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICBpdGVtX2RldGFpbDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBhbmd1bGFyLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgcGFydF9uYW1lOiBwYXJ0Lm5hbWUsXG4gICAgICAgICAgICAgICAgcGFydF9hbGlhczogcGFydC5hc3BlY3QsXG4gICAgICAgICAgICAgICAgaW5kZXg6IGluZGV4XG4gICAgICAgICAgICAgIH0sIGNoZWNrX2l0ZW0sIHZtLmRhdGFbY2hlY2tfaXRlbS5pZF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaW5wdXRfZGV0YWlsX2lucy5yZXN1bHQudGhlbihmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgYW5ndWxhci5leHRlbmQodm0uZGF0YVtjaGVja19pdGVtLmlkXSwgaXRlbSwge1xuICAgICAgICAgICAgbmFtZTogY2hlY2tfaXRlbS5uYW1lXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBzaG93X2RldGFpbC5pc19zaG93ID0gZmFsc2U7XG4gICAgICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHNob3dfZGV0YWlsLmlzX3Nob3cgPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBzaG93X2RldGFpbC5pc19zaG93ID0gZmFsc2U7XG5cbiAgICBmdW5jdGlvbiBzaG91bGRfY2xlYXIoaXRlbSkge1xuICAgICAgLy8g6Iul5qOA5rWL5peg6Zeu6aKY77yM5YiZ5riF6Zmk5LmL5YmN5aGr5YaZ55qE5o2f5Lyk5pWw5o2uXG4gICAgICB2YXIgciA9IHBhcnNlSW50KHZtLmRhdGFbaXRlbS5pZF0ucmVzdWx0KTtcbiAgICAgIGlmIChyICE9PSAyIHx8IHIgIT09IDUpIHtcbiAgICAgICAgYW5ndWxhci5leHRlbmQodm0uZGF0YVtpdGVtLmlkXSwge1xuICAgICAgICAgIHN0YXRlOiBudWxsLFxuICAgICAgICAgIGRlZ3JlZTogbnVsbCxcbiAgICAgICAgICBtZW1vOiBudWxsLFxuICAgICAgICAgIGltYWdlOiBudWxsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFRPRE9cbiAgICAvLyDlm77niYfpooTop4hcbiAgICBmdW5jdGlvbiBzaG93X3Bob3RvKGZpZWxkKSB7XG4gICAgICBGdWxsU2NyZWVuSW1hZ2Uuc2hvd0ltYWdlVVJMKHZtLmRhdGFbZmllbGQuaWRdLmltYWdlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0YWtlX3Bob3RvKHBhcnQsIGl0ZW0pIHtcbiAgICAgIG5hdmlnYXRvci5jYW1lcmEuZ2V0UGljdHVyZSh0YWtlX3Bob3RvX3N1Y2Nlc3MsIHRha2VfcGhvdG9fZXJyb3IsIHtcbiAgICAgICAgcXVhbGl0eSA6IDEwMCxcbiAgICAgICAgZGVzdGluYXRpb25UeXBlIDogQ2FtZXJhLkRlc3RpbmF0aW9uVHlwZS5GSUxFX1VSSSxcbiAgICAgICAgc291cmNlVHlwZSA6IENhbWVyYS5QaWN0dXJlU291cmNlVHlwZS5DQU1FUkEsXG4gICAgICAgIGFsbG93RWRpdCA6IHRydWUsXG4gICAgICAgIGVuY29kaW5nVHlwZTogQ2FtZXJhLkVuY29kaW5nVHlwZS5QTkcsXG4gICAgICAgIC8vIHRhcmdldFdpZHRoOiAxMDAsXG4gICAgICAgIC8vIHRhcmdldEhlaWdodDogMTAwLFxuICAgICAgICBzYXZlVG9QaG90b0FsYnVtOiBmYWxzZVxuICAgICAgfSk7XG5cbiAgICAgIGZ1bmN0aW9uIHRha2VfcGhvdG9fc3VjY2VzcyhpbWd1cmwpIHtcbiAgICAgICAgdm0uZGF0YVtpdGVtLmlkXSA9IGFuZ3VsYXIuZXh0ZW5kKHZtLmRhdGFbaXRlbS5pZF0gfHwge30sIHtcbiAgICAgICAgICBpbWFnZTogaW1ndXJsLFxuICAgICAgICAgIG5hbWU6IGl0ZW0ubmFtZVxuICAgICAgICB9KTtcblxuICAgICAgICB2bS4kYXBwbHkoKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gdGFrZV9waG90b19lcnJvcigpIHtcbiAgICAgICAgJGxvZy5lcnJvcign5ouN54Wn5aSx6LSlLCDliIbnsbsgLSAnICsgcGFydC5uYW1lICsgJywg6aG5IC0gJyArIGl0ZW0ubmFtZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8g5pel5pyf5o6n5Lu25pi+56S6L+makOiXjy/npoHnlKhcbiAgICB2bS5kcF9wYXJhbXMgPSB7XG4gICAgICBzaG93V2Vla3M6IGZhbHNlXG4gICAgfTtcbiAgICBmdW5jdGlvbiBvcGVuX2RhdGVwaWNrZXIoJGV2ZW50LCBkcCkge1xuICAgICAgJGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgIHZtLmRwX3BhcmFtc1tkcF0gPSB0cnVlO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBzaG93X3Rha2VfcGhvdG8oaW5kZXgsIHBhcnQsIGNoZWNrX2l0ZW0pIHtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChzaG93X3Rha2VfcGhvdG8uaXNfc2hvdyB8fCBwYXJzZUludCh2bS5kYXRhW2NoZWNrX2l0ZW0uaWRdLnJlc3VsdCkgIT09IDUpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBzaG93X3Rha2VfcGhvdG8uaXNfc2hvdyA9IHRydWU7XG5cbiAgICAgICAgdmFyIHRha2VfcGhvdG9fbW9kYWwgPSAkbW9kYWwub3Blbih7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICdyZXBvcnQvdGFrZV9waG90b19tb2RhbC5odG0nLFxuICAgICAgICAgIGNvbnRyb2xsZXI6ICdJdGVtVGFrZVBob3RvQ3RybCcsXG4gICAgICAgICAgYmFja2Ryb3A6ICdzdGF0aWMnLFxuICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgIGl0ZW1fZGV0YWlsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGFuZ3VsYXIuZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICBwYXJ0X25hbWU6IHBhcnQubmFtZSxcbiAgICAgICAgICAgICAgICBwYXJ0X2FsaWFzOiBwYXJ0LmFzcGVjdCxcbiAgICAgICAgICAgICAgICBpbmRleDogaW5kZXhcbiAgICAgICAgICAgICAgfSwgY2hlY2tfaXRlbSwgdm0uZGF0YVtjaGVja19pdGVtLmlkXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0YWtlX3Bob3RvX21vZGFsLnJlc3VsdC50aGVuKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICBhbmd1bGFyLmV4dGVuZCh2bS5kYXRhW2NoZWNrX2l0ZW0uaWRdLCBpdGVtLCB7XG4gICAgICAgICAgICBuYW1lOiBjaGVja19pdGVtLm5hbWVcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHNob3dfdGFrZV9waG90by5pc19zaG93ID0gZmFsc2U7XG4gICAgICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHNob3dfdGFrZV9waG90by5pc19zaG93ID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2hvd190YWtlX3Bob3RvLmlzX3Nob3cgPSBmYWxzZTtcbiAgfSlcblxuICAuY29udHJvbGxlcignSXRlbUlucHV0RGV0YWlsQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJGxvZywgJG1vZGFsSW5zdGFuY2UsIGl0ZW1fZGV0YWlsKSB7XG4gICAgdmFyIHZtID0gJHNjb3BlO1xuXG4gICAgYW5ndWxhci5leHRlbmQodm0sIGl0ZW1fZGV0YWlsKTtcblxuICAgIHZtLnN1Ym1pdCA9IHN1Ym1pdDtcbiAgICB2bS5jYW5jZWwgPSBjYW5jZWw7XG4gICAgdm0udGFrZV9waG90byA9IHRha2VfcGhvdG87XG4gICAgdm0uc2hvd19waG90byA9IHNob3dfcGhvdG87XG5cbiAgICBmdW5jdGlvbiBzdWJtaXQoKSB7XG4gICAgICAkbW9kYWxJbnN0YW5jZS5jbG9zZSh7XG4gICAgICAgIHN0YXRlOiB2bS5zdGF0ZSxcbiAgICAgICAgZGVncmVlOiB2bS5kZWdyZWUsXG4gICAgICAgIG1lbW86IHZtLm1lbW8sXG4gICAgICAgIGltYWdlOiB2bS5pbWFnZVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2FuY2VsKCkge1xuICAgICAgJG1vZGFsSW5zdGFuY2UuZGlzbWlzcygpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNob3dfcGhvdG8oaW1hZ2UpIHtcbiAgICAgIGlmICghaW1hZ2UpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBGdWxsU2NyZWVuSW1hZ2Uuc2hvd0ltYWdlVVJMKGltYWdlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0YWtlX3Bob3RvKCkge1xuICAgICAgbmF2aWdhdG9yLmNhbWVyYS5nZXRQaWN0dXJlKHRha2VfcGhvdG9fc3VjY2VzcywgdGFrZV9waG90b19lcnJvciwge1xuICAgICAgICBxdWFsaXR5IDogMTAwLFxuICAgICAgICBkZXN0aW5hdGlvblR5cGUgOiBDYW1lcmEuRGVzdGluYXRpb25UeXBlLkZJTEVfVVJJLFxuICAgICAgICBzb3VyY2VUeXBlIDogQ2FtZXJhLlBpY3R1cmVTb3VyY2VUeXBlLkNBTUVSQSxcbiAgICAgICAgYWxsb3dFZGl0IDogdHJ1ZSxcbiAgICAgICAgZW5jb2RpbmdUeXBlOiBDYW1lcmEuRW5jb2RpbmdUeXBlLlBORyxcbiAgICAgICAgLy8gdGFyZ2V0V2lkdGg6IDEwMCxcbiAgICAgICAgLy8gdGFyZ2V0SGVpZ2h0OiAxMDAsXG4gICAgICAgIHNhdmVUb1Bob3RvQWxidW06IGZhbHNlXG4gICAgICB9KTtcblxuICAgICAgZnVuY3Rpb24gdGFrZV9waG90b19zdWNjZXNzKGltZ3VybCkge1xuICAgICAgICB2bS5pbWFnZSA9IGltZ3VybDtcbiAgICAgICAgdm0uJGFwcGx5KCk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHRha2VfcGhvdG9fZXJyb3IoKSB7XG4gICAgICAgICRsb2cuZXJyb3IoJ+aLjeeFp+Wksei0pSwg5YiG57G7IC0gJyArIGl0ZW1fZGV0YWlsLnBhcnRfbmFtZSArICcsIOmhuSAtICcgKyBpdGVtX2RldGFpbC5uYW1lKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cbiAgLmNvbnRyb2xsZXIoJ0l0ZW1UYWtlUGhvdG9DdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkbG9nLCAkbW9kYWxJbnN0YW5jZSwgaXRlbV9kZXRhaWwpIHtcbiAgICAgIHZhciB2bSA9ICRzY29wZTtcblxuICAgICAgYW5ndWxhci5leHRlbmQodm0sIGl0ZW1fZGV0YWlsKTtcblxuICAgICAgdm0uc3VibWl0ID0gc3VibWl0O1xuICAgICAgdm0uY2FuY2VsID0gY2FuY2VsO1xuICAgICAgdm0udGFrZV9waG90byA9IHRha2VfcGhvdG87XG4gICAgICB2bS5zaG93X3Bob3RvID0gc2hvd19waG90bztcblxuICAgICAgZnVuY3Rpb24gc3VibWl0KCkge1xuICAgICAgICAkbW9kYWxJbnN0YW5jZS5jbG9zZSh7XG4gICAgICAgICAgaW1hZ2U6IHZtLmltYWdlXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBjYW5jZWwoKSB7XG4gICAgICAgICRtb2RhbEluc3RhbmNlLmRpc21pc3MoKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gc2hvd19waG90byhpbWFnZSkge1xuICAgICAgICBpZiAoIWltYWdlKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgRnVsbFNjcmVlbkltYWdlLnNob3dJbWFnZVVSTChpbWFnZSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHRha2VfcGhvdG8oKSB7XG4gICAgICAgIG5hdmlnYXRvci5jYW1lcmEuZ2V0UGljdHVyZSh0YWtlX3Bob3RvX3N1Y2Nlc3MsIHRha2VfcGhvdG9fZXJyb3IsIHtcbiAgICAgICAgICBxdWFsaXR5IDogMTAwLFxuICAgICAgICAgIGRlc3RpbmF0aW9uVHlwZSA6IENhbWVyYS5EZXN0aW5hdGlvblR5cGUuRklMRV9VUkksXG4gICAgICAgICAgc291cmNlVHlwZSA6IENhbWVyYS5QaWN0dXJlU291cmNlVHlwZS5DQU1FUkEsXG4gICAgICAgICAgYWxsb3dFZGl0IDogdHJ1ZSxcbiAgICAgICAgICBlbmNvZGluZ1R5cGU6IENhbWVyYS5FbmNvZGluZ1R5cGUuUE5HLFxuICAgICAgICAgIC8vIHRhcmdldFdpZHRoOiAxMDAsXG4gICAgICAgICAgLy8gdGFyZ2V0SGVpZ2h0OiAxMDAsXG4gICAgICAgICAgc2F2ZVRvUGhvdG9BbGJ1bTogZmFsc2VcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZnVuY3Rpb24gdGFrZV9waG90b19zdWNjZXNzKGltZ3VybCkge1xuICAgICAgICAgIHZtLmltYWdlID0gaW1ndXJsO1xuICAgICAgICAgIHZtLiRhcHBseSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gdGFrZV9waG90b19lcnJvcigpIHtcbiAgICAgICAgICAkbG9nLmVycm9yKCfmi43nhaflpLHotKUsIOWIhuexuyAtICcgKyBpdGVtX2RldGFpbC5wYXJ0X25hbWUgKyAnLCDpobkgLSAnICsgaXRlbV9kZXRhaWwubmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgfSlcblxuICAuY29udHJvbGxlcignUmVwb3J0TGlzdEN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRsb2NhdGlvbiwgUmVwb3J0c1N2YywgSW5kZW50RW51bXMsIHRvYXN0cikge1xuICAgIHZhciB2bSA9ICRzY29wZTtcbiAgICB2YXIgcXNvID0gJGxvY2F0aW9uLnNlYXJjaCgpO1xuXG4gICAgdm0ucGFnZSA9IHBhcnNlSW50KHFzby5wYWdlKSB8fCAxO1xuICAgIHZtLnNpemUgPSBwYXJzZUludChxc28uc2l6ZSkgfHwgMjA7XG4gICAgdm0uc2l6ZXMgPSBJbmRlbnRFbnVtcy5saXN0KCdzaXplJyk7XG4gICAgdm0uc2l6ZV9pdGVtID0gSW5kZW50RW51bXMuaXRlbSgnc2l6ZScsIHZtLnNpemUpO1xuXG4gICAgdm0uc2l6ZV9jaGFuZ2UgPSBzaXplX2NoYW5nZTtcbiAgICB2bS5wYWdlX2NoYW5nZSA9IHBhZ2VfY2hhbmdlO1xuXG4gICAgcXVlcnkoKTtcblxuICAgIGZ1bmN0aW9uIHF1ZXJ5KCkge1xuICAgICAgdmFyIHBhcmFtcyA9IHtcbiAgICAgICAgaXRlbXNfcGFnZTogdm0uc2l6ZSxcbiAgICAgICAgcGFnZTogdm0ucGFnZSxcbiAgICAgIH07XG4gICAgICBcbiAgICAgICRsb2NhdGlvbi5zZWFyY2gocGFyYW1zKTtcblxuICAgICAgUmVwb3J0c1N2Y1xuICAgICAgICAucXVlcnkocGFyYW1zKVxuICAgICAgICAuJHByb21pc2VcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocnMpIHtcbiAgICAgICAgICBycy5pdGVtcy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgIGl0ZW0uc3RhdHVzX3RleHQgPSBJbmRlbnRFbnVtcy50ZXh0KCdvcmRlcl9zdGF0dXMnLCBpdGVtLnN0YXR1c19pZCk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICB2bS5pdGVtcyA9IHJzLml0ZW1zO1xuICAgICAgICAgIHZtLnRvdGFsX2NvdW50ID0gcnMudG90YWxfY291bnQ7XG5cbiAgICAgICAgICB2YXIgdG1wID0gcnMudG90YWxfY291bnQgLyB2bS5zaXplO1xuICAgICAgICAgIHZtLnBhZ2VfY291bnQgPSBycy50b3RhbF9jb3VudCAlIHZtLnNpemUgPT09IDAgPyB0bXAgOiAoTWF0aC5mbG9vcih0bXApICsgMSk7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICB0b2FzdHIuZXJyb3IocmVzLm1zZyB8fCAn5p+l6K+i5aSx6LSl77yM5pyN5Yqh5Zmo5Y+R55Sf5pyq55+l6ZSZ6K+v77yM6K+36YeN6K+VJyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIOavj+mhteadoeaVsOaUueWPmFxuICAgIGZ1bmN0aW9uIHNpemVfY2hhbmdlKHNpemUpIHtcbiAgICAgIHZtLnNpemUgPSBzaXplO1xuICAgICAgdm0ucGFnZSA9IDE7XG5cbiAgICAgIHF1ZXJ5KCk7XG4gICAgfVxuXG4gICAgLy8g57+76aG1XG4gICAgZnVuY3Rpb24gcGFnZV9jaGFuZ2UocGFnZSkge1xuICAgICAgdm0ucGFnZSA9IHBhZ2U7XG5cbiAgICAgIHF1ZXJ5KCk7XG4gICAgfVxuICB9KTtcblxuXG5cblxuXG4iLCJhbmd1bGFyXG4gIC5tb2R1bGUoJ2d1bHUucmVwb3J0LnN2Y3MnLCBbJ25nUmVzb3VyY2UnXSlcblxuICAuc2VydmljZSgnUmVwb3J0c1N2YycsIGZ1bmN0aW9uKCRyZXNvdXJjZSkge1xuICAgIHJldHVybiAkcmVzb3VyY2UoQVBJX1NFUlZFUlMudGVzdGVyICsgJy9yZXBvcnRzJywge30sIHtcbiAgICAgIHF1ZXJ5OiB7XG4gICAgICAgIGlzQXJyYXk6IGZhbHNlXG4gICAgICB9XG4gICAgfSk7XG4gIH0pXG5cbiAgLnNlcnZpY2UoJ1JlcG9ydFN2YycsIGZ1bmN0aW9uKCRyZXNvdXJjZSkge1xuICAgIHJldHVybiAkcmVzb3VyY2UoQVBJX1NFUlZFUlMudGVzdGVyICsgJy9yZXBvcnQnKTtcbiAgfSk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
