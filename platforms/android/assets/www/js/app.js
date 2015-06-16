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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImluZGVudC9pbmRlbnRfbW9kdWxlLmpzIiwibG9naW4vbG9naW5fbW9kdWxlLmpzIiwicmVwb3J0L3JlcG9ydF9tb2R1bGUuanMiLCI0MDQvNDA0X2N0cmwuanMiLCJjb21wb25lbnQvY3VzdG9tLWRpcmVjdGl2ZS5qcyIsImNvbXBvbmVudC9jdXN0b20tZmlsdGVyLmpzIiwiY29tcG9uZW50L2RhdGUuanMiLCJjb21wb25lbnQvZW51bXMuanMiLCJjb21wb25lbnQvZmlsZXIuanMiLCJjb21wb25lbnQvaHR0cC5qcyIsImNvbXBvbmVudC9rZXltZ3IuanMiLCJjb21wb25lbnQvdXBsb2FkZXIuanMiLCJjb21wb25lbnQvdm0uanMiLCJjb21wb25lbnQvemgtY24uanMiLCJpbmRlbnQvZW51bXMuanMiLCJpbmRlbnQvaW5kZW50X3N2Y3MuanMiLCJpbmRlbnQvbGlzdF9jdHJsLmpzIiwibG9naW4vbG9naW5fY3RybC5qcyIsImxvZ2luL2xvZ2luX3N2Y3MuanMiLCJyZXBvcnQvaW5wdXRfcmVwb3J0LmpzIiwicmVwb3J0L3JlcG9ydF9jdHJsLmpzIiwicmVwb3J0L3JlcG9ydF9zdmNzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7QUFNQTtHQUNBLE9BQUEsUUFBQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7O0dBRUEsa0dBQUEsU0FBQSxtQkFBQSxvQkFBQSxjQUFBLDZCQUFBOzs7SUFHQTtPQUNBLFVBQUE7T0FDQSxXQUFBOzs7SUFHQTtPQUNBLFVBQUE7OztJQUdBLGFBQUEsYUFBQTs7O0lBR0E7T0FDQSxVQUFBO09BQ0EsVUFBQSxNQUFBOzs7SUFHQSxjQUFBO01BQ0EsUUFBQTs7OztJQUlBLFFBQUEsUUFBQSxVQUFBLEdBQUEsZUFBQSxXQUFBO01BQ0EsUUFBQSxRQUFBLFVBQUEsR0FBQSxjQUFBLFNBQUEsR0FBQTtRQUNBLEVBQUE7O1FBRUEsT0FBQTs7OztHQUlBLDBEQUFBLFNBQUEsWUFBQSxXQUFBLFFBQUEsY0FBQTtJQUNBLElBQUEsTUFBQTs7SUFFQSxXQUFBLFNBQUE7SUFDQSxXQUFBLGVBQUE7SUFDQSxXQUFBLGNBQUE7OztJQUdBO09BQ0EsT0FBQSxXQUFBO1FBQ0EsT0FBQSxVQUFBO1NBQ0EsU0FBQSxTQUFBLEtBQUE7UUFDQSxJQUFBLFFBQUEsUUFBQSxLQUFBLFFBQUEsSUFBQSxRQUFBLEtBQUEsS0FBQTtVQUNBOzs7UUFHQSxXQUFBLFVBQUE7OztJQUdBLFdBQUEsT0FBQSxXQUFBO01BQ0EsVUFBQSxJQUFBLFdBQUE7Ozs7O0FDL0VBO0dBQ0EsT0FBQSxlQUFBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBOztHQUVBLDBCQUFBLFNBQUEsZ0JBQUE7SUFDQTtPQUNBLE1BQUEsV0FBQTtRQUNBLFVBQUE7UUFDQSxLQUFBO1FBQ0EsYUFBQTtRQUNBLFNBQUE7VUFDQSxhQUFBOzs7T0FHQSxNQUFBLGdCQUFBO1FBQ0EsS0FBQTtRQUNBLGFBQUE7UUFDQSxZQUFBOztPQUVBLE1BQUEsdUJBQUE7UUFDQSxLQUFBO1FBQ0EsYUFBQTtRQUNBLFlBQUE7O09BRUEsTUFBQSxvQkFBQTtRQUNBLEtBQUE7UUFDQSxhQUFBO1FBQ0EsWUFBQTs7OztBQ2hDQTtHQUNBLE9BQUEsY0FBQTtJQUNBO0lBQ0E7OztHQUdBLDBCQUFBLFNBQUEsZ0JBQUE7SUFDQTtPQUNBLE1BQUEsU0FBQTtRQUNBLEtBQUE7UUFDQSxhQUFBO1FBQ0EsWUFBQTs7OztBQ1hBO0dBQ0EsT0FBQSxlQUFBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTs7R0FFQSwwQkFBQSxTQUFBLGdCQUFBO0lBQ0E7T0FDQSxNQUFBLHdCQUFBO1FBQ0EsS0FBQTtRQUNBLGFBQUE7UUFDQSxZQUFBOztPQUVBLE1BQUEsOEJBQUE7UUFDQSxLQUFBO1FBQ0EsYUFBQTtRQUNBLFlBQUE7O09BRUEsTUFBQSw2QkFBQTtRQUNBLEtBQUE7UUFDQSxhQUFBO1FBQ0EsWUFBQTs7T0FFQSxNQUFBLG1CQUFBO1FBQ0EsS0FBQTtRQUNBLGFBQUE7UUFDQSxZQUFBOzs7Ozs7OztBQ3hCQTtHQUNBLE9BQUEsZ0JBQUEsQ0FBQTs7O0dBR0EsMEJBQUEsVUFBQSxnQkFBQTtJQUNBO09BQ0EsTUFBQSxXQUFBO1FBQ0EsS0FBQTtRQUNBLGFBQUE7UUFDQSxZQUFBOzs7OztHQUtBLFdBQUEsMEJBQUEsVUFBQSxRQUFBO0lBQ0EsUUFBQSxJQUFBOzs7Ozs7O0FDakJBO0dBQ0EsT0FBQSxxQkFBQTtHQUNBLFVBQUEsZ0NBQUEsU0FBQSxVQUFBO0lBQ0EsT0FBQTtNQUNBLFVBQUE7TUFDQSxNQUFBLFNBQUEsT0FBQSxTQUFBLFlBQUE7UUFDQSxNQUFBLE9BQUEsV0FBQSxvQkFBQSxTQUFBLE9BQUE7VUFDQSxRQUFBLEtBQUEsaUJBQUEsQ0FBQSxDQUFBOzs7Ozs7QUNUQTtHQUNBLE9BQUEsZ0JBQUE7O0dBRUEsT0FBQSxVQUFBLFdBQUE7SUFDQSxPQUFBLFNBQUEsR0FBQTtNQUNBLElBQUEsS0FBQSxNQUFBO1FBQ0EsT0FBQTs7O01BR0EsSUFBQSxFQUFBLFFBQUEsWUFBQTs7TUFFQSxJQUFBLEVBQUEsU0FBQSxHQUFBO1FBQ0EsT0FBQTs7O01BR0EsSUFBQSxLQUFBLEVBQUEsTUFBQTs7TUFFQSxHQUFBLE9BQUEsR0FBQSxHQUFBOztNQUVBLElBQUEsRUFBQSxVQUFBLEdBQUE7UUFDQSxHQUFBLE9BQUEsR0FBQSxHQUFBOzs7TUFHQSxPQUFBLEdBQUEsS0FBQTs7OztBQ3ZCQTtHQUNBLE9BQUEsYUFBQTtHQUNBLFFBQUEsWUFBQSxZQUFBO0lBQ0EsSUFBQSxXQUFBLFVBQUEsTUFBQSxHQUFBO01BQ0EsT0FBQSxLQUFBLGdCQUFBLEtBQUEsS0FBQSxhQUFBLEtBQUEsSUFBQSxLQUFBOzs7SUFHQSxPQUFBO01BQ0EsbUJBQUEsVUFBQSxNQUFBO1FBQ0EsT0FBQSxTQUFBLE1BQUE7OztNQUdBLG1CQUFBLFNBQUEsTUFBQTtRQUNBLElBQUEsSUFBQSxLQUFBO1FBQ0EsSUFBQSxJQUFBLEtBQUE7O1FBRUEsSUFBQSxJQUFBLElBQUE7VUFDQSxJQUFBLE1BQUE7OztRQUdBLElBQUEsSUFBQSxJQUFBO1VBQ0EsSUFBQSxNQUFBOzs7UUFHQSxPQUFBLENBQUEsU0FBQSxNQUFBLE1BQUEsSUFBQSxNQUFBLEdBQUEsS0FBQTs7Ozs7QUN2QkE7R0FDQSxPQUFBLGNBQUE7R0FDQSxRQUFBLFNBQUEsWUFBQTtJQUNBLE9BQUEsVUFBQSxPQUFBO01BQ0EsT0FBQTtRQUNBLEtBQUEsVUFBQSxNQUFBLE1BQUE7VUFDQSxPQUFBLE1BQUEsTUFBQSxLQUFBLFVBQUEsTUFBQTtZQUNBLE9BQUEsS0FBQSxTQUFBO2FBQ0E7O1FBRUEsTUFBQSxVQUFBLE1BQUEsS0FBQTtVQUNBLE9BQUEsTUFBQSxNQUFBLEtBQUEsVUFBQSxNQUFBO1lBQ0EsT0FBQSxLQUFBLFVBQUE7YUFDQTs7UUFFQSxNQUFBLFVBQUEsTUFBQSxLQUFBO1VBQ0EsT0FBQSxNQUFBLE1BQUEsS0FBQSxVQUFBLE1BQUE7WUFDQSxPQUFBLEtBQUEsVUFBQTs7O1FBR0EsV0FBQSxTQUFBLE1BQUEsTUFBQTtVQUNBLE9BQUEsTUFBQSxNQUFBLEtBQUEsU0FBQSxNQUFBO1lBQ0EsT0FBQSxLQUFBLFNBQUE7OztRQUdBLE1BQUEsVUFBQSxNQUFBO1VBQ0EsT0FBQSxNQUFBOztRQUVBLE9BQUEsVUFBQSxNQUFBLE1BQUE7VUFDQSxPQUFBLE1BQUEsTUFBQSxPQUFBLFVBQUEsTUFBQTtZQUNBLE9BQUEsS0FBQSxRQUFBLEtBQUEsV0FBQSxDQUFBOzs7Ozs7O0FDOUJBO0dBQ0EsT0FBQSxjQUFBO0dBQ0EsUUFBQSw2QkFBQSxTQUFBLFNBQUEsTUFBQTtJQUNBLElBQUEsUUFBQTtJQUNBLE1BQUEsU0FBQSxTQUFBLEtBQUE7TUFDQSxRQUFBLDBCQUFBLEtBQUEsTUFBQSxXQUFBLE1BQUE7OztJQUdBLE1BQUEsWUFBQSxTQUFBLFdBQUE7TUFDQSxVQUFBLE9BQUEsV0FBQTtRQUNBLEtBQUEsS0FBQSxlQUFBLFVBQUE7U0FDQSxXQUFBO1FBQ0EsS0FBQSxLQUFBLGVBQUEsVUFBQTs7OztJQUlBLE1BQUEsVUFBQSxTQUFBLEtBQUE7TUFDQSxLQUFBLEtBQUEsZUFBQSxLQUFBLFVBQUEsSUFBQTs7O0lBR0EsT0FBQTs7QUNyQkE7R0FDQSxPQUFBLG9CQUFBOztHQUVBLHlCQUFBLFNBQUEsZUFBQTtJQUNBLGNBQUEsYUFBQSxLQUFBOzs7SUFHQSxjQUFBLFNBQUEsUUFBQSxPQUFBLHNCQUFBO0lBQ0EsY0FBQSxTQUFBLFFBQUEsS0FBQSxrQkFBQTtJQUNBLGNBQUEsU0FBQSxtQkFBQSxDQUFBLFNBQUEsTUFBQTtRQUNBLElBQUEsTUFBQTs7UUFFQSxRQUFBLFFBQUEsTUFBQSxTQUFBLE9BQUEsS0FBQTtVQUNBLEtBQUEsS0FBQSxtQkFBQSxPQUFBLE1BQUEsbUJBQUE7V0FDQTs7UUFFQSxPQUFBLElBQUEsS0FBQTs7OztHQUlBLFFBQUEscURBQUEsU0FBQSxJQUFBLFlBQUEsV0FBQTtJQUNBLE9BQUE7O01BRUEsV0FBQSxTQUFBLFFBQUE7UUFDQSxPQUFBLFFBQUEsZ0JBQUEsT0FBQSxpQkFBQTtRQUNBLE9BQUEsUUFBQSxZQUFBLE9BQUEsYUFBQTs7O1FBR0EsSUFBQSxPQUFBLElBQUEsUUFBQSxZQUFBLENBQUEsS0FBQSxPQUFBLElBQUEsUUFBQSxXQUFBLENBQUEsR0FBQTtVQUNBLE9BQUE7OztRQUdBLE9BQUEsTUFBQSxPQUFBLE1BQUEsUUFBQSxJQUFBLE9BQUE7O1FBRUEsT0FBQTs7OztNQUlBLGdCQUFBLFNBQUEsV0FBQTtRQUNBLE9BQUEsR0FBQSxPQUFBOzs7Ozs7Ozs7TUFTQSxZQUFBLFNBQUEsVUFBQTs7UUFFQSxJQUFBLE1BQUE7O1FBRUEsSUFBQSxRQUFBLFNBQUEsU0FBQSxPQUFBO1VBQ0EsT0FBQSxTQUFBLEtBQUE7VUFDQSxPQUFBLFNBQUEsS0FBQTs7Ozs7VUFLQSxJQUFBLFNBQUEsS0FBQTtZQUNBLE9BQUEsR0FBQSxPQUFBOzs7Ozs7VUFNQSxJQUFBLFFBQUEsTUFBQTtZQUNBLFNBQUEsT0FBQTs7Ozs7Ozs7O1FBU0EsT0FBQTs7OztNQUlBLGlCQUFBLFNBQUEsV0FBQTtRQUNBLElBQUEsZUFBQSxVQUFBOztRQUVBLElBQUEsVUFBQSxXQUFBLEtBQUE7VUFDQSxVQUFBLElBQUE7VUFDQSxVQUFBLE9BQUEsWUFBQTs7O1FBR0EsT0FBQSxHQUFBLE9BQUE7Ozs7O0FDdkZBO0dBQ0EsT0FBQSxlQUFBO0dBQ0EsUUFBQSwwQ0FBQSxTQUFBLE1BQUEscUJBQUE7SUFDQSxJQUFBLFNBQUE7TUFDQSxhQUFBOztNQUVBLFFBQUEsU0FBQSxVQUFBLFFBQUE7UUFDQSxJQUFBLFVBQUEsV0FBQSxHQUFBO1VBQ0EsTUFBQSxJQUFBLE1BQUE7OztRQUdBLE9BQUEsQ0FBQSxVQUFBLFFBQUEsS0FBQSxPQUFBOzs7TUFHQSxRQUFBLFNBQUEsS0FBQSxVQUFBLFFBQUE7UUFDQSxJQUFBLFVBQUEsV0FBQSxHQUFBO1VBQ0EsTUFBQSxJQUFBLE1BQUEsWUFBQSxNQUFBOzs7O1FBSUEsSUFBQSxVQUFBLFdBQUEsR0FBQTtVQUNBLE9BQUEsQ0FBQSxVQUFBLEtBQUEsS0FBQSxPQUFBOzs7UUFHQSxPQUFBLENBQUEsVUFBQSxRQUFBLEtBQUEsS0FBQSxPQUFBOzs7O0lBSUEsUUFBQSxPQUFBLFFBQUE7TUFDQSxLQUFBLE9BQUEsT0FBQSxLQUFBLFFBQUE7O01BRUEsUUFBQSxPQUFBLE9BQUEsS0FBQSxRQUFBOztNQUVBLFFBQUEsT0FBQSxPQUFBLEtBQUEsUUFBQTs7TUFFQSxPQUFBLFNBQUEsVUFBQSxRQUFBO1FBQ0Esb0JBQUEsT0FBQSxPQUFBLE9BQUEsVUFBQTtRQUNBLG9CQUFBLE9BQUEsT0FBQSxPQUFBLFVBQUE7UUFDQSxvQkFBQSxPQUFBLE9BQUEsT0FBQSxVQUFBO1FBQ0Esb0JBQUEsT0FBQSxPQUFBLElBQUEsVUFBQTs7OztJQUlBLE9BQUE7Ozs7QUMxQ0E7R0FDQSxPQUFBLGlCQUFBO0dBQ0EsUUFBQSxtQ0FBQSxTQUFBLFlBQUEsTUFBQTtJQUNBLElBQUEsS0FBQTtJQUNBLElBQUEsT0FBQSxXQUFBOztJQUVBLElBQUEsV0FBQTs7Ozs7OztNQU9BLE9BQUEsU0FBQSxLQUFBO1FBQ0EsSUFBQSxDQUFBLElBQUEsZUFBQSxDQUFBLElBQUEsS0FBQTtVQUNBLE1BQUEsSUFBQSxNQUFBOzs7UUFHQSxJQUFBLFFBQUEsSUFBQSxZQUFBO1FBQ0EsSUFBQTtRQUNBLElBQUEsa0JBQUE7OztRQUdBLElBQUEsVUFBQSxHQUFBO1VBQ0E7OztRQUdBLElBQUEsYUFBQTtVQUNBLFdBQUE7VUFDQSxNQUFBO1VBQ0EsS0FBQTtVQUNBLE9BQUE7OztRQUdBLE1BQUEsUUFBQSxPQUFBLElBQUEsWUFBQTs7UUFFQSxJQUFBLFdBQUEsU0FBQSxZQUFBOztVQUVBLFdBQUEsV0FBQTs7VUFFQSxJQUFBLElBQUEsTUFBQSxVQUFBOztVQUVBOztVQUVBLElBQUEsV0FBQTtZQUNBLFFBQUE7WUFDQSxPQUFBO1lBQ0EsU0FBQSxTQUFBLGtCQUFBLFFBQUE7OztVQUdBLElBQUEsVUFBQSxRQUFBLEdBQUE7WUFDQSxJQUFBLEdBQUEsaUJBQUE7Y0FDQSxHQUFBLGtCQUFBO2NBQ0EsT0FBQSxHQUFBOzs7WUFHQSxJQUFBOzs7O1FBSUEsSUFBQSxjQUFBLFFBQUEsS0FBQSxJQUFBLGFBQUE7OztRQUdBLElBQUEsVUFBQSxHQUFBO1VBQ0EsUUFBQTtVQUNBLFNBQUEsSUFBQTtZQUNBLFlBQUEsSUFBQSxZQUFBO1lBQ0EsU0FBQTtZQUNBLEtBQUEsSUFBQTtZQUNBLE9BQUEsSUFBQTs7O1VBR0E7Ozs7UUFJQSxJQUFBLFFBQUEsSUFBQSxXQUFBO1VBQ0EsUUFBQSxRQUFBO1VBQ0EsS0FBQSxJQUFBLElBQUEsR0FBQSxJQUFBLE9BQUEsS0FBQTtZQUNBLFNBQUEsSUFBQTtjQUNBLFlBQUEsSUFBQSxZQUFBO2NBQ0EsU0FBQTtjQUNBLEtBQUEsSUFBQTtjQUNBLE9BQUEsSUFBQTs7OztVQUlBOzs7O1FBSUEsUUFBQSxJQUFBLFlBQUE7UUFDQSxHQUFBLGtCQUFBLElBQUE7Ozs7UUFJQSxHQUFBLGlCQUFBLG1CQUFBLFNBQUEsZ0JBQUE7O1VBRUEsSUFBQSxDQUFBLGdCQUFBO1lBQ0E7OztVQUdBLFNBQUEsSUFBQTtZQUNBLFlBQUEsSUFBQSxZQUFBLEVBQUE7WUFDQSxTQUFBO1lBQ0EsS0FBQSxJQUFBO1lBQ0EsT0FBQSxJQUFBOzs7O1FBSUEsS0FBQSxJQUFBLElBQUEsR0FBQSxJQUFBLElBQUEsV0FBQSxLQUFBO1VBQ0EsU0FBQSxJQUFBO1lBQ0EsWUFBQSxJQUFBLFlBQUE7WUFDQSxTQUFBO1lBQ0EsS0FBQSxJQUFBO1lBQ0EsT0FBQSxJQUFBOzs7O1FBSUE7Ozs7TUFJQSxLQUFBLFNBQUEsS0FBQTtRQUNBLElBQUEsQ0FBQSxJQUFBLGNBQUEsQ0FBQSxJQUFBLEtBQUE7VUFDQSxNQUFBLElBQUEsTUFBQTs7O1FBR0EsS0FBQSxNQUFBLGlCQUFBLEtBQUEsVUFBQSxJQUFBOztRQUVBLElBQUEsYUFBQTtVQUNBLFNBQUE7VUFDQSxPQUFBO1VBQ0EsU0FBQTtVQUNBLFVBQUEsSUFBQSxXQUFBLElBQUEsT0FBQSxJQUFBLFdBQUEsSUFBQSxZQUFBLE9BQUE7O1FBRUEsSUFBQSxvQkFBQSxJQUFBO1FBQ0EsTUFBQSxRQUFBLE9BQUEsSUFBQSxZQUFBO1FBQ0EsSUFBQSxhQUFBLFNBQUEsZUFBQTtVQUNBLElBQUEsY0FBQSxrQkFBQTs7WUFFQSxJQUFBLFNBQUEsY0FBQTs7WUFFQSxJQUFBLFFBQUEsY0FBQTs7WUFFQSxJQUFBLFVBQUEsU0FBQSxDQUFBLFNBQUEsU0FBQTs7WUFFQSxrQkFBQTtjQUNBLFFBQUE7Y0FDQSxPQUFBO2NBQ0EsU0FBQTs7Ozs7UUFLQSxJQUFBLFNBQUEsSUFBQTtRQUNBLE9BQUEsVUFBQSxJQUFBO1FBQ0EsT0FBQSxXQUFBLElBQUE7O1FBRUEsSUFBQSxLQUFBLElBQUE7UUFDQSxHQUFBLGFBQUEsSUFBQTtRQUNBLEdBQUE7VUFDQSxJQUFBLFdBQUE7VUFDQSxVQUFBLElBQUE7VUFDQSxJQUFBLFFBQUEsS0FBQSxVQUFBLElBQUE7VUFDQSxJQUFBLE1BQUEsS0FBQSxVQUFBLElBQUE7VUFDQTs7Ozs7SUFLQSxPQUFBOzs7O0FDNUtBO0dBQ0EsT0FBQSxXQUFBO0dBQ0EsUUFBQSxlQUFBLFVBQUEsTUFBQTtJQUNBLE9BQUE7TUFDQSxTQUFBLFNBQUEsSUFBQSxRQUFBO1FBQ0EsSUFBQSxNQUFBOztRQUVBLElBQUEsUUFBQSxTQUFBLFNBQUE7VUFDQSxTQUFBLE9BQUEsTUFBQTs7O1FBR0EsSUFBQSxPQUFBLFdBQUEsS0FBQSxPQUFBLE9BQUEsSUFBQTtVQUNBLEtBQUEsS0FBQTtVQUNBOzs7UUFHQSxJQUFBLENBQUEsUUFBQSxRQUFBLFNBQUE7VUFDQSxLQUFBLE1BQUE7VUFDQTs7O1FBR0EsT0FBQSxJQUFBLFNBQUEsT0FBQTtVQUNBLE9BQUEsSUFBQSxTQUFBLEdBQUE7OztRQUdBLE9BQUE7Ozs7QUMxQkE7QUFDQSxRQUFBLE9BQUEsWUFBQSxJQUFBLENBQUEsWUFBQSxTQUFBLFVBQUE7RUFDQSxJQUFBLGtCQUFBO0lBQ0EsTUFBQTtJQUNBLEtBQUE7SUFDQSxLQUFBO0lBQ0EsS0FBQTtJQUNBLE1BQUE7SUFDQSxPQUFBOztFQUVBLFNBQUEsTUFBQSxXQUFBO0lBQ0Esb0JBQUE7TUFDQSxTQUFBO1FBQ0E7UUFDQTs7TUFFQSxPQUFBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7O01BRUEsU0FBQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7TUFFQSxZQUFBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7O01BRUEsY0FBQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7TUFFQSxZQUFBO01BQ0EsWUFBQTtNQUNBLFVBQUE7TUFDQSxjQUFBO01BQ0EsY0FBQTtNQUNBLFNBQUE7TUFDQSxhQUFBO01BQ0EsYUFBQTs7SUFFQSxrQkFBQTtNQUNBLGdCQUFBO01BQ0EsZUFBQTtNQUNBLGFBQUE7TUFDQSxZQUFBLENBQUE7UUFDQSxTQUFBO1FBQ0EsVUFBQTtRQUNBLFdBQUE7UUFDQSxXQUFBO1FBQ0EsV0FBQTtRQUNBLFVBQUE7UUFDQSxVQUFBO1FBQ0EsVUFBQTtRQUNBLFVBQUE7UUFDQSxVQUFBO1NBQ0E7UUFDQSxTQUFBO1FBQ0EsVUFBQTtRQUNBLFdBQUE7UUFDQSxXQUFBO1FBQ0EsV0FBQTtRQUNBLFVBQUE7UUFDQSxVQUFBO1FBQ0EsVUFBQTtRQUNBLFVBQUE7UUFDQSxVQUFBOzs7SUFHQSxNQUFBO0lBQ0EsYUFBQSxTQUFBLEdBQUE7TUFDQSxPQUFBLGdCQUFBOzs7OztBQ3JHQTtHQUNBLE9BQUEscUJBQUEsQ0FBQTs7Q0FFQSxRQUFBLHFEQUFBLFNBQUEsT0FBQSxnQkFBQSxRQUFBO0VBQ0EsT0FBQTtPQUNBO09BQ0E7T0FDQSxLQUFBLFNBQUEsS0FBQTtRQUNBLElBQUEsYUFBQSxpRUFBQSxNQUFBOztRQUVBLFdBQUEsUUFBQSxTQUFBLEtBQUE7VUFDQSxJQUFBLEtBQUEsUUFBQTtZQUNBLE1BQUE7WUFDQSxPQUFBOzs7O1FBSUEsSUFBQSxVQUFBLENBQUE7VUFDQSxNQUFBO1VBQ0EsT0FBQTtXQUNBO1VBQ0EsTUFBQTtVQUNBLE9BQUE7V0FDQTtVQUNBLE1BQUE7VUFDQSxPQUFBO1dBQ0E7VUFDQSxNQUFBO1VBQ0EsT0FBQTtXQUNBO1VBQ0EsTUFBQTtVQUNBLE9BQUE7OztRQUdBLE9BQUEsTUFBQSxJQUFBOztPQUVBLE1BQUEsU0FBQSxLQUFBO1FBQ0EsT0FBQSxNQUFBLElBQUEsT0FBQTs7OztBQ3JDQTtHQUNBLE9BQUEsb0JBQUEsQ0FBQTs7R0FFQSxRQUFBLGdDQUFBLFNBQUEsV0FBQTtJQUNBLE9BQUEsVUFBQSxZQUFBLFNBQUE7OztHQUdBLFFBQUEsNEJBQUEsU0FBQSxXQUFBO0lBQ0EsT0FBQSxVQUFBLFlBQUEsU0FBQSxXQUFBLElBQUE7TUFDQSxPQUFBO1FBQ0EsU0FBQTs7Ozs7R0FLQSxRQUFBLDJCQUFBLFNBQUEsV0FBQTtJQUNBLE9BQUEsVUFBQSxZQUFBLFNBQUEsY0FBQTtNQUNBLElBQUE7T0FDQTtNQUNBLFFBQUE7UUFDQSxRQUFBOzs7OztHQUtBLFFBQUEsaUNBQUEsU0FBQSxXQUFBO0lBQ0EsT0FBQSxVQUFBLFlBQUEsU0FBQSxpQ0FBQTtNQUNBLElBQUE7T0FDQTtNQUNBLFFBQUE7UUFDQSxRQUFBOzs7OztHQUtBLFFBQUEsd0NBQUEsU0FBQSxXQUFBO0lBQ0EsT0FBQSxVQUFBLFlBQUEsU0FBQSwrQkFBQTtNQUNBLElBQUE7T0FDQTtNQUNBLFFBQUE7UUFDQSxRQUFBOzs7OztHQUtBLFFBQUEsNEJBQUEsU0FBQSxXQUFBO0lBQ0EsT0FBQSxVQUFBLFlBQUEsU0FBQSxZQUFBLElBQUE7TUFDQSxPQUFBO1FBQ0EsU0FBQTs7Ozs7R0FLQSxRQUFBLG9DQUFBLFNBQUEsV0FBQTtJQUNBLE9BQUEsVUFBQSxZQUFBLFNBQUE7OztHQUdBLFFBQUEsK0JBQUEsU0FBQSxXQUFBO0lBQ0EsT0FBQSxVQUFBLFlBQUEsU0FBQSx3QkFBQTtNQUNBLFVBQUE7Ozs7R0FJQSxRQUFBLDhCQUFBLFNBQUEsV0FBQTtJQUNBLE9BQUEsVUFBQSxZQUFBLFNBQUEsZ0NBQUE7TUFDQSxVQUFBO01BQ0EsUUFBQTtPQUNBO01BQ0EsUUFBQTtRQUNBLFFBQUE7Ozs7O0FDcEVBO0dBQ0EsT0FBQTs7R0FFQSxXQUFBLDJIQUFBLFNBQUEsUUFBQSxXQUFBLFFBQUE7SUFDQSxZQUFBLFdBQUEsaUJBQUEsYUFBQTtJQUNBLElBQUEsS0FBQTtJQUNBLElBQUEsTUFBQSxVQUFBOztJQUVBLEdBQUEsWUFBQSxTQUFBLElBQUEsY0FBQTs7SUFFQSxJQUFBLEdBQUEsT0FBQSxTQUFBLHdCQUFBO01BQ0EsR0FBQSxZQUFBO1dBQ0E7TUFDQSxHQUFBLFVBQUEsU0FBQSxJQUFBLFlBQUE7TUFDQSxHQUFBLGVBQUEsU0FBQSxJQUFBLGlCQUFBOztNQUVBLEdBQUEsbUJBQUEsSUFBQSxvQkFBQTs7TUFFQSxHQUFBLFNBQUEsWUFBQSxLQUFBLGdCQUFBLEdBQUE7TUFDQSxHQUFBLGNBQUEsWUFBQSxLQUFBO01BQ0EsR0FBQSxPQUFBLFlBQUEsS0FBQSxRQUFBLEdBQUE7TUFDQSxHQUFBLFlBQUEsWUFBQSxLQUFBOzs7TUFHQSxHQUFBLFlBQUEsWUFBQSxLQUFBLGFBQUEsR0FBQTtNQUNBLEdBQUEsaUJBQUEsWUFBQSxLQUFBOztNQUVBLFdBQUEsVUFBQTtNQUNBLFdBQUEsUUFBQTs7TUFFQSxXQUFBLGFBQUE7O01BRUEsR0FBQSxTQUFBOzs7SUFHQSxHQUFBLE9BQUEsU0FBQSxJQUFBLFNBQUE7SUFDQSxHQUFBLE9BQUEsU0FBQSxJQUFBLFNBQUE7SUFDQSxHQUFBLFFBQUEsWUFBQSxLQUFBO0lBQ0EsR0FBQSxZQUFBLFlBQUEsS0FBQSxRQUFBLEdBQUE7O0lBRUEsR0FBQSxjQUFBO0lBQ0EsR0FBQSxjQUFBO0lBQ0EsR0FBQSxlQUFBO0lBQ0EsR0FBQSxnQkFBQTs7SUFFQTs7SUFFQSxTQUFBLFFBQUE7TUFDQSxJQUFBLFNBQUE7UUFDQSxTQUFBLEdBQUE7UUFDQSxZQUFBLEdBQUE7UUFDQSxNQUFBLEdBQUE7O1FBRUEsV0FBQSxHQUFBOzs7TUFHQSxJQUFBLEdBQUEsT0FBQSxTQUFBLGlCQUFBO1FBQ0EsUUFBQSxPQUFBLFFBQUE7VUFDQSxTQUFBLEdBQUE7VUFDQSxjQUFBLEdBQUE7O1VBRUEsa0JBQUEsR0FBQTs7OztNQUlBLFVBQUEsT0FBQTs7TUFFQTtTQUNBLE1BQUE7U0FDQTtTQUNBLEtBQUEsU0FBQSxJQUFBO1VBQ0EsR0FBQSxNQUFBLFFBQUEsU0FBQSxNQUFBO1lBQ0EsS0FBQSxjQUFBLFlBQUEsS0FBQSxnQkFBQSxLQUFBOzs7VUFHQSxHQUFBLFFBQUEsR0FBQTtVQUNBLEdBQUEsY0FBQSxHQUFBOztVQUVBLElBQUEsTUFBQSxHQUFBLGNBQUEsR0FBQTtVQUNBLEdBQUEsYUFBQSxHQUFBLGNBQUEsR0FBQSxTQUFBLElBQUEsT0FBQSxLQUFBLE1BQUEsT0FBQTs7U0FFQSxNQUFBLFNBQUEsS0FBQTtVQUNBLE9BQUEsTUFBQSxJQUFBLEtBQUEsT0FBQTs7OztJQUlBLFNBQUEsV0FBQSxNQUFBLE9BQUE7TUFDQSxHQUFBLE9BQUEsTUFBQSxTQUFBLE1BQUE7UUFDQSxJQUFBLENBQUEsTUFBQTtVQUNBOzs7UUFHQSxHQUFBLFNBQUEsS0FBQTs7Ozs7SUFLQSxTQUFBLGNBQUEsTUFBQTtNQUNBLElBQUEsUUFBQSxhQUFBO1FBQ0E7V0FDQSxPQUFBO1lBQ0EsSUFBQSxLQUFBOztXQUVBO1dBQ0EsS0FBQSxTQUFBLEtBQUE7WUFDQSxPQUFBLFFBQUEsSUFBQSxPQUFBOztZQUVBOztXQUVBLE1BQUEsU0FBQSxLQUFBO1lBQ0EsT0FBQSxNQUFBLElBQUEsT0FBQTs7Ozs7O0lBTUEsU0FBQSxhQUFBLE1BQUE7TUFDQSxJQUFBLG1CQUFBLE9BQUEsS0FBQTtRQUNBLGFBQUE7UUFDQSxZQUFBO1FBQ0EsVUFBQTtRQUNBLFNBQUE7VUFDQSxhQUFBLFdBQUE7WUFDQSxPQUFBOzs7OztNQUtBLGlCQUFBLE9BQUEsS0FBQSxXQUFBOzs7UUFHQTs7Ozs7SUFLQSxTQUFBLFlBQUEsTUFBQTtNQUNBLEdBQUEsT0FBQTtNQUNBLEdBQUEsT0FBQTs7TUFFQTs7OztJQUlBLFNBQUEsWUFBQSxNQUFBO01BQ0EsR0FBQSxPQUFBOztNQUVBOzs7O0lBSUEsU0FBQSxTQUFBO01BQ0EsR0FBQSxPQUFBOztNQUVBOzs7O0dBSUEsV0FBQSx3TkFBQSxTQUFBLFFBQUEsTUFBQSxXQUFBLFFBQUEsZ0JBQUE7SUFDQSxPQUFBLFVBQUEsUUFBQSxxQkFBQSxvQkFBQTtJQUNBLGNBQUEsV0FBQTtJQUNBLElBQUEsS0FBQTtJQUNBLElBQUEsUUFBQSxLQUFBLE1BQUEsZUFBQSxJQUFBOztJQUVBLElBQUEsU0FBQSxNQUFBLFFBQUE7TUFDQSxHQUFBLGdCQUFBLE1BQUEsR0FBQTs7O0lBR0EsR0FBQSxlQUFBO0lBQ0EsR0FBQSxVQUFBO0lBQ0EsR0FBQSxXQUFBO0lBQ0EsR0FBQSxnQkFBQTtJQUNBLEdBQUEsY0FBQTs7SUFFQTs7SUFFQSxTQUFBLFFBQUE7TUFDQSxPQUFBO1NBQ0E7U0FDQTtTQUNBLEtBQUEsU0FBQSxLQUFBO1VBQ0EsSUFBQSxRQUFBLFNBQUEsT0FBQTtZQUNBLE1BQUEsS0FBQSxRQUFBLFNBQUEsS0FBQTtjQUNBLElBQUEsb0JBQUEsT0FBQSxPQUFBLE1BQUEsSUFBQSxJQUFBO2NBQ0EsSUFBQSxnQkFBQSxvQkFBQSxJQUFBOzs7O1VBSUEsR0FBQSxRQUFBOztTQUVBLE1BQUEsU0FBQSxLQUFBO1VBQ0EsT0FBQSxNQUFBLElBQUEsT0FBQTs7Ozs7SUFLQSxTQUFBLFNBQUEsSUFBQSxLQUFBO01BQ0EsSUFBQSxlQUFBLE9BQUEsS0FBQTtRQUNBLGFBQUE7UUFDQSxZQUFBO1FBQ0EsVUFBQTtRQUNBLFNBQUE7VUFDQSxhQUFBLFdBQUE7WUFDQSxPQUFBOztVQUVBLGFBQUEsV0FBQTtZQUNBLE9BQUE7Y0FDQSxJQUFBO2NBQ0EsS0FBQTs7Ozs7O01BTUEsYUFBQSxPQUFBLEtBQUEsV0FBQTtRQUNBOzs7OztJQUtBLFNBQUEsUUFBQSxVQUFBLEtBQUE7TUFDQSxJQUFBLFFBQUEsV0FBQSxDQUFBLElBQUEsT0FBQSxJQUFBLFFBQUEsSUFBQSxPQUFBLEtBQUEsT0FBQSxNQUFBO1FBQ0EsT0FBQTtXQUNBLE9BQUE7WUFDQSxVQUFBO1lBQ0EsUUFBQSxJQUFBOztXQUVBO1dBQ0EsS0FBQSxTQUFBLEtBQUE7WUFDQSxPQUFBLE1BQUEsVUFBQSxJQUFBOztZQUVBLE9BQUEsUUFBQSxJQUFBLE9BQUE7O1lBRUE7O1dBRUEsTUFBQSxTQUFBLEtBQUE7WUFDQSxPQUFBLE1BQUEsSUFBQSxPQUFBOzs7Ozs7SUFNQSxTQUFBLFlBQUEsVUFBQSxLQUFBO01BQ0EsT0FBQSxNQUFBLFVBQUEsSUFBQTtNQUNBLE9BQUEsUUFBQTs7OztJQUlBLFNBQUEsYUFBQSxNQUFBO01BQ0EsSUFBQSxtQkFBQSxPQUFBLEtBQUE7UUFDQSxhQUFBO1FBQ0EsWUFBQTtRQUNBLFVBQUE7UUFDQSxTQUFBO1VBQ0EsYUFBQSxXQUFBO1lBQ0EsT0FBQTs7Ozs7TUFLQSxpQkFBQSxPQUFBLEtBQUEsV0FBQTs7UUFFQSxLQUFBLEtBQUEsUUFBQSxTQUFBLEtBQUE7VUFDQSxPQUFBLE1BQUEsS0FBQSxJQUFBLElBQUE7OztRQUdBOzs7OztJQUtBLFNBQUEsY0FBQSxPQUFBLEtBQUE7TUFDQSxJQUFBLFdBQUEsTUFBQTtNQUNBLElBQUEsU0FBQSxJQUFBOztNQUVBLElBQUEsYUFBQSxPQUFBLE9BQUEsVUFBQTtNQUNBLElBQUEsb0JBQUEsT0FBQSxPQUFBO01BQ0EsSUFBQSxjQUFBLG9CQUFBLElBQUE7O01BRUEsS0FBQSxLQUFBLGFBQUE7TUFDQSxLQUFBLEtBQUEsYUFBQSxLQUFBLFVBQUE7O01BRUEsSUFBQSxDQUFBLGFBQUE7UUFDQSxLQUFBLEtBQUE7UUFDQTs7O01BR0EsSUFBQSxjQUFBLGdCQUFBO01BQ0EsSUFBQSxjQUFBLFlBQUE7O01BRUEsSUFBQSxjQUFBOztNQUVBLE9BQUEsS0FBQSxhQUFBLFFBQUEsU0FBQSxLQUFBO1FBQ0EsUUFBQSxPQUFBLGFBQUEsWUFBQTs7O01BR0EsS0FBQSxLQUFBLGNBQUEsS0FBQSxVQUFBOztNQUVBLElBQUEsZUFBQTtNQUNBLE9BQUEsS0FBQSxhQUFBLFFBQUEsU0FBQSxLQUFBO1FBQ0EsSUFBQSxZQUFBLEtBQUEsT0FBQTtVQUNBLGFBQUEsT0FBQSxRQUFBLE9BQUE7WUFDQSxLQUFBLFlBQUEsS0FBQTthQUNBLFlBQUE7Ozs7TUFJQSxJQUFBLFNBQUEsRUFBQSxPQUFBOzs7TUFHQSxJQUFBLENBQUEsT0FBQSxRQUFBO1FBQ0E7O1FBRUE7OztNQUdBLEtBQUEsS0FBQSxhQUFBLEtBQUEsVUFBQTtNQUNBLEtBQUEsS0FBQTtNQUNBLFNBQUEsTUFBQTtRQUNBLEtBQUE7UUFDQSxhQUFBO1FBQ0EsTUFBQTtRQUNBLEtBQUE7UUFDQSxZQUFBO1FBQ0EsT0FBQTs7O01BR0EsU0FBQSxXQUFBLFVBQUE7O1FBRUEsS0FBQSxLQUFBLFdBQUEsU0FBQTtRQUNBLElBQUEsY0FBQSxnQkFBQSxTQUFBLFNBQUEsVUFBQTtRQUNBLEdBQUE7OztNQUdBLFNBQUEsV0FBQSxPQUFBLE1BQUE7O1FBRUEsTUFBQSxVQUFBLEtBQUE7UUFDQSxLQUFBLEtBQUEsYUFBQSxLQUFBLFVBQUE7OztNQUdBLFNBQUEsYUFBQSxPQUFBO1FBQ0EsS0FBQSxLQUFBLGFBQUEsS0FBQSxVQUFBOzs7TUFHQSxTQUFBLGNBQUE7Ozs7UUFJQSxLQUFBLEtBQUE7OztRQUdBLE9BQUEsUUFBQSxTQUFBLE9BQUE7VUFDQSxZQUFBLE1BQUEsTUFBQTs7O1FBR0EsS0FBQSxLQUFBOzs7UUFHQSxvQkFBQSxJQUFBLG1CQUFBOzs7UUFHQTs7Ozs7OztNQU9BLFNBQUEsZ0JBQUE7UUFDQSxLQUFBLEtBQUE7O1FBRUEsT0FBQTtXQUNBLEtBQUE7WUFDQSxVQUFBO1lBQ0EsUUFBQTthQUNBO1dBQ0E7V0FDQSxLQUFBLFdBQUE7WUFDQSxLQUFBLEtBQUE7OztZQUdBLElBQUEsT0FBQSxRQUFBO2NBQ0EsT0FBQSxRQUFBLFNBQUEsT0FBQTtnQkFDQSxNQUFBLE9BQUEsTUFBQTs7Ozs7WUFLQSxPQUFBLE1BQUEsVUFBQTs7O1lBR0EsSUFBQSxjQUFBLGdCQUFBO1lBQ0EsSUFBQSxjQUFBLFdBQUE7Ozs7V0FJQSxNQUFBLFNBQUEsS0FBQTtZQUNBLEtBQUEsS0FBQSxlQUFBLEtBQUEsVUFBQTtZQUNBLE9BQUEsTUFBQSxJQUFBLE9BQUE7O1lBRUEsSUFBQSxjQUFBLFlBQUE7Ozs7Ozs7R0FPQSxXQUFBLG1HQUFBLFNBQUEsUUFBQSxnQkFBQSxRQUFBLHdCQUFBLGFBQUE7SUFDQSxJQUFBLEtBQUE7O0lBRUEsUUFBQSxPQUFBLElBQUE7O0lBRUEsR0FBQSxlQUFBO0lBQ0EsR0FBQSxTQUFBOztJQUVBLFNBQUEsZUFBQTtNQUNBLEdBQUEsc0JBQUE7O01BRUE7U0FDQSxPQUFBO1VBQ0EsSUFBQSxZQUFBO1dBQ0E7VUFDQSxNQUFBLEdBQUE7O1NBRUE7U0FDQSxLQUFBLFNBQUEsS0FBQTtVQUNBLE9BQUEsUUFBQSxJQUFBLE9BQUE7O1VBRUEsZUFBQTs7U0FFQSxNQUFBLFNBQUEsS0FBQTtVQUNBLEdBQUEsc0JBQUE7O1VBRUEsT0FBQSxNQUFBLElBQUEsT0FBQTs7OztJQUlBLFNBQUEsU0FBQTtNQUNBLGVBQUE7Ozs7O0dBS0EsV0FBQSwySEFBQSxTQUFBLFFBQUEsZ0JBQUEsUUFBQTtJQUNBLGNBQUEsYUFBQSxhQUFBO0lBQ0EsSUFBQSxLQUFBOztJQUVBLEdBQUEsYUFBQSxZQUFBLEtBQUE7SUFDQSxHQUFBLGNBQUEsWUFBQSxLQUFBO0lBQ0EsR0FBQSxhQUFBLFlBQUEsS0FBQTs7SUFFQSxJQUFBLFlBQUEsS0FBQTtNQUNBLEdBQUEsUUFBQTs7TUFFQSxZQUFBLFNBQUEsWUFBQSxJQUFBO01BQ0EsWUFBQSxVQUFBLFlBQUEsSUFBQTtNQUNBLFlBQUEsU0FBQSxZQUFBLElBQUE7V0FDQTtNQUNBLEdBQUEsUUFBQTs7O0lBR0EsR0FBQSxTQUFBO0lBQ0EsR0FBQSxTQUFBOztJQUVBLFNBQUEsU0FBQTtNQUNBLElBQUEsWUFBQSxLQUFBO1FBQ0E7V0FDQSxPQUFBO1lBQ0EsVUFBQSxZQUFBO1lBQ0EsUUFBQSxZQUFBLElBQUE7YUFDQTtZQUNBLE9BQUEsR0FBQSxNQUFBO1lBQ0EsUUFBQSxHQUFBLE1BQUE7WUFDQSxPQUFBLEdBQUEsTUFBQTs7V0FFQTtXQUNBLEtBQUEsU0FBQSxLQUFBO1lBQ0EsT0FBQSxRQUFBLElBQUEsT0FBQTs7WUFFQSxlQUFBOztXQUVBLE1BQUEsU0FBQSxLQUFBO1lBQ0EsT0FBQSxNQUFBLElBQUEsT0FBQTs7YUFFQTtRQUNBO1dBQ0EsS0FBQTtZQUNBLFVBQUEsWUFBQTthQUNBO1lBQ0EsT0FBQSxHQUFBLE1BQUE7WUFDQSxRQUFBLEdBQUEsTUFBQTtZQUNBLE9BQUEsR0FBQSxNQUFBOztXQUVBO1dBQ0EsS0FBQSxTQUFBLEtBQUE7WUFDQSxPQUFBLFFBQUEsSUFBQSxPQUFBOztZQUVBLGVBQUE7O1dBRUEsTUFBQSxTQUFBLEtBQUE7WUFDQSxPQUFBLE1BQUEsSUFBQSxPQUFBOzs7OztJQUtBLFNBQUEsWUFBQSxXQUFBLE9BQUE7TUFDQSxHQUFBLGFBQUEsWUFBQSxVQUFBLFdBQUE7OztJQUdBLFNBQUEsU0FBQTtNQUNBLGVBQUE7Ozs7OztBQy9mQTtHQUNBLE9BQUE7O0dBRUEsV0FBQSw2RUFBQSxVQUFBLFFBQUEsSUFBQSxXQUFBLFVBQUEsUUFBQSxVQUFBO0lB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LEdBQUEsY0FBQSxFQUFBLElBQUEsZ0JBQUEsU0FBQSxNQUFBLEtBQUE7TUFDQSxPQUFBO1FBQ0EsSUFBQTtRQUNBLE1BQUEsY0FBQTtRQUNBLFFBQUE7Ozs7SUFJQSxFQUFBLGdCQUFBLFNBQUEsVUFBQSxRQUFBLFNBQUEsTUFBQTtNQUNBLEdBQUEsV0FBQSxLQUFBLE1BQUE7OztJQUdBLFNBQUEsY0FBQSxTQUFBO01BQ0EsT0FBQSxVQUFBLEtBQUEsU0FBQSxNQUFBO1FBQ0EsT0FBQSxLQUFBLE1BQUE7U0FDQTs7OztJQUlBLEdBQUEsYUFBQTs7OztJQUlBLFNBQUEsV0FBQSxVQUFBLE1BQUEsTUFBQTtNQUNBLFVBQUEsT0FBQSxXQUFBLG9CQUFBLGtCQUFBO1FBQ0EsVUFBQTtRQUNBLGtCQUFBLE9BQUEsZ0JBQUE7UUFDQSxhQUFBLE9BQUEsa0JBQUE7UUFDQSxZQUFBO1FBQ0EsY0FBQSxPQUFBLGFBQUE7OztRQUdBLGtCQUFBOzs7TUFHQSxTQUFBLG1CQUFBLFFBQUE7O1FBRUEsSUFBQSxhQUFBLFFBQUE7VUFDQSxHQUFBLEtBQUEsS0FBQSxJQUFBLFFBQUE7Ozs7VUFJQSxVQUFBLGdCQUFBLEdBQUE7ZUFDQSxJQUFBLGFBQUEsU0FBQTs7VUFFQSxHQUFBLFdBQUEsS0FBQSxJQUFBLFFBQUE7OztVQUdBLElBQUEsY0FBQSxlQUFBLEtBQUEsSUFBQSxLQUFBLFNBQUEsT0FBQTtZQUNBLE9BQUEsTUFBQSxPQUFBLEtBQUE7Ozs7VUFJQSxZQUFBLFFBQUE7VUFDQSxvQkFBQSxJQUFBLGdCQUFBOzs7VUFHQSxVQUFBLEtBQUEsSUFBQSxZQUFBLElBQUEsUUFBQTs7O1FBR0Esb0JBQUEsSUFBQSxZQUFBOztRQUVBLEdBQUE7OztNQUdBLFNBQUEsbUJBQUE7UUFDQSxLQUFBLE1BQUEsZ0JBQUEsS0FBQSxPQUFBLFdBQUEsS0FBQTs7OztJQUlBLEdBQUEsYUFBQTtJQUNBLFNBQUEsV0FBQSxVQUFBLE9BQUE7TUFDQSxnQkFBQSxhQUFBLEdBQUEsYUFBQSxTQUFBLFNBQUEsY0FBQSxNQUFBLElBQUE7Ozs7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V0FBQSxPQUFBO1FBQ0EsZ0JBQUEsYUFBQSxHQUFBLEtBQUEsTUFBQSxJQUFBOzs7TUFHQSxTQUFBLGFBQUE7UUFDQSxVQUFBLE9BQUEsV0FBQSxvQkFBQSxrQkFBQTtVQUNBLFVBQUE7VUFDQSxrQkFBQSxPQUFBLGdCQUFBO1VBQ0EsYUFBQSxPQUFBLGtCQUFBO1VBQ0EsWUFBQTtVQUNBLGNBQUEsT0FBQSxhQUFBOzs7VUFHQSxrQkFBQTs7O1FBR0EsU0FBQSxtQkFBQSxRQUFBO1VBQ0EsR0FBQSxRQUFBO1VBQ0EsR0FBQTs7O1FBR0EsU0FBQSxtQkFBQTtVQUNBLEtBQUEsTUFBQSxnQkFBQSxZQUFBLFlBQUEsV0FBQSxZQUFBOzs7OztHQUtBLFdBQUEsaUZBQUEsU0FBQSxRQUFBLFdBQUEsWUFBQSxhQUFBLFFBQUE7SUFDQSxJQUFBLEtBQUE7SUFDQSxJQUFBLE1BQUEsVUFBQTs7SUFFQSxHQUFBLE9BQUEsU0FBQSxJQUFBLFNBQUE7SUFDQSxHQUFBLE9BQUEsU0FBQSxJQUFBLFNBQUE7SUFDQSxHQUFBLFFBQUEsWUFBQSxLQUFBO0lBQ0EsR0FBQSxZQUFBLFlBQUEsS0FBQSxRQUFBLEdBQUE7O0lBRUEsR0FBQSxjQUFBO0lBQ0EsR0FBQSxjQUFBOztJQUVBOztJQUVBLFNBQUEsUUFBQTtNQUNBLElBQUEsU0FBQTtRQUNBLFlBQUEsR0FBQTtRQUNBLE1BQUEsR0FBQTs7O01BR0EsVUFBQSxPQUFBOztNQUVBO1NBQ0EsTUFBQTtTQUNBO1NBQ0EsS0FBQSxTQUFBLElBQUE7VUFDQSxHQUFBLE1BQUEsUUFBQSxTQUFBLE1BQUE7WUFDQSxLQUFBLGNBQUEsWUFBQSxLQUFBLGdCQUFBLEtBQUE7OztVQUdBLEdBQUEsUUFBQSxHQUFBO1VBQ0EsR0FBQSxjQUFBLEdBQUE7O1VBRUEsSUFBQSxNQUFBLEdBQUEsY0FBQSxHQUFBO1VBQ0EsR0FBQSxhQUFBLEdBQUEsY0FBQSxHQUFBLFNBQUEsSUFBQSxPQUFBLEtBQUEsTUFBQSxPQUFBOztTQUVBLE1BQUEsU0FBQSxLQUFBO1VBQ0EsT0FBQSxNQUFBLElBQUEsT0FBQTs7Ozs7SUFLQSxTQUFBLFlBQUEsTUFBQTtNQUNBLEdBQUEsT0FBQTtNQUNBLEdBQUEsT0FBQTs7TUFFQTs7OztJQUlBLFNBQUEsWUFBQSxNQUFBO01BQ0EsR0FBQSxPQUFBOztNQUVBOzs7Ozs7Ozs7QUNqaUJBO0dBQ0EsT0FBQSxvQkFBQSxDQUFBOztHQUVBLFFBQUEsNEJBQUEsU0FBQSxXQUFBO0lBQ0EsT0FBQSxVQUFBLFlBQUEsU0FBQSxZQUFBLElBQUE7TUFDQSxPQUFBO1FBQ0EsU0FBQTs7Ozs7R0FLQSxRQUFBLDJCQUFBLFNBQUEsV0FBQTtJQUNBLE9BQUEsVUFBQSxZQUFBLFNBQUE7TUFDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyDlupTnlKjlhaXlj6Ncbi8vIE1vZHVsZTogZ3VsdVxuLy8gRGVwZW5kZW5jaWVzOlxuLy8gICAgbmdSb3V0ZSwgaHR0cEludGVyY2VwdG9ycywgZ3VsdS5taXNzaW5nXG5cbi8qIGdsb2JhbCBmYWxsYmFja0hhc2ggKi9cbmFuZ3VsYXJcbiAgLm1vZHVsZSgnZ3VsdScsIFtcbiAgICAndWkucm91dGVyJyxcbiAgICAnbmdMb2NhbGUnLFxuICAgICd0b2FzdHInLFxuICAgICd1aS5ib290c3RyYXAnLFxuICAgICdjdXN0b20uZGlyZWN0aXZlcycsXG4gICAgJ2h0dHBJbnRlcmNlcHRvcnMnLFxuICAgICdMb2NhbFN0b3JhZ2VNb2R1bGUnLFxuICAgICdjaGllZmZhbmN5cGFudHMubG9hZGluZ0JhcicsXG4gICAgJ3V0aWwuZmlsdGVycycsXG4gICAgJ3V0aWwuZGF0ZScsXG4gICAgJ3V0aWwuZmlsZXInLFxuICAgICd1dGlsLnVwbG9hZGVyJyxcbiAgICAndXRpbC5rZXltZ3InLFxuICAgICdndWx1LmluZGVudCcsXG4gICAgJ2d1bHUucmVwb3J0JyxcbiAgICAnZ3VsdS5sb2dpbicsXG4gICAgJ2d1bHUubWlzc2luZydcbiAgXSlcbiAgLmNvbmZpZyhmdW5jdGlvbigkbG9jYXRpb25Qcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyLCAkbG9nUHJvdmlkZXIsIGxvY2FsU3RvcmFnZVNlcnZpY2VQcm92aWRlcikge1xuICAgIC8vIG5vdCB1c2UgaHRtbDUgaGlzdG9yeSBhcGlcbiAgICAvLyBidXQgdXNlIGhhc2hiYW5nXG4gICAgJGxvY2F0aW9uUHJvdmlkZXJcbiAgICAgIC5odG1sNU1vZGUoZmFsc2UpXG4gICAgICAuaGFzaFByZWZpeCgnIScpO1xuXG4gICAgLy8gZGVmaW5lIDQwNFxuICAgICR1cmxSb3V0ZXJQcm92aWRlclxuICAgICAgLm90aGVyd2lzZSgnL2xvZ2luJyk7XG5cbiAgICAvLyBsb2dnZXJcbiAgICAkbG9nUHJvdmlkZXIuZGVidWdFbmFibGVkKHRydWUpO1xuXG4gICAgLy8gbG9jYWxTdG9yYWdlIHByZWZpeFxuICAgIGxvY2FsU3RvcmFnZVNlcnZpY2VQcm92aWRlclxuICAgICAgLnNldFByZWZpeCgnZ3VsdS50ZXN0ZXInKVxuICAgICAgLnNldE5vdGlmeSh0cnVlLCB0cnVlKTtcblxuICAgIC8vIEFQSSBTZXJ2ZXJcbiAgICBBUElfU0VSVkVSUyA9IHtcbiAgICAgIHRlc3RlcjogJ2h0dHA6Ly90LmlmZGl1LmNvbSdcbiAgICAgIC8vIHRlc3RlcjogJ2h0dHA6Ly9vLmRwOjMwMDAnXG4gICAgfVxuXG4gICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50KS5vbignZGV2aWNlcmVhZHknLCBmdW5jdGlvbigpIHtcbiAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudCkub24oJ2JhY2tidXR0b24nLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSlcbiAgLnJ1bihmdW5jdGlvbigkcm9vdFNjb3BlLCAkbG9jYXRpb24sICRzdGF0ZSwgJHN0YXRlUGFyYW1zKSB7XG4gICAgdmFyIHJlZyA9IC9bXFwmXFw/XV89XFxkKy87XG5cbiAgICAkcm9vdFNjb3BlLiRzdGF0ZSA9ICRzdGF0ZTtcbiAgICAkcm9vdFNjb3BlLiRzdGF0ZVBhcmFtcyA9ICRzdGF0ZVBhcmFtcztcbiAgICAkcm9vdFNjb3BlLmlzQ29sbGFwc2VkID0gdHJ1ZTtcblxuICAgIC8vIOeUqOS6jui/lOWbnuS4iuWxgumhtemdolxuICAgICRyb290U2NvcGVcbiAgICAgIC4kd2F0Y2goZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAkbG9jYXRpb24udXJsKCk7XG4gICAgICB9LCBmdW5jdGlvbihjdXJyZW50LCBvbGQpIHtcbiAgICAgICAgaWYgKGN1cnJlbnQucmVwbGFjZShyZWcsICcnKSA9PT0gb2xkLnJlcGxhY2UocmVnLCAnJykpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAkcm9vdFNjb3BlLmJhY2tVcmwgPSBvbGQ7XG4gICAgICB9KTtcblxuICAgICRyb290U2NvcGUuYmFjayA9IGZ1bmN0aW9uKCkge1xuICAgICAgJGxvY2F0aW9uLnVybCgkcm9vdFNjb3BlLmJhY2tVcmwpO1xuICAgIH1cbiAgfSk7XG5cbiIsImFuZ3VsYXJcbiAgLm1vZHVsZSgnZ3VsdS5pbmRlbnQnLCBbXG4gICAgJ3VpLnJvdXRlcicsXG4gICAgJ3V0aWwudXBsb2FkZXInLFxuICAgICd1dGlsLmZpbGVyJyxcbiAgICAndXRpbC5rZXltZ3InLFxuICAgICdndWx1LmluZGVudC5zdmNzJyxcbiAgICAnZ3VsdS5pbmRlbnQuZW51bXMnXG4gIF0pXG4gIC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlclxuICAgICAgLnN0YXRlKCdpbmRlbnRzJywge1xuICAgICAgICBhYnN0cmFjdDogdHJ1ZSxcbiAgICAgICAgdXJsOiAnL2luZGVudHMnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2luZGVudC9kYXNoYm9hcmQuaHRtJyxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgIEluZGVudEVudW1zOiAnSW5kZW50RW51bXMnXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAuc3RhdGUoJ2luZGVudHMubGlzdCcsIHtcbiAgICAgICAgdXJsOiAnJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdpbmRlbnQvc2VhcmNoLmh0bScsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdJbmRlbnRMaXN0Q3RybCdcbiAgICAgIH0pXG4gICAgICAuc3RhdGUoJ2luZGVudHMudW5jb25maXJtZWQnLCB7XG4gICAgICAgIHVybDogJy91bmNvbmZpcm1lZCcsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnaW5kZW50L2xpc3RfdW5jb25maXJtZWQuaHRtJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0luZGVudExpc3RDdHJsJ1xuICAgICAgfSlcbiAgICAgIC5zdGF0ZSgnaW5kZW50cy51bnRlc3RlZCcsIHtcbiAgICAgICAgdXJsOiAnL3VudGVzdGVkJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdpbmRlbnQvbGlzdF91bnRlc3RlZC5odG0nLFxuICAgICAgICBjb250cm9sbGVyOiAnVW50ZXN0ZWRJbmRlbnRMaXN0Q3RybCdcbiAgICAgIH0pO1xuICB9KTtcbiIsImFuZ3VsYXJcbiAgLm1vZHVsZSgnZ3VsdS5sb2dpbicsIFtcbiAgICAndWkucm91dGVyJyxcbiAgICAnZ3VsdS5sb2dpbi5zdmNzJ1xuICBdKVxuXG4gIC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlclxuICAgICAgLnN0YXRlKCdsb2dpbicsIHtcbiAgICAgICAgdXJsOiAnL2xvZ2luJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdsb2dpbi9sb2dpbi5odG0nLFxuICAgICAgICBjb250cm9sbGVyOiAnTG9naW5DdHJsJ1xuICAgICAgfSk7XG4gIH0pO1xuIiwiYW5ndWxhclxuICAubW9kdWxlKCdndWx1LnJlcG9ydCcsIFtcbiAgICAndWkucm91dGVyJyxcbiAgICAndXRpbC52bScsXG4gICAgJ3V0aWwua2V5bWdyJyxcbiAgICAnZ3VsdS5yZXBvcnQuc3ZjcycsXG4gICAgJ2d1bHUuaW5kZW50LmVudW1zJ1xuICBdKVxuICAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXJcbiAgICAgIC5zdGF0ZSgnaW5kZW50cy5pbnB1dF9yZXBvcnQnLCB7XG4gICAgICAgIHVybDogJy97aW5kZW50X2lkOlswLTldK30vY2FyL3tjYXJfaWQ6WzAtOV0rfS9yZXBvcnQnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ3JlcG9ydC9pbnB1dF9kYXNoYm9hcmQuaHRtJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0lucHV0RGFzaGJvYXJkQ3RybCdcbiAgICAgIH0pXG4gICAgICAuc3RhdGUoJ2luZGVudHMuaW5wdXRfcmVwb3J0LnBob3RvJywge1xuICAgICAgICB1cmw6ICcvcGhvdG8nLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ3JlcG9ydC9pbnB1dF9waG90by5odG0nLFxuICAgICAgICBjb250cm9sbGVyOiAnUGhvdG9SZXBvcnRFZGl0Q3RybCdcbiAgICAgIH0pXG4gICAgICAuc3RhdGUoJ2luZGVudHMuaW5wdXRfcmVwb3J0LnBhcnQnLCB7XG4gICAgICAgIHVybDogJy97cGFydF9pZDpbMC05YS16QS1aXSt9JyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdyZXBvcnQvaW5wdXQuaHRtJyxcbiAgICAgICAgY29udHJvbGxlcjogJ1JlcG9ydEVkaXRDdHJsJ1xuICAgICAgfSlcbiAgICAgIC5zdGF0ZSgnaW5kZW50cy5yZXBvcnRzJywge1xuICAgICAgICB1cmw6ICcvcmVwb3J0cycsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAncmVwb3J0L2xpc3QuaHRtJyxcbiAgICAgICAgY29udHJvbGxlcjogJ1JlcG9ydExpc3RDdHJsJ1xuICAgICAgfSk7XG4gIH0pO1xuIiwiLy8gNDA0IOmhtemdolxuLy8gTW9kdWxlOiBndWx1Lm1pc3Npbmdcbi8vIERlcGVuZGVuY2llczogbmdSb3V0ZVxuXG5hbmd1bGFyXG4gIC5tb2R1bGUoJ2d1bHUubWlzc2luZycsIFsndWkucm91dGVyJ10pXG5cbiAgLy8g6YWN572uIHJvdXRlXG4gIC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXJcbiAgICAgIC5zdGF0ZSgnbWlzc2luZycsIHtcbiAgICAgICAgdXJsOiAnL21pc3NpbmcnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJzQwNC80MDQuaHRtJyxcbiAgICAgICAgY29udHJvbGxlcjogJ01pc3NpbmdDdHJsJ1xuICAgICAgfSk7XG4gIH0pXG5cbiAgLy8gNDA0IGNvbnRyb2xsZXJcbiAgLmNvbnRyb2xsZXIoJ01pc3NpbmdDdHJsJywgZnVuY3Rpb24gKCRzY29wZSkge1xuICAgIGNvbnNvbGUubG9nKCdJYG0gaGVyZScpO1xuICAgIC8vIFRPRE86XG4gICAgLy8gMS4gc2hvdyBsYXN0IHBhdGggYW5kIHBhZ2UgbmFtZVxuICB9KTtcbiIsIi8vIOiHquWumuS5iSBkaXJlY3RpdmVzXG5cbmFuZ3VsYXJcbiAgLm1vZHVsZSgnY3VzdG9tLmRpcmVjdGl2ZXMnLCBbXSlcbiAgLmRpcmVjdGl2ZSgnbmdJbmRldGVybWluYXRlJywgZnVuY3Rpb24oJGNvbXBpbGUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRyaWJ1dGVzKSB7XG4gICAgICAgIHNjb3BlLiR3YXRjaChhdHRyaWJ1dGVzWyduZ0luZGV0ZXJtaW5hdGUnXSwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICBlbGVtZW50LnByb3AoJ2luZGV0ZXJtaW5hdGUnLCAhIXZhbHVlKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgfSk7XG4iLCJhbmd1bGFyXG4gIC5tb2R1bGUoJ3V0aWwuZmlsdGVycycsIFtdKVxuXG4gIC5maWx0ZXIoJ21vYmlsZScsIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBmdW5jdGlvbihzKSB7XG4gICAgICBpZiAocyA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICAgIH1cblxuICAgICAgcyA9IHMucmVwbGFjZSgvW1xcc1xcLV0rL2csICcnKTtcblxuICAgICAgaWYgKHMubGVuZ3RoIDwgMykge1xuICAgICAgICByZXR1cm4gcztcbiAgICAgIH1cblxuICAgICAgdmFyIHNhID0gcy5zcGxpdCgnJyk7XG5cbiAgICAgIHNhLnNwbGljZSgzLCAwLCAnLScpO1xuXG4gICAgICBpZiAocy5sZW5ndGggPj0gNykge1xuICAgICAgICBzYS5zcGxpY2UoOCwgMCwgJy0nKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNhLmpvaW4oJycpO1xuICAgIH07XG4gIH0pO1xuIiwiYW5ndWxhclxuICAubW9kdWxlKCd1dGlsLmRhdGUnLCBbXSlcbiAgLmZhY3RvcnkoJ0RhdGVVdGlsJywgZnVuY3Rpb24gKCkge1xuICAgIHZhciB0b1N0cmluZyA9IGZ1bmN0aW9uIChkYXRlLCBzKSB7XG4gICAgICByZXR1cm4gZGF0ZS5nZXRGdWxsWWVhcigpICsgcyArIChkYXRlLmdldE1vbnRoKCkgKyAxKSArIHMgKyBkYXRlLmdldERhdGUoKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgdG9Mb2NhbERhdGVTdHJpbmc6IGZ1bmN0aW9uIChkYXRlKSB7XG4gICAgICAgIHJldHVybiB0b1N0cmluZyhkYXRlLCAnLScpO1xuICAgICAgfSxcblxuICAgICAgdG9Mb2NhbFRpbWVTdHJpbmc6IGZ1bmN0aW9uKGRhdGUpIHtcbiAgICAgICAgdmFyIGggPSBkYXRlLmdldEhvdXJzKCk7XG4gICAgICAgIHZhciBtID0gZGF0ZS5nZXRNaW51dGVzKCk7XG5cbiAgICAgICAgaWYgKGggPCAxMCkge1xuICAgICAgICAgIGggPSAnMCcgKyBoO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG0gPCAxMCkge1xuICAgICAgICAgIG0gPSAnMCcgKyBtO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFt0b1N0cmluZyhkYXRlLCAnLScpLCBoICsgJzonICsgbV0uam9pbignICcpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7IiwiLy8g5p6a5Li+IFNlcnZpY2VcbmFuZ3VsYXJcbiAgLm1vZHVsZSgndXRpbC5lbnVtcycsIFtdKVxuICAuZmFjdG9yeSgnRW51bXMnLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChFTlVNUykge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdmFsOiBmdW5jdGlvbiAobmFtZSwgdGV4dCkge1xuICAgICAgICAgIHJldHVybiBFTlVNU1tuYW1lXS5maW5kKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICByZXR1cm4gaXRlbS50ZXh0ID09PSB0ZXh0O1xuICAgICAgICAgIH0pLnZhbHVlO1xuICAgICAgICB9LFxuICAgICAgICB0ZXh0OiBmdW5jdGlvbiAobmFtZSwgdmFsKSB7XG4gICAgICAgICAgcmV0dXJuIEVOVU1TW25hbWVdLmZpbmQoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtLnZhbHVlID09PSB2YWw7XG4gICAgICAgICAgfSkudGV4dDtcbiAgICAgICAgfSxcbiAgICAgICAgaXRlbTogZnVuY3Rpb24gKG5hbWUsIHZhbCkge1xuICAgICAgICAgIHJldHVybiBFTlVNU1tuYW1lXS5maW5kKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICByZXR1cm4gaXRlbS52YWx1ZSA9PT0gdmFsO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBpdGVtNHRleHQ6IGZ1bmN0aW9uKG5hbWUsIHRleHQpIHtcbiAgICAgICAgICByZXR1cm4gRU5VTVNbbmFtZV0uZmluZChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICByZXR1cm4gaXRlbS50ZXh0ID09PSB0ZXh0O1xuICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBsaXN0OiBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgIHJldHVybiBFTlVNU1tuYW1lXTtcbiAgICAgICAgfSxcbiAgICAgICAgaXRlbXM6IGZ1bmN0aW9uIChuYW1lLCB2YWxzKSB7XG4gICAgICAgICAgcmV0dXJuIEVOVU1TW25hbWVdLmZpbHRlcihmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHMuaW5kZXhPZihpdGVtLnZhbHVlKSAhPT0gLTE7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfTtcbiAgfSk7IiwiLyogZ2xvYmFsIGFuZ3VsYXIqL1xuYW5ndWxhclxuICAubW9kdWxlKCd1dGlsLmZpbGVyJywgW10pXG4gIC5mYWN0b3J5KCdGaWxlcicsIGZ1bmN0aW9uKCR3aW5kb3csICRsb2cpIHtcbiAgICB2YXIgZmlsZXIgPSB7fTtcbiAgICBmaWxlci5yZW1vdmUgPSBmdW5jdGlvbih1cmwpIHtcbiAgICAgICR3aW5kb3cucmVzb2x2ZUxvY2FsRmlsZVN5c3RlbVVSTCh1cmwsIGZpbGVyLmZzU3VjY2VzcywgZmlsZXIuZnNFcnJvcik7XG4gICAgfTtcblxuICAgIGZpbGVyLmZzU3VjY2VzcyA9IGZ1bmN0aW9uKGZpbGVFbnRyeSkge1xuICAgICAgZmlsZUVudHJ5LnJlbW92ZShmdW5jdGlvbigpIHtcbiAgICAgICAgJGxvZy5pbmZvKCfliKDpmaTmnKzlnLDlm77niYfmiJDlip86ICcgKyBmaWxlRW50cnkuZnVsbFBhdGgpO1xuICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICRsb2cuaW5mbygn5Yig6Zmk5pys5Zyw5Zu+54mH5aSx6LSlOiAnICsgZmlsZUVudHJ5LmZ1bGxQYXRoKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBmaWxlci5mc0Vycm9yID0gZnVuY3Rpb24oZXZ0KSB7XG4gICAgICAkbG9nLmluZm8oJ+iOt+WPluacrOWcsOWbvueJh+Wksei0pTogJyArIEpTT04uc3RyaW5naWZ5KGV2dC50YXJnZXQpKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIGZpbGVyO1xuICB9KTsiLCJhbmd1bGFyXG4gIC5tb2R1bGUoJ2h0dHBJbnRlcmNlcHRvcnMnLCBbXSlcblxuICAuY29uZmlnKGZ1bmN0aW9uKCRodHRwUHJvdmlkZXIpIHtcbiAgICAkaHR0cFByb3ZpZGVyLmludGVyY2VwdG9ycy5wdXNoKCdodHRwSW50ZXJjZXB0b3InKTtcbiAgICBcbiAgICAvLyBBbmd1bGFyICRodHRwIGlzbuKAmXQgYXBwZW5kaW5nIHRoZSBoZWFkZXIgWC1SZXF1ZXN0ZWQtV2l0aCA9IFhNTEh0dHBSZXF1ZXN0IHNpbmNlIEFuZ3VsYXIgMS4zLjBcbiAgICAkaHR0cFByb3ZpZGVyLmRlZmF1bHRzLmhlYWRlcnMuY29tbW9uW1wiWC1SZXF1ZXN0ZWQtV2l0aFwiXSA9ICdYTUxIdHRwUmVxdWVzdCc7XG4gICAgJGh0dHBQcm92aWRlci5kZWZhdWx0cy5oZWFkZXJzLnBvc3RbJ0NvbnRlbnQtVHlwZSddID0gJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDtjaGFyc2V0PXV0Zi04JztcbiAgICAkaHR0cFByb3ZpZGVyLmRlZmF1bHRzLnRyYW5zZm9ybVJlcXVlc3QgPSBbZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgc3RyID0gW107XG4gICAgICAgIFxuICAgICAgICBhbmd1bGFyLmZvckVhY2goZGF0YSwgZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgICAgICAgIHRoaXMucHVzaChlbmNvZGVVUklDb21wb25lbnQoa2V5KSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpO1xuICAgICAgICB9LCBzdHIpO1xuXG4gICAgICAgIHJldHVybiBzdHIuam9pbignJicpO1xuICAgIH1dO1xuICB9KVxuXG4gIC5mYWN0b3J5KCdodHRwSW50ZXJjZXB0b3InLCBmdW5jdGlvbigkcSwgJHJvb3RTY29wZSwgJGxvY2F0aW9uKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC8vIOivt+axguWJjeS/ruaUuSByZXF1ZXN0IOmFjee9rlxuICAgICAgJ3JlcXVlc3QnOiBmdW5jdGlvbihjb25maWcpIHtcbiAgICAgICAgY29uZmlnLmhlYWRlcnMuQXV0aG9yaXphdGlvbiA9IHdpbmRvdy5BdXRob3JpemF0aW9uIHx8IG51bGw7XG4gICAgICAgIGNvbmZpZy5oZWFkZXJzLkNTUkZUb2tlbiA9IHdpbmRvdy5DU1JGVG9rZW4gfHwgbnVsbDtcbiAgICAgICAgXG4gICAgICAgIC8vIOiLpeivt+axgueahOaYr+aooeadv++8jOaIluW3suWKoOS4iuaXtumXtOaIs+eahCB1cmwg5Zyw5Z2A77yM5YiZ5LiN6ZyA6KaB5Yqg5pe26Ze05oizXG4gICAgICAgIGlmIChjb25maWcudXJsLmluZGV4T2YoJy5odG0nKSAhPT0gLTEgfHwgY29uZmlnLnVybC5pbmRleE9mKCc/Xz0nKSAhPT0gLTEpIHtcbiAgICAgICAgICByZXR1cm4gY29uZmlnO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uZmlnLnVybCA9IGNvbmZpZy51cmwgKyAnP189JyArIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXG4gICAgICAgIHJldHVybiBjb25maWc7XG4gICAgICB9LFxuXG4gICAgICAvLyDor7fmsYLlh7rplJnvvIzkuqTnu5kgZXJyb3IgY2FsbGJhY2sg5aSE55CGXG4gICAgICAncmVxdWVzdEVycm9yJzogZnVuY3Rpb24ocmVqZWN0aW9uKSB7XG4gICAgICAgIHJldHVybiAkcS5yZWplY3QocmVqZWN0aW9uKTtcbiAgICAgIH0sXG5cbiAgICAgIC8vIOWTjeW6lOaVsOaNruaMiee6puWumuWkhOeQhlxuICAgICAgLy8ge1xuICAgICAgLy8gICBjb2RlOiAyMDAsIC8vIOiHquWumuS5ieeKtuaAgeegge+8jDIwMCDmiJDlip/vvIzpnZ4gMjAwIOWdh+S4jeaIkOWKn1xuICAgICAgLy8gICBtc2c6ICfmk43kvZzmj5DnpLonLCAvLyDkuI3og73lkowgZGF0YSDlhbHlrZhcbiAgICAgIC8vICAgZGF0YToge30gLy8g55So5oi35pWw5o2uXG4gICAgICAvLyB9XG4gICAgICAncmVzcG9uc2UnOiBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAvLyDmnI3liqHnq6/ov5Tlm57nmoTmnInmlYjnlKjmiLfmlbDmja5cbiAgICAgICAgdmFyIGRhdGEsIGNvZGU7XG5cbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNPYmplY3QocmVzcG9uc2UuZGF0YSkpIHtcbiAgICAgICAgICBjb2RlID0gcmVzcG9uc2UuZGF0YS5jb2RlO1xuICAgICAgICAgIGRhdGEgPSByZXNwb25zZS5kYXRhLmRhdGE7XG5cbiAgICAgICAgICAvLyDoi6Ugc3RhdHVzIDIwMCwg5LiUIGNvZGUgITIwMO+8jOWImei/lOWbnueahOaYr+aTjeS9nOmUmeivr+aPkOekuuS/oeaBr1xuICAgICAgICAgIC8vIOmCo+S5iO+8jGNhbGxiYWNrIOS8muaOpeaUtuWIsOS4i+mdouW9ouW8j+eahOWPguaVsO+8mlxuICAgICAgICAgIC8vIHsgY29kZTogMjAwMDEsIG1zZzogJ+aTjeS9nOWksei0pScgfVxuICAgICAgICAgIGlmIChjb2RlICE9PSAyMDApIHtcbiAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3QocmVzcG9uc2UpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOiLpeacjeWKoeerr+i/lOWbnueahCBkYXRhICFudWxs77yM5YiZ6L+U5Zue55qE5piv5pyJ5pWI5Zyw55So5oi35pWw5o2uXG4gICAgICAgICAgLy8g6YKj5LmI77yMY2FsbGJhY2sg5Lya5o6l5pS25Yiw5LiL6Z2i5b2i5byP5Y+C5pWw77yaXG4gICAgICAgICAgLy8geyBpdGVtczogWy4uLl0sIHRvdGFsX2NvdW50OiAxMDAgfVxuICAgICAgICAgIGlmIChkYXRhICE9IG51bGwpIHtcbiAgICAgICAgICAgIHJlc3BvbnNlLmRhdGEgPSBkYXRhO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOiLpeacjeWKoeerr+i/lOWbnueahCBkYXRhIOWAvOS4uiBudWxs77yM5YiZ6L+U5Zue55qE5piv5o+Q56S65L+h5oGvXG4gICAgICAgICAgLy8g6YKj5LmIIGNhbGxiYWNrIOS8muaOpeaUtuWIsOS4i+mdouW9ouW8j+eahOWPguaVsO+8mlxuICAgICAgICAgIC8vIHsgY29kZTogMjAwLCBtc2c6ICfmk43kvZzmiJDlip8nIH1cbiAgICAgICAgICAvLyDpu5jorqTkuLrmraRcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgIH0sXG5cbiAgICAgIC8vIOWTjeW6lOWHuumUme+8jOS6pOe7mSBlcnJvciBjYWxsYmFjayDlpITnkIZcbiAgICAgICdyZXNwb25zZUVycm9yJzogZnVuY3Rpb24ocmVqZWN0aW9uKSB7XG4gICAgICAgIHZhciBjdXJyZW50X3BhdGggPSAkbG9jYXRpb24ucGF0aCgpO1xuXG4gICAgICAgIGlmIChyZWplY3Rpb24uc3RhdHVzID09PSA0MDEpIHtcbiAgICAgICAgICAkbG9jYXRpb24udXJsKCcvbG9naW4nKTtcbiAgICAgICAgICAkbG9jYXRpb24uc2VhcmNoKCdyZWRpcmVjdCcsIGN1cnJlbnRfcGF0aCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gJHEucmVqZWN0KHJlamVjdGlvbik7XG4gICAgICB9XG4gICAgfTtcbiAgfSk7IiwiLyogZ2xvYmFsIGFuZ3VsYXIqL1xuYW5ndWxhclxuICAubW9kdWxlKCd1dGlsLmtleW1ncicsIFtdKVxuICAuZmFjdG9yeSgnS2V5TWdyJywgZnVuY3Rpb24oJGxvZywgbG9jYWxTdG9yYWdlU2VydmljZSkge1xuICAgIHZhciBLZXlNZ3IgPSB7XG4gICAgICBfX2Nvbm5lY3RvcjogJ18nLFxuICAgICAgXG4gICAgICByZXBvcnQ6IGZ1bmN0aW9uKG9yZGVyX2lkLCBjYXJfaWQpIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggIT09IDIpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0tleU1nci5yZXBvcnQoKSDlj4LmlbDpnZ7ms5UnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBbb3JkZXJfaWQsIGNhcl9pZF0uam9pbihLZXlNZ3IuX19jb25uZWN0b3IpO1xuICAgICAgfSxcblxuICAgICAgX190eXBlOiBmdW5jdGlvbihmaXgsIG9yZGVyX2lkLCBjYXJfaWQpIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0tleU1nci4nICsgZml4ICsgJygpIOWPguaVsOmdnuazlScpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g56ys5LiA5Liq5Y+C5pWw5pivIHJlcG9ydCBLZXlNZ3JcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICByZXR1cm4gW29yZGVyX2lkLCBmaXhdLmpvaW4oS2V5TWdyLl9fY29ubmVjdG9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBbb3JkZXJfaWQsIGNhcl9pZCwgZml4XS5qb2luKEtleU1nci5fX2Nvbm5lY3Rvcik7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGFuZ3VsYXIuZXh0ZW5kKEtleU1nciwge1xuICAgICAgZXJyOiBLZXlNZ3IuX190eXBlLmJpbmQoS2V5TWdyLCAnZXJyJyksXG5cbiAgICAgIHN0YXR1czogS2V5TWdyLl9fdHlwZS5iaW5kKEtleU1nciwgJ3N0YXR1cycpLFxuXG4gICAgICBzdWJtaXQ6IEtleU1nci5fX3R5cGUuYmluZChLZXlNZ3IsICdzdWJtaXQnKSxcblxuICAgICAgY2xlYXI6IGZ1bmN0aW9uKG9yZGVyX2lkLCBjYXJfaWQpIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlU2VydmljZS5yZW1vdmUoS2V5TWdyLnJlcG9ydChvcmRlcl9pZCwgY2FyX2lkKSk7XG4gICAgICAgIGxvY2FsU3RvcmFnZVNlcnZpY2UucmVtb3ZlKEtleU1nci5zdGF0dXMob3JkZXJfaWQsIGNhcl9pZCkpO1xuICAgICAgICBsb2NhbFN0b3JhZ2VTZXJ2aWNlLnJlbW92ZShLZXlNZ3Iuc3VibWl0KG9yZGVyX2lkLCBjYXJfaWQpKTtcbiAgICAgICAgbG9jYWxTdG9yYWdlU2VydmljZS5yZW1vdmUoS2V5TWdyLmVycihvcmRlcl9pZCwgY2FyX2lkKSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgICBcbiAgICByZXR1cm4gS2V5TWdyO1xuICB9KTsiLCIvKiBnbG9iYWwgYW5ndWxhciwgRmlsZVVwbG9hZE9wdGlvbnMsIEZpbGVUcmFuc2ZlciovXG4vLyDpmYTku7bkuIrkvKDlmahcbmFuZ3VsYXJcbiAgLm1vZHVsZSgndXRpbC51cGxvYWRlcicsIFtdKVxuICAuZmFjdG9yeSgnVXBsb2FkZXInLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkbG9nKSB7XG4gICAgdmFyIHZtID0gJHJvb3RTY29wZTtcbiAgICB2YXIgbm9vcCA9IGZ1bmN0aW9uKCkge307XG5cbiAgICB2YXIgdXBsb2FkZXIgPSB7XG4gICAgICAvLyDmibnph4/kuIrkvKDpmYTku7ZcbiAgICAgIC8vIOS+nei1liAkc2NvcGUg55qEIG9ic2VydmVyXG4gICAgICAvLyBcbiAgICAgIC8vIGF0dGFjaG1lbnRzOiDpnIDopoHkuIrkvKDnmoTpmYTku7bliJfooahcbiAgICAgIC8vIGJhbmR3aWR0aDog5ZCM5pe25LiK5Lyg55qE5pWw6YePXG4gICAgICAvLyBkb25lOiDmiYDmnInpmYTku7bkuIrkvKDlrozmiJDnmoTlm57osIPlh73mlbBcbiAgICAgIGJhdGNoOiBmdW5jdGlvbihvcHQpIHtcbiAgICAgICAgaWYgKCFvcHQuYXR0YWNobWVudHMgfHwgIW9wdC51cmwpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ+S4iuS8oOmZhOS7tue8uuWwkeWPguaVsCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGNvdW50ID0gb3B0LmF0dGFjaG1lbnRzLmxlbmd0aDtcbiAgICAgICAgdmFyIGluZGV4O1xuICAgICAgICB2YXIgY29tcGxldGVkX2NvdW50ID0gMDtcblxuICAgICAgICAvLyDmsqHmnInpmYTku7ZcbiAgICAgICAgaWYgKGNvdW50ID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGRlZmF1bHRPcHQgPSB7XG4gICAgICAgICAgYmFuZHdpZHRoOiAzLFxuICAgICAgICAgIGRvbmU6IG5vb3AsXG4gICAgICAgICAgb25lOiBub29wLFxuICAgICAgICAgIGVycm9yOiBub29wXG4gICAgICAgIH07XG5cbiAgICAgICAgb3B0ID0gYW5ndWxhci5leHRlbmQoe30sIGRlZmF1bHRPcHQsIG9wdCk7XG5cbiAgICAgICAgdmFyIGNvbXBsZXRlID0gZnVuY3Rpb24oYXR0YWNobWVudCkge1xuICAgICAgICAgIC8vIOabtOaWsCBhdHRhY2htZW50IOinpuWPkeS4i+S4gOS4quS4iuS8oFxuICAgICAgICAgIGF0dGFjaG1lbnQudXBsb2FkZWQgPSB0cnVlO1xuXG4gICAgICAgICAgb3B0Lm9uZS5hcHBseSh1cGxvYWRlciwgYXJndW1lbnRzKTtcblxuICAgICAgICAgIGNvbXBsZXRlZF9jb3VudCsrO1xuXG4gICAgICAgICAgb3B0Lm9ucHJvZ3Jlc3Moe1xuICAgICAgICAgICAgbG9hZGVkOiBjb21wbGV0ZWRfY291bnQsXG4gICAgICAgICAgICB0b3RhbDogY291bnQsXG4gICAgICAgICAgICBwZXJjZW50OiBwYXJzZUludChjb21wbGV0ZWRfY291bnQgLyBjb3VudCAqIDEwMClcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIGlmIChpbmRleCA9PT0gY291bnQgLSAxKSB7XG4gICAgICAgICAgICBpZiAodm0uX19hdHRhY2htZW50c19fKSB7XG4gICAgICAgICAgICAgIHZtLl9fYXR0YWNobWVudHNfXyA9IG51bGw7XG4gICAgICAgICAgICAgIGRlbGV0ZSB2bS5fX2F0dGFjaG1lbnRzX187XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG9wdC5kb25lKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIG9wdC5hdHRhY2htZW50cyA9IGFuZ3VsYXIuY29weShvcHQuYXR0YWNobWVudHMsIFtdKTtcblxuICAgICAgICAvLyDlj6rmnInkuIDkuKrpmYTku7ZcbiAgICAgICAgaWYgKGNvdW50ID09PSAxKSB7XG4gICAgICAgICAgaW5kZXggPSAwO1xuICAgICAgICAgIHVwbG9hZGVyLm9uZSh7XG4gICAgICAgICAgICBhdHRhY2htZW50OiBvcHQuYXR0YWNobWVudHNbMF0sXG4gICAgICAgICAgICBzdWNjZXNzOiBjb21wbGV0ZSxcbiAgICAgICAgICAgIHVybDogb3B0LnVybCxcbiAgICAgICAgICAgIGVycm9yOiBvcHQuZXJyb3JcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g6ZmE5Lu25pWw6YeP5bCR5LqO5ZCM5pe25LiK5Lyg55qE5pWw6YePXG4gICAgICAgIGlmIChjb3VudCA8IG9wdC5iYW5kd2lkdGgpIHtcbiAgICAgICAgICBpbmRleCA9IGNvdW50IC0gMTtcbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcbiAgICAgICAgICAgIHVwbG9hZGVyLm9uZSh7XG4gICAgICAgICAgICAgIGF0dGFjaG1lbnQ6IG9wdC5hdHRhY2htZW50c1tpXSxcbiAgICAgICAgICAgICAgc3VjY2VzczogY29tcGxldGUsXG4gICAgICAgICAgICAgIHVybDogb3B0LnVybCxcbiAgICAgICAgICAgICAgZXJyb3I6IG9wdC5lcnJvclxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgXG4gICAgICAgIGluZGV4ID0gb3B0LmJhbmR3aWR0aCAtIDE7XG4gICAgICAgIHZtLl9fYXR0YWNobWVudHNfXyA9IG9wdC5hdHRhY2htZW50cztcblxuICAgICAgICAvLyDkuIrkvKDlrozkuIDkuKrlkI7vvIzku44gYXR0YWNobWVudHMg5Lit5Y+W5Ye65LiL5LiA5Liq5LiK5LygXG4gICAgICAgIC8vIOWni+e7iOS/neaMgeWQjOaXtuS4iuS8oOeahOaVsOmHj+S4uiBiYW5kd2lkdGhcbiAgICAgICAgdm0uJHdhdGNoQ29sbGVjdGlvbignX19hdHRhY2htZW50c19fJywgZnVuY3Rpb24obmV3QXR0YWNobWVudHMpIHtcbiAgICAgICAgICAvLyDmibnph4/kuIrkvKDlrozmiJDvvIzkvJrliKDpmaQgX19hdHRhY2htZW50c19fXG4gICAgICAgICAgaWYgKCFuZXdBdHRhY2htZW50cykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHVwbG9hZGVyLm9uZSh7XG4gICAgICAgICAgICBhdHRhY2htZW50OiBvcHQuYXR0YWNobWVudHNbKytpbmRleF0sXG4gICAgICAgICAgICBzdWNjZXNzOiBjb21wbGV0ZSxcbiAgICAgICAgICAgIHVybDogb3B0LnVybCxcbiAgICAgICAgICAgIGVycm9yOiBvcHQuZXJyb3JcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCBvcHQuYmFuZHdpZHRoOyBrKyspIHtcbiAgICAgICAgICB1cGxvYWRlci5vbmUoe1xuICAgICAgICAgICAgYXR0YWNobWVudDogb3B0LmF0dGFjaG1lbnRzW2tdLFxuICAgICAgICAgICAgc3VjY2VzczogY29tcGxldGUsXG4gICAgICAgICAgICB1cmw6IG9wdC51cmwsXG4gICAgICAgICAgICBlcnJvcjogb3B0LmVycm9yXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm47XG4gICAgICB9LFxuXG4gICAgICAvLyDljZXkuKrkuIrkvKBcbiAgICAgIG9uZTogZnVuY3Rpb24ob3B0KSB7XG4gICAgICAgIGlmICghb3B0LmF0dGFjaG1lbnQgfHwgIW9wdC51cmwpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ+S4iuS8oOmZhOS7tue8uuWwkeWPguaVsCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgJGxvZy5kZWJ1ZygnYXR0YWNobWVudDogJyArIEpTT04uc3RyaW5naWZ5KG9wdC5hdHRhY2htZW50KSk7XG4gICAgICAgIFxuICAgICAgICB2YXIgZGVmYXVsdE9wdCA9IHtcbiAgICAgICAgICBzdWNjZXNzOiBub29wLFxuICAgICAgICAgIGVycm9yOiBub29wLFxuICAgICAgICAgIGZpbGVLZXk6ICdmaWxlS2V5JyxcbiAgICAgICAgICBmaWxlTmFtZTogb3B0LmF0dGFjaG1lbnQudXJsLnN1YnN0cihvcHQuYXR0YWNobWVudC51cmwubGFzdEluZGV4T2YoJy8nKSArIDEpXG4gICAgICAgIH07XG4gICAgICAgIHZhciBjdXN0b21fb25wcm9ncmVzcyA9IG9wdC5vbnByb2dyZXNzO1xuICAgICAgICBvcHQgPSBhbmd1bGFyLmV4dGVuZCh7fSwgZGVmYXVsdE9wdCwgb3B0KTtcbiAgICAgICAgb3B0Lm9ucHJvZ2Vyc3MgPSBmdW5jdGlvbihwcm9ncmVzc0V2ZW50KSB7XG4gICAgICAgICAgaWYgKHByb2dyZXNzRXZlbnQubGVuZ3RoQ29tcHV0YWJsZSkgeyAgXG4gICAgICAgICAgICAvL+W3sue7j+S4iuS8oCAgXG4gICAgICAgICAgICB2YXIgbG9hZGVkID0gcHJvZ3Jlc3NFdmVudC5sb2FkZWQ7ICBcbiAgICAgICAgICAgIC8v5paH5Lu25oC76ZW/5bqmICBcbiAgICAgICAgICAgIHZhciB0b3RhbCA9IHByb2dyZXNzRXZlbnQudG90YWw7ICBcbiAgICAgICAgICAgIC8v6K6h566X55m+5YiG5q+U77yM55So5LqO5pi+56S66L+b5bqm5p2hICBcbiAgICAgICAgICAgIHZhciBwZXJjZW50ID0gcGFyc2VJbnQoKGxvYWRlZCAvIHRvdGFsKSAqIDEwMCk7XG5cbiAgICAgICAgICAgIGN1c3RvbV9vbnByb2dyZXNzKHtcbiAgICAgICAgICAgICAgbG9hZGVkOiBsb2FkZWQsXG4gICAgICAgICAgICAgIHRvdGFsOiB0b3RhbCxcbiAgICAgICAgICAgICAgcGVyY2VudDogcGVyY2VudFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgdmFyIGZVT3B0cyA9IG5ldyBGaWxlVXBsb2FkT3B0aW9ucygpO1xuICAgICAgICBmVU9wdHMuZmlsZUtleSA9IG9wdC5maWxlS2V5O1xuICAgICAgICBmVU9wdHMuZmlsZU5hbWUgPSBvcHQuZmlsZU5hbWU7XG5cbiAgICAgICAgdmFyIGZ0ID0gbmV3IEZpbGVUcmFuc2ZlcigpO1xuICAgICAgICBmdC5vbnByb2dyZXNzID0gb3B0Lm9ucHJvZ3Jlc3M7XG4gICAgICAgIGZ0LnVwbG9hZChcbiAgICAgICAgICBvcHQuYXR0YWNobWVudC51cmwsXG4gICAgICAgICAgZW5jb2RlVVJJKG9wdC51cmwpLFxuICAgICAgICAgIG9wdC5zdWNjZXNzLmJpbmQodXBsb2FkZXIsIG9wdC5hdHRhY2htZW50KSxcbiAgICAgICAgICBvcHQuZXJyb3IuYmluZCh1cGxvYWRlciwgb3B0LmF0dGFjaG1lbnQpLFxuICAgICAgICAgIGZVT3B0c1xuICAgICAgICApO1xuICAgICAgfVxuICAgIH07XG4gICAgXG4gICAgcmV0dXJuIHVwbG9hZGVyOyBcbiAgfSk7XG4iLCIvLyAkc2NvcGUg5aKe5by6XG5hbmd1bGFyXG4gIC5tb2R1bGUoJ3V0aWwudm0nLCBbXSlcbiAgLmZhY3RvcnkoJ1ZNJywgZnVuY3Rpb24gKCRsb2cpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdG9fanNvbjogZnVuY3Rpb24odm0sIGZpZWxkcykge1xuICAgICAgICB2YXIgcmV0ID0ge307XG5cbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNTdHJpbmcoZmllbGRzKSkge1xuICAgICAgICAgIGZpZWxkcyA9IGZpZWxkcy5zcGxpdCgnLCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZpZWxkcy5sZW5ndGggPT09IDEgJiYgZmllbGRzWzBdID09PSAnJykge1xuICAgICAgICAgICRsb2cud2Fybign5oKo6LCD55So5pa55rOVIFZNLnRvX2pzb24g5pe277yM5rKh5pyJ5Lyg5YWlIGZpZWxkcyDlj4LmlbAnKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWFuZ3VsYXIuaXNBcnJheShmaWVsZHMpKSB7XG4gICAgICAgICAgJGxvZy5lcnJvcign5pa55rOVIFZNLnRvX2pzb24g5Y+q5o6l5Y+X5a2X56ym5Liy5pWw57uE5oiW6YCX5Y+35YiG6ZqU55qE5a2X56ym5Liy5oiW5LiA5Liq5LiN5ZCr6YCX5Y+355qE5a2X56ym5LiyJyk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZmllbGRzLm1hcChmdW5jdGlvbihmaWVsZCkge1xuICAgICAgICAgIHJldHVybiByZXRbZmllbGRdID0gdm1bZmllbGRdO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgfVxuICAgIH07XG4gIH0pOyIsIid1c2Ugc3RyaWN0JztcbmFuZ3VsYXIubW9kdWxlKFwibmdMb2NhbGVcIiwgW10sIFtcIiRwcm92aWRlXCIsIGZ1bmN0aW9uKCRwcm92aWRlKSB7XG4gIHZhciBQTFVSQUxfQ0FURUdPUlkgPSB7XG4gICAgWkVSTzogXCJ6ZXJvXCIsXG4gICAgT05FOiBcIm9uZVwiLFxuICAgIFRXTzogXCJ0d29cIixcbiAgICBGRVc6IFwiZmV3XCIsXG4gICAgTUFOWTogXCJtYW55XCIsXG4gICAgT1RIRVI6IFwib3RoZXJcIlxuICB9O1xuICAkcHJvdmlkZS52YWx1ZShcIiRsb2NhbGVcIiwge1xuICAgIFwiREFURVRJTUVfRk9STUFUU1wiOiB7XG4gICAgICBcIkFNUE1TXCI6IFtcbiAgICAgICAgXCJcXHU0ZTBhXFx1NTM0OFwiLFxuICAgICAgICBcIlxcdTRlMGJcXHU1MzQ4XCJcbiAgICAgIF0sXG4gICAgICBcIkRBWVwiOiBbXG4gICAgICAgIFwiXFx1NjYxZlxcdTY3MWZcXHU2NWU1XCIsXG4gICAgICAgIFwiXFx1NjYxZlxcdTY3MWZcXHU0ZTAwXCIsXG4gICAgICAgIFwiXFx1NjYxZlxcdTY3MWZcXHU0ZThjXCIsXG4gICAgICAgIFwiXFx1NjYxZlxcdTY3MWZcXHU0ZTA5XCIsXG4gICAgICAgIFwiXFx1NjYxZlxcdTY3MWZcXHU1NmRiXCIsXG4gICAgICAgIFwiXFx1NjYxZlxcdTY3MWZcXHU0ZTk0XCIsXG4gICAgICAgIFwiXFx1NjYxZlxcdTY3MWZcXHU1MTZkXCJcbiAgICAgIF0sXG4gICAgICBcIk1PTlRIXCI6IFtcbiAgICAgICAgXCIxXFx1NjcwOFwiLFxuICAgICAgICBcIjJcXHU2NzA4XCIsXG4gICAgICAgIFwiM1xcdTY3MDhcIixcbiAgICAgICAgXCI0XFx1NjcwOFwiLFxuICAgICAgICBcIjVcXHU2NzA4XCIsXG4gICAgICAgIFwiNlxcdTY3MDhcIixcbiAgICAgICAgXCI3XFx1NjcwOFwiLFxuICAgICAgICBcIjhcXHU2NzA4XCIsXG4gICAgICAgIFwiOVxcdTY3MDhcIixcbiAgICAgICAgXCIxMFxcdTY3MDhcIixcbiAgICAgICAgXCIxMVxcdTY3MDhcIixcbiAgICAgICAgXCIxMlxcdTY3MDhcIlxuICAgICAgXSxcbiAgICAgIFwiU0hPUlREQVlcIjogW1xuICAgICAgICBcIlxcdTU0NjhcXHU2NWU1XCIsXG4gICAgICAgIFwiXFx1NTQ2OFxcdTRlMDBcIixcbiAgICAgICAgXCJcXHU1NDY4XFx1NGU4Y1wiLFxuICAgICAgICBcIlxcdTU0NjhcXHU0ZTA5XCIsXG4gICAgICAgIFwiXFx1NTQ2OFxcdTU2ZGJcIixcbiAgICAgICAgXCJcXHU1NDY4XFx1NGU5NFwiLFxuICAgICAgICBcIlxcdTU0NjhcXHU1MTZkXCJcbiAgICAgIF0sXG4gICAgICBcIlNIT1JUTU9OVEhcIjogW1xuICAgICAgICBcIjFcXHU2NzA4XCIsXG4gICAgICAgIFwiMlxcdTY3MDhcIixcbiAgICAgICAgXCIzXFx1NjcwOFwiLFxuICAgICAgICBcIjRcXHU2NzA4XCIsXG4gICAgICAgIFwiNVxcdTY3MDhcIixcbiAgICAgICAgXCI2XFx1NjcwOFwiLFxuICAgICAgICBcIjdcXHU2NzA4XCIsXG4gICAgICAgIFwiOFxcdTY3MDhcIixcbiAgICAgICAgXCI5XFx1NjcwOFwiLFxuICAgICAgICBcIjEwXFx1NjcwOFwiLFxuICAgICAgICBcIjExXFx1NjcwOFwiLFxuICAgICAgICBcIjEyXFx1NjcwOFwiXG4gICAgICBdLFxuICAgICAgXCJmdWxsRGF0ZVwiOiBcInlcXHU1ZTc0TVxcdTY3MDhkXFx1NjVlNUVFRUVcIixcbiAgICAgIFwibG9uZ0RhdGVcIjogXCJ5XFx1NWU3NE1cXHU2NzA4ZFxcdTY1ZTVcIixcbiAgICAgIFwibWVkaXVtXCI6IFwieXl5eS1NLWQgYWg6bW06c3NcIixcbiAgICAgIFwibWVkaXVtRGF0ZVwiOiBcInl5eXktTS1kXCIsXG4gICAgICBcIm1lZGl1bVRpbWVcIjogXCJhaDptbTpzc1wiLFxuICAgICAgXCJzaG9ydFwiOiBcInl5LU0tZCBhaDptbVwiLFxuICAgICAgXCJzaG9ydERhdGVcIjogXCJ5eS1NLWRcIixcbiAgICAgIFwic2hvcnRUaW1lXCI6IFwiYWg6bW1cIlxuICAgIH0sXG4gICAgXCJOVU1CRVJfRk9STUFUU1wiOiB7XG4gICAgICBcIkNVUlJFTkNZX1NZTVwiOiBcIlxcdTAwYTVcIixcbiAgICAgIFwiREVDSU1BTF9TRVBcIjogXCIuXCIsXG4gICAgICBcIkdST1VQX1NFUFwiOiBcIixcIixcbiAgICAgIFwiUEFUVEVSTlNcIjogW3tcbiAgICAgICAgXCJnU2l6ZVwiOiAzLFxuICAgICAgICBcImxnU2l6ZVwiOiAzLFxuICAgICAgICBcIm1hY0ZyYWNcIjogMCxcbiAgICAgICAgXCJtYXhGcmFjXCI6IDMsXG4gICAgICAgIFwibWluRnJhY1wiOiAwLFxuICAgICAgICBcIm1pbkludFwiOiAxLFxuICAgICAgICBcIm5lZ1ByZVwiOiBcIi1cIixcbiAgICAgICAgXCJuZWdTdWZcIjogXCJcIixcbiAgICAgICAgXCJwb3NQcmVcIjogXCJcIixcbiAgICAgICAgXCJwb3NTdWZcIjogXCJcIlxuICAgICAgfSwge1xuICAgICAgICBcImdTaXplXCI6IDMsXG4gICAgICAgIFwibGdTaXplXCI6IDMsXG4gICAgICAgIFwibWFjRnJhY1wiOiAwLFxuICAgICAgICBcIm1heEZyYWNcIjogMixcbiAgICAgICAgXCJtaW5GcmFjXCI6IDIsXG4gICAgICAgIFwibWluSW50XCI6IDEsXG4gICAgICAgIFwibmVnUHJlXCI6IFwiKFxcdTAwYTRcIixcbiAgICAgICAgXCJuZWdTdWZcIjogXCIpXCIsXG4gICAgICAgIFwicG9zUHJlXCI6IFwiXFx1MDBhNFwiLFxuICAgICAgICBcInBvc1N1ZlwiOiBcIlwiXG4gICAgICB9XVxuICAgIH0sXG4gICAgXCJpZFwiOiBcInpoLWNuXCIsXG4gICAgXCJwbHVyYWxDYXRcIjogZnVuY3Rpb24obikge1xuICAgICAgcmV0dXJuIFBMVVJBTF9DQVRFR09SWS5PVEhFUjtcbiAgICB9XG4gIH0pO1xufV0pO1xuIiwiYW5ndWxhclxuICAubW9kdWxlKCdndWx1LmluZGVudC5lbnVtcycsIFsndXRpbC5lbnVtcycsIF0pXG5cbi5mYWN0b3J5KCdJbmRlbnRFbnVtcycsIGZ1bmN0aW9uKEVudW1zLCBJbmRlbnRFbnVtc1N2YywgdG9hc3RyKSB7XG4gIHJldHVybiBJbmRlbnRFbnVtc1N2Y1xuICAgICAgLmdldCgpXG4gICAgICAuJHByb21pc2VcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICB2YXIgYWxsX3ByZWlucyA9ICdvcmRlcl90eXBlIG9yZGVyX3N0YXR1cyBjaXR5IGluc3BlY3RvciB1c2VyX3R5cGUgb3JkZXJfdGhyb3VnaCcuc3BsaXQoJyAnKTtcblxuICAgICAgICBhbGxfcHJlaW5zLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgcmVzW2tleV0udW5zaGlmdCh7XG4gICAgICAgICAgICB0ZXh0OiAn5YWo6YOoJyxcbiAgICAgICAgICAgIHZhbHVlOiBudWxsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJlc1snc2l6ZSddID0gW3tcbiAgICAgICAgICB0ZXh0OiAxMCxcbiAgICAgICAgICB2YWx1ZTogMTBcbiAgICAgICAgfSwge1xuICAgICAgICAgIHRleHQ6IDE1LFxuICAgICAgICAgIHZhbHVlOiAxNVxuICAgICAgICB9LCB7XG4gICAgICAgICAgdGV4dDogMjAsXG4gICAgICAgICAgdmFsdWU6IDIwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICB0ZXh0OiA1MCxcbiAgICAgICAgICB2YWx1ZTogNTBcbiAgICAgICAgfSwge1xuICAgICAgICAgIHRleHQ6IDEwMCxcbiAgICAgICAgICB2YWx1ZTogMTAwXG4gICAgICAgIH1dO1xuXG4gICAgICAgIHJldHVybiBFbnVtcyhyZXMudG9KU09OKCkpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgdG9hc3RyLmVycm9yKHJlcy5tc2cgfHwgJ+iOt+WPluaemuS4vuWksei0pScpO1xuICAgICAgfSk7XG59KTtcbiIsImFuZ3VsYXJcbiAgLm1vZHVsZSgnZ3VsdS5pbmRlbnQuc3ZjcycsIFsnbmdSZXNvdXJjZSddKVxuXG4gIC5zZXJ2aWNlKCdJbmRlbnRFbnVtc1N2YycsIGZ1bmN0aW9uKCRyZXNvdXJjZSkge1xuICAgIHJldHVybiAkcmVzb3VyY2UoQVBJX1NFUlZFUlMudGVzdGVyICsgJy9wYXJhbWV0ZXJzJyk7XG4gIH0pXG4gIFxuICAuc2VydmljZSgnSW5kZW50c1N2YycsIGZ1bmN0aW9uKCRyZXNvdXJjZSkge1xuICAgIHJldHVybiAkcmVzb3VyY2UoQVBJX1NFUlZFUlMudGVzdGVyICsgJy9vcmRlcnMnLCB7fSwge1xuICAgICAgcXVlcnk6IHtcbiAgICAgICAgaXNBcnJheTogZmFsc2VcbiAgICAgIH1cbiAgICB9KTtcbiAgfSlcblxuICAuc2VydmljZSgnSW5kZW50U3ZjJywgZnVuY3Rpb24oJHJlc291cmNlKSB7XG4gICAgcmV0dXJuICRyZXNvdXJjZShBUElfU0VSVkVSUy50ZXN0ZXIgKyAnL29yZGVyLzppZCcsIHtcbiAgICAgIGlkOiAnQGlkJ1xuICAgIH0sIHtcbiAgICAgIHVwZGF0ZToge1xuICAgICAgICBtZXRob2Q6ICdQVVQnXG4gICAgICB9XG4gICAgfSk7XG4gIH0pXG5cbiAgLnNlcnZpY2UoJ0luZGVudEFjY2VwdFN2YycsIGZ1bmN0aW9uKCRyZXNvdXJjZSkge1xuICAgIHJldHVybiAkcmVzb3VyY2UoQVBJX1NFUlZFUlMudGVzdGVyICsgJy9vcmRlci86aWQvaW5zcGVjdG9yX2FjY2VwdGVkJywge1xuICAgICAgaWQ6ICdAaWQnXG4gICAgfSwge1xuICAgICAgdXBkYXRlOiB7XG4gICAgICAgIG1ldGhvZDogJ1BVVCdcbiAgICAgIH1cbiAgICB9KTtcbiAgfSlcblxuICAuc2VydmljZSgnSW5kZW50UmV2b2tlUmVxdWVzdFN2YycsIGZ1bmN0aW9uKCRyZXNvdXJjZSkge1xuICAgIHJldHVybiAkcmVzb3VyY2UoQVBJX1NFUlZFUlMudGVzdGVyICsgJy9vcmRlci86aWQvcmV2b2tlX3JlcXVlc3RlZCcsIHtcbiAgICAgIGlkOiAnQGlkJ1xuICAgIH0sIHtcbiAgICAgIHVwZGF0ZToge1xuICAgICAgICBtZXRob2Q6ICdQVVQnXG4gICAgICB9XG4gICAgfSk7XG4gIH0pXG5cbiAgLnNlcnZpY2UoJ1Rlc3RlcnNTdmMnLCBmdW5jdGlvbigkcmVzb3VyY2UpIHtcbiAgICByZXR1cm4gJHJlc291cmNlKEFQSV9TRVJWRVJTLnRlc3RlciArICcvdGVzdGVycycsIHt9LCB7XG4gICAgICBxdWVyeToge1xuICAgICAgICBpc0FycmF5OiBmYWxzZVxuICAgICAgfVxuICAgIH0pO1xuICB9KVxuXG4gIC5zZXJ2aWNlKCdVbnRlc3RlZEluZGVudHNTdmMnLCBmdW5jdGlvbigkcmVzb3VyY2UpIHtcbiAgICByZXR1cm4gJHJlc291cmNlKEFQSV9TRVJWRVJTLnRlc3RlciArICcvb3JkZXJzL2luc3BlY3Rvcl90YXNrX3RvZGF5Jyk7XG4gIH0pXG5cbiAgLnNlcnZpY2UoJ0luZGVudENhcnNTdmMnLCBmdW5jdGlvbigkcmVzb3VyY2UpIHtcbiAgICByZXR1cm4gJHJlc291cmNlKEFQSV9TRVJWRVJTLnRlc3RlciArICcvb3JkZXIvOm9yZGVyX2lkL2NhcicsIHtcbiAgICAgIG9yZGVyX2lkOiAnQG9yZGVyX2lkJ1xuICAgIH0pXG4gIH0pXG5cbiAgLnNlcnZpY2UoJ0luZGVudENhclN2YycsIGZ1bmN0aW9uKCRyZXNvdXJjZSkge1xuICAgIHJldHVybiAkcmVzb3VyY2UoQVBJX1NFUlZFUlMudGVzdGVyICsgJy9vcmRlci86b3JkZXJfaWQvY2FyLzpjYXJfaWQnLCB7XG4gICAgICBvcmRlcl9pZDogJ0BvcmRlcl9pZCcsXG4gICAgICBjYXJfaWQ6ICdAY2FyX2lkJ1xuICAgIH0sIHtcbiAgICAgIHVwZGF0ZToge1xuICAgICAgICBtZXRob2Q6ICdQVVQnXG4gICAgICB9XG4gICAgfSk7XG4gIH0pOyIsIi8qIGdsb2JhbCBhbmd1bGFyLCBjb25maXJtLCBfICovXG5hbmd1bGFyXG4gIC5tb2R1bGUoJ2d1bHUuaW5kZW50JylcbiAgXG4gIC5jb250cm9sbGVyKCdJbmRlbnRMaXN0Q3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJGxvY2F0aW9uLCB0b2FzdHIsICRtb2RhbCxcbiAgICBJbmRlbnRzU3ZjLCBJbmRlbnRTdmMsIEluZGVudEFjY2VwdFN2YywgSW5kZW50RW51bXMpIHtcbiAgICB2YXIgdm0gPSAkc2NvcGU7XG4gICAgdmFyIHFzbyA9ICRsb2NhdGlvbi5zZWFyY2goKTtcblxuICAgIHZtLnN0YXR1c19pZCA9IHBhcnNlSW50KHFzby5zdGF0dXNfaWQpIHx8IG51bGw7XG4gICAgXG4gICAgaWYgKHZtLiRzdGF0ZS5pbmNsdWRlcygnaW5kZW50cy51bmNvbmZpcm1lZCcpKSB7XG4gICAgICB2bS5zdGF0dXNfaWQgPSA0O1xuICAgIH0gZWxzZSB7XG4gICAgICB2bS5jaXR5X2lkID0gcGFyc2VJbnQocXNvLmNpdHlfaWQpIHx8IG51bGw7XG4gICAgICB2bS5pbnNwZWN0b3JfaWQgPSBwYXJzZUludChxc28uaW5zcGVjdG9yX2lkKSB8fCBudWxsO1xuICAgICAgLy8gdm0ucm9sZV9pZCA9IHBhcnNlSW50KHFzby5yb2xlX2lkKSB8fCBudWxsO1xuICAgICAgdm0ucmVxdWVzdGVyX21vYmlsZSA9IHFzby5yZXF1ZXN0ZXJfbW9iaWxlIHx8IG51bGw7XG5cbiAgICAgIHZtLnN0YXR1cyA9IEluZGVudEVudW1zLml0ZW0oJ29yZGVyX3N0YXR1cycsIHZtLnN0YXR1c19pZCk7XG4gICAgICB2bS5zdGF0dXNfbGlzdCA9IEluZGVudEVudW1zLmxpc3QoJ29yZGVyX3N0YXR1cycpO1xuICAgICAgdm0uY2l0eSA9IEluZGVudEVudW1zLml0ZW0oJ2NpdHknLCB2bS5jaXR5X2lkKTtcbiAgICAgIHZtLmNpdHlfbGlzdCA9IEluZGVudEVudW1zLmxpc3QoJ2NpdHknKTtcbiAgICAgIC8vIHZtLnJvbGUgPSBJbmRlbnRFbnVtcy5pdGVtKCdyb2xlJywgdm0ucm9sZV9pZCk7XG4gICAgICAvLyB2bS5yb2xlX2xpc3QgPSBJbmRlbnRFbnVtcy5saXN0KCdyb2xlJyk7XG4gICAgICB2bS5pbnNwZWN0b3IgPSBJbmRlbnRFbnVtcy5pdGVtKCdpbnNwZWN0b3InLCB2bS5pbnNwZWN0b3JfaWQpO1xuICAgICAgdm0uaW5zcGVjdG9yX2xpc3QgPSBJbmRlbnRFbnVtcy5saXN0KCdpbnNwZWN0b3InKTtcblxuICAgICAgd2F0Y2hfbGlzdCgnc3RhdHVzJywgJ3N0YXR1c19pZCcpO1xuICAgICAgd2F0Y2hfbGlzdCgnY2l0eScsICdjaXR5X2lkJyk7XG4gICAgICAvLyB3YXRjaF9saXN0KCdyb2xlJywgJ3JvbGVfaWQnKTtcbiAgICAgIHdhdGNoX2xpc3QoJ2luc3BlY3RvcicsICdpbnNwZWN0b3JfaWQnKTtcblxuICAgICAgdm0uc2VhcmNoID0gc2VhcmNoO1xuICAgIH1cblxuICAgIHZtLnBhZ2UgPSBwYXJzZUludChxc28ucGFnZSkgfHwgMTtcbiAgICB2bS5zaXplID0gcGFyc2VJbnQocXNvLnNpemUpIHx8IDIwO1xuICAgIHZtLnNpemVzID0gSW5kZW50RW51bXMubGlzdCgnc2l6ZScpO1xuICAgIHZtLnNpemVfaXRlbSA9IEluZGVudEVudW1zLml0ZW0oJ3NpemUnLCB2bS5zaXplKTtcblxuICAgIHZtLnNpemVfY2hhbmdlID0gc2l6ZV9jaGFuZ2U7XG4gICAgdm0ucGFnZV9jaGFuZ2UgPSBwYWdlX2NoYW5nZTtcbiAgICB2bS5jYW5jZWxfb3JkZXIgPSBjYW5jZWxfb3JkZXI7XG4gICAgdm0uY29uZmlybV9vcmRlciA9IGNvbmZpcm1fb3JkZXI7XG5cbiAgICBxdWVyeSgpO1xuXG4gICAgZnVuY3Rpb24gcXVlcnkoKSB7XG4gICAgICB2YXIgcGFyYW1zID0ge1xuICAgICAgICBjaXR5X2lkOiB2bS5jaXR5X2lkLFxuICAgICAgICBpdGVtc19wYWdlOiB2bS5zaXplLFxuICAgICAgICBwYWdlOiB2bS5wYWdlLFxuXG4gICAgICAgIHN0YXR1c19pZDogdm0uc3RhdHVzX2lkXG4gICAgICB9O1xuXG4gICAgICBpZiAodm0uJHN0YXRlLmluY2x1ZGVzKCdpbmRlbnRzLmxpc3QnKSkge1xuICAgICAgICBhbmd1bGFyLmV4dGVuZChwYXJhbXMsIHtcbiAgICAgICAgICBjaXR5X2lkOiB2bS5jaXR5X2lkLFxuICAgICAgICAgIGluc3BlY3Rvcl9pZDogdm0uaW5zcGVjdG9yX2lkLFxuICAgICAgICAgIC8vIHJvbGVfaWQ6IHZtLnJvbGVfaWQsXG4gICAgICAgICAgcmVxdWVzdGVyX21vYmlsZTogdm0ucmVxdWVzdGVyX21vYmlsZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgJGxvY2F0aW9uLnNlYXJjaChwYXJhbXMpO1xuXG4gICAgICBJbmRlbnRzU3ZjXG4gICAgICAgIC5xdWVyeShwYXJhbXMpXG4gICAgICAgIC4kcHJvbWlzZVxuICAgICAgICAudGhlbihmdW5jdGlvbihycykge1xuICAgICAgICAgIHJzLml0ZW1zLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgaXRlbS5zdGF0dXNfdGV4dCA9IEluZGVudEVudW1zLnRleHQoJ29yZGVyX3N0YXR1cycsIGl0ZW0uc3RhdHVzX2lkKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHZtLml0ZW1zID0gcnMuaXRlbXM7XG4gICAgICAgICAgdm0udG90YWxfY291bnQgPSBycy50b3RhbF9jb3VudDtcblxuICAgICAgICAgIHZhciB0bXAgPSBycy50b3RhbF9jb3VudCAvIHZtLnNpemU7XG4gICAgICAgICAgdm0ucGFnZV9jb3VudCA9IHJzLnRvdGFsX2NvdW50ICUgdm0uc2l6ZSA9PT0gMCA/IHRtcCA6IChNYXRoLmZsb29yKHRtcCkgKyAxKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIHRvYXN0ci5lcnJvcihyZXMuZGF0YS5tc2cgfHwgJ+afpeivouWksei0pe+8jOacjeWKoeWZqOWPkeeUn+acquefpemUmeivr++8jOivt+mHjeivlScpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB3YXRjaF9saXN0KG5hbWUsIGZpZWxkKSB7XG4gICAgICB2bS4kd2F0Y2gobmFtZSwgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICBpZiAoIWl0ZW0pIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2bVtmaWVsZF0gPSBpdGVtLnZhbHVlO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8g56Gu6K6k6K6i5Y2VXG4gICAgZnVuY3Rpb24gY29uZmlybV9vcmRlcihpdGVtKSB7XG4gICAgICBpZiAoY29uZmlybSgn56Gu6K6k5o6l5Y+X6K+l6K6i5Y2VPycpKSB7XG4gICAgICAgIEluZGVudEFjY2VwdFN2Y1xuICAgICAgICAgIC51cGRhdGUoe1xuICAgICAgICAgICAgaWQ6IGl0ZW0uaWRcbiAgICAgICAgICB9KVxuICAgICAgICAgIC4kcHJvbWlzZVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgdG9hc3RyLnN1Y2Nlc3MocmVzLm1zZyB8fCAn56Gu6K6k6K6i5Y2V5oiQ5YqfJyk7XG5cbiAgICAgICAgICAgIHF1ZXJ5KCk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICB0b2FzdHIuZXJyb3IocmVzLm1zZyB8fCAn56Gu6K6k6K6i5Y2V5aSx6LSl77yM6K+36YeN6K+VJyk7XG4gICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8g5Y+W5raI6K6i5Y2VXG4gICAgZnVuY3Rpb24gY2FuY2VsX29yZGVyKGl0ZW0pIHtcbiAgICAgIHZhciBjYW5jZWxfb3JkZXJfaW5zID0gJG1vZGFsLm9wZW4oe1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2luZGVudC9jYW5jZWxfb3JkZXIuaHRtJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0NhbmNlbE9yZGVyQ3RybCcsXG4gICAgICAgIGJhY2tkcm9wOiAnc3RhdGljJyxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgIGluZGVudF9pbmZvOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGNhbmNlbF9vcmRlcl9pbnMucmVzdWx0LnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIFRPRE86XG4gICAgICAgIC8vIOabtOaWsOmihOe6puWNleeKtuaAgVxuICAgICAgICBxdWVyeSgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8g5q+P6aG15p2h5pWw5pS55Y+YXG4gICAgZnVuY3Rpb24gc2l6ZV9jaGFuZ2Uoc2l6ZSkge1xuICAgICAgdm0uc2l6ZSA9IHNpemU7XG4gICAgICB2bS5wYWdlID0gMTtcblxuICAgICAgcXVlcnkoKTtcbiAgICB9XG5cbiAgICAvLyDnv7vpobVcbiAgICBmdW5jdGlvbiBwYWdlX2NoYW5nZShwYWdlKSB7XG4gICAgICB2bS5wYWdlID0gcGFnZTtcblxuICAgICAgcXVlcnkoKTtcbiAgICB9XG5cbiAgICAvLyDmn6Xor6Lmj5DkuqRcbiAgICBmdW5jdGlvbiBzZWFyY2goKSB7XG4gICAgICB2bS5wYWdlID0gMTtcblxuICAgICAgcXVlcnkoKTtcbiAgICB9XG4gIH0pXG5cbiAgLmNvbnRyb2xsZXIoJ1VudGVzdGVkSW5kZW50TGlzdEN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRsb2csICRsb2NhdGlvbiwgJG1vZGFsLCAkdGVtcGxhdGVDYWNoZSwgdG9hc3RyLFxuICAgIEZpbGVyLCBVcGxvYWRlciwgS2V5TWdyLCBsb2NhbFN0b3JhZ2VTZXJ2aWNlLCBVbnRlc3RlZEluZGVudHNTdmMsIEluZGVudEVudW1zLFxuICAgIEluZGVudENhclN2YywgUmVwb3J0U3ZjKSB7XG4gICAgdmFyIHZtID0gJHNjb3BlO1xuICAgIHZhciBwYXJ0cyA9IEpTT04ucGFyc2UoJHRlbXBsYXRlQ2FjaGUuZ2V0KCdyZXBvcnQvaS5qc29uJykpO1xuXG4gICAgaWYgKHBhcnRzICYmIHBhcnRzLmxlbmd0aCkge1xuICAgICAgdm0uZmlyc3RfcGFydF9pZCA9IHBhcnRzWzBdLmlkO1xuICAgIH1cblxuICAgIHZtLmNhbmNlbF9vcmRlciA9IGNhbmNlbF9vcmRlcjtcbiAgICB2bS5kZWxfY2FyID0gZGVsX2NhcjtcbiAgICB2bS5lZGl0X2NhciA9IGVkaXRfY2FyO1xuICAgIHZtLnVwbG9hZF9yZXBvcnQgPSB1cGxvYWRfcmVwb3J0O1xuICAgIHZtLmNsZWFyX2xvY2FsID0gY2xlYXJfbG9jYWw7XG5cbiAgICBxdWVyeSgpO1xuXG4gICAgZnVuY3Rpb24gcXVlcnkoKSB7XG4gICAgICByZXR1cm4gVW50ZXN0ZWRJbmRlbnRzU3ZjXG4gICAgICAgIC5xdWVyeSgpXG4gICAgICAgIC4kcHJvbWlzZVxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICByZXMuZm9yRWFjaChmdW5jdGlvbihvcmRlcikge1xuICAgICAgICAgICAgb3JkZXIuYXV0by5mb3JFYWNoKGZ1bmN0aW9uKGNhcikge1xuICAgICAgICAgICAgICB2YXIgcmVwb3J0X3N0YXR1c19rZXkgPSBLZXlNZ3Iuc3RhdHVzKG9yZGVyLmlkLCBjYXIuaWQpO1xuICAgICAgICAgICAgICBjYXIucmVwb3J0X3N0YXR1cyA9IGxvY2FsU3RvcmFnZVNlcnZpY2UuZ2V0KHJlcG9ydF9zdGF0dXNfa2V5KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgdm0uaXRlbXMgPSByZXM7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICB0b2FzdHIuZXJyb3IocmVzLm1zZyB8fCAn6I635Y+W5b6F5qOA5rWL6K6i5Y2V5aSx6LSlJyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIOWKoOi9piDmiJYg57yW6L6R6L2mXG4gICAgZnVuY3Rpb24gZWRpdF9jYXIoaWQsIGNhcikge1xuICAgICAgdmFyIGVkaXRfY2FyX2lucyA9ICRtb2RhbC5vcGVuKHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdpbmRlbnQvZWRpdF9jYXIuaHRtJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0luZGVudENhckVkaXRDdHJsJyxcbiAgICAgICAgYmFja2Ryb3A6ICdzdGF0aWMnLFxuICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgSW5kZW50RW51bXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIEluZGVudEVudW1zO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgaW5kZW50X2luZm86IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgaWQ6IGlkLFxuICAgICAgICAgICAgICBjYXI6IGNhclxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBlZGl0X2Nhcl9pbnMucmVzdWx0LnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIHF1ZXJ5KCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyDliKDpmaTovaZcbiAgICBmdW5jdGlvbiBkZWxfY2FyKG9yZGVyX2lkLCBjYXIpIHtcbiAgICAgIGlmIChjb25maXJtKCfnoa7orqTliKDpmaQgXCInICsgW2Nhci5icmFuZCwgY2FyLnNlcmllcywgY2FyLm1vZGVsXS5qb2luKCctJykgKyAnXCInKSkge1xuICAgICAgICByZXR1cm4gSW5kZW50Q2FyU3ZjXG4gICAgICAgICAgLnJlbW92ZSh7XG4gICAgICAgICAgICBvcmRlcl9pZDogb3JkZXJfaWQsXG4gICAgICAgICAgICBjYXJfaWQ6IGNhci5pZFxuICAgICAgICAgIH0pXG4gICAgICAgICAgLiRwcm9taXNlXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICBLZXlNZ3IuY2xlYXIob3JkZXJfaWQsIGNhci5pZCk7XG5cbiAgICAgICAgICAgIHRvYXN0ci5zdWNjZXNzKHJlcy5tc2cgfHwgJ+WIoOmZpOi9puaIkOWKnycpO1xuXG4gICAgICAgICAgICBxdWVyeSgpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgdG9hc3RyLmVycm9yKHJlcy5tc2cgfHwgJ+WIoOmZpOi9puWksei0pe+8jOivt+mHjeivlScpO1xuICAgICAgICAgIH0pOyAgXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8g5riF6ZmkbG9jYWxcbiAgICBmdW5jdGlvbiBjbGVhcl9sb2NhbChvcmRlcl9pZCwgY2FyKSB7XG4gICAgICBLZXlNZ3IuY2xlYXIob3JkZXJfaWQsIGNhci5pZCk7XG4gICAgICB0b2FzdHIuc3VjY2Vzcygn5riF55CG5pys5Zyw5pWw5o2u5a6M5oiQJyk7XG4gICAgfVxuXG4gICAgLy8g5Y+W5raI6K6i5Y2VXG4gICAgZnVuY3Rpb24gY2FuY2VsX29yZGVyKGl0ZW0pIHtcbiAgICAgIHZhciBjYW5jZWxfb3JkZXJfaW5zID0gJG1vZGFsLm9wZW4oe1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2luZGVudC9jYW5jZWxfb3JkZXIuaHRtJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0NhbmNlbE9yZGVyQ3RybCcsXG4gICAgICAgIGJhY2tkcm9wOiAnc3RhdGljJyxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgIGluZGVudF9pbmZvOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGNhbmNlbF9vcmRlcl9pbnMucmVzdWx0LnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIOWIoOmZpOaJgOacieacrOWcsOaKpeWRiuebuOWFs+aVsOaNrlxuICAgICAgICBpdGVtLmF1dG8uZm9yRWFjaChmdW5jdGlvbihjYXIpIHtcbiAgICAgICAgICBLZXlNZ3IuY2xlYXIoaXRlbS5pZCwgY2FyLmlkKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcXVlcnkoKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIOS4iuS8oOaKpeWRilxuICAgIGZ1bmN0aW9uIHVwbG9hZF9yZXBvcnQob3JkZXIsIGNhcikge1xuICAgICAgdmFyIG9yZGVyX2lkID0gb3JkZXIuaWQ7XG4gICAgICB2YXIgY2FyX2lkID0gY2FyLmlkO1xuXG4gICAgICB2YXIgcmVwb3J0X2tleSA9IEtleU1nci5yZXBvcnQob3JkZXJfaWQsIGNhcl9pZCk7XG4gICAgICB2YXIgcmVwb3J0X3N1Ym1pdF9rZXkgPSBLZXlNZ3Iuc3VibWl0KHJlcG9ydF9rZXkpO1xuICAgICAgdmFyIHJlcG9ydF9kYXRhID0gbG9jYWxTdG9yYWdlU2VydmljZS5nZXQocmVwb3J0X2tleSk7XG5cbiAgICAgICRsb2cuaW5mbygn5YeG5aSH5LiK5Lyg5oql5ZGKOiAnICsgcmVwb3J0X2tleSk7XG4gICAgICAkbG9nLmluZm8oJ+aKpeWRiuWIhuexu+aVsOaNrjogJyArIEpTT04uc3RyaW5naWZ5KHJlcG9ydF9kYXRhKSk7XG5cbiAgICAgIGlmICghcmVwb3J0X2RhdGEpIHtcbiAgICAgICAgJGxvZy5pbmZvKCfmiqXlkYrmlbDmja7kuLrnqbrvvIzkuI3nlKjkuIrkvKAnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjYXIucmVwb3J0X3N0YXR1cy51cGxvYWRfc3RhdHVzID0gMDtcbiAgICAgIGNhci5yZXBvcnRfc3RhdHVzLnVwbG9hZGluZyA9IHRydWU7XG5cbiAgICAgIHZhciBzdWJtaXRfZGF0YSA9IHt9O1xuXG4gICAgICBPYmplY3Qua2V5cyhyZXBvcnRfZGF0YSkuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgYW5ndWxhci5leHRlbmQoc3VibWl0X2RhdGEsIHJlcG9ydF9kYXRhW2tleV0pO1xuICAgICAgfSk7XG5cbiAgICAgICRsb2cuaW5mbygn5oql5ZGK5b6F5o+Q5Lqk5pWw5o2uOiAnICsgSlNPTi5zdHJpbmdpZnkoc3VibWl0X2RhdGEpKTtcblxuICAgICAgdmFyIGltYWdlX2ZpZWxkcyA9IHt9O1xuICAgICAgT2JqZWN0LmtleXMoc3VibWl0X2RhdGEpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgIGlmIChzdWJtaXRfZGF0YVtrZXldLmltYWdlKSB7XG4gICAgICAgICAgaW1hZ2VfZmllbGRzW2tleV0gPSBhbmd1bGFyLmV4dGVuZCh7XG4gICAgICAgICAgICB1cmw6IHN1Ym1pdF9kYXRhW2tleV0uaW1hZ2VcbiAgICAgICAgICB9LCBzdWJtaXRfZGF0YVtrZXldKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHZhciBpbWFnZXMgPSBfLnZhbHVlcyhpbWFnZV9maWVsZHMpO1xuXG4gICAgICAvLyDmsqHmnInlm77niYfpnIDopoHkuIrkvKDvvIznm7TmjqXkuIrkvKDmiqXlkYrlhoXlrrlcbiAgICAgIGlmICghaW1hZ2VzLmxlbmd0aCkge1xuICAgICAgICBzdWJtaXRfcmVwb3J0KCk7XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAkbG9nLmluZm8oJ+aKpeWRiuWbvueJh+aVsOaNrjogJyArIEpTT04uc3RyaW5naWZ5KGltYWdlX2ZpZWxkcykpO1xuICAgICAgJGxvZy5pbmZvKCflvIDlp4vkuIrkvKDnhafniYfmlbDmja4nKTtcbiAgICAgIFVwbG9hZGVyLmJhdGNoKHtcbiAgICAgICAgdXJsOiAnaHR0cDovL2YuaWZkaXUuY29tJyxcbiAgICAgICAgYXR0YWNobWVudHM6IGltYWdlcyxcbiAgICAgICAgZG9uZTogdXBsb2FkX2RvbmUsXG4gICAgICAgIG9uZTogdXBsb2FkX29uZSxcbiAgICAgICAgb25wcm9ncmVzczogb25wcm9ncmVzcyxcbiAgICAgICAgZXJyb3I6IHVwbG9hZF9lcnJvclxuICAgICAgfSk7XG5cbiAgICAgIGZ1bmN0aW9uIG9ucHJvZ3Jlc3MocHJvZ3Jlc3MpIHtcbiAgICAgICAgLy8gMS4gdXBkYXRlIHByb2dyZXNzIHN0YXR1cyB0byBwYWdlXG4gICAgICAgICRsb2cuaW5mbygn5LiK5Lyg6L+b5bqmOiAnICsgcHJvZ3Jlc3MucGVyY2VudCk7XG4gICAgICAgIGNhci5yZXBvcnRfc3RhdHVzLnVwbG9hZF9zdGF0dXMgPSBwYXJzZUludChwcm9ncmVzcy5wZXJjZW50ICogMC44KTtcbiAgICAgICAgdm0uJGFwcGx5KCk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHVwbG9hZF9vbmUoaW1hZ2UsIGZpbGUpIHtcbiAgICAgICAgLy8gWW91IGNhbiBkbyBzb21ldGhpbmcgb24gaW1hZ2Ugd2l0aCBmaWxlIG9iamVjdFxuICAgICAgICBpbWFnZS5maWxlX2lkID0gZmlsZS5pZDtcbiAgICAgICAgJGxvZy5pbmZvKCfmiJDlip/kuIrkvKDlm77niYc6ICcgKyBKU09OLnN0cmluZ2lmeShpbWFnZSkpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiB1cGxvYWRfZXJyb3IoaW1hZ2UpIHtcbiAgICAgICAgJGxvZy5pbmZvKCfkuIrkvKDlm77niYflh7rplJk6ICcgKyBKU09OLnN0cmluZ2lmeShpbWFnZSkpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiB1cGxvYWRfZG9uZSgpIHtcbiAgICAgICAgLy8gMS4gY29tYmluZSBpbWFnZSBmaWxlaWQgdG8gc3VibWl0X2RhdGFcbiAgICAgICAgLy8gMi4gc3RvcmUgaW1hZ2UgZGF0YSB0byBsb2NhbHN0b3JhZ2VcbiAgICAgICAgLy8gMy4gc3VibWl0IHJlcG9ydCBkYXRhXG4gICAgICAgICRsb2cuaW5mbygn5oiQ5Yqf5LiK5Lyg5omA5pyJ5Zu+54mHJyk7XG5cbiAgICAgICAgLy8gMVxuICAgICAgICBpbWFnZXMuZm9yRWFjaChmdW5jdGlvbihpbWFnZSkge1xuICAgICAgICAgIHN1Ym1pdF9kYXRhW2ltYWdlLmlkXSA9IGltYWdlO1xuICAgICAgICB9KTtcblxuICAgICAgICAkbG9nLmluZm8oJ+WbnuWGmeWbvueJh+aVsOaNruWIsCBsb2NhbHN0b3JhZ2UnKTtcblxuICAgICAgICAvLyAyXG4gICAgICAgIGxvY2FsU3RvcmFnZVNlcnZpY2Uuc2V0KHJlcG9ydF9zdWJtaXRfa2V5LCBzdWJtaXRfZGF0YSk7XG5cbiAgICAgICAgLy8gM1xuICAgICAgICBzdWJtaXRfcmVwb3J0KCk7XG4gICAgICB9XG5cbiAgICAgIC8vIDEuIHN1Ym1pdCByZXBvcnQgZGF0YVxuICAgICAgLy8gMi4gcmVtb3ZlIGltYWdlIGZyb20gY2FjaGVcbiAgICAgIC8vIDMuIGNsZWFyIHJlcG9ydCBsb2NhbCBkYXRhXG4gICAgICAvLyA0LiB1cGRhdGUgb3JkZXIgc3RhdHVzIFxuICAgICAgZnVuY3Rpb24gc3VibWl0X3JlcG9ydCgpIHtcbiAgICAgICAgJGxvZy5pbmZvKCflvIDlp4vkuIrkvKDmiqXlkYrlhoXlrrknKTtcbiAgICAgICAgLy8gMVxuICAgICAgICByZXR1cm4gUmVwb3J0U3ZjXG4gICAgICAgICAgLnNhdmUoe1xuICAgICAgICAgICAgb3JkZXJfaWQ6IG9yZGVyX2lkLFxuICAgICAgICAgICAgY2FyX2lkOiBjYXJfaWRcbiAgICAgICAgICB9LCBzdWJtaXRfZGF0YSlcbiAgICAgICAgICAuJHByb21pc2VcbiAgICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICRsb2cuaW5mbygn5LiK5Lyg5oql5ZGK5YaF5a655oiQ5YqfJyk7XG5cbiAgICAgICAgICAgIC8vIDJcbiAgICAgICAgICAgIGlmIChpbWFnZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGltYWdlcy5mb3JFYWNoKGZ1bmN0aW9uKGltYWdlKSB7XG4gICAgICAgICAgICAgICAgRmlsZXIucmVtb3ZlKGltYWdlLnVybCk7XG4gICAgICAgICAgICAgIH0pOyAgXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIDNcbiAgICAgICAgICAgIEtleU1nci5jbGVhcihvcmRlcl9pZCwgY2FyX2lkKTtcblxuICAgICAgICAgICAgLy8gNFxuICAgICAgICAgICAgY2FyLnJlcG9ydF9zdGF0dXMudXBsb2FkX3N0YXR1cyA9IDEwMDtcbiAgICAgICAgICAgIGNhci5yZXBvcnRfc3RhdHVzLnVwbG9hZGVkID0gdHJ1ZTtcblxuICAgICAgICAgICAgLy8gcXVlcnkoKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5jYXRjaChmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICRsb2cuaW5mbygn5LiK5Lyg5oql5ZGK5YaF5a655aSx6LSlOiAnICsgSlNPTi5zdHJpbmdpZnkoYXJndW1lbnRzKSk7XG4gICAgICAgICAgICB0b2FzdHIuZXJyb3IocmVzLm1zZyB8fCAn5LiK5Lyg6L+H56iL5Lit5Y+R55Sf6ZSZ6K+v77yM6K+36YeN6K+VJyk7XG4gICAgICAgICAgICAvLyA0XG4gICAgICAgICAgICBjYXIucmVwb3J0X3N0YXR1cy51cGxvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH0pXG4gIFxuICAvLyDlj5bmtojorqLljZVcbiAgLmNvbnRyb2xsZXIoJ0NhbmNlbE9yZGVyQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJG1vZGFsSW5zdGFuY2UsIHRvYXN0ciwgSW5kZW50UmV2b2tlUmVxdWVzdFN2YywgaW5kZW50X2luZm8pIHtcbiAgICB2YXIgdm0gPSAkc2NvcGU7XG5cbiAgICBhbmd1bGFyLmV4dGVuZCh2bSwgaW5kZW50X2luZm8pO1xuXG4gICAgdm0uY2FuY2VsX29yZGVyID0gY2FuY2VsX29yZGVyO1xuICAgIHZtLmNhbmNlbCA9IGNhbmNlbDtcblxuICAgIGZ1bmN0aW9uIGNhbmNlbF9vcmRlcigpIHtcbiAgICAgIHZtLmNhbmNlbF9vcmRlcl9zdGF0dXMgPSB0cnVlO1xuXG4gICAgICBJbmRlbnRSZXZva2VSZXF1ZXN0U3ZjXG4gICAgICAgIC51cGRhdGUoe1xuICAgICAgICAgIGlkOiBpbmRlbnRfaW5mby5pZFxuICAgICAgICB9LCB7XG4gICAgICAgICAgbWVtbzogdm0ucmVhc29uXG4gICAgICAgIH0pXG4gICAgICAgIC4kcHJvbWlzZVxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICB0b2FzdHIuc3VjY2VzcyhyZXMubXNnIHx8ICforqLljZXlj5bmtojmiJDlip8nKTtcblxuICAgICAgICAgICRtb2RhbEluc3RhbmNlLmNsb3NlKCk7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICB2bS5jYW5jZWxfb3JkZXJfc3RhdHVzID0gZmFsc2U7XG5cbiAgICAgICAgICB0b2FzdHIuZXJyb3IocmVzLm1zZyB8fCAn6K6i5Y2V5Y+W5raI5aSx6LSl77yM6K+36YeN6K+VJyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNhbmNlbCgpIHtcbiAgICAgICRtb2RhbEluc3RhbmNlLmRpc21pc3MoKTtcbiAgICB9XG4gIH0pXG5cbiAgLy8g5Yqg6L2mIOaIliDnvJbovpHovaZcbiAgLmNvbnRyb2xsZXIoJ0luZGVudENhckVkaXRDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkbW9kYWxJbnN0YW5jZSwgdG9hc3RyLCBJbmRlbnRDYXJzU3ZjLFxuICAgIEluZGVudENhclN2YywgSW5kZW50RW51bXMsIGluZGVudF9pbmZvKSB7XG4gICAgdmFyIHZtID0gJHNjb3BlO1xuXG4gICAgdm0uYnJhbmRfbGlzdCA9IEluZGVudEVudW1zLmxpc3QoJ2JyYW5kJyk7XG4gICAgdm0uc2VyaWVzX2xpc3QgPSBJbmRlbnRFbnVtcy5saXN0KCdzZXJpZXMnKTtcbiAgICB2bS5tb2RlbF9saXN0ID0gSW5kZW50RW51bXMubGlzdCgnbW9kZWwnKTtcblxuICAgIGlmIChpbmRlbnRfaW5mby5jYXIpIHtcbiAgICAgIHZtLnRpdGxlID0gJ+e8lui+kei9puS/oeaBryc7XG5cbiAgICAgIHNlbGVjdF9pdGVtKCdicmFuZCcsIGluZGVudF9pbmZvLmNhci5icmFuZCk7XG4gICAgICBzZWxlY3RfaXRlbSgnc2VyaWVzJywgaW5kZW50X2luZm8uY2FyLnNlcmllcyk7XG4gICAgICBzZWxlY3RfaXRlbSgnbW9kZWwnLCBpbmRlbnRfaW5mby5jYXIubW9kZWwpOyAgXG4gICAgfSBlbHNlIHtcbiAgICAgIHZtLnRpdGxlID0gJ+WKoOi9pic7XG4gICAgfVxuXG4gICAgdm0uY2FuY2VsID0gY2FuY2VsO1xuICAgIHZtLnN1Ym1pdCA9IHN1Ym1pdDtcblxuICAgIGZ1bmN0aW9uIHN1Ym1pdCgpIHtcbiAgICAgIGlmIChpbmRlbnRfaW5mby5jYXIpIHtcbiAgICAgICAgSW5kZW50Q2FyU3ZjXG4gICAgICAgICAgLnVwZGF0ZSh7XG4gICAgICAgICAgICBvcmRlcl9pZDogaW5kZW50X2luZm8uaWQsXG4gICAgICAgICAgICBjYXJfaWQ6IGluZGVudF9pbmZvLmNhci5pZFxuICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgIGJyYW5kOiB2bS5icmFuZC52YWx1ZSxcbiAgICAgICAgICAgIHNlcmllczogdm0uYnJhbmQudmFsdWUsXG4gICAgICAgICAgICBtb2RlbDogdm0ubW9kZWwudmFsdWVcbiAgICAgICAgICB9KVxuICAgICAgICAgIC4kcHJvbWlzZVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgdG9hc3RyLnN1Y2Nlc3MocmVzLm1zZyB8fCAn57yW6L6R6L2m6L6G5L+h5oGv5L+d5a2Y5oiQ5YqfJyk7XG5cbiAgICAgICAgICAgICRtb2RhbEluc3RhbmNlLmNsb3NlKCk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICB0b2FzdHIuZXJyb3IocmVzLm1zZyB8fCAn57yW6L6R6L2m6L6G5L+h5oGv5L+d5a2Y5aSx6LSlJyk7XG4gICAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBJbmRlbnRDYXJzU3ZjXG4gICAgICAgICAgLnNhdmUoe1xuICAgICAgICAgICAgb3JkZXJfaWQ6IGluZGVudF9pbmZvLmlkXG4gICAgICAgICAgfSwge1xuICAgICAgICAgICAgYnJhbmQ6IHZtLmJyYW5kLnZhbHVlLFxuICAgICAgICAgICAgc2VyaWVzOiB2bS5icmFuZC52YWx1ZSxcbiAgICAgICAgICAgIG1vZGVsOiB2bS5tb2RlbC52YWx1ZVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLiRwcm9taXNlXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICB0b2FzdHIuc3VjY2VzcyhyZXMubXNnIHx8ICfliqDovabkv6Hmga/kv53lrZjmiJDlip8nKTtcblxuICAgICAgICAgICAgJG1vZGFsSW5zdGFuY2UuY2xvc2UoKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5jYXRjaChmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgIHRvYXN0ci5lcnJvcihyZXMubXNnIHx8ICfliqDovabkv6Hmga/kv53lrZjlpLHotKUnKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZWxlY3RfaXRlbShsaXN0X25hbWUsIHZhbHVlKSB7XG4gICAgICB2bVtsaXN0X25hbWVdID0gSW5kZW50RW51bXMuaXRlbTR0ZXh0KGxpc3RfbmFtZSwgdmFsdWUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNhbmNlbCgpIHtcbiAgICAgICRtb2RhbEluc3RhbmNlLmRpc21pc3MoKTtcbiAgICB9XG5cbiAgfSk7XG5cbiIsImFuZ3VsYXJcbiAgLm1vZHVsZSgnZ3VsdS5sb2dpbicpXG4gIFxuICAuY29udHJvbGxlcignTG9naW5DdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgJHEsICRsb2NhdGlvbiwgJHRpbWVvdXQsIHRvYXN0ciwgTG9naW5TdmMpIHtcbiAgICB2YXIgdm0gPSAkc2NvcGU7XG5cbiAgICB2bS5sb2dpbiA9IGxvZ2luO1xuXG4gICAgZnVuY3Rpb24gbG9naW4oKSB7XG4gICAgICByZXR1cm4gTG9naW5TdmNcbiAgICAgICAgLnNhdmUoe1xuICAgICAgICAgIGpvYl9ubzogdm0uam9iX25vLFxuICAgICAgICAgIHBhc3N3b3JkOiB2bS5wYXNzd29yZFxuICAgICAgICB9KVxuICAgICAgICAuJHByb21pc2VcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgd2luZG93LkF1dGhvcml6YXRpb24gPSByZXMuQXV0aG9yaXphdGlvbjtcbiAgICAgICAgICB3aW5kb3cuQ1NSRlRva2VuID0gcmVzLkNTUkZUb2tlbjtcbiAgICAgICAgICBcbiAgICAgICAgICB0b2FzdHIuc3VjY2VzcyhyZXMubXNnIHx8ICfnmbvlvZXmiJDlip/vvIzmraPlnKjkuLrkvaDot7PovawuLi4nKTtcblxuICAgICAgICAgIHZhciBxcyA9ICRsb2NhdGlvbi5zZWFyY2goKVxuXG4gICAgICAgICAgJGxvY2F0aW9uLnVybChxcy5yZWRpcmVjdCB8fCAnL2luZGVudHMnKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIHRvYXN0ci5lcnJvcihyZXMubXNnIHx8ICfnmbvlvZXlpLHotKXvvIzor7fph43or5UnKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICB9KTsiLCJhbmd1bGFyXG4gIC5tb2R1bGUoJ2d1bHUubG9naW4uc3ZjcycsIFsnbmdSZXNvdXJjZSddKVxuICAuc2VydmljZSgnTG9naW5TdmMnLCBmdW5jdGlvbiAoJHJlc291cmNlKSB7XG4gICAgcmV0dXJuICRyZXNvdXJjZShBUElfU0VSVkVSUy50ZXN0ZXIgKyAnL2FjY291bnQvbG9naW4nKTtcbiAgfSkiLCJhbmd1bGFyXG4gIC5tb2R1bGUoJ2d1bHUucmVwb3J0JylcblxuICAuZmFjdG9yeSgnUmVwb3J0SW5wdXRlcicsIGZ1bmN0aW9uKCRsb2csICRzdGF0ZVBhcmFtcywgJGludGVydmFsLCBWTSwgbG9jYWxTdG9yYWdlU2VydmljZSkge1xuICAgIHJldHVybiBmdW5jdGlvbih2bSwgZmllbGRzLCByZXBvcnRfdHlwZSkge1xuICAgICAgdmFyIGluZGVudF9pZCA9ICRzdGF0ZVBhcmFtcy5pbmRlbnRfaWQ7XG4gICAgICB2YXIgY2FyX2lkID0gJHN0YXRlUGFyYW1zLmNhcl9pZDtcblxuICAgICAgdmFyIHN0b3JlX2tleSA9IFtpbmRlbnRfaWQsIGNhcl9pZF0uam9pbignXycpO1xuXG4gICAgICB2YXIgaW5pdF9kYXRhID0gbG9jYWxTdG9yYWdlU2VydmljZS5nZXQoc3RvcmVfa2V5KTtcbiAgICAgIC8vIOiuvue9ruWIneWni+WMluWAvFxuICAgICAgYW5ndWxhci5leHRlbmQodm0sIGluaXRfZGF0YSAmJiBpbml0X2RhdGFbcmVwb3J0X3R5cGVdIHx8IHt9KTtcblxuICAgICAgLy8g5L+d5a2Y5YiwIGxvY2FsU3RvcmFnZVxuICAgICAgZnVuY3Rpb24gc2F2ZSgpIHtcbiAgICAgICAgdmFyIGRhdGEgPSBsb2NhbFN0b3JhZ2VTZXJ2aWNlLmdldChzdG9yZV9rZXkpIHx8IHt9O1xuICAgICAgICBkYXRhW3JlcG9ydF90eXBlXSA9IFZNLnRvX2pzb24odm0sIGZpZWxkcyk7XG5cbiAgICAgICAgbG9jYWxTdG9yYWdlU2VydmljZS5zZXQoc3RvcmVfa2V5LCBkYXRhKTtcblxuICAgICAgICAkbG9nLmxvZygn5b2V5YWl5qOA5rWL5oql5ZGKIC0gJyArIHN0b3JlX2tleSwgZGF0YVtyZXBvcnRfdHlwZV0pO1xuICAgICAgfVxuXG4gICAgICB2YXIgdGltZXIgPSAkaW50ZXJ2YWwoc2F2ZSwgMzAwMCk7XG5cbiAgICAgIC8vIOWIh+aNoumhtemdouaXtu+8jOWPlua2iOiHquWKqOS/neWtmCjmuIXpmaTlrprml7blmagpXG4gICAgICB2bS4kb24oJyRsb2NhdGlvbkNoYW5nZVN0YXJ0JywgZnVuY3Rpb24oKSB7XG4gICAgICAgICRpbnRlcnZhbC5jYW5jZWwodGltZXIpO1xuICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxuIiwiLyogZ2xvYmFsIGFuZ3VsYXIsIENhbWVyYSwgXywgRnVsbFNjcmVlbkltYWdlKi9cbmFuZ3VsYXJcbiAgLm1vZHVsZSgnZ3VsdS5yZXBvcnQnKVxuXG4gIC5jb250cm9sbGVyKCdJbnB1dERhc2hib2FyZEN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZVBhcmFtcywgJGxvY2F0aW9uLCAkdGVtcGxhdGVDYWNoZSwgbG9jYWxTdG9yYWdlU2VydmljZSwgS2V5TWdyKSB7XG4gICAgdmFyIHZtID0gJHNjb3BlO1xuXG4gICAgdmFyIGluZGVudF9pZCA9ICRzdGF0ZVBhcmFtcy5pbmRlbnRfaWQ7XG4gICAgdmFyIGNhcl9pZCA9ICRzdGF0ZVBhcmFtcy5jYXJfaWQ7XG4gICAgdmFyIHJlcG9ydF9zdGF0dXNfa2V5ID0gS2V5TWdyLnN0YXR1cyhpbmRlbnRfaWQsIGNhcl9pZCk7XG5cbiAgICB2bS5wYXJ0cyA9IEpTT04ucGFyc2UoJHRlbXBsYXRlQ2FjaGUuZ2V0KCdyZXBvcnQvaS5qc29uJykpO1xuICAgIFxuICAgIC8vIOS4jeeUqOWxleekuueFp+eJh1xuICAgIHZtLnBob3RvX3BhcnQgPSB2bS5wYXJ0cy5wb3AoKTtcbiAgICBcbiAgICAvLyDpu5jorqTlsZXlvIBcbiAgICB2bS50ZXN0X3N0ZXBfbmF2X29wZW4gPSB0cnVlO1xuICAgIHZtLnRvZ2dsZV9uYXZfb3BlbiA9IHRvZ2dsZV9uYXZfb3BlbjtcbiAgICB2bS5zdWJtaXRfcHJldmlldyA9IHN1Ym1pdF9wcmV2aWV3O1xuXG4gICAgZnVuY3Rpb24gdG9nZ2xlX25hdl9vcGVuKCkge1xuICAgICAgdm0udGVzdF9zdGVwX25hdl9vcGVuID0gIXZtLnRlc3Rfc3RlcF9uYXZfb3BlbjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzdWJtaXRfcHJldmlldygpIHtcbiAgICAgIC8vIOS4tOaXtuaWueahiFxuICAgICAgbG9jYWxTdG9yYWdlU2VydmljZS5zZXQocmVwb3J0X3N0YXR1c19rZXksIHtcbiAgICAgICAgc3VibWl0ZWQ6IHRydWVcbiAgICAgIH0pO1xuXG4gICAgICAkbG9jYXRpb24udXJsKCcvaW5kZW50cy91bnRlc3RlZCcpO1xuXG4gICAgICAvLyBUT0RPXG4gICAgICAvLyAxLiDot7PovazliLDmiqXlkYrlsZXnpLrpobXpnaIo56Gu6K6k5o+Q5Lqk77yM5Y+v6L+U5ZueKVxuICAgICAgLy8gMi4g5bCG6K6+572uIHJlcHJvdCBzdGF0dXMgc3VibWl0ZWQg56e75Yiw54K55Ye756Gu6K6k5o+Q5Lqk5ZCOXG4gICAgICAvLyAzLiDnoa7orqTmj5DkuqTliJnot7PovazliLDlvZPlpKnku7vliqHnlYzpnaJcbiAgICB9XG4gIH0pXG5cbiAgLmNvbnRyb2xsZXIoJ1Bob3RvUmVwb3J0RWRpdEN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRsb2csICRzdGF0ZVBhcmFtcywgJHRlbXBsYXRlQ2FjaGUsIGxvY2FsU3RvcmFnZVNlcnZpY2UsIEtleU1ncikge1xuICAgIHZhciB2bSA9ICRzY29wZTtcblxuICAgIHZhciBvcmRlcl9pZCA9ICRzdGF0ZVBhcmFtcy5pbmRlbnRfaWQ7XG4gICAgdmFyIGNhcl9pZCA9ICRzdGF0ZVBhcmFtcy5jYXJfaWQ7XG4gICAgLy8g6KGo5Y2V6aG55pWw5o2u5a2Y5YKo5Yiw5pys5Zyw55qEIGtleSDnmoTnlJ/miJDop4TliJlcbiAgICB2YXIgcmVwb3J0X2tleSA9IEtleU1nci5yZXBvcnQob3JkZXJfaWQsIGNhcl9pZCk7XG4gICAgdmFyIHJlcG9ydF9lcnJfa2V5ID0gS2V5TWdyLmVycihyZXBvcnRfa2V5KTtcbiAgICB2YXIgaW5pdF9kYXRhID0gbG9jYWxTdG9yYWdlU2VydmljZS5nZXQocmVwb3J0X2tleSk7XG5cbiAgICB2YXIgcGFydF9qc29uID0gSlNPTi5wYXJzZSgkdGVtcGxhdGVDYWNoZS5nZXQoJ3JlcG9ydC9pLmpzb24nKSk7XG4gICAgLy8g54Wn54mH566h55CG6buY6K6k5Li65pyA5ZCO5LiA6aG5XG4gICAgdmFyIHBhcmVudF9wYXJ0ID0gcGFydF9qc29uW3BhcnRfanNvbi5sZW5ndGggLSAxXTtcbiAgICB2YXIgY3VycmVudF9wYXJ0ID0gcGFyZW50X3BhcnQuaWQ7XG5cbiAgICAvLyDlvZPliY3pobblsYLliIbnsbvmnKzouqvkuLTml7blrZjlgqjnqbrpl7RcbiAgICB2bS5kYXRhID0ge307XG4gICAgLy8g57uZ5b2T5YmN6aG25bGC5YiG57G755Sz6K+3IGxvY2FsIHN0b3JhZ2Ug5a2Y5YKo56m66Ze0XG4gICAgaW5pdF9kYXRhW2N1cnJlbnRfcGFydF0gPSBpbml0X2RhdGFbY3VycmVudF9wYXJ0XSB8fCB7fTtcbiAgICAvLyDlsIbku6XliY3kv53lrZjnmoTnu5Pmnpzlj5blh7rvvIzlubblhpnlhaXkuLTml7blrZjlgqjnqbrpl7RcbiAgICBhbmd1bGFyLmV4dGVuZCh2bS5kYXRhLCBpbml0X2RhdGFbY3VycmVudF9wYXJ0XSk7XG4gICAgLy8g5b2T5YmN55qE5LqM57qn5YiG57G7XG4gICAgdm0ucGFydHMgPSBwYXJlbnRfcGFydC5jaGlsZHJlbjtcblxuICAgIGlmICh2bS5wYXJ0cyAmJiB2bS5wYXJ0cy5sZW5ndGgpIHtcbiAgICAgIC8vIOiuvue9ruesrOS4gOadoem7mOiupOWxleW8gFxuICAgICAgdm0ucGFydHNbMF0uaXNfb3BlbiA9IHRydWU7XG5cbiAgICAgIC8vIOWIneWni+WMluaLjeeFp+mhuSwg6K6+572u5ouN54Wn6aG55Li65pys5Zyw54Wn54mH5oiWbnVsbFxuICAgICAgdm0ucGFydHMuZm9yRWFjaChmdW5jdGlvbihwYXJ0KSB7XG4gICAgICAgIHBhcnQuaW1hZ2UuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgdm0uZGF0YVtpdGVtLmlkXSA9IHZtLmRhdGFbaXRlbS5pZF0gfHwgeyBpbWFnZTogbnVsbCB9O1xuICAgICAgICB9KTtcbiAgICAgIH0pOyAgXG4gICAgfVxuXG4gICAgLy8g5YW25LuWIHBhcnQg5Li05pe25a2Y5YKo56m66Ze0XG4gICAgdm0uZGF0YV9vdGhlciA9IHt9O1xuICAgIC8vIOWFtuS7liBwYXJ0IOS7peWJjeS/neWtmOWcqOacrOWcsOeahOaVsOaNrlxuICAgIHZhciBwaG90b19vZl9ncm91cCA9IGxvY2FsU3RvcmFnZVNlcnZpY2UuZ2V0KHJlcG9ydF9lcnJfa2V5KTtcbiAgICAvLyDmoLzlvI/ljJbku6XliY3kv53lrZjlnKjmnKzlnLDnmoTlhbbku5YgcGFydCDmlbDmja7vvIzmlrnkvr/lsZXnpLpcbiAgICB2bS5wYXJ0X3Bob3RvcyA9IF8ubWFwKHBob3RvX29mX2dyb3VwLCBmdW5jdGlvbihpdGVtLCBrZXkpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGlkOiBrZXksXG4gICAgICAgIG5hbWU6IGdldF9wYXJ0X25hbWUoa2V5KSxcbiAgICAgICAgcGhvdG9zOiBpdGVtXG4gICAgICB9O1xuICAgIH0pO1xuICAgIC8vIOWwhuS7peWJjeS/neWtmOWcqOacrOWcsOeahOe7k+aenOWPluWHuu+8jOW5tuWGmeWFpeS4tOaXtuWtmOWCqOepuumXtFxuICAgIF8ocGhvdG9fb2ZfZ3JvdXApLnZhbHVlcygpLmZsYXR0ZW4oKS5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgIHZtLmRhdGFfb3RoZXJbaXRlbS5pZF0gPSBpdGVtO1xuICAgIH0pO1xuICAgIC8vIOagueaNrumhtuWxguWIhuexuyBpZCDmn6Xmib4g6aG25bGC5YiG57G755qEIG5hbWVcbiAgICBmdW5jdGlvbiBnZXRfcGFydF9uYW1lKHBhcnRfaWQpIHtcbiAgICAgIHJldHVybiBwYXJ0X2pzb24uZmluZChmdW5jdGlvbihwYXJ0KSB7XG4gICAgICAgIHJldHVybiBwYXJ0LmlkID09IHBhcnRfaWQ7XG4gICAgICB9KS5uYW1lO1xuICAgIH1cblxuICAgIC8vIOaLjeeFp+aTjeS9nFxuICAgIHZtLnRha2VfcGhvdG8gPSB0YWtlX3Bob3RvO1xuICAgIC8vIGNhdGVnb3J5IOWMuuWIhuaYr+W9k+WJjemhtuWxguWIhuexu+WtkOmhueeahOaLjeeFp+S4juWFtuS7lumhtuWxguWIhuexu+WtkOmhueeahOaLjeeFp1xuICAgIC8vIHNlbGY6IOW9k+WJjemhtuWxguWIhuexu+eahOWtkOmhuVxuICAgIC8vIG90aGVyOiDlhbbku5bpobblsYLliIbnsbvnmoTlrZDpoblcbiAgICBmdW5jdGlvbiB0YWtlX3Bob3RvKGNhdGVnb3J5LCBwYXJ0LCBpdGVtKSB7XG4gICAgICBuYXZpZ2F0b3IuY2FtZXJhLmdldFBpY3R1cmUodGFrZV9waG90b19zdWNjZXNzLCB0YWtlX3Bob3RvX2Vycm9yLCB7XG4gICAgICAgIHF1YWxpdHkgOiAxMDAsXG4gICAgICAgIGRlc3RpbmF0aW9uVHlwZSA6IENhbWVyYS5EZXN0aW5hdGlvblR5cGUuRklMRV9VUkksXG4gICAgICAgIHNvdXJjZVR5cGUgOiBDYW1lcmEuUGljdHVyZVNvdXJjZVR5cGUuQ0FNRVJBLFxuICAgICAgICBhbGxvd0VkaXQgOiB0cnVlLFxuICAgICAgICBlbmNvZGluZ1R5cGU6IENhbWVyYS5FbmNvZGluZ1R5cGUuUE5HLFxuICAgICAgICAvLyB0YXJnZXRXaWR0aDogMTAwLFxuICAgICAgICAvLyB0YXJnZXRIZWlnaHQ6IDEwMCxcbiAgICAgICAgc2F2ZVRvUGhvdG9BbGJ1bTogZmFsc2VcbiAgICAgIH0pO1xuXG4gICAgICBmdW5jdGlvbiB0YWtlX3Bob3RvX3N1Y2Nlc3MoaW1ndXJsKSB7XG4gICAgICAgIC8vIOW9k+WJjemhtuWxguWIhuexu+aLjeeFp1xuICAgICAgICBpZiAoY2F0ZWdvcnkgPT09ICdzZWxmJykge1xuICAgICAgICAgIHZtLmRhdGFbaXRlbS5pZF0uaW1hZ2UgPSBpbWd1cmw7XG5cbiAgICAgICAgICAvLyDkuLTml7blrZjlgqjmlbDmja7mnKzlnLDljJbliLAgbG9jYWxzdG9yYWdlXG4gICAgICAgICAgLy8g5pa55L6/5LiL5qyh6L+b5YWlIGFwcCDlsZXnpLpcbiAgICAgICAgICBpbml0X2RhdGFbY3VycmVudF9wYXJ0XSA9IHZtLmRhdGE7XG4gICAgICAgIH0gZWxzZSBpZiAoY2F0ZWdvcnkgPT09ICdvdGhlcicpIHtcbiAgICAgICAgICAvLyDlhbbku5bpobblsYLliIbnsbvmi43nhadcbiAgICAgICAgICB2bS5kYXRhX290aGVyW2l0ZW0uaWRdLmltYWdlID0gaW1ndXJsO1xuXG4gICAgICAgICAgLy8g6L+Z6YeM55qEIHBhcnQg5piv6aG25bGC5YiG57G7XG4gICAgICAgICAgdmFyIGV4aXN0c19pdGVtID0gcGhvdG9fb2ZfZ3JvdXBbcGFydC5pZF0uZmluZChmdW5jdGlvbihfaXRlbSkge1xuICAgICAgICAgICAgcmV0dXJuIF9pdGVtLmlkID09PSBpdGVtLmlkO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8g5pys5Zyw5YyW5Yiw54Wn54mH5oC76KeIIGxvY2Fsc3RvcmFnZVxuICAgICAgICAgIGV4aXN0c19pdGVtLmltYWdlID0gaW1ndXJsO1xuICAgICAgICAgIGxvY2FsU3RvcmFnZVNlcnZpY2Uuc2V0KHJlcG9ydF9lcnJfa2V5LCBwaG90b19vZl9ncm91cCk7XG4gICAgICAgICAgXG4gICAgICAgICAgLy8g5pys5Zyw5YyW5Yiw5oql5ZGKIGxvY2Fsc3RvcmFnZVxuICAgICAgICAgIGluaXRfZGF0YVtwYXJ0LmlkXVtleGlzdHNfaXRlbS5pZF0uaW1hZ2UgPSBpbWd1cmw7XG4gICAgICAgIH1cblxuICAgICAgICBsb2NhbFN0b3JhZ2VTZXJ2aWNlLnNldChyZXBvcnRfa2V5LCBpbml0X2RhdGEpO1xuICAgICAgICAvLyDmiYvliqjop6blj5HpobXpnaLmuLLmn5NcbiAgICAgICAgdm0uJGFwcGx5KCk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHRha2VfcGhvdG9fZXJyb3IoKSB7XG4gICAgICAgICRsb2cuZXJyb3IoJ+aLjeeFp+Wksei0pSwg5YiG57G7IC0gJyArIHBhcnQubmFtZSArICcsIOmhuSAtICcgKyBpdGVtLm5hbWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZtLnNob3dfcGhvdG8gPSBzaG93X3Bob3RvO1xuICAgIGZ1bmN0aW9uIHNob3dfcGhvdG8oY2F0ZWdvcnksIGZpZWxkKSB7XG4gICAgICBGdWxsU2NyZWVuSW1hZ2Uuc2hvd0ltYWdlVVJMKHZtW2NhdGVnb3J5ID09PSAnc2VsZicgPyAnZGF0YScgOiAnZGF0YV9vdGhlciddW2ZpZWxkLmlkXS5pbWFnZSk7XG4gICAgfVxuICB9KVxuXG4gIC5jb250cm9sbGVyKCdSZXBvcnRFZGl0Q3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJGxvZywgJHN0YXRlUGFyYW1zLCAkdGVtcGxhdGVDYWNoZSwgJG1vZGFsLCBsb2NhbFN0b3JhZ2VTZXJ2aWNlLCBLZXlNZ3IpIHtcbiAgICB2YXIgdm0gPSAkc2NvcGU7XG5cbiAgICB2YXIgY3VycmVudF9wYXJ0ID0gcGFyc2VJbnQoJHN0YXRlUGFyYW1zLnBhcnRfaWQpO1xuICAgIHZhciBvcmRlcl9pZCA9ICRzdGF0ZVBhcmFtcy5pbmRlbnRfaWQ7XG4gICAgdmFyIGNhcl9pZCA9ICRzdGF0ZVBhcmFtcy5jYXJfaWQ7XG5cbiAgICAvLyDooajljZXpobnmlbDmja7lrZjlgqjliLDmnKzlnLDnmoQga2V5IOeahOeUn+aIkOinhOWImVxuICAgIHZhciByZXBvcnRfa2V5ID0gS2V5TWdyLnJlcG9ydChvcmRlcl9pZCwgY2FyX2lkKTtcbiAgICB2YXIgcmVwb3J0X2Vycl9rZXkgPSBLZXlNZ3IuZXJyKHJlcG9ydF9rZXkpO1xuICAgIHZhciBpbml0X2RhdGEgPSBsb2NhbFN0b3JhZ2VTZXJ2aWNlLmdldChyZXBvcnRfa2V5KTtcblxuICAgIC8vIOiOt+WPluaKpeWRiui+k+WFpemhueaVsOaNrlxuICAgIHZhciBwYXJlbnRfcGFydCA9IFxuICAgIEpTT05cbiAgICAgIC5wYXJzZSgkdGVtcGxhdGVDYWNoZS5nZXQoJ3JlcG9ydC9pLmpzb24nKSlcbiAgICAgIC5maW5kKGZ1bmN0aW9uKHBhcnQpIHtcbiAgICAgICAgcmV0dXJuIHBhcnQuaWQgPT09IGN1cnJlbnRfcGFydDtcbiAgICAgIH0pO1xuICAgIHZtLnBhcnRzID0gcGFyZW50X3BhcnQgJiYgcGFyZW50X3BhcnQuY2hpbGRyZW47XG5cbiAgICAvLyDnrKzkuIDmnaHpu5jorqTlsZXlvIBcbiAgICBpZiAodm0ucGFydHMgJiYgdm0ucGFydHMubGVuZ3RoKSB7XG4gICAgICB2bS5wYXJ0c1swXS5pc19vcGVuID0gdHJ1ZTtcbiAgICB9XG5cbiAgICB2bS5kYXRhID0ge307XG5cbiAgICAvLyDorr7nva7liJ3lp4vljJblgLxcbiAgICBhbmd1bGFyLmV4dGVuZCh2bS5kYXRhLCBpbml0X2RhdGEgJiYgaW5pdF9kYXRhW2N1cnJlbnRfcGFydF0gfHwge30pO1xuXG4gICAgdm0ucGFydHMuZm9yRWFjaChmdW5jdGlvbihwYXJ0KSB7XG4gICAgICBpZiAocGFydC5yYWRpb193aXRoX3N0YXR1c19kZWdyZWVzICYmIHBhcnQucmFkaW9fd2l0aF9zdGF0dXNfZGVncmVlcy5sZW5ndGgpIHtcbiAgICAgICAgcGFydC5yYWRpb193aXRoX3N0YXR1c19kZWdyZWVzLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgIHZtLmRhdGFbaXRlbS5pZF0gPSB2bS5kYXRhW2l0ZW0uaWRdIHx8IHt9O1xuXG4gICAgICAgICAgaWYgKHZtLmRhdGFbaXRlbS5pZF0ucmVzdWx0ID09IG51bGwpIHtcbiAgICAgICAgICAgIHZtLmRhdGFbaXRlbS5pZF0ucmVzdWx0ID0gXCIxXCI7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIGRhdGEg5pS55Y+Y5YiZ5bCG5YW25L+d5a2Y5YiwIGxvY2FsIHN0b3JhZ2VcbiAgICB2bS4kd2F0Y2goJ2RhdGEnLCBmdW5jdGlvbih2KSB7XG4gICAgICAkbG9nLmxvZygnZm9ybSBkYXRhOiAnLCBKU09OLnN0cmluZ2lmeSh2KSk7XG5cbiAgICAgIHNhdmUoKTtcblxuICAgICAgc2F2ZV9lcnIoKTtcbiAgICB9LCB0cnVlKTtcblxuICAgIFxuICAgIC8vIOS/neWtmOWIsCBsb2NhbFN0b3JhZ2VcbiAgICAvLyDmlbDmja7moLzlvI/kuLrvvJpcbiAgICAvLyB7XG4gICAgLy8gICBcInIxXCI6IHtcbiAgICAvLyAgICAgXCJyZXN1bHRcIjogMSxcbiAgICAvLyAgICAgXCJzdGF0ZVwiOiAxLFxuICAgIC8vICAgICBcImRlZ3JlZVwiOiAxLFxuICAgIC8vICAgICBcIm1lbW9cIjogXCJ4eHhcIixcbiAgICAvLyAgICAgXCJpbWFnZVwiOiBcIlwiXG4gICAgLy8gICB9XG4gICAgLy8gfVxuICAgIGZ1bmN0aW9uIHNhdmUoKSB7XG4gICAgICB2YXIgZGF0YSA9IGxvY2FsU3RvcmFnZVNlcnZpY2UuZ2V0KHJlcG9ydF9rZXkpIHx8IHt9O1xuICAgICAgZGF0YVtjdXJyZW50X3BhcnRdID0gdm0uZGF0YTtcblxuICAgICAgbG9jYWxTdG9yYWdlU2VydmljZS5zZXQocmVwb3J0X2tleSwgZGF0YSk7XG5cbiAgICAgICRsb2cubG9nKCflvZXlhaXmo4DmtYvmiqXlkYogLSAnICsgcmVwb3J0X2tleSwgZGF0YVtjdXJyZW50X3BhcnRdKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzYXZlX2VycigpIHtcbiAgICAgIHZhciBkYXRhID0gbG9jYWxTdG9yYWdlU2VydmljZS5nZXQocmVwb3J0X2Vycl9rZXkpIHx8IHt9O1xuICAgICAgdmFyIGVycl9pdGVtcyA9IFtdO1xuXG4gICAgICAvLyDnrZvpgInlh7rnvLrpmbfnmoTpobnvvIzmiJbpnIDopoHmi43nhafnmoTpoblcbiAgICAgIF8uZWFjaCh2bS5kYXRhLCBmdW5jdGlvbihpdGVtLCBrZXkpIHtcbiAgICAgICAgaWYgKGl0ZW0uaW1hZ2UpIHtcbiAgICAgICAgICBpdGVtLmlkID0ga2V5O1xuICAgICAgICAgIGVycl9pdGVtcy5wdXNoKGl0ZW0pO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8g5aaC5p6c6K+lIHBhcnQg5rKh5pyJ5ouN54WnXG4gICAgICBpZiAoIWVycl9pdGVtcy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgXG4gICAgICBkYXRhW2N1cnJlbnRfcGFydF0gPSBlcnJfaXRlbXM7XG5cbiAgICAgIGxvY2FsU3RvcmFnZVNlcnZpY2Uuc2V0KHJlcG9ydF9lcnJfa2V5LCBkYXRhKTtcblxuICAgICAgJGxvZy5sb2coJ+W9leWFpeajgOa1i+aKpeWRiumXrumimOmhuSAtICcgKyByZXBvcnRfZXJyX2tleSwgZGF0YVtjdXJyZW50X3BhcnRdKTtcbiAgICB9XG5cbiAgICB2bS5zaG93X2RldGFpbCA9IHNob3dfZGV0YWlsO1xuICAgIHZtLnNob3VsZF9jbGVhciA9IHNob3VsZF9jbGVhcjtcbiAgICB2bS50YWtlX3Bob3RvID0gdGFrZV9waG90bztcbiAgICB2bS5vcGVuX2RhdGVwaWNrZXIgPSBvcGVuX2RhdGVwaWNrZXI7XG4gICAgdm0uc2hvd190YWtlX3Bob3RvID0gc2hvd190YWtlX3Bob3RvO1xuICAgIHZtLnNob3dfcGhvdG8gPSBzaG93X3Bob3RvO1xuXG4gICAgLy8g6YG/5YWN5bGV56S65Lik5qyhIG1vZGFsXG4gICAgZnVuY3Rpb24gc2hvd19kZXRhaWwoaW5kZXgsIHBhcnQsIGNoZWNrX2l0ZW0pIHtcbiAgICAgIC8vIGNoYW5nZSDkuovku7blj5HnlJ/lnKggY2xpY2sg5LmL5ZCOXG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyDlhbbku5bpgInpobnkuI3lupTor6XlvLnlh7pcbiAgICAgICAgaWYgKHNob3dfZGV0YWlsLmlzX3Nob3cgfHwgcGFyc2VJbnQodm0uZGF0YVtjaGVja19pdGVtLmlkXS5yZXN1bHQpICE9PSAyKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgc2hvd19kZXRhaWwuaXNfc2hvdyA9IHRydWU7XG5cbiAgICAgICAgdmFyIGlucHV0X2RldGFpbF9pbnMgPSAkbW9kYWwub3Blbih7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICdyZXBvcnQvaW5wdXRfZGV0YWlsLmh0bScsXG4gICAgICAgICAgY29udHJvbGxlcjogJ0l0ZW1JbnB1dERldGFpbEN0cmwnLFxuICAgICAgICAgIGJhY2tkcm9wOiAnc3RhdGljJyxcbiAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICBpdGVtX2RldGFpbDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBhbmd1bGFyLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgcGFydF9uYW1lOiBwYXJ0Lm5hbWUsXG4gICAgICAgICAgICAgICAgcGFydF9hbGlhczogcGFydC5hbGlhcyxcbiAgICAgICAgICAgICAgICBpbmRleDogaW5kZXhcbiAgICAgICAgICAgICAgfSwgY2hlY2tfaXRlbSwgdm0uZGF0YVtjaGVja19pdGVtLmlkXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpbnB1dF9kZXRhaWxfaW5zLnJlc3VsdC50aGVuKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICBhbmd1bGFyLmV4dGVuZCh2bS5kYXRhW2NoZWNrX2l0ZW0uaWRdLCBpdGVtLCB7XG4gICAgICAgICAgICBuYW1lOiBjaGVja19pdGVtLm5hbWVcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHNob3dfZGV0YWlsLmlzX3Nob3cgPSBmYWxzZTtcbiAgICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgc2hvd19kZXRhaWwuaXNfc2hvdyA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHNob3dfZGV0YWlsLmlzX3Nob3cgPSBmYWxzZTtcblxuICAgIGZ1bmN0aW9uIHNob3VsZF9jbGVhcihpdGVtKSB7XG4gICAgICAvLyDoi6Xmo4DmtYvml6Dpl67popjvvIzliJnmuIXpmaTkuYvliY3loavlhpnnmoTmjZ/kvKTmlbDmja5cbiAgICAgIHZhciByID0gcGFyc2VJbnQodm0uZGF0YVtpdGVtLmlkXS5yZXN1bHQpO1xuICAgICAgaWYgKHIgIT09IDIgfHwgciAhPT0gNSkge1xuICAgICAgICBhbmd1bGFyLmV4dGVuZCh2bS5kYXRhW2l0ZW0uaWRdLCB7XG4gICAgICAgICAgc3RhdGU6IG51bGwsXG4gICAgICAgICAgZGVncmVlOiBudWxsLFxuICAgICAgICAgIG1lbW86IG51bGwsXG4gICAgICAgICAgaW1hZ2U6IG51bGxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gVE9ET1xuICAgIC8vIOWbvueJh+mihOiniFxuICAgIGZ1bmN0aW9uIHNob3dfcGhvdG8oZmllbGQpIHtcbiAgICAgIEZ1bGxTY3JlZW5JbWFnZS5zaG93SW1hZ2VVUkwodm0uZGF0YVtmaWVsZC5pZF0uaW1hZ2UpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRha2VfcGhvdG8ocGFydCwgaXRlbSkge1xuICAgICAgbmF2aWdhdG9yLmNhbWVyYS5nZXRQaWN0dXJlKHRha2VfcGhvdG9fc3VjY2VzcywgdGFrZV9waG90b19lcnJvciwge1xuICAgICAgICBxdWFsaXR5IDogMTAwLFxuICAgICAgICBkZXN0aW5hdGlvblR5cGUgOiBDYW1lcmEuRGVzdGluYXRpb25UeXBlLkZJTEVfVVJJLFxuICAgICAgICBzb3VyY2VUeXBlIDogQ2FtZXJhLlBpY3R1cmVTb3VyY2VUeXBlLkNBTUVSQSxcbiAgICAgICAgYWxsb3dFZGl0IDogdHJ1ZSxcbiAgICAgICAgZW5jb2RpbmdUeXBlOiBDYW1lcmEuRW5jb2RpbmdUeXBlLlBORyxcbiAgICAgICAgLy8gdGFyZ2V0V2lkdGg6IDEwMCxcbiAgICAgICAgLy8gdGFyZ2V0SGVpZ2h0OiAxMDAsXG4gICAgICAgIHNhdmVUb1Bob3RvQWxidW06IGZhbHNlXG4gICAgICB9KTtcblxuICAgICAgZnVuY3Rpb24gdGFrZV9waG90b19zdWNjZXNzKGltZ3VybCkge1xuICAgICAgICB2bS5kYXRhW2l0ZW0uaWRdID0gYW5ndWxhci5leHRlbmQodm0uZGF0YVtpdGVtLmlkXSB8fCB7fSwge1xuICAgICAgICAgIGltYWdlOiBpbWd1cmwsXG4gICAgICAgICAgbmFtZTogaXRlbS5uYW1lXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZtLiRhcHBseSgpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiB0YWtlX3Bob3RvX2Vycm9yKCkge1xuICAgICAgICAkbG9nLmVycm9yKCfmi43nhaflpLHotKUsIOWIhuexuyAtICcgKyBwYXJ0Lm5hbWUgKyAnLCDpobkgLSAnICsgaXRlbS5uYW1lKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDml6XmnJ/mjqfku7bmmL7npLov6ZqQ6JePL+emgeeUqFxuICAgIHZtLmRwX3BhcmFtcyA9IHtcbiAgICAgIHNob3dXZWVrczogZmFsc2VcbiAgICB9O1xuICAgIGZ1bmN0aW9uIG9wZW5fZGF0ZXBpY2tlcigkZXZlbnQsIGRwKSB7XG4gICAgICAkZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgdm0uZHBfcGFyYW1zW2RwXSA9IHRydWU7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIHNob3dfdGFrZV9waG90byhpbmRleCwgcGFydCwgY2hlY2tfaXRlbSkge1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHNob3dfdGFrZV9waG90by5pc19zaG93IHx8IHBhcnNlSW50KHZtLmRhdGFbY2hlY2tfaXRlbS5pZF0ucmVzdWx0KSAhPT0gNSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHNob3dfdGFrZV9waG90by5pc19zaG93ID0gdHJ1ZTtcblxuICAgICAgICB2YXIgdGFrZV9waG90b19tb2RhbCA9ICRtb2RhbC5vcGVuKHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3JlcG9ydC90YWtlX3Bob3RvX21vZGFsLmh0bScsXG4gICAgICAgICAgY29udHJvbGxlcjogJ0l0ZW1UYWtlUGhvdG9DdHJsJyxcbiAgICAgICAgICBiYWNrZHJvcDogJ3N0YXRpYycsXG4gICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgaXRlbV9kZXRhaWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gYW5ndWxhci5leHRlbmQoe1xuICAgICAgICAgICAgICAgIHBhcnRfbmFtZTogcGFydC5uYW1lLFxuICAgICAgICAgICAgICAgIHBhcnRfYWxpYXM6IHBhcnQuYWxpYXMsXG4gICAgICAgICAgICAgICAgaW5kZXg6IGluZGV4XG4gICAgICAgICAgICAgIH0sIGNoZWNrX2l0ZW0sIHZtLmRhdGFbY2hlY2tfaXRlbS5pZF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGFrZV9waG90b19tb2RhbC5yZXN1bHQudGhlbihmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgYW5ndWxhci5leHRlbmQodm0uZGF0YVtjaGVja19pdGVtLmlkXSwgaXRlbSwge1xuICAgICAgICAgICAgbmFtZTogY2hlY2tfaXRlbS5uYW1lXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBzaG93X3Rha2VfcGhvdG8uaXNfc2hvdyA9IGZhbHNlO1xuICAgICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBzaG93X3Rha2VfcGhvdG8uaXNfc2hvdyA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHNob3dfdGFrZV9waG90by5pc19zaG93ID0gZmFsc2U7XG4gIH0pXG5cbiAgLmNvbnRyb2xsZXIoJ0l0ZW1JbnB1dERldGFpbEN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRsb2csICRtb2RhbEluc3RhbmNlLCBpdGVtX2RldGFpbCkge1xuICAgIHZhciB2bSA9ICRzY29wZTtcblxuICAgIGFuZ3VsYXIuZXh0ZW5kKHZtLCBpdGVtX2RldGFpbCk7XG5cbiAgICB2bS5zdWJtaXQgPSBzdWJtaXQ7XG4gICAgdm0uY2FuY2VsID0gY2FuY2VsO1xuICAgIHZtLnRha2VfcGhvdG8gPSB0YWtlX3Bob3RvO1xuICAgIHZtLnNob3dfcGhvdG8gPSBzaG93X3Bob3RvO1xuXG4gICAgZnVuY3Rpb24gc3VibWl0KCkge1xuICAgICAgJG1vZGFsSW5zdGFuY2UuY2xvc2Uoe1xuICAgICAgICBzdGF0ZTogdm0uc3RhdGUsXG4gICAgICAgIGRlZ3JlZTogdm0uZGVncmVlLFxuICAgICAgICBtZW1vOiB2bS5tZW1vLFxuICAgICAgICBpbWFnZTogdm0uaW1hZ2VcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNhbmNlbCgpIHtcbiAgICAgICRtb2RhbEluc3RhbmNlLmRpc21pc3MoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzaG93X3Bob3RvKGZpZWxkKSB7XG4gICAgICBGdWxsU2NyZWVuSW1hZ2Uuc2hvd0ltYWdlVVJMKHZtLmRhdGFbZmllbGQuaWRdLmltYWdlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0YWtlX3Bob3RvKCkge1xuICAgICAgbmF2aWdhdG9yLmNhbWVyYS5nZXRQaWN0dXJlKHRha2VfcGhvdG9fc3VjY2VzcywgdGFrZV9waG90b19lcnJvciwge1xuICAgICAgICBxdWFsaXR5IDogMTAwLFxuICAgICAgICBkZXN0aW5hdGlvblR5cGUgOiBDYW1lcmEuRGVzdGluYXRpb25UeXBlLkZJTEVfVVJJLFxuICAgICAgICBzb3VyY2VUeXBlIDogQ2FtZXJhLlBpY3R1cmVTb3VyY2VUeXBlLkNBTUVSQSxcbiAgICAgICAgYWxsb3dFZGl0IDogdHJ1ZSxcbiAgICAgICAgZW5jb2RpbmdUeXBlOiBDYW1lcmEuRW5jb2RpbmdUeXBlLlBORyxcbiAgICAgICAgLy8gdGFyZ2V0V2lkdGg6IDEwMCxcbiAgICAgICAgLy8gdGFyZ2V0SGVpZ2h0OiAxMDAsXG4gICAgICAgIHNhdmVUb1Bob3RvQWxidW06IGZhbHNlXG4gICAgICB9KTtcblxuICAgICAgZnVuY3Rpb24gdGFrZV9waG90b19zdWNjZXNzKGltZ3VybCkge1xuICAgICAgICB2bS5pbWFnZSA9IGltZ3VybDtcbiAgICAgICAgdm0uJGFwcGx5KCk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHRha2VfcGhvdG9fZXJyb3IoKSB7XG4gICAgICAgICRsb2cuZXJyb3IoJ+aLjeeFp+Wksei0pSwg5YiG57G7IC0gJyArIGl0ZW1fZGV0YWlsLnBhcnRfbmFtZSArICcsIOmhuSAtICcgKyBpdGVtX2RldGFpbC5uYW1lKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cbiAgLmNvbnRyb2xsZXIoJ0l0ZW1UYWtlUGhvdG9DdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkbG9nLCAkbW9kYWxJbnN0YW5jZSwgaXRlbV9kZXRhaWwpIHtcbiAgICAgIHZhciB2bSA9ICRzY29wZTtcblxuICAgICAgYW5ndWxhci5leHRlbmQodm0sIGl0ZW1fZGV0YWlsKTtcblxuICAgICAgdm0uc3VibWl0ID0gc3VibWl0O1xuICAgICAgdm0uY2FuY2VsID0gY2FuY2VsO1xuICAgICAgdm0udGFrZV9waG90byA9IHRha2VfcGhvdG87XG4gICAgICB2bS5zaG93X3Bob3RvID0gc2hvd19waG90bztcblxuICAgICAgZnVuY3Rpb24gc3VibWl0KCkge1xuICAgICAgICAkbW9kYWxJbnN0YW5jZS5jbG9zZSh7XG4gICAgICAgICAgaW1hZ2U6IHZtLmltYWdlXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBjYW5jZWwoKSB7XG4gICAgICAgICRtb2RhbEluc3RhbmNlLmRpc21pc3MoKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gc2hvd19waG90byhmaWVsZCkge1xuICAgICAgICBGdWxsU2NyZWVuSW1hZ2Uuc2hvd0ltYWdlVVJMKHZtLmRhdGFbZmllbGQuaWRdLmltYWdlKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gdGFrZV9waG90bygpIHtcbiAgICAgICAgbmF2aWdhdG9yLmNhbWVyYS5nZXRQaWN0dXJlKHRha2VfcGhvdG9fc3VjY2VzcywgdGFrZV9waG90b19lcnJvciwge1xuICAgICAgICAgIHF1YWxpdHkgOiAxMDAsXG4gICAgICAgICAgZGVzdGluYXRpb25UeXBlIDogQ2FtZXJhLkRlc3RpbmF0aW9uVHlwZS5GSUxFX1VSSSxcbiAgICAgICAgICBzb3VyY2VUeXBlIDogQ2FtZXJhLlBpY3R1cmVTb3VyY2VUeXBlLkNBTUVSQSxcbiAgICAgICAgICBhbGxvd0VkaXQgOiB0cnVlLFxuICAgICAgICAgIGVuY29kaW5nVHlwZTogQ2FtZXJhLkVuY29kaW5nVHlwZS5QTkcsXG4gICAgICAgICAgLy8gdGFyZ2V0V2lkdGg6IDEwMCxcbiAgICAgICAgICAvLyB0YXJnZXRIZWlnaHQ6IDEwMCxcbiAgICAgICAgICBzYXZlVG9QaG90b0FsYnVtOiBmYWxzZVxuICAgICAgICB9KTtcblxuICAgICAgICBmdW5jdGlvbiB0YWtlX3Bob3RvX3N1Y2Nlc3MoaW1ndXJsKSB7XG4gICAgICAgICAgdm0uaW1hZ2UgPSBpbWd1cmw7XG4gICAgICAgICAgdm0uJGFwcGx5KCk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiB0YWtlX3Bob3RvX2Vycm9yKCkge1xuICAgICAgICAgICRsb2cuZXJyb3IoJ+aLjeeFp+Wksei0pSwg5YiG57G7IC0gJyArIGl0ZW1fZGV0YWlsLnBhcnRfbmFtZSArICcsIOmhuSAtICcgKyBpdGVtX2RldGFpbC5uYW1lKTtcbiAgICAgICAgfVxuICAgICAgfVxuICB9KVxuXG4gIC5jb250cm9sbGVyKCdSZXBvcnRMaXN0Q3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJGxvY2F0aW9uLCBSZXBvcnRzU3ZjLCBJbmRlbnRFbnVtcywgdG9hc3RyKSB7XG4gICAgdmFyIHZtID0gJHNjb3BlO1xuICAgIHZhciBxc28gPSAkbG9jYXRpb24uc2VhcmNoKCk7XG5cbiAgICB2bS5wYWdlID0gcGFyc2VJbnQocXNvLnBhZ2UpIHx8IDE7XG4gICAgdm0uc2l6ZSA9IHBhcnNlSW50KHFzby5zaXplKSB8fCAyMDtcbiAgICB2bS5zaXplcyA9IEluZGVudEVudW1zLmxpc3QoJ3NpemUnKTtcbiAgICB2bS5zaXplX2l0ZW0gPSBJbmRlbnRFbnVtcy5pdGVtKCdzaXplJywgdm0uc2l6ZSk7XG5cbiAgICB2bS5zaXplX2NoYW5nZSA9IHNpemVfY2hhbmdlO1xuICAgIHZtLnBhZ2VfY2hhbmdlID0gcGFnZV9jaGFuZ2U7XG5cbiAgICBxdWVyeSgpO1xuXG4gICAgZnVuY3Rpb24gcXVlcnkoKSB7XG4gICAgICB2YXIgcGFyYW1zID0ge1xuICAgICAgICBpdGVtc19wYWdlOiB2bS5zaXplLFxuICAgICAgICBwYWdlOiB2bS5wYWdlLFxuICAgICAgfTtcbiAgICAgIFxuICAgICAgJGxvY2F0aW9uLnNlYXJjaChwYXJhbXMpO1xuXG4gICAgICBSZXBvcnRzU3ZjXG4gICAgICAgIC5xdWVyeShwYXJhbXMpXG4gICAgICAgIC4kcHJvbWlzZVxuICAgICAgICAudGhlbihmdW5jdGlvbihycykge1xuICAgICAgICAgIHJzLml0ZW1zLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgaXRlbS5zdGF0dXNfdGV4dCA9IEluZGVudEVudW1zLnRleHQoJ29yZGVyX3N0YXR1cycsIGl0ZW0uc3RhdHVzX2lkKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHZtLml0ZW1zID0gcnMuaXRlbXM7XG4gICAgICAgICAgdm0udG90YWxfY291bnQgPSBycy50b3RhbF9jb3VudDtcblxuICAgICAgICAgIHZhciB0bXAgPSBycy50b3RhbF9jb3VudCAvIHZtLnNpemU7XG4gICAgICAgICAgdm0ucGFnZV9jb3VudCA9IHJzLnRvdGFsX2NvdW50ICUgdm0uc2l6ZSA9PT0gMCA/IHRtcCA6IChNYXRoLmZsb29yKHRtcCkgKyAxKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIHRvYXN0ci5lcnJvcihyZXMubXNnIHx8ICfmn6Xor6LlpLHotKXvvIzmnI3liqHlmajlj5HnlJ/mnKrnn6XplJnor6/vvIzor7fph43or5UnKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8g5q+P6aG15p2h5pWw5pS55Y+YXG4gICAgZnVuY3Rpb24gc2l6ZV9jaGFuZ2Uoc2l6ZSkge1xuICAgICAgdm0uc2l6ZSA9IHNpemU7XG4gICAgICB2bS5wYWdlID0gMTtcblxuICAgICAgcXVlcnkoKTtcbiAgICB9XG5cbiAgICAvLyDnv7vpobVcbiAgICBmdW5jdGlvbiBwYWdlX2NoYW5nZShwYWdlKSB7XG4gICAgICB2bS5wYWdlID0gcGFnZTtcblxuICAgICAgcXVlcnkoKTtcbiAgICB9XG4gIH0pO1xuXG5cblxuXG5cbiIsImFuZ3VsYXJcbiAgLm1vZHVsZSgnZ3VsdS5yZXBvcnQuc3ZjcycsIFsnbmdSZXNvdXJjZSddKVxuXG4gIC5zZXJ2aWNlKCdSZXBvcnRzU3ZjJywgZnVuY3Rpb24oJHJlc291cmNlKSB7XG4gICAgcmV0dXJuICRyZXNvdXJjZShBUElfU0VSVkVSUy50ZXN0ZXIgKyAnL3JlcG9ydHMnLCB7fSwge1xuICAgICAgcXVlcnk6IHtcbiAgICAgICAgaXNBcnJheTogZmFsc2VcbiAgICAgIH1cbiAgICB9KTtcbiAgfSlcblxuICAuc2VydmljZSgnUmVwb3J0U3ZjJywgZnVuY3Rpb24oJHJlc291cmNlKSB7XG4gICAgcmV0dXJuICRyZXNvdXJjZShBUElfU0VSVkVSUy50ZXN0ZXIgKyAnL3JlcG9ydCcpO1xuICB9KTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=