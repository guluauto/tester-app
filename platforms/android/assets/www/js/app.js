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
    'gulu.report.svcs'
    // 'gulu.report.enums'
  ])
  .config(["$stateProvider", function($stateProvider) {
    $stateProvider
      .state('indents.input_report', {
        url: '/{indent_id:[0-9]+}/car/{car_id:[0-9]+}/report',
        templateUrl: 'report/input_dashboard.htm',
        controller: 'InputDashboardCtrl'
      })
      .state('indents.input_report.credential', {
        url: '/credential',
        templateUrl: 'report/input_credential.htm',
        controller: 'CredentialReportEditCtrl'
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
angular
  .module('httpInterceptors', [])

  .config(["$httpProvider", function($httpProvider) {
    $httpProvider.interceptors.push('httpInterceptor');
    
    // Angular $http isn’t appending the header X-Requested-With = XMLHttpRequest since Angular 1.3.0
    $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
  }])

  .factory('httpInterceptor', ["$q", "$rootScope", function($q, $rootScope) {
    return {
      // 请求前修改 request 配置
      'request': function(config) {
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
        return $q.reject(rejection);
      }
    };
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
        var all_preins = 'type channel brand series model status city tester role from'.split(' ');

        all_preins.forEach(function(key) {
          res[key].unshift({
            text: '全部',
            value: null
          });
        });

        return Enums(res.toJSON());
      })
      .catch(function(res) {
        toastr.error(res.msg || '获取枚举失败');
      });
}]);

angular
  .module('gulu.indent.svcs', ['ngResource'])

  .service('IndentEnumsSvc', ["$resource", function($resource) {
    return $resource(API_SERVERS.tester + '/enums');
  }])
  
  .service('IndentsSvc', ["$resource", function ($resource) {
    return $resource(API_SERVERS.tester + '/orders', {}, {
      query: {
        isArray: false
      }
    });
  }])

  .service('IndentSvc', ["$resource", function ($resource) {
    return $resource(API_SERVERS.tester + '/orders/:id', {
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

  .service('IndentApprovalSvc', ["$resource", function($resource) {
    return $resource(API_SERVERS.tester + '/orders/:id/approval', {
      id: '@id'
    });
  }])

  .service('UntestedIndentsSvc', ["$resource", function($resource) {
    return $resource(API_SERVERS.tester + '/orders/untested');
  }])

  .service('IndentCarsSvc', ["$resource", function($resource) {
    return $resource(API_SERVERS.tester + '/orders/:order_id/car', {
      order_id: '@order_id'
    })
  }])

  .service('IndentCarSvc', ["$resource", function($resource) {
    return $resource(API_SERVERS.tester + '/orders/:order_id/car/:car_id', {
      order_id: '@order_id',
      car_id: '@car_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }]);
/* global angular */
angular
  .module('gulu.indent')
  
  .controller('IndentListCtrl', ["$scope", "$location", "toastr", "$modal", "IndentsSvc", "IndentSvc", "IndentEnums", function($scope, $location, toastr, $modal,
    IndentsSvc, IndentSvc, IndentEnums) {
    var vm = $scope;
    var qso = $location.search();

    vm.status_id = parseInt(qso.status_id) || null;
    
    if (vm.$state.includes('indents.unconfirmed')) {
      vm.status_id = 4;
    } else {
      vm.city_id = parseInt(qso.city_id) || null;
      vm.tester_id = parseInt(qso.tester_id) || null;
      vm.role_id = parseInt(qso.role_id) || null;
      vm.mobile = qso.mobile || null;

      vm.status = IndentEnums.item('status', vm.status_id);
      vm.status_list = IndentEnums.list('status');
      vm.city = IndentEnums.item('city', vm.city_id);
      vm.city_list = IndentEnums.list('city');
      vm.role = IndentEnums.item('role', vm.role_id);
      vm.role_list = IndentEnums.list('role');
      vm.tester = IndentEnums.item('tester', vm.tester_id);
      vm.tester_list = IndentEnums.list('tester');

      watch_list('status', 'status_id');
      watch_list('city', 'city_id');
      watch_list('role', 'role_id');
      watch_list('tester', 'tester_id');

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
        size: vm.size,
        page: vm.page,

        status_id: vm.status_id
      };

      if (vm.$state.includes('indents.list')) {
        angular.extend(params, {
          city_id: vm.city_id,
          tester_id: vm.tester_id,
          role_id: vm.role_id,
          mobile: vm.mobile
        });
      }
      
      $location.search(params);

      IndentsSvc
        .query(params)
        .$promise
        .then(function(rs) {
          rs.items.forEach(function(item) {
            item.status_text = IndentEnums.text('status', item.status);
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
        IndentSvc
          .update({
            id: item.id
          }, {
            status: 5
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

      cancel_order_ins.result.then(function(tester) {
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

  .controller('UntestedIndentListCtrl', ["$scope", "$location", "toastr", "$modal", "UntestedIndentsSvc", "IndentCarSvc", "IndentEnums", function($scope, $location, toastr, $modal,
   UntestedIndentsSvc, IndentCarSvc, IndentEnums) {
    var vm = $scope;

    vm.cancel_order = cancel_order;
    vm.del_car = del_car;
    vm.edit_car = edit_car;

    query();

    function query() {
      return UntestedIndentsSvc
        .query()
        .$promise
        .then(function(res) {
          vm.items = res;
        })
        .catch(function(res) {
          toastr.error(res.msg || '获取待检测订单失败');
        });
    }

    // 加车 或 编辑车
    function edit_car(order_id, car) {
      var edit_car_ins = $modal.open({
        templateUrl: 'indent/edit_car.htm',
        controller: 'IndentCarEditCtrl',
        backdrop: 'static',
        resolve: {
          indent_info: function() {
            return {
              order_id: order_id,
              car: car
            };
          }
        }
      });

      edit_car_ins.result.then(function(tester) {
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
            toastr.success(res.msg || '删除车成功');

            query();
          })
          .catch(function(res) {
            toastr.error(res.msg || '删除车失败，请重试');
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

      cancel_order_ins.result.then(function(tester) {
        query();
      });
    }
  }])
  
  // 取消订单
  .controller('CancelOrderCtrl', ["$scope", "$modalInstance", "toastr", "IndentApprovalSvc", "indent_info", function($scope, $modalInstance, toastr, IndentApprovalSvc, indent_info) {
    var vm = $scope;

    angular.extend(vm, indent_info);

    vm.cancel_order = cancel_order;
    vm.cancel = cancel;

    function cancel_order() {
      vm.cancel_order_status = true;

      IndentApprovalSvc
        .save({
          id: indent_info.id
        }, {
          reason: vm.reason
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
            order_id: indent_info.order_id,
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
            order_id: indent_info.order_id
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
          toastr.success(res.msg || '登录成功，正在为你跳转...');

          $timeout(function() {
            $location.url('/indents');
          }, 2000);
        })
        .catch(function(res) {
          toastr.error(res.msg || '登录失败，请重试');
        });
    }
  }]);
angular
  .module('gulu.login.svcs', ['ngResource'])
  .service('LoginSvc', ["$resource", function ($resource) {
    return $resource(API_SERVERS.tester + '/user/login');
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


angular
  .module('gulu.report')

  .controller('InputDashboardCtrl', ["$scope", "$stateParams", "$templateCache", function($scope, $stateParams, $templateCache) {
    var vm = $scope;

    vm.parts = JSON.parse($templateCache.get('report/i.json'));
    // 不用展示照片
    vm.parts.pop();

    vm.toggle_nav_open = toggle_nav_open;

    function toggle_nav_open() {
      vm.test_step_nav_open = !vm.test_step_nav_open;
    }
  }])
  
  .controller('CredentialReportEditCtrl', ["$scope", "ReportInputer", function($scope, ReportInputer) {
    var vm = $scope;
    var fields = 'name,mobile,motor_no,vincode,engine_no,body_color,productive_time,car_attribute_to,transfer_times,annual_check_deadline,traffic_insurance_deadline,business_insurance_deadline,has_car_invoice,has_4s_maintenance';

    ReportInputer(vm, fields, 'credential');

    // 日期控件显示/隐藏/禁用
    vm.open_datepicker = function($event, dp) {
      $event.preventDefault();
      $event.stopPropagation();

      if (vm.input_after_ok) {
        return;
      }

      vm[dp] = true;
    };
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
      }
    });

    vm.parts.forEach(function(part) {
      part.items.forEach(function(item) {
        vm.data[item.id] = vm.data[item.id] || { image: null };
      });
    });

    // vm.$watch('data', function(data) {
    //   alert('data: ' + JSON.stringify(vm.data));

    //   vm.data = data;
    // }, true);

    vm.take_photo = take_photo;
    
    function get_part_name(part_id) {
      return part_json.find(function(part) { return part.id === part_id; }).name;
    }

    function take_photo(part, item) {
      // TODO:
      // set image data to local
      // init_data[part.id][item.id].image
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
        alert('success: ' + JSON.stringify(vm.data));
      }

      function take_photo_error() {
        console.log('error', arguments);
      }
    }
  }])

  .controller('ReportEditCtrl', ["$scope", "$log", "$stateParams", "$templateCache", "localStorageService", "$modal", function($scope, $log, $stateParams, $templateCache, localStorageService, $modal) {
    var vm = $scope;

    var current_part = $stateParams.part_id;
    var indent_id = $stateParams.indent_id;
    var car_id = $stateParams.car_id;
    // 表单项数据存储到本地的 key 的生成规则
    var store_key = [indent_id, car_id].join('_');
    var store_key_err = [store_key, 'err'].join('_');
    var init_data = localStorageService.get(store_key);

    // 获取报告输入项数据
    var parent_part = JSON.parse($templateCache.get('report/i.json')).find(function(part) { return part.id === current_part; });
    vm.parts = parent_part && parent_part.children;
    
    vm.data = {};
    // 设置初始化值
    angular.extend(vm.data, init_data && init_data[current_part] || {});

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
      var data = localStorageService.get(store_key) || {};
      data[current_part] = vm.data;

      localStorageService.set(store_key, data);

      $log.log('录入检测报告 - ' + store_key, data[current_part]);
    }

    function save_err() {
      var data = localStorageService.get(store_key_err) || {};
      var err_items = [];

      _.each(vm.data, function(item, key) {
        if (parseInt(item.result) === 0) {
          item.id = key;
          err_items.push(item);
        }
      });

      data[current_part] = err_items || [];

      localStorageService.set(store_key_err, data);

      $log.log('录入检测报告问题项 - ' + store_key_err, data[current_part]);
    }

    vm.show_detail = show_detail;
    vm.should_clear = should_clear;

    // 避免展示两次 modal
    var is_show_detail = false;
    function show_detail(index, part, check_item) {
      // change 事件发生在 click 之后
      setTimeout(function() {
        if (is_show_detail || parseInt(vm.data[check_item.id].result) !== 0) {
          return;
        }

        is_show_detail = true;

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

        input_detail_ins.result.then(
          function(item) {
            angular.extend(vm.data[check_item.id], item, {
              name: check_item.name
            });
            is_show_detail = false;
          },
          function() {
            is_show_detail = false;
          }
        );
      });
    }

    function should_clear(item) {
      // 若检测无问题，则清除之前填写的损伤数据
      if (parseInt(vm.data[item.id].result) !== 0) {
        vm.data[item.id].state = null;
        vm.data[item.id].degree = null;
        vm.data[item.id].memo = null;
        vm.data[item.id].image = null;
      }
    }
  }])

  .controller('ItemInputDetailCtrl', ["$scope", "$modalInstance", "item_detail", function($scope, $modalInstance, item_detail) {
    var vm = $scope;

    angular.extend(vm, item_detail);

    vm.submit = submit;
    vm.cancel = cancel;

    function submit() {
      $modalInstance.close({
        state: vm.state,
        degree: vm.degree,
        memo: vm.memo,
        // TODO:
        // 从照相机获取图片地址
        image: '/d/c/b/a.png'
      });
    }

    function cancel() {
      $modalInstance.dismiss();
    }
  }]);






angular
  .module('gulu.report.svcs', ['ngResource'])

  .service('ReportsSvc', ["$resource", function($resource) {
    return $resource('/reports');
  }]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImluZGVudC9pbmRlbnRfbW9kdWxlLmpzIiwibG9naW4vbG9naW5fbW9kdWxlLmpzIiwicmVwb3J0L3JlcG9ydF9tb2R1bGUuanMiLCJjb21wb25lbnQvY3VzdG9tLWRpcmVjdGl2ZS5qcyIsImNvbXBvbmVudC9jdXN0b20tZmlsdGVyLmpzIiwiY29tcG9uZW50L2RhdGUuanMiLCJjb21wb25lbnQvZW51bXMuanMiLCJjb21wb25lbnQvaHR0cC5qcyIsImNvbXBvbmVudC92bS5qcyIsImNvbXBvbmVudC96aC1jbi5qcyIsIjQwNC80MDRfY3RybC5qcyIsImluZGVudC9lbnVtcy5qcyIsImluZGVudC9pbmRlbnRfc3Zjcy5qcyIsImluZGVudC9saXN0X2N0cmwuanMiLCJsb2dpbi9sb2dpbl9jdHJsLmpzIiwibG9naW4vbG9naW5fc3Zjcy5qcyIsInJlcG9ydC9pbnB1dF9yZXBvcnQuanMiLCJyZXBvcnQvcmVwb3J0X2N0cmwuanMiLCJyZXBvcnQvcmVwb3J0X3N2Y3MuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztBQU1BO0dBQ0EsT0FBQSxRQUFBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTs7R0FFQSxrR0FBQSxTQUFBLG1CQUFBLG9CQUFBLGNBQUEsNkJBQUE7OztJQUdBO09BQ0EsVUFBQTtPQUNBLFdBQUE7OztJQUdBO09BQ0EsVUFBQTs7O0lBR0EsYUFBQSxhQUFBOzs7SUFHQTtPQUNBLFVBQUE7T0FDQSxVQUFBLE1BQUE7OztJQUdBLGNBQUE7TUFDQSxRQUFBOzs7O0dBSUEsMERBQUEsU0FBQSxZQUFBLFdBQUEsUUFBQSxjQUFBO0lBQ0EsSUFBQSxNQUFBOztJQUVBLFdBQUEsU0FBQTtJQUNBLFdBQUEsZUFBQTtJQUNBLFdBQUEsY0FBQTs7O0lBR0E7T0FDQSxPQUFBLFdBQUE7UUFDQSxPQUFBLFVBQUE7U0FDQSxTQUFBLFNBQUEsS0FBQTtRQUNBLElBQUEsUUFBQSxRQUFBLEtBQUEsUUFBQSxJQUFBLFFBQUEsS0FBQSxLQUFBO1VBQ0E7OztRQUdBLFdBQUEsVUFBQTs7O0lBR0EsV0FBQSxPQUFBLFdBQUE7TUFDQSxVQUFBLElBQUEsV0FBQTs7Ozs7QUNwRUE7R0FDQSxPQUFBLGVBQUE7SUFDQTtJQUNBO0lBQ0E7O0dBRUEsMEJBQUEsU0FBQSxnQkFBQTtJQUNBO09BQ0EsTUFBQSxXQUFBO1FBQ0EsVUFBQTtRQUNBLEtBQUE7UUFDQSxhQUFBO1FBQ0EsU0FBQTtVQUNBLGFBQUE7OztPQUdBLE1BQUEsZ0JBQUE7UUFDQSxLQUFBO1FBQ0EsYUFBQTtRQUNBLFlBQUE7O09BRUEsTUFBQSx1QkFBQTtRQUNBLEtBQUE7UUFDQSxhQUFBO1FBQ0EsWUFBQTs7T0FFQSxNQUFBLG9CQUFBO1FBQ0EsS0FBQTtRQUNBLGFBQUE7UUFDQSxZQUFBOzs7O0FDN0JBO0dBQ0EsT0FBQSxjQUFBO0lBQ0E7SUFDQTs7O0dBR0EsMEJBQUEsU0FBQSxnQkFBQTtJQUNBO09BQ0EsTUFBQSxTQUFBO1FBQ0EsS0FBQTtRQUNBLGFBQUE7UUFDQSxZQUFBOzs7O0FDWEE7R0FDQSxPQUFBLGVBQUE7SUFDQTtJQUNBO0lBQ0E7OztHQUdBLDBCQUFBLFNBQUEsZ0JBQUE7SUFDQTtPQUNBLE1BQUEsd0JBQUE7UUFDQSxLQUFBO1FBQ0EsYUFBQTtRQUNBLFlBQUE7O09BRUEsTUFBQSxtQ0FBQTtRQUNBLEtBQUE7UUFDQSxhQUFBO1FBQ0EsWUFBQTs7T0FFQSxNQUFBLDhCQUFBO1FBQ0EsS0FBQTtRQUNBLGFBQUE7UUFDQSxZQUFBOztPQUVBLE1BQUEsNkJBQUE7UUFDQSxLQUFBO1FBQ0EsYUFBQTtRQUNBLFlBQUE7Ozs7OztBQ3pCQTtHQUNBLE9BQUEscUJBQUE7R0FDQSxVQUFBLGdDQUFBLFNBQUEsVUFBQTtJQUNBLE9BQUE7TUFDQSxVQUFBO01BQ0EsTUFBQSxTQUFBLE9BQUEsU0FBQSxZQUFBO1FBQ0EsTUFBQSxPQUFBLFdBQUEsb0JBQUEsU0FBQSxPQUFBO1VBQ0EsUUFBQSxLQUFBLGlCQUFBLENBQUEsQ0FBQTs7Ozs7O0FDVEE7R0FDQSxPQUFBLGdCQUFBOztHQUVBLE9BQUEsVUFBQSxXQUFBO0lBQ0EsT0FBQSxTQUFBLEdBQUE7TUFDQSxJQUFBLEtBQUEsTUFBQTtRQUNBLE9BQUE7OztNQUdBLElBQUEsRUFBQSxRQUFBLFlBQUE7O01BRUEsSUFBQSxFQUFBLFNBQUEsR0FBQTtRQUNBLE9BQUE7OztNQUdBLElBQUEsS0FBQSxFQUFBLE1BQUE7O01BRUEsR0FBQSxPQUFBLEdBQUEsR0FBQTs7TUFFQSxJQUFBLEVBQUEsVUFBQSxHQUFBO1FBQ0EsR0FBQSxPQUFBLEdBQUEsR0FBQTs7O01BR0EsT0FBQSxHQUFBLEtBQUE7Ozs7QUN2QkE7R0FDQSxPQUFBLGFBQUE7R0FDQSxRQUFBLFlBQUEsWUFBQTtJQUNBLElBQUEsV0FBQSxVQUFBLE1BQUEsR0FBQTtNQUNBLE9BQUEsS0FBQSxnQkFBQSxLQUFBLEtBQUEsYUFBQSxLQUFBLElBQUEsS0FBQTs7O0lBR0EsT0FBQTtNQUNBLG1CQUFBLFVBQUEsTUFBQTtRQUNBLE9BQUEsU0FBQSxNQUFBOzs7TUFHQSxtQkFBQSxTQUFBLE1BQUE7UUFDQSxJQUFBLElBQUEsS0FBQTtRQUNBLElBQUEsSUFBQSxLQUFBOztRQUVBLElBQUEsSUFBQSxJQUFBO1VBQ0EsSUFBQSxNQUFBOzs7UUFHQSxJQUFBLElBQUEsSUFBQTtVQUNBLElBQUEsTUFBQTs7O1FBR0EsT0FBQSxDQUFBLFNBQUEsTUFBQSxNQUFBLElBQUEsTUFBQSxHQUFBLEtBQUE7Ozs7O0FDdkJBO0dBQ0EsT0FBQSxjQUFBO0dBQ0EsUUFBQSxTQUFBLFlBQUE7SUFDQSxPQUFBLFVBQUEsT0FBQTtNQUNBLE9BQUE7UUFDQSxLQUFBLFVBQUEsTUFBQSxNQUFBO1VBQ0EsT0FBQSxNQUFBLE1BQUEsS0FBQSxVQUFBLE1BQUE7WUFDQSxPQUFBLEtBQUEsU0FBQTthQUNBOztRQUVBLE1BQUEsVUFBQSxNQUFBLEtBQUE7VUFDQSxPQUFBLE1BQUEsTUFBQSxLQUFBLFVBQUEsTUFBQTtZQUNBLE9BQUEsS0FBQSxVQUFBO2FBQ0E7O1FBRUEsTUFBQSxVQUFBLE1BQUEsS0FBQTtVQUNBLE9BQUEsTUFBQSxNQUFBLEtBQUEsVUFBQSxNQUFBO1lBQ0EsT0FBQSxLQUFBLFVBQUE7OztRQUdBLFdBQUEsU0FBQSxNQUFBLE1BQUE7VUFDQSxPQUFBLE1BQUEsTUFBQSxLQUFBLFNBQUEsTUFBQTtZQUNBLE9BQUEsS0FBQSxTQUFBOzs7UUFHQSxNQUFBLFVBQUEsTUFBQTtVQUNBLE9BQUEsTUFBQTs7UUFFQSxPQUFBLFVBQUEsTUFBQSxNQUFBO1VBQ0EsT0FBQSxNQUFBLE1BQUEsT0FBQSxVQUFBLE1BQUE7WUFDQSxPQUFBLEtBQUEsUUFBQSxLQUFBLFdBQUEsQ0FBQTs7Ozs7O0FDL0JBO0dBQ0EsT0FBQSxvQkFBQTs7R0FFQSx5QkFBQSxTQUFBLGVBQUE7SUFDQSxjQUFBLGFBQUEsS0FBQTs7O0lBR0EsY0FBQSxTQUFBLFFBQUEsT0FBQSxzQkFBQTs7O0dBR0EsUUFBQSx3Q0FBQSxTQUFBLElBQUEsWUFBQTtJQUNBLE9BQUE7O01BRUEsV0FBQSxTQUFBLFFBQUE7O1FBRUEsSUFBQSxPQUFBLElBQUEsUUFBQSxZQUFBLENBQUEsS0FBQSxPQUFBLElBQUEsUUFBQSxXQUFBLENBQUEsR0FBQTtVQUNBLE9BQUE7OztRQUdBLE9BQUEsTUFBQSxPQUFBLE1BQUEsUUFBQSxJQUFBLE9BQUE7O1FBRUEsT0FBQTs7OztNQUlBLGdCQUFBLFNBQUEsV0FBQTtRQUNBLE9BQUEsR0FBQSxPQUFBOzs7Ozs7Ozs7TUFTQSxZQUFBLFNBQUEsVUFBQTs7UUFFQSxJQUFBLE1BQUE7O1FBRUEsSUFBQSxRQUFBLFNBQUEsU0FBQSxPQUFBO1VBQ0EsT0FBQSxTQUFBLEtBQUE7VUFDQSxPQUFBLFNBQUEsS0FBQTs7Ozs7VUFLQSxJQUFBLFNBQUEsS0FBQTtZQUNBLE9BQUEsR0FBQSxPQUFBOzs7Ozs7VUFNQSxJQUFBLFFBQUEsTUFBQTtZQUNBLFNBQUEsT0FBQTs7Ozs7Ozs7O1FBU0EsT0FBQTs7OztNQUlBLGlCQUFBLFNBQUEsV0FBQTtRQUNBLE9BQUEsR0FBQSxPQUFBOzs7OztBQ25FQTtHQUNBLE9BQUEsV0FBQTtHQUNBLFFBQUEsZUFBQSxVQUFBLE1BQUE7SUFDQSxPQUFBO01BQ0EsU0FBQSxTQUFBLElBQUEsUUFBQTtRQUNBLElBQUEsTUFBQTs7UUFFQSxJQUFBLFFBQUEsU0FBQSxTQUFBO1VBQ0EsU0FBQSxPQUFBLE1BQUE7OztRQUdBLElBQUEsT0FBQSxXQUFBLEtBQUEsT0FBQSxPQUFBLElBQUE7VUFDQSxLQUFBLEtBQUE7VUFDQTs7O1FBR0EsSUFBQSxDQUFBLFFBQUEsUUFBQSxTQUFBO1VBQ0EsS0FBQSxNQUFBO1VBQ0E7OztRQUdBLE9BQUEsSUFBQSxTQUFBLE9BQUE7VUFDQSxPQUFBLElBQUEsU0FBQSxHQUFBOzs7UUFHQSxPQUFBOzs7O0FDMUJBO0FBQ0EsUUFBQSxPQUFBLFlBQUEsSUFBQSxDQUFBLFlBQUEsU0FBQSxVQUFBO0VBQ0EsSUFBQSxrQkFBQTtJQUNBLE1BQUE7SUFDQSxLQUFBO0lBQ0EsS0FBQTtJQUNBLEtBQUE7SUFDQSxNQUFBO0lBQ0EsT0FBQTs7RUFFQSxTQUFBLE1BQUEsV0FBQTtJQUNBLG9CQUFBO01BQ0EsU0FBQTtRQUNBO1FBQ0E7O01BRUEsT0FBQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBOztNQUVBLFNBQUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7O01BRUEsWUFBQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBOztNQUVBLGNBQUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7O01BRUEsWUFBQTtNQUNBLFlBQUE7TUFDQSxVQUFBO01BQ0EsY0FBQTtNQUNBLGNBQUE7TUFDQSxTQUFBO01BQ0EsYUFBQTtNQUNBLGFBQUE7O0lBRUEsa0JBQUE7TUFDQSxnQkFBQTtNQUNBLGVBQUE7TUFDQSxhQUFBO01BQ0EsWUFBQSxDQUFBO1FBQ0EsU0FBQTtRQUNBLFVBQUE7UUFDQSxXQUFBO1FBQ0EsV0FBQTtRQUNBLFdBQUE7UUFDQSxVQUFBO1FBQ0EsVUFBQTtRQUNBLFVBQUE7UUFDQSxVQUFBO1FBQ0EsVUFBQTtTQUNBO1FBQ0EsU0FBQTtRQUNBLFVBQUE7UUFDQSxXQUFBO1FBQ0EsV0FBQTtRQUNBLFdBQUE7UUFDQSxVQUFBO1FBQ0EsVUFBQTtRQUNBLFVBQUE7UUFDQSxVQUFBO1FBQ0EsVUFBQTs7O0lBR0EsTUFBQTtJQUNBLGFBQUEsU0FBQSxHQUFBO01BQ0EsT0FBQSxnQkFBQTs7Ozs7Ozs7O0FDakdBO0dBQ0EsT0FBQSxnQkFBQSxDQUFBOzs7R0FHQSwwQkFBQSxVQUFBLGdCQUFBO0lBQ0E7T0FDQSxNQUFBLFdBQUE7UUFDQSxLQUFBO1FBQ0EsYUFBQTtRQUNBLFlBQUE7Ozs7O0dBS0EsV0FBQSwwQkFBQSxVQUFBLFFBQUE7SUFDQSxRQUFBLElBQUE7Ozs7O0FDbkJBO0dBQ0EsT0FBQSxxQkFBQSxDQUFBOztDQUVBLFFBQUEscURBQUEsU0FBQSxPQUFBLGdCQUFBLFFBQUE7RUFDQSxPQUFBO09BQ0E7T0FDQTtPQUNBLEtBQUEsU0FBQSxLQUFBO1FBQ0EsSUFBQSxhQUFBLCtEQUFBLE1BQUE7O1FBRUEsV0FBQSxRQUFBLFNBQUEsS0FBQTtVQUNBLElBQUEsS0FBQSxRQUFBO1lBQ0EsTUFBQTtZQUNBLE9BQUE7Ozs7UUFJQSxPQUFBLE1BQUEsSUFBQTs7T0FFQSxNQUFBLFNBQUEsS0FBQTtRQUNBLE9BQUEsTUFBQSxJQUFBLE9BQUE7Ozs7QUNwQkE7R0FDQSxPQUFBLG9CQUFBLENBQUE7O0dBRUEsUUFBQSxnQ0FBQSxTQUFBLFdBQUE7SUFDQSxPQUFBLFVBQUEsWUFBQSxTQUFBOzs7R0FHQSxRQUFBLDRCQUFBLFVBQUEsV0FBQTtJQUNBLE9BQUEsVUFBQSxZQUFBLFNBQUEsV0FBQSxJQUFBO01BQ0EsT0FBQTtRQUNBLFNBQUE7Ozs7O0dBS0EsUUFBQSwyQkFBQSxVQUFBLFdBQUE7SUFDQSxPQUFBLFVBQUEsWUFBQSxTQUFBLGVBQUE7TUFDQSxJQUFBO09BQ0E7TUFDQSxRQUFBO1FBQ0EsUUFBQTs7Ozs7R0FLQSxRQUFBLDRCQUFBLFNBQUEsV0FBQTtJQUNBLE9BQUEsVUFBQSxZQUFBLFNBQUEsWUFBQSxJQUFBO01BQ0EsT0FBQTtRQUNBLFNBQUE7Ozs7O0dBS0EsUUFBQSxtQ0FBQSxTQUFBLFdBQUE7SUFDQSxPQUFBLFVBQUEsWUFBQSxTQUFBLHdCQUFBO01BQ0EsSUFBQTs7OztHQUlBLFFBQUEsb0NBQUEsU0FBQSxXQUFBO0lBQ0EsT0FBQSxVQUFBLFlBQUEsU0FBQTs7O0dBR0EsUUFBQSwrQkFBQSxTQUFBLFdBQUE7SUFDQSxPQUFBLFVBQUEsWUFBQSxTQUFBLHlCQUFBO01BQ0EsVUFBQTs7OztHQUlBLFFBQUEsOEJBQUEsU0FBQSxXQUFBO0lBQ0EsT0FBQSxVQUFBLFlBQUEsU0FBQSxpQ0FBQTtNQUNBLFVBQUE7TUFDQSxRQUFBO09BQ0E7TUFDQSxRQUFBO1FBQ0EsUUFBQTs7Ozs7QUN0REE7R0FDQSxPQUFBOztHQUVBLFdBQUEsd0dBQUEsU0FBQSxRQUFBLFdBQUEsUUFBQTtJQUNBLFlBQUEsV0FBQSxhQUFBO0lBQ0EsSUFBQSxLQUFBO0lBQ0EsSUFBQSxNQUFBLFVBQUE7O0lBRUEsR0FBQSxZQUFBLFNBQUEsSUFBQSxjQUFBOztJQUVBLElBQUEsR0FBQSxPQUFBLFNBQUEsd0JBQUE7TUFDQSxHQUFBLFlBQUE7V0FDQTtNQUNBLEdBQUEsVUFBQSxTQUFBLElBQUEsWUFBQTtNQUNBLEdBQUEsWUFBQSxTQUFBLElBQUEsY0FBQTtNQUNBLEdBQUEsVUFBQSxTQUFBLElBQUEsWUFBQTtNQUNBLEdBQUEsU0FBQSxJQUFBLFVBQUE7O01BRUEsR0FBQSxTQUFBLFlBQUEsS0FBQSxVQUFBLEdBQUE7TUFDQSxHQUFBLGNBQUEsWUFBQSxLQUFBO01BQ0EsR0FBQSxPQUFBLFlBQUEsS0FBQSxRQUFBLEdBQUE7TUFDQSxHQUFBLFlBQUEsWUFBQSxLQUFBO01BQ0EsR0FBQSxPQUFBLFlBQUEsS0FBQSxRQUFBLEdBQUE7TUFDQSxHQUFBLFlBQUEsWUFBQSxLQUFBO01BQ0EsR0FBQSxTQUFBLFlBQUEsS0FBQSxVQUFBLEdBQUE7TUFDQSxHQUFBLGNBQUEsWUFBQSxLQUFBOztNQUVBLFdBQUEsVUFBQTtNQUNBLFdBQUEsUUFBQTtNQUNBLFdBQUEsUUFBQTtNQUNBLFdBQUEsVUFBQTs7TUFFQSxHQUFBLFNBQUE7OztJQUdBLEdBQUEsT0FBQSxTQUFBLElBQUEsU0FBQTtJQUNBLEdBQUEsT0FBQSxTQUFBLElBQUEsU0FBQTtJQUNBLEdBQUEsUUFBQSxZQUFBLEtBQUE7SUFDQSxHQUFBLFlBQUEsWUFBQSxLQUFBLFFBQUEsR0FBQTs7SUFFQSxHQUFBLGNBQUE7SUFDQSxHQUFBLGNBQUE7SUFDQSxHQUFBLGVBQUE7SUFDQSxHQUFBLGdCQUFBOztJQUVBOztJQUVBLFNBQUEsUUFBQTtNQUNBLElBQUEsU0FBQTtRQUNBLE1BQUEsR0FBQTtRQUNBLE1BQUEsR0FBQTs7UUFFQSxXQUFBLEdBQUE7OztNQUdBLElBQUEsR0FBQSxPQUFBLFNBQUEsaUJBQUE7UUFDQSxRQUFBLE9BQUEsUUFBQTtVQUNBLFNBQUEsR0FBQTtVQUNBLFdBQUEsR0FBQTtVQUNBLFNBQUEsR0FBQTtVQUNBLFFBQUEsR0FBQTs7OztNQUlBLFVBQUEsT0FBQTs7TUFFQTtTQUNBLE1BQUE7U0FDQTtTQUNBLEtBQUEsU0FBQSxJQUFBO1VBQ0EsR0FBQSxNQUFBLFFBQUEsU0FBQSxNQUFBO1lBQ0EsS0FBQSxjQUFBLFlBQUEsS0FBQSxVQUFBLEtBQUE7OztVQUdBLEdBQUEsUUFBQSxHQUFBO1VBQ0EsR0FBQSxjQUFBLEdBQUE7O1VBRUEsSUFBQSxNQUFBLEdBQUEsY0FBQSxHQUFBO1VBQ0EsR0FBQSxhQUFBLEdBQUEsY0FBQSxHQUFBLFNBQUEsSUFBQSxPQUFBLEtBQUEsTUFBQSxPQUFBOztTQUVBLE1BQUEsU0FBQSxLQUFBO1VBQ0EsT0FBQSxNQUFBLElBQUEsS0FBQSxPQUFBOzs7O0lBSUEsU0FBQSxXQUFBLE1BQUEsT0FBQTtNQUNBLEdBQUEsT0FBQSxNQUFBLFNBQUEsTUFBQTtRQUNBLElBQUEsQ0FBQSxNQUFBO1VBQ0E7OztRQUdBLEdBQUEsU0FBQSxLQUFBOzs7OztJQUtBLFNBQUEsY0FBQSxNQUFBO01BQ0EsSUFBQSxRQUFBLGFBQUE7UUFDQTtXQUNBLE9BQUE7WUFDQSxJQUFBLEtBQUE7YUFDQTtZQUNBLFFBQUE7O1dBRUE7V0FDQSxLQUFBLFNBQUEsS0FBQTtZQUNBLE9BQUEsUUFBQSxJQUFBLE9BQUE7O1lBRUE7O1dBRUEsTUFBQSxTQUFBLEtBQUE7WUFDQSxPQUFBLE1BQUEsSUFBQSxPQUFBOzs7Ozs7SUFNQSxTQUFBLGFBQUEsTUFBQTtNQUNBLElBQUEsbUJBQUEsT0FBQSxLQUFBO1FBQ0EsYUFBQTtRQUNBLFlBQUE7UUFDQSxVQUFBO1FBQ0EsU0FBQTtVQUNBLGFBQUEsV0FBQTtZQUNBLE9BQUE7Ozs7O01BS0EsaUJBQUEsT0FBQSxLQUFBLFNBQUEsUUFBQTs7O1FBR0E7Ozs7O0lBS0EsU0FBQSxZQUFBLE1BQUE7TUFDQSxHQUFBLE9BQUE7TUFDQSxHQUFBLE9BQUE7O01BRUE7Ozs7SUFJQSxTQUFBLFlBQUEsTUFBQTtNQUNBLEdBQUEsT0FBQTs7TUFFQTs7OztJQUlBLFNBQUEsU0FBQTtNQUNBLEdBQUEsT0FBQTs7TUFFQTs7OztHQUlBLFdBQUEsMkhBQUEsU0FBQSxRQUFBLFdBQUEsUUFBQTtHQUNBLG9CQUFBLGNBQUEsYUFBQTtJQUNBLElBQUEsS0FBQTs7SUFFQSxHQUFBLGVBQUE7SUFDQSxHQUFBLFVBQUE7SUFDQSxHQUFBLFdBQUE7O0lBRUE7O0lBRUEsU0FBQSxRQUFBO01BQ0EsT0FBQTtTQUNBO1NBQ0E7U0FDQSxLQUFBLFNBQUEsS0FBQTtVQUNBLEdBQUEsUUFBQTs7U0FFQSxNQUFBLFNBQUEsS0FBQTtVQUNBLE9BQUEsTUFBQSxJQUFBLE9BQUE7Ozs7O0lBS0EsU0FBQSxTQUFBLFVBQUEsS0FBQTtNQUNBLElBQUEsZUFBQSxPQUFBLEtBQUE7UUFDQSxhQUFBO1FBQ0EsWUFBQTtRQUNBLFVBQUE7UUFDQSxTQUFBO1VBQ0EsYUFBQSxXQUFBO1lBQ0EsT0FBQTtjQUNBLFVBQUE7Y0FDQSxLQUFBOzs7Ozs7TUFNQSxhQUFBLE9BQUEsS0FBQSxTQUFBLFFBQUE7UUFDQTs7Ozs7SUFLQSxTQUFBLFFBQUEsVUFBQSxLQUFBO01BQ0EsSUFBQSxRQUFBLFdBQUEsQ0FBQSxJQUFBLE9BQUEsSUFBQSxRQUFBLElBQUEsT0FBQSxLQUFBLE9BQUEsTUFBQTtRQUNBLE9BQUE7V0FDQSxPQUFBO1lBQ0EsVUFBQTtZQUNBLFFBQUEsSUFBQTs7V0FFQTtXQUNBLEtBQUEsU0FBQSxLQUFBO1lBQ0EsT0FBQSxRQUFBLElBQUEsT0FBQTs7WUFFQTs7V0FFQSxNQUFBLFNBQUEsS0FBQTtZQUNBLE9BQUEsTUFBQSxJQUFBLE9BQUE7Ozs7OztJQU1BLFNBQUEsYUFBQSxNQUFBO01BQ0EsSUFBQSxtQkFBQSxPQUFBLEtBQUE7UUFDQSxhQUFBO1FBQ0EsWUFBQTtRQUNBLFVBQUE7UUFDQSxTQUFBO1VBQ0EsYUFBQSxXQUFBO1lBQ0EsT0FBQTs7Ozs7TUFLQSxpQkFBQSxPQUFBLEtBQUEsU0FBQSxRQUFBO1FBQ0E7Ozs7OztHQU1BLFdBQUEsOEZBQUEsU0FBQSxRQUFBLGdCQUFBLFFBQUEsbUJBQUEsYUFBQTtJQUNBLElBQUEsS0FBQTs7SUFFQSxRQUFBLE9BQUEsSUFBQTs7SUFFQSxHQUFBLGVBQUE7SUFDQSxHQUFBLFNBQUE7O0lBRUEsU0FBQSxlQUFBO01BQ0EsR0FBQSxzQkFBQTs7TUFFQTtTQUNBLEtBQUE7VUFDQSxJQUFBLFlBQUE7V0FDQTtVQUNBLFFBQUEsR0FBQTs7U0FFQTtTQUNBLEtBQUEsU0FBQSxLQUFBO1VBQ0EsT0FBQSxRQUFBLElBQUEsT0FBQTs7VUFFQSxlQUFBOztTQUVBLE1BQUEsU0FBQSxLQUFBO1VBQ0EsR0FBQSxzQkFBQTs7VUFFQSxPQUFBLE1BQUEsSUFBQSxPQUFBOzs7O0lBSUEsU0FBQSxTQUFBO01BQ0EsZUFBQTs7Ozs7R0FLQSxXQUFBLDJIQUFBLFNBQUEsUUFBQSxnQkFBQSxRQUFBO0lBQ0EsY0FBQSxhQUFBLGFBQUE7SUFDQSxJQUFBLEtBQUE7O0lBRUEsR0FBQSxhQUFBLFlBQUEsS0FBQTtJQUNBLEdBQUEsY0FBQSxZQUFBLEtBQUE7SUFDQSxHQUFBLGFBQUEsWUFBQSxLQUFBOztJQUVBLElBQUEsWUFBQSxLQUFBO01BQ0EsR0FBQSxRQUFBOztNQUVBLFlBQUEsU0FBQSxZQUFBLElBQUE7TUFDQSxZQUFBLFVBQUEsWUFBQSxJQUFBO01BQ0EsWUFBQSxTQUFBLFlBQUEsSUFBQTtXQUNBO01BQ0EsR0FBQSxRQUFBOzs7SUFHQSxHQUFBLFNBQUE7SUFDQSxHQUFBLFNBQUE7O0lBRUEsU0FBQSxTQUFBO01BQ0EsSUFBQSxZQUFBLEtBQUE7UUFDQTtXQUNBLE9BQUE7WUFDQSxVQUFBLFlBQUE7WUFDQSxRQUFBLFlBQUEsSUFBQTthQUNBO1lBQ0EsT0FBQSxHQUFBLE1BQUE7WUFDQSxRQUFBLEdBQUEsTUFBQTtZQUNBLE9BQUEsR0FBQSxNQUFBOztXQUVBO1dBQ0EsS0FBQSxTQUFBLEtBQUE7WUFDQSxPQUFBLFFBQUEsSUFBQSxPQUFBOztZQUVBLGVBQUE7O1dBRUEsTUFBQSxTQUFBLEtBQUE7WUFDQSxPQUFBLE1BQUEsSUFBQSxPQUFBOzthQUVBO1FBQ0E7V0FDQSxLQUFBO1lBQ0EsVUFBQSxZQUFBO2FBQ0E7WUFDQSxPQUFBLEdBQUEsTUFBQTtZQUNBLFFBQUEsR0FBQSxNQUFBO1lBQ0EsT0FBQSxHQUFBLE1BQUE7O1dBRUE7V0FDQSxLQUFBLFNBQUEsS0FBQTtZQUNBLE9BQUEsUUFBQSxJQUFBLE9BQUE7O1lBRUEsZUFBQTs7V0FFQSxNQUFBLFNBQUEsS0FBQTtZQUNBLE9BQUEsTUFBQSxJQUFBLE9BQUE7Ozs7O0lBS0EsU0FBQSxZQUFBLFdBQUEsT0FBQTtNQUNBLEdBQUEsYUFBQSxZQUFBLFVBQUEsV0FBQTs7O0lBR0EsU0FBQSxTQUFBO01BQ0EsZUFBQTs7Ozs7O0FDMVZBO0dBQ0EsT0FBQTs7R0FFQSxXQUFBLDZFQUFBLFVBQUEsUUFBQSxJQUFBLFdBQUEsVUFBQSxRQUFBLFVBQUE7SUFDQSxJQUFBLEtBQUE7O0lBRUEsR0FBQSxRQUFBOztJQUVBLFNBQUEsUUFBQTtNQUNBLE9BQUE7U0FDQSxLQUFBO1VBQ0EsUUFBQSxHQUFBO1VBQ0EsVUFBQSxHQUFBOztTQUVBO1NBQ0EsS0FBQSxTQUFBLEtBQUE7VUFDQSxPQUFBLFFBQUEsSUFBQSxPQUFBOztVQUVBLFNBQUEsV0FBQTtZQUNBLFVBQUEsSUFBQTthQUNBOztTQUVBLE1BQUEsU0FBQSxLQUFBO1VBQ0EsT0FBQSxNQUFBLElBQUEsT0FBQTs7OztBQ3ZCQTtHQUNBLE9BQUEsbUJBQUEsQ0FBQTtHQUNBLFFBQUEsMEJBQUEsVUFBQSxXQUFBO0lBQ0EsT0FBQSxVQUFBLFlBQUEsU0FBQTs7QUNIQTtHQUNBLE9BQUE7O0dBRUEsUUFBQSxvRkFBQSxTQUFBLE1BQUEsY0FBQSxXQUFBLElBQUEscUJBQUE7SUFDQSxPQUFBLFNBQUEsSUFBQSxRQUFBLGFBQUE7TUFDQSxJQUFBLFlBQUEsYUFBQTtNQUNBLElBQUEsU0FBQSxhQUFBOztNQUVBLElBQUEsWUFBQSxDQUFBLFdBQUEsUUFBQSxLQUFBOztNQUVBLElBQUEsWUFBQSxvQkFBQSxJQUFBOztNQUVBLFFBQUEsT0FBQSxJQUFBLGFBQUEsVUFBQSxnQkFBQTs7O01BR0EsU0FBQSxPQUFBO1FBQ0EsSUFBQSxPQUFBLG9CQUFBLElBQUEsY0FBQTtRQUNBLEtBQUEsZUFBQSxHQUFBLFFBQUEsSUFBQTs7UUFFQSxvQkFBQSxJQUFBLFdBQUE7O1FBRUEsS0FBQSxJQUFBLGNBQUEsV0FBQSxLQUFBOzs7TUFHQSxJQUFBLFFBQUEsVUFBQSxNQUFBOzs7TUFHQSxHQUFBLElBQUEsd0JBQUEsV0FBQTtRQUNBLFVBQUEsT0FBQTs7Ozs7O0FDNUJBO0dBQ0EsT0FBQTs7R0FFQSxXQUFBLG1FQUFBLFNBQUEsUUFBQSxjQUFBLGdCQUFBO0lBQ0EsSUFBQSxLQUFBOztJQUVBLEdBQUEsUUFBQSxLQUFBLE1BQUEsZUFBQSxJQUFBOztJQUVBLEdBQUEsTUFBQTs7SUFFQSxHQUFBLGtCQUFBOztJQUVBLFNBQUEsa0JBQUE7TUFDQSxHQUFBLHFCQUFBLENBQUEsR0FBQTs7OztHQUlBLFdBQUEsd0RBQUEsU0FBQSxRQUFBLGVBQUE7SUFDQSxJQUFBLEtBQUE7SUFDQSxJQUFBLFNBQUE7O0lBRUEsY0FBQSxJQUFBLFFBQUE7OztJQUdBLEdBQUEsa0JBQUEsU0FBQSxRQUFBLElBQUE7TUFDQSxPQUFBO01BQ0EsT0FBQTs7TUFFQSxJQUFBLEdBQUEsZ0JBQUE7UUFDQTs7O01BR0EsR0FBQSxNQUFBOzs7O0dBSUEsV0FBQSxtR0FBQSxTQUFBLFFBQUEsTUFBQSxjQUFBLGdCQUFBLHFCQUFBO0lBQ0EsSUFBQSxLQUFBOztJQUVBLElBQUEsZUFBQTtJQUNBLElBQUEsWUFBQSxhQUFBO0lBQ0EsSUFBQSxTQUFBLGFBQUE7O0lBRUEsSUFBQSxZQUFBLENBQUEsV0FBQSxRQUFBLEtBQUE7SUFDQSxJQUFBLGdCQUFBLENBQUEsV0FBQSxPQUFBLEtBQUE7SUFDQSxJQUFBLFlBQUEsb0JBQUEsSUFBQTs7SUFFQSxJQUFBLFlBQUEsS0FBQSxNQUFBLGVBQUEsSUFBQTtJQUNBLElBQUEsY0FBQSxVQUFBLEtBQUEsU0FBQSxNQUFBO01BQ0EsT0FBQSxLQUFBLE9BQUE7O0lBRUEsR0FBQSxRQUFBLGVBQUEsWUFBQTs7SUFFQSxHQUFBLE9BQUE7O0lBRUEsUUFBQSxPQUFBLEdBQUEsTUFBQSxhQUFBLFVBQUEsaUJBQUE7O0lBRUEsSUFBQSxpQkFBQSxvQkFBQSxJQUFBO0lBQ0EsR0FBQSxjQUFBLEVBQUEsSUFBQSxnQkFBQSxTQUFBLE1BQUEsS0FBQTtNQUNBLE9BQUE7UUFDQSxJQUFBO1FBQ0EsTUFBQSxjQUFBO1FBQ0EsUUFBQTs7OztJQUlBLEdBQUEsTUFBQSxRQUFBLFNBQUEsTUFBQTtNQUNBLEtBQUEsTUFBQSxRQUFBLFNBQUEsTUFBQTtRQUNBLEdBQUEsS0FBQSxLQUFBLE1BQUEsR0FBQSxLQUFBLEtBQUEsT0FBQSxFQUFBLE9BQUE7Ozs7Ozs7Ozs7SUFVQSxHQUFBLGFBQUE7O0lBRUEsU0FBQSxjQUFBLFNBQUE7TUFDQSxPQUFBLFVBQUEsS0FBQSxTQUFBLE1BQUEsRUFBQSxPQUFBLEtBQUEs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QSxJQUFBLE9BQUE7UUFDQSxHQUFBLEtBQUEsS0FBQSxJQUFBLFFBQUE7Ozs7O0dBS0EsV0FBQSxtRUFBQSxTQUFBLFFBQUEsZ0JBQUEsYUFBQTtJQUNBLElBQUEsS0FBQTs7SUFFQSxRQUFBLE9BQUEsSUFBQTs7SUFFQSxHQUFBLFNBQUE7SUFDQSxHQUFBLFNBQUE7O0lBRUEsU0FBQSxTQUFBO01BQ0EsZUFBQSxNQUFBO1FBQ0EsT0FBQSxHQUFBO1FBQ0EsUUFBQSxHQUFBO1FBQ0EsTUFBQSxHQUFBOzs7UUFHQSxPQUFBOzs7O0lBSUEsU0FBQSxTQUFBO01BQ0EsZUFBQTs7Ozs7Ozs7O0FDN1BBO0dBQ0EsT0FBQSxvQkFBQSxDQUFBOztHQUVBLFFBQUEsNEJBQUEsU0FBQSxXQUFBO0lBQ0EsT0FBQSxVQUFBO01BQ0EiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8g5bqU55So5YWl5Y+jXG4vLyBNb2R1bGU6IGd1bHVcbi8vIERlcGVuZGVuY2llczpcbi8vICAgIG5nUm91dGUsIGh0dHBJbnRlcmNlcHRvcnMsIGd1bHUubWlzc2luZ1xuXG4vKiBnbG9iYWwgZmFsbGJhY2tIYXNoICovXG5hbmd1bGFyXG4gIC5tb2R1bGUoJ2d1bHUnLCBbXG4gICAgJ3VpLnJvdXRlcicsXG4gICAgJ25nTG9jYWxlJyxcbiAgICAndG9hc3RyJyxcbiAgICAndWkuYm9vdHN0cmFwJyxcbiAgICAnY3VzdG9tLmRpcmVjdGl2ZXMnLFxuICAgICdodHRwSW50ZXJjZXB0b3JzJyxcbiAgICAnTG9jYWxTdG9yYWdlTW9kdWxlJyxcbiAgICAnY2hpZWZmYW5jeXBhbnRzLmxvYWRpbmdCYXInLFxuICAgICd1dGlsLmZpbHRlcnMnLFxuICAgICd1dGlsLmRhdGUnLFxuICAgICdndWx1LmluZGVudCcsXG4gICAgJ2d1bHUucmVwb3J0JyxcbiAgICAnZ3VsdS5sb2dpbicsXG4gICAgJ2d1bHUubWlzc2luZydcbiAgXSlcbiAgLmNvbmZpZyhmdW5jdGlvbigkbG9jYXRpb25Qcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyLCAkbG9nUHJvdmlkZXIsIGxvY2FsU3RvcmFnZVNlcnZpY2VQcm92aWRlcikge1xuICAgIC8vIG5vdCB1c2UgaHRtbDUgaGlzdG9yeSBhcGlcbiAgICAvLyBidXQgdXNlIGhhc2hiYW5nXG4gICAgJGxvY2F0aW9uUHJvdmlkZXJcbiAgICAgIC5odG1sNU1vZGUoZmFsc2UpXG4gICAgICAuaGFzaFByZWZpeCgnIScpO1xuXG4gICAgLy8gZGVmaW5lIDQwNFxuICAgICR1cmxSb3V0ZXJQcm92aWRlclxuICAgICAgLm90aGVyd2lzZSgnL2xvZ2luJyk7XG5cbiAgICAvLyBsb2dnZXJcbiAgICAkbG9nUHJvdmlkZXIuZGVidWdFbmFibGVkKHRydWUpO1xuXG4gICAgLy8gbG9jYWxTdG9yYWdlIHByZWZpeFxuICAgIGxvY2FsU3RvcmFnZVNlcnZpY2VQcm92aWRlclxuICAgICAgLnNldFByZWZpeCgnZ3VsdS50ZXN0ZXInKVxuICAgICAgLnNldE5vdGlmeSh0cnVlLCB0cnVlKTtcblxuICAgIC8vIEFQSSBTZXJ2ZXJcbiAgICBBUElfU0VSVkVSUyA9IHtcbiAgICAgIHRlc3RlcjogJ2h0dHA6Ly90LmlmZGl1LmNvbSdcbiAgICAgIC8vIHRlc3RlcjogJ2h0dHA6Ly9vLmRwOjMwMDAnXG4gICAgfVxuICB9KVxuICAucnVuKGZ1bmN0aW9uKCRyb290U2NvcGUsICRsb2NhdGlvbiwgJHN0YXRlLCAkc3RhdGVQYXJhbXMpIHtcbiAgICB2YXIgcmVnID0gL1tcXCZcXD9dXz1cXGQrLztcblxuICAgICRyb290U2NvcGUuJHN0YXRlID0gJHN0YXRlO1xuICAgICRyb290U2NvcGUuJHN0YXRlUGFyYW1zID0gJHN0YXRlUGFyYW1zO1xuICAgICRyb290U2NvcGUuaXNDb2xsYXBzZWQgPSB0cnVlO1xuXG4gICAgLy8g55So5LqO6L+U5Zue5LiK5bGC6aG16Z2iXG4gICAgJHJvb3RTY29wZVxuICAgICAgLiR3YXRjaChmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuICRsb2NhdGlvbi51cmwoKTtcbiAgICAgIH0sIGZ1bmN0aW9uKGN1cnJlbnQsIG9sZCkge1xuICAgICAgICBpZiAoY3VycmVudC5yZXBsYWNlKHJlZywgJycpID09PSBvbGQucmVwbGFjZShyZWcsICcnKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgICRyb290U2NvcGUuYmFja1VybCA9IG9sZDtcbiAgICAgIH0pO1xuXG4gICAgJHJvb3RTY29wZS5iYWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICAkbG9jYXRpb24udXJsKCRyb290U2NvcGUuYmFja1VybCk7XG4gICAgfVxuICB9KTtcblxuIiwiYW5ndWxhclxuICAubW9kdWxlKCdndWx1LmluZGVudCcsIFtcbiAgICAndWkucm91dGVyJyxcbiAgICAnZ3VsdS5pbmRlbnQuc3ZjcycsXG4gICAgJ2d1bHUuaW5kZW50LmVudW1zJ1xuICBdKVxuICAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXJcbiAgICAgIC5zdGF0ZSgnaW5kZW50cycsIHtcbiAgICAgICAgYWJzdHJhY3Q6IHRydWUsXG4gICAgICAgIHVybDogJy9pbmRlbnRzJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdpbmRlbnQvZGFzaGJvYXJkLmh0bScsXG4gICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICBJbmRlbnRFbnVtczogJ0luZGVudEVudW1zJ1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLnN0YXRlKCdpbmRlbnRzLmxpc3QnLCB7XG4gICAgICAgIHVybDogJycsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnaW5kZW50L3NlYXJjaC5odG0nLFxuICAgICAgICBjb250cm9sbGVyOiAnSW5kZW50TGlzdEN0cmwnXG4gICAgICB9KVxuICAgICAgLnN0YXRlKCdpbmRlbnRzLnVuY29uZmlybWVkJywge1xuICAgICAgICB1cmw6ICcvdW5jb25maXJtZWQnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2luZGVudC9saXN0X3VuY29uZmlybWVkLmh0bScsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdJbmRlbnRMaXN0Q3RybCdcbiAgICAgIH0pXG4gICAgICAuc3RhdGUoJ2luZGVudHMudW50ZXN0ZWQnLCB7XG4gICAgICAgIHVybDogJy91bnRlc3RlZCcsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnaW5kZW50L2xpc3RfdW50ZXN0ZWQuaHRtJyxcbiAgICAgICAgY29udHJvbGxlcjogJ1VudGVzdGVkSW5kZW50TGlzdEN0cmwnXG4gICAgICB9KTtcbiAgfSk7XG4iLCJhbmd1bGFyXG4gIC5tb2R1bGUoJ2d1bHUubG9naW4nLCBbXG4gICAgJ3VpLnJvdXRlcicsXG4gICAgJ2d1bHUubG9naW4uc3ZjcydcbiAgXSlcblxuICAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXJcbiAgICAgIC5zdGF0ZSgnbG9naW4nLCB7XG4gICAgICAgIHVybDogJy9sb2dpbicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnbG9naW4vbG9naW4uaHRtJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0xvZ2luQ3RybCdcbiAgICAgIH0pO1xuICB9KTtcbiIsImFuZ3VsYXJcbiAgLm1vZHVsZSgnZ3VsdS5yZXBvcnQnLCBbXG4gICAgJ3VpLnJvdXRlcicsXG4gICAgJ3V0aWwudm0nLFxuICAgICdndWx1LnJlcG9ydC5zdmNzJ1xuICAgIC8vICdndWx1LnJlcG9ydC5lbnVtcydcbiAgXSlcbiAgLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyXG4gICAgICAuc3RhdGUoJ2luZGVudHMuaW5wdXRfcmVwb3J0Jywge1xuICAgICAgICB1cmw6ICcve2luZGVudF9pZDpbMC05XSt9L2Nhci97Y2FyX2lkOlswLTldK30vcmVwb3J0JyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdyZXBvcnQvaW5wdXRfZGFzaGJvYXJkLmh0bScsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdJbnB1dERhc2hib2FyZEN0cmwnXG4gICAgICB9KVxuICAgICAgLnN0YXRlKCdpbmRlbnRzLmlucHV0X3JlcG9ydC5jcmVkZW50aWFsJywge1xuICAgICAgICB1cmw6ICcvY3JlZGVudGlhbCcsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAncmVwb3J0L2lucHV0X2NyZWRlbnRpYWwuaHRtJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0NyZWRlbnRpYWxSZXBvcnRFZGl0Q3RybCdcbiAgICAgIH0pXG4gICAgICAuc3RhdGUoJ2luZGVudHMuaW5wdXRfcmVwb3J0LnBob3RvJywge1xuICAgICAgICB1cmw6ICcvcGhvdG8nLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ3JlcG9ydC9pbnB1dF9waG90by5odG0nLFxuICAgICAgICBjb250cm9sbGVyOiAnUGhvdG9SZXBvcnRFZGl0Q3RybCdcbiAgICAgIH0pXG4gICAgICAuc3RhdGUoJ2luZGVudHMuaW5wdXRfcmVwb3J0LnBhcnQnLCB7XG4gICAgICAgIHVybDogJy97cGFydF9pZDpbMC05YS16QS1aXSt9JyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdyZXBvcnQvaW5wdXQuaHRtJyxcbiAgICAgICAgY29udHJvbGxlcjogJ1JlcG9ydEVkaXRDdHJsJ1xuICAgICAgfSk7XG4gIH0pO1xuIiwiLy8g6Ieq5a6a5LmJIGRpcmVjdGl2ZXNcblxuYW5ndWxhclxuICAubW9kdWxlKCdjdXN0b20uZGlyZWN0aXZlcycsIFtdKVxuICAuZGlyZWN0aXZlKCduZ0luZGV0ZXJtaW5hdGUnLCBmdW5jdGlvbigkY29tcGlsZSkge1xuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgc2NvcGUuJHdhdGNoKGF0dHJpYnV0ZXNbJ25nSW5kZXRlcm1pbmF0ZSddLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgIGVsZW1lbnQucHJvcCgnaW5kZXRlcm1pbmF0ZScsICEhdmFsdWUpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICB9KTtcbiIsImFuZ3VsYXJcbiAgLm1vZHVsZSgndXRpbC5maWx0ZXJzJywgW10pXG5cbiAgLmZpbHRlcignbW9iaWxlJywgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHMpIHtcbiAgICAgIGlmIChzID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfVxuXG4gICAgICBzID0gcy5yZXBsYWNlKC9bXFxzXFwtXSsvZywgJycpO1xuXG4gICAgICBpZiAocy5sZW5ndGggPCAzKSB7XG4gICAgICAgIHJldHVybiBzO1xuICAgICAgfVxuXG4gICAgICB2YXIgc2EgPSBzLnNwbGl0KCcnKTtcblxuICAgICAgc2Euc3BsaWNlKDMsIDAsICctJyk7XG5cbiAgICAgIGlmIChzLmxlbmd0aCA+PSA3KSB7XG4gICAgICAgIHNhLnNwbGljZSg4LCAwLCAnLScpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2Euam9pbignJyk7XG4gICAgfTtcbiAgfSk7XG4iLCJhbmd1bGFyXG4gIC5tb2R1bGUoJ3V0aWwuZGF0ZScsIFtdKVxuICAuZmFjdG9yeSgnRGF0ZVV0aWwnLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRvU3RyaW5nID0gZnVuY3Rpb24gKGRhdGUsIHMpIHtcbiAgICAgIHJldHVybiBkYXRlLmdldEZ1bGxZZWFyKCkgKyBzICsgKGRhdGUuZ2V0TW9udGgoKSArIDEpICsgcyArIGRhdGUuZ2V0RGF0ZSgpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICB0b0xvY2FsRGF0ZVN0cmluZzogZnVuY3Rpb24gKGRhdGUpIHtcbiAgICAgICAgcmV0dXJuIHRvU3RyaW5nKGRhdGUsICctJyk7XG4gICAgICB9LFxuXG4gICAgICB0b0xvY2FsVGltZVN0cmluZzogZnVuY3Rpb24oZGF0ZSkge1xuICAgICAgICB2YXIgaCA9IGRhdGUuZ2V0SG91cnMoKTtcbiAgICAgICAgdmFyIG0gPSBkYXRlLmdldE1pbnV0ZXMoKTtcblxuICAgICAgICBpZiAoaCA8IDEwKSB7XG4gICAgICAgICAgaCA9ICcwJyArIGg7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobSA8IDEwKSB7XG4gICAgICAgICAgbSA9ICcwJyArIG07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gW3RvU3RyaW5nKGRhdGUsICctJyksIGggKyAnOicgKyBtXS5qb2luKCcgJyk7XG4gICAgICB9XG4gICAgfVxuICB9KTsiLCIvLyDmnprkuL4gU2VydmljZVxuYW5ndWxhclxuICAubW9kdWxlKCd1dGlsLmVudW1zJywgW10pXG4gIC5mYWN0b3J5KCdFbnVtcycsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKEVOVU1TKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB2YWw6IGZ1bmN0aW9uIChuYW1lLCB0ZXh0KSB7XG4gICAgICAgICAgcmV0dXJuIEVOVU1TW25hbWVdLmZpbmQoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtLnRleHQgPT09IHRleHQ7XG4gICAgICAgICAgfSkudmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIHRleHQ6IGZ1bmN0aW9uIChuYW1lLCB2YWwpIHtcbiAgICAgICAgICByZXR1cm4gRU5VTVNbbmFtZV0uZmluZChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW0udmFsdWUgPT09IHZhbDtcbiAgICAgICAgICB9KS50ZXh0O1xuICAgICAgICB9LFxuICAgICAgICBpdGVtOiBmdW5jdGlvbiAobmFtZSwgdmFsKSB7XG4gICAgICAgICAgcmV0dXJuIEVOVU1TW25hbWVdLmZpbmQoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtLnZhbHVlID09PSB2YWw7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGl0ZW00dGV4dDogZnVuY3Rpb24obmFtZSwgdGV4dCkge1xuICAgICAgICAgIHJldHVybiBFTlVNU1tuYW1lXS5maW5kKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtLnRleHQgPT09IHRleHQ7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGxpc3Q6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgcmV0dXJuIEVOVU1TW25hbWVdO1xuICAgICAgICB9LFxuICAgICAgICBpdGVtczogZnVuY3Rpb24gKG5hbWUsIHZhbHMpIHtcbiAgICAgICAgICByZXR1cm4gRU5VTVNbbmFtZV0uZmlsdGVyKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFscy5pbmRleE9mKGl0ZW0udmFsdWUpICE9PSAtMTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9O1xuICB9KTsiLCJhbmd1bGFyXG4gIC5tb2R1bGUoJ2h0dHBJbnRlcmNlcHRvcnMnLCBbXSlcblxuICAuY29uZmlnKGZ1bmN0aW9uKCRodHRwUHJvdmlkZXIpIHtcbiAgICAkaHR0cFByb3ZpZGVyLmludGVyY2VwdG9ycy5wdXNoKCdodHRwSW50ZXJjZXB0b3InKTtcbiAgICBcbiAgICAvLyBBbmd1bGFyICRodHRwIGlzbuKAmXQgYXBwZW5kaW5nIHRoZSBoZWFkZXIgWC1SZXF1ZXN0ZWQtV2l0aCA9IFhNTEh0dHBSZXF1ZXN0IHNpbmNlIEFuZ3VsYXIgMS4zLjBcbiAgICAkaHR0cFByb3ZpZGVyLmRlZmF1bHRzLmhlYWRlcnMuY29tbW9uW1wiWC1SZXF1ZXN0ZWQtV2l0aFwiXSA9ICdYTUxIdHRwUmVxdWVzdCc7XG4gIH0pXG5cbiAgLmZhY3RvcnkoJ2h0dHBJbnRlcmNlcHRvcicsIGZ1bmN0aW9uKCRxLCAkcm9vdFNjb3BlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC8vIOivt+axguWJjeS/ruaUuSByZXF1ZXN0IOmFjee9rlxuICAgICAgJ3JlcXVlc3QnOiBmdW5jdGlvbihjb25maWcpIHtcbiAgICAgICAgLy8g6Iul6K+35rGC55qE5piv5qih5p2/77yM5oiW5bey5Yqg5LiK5pe26Ze05oiz55qEIHVybCDlnLDlnYDvvIzliJnkuI3pnIDopoHliqDml7bpl7TmiLNcbiAgICAgICAgaWYgKGNvbmZpZy51cmwuaW5kZXhPZignLmh0bScpICE9PSAtMSB8fCBjb25maWcudXJsLmluZGV4T2YoJz9fPScpICE9PSAtMSkge1xuICAgICAgICAgIHJldHVybiBjb25maWc7XG4gICAgICAgIH1cblxuICAgICAgICBjb25maWcudXJsID0gY29uZmlnLnVybCArICc/Xz0nICsgbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cbiAgICAgICAgcmV0dXJuIGNvbmZpZztcbiAgICAgIH0sXG5cbiAgICAgIC8vIOivt+axguWHuumUme+8jOS6pOe7mSBlcnJvciBjYWxsYmFjayDlpITnkIZcbiAgICAgICdyZXF1ZXN0RXJyb3InOiBmdW5jdGlvbihyZWplY3Rpb24pIHtcbiAgICAgICAgcmV0dXJuICRxLnJlamVjdChyZWplY3Rpb24pO1xuICAgICAgfSxcblxuICAgICAgLy8g5ZON5bqU5pWw5o2u5oyJ57qm5a6a5aSE55CGXG4gICAgICAvLyB7XG4gICAgICAvLyAgIGNvZGU6IDIwMCwgLy8g6Ieq5a6a5LmJ54q25oCB56CB77yMMjAwIOaIkOWKn++8jOmdniAyMDAg5Z2H5LiN5oiQ5YqfXG4gICAgICAvLyAgIG1zZzogJ+aTjeS9nOaPkOekuicsIC8vIOS4jeiDveWSjCBkYXRhIOWFseWtmFxuICAgICAgLy8gICBkYXRhOiB7fSAvLyDnlKjmiLfmlbDmja5cbiAgICAgIC8vIH1cbiAgICAgICdyZXNwb25zZSc6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgIC8vIOacjeWKoeerr+i/lOWbnueahOacieaViOeUqOaIt+aVsOaNrlxuICAgICAgICB2YXIgZGF0YSwgY29kZTtcblxuICAgICAgICBpZiAoYW5ndWxhci5pc09iamVjdChyZXNwb25zZS5kYXRhKSkge1xuICAgICAgICAgIGNvZGUgPSByZXNwb25zZS5kYXRhLmNvZGU7XG4gICAgICAgICAgZGF0YSA9IHJlc3BvbnNlLmRhdGEuZGF0YTtcblxuICAgICAgICAgIC8vIOiLpSBzdGF0dXMgMjAwLCDkuJQgY29kZSAhMjAw77yM5YiZ6L+U5Zue55qE5piv5pON5L2c6ZSZ6K+v5o+Q56S65L+h5oGvXG4gICAgICAgICAgLy8g6YKj5LmI77yMY2FsbGJhY2sg5Lya5o6l5pS25Yiw5LiL6Z2i5b2i5byP55qE5Y+C5pWw77yaXG4gICAgICAgICAgLy8geyBjb2RlOiAyMDAwMSwgbXNnOiAn5pON5L2c5aSx6LSlJyB9XG4gICAgICAgICAgaWYgKGNvZGUgIT09IDIwMCkge1xuICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdChyZXNwb25zZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g6Iul5pyN5Yqh56uv6L+U5Zue55qEIGRhdGEgIW51bGzvvIzliJnov5Tlm57nmoTmmK/mnInmlYjlnLDnlKjmiLfmlbDmja5cbiAgICAgICAgICAvLyDpgqPkuYjvvIxjYWxsYmFjayDkvJrmjqXmlLbliLDkuIvpnaLlvaLlvI/lj4LmlbDvvJpcbiAgICAgICAgICAvLyB7IGl0ZW1zOiBbLi4uXSwgdG90YWxfY291bnQ6IDEwMCB9XG4gICAgICAgICAgaWYgKGRhdGEgIT0gbnVsbCkge1xuICAgICAgICAgICAgcmVzcG9uc2UuZGF0YSA9IGRhdGE7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g6Iul5pyN5Yqh56uv6L+U5Zue55qEIGRhdGEg5YC85Li6IG51bGzvvIzliJnov5Tlm57nmoTmmK/mj5DnpLrkv6Hmga9cbiAgICAgICAgICAvLyDpgqPkuYggY2FsbGJhY2sg5Lya5o6l5pS25Yiw5LiL6Z2i5b2i5byP55qE5Y+C5pWw77yaXG4gICAgICAgICAgLy8geyBjb2RlOiAyMDAsIG1zZzogJ+aTjeS9nOaIkOWKnycgfVxuICAgICAgICAgIC8vIOm7mOiupOS4uuatpFxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgICAgfSxcblxuICAgICAgLy8g5ZON5bqU5Ye66ZSZ77yM5Lqk57uZIGVycm9yIGNhbGxiYWNrIOWkhOeQhlxuICAgICAgJ3Jlc3BvbnNlRXJyb3InOiBmdW5jdGlvbihyZWplY3Rpb24pIHtcbiAgICAgICAgcmV0dXJuICRxLnJlamVjdChyZWplY3Rpb24pO1xuICAgICAgfVxuICAgIH07XG4gIH0pOyIsIi8vICRzY29wZSDlop7lvLpcbmFuZ3VsYXJcbiAgLm1vZHVsZSgndXRpbC52bScsIFtdKVxuICAuZmFjdG9yeSgnVk0nLCBmdW5jdGlvbiAoJGxvZykge1xuICAgIHJldHVybiB7XG4gICAgICB0b19qc29uOiBmdW5jdGlvbih2bSwgZmllbGRzKSB7XG4gICAgICAgIHZhciByZXQgPSB7fTtcblxuICAgICAgICBpZiAoYW5ndWxhci5pc1N0cmluZyhmaWVsZHMpKSB7XG4gICAgICAgICAgZmllbGRzID0gZmllbGRzLnNwbGl0KCcsJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZmllbGRzLmxlbmd0aCA9PT0gMSAmJiBmaWVsZHNbMF0gPT09ICcnKSB7XG4gICAgICAgICAgJGxvZy53YXJuKCfmgqjosIPnlKjmlrnms5UgVk0udG9fanNvbiDml7bvvIzmsqHmnInkvKDlhaUgZmllbGRzIOWPguaVsCcpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghYW5ndWxhci5pc0FycmF5KGZpZWxkcykpIHtcbiAgICAgICAgICAkbG9nLmVycm9yKCfmlrnms5UgVk0udG9fanNvbiDlj6rmjqXlj5flrZfnrKbkuLLmlbDnu4TmiJbpgJflj7fliIbpmpTnmoTlrZfnrKbkuLLmiJbkuIDkuKrkuI3lkKvpgJflj7fnmoTlrZfnrKbkuLInKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBmaWVsZHMubWFwKGZ1bmN0aW9uKGZpZWxkKSB7XG4gICAgICAgICAgcmV0dXJuIHJldFtmaWVsZF0gPSB2bVtmaWVsZF07XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgICB9XG4gICAgfTtcbiAgfSk7IiwiJ3VzZSBzdHJpY3QnO1xuYW5ndWxhci5tb2R1bGUoXCJuZ0xvY2FsZVwiLCBbXSwgW1wiJHByb3ZpZGVcIiwgZnVuY3Rpb24oJHByb3ZpZGUpIHtcbiAgdmFyIFBMVVJBTF9DQVRFR09SWSA9IHtcbiAgICBaRVJPOiBcInplcm9cIixcbiAgICBPTkU6IFwib25lXCIsXG4gICAgVFdPOiBcInR3b1wiLFxuICAgIEZFVzogXCJmZXdcIixcbiAgICBNQU5ZOiBcIm1hbnlcIixcbiAgICBPVEhFUjogXCJvdGhlclwiXG4gIH07XG4gICRwcm92aWRlLnZhbHVlKFwiJGxvY2FsZVwiLCB7XG4gICAgXCJEQVRFVElNRV9GT1JNQVRTXCI6IHtcbiAgICAgIFwiQU1QTVNcIjogW1xuICAgICAgICBcIlxcdTRlMGFcXHU1MzQ4XCIsXG4gICAgICAgIFwiXFx1NGUwYlxcdTUzNDhcIlxuICAgICAgXSxcbiAgICAgIFwiREFZXCI6IFtcbiAgICAgICAgXCJcXHU2NjFmXFx1NjcxZlxcdTY1ZTVcIixcbiAgICAgICAgXCJcXHU2NjFmXFx1NjcxZlxcdTRlMDBcIixcbiAgICAgICAgXCJcXHU2NjFmXFx1NjcxZlxcdTRlOGNcIixcbiAgICAgICAgXCJcXHU2NjFmXFx1NjcxZlxcdTRlMDlcIixcbiAgICAgICAgXCJcXHU2NjFmXFx1NjcxZlxcdTU2ZGJcIixcbiAgICAgICAgXCJcXHU2NjFmXFx1NjcxZlxcdTRlOTRcIixcbiAgICAgICAgXCJcXHU2NjFmXFx1NjcxZlxcdTUxNmRcIlxuICAgICAgXSxcbiAgICAgIFwiTU9OVEhcIjogW1xuICAgICAgICBcIjFcXHU2NzA4XCIsXG4gICAgICAgIFwiMlxcdTY3MDhcIixcbiAgICAgICAgXCIzXFx1NjcwOFwiLFxuICAgICAgICBcIjRcXHU2NzA4XCIsXG4gICAgICAgIFwiNVxcdTY3MDhcIixcbiAgICAgICAgXCI2XFx1NjcwOFwiLFxuICAgICAgICBcIjdcXHU2NzA4XCIsXG4gICAgICAgIFwiOFxcdTY3MDhcIixcbiAgICAgICAgXCI5XFx1NjcwOFwiLFxuICAgICAgICBcIjEwXFx1NjcwOFwiLFxuICAgICAgICBcIjExXFx1NjcwOFwiLFxuICAgICAgICBcIjEyXFx1NjcwOFwiXG4gICAgICBdLFxuICAgICAgXCJTSE9SVERBWVwiOiBbXG4gICAgICAgIFwiXFx1NTQ2OFxcdTY1ZTVcIixcbiAgICAgICAgXCJcXHU1NDY4XFx1NGUwMFwiLFxuICAgICAgICBcIlxcdTU0NjhcXHU0ZThjXCIsXG4gICAgICAgIFwiXFx1NTQ2OFxcdTRlMDlcIixcbiAgICAgICAgXCJcXHU1NDY4XFx1NTZkYlwiLFxuICAgICAgICBcIlxcdTU0NjhcXHU0ZTk0XCIsXG4gICAgICAgIFwiXFx1NTQ2OFxcdTUxNmRcIlxuICAgICAgXSxcbiAgICAgIFwiU0hPUlRNT05USFwiOiBbXG4gICAgICAgIFwiMVxcdTY3MDhcIixcbiAgICAgICAgXCIyXFx1NjcwOFwiLFxuICAgICAgICBcIjNcXHU2NzA4XCIsXG4gICAgICAgIFwiNFxcdTY3MDhcIixcbiAgICAgICAgXCI1XFx1NjcwOFwiLFxuICAgICAgICBcIjZcXHU2NzA4XCIsXG4gICAgICAgIFwiN1xcdTY3MDhcIixcbiAgICAgICAgXCI4XFx1NjcwOFwiLFxuICAgICAgICBcIjlcXHU2NzA4XCIsXG4gICAgICAgIFwiMTBcXHU2NzA4XCIsXG4gICAgICAgIFwiMTFcXHU2NzA4XCIsXG4gICAgICAgIFwiMTJcXHU2NzA4XCJcbiAgICAgIF0sXG4gICAgICBcImZ1bGxEYXRlXCI6IFwieVxcdTVlNzRNXFx1NjcwOGRcXHU2NWU1RUVFRVwiLFxuICAgICAgXCJsb25nRGF0ZVwiOiBcInlcXHU1ZTc0TVxcdTY3MDhkXFx1NjVlNVwiLFxuICAgICAgXCJtZWRpdW1cIjogXCJ5eXl5LU0tZCBhaDptbTpzc1wiLFxuICAgICAgXCJtZWRpdW1EYXRlXCI6IFwieXl5eS1NLWRcIixcbiAgICAgIFwibWVkaXVtVGltZVwiOiBcImFoOm1tOnNzXCIsXG4gICAgICBcInNob3J0XCI6IFwieXktTS1kIGFoOm1tXCIsXG4gICAgICBcInNob3J0RGF0ZVwiOiBcInl5LU0tZFwiLFxuICAgICAgXCJzaG9ydFRpbWVcIjogXCJhaDptbVwiXG4gICAgfSxcbiAgICBcIk5VTUJFUl9GT1JNQVRTXCI6IHtcbiAgICAgIFwiQ1VSUkVOQ1lfU1lNXCI6IFwiXFx1MDBhNVwiLFxuICAgICAgXCJERUNJTUFMX1NFUFwiOiBcIi5cIixcbiAgICAgIFwiR1JPVVBfU0VQXCI6IFwiLFwiLFxuICAgICAgXCJQQVRURVJOU1wiOiBbe1xuICAgICAgICBcImdTaXplXCI6IDMsXG4gICAgICAgIFwibGdTaXplXCI6IDMsXG4gICAgICAgIFwibWFjRnJhY1wiOiAwLFxuICAgICAgICBcIm1heEZyYWNcIjogMyxcbiAgICAgICAgXCJtaW5GcmFjXCI6IDAsXG4gICAgICAgIFwibWluSW50XCI6IDEsXG4gICAgICAgIFwibmVnUHJlXCI6IFwiLVwiLFxuICAgICAgICBcIm5lZ1N1ZlwiOiBcIlwiLFxuICAgICAgICBcInBvc1ByZVwiOiBcIlwiLFxuICAgICAgICBcInBvc1N1ZlwiOiBcIlwiXG4gICAgICB9LCB7XG4gICAgICAgIFwiZ1NpemVcIjogMyxcbiAgICAgICAgXCJsZ1NpemVcIjogMyxcbiAgICAgICAgXCJtYWNGcmFjXCI6IDAsXG4gICAgICAgIFwibWF4RnJhY1wiOiAyLFxuICAgICAgICBcIm1pbkZyYWNcIjogMixcbiAgICAgICAgXCJtaW5JbnRcIjogMSxcbiAgICAgICAgXCJuZWdQcmVcIjogXCIoXFx1MDBhNFwiLFxuICAgICAgICBcIm5lZ1N1ZlwiOiBcIilcIixcbiAgICAgICAgXCJwb3NQcmVcIjogXCJcXHUwMGE0XCIsXG4gICAgICAgIFwicG9zU3VmXCI6IFwiXCJcbiAgICAgIH1dXG4gICAgfSxcbiAgICBcImlkXCI6IFwiemgtY25cIixcbiAgICBcInBsdXJhbENhdFwiOiBmdW5jdGlvbihuKSB7XG4gICAgICByZXR1cm4gUExVUkFMX0NBVEVHT1JZLk9USEVSO1xuICAgIH1cbiAgfSk7XG59XSk7XG4iLCIvLyA0MDQg6aG16Z2iXG4vLyBNb2R1bGU6IGd1bHUubWlzc2luZ1xuLy8gRGVwZW5kZW5jaWVzOiBuZ1JvdXRlXG5cbmFuZ3VsYXJcbiAgLm1vZHVsZSgnZ3VsdS5taXNzaW5nJywgWyd1aS5yb3V0ZXInXSlcblxuICAvLyDphY3nva4gcm91dGVcbiAgLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlclxuICAgICAgLnN0YXRlKCdtaXNzaW5nJywge1xuICAgICAgICB1cmw6ICcvbWlzc2luZycsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnNDA0LzQwNC5odG0nLFxuICAgICAgICBjb250cm9sbGVyOiAnTWlzc2luZ0N0cmwnXG4gICAgICB9KTtcbiAgfSlcblxuICAvLyA0MDQgY29udHJvbGxlclxuICAuY29udHJvbGxlcignTWlzc2luZ0N0cmwnLCBmdW5jdGlvbiAoJHNjb3BlKSB7XG4gICAgY29uc29sZS5sb2coJ0lgbSBoZXJlJyk7XG4gICAgLy8gVE9ETzpcbiAgICAvLyAxLiBzaG93IGxhc3QgcGF0aCBhbmQgcGFnZSBuYW1lXG4gIH0pO1xuIiwiYW5ndWxhclxuICAubW9kdWxlKCdndWx1LmluZGVudC5lbnVtcycsIFsndXRpbC5lbnVtcycsIF0pXG5cbi5mYWN0b3J5KCdJbmRlbnRFbnVtcycsIGZ1bmN0aW9uKEVudW1zLCBJbmRlbnRFbnVtc1N2YywgdG9hc3RyKSB7XG4gIHJldHVybiBJbmRlbnRFbnVtc1N2Y1xuICAgICAgLmdldCgpXG4gICAgICAuJHByb21pc2VcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICB2YXIgYWxsX3ByZWlucyA9ICd0eXBlIGNoYW5uZWwgYnJhbmQgc2VyaWVzIG1vZGVsIHN0YXR1cyBjaXR5IHRlc3RlciByb2xlIGZyb20nLnNwbGl0KCcgJyk7XG5cbiAgICAgICAgYWxsX3ByZWlucy5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgIHJlc1trZXldLnVuc2hpZnQoe1xuICAgICAgICAgICAgdGV4dDogJ+WFqOmDqCcsXG4gICAgICAgICAgICB2YWx1ZTogbnVsbFxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gRW51bXMocmVzLnRvSlNPTigpKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgIHRvYXN0ci5lcnJvcihyZXMubXNnIHx8ICfojrflj5bmnprkuL7lpLHotKUnKTtcbiAgICAgIH0pO1xufSk7XG4iLCJhbmd1bGFyXG4gIC5tb2R1bGUoJ2d1bHUuaW5kZW50LnN2Y3MnLCBbJ25nUmVzb3VyY2UnXSlcblxuICAuc2VydmljZSgnSW5kZW50RW51bXNTdmMnLCBmdW5jdGlvbigkcmVzb3VyY2UpIHtcbiAgICByZXR1cm4gJHJlc291cmNlKEFQSV9TRVJWRVJTLnRlc3RlciArICcvZW51bXMnKTtcbiAgfSlcbiAgXG4gIC5zZXJ2aWNlKCdJbmRlbnRzU3ZjJywgZnVuY3Rpb24gKCRyZXNvdXJjZSkge1xuICAgIHJldHVybiAkcmVzb3VyY2UoQVBJX1NFUlZFUlMudGVzdGVyICsgJy9vcmRlcnMnLCB7fSwge1xuICAgICAgcXVlcnk6IHtcbiAgICAgICAgaXNBcnJheTogZmFsc2VcbiAgICAgIH1cbiAgICB9KTtcbiAgfSlcblxuICAuc2VydmljZSgnSW5kZW50U3ZjJywgZnVuY3Rpb24gKCRyZXNvdXJjZSkge1xuICAgIHJldHVybiAkcmVzb3VyY2UoQVBJX1NFUlZFUlMudGVzdGVyICsgJy9vcmRlcnMvOmlkJywge1xuICAgICAgaWQ6ICdAaWQnXG4gICAgfSwge1xuICAgICAgdXBkYXRlOiB7XG4gICAgICAgIG1ldGhvZDogJ1BVVCdcbiAgICAgIH1cbiAgICB9KTtcbiAgfSlcblxuICAuc2VydmljZSgnVGVzdGVyc1N2YycsIGZ1bmN0aW9uKCRyZXNvdXJjZSkge1xuICAgIHJldHVybiAkcmVzb3VyY2UoQVBJX1NFUlZFUlMudGVzdGVyICsgJy90ZXN0ZXJzJywge30sIHtcbiAgICAgIHF1ZXJ5OiB7XG4gICAgICAgIGlzQXJyYXk6IGZhbHNlXG4gICAgICB9XG4gICAgfSk7XG4gIH0pXG5cbiAgLnNlcnZpY2UoJ0luZGVudEFwcHJvdmFsU3ZjJywgZnVuY3Rpb24oJHJlc291cmNlKSB7XG4gICAgcmV0dXJuICRyZXNvdXJjZShBUElfU0VSVkVSUy50ZXN0ZXIgKyAnL29yZGVycy86aWQvYXBwcm92YWwnLCB7XG4gICAgICBpZDogJ0BpZCdcbiAgICB9KTtcbiAgfSlcblxuICAuc2VydmljZSgnVW50ZXN0ZWRJbmRlbnRzU3ZjJywgZnVuY3Rpb24oJHJlc291cmNlKSB7XG4gICAgcmV0dXJuICRyZXNvdXJjZShBUElfU0VSVkVSUy50ZXN0ZXIgKyAnL29yZGVycy91bnRlc3RlZCcpO1xuICB9KVxuXG4gIC5zZXJ2aWNlKCdJbmRlbnRDYXJzU3ZjJywgZnVuY3Rpb24oJHJlc291cmNlKSB7XG4gICAgcmV0dXJuICRyZXNvdXJjZShBUElfU0VSVkVSUy50ZXN0ZXIgKyAnL29yZGVycy86b3JkZXJfaWQvY2FyJywge1xuICAgICAgb3JkZXJfaWQ6ICdAb3JkZXJfaWQnXG4gICAgfSlcbiAgfSlcblxuICAuc2VydmljZSgnSW5kZW50Q2FyU3ZjJywgZnVuY3Rpb24oJHJlc291cmNlKSB7XG4gICAgcmV0dXJuICRyZXNvdXJjZShBUElfU0VSVkVSUy50ZXN0ZXIgKyAnL29yZGVycy86b3JkZXJfaWQvY2FyLzpjYXJfaWQnLCB7XG4gICAgICBvcmRlcl9pZDogJ0BvcmRlcl9pZCcsXG4gICAgICBjYXJfaWQ6ICdAY2FyX2lkJ1xuICAgIH0sIHtcbiAgICAgIHVwZGF0ZToge1xuICAgICAgICBtZXRob2Q6ICdQVVQnXG4gICAgICB9XG4gICAgfSk7XG4gIH0pOyIsIi8qIGdsb2JhbCBhbmd1bGFyICovXG5hbmd1bGFyXG4gIC5tb2R1bGUoJ2d1bHUuaW5kZW50JylcbiAgXG4gIC5jb250cm9sbGVyKCdJbmRlbnRMaXN0Q3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJGxvY2F0aW9uLCB0b2FzdHIsICRtb2RhbCxcbiAgICBJbmRlbnRzU3ZjLCBJbmRlbnRTdmMsIEluZGVudEVudW1zKSB7XG4gICAgdmFyIHZtID0gJHNjb3BlO1xuICAgIHZhciBxc28gPSAkbG9jYXRpb24uc2VhcmNoKCk7XG5cbiAgICB2bS5zdGF0dXNfaWQgPSBwYXJzZUludChxc28uc3RhdHVzX2lkKSB8fCBudWxsO1xuICAgIFxuICAgIGlmICh2bS4kc3RhdGUuaW5jbHVkZXMoJ2luZGVudHMudW5jb25maXJtZWQnKSkge1xuICAgICAgdm0uc3RhdHVzX2lkID0gNDtcbiAgICB9IGVsc2Uge1xuICAgICAgdm0uY2l0eV9pZCA9IHBhcnNlSW50KHFzby5jaXR5X2lkKSB8fCBudWxsO1xuICAgICAgdm0udGVzdGVyX2lkID0gcGFyc2VJbnQocXNvLnRlc3Rlcl9pZCkgfHwgbnVsbDtcbiAgICAgIHZtLnJvbGVfaWQgPSBwYXJzZUludChxc28ucm9sZV9pZCkgfHwgbnVsbDtcbiAgICAgIHZtLm1vYmlsZSA9IHFzby5tb2JpbGUgfHwgbnVsbDtcblxuICAgICAgdm0uc3RhdHVzID0gSW5kZW50RW51bXMuaXRlbSgnc3RhdHVzJywgdm0uc3RhdHVzX2lkKTtcbiAgICAgIHZtLnN0YXR1c19saXN0ID0gSW5kZW50RW51bXMubGlzdCgnc3RhdHVzJyk7XG4gICAgICB2bS5jaXR5ID0gSW5kZW50RW51bXMuaXRlbSgnY2l0eScsIHZtLmNpdHlfaWQpO1xuICAgICAgdm0uY2l0eV9saXN0ID0gSW5kZW50RW51bXMubGlzdCgnY2l0eScpO1xuICAgICAgdm0ucm9sZSA9IEluZGVudEVudW1zLml0ZW0oJ3JvbGUnLCB2bS5yb2xlX2lkKTtcbiAgICAgIHZtLnJvbGVfbGlzdCA9IEluZGVudEVudW1zLmxpc3QoJ3JvbGUnKTtcbiAgICAgIHZtLnRlc3RlciA9IEluZGVudEVudW1zLml0ZW0oJ3Rlc3RlcicsIHZtLnRlc3Rlcl9pZCk7XG4gICAgICB2bS50ZXN0ZXJfbGlzdCA9IEluZGVudEVudW1zLmxpc3QoJ3Rlc3RlcicpO1xuXG4gICAgICB3YXRjaF9saXN0KCdzdGF0dXMnLCAnc3RhdHVzX2lkJyk7XG4gICAgICB3YXRjaF9saXN0KCdjaXR5JywgJ2NpdHlfaWQnKTtcbiAgICAgIHdhdGNoX2xpc3QoJ3JvbGUnLCAncm9sZV9pZCcpO1xuICAgICAgd2F0Y2hfbGlzdCgndGVzdGVyJywgJ3Rlc3Rlcl9pZCcpO1xuXG4gICAgICB2bS5zZWFyY2ggPSBzZWFyY2g7XG4gICAgfVxuXG4gICAgdm0ucGFnZSA9IHBhcnNlSW50KHFzby5wYWdlKSB8fCAxO1xuICAgIHZtLnNpemUgPSBwYXJzZUludChxc28uc2l6ZSkgfHwgMjA7XG4gICAgdm0uc2l6ZXMgPSBJbmRlbnRFbnVtcy5saXN0KCdzaXplJyk7XG4gICAgdm0uc2l6ZV9pdGVtID0gSW5kZW50RW51bXMuaXRlbSgnc2l6ZScsIHZtLnNpemUpO1xuXG4gICAgdm0uc2l6ZV9jaGFuZ2UgPSBzaXplX2NoYW5nZTtcbiAgICB2bS5wYWdlX2NoYW5nZSA9IHBhZ2VfY2hhbmdlO1xuICAgIHZtLmNhbmNlbF9vcmRlciA9IGNhbmNlbF9vcmRlcjtcbiAgICB2bS5jb25maXJtX29yZGVyID0gY29uZmlybV9vcmRlcjtcblxuICAgIHF1ZXJ5KCk7XG5cbiAgICBmdW5jdGlvbiBxdWVyeSgpIHtcbiAgICAgIHZhciBwYXJhbXMgPSB7XG4gICAgICAgIHNpemU6IHZtLnNpemUsXG4gICAgICAgIHBhZ2U6IHZtLnBhZ2UsXG5cbiAgICAgICAgc3RhdHVzX2lkOiB2bS5zdGF0dXNfaWRcbiAgICAgIH07XG5cbiAgICAgIGlmICh2bS4kc3RhdGUuaW5jbHVkZXMoJ2luZGVudHMubGlzdCcpKSB7XG4gICAgICAgIGFuZ3VsYXIuZXh0ZW5kKHBhcmFtcywge1xuICAgICAgICAgIGNpdHlfaWQ6IHZtLmNpdHlfaWQsXG4gICAgICAgICAgdGVzdGVyX2lkOiB2bS50ZXN0ZXJfaWQsXG4gICAgICAgICAgcm9sZV9pZDogdm0ucm9sZV9pZCxcbiAgICAgICAgICBtb2JpbGU6IHZtLm1vYmlsZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgJGxvY2F0aW9uLnNlYXJjaChwYXJhbXMpO1xuXG4gICAgICBJbmRlbnRzU3ZjXG4gICAgICAgIC5xdWVyeShwYXJhbXMpXG4gICAgICAgIC4kcHJvbWlzZVxuICAgICAgICAudGhlbihmdW5jdGlvbihycykge1xuICAgICAgICAgIHJzLml0ZW1zLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgaXRlbS5zdGF0dXNfdGV4dCA9IEluZGVudEVudW1zLnRleHQoJ3N0YXR1cycsIGl0ZW0uc3RhdHVzKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHZtLml0ZW1zID0gcnMuaXRlbXM7XG4gICAgICAgICAgdm0udG90YWxfY291bnQgPSBycy50b3RhbF9jb3VudDtcblxuICAgICAgICAgIHZhciB0bXAgPSBycy50b3RhbF9jb3VudCAvIHZtLnNpemU7XG4gICAgICAgICAgdm0ucGFnZV9jb3VudCA9IHJzLnRvdGFsX2NvdW50ICUgdm0uc2l6ZSA9PT0gMCA/IHRtcCA6IChNYXRoLmZsb29yKHRtcCkgKyAxKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIHRvYXN0ci5lcnJvcihyZXMuZGF0YS5tc2cgfHwgJ+afpeivouWksei0pe+8jOacjeWKoeWZqOWPkeeUn+acquefpemUmeivr++8jOivt+mHjeivlScpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB3YXRjaF9saXN0KG5hbWUsIGZpZWxkKSB7XG4gICAgICB2bS4kd2F0Y2gobmFtZSwgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICBpZiAoIWl0ZW0pIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2bVtmaWVsZF0gPSBpdGVtLnZhbHVlO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8g56Gu6K6k6K6i5Y2VXG4gICAgZnVuY3Rpb24gY29uZmlybV9vcmRlcihpdGVtKSB7XG4gICAgICBpZiAoY29uZmlybSgn56Gu6K6k5o6l5Y+X6K+l6K6i5Y2VPycpKSB7XG4gICAgICAgIEluZGVudFN2Y1xuICAgICAgICAgIC51cGRhdGUoe1xuICAgICAgICAgICAgaWQ6IGl0ZW0uaWRcbiAgICAgICAgICB9LCB7XG4gICAgICAgICAgICBzdGF0dXM6IDVcbiAgICAgICAgICB9KVxuICAgICAgICAgIC4kcHJvbWlzZVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgdG9hc3RyLnN1Y2Nlc3MocmVzLm1zZyB8fCAn56Gu6K6k6K6i5Y2V5oiQ5YqfJyk7XG5cbiAgICAgICAgICAgIHF1ZXJ5KCk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICB0b2FzdHIuZXJyb3IocmVzLm1zZyB8fCAn56Gu6K6k6K6i5Y2V5aSx6LSl77yM6K+36YeN6K+VJyk7XG4gICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8g5Y+W5raI6K6i5Y2VXG4gICAgZnVuY3Rpb24gY2FuY2VsX29yZGVyKGl0ZW0pIHtcbiAgICAgIHZhciBjYW5jZWxfb3JkZXJfaW5zID0gJG1vZGFsLm9wZW4oe1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2luZGVudC9jYW5jZWxfb3JkZXIuaHRtJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0NhbmNlbE9yZGVyQ3RybCcsXG4gICAgICAgIGJhY2tkcm9wOiAnc3RhdGljJyxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgIGluZGVudF9pbmZvOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGNhbmNlbF9vcmRlcl9pbnMucmVzdWx0LnRoZW4oZnVuY3Rpb24odGVzdGVyKSB7XG4gICAgICAgIC8vIFRPRE86XG4gICAgICAgIC8vIOabtOaWsOmihOe6puWNleeKtuaAgVxuICAgICAgICBxdWVyeSgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8g5q+P6aG15p2h5pWw5pS55Y+YXG4gICAgZnVuY3Rpb24gc2l6ZV9jaGFuZ2Uoc2l6ZSkge1xuICAgICAgdm0uc2l6ZSA9IHNpemU7XG4gICAgICB2bS5wYWdlID0gMTtcblxuICAgICAgcXVlcnkoKTtcbiAgICB9XG5cbiAgICAvLyDnv7vpobVcbiAgICBmdW5jdGlvbiBwYWdlX2NoYW5nZShwYWdlKSB7XG4gICAgICB2bS5wYWdlID0gcGFnZTtcblxuICAgICAgcXVlcnkoKTtcbiAgICB9XG5cbiAgICAvLyDmn6Xor6Lmj5DkuqRcbiAgICBmdW5jdGlvbiBzZWFyY2goKSB7XG4gICAgICB2bS5wYWdlID0gMTtcblxuICAgICAgcXVlcnkoKTtcbiAgICB9XG4gIH0pXG5cbiAgLmNvbnRyb2xsZXIoJ1VudGVzdGVkSW5kZW50TGlzdEN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRsb2NhdGlvbiwgdG9hc3RyLCAkbW9kYWwsXG4gICBVbnRlc3RlZEluZGVudHNTdmMsIEluZGVudENhclN2YywgSW5kZW50RW51bXMpIHtcbiAgICB2YXIgdm0gPSAkc2NvcGU7XG5cbiAgICB2bS5jYW5jZWxfb3JkZXIgPSBjYW5jZWxfb3JkZXI7XG4gICAgdm0uZGVsX2NhciA9IGRlbF9jYXI7XG4gICAgdm0uZWRpdF9jYXIgPSBlZGl0X2NhcjtcblxuICAgIHF1ZXJ5KCk7XG5cbiAgICBmdW5jdGlvbiBxdWVyeSgpIHtcbiAgICAgIHJldHVybiBVbnRlc3RlZEluZGVudHNTdmNcbiAgICAgICAgLnF1ZXJ5KClcbiAgICAgICAgLiRwcm9taXNlXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIHZtLml0ZW1zID0gcmVzO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgdG9hc3RyLmVycm9yKHJlcy5tc2cgfHwgJ+iOt+WPluW+heajgOa1i+iuouWNleWksei0pScpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyDliqDovaYg5oiWIOe8lui+kei9plxuICAgIGZ1bmN0aW9uIGVkaXRfY2FyKG9yZGVyX2lkLCBjYXIpIHtcbiAgICAgIHZhciBlZGl0X2Nhcl9pbnMgPSAkbW9kYWwub3Blbih7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnaW5kZW50L2VkaXRfY2FyLmh0bScsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdJbmRlbnRDYXJFZGl0Q3RybCcsXG4gICAgICAgIGJhY2tkcm9wOiAnc3RhdGljJyxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgIGluZGVudF9pbmZvOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIG9yZGVyX2lkOiBvcmRlcl9pZCxcbiAgICAgICAgICAgICAgY2FyOiBjYXJcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgZWRpdF9jYXJfaW5zLnJlc3VsdC50aGVuKGZ1bmN0aW9uKHRlc3Rlcikge1xuICAgICAgICBxdWVyeSgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8g5Yig6Zmk6L2mXG4gICAgZnVuY3Rpb24gZGVsX2NhcihvcmRlcl9pZCwgY2FyKSB7XG4gICAgICBpZiAoY29uZmlybSgn56Gu6K6k5Yig6ZmkIFwiJyArIFtjYXIuYnJhbmQsIGNhci5zZXJpZXMsIGNhci5tb2RlbF0uam9pbignLScpICsgJ1wiJykpIHtcbiAgICAgICAgcmV0dXJuIEluZGVudENhclN2Y1xuICAgICAgICAgIC5yZW1vdmUoe1xuICAgICAgICAgICAgb3JkZXJfaWQ6IG9yZGVyX2lkLFxuICAgICAgICAgICAgY2FyX2lkOiBjYXIuaWRcbiAgICAgICAgICB9KVxuICAgICAgICAgIC4kcHJvbWlzZVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgdG9hc3RyLnN1Y2Nlc3MocmVzLm1zZyB8fCAn5Yig6Zmk6L2m5oiQ5YqfJyk7XG5cbiAgICAgICAgICAgIHF1ZXJ5KCk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICB0b2FzdHIuZXJyb3IocmVzLm1zZyB8fCAn5Yig6Zmk6L2m5aSx6LSl77yM6K+36YeN6K+VJyk7XG4gICAgICAgICAgfSk7ICBcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDlj5bmtojorqLljZVcbiAgICBmdW5jdGlvbiBjYW5jZWxfb3JkZXIoaXRlbSkge1xuICAgICAgdmFyIGNhbmNlbF9vcmRlcl9pbnMgPSAkbW9kYWwub3Blbih7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnaW5kZW50L2NhbmNlbF9vcmRlci5odG0nLFxuICAgICAgICBjb250cm9sbGVyOiAnQ2FuY2VsT3JkZXJDdHJsJyxcbiAgICAgICAgYmFja2Ryb3A6ICdzdGF0aWMnLFxuICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgaW5kZW50X2luZm86IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgY2FuY2VsX29yZGVyX2lucy5yZXN1bHQudGhlbihmdW5jdGlvbih0ZXN0ZXIpIHtcbiAgICAgICAgcXVlcnkoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSlcbiAgXG4gIC8vIOWPlua2iOiuouWNlVxuICAuY29udHJvbGxlcignQ2FuY2VsT3JkZXJDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkbW9kYWxJbnN0YW5jZSwgdG9hc3RyLCBJbmRlbnRBcHByb3ZhbFN2YywgaW5kZW50X2luZm8pIHtcbiAgICB2YXIgdm0gPSAkc2NvcGU7XG5cbiAgICBhbmd1bGFyLmV4dGVuZCh2bSwgaW5kZW50X2luZm8pO1xuXG4gICAgdm0uY2FuY2VsX29yZGVyID0gY2FuY2VsX29yZGVyO1xuICAgIHZtLmNhbmNlbCA9IGNhbmNlbDtcblxuICAgIGZ1bmN0aW9uIGNhbmNlbF9vcmRlcigpIHtcbiAgICAgIHZtLmNhbmNlbF9vcmRlcl9zdGF0dXMgPSB0cnVlO1xuXG4gICAgICBJbmRlbnRBcHByb3ZhbFN2Y1xuICAgICAgICAuc2F2ZSh7XG4gICAgICAgICAgaWQ6IGluZGVudF9pbmZvLmlkXG4gICAgICAgIH0sIHtcbiAgICAgICAgICByZWFzb246IHZtLnJlYXNvblxuICAgICAgICB9KVxuICAgICAgICAuJHByb21pc2VcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgdG9hc3RyLnN1Y2Nlc3MocmVzLm1zZyB8fCAn6K6i5Y2V5Y+W5raI5oiQ5YqfJyk7XG5cbiAgICAgICAgICAkbW9kYWxJbnN0YW5jZS5jbG9zZSgpO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgdm0uY2FuY2VsX29yZGVyX3N0YXR1cyA9IGZhbHNlO1xuXG4gICAgICAgICAgdG9hc3RyLmVycm9yKHJlcy5tc2cgfHwgJ+iuouWNleWPlua2iOWksei0pe+8jOivt+mHjeivlScpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjYW5jZWwoKSB7XG4gICAgICAkbW9kYWxJbnN0YW5jZS5kaXNtaXNzKCk7XG4gICAgfVxuICB9KVxuXG4gIC8vIOWKoOi9piDmiJYg57yW6L6R6L2mXG4gIC5jb250cm9sbGVyKCdJbmRlbnRDYXJFZGl0Q3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJG1vZGFsSW5zdGFuY2UsIHRvYXN0ciwgSW5kZW50Q2Fyc1N2YyxcbiAgICBJbmRlbnRDYXJTdmMsIEluZGVudEVudW1zLCBpbmRlbnRfaW5mbykge1xuICAgIHZhciB2bSA9ICRzY29wZTtcblxuICAgIHZtLmJyYW5kX2xpc3QgPSBJbmRlbnRFbnVtcy5saXN0KCdicmFuZCcpO1xuICAgIHZtLnNlcmllc19saXN0ID0gSW5kZW50RW51bXMubGlzdCgnc2VyaWVzJyk7XG4gICAgdm0ubW9kZWxfbGlzdCA9IEluZGVudEVudW1zLmxpc3QoJ21vZGVsJyk7XG5cbiAgICBpZiAoaW5kZW50X2luZm8uY2FyKSB7XG4gICAgICB2bS50aXRsZSA9ICfnvJbovpHovabkv6Hmga8nO1xuXG4gICAgICBzZWxlY3RfaXRlbSgnYnJhbmQnLCBpbmRlbnRfaW5mby5jYXIuYnJhbmQpO1xuICAgICAgc2VsZWN0X2l0ZW0oJ3NlcmllcycsIGluZGVudF9pbmZvLmNhci5zZXJpZXMpO1xuICAgICAgc2VsZWN0X2l0ZW0oJ21vZGVsJywgaW5kZW50X2luZm8uY2FyLm1vZGVsKTsgIFxuICAgIH0gZWxzZSB7XG4gICAgICB2bS50aXRsZSA9ICfliqDovaYnO1xuICAgIH1cblxuICAgIHZtLmNhbmNlbCA9IGNhbmNlbDtcbiAgICB2bS5zdWJtaXQgPSBzdWJtaXQ7XG5cbiAgICBmdW5jdGlvbiBzdWJtaXQoKSB7XG4gICAgICBpZiAoaW5kZW50X2luZm8uY2FyKSB7XG4gICAgICAgIEluZGVudENhclN2Y1xuICAgICAgICAgIC51cGRhdGUoe1xuICAgICAgICAgICAgb3JkZXJfaWQ6IGluZGVudF9pbmZvLm9yZGVyX2lkLFxuICAgICAgICAgICAgY2FyX2lkOiBpbmRlbnRfaW5mby5jYXIuaWRcbiAgICAgICAgICB9LCB7XG4gICAgICAgICAgICBicmFuZDogdm0uYnJhbmQudmFsdWUsXG4gICAgICAgICAgICBzZXJpZXM6IHZtLmJyYW5kLnZhbHVlLFxuICAgICAgICAgICAgbW9kZWw6IHZtLm1vZGVsLnZhbHVlXG4gICAgICAgICAgfSlcbiAgICAgICAgICAuJHByb21pc2VcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgIHRvYXN0ci5zdWNjZXNzKHJlcy5tc2cgfHwgJ+e8lui+kei9pui+huS/oeaBr+S/neWtmOaIkOWKnycpO1xuXG4gICAgICAgICAgICAkbW9kYWxJbnN0YW5jZS5jbG9zZSgpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgdG9hc3RyLmVycm9yKHJlcy5tc2cgfHwgJ+e8lui+kei9pui+huS/oeaBr+S/neWtmOWksei0pScpO1xuICAgICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgSW5kZW50Q2Fyc1N2Y1xuICAgICAgICAgIC5zYXZlKHtcbiAgICAgICAgICAgIG9yZGVyX2lkOiBpbmRlbnRfaW5mby5vcmRlcl9pZFxuICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgIGJyYW5kOiB2bS5icmFuZC52YWx1ZSxcbiAgICAgICAgICAgIHNlcmllczogdm0uYnJhbmQudmFsdWUsXG4gICAgICAgICAgICBtb2RlbDogdm0ubW9kZWwudmFsdWVcbiAgICAgICAgICB9KVxuICAgICAgICAgIC4kcHJvbWlzZVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgdG9hc3RyLnN1Y2Nlc3MocmVzLm1zZyB8fCAn5Yqg6L2m5L+h5oGv5L+d5a2Y5oiQ5YqfJyk7XG5cbiAgICAgICAgICAgICRtb2RhbEluc3RhbmNlLmNsb3NlKCk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICB0b2FzdHIuZXJyb3IocmVzLm1zZyB8fCAn5Yqg6L2m5L+h5oGv5L+d5a2Y5aSx6LSlJyk7XG4gICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2VsZWN0X2l0ZW0obGlzdF9uYW1lLCB2YWx1ZSkge1xuICAgICAgdm1bbGlzdF9uYW1lXSA9IEluZGVudEVudW1zLml0ZW00dGV4dChsaXN0X25hbWUsIHZhbHVlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjYW5jZWwoKSB7XG4gICAgICAkbW9kYWxJbnN0YW5jZS5kaXNtaXNzKCk7XG4gICAgfVxuXG4gIH0pO1xuXG4iLCJhbmd1bGFyXG4gIC5tb2R1bGUoJ2d1bHUubG9naW4nKVxuICBcbiAgLmNvbnRyb2xsZXIoJ0xvZ2luQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsICRxLCAkbG9jYXRpb24sICR0aW1lb3V0LCB0b2FzdHIsIExvZ2luU3ZjKSB7XG4gICAgdmFyIHZtID0gJHNjb3BlO1xuXG4gICAgdm0ubG9naW4gPSBsb2dpbjtcblxuICAgIGZ1bmN0aW9uIGxvZ2luKCkge1xuICAgICAgcmV0dXJuIExvZ2luU3ZjXG4gICAgICAgIC5zYXZlKHtcbiAgICAgICAgICBqb2Jfbm86IHZtLmpvYl9ubyxcbiAgICAgICAgICBwYXNzd29yZDogdm0ucGFzc3dvcmRcbiAgICAgICAgfSlcbiAgICAgICAgLiRwcm9taXNlXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIHRvYXN0ci5zdWNjZXNzKHJlcy5tc2cgfHwgJ+eZu+W9leaIkOWKn++8jOato+WcqOS4uuS9oOi3s+i9rC4uLicpO1xuXG4gICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkbG9jYXRpb24udXJsKCcvaW5kZW50cycpO1xuICAgICAgICAgIH0sIDIwMDApO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgdG9hc3RyLmVycm9yKHJlcy5tc2cgfHwgJ+eZu+W9leWksei0pe+8jOivt+mHjeivlScpO1xuICAgICAgICB9KTtcbiAgICB9XG4gIH0pOyIsImFuZ3VsYXJcbiAgLm1vZHVsZSgnZ3VsdS5sb2dpbi5zdmNzJywgWyduZ1Jlc291cmNlJ10pXG4gIC5zZXJ2aWNlKCdMb2dpblN2YycsIGZ1bmN0aW9uICgkcmVzb3VyY2UpIHtcbiAgICByZXR1cm4gJHJlc291cmNlKEFQSV9TRVJWRVJTLnRlc3RlciArICcvdXNlci9sb2dpbicpO1xuICB9KSIsImFuZ3VsYXJcbiAgLm1vZHVsZSgnZ3VsdS5yZXBvcnQnKVxuXG4gIC5mYWN0b3J5KCdSZXBvcnRJbnB1dGVyJywgZnVuY3Rpb24oJGxvZywgJHN0YXRlUGFyYW1zLCAkaW50ZXJ2YWwsIFZNLCBsb2NhbFN0b3JhZ2VTZXJ2aWNlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHZtLCBmaWVsZHMsIHJlcG9ydF90eXBlKSB7XG4gICAgICB2YXIgaW5kZW50X2lkID0gJHN0YXRlUGFyYW1zLmluZGVudF9pZDtcbiAgICAgIHZhciBjYXJfaWQgPSAkc3RhdGVQYXJhbXMuY2FyX2lkO1xuXG4gICAgICB2YXIgc3RvcmVfa2V5ID0gW2luZGVudF9pZCwgY2FyX2lkXS5qb2luKCdfJyk7XG5cbiAgICAgIHZhciBpbml0X2RhdGEgPSBsb2NhbFN0b3JhZ2VTZXJ2aWNlLmdldChzdG9yZV9rZXkpO1xuICAgICAgLy8g6K6+572u5Yid5aeL5YyW5YC8XG4gICAgICBhbmd1bGFyLmV4dGVuZCh2bSwgaW5pdF9kYXRhICYmIGluaXRfZGF0YVtyZXBvcnRfdHlwZV0gfHwge30pO1xuXG4gICAgICAvLyDkv53lrZjliLAgbG9jYWxTdG9yYWdlXG4gICAgICBmdW5jdGlvbiBzYXZlKCkge1xuICAgICAgICB2YXIgZGF0YSA9IGxvY2FsU3RvcmFnZVNlcnZpY2UuZ2V0KHN0b3JlX2tleSkgfHwge307XG4gICAgICAgIGRhdGFbcmVwb3J0X3R5cGVdID0gVk0udG9fanNvbih2bSwgZmllbGRzKTtcblxuICAgICAgICBsb2NhbFN0b3JhZ2VTZXJ2aWNlLnNldChzdG9yZV9rZXksIGRhdGEpO1xuXG4gICAgICAgICRsb2cubG9nKCflvZXlhaXmo4DmtYvmiqXlkYogLSAnICsgc3RvcmVfa2V5LCBkYXRhW3JlcG9ydF90eXBlXSk7XG4gICAgICB9XG5cbiAgICAgIHZhciB0aW1lciA9ICRpbnRlcnZhbChzYXZlLCAzMDAwKTtcblxuICAgICAgLy8g5YiH5o2i6aG16Z2i5pe277yM5Y+W5raI6Ieq5Yqo5L+d5a2YKOa4hemZpOWumuaXtuWZqClcbiAgICAgIHZtLiRvbignJGxvY2F0aW9uQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgJGludGVydmFsLmNhbmNlbCh0aW1lcik7XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuXG4iLCJhbmd1bGFyXG4gIC5tb2R1bGUoJ2d1bHUucmVwb3J0JylcblxuICAuY29udHJvbGxlcignSW5wdXREYXNoYm9hcmRDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGVQYXJhbXMsICR0ZW1wbGF0ZUNhY2hlKSB7XG4gICAgdmFyIHZtID0gJHNjb3BlO1xuXG4gICAgdm0ucGFydHMgPSBKU09OLnBhcnNlKCR0ZW1wbGF0ZUNhY2hlLmdldCgncmVwb3J0L2kuanNvbicpKTtcbiAgICAvLyDkuI3nlKjlsZXnpLrnhafniYdcbiAgICB2bS5wYXJ0cy5wb3AoKTtcblxuICAgIHZtLnRvZ2dsZV9uYXZfb3BlbiA9IHRvZ2dsZV9uYXZfb3BlbjtcblxuICAgIGZ1bmN0aW9uIHRvZ2dsZV9uYXZfb3BlbigpIHtcbiAgICAgIHZtLnRlc3Rfc3RlcF9uYXZfb3BlbiA9ICF2bS50ZXN0X3N0ZXBfbmF2X29wZW47XG4gICAgfVxuICB9KVxuICBcbiAgLmNvbnRyb2xsZXIoJ0NyZWRlbnRpYWxSZXBvcnRFZGl0Q3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgUmVwb3J0SW5wdXRlcikge1xuICAgIHZhciB2bSA9ICRzY29wZTtcbiAgICB2YXIgZmllbGRzID0gJ25hbWUsbW9iaWxlLG1vdG9yX25vLHZpbmNvZGUsZW5naW5lX25vLGJvZHlfY29sb3IscHJvZHVjdGl2ZV90aW1lLGNhcl9hdHRyaWJ1dGVfdG8sdHJhbnNmZXJfdGltZXMsYW5udWFsX2NoZWNrX2RlYWRsaW5lLHRyYWZmaWNfaW5zdXJhbmNlX2RlYWRsaW5lLGJ1c2luZXNzX2luc3VyYW5jZV9kZWFkbGluZSxoYXNfY2FyX2ludm9pY2UsaGFzXzRzX21haW50ZW5hbmNlJztcblxuICAgIFJlcG9ydElucHV0ZXIodm0sIGZpZWxkcywgJ2NyZWRlbnRpYWwnKTtcblxuICAgIC8vIOaXpeacn+aOp+S7tuaYvuekui/pmpDol48v56aB55SoXG4gICAgdm0ub3Blbl9kYXRlcGlja2VyID0gZnVuY3Rpb24oJGV2ZW50LCBkcCkge1xuICAgICAgJGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgIGlmICh2bS5pbnB1dF9hZnRlcl9vaykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZtW2RwXSA9IHRydWU7XG4gICAgfTtcbiAgfSlcblxuICAuY29udHJvbGxlcignUGhvdG9SZXBvcnRFZGl0Q3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJGxvZywgJHN0YXRlUGFyYW1zLCAkdGVtcGxhdGVDYWNoZSwgbG9jYWxTdG9yYWdlU2VydmljZSkge1xuICAgIHZhciB2bSA9ICRzY29wZTtcblxuICAgIHZhciBjdXJyZW50X3BhcnQgPSAncGhvdG8nO1xuICAgIHZhciBpbmRlbnRfaWQgPSAkc3RhdGVQYXJhbXMuaW5kZW50X2lkO1xuICAgIHZhciBjYXJfaWQgPSAkc3RhdGVQYXJhbXMuY2FyX2lkO1xuICAgIC8vIOihqOWNlemhueaVsOaNruWtmOWCqOWIsOacrOWcsOeahCBrZXkg55qE55Sf5oiQ6KeE5YiZXG4gICAgdmFyIHN0b3JlX2tleSA9IFtpbmRlbnRfaWQsIGNhcl9pZF0uam9pbignXycpO1xuICAgIHZhciBzdG9yZV9rZXlfZXJyID0gW3N0b3JlX2tleSwgJ2VyciddLmpvaW4oJ18nKTtcbiAgICB2YXIgaW5pdF9kYXRhID0gbG9jYWxTdG9yYWdlU2VydmljZS5nZXQoc3RvcmVfa2V5KTtcblxuICAgIHZhciBwYXJ0X2pzb24gPSBKU09OLnBhcnNlKCR0ZW1wbGF0ZUNhY2hlLmdldCgncmVwb3J0L2kuanNvbicpKTtcbiAgICB2YXIgcGFyZW50X3BhcnQgPSBwYXJ0X2pzb24uZmluZChmdW5jdGlvbihwYXJ0KSB7XG4gICAgICByZXR1cm4gcGFydC5pZCA9PT0gY3VycmVudF9wYXJ0O1xuICAgIH0pO1xuICAgIHZtLnBhcnRzID0gcGFyZW50X3BhcnQgJiYgcGFyZW50X3BhcnQuY2hpbGRyZW47XG5cbiAgICB2bS5kYXRhID0ge307XG4gICAgLy8g6K6+572u5Yid5aeL5YyW5YC8XG4gICAgYW5ndWxhci5leHRlbmQodm0uZGF0YSwgaW5pdF9kYXRhICYmIGluaXRfZGF0YVtjdXJyZW50X3BhcnRdIHx8IHt9KTtcblxuICAgIHZhciBwaG90b19vZl9ncm91cCA9IGxvY2FsU3RvcmFnZVNlcnZpY2UuZ2V0KHN0b3JlX2tleV9lcnIpO1xuICAgIHZtLnBhcnRfcGhvdG9zID0gXy5tYXAocGhvdG9fb2ZfZ3JvdXAsIGZ1bmN0aW9uKGl0ZW0sIGtleSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaWQ6IGtleSxcbiAgICAgICAgbmFtZTogZ2V0X3BhcnRfbmFtZShrZXkpLFxuICAgICAgICBwaG90b3M6IGl0ZW1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHZtLnBhcnRzLmZvckVhY2goZnVuY3Rpb24ocGFydCkge1xuICAgICAgcGFydC5pdGVtcy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgdm0uZGF0YVtpdGVtLmlkXSA9IHZtLmRhdGFbaXRlbS5pZF0gfHwgeyBpbWFnZTogbnVsbCB9O1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyB2bS4kd2F0Y2goJ2RhdGEnLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgLy8gICBhbGVydCgnZGF0YTogJyArIEpTT04uc3RyaW5naWZ5KHZtLmRhdGEpKTtcblxuICAgIC8vICAgdm0uZGF0YSA9IGRhdGE7XG4gICAgLy8gfSwgdHJ1ZSk7XG5cbiAgICB2bS50YWtlX3Bob3RvID0gdGFrZV9waG90bztcbiAgICBcbiAgICBmdW5jdGlvbiBnZXRfcGFydF9uYW1lKHBhcnRfaWQpIHtcbiAgICAgIHJldHVybiBwYXJ0X2pzb24uZmluZChmdW5jdGlvbihwYXJ0KSB7IHJldHVybiBwYXJ0LmlkID09PSBwYXJ0X2lkOyB9KS5uYW1lO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRha2VfcGhvdG8ocGFydCwgaXRlbSkge1xuICAgICAgLy8gVE9ETzpcbiAgICAgIC8vIHNldCBpbWFnZSBkYXRhIHRvIGxvY2FsXG4gICAgICAvLyBpbml0X2RhdGFbcGFydC5pZF1baXRlbS5pZF0uaW1hZ2VcbiAgICAgIG5hdmlnYXRvci5jYW1lcmEuZ2V0UGljdHVyZSh0YWtlX3Bob3RvX3N1Y2Nlc3MsIHRha2VfcGhvdG9fZXJyb3IsIHtcbiAgICAgICAgcXVhbGl0eSA6IDEwMCxcbiAgICAgICAgZGVzdGluYXRpb25UeXBlIDogQ2FtZXJhLkRlc3RpbmF0aW9uVHlwZS5GSUxFX1VSSSxcbiAgICAgICAgc291cmNlVHlwZSA6IENhbWVyYS5QaWN0dXJlU291cmNlVHlwZS5DQU1FUkEsXG4gICAgICAgIGFsbG93RWRpdCA6IHRydWUsXG4gICAgICAgIGVuY29kaW5nVHlwZTogQ2FtZXJhLkVuY29kaW5nVHlwZS5QTkcsXG4gICAgICAgIC8vIHRhcmdldFdpZHRoOiAxMDAsXG4gICAgICAgIC8vIHRhcmdldEhlaWdodDogMTAwLFxuICAgICAgICBzYXZlVG9QaG90b0FsYnVtOiBmYWxzZVxuICAgICAgfSk7XG5cbiAgICAgIGZ1bmN0aW9uIHRha2VfcGhvdG9fc3VjY2VzcyhpbWd1cmwpIHtcbiAgICAgICAgdm0uZGF0YVtpdGVtLmlkXSA9IHZtLmRhdGFbaXRlbS5pZF0gfHwge307XG4gICAgICAgIHZtLmRhdGFbaXRlbS5pZF0uaW1hZ2UgPSBpbWd1cmw7XG4gICAgICAgIHZtLiRhcHBseSgpO1xuICAgICAgICBhbGVydCgnc3VjY2VzczogJyArIEpTT04uc3RyaW5naWZ5KHZtLmRhdGEpKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gdGFrZV9waG90b19lcnJvcigpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2Vycm9yJywgYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cbiAgLmNvbnRyb2xsZXIoJ1JlcG9ydEVkaXRDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkbG9nLCAkc3RhdGVQYXJhbXMsICR0ZW1wbGF0ZUNhY2hlLCBsb2NhbFN0b3JhZ2VTZXJ2aWNlLCAkbW9kYWwpIHtcbiAgICB2YXIgdm0gPSAkc2NvcGU7XG5cbiAgICB2YXIgY3VycmVudF9wYXJ0ID0gJHN0YXRlUGFyYW1zLnBhcnRfaWQ7XG4gICAgdmFyIGluZGVudF9pZCA9ICRzdGF0ZVBhcmFtcy5pbmRlbnRfaWQ7XG4gICAgdmFyIGNhcl9pZCA9ICRzdGF0ZVBhcmFtcy5jYXJfaWQ7XG4gICAgLy8g6KGo5Y2V6aG55pWw5o2u5a2Y5YKo5Yiw5pys5Zyw55qEIGtleSDnmoTnlJ/miJDop4TliJlcbiAgICB2YXIgc3RvcmVfa2V5ID0gW2luZGVudF9pZCwgY2FyX2lkXS5qb2luKCdfJyk7XG4gICAgdmFyIHN0b3JlX2tleV9lcnIgPSBbc3RvcmVfa2V5LCAnZXJyJ10uam9pbignXycpO1xuICAgIHZhciBpbml0X2RhdGEgPSBsb2NhbFN0b3JhZ2VTZXJ2aWNlLmdldChzdG9yZV9rZXkpO1xuXG4gICAgLy8g6I635Y+W5oql5ZGK6L6T5YWl6aG55pWw5o2uXG4gICAgdmFyIHBhcmVudF9wYXJ0ID0gSlNPTi5wYXJzZSgkdGVtcGxhdGVDYWNoZS5nZXQoJ3JlcG9ydC9pLmpzb24nKSkuZmluZChmdW5jdGlvbihwYXJ0KSB7IHJldHVybiBwYXJ0LmlkID09PSBjdXJyZW50X3BhcnQ7IH0pO1xuICAgIHZtLnBhcnRzID0gcGFyZW50X3BhcnQgJiYgcGFyZW50X3BhcnQuY2hpbGRyZW47XG4gICAgXG4gICAgdm0uZGF0YSA9IHt9O1xuICAgIC8vIOiuvue9ruWIneWni+WMluWAvFxuICAgIGFuZ3VsYXIuZXh0ZW5kKHZtLmRhdGEsIGluaXRfZGF0YSAmJiBpbml0X2RhdGFbY3VycmVudF9wYXJ0XSB8fCB7fSk7XG5cbiAgICAvLyBkYXRhIOaUueWPmOWImeWwhuWFtuS/neWtmOWIsCBsb2NhbCBzdG9yYWdlXG4gICAgdm0uJHdhdGNoKCdkYXRhJywgZnVuY3Rpb24odikge1xuICAgICAgJGxvZy5sb2coJ2Zvcm0gZGF0YTogJywgSlNPTi5zdHJpbmdpZnkodikpO1xuXG4gICAgICBzYXZlKCk7XG5cbiAgICAgIHNhdmVfZXJyKCk7XG4gICAgfSwgdHJ1ZSk7XG5cbiAgICBcbiAgICAvLyDkv53lrZjliLAgbG9jYWxTdG9yYWdlXG4gICAgLy8g5pWw5o2u5qC85byP5Li677yaXG4gICAgLy8ge1xuICAgIC8vICAgXCJyMVwiOiB7XG4gICAgLy8gICAgIFwicmVzdWx0XCI6IDEsXG4gICAgLy8gICAgIFwic3RhdGVcIjogMSxcbiAgICAvLyAgICAgXCJkZWdyZWVcIjogMSxcbiAgICAvLyAgICAgXCJtZW1vXCI6IFwieHh4XCIsXG4gICAgLy8gICAgIFwiaW1hZ2VcIjogXCJcIlxuICAgIC8vICAgfVxuICAgIC8vIH1cbiAgICBmdW5jdGlvbiBzYXZlKCkge1xuICAgICAgdmFyIGRhdGEgPSBsb2NhbFN0b3JhZ2VTZXJ2aWNlLmdldChzdG9yZV9rZXkpIHx8IHt9O1xuICAgICAgZGF0YVtjdXJyZW50X3BhcnRdID0gdm0uZGF0YTtcblxuICAgICAgbG9jYWxTdG9yYWdlU2VydmljZS5zZXQoc3RvcmVfa2V5LCBkYXRhKTtcblxuICAgICAgJGxvZy5sb2coJ+W9leWFpeajgOa1i+aKpeWRiiAtICcgKyBzdG9yZV9rZXksIGRhdGFbY3VycmVudF9wYXJ0XSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2F2ZV9lcnIoKSB7XG4gICAgICB2YXIgZGF0YSA9IGxvY2FsU3RvcmFnZVNlcnZpY2UuZ2V0KHN0b3JlX2tleV9lcnIpIHx8IHt9O1xuICAgICAgdmFyIGVycl9pdGVtcyA9IFtdO1xuXG4gICAgICBfLmVhY2godm0uZGF0YSwgZnVuY3Rpb24oaXRlbSwga2V5KSB7XG4gICAgICAgIGlmIChwYXJzZUludChpdGVtLnJlc3VsdCkgPT09IDApIHtcbiAgICAgICAgICBpdGVtLmlkID0ga2V5O1xuICAgICAgICAgIGVycl9pdGVtcy5wdXNoKGl0ZW0pO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgZGF0YVtjdXJyZW50X3BhcnRdID0gZXJyX2l0ZW1zIHx8IFtdO1xuXG4gICAgICBsb2NhbFN0b3JhZ2VTZXJ2aWNlLnNldChzdG9yZV9rZXlfZXJyLCBkYXRhKTtcblxuICAgICAgJGxvZy5sb2coJ+W9leWFpeajgOa1i+aKpeWRiumXrumimOmhuSAtICcgKyBzdG9yZV9rZXlfZXJyLCBkYXRhW2N1cnJlbnRfcGFydF0pO1xuICAgIH1cblxuICAgIHZtLnNob3dfZGV0YWlsID0gc2hvd19kZXRhaWw7XG4gICAgdm0uc2hvdWxkX2NsZWFyID0gc2hvdWxkX2NsZWFyO1xuXG4gICAgLy8g6YG/5YWN5bGV56S65Lik5qyhIG1vZGFsXG4gICAgdmFyIGlzX3Nob3dfZGV0YWlsID0gZmFsc2U7XG4gICAgZnVuY3Rpb24gc2hvd19kZXRhaWwoaW5kZXgsIHBhcnQsIGNoZWNrX2l0ZW0pIHtcbiAgICAgIC8vIGNoYW5nZSDkuovku7blj5HnlJ/lnKggY2xpY2sg5LmL5ZCOXG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoaXNfc2hvd19kZXRhaWwgfHwgcGFyc2VJbnQodm0uZGF0YVtjaGVja19pdGVtLmlkXS5yZXN1bHQpICE9PSAwKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaXNfc2hvd19kZXRhaWwgPSB0cnVlO1xuXG4gICAgICAgIHZhciBpbnB1dF9kZXRhaWxfaW5zID0gJG1vZGFsLm9wZW4oe1xuICAgICAgICAgIHRlbXBsYXRlVXJsOiAncmVwb3J0L2lucHV0X2RldGFpbC5odG0nLFxuICAgICAgICAgIGNvbnRyb2xsZXI6ICdJdGVtSW5wdXREZXRhaWxDdHJsJyxcbiAgICAgICAgICBiYWNrZHJvcDogJ3N0YXRpYycsXG4gICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgaXRlbV9kZXRhaWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gYW5ndWxhci5leHRlbmQoe1xuICAgICAgICAgICAgICAgIHBhcnRfbmFtZTogcGFydC5uYW1lLFxuICAgICAgICAgICAgICAgIHBhcnRfYWxpYXM6IHBhcnQuYWxpYXMsXG4gICAgICAgICAgICAgICAgaW5kZXg6IGluZGV4XG4gICAgICAgICAgICAgIH0sIGNoZWNrX2l0ZW0sIHZtLmRhdGFbY2hlY2tfaXRlbS5pZF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaW5wdXRfZGV0YWlsX2lucy5yZXN1bHQudGhlbihcbiAgICAgICAgICBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICBhbmd1bGFyLmV4dGVuZCh2bS5kYXRhW2NoZWNrX2l0ZW0uaWRdLCBpdGVtLCB7XG4gICAgICAgICAgICAgIG5hbWU6IGNoZWNrX2l0ZW0ubmFtZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpc19zaG93X2RldGFpbCA9IGZhbHNlO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpc19zaG93X2RldGFpbCA9IGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNob3VsZF9jbGVhcihpdGVtKSB7XG4gICAgICAvLyDoi6Xmo4DmtYvml6Dpl67popjvvIzliJnmuIXpmaTkuYvliY3loavlhpnnmoTmjZ/kvKTmlbDmja5cbiAgICAgIGlmIChwYXJzZUludCh2bS5kYXRhW2l0ZW0uaWRdLnJlc3VsdCkgIT09IDApIHtcbiAgICAgICAgdm0uZGF0YVtpdGVtLmlkXS5zdGF0ZSA9IG51bGw7XG4gICAgICAgIHZtLmRhdGFbaXRlbS5pZF0uZGVncmVlID0gbnVsbDtcbiAgICAgICAgdm0uZGF0YVtpdGVtLmlkXS5tZW1vID0gbnVsbDtcbiAgICAgICAgdm0uZGF0YVtpdGVtLmlkXS5pbWFnZSA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuICB9KVxuXG4gIC5jb250cm9sbGVyKCdJdGVtSW5wdXREZXRhaWxDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkbW9kYWxJbnN0YW5jZSwgaXRlbV9kZXRhaWwpIHtcbiAgICB2YXIgdm0gPSAkc2NvcGU7XG5cbiAgICBhbmd1bGFyLmV4dGVuZCh2bSwgaXRlbV9kZXRhaWwpO1xuXG4gICAgdm0uc3VibWl0ID0gc3VibWl0O1xuICAgIHZtLmNhbmNlbCA9IGNhbmNlbDtcblxuICAgIGZ1bmN0aW9uIHN1Ym1pdCgpIHtcbiAgICAgICRtb2RhbEluc3RhbmNlLmNsb3NlKHtcbiAgICAgICAgc3RhdGU6IHZtLnN0YXRlLFxuICAgICAgICBkZWdyZWU6IHZtLmRlZ3JlZSxcbiAgICAgICAgbWVtbzogdm0ubWVtbyxcbiAgICAgICAgLy8gVE9ETzpcbiAgICAgICAgLy8g5LuO54Wn55u45py66I635Y+W5Zu+54mH5Zyw5Z2AXG4gICAgICAgIGltYWdlOiAnL2QvYy9iL2EucG5nJ1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2FuY2VsKCkge1xuICAgICAgJG1vZGFsSW5zdGFuY2UuZGlzbWlzcygpO1xuICAgIH1cbiAgfSk7XG5cblxuXG5cblxuIiwiYW5ndWxhclxuICAubW9kdWxlKCdndWx1LnJlcG9ydC5zdmNzJywgWyduZ1Jlc291cmNlJ10pXG5cbiAgLnNlcnZpY2UoJ1JlcG9ydHNTdmMnLCBmdW5jdGlvbigkcmVzb3VyY2UpIHtcbiAgICByZXR1cm4gJHJlc291cmNlKCcvcmVwb3J0cycpO1xuICB9KTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=