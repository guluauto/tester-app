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
    function show_photo(field) {
      window.resolveLocalFileSystemURL(vm.data[field.id].image, function(fileEntry) {
        fileEntry.file(function(file) {
          var reader = new FileReader();
          reader.onloadend = function(evt) {
            FullScreenImage.showImageBase64(evt.target.result.replace('data:image/jpeg;base64,', ''));
          };
          reader.readAsDataURL(file);
        }, function() {
          $log.error('打开图片失败');
        })
      }, function() {
        $log.error('打开图片失败');
      });
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
      window.resolveLocalFileSystemURL(vm.data[field.id].image, function(fileEntry) {
        fileEntry.file(function(file) {
          var reader = new FileReader();
          reader.onloadend = function(evt) {
            FullScreenImage.showImageBase64(evt.target.result.replace('data:image/jpeg;base64,', ''));
          };
          reader.readAsDataURL(file);
        }, function() {
          $log.error('打开图片失败');
        })
      }, function() {
        $log.error('打开图片失败');
      });
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
      window.resolveLocalFileSystemURL(vm.data[field.id].image, function(fileEntry) {
        fileEntry.file(function(file) {
          var reader = new FileReader();
          reader.onloadend = function(evt) {
            FullScreenImage.showImageBase64(evt.target.result.replace('data:image/jpeg;base64,', ''));
          };
          reader.readAsDataURL(file);
        }, function() {
          $log.error('打开图片失败');
        })
      }, function() {
        $log.error('打开图片失败');
      });
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
        window.resolveLocalFileSystemURL(vm.data[field.id].image, function(fileEntry) {
          fileEntry.file(function(file) {
            var reader = new FileReader();
            reader.onloadend = function(evt) {
              FullScreenImage.showImageBase64(evt.target.result.replace('data:image/jpeg;base64,', ''));
            };
            reader.readAsDataURL(file);
          }, function() {
            $log.error('打开图片失败');
          })
        }, function() {
          $log.error('打开图片失败');
        });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImluZGVudC9pbmRlbnRfbW9kdWxlLmpzIiwibG9naW4vbG9naW5fbW9kdWxlLmpzIiwicmVwb3J0L3JlcG9ydF9tb2R1bGUuanMiLCJjb21wb25lbnQvY3VzdG9tLWRpcmVjdGl2ZS5qcyIsImNvbXBvbmVudC9jdXN0b20tZmlsdGVyLmpzIiwiY29tcG9uZW50L2RhdGUuanMiLCJjb21wb25lbnQvZW51bXMuanMiLCJjb21wb25lbnQvZmlsZXIuanMiLCJjb21wb25lbnQvaHR0cC5qcyIsImNvbXBvbmVudC9rZXltZ3IuanMiLCJjb21wb25lbnQvdXBsb2FkZXIuanMiLCJjb21wb25lbnQvdm0uanMiLCJjb21wb25lbnQvemgtY24uanMiLCI0MDQvNDA0X2N0cmwuanMiLCJpbmRlbnQvZW51bXMuanMiLCJpbmRlbnQvaW5kZW50X3N2Y3MuanMiLCJpbmRlbnQvbGlzdF9jdHJsLmpzIiwibG9naW4vbG9naW5fY3RybC5qcyIsImxvZ2luL2xvZ2luX3N2Y3MuanMiLCJyZXBvcnQvaW5wdXRfcmVwb3J0LmpzIiwicmVwb3J0L3JlcG9ydF9jdHJsLmpzIiwicmVwb3J0L3JlcG9ydF9zdmNzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7QUFNQTtHQUNBLE9BQUEsUUFBQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7O0dBRUEsa0dBQUEsU0FBQSxtQkFBQSxvQkFBQSxjQUFBLDZCQUFBOzs7SUFHQTtPQUNBLFVBQUE7T0FDQSxXQUFBOzs7SUFHQTtPQUNBLFVBQUE7OztJQUdBLGFBQUEsYUFBQTs7O0lBR0E7T0FDQSxVQUFBO09BQ0EsVUFBQSxNQUFBOzs7SUFHQSxjQUFBO01BQ0EsUUFBQTs7OztJQUlBLFFBQUEsUUFBQSxVQUFBLEdBQUEsZUFBQSxXQUFBO01BQ0EsUUFBQSxRQUFBLFVBQUEsR0FBQSxjQUFBLFNBQUEsR0FBQTtRQUNBLEVBQUE7O1FBRUEsT0FBQTs7OztHQUlBLDBEQUFBLFNBQUEsWUFBQSxXQUFBLFFBQUEsY0FBQTtJQUNBLElBQUEsTUFBQTs7SUFFQSxXQUFBLFNBQUE7SUFDQSxXQUFBLGVBQUE7SUFDQSxXQUFBLGNBQUE7OztJQUdBO09BQ0EsT0FBQSxXQUFBO1FBQ0EsT0FBQSxVQUFBO1NBQ0EsU0FBQSxTQUFBLEtBQUE7UUFDQSxJQUFBLFFBQUEsUUFBQSxLQUFBLFFBQUEsSUFBQSxRQUFBLEtBQUEsS0FBQTtVQUNBOzs7UUFHQSxXQUFBLFVBQUE7OztJQUdBLFdBQUEsT0FBQSxXQUFBO01BQ0EsVUFBQSxJQUFBLFdBQUE7Ozs7O0FDL0VBO0dBQ0EsT0FBQSxlQUFBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBOztHQUVBLDBCQUFBLFNBQUEsZ0JBQUE7SUFDQTtPQUNBLE1BQUEsV0FBQTtRQUNBLFVBQUE7UUFDQSxLQUFBO1FBQ0EsYUFBQTtRQUNBLFNBQUE7VUFDQSxhQUFBOzs7T0FHQSxNQUFBLGdCQUFBO1FBQ0EsS0FBQTtRQUNBLGFBQUE7UUFDQSxZQUFBOztPQUVBLE1BQUEsdUJBQUE7UUFDQSxLQUFBO1FBQ0EsYUFBQTtRQUNBLFlBQUE7O09BRUEsTUFBQSxvQkFBQTtRQUNBLEtBQUE7UUFDQSxhQUFBO1FBQ0EsWUFBQTs7OztBQ2hDQTtHQUNBLE9BQUEsY0FBQTtJQUNBO0lBQ0E7OztHQUdBLDBCQUFBLFNBQUEsZ0JBQUE7SUFDQTtPQUNBLE1BQUEsU0FBQTtRQUNBLEtBQUE7UUFDQSxhQUFBO1FBQ0EsWUFBQTs7OztBQ1hBO0dBQ0EsT0FBQSxlQUFBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTs7R0FFQSwwQkFBQSxTQUFBLGdCQUFBO0lBQ0E7T0FDQSxNQUFBLHdCQUFBO1FBQ0EsS0FBQTtRQUNBLGFBQUE7UUFDQSxZQUFBOztPQUVBLE1BQUEsOEJBQUE7UUFDQSxLQUFBO1FBQ0EsYUFBQTtRQUNBLFlBQUE7O09BRUEsTUFBQSw2QkFBQTtRQUNBLEtBQUE7UUFDQSxhQUFBO1FBQ0EsWUFBQTs7T0FFQSxNQUFBLG1CQUFBO1FBQ0EsS0FBQTtRQUNBLGFBQUE7UUFDQSxZQUFBOzs7Ozs7QUMxQkE7R0FDQSxPQUFBLHFCQUFBO0dBQ0EsVUFBQSxnQ0FBQSxTQUFBLFVBQUE7SUFDQSxPQUFBO01BQ0EsVUFBQTtNQUNBLE1BQUEsU0FBQSxPQUFBLFNBQUEsWUFBQTtRQUNBLE1BQUEsT0FBQSxXQUFBLG9CQUFBLFNBQUEsT0FBQTtVQUNBLFFBQUEsS0FBQSxpQkFBQSxDQUFBLENBQUE7Ozs7OztBQ1RBO0dBQ0EsT0FBQSxnQkFBQTs7R0FFQSxPQUFBLFVBQUEsV0FBQTtJQUNBLE9BQUEsU0FBQSxHQUFBO01BQ0EsSUFBQSxLQUFBLE1BQUE7UUFDQSxPQUFBOzs7TUFHQSxJQUFBLEVBQUEsUUFBQSxZQUFBOztNQUVBLElBQUEsRUFBQSxTQUFBLEdBQUE7UUFDQSxPQUFBOzs7TUFHQSxJQUFBLEtBQUEsRUFBQSxNQUFBOztNQUVBLEdBQUEsT0FBQSxHQUFBLEdBQUE7O01BRUEsSUFBQSxFQUFBLFVBQUEsR0FBQTtRQUNBLEdBQUEsT0FBQSxHQUFBLEdBQUE7OztNQUdBLE9BQUEsR0FBQSxLQUFBOzs7O0FDdkJBO0dBQ0EsT0FBQSxhQUFBO0dBQ0EsUUFBQSxZQUFBLFlBQUE7SUFDQSxJQUFBLFdBQUEsVUFBQSxNQUFBLEdBQUE7TUFDQSxPQUFBLEtBQUEsZ0JBQUEsS0FBQSxLQUFBLGFBQUEsS0FBQSxJQUFBLEtBQUE7OztJQUdBLE9BQUE7TUFDQSxtQkFBQSxVQUFBLE1BQUE7UUFDQSxPQUFBLFNBQUEsTUFBQTs7O01BR0EsbUJBQUEsU0FBQSxNQUFBO1FBQ0EsSUFBQSxJQUFBLEtBQUE7UUFDQSxJQUFBLElBQUEsS0FBQTs7UUFFQSxJQUFBLElBQUEsSUFBQTtVQUNBLElBQUEsTUFBQTs7O1FBR0EsSUFBQSxJQUFBLElBQUE7VUFDQSxJQUFBLE1BQUE7OztRQUdBLE9BQUEsQ0FBQSxTQUFBLE1BQUEsTUFBQSxJQUFBLE1BQUEsR0FBQSxLQUFBOzs7OztBQ3ZCQTtHQUNBLE9BQUEsY0FBQTtHQUNBLFFBQUEsU0FBQSxZQUFBO0lBQ0EsT0FBQSxVQUFBLE9BQUE7TUFDQSxPQUFBO1FBQ0EsS0FBQSxVQUFBLE1BQUEsTUFBQTtVQUNBLE9BQUEsTUFBQSxNQUFBLEtBQUEsVUFBQSxNQUFBO1lBQ0EsT0FBQSxLQUFBLFNBQUE7YUFDQTs7UUFFQSxNQUFBLFVBQUEsTUFBQSxLQUFBO1VBQ0EsT0FBQSxNQUFBLE1BQUEsS0FBQSxVQUFBLE1BQUE7WUFDQSxPQUFBLEtBQUEsVUFBQTthQUNBOztRQUVBLE1BQUEsVUFBQSxNQUFBLEtBQUE7VUFDQSxPQUFBLE1BQUEsTUFBQSxLQUFBLFVBQUEsTUFBQTtZQUNBLE9BQUEsS0FBQSxVQUFBOzs7UUFHQSxXQUFBLFNBQUEsTUFBQSxNQUFBO1VBQ0EsT0FBQSxNQUFBLE1BQUEsS0FBQSxTQUFBLE1BQUE7WUFDQSxPQUFBLEtBQUEsU0FBQTs7O1FBR0EsTUFBQSxVQUFBLE1BQUE7VUFDQSxPQUFBLE1BQUE7O1FBRUEsT0FBQSxVQUFBLE1BQUEsTUFBQTtVQUNBLE9BQUEsTUFBQSxNQUFBLE9BQUEsVUFBQSxNQUFBO1lBQ0EsT0FBQSxLQUFBLFFBQUEsS0FBQSxXQUFBLENBQUE7Ozs7Ozs7QUM5QkE7R0FDQSxPQUFBLGNBQUE7R0FDQSxRQUFBLDZCQUFBLFNBQUEsU0FBQSxNQUFBO0lBQ0EsSUFBQSxRQUFBO0lBQ0EsTUFBQSxTQUFBLFNBQUEsS0FBQTtNQUNBLFFBQUEsMEJBQUEsS0FBQSxNQUFBLFdBQUEsTUFBQTs7O0lBR0EsTUFBQSxZQUFBLFNBQUEsV0FBQTtNQUNBLFVBQUEsT0FBQSxXQUFBO1FBQ0EsS0FBQSxLQUFBLGVBQUEsVUFBQTtTQUNBLFdBQUE7UUFDQSxLQUFBLEtBQUEsZUFBQSxVQUFBOzs7O0lBSUEsTUFBQSxVQUFBLFNBQUEsS0FBQTtNQUNBLEtBQUEsS0FBQSxlQUFBLEtBQUEsVUFBQSxJQUFBOzs7SUFHQSxPQUFBOztBQ3JCQTtHQUNBLE9BQUEsb0JBQUE7O0dBRUEseUJBQUEsU0FBQSxlQUFBO0lBQ0EsY0FBQSxhQUFBLEtBQUE7OztJQUdBLGNBQUEsU0FBQSxRQUFBLE9BQUEsc0JBQUE7SUFDQSxjQUFBLFNBQUEsUUFBQSxLQUFBLGtCQUFBO0lBQ0EsY0FBQSxTQUFBLG1CQUFBLENBQUEsU0FBQSxNQUFBO1FBQ0EsSUFBQSxNQUFBOztRQUVBLFFBQUEsUUFBQSxNQUFBLFNBQUEsT0FBQSxLQUFBO1VBQ0EsS0FBQSxLQUFBLG1CQUFBLE9BQUEsTUFBQSxtQkFBQTtXQUNBOztRQUVBLE9BQUEsSUFBQSxLQUFBOzs7O0dBSUEsUUFBQSxxREFBQSxTQUFBLElBQUEsWUFBQSxXQUFBO0lBQ0EsT0FBQTs7TUFFQSxXQUFBLFNBQUEsUUFBQTtRQUNBLE9BQUEsUUFBQSxnQkFBQSxPQUFBLGlCQUFBO1FBQ0EsT0FBQSxRQUFBLFlBQUEsT0FBQSxhQUFBOzs7UUFHQSxJQUFBLE9BQUEsSUFBQSxRQUFBLFlBQUEsQ0FBQSxLQUFBLE9BQUEsSUFBQSxRQUFBLFdBQUEsQ0FBQSxHQUFBO1VBQ0EsT0FBQTs7O1FBR0EsT0FBQSxNQUFBLE9BQUEsTUFBQSxRQUFBLElBQUEsT0FBQTs7UUFFQSxPQUFBOzs7O01BSUEsZ0JBQUEsU0FBQSxXQUFBO1FBQ0EsT0FBQSxHQUFBLE9BQUE7Ozs7Ozs7OztNQVNBLFlBQUEsU0FBQSxVQUFBOztRQUVBLElBQUEsTUFBQTs7UUFFQSxJQUFBLFFBQUEsU0FBQSxTQUFBLE9BQUE7VUFDQSxPQUFBLFNBQUEsS0FBQTtVQUNBLE9BQUEsU0FBQSxLQUFBOzs7OztVQUtBLElBQUEsU0FBQSxLQUFBO1lBQ0EsT0FBQSxHQUFBLE9BQUE7Ozs7OztVQU1BLElBQUEsUUFBQSxNQUFBO1lBQ0EsU0FBQSxPQUFBOzs7Ozs7Ozs7UUFTQSxPQUFBOzs7O01BSUEsaUJBQUEsU0FBQSxXQUFBO1FBQ0EsSUFBQSxlQUFBLFVBQUE7O1FBRUEsSUFBQSxVQUFBLFdBQUEsS0FBQTtVQUNBLFVBQUEsSUFBQTtVQUNBLFVBQUEsT0FBQSxZQUFBOzs7UUFHQSxPQUFBLEdBQUEsT0FBQTs7Ozs7QUN2RkE7R0FDQSxPQUFBLGVBQUE7R0FDQSxRQUFBLDBDQUFBLFNBQUEsTUFBQSxxQkFBQTtJQUNBLElBQUEsU0FBQTtNQUNBLGFBQUE7O01BRUEsUUFBQSxTQUFBLFVBQUEsUUFBQTtRQUNBLElBQUEsVUFBQSxXQUFBLEdBQUE7VUFDQSxNQUFBLElBQUEsTUFBQTs7O1FBR0EsT0FBQSxDQUFBLFVBQUEsUUFBQSxLQUFBLE9BQUE7OztNQUdBLFFBQUEsU0FBQSxLQUFBLFVBQUEsUUFBQTtRQUNBLElBQUEsVUFBQSxXQUFBLEdBQUE7VUFDQSxNQUFBLElBQUEsTUFBQSxZQUFBLE1BQUE7Ozs7UUFJQSxJQUFBLFVBQUEsV0FBQSxHQUFBO1VBQ0EsT0FBQSxDQUFBLFVBQUEsS0FBQSxLQUFBLE9BQUE7OztRQUdBLE9BQUEsQ0FBQSxVQUFBLFFBQUEsS0FBQSxLQUFBLE9BQUE7Ozs7SUFJQSxRQUFBLE9BQUEsUUFBQTtNQUNBLEtBQUEsT0FBQSxPQUFBLEtBQUEsUUFBQTs7TUFFQSxRQUFBLE9BQUEsT0FBQSxLQUFBLFFBQUE7O01BRUEsUUFBQSxPQUFBLE9BQUEsS0FBQSxRQUFBOztNQUVBLE9BQUEsU0FBQSxVQUFBLFFBQUE7UUFDQSxvQkFBQSxPQUFBLE9BQUEsT0FBQSxVQUFBO1FBQ0Esb0JBQUEsT0FBQSxPQUFBLE9BQUEsVUFBQTtRQUNBLG9CQUFBLE9BQUEsT0FBQSxPQUFBLFVBQUE7UUFDQSxvQkFBQSxPQUFBLE9BQUEsSUFBQSxVQUFBOzs7O0lBSUEsT0FBQTs7OztBQzFDQTtHQUNBLE9BQUEsaUJBQUE7R0FDQSxRQUFBLG1DQUFBLFNBQUEsWUFBQSxNQUFBO0lBQ0EsSUFBQSxLQUFBO0lBQ0EsSUFBQSxPQUFBLFdBQUE7O0lBRUEsSUFBQSxXQUFBOzs7Ozs7O01BT0EsT0FBQSxTQUFBLEtBQUE7UUFDQSxJQUFBLENBQUEsSUFBQSxlQUFBLENBQUEsSUFBQSxLQUFBO1VBQ0EsTUFBQSxJQUFBLE1BQUE7OztRQUdBLElBQUEsUUFBQSxJQUFBLFlBQUE7UUFDQSxJQUFBO1FBQ0EsSUFBQSxrQkFBQTs7O1FBR0EsSUFBQSxVQUFBLEdBQUE7VUFDQTs7O1FBR0EsSUFBQSxhQUFBO1VBQ0EsV0FBQTtVQUNBLE1BQUE7VUFDQSxLQUFBO1VBQ0EsT0FBQTs7O1FBR0EsTUFBQSxRQUFBLE9BQUEsSUFBQSxZQUFBOztRQUVBLElBQUEsV0FBQSxTQUFBLFlBQUE7O1VBRUEsV0FBQSxXQUFBOztVQUVBLElBQUEsSUFBQSxNQUFBLFVBQUE7O1VBRUE7O1VBRUEsSUFBQSxXQUFBO1lBQ0EsUUFBQTtZQUNBLE9BQUE7WUFDQSxTQUFBLFNBQUEsa0JBQUEsUUFBQTs7O1VBR0EsSUFBQSxVQUFBLFFBQUEsR0FBQTtZQUNBLElBQUEsR0FBQSxpQkFBQTtjQUNBLEdBQUEsa0JBQUE7Y0FDQSxPQUFBLEdBQUE7OztZQUdBLElBQUE7Ozs7UUFJQSxJQUFBLGNBQUEsUUFBQSxLQUFBLElBQUEsYUFBQTs7O1FBR0EsSUFBQSxVQUFBLEdBQUE7VUFDQSxRQUFBO1VBQ0EsU0FBQSxJQUFBO1lBQ0EsWUFBQSxJQUFBLFlBQUE7WUFDQSxTQUFBO1lBQ0EsS0FBQSxJQUFBO1lBQ0EsT0FBQSxJQUFBOzs7VUFHQTs7OztRQUlBLElBQUEsUUFBQSxJQUFBLFdBQUE7VUFDQSxRQUFBLFFBQUE7VUFDQSxLQUFBLElBQUEsSUFBQSxHQUFBLElBQUEsT0FBQSxLQUFBO1lBQ0EsU0FBQSxJQUFBO2NBQ0EsWUFBQSxJQUFBLFlBQUE7Y0FDQSxTQUFBO2NBQ0EsS0FBQSxJQUFBO2NBQ0EsT0FBQSxJQUFBOzs7O1VBSUE7Ozs7UUFJQSxRQUFBLElBQUEsWUFBQTtRQUNBLEdBQUEsa0JBQUEsSUFBQTs7OztRQUlBLEdBQUEsaUJBQUEsbUJBQUEsU0FBQSxnQkFBQTs7VUFFQSxJQUFBLENBQUEsZ0JBQUE7WUFDQTs7O1VBR0EsU0FBQSxJQUFBO1lBQ0EsWUFBQSxJQUFBLFlBQUEsRUFBQTtZQUNBLFNBQUE7WUFDQSxLQUFBLElBQUE7WUFDQSxPQUFBLElBQUE7Ozs7UUFJQSxLQUFBLElBQUEsSUFBQSxHQUFBLElBQUEsSUFBQSxXQUFBLEtBQUE7VUFDQSxTQUFBLElBQUE7WUFDQSxZQUFBLElBQUEsWUFBQTtZQUNBLFNBQUE7WUFDQSxLQUFBLElBQUE7WUFDQSxPQUFBLElBQUE7Ozs7UUFJQTs7OztNQUlBLEtBQUEsU0FBQSxLQUFBO1FBQ0EsSUFBQSxDQUFBLElBQUEsY0FBQSxDQUFBLElBQUEsS0FBQTtVQUNBLE1BQUEsSUFBQSxNQUFBOzs7UUFHQSxLQUFBLE1BQUEsaUJBQUEsS0FBQSxVQUFBLElBQUE7O1FBRUEsSUFBQSxhQUFBO1VBQ0EsU0FBQTtVQUNBLE9BQUE7VUFDQSxTQUFBO1VBQ0EsVUFBQSxJQUFBLFdBQUEsSUFBQSxPQUFBLElBQUEsV0FBQSxJQUFBLFlBQUEsT0FBQTs7UUFFQSxJQUFBLG9CQUFBLElBQUE7UUFDQSxNQUFBLFFBQUEsT0FBQSxJQUFBLFlBQUE7UUFDQSxJQUFBLGFBQUEsU0FBQSxlQUFBO1VBQ0EsSUFBQSxjQUFBLGtCQUFBOztZQUVBLElBQUEsU0FBQSxjQUFBOztZQUVBLElBQUEsUUFBQSxjQUFBOztZQUVBLElBQUEsVUFBQSxTQUFBLENBQUEsU0FBQSxTQUFBOztZQUVBLGtCQUFBO2NBQ0EsUUFBQTtjQUNBLE9BQUE7Y0FDQSxTQUFBOzs7OztRQUtBLElBQUEsU0FBQSxJQUFBO1FBQ0EsT0FBQSxVQUFBLElBQUE7UUFDQSxPQUFBLFdBQUEsSUFBQTs7UUFFQSxJQUFBLEtBQUEsSUFBQTtRQUNBLEdBQUEsYUFBQSxJQUFBO1FBQ0EsR0FBQTtVQUNBLElBQUEsV0FBQTtVQUNBLFVBQUEsSUFBQTtVQUNBLElBQUEsUUFBQSxLQUFBLFVBQUEsSUFBQTtVQUNBLElBQUEsTUFBQSxLQUFBLFVBQUEsSUFBQTtVQUNBOzs7OztJQUtBLE9BQUE7Ozs7QUM1S0E7R0FDQSxPQUFBLFdBQUE7R0FDQSxRQUFBLGVBQUEsVUFBQSxNQUFBO0lBQ0EsT0FBQTtNQUNBLFNBQUEsU0FBQSxJQUFBLFFBQUE7UUFDQSxJQUFBLE1BQUE7O1FBRUEsSUFBQSxRQUFBLFNBQUEsU0FBQTtVQUNBLFNBQUEsT0FBQSxNQUFBOzs7UUFHQSxJQUFBLE9BQUEsV0FBQSxLQUFBLE9BQUEsT0FBQSxJQUFBO1VBQ0EsS0FBQSxLQUFBO1VBQ0E7OztRQUdBLElBQUEsQ0FBQSxRQUFBLFFBQUEsU0FBQTtVQUNBLEtBQUEsTUFBQTtVQUNBOzs7UUFHQSxPQUFBLElBQUEsU0FBQSxPQUFBO1VBQ0EsT0FBQSxJQUFBLFNBQUEsR0FBQTs7O1FBR0EsT0FBQTs7OztBQzFCQTtBQUNBLFFBQUEsT0FBQSxZQUFBLElBQUEsQ0FBQSxZQUFBLFNBQUEsVUFBQTtFQUNBLElBQUEsa0JBQUE7SUFDQSxNQUFBO0lBQ0EsS0FBQTtJQUNBLEtBQUE7SUFDQSxLQUFBO0lBQ0EsTUFBQTtJQUNBLE9BQUE7O0VBRUEsU0FBQSxNQUFBLFdBQUE7SUFDQSxvQkFBQTtNQUNBLFNBQUE7UUFDQTtRQUNBOztNQUVBLE9BQUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7TUFFQSxTQUFBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBOztNQUVBLFlBQUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7TUFFQSxjQUFBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBOztNQUVBLFlBQUE7TUFDQSxZQUFBO01BQ0EsVUFBQTtNQUNBLGNBQUE7TUFDQSxjQUFBO01BQ0EsU0FBQTtNQUNBLGFBQUE7TUFDQSxhQUFBOztJQUVBLGtCQUFBO01BQ0EsZ0JBQUE7TUFDQSxlQUFBO01BQ0EsYUFBQTtNQUNBLFlBQUEsQ0FBQTtRQUNBLFNBQUE7UUFDQSxVQUFBO1FBQ0EsV0FBQTtRQUNBLFdBQUE7UUFDQSxXQUFBO1FBQ0EsVUFBQTtRQUNBLFVBQUE7UUFDQSxVQUFBO1FBQ0EsVUFBQTtRQUNBLFVBQUE7U0FDQTtRQUNBLFNBQUE7UUFDQSxVQUFBO1FBQ0EsV0FBQTtRQUNBLFdBQUE7UUFDQSxXQUFBO1FBQ0EsVUFBQTtRQUNBLFVBQUE7UUFDQSxVQUFBO1FBQ0EsVUFBQTtRQUNBLFVBQUE7OztJQUdBLE1BQUE7SUFDQSxhQUFBLFNBQUEsR0FBQTtNQUNBLE9BQUEsZ0JBQUE7Ozs7Ozs7OztBQ2pHQTtHQUNBLE9BQUEsZ0JBQUEsQ0FBQTs7O0dBR0EsMEJBQUEsVUFBQSxnQkFBQTtJQUNBO09BQ0EsTUFBQSxXQUFBO1FBQ0EsS0FBQTtRQUNBLGFBQUE7UUFDQSxZQUFBOzs7OztHQUtBLFdBQUEsMEJBQUEsVUFBQSxRQUFBO0lBQ0EsUUFBQSxJQUFBOzs7OztBQ25CQTtHQUNBLE9BQUEscUJBQUEsQ0FBQTs7Q0FFQSxRQUFBLHFEQUFBLFNBQUEsT0FBQSxnQkFBQSxRQUFBO0VBQ0EsT0FBQTtPQUNBO09BQ0E7T0FDQSxLQUFBLFNBQUEsS0FBQTtRQUNBLElBQUEsYUFBQSxpRUFBQSxNQUFBOztRQUVBLFdBQUEsUUFBQSxTQUFBLEtBQUE7VUFDQSxJQUFBLEtBQUEsUUFBQTtZQUNBLE1BQUE7WUFDQSxPQUFBOzs7O1FBSUEsSUFBQSxVQUFBLENBQUE7VUFDQSxNQUFBO1VBQ0EsT0FBQTtXQUNBO1VBQ0EsTUFBQTtVQUNBLE9BQUE7V0FDQTtVQUNBLE1BQUE7VUFDQSxPQUFBO1dBQ0E7VUFDQSxNQUFBO1VBQ0EsT0FBQTtXQUNBO1VBQ0EsTUFBQTtVQUNBLE9BQUE7OztRQUdBLE9BQUEsTUFBQSxJQUFBOztPQUVBLE1BQUEsU0FBQSxLQUFBO1FBQ0EsT0FBQSxNQUFBLElBQUEsT0FBQTs7OztBQ3JDQTtHQUNBLE9BQUEsb0JBQUEsQ0FBQTs7R0FFQSxRQUFBLGdDQUFBLFNBQUEsV0FBQTtJQUNBLE9BQUEsVUFBQSxZQUFBLFNBQUE7OztHQUdBLFFBQUEsNEJBQUEsU0FBQSxXQUFBO0lBQ0EsT0FBQSxVQUFBLFlBQUEsU0FBQSxXQUFBLElBQUE7TUFDQSxPQUFBO1FBQ0EsU0FBQTs7Ozs7R0FLQSxRQUFBLDJCQUFBLFNBQUEsV0FBQTtJQUNBLE9BQUEsVUFBQSxZQUFBLFNBQUEsY0FBQTtNQUNBLElBQUE7T0FDQTtNQUNBLFFBQUE7UUFDQSxRQUFBOzs7OztHQUtBLFFBQUEsaUNBQUEsU0FBQSxXQUFBO0lBQ0EsT0FBQSxVQUFBLFlBQUEsU0FBQSxpQ0FBQTtNQUNBLElBQUE7T0FDQTtNQUNBLFFBQUE7UUFDQSxRQUFBOzs7OztHQUtBLFFBQUEsd0NBQUEsU0FBQSxXQUFBO0lBQ0EsT0FBQSxVQUFBLFlBQUEsU0FBQSwrQkFBQTtNQUNBLElBQUE7T0FDQTtNQUNBLFFBQUE7UUFDQSxRQUFBOzs7OztHQUtBLFFBQUEsNEJBQUEsU0FBQSxXQUFBO0lBQ0EsT0FBQSxVQUFBLFlBQUEsU0FBQSxZQUFBLElBQUE7TUFDQSxPQUFBO1FBQ0EsU0FBQTs7Ozs7R0FLQSxRQUFBLG9DQUFBLFNBQUEsV0FBQTtJQUNBLE9BQUEsVUFBQSxZQUFBLFNBQUE7OztHQUdBLFFBQUEsK0JBQUEsU0FBQSxXQUFBO0lBQ0EsT0FBQSxVQUFBLFlBQUEsU0FBQSx3QkFBQTtNQUNBLFVBQUE7Ozs7R0FJQSxRQUFBLDhCQUFBLFNBQUEsV0FBQTtJQUNBLE9BQUEsVUFBQSxZQUFBLFNBQUEsZ0NBQUE7TUFDQSxVQUFBO01BQ0EsUUFBQTtPQUNBO01BQ0EsUUFBQTtRQUNBLFFBQUE7Ozs7O0FDcEVBO0dBQ0EsT0FBQTs7R0FFQSxXQUFBLDJIQUFBLFNBQUEsUUFBQSxXQUFBLFFBQUE7SUFDQSxZQUFBLFdBQUEsaUJBQUEsYUFBQTtJQUNBLElBQUEsS0FBQTtJQUNBLElBQUEsTUFBQSxVQUFBOztJQUVBLEdBQUEsWUFBQSxTQUFBLElBQUEsY0FBQTs7SUFFQSxJQUFBLEdBQUEsT0FBQSxTQUFBLHdCQUFBO01BQ0EsR0FBQSxZQUFBO1dBQ0E7TUFDQSxHQUFBLFVBQUEsU0FBQSxJQUFBLFlBQUE7TUFDQSxHQUFBLGVBQUEsU0FBQSxJQUFBLGlCQUFBOztNQUVBLEdBQUEsbUJBQUEsSUFBQSxvQkFBQTs7TUFFQSxHQUFBLFNBQUEsWUFBQSxLQUFBLGdCQUFBLEdBQUE7TUFDQSxHQUFBLGNBQUEsWUFBQSxLQUFBO01BQ0EsR0FBQSxPQUFBLFlBQUEsS0FBQSxRQUFBLEdBQUE7TUFDQSxHQUFBLFlBQUEsWUFBQSxLQUFBOzs7TUFHQSxHQUFBLFlBQUEsWUFBQSxLQUFBLGFBQUEsR0FBQTtNQUNBLEdBQUEsaUJBQUEsWUFBQSxLQUFBOztNQUVBLFdBQUEsVUFBQTtNQUNBLFdBQUEsUUFBQTs7TUFFQSxXQUFBLGFBQUE7O01BRUEsR0FBQSxTQUFBOzs7SUFHQSxHQUFBLE9BQUEsU0FBQSxJQUFBLFNBQUE7SUFDQSxHQUFBLE9BQUEsU0FBQSxJQUFBLFNBQUE7SUFDQSxHQUFBLFFBQUEsWUFBQSxLQUFBO0lBQ0EsR0FBQSxZQUFBLFlBQUEsS0FBQSxRQUFBLEdBQUE7O0lBRUEsR0FBQSxjQUFBO0lBQ0EsR0FBQSxjQUFBO0lBQ0EsR0FBQSxlQUFBO0lBQ0EsR0FBQSxnQkFBQTs7SUFFQTs7SUFFQSxTQUFBLFFBQUE7TUFDQSxJQUFBLFNBQUE7UUFDQSxTQUFBLEdBQUE7UUFDQSxZQUFBLEdBQUE7UUFDQSxNQUFBLEdBQUE7O1FBRUEsV0FBQSxHQUFBOzs7TUFHQSxJQUFBLEdBQUEsT0FBQSxTQUFBLGlCQUFBO1FBQ0EsUUFBQSxPQUFBLFFBQUE7VUFDQSxTQUFBLEdBQUE7VUFDQSxjQUFBLEdBQUE7O1VBRUEsa0JBQUEsR0FBQTs7OztNQUlBLFVBQUEsT0FBQTs7TUFFQTtTQUNBLE1BQUE7U0FDQTtTQUNBLEtBQUEsU0FBQSxJQUFBO1VBQ0EsR0FBQSxNQUFBLFFBQUEsU0FBQSxNQUFBO1lBQ0EsS0FBQSxjQUFBLFlBQUEsS0FBQSxnQkFBQSxLQUFBOzs7VUFHQSxHQUFBLFFBQUEsR0FBQTtVQUNBLEdBQUEsY0FBQSxHQUFBOztVQUVBLElBQUEsTUFBQSxHQUFBLGNBQUEsR0FBQTtVQUNBLEdBQUEsYUFBQSxHQUFBLGNBQUEsR0FBQSxTQUFBLElBQUEsT0FBQSxLQUFBLE1BQUEsT0FBQTs7U0FFQSxNQUFBLFNBQUEsS0FBQTtVQUNBLE9BQUEsTUFBQSxJQUFBLEtBQUEsT0FBQTs7OztJQUlBLFNBQUEsV0FBQSxNQUFBLE9BQUE7TUFDQSxHQUFBLE9BQUEsTUFBQSxTQUFBLE1BQUE7UUFDQSxJQUFBLENBQUEsTUFBQTtVQUNBOzs7UUFHQSxHQUFBLFNBQUEsS0FBQTs7Ozs7SUFLQSxTQUFBLGNBQUEsTUFBQTtNQUNBLElBQUEsUUFBQSxhQUFBO1FBQ0E7V0FDQSxPQUFBO1lBQ0EsSUFBQSxLQUFBOztXQUVBO1dBQ0EsS0FBQSxTQUFBLEtBQUE7WUFDQSxPQUFBLFFBQUEsSUFBQSxPQUFBOztZQUVBOztXQUVBLE1BQUEsU0FBQSxLQUFBO1lBQ0EsT0FBQSxNQUFBLElBQUEsT0FBQTs7Ozs7O0lBTUEsU0FBQSxhQUFBLE1BQUE7TUFDQSxJQUFBLG1CQUFBLE9BQUEsS0FBQTtRQUNBLGFBQUE7UUFDQSxZQUFBO1FBQ0EsVUFBQTtRQUNBLFNBQUE7VUFDQSxhQUFBLFdBQUE7WUFDQSxPQUFBOzs7OztNQUtBLGlCQUFBLE9BQUEsS0FBQSxXQUFBOzs7UUFHQTs7Ozs7SUFLQSxTQUFBLFlBQUEsTUFBQTtNQUNBLEdBQUEsT0FBQTtNQUNBLEdBQUEsT0FBQTs7TUFFQTs7OztJQUlBLFNBQUEsWUFBQSxNQUFBO01BQ0EsR0FBQSxPQUFBOztNQUVBOzs7O0lBSUEsU0FBQSxTQUFBO01BQ0EsR0FBQSxPQUFBOztNQUVBOzs7O0dBSUEsV0FBQSx3TkFBQSxTQUFBLFFBQUEsTUFBQSxXQUFBLFFBQUEsZ0JBQUE7SUFDQSxPQUFBLFVBQUEsUUFBQSxxQkFBQSxvQkFBQTtJQUNBLGNBQUEsV0FBQTtJQUNBLElBQUEsS0FBQTtJQUNBLElBQUEsUUFBQSxLQUFBLE1BQUEsZUFBQSxJQUFBOztJQUVBLElBQUEsU0FBQSxNQUFBLFFBQUE7TUFDQSxHQUFBLGdCQUFBLE1BQUEsR0FBQTs7O0lBR0EsR0FBQSxlQUFBO0lBQ0EsR0FBQSxVQUFBO0lBQ0EsR0FBQSxXQUFBO0lBQ0EsR0FBQSxnQkFBQTtJQUNBLEdBQUEsY0FBQTs7SUFFQTs7SUFFQSxTQUFBLFFBQUE7TUFDQSxPQUFBO1NBQ0E7U0FDQTtTQUNBLEtBQUEsU0FBQSxLQUFBO1VBQ0EsSUFBQSxRQUFBLFNBQUEsT0FBQTtZQUNBLE1BQUEsS0FBQSxRQUFBLFNBQUEsS0FBQTtjQUNBLElBQUEsb0JBQUEsT0FBQSxPQUFBLE1BQUEsSUFBQSxJQUFBO2NBQ0EsSUFBQSxnQkFBQSxvQkFBQSxJQUFBOzs7O1VBSUEsR0FBQSxRQUFBOztTQUVBLE1BQUEsU0FBQSxLQUFBO1VBQ0EsT0FBQSxNQUFBLElBQUEsT0FBQTs7Ozs7SUFLQSxTQUFBLFNBQUEsSUFBQSxLQUFBO01BQ0EsSUFBQSxlQUFBLE9BQUEsS0FBQTtRQUNBLGFBQUE7UUFDQSxZQUFBO1FBQ0EsVUFBQTtRQUNBLFNBQUE7VUFDQSxhQUFBLFdBQUE7WUFDQSxPQUFBOztVQUVBLGFBQUEsV0FBQTtZQUNBLE9BQUE7Y0FDQSxJQUFBO2NBQ0EsS0FBQTs7Ozs7O01BTUEsYUFBQSxPQUFBLEtBQUEsV0FBQTtRQUNBOzs7OztJQUtBLFNBQUEsUUFBQSxVQUFBLEtBQUE7TUFDQSxJQUFBLFFBQUEsV0FBQSxDQUFBLElBQUEsT0FBQSxJQUFBLFFBQUEsSUFBQSxPQUFBLEtBQUEsT0FBQSxNQUFBO1FBQ0EsT0FBQTtXQUNBLE9BQUE7WUFDQSxVQUFBO1lBQ0EsUUFBQSxJQUFBOztXQUVBO1dBQ0EsS0FBQSxTQUFBLEtBQUE7WUFDQSxPQUFBLE1BQUEsVUFBQSxJQUFBOztZQUVBLE9BQUEsUUFBQSxJQUFBLE9BQUE7O1lBRUE7O1dBRUEsTUFBQSxTQUFBLEtBQUE7WUFDQSxPQUFBLE1BQUEsSUFBQSxPQUFBOzs7Ozs7SUFNQSxTQUFBLFlBQUEsVUFBQSxLQUFBO01BQ0EsT0FBQSxNQUFBLFVBQUEsSUFBQTtNQUNBLE9BQUEsUUFBQTs7OztJQUlBLFNBQUEsYUFBQSxNQUFBO01BQ0EsSUFBQSxtQkFBQSxPQUFBLEtBQUE7UUFDQSxhQUFBO1FBQ0EsWUFBQTtRQUNBLFVBQUE7UUFDQSxTQUFBO1VBQ0EsYUFBQSxXQUFBO1lBQ0EsT0FBQTs7Ozs7TUFLQSxpQkFBQSxPQUFBLEtBQUEsV0FBQTs7UUFFQSxLQUFBLEtBQUEsUUFBQSxTQUFBLEtBQUE7VUFDQSxPQUFBLE1BQUEsS0FBQSxJQUFBLElBQUE7OztRQUdBOzs7OztJQUtBLFNBQUEsY0FBQSxPQUFBLEtBQUE7TUFDQSxJQUFBLFdBQUEsTUFBQTtNQUNBLElBQUEsU0FBQSxJQUFBOztNQUVBLElBQUEsYUFBQSxPQUFBLE9BQUEsVUFBQTtNQUNBLElBQUEsb0JBQUEsT0FBQSxPQUFBO01BQ0EsSUFBQSxjQUFBLG9CQUFBLElBQUE7O01BRUEsS0FBQSxLQUFBLGFBQUE7TUFDQSxLQUFBLEtBQUEsYUFBQSxLQUFBLFVBQUE7O01BRUEsSUFBQSxDQUFBLGFBQUE7UUFDQSxLQUFBLEtBQUE7UUFDQTs7O01BR0EsSUFBQSxjQUFBLGdCQUFBO01BQ0EsSUFBQSxjQUFBLFlBQUE7O01BRUEsSUFBQSxjQUFBOztNQUVBLE9BQUEsS0FBQSxhQUFBLFFBQUEsU0FBQSxLQUFBO1FBQ0EsUUFBQSxPQUFBLGFBQUEsWUFBQTs7O01BR0EsS0FBQSxLQUFBLGNBQUEsS0FBQSxVQUFBOztNQUVBLElBQUEsZUFBQTtNQUNBLE9BQUEsS0FBQSxhQUFBLFFBQUEsU0FBQSxLQUFBO1FBQ0EsSUFBQSxZQUFBLEtBQUEsT0FBQTtVQUNBLGFBQUEsT0FBQSxRQUFBLE9BQUE7WUFDQSxLQUFBLFlBQUEsS0FBQTthQUNBLFlBQUE7Ozs7TUFJQSxJQUFBLFNBQUEsRUFBQSxPQUFBOzs7TUFHQSxJQUFBLENBQUEsT0FBQSxRQUFBO1FBQ0E7O1FBRUE7OztNQUdBLEtBQUEsS0FBQSxhQUFBLEtBQUEsVUFBQTtNQUNBLEtBQUEsS0FBQTtNQUNBLFNBQUEsTUFBQTtRQUNBLEtBQUE7UUFDQSxhQUFBO1FBQ0EsTUFBQTtRQUNBLEtBQUE7UUFDQSxZQUFBO1FBQ0EsT0FBQTs7O01BR0EsU0FBQSxXQUFBLFVBQUE7O1FBRUEsS0FBQSxLQUFBLFdBQUEsU0FBQTtRQUNBLElBQUEsY0FBQSxnQkFBQSxTQUFBLFNBQUEsVUFBQTtRQUNBLEdBQUE7OztNQUdBLFNBQUEsV0FBQSxPQUFBLE1BQUE7O1FBRUEsTUFBQSxVQUFBLEtBQUE7UUFDQSxLQUFBLEtBQUEsYUFBQSxLQUFBLFVBQUE7OztNQUdBLFNBQUEsYUFBQSxPQUFBO1FBQ0EsS0FBQSxLQUFBLGFBQUEsS0FBQSxVQUFBOzs7TUFHQSxTQUFBLGNBQUE7Ozs7UUFJQSxLQUFBLEtBQUE7OztRQUdBLE9BQUEsUUFBQSxTQUFBLE9BQUE7VUFDQSxZQUFBLE1BQUEsTUFBQTs7O1FBR0EsS0FBQSxLQUFBOzs7UUFHQSxvQkFBQSxJQUFBLG1CQUFBOzs7UUFHQTs7Ozs7OztNQU9BLFNBQUEsZ0JBQUE7UUFDQSxLQUFBLEtBQUE7O1FBRUEsT0FBQTtXQUNBLEtBQUE7WUFDQSxVQUFBO1lBQ0EsUUFBQTthQUNBO1dBQ0E7V0FDQSxLQUFBLFdBQUE7WUFDQSxLQUFBLEtBQUE7OztZQUdBLElBQUEsT0FBQSxRQUFBO2NBQ0EsT0FBQSxRQUFBLFNBQUEsT0FBQTtnQkFDQSxNQUFBLE9BQUEsTUFBQTs7Ozs7WUFLQSxPQUFBLE1BQUEsVUFBQTs7O1lBR0EsSUFBQSxjQUFBLGdCQUFBO1lBQ0EsSUFBQSxjQUFBLFdBQUE7Ozs7V0FJQSxNQUFBLFNBQUEsS0FBQTtZQUNBLEtBQUEsS0FBQSxlQUFBLEtBQUEsVUFBQTtZQUNBLE9BQUEsTUFBQSxJQUFBLE9BQUE7O1lBRUEsSUFBQSxjQUFBLFlBQUE7Ozs7Ozs7R0FPQSxXQUFBLG1HQUFBLFNBQUEsUUFBQSxnQkFBQSxRQUFBLHdCQUFBLGFBQUE7SUFDQSxJQUFBLEtBQUE7O0lBRUEsUUFBQSxPQUFBLElBQUE7O0lBRUEsR0FBQSxlQUFBO0lBQ0EsR0FBQSxTQUFBOztJQUVBLFNBQUEsZUFBQTtNQUNBLEdBQUEsc0JBQUE7O01BRUE7U0FDQSxPQUFBO1VBQ0EsSUFBQSxZQUFBO1dBQ0E7VUFDQSxNQUFBLEdBQUE7O1NBRUE7U0FDQSxLQUFBLFNBQUEsS0FBQTtVQUNBLE9BQUEsUUFBQSxJQUFBLE9BQUE7O1VBRUEsZUFBQTs7U0FFQSxNQUFBLFNBQUEsS0FBQTtVQUNBLEdBQUEsc0JBQUE7O1VBRUEsT0FBQSxNQUFBLElBQUEsT0FBQTs7OztJQUlBLFNBQUEsU0FBQTtNQUNBLGVBQUE7Ozs7O0dBS0EsV0FBQSwySEFBQSxTQUFBLFFBQUEsZ0JBQUEsUUFBQTtJQUNBLGNBQUEsYUFBQSxhQUFBO0lBQ0EsSUFBQSxLQUFBOztJQUVBLEdBQUEsYUFBQSxZQUFBLEtBQUE7SUFDQSxHQUFBLGNBQUEsWUFBQSxLQUFBO0lBQ0EsR0FBQSxhQUFBLFlBQUEsS0FBQTs7SUFFQSxJQUFBLFlBQUEsS0FBQTtNQUNBLEdBQUEsUUFBQTs7TUFFQSxZQUFBLFNBQUEsWUFBQSxJQUFBO01BQ0EsWUFBQSxVQUFBLFlBQUEsSUFBQTtNQUNBLFlBQUEsU0FBQSxZQUFBLElBQUE7V0FDQTtNQUNBLEdBQUEsUUFBQTs7O0lBR0EsR0FBQSxTQUFBO0lBQ0EsR0FBQSxTQUFBOztJQUVBLFNBQUEsU0FBQTtNQUNBLElBQUEsWUFBQSxLQUFBO1FBQ0E7V0FDQSxPQUFBO1lBQ0EsVUFBQSxZQUFBO1lBQ0EsUUFBQSxZQUFBLElBQUE7YUFDQTtZQUNBLE9BQUEsR0FBQSxNQUFBO1lBQ0EsUUFBQSxHQUFBLE1BQUE7WUFDQSxPQUFBLEdBQUEsTUFBQTs7V0FFQTtXQUNBLEtBQUEsU0FBQSxLQUFBO1lBQ0EsT0FBQSxRQUFBLElBQUEsT0FBQTs7WUFFQSxlQUFBOztXQUVBLE1BQUEsU0FBQSxLQUFBO1lBQ0EsT0FBQSxNQUFBLElBQUEsT0FBQTs7YUFFQTtRQUNBO1dBQ0EsS0FBQTtZQUNBLFVBQUEsWUFBQTthQUNBO1lBQ0EsT0FBQSxHQUFBLE1BQUE7WUFDQSxRQUFBLEdBQUEsTUFBQTtZQUNBLE9BQUEsR0FBQSxNQUFBOztXQUVBO1dBQ0EsS0FBQSxTQUFBLEtBQUE7WUFDQSxPQUFBLFFBQUEsSUFBQSxPQUFBOztZQUVBLGVBQUE7O1dBRUEsTUFBQSxTQUFBLEtBQUE7WUFDQSxPQUFBLE1BQUEsSUFBQSxPQUFBOzs7OztJQUtBLFNBQUEsWUFBQSxXQUFBLE9BQUE7TUFDQSxHQUFBLGFBQUEsWUFBQSxVQUFBLFdBQUE7OztJQUdBLFNBQUEsU0FBQTtNQUNBLGVBQUE7Ozs7OztBQy9mQTtHQUNBLE9BQUE7O0dBRUEsV0FBQSw2RUFBQSxVQUFBLFFBQUEsSUFBQSxXQUFBLFVBQUEsUUFBQSxVQUFBO0lB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LEdBQUEsY0FBQSxFQUFBLElBQUEsZ0JBQUEsU0FBQSxNQUFBLEtBQUE7TUFDQSxPQUFBO1FBQ0EsSUFBQTtRQUNBLE1BQUEsY0FBQTtRQUNBLFFBQUE7Ozs7SUFJQSxFQUFBLGdCQUFBLFNBQUEsVUFBQSxRQUFBLFNBQUEsTUFBQTtNQUNBLEdBQUEsV0FBQSxLQUFBLE1BQUE7OztJQUdBLFNBQUEsY0FBQSxTQUFBO01BQ0EsT0FBQSxVQUFBLEtBQUEsU0FBQSxNQUFBO1FBQ0EsT0FBQSxLQUFBLE1BQUE7U0FDQTs7OztJQUlBLEdBQUEsYUFBQTs7OztJQUlBLFNBQUEsV0FBQSxVQUFBLE1BQUEsTUFBQTtNQUNBLFVBQUEsT0FBQSxXQUFBLG9CQUFBLGtCQUFBO1FBQ0EsVUFBQTtRQUNBLGtCQUFBLE9BQUEsZ0JBQUE7UUFDQSxhQUFBLE9BQUEsa0JBQUE7UUFDQSxZQUFBO1FBQ0EsY0FBQSxPQUFBLGFBQUE7OztRQUdBLGtCQUFBOzs7TUFHQSxTQUFBLG1CQUFBLFFBQUE7O1FBRUEsSUFBQSxhQUFBLFFBQUE7VUFDQSxHQUFBLEtBQUEsS0FBQSxJQUFBLFFBQUE7Ozs7VUFJQSxVQUFBLGdCQUFBLEdBQUE7ZUFDQSxJQUFBLGFBQUEsU0FBQTs7VUFFQSxHQUFBLFdBQUEsS0FBQSxJQUFBLFFBQUE7OztVQUdBLElBQUEsY0FBQSxlQUFBLEtBQUEsSUFBQSxLQUFBLFNBQUEsT0FBQTtZQUNBLE9BQUEsTUFBQSxPQUFBLEtBQUE7Ozs7VUFJQSxZQUFBLFFBQUE7VUFDQSxvQkFBQSxJQUFBLGdCQUFBOzs7VUFHQSxVQUFBLEtBQUEsSUFBQSxZQUFBLElBQUEsUUFBQTs7O1FBR0Esb0JBQUEsSUFBQSxZQUFBOztRQUVBLEdBQUE7OztNQUdBLFNBQUEsbUJBQUE7UUFDQSxLQUFBLE1BQUEsZ0JBQUEsS0FBQSxPQUFBLFdBQUEsS0FBQTs7OztJQUlBLEdBQUEsYUFBQTtJQUNBLFNBQUEsV0FBQSxPQUFBO01BQ0EsT0FBQSwwQkFBQSxHQUFBLEtBQUEsTUFBQSxJQUFBLE9BQUEsU0FBQSxXQUFBO1FBQ0EsVUFB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QTs7O1VBR0EsWUFBQSxVQUFBO1dBQ0EsV0FBQTtVQUNBLFlBQUEsVUFBQTs7Ozs7SUFLQSxZQUFBLFVBQUE7O0lBRUEsU0FBQSxhQUFBLE1BQUE7O01BRUEsSUFBQSxJQUFBLFNBQUEsR0FBQSxLQUFBLEtBQUEsSUFBQTtNQUNBLElBQUEsTUFBQSxLQUFBLE1BQUEsR0FBQTtRQUNBLFFBQUEsT0FBQSxHQUFBLEtBQUEsS0FBQSxLQUFBO1VBQ0EsT0FBQTtVQUNBLFFBQUE7VUFDQSxNQUFBO1VBQ0EsT0FBQTs7Ozs7OztJQU9BLFNBQUEsV0FBQSxPQUFBO01BQ0EsT0FBQSwwQkFBQSxHQUFBLEtBQUEsTUFBQSxJQUFBLE9BQUEsU0FBQSxXQUFBO1FBQ0EsVUFBQSxLQUFBLFNBQUEsTUFBQTtVQUNBLElBQUEsU0FBQSxJQUFBO1VBQ0EsT0FBQSxZQUFBLFNBQUEsS0FBQTtZQUNBLGdCQUFBLGdCQUFBLElBQUEsT0FBQSxPQUFBLFFBQUEsMkJBQUE7O1VBRUEsT0FBQSxjQUFBO1dBQ0EsV0FBQTtVQUNBLEtBQUEsTUFBQTs7U0FFQSxXQUFBO1FBQ0EsS0FBQSxNQUFBOzs7O0lBSUEsU0FBQSxXQUFBLE1BQUEsTUFBQTtNQUNBLFVBQUEsT0FBQSxXQUFBLG9CQUFBLGtCQUFBO1FBQ0EsVUFBQTtRQUNBLGtCQUFBLE9BQUEsZ0JBQUE7UUFDQSxhQUFBLE9BQUEsa0JBQUE7UUFDQSxZQUFBO1FBQ0EsY0FBQSxPQUFBLGFBQUE7OztRQUdBLGtCQUFBOzs7TUFHQSxTQUFBLG1CQUFBLFFBQUE7UUFDQSxHQUFBLEtBQUEsS0FBQSxNQUFBLFFBQUEsT0FBQSxHQUFBLEtBQUEsS0FBQSxPQUFBLElBQUE7VUFDQSxPQUFBO1VBQ0EsTUFBQSxLQUFBOzs7UUFHQSxHQUFBOzs7TUFHQSxTQUFBLG1CQUFBO1FBQ0EsS0FBQSxNQUFBLGdCQUFBLEtBQUEsT0FBQSxXQUFBLEtBQUE7Ozs7O0lBS0EsR0FBQSxZQUFBO0lBQ0EsU0FBQSxnQkFBQSxRQUFBLElBQUE7TUFDQSxPQUFBO01BQ0EsT0FBQTs7TUFFQSxHQUFBLFVBQUEsTUFBQTtLQUNBOztJQUVBLFNBQUEsZ0JBQUEsT0FBQSxNQUFBLFlBQUE7TUFDQSxXQUFBLFdBQUE7UUFDQSxJQUFBLGdCQUFBLFdBQUEsU0FBQSxHQUFBLEtBQUEsV0FBQSxJQUFBLFlBQUEsR0FBQTtVQUNBOzs7UUFHQSxnQkFBQSxVQUFBOztRQUVBLElBQUEsbUJBQUEsT0FBQSxLQUFBO1VBQ0EsYUFBQTtVQUNBLFlBQUE7VUFDQSxVQUFBO1VBQ0EsU0FBQTtZQUNBLGFBQUEsV0FBQTtjQUNBLE9BQUEsUUFBQSxPQUFBO2dCQUNBLFdBQUEsS0FBQTtnQkFDQSxZQUFBLEtBQUE7Z0JBQ0EsT0FBQTtpQkFDQSxZQUFBLEdBQUEsS0FBQSxXQUFBOzs7OztRQUtBLGlCQUFBLE9BQUEsS0FBQSxTQUFBLE1BQUE7VUFDQSxRQUFBLE9BQUEsR0FBQSxLQUFBLFdBQUEsS0FBQSxNQUFBO1lBQ0EsTUFBQSxXQUFBOzs7VUFHQSxnQkFBQSxVQUFBO1dBQ0EsV0FBQTtVQUNBLGdCQUFBLFVBQUE7Ozs7O0lBS0EsZ0JBQUEsVUFBQTs7O0dBR0EsV0FBQSwyRUFBQSxTQUFBLFFBQUEsTUFBQSxnQkFBQSxhQUFBO0lBQ0EsSUFBQSxLQUFBOztJQUVBLFFBQUEsT0FBQSxJQUFBOztJQUVBLEdBQUEsU0FBQTtJQUNBLEdBQUEsU0FBQTtJQUNBLEdBQUEsYUFBQTtJQUNBLEdBQUEsYUFBQTs7SUFFQSxTQUFBLFNBQUE7TUFDQSxlQUFBLE1BQUE7UUFDQSxPQUFBLEdBQUE7UUFDQSxRQUFBLEdBQUE7UUFDQSxNQUFBLEdBQUE7UUFDQSxPQUFBLEdBQUE7Ozs7SUFJQSxTQUFBLFNBQUE7TUFDQSxlQUFBOzs7SUFHQSxTQUFBLFdBQUEsT0FBQTtNQUNBLE9BQUEsMEJBQUEsR0FBQSxLQUFBLE1BQUEsSUFBQSxPQUFBLFNBQUEsV0FBQTtRQUNBLFVBQUEsS0FBQSxTQUFBLE1BQUE7VUFDQSxJQUFBLFNBQUEsSUFBQTtVQUNBLE9BQUEsWUFBQSxTQUFBLEtBQUE7WUFDQSxnQkFBQSxnQkFBQSxJQUFBLE9BQUEsT0FBQSxRQUFBLDJCQUFBOztVQUVBLE9BQUEsY0FBQTtXQUNBLFdBQUE7VUFDQSxLQUFBLE1BQUE7O1NBRUEsV0FBQTtRQUNBLEtBQUEsTUFBQTs7OztJQUlBLFNBQUEsYUFBQTtNQUNBLFVBQUEsT0FBQSxXQUFBLG9CQUFBLGtCQUFBO1FBQ0EsVUFBQTtRQUNBLGtCQUFBLE9BQUEsZ0JBQUE7UUFDQSxhQUFBLE9BQUEsa0JBQUE7UUFDQSxZQUFBO1FBQ0EsY0FBQSxPQUFBLGFBQUE7OztRQUdBLGtCQUFBOzs7TUFHQSxTQUFBLG1CQUFBLFFBQUE7UUFDQSxHQUFBLFFBQUE7UUFDQSxHQUFBOzs7TUFHQSxTQUFBLG1CQUFBO1FBQ0EsS0FBQSxNQUFBLGdCQUFBLFlBQUEsWUFBQSxXQUFBLFlBQUE7Ozs7O0dBS0EsV0FBQSx5RUFBQSxTQUFBLFFBQUEsTUFBQSxnQkFBQSxhQUFBO01BQ0EsSUFBQSxLQUFBOztNQUVBLFFBQUEsT0FBQSxJQUFBOztNQUVBLEdBQUEsU0FBQTtNQUNBLEdBQUEsU0FBQTtNQUNBLEdBQUEsYUFBQTtNQUNBLEdBQUEsYUFBQTs7TUFFQSxTQUFBLFNBQUE7UUFDQSxlQUFBLE1BQUE7VUFDQSxPQUFBLEdBQUE7Ozs7TUFJQSxTQUFBLFNBQUE7UUFDQSxlQUFBOzs7TUFHQSxTQUFBLFdBQUEsT0FBQTtRQUNBLE9BQUEsMEJBQUEsR0FBQSxLQUFBLE1BQUEsSUFBQSxPQUFBLFNBQUEsV0FBQTtVQUNBLFVBQUEsS0FBQSxTQUFBLE1BQUE7WUFDQSxJQUFBLFNBQUEsSUFBQTtZQUNBLE9BQUEsWUFBQSxTQUFBLEtBQUE7Y0FDQSxnQkFBQSxnQkFBQSxJQUFBLE9BQUEsT0FBQSxRQUFBLDJCQUFBOztZQUVBLE9BQUEsY0FBQTthQUNBLFdBQUE7WUFDQSxLQUFBLE1BQUE7O1dBRUEsV0FBQTtVQUNBLEtBQUEsTUFBQTs7OztNQUlBLFNBQUEsYUFBQTtRQUNBLFVBQUEsT0FBQSxXQUFBLG9CQUFBLGtCQUFBO1VBQ0EsVUFBQTtVQUNBLGtCQUFBLE9BQUEsZ0JBQUE7VUFDQSxhQUFBLE9BQUEsa0JBQUE7VUFDQSxZQUFBO1VBQ0EsY0FBQSxPQUFBLGFBQUE7OztVQUdBLGtCQUFBOzs7UUFHQSxTQUFBLG1CQUFBLFFBQUE7VUFDQSxHQUFBLFFBQUE7VUFDQSxHQUFBOzs7UUFHQSxTQUFBLG1CQUFBO1VBQ0EsS0FBQSxNQUFBLGdCQUFBLFlBQUEsWUFBQSxXQUFBLFlBQUE7Ozs7O0dBS0EsV0FBQSxpRkFBQSxTQUFBLFFBQUEsV0FBQSxZQUFBLGFBQUEsUUFBQTtJQUNBLElBQUEsS0FBQTtJQUNBLElBQUEsTUFBQSxVQUFBOztJQUVBLEdBQUEsT0FBQSxTQUFBLElBQUEsU0FBQTtJQUNBLEdBQUEsT0FBQSxTQUFBLElBQUEsU0FBQTtJQUNBLEdBQUEsUUFBQSxZQUFBLEtBQUE7SUFDQSxHQUFBLFlBQUEsWUFBQSxLQUFBLFFBQUEsR0FBQTs7SUFFQSxHQUFBLGNBQUE7SUFDQSxHQUFBLGNBQUE7O0lBRUE7O0lBRUEsU0FBQSxRQUFBO01BQ0EsSUFBQSxTQUFBO1FBQ0EsWUFBQSxHQUFBO1FBQ0EsTUFBQSxHQUFBOzs7TUFHQSxVQUFBLE9BQUE7O01BRUE7U0FDQSxNQUFBO1NBQ0E7U0FDQSxLQUFBLFNBQUEsSUFBQTtVQUNBLEdBQUEsTUFBQSxRQUFBLFNBQUEsTUFBQTtZQUNBLEtBQUEsY0FBQSxZQUFBLEtBQUEsZ0JBQUEsS0FBQTs7O1VBR0EsR0FBQSxRQUFBLEdBQUE7VUFDQSxHQUFBLGNBQUEsR0FBQTs7VUFFQSxJQUFBLE1BQUEsR0FBQSxjQUFBLEdBQUE7VUFDQSxHQUFBLGFBQUEsR0FBQSxjQUFBLEdBQUEsU0FBQSxJQUFBLE9BQUEsS0FBQSxNQUFBLE9BQUE7O1NBRUEsTUFBQSxTQUFBLEtBQUE7VUFDQSxPQUFBLE1BQUEsSUFBQSxPQUFBOzs7OztJQUtBLFNBQUEsWUFBQSxNQUFBO01BQ0EsR0FBQSxPQUFBO01BQ0EsR0FBQSxPQUFBOztNQUVBOzs7O0lBSUEsU0FBQSxZQUFBLE1BQUE7TUFDQSxHQUFBLE9BQUE7O01BRUE7Ozs7Ozs7OztBQ2psQkE7R0FDQSxPQUFBLG9CQUFBLENBQUE7O0dBRUEsUUFBQSw0QkFBQSxTQUFBLFdBQUE7SUFDQSxPQUFBLFVBQUEsWUFBQSxTQUFBLFlBQUEsSUFBQTtNQUNBLE9BQUE7UUFDQSxTQUFBOzs7OztHQUtBLFFBQUEsMkJBQUEsU0FBQSxXQUFBO0lBQ0EsT0FBQSxVQUFBLFlBQUEsU0FBQTtNQUNBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIOW6lOeUqOWFpeWPo1xuLy8gTW9kdWxlOiBndWx1XG4vLyBEZXBlbmRlbmNpZXM6XG4vLyAgICBuZ1JvdXRlLCBodHRwSW50ZXJjZXB0b3JzLCBndWx1Lm1pc3NpbmdcblxuLyogZ2xvYmFsIGZhbGxiYWNrSGFzaCAqL1xuYW5ndWxhclxuICAubW9kdWxlKCdndWx1JywgW1xuICAgICd1aS5yb3V0ZXInLFxuICAgICduZ0xvY2FsZScsXG4gICAgJ3RvYXN0cicsXG4gICAgJ3VpLmJvb3RzdHJhcCcsXG4gICAgJ2N1c3RvbS5kaXJlY3RpdmVzJyxcbiAgICAnaHR0cEludGVyY2VwdG9ycycsXG4gICAgJ0xvY2FsU3RvcmFnZU1vZHVsZScsXG4gICAgJ2NoaWVmZmFuY3lwYW50cy5sb2FkaW5nQmFyJyxcbiAgICAndXRpbC5maWx0ZXJzJyxcbiAgICAndXRpbC5kYXRlJyxcbiAgICAndXRpbC5maWxlcicsXG4gICAgJ3V0aWwudXBsb2FkZXInLFxuICAgICd1dGlsLmtleW1ncicsXG4gICAgJ2d1bHUuaW5kZW50JyxcbiAgICAnZ3VsdS5yZXBvcnQnLFxuICAgICdndWx1LmxvZ2luJyxcbiAgICAnZ3VsdS5taXNzaW5nJ1xuICBdKVxuICAuY29uZmlnKGZ1bmN0aW9uKCRsb2NhdGlvblByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIsICRsb2dQcm92aWRlciwgbG9jYWxTdG9yYWdlU2VydmljZVByb3ZpZGVyKSB7XG4gICAgLy8gbm90IHVzZSBodG1sNSBoaXN0b3J5IGFwaVxuICAgIC8vIGJ1dCB1c2UgaGFzaGJhbmdcbiAgICAkbG9jYXRpb25Qcm92aWRlclxuICAgICAgLmh0bWw1TW9kZShmYWxzZSlcbiAgICAgIC5oYXNoUHJlZml4KCchJyk7XG5cbiAgICAvLyBkZWZpbmUgNDA0XG4gICAgJHVybFJvdXRlclByb3ZpZGVyXG4gICAgICAub3RoZXJ3aXNlKCcvbG9naW4nKTtcblxuICAgIC8vIGxvZ2dlclxuICAgICRsb2dQcm92aWRlci5kZWJ1Z0VuYWJsZWQodHJ1ZSk7XG5cbiAgICAvLyBsb2NhbFN0b3JhZ2UgcHJlZml4XG4gICAgbG9jYWxTdG9yYWdlU2VydmljZVByb3ZpZGVyXG4gICAgICAuc2V0UHJlZml4KCdndWx1LnRlc3RlcicpXG4gICAgICAuc2V0Tm90aWZ5KHRydWUsIHRydWUpO1xuXG4gICAgLy8gQVBJIFNlcnZlclxuICAgIEFQSV9TRVJWRVJTID0ge1xuICAgICAgdGVzdGVyOiAnaHR0cDovL3QuaWZkaXUuY29tJ1xuICAgICAgLy8gdGVzdGVyOiAnaHR0cDovL28uZHA6MzAwMCdcbiAgICB9XG5cbiAgICBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQpLm9uKCdkZXZpY2VyZWFkeScsIGZ1bmN0aW9uKCkge1xuICAgICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50KS5vbignYmFja2J1dHRvbicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KVxuICAucnVuKGZ1bmN0aW9uKCRyb290U2NvcGUsICRsb2NhdGlvbiwgJHN0YXRlLCAkc3RhdGVQYXJhbXMpIHtcbiAgICB2YXIgcmVnID0gL1tcXCZcXD9dXz1cXGQrLztcblxuICAgICRyb290U2NvcGUuJHN0YXRlID0gJHN0YXRlO1xuICAgICRyb290U2NvcGUuJHN0YXRlUGFyYW1zID0gJHN0YXRlUGFyYW1zO1xuICAgICRyb290U2NvcGUuaXNDb2xsYXBzZWQgPSB0cnVlO1xuXG4gICAgLy8g55So5LqO6L+U5Zue5LiK5bGC6aG16Z2iXG4gICAgJHJvb3RTY29wZVxuICAgICAgLiR3YXRjaChmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuICRsb2NhdGlvbi51cmwoKTtcbiAgICAgIH0sIGZ1bmN0aW9uKGN1cnJlbnQsIG9sZCkge1xuICAgICAgICBpZiAoY3VycmVudC5yZXBsYWNlKHJlZywgJycpID09PSBvbGQucmVwbGFjZShyZWcsICcnKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgICRyb290U2NvcGUuYmFja1VybCA9IG9sZDtcbiAgICAgIH0pO1xuXG4gICAgJHJvb3RTY29wZS5iYWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICAkbG9jYXRpb24udXJsKCRyb290U2NvcGUuYmFja1VybCk7XG4gICAgfVxuICB9KTtcblxuIiwiYW5ndWxhclxuICAubW9kdWxlKCdndWx1LmluZGVudCcsIFtcbiAgICAndWkucm91dGVyJyxcbiAgICAndXRpbC51cGxvYWRlcicsXG4gICAgJ3V0aWwuZmlsZXInLFxuICAgICd1dGlsLmtleW1ncicsXG4gICAgJ2d1bHUuaW5kZW50LnN2Y3MnLFxuICAgICdndWx1LmluZGVudC5lbnVtcydcbiAgXSlcbiAgLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyXG4gICAgICAuc3RhdGUoJ2luZGVudHMnLCB7XG4gICAgICAgIGFic3RyYWN0OiB0cnVlLFxuICAgICAgICB1cmw6ICcvaW5kZW50cycsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnaW5kZW50L2Rhc2hib2FyZC5odG0nLFxuICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgSW5kZW50RW51bXM6ICdJbmRlbnRFbnVtcydcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC5zdGF0ZSgnaW5kZW50cy5saXN0Jywge1xuICAgICAgICB1cmw6ICcnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2luZGVudC9zZWFyY2guaHRtJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0luZGVudExpc3RDdHJsJ1xuICAgICAgfSlcbiAgICAgIC5zdGF0ZSgnaW5kZW50cy51bmNvbmZpcm1lZCcsIHtcbiAgICAgICAgdXJsOiAnL3VuY29uZmlybWVkJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdpbmRlbnQvbGlzdF91bmNvbmZpcm1lZC5odG0nLFxuICAgICAgICBjb250cm9sbGVyOiAnSW5kZW50TGlzdEN0cmwnXG4gICAgICB9KVxuICAgICAgLnN0YXRlKCdpbmRlbnRzLnVudGVzdGVkJywge1xuICAgICAgICB1cmw6ICcvdW50ZXN0ZWQnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2luZGVudC9saXN0X3VudGVzdGVkLmh0bScsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdVbnRlc3RlZEluZGVudExpc3RDdHJsJ1xuICAgICAgfSk7XG4gIH0pO1xuIiwiYW5ndWxhclxuICAubW9kdWxlKCdndWx1LmxvZ2luJywgW1xuICAgICd1aS5yb3V0ZXInLFxuICAgICdndWx1LmxvZ2luLnN2Y3MnXG4gIF0pXG5cbiAgLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyXG4gICAgICAuc3RhdGUoJ2xvZ2luJywge1xuICAgICAgICB1cmw6ICcvbG9naW4nLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2xvZ2luL2xvZ2luLmh0bScsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdMb2dpbkN0cmwnXG4gICAgICB9KTtcbiAgfSk7XG4iLCJhbmd1bGFyXG4gIC5tb2R1bGUoJ2d1bHUucmVwb3J0JywgW1xuICAgICd1aS5yb3V0ZXInLFxuICAgICd1dGlsLnZtJyxcbiAgICAndXRpbC5rZXltZ3InLFxuICAgICdndWx1LnJlcG9ydC5zdmNzJyxcbiAgICAnZ3VsdS5pbmRlbnQuZW51bXMnXG4gIF0pXG4gIC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlclxuICAgICAgLnN0YXRlKCdpbmRlbnRzLmlucHV0X3JlcG9ydCcsIHtcbiAgICAgICAgdXJsOiAnL3tpbmRlbnRfaWQ6WzAtOV0rfS9jYXIve2Nhcl9pZDpbMC05XSt9L3JlcG9ydCcsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAncmVwb3J0L2lucHV0X2Rhc2hib2FyZC5odG0nLFxuICAgICAgICBjb250cm9sbGVyOiAnSW5wdXREYXNoYm9hcmRDdHJsJ1xuICAgICAgfSlcbiAgICAgIC5zdGF0ZSgnaW5kZW50cy5pbnB1dF9yZXBvcnQucGhvdG8nLCB7XG4gICAgICAgIHVybDogJy9waG90bycsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAncmVwb3J0L2lucHV0X3Bob3RvLmh0bScsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdQaG90b1JlcG9ydEVkaXRDdHJsJ1xuICAgICAgfSlcbiAgICAgIC5zdGF0ZSgnaW5kZW50cy5pbnB1dF9yZXBvcnQucGFydCcsIHtcbiAgICAgICAgdXJsOiAnL3twYXJ0X2lkOlswLTlhLXpBLVpdK30nLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ3JlcG9ydC9pbnB1dC5odG0nLFxuICAgICAgICBjb250cm9sbGVyOiAnUmVwb3J0RWRpdEN0cmwnXG4gICAgICB9KVxuICAgICAgLnN0YXRlKCdpbmRlbnRzLnJlcG9ydHMnLCB7XG4gICAgICAgIHVybDogJy9yZXBvcnRzJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdyZXBvcnQvbGlzdC5odG0nLFxuICAgICAgICBjb250cm9sbGVyOiAnUmVwb3J0TGlzdEN0cmwnXG4gICAgICB9KTtcbiAgfSk7XG4iLCIvLyDoh6rlrprkuYkgZGlyZWN0aXZlc1xuXG5hbmd1bGFyXG4gIC5tb2R1bGUoJ2N1c3RvbS5kaXJlY3RpdmVzJywgW10pXG4gIC5kaXJlY3RpdmUoJ25nSW5kZXRlcm1pbmF0ZScsIGZ1bmN0aW9uKCRjb21waWxlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cmlidXRlcykge1xuICAgICAgICBzY29wZS4kd2F0Y2goYXR0cmlidXRlc1snbmdJbmRldGVybWluYXRlJ10sIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgZWxlbWVudC5wcm9wKCdpbmRldGVybWluYXRlJywgISF2YWx1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gIH0pO1xuIiwiYW5ndWxhclxuICAubW9kdWxlKCd1dGlsLmZpbHRlcnMnLCBbXSlcblxuICAuZmlsdGVyKCdtb2JpbGUnLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24ocykge1xuICAgICAgaWYgKHMgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgICB9XG5cbiAgICAgIHMgPSBzLnJlcGxhY2UoL1tcXHNcXC1dKy9nLCAnJyk7XG5cbiAgICAgIGlmIChzLmxlbmd0aCA8IDMpIHtcbiAgICAgICAgcmV0dXJuIHM7XG4gICAgICB9XG5cbiAgICAgIHZhciBzYSA9IHMuc3BsaXQoJycpO1xuXG4gICAgICBzYS5zcGxpY2UoMywgMCwgJy0nKTtcblxuICAgICAgaWYgKHMubGVuZ3RoID49IDcpIHtcbiAgICAgICAgc2Euc3BsaWNlKDgsIDAsICctJyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzYS5qb2luKCcnKTtcbiAgICB9O1xuICB9KTtcbiIsImFuZ3VsYXJcbiAgLm1vZHVsZSgndXRpbC5kYXRlJywgW10pXG4gIC5mYWN0b3J5KCdEYXRlVXRpbCcsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdG9TdHJpbmcgPSBmdW5jdGlvbiAoZGF0ZSwgcykge1xuICAgICAgcmV0dXJuIGRhdGUuZ2V0RnVsbFllYXIoKSArIHMgKyAoZGF0ZS5nZXRNb250aCgpICsgMSkgKyBzICsgZGF0ZS5nZXREYXRlKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHRvTG9jYWxEYXRlU3RyaW5nOiBmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgICByZXR1cm4gdG9TdHJpbmcoZGF0ZSwgJy0nKTtcbiAgICAgIH0sXG5cbiAgICAgIHRvTG9jYWxUaW1lU3RyaW5nOiBmdW5jdGlvbihkYXRlKSB7XG4gICAgICAgIHZhciBoID0gZGF0ZS5nZXRIb3VycygpO1xuICAgICAgICB2YXIgbSA9IGRhdGUuZ2V0TWludXRlcygpO1xuXG4gICAgICAgIGlmIChoIDwgMTApIHtcbiAgICAgICAgICBoID0gJzAnICsgaDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtIDwgMTApIHtcbiAgICAgICAgICBtID0gJzAnICsgbTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBbdG9TdHJpbmcoZGF0ZSwgJy0nKSwgaCArICc6JyArIG1dLmpvaW4oJyAnKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pOyIsIi8vIOaemuS4viBTZXJ2aWNlXG5hbmd1bGFyXG4gIC5tb2R1bGUoJ3V0aWwuZW51bXMnLCBbXSlcbiAgLmZhY3RvcnkoJ0VudW1zJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoRU5VTVMpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZhbDogZnVuY3Rpb24gKG5hbWUsIHRleHQpIHtcbiAgICAgICAgICByZXR1cm4gRU5VTVNbbmFtZV0uZmluZChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW0udGV4dCA9PT0gdGV4dDtcbiAgICAgICAgICB9KS52YWx1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgdGV4dDogZnVuY3Rpb24gKG5hbWUsIHZhbCkge1xuICAgICAgICAgIHJldHVybiBFTlVNU1tuYW1lXS5maW5kKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICByZXR1cm4gaXRlbS52YWx1ZSA9PT0gdmFsO1xuICAgICAgICAgIH0pLnRleHQ7XG4gICAgICAgIH0sXG4gICAgICAgIGl0ZW06IGZ1bmN0aW9uIChuYW1lLCB2YWwpIHtcbiAgICAgICAgICByZXR1cm4gRU5VTVNbbmFtZV0uZmluZChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW0udmFsdWUgPT09IHZhbDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgaXRlbTR0ZXh0OiBmdW5jdGlvbihuYW1lLCB0ZXh0KSB7XG4gICAgICAgICAgcmV0dXJuIEVOVU1TW25hbWVdLmZpbmQoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW0udGV4dCA9PT0gdGV4dDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgbGlzdDogZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgICByZXR1cm4gRU5VTVNbbmFtZV07XG4gICAgICAgIH0sXG4gICAgICAgIGl0ZW1zOiBmdW5jdGlvbiAobmFtZSwgdmFscykge1xuICAgICAgICAgIHJldHVybiBFTlVNU1tuYW1lXS5maWx0ZXIoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgIHJldHVybiB2YWxzLmluZGV4T2YoaXRlbS52YWx1ZSkgIT09IC0xO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH07XG4gIH0pOyIsIi8qIGdsb2JhbCBhbmd1bGFyKi9cbmFuZ3VsYXJcbiAgLm1vZHVsZSgndXRpbC5maWxlcicsIFtdKVxuICAuZmFjdG9yeSgnRmlsZXInLCBmdW5jdGlvbigkd2luZG93LCAkbG9nKSB7XG4gICAgdmFyIGZpbGVyID0ge307XG4gICAgZmlsZXIucmVtb3ZlID0gZnVuY3Rpb24odXJsKSB7XG4gICAgICAkd2luZG93LnJlc29sdmVMb2NhbEZpbGVTeXN0ZW1VUkwodXJsLCBmaWxlci5mc1N1Y2Nlc3MsIGZpbGVyLmZzRXJyb3IpO1xuICAgIH07XG5cbiAgICBmaWxlci5mc1N1Y2Nlc3MgPSBmdW5jdGlvbihmaWxlRW50cnkpIHtcbiAgICAgIGZpbGVFbnRyeS5yZW1vdmUoZnVuY3Rpb24oKSB7XG4gICAgICAgICRsb2cuaW5mbygn5Yig6Zmk5pys5Zyw5Zu+54mH5oiQ5YqfOiAnICsgZmlsZUVudHJ5LmZ1bGxQYXRoKTtcbiAgICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICAkbG9nLmluZm8oJ+WIoOmZpOacrOWcsOWbvueJh+Wksei0pTogJyArIGZpbGVFbnRyeS5mdWxsUGF0aCk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgZmlsZXIuZnNFcnJvciA9IGZ1bmN0aW9uKGV2dCkge1xuICAgICAgJGxvZy5pbmZvKCfojrflj5bmnKzlnLDlm77niYflpLHotKU6ICcgKyBKU09OLnN0cmluZ2lmeShldnQudGFyZ2V0KSk7XG4gICAgfTtcblxuICAgIHJldHVybiBmaWxlcjtcbiAgfSk7IiwiYW5ndWxhclxuICAubW9kdWxlKCdodHRwSW50ZXJjZXB0b3JzJywgW10pXG5cbiAgLmNvbmZpZyhmdW5jdGlvbigkaHR0cFByb3ZpZGVyKSB7XG4gICAgJGh0dHBQcm92aWRlci5pbnRlcmNlcHRvcnMucHVzaCgnaHR0cEludGVyY2VwdG9yJyk7XG4gICAgXG4gICAgLy8gQW5ndWxhciAkaHR0cCBpc27igJl0IGFwcGVuZGluZyB0aGUgaGVhZGVyIFgtUmVxdWVzdGVkLVdpdGggPSBYTUxIdHRwUmVxdWVzdCBzaW5jZSBBbmd1bGFyIDEuMy4wXG4gICAgJGh0dHBQcm92aWRlci5kZWZhdWx0cy5oZWFkZXJzLmNvbW1vbltcIlgtUmVxdWVzdGVkLVdpdGhcIl0gPSAnWE1MSHR0cFJlcXVlc3QnO1xuICAgICRodHRwUHJvdmlkZXIuZGVmYXVsdHMuaGVhZGVycy5wb3N0WydDb250ZW50LVR5cGUnXSA9ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQ7Y2hhcnNldD11dGYtOCc7XG4gICAgJGh0dHBQcm92aWRlci5kZWZhdWx0cy50cmFuc2Zvcm1SZXF1ZXN0ID0gW2Z1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIHN0ciA9IFtdO1xuICAgICAgICBcbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKGRhdGEsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICB0aGlzLnB1c2goZW5jb2RlVVJJQ29tcG9uZW50KGtleSkgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpKTtcbiAgICAgICAgfSwgc3RyKTtcblxuICAgICAgICByZXR1cm4gc3RyLmpvaW4oJyYnKTtcbiAgICB9XTtcbiAgfSlcblxuICAuZmFjdG9yeSgnaHR0cEludGVyY2VwdG9yJywgZnVuY3Rpb24oJHEsICRyb290U2NvcGUsICRsb2NhdGlvbikge1xuICAgIHJldHVybiB7XG4gICAgICAvLyDor7fmsYLliY3kv67mlLkgcmVxdWVzdCDphY3nva5cbiAgICAgICdyZXF1ZXN0JzogZnVuY3Rpb24oY29uZmlnKSB7XG4gICAgICAgIGNvbmZpZy5oZWFkZXJzLkF1dGhvcml6YXRpb24gPSB3aW5kb3cuQXV0aG9yaXphdGlvbiB8fCBudWxsO1xuICAgICAgICBjb25maWcuaGVhZGVycy5DU1JGVG9rZW4gPSB3aW5kb3cuQ1NSRlRva2VuIHx8IG51bGw7XG4gICAgICAgIFxuICAgICAgICAvLyDoi6Xor7fmsYLnmoTmmK/mqKHmnb/vvIzmiJblt7LliqDkuIrml7bpl7TmiLPnmoQgdXJsIOWcsOWdgO+8jOWImeS4jemcgOimgeWKoOaXtumXtOaIs1xuICAgICAgICBpZiAoY29uZmlnLnVybC5pbmRleE9mKCcuaHRtJykgIT09IC0xIHx8IGNvbmZpZy51cmwuaW5kZXhPZignP189JykgIT09IC0xKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbmZpZztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbmZpZy51cmwgPSBjb25maWcudXJsICsgJz9fPScgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuICAgICAgICByZXR1cm4gY29uZmlnO1xuICAgICAgfSxcblxuICAgICAgLy8g6K+35rGC5Ye66ZSZ77yM5Lqk57uZIGVycm9yIGNhbGxiYWNrIOWkhOeQhlxuICAgICAgJ3JlcXVlc3RFcnJvcic6IGZ1bmN0aW9uKHJlamVjdGlvbikge1xuICAgICAgICByZXR1cm4gJHEucmVqZWN0KHJlamVjdGlvbik7XG4gICAgICB9LFxuXG4gICAgICAvLyDlk43lupTmlbDmja7mjInnuqblrprlpITnkIZcbiAgICAgIC8vIHtcbiAgICAgIC8vICAgY29kZTogMjAwLCAvLyDoh6rlrprkuYnnirbmgIHnoIHvvIwyMDAg5oiQ5Yqf77yM6Z2eIDIwMCDlnYfkuI3miJDlip9cbiAgICAgIC8vICAgbXNnOiAn5pON5L2c5o+Q56S6JywgLy8g5LiN6IO95ZKMIGRhdGEg5YWx5a2YXG4gICAgICAvLyAgIGRhdGE6IHt9IC8vIOeUqOaIt+aVsOaNrlxuICAgICAgLy8gfVxuICAgICAgJ3Jlc3BvbnNlJzogZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgLy8g5pyN5Yqh56uv6L+U5Zue55qE5pyJ5pWI55So5oi35pWw5o2uXG4gICAgICAgIHZhciBkYXRhLCBjb2RlO1xuXG4gICAgICAgIGlmIChhbmd1bGFyLmlzT2JqZWN0KHJlc3BvbnNlLmRhdGEpKSB7XG4gICAgICAgICAgY29kZSA9IHJlc3BvbnNlLmRhdGEuY29kZTtcbiAgICAgICAgICBkYXRhID0gcmVzcG9uc2UuZGF0YS5kYXRhO1xuXG4gICAgICAgICAgLy8g6IulIHN0YXR1cyAyMDAsIOS4lCBjb2RlICEyMDDvvIzliJnov5Tlm57nmoTmmK/mk43kvZzplJnor6/mj5DnpLrkv6Hmga9cbiAgICAgICAgICAvLyDpgqPkuYjvvIxjYWxsYmFjayDkvJrmjqXmlLbliLDkuIvpnaLlvaLlvI/nmoTlj4LmlbDvvJpcbiAgICAgICAgICAvLyB7IGNvZGU6IDIwMDAxLCBtc2c6ICfmk43kvZzlpLHotKUnIH1cbiAgICAgICAgICBpZiAoY29kZSAhPT0gMjAwKSB7XG4gICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHJlc3BvbnNlKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDoi6XmnI3liqHnq6/ov5Tlm57nmoQgZGF0YSAhbnVsbO+8jOWImei/lOWbnueahOaYr+acieaViOWcsOeUqOaIt+aVsOaNrlxuICAgICAgICAgIC8vIOmCo+S5iO+8jGNhbGxiYWNrIOS8muaOpeaUtuWIsOS4i+mdouW9ouW8j+WPguaVsO+8mlxuICAgICAgICAgIC8vIHsgaXRlbXM6IFsuLi5dLCB0b3RhbF9jb3VudDogMTAwIH1cbiAgICAgICAgICBpZiAoZGF0YSAhPSBudWxsKSB7XG4gICAgICAgICAgICByZXNwb25zZS5kYXRhID0gZGF0YTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDoi6XmnI3liqHnq6/ov5Tlm57nmoQgZGF0YSDlgLzkuLogbnVsbO+8jOWImei/lOWbnueahOaYr+aPkOekuuS/oeaBr1xuICAgICAgICAgIC8vIOmCo+S5iCBjYWxsYmFjayDkvJrmjqXmlLbliLDkuIvpnaLlvaLlvI/nmoTlj4LmlbDvvJpcbiAgICAgICAgICAvLyB7IGNvZGU6IDIwMCwgbXNnOiAn5pON5L2c5oiQ5YqfJyB9XG4gICAgICAgICAgLy8g6buY6K6k5Li65q2kXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICB9LFxuXG4gICAgICAvLyDlk43lupTlh7rplJnvvIzkuqTnu5kgZXJyb3IgY2FsbGJhY2sg5aSE55CGXG4gICAgICAncmVzcG9uc2VFcnJvcic6IGZ1bmN0aW9uKHJlamVjdGlvbikge1xuICAgICAgICB2YXIgY3VycmVudF9wYXRoID0gJGxvY2F0aW9uLnBhdGgoKTtcblxuICAgICAgICBpZiAocmVqZWN0aW9uLnN0YXR1cyA9PT0gNDAxKSB7XG4gICAgICAgICAgJGxvY2F0aW9uLnVybCgnL2xvZ2luJyk7XG4gICAgICAgICAgJGxvY2F0aW9uLnNlYXJjaCgncmVkaXJlY3QnLCBjdXJyZW50X3BhdGgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICRxLnJlamVjdChyZWplY3Rpb24pO1xuICAgICAgfVxuICAgIH07XG4gIH0pOyIsIi8qIGdsb2JhbCBhbmd1bGFyKi9cbmFuZ3VsYXJcbiAgLm1vZHVsZSgndXRpbC5rZXltZ3InLCBbXSlcbiAgLmZhY3RvcnkoJ0tleU1ncicsIGZ1bmN0aW9uKCRsb2csIGxvY2FsU3RvcmFnZVNlcnZpY2UpIHtcbiAgICB2YXIgS2V5TWdyID0ge1xuICAgICAgX19jb25uZWN0b3I6ICdfJyxcbiAgICAgIFxuICAgICAgcmVwb3J0OiBmdW5jdGlvbihvcmRlcl9pZCwgY2FyX2lkKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoICE9PSAyKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdLZXlNZ3IucmVwb3J0KCkg5Y+C5pWw6Z2e5rOVJyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gW29yZGVyX2lkLCBjYXJfaWRdLmpvaW4oS2V5TWdyLl9fY29ubmVjdG9yKTtcbiAgICAgIH0sXG5cbiAgICAgIF9fdHlwZTogZnVuY3Rpb24oZml4LCBvcmRlcl9pZCwgY2FyX2lkKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdLZXlNZ3IuJyArIGZpeCArICcoKSDlj4LmlbDpnZ7ms5UnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOesrOS4gOS4quWPguaVsOaYryByZXBvcnQgS2V5TWdyXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgcmV0dXJuIFtvcmRlcl9pZCwgZml4XS5qb2luKEtleU1nci5fX2Nvbm5lY3Rvcik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gW29yZGVyX2lkLCBjYXJfaWQsIGZpeF0uam9pbihLZXlNZ3IuX19jb25uZWN0b3IpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBhbmd1bGFyLmV4dGVuZChLZXlNZ3IsIHtcbiAgICAgIGVycjogS2V5TWdyLl9fdHlwZS5iaW5kKEtleU1nciwgJ2VycicpLFxuXG4gICAgICBzdGF0dXM6IEtleU1nci5fX3R5cGUuYmluZChLZXlNZ3IsICdzdGF0dXMnKSxcblxuICAgICAgc3VibWl0OiBLZXlNZ3IuX190eXBlLmJpbmQoS2V5TWdyLCAnc3VibWl0JyksXG5cbiAgICAgIGNsZWFyOiBmdW5jdGlvbihvcmRlcl9pZCwgY2FyX2lkKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZVNlcnZpY2UucmVtb3ZlKEtleU1nci5yZXBvcnQob3JkZXJfaWQsIGNhcl9pZCkpO1xuICAgICAgICBsb2NhbFN0b3JhZ2VTZXJ2aWNlLnJlbW92ZShLZXlNZ3Iuc3RhdHVzKG9yZGVyX2lkLCBjYXJfaWQpKTtcbiAgICAgICAgbG9jYWxTdG9yYWdlU2VydmljZS5yZW1vdmUoS2V5TWdyLnN1Ym1pdChvcmRlcl9pZCwgY2FyX2lkKSk7XG4gICAgICAgIGxvY2FsU3RvcmFnZVNlcnZpY2UucmVtb3ZlKEtleU1nci5lcnIob3JkZXJfaWQsIGNhcl9pZCkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgICAgXG4gICAgcmV0dXJuIEtleU1ncjtcbiAgfSk7IiwiLyogZ2xvYmFsIGFuZ3VsYXIsIEZpbGVVcGxvYWRPcHRpb25zLCBGaWxlVHJhbnNmZXIqL1xuLy8g6ZmE5Lu25LiK5Lyg5ZmoXG5hbmd1bGFyXG4gIC5tb2R1bGUoJ3V0aWwudXBsb2FkZXInLCBbXSlcbiAgLmZhY3RvcnkoJ1VwbG9hZGVyJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJGxvZykge1xuICAgIHZhciB2bSA9ICRyb290U2NvcGU7XG4gICAgdmFyIG5vb3AgPSBmdW5jdGlvbigpIHt9O1xuXG4gICAgdmFyIHVwbG9hZGVyID0ge1xuICAgICAgLy8g5om56YeP5LiK5Lyg6ZmE5Lu2XG4gICAgICAvLyDkvp3otZYgJHNjb3BlIOeahCBvYnNlcnZlclxuICAgICAgLy8gXG4gICAgICAvLyBhdHRhY2htZW50czog6ZyA6KaB5LiK5Lyg55qE6ZmE5Lu25YiX6KGoXG4gICAgICAvLyBiYW5kd2lkdGg6IOWQjOaXtuS4iuS8oOeahOaVsOmHj1xuICAgICAgLy8gZG9uZTog5omA5pyJ6ZmE5Lu25LiK5Lyg5a6M5oiQ55qE5Zue6LCD5Ye95pWwXG4gICAgICBiYXRjaDogZnVuY3Rpb24ob3B0KSB7XG4gICAgICAgIGlmICghb3B0LmF0dGFjaG1lbnRzIHx8ICFvcHQudXJsKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCfkuIrkvKDpmYTku7bnvLrlsJHlj4LmlbAnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBjb3VudCA9IG9wdC5hdHRhY2htZW50cy5sZW5ndGg7XG4gICAgICAgIHZhciBpbmRleDtcbiAgICAgICAgdmFyIGNvbXBsZXRlZF9jb3VudCA9IDA7XG5cbiAgICAgICAgLy8g5rKh5pyJ6ZmE5Lu2XG4gICAgICAgIGlmIChjb3VudCA9PT0gMCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBkZWZhdWx0T3B0ID0ge1xuICAgICAgICAgIGJhbmR3aWR0aDogMyxcbiAgICAgICAgICBkb25lOiBub29wLFxuICAgICAgICAgIG9uZTogbm9vcCxcbiAgICAgICAgICBlcnJvcjogbm9vcFxuICAgICAgICB9O1xuXG4gICAgICAgIG9wdCA9IGFuZ3VsYXIuZXh0ZW5kKHt9LCBkZWZhdWx0T3B0LCBvcHQpO1xuXG4gICAgICAgIHZhciBjb21wbGV0ZSA9IGZ1bmN0aW9uKGF0dGFjaG1lbnQpIHtcbiAgICAgICAgICAvLyDmm7TmlrAgYXR0YWNobWVudCDop6blj5HkuIvkuIDkuKrkuIrkvKBcbiAgICAgICAgICBhdHRhY2htZW50LnVwbG9hZGVkID0gdHJ1ZTtcblxuICAgICAgICAgIG9wdC5vbmUuYXBwbHkodXBsb2FkZXIsIGFyZ3VtZW50cyk7XG5cbiAgICAgICAgICBjb21wbGV0ZWRfY291bnQrKztcblxuICAgICAgICAgIG9wdC5vbnByb2dyZXNzKHtcbiAgICAgICAgICAgIGxvYWRlZDogY29tcGxldGVkX2NvdW50LFxuICAgICAgICAgICAgdG90YWw6IGNvdW50LFxuICAgICAgICAgICAgcGVyY2VudDogcGFyc2VJbnQoY29tcGxldGVkX2NvdW50IC8gY291bnQgKiAxMDApXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBpZiAoaW5kZXggPT09IGNvdW50IC0gMSkge1xuICAgICAgICAgICAgaWYgKHZtLl9fYXR0YWNobWVudHNfXykge1xuICAgICAgICAgICAgICB2bS5fX2F0dGFjaG1lbnRzX18gPSBudWxsO1xuICAgICAgICAgICAgICBkZWxldGUgdm0uX19hdHRhY2htZW50c19fO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBvcHQuZG9uZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBvcHQuYXR0YWNobWVudHMgPSBhbmd1bGFyLmNvcHkob3B0LmF0dGFjaG1lbnRzLCBbXSk7XG5cbiAgICAgICAgLy8g5Y+q5pyJ5LiA5Liq6ZmE5Lu2XG4gICAgICAgIGlmIChjb3VudCA9PT0gMSkge1xuICAgICAgICAgIGluZGV4ID0gMDtcbiAgICAgICAgICB1cGxvYWRlci5vbmUoe1xuICAgICAgICAgICAgYXR0YWNobWVudDogb3B0LmF0dGFjaG1lbnRzWzBdLFxuICAgICAgICAgICAgc3VjY2VzczogY29tcGxldGUsXG4gICAgICAgICAgICB1cmw6IG9wdC51cmwsXG4gICAgICAgICAgICBlcnJvcjogb3B0LmVycm9yXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIOmZhOS7tuaVsOmHj+WwkeS6juWQjOaXtuS4iuS8oOeahOaVsOmHj1xuICAgICAgICBpZiAoY291bnQgPCBvcHQuYmFuZHdpZHRoKSB7XG4gICAgICAgICAgaW5kZXggPSBjb3VudCAtIDE7XG4gICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgICAgICAgICB1cGxvYWRlci5vbmUoe1xuICAgICAgICAgICAgICBhdHRhY2htZW50OiBvcHQuYXR0YWNobWVudHNbaV0sXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IGNvbXBsZXRlLFxuICAgICAgICAgICAgICB1cmw6IG9wdC51cmwsXG4gICAgICAgICAgICAgIGVycm9yOiBvcHQuZXJyb3JcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIFxuICAgICAgICBpbmRleCA9IG9wdC5iYW5kd2lkdGggLSAxO1xuICAgICAgICB2bS5fX2F0dGFjaG1lbnRzX18gPSBvcHQuYXR0YWNobWVudHM7XG5cbiAgICAgICAgLy8g5LiK5Lyg5a6M5LiA5Liq5ZCO77yM5LuOIGF0dGFjaG1lbnRzIOS4reWPluWHuuS4i+S4gOS4quS4iuS8oFxuICAgICAgICAvLyDlp4vnu4jkv53mjIHlkIzml7bkuIrkvKDnmoTmlbDph4/kuLogYmFuZHdpZHRoXG4gICAgICAgIHZtLiR3YXRjaENvbGxlY3Rpb24oJ19fYXR0YWNobWVudHNfXycsIGZ1bmN0aW9uKG5ld0F0dGFjaG1lbnRzKSB7XG4gICAgICAgICAgLy8g5om56YeP5LiK5Lyg5a6M5oiQ77yM5Lya5Yig6ZmkIF9fYXR0YWNobWVudHNfX1xuICAgICAgICAgIGlmICghbmV3QXR0YWNobWVudHMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB1cGxvYWRlci5vbmUoe1xuICAgICAgICAgICAgYXR0YWNobWVudDogb3B0LmF0dGFjaG1lbnRzWysraW5kZXhdLFxuICAgICAgICAgICAgc3VjY2VzczogY29tcGxldGUsXG4gICAgICAgICAgICB1cmw6IG9wdC51cmwsXG4gICAgICAgICAgICBlcnJvcjogb3B0LmVycm9yXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgb3B0LmJhbmR3aWR0aDsgaysrKSB7XG4gICAgICAgICAgdXBsb2FkZXIub25lKHtcbiAgICAgICAgICAgIGF0dGFjaG1lbnQ6IG9wdC5hdHRhY2htZW50c1trXSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGNvbXBsZXRlLFxuICAgICAgICAgICAgdXJsOiBvcHQudXJsLFxuICAgICAgICAgICAgZXJyb3I6IG9wdC5lcnJvclxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfSxcblxuICAgICAgLy8g5Y2V5Liq5LiK5LygXG4gICAgICBvbmU6IGZ1bmN0aW9uKG9wdCkge1xuICAgICAgICBpZiAoIW9wdC5hdHRhY2htZW50IHx8ICFvcHQudXJsKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCfkuIrkvKDpmYTku7bnvLrlsJHlj4LmlbAnKTtcbiAgICAgICAgfVxuXG4gICAgICAgICRsb2cuZGVidWcoJ2F0dGFjaG1lbnQ6ICcgKyBKU09OLnN0cmluZ2lmeShvcHQuYXR0YWNobWVudCkpO1xuICAgICAgICBcbiAgICAgICAgdmFyIGRlZmF1bHRPcHQgPSB7XG4gICAgICAgICAgc3VjY2Vzczogbm9vcCxcbiAgICAgICAgICBlcnJvcjogbm9vcCxcbiAgICAgICAgICBmaWxlS2V5OiAnZmlsZUtleScsXG4gICAgICAgICAgZmlsZU5hbWU6IG9wdC5hdHRhY2htZW50LnVybC5zdWJzdHIob3B0LmF0dGFjaG1lbnQudXJsLmxhc3RJbmRleE9mKCcvJykgKyAxKVxuICAgICAgICB9O1xuICAgICAgICB2YXIgY3VzdG9tX29ucHJvZ3Jlc3MgPSBvcHQub25wcm9ncmVzcztcbiAgICAgICAgb3B0ID0gYW5ndWxhci5leHRlbmQoe30sIGRlZmF1bHRPcHQsIG9wdCk7XG4gICAgICAgIG9wdC5vbnByb2dlcnNzID0gZnVuY3Rpb24ocHJvZ3Jlc3NFdmVudCkge1xuICAgICAgICAgIGlmIChwcm9ncmVzc0V2ZW50Lmxlbmd0aENvbXB1dGFibGUpIHsgIFxuICAgICAgICAgICAgLy/lt7Lnu4/kuIrkvKAgIFxuICAgICAgICAgICAgdmFyIGxvYWRlZCA9IHByb2dyZXNzRXZlbnQubG9hZGVkOyAgXG4gICAgICAgICAgICAvL+aWh+S7tuaAu+mVv+W6piAgXG4gICAgICAgICAgICB2YXIgdG90YWwgPSBwcm9ncmVzc0V2ZW50LnRvdGFsOyAgXG4gICAgICAgICAgICAvL+iuoeeul+eZvuWIhuavlO+8jOeUqOS6juaYvuekuui/m+W6puadoSAgXG4gICAgICAgICAgICB2YXIgcGVyY2VudCA9IHBhcnNlSW50KChsb2FkZWQgLyB0b3RhbCkgKiAxMDApO1xuXG4gICAgICAgICAgICBjdXN0b21fb25wcm9ncmVzcyh7XG4gICAgICAgICAgICAgIGxvYWRlZDogbG9hZGVkLFxuICAgICAgICAgICAgICB0b3RhbDogdG90YWwsXG4gICAgICAgICAgICAgIHBlcmNlbnQ6IHBlcmNlbnRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIHZhciBmVU9wdHMgPSBuZXcgRmlsZVVwbG9hZE9wdGlvbnMoKTtcbiAgICAgICAgZlVPcHRzLmZpbGVLZXkgPSBvcHQuZmlsZUtleTtcbiAgICAgICAgZlVPcHRzLmZpbGVOYW1lID0gb3B0LmZpbGVOYW1lO1xuXG4gICAgICAgIHZhciBmdCA9IG5ldyBGaWxlVHJhbnNmZXIoKTtcbiAgICAgICAgZnQub25wcm9ncmVzcyA9IG9wdC5vbnByb2dyZXNzO1xuICAgICAgICBmdC51cGxvYWQoXG4gICAgICAgICAgb3B0LmF0dGFjaG1lbnQudXJsLFxuICAgICAgICAgIGVuY29kZVVSSShvcHQudXJsKSxcbiAgICAgICAgICBvcHQuc3VjY2Vzcy5iaW5kKHVwbG9hZGVyLCBvcHQuYXR0YWNobWVudCksXG4gICAgICAgICAgb3B0LmVycm9yLmJpbmQodXBsb2FkZXIsIG9wdC5hdHRhY2htZW50KSxcbiAgICAgICAgICBmVU9wdHNcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIFxuICAgIHJldHVybiB1cGxvYWRlcjsgXG4gIH0pO1xuIiwiLy8gJHNjb3BlIOWinuW8ulxuYW5ndWxhclxuICAubW9kdWxlKCd1dGlsLnZtJywgW10pXG4gIC5mYWN0b3J5KCdWTScsIGZ1bmN0aW9uICgkbG9nKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRvX2pzb246IGZ1bmN0aW9uKHZtLCBmaWVsZHMpIHtcbiAgICAgICAgdmFyIHJldCA9IHt9O1xuXG4gICAgICAgIGlmIChhbmd1bGFyLmlzU3RyaW5nKGZpZWxkcykpIHtcbiAgICAgICAgICBmaWVsZHMgPSBmaWVsZHMuc3BsaXQoJywnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChmaWVsZHMubGVuZ3RoID09PSAxICYmIGZpZWxkc1swXSA9PT0gJycpIHtcbiAgICAgICAgICAkbG9nLndhcm4oJ+aCqOiwg+eUqOaWueazlSBWTS50b19qc29uIOaXtu+8jOayoeacieS8oOWFpSBmaWVsZHMg5Y+C5pWwJyk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFhbmd1bGFyLmlzQXJyYXkoZmllbGRzKSkge1xuICAgICAgICAgICRsb2cuZXJyb3IoJ+aWueazlSBWTS50b19qc29uIOWPquaOpeWPl+Wtl+espuS4suaVsOe7hOaIlumAl+WPt+WIhumalOeahOWtl+espuS4suaIluS4gOS4quS4jeWQq+mAl+WPt+eahOWtl+espuS4sicpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGZpZWxkcy5tYXAoZnVuY3Rpb24oZmllbGQpIHtcbiAgICAgICAgICByZXR1cm4gcmV0W2ZpZWxkXSA9IHZtW2ZpZWxkXTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgIH1cbiAgICB9O1xuICB9KTsiLCIndXNlIHN0cmljdCc7XG5hbmd1bGFyLm1vZHVsZShcIm5nTG9jYWxlXCIsIFtdLCBbXCIkcHJvdmlkZVwiLCBmdW5jdGlvbigkcHJvdmlkZSkge1xuICB2YXIgUExVUkFMX0NBVEVHT1JZID0ge1xuICAgIFpFUk86IFwiemVyb1wiLFxuICAgIE9ORTogXCJvbmVcIixcbiAgICBUV086IFwidHdvXCIsXG4gICAgRkVXOiBcImZld1wiLFxuICAgIE1BTlk6IFwibWFueVwiLFxuICAgIE9USEVSOiBcIm90aGVyXCJcbiAgfTtcbiAgJHByb3ZpZGUudmFsdWUoXCIkbG9jYWxlXCIsIHtcbiAgICBcIkRBVEVUSU1FX0ZPUk1BVFNcIjoge1xuICAgICAgXCJBTVBNU1wiOiBbXG4gICAgICAgIFwiXFx1NGUwYVxcdTUzNDhcIixcbiAgICAgICAgXCJcXHU0ZTBiXFx1NTM0OFwiXG4gICAgICBdLFxuICAgICAgXCJEQVlcIjogW1xuICAgICAgICBcIlxcdTY2MWZcXHU2NzFmXFx1NjVlNVwiLFxuICAgICAgICBcIlxcdTY2MWZcXHU2NzFmXFx1NGUwMFwiLFxuICAgICAgICBcIlxcdTY2MWZcXHU2NzFmXFx1NGU4Y1wiLFxuICAgICAgICBcIlxcdTY2MWZcXHU2NzFmXFx1NGUwOVwiLFxuICAgICAgICBcIlxcdTY2MWZcXHU2NzFmXFx1NTZkYlwiLFxuICAgICAgICBcIlxcdTY2MWZcXHU2NzFmXFx1NGU5NFwiLFxuICAgICAgICBcIlxcdTY2MWZcXHU2NzFmXFx1NTE2ZFwiXG4gICAgICBdLFxuICAgICAgXCJNT05USFwiOiBbXG4gICAgICAgIFwiMVxcdTY3MDhcIixcbiAgICAgICAgXCIyXFx1NjcwOFwiLFxuICAgICAgICBcIjNcXHU2NzA4XCIsXG4gICAgICAgIFwiNFxcdTY3MDhcIixcbiAgICAgICAgXCI1XFx1NjcwOFwiLFxuICAgICAgICBcIjZcXHU2NzA4XCIsXG4gICAgICAgIFwiN1xcdTY3MDhcIixcbiAgICAgICAgXCI4XFx1NjcwOFwiLFxuICAgICAgICBcIjlcXHU2NzA4XCIsXG4gICAgICAgIFwiMTBcXHU2NzA4XCIsXG4gICAgICAgIFwiMTFcXHU2NzA4XCIsXG4gICAgICAgIFwiMTJcXHU2NzA4XCJcbiAgICAgIF0sXG4gICAgICBcIlNIT1JUREFZXCI6IFtcbiAgICAgICAgXCJcXHU1NDY4XFx1NjVlNVwiLFxuICAgICAgICBcIlxcdTU0NjhcXHU0ZTAwXCIsXG4gICAgICAgIFwiXFx1NTQ2OFxcdTRlOGNcIixcbiAgICAgICAgXCJcXHU1NDY4XFx1NGUwOVwiLFxuICAgICAgICBcIlxcdTU0NjhcXHU1NmRiXCIsXG4gICAgICAgIFwiXFx1NTQ2OFxcdTRlOTRcIixcbiAgICAgICAgXCJcXHU1NDY4XFx1NTE2ZFwiXG4gICAgICBdLFxuICAgICAgXCJTSE9SVE1PTlRIXCI6IFtcbiAgICAgICAgXCIxXFx1NjcwOFwiLFxuICAgICAgICBcIjJcXHU2NzA4XCIsXG4gICAgICAgIFwiM1xcdTY3MDhcIixcbiAgICAgICAgXCI0XFx1NjcwOFwiLFxuICAgICAgICBcIjVcXHU2NzA4XCIsXG4gICAgICAgIFwiNlxcdTY3MDhcIixcbiAgICAgICAgXCI3XFx1NjcwOFwiLFxuICAgICAgICBcIjhcXHU2NzA4XCIsXG4gICAgICAgIFwiOVxcdTY3MDhcIixcbiAgICAgICAgXCIxMFxcdTY3MDhcIixcbiAgICAgICAgXCIxMVxcdTY3MDhcIixcbiAgICAgICAgXCIxMlxcdTY3MDhcIlxuICAgICAgXSxcbiAgICAgIFwiZnVsbERhdGVcIjogXCJ5XFx1NWU3NE1cXHU2NzA4ZFxcdTY1ZTVFRUVFXCIsXG4gICAgICBcImxvbmdEYXRlXCI6IFwieVxcdTVlNzRNXFx1NjcwOGRcXHU2NWU1XCIsXG4gICAgICBcIm1lZGl1bVwiOiBcInl5eXktTS1kIGFoOm1tOnNzXCIsXG4gICAgICBcIm1lZGl1bURhdGVcIjogXCJ5eXl5LU0tZFwiLFxuICAgICAgXCJtZWRpdW1UaW1lXCI6IFwiYWg6bW06c3NcIixcbiAgICAgIFwic2hvcnRcIjogXCJ5eS1NLWQgYWg6bW1cIixcbiAgICAgIFwic2hvcnREYXRlXCI6IFwieXktTS1kXCIsXG4gICAgICBcInNob3J0VGltZVwiOiBcImFoOm1tXCJcbiAgICB9LFxuICAgIFwiTlVNQkVSX0ZPUk1BVFNcIjoge1xuICAgICAgXCJDVVJSRU5DWV9TWU1cIjogXCJcXHUwMGE1XCIsXG4gICAgICBcIkRFQ0lNQUxfU0VQXCI6IFwiLlwiLFxuICAgICAgXCJHUk9VUF9TRVBcIjogXCIsXCIsXG4gICAgICBcIlBBVFRFUk5TXCI6IFt7XG4gICAgICAgIFwiZ1NpemVcIjogMyxcbiAgICAgICAgXCJsZ1NpemVcIjogMyxcbiAgICAgICAgXCJtYWNGcmFjXCI6IDAsXG4gICAgICAgIFwibWF4RnJhY1wiOiAzLFxuICAgICAgICBcIm1pbkZyYWNcIjogMCxcbiAgICAgICAgXCJtaW5JbnRcIjogMSxcbiAgICAgICAgXCJuZWdQcmVcIjogXCItXCIsXG4gICAgICAgIFwibmVnU3VmXCI6IFwiXCIsXG4gICAgICAgIFwicG9zUHJlXCI6IFwiXCIsXG4gICAgICAgIFwicG9zU3VmXCI6IFwiXCJcbiAgICAgIH0sIHtcbiAgICAgICAgXCJnU2l6ZVwiOiAzLFxuICAgICAgICBcImxnU2l6ZVwiOiAzLFxuICAgICAgICBcIm1hY0ZyYWNcIjogMCxcbiAgICAgICAgXCJtYXhGcmFjXCI6IDIsXG4gICAgICAgIFwibWluRnJhY1wiOiAyLFxuICAgICAgICBcIm1pbkludFwiOiAxLFxuICAgICAgICBcIm5lZ1ByZVwiOiBcIihcXHUwMGE0XCIsXG4gICAgICAgIFwibmVnU3VmXCI6IFwiKVwiLFxuICAgICAgICBcInBvc1ByZVwiOiBcIlxcdTAwYTRcIixcbiAgICAgICAgXCJwb3NTdWZcIjogXCJcIlxuICAgICAgfV1cbiAgICB9LFxuICAgIFwiaWRcIjogXCJ6aC1jblwiLFxuICAgIFwicGx1cmFsQ2F0XCI6IGZ1bmN0aW9uKG4pIHtcbiAgICAgIHJldHVybiBQTFVSQUxfQ0FURUdPUlkuT1RIRVI7XG4gICAgfVxuICB9KTtcbn1dKTtcbiIsIi8vIDQwNCDpobXpnaJcbi8vIE1vZHVsZTogZ3VsdS5taXNzaW5nXG4vLyBEZXBlbmRlbmNpZXM6IG5nUm91dGVcblxuYW5ndWxhclxuICAubW9kdWxlKCdndWx1Lm1pc3NpbmcnLCBbJ3VpLnJvdXRlciddKVxuXG4gIC8vIOmFjee9riByb3V0ZVxuICAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyXG4gICAgICAuc3RhdGUoJ21pc3NpbmcnLCB7XG4gICAgICAgIHVybDogJy9taXNzaW5nJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICc0MDQvNDA0Lmh0bScsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdNaXNzaW5nQ3RybCdcbiAgICAgIH0pO1xuICB9KVxuXG4gIC8vIDQwNCBjb250cm9sbGVyXG4gIC5jb250cm9sbGVyKCdNaXNzaW5nQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUpIHtcbiAgICBjb25zb2xlLmxvZygnSWBtIGhlcmUnKTtcbiAgICAvLyBUT0RPOlxuICAgIC8vIDEuIHNob3cgbGFzdCBwYXRoIGFuZCBwYWdlIG5hbWVcbiAgfSk7XG4iLCJhbmd1bGFyXG4gIC5tb2R1bGUoJ2d1bHUuaW5kZW50LmVudW1zJywgWyd1dGlsLmVudW1zJywgXSlcblxuLmZhY3RvcnkoJ0luZGVudEVudW1zJywgZnVuY3Rpb24oRW51bXMsIEluZGVudEVudW1zU3ZjLCB0b2FzdHIpIHtcbiAgcmV0dXJuIEluZGVudEVudW1zU3ZjXG4gICAgICAuZ2V0KClcbiAgICAgIC4kcHJvbWlzZVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgIHZhciBhbGxfcHJlaW5zID0gJ29yZGVyX3R5cGUgb3JkZXJfc3RhdHVzIGNpdHkgaW5zcGVjdG9yIHVzZXJfdHlwZSBvcmRlcl90aHJvdWdoJy5zcGxpdCgnICcpO1xuXG4gICAgICAgIGFsbF9wcmVpbnMuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgICByZXNba2V5XS51bnNoaWZ0KHtcbiAgICAgICAgICAgIHRleHQ6ICflhajpg6gnLFxuICAgICAgICAgICAgdmFsdWU6IG51bGxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmVzWydzaXplJ10gPSBbe1xuICAgICAgICAgIHRleHQ6IDEwLFxuICAgICAgICAgIHZhbHVlOiAxMFxuICAgICAgICB9LCB7XG4gICAgICAgICAgdGV4dDogMTUsXG4gICAgICAgICAgdmFsdWU6IDE1XG4gICAgICAgIH0sIHtcbiAgICAgICAgICB0ZXh0OiAyMCxcbiAgICAgICAgICB2YWx1ZTogMjBcbiAgICAgICAgfSwge1xuICAgICAgICAgIHRleHQ6IDUwLFxuICAgICAgICAgIHZhbHVlOiA1MFxuICAgICAgICB9LCB7XG4gICAgICAgICAgdGV4dDogMTAwLFxuICAgICAgICAgIHZhbHVlOiAxMDBcbiAgICAgICAgfV07XG5cbiAgICAgICAgcmV0dXJuIEVudW1zKHJlcy50b0pTT04oKSk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICB0b2FzdHIuZXJyb3IocmVzLm1zZyB8fCAn6I635Y+W5p6a5Li+5aSx6LSlJyk7XG4gICAgICB9KTtcbn0pO1xuIiwiYW5ndWxhclxuICAubW9kdWxlKCdndWx1LmluZGVudC5zdmNzJywgWyduZ1Jlc291cmNlJ10pXG5cbiAgLnNlcnZpY2UoJ0luZGVudEVudW1zU3ZjJywgZnVuY3Rpb24oJHJlc291cmNlKSB7XG4gICAgcmV0dXJuICRyZXNvdXJjZShBUElfU0VSVkVSUy50ZXN0ZXIgKyAnL3BhcmFtZXRlcnMnKTtcbiAgfSlcbiAgXG4gIC5zZXJ2aWNlKCdJbmRlbnRzU3ZjJywgZnVuY3Rpb24oJHJlc291cmNlKSB7XG4gICAgcmV0dXJuICRyZXNvdXJjZShBUElfU0VSVkVSUy50ZXN0ZXIgKyAnL29yZGVycycsIHt9LCB7XG4gICAgICBxdWVyeToge1xuICAgICAgICBpc0FycmF5OiBmYWxzZVxuICAgICAgfVxuICAgIH0pO1xuICB9KVxuXG4gIC5zZXJ2aWNlKCdJbmRlbnRTdmMnLCBmdW5jdGlvbigkcmVzb3VyY2UpIHtcbiAgICByZXR1cm4gJHJlc291cmNlKEFQSV9TRVJWRVJTLnRlc3RlciArICcvb3JkZXIvOmlkJywge1xuICAgICAgaWQ6ICdAaWQnXG4gICAgfSwge1xuICAgICAgdXBkYXRlOiB7XG4gICAgICAgIG1ldGhvZDogJ1BVVCdcbiAgICAgIH1cbiAgICB9KTtcbiAgfSlcblxuICAuc2VydmljZSgnSW5kZW50QWNjZXB0U3ZjJywgZnVuY3Rpb24oJHJlc291cmNlKSB7XG4gICAgcmV0dXJuICRyZXNvdXJjZShBUElfU0VSVkVSUy50ZXN0ZXIgKyAnL29yZGVyLzppZC9pbnNwZWN0b3JfYWNjZXB0ZWQnLCB7XG4gICAgICBpZDogJ0BpZCdcbiAgICB9LCB7XG4gICAgICB1cGRhdGU6IHtcbiAgICAgICAgbWV0aG9kOiAnUFVUJ1xuICAgICAgfVxuICAgIH0pO1xuICB9KVxuXG4gIC5zZXJ2aWNlKCdJbmRlbnRSZXZva2VSZXF1ZXN0U3ZjJywgZnVuY3Rpb24oJHJlc291cmNlKSB7XG4gICAgcmV0dXJuICRyZXNvdXJjZShBUElfU0VSVkVSUy50ZXN0ZXIgKyAnL29yZGVyLzppZC9yZXZva2VfcmVxdWVzdGVkJywge1xuICAgICAgaWQ6ICdAaWQnXG4gICAgfSwge1xuICAgICAgdXBkYXRlOiB7XG4gICAgICAgIG1ldGhvZDogJ1BVVCdcbiAgICAgIH1cbiAgICB9KTtcbiAgfSlcblxuICAuc2VydmljZSgnVGVzdGVyc1N2YycsIGZ1bmN0aW9uKCRyZXNvdXJjZSkge1xuICAgIHJldHVybiAkcmVzb3VyY2UoQVBJX1NFUlZFUlMudGVzdGVyICsgJy90ZXN0ZXJzJywge30sIHtcbiAgICAgIHF1ZXJ5OiB7XG4gICAgICAgIGlzQXJyYXk6IGZhbHNlXG4gICAgICB9XG4gICAgfSk7XG4gIH0pXG5cbiAgLnNlcnZpY2UoJ1VudGVzdGVkSW5kZW50c1N2YycsIGZ1bmN0aW9uKCRyZXNvdXJjZSkge1xuICAgIHJldHVybiAkcmVzb3VyY2UoQVBJX1NFUlZFUlMudGVzdGVyICsgJy9vcmRlcnMvaW5zcGVjdG9yX3Rhc2tfdG9kYXknKTtcbiAgfSlcblxuICAuc2VydmljZSgnSW5kZW50Q2Fyc1N2YycsIGZ1bmN0aW9uKCRyZXNvdXJjZSkge1xuICAgIHJldHVybiAkcmVzb3VyY2UoQVBJX1NFUlZFUlMudGVzdGVyICsgJy9vcmRlci86b3JkZXJfaWQvY2FyJywge1xuICAgICAgb3JkZXJfaWQ6ICdAb3JkZXJfaWQnXG4gICAgfSlcbiAgfSlcblxuICAuc2VydmljZSgnSW5kZW50Q2FyU3ZjJywgZnVuY3Rpb24oJHJlc291cmNlKSB7XG4gICAgcmV0dXJuICRyZXNvdXJjZShBUElfU0VSVkVSUy50ZXN0ZXIgKyAnL29yZGVyLzpvcmRlcl9pZC9jYXIvOmNhcl9pZCcsIHtcbiAgICAgIG9yZGVyX2lkOiAnQG9yZGVyX2lkJyxcbiAgICAgIGNhcl9pZDogJ0BjYXJfaWQnXG4gICAgfSwge1xuICAgICAgdXBkYXRlOiB7XG4gICAgICAgIG1ldGhvZDogJ1BVVCdcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7IiwiLyogZ2xvYmFsIGFuZ3VsYXIsIGNvbmZpcm0sIF8gKi9cbmFuZ3VsYXJcbiAgLm1vZHVsZSgnZ3VsdS5pbmRlbnQnKVxuICBcbiAgLmNvbnRyb2xsZXIoJ0luZGVudExpc3RDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkbG9jYXRpb24sIHRvYXN0ciwgJG1vZGFsLFxuICAgIEluZGVudHNTdmMsIEluZGVudFN2YywgSW5kZW50QWNjZXB0U3ZjLCBJbmRlbnRFbnVtcykge1xuICAgIHZhciB2bSA9ICRzY29wZTtcbiAgICB2YXIgcXNvID0gJGxvY2F0aW9uLnNlYXJjaCgpO1xuXG4gICAgdm0uc3RhdHVzX2lkID0gcGFyc2VJbnQocXNvLnN0YXR1c19pZCkgfHwgbnVsbDtcbiAgICBcbiAgICBpZiAodm0uJHN0YXRlLmluY2x1ZGVzKCdpbmRlbnRzLnVuY29uZmlybWVkJykpIHtcbiAgICAgIHZtLnN0YXR1c19pZCA9IDQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZtLmNpdHlfaWQgPSBwYXJzZUludChxc28uY2l0eV9pZCkgfHwgbnVsbDtcbiAgICAgIHZtLmluc3BlY3Rvcl9pZCA9IHBhcnNlSW50KHFzby5pbnNwZWN0b3JfaWQpIHx8IG51bGw7XG4gICAgICAvLyB2bS5yb2xlX2lkID0gcGFyc2VJbnQocXNvLnJvbGVfaWQpIHx8IG51bGw7XG4gICAgICB2bS5yZXF1ZXN0ZXJfbW9iaWxlID0gcXNvLnJlcXVlc3Rlcl9tb2JpbGUgfHwgbnVsbDtcblxuICAgICAgdm0uc3RhdHVzID0gSW5kZW50RW51bXMuaXRlbSgnb3JkZXJfc3RhdHVzJywgdm0uc3RhdHVzX2lkKTtcbiAgICAgIHZtLnN0YXR1c19saXN0ID0gSW5kZW50RW51bXMubGlzdCgnb3JkZXJfc3RhdHVzJyk7XG4gICAgICB2bS5jaXR5ID0gSW5kZW50RW51bXMuaXRlbSgnY2l0eScsIHZtLmNpdHlfaWQpO1xuICAgICAgdm0uY2l0eV9saXN0ID0gSW5kZW50RW51bXMubGlzdCgnY2l0eScpO1xuICAgICAgLy8gdm0ucm9sZSA9IEluZGVudEVudW1zLml0ZW0oJ3JvbGUnLCB2bS5yb2xlX2lkKTtcbiAgICAgIC8vIHZtLnJvbGVfbGlzdCA9IEluZGVudEVudW1zLmxpc3QoJ3JvbGUnKTtcbiAgICAgIHZtLmluc3BlY3RvciA9IEluZGVudEVudW1zLml0ZW0oJ2luc3BlY3RvcicsIHZtLmluc3BlY3Rvcl9pZCk7XG4gICAgICB2bS5pbnNwZWN0b3JfbGlzdCA9IEluZGVudEVudW1zLmxpc3QoJ2luc3BlY3RvcicpO1xuXG4gICAgICB3YXRjaF9saXN0KCdzdGF0dXMnLCAnc3RhdHVzX2lkJyk7XG4gICAgICB3YXRjaF9saXN0KCdjaXR5JywgJ2NpdHlfaWQnKTtcbiAgICAgIC8vIHdhdGNoX2xpc3QoJ3JvbGUnLCAncm9sZV9pZCcpO1xuICAgICAgd2F0Y2hfbGlzdCgnaW5zcGVjdG9yJywgJ2luc3BlY3Rvcl9pZCcpO1xuXG4gICAgICB2bS5zZWFyY2ggPSBzZWFyY2g7XG4gICAgfVxuXG4gICAgdm0ucGFnZSA9IHBhcnNlSW50KHFzby5wYWdlKSB8fCAxO1xuICAgIHZtLnNpemUgPSBwYXJzZUludChxc28uc2l6ZSkgfHwgMjA7XG4gICAgdm0uc2l6ZXMgPSBJbmRlbnRFbnVtcy5saXN0KCdzaXplJyk7XG4gICAgdm0uc2l6ZV9pdGVtID0gSW5kZW50RW51bXMuaXRlbSgnc2l6ZScsIHZtLnNpemUpO1xuXG4gICAgdm0uc2l6ZV9jaGFuZ2UgPSBzaXplX2NoYW5nZTtcbiAgICB2bS5wYWdlX2NoYW5nZSA9IHBhZ2VfY2hhbmdlO1xuICAgIHZtLmNhbmNlbF9vcmRlciA9IGNhbmNlbF9vcmRlcjtcbiAgICB2bS5jb25maXJtX29yZGVyID0gY29uZmlybV9vcmRlcjtcblxuICAgIHF1ZXJ5KCk7XG5cbiAgICBmdW5jdGlvbiBxdWVyeSgpIHtcbiAgICAgIHZhciBwYXJhbXMgPSB7XG4gICAgICAgIGNpdHlfaWQ6IHZtLmNpdHlfaWQsXG4gICAgICAgIGl0ZW1zX3BhZ2U6IHZtLnNpemUsXG4gICAgICAgIHBhZ2U6IHZtLnBhZ2UsXG5cbiAgICAgICAgc3RhdHVzX2lkOiB2bS5zdGF0dXNfaWRcbiAgICAgIH07XG5cbiAgICAgIGlmICh2bS4kc3RhdGUuaW5jbHVkZXMoJ2luZGVudHMubGlzdCcpKSB7XG4gICAgICAgIGFuZ3VsYXIuZXh0ZW5kKHBhcmFtcywge1xuICAgICAgICAgIGNpdHlfaWQ6IHZtLmNpdHlfaWQsXG4gICAgICAgICAgaW5zcGVjdG9yX2lkOiB2bS5pbnNwZWN0b3JfaWQsXG4gICAgICAgICAgLy8gcm9sZV9pZDogdm0ucm9sZV9pZCxcbiAgICAgICAgICByZXF1ZXN0ZXJfbW9iaWxlOiB2bS5yZXF1ZXN0ZXJfbW9iaWxlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgXG4gICAgICAkbG9jYXRpb24uc2VhcmNoKHBhcmFtcyk7XG5cbiAgICAgIEluZGVudHNTdmNcbiAgICAgICAgLnF1ZXJ5KHBhcmFtcylcbiAgICAgICAgLiRwcm9taXNlXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJzKSB7XG4gICAgICAgICAgcnMuaXRlbXMuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICBpdGVtLnN0YXR1c190ZXh0ID0gSW5kZW50RW51bXMudGV4dCgnb3JkZXJfc3RhdHVzJywgaXRlbS5zdGF0dXNfaWQpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgdm0uaXRlbXMgPSBycy5pdGVtcztcbiAgICAgICAgICB2bS50b3RhbF9jb3VudCA9IHJzLnRvdGFsX2NvdW50O1xuXG4gICAgICAgICAgdmFyIHRtcCA9IHJzLnRvdGFsX2NvdW50IC8gdm0uc2l6ZTtcbiAgICAgICAgICB2bS5wYWdlX2NvdW50ID0gcnMudG90YWxfY291bnQgJSB2bS5zaXplID09PSAwID8gdG1wIDogKE1hdGguZmxvb3IodG1wKSArIDEpO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgdG9hc3RyLmVycm9yKHJlcy5kYXRhLm1zZyB8fCAn5p+l6K+i5aSx6LSl77yM5pyN5Yqh5Zmo5Y+R55Sf5pyq55+l6ZSZ6K+v77yM6K+36YeN6K+VJyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHdhdGNoX2xpc3QobmFtZSwgZmllbGQpIHtcbiAgICAgIHZtLiR3YXRjaChuYW1lLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIGlmICghaXRlbSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZtW2ZpZWxkXSA9IGl0ZW0udmFsdWU7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyDnoa7orqTorqLljZVcbiAgICBmdW5jdGlvbiBjb25maXJtX29yZGVyKGl0ZW0pIHtcbiAgICAgIGlmIChjb25maXJtKCfnoa7orqTmjqXlj5for6XorqLljZU/JykpIHtcbiAgICAgICAgSW5kZW50QWNjZXB0U3ZjXG4gICAgICAgICAgLnVwZGF0ZSh7XG4gICAgICAgICAgICBpZDogaXRlbS5pZFxuICAgICAgICAgIH0pXG4gICAgICAgICAgLiRwcm9taXNlXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICB0b2FzdHIuc3VjY2VzcyhyZXMubXNnIHx8ICfnoa7orqTorqLljZXmiJDlip8nKTtcblxuICAgICAgICAgICAgcXVlcnkoKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5jYXRjaChmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgIHRvYXN0ci5lcnJvcihyZXMubXNnIHx8ICfnoa7orqTorqLljZXlpLHotKXvvIzor7fph43or5UnKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDlj5bmtojorqLljZVcbiAgICBmdW5jdGlvbiBjYW5jZWxfb3JkZXIoaXRlbSkge1xuICAgICAgdmFyIGNhbmNlbF9vcmRlcl9pbnMgPSAkbW9kYWwub3Blbih7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnaW5kZW50L2NhbmNlbF9vcmRlci5odG0nLFxuICAgICAgICBjb250cm9sbGVyOiAnQ2FuY2VsT3JkZXJDdHJsJyxcbiAgICAgICAgYmFja2Ryb3A6ICdzdGF0aWMnLFxuICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgaW5kZW50X2luZm86IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgY2FuY2VsX29yZGVyX2lucy5yZXN1bHQudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gVE9ETzpcbiAgICAgICAgLy8g5pu05paw6aKE57qm5Y2V54q25oCBXG4gICAgICAgIHF1ZXJ5KCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyDmr4/pobXmnaHmlbDmlLnlj5hcbiAgICBmdW5jdGlvbiBzaXplX2NoYW5nZShzaXplKSB7XG4gICAgICB2bS5zaXplID0gc2l6ZTtcbiAgICAgIHZtLnBhZ2UgPSAxO1xuXG4gICAgICBxdWVyeSgpO1xuICAgIH1cblxuICAgIC8vIOe/u+mhtVxuICAgIGZ1bmN0aW9uIHBhZ2VfY2hhbmdlKHBhZ2UpIHtcbiAgICAgIHZtLnBhZ2UgPSBwYWdlO1xuXG4gICAgICBxdWVyeSgpO1xuICAgIH1cblxuICAgIC8vIOafpeivouaPkOS6pFxuICAgIGZ1bmN0aW9uIHNlYXJjaCgpIHtcbiAgICAgIHZtLnBhZ2UgPSAxO1xuXG4gICAgICBxdWVyeSgpO1xuICAgIH1cbiAgfSlcblxuICAuY29udHJvbGxlcignVW50ZXN0ZWRJbmRlbnRMaXN0Q3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJGxvZywgJGxvY2F0aW9uLCAkbW9kYWwsICR0ZW1wbGF0ZUNhY2hlLCB0b2FzdHIsXG4gICAgRmlsZXIsIFVwbG9hZGVyLCBLZXlNZ3IsIGxvY2FsU3RvcmFnZVNlcnZpY2UsIFVudGVzdGVkSW5kZW50c1N2YywgSW5kZW50RW51bXMsXG4gICAgSW5kZW50Q2FyU3ZjLCBSZXBvcnRTdmMpIHtcbiAgICB2YXIgdm0gPSAkc2NvcGU7XG4gICAgdmFyIHBhcnRzID0gSlNPTi5wYXJzZSgkdGVtcGxhdGVDYWNoZS5nZXQoJ3JlcG9ydC9pLmpzb24nKSk7XG5cbiAgICBpZiAocGFydHMgJiYgcGFydHMubGVuZ3RoKSB7XG4gICAgICB2bS5maXJzdF9wYXJ0X2lkID0gcGFydHNbMF0uaWQ7XG4gICAgfVxuXG4gICAgdm0uY2FuY2VsX29yZGVyID0gY2FuY2VsX29yZGVyO1xuICAgIHZtLmRlbF9jYXIgPSBkZWxfY2FyO1xuICAgIHZtLmVkaXRfY2FyID0gZWRpdF9jYXI7XG4gICAgdm0udXBsb2FkX3JlcG9ydCA9IHVwbG9hZF9yZXBvcnQ7XG4gICAgdm0uY2xlYXJfbG9jYWwgPSBjbGVhcl9sb2NhbDtcblxuICAgIHF1ZXJ5KCk7XG5cbiAgICBmdW5jdGlvbiBxdWVyeSgpIHtcbiAgICAgIHJldHVybiBVbnRlc3RlZEluZGVudHNTdmNcbiAgICAgICAgLnF1ZXJ5KClcbiAgICAgICAgLiRwcm9taXNlXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIHJlcy5mb3JFYWNoKGZ1bmN0aW9uKG9yZGVyKSB7XG4gICAgICAgICAgICBvcmRlci5hdXRvLmZvckVhY2goZnVuY3Rpb24oY2FyKSB7XG4gICAgICAgICAgICAgIHZhciByZXBvcnRfc3RhdHVzX2tleSA9IEtleU1nci5zdGF0dXMob3JkZXIuaWQsIGNhci5pZCk7XG4gICAgICAgICAgICAgIGNhci5yZXBvcnRfc3RhdHVzID0gbG9jYWxTdG9yYWdlU2VydmljZS5nZXQocmVwb3J0X3N0YXR1c19rZXkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICB2bS5pdGVtcyA9IHJlcztcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIHRvYXN0ci5lcnJvcihyZXMubXNnIHx8ICfojrflj5blvoXmo4DmtYvorqLljZXlpLHotKUnKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8g5Yqg6L2mIOaIliDnvJbovpHovaZcbiAgICBmdW5jdGlvbiBlZGl0X2NhcihpZCwgY2FyKSB7XG4gICAgICB2YXIgZWRpdF9jYXJfaW5zID0gJG1vZGFsLm9wZW4oe1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2luZGVudC9lZGl0X2Nhci5odG0nLFxuICAgICAgICBjb250cm9sbGVyOiAnSW5kZW50Q2FyRWRpdEN0cmwnLFxuICAgICAgICBiYWNrZHJvcDogJ3N0YXRpYycsXG4gICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICBJbmRlbnRFbnVtczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gSW5kZW50RW51bXM7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBpbmRlbnRfaW5mbzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBpZDogaWQsXG4gICAgICAgICAgICAgIGNhcjogY2FyXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGVkaXRfY2FyX2lucy5yZXN1bHQudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgcXVlcnkoKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIOWIoOmZpOi9plxuICAgIGZ1bmN0aW9uIGRlbF9jYXIob3JkZXJfaWQsIGNhcikge1xuICAgICAgaWYgKGNvbmZpcm0oJ+ehruiupOWIoOmZpCBcIicgKyBbY2FyLmJyYW5kLCBjYXIuc2VyaWVzLCBjYXIubW9kZWxdLmpvaW4oJy0nKSArICdcIicpKSB7XG4gICAgICAgIHJldHVybiBJbmRlbnRDYXJTdmNcbiAgICAgICAgICAucmVtb3ZlKHtcbiAgICAgICAgICAgIG9yZGVyX2lkOiBvcmRlcl9pZCxcbiAgICAgICAgICAgIGNhcl9pZDogY2FyLmlkXG4gICAgICAgICAgfSlcbiAgICAgICAgICAuJHByb21pc2VcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgIEtleU1nci5jbGVhcihvcmRlcl9pZCwgY2FyLmlkKTtcblxuICAgICAgICAgICAgdG9hc3RyLnN1Y2Nlc3MocmVzLm1zZyB8fCAn5Yig6Zmk6L2m5oiQ5YqfJyk7XG5cbiAgICAgICAgICAgIHF1ZXJ5KCk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICB0b2FzdHIuZXJyb3IocmVzLm1zZyB8fCAn5Yig6Zmk6L2m5aSx6LSl77yM6K+36YeN6K+VJyk7XG4gICAgICAgICAgfSk7ICBcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDmuIXpmaRsb2NhbFxuICAgIGZ1bmN0aW9uIGNsZWFyX2xvY2FsKG9yZGVyX2lkLCBjYXIpIHtcbiAgICAgIEtleU1nci5jbGVhcihvcmRlcl9pZCwgY2FyLmlkKTtcbiAgICAgIHRvYXN0ci5zdWNjZXNzKCfmuIXnkIbmnKzlnLDmlbDmja7lrozmiJAnKTtcbiAgICB9XG5cbiAgICAvLyDlj5bmtojorqLljZVcbiAgICBmdW5jdGlvbiBjYW5jZWxfb3JkZXIoaXRlbSkge1xuICAgICAgdmFyIGNhbmNlbF9vcmRlcl9pbnMgPSAkbW9kYWwub3Blbih7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnaW5kZW50L2NhbmNlbF9vcmRlci5odG0nLFxuICAgICAgICBjb250cm9sbGVyOiAnQ2FuY2VsT3JkZXJDdHJsJyxcbiAgICAgICAgYmFja2Ryb3A6ICdzdGF0aWMnLFxuICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgaW5kZW50X2luZm86IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgY2FuY2VsX29yZGVyX2lucy5yZXN1bHQudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgLy8g5Yig6Zmk5omA5pyJ5pys5Zyw5oql5ZGK55u45YWz5pWw5o2uXG4gICAgICAgIGl0ZW0uYXV0by5mb3JFYWNoKGZ1bmN0aW9uKGNhcikge1xuICAgICAgICAgIEtleU1nci5jbGVhcihpdGVtLmlkLCBjYXIuaWQpO1xuICAgICAgICB9KTtcblxuICAgICAgICBxdWVyeSgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8g5LiK5Lyg5oql5ZGKXG4gICAgZnVuY3Rpb24gdXBsb2FkX3JlcG9ydChvcmRlciwgY2FyKSB7XG4gICAgICB2YXIgb3JkZXJfaWQgPSBvcmRlci5pZDtcbiAgICAgIHZhciBjYXJfaWQgPSBjYXIuaWQ7XG5cbiAgICAgIHZhciByZXBvcnRfa2V5ID0gS2V5TWdyLnJlcG9ydChvcmRlcl9pZCwgY2FyX2lkKTtcbiAgICAgIHZhciByZXBvcnRfc3VibWl0X2tleSA9IEtleU1nci5zdWJtaXQocmVwb3J0X2tleSk7XG4gICAgICB2YXIgcmVwb3J0X2RhdGEgPSBsb2NhbFN0b3JhZ2VTZXJ2aWNlLmdldChyZXBvcnRfa2V5KTtcblxuICAgICAgJGxvZy5pbmZvKCflh4blpIfkuIrkvKDmiqXlkYo6ICcgKyByZXBvcnRfa2V5KTtcbiAgICAgICRsb2cuaW5mbygn5oql5ZGK5YiG57G75pWw5o2uOiAnICsgSlNPTi5zdHJpbmdpZnkocmVwb3J0X2RhdGEpKTtcblxuICAgICAgaWYgKCFyZXBvcnRfZGF0YSkge1xuICAgICAgICAkbG9nLmluZm8oJ+aKpeWRiuaVsOaNruS4uuepuu+8jOS4jeeUqOS4iuS8oCcpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNhci5yZXBvcnRfc3RhdHVzLnVwbG9hZF9zdGF0dXMgPSAwO1xuICAgICAgY2FyLnJlcG9ydF9zdGF0dXMudXBsb2FkaW5nID0gdHJ1ZTtcblxuICAgICAgdmFyIHN1Ym1pdF9kYXRhID0ge307XG5cbiAgICAgIE9iamVjdC5rZXlzKHJlcG9ydF9kYXRhKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgICAgICBhbmd1bGFyLmV4dGVuZChzdWJtaXRfZGF0YSwgcmVwb3J0X2RhdGFba2V5XSk7XG4gICAgICB9KTtcblxuICAgICAgJGxvZy5pbmZvKCfmiqXlkYrlvoXmj5DkuqTmlbDmja46ICcgKyBKU09OLnN0cmluZ2lmeShzdWJtaXRfZGF0YSkpO1xuXG4gICAgICB2YXIgaW1hZ2VfZmllbGRzID0ge307XG4gICAgICBPYmplY3Qua2V5cyhzdWJtaXRfZGF0YSkuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgaWYgKHN1Ym1pdF9kYXRhW2tleV0uaW1hZ2UpIHtcbiAgICAgICAgICBpbWFnZV9maWVsZHNba2V5XSA9IGFuZ3VsYXIuZXh0ZW5kKHtcbiAgICAgICAgICAgIHVybDogc3VibWl0X2RhdGFba2V5XS5pbWFnZVxuICAgICAgICAgIH0sIHN1Ym1pdF9kYXRhW2tleV0pO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgdmFyIGltYWdlcyA9IF8udmFsdWVzKGltYWdlX2ZpZWxkcyk7XG5cbiAgICAgIC8vIOayoeacieWbvueJh+mcgOimgeS4iuS8oO+8jOebtOaOpeS4iuS8oOaKpeWRiuWGheWuuVxuICAgICAgaWYgKCFpbWFnZXMubGVuZ3RoKSB7XG4gICAgICAgIHN1Ym1pdF9yZXBvcnQoKTtcblxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgICRsb2cuaW5mbygn5oql5ZGK5Zu+54mH5pWw5o2uOiAnICsgSlNPTi5zdHJpbmdpZnkoaW1hZ2VfZmllbGRzKSk7XG4gICAgICAkbG9nLmluZm8oJ+W8gOWni+S4iuS8oOeFp+eJh+aVsOaNricpO1xuICAgICAgVXBsb2FkZXIuYmF0Y2goe1xuICAgICAgICB1cmw6ICdodHRwOi8vZi5pZmRpdS5jb20nLFxuICAgICAgICBhdHRhY2htZW50czogaW1hZ2VzLFxuICAgICAgICBkb25lOiB1cGxvYWRfZG9uZSxcbiAgICAgICAgb25lOiB1cGxvYWRfb25lLFxuICAgICAgICBvbnByb2dyZXNzOiBvbnByb2dyZXNzLFxuICAgICAgICBlcnJvcjogdXBsb2FkX2Vycm9yXG4gICAgICB9KTtcblxuICAgICAgZnVuY3Rpb24gb25wcm9ncmVzcyhwcm9ncmVzcykge1xuICAgICAgICAvLyAxLiB1cGRhdGUgcHJvZ3Jlc3Mgc3RhdHVzIHRvIHBhZ2VcbiAgICAgICAgJGxvZy5pbmZvKCfkuIrkvKDov5vluqY6ICcgKyBwcm9ncmVzcy5wZXJjZW50KTtcbiAgICAgICAgY2FyLnJlcG9ydF9zdGF0dXMudXBsb2FkX3N0YXR1cyA9IHBhcnNlSW50KHByb2dyZXNzLnBlcmNlbnQgKiAwLjgpO1xuICAgICAgICB2bS4kYXBwbHkoKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gdXBsb2FkX29uZShpbWFnZSwgZmlsZSkge1xuICAgICAgICAvLyBZb3UgY2FuIGRvIHNvbWV0aGluZyBvbiBpbWFnZSB3aXRoIGZpbGUgb2JqZWN0XG4gICAgICAgIGltYWdlLmZpbGVfaWQgPSBmaWxlLmlkO1xuICAgICAgICAkbG9nLmluZm8oJ+aIkOWKn+S4iuS8oOWbvueJhzogJyArIEpTT04uc3RyaW5naWZ5KGltYWdlKSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHVwbG9hZF9lcnJvcihpbWFnZSkge1xuICAgICAgICAkbG9nLmluZm8oJ+S4iuS8oOWbvueJh+WHuumUmTogJyArIEpTT04uc3RyaW5naWZ5KGltYWdlKSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHVwbG9hZF9kb25lKCkge1xuICAgICAgICAvLyAxLiBjb21iaW5lIGltYWdlIGZpbGVpZCB0byBzdWJtaXRfZGF0YVxuICAgICAgICAvLyAyLiBzdG9yZSBpbWFnZSBkYXRhIHRvIGxvY2Fsc3RvcmFnZVxuICAgICAgICAvLyAzLiBzdWJtaXQgcmVwb3J0IGRhdGFcbiAgICAgICAgJGxvZy5pbmZvKCfmiJDlip/kuIrkvKDmiYDmnInlm77niYcnKTtcblxuICAgICAgICAvLyAxXG4gICAgICAgIGltYWdlcy5mb3JFYWNoKGZ1bmN0aW9uKGltYWdlKSB7XG4gICAgICAgICAgc3VibWl0X2RhdGFbaW1hZ2UuaWRdID0gaW1hZ2U7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICRsb2cuaW5mbygn5Zue5YaZ5Zu+54mH5pWw5o2u5YiwIGxvY2Fsc3RvcmFnZScpO1xuXG4gICAgICAgIC8vIDJcbiAgICAgICAgbG9jYWxTdG9yYWdlU2VydmljZS5zZXQocmVwb3J0X3N1Ym1pdF9rZXksIHN1Ym1pdF9kYXRhKTtcblxuICAgICAgICAvLyAzXG4gICAgICAgIHN1Ym1pdF9yZXBvcnQoKTtcbiAgICAgIH1cblxuICAgICAgLy8gMS4gc3VibWl0IHJlcG9ydCBkYXRhXG4gICAgICAvLyAyLiByZW1vdmUgaW1hZ2UgZnJvbSBjYWNoZVxuICAgICAgLy8gMy4gY2xlYXIgcmVwb3J0IGxvY2FsIGRhdGFcbiAgICAgIC8vIDQuIHVwZGF0ZSBvcmRlciBzdGF0dXMgXG4gICAgICBmdW5jdGlvbiBzdWJtaXRfcmVwb3J0KCkge1xuICAgICAgICAkbG9nLmluZm8oJ+W8gOWni+S4iuS8oOaKpeWRiuWGheWuuScpO1xuICAgICAgICAvLyAxXG4gICAgICAgIHJldHVybiBSZXBvcnRTdmNcbiAgICAgICAgICAuc2F2ZSh7XG4gICAgICAgICAgICBvcmRlcl9pZDogb3JkZXJfaWQsXG4gICAgICAgICAgICBjYXJfaWQ6IGNhcl9pZFxuICAgICAgICAgIH0sIHN1Ym1pdF9kYXRhKVxuICAgICAgICAgIC4kcHJvbWlzZVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJGxvZy5pbmZvKCfkuIrkvKDmiqXlkYrlhoXlrrnmiJDlip8nKTtcblxuICAgICAgICAgICAgLy8gMlxuICAgICAgICAgICAgaWYgKGltYWdlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgaW1hZ2VzLmZvckVhY2goZnVuY3Rpb24oaW1hZ2UpIHtcbiAgICAgICAgICAgICAgICBGaWxlci5yZW1vdmUoaW1hZ2UudXJsKTtcbiAgICAgICAgICAgICAgfSk7ICBcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gM1xuICAgICAgICAgICAgS2V5TWdyLmNsZWFyKG9yZGVyX2lkLCBjYXJfaWQpO1xuXG4gICAgICAgICAgICAvLyA0XG4gICAgICAgICAgICBjYXIucmVwb3J0X3N0YXR1cy51cGxvYWRfc3RhdHVzID0gMTAwO1xuICAgICAgICAgICAgY2FyLnJlcG9ydF9zdGF0dXMudXBsb2FkZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICAvLyBxdWVyeSgpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgJGxvZy5pbmZvKCfkuIrkvKDmiqXlkYrlhoXlrrnlpLHotKU6ICcgKyBKU09OLnN0cmluZ2lmeShhcmd1bWVudHMpKTtcbiAgICAgICAgICAgIHRvYXN0ci5lcnJvcihyZXMubXNnIHx8ICfkuIrkvKDov4fnqIvkuK3lj5HnlJ/plJnor6/vvIzor7fph43or5UnKTtcbiAgICAgICAgICAgIC8vIDRcbiAgICAgICAgICAgIGNhci5yZXBvcnRfc3RhdHVzLnVwbG9hZGluZyA9IGZhbHNlO1xuICAgICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfSlcbiAgXG4gIC8vIOWPlua2iOiuouWNlVxuICAuY29udHJvbGxlcignQ2FuY2VsT3JkZXJDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkbW9kYWxJbnN0YW5jZSwgdG9hc3RyLCBJbmRlbnRSZXZva2VSZXF1ZXN0U3ZjLCBpbmRlbnRfaW5mbykge1xuICAgIHZhciB2bSA9ICRzY29wZTtcblxuICAgIGFuZ3VsYXIuZXh0ZW5kKHZtLCBpbmRlbnRfaW5mbyk7XG5cbiAgICB2bS5jYW5jZWxfb3JkZXIgPSBjYW5jZWxfb3JkZXI7XG4gICAgdm0uY2FuY2VsID0gY2FuY2VsO1xuXG4gICAgZnVuY3Rpb24gY2FuY2VsX29yZGVyKCkge1xuICAgICAgdm0uY2FuY2VsX29yZGVyX3N0YXR1cyA9IHRydWU7XG5cbiAgICAgIEluZGVudFJldm9rZVJlcXVlc3RTdmNcbiAgICAgICAgLnVwZGF0ZSh7XG4gICAgICAgICAgaWQ6IGluZGVudF9pbmZvLmlkXG4gICAgICAgIH0sIHtcbiAgICAgICAgICBtZW1vOiB2bS5yZWFzb25cbiAgICAgICAgfSlcbiAgICAgICAgLiRwcm9taXNlXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIHRvYXN0ci5zdWNjZXNzKHJlcy5tc2cgfHwgJ+iuouWNleWPlua2iOaIkOWKnycpO1xuXG4gICAgICAgICAgJG1vZGFsSW5zdGFuY2UuY2xvc2UoKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIHZtLmNhbmNlbF9vcmRlcl9zdGF0dXMgPSBmYWxzZTtcblxuICAgICAgICAgIHRvYXN0ci5lcnJvcihyZXMubXNnIHx8ICforqLljZXlj5bmtojlpLHotKXvvIzor7fph43or5UnKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2FuY2VsKCkge1xuICAgICAgJG1vZGFsSW5zdGFuY2UuZGlzbWlzcygpO1xuICAgIH1cbiAgfSlcblxuICAvLyDliqDovaYg5oiWIOe8lui+kei9plxuICAuY29udHJvbGxlcignSW5kZW50Q2FyRWRpdEN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRtb2RhbEluc3RhbmNlLCB0b2FzdHIsIEluZGVudENhcnNTdmMsXG4gICAgSW5kZW50Q2FyU3ZjLCBJbmRlbnRFbnVtcywgaW5kZW50X2luZm8pIHtcbiAgICB2YXIgdm0gPSAkc2NvcGU7XG5cbiAgICB2bS5icmFuZF9saXN0ID0gSW5kZW50RW51bXMubGlzdCgnYnJhbmQnKTtcbiAgICB2bS5zZXJpZXNfbGlzdCA9IEluZGVudEVudW1zLmxpc3QoJ3NlcmllcycpO1xuICAgIHZtLm1vZGVsX2xpc3QgPSBJbmRlbnRFbnVtcy5saXN0KCdtb2RlbCcpO1xuXG4gICAgaWYgKGluZGVudF9pbmZvLmNhcikge1xuICAgICAgdm0udGl0bGUgPSAn57yW6L6R6L2m5L+h5oGvJztcblxuICAgICAgc2VsZWN0X2l0ZW0oJ2JyYW5kJywgaW5kZW50X2luZm8uY2FyLmJyYW5kKTtcbiAgICAgIHNlbGVjdF9pdGVtKCdzZXJpZXMnLCBpbmRlbnRfaW5mby5jYXIuc2VyaWVzKTtcbiAgICAgIHNlbGVjdF9pdGVtKCdtb2RlbCcsIGluZGVudF9pbmZvLmNhci5tb2RlbCk7ICBcbiAgICB9IGVsc2Uge1xuICAgICAgdm0udGl0bGUgPSAn5Yqg6L2mJztcbiAgICB9XG5cbiAgICB2bS5jYW5jZWwgPSBjYW5jZWw7XG4gICAgdm0uc3VibWl0ID0gc3VibWl0O1xuXG4gICAgZnVuY3Rpb24gc3VibWl0KCkge1xuICAgICAgaWYgKGluZGVudF9pbmZvLmNhcikge1xuICAgICAgICBJbmRlbnRDYXJTdmNcbiAgICAgICAgICAudXBkYXRlKHtcbiAgICAgICAgICAgIG9yZGVyX2lkOiBpbmRlbnRfaW5mby5pZCxcbiAgICAgICAgICAgIGNhcl9pZDogaW5kZW50X2luZm8uY2FyLmlkXG4gICAgICAgICAgfSwge1xuICAgICAgICAgICAgYnJhbmQ6IHZtLmJyYW5kLnZhbHVlLFxuICAgICAgICAgICAgc2VyaWVzOiB2bS5icmFuZC52YWx1ZSxcbiAgICAgICAgICAgIG1vZGVsOiB2bS5tb2RlbC52YWx1ZVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLiRwcm9taXNlXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICB0b2FzdHIuc3VjY2VzcyhyZXMubXNnIHx8ICfnvJbovpHovabovobkv6Hmga/kv53lrZjmiJDlip8nKTtcblxuICAgICAgICAgICAgJG1vZGFsSW5zdGFuY2UuY2xvc2UoKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5jYXRjaChmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgIHRvYXN0ci5lcnJvcihyZXMubXNnIHx8ICfnvJbovpHovabovobkv6Hmga/kv53lrZjlpLHotKUnKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIEluZGVudENhcnNTdmNcbiAgICAgICAgICAuc2F2ZSh7XG4gICAgICAgICAgICBvcmRlcl9pZDogaW5kZW50X2luZm8uaWRcbiAgICAgICAgICB9LCB7XG4gICAgICAgICAgICBicmFuZDogdm0uYnJhbmQudmFsdWUsXG4gICAgICAgICAgICBzZXJpZXM6IHZtLmJyYW5kLnZhbHVlLFxuICAgICAgICAgICAgbW9kZWw6IHZtLm1vZGVsLnZhbHVlXG4gICAgICAgICAgfSlcbiAgICAgICAgICAuJHByb21pc2VcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgIHRvYXN0ci5zdWNjZXNzKHJlcy5tc2cgfHwgJ+WKoOi9puS/oeaBr+S/neWtmOaIkOWKnycpO1xuXG4gICAgICAgICAgICAkbW9kYWxJbnN0YW5jZS5jbG9zZSgpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgdG9hc3RyLmVycm9yKHJlcy5tc2cgfHwgJ+WKoOi9puS/oeaBr+S/neWtmOWksei0pScpO1xuICAgICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNlbGVjdF9pdGVtKGxpc3RfbmFtZSwgdmFsdWUpIHtcbiAgICAgIHZtW2xpc3RfbmFtZV0gPSBJbmRlbnRFbnVtcy5pdGVtNHRleHQobGlzdF9uYW1lLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2FuY2VsKCkge1xuICAgICAgJG1vZGFsSW5zdGFuY2UuZGlzbWlzcygpO1xuICAgIH1cblxuICB9KTtcblxuIiwiYW5ndWxhclxuICAubW9kdWxlKCdndWx1LmxvZ2luJylcbiAgXG4gIC5jb250cm9sbGVyKCdMb2dpbkN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCAkcSwgJGxvY2F0aW9uLCAkdGltZW91dCwgdG9hc3RyLCBMb2dpblN2Yykge1xuICAgIHZhciB2bSA9ICRzY29wZTtcblxuICAgIHZtLmxvZ2luID0gbG9naW47XG5cbiAgICBmdW5jdGlvbiBsb2dpbigpIHtcbiAgICAgIHJldHVybiBMb2dpblN2Y1xuICAgICAgICAuc2F2ZSh7XG4gICAgICAgICAgam9iX25vOiB2bS5qb2Jfbm8sXG4gICAgICAgICAgcGFzc3dvcmQ6IHZtLnBhc3N3b3JkXG4gICAgICAgIH0pXG4gICAgICAgIC4kcHJvbWlzZVxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICB3aW5kb3cuQXV0aG9yaXphdGlvbiA9IHJlcy5BdXRob3JpemF0aW9uO1xuICAgICAgICAgIHdpbmRvdy5DU1JGVG9rZW4gPSByZXMuQ1NSRlRva2VuO1xuICAgICAgICAgIFxuICAgICAgICAgIHRvYXN0ci5zdWNjZXNzKHJlcy5tc2cgfHwgJ+eZu+W9leaIkOWKn++8jOato+WcqOS4uuS9oOi3s+i9rC4uLicpO1xuXG4gICAgICAgICAgdmFyIHFzID0gJGxvY2F0aW9uLnNlYXJjaCgpXG5cbiAgICAgICAgICAkbG9jYXRpb24udXJsKHFzLnJlZGlyZWN0IHx8ICcvaW5kZW50cycpO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgdG9hc3RyLmVycm9yKHJlcy5tc2cgfHwgJ+eZu+W9leWksei0pe+8jOivt+mHjeivlScpO1xuICAgICAgICB9KTtcbiAgICB9XG4gIH0pOyIsImFuZ3VsYXJcbiAgLm1vZHVsZSgnZ3VsdS5sb2dpbi5zdmNzJywgWyduZ1Jlc291cmNlJ10pXG4gIC5zZXJ2aWNlKCdMb2dpblN2YycsIGZ1bmN0aW9uICgkcmVzb3VyY2UpIHtcbiAgICByZXR1cm4gJHJlc291cmNlKEFQSV9TRVJWRVJTLnRlc3RlciArICcvYWNjb3VudC9sb2dpbicpO1xuICB9KSIsImFuZ3VsYXJcbiAgLm1vZHVsZSgnZ3VsdS5yZXBvcnQnKVxuXG4gIC5mYWN0b3J5KCdSZXBvcnRJbnB1dGVyJywgZnVuY3Rpb24oJGxvZywgJHN0YXRlUGFyYW1zLCAkaW50ZXJ2YWwsIFZNLCBsb2NhbFN0b3JhZ2VTZXJ2aWNlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHZtLCBmaWVsZHMsIHJlcG9ydF90eXBlKSB7XG4gICAgICB2YXIgaW5kZW50X2lkID0gJHN0YXRlUGFyYW1zLmluZGVudF9pZDtcbiAgICAgIHZhciBjYXJfaWQgPSAkc3RhdGVQYXJhbXMuY2FyX2lkO1xuXG4gICAgICB2YXIgc3RvcmVfa2V5ID0gW2luZGVudF9pZCwgY2FyX2lkXS5qb2luKCdfJyk7XG5cbiAgICAgIHZhciBpbml0X2RhdGEgPSBsb2NhbFN0b3JhZ2VTZXJ2aWNlLmdldChzdG9yZV9rZXkpO1xuICAgICAgLy8g6K6+572u5Yid5aeL5YyW5YC8XG4gICAgICBhbmd1bGFyLmV4dGVuZCh2bSwgaW5pdF9kYXRhICYmIGluaXRfZGF0YVtyZXBvcnRfdHlwZV0gfHwge30pO1xuXG4gICAgICAvLyDkv53lrZjliLAgbG9jYWxTdG9yYWdlXG4gICAgICBmdW5jdGlvbiBzYXZlKCkge1xuICAgICAgICB2YXIgZGF0YSA9IGxvY2FsU3RvcmFnZVNlcnZpY2UuZ2V0KHN0b3JlX2tleSkgfHwge307XG4gICAgICAgIGRhdGFbcmVwb3J0X3R5cGVdID0gVk0udG9fanNvbih2bSwgZmllbGRzKTtcblxuICAgICAgICBsb2NhbFN0b3JhZ2VTZXJ2aWNlLnNldChzdG9yZV9rZXksIGRhdGEpO1xuXG4gICAgICAgICRsb2cubG9nKCflvZXlhaXmo4DmtYvmiqXlkYogLSAnICsgc3RvcmVfa2V5LCBkYXRhW3JlcG9ydF90eXBlXSk7XG4gICAgICB9XG5cbiAgICAgIHZhciB0aW1lciA9ICRpbnRlcnZhbChzYXZlLCAzMDAwKTtcblxuICAgICAgLy8g5YiH5o2i6aG16Z2i5pe277yM5Y+W5raI6Ieq5Yqo5L+d5a2YKOa4hemZpOWumuaXtuWZqClcbiAgICAgIHZtLiRvbignJGxvY2F0aW9uQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgJGludGVydmFsLmNhbmNlbCh0aW1lcik7XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuXG4iLCIvKiBnbG9iYWwgYW5ndWxhciwgQ2FtZXJhLCBfLCBGdWxsU2NyZWVuSW1hZ2UqL1xuYW5ndWxhclxuICAubW9kdWxlKCdndWx1LnJlcG9ydCcpXG5cbiAgLmNvbnRyb2xsZXIoJ0lucHV0RGFzaGJvYXJkQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlUGFyYW1zLCAkbG9jYXRpb24sICR0ZW1wbGF0ZUNhY2hlLCBsb2NhbFN0b3JhZ2VTZXJ2aWNlLCBLZXlNZ3IpIHtcbiAgICB2YXIgdm0gPSAkc2NvcGU7XG5cbiAgICB2YXIgaW5kZW50X2lkID0gJHN0YXRlUGFyYW1zLmluZGVudF9pZDtcbiAgICB2YXIgY2FyX2lkID0gJHN0YXRlUGFyYW1zLmNhcl9pZDtcbiAgICB2YXIgcmVwb3J0X3N0YXR1c19rZXkgPSBLZXlNZ3Iuc3RhdHVzKGluZGVudF9pZCwgY2FyX2lkKTtcblxuICAgIHZtLnBhcnRzID0gSlNPTi5wYXJzZSgkdGVtcGxhdGVDYWNoZS5nZXQoJ3JlcG9ydC9pLmpzb24nKSk7XG4gICAgXG4gICAgLy8g5LiN55So5bGV56S654Wn54mHXG4gICAgdm0ucGhvdG9fcGFydCA9IHZtLnBhcnRzLnBvcCgpO1xuICAgIFxuICAgIC8vIOm7mOiupOWxleW8gFxuICAgIHZtLnRlc3Rfc3RlcF9uYXZfb3BlbiA9IHRydWU7XG4gICAgdm0udG9nZ2xlX25hdl9vcGVuID0gdG9nZ2xlX25hdl9vcGVuO1xuICAgIHZtLnN1Ym1pdF9wcmV2aWV3ID0gc3VibWl0X3ByZXZpZXc7XG5cbiAgICBmdW5jdGlvbiB0b2dnbGVfbmF2X29wZW4oKSB7XG4gICAgICB2bS50ZXN0X3N0ZXBfbmF2X29wZW4gPSAhdm0udGVzdF9zdGVwX25hdl9vcGVuO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHN1Ym1pdF9wcmV2aWV3KCkge1xuICAgICAgLy8g5Li05pe25pa55qGIXG4gICAgICBsb2NhbFN0b3JhZ2VTZXJ2aWNlLnNldChyZXBvcnRfc3RhdHVzX2tleSwge1xuICAgICAgICBzdWJtaXRlZDogdHJ1ZVxuICAgICAgfSk7XG5cbiAgICAgICRsb2NhdGlvbi51cmwoJy9pbmRlbnRzL3VudGVzdGVkJyk7XG5cbiAgICAgIC8vIFRPRE9cbiAgICAgIC8vIDEuIOi3s+i9rOWIsOaKpeWRiuWxleekuumhtemdoijnoa7orqTmj5DkuqTvvIzlj6/ov5Tlm54pXG4gICAgICAvLyAyLiDlsIborr7nva4gcmVwcm90IHN0YXR1cyBzdWJtaXRlZCDnp7vliLDngrnlh7vnoa7orqTmj5DkuqTlkI5cbiAgICAgIC8vIDMuIOehruiupOaPkOS6pOWImei3s+i9rOWIsOW9k+WkqeS7u+WKoeeVjOmdolxuICAgIH1cbiAgfSlcblxuICAuY29udHJvbGxlcignUGhvdG9SZXBvcnRFZGl0Q3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJGxvZywgJHN0YXRlUGFyYW1zLCAkdGVtcGxhdGVDYWNoZSwgbG9jYWxTdG9yYWdlU2VydmljZSwgS2V5TWdyKSB7XG4gICAgdmFyIHZtID0gJHNjb3BlO1xuXG4gICAgdmFyIG9yZGVyX2lkID0gJHN0YXRlUGFyYW1zLmluZGVudF9pZDtcbiAgICB2YXIgY2FyX2lkID0gJHN0YXRlUGFyYW1zLmNhcl9pZDtcbiAgICAvLyDooajljZXpobnmlbDmja7lrZjlgqjliLDmnKzlnLDnmoQga2V5IOeahOeUn+aIkOinhOWImVxuICAgIHZhciByZXBvcnRfa2V5ID0gS2V5TWdyLnJlcG9ydChvcmRlcl9pZCwgY2FyX2lkKTtcbiAgICB2YXIgcmVwb3J0X2Vycl9rZXkgPSBLZXlNZ3IuZXJyKHJlcG9ydF9rZXkpO1xuICAgIHZhciBpbml0X2RhdGEgPSBsb2NhbFN0b3JhZ2VTZXJ2aWNlLmdldChyZXBvcnRfa2V5KTtcblxuICAgIHZhciBwYXJ0X2pzb24gPSBKU09OLnBhcnNlKCR0ZW1wbGF0ZUNhY2hlLmdldCgncmVwb3J0L2kuanNvbicpKTtcbiAgICAvLyDnhafniYfnrqHnkIbpu5jorqTkuLrmnIDlkI7kuIDpoblcbiAgICB2YXIgcGFyZW50X3BhcnQgPSBwYXJ0X2pzb25bcGFydF9qc29uLmxlbmd0aCAtIDFdO1xuICAgIHZhciBjdXJyZW50X3BhcnQgPSBwYXJlbnRfcGFydC5pZDtcblxuICAgIC8vIOW9k+WJjemhtuWxguWIhuexu+acrOi6q+S4tOaXtuWtmOWCqOepuumXtFxuICAgIHZtLmRhdGEgPSB7fTtcbiAgICAvLyDnu5nlvZPliY3pobblsYLliIbnsbvnlLPor7cgbG9jYWwgc3RvcmFnZSDlrZjlgqjnqbrpl7RcbiAgICBpbml0X2RhdGFbY3VycmVudF9wYXJ0XSA9IGluaXRfZGF0YVtjdXJyZW50X3BhcnRdIHx8IHt9O1xuICAgIC8vIOWwhuS7peWJjeS/neWtmOeahOe7k+aenOWPluWHuu+8jOW5tuWGmeWFpeS4tOaXtuWtmOWCqOepuumXtFxuICAgIGFuZ3VsYXIuZXh0ZW5kKHZtLmRhdGEsIGluaXRfZGF0YVtjdXJyZW50X3BhcnRdKTtcbiAgICAvLyDlvZPliY3nmoTkuoznuqfliIbnsbtcbiAgICB2bS5wYXJ0cyA9IHBhcmVudF9wYXJ0LmNoaWxkcmVuO1xuXG4gICAgaWYgKHZtLnBhcnRzICYmIHZtLnBhcnRzLmxlbmd0aCkge1xuICAgICAgLy8g6K6+572u56ys5LiA5p2h6buY6K6k5bGV5byAXG4gICAgICB2bS5wYXJ0c1swXS5pc19vcGVuID0gdHJ1ZTtcblxuICAgICAgLy8g5Yid5aeL5YyW5ouN54Wn6aG5LCDorr7nva7mi43nhafpobnkuLrmnKzlnLDnhafniYfmiJZudWxsXG4gICAgICB2bS5wYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uKHBhcnQpIHtcbiAgICAgICAgcGFydC5pbWFnZS5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICB2bS5kYXRhW2l0ZW0uaWRdID0gdm0uZGF0YVtpdGVtLmlkXSB8fCB7IGltYWdlOiBudWxsIH07XG4gICAgICAgIH0pO1xuICAgICAgfSk7ICBcbiAgICB9XG5cbiAgICAvLyDlhbbku5YgcGFydCDkuLTml7blrZjlgqjnqbrpl7RcbiAgICB2bS5kYXRhX290aGVyID0ge307XG4gICAgLy8g5YW25LuWIHBhcnQg5Lul5YmN5L+d5a2Y5Zyo5pys5Zyw55qE5pWw5o2uXG4gICAgdmFyIHBob3RvX29mX2dyb3VwID0gbG9jYWxTdG9yYWdlU2VydmljZS5nZXQocmVwb3J0X2Vycl9rZXkpO1xuICAgIC8vIOagvOW8j+WMluS7peWJjeS/neWtmOWcqOacrOWcsOeahOWFtuS7liBwYXJ0IOaVsOaNru+8jOaWueS+v+WxleekulxuICAgIHZtLnBhcnRfcGhvdG9zID0gXy5tYXAocGhvdG9fb2ZfZ3JvdXAsIGZ1bmN0aW9uKGl0ZW0sIGtleSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaWQ6IGtleSxcbiAgICAgICAgbmFtZTogZ2V0X3BhcnRfbmFtZShrZXkpLFxuICAgICAgICBwaG90b3M6IGl0ZW1cbiAgICAgIH07XG4gICAgfSk7XG4gICAgLy8g5bCG5Lul5YmN5L+d5a2Y5Zyo5pys5Zyw55qE57uT5p6c5Y+W5Ye677yM5bm25YaZ5YWl5Li05pe25a2Y5YKo56m66Ze0XG4gICAgXyhwaG90b19vZl9ncm91cCkudmFsdWVzKCkuZmxhdHRlbigpLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgdm0uZGF0YV9vdGhlcltpdGVtLmlkXSA9IGl0ZW07XG4gICAgfSk7XG4gICAgLy8g5qC55o2u6aG25bGC5YiG57G7IGlkIOafpeaJviDpobblsYLliIbnsbvnmoQgbmFtZVxuICAgIGZ1bmN0aW9uIGdldF9wYXJ0X25hbWUocGFydF9pZCkge1xuICAgICAgcmV0dXJuIHBhcnRfanNvbi5maW5kKGZ1bmN0aW9uKHBhcnQpIHtcbiAgICAgICAgcmV0dXJuIHBhcnQuaWQgPT0gcGFydF9pZDtcbiAgICAgIH0pLm5hbWU7XG4gICAgfVxuXG4gICAgLy8g5ouN54Wn5pON5L2cXG4gICAgdm0udGFrZV9waG90byA9IHRha2VfcGhvdG87XG4gICAgLy8gY2F0ZWdvcnkg5Yy65YiG5piv5b2T5YmN6aG25bGC5YiG57G75a2Q6aG555qE5ouN54Wn5LiO5YW25LuW6aG25bGC5YiG57G75a2Q6aG555qE5ouN54WnXG4gICAgLy8gc2VsZjog5b2T5YmN6aG25bGC5YiG57G755qE5a2Q6aG5XG4gICAgLy8gb3RoZXI6IOWFtuS7lumhtuWxguWIhuexu+eahOWtkOmhuVxuICAgIGZ1bmN0aW9uIHRha2VfcGhvdG8oY2F0ZWdvcnksIHBhcnQsIGl0ZW0pIHtcbiAgICAgIG5hdmlnYXRvci5jYW1lcmEuZ2V0UGljdHVyZSh0YWtlX3Bob3RvX3N1Y2Nlc3MsIHRha2VfcGhvdG9fZXJyb3IsIHtcbiAgICAgICAgcXVhbGl0eSA6IDEwMCxcbiAgICAgICAgZGVzdGluYXRpb25UeXBlIDogQ2FtZXJhLkRlc3RpbmF0aW9uVHlwZS5GSUxFX1VSSSxcbiAgICAgICAgc291cmNlVHlwZSA6IENhbWVyYS5QaWN0dXJlU291cmNlVHlwZS5DQU1FUkEsXG4gICAgICAgIGFsbG93RWRpdCA6IHRydWUsXG4gICAgICAgIGVuY29kaW5nVHlwZTogQ2FtZXJhLkVuY29kaW5nVHlwZS5QTkcsXG4gICAgICAgIC8vIHRhcmdldFdpZHRoOiAxMDAsXG4gICAgICAgIC8vIHRhcmdldEhlaWdodDogMTAwLFxuICAgICAgICBzYXZlVG9QaG90b0FsYnVtOiBmYWxzZVxuICAgICAgfSk7XG5cbiAgICAgIGZ1bmN0aW9uIHRha2VfcGhvdG9fc3VjY2VzcyhpbWd1cmwpIHtcbiAgICAgICAgLy8g5b2T5YmN6aG25bGC5YiG57G75ouN54WnXG4gICAgICAgIGlmIChjYXRlZ29yeSA9PT0gJ3NlbGYnKSB7XG4gICAgICAgICAgdm0uZGF0YVtpdGVtLmlkXS5pbWFnZSA9IGltZ3VybDtcblxuICAgICAgICAgIC8vIOS4tOaXtuWtmOWCqOaVsOaNruacrOWcsOWMluWIsCBsb2NhbHN0b3JhZ2VcbiAgICAgICAgICAvLyDmlrnkvr/kuIvmrKHov5vlhaUgYXBwIOWxleekulxuICAgICAgICAgIGluaXRfZGF0YVtjdXJyZW50X3BhcnRdID0gdm0uZGF0YTtcbiAgICAgICAgfSBlbHNlIGlmIChjYXRlZ29yeSA9PT0gJ290aGVyJykge1xuICAgICAgICAgIC8vIOWFtuS7lumhtuWxguWIhuexu+aLjeeFp1xuICAgICAgICAgIHZtLmRhdGFfb3RoZXJbaXRlbS5pZF0uaW1hZ2UgPSBpbWd1cmw7XG5cbiAgICAgICAgICAvLyDov5nph4znmoQgcGFydCDmmK/pobblsYLliIbnsbtcbiAgICAgICAgICB2YXIgZXhpc3RzX2l0ZW0gPSBwaG90b19vZl9ncm91cFtwYXJ0LmlkXS5maW5kKGZ1bmN0aW9uKF9pdGVtKSB7XG4gICAgICAgICAgICByZXR1cm4gX2l0ZW0uaWQgPT09IGl0ZW0uaWQ7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyDmnKzlnLDljJbliLDnhafniYfmgLvop4ggbG9jYWxzdG9yYWdlXG4gICAgICAgICAgZXhpc3RzX2l0ZW0uaW1hZ2UgPSBpbWd1cmw7XG4gICAgICAgICAgbG9jYWxTdG9yYWdlU2VydmljZS5zZXQocmVwb3J0X2Vycl9rZXksIHBob3RvX29mX2dyb3VwKTtcbiAgICAgICAgICBcbiAgICAgICAgICAvLyDmnKzlnLDljJbliLDmiqXlkYogbG9jYWxzdG9yYWdlXG4gICAgICAgICAgaW5pdF9kYXRhW3BhcnQuaWRdW2V4aXN0c19pdGVtLmlkXS5pbWFnZSA9IGltZ3VybDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxvY2FsU3RvcmFnZVNlcnZpY2Uuc2V0KHJlcG9ydF9rZXksIGluaXRfZGF0YSk7XG4gICAgICAgIC8vIOaJi+WKqOinpuWPkemhtemdoua4suafk1xuICAgICAgICB2bS4kYXBwbHkoKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gdGFrZV9waG90b19lcnJvcigpIHtcbiAgICAgICAgJGxvZy5lcnJvcign5ouN54Wn5aSx6LSlLCDliIbnsbsgLSAnICsgcGFydC5uYW1lICsgJywg6aG5IC0gJyArIGl0ZW0ubmFtZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdm0uc2hvd19waG90byA9IHNob3dfcGhvdG87XG4gICAgZnVuY3Rpb24gc2hvd19waG90byhmaWVsZCkge1xuICAgICAgd2luZG93LnJlc29sdmVMb2NhbEZpbGVTeXN0ZW1VUkwodm0uZGF0YVtmaWVsZC5pZF0uaW1hZ2UsIGZ1bmN0aW9uKGZpbGVFbnRyeSkge1xuICAgICAgICBmaWxlRW50cnkuZmlsZShmdW5jdGlvbihmaWxlKSB7XG4gICAgICAgICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgICAgICAgcmVhZGVyLm9ubG9hZGVuZCA9IGZ1bmN0aW9uKGV2dCkge1xuICAgICAgICAgICAgRnVsbFNjcmVlbkltYWdlLnNob3dJbWFnZUJhc2U2NChldnQudGFyZ2V0LnJlc3VsdC5yZXBsYWNlKCdkYXRhOmltYWdlL2pwZWc7YmFzZTY0LCcsICcnKSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgICByZWFkZXIucmVhZEFzRGF0YVVSTChmaWxlKTtcbiAgICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgJGxvZy5lcnJvcign5omT5byA5Zu+54mH5aSx6LSlJyk7XG4gICAgICAgIH0pXG4gICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgJGxvZy5lcnJvcign5omT5byA5Zu+54mH5aSx6LSlJyk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0pXG5cbiAgLmNvbnRyb2xsZXIoJ1JlcG9ydEVkaXRDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkbG9nLCAkc3RhdGVQYXJhbXMsICR0ZW1wbGF0ZUNhY2hlLCAkbW9kYWwsIGxvY2FsU3RvcmFnZVNlcnZpY2UsIEtleU1ncikge1xuICAgIHZhciB2bSA9ICRzY29wZTtcblxuICAgIHZhciBjdXJyZW50X3BhcnQgPSBwYXJzZUludCgkc3RhdGVQYXJhbXMucGFydF9pZCk7XG4gICAgdmFyIG9yZGVyX2lkID0gJHN0YXRlUGFyYW1zLmluZGVudF9pZDtcbiAgICB2YXIgY2FyX2lkID0gJHN0YXRlUGFyYW1zLmNhcl9pZDtcbiAgICAvLyDooajljZXpobnmlbDmja7lrZjlgqjliLDmnKzlnLDnmoQga2V5IOeahOeUn+aIkOinhOWImVxuICAgIC8vIHZhciBzdG9yZV9rZXkgPSBbaW5kZW50X2lkLCBjYXJfaWRdLmpvaW4oJ18nKTtcbiAgICAvLyB2YXIgc3RvcmVfa2V5X2VyciA9IFtzdG9yZV9rZXksICdlcnInXS5qb2luKCdfJyk7XG5cbiAgICB2YXIgcmVwb3J0X2tleSA9IEtleU1nci5yZXBvcnQob3JkZXJfaWQsIGNhcl9pZCk7XG4gICAgdmFyIHJlcG9ydF9lcnJfa2V5ID0gS2V5TWdyLmVycihyZXBvcnRfa2V5KTtcbiAgICB2YXIgaW5pdF9kYXRhID0gbG9jYWxTdG9yYWdlU2VydmljZS5nZXQocmVwb3J0X2tleSk7XG5cbiAgICAvLyDojrflj5bmiqXlkYrovpPlhaXpobnmlbDmja5cbiAgICB2YXIgcGFyZW50X3BhcnQgPSBcbiAgICBKU09OXG4gICAgICAucGFyc2UoJHRlbXBsYXRlQ2FjaGUuZ2V0KCdyZXBvcnQvaS5qc29uJykpXG4gICAgICAuZmluZChmdW5jdGlvbihwYXJ0KSB7XG4gICAgICAgIHJldHVybiBwYXJ0LmlkID09PSBjdXJyZW50X3BhcnQ7XG4gICAgICB9KTtcbiAgICB2bS5wYXJ0cyA9IHBhcmVudF9wYXJ0ICYmIHBhcmVudF9wYXJ0LmNoaWxkcmVuO1xuXG4gICAgLy8g56ys5LiA5p2h6buY6K6k5bGV5byAXG4gICAgaWYgKHZtLnBhcnRzICYmIHZtLnBhcnRzLmxlbmd0aCkge1xuICAgICAgdm0ucGFydHNbMF0uaXNfb3BlbiA9IHRydWU7XG4gICAgfVxuXG4gICAgdm0uZGF0YSA9IHt9O1xuXG4gICAgLy8g6K6+572u5Yid5aeL5YyW5YC8XG4gICAgYW5ndWxhci5leHRlbmQodm0uZGF0YSwgaW5pdF9kYXRhICYmIGluaXRfZGF0YVtjdXJyZW50X3BhcnRdIHx8IHt9KTtcblxuICAgIHZtLnBhcnRzLmZvckVhY2goZnVuY3Rpb24ocGFydCkge1xuICAgICAgaWYgKHBhcnQucmFkaW9fd2l0aF9zdGF0dXNfZGVncmVlcyAmJiBwYXJ0LnJhZGlvX3dpdGhfc3RhdHVzX2RlZ3JlZXMubGVuZ3RoKSB7XG4gICAgICAgIHBhcnQucmFkaW9fd2l0aF9zdGF0dXNfZGVncmVlcy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICB2bS5kYXRhW2l0ZW0uaWRdID0gdm0uZGF0YVtpdGVtLmlkXSB8fCB7fTtcblxuICAgICAgICAgIGlmICh2bS5kYXRhW2l0ZW0uaWRdLnJlc3VsdCA9PSBudWxsKSB7XG4gICAgICAgICAgICB2bS5kYXRhW2l0ZW0uaWRdLnJlc3VsdCA9IFwiMVwiO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBkYXRhIOaUueWPmOWImeWwhuWFtuS/neWtmOWIsCBsb2NhbCBzdG9yYWdlXG4gICAgdm0uJHdhdGNoKCdkYXRhJywgZnVuY3Rpb24odikge1xuICAgICAgJGxvZy5sb2coJ2Zvcm0gZGF0YTogJywgSlNPTi5zdHJpbmdpZnkodikpO1xuXG4gICAgICBzYXZlKCk7XG5cbiAgICAgIHNhdmVfZXJyKCk7XG4gICAgfSwgdHJ1ZSk7XG5cbiAgICBcbiAgICAvLyDkv53lrZjliLAgbG9jYWxTdG9yYWdlXG4gICAgLy8g5pWw5o2u5qC85byP5Li677yaXG4gICAgLy8ge1xuICAgIC8vICAgXCJyMVwiOiB7XG4gICAgLy8gICAgIFwicmVzdWx0XCI6IDEsXG4gICAgLy8gICAgIFwic3RhdGVcIjogMSxcbiAgICAvLyAgICAgXCJkZWdyZWVcIjogMSxcbiAgICAvLyAgICAgXCJtZW1vXCI6IFwieHh4XCIsXG4gICAgLy8gICAgIFwiaW1hZ2VcIjogXCJcIlxuICAgIC8vICAgfVxuICAgIC8vIH1cbiAgICBmdW5jdGlvbiBzYXZlKCkge1xuICAgICAgdmFyIGRhdGEgPSBsb2NhbFN0b3JhZ2VTZXJ2aWNlLmdldChyZXBvcnRfa2V5KSB8fCB7fTtcbiAgICAgIGRhdGFbY3VycmVudF9wYXJ0XSA9IHZtLmRhdGE7XG5cbiAgICAgIGxvY2FsU3RvcmFnZVNlcnZpY2Uuc2V0KHJlcG9ydF9rZXksIGRhdGEpO1xuXG4gICAgICAkbG9nLmxvZygn5b2V5YWl5qOA5rWL5oql5ZGKIC0gJyArIHJlcG9ydF9rZXksIGRhdGFbY3VycmVudF9wYXJ0XSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2F2ZV9lcnIoKSB7XG4gICAgICB2YXIgZGF0YSA9IGxvY2FsU3RvcmFnZVNlcnZpY2UuZ2V0KHJlcG9ydF9lcnJfa2V5KSB8fCB7fTtcbiAgICAgIHZhciBlcnJfaXRlbXMgPSBbXTtcblxuICAgICAgLy8g562b6YCJ5Ye657y66Zm355qE6aG577yM5oiW6ZyA6KaB5ouN54Wn55qE6aG5XG4gICAgICBfLmVhY2godm0uZGF0YSwgZnVuY3Rpb24oaXRlbSwga2V5KSB7XG4gICAgICAgIGlmIChpdGVtLmltYWdlKSB7XG4gICAgICAgICAgaXRlbS5pZCA9IGtleTtcbiAgICAgICAgICBlcnJfaXRlbXMucHVzaChpdGVtKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIOWmguaenOivpSBwYXJ0IOayoeacieaLjeeFp1xuICAgICAgaWYgKCFlcnJfaXRlbXMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgZGF0YVtjdXJyZW50X3BhcnRdID0gZXJyX2l0ZW1zO1xuXG4gICAgICBsb2NhbFN0b3JhZ2VTZXJ2aWNlLnNldChyZXBvcnRfZXJyX2tleSwgZGF0YSk7XG5cbiAgICAgICRsb2cubG9nKCflvZXlhaXmo4DmtYvmiqXlkYrpl67popjpobkgLSAnICsgcmVwb3J0X2Vycl9rZXksIGRhdGFbY3VycmVudF9wYXJ0XSk7XG4gICAgfVxuXG4gICAgdm0uc2hvd19kZXRhaWwgPSBzaG93X2RldGFpbDtcbiAgICB2bS5zaG91bGRfY2xlYXIgPSBzaG91bGRfY2xlYXI7XG4gICAgdm0udGFrZV9waG90byA9IHRha2VfcGhvdG87XG4gICAgdm0ub3Blbl9kYXRlcGlja2VyID0gb3Blbl9kYXRlcGlja2VyO1xuICAgIHZtLnNob3dfdGFrZV9waG90byA9IHNob3dfdGFrZV9waG90bztcbiAgICB2bS5zaG93X3Bob3RvID0gc2hvd19waG90bztcblxuICAgIC8vIOmBv+WFjeWxleekuuS4pOasoSBtb2RhbFxuICAgIGZ1bmN0aW9uIHNob3dfZGV0YWlsKGluZGV4LCBwYXJ0LCBjaGVja19pdGVtKSB7XG4gICAgICAvLyBjaGFuZ2Ug5LqL5Lu25Y+R55Sf5ZyoIGNsaWNrIOS5i+WQjlxuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgLy8g5YW25LuW6YCJ6aG55LiN5bqU6K+l5by55Ye6XG4gICAgICAgIGlmIChzaG93X2RldGFpbC5pc19zaG93IHx8IHBhcnNlSW50KHZtLmRhdGFbY2hlY2tfaXRlbS5pZF0ucmVzdWx0KSAhPT0gMikge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHNob3dfZGV0YWlsLmlzX3Nob3cgPSB0cnVlO1xuXG4gICAgICAgIHZhciBpbnB1dF9kZXRhaWxfaW5zID0gJG1vZGFsLm9wZW4oe1xuICAgICAgICAgIHRlbXBsYXRlVXJsOiAncmVwb3J0L2lucHV0X2RldGFpbC5odG0nLFxuICAgICAgICAgIGNvbnRyb2xsZXI6ICdJdGVtSW5wdXREZXRhaWxDdHJsJyxcbiAgICAgICAgICBiYWNrZHJvcDogJ3N0YXRpYycsXG4gICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgaXRlbV9kZXRhaWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gYW5ndWxhci5leHRlbmQoe1xuICAgICAgICAgICAgICAgIHBhcnRfbmFtZTogcGFydC5uYW1lLFxuICAgICAgICAgICAgICAgIHBhcnRfYWxpYXM6IHBhcnQuYWxpYXMsXG4gICAgICAgICAgICAgICAgaW5kZXg6IGluZGV4XG4gICAgICAgICAgICAgIH0sIGNoZWNrX2l0ZW0sIHZtLmRhdGFbY2hlY2tfaXRlbS5pZF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaW5wdXRfZGV0YWlsX2lucy5yZXN1bHQudGhlbihmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgYW5ndWxhci5leHRlbmQodm0uZGF0YVtjaGVja19pdGVtLmlkXSwgaXRlbSwge1xuICAgICAgICAgICAgbmFtZTogY2hlY2tfaXRlbS5uYW1lXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBzaG93X2RldGFpbC5pc19zaG93ID0gZmFsc2U7XG4gICAgICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHNob3dfZGV0YWlsLmlzX3Nob3cgPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBzaG93X2RldGFpbC5pc19zaG93ID0gZmFsc2U7XG5cbiAgICBmdW5jdGlvbiBzaG91bGRfY2xlYXIoaXRlbSkge1xuICAgICAgLy8g6Iul5qOA5rWL5peg6Zeu6aKY77yM5YiZ5riF6Zmk5LmL5YmN5aGr5YaZ55qE5o2f5Lyk5pWw5o2uXG4gICAgICB2YXIgciA9IHBhcnNlSW50KHZtLmRhdGFbaXRlbS5pZF0ucmVzdWx0KTtcbiAgICAgIGlmIChyICE9PSAyIHx8IHIgIT09IDUpIHtcbiAgICAgICAgYW5ndWxhci5leHRlbmQodm0uZGF0YVtpdGVtLmlkXSwge1xuICAgICAgICAgIHN0YXRlOiBudWxsLFxuICAgICAgICAgIGRlZ3JlZTogbnVsbCxcbiAgICAgICAgICBtZW1vOiBudWxsLFxuICAgICAgICAgIGltYWdlOiBudWxsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFRPRE9cbiAgICAvLyDlm77niYfpooTop4hcbiAgICBmdW5jdGlvbiBzaG93X3Bob3RvKGZpZWxkKSB7XG4gICAgICB3aW5kb3cucmVzb2x2ZUxvY2FsRmlsZVN5c3RlbVVSTCh2bS5kYXRhW2ZpZWxkLmlkXS5pbWFnZSwgZnVuY3Rpb24oZmlsZUVudHJ5KSB7XG4gICAgICAgIGZpbGVFbnRyeS5maWxlKGZ1bmN0aW9uKGZpbGUpIHtcbiAgICAgICAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICAgICAgICByZWFkZXIub25sb2FkZW5kID0gZnVuY3Rpb24oZXZ0KSB7XG4gICAgICAgICAgICBGdWxsU2NyZWVuSW1hZ2Uuc2hvd0ltYWdlQmFzZTY0KGV2dC50YXJnZXQucmVzdWx0LnJlcGxhY2UoJ2RhdGE6aW1hZ2UvanBlZztiYXNlNjQsJywgJycpKTtcbiAgICAgICAgICB9O1xuICAgICAgICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGZpbGUpO1xuICAgICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAkbG9nLmVycm9yKCfmiZPlvIDlm77niYflpLHotKUnKTtcbiAgICAgICAgfSlcbiAgICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICAkbG9nLmVycm9yKCfmiZPlvIDlm77niYflpLHotKUnKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRha2VfcGhvdG8ocGFydCwgaXRlbSkge1xuICAgICAgbmF2aWdhdG9yLmNhbWVyYS5nZXRQaWN0dXJlKHRha2VfcGhvdG9fc3VjY2VzcywgdGFrZV9waG90b19lcnJvciwge1xuICAgICAgICBxdWFsaXR5IDogMTAwLFxuICAgICAgICBkZXN0aW5hdGlvblR5cGUgOiBDYW1lcmEuRGVzdGluYXRpb25UeXBlLkZJTEVfVVJJLFxuICAgICAgICBzb3VyY2VUeXBlIDogQ2FtZXJhLlBpY3R1cmVTb3VyY2VUeXBlLkNBTUVSQSxcbiAgICAgICAgYWxsb3dFZGl0IDogdHJ1ZSxcbiAgICAgICAgZW5jb2RpbmdUeXBlOiBDYW1lcmEuRW5jb2RpbmdUeXBlLlBORyxcbiAgICAgICAgLy8gdGFyZ2V0V2lkdGg6IDEwMCxcbiAgICAgICAgLy8gdGFyZ2V0SGVpZ2h0OiAxMDAsXG4gICAgICAgIHNhdmVUb1Bob3RvQWxidW06IGZhbHNlXG4gICAgICB9KTtcblxuICAgICAgZnVuY3Rpb24gdGFrZV9waG90b19zdWNjZXNzKGltZ3VybCkge1xuICAgICAgICB2bS5kYXRhW2l0ZW0uaWRdID0gYW5ndWxhci5leHRlbmQodm0uZGF0YVtpdGVtLmlkXSB8fCB7fSwge1xuICAgICAgICAgIGltYWdlOiBpbWd1cmwsXG4gICAgICAgICAgbmFtZTogaXRlbS5uYW1lXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZtLiRhcHBseSgpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiB0YWtlX3Bob3RvX2Vycm9yKCkge1xuICAgICAgICAkbG9nLmVycm9yKCfmi43nhaflpLHotKUsIOWIhuexuyAtICcgKyBwYXJ0Lm5hbWUgKyAnLCDpobkgLSAnICsgaXRlbS5uYW1lKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDml6XmnJ/mjqfku7bmmL7npLov6ZqQ6JePL+emgeeUqFxuICAgIHZtLmRwX3BhcmFtcyA9IHt9O1xuICAgIGZ1bmN0aW9uIG9wZW5fZGF0ZXBpY2tlcigkZXZlbnQsIGRwKSB7XG4gICAgICAkZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgdm0uZHBfcGFyYW1zW2RwXSA9IHRydWU7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIHNob3dfdGFrZV9waG90byhpbmRleCwgcGFydCwgY2hlY2tfaXRlbSkge1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHNob3dfdGFrZV9waG90by5pc19zaG93IHx8IHBhcnNlSW50KHZtLmRhdGFbY2hlY2tfaXRlbS5pZF0ucmVzdWx0KSAhPT0gNSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHNob3dfdGFrZV9waG90by5pc19zaG93ID0gdHJ1ZTtcblxuICAgICAgICB2YXIgdGFrZV9waG90b19tb2RhbCA9ICRtb2RhbC5vcGVuKHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3JlcG9ydC90YWtlX3Bob3RvX21vZGFsLmh0bScsXG4gICAgICAgICAgY29udHJvbGxlcjogJ0l0ZW1UYWtlUGhvdG9DdHJsJyxcbiAgICAgICAgICBiYWNrZHJvcDogJ3N0YXRpYycsXG4gICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgaXRlbV9kZXRhaWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gYW5ndWxhci5leHRlbmQoe1xuICAgICAgICAgICAgICAgIHBhcnRfbmFtZTogcGFydC5uYW1lLFxuICAgICAgICAgICAgICAgIHBhcnRfYWxpYXM6IHBhcnQuYWxpYXMsXG4gICAgICAgICAgICAgICAgaW5kZXg6IGluZGV4XG4gICAgICAgICAgICAgIH0sIGNoZWNrX2l0ZW0sIHZtLmRhdGFbY2hlY2tfaXRlbS5pZF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGFrZV9waG90b19tb2RhbC5yZXN1bHQudGhlbihmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgYW5ndWxhci5leHRlbmQodm0uZGF0YVtjaGVja19pdGVtLmlkXSwgaXRlbSwge1xuICAgICAgICAgICAgbmFtZTogY2hlY2tfaXRlbS5uYW1lXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBzaG93X3Rha2VfcGhvdG8uaXNfc2hvdyA9IGZhbHNlO1xuICAgICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBzaG93X3Rha2VfcGhvdG8uaXNfc2hvdyA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHNob3dfdGFrZV9waG90by5pc19zaG93ID0gZmFsc2U7XG4gIH0pXG5cbiAgLmNvbnRyb2xsZXIoJ0l0ZW1JbnB1dERldGFpbEN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRsb2csICRtb2RhbEluc3RhbmNlLCBpdGVtX2RldGFpbCkge1xuICAgIHZhciB2bSA9ICRzY29wZTtcblxuICAgIGFuZ3VsYXIuZXh0ZW5kKHZtLCBpdGVtX2RldGFpbCk7XG5cbiAgICB2bS5zdWJtaXQgPSBzdWJtaXQ7XG4gICAgdm0uY2FuY2VsID0gY2FuY2VsO1xuICAgIHZtLnRha2VfcGhvdG8gPSB0YWtlX3Bob3RvO1xuICAgIHZtLnNob3dfcGhvdG8gPSBzaG93X3Bob3RvO1xuXG4gICAgZnVuY3Rpb24gc3VibWl0KCkge1xuICAgICAgJG1vZGFsSW5zdGFuY2UuY2xvc2Uoe1xuICAgICAgICBzdGF0ZTogdm0uc3RhdGUsXG4gICAgICAgIGRlZ3JlZTogdm0uZGVncmVlLFxuICAgICAgICBtZW1vOiB2bS5tZW1vLFxuICAgICAgICBpbWFnZTogdm0uaW1hZ2VcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNhbmNlbCgpIHtcbiAgICAgICRtb2RhbEluc3RhbmNlLmRpc21pc3MoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzaG93X3Bob3RvKGZpZWxkKSB7XG4gICAgICB3aW5kb3cucmVzb2x2ZUxvY2FsRmlsZVN5c3RlbVVSTCh2bS5kYXRhW2ZpZWxkLmlkXS5pbWFnZSwgZnVuY3Rpb24oZmlsZUVudHJ5KSB7XG4gICAgICAgIGZpbGVFbnRyeS5maWxlKGZ1bmN0aW9uKGZpbGUpIHtcbiAgICAgICAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICAgICAgICByZWFkZXIub25sb2FkZW5kID0gZnVuY3Rpb24oZXZ0KSB7XG4gICAgICAgICAgICBGdWxsU2NyZWVuSW1hZ2Uuc2hvd0ltYWdlQmFzZTY0KGV2dC50YXJnZXQucmVzdWx0LnJlcGxhY2UoJ2RhdGE6aW1hZ2UvanBlZztiYXNlNjQsJywgJycpKTtcbiAgICAgICAgICB9O1xuICAgICAgICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGZpbGUpO1xuICAgICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAkbG9nLmVycm9yKCfmiZPlvIDlm77niYflpLHotKUnKTtcbiAgICAgICAgfSlcbiAgICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICAkbG9nLmVycm9yKCfmiZPlvIDlm77niYflpLHotKUnKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRha2VfcGhvdG8oKSB7XG4gICAgICBuYXZpZ2F0b3IuY2FtZXJhLmdldFBpY3R1cmUodGFrZV9waG90b19zdWNjZXNzLCB0YWtlX3Bob3RvX2Vycm9yLCB7XG4gICAgICAgIHF1YWxpdHkgOiAxMDAsXG4gICAgICAgIGRlc3RpbmF0aW9uVHlwZSA6IENhbWVyYS5EZXN0aW5hdGlvblR5cGUuRklMRV9VUkksXG4gICAgICAgIHNvdXJjZVR5cGUgOiBDYW1lcmEuUGljdHVyZVNvdXJjZVR5cGUuQ0FNRVJBLFxuICAgICAgICBhbGxvd0VkaXQgOiB0cnVlLFxuICAgICAgICBlbmNvZGluZ1R5cGU6IENhbWVyYS5FbmNvZGluZ1R5cGUuUE5HLFxuICAgICAgICAvLyB0YXJnZXRXaWR0aDogMTAwLFxuICAgICAgICAvLyB0YXJnZXRIZWlnaHQ6IDEwMCxcbiAgICAgICAgc2F2ZVRvUGhvdG9BbGJ1bTogZmFsc2VcbiAgICAgIH0pO1xuXG4gICAgICBmdW5jdGlvbiB0YWtlX3Bob3RvX3N1Y2Nlc3MoaW1ndXJsKSB7XG4gICAgICAgIHZtLmltYWdlID0gaW1ndXJsO1xuICAgICAgICB2bS4kYXBwbHkoKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gdGFrZV9waG90b19lcnJvcigpIHtcbiAgICAgICAgJGxvZy5lcnJvcign5ouN54Wn5aSx6LSlLCDliIbnsbsgLSAnICsgaXRlbV9kZXRhaWwucGFydF9uYW1lICsgJywg6aG5IC0gJyArIGl0ZW1fZGV0YWlsLm5hbWUpO1xuICAgICAgfVxuICAgIH1cbiAgfSlcblxuICAuY29udHJvbGxlcignSXRlbVRha2VQaG90b0N0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRsb2csICRtb2RhbEluc3RhbmNlLCBpdGVtX2RldGFpbCkge1xuICAgICAgdmFyIHZtID0gJHNjb3BlO1xuXG4gICAgICBhbmd1bGFyLmV4dGVuZCh2bSwgaXRlbV9kZXRhaWwpO1xuXG4gICAgICB2bS5zdWJtaXQgPSBzdWJtaXQ7XG4gICAgICB2bS5jYW5jZWwgPSBjYW5jZWw7XG4gICAgICB2bS50YWtlX3Bob3RvID0gdGFrZV9waG90bztcbiAgICAgIHZtLnNob3dfcGhvdG8gPSBzaG93X3Bob3RvO1xuXG4gICAgICBmdW5jdGlvbiBzdWJtaXQoKSB7XG4gICAgICAgICRtb2RhbEluc3RhbmNlLmNsb3NlKHtcbiAgICAgICAgICBpbWFnZTogdm0uaW1hZ2VcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGNhbmNlbCgpIHtcbiAgICAgICAgJG1vZGFsSW5zdGFuY2UuZGlzbWlzcygpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBzaG93X3Bob3RvKGZpZWxkKSB7XG4gICAgICAgIHdpbmRvdy5yZXNvbHZlTG9jYWxGaWxlU3lzdGVtVVJMKHZtLmRhdGFbZmllbGQuaWRdLmltYWdlLCBmdW5jdGlvbihmaWxlRW50cnkpIHtcbiAgICAgICAgICBmaWxlRW50cnkuZmlsZShmdW5jdGlvbihmaWxlKSB7XG4gICAgICAgICAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICAgICAgICAgIHJlYWRlci5vbmxvYWRlbmQgPSBmdW5jdGlvbihldnQpIHtcbiAgICAgICAgICAgICAgRnVsbFNjcmVlbkltYWdlLnNob3dJbWFnZUJhc2U2NChldnQudGFyZ2V0LnJlc3VsdC5yZXBsYWNlKCdkYXRhOmltYWdlL2pwZWc7YmFzZTY0LCcsICcnKSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoZmlsZSk7XG4gICAgICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkbG9nLmVycm9yKCfmiZPlvIDlm77niYflpLHotKUnKTtcbiAgICAgICAgICB9KVxuICAgICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAkbG9nLmVycm9yKCfmiZPlvIDlm77niYflpLHotKUnKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHRha2VfcGhvdG8oKSB7XG4gICAgICAgIG5hdmlnYXRvci5jYW1lcmEuZ2V0UGljdHVyZSh0YWtlX3Bob3RvX3N1Y2Nlc3MsIHRha2VfcGhvdG9fZXJyb3IsIHtcbiAgICAgICAgICBxdWFsaXR5IDogMTAwLFxuICAgICAgICAgIGRlc3RpbmF0aW9uVHlwZSA6IENhbWVyYS5EZXN0aW5hdGlvblR5cGUuRklMRV9VUkksXG4gICAgICAgICAgc291cmNlVHlwZSA6IENhbWVyYS5QaWN0dXJlU291cmNlVHlwZS5DQU1FUkEsXG4gICAgICAgICAgYWxsb3dFZGl0IDogdHJ1ZSxcbiAgICAgICAgICBlbmNvZGluZ1R5cGU6IENhbWVyYS5FbmNvZGluZ1R5cGUuUE5HLFxuICAgICAgICAgIC8vIHRhcmdldFdpZHRoOiAxMDAsXG4gICAgICAgICAgLy8gdGFyZ2V0SGVpZ2h0OiAxMDAsXG4gICAgICAgICAgc2F2ZVRvUGhvdG9BbGJ1bTogZmFsc2VcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZnVuY3Rpb24gdGFrZV9waG90b19zdWNjZXNzKGltZ3VybCkge1xuICAgICAgICAgIHZtLmltYWdlID0gaW1ndXJsO1xuICAgICAgICAgIHZtLiRhcHBseSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gdGFrZV9waG90b19lcnJvcigpIHtcbiAgICAgICAgICAkbG9nLmVycm9yKCfmi43nhaflpLHotKUsIOWIhuexuyAtICcgKyBpdGVtX2RldGFpbC5wYXJ0X25hbWUgKyAnLCDpobkgLSAnICsgaXRlbV9kZXRhaWwubmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuXG4gIC5jb250cm9sbGVyKCdSZXBvcnRMaXN0Q3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJGxvY2F0aW9uLCBSZXBvcnRzU3ZjLCBJbmRlbnRFbnVtcywgdG9hc3RyKSB7XG4gICAgdmFyIHZtID0gJHNjb3BlO1xuICAgIHZhciBxc28gPSAkbG9jYXRpb24uc2VhcmNoKCk7XG5cbiAgICB2bS5wYWdlID0gcGFyc2VJbnQocXNvLnBhZ2UpIHx8IDE7XG4gICAgdm0uc2l6ZSA9IHBhcnNlSW50KHFzby5zaXplKSB8fCAyMDtcbiAgICB2bS5zaXplcyA9IEluZGVudEVudW1zLmxpc3QoJ3NpemUnKTtcbiAgICB2bS5zaXplX2l0ZW0gPSBJbmRlbnRFbnVtcy5pdGVtKCdzaXplJywgdm0uc2l6ZSk7XG5cbiAgICB2bS5zaXplX2NoYW5nZSA9IHNpemVfY2hhbmdlO1xuICAgIHZtLnBhZ2VfY2hhbmdlID0gcGFnZV9jaGFuZ2U7XG5cbiAgICBxdWVyeSgpO1xuXG4gICAgZnVuY3Rpb24gcXVlcnkoKSB7XG4gICAgICB2YXIgcGFyYW1zID0ge1xuICAgICAgICBpdGVtc19wYWdlOiB2bS5zaXplLFxuICAgICAgICBwYWdlOiB2bS5wYWdlLFxuICAgICAgfTtcbiAgICAgIFxuICAgICAgJGxvY2F0aW9uLnNlYXJjaChwYXJhbXMpO1xuXG4gICAgICBSZXBvcnRzU3ZjXG4gICAgICAgIC5xdWVyeShwYXJhbXMpXG4gICAgICAgIC4kcHJvbWlzZVxuICAgICAgICAudGhlbihmdW5jdGlvbihycykge1xuICAgICAgICAgIHJzLml0ZW1zLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgaXRlbS5zdGF0dXNfdGV4dCA9IEluZGVudEVudW1zLnRleHQoJ29yZGVyX3N0YXR1cycsIGl0ZW0uc3RhdHVzX2lkKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHZtLml0ZW1zID0gcnMuaXRlbXM7XG4gICAgICAgICAgdm0udG90YWxfY291bnQgPSBycy50b3RhbF9jb3VudDtcblxuICAgICAgICAgIHZhciB0bXAgPSBycy50b3RhbF9jb3VudCAvIHZtLnNpemU7XG4gICAgICAgICAgdm0ucGFnZV9jb3VudCA9IHJzLnRvdGFsX2NvdW50ICUgdm0uc2l6ZSA9PT0gMCA/IHRtcCA6IChNYXRoLmZsb29yKHRtcCkgKyAxKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIHRvYXN0ci5lcnJvcihyZXMubXNnIHx8ICfmn6Xor6LlpLHotKXvvIzmnI3liqHlmajlj5HnlJ/mnKrnn6XplJnor6/vvIzor7fph43or5UnKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8g5q+P6aG15p2h5pWw5pS55Y+YXG4gICAgZnVuY3Rpb24gc2l6ZV9jaGFuZ2Uoc2l6ZSkge1xuICAgICAgdm0uc2l6ZSA9IHNpemU7XG4gICAgICB2bS5wYWdlID0gMTtcblxuICAgICAgcXVlcnkoKTtcbiAgICB9XG5cbiAgICAvLyDnv7vpobVcbiAgICBmdW5jdGlvbiBwYWdlX2NoYW5nZShwYWdlKSB7XG4gICAgICB2bS5wYWdlID0gcGFnZTtcblxuICAgICAgcXVlcnkoKTtcbiAgICB9XG4gIH0pO1xuXG5cblxuXG5cbiIsImFuZ3VsYXJcbiAgLm1vZHVsZSgnZ3VsdS5yZXBvcnQuc3ZjcycsIFsnbmdSZXNvdXJjZSddKVxuXG4gIC5zZXJ2aWNlKCdSZXBvcnRzU3ZjJywgZnVuY3Rpb24oJHJlc291cmNlKSB7XG4gICAgcmV0dXJuICRyZXNvdXJjZShBUElfU0VSVkVSUy50ZXN0ZXIgKyAnL3JlcG9ydHMnLCB7fSwge1xuICAgICAgcXVlcnk6IHtcbiAgICAgICAgaXNBcnJheTogZmFsc2VcbiAgICAgIH1cbiAgICB9KTtcbiAgfSlcblxuICAuc2VydmljZSgnUmVwb3J0U3ZjJywgZnVuY3Rpb24oJHJlc291cmNlKSB7XG4gICAgcmV0dXJuICRyZXNvdXJjZShBUElfU0VSVkVSUy50ZXN0ZXIgKyAnL3JlcG9ydCcpO1xuICB9KTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=