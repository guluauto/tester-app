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

angular
  .module('gulu.indent.enums', ['util.enums', ])

.factory('IndentEnums', ["Enums", "IndentEnumsSvc", "toastr", function(Enums, IndentEnumsSvc, toastr) {
  return IndentEnumsSvc
      .get()
      .$promise
      .then(function(res) {
        var all_preins = 'order_type channel brand series model status city inspector role from'.split(' ');

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
      vm.inspector_id = parseInt(qso.inspector_id) || null;
      // vm.role_id = parseInt(qso.role_id) || null;
      vm.requester_mobile = qso.requester_mobile || null;

      vm.status = IndentEnums.item('status', vm.status_id);
      vm.status_list = IndentEnums.list('status');
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
        order_city_id: vm.city_id,
        noitems_page: vm.size,
        page: vm.page,

        order_status_id: vm.status_id
      };

      if (vm.$state.includes('indents.list')) {
        angular.extend(params, {
          order_city_id: vm.city_id,
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
            order_id: item.order_id
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

  .controller('UntestedIndentListCtrl', ["$scope", "$location", "toastr", "$modal", "UntestedIndentsSvc", "IndentCarSvc", function($scope, $location, toastr, $modal,
   UntestedIndentsSvc, IndentCarSvc) {
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

      cancel_order_ins.result.then(function() {
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
          order_id: indent_info.order_id
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

  .controller('InputDashboardCtrl', ["$scope", "$stateParams", "$templateCache", "localStorageService", function($scope, $stateParams, $templateCache, localStorageService) {
    var vm = $scope;

    var indent_id = $stateParams.indent_id;
    var car_id = $stateParams.car_id;
    var store_key = [indent_id, car_id].join('_');

    vm.parts = JSON.parse($templateCache.get('report/i.json'));
    // 不用展示照片
    vm.parts.pop();

    vm.toggle_nav_open = toggle_nav_open;
    vm.upload = upload;

    function toggle_nav_open() {
      vm.test_step_nav_open = !vm.test_step_nav_open;
    }

    function upload() {
      var local_img_data = localStorageService.get(store_key);

      var fileURI = local_img_data.photo_1.p1i2.image;

      alert('fileURL:\n' + fileURI);

      var opts = new FileUploadOptions();
      opts.fileKey = 'fileKey';
      opts.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);

      var ft = new FileTransfer();
      ft.upload(fileURI, encodeURI('http://f.ifdiu.com'), win, fail, opts);

      function win() {
        alert('win:\n' + JSON.stringify(arguments));
      }

      function fail() {
        alert('err:\n' + JSON.stringify(arguments));
      }
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

        init_data[part.id] = init_data[part.id] || {};
        init_data[part.id][item.id] = angular.extend(init_data[part.id][item.id] || {}, vm.data[item.id]);

        localStorageService.set(store_key, init_data);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImluZGVudC9pbmRlbnRfbW9kdWxlLmpzIiwibG9naW4vbG9naW5fbW9kdWxlLmpzIiwicmVwb3J0L3JlcG9ydF9tb2R1bGUuanMiLCJjb21wb25lbnQvY3VzdG9tLWRpcmVjdGl2ZS5qcyIsImNvbXBvbmVudC9jdXN0b20tZmlsdGVyLmpzIiwiY29tcG9uZW50L2RhdGUuanMiLCJjb21wb25lbnQvZW51bXMuanMiLCJjb21wb25lbnQvaHR0cC5qcyIsImNvbXBvbmVudC92bS5qcyIsImNvbXBvbmVudC96aC1jbi5qcyIsImluZGVudC9lbnVtcy5qcyIsImluZGVudC9pbmRlbnRfc3Zjcy5qcyIsImluZGVudC9saXN0X2N0cmwuanMiLCJsb2dpbi9sb2dpbl9jdHJsLmpzIiwibG9naW4vbG9naW5fc3Zjcy5qcyIsInJlcG9ydC9pbnB1dF9yZXBvcnQuanMiLCJyZXBvcnQvcmVwb3J0X2N0cmwuanMiLCJyZXBvcnQvcmVwb3J0X3N2Y3MuanMiLCI0MDQvNDA0X2N0cmwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztBQU1BO0dBQ0EsT0FBQSxRQUFBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTs7R0FFQSxrR0FBQSxTQUFBLG1CQUFBLG9CQUFBLGNBQUEsNkJBQUE7OztJQUdBO09BQ0EsVUFBQTtPQUNBLFdBQUE7OztJQUdBO09BQ0EsVUFBQTs7O0lBR0EsYUFBQSxhQUFBOzs7SUFHQTtPQUNBLFVBQUE7T0FDQSxVQUFBLE1BQUE7OztJQUdBLGNBQUE7TUFDQSxRQUFBOzs7O0dBSUEsMERBQUEsU0FBQSxZQUFBLFdBQUEsUUFBQSxjQUFBO0lBQ0EsSUFBQSxNQUFBOztJQUVBLFdBQUEsU0FBQTtJQUNBLFdBQUEsZUFBQTtJQUNBLFdBQUEsY0FBQTs7O0lBR0E7T0FDQSxPQUFBLFdBQUE7UUFDQSxPQUFBLFVBQUE7U0FDQSxTQUFBLFNBQUEsS0FBQTtRQUNBLElBQUEsUUFBQSxRQUFBLEtBQUEsUUFBQSxJQUFBLFFBQUEsS0FBQSxLQUFBO1VBQ0E7OztRQUdBLFdBQUEsVUFBQTs7O0lBR0EsV0FBQSxPQUFBLFdBQUE7TUFDQSxVQUFBLElBQUEsV0FBQTs7Ozs7QUNwRUE7R0FDQSxPQUFBLGVBQUE7SUFDQTtJQUNBO0lBQ0E7O0dBRUEsMEJBQUEsU0FBQSxnQkFBQTtJQUNBO09BQ0EsTUFBQSxXQUFBO1FBQ0EsVUFBQTtRQUNBLEtBQUE7UUFDQSxhQUFBO1FBQ0EsU0FBQTtVQUNBLGFBQUE7OztPQUdBLE1BQUEsZ0JBQUE7UUFDQSxLQUFBO1FBQ0EsYUFBQTtRQUNBLFlBQUE7O09BRUEsTUFBQSx1QkFBQTtRQUNBLEtBQUE7UUFDQSxhQUFBO1FBQ0EsWUFBQTs7T0FFQSxNQUFBLG9CQUFBO1FBQ0EsS0FBQTtRQUNBLGFBQUE7UUFDQSxZQUFBOzs7O0FDN0JBO0dBQ0EsT0FBQSxjQUFBO0lBQ0E7SUFDQTs7O0dBR0EsMEJBQUEsU0FBQSxnQkFBQTtJQUNBO09BQ0EsTUFBQSxTQUFBO1FBQ0EsS0FBQTtRQUNBLGFBQUE7UUFDQSxZQUFBOzs7O0FDWEE7R0FDQSxPQUFBLGVBQUE7SUFDQTtJQUNBO0lBQ0E7OztHQUdBLDBCQUFBLFNBQUEsZ0JBQUE7SUFDQTtPQUNBLE1BQUEsd0JBQUE7UUFDQSxLQUFBO1FBQ0EsYUFBQTtRQUNBLFlBQUE7O09BRUEsTUFBQSxtQ0FBQTtRQUNBLEtBQUE7UUFDQSxhQUFBO1FBQ0EsWUFBQTs7T0FFQSxNQUFBLDhCQUFBO1FBQ0EsS0FBQTtRQUNBLGFBQUE7UUFDQSxZQUFBOztPQUVBLE1BQUEsNkJBQUE7UUFDQSxLQUFBO1FBQ0EsYUFBQTtRQUNBLFlBQUE7Ozs7OztBQ3pCQTtHQUNBLE9BQUEscUJBQUE7R0FDQSxVQUFBLGdDQUFBLFNBQUEsVUFBQTtJQUNBLE9BQUE7TUFDQSxVQUFBO01BQ0EsTUFBQSxTQUFBLE9BQUEsU0FBQSxZQUFBO1FBQ0EsTUFBQSxPQUFBLFdBQUEsb0JBQUEsU0FBQSxPQUFBO1VBQ0EsUUFBQSxLQUFBLGlCQUFBLENBQUEsQ0FBQTs7Ozs7O0FDVEE7R0FDQSxPQUFBLGdCQUFBOztHQUVBLE9BQUEsVUFBQSxXQUFBO0lBQ0EsT0FBQSxTQUFBLEdBQUE7TUFDQSxJQUFBLEtBQUEsTUFBQTtRQUNBLE9BQUE7OztNQUdBLElBQUEsRUFBQSxRQUFBLFlBQUE7O01BRUEsSUFBQSxFQUFBLFNBQUEsR0FBQTtRQUNBLE9BQUE7OztNQUdBLElBQUEsS0FBQSxFQUFBLE1BQUE7O01BRUEsR0FBQSxPQUFBLEdBQUEsR0FBQTs7TUFFQSxJQUFBLEVBQUEsVUFBQSxHQUFBO1FBQ0EsR0FBQSxPQUFBLEdBQUEsR0FBQTs7O01BR0EsT0FBQSxHQUFBLEtBQUE7Ozs7QUN2QkE7R0FDQSxPQUFBLGFBQUE7R0FDQSxRQUFBLFlBQUEsWUFBQTtJQUNBLElBQUEsV0FBQSxVQUFBLE1BQUEsR0FBQTtNQUNBLE9BQUEsS0FBQSxnQkFBQSxLQUFBLEtBQUEsYUFBQSxLQUFBLElBQUEsS0FBQTs7O0lBR0EsT0FBQTtNQUNBLG1CQUFBLFVBQUEsTUFBQTtRQUNBLE9BQUEsU0FBQSxNQUFBOzs7TUFHQSxtQkFBQSxTQUFBLE1BQUE7UUFDQSxJQUFBLElBQUEsS0FBQTtRQUNBLElBQUEsSUFBQSxLQUFBOztRQUVBLElBQUEsSUFBQSxJQUFBO1VBQ0EsSUFBQSxNQUFBOzs7UUFHQSxJQUFBLElBQUEsSUFBQTtVQUNBLElBQUEsTUFBQTs7O1FBR0EsT0FBQSxDQUFBLFNBQUEsTUFBQSxNQUFBLElBQUEsTUFBQSxHQUFBLEtBQUE7Ozs7O0FDdkJBO0dBQ0EsT0FBQSxjQUFBO0dBQ0EsUUFBQSxTQUFBLFlBQUE7SUFDQSxPQUFBLFVBQUEsT0FBQTtNQUNBLE9BQUE7UUFDQSxLQUFBLFVBQUEsTUFBQSxNQUFBO1VBQ0EsT0FBQSxNQUFBLE1BQUEsS0FBQSxVQUFBLE1BQUE7WUFDQSxPQUFBLEtBQUEsU0FBQTthQUNBOztRQUVBLE1BQUEsVUFBQSxNQUFBLEtBQUE7VUFDQSxPQUFBLE1BQUEsTUFBQSxLQUFBLFVBQUEsTUFBQTtZQUNBLE9BQUEsS0FBQSxVQUFBO2FBQ0E7O1FBRUEsTUFBQSxVQUFBLE1BQUEsS0FBQTtVQUNBLE9BQUEsTUFBQSxNQUFBLEtBQUEsVUFBQSxNQUFBO1lBQ0EsT0FBQSxLQUFBLFVBQUE7OztRQUdBLFdBQUEsU0FBQSxNQUFBLE1BQUE7VUFDQSxPQUFBLE1BQUEsTUFBQSxLQUFBLFNBQUEsTUFBQTtZQUNBLE9BQUEsS0FBQSxTQUFBOzs7UUFHQSxNQUFBLFVBQUEsTUFBQTtVQUNBLE9BQUEsTUFBQTs7UUFFQSxPQUFBLFVBQUEsTUFBQSxNQUFBO1VBQ0EsT0FBQSxNQUFBLE1BQUEsT0FBQSxVQUFBLE1BQUE7WUFDQSxPQUFBLEtBQUEsUUFBQSxLQUFBLFdBQUEsQ0FBQTs7Ozs7O0FDL0JBO0dBQ0EsT0FBQSxvQkFBQTs7R0FFQSx5QkFBQSxTQUFBLGVBQUE7SUFDQSxjQUFBLGFBQUEsS0FBQTs7O0lBR0EsY0FBQSxTQUFBLFFBQUEsT0FBQSxzQkFBQTs7O0dBR0EsUUFBQSx3Q0FBQSxTQUFBLElBQUEsWUFBQTtJQUNBLE9BQUE7O01BRUEsV0FBQSxTQUFBLFFBQUE7O1FBRUEsSUFBQSxPQUFBLElBQUEsUUFBQSxZQUFBLENBQUEsS0FBQSxPQUFBLElBQUEsUUFBQSxXQUFBLENBQUEsR0FBQTtVQUNBLE9BQUE7OztRQUdBLE9BQUEsTUFBQSxPQUFBLE1BQUEsUUFBQSxJQUFBLE9BQUE7O1FBRUEsT0FBQTs7OztNQUlBLGdCQUFBLFNBQUEsV0FBQTtRQUNBLE9BQUEsR0FBQSxPQUFBOzs7Ozs7Ozs7TUFTQSxZQUFBLFNBQUEsVUFBQTs7UUFFQSxJQUFBLE1BQUE7O1FBRUEsSUFBQSxRQUFBLFNBQUEsU0FBQSxPQUFBO1VBQ0EsT0FBQSxTQUFBLEtBQUE7VUFDQSxPQUFBLFNBQUEsS0FBQTs7Ozs7VUFLQSxJQUFBLFNBQUEsS0FBQTtZQUNBLE9BQUEsR0FBQSxPQUFBOzs7Ozs7VUFNQSxJQUFBLFFBQUEsTUFBQTtZQUNBLFNBQUEsT0FBQTs7Ozs7Ozs7O1FBU0EsT0FBQTs7OztNQUlBLGlCQUFBLFNBQUEsV0FBQTtRQUNBLE9BQUEsR0FBQSxPQUFBOzs7OztBQ25FQTtHQUNBLE9BQUEsV0FBQTtHQUNBLFFBQUEsZUFBQSxVQUFBLE1BQUE7SUFDQSxPQUFBO01BQ0EsU0FBQSxTQUFBLElBQUEsUUFBQTtRQUNBLElBQUEsTUFBQTs7UUFFQSxJQUFBLFFBQUEsU0FBQSxTQUFBO1VBQ0EsU0FBQSxPQUFBLE1BQUE7OztRQUdBLElBQUEsT0FBQSxXQUFBLEtBQUEsT0FBQSxPQUFBLElBQUE7VUFDQSxLQUFBLEtBQUE7VUFDQTs7O1FBR0EsSUFBQSxDQUFBLFFBQUEsUUFBQSxTQUFBO1VBQ0EsS0FBQSxNQUFBO1VBQ0E7OztRQUdBLE9BQUEsSUFBQSxTQUFBLE9BQUE7VUFDQSxPQUFBLElBQUEsU0FBQSxHQUFBOzs7UUFHQSxPQUFBOzs7O0FDMUJBO0FBQ0EsUUFBQSxPQUFBLFlBQUEsSUFBQSxDQUFBLFlBQUEsU0FBQSxVQUFBO0VBQ0EsSUFBQSxrQkFBQTtJQUNBLE1BQUE7SUFDQSxLQUFBO0lBQ0EsS0FBQTtJQUNBLEtBQUE7SUFDQSxNQUFBO0lBQ0EsT0FBQTs7RUFFQSxTQUFBLE1BQUEsV0FBQTtJQUNBLG9CQUFBO01BQ0EsU0FBQTtRQUNBO1FBQ0E7O01BRUEsT0FBQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBOztNQUVBLFNBQUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7O01BRUEsWUFBQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBOztNQUVBLGNBQUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7O01BRUEsWUFBQTtNQUNBLFlBQUE7TUFDQSxVQUFBO01BQ0EsY0FBQTtNQUNBLGNBQUE7TUFDQSxTQUFBO01BQ0EsYUFBQTtNQUNBLGFBQUE7O0lBRUEsa0JBQUE7TUFDQSxnQkFBQTtNQUNBLGVBQUE7TUFDQSxhQUFBO01BQ0EsWUFBQSxDQUFBO1FBQ0EsU0FBQTtRQUNBLFVBQUE7UUFDQSxXQUFBO1FBQ0EsV0FBQTtRQUNBLFdBQUE7UUFDQSxVQUFBO1FBQ0EsVUFBQTtRQUNBLFVBQUE7UUFDQSxVQUFBO1FBQ0EsVUFBQTtTQUNBO1FBQ0EsU0FBQTtRQUNBLFVBQUE7UUFDQSxXQUFBO1FBQ0EsV0FBQTtRQUNBLFdBQUE7UUFDQSxVQUFBO1FBQ0EsVUFBQTtRQUNBLFVBQUE7UUFDQSxVQUFBO1FBQ0EsVUFBQTs7O0lBR0EsTUFBQTtJQUNBLGFBQUEsU0FBQSxHQUFBO01BQ0EsT0FBQSxnQkFBQTs7Ozs7QUNyR0E7R0FDQSxPQUFBLHFCQUFBLENBQUE7O0NBRUEsUUFBQSxxREFBQSxTQUFBLE9BQUEsZ0JBQUEsUUFBQTtFQUNBLE9BQUE7T0FDQTtPQUNBO09BQ0EsS0FBQSxTQUFBLEtBQUE7UUFDQSxJQUFBLGFBQUEsd0VBQUEsTUFBQTs7UUFFQSxXQUFBLFFBQUEsU0FBQSxLQUFBO1VBQ0EsSUFBQSxLQUFBLFFBQUE7WUFDQSxNQUFBO1lBQ0EsT0FBQTs7OztRQUlBLE9BQUEsTUFBQSxJQUFBOztPQUVBLE1BQUEsU0FBQSxLQUFBO1FBQ0EsT0FBQSxNQUFBLElBQUEsT0FBQTs7OztBQ3BCQTtHQUNBLE9BQUEsb0JBQUEsQ0FBQTs7R0FFQSxRQUFBLGdDQUFBLFNBQUEsV0FBQTtJQUNBLE9BQUEsVUFBQSxZQUFBLFNBQUE7OztHQUdBLFFBQUEsNEJBQUEsVUFBQSxXQUFBO0lBQ0EsT0FBQSxVQUFBLFlBQUEsU0FBQSxXQUFBLElBQUE7TUFDQSxPQUFBO1FBQ0EsU0FBQTs7Ozs7R0FLQSxRQUFBLDJCQUFBLFVBQUEsV0FBQTtJQUNBLE9BQUEsVUFBQSxZQUFBLFNBQUEsZUFBQTtNQUNBLElBQUE7T0FDQTtNQUNBLFFBQUE7UUFDQSxRQUFBOzs7OztHQUtBLFFBQUEsNEJBQUEsU0FBQSxXQUFBO0lBQ0EsT0FBQSxVQUFBLFlBQUEsU0FBQSxZQUFBLElBQUE7TUFDQSxPQUFBO1FBQ0EsU0FBQTs7Ozs7R0FLQSxRQUFBLG1DQUFBLFNBQUEsV0FBQTtJQUNBLE9BQUEsVUFBQSxZQUFBLFNBQUEsd0JBQUE7TUFDQSxJQUFBOzs7O0dBSUEsUUFBQSxvQ0FBQSxTQUFBLFdBQUE7SUFDQSxPQUFBLFVBQUEsWUFBQSxTQUFBOzs7R0FHQSxRQUFBLCtCQUFBLFNBQUEsV0FBQTtJQUNBLE9BQUEsVUFBQSxZQUFBLFNBQUEseUJBQUE7TUFDQSxVQUFBOzs7O0dBSUEsUUFBQSw4QkFBQSxTQUFBLFdBQUE7SUFDQSxPQUFBLFVBQUEsWUFBQSxTQUFBLGlDQUFBO01BQ0EsVUFBQTtNQUNBLFFBQUE7T0FDQTtNQUNBLFFBQUE7UUFDQSxRQUFBOzs7OztBQ3REQTtHQUNBLE9BQUE7O0dBRUEsV0FBQSx3R0FBQSxTQUFBLFFBQUEsV0FBQSxRQUFBO0lBQ0EsWUFBQSxXQUFBLGFBQUE7SUFDQSxJQUFBLEtBQUE7SUFDQSxJQUFBLE1BQUEsVUFBQTs7SUFFQSxHQUFBLFlBQUEsU0FBQSxJQUFBLGNBQUE7O0lBRUEsSUFBQSxHQUFBLE9BQUEsU0FBQSx3QkFBQTtNQUNBLEdBQUEsWUFBQTtXQUNBO01BQ0EsR0FBQSxVQUFBLFNBQUEsSUFBQSxZQUFBO01BQ0EsR0FBQSxlQUFBLFNBQUEsSUFBQSxpQkFBQTs7TUFFQSxHQUFBLG1CQUFBLElBQUEsb0JBQUE7O01BRUEsR0FBQSxTQUFBLFlBQUEsS0FBQSxVQUFBLEdBQUE7TUFDQSxHQUFBLGNBQUEsWUFBQSxLQUFBO01BQ0EsR0FBQSxPQUFBLFlBQUEsS0FBQSxRQUFBLEdBQUE7TUFDQSxHQUFBLFlBQUEsWUFBQSxLQUFBOzs7TUFHQSxHQUFBLFlBQUEsWUFBQSxLQUFBLGFBQUEsR0FBQTtNQUNBLEdBQUEsaUJBQUEsWUFBQSxLQUFBOztNQUVBLFdBQUEsVUFBQTtNQUNBLFdBQUEsUUFBQTs7TUFFQSxXQUFBLGFBQUE7O01BRUEsR0FBQSxTQUFBOzs7SUFHQSxHQUFBLE9BQUEsU0FBQSxJQUFBLFNBQUE7SUFDQSxHQUFBLE9BQUEsU0FBQSxJQUFBLFNBQUE7SUFDQSxHQUFBLFFBQUEsWUFBQSxLQUFBO0lBQ0EsR0FBQSxZQUFBLFlBQUEsS0FBQSxRQUFBLEdBQUE7O0lBRUEsR0FBQSxjQUFBO0lBQ0EsR0FBQSxjQUFBO0lBQ0EsR0FBQSxlQUFBO0lBQ0EsR0FBQSxnQkFBQTs7SUFFQTs7SUFFQSxTQUFBLFFBQUE7TUFDQSxJQUFBLFNBQUE7UUFDQSxlQUFBLEdBQUE7UUFDQSxjQUFBLEdBQUE7UUFDQSxNQUFBLEdBQUE7O1FBRUEsaUJBQUEsR0FBQTs7O01BR0EsSUFBQSxHQUFBLE9BQUEsU0FBQSxpQkFBQTtRQUNBLFFBQUEsT0FBQSxRQUFBO1VBQ0EsZUFBQSxHQUFBO1VBQ0EsY0FBQSxHQUFBOztVQUVBLGtCQUFBLEdBQUE7Ozs7TUFJQSxVQUFBLE9BQUE7O01BRUE7U0FDQSxNQUFBO1NBQ0E7U0FDQSxLQUFBLFNBQUEsSUFBQTtVQUNBLEdBQUEsTUFBQSxRQUFBLFNBQUEsTUFBQTtZQUNBLEtBQUEsY0FBQSxZQUFBLEtBQUEsVUFBQSxLQUFBOzs7VUFHQSxHQUFBLFFBQUEsR0FBQTtVQUNBLEdBQUEsY0FBQSxHQUFBOztVQUVBLElBQUEsTUFBQSxHQUFBLGNBQUEsR0FBQTtVQUNBLEdBQUEsYUFBQSxHQUFBLGNBQUEsR0FBQSxTQUFBLElBQUEsT0FBQSxLQUFBLE1BQUEsT0FBQTs7U0FFQSxNQUFBLFNBQUEsS0FBQTtVQUNBLE9BQUEsTUFBQSxJQUFBLEtBQUEsT0FBQTs7OztJQUlBLFNBQUEsV0FBQSxNQUFBLE9BQUE7TUFDQSxHQUFBLE9BQUEsTUFBQSxTQUFBLE1BQUE7UUFDQSxJQUFBLENBQUEsTUFBQTtVQUNBOzs7UUFHQSxHQUFBLFNBQUEsS0FBQTs7Ozs7SUFLQSxTQUFBLGNBQUEsTUFBQTtNQUNBLElBQUEsUUFBQSxhQUFBO1FBQ0E7V0FDQSxPQUFBO1lBQ0EsVUFBQSxLQUFBO2FBQ0E7WUFDQSxRQUFBOztXQUVBO1dBQ0EsS0FBQSxTQUFBLEtBQUE7WUFDQSxPQUFBLFFBQUEsSUFBQSxPQUFBOztZQUVBOztXQUVBLE1BQUEsU0FBQSxLQUFBO1lBQ0EsT0FBQSxNQUFBLElBQUEsT0FBQTs7Ozs7O0lBTUEsU0FBQSxhQUFBLE1BQUE7TUFDQSxJQUFBLG1CQUFBLE9BQUEsS0FBQTtRQUNBLGFBQUE7UUFDQSxZQUFBO1FBQ0EsVUFBQTtRQUNBLFNBQUE7VUFDQSxhQUFBLFdBQUE7WUFDQSxPQUFBOzs7OztNQUtBLGlCQUFBLE9BQUEsS0FBQSxXQUFBOzs7UUFHQTs7Ozs7SUFLQSxTQUFBLFlBQUEsTUFBQTtNQUNBLEdBQUEsT0FBQTtNQUNBLEdBQUEsT0FBQTs7TUFFQTs7OztJQUlBLFNBQUEsWUFBQSxNQUFBO01BQ0EsR0FBQSxPQUFBOztNQUVBOzs7O0lBSUEsU0FBQSxTQUFBO01BQ0EsR0FBQSxPQUFBOztNQUVBOzs7O0dBSUEsV0FBQSw0R0FBQSxTQUFBLFFBQUEsV0FBQSxRQUFBO0dBQ0Esb0JBQUEsY0FBQTtJQUNBLElBQUEsS0FBQTs7SUFFQSxHQUFBLGVBQUE7SUFDQSxHQUFBLFVBQUE7SUFDQSxHQUFBLFdBQUE7O0lBRUE7O0lBRUEsU0FBQSxRQUFBO01BQ0EsT0FBQTtTQUNBO1NBQ0E7U0FDQSxLQUFBLFNBQUEsS0FBQTtVQUNBLEdBQUEsUUFBQTs7U0FFQSxNQUFBLFNBQUEsS0FBQTtVQUNBLE9BQUEsTUFBQSxJQUFBLE9BQUE7Ozs7O0lBS0EsU0FBQSxTQUFBLFVBQUEsS0FBQTtNQUNBLElBQUEsZUFBQSxPQUFBLEtBQUE7UUFDQSxhQUFBO1FBQ0EsWUFBQTtRQUNBLFVBQUE7UUFDQSxTQUFBO1VBQ0EsYUFBQSxXQUFBO1lBQ0EsT0FBQTtjQUNBLFVBQUE7Y0FDQSxLQUFBOzs7Ozs7TUFNQSxhQUFBLE9BQUEsS0FBQSxXQUFBO1FBQ0E7Ozs7O0lBS0EsU0FBQSxRQUFBLFVBQUEsS0FBQTtNQUNBLElBQUEsUUFBQSxXQUFBLENBQUEsSUFBQSxPQUFBLElBQUEsUUFBQSxJQUFBLE9BQUEsS0FBQSxPQUFBLE1BQUE7UUFDQSxPQUFBO1dBQ0EsT0FBQTtZQUNBLFVBQUE7WUFDQSxRQUFBLElBQUE7O1dBRUE7V0FDQSxLQUFBLFNBQUEsS0FBQTtZQUNBLE9BQUEsUUFBQSxJQUFBLE9BQUE7O1lBRUE7O1dBRUEsTUFBQSxTQUFBLEtBQUE7WUFDQSxPQUFBLE1BQUEsSUFBQSxPQUFBOzs7Ozs7SUFNQSxTQUFBLGFBQUEsTUFBQTtNQUNBLElBQUEsbUJBQUEsT0FBQSxLQUFBO1FBQ0EsYUFBQTtRQUNBLFlBQUE7UUFDQSxVQUFBO1FBQ0EsU0FBQTtVQUNBLGFBQUEsV0FBQTtZQUNBLE9BQUE7Ozs7O01BS0EsaUJBQUEsT0FBQSxLQUFBLFdBQUE7UUFDQTs7Ozs7O0dBTUEsV0FBQSw4RkFBQSxTQUFBLFFBQUEsZ0JBQUEsUUFBQSxtQkFBQSxhQUFBO0lBQ0EsSUFBQSxLQUFBOztJQUVBLFFBQUEsT0FBQSxJQUFBOztJQUVBLEdBQUEsZUFBQTtJQUNBLEdBQUEsU0FBQTs7SUFFQSxTQUFBLGVBQUE7TUFDQSxHQUFBLHNCQUFBOztNQUVBO1NBQ0EsS0FBQTtVQUNBLFVBQUEsWUFBQTtXQUNBO1VBQ0EsUUFBQSxHQUFBOztTQUVBO1NBQ0EsS0FBQSxTQUFBLEtBQUE7VUFDQSxPQUFBLFFBQUEsSUFBQSxPQUFBOztVQUVBLGVBQUE7O1NBRUEsTUFBQSxTQUFBLEtBQUE7VUFDQSxHQUFBLHNCQUFBOztVQUVBLE9BQUEsTUFBQSxJQUFBLE9BQUE7Ozs7SUFJQSxTQUFBLFNBQUE7TUFDQSxlQUFBOzs7OztHQUtBLFdBQUEsMkhBQUEsU0FBQSxRQUFBLGdCQUFBLFFBQUE7SUFDQSxjQUFBLGFBQUEsYUFBQTtJQUNBLElBQUEsS0FBQTs7SUFFQSxHQUFBLGFBQUEsWUFBQSxLQUFBO0lBQ0EsR0FBQSxjQUFBLFlBQUEsS0FBQTtJQUNBLEdBQUEsYUFBQSxZQUFBLEtBQUE7O0lBRUEsSUFBQSxZQUFBLEtBQUE7TUFDQSxHQUFBLFFBQUE7O01BRUEsWUFBQSxTQUFBLFlBQUEsSUFBQTtNQUNBLFlBQUEsVUFBQSxZQUFBLElBQUE7TUFDQSxZQUFBLFNBQUEsWUFBQSxJQUFBO1dBQ0E7TUFDQSxHQUFBLFFBQUE7OztJQUdBLEdBQUEsU0FBQTtJQUNBLEdBQUEsU0FBQTs7SUFFQSxTQUFBLFNBQUE7TUFDQSxJQUFBLFlBQUEsS0FBQTtRQUNBO1dBQ0EsT0FBQTtZQUNBLFVBQUEsWUFBQTtZQUNBLFFBQUEsWUFBQSxJQUFBO2FBQ0E7WUFDQSxPQUFBLEdBQUEsTUFBQTtZQUNBLFFBQUEsR0FBQSxNQUFBO1lBQ0EsT0FBQSxHQUFBLE1BQUE7O1dBRUE7V0FDQSxLQUFBLFNBQUEsS0FBQTtZQUNBLE9BQUEsUUFBQSxJQUFBLE9BQUE7O1lBRUEsZUFBQTs7V0FFQSxNQUFBLFNBQUEsS0FBQTtZQUNBLE9BQUEsTUFBQSxJQUFBLE9BQUE7O2FBRUE7UUFDQTtXQUNBLEtBQUE7WUFDQSxVQUFBLFlBQUE7YUFDQTtZQUNBLE9BQUEsR0FBQSxNQUFBO1lBQ0EsUUFBQSxHQUFBLE1BQUE7WUFDQSxPQUFBLEdBQUEsTUFBQTs7V0FFQTtXQUNBLEtBQUEsU0FBQSxLQUFBO1lBQ0EsT0FBQSxRQUFBLElBQUEsT0FBQTs7WUFFQSxlQUFBOztXQUVBLE1BQUEsU0FBQSxLQUFBO1lBQ0EsT0FBQSxNQUFBLElBQUEsT0FBQTs7Ozs7SUFLQSxTQUFBLFlBQUEsV0FBQSxPQUFBO01BQ0EsR0FBQSxhQUFBLFlBQUEsVUFBQSxXQUFBOzs7SUFHQSxTQUFBLFNBQUE7TUFDQSxlQUFBOzs7Ozs7QUMzVkE7R0FDQSxPQUFBOztHQUVBLFdBQUEsNkVBQUEsVUFBQSxRQUFBLElBQUEsV0FBQSxVQUFBLFFBQUEsVUFBQTtJQUNBLElBQUEsS0FBQTs7SUFFQSxHQUFBLFFBQUE7O0lBRUEsU0FBQSxRQUFBO01BQ0EsT0FBQTtTQUNBLEtBQUE7VUFDQSxRQUFBLEdBQUE7VUFDQSxVQUFBLEdBQUE7O1NBRUE7U0FDQSxLQUFBLFNBQUEsS0FBQTtVQUNBLE9BQUEsUUFBQSxJQUFBLE9BQUE7O1VBRUEsU0FBQSxXQUFBO1lBQ0EsVUFBQSxJQUFBO2FBQ0E7O1NBRUEsTUFBQSxTQUFBLEtBQUE7VUFDQSxPQUFBLE1BQUEsSUFBQSxPQUFBOzs7O0FDdkJBO0dBQ0EsT0FBQSxtQkFBQSxDQUFBO0dBQ0EsUUFBQSwwQkFBQSxVQUFBLFdBQUE7SUFDQSxPQUFBLFVBQUEsWUFBQSxTQUFBOztBQ0hBO0dBQ0EsT0FBQTs7R0FFQSxRQUFBLG9GQUFBLFNBQUEsTUFBQSxjQUFBLFdBQUEsSUFBQSxxQkFBQTtJQUNBLE9BQUEsU0FBQSxJQUFBLFFBQUEsYUFBQTtNQUNBLElBQUEsWUFBQSxhQUFBO01BQ0EsSUFBQSxTQUFBLGFBQUE7O01BRUEsSUFBQSxZQUFBLENBQUEsV0FBQSxRQUFBLEtBQUE7O01BRUEsSUFBQSxZQUFBLG9CQUFBLElBQUE7O01BRUEsUUFBQSxPQUFBLElBQUEsYUFBQSxVQUFBLGdCQUFBOzs7TUFHQSxTQUFBLE9BQUE7UUFDQSxJQUFBLE9BQUEsb0JBQUEsSUFBQSxjQUFBO1FBQ0EsS0FBQSxlQUFBLEdBQUEsUUFBQSxJQUFBOztRQUVBLG9CQUFBLElBQUEsV0FBQTs7UUFFQSxLQUFBLElBQUEsY0FBQSxXQUFBLEtBQUE7OztNQUdBLElBQUEsUUFBQSxVQUFBLE1BQUE7OztNQUdBLEdBQUEsSUFBQSx3QkFBQSxXQUFBO1FBQ0EsVUFBQSxPQUFBOzs7Ozs7QUM1QkE7R0FDQSxPQUFBOztHQUVBLFdBQUEsMEZBQUEsU0FBQSxRQUFBLGNBQUEsZ0JBQUEscUJBQUE7SUFDQSxJQUFBLEtBQUE7O0lBRUEsSUFBQSxZQUFBLGFBQUE7SUFDQSxJQUFBLFNBQUEsYUFBQTtJQUNBLElBQUEsWUFBQSxDQUFBLFdBQUEsUUFBQSxLQUFBOztJQUVBLEdBQUEsUUFBQSxLQUFBLE1BQUEsZUFBQSxJQUFBOztJQUVBLEdBQUEsTUFBQTs7SUFFQSxHQUFBLGtCQUFBO0lBQ0EsR0FBQSxTQUFBOztJQUVBLFNBQUEsa0JBQUE7TUFDQSxHQUFBLHFCQUFBLENBQUEsR0FBQTs7O0lBR0EsU0FBQSxTQUFBO01BQ0EsSUFBQSxpQkFBQSxvQkFBQSxJQUFBOztNQUVBLElBQUEsVUFBQSxlQUFBLFFBQUEsS0FBQTs7TUFFQSxNQUFBLGVBQUE7O01BRUEsSUFBQSxPQUFBLElBQUE7TUFDQSxLQUFBLFVBQUE7TUFDQSxLQUFBLFdBQUEsUUFBQSxPQUFBLFFBQUEsWUFBQSxPQUFBOztNQUVBLElBQUEsS0FBQSxJQUFBO01BQ0EsR0FBQSxPQUFBLFNBQUEsVUFBQSx1QkFBQSxLQUFBLE1BQUE7O01BRUEsU0FBQSxNQUFBO1FBQ0EsTUFBQSxXQUFBLEtBQUEsVUFBQTs7O01BR0EsU0FBQSxPQUFBO1FBQ0EsTUFBQSxXQUFBLEtBQUEsVUFBQTs7Ozs7R0FLQSxXQUFBLHdEQUFBLFNBQUEsUUFBQSxlQUFBO0lBQ0EsSUFBQSxLQUFBO0lBQ0EsSUFBQSxTQUFBOztJQUVBLGNBQUEsSUFBQSxRQUFBOzs7SUFHQSxHQUFBLGtCQUFBLFNBQUEsUUFBQSxJQUFBO01BQ0EsT0FBQTtNQUNBLE9BQUE7O01BRUEsSUFBQSxHQUFBLGdCQUFBO1FBQ0E7OztNQUdBLEdBQUEsTUFBQTs7OztHQUlBLFdBQUEsbUdBQUEsU0FBQSxRQUFBLE1BQUEsY0FBQSxnQkFBQSxxQkFBQTtJQUNBLElBQUEsS0FBQTs7SUFFQSxJQUFBLGVBQUE7SUFDQSxJQUFBLFlBQUEsYUFBQTtJQUNBLElBQUEsU0FBQSxhQUFBOztJQUVBLElBQUEsWUFBQSxDQUFBLFdBQUEsUUFBQSxLQUFBO0lBQ0EsSUFBQSxnQkFBQSxDQUFBLFdBQUEsT0FBQSxLQUFBO0lBQ0EsSUFBQSxZQUFBLG9CQUFBLElBQUE7O0lBRUEsSUFBQSxZQUFBLEtBQUEsTUFBQSxlQUFBLElBQUE7SUFDQSxJQUFBLGNBQUEsVUFBQSxLQUFBLFNBQUEsTUFBQTtNQUNBLE9BQUEsS0FBQSxPQUFBOztJQUVBLEdBQUEsUUFBQSxlQUFBLFlBQUE7O0lBRUEsR0FBQSxPQUFBOztJQUVBLFFBQUEsT0FBQSxHQUFBLE1BQUEsYUFBQSxVQUFBLGlCQUFBOztJQUVBLElBQUEsaUJBQUEsb0JBQUEsSUFBQTtJQUNBLEdBQUEsY0FBQSxFQUFBLElBQUEsZ0JBQUEsU0FBQSxNQUFBLEtBQUE7TUFDQSxPQUFBO1FBQ0EsSUFBQTtRQUNBLE1BQUEsY0FBQTtRQUNBLFFBQUE7Ozs7SUFJQSxHQUFBLE1BQUEsUUFBQSxTQUFBLE1BQUE7TUFDQSxLQUFBLE1BQUEsUUFBQSxTQUFBLE1BQUE7UUFDQSxHQUFBLEtBQUEsS0FBQSxNQUFBLEdBQUEsS0FBQSxLQUFBLE9BQUEsRUFBQSxPQUFBOzs7O0lBSUEsR0FBQSxhQUFBOztJQUVBLFNBQUEsY0FBQSxTQUFBO01BQ0EsT0FBQSxVQUFBLEtBQUEsU0FBQSxNQUFBLEVBQUEsT0FBQSxLQUFBLE9BQUEsWUFBQTs7O0lBR0EsU0FBQSxXQUFBLE1BQUEsTUFBQTs7OztNQUlBLFVBQUEsT0FBQSxXQUFBLG9CQUFBLGtCQUFBO1FBQ0EsVUFBQTtRQUNBLGtCQUFBLE9BQUEsZ0JBQUE7UUFDQSxhQUFBLE9BQUEsa0JBQUE7UUFDQSxZQUFBO1FBQ0EsY0FBQSxPQUFBLGFBQUE7OztRQUdBLGtCQUFBOzs7TUFHQSxTQUFBLG1CQUFBLFFBQUE7UUFDQSxHQUFBLEtBQUEsS0FBQSxNQUFBLEdBQUEsS0FBQSxLQUFBLE9BQUE7UUFDQSxHQUFBLEtBQUEsS0FBQSxJQUFBLFFBQUE7UUFDQSxHQUFBOztRQUVBLFVBQUEsS0FBQSxNQUFBLFVBQUEsS0FBQSxPQUFBO1FBQ0EsVUFBQSxLQUFBLElBQUEsS0FBQSxNQUFBLFFBQUEsT0FBQSxVQUFBLEtBQUEsSUFBQSxLQUFBLE9BQUEsSUFBQSxHQUFBLEtBQUEsS0FBQTs7UUFFQSxvQkFBQSxJQUFBLFdBQUE7OztNQUdBLFNBQUEsbUJBQUE7UUFDQSxRQUFBLElBQUEsU0FBQTs7Ozs7R0FLQSxXQUFBLHdHQUFBLFNBQUEsUUFBQSxNQUFBLGNBQUEsZ0JBQUEscUJBQUEsUUFBQTtJQUNBLElBQUEsS0FBQTs7SUFFQSxJQUFBLGVBQUEsYUFBQTtJQUNBLElBQUEsWUFBQSxhQUFBO0lBQ0EsSUFBQSxTQUFBLGFBQUE7O0lBRUEsSUFBQSxZQUFBLENBQUEsV0FBQSxRQUFBLEtBQUE7SUFDQSxJQUFBLGdCQUFBLENBQUEsV0FBQSxPQUFBLEtBQUE7SUFDQSxJQUFBLFlBQUEsb0JBQUEsSUFBQTs7O0lBR0EsSUFBQSxjQUFBLEtBQUEsTUFBQSxlQUFBLElBQUEsa0JBQUEsS0FBQSxTQUFBLE1BQUEsRUFBQSxPQUFBLEtBQUEsT0FBQTtJQUNBLEdBQUEsUUFBQSxlQUFBLFlBQUE7O0lBRUEsR0FBQSxPQUFBOztJQUVBLFFBQUEsT0FBQSxHQUFBLE1BQUEsYUFBQSxVQUFBLGlCQUFBOzs7SUFHQSxHQUFBLE9BQUEsUUFBQSxTQUFBLEdBQUE7TUFDQSxLQUFBLElBQUEsZUFBQSxLQUFBLFVBQUE7O01BRUE7O01BRUE7T0FDQTs7Ozs7Ozs7Ozs7Ozs7SUFjQSxTQUFBLE9BQUE7TUFDQSxJQUFBLE9BQUEsb0JBQUEsSUFBQSxjQUFBO01BQ0EsS0FBQSxnQkFBQSxHQUFBOztNQUVBLG9CQUFBLElBQUEsV0FBQTs7TUFFQSxLQUFBLElBQUEsY0FBQSxXQUFBLEtBQUE7OztJQUdBLFNBQUEsV0FBQTtNQUNBLElBQUEsT0FBQSxvQkFBQSxJQUFBLGtCQUFBO01BQ0EsSUFBQSxZQUFBOztNQUVBLEVBQUEsS0FBQSxHQUFBLE1BQUEsU0FBQSxNQUFBLEtBQUE7UUFDQSxJQUFBLFNBQUEsS0FBQSxZQUFBLEdBQUE7VUFDQSxLQUFBLEtBQUE7VUFDQSxVQUFBLEtBQUE7Ozs7TUFJQSxLQUFBLGdCQUFBLGFBQUE7O01BRUEsb0JBQUEsSUFBQSxlQUFBOztNQUVBLEtBQUEsSUFBQSxpQkFBQSxlQUFBLEtBQUE7OztJQUdBLEdBQUEsY0FBQTtJQUNBLEdBQUEsZUFBQTs7O0lBR0EsSUFBQSxpQkFBQTtJQUNBLFNBQUEsWUFBQSxPQUFBLE1BQUEsWUFBQTs7TUFFQSxXQUFBLFdBQUE7UUFDQSxJQUFBLGtCQUFBLFNBQUEsR0FBQSxLQUFBLFdBQUEsSUFBQSxZQUFBLEdBQUE7VUFDQTs7O1FBR0EsaUJBQUE7O1FBRUEsSUFBQSxtQkFBQSxPQUFBLEtBQUE7VUFDQSxhQUFBO1VBQ0EsWUFBQTtVQUNBLFVBQUE7VUFDQSxTQUFBO1lBQ0EsYUFBQSxXQUFBO2NBQ0EsT0FBQSxRQUFBLE9BQUE7Z0JBQ0EsV0FBQSxLQUFBO2dCQUNBLFlBQUEsS0FBQTtnQkFDQSxPQUFBO2lCQUNBLFlBQUEsR0FBQSxLQUFBLFdBQUE7Ozs7O1FBS0EsaUJBQUEsT0FBQTtVQUNBLFNBQUEsTUFBQTtZQUNBLFFBQUEsT0FBQSxHQUFBLEtBQUEsV0FBQSxLQUFBLE1BQUE7Y0FDQSxNQUFBLFdBQUE7O1lBRUEsaUJBQUE7O1VBRUEsV0FBQTtZQUNBLGlCQUFBOzs7Ozs7SUFNQSxTQUFBLGFBQUEsTUFBQTs7TUFFQSxJQUFBLFNBQUEsR0FBQSxLQUFBLEtBQUEsSUFBQSxZQUFBLEdBQUE7UUFDQSxHQUFBLEtBQUEsS0FBQSxJQUFBLFFBQUE7UUFDQSxHQUFBLEtBQUEsS0FBQSxJQUFBLFNBQUE7UUFDQSxHQUFBLEtBQUEsS0FBQSxJQUFBLE9BQUE7UUFDQSxHQUFBLEtBQUEsS0FBQSxJQUFBLFFBQUE7Ozs7O0dBS0EsV0FBQSxtRUFBQSxTQUFBLFFBQUEsZ0JBQUEsYUFBQTtJQUNBLElBQUEsS0FBQTs7SUFFQSxRQUFBLE9BQUEsSUFBQTs7SUFFQSxHQUFBLFNBQUE7SUFDQSxHQUFBLFNBQUE7O0lBRUEsU0FBQSxTQUFBO01BQ0EsZUFBQSxNQUFBO1FBQ0EsT0FBQSxHQUFBO1FBQ0EsUUFBQSxHQUFBO1FBQ0EsTUFBQSxHQUFBOzs7UUFHQSxPQUFBOzs7O0lBSUEsU0FBQSxTQUFBO01BQ0EsZUFBQTs7Ozs7Ozs7O0FDdlJBO0dBQ0EsT0FBQSxvQkFBQSxDQUFBOztHQUVBLFFBQUEsNEJBQUEsU0FBQSxXQUFBO0lBQ0EsT0FBQSxVQUFBOzs7Ozs7QUNBQTtHQUNBLE9BQUEsZ0JBQUEsQ0FBQTs7O0dBR0EsMEJBQUEsVUFBQSxnQkFBQTtJQUNBO09BQ0EsTUFBQSxXQUFBO1FBQ0EsS0FBQTtRQUNBLGFBQUE7UUFDQSxZQUFBOzs7OztHQUtBLFdBQUEsMEJBQUEsVUFBQSxRQUFBO0lBQ0EsUUFBQSxJQUFBOzs7O0FBSUEiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8g5bqU55So5YWl5Y+jXG4vLyBNb2R1bGU6IGd1bHVcbi8vIERlcGVuZGVuY2llczpcbi8vICAgIG5nUm91dGUsIGh0dHBJbnRlcmNlcHRvcnMsIGd1bHUubWlzc2luZ1xuXG4vKiBnbG9iYWwgZmFsbGJhY2tIYXNoICovXG5hbmd1bGFyXG4gIC5tb2R1bGUoJ2d1bHUnLCBbXG4gICAgJ3VpLnJvdXRlcicsXG4gICAgJ25nTG9jYWxlJyxcbiAgICAndG9hc3RyJyxcbiAgICAndWkuYm9vdHN0cmFwJyxcbiAgICAnY3VzdG9tLmRpcmVjdGl2ZXMnLFxuICAgICdodHRwSW50ZXJjZXB0b3JzJyxcbiAgICAnTG9jYWxTdG9yYWdlTW9kdWxlJyxcbiAgICAnY2hpZWZmYW5jeXBhbnRzLmxvYWRpbmdCYXInLFxuICAgICd1dGlsLmZpbHRlcnMnLFxuICAgICd1dGlsLmRhdGUnLFxuICAgICdndWx1LmluZGVudCcsXG4gICAgJ2d1bHUucmVwb3J0JyxcbiAgICAnZ3VsdS5sb2dpbicsXG4gICAgJ2d1bHUubWlzc2luZydcbiAgXSlcbiAgLmNvbmZpZyhmdW5jdGlvbigkbG9jYXRpb25Qcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyLCAkbG9nUHJvdmlkZXIsIGxvY2FsU3RvcmFnZVNlcnZpY2VQcm92aWRlcikge1xuICAgIC8vIG5vdCB1c2UgaHRtbDUgaGlzdG9yeSBhcGlcbiAgICAvLyBidXQgdXNlIGhhc2hiYW5nXG4gICAgJGxvY2F0aW9uUHJvdmlkZXJcbiAgICAgIC5odG1sNU1vZGUoZmFsc2UpXG4gICAgICAuaGFzaFByZWZpeCgnIScpO1xuXG4gICAgLy8gZGVmaW5lIDQwNFxuICAgICR1cmxSb3V0ZXJQcm92aWRlclxuICAgICAgLm90aGVyd2lzZSgnL2xvZ2luJyk7XG5cbiAgICAvLyBsb2dnZXJcbiAgICAkbG9nUHJvdmlkZXIuZGVidWdFbmFibGVkKHRydWUpO1xuXG4gICAgLy8gbG9jYWxTdG9yYWdlIHByZWZpeFxuICAgIGxvY2FsU3RvcmFnZVNlcnZpY2VQcm92aWRlclxuICAgICAgLnNldFByZWZpeCgnZ3VsdS50ZXN0ZXInKVxuICAgICAgLnNldE5vdGlmeSh0cnVlLCB0cnVlKTtcblxuICAgIC8vIEFQSSBTZXJ2ZXJcbiAgICBBUElfU0VSVkVSUyA9IHtcbiAgICAgIHRlc3RlcjogJ2h0dHA6Ly90LmlmZGl1LmNvbSdcbiAgICAgIC8vIHRlc3RlcjogJ2h0dHA6Ly9vLmRwOjMwMDAnXG4gICAgfVxuICB9KVxuICAucnVuKGZ1bmN0aW9uKCRyb290U2NvcGUsICRsb2NhdGlvbiwgJHN0YXRlLCAkc3RhdGVQYXJhbXMpIHtcbiAgICB2YXIgcmVnID0gL1tcXCZcXD9dXz1cXGQrLztcblxuICAgICRyb290U2NvcGUuJHN0YXRlID0gJHN0YXRlO1xuICAgICRyb290U2NvcGUuJHN0YXRlUGFyYW1zID0gJHN0YXRlUGFyYW1zO1xuICAgICRyb290U2NvcGUuaXNDb2xsYXBzZWQgPSB0cnVlO1xuXG4gICAgLy8g55So5LqO6L+U5Zue5LiK5bGC6aG16Z2iXG4gICAgJHJvb3RTY29wZVxuICAgICAgLiR3YXRjaChmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuICRsb2NhdGlvbi51cmwoKTtcbiAgICAgIH0sIGZ1bmN0aW9uKGN1cnJlbnQsIG9sZCkge1xuICAgICAgICBpZiAoY3VycmVudC5yZXBsYWNlKHJlZywgJycpID09PSBvbGQucmVwbGFjZShyZWcsICcnKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgICRyb290U2NvcGUuYmFja1VybCA9IG9sZDtcbiAgICAgIH0pO1xuXG4gICAgJHJvb3RTY29wZS5iYWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICAkbG9jYXRpb24udXJsKCRyb290U2NvcGUuYmFja1VybCk7XG4gICAgfVxuICB9KTtcblxuIiwiYW5ndWxhclxuICAubW9kdWxlKCdndWx1LmluZGVudCcsIFtcbiAgICAndWkucm91dGVyJyxcbiAgICAnZ3VsdS5pbmRlbnQuc3ZjcycsXG4gICAgJ2d1bHUuaW5kZW50LmVudW1zJ1xuICBdKVxuICAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXJcbiAgICAgIC5zdGF0ZSgnaW5kZW50cycsIHtcbiAgICAgICAgYWJzdHJhY3Q6IHRydWUsXG4gICAgICAgIHVybDogJy9pbmRlbnRzJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdpbmRlbnQvZGFzaGJvYXJkLmh0bScsXG4gICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICBJbmRlbnRFbnVtczogJ0luZGVudEVudW1zJ1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLnN0YXRlKCdpbmRlbnRzLmxpc3QnLCB7XG4gICAgICAgIHVybDogJycsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnaW5kZW50L3NlYXJjaC5odG0nLFxuICAgICAgICBjb250cm9sbGVyOiAnSW5kZW50TGlzdEN0cmwnXG4gICAgICB9KVxuICAgICAgLnN0YXRlKCdpbmRlbnRzLnVuY29uZmlybWVkJywge1xuICAgICAgICB1cmw6ICcvdW5jb25maXJtZWQnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2luZGVudC9saXN0X3VuY29uZmlybWVkLmh0bScsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdJbmRlbnRMaXN0Q3RybCdcbiAgICAgIH0pXG4gICAgICAuc3RhdGUoJ2luZGVudHMudW50ZXN0ZWQnLCB7XG4gICAgICAgIHVybDogJy91bnRlc3RlZCcsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnaW5kZW50L2xpc3RfdW50ZXN0ZWQuaHRtJyxcbiAgICAgICAgY29udHJvbGxlcjogJ1VudGVzdGVkSW5kZW50TGlzdEN0cmwnXG4gICAgICB9KTtcbiAgfSk7XG4iLCJhbmd1bGFyXG4gIC5tb2R1bGUoJ2d1bHUubG9naW4nLCBbXG4gICAgJ3VpLnJvdXRlcicsXG4gICAgJ2d1bHUubG9naW4uc3ZjcydcbiAgXSlcblxuICAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXJcbiAgICAgIC5zdGF0ZSgnbG9naW4nLCB7XG4gICAgICAgIHVybDogJy9sb2dpbicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnbG9naW4vbG9naW4uaHRtJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0xvZ2luQ3RybCdcbiAgICAgIH0pO1xuICB9KTtcbiIsImFuZ3VsYXJcbiAgLm1vZHVsZSgnZ3VsdS5yZXBvcnQnLCBbXG4gICAgJ3VpLnJvdXRlcicsXG4gICAgJ3V0aWwudm0nLFxuICAgICdndWx1LnJlcG9ydC5zdmNzJ1xuICAgIC8vICdndWx1LnJlcG9ydC5lbnVtcydcbiAgXSlcbiAgLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyXG4gICAgICAuc3RhdGUoJ2luZGVudHMuaW5wdXRfcmVwb3J0Jywge1xuICAgICAgICB1cmw6ICcve2luZGVudF9pZDpbMC05XSt9L2Nhci97Y2FyX2lkOlswLTldK30vcmVwb3J0JyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdyZXBvcnQvaW5wdXRfZGFzaGJvYXJkLmh0bScsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdJbnB1dERhc2hib2FyZEN0cmwnXG4gICAgICB9KVxuICAgICAgLnN0YXRlKCdpbmRlbnRzLmlucHV0X3JlcG9ydC5jcmVkZW50aWFsJywge1xuICAgICAgICB1cmw6ICcvY3JlZGVudGlhbCcsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAncmVwb3J0L2lucHV0X2NyZWRlbnRpYWwuaHRtJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0NyZWRlbnRpYWxSZXBvcnRFZGl0Q3RybCdcbiAgICAgIH0pXG4gICAgICAuc3RhdGUoJ2luZGVudHMuaW5wdXRfcmVwb3J0LnBob3RvJywge1xuICAgICAgICB1cmw6ICcvcGhvdG8nLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ3JlcG9ydC9pbnB1dF9waG90by5odG0nLFxuICAgICAgICBjb250cm9sbGVyOiAnUGhvdG9SZXBvcnRFZGl0Q3RybCdcbiAgICAgIH0pXG4gICAgICAuc3RhdGUoJ2luZGVudHMuaW5wdXRfcmVwb3J0LnBhcnQnLCB7XG4gICAgICAgIHVybDogJy97cGFydF9pZDpbMC05YS16QS1aXSt9JyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdyZXBvcnQvaW5wdXQuaHRtJyxcbiAgICAgICAgY29udHJvbGxlcjogJ1JlcG9ydEVkaXRDdHJsJ1xuICAgICAgfSk7XG4gIH0pO1xuIiwiLy8g6Ieq5a6a5LmJIGRpcmVjdGl2ZXNcblxuYW5ndWxhclxuICAubW9kdWxlKCdjdXN0b20uZGlyZWN0aXZlcycsIFtdKVxuICAuZGlyZWN0aXZlKCduZ0luZGV0ZXJtaW5hdGUnLCBmdW5jdGlvbigkY29tcGlsZSkge1xuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgc2NvcGUuJHdhdGNoKGF0dHJpYnV0ZXNbJ25nSW5kZXRlcm1pbmF0ZSddLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgIGVsZW1lbnQucHJvcCgnaW5kZXRlcm1pbmF0ZScsICEhdmFsdWUpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICB9KTtcbiIsImFuZ3VsYXJcbiAgLm1vZHVsZSgndXRpbC5maWx0ZXJzJywgW10pXG5cbiAgLmZpbHRlcignbW9iaWxlJywgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHMpIHtcbiAgICAgIGlmIChzID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfVxuXG4gICAgICBzID0gcy5yZXBsYWNlKC9bXFxzXFwtXSsvZywgJycpO1xuXG4gICAgICBpZiAocy5sZW5ndGggPCAzKSB7XG4gICAgICAgIHJldHVybiBzO1xuICAgICAgfVxuXG4gICAgICB2YXIgc2EgPSBzLnNwbGl0KCcnKTtcblxuICAgICAgc2Euc3BsaWNlKDMsIDAsICctJyk7XG5cbiAgICAgIGlmIChzLmxlbmd0aCA+PSA3KSB7XG4gICAgICAgIHNhLnNwbGljZSg4LCAwLCAnLScpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2Euam9pbignJyk7XG4gICAgfTtcbiAgfSk7XG4iLCJhbmd1bGFyXG4gIC5tb2R1bGUoJ3V0aWwuZGF0ZScsIFtdKVxuICAuZmFjdG9yeSgnRGF0ZVV0aWwnLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRvU3RyaW5nID0gZnVuY3Rpb24gKGRhdGUsIHMpIHtcbiAgICAgIHJldHVybiBkYXRlLmdldEZ1bGxZZWFyKCkgKyBzICsgKGRhdGUuZ2V0TW9udGgoKSArIDEpICsgcyArIGRhdGUuZ2V0RGF0ZSgpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICB0b0xvY2FsRGF0ZVN0cmluZzogZnVuY3Rpb24gKGRhdGUpIHtcbiAgICAgICAgcmV0dXJuIHRvU3RyaW5nKGRhdGUsICctJyk7XG4gICAgICB9LFxuXG4gICAgICB0b0xvY2FsVGltZVN0cmluZzogZnVuY3Rpb24oZGF0ZSkge1xuICAgICAgICB2YXIgaCA9IGRhdGUuZ2V0SG91cnMoKTtcbiAgICAgICAgdmFyIG0gPSBkYXRlLmdldE1pbnV0ZXMoKTtcblxuICAgICAgICBpZiAoaCA8IDEwKSB7XG4gICAgICAgICAgaCA9ICcwJyArIGg7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobSA8IDEwKSB7XG4gICAgICAgICAgbSA9ICcwJyArIG07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gW3RvU3RyaW5nKGRhdGUsICctJyksIGggKyAnOicgKyBtXS5qb2luKCcgJyk7XG4gICAgICB9XG4gICAgfVxuICB9KTsiLCIvLyDmnprkuL4gU2VydmljZVxuYW5ndWxhclxuICAubW9kdWxlKCd1dGlsLmVudW1zJywgW10pXG4gIC5mYWN0b3J5KCdFbnVtcycsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKEVOVU1TKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB2YWw6IGZ1bmN0aW9uIChuYW1lLCB0ZXh0KSB7XG4gICAgICAgICAgcmV0dXJuIEVOVU1TW25hbWVdLmZpbmQoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtLnRleHQgPT09IHRleHQ7XG4gICAgICAgICAgfSkudmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIHRleHQ6IGZ1bmN0aW9uIChuYW1lLCB2YWwpIHtcbiAgICAgICAgICByZXR1cm4gRU5VTVNbbmFtZV0uZmluZChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW0udmFsdWUgPT09IHZhbDtcbiAgICAgICAgICB9KS50ZXh0O1xuICAgICAgICB9LFxuICAgICAgICBpdGVtOiBmdW5jdGlvbiAobmFtZSwgdmFsKSB7XG4gICAgICAgICAgcmV0dXJuIEVOVU1TW25hbWVdLmZpbmQoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtLnZhbHVlID09PSB2YWw7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGl0ZW00dGV4dDogZnVuY3Rpb24obmFtZSwgdGV4dCkge1xuICAgICAgICAgIHJldHVybiBFTlVNU1tuYW1lXS5maW5kKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtLnRleHQgPT09IHRleHQ7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGxpc3Q6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgcmV0dXJuIEVOVU1TW25hbWVdO1xuICAgICAgICB9LFxuICAgICAgICBpdGVtczogZnVuY3Rpb24gKG5hbWUsIHZhbHMpIHtcbiAgICAgICAgICByZXR1cm4gRU5VTVNbbmFtZV0uZmlsdGVyKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFscy5pbmRleE9mKGl0ZW0udmFsdWUpICE9PSAtMTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9O1xuICB9KTsiLCJhbmd1bGFyXG4gIC5tb2R1bGUoJ2h0dHBJbnRlcmNlcHRvcnMnLCBbXSlcblxuICAuY29uZmlnKGZ1bmN0aW9uKCRodHRwUHJvdmlkZXIpIHtcbiAgICAkaHR0cFByb3ZpZGVyLmludGVyY2VwdG9ycy5wdXNoKCdodHRwSW50ZXJjZXB0b3InKTtcbiAgICBcbiAgICAvLyBBbmd1bGFyICRodHRwIGlzbuKAmXQgYXBwZW5kaW5nIHRoZSBoZWFkZXIgWC1SZXF1ZXN0ZWQtV2l0aCA9IFhNTEh0dHBSZXF1ZXN0IHNpbmNlIEFuZ3VsYXIgMS4zLjBcbiAgICAkaHR0cFByb3ZpZGVyLmRlZmF1bHRzLmhlYWRlcnMuY29tbW9uW1wiWC1SZXF1ZXN0ZWQtV2l0aFwiXSA9ICdYTUxIdHRwUmVxdWVzdCc7XG4gIH0pXG5cbiAgLmZhY3RvcnkoJ2h0dHBJbnRlcmNlcHRvcicsIGZ1bmN0aW9uKCRxLCAkcm9vdFNjb3BlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC8vIOivt+axguWJjeS/ruaUuSByZXF1ZXN0IOmFjee9rlxuICAgICAgJ3JlcXVlc3QnOiBmdW5jdGlvbihjb25maWcpIHtcbiAgICAgICAgLy8g6Iul6K+35rGC55qE5piv5qih5p2/77yM5oiW5bey5Yqg5LiK5pe26Ze05oiz55qEIHVybCDlnLDlnYDvvIzliJnkuI3pnIDopoHliqDml7bpl7TmiLNcbiAgICAgICAgaWYgKGNvbmZpZy51cmwuaW5kZXhPZignLmh0bScpICE9PSAtMSB8fCBjb25maWcudXJsLmluZGV4T2YoJz9fPScpICE9PSAtMSkge1xuICAgICAgICAgIHJldHVybiBjb25maWc7XG4gICAgICAgIH1cblxuICAgICAgICBjb25maWcudXJsID0gY29uZmlnLnVybCArICc/Xz0nICsgbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cbiAgICAgICAgcmV0dXJuIGNvbmZpZztcbiAgICAgIH0sXG5cbiAgICAgIC8vIOivt+axguWHuumUme+8jOS6pOe7mSBlcnJvciBjYWxsYmFjayDlpITnkIZcbiAgICAgICdyZXF1ZXN0RXJyb3InOiBmdW5jdGlvbihyZWplY3Rpb24pIHtcbiAgICAgICAgcmV0dXJuICRxLnJlamVjdChyZWplY3Rpb24pO1xuICAgICAgfSxcblxuICAgICAgLy8g5ZON5bqU5pWw5o2u5oyJ57qm5a6a5aSE55CGXG4gICAgICAvLyB7XG4gICAgICAvLyAgIGNvZGU6IDIwMCwgLy8g6Ieq5a6a5LmJ54q25oCB56CB77yMMjAwIOaIkOWKn++8jOmdniAyMDAg5Z2H5LiN5oiQ5YqfXG4gICAgICAvLyAgIG1zZzogJ+aTjeS9nOaPkOekuicsIC8vIOS4jeiDveWSjCBkYXRhIOWFseWtmFxuICAgICAgLy8gICBkYXRhOiB7fSAvLyDnlKjmiLfmlbDmja5cbiAgICAgIC8vIH1cbiAgICAgICdyZXNwb25zZSc6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgIC8vIOacjeWKoeerr+i/lOWbnueahOacieaViOeUqOaIt+aVsOaNrlxuICAgICAgICB2YXIgZGF0YSwgY29kZTtcblxuICAgICAgICBpZiAoYW5ndWxhci5pc09iamVjdChyZXNwb25zZS5kYXRhKSkge1xuICAgICAgICAgIGNvZGUgPSByZXNwb25zZS5kYXRhLmNvZGU7XG4gICAgICAgICAgZGF0YSA9IHJlc3BvbnNlLmRhdGEuZGF0YTtcblxuICAgICAgICAgIC8vIOiLpSBzdGF0dXMgMjAwLCDkuJQgY29kZSAhMjAw77yM5YiZ6L+U5Zue55qE5piv5pON5L2c6ZSZ6K+v5o+Q56S65L+h5oGvXG4gICAgICAgICAgLy8g6YKj5LmI77yMY2FsbGJhY2sg5Lya5o6l5pS25Yiw5LiL6Z2i5b2i5byP55qE5Y+C5pWw77yaXG4gICAgICAgICAgLy8geyBjb2RlOiAyMDAwMSwgbXNnOiAn5pON5L2c5aSx6LSlJyB9XG4gICAgICAgICAgaWYgKGNvZGUgIT09IDIwMCkge1xuICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdChyZXNwb25zZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g6Iul5pyN5Yqh56uv6L+U5Zue55qEIGRhdGEgIW51bGzvvIzliJnov5Tlm57nmoTmmK/mnInmlYjlnLDnlKjmiLfmlbDmja5cbiAgICAgICAgICAvLyDpgqPkuYjvvIxjYWxsYmFjayDkvJrmjqXmlLbliLDkuIvpnaLlvaLlvI/lj4LmlbDvvJpcbiAgICAgICAgICAvLyB7IGl0ZW1zOiBbLi4uXSwgdG90YWxfY291bnQ6IDEwMCB9XG4gICAgICAgICAgaWYgKGRhdGEgIT0gbnVsbCkge1xuICAgICAgICAgICAgcmVzcG9uc2UuZGF0YSA9IGRhdGE7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8g6Iul5pyN5Yqh56uv6L+U5Zue55qEIGRhdGEg5YC85Li6IG51bGzvvIzliJnov5Tlm57nmoTmmK/mj5DnpLrkv6Hmga9cbiAgICAgICAgICAvLyDpgqPkuYggY2FsbGJhY2sg5Lya5o6l5pS25Yiw5LiL6Z2i5b2i5byP55qE5Y+C5pWw77yaXG4gICAgICAgICAgLy8geyBjb2RlOiAyMDAsIG1zZzogJ+aTjeS9nOaIkOWKnycgfVxuICAgICAgICAgIC8vIOm7mOiupOS4uuatpFxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgICAgfSxcblxuICAgICAgLy8g5ZON5bqU5Ye66ZSZ77yM5Lqk57uZIGVycm9yIGNhbGxiYWNrIOWkhOeQhlxuICAgICAgJ3Jlc3BvbnNlRXJyb3InOiBmdW5jdGlvbihyZWplY3Rpb24pIHtcbiAgICAgICAgcmV0dXJuICRxLnJlamVjdChyZWplY3Rpb24pO1xuICAgICAgfVxuICAgIH07XG4gIH0pOyIsIi8vICRzY29wZSDlop7lvLpcbmFuZ3VsYXJcbiAgLm1vZHVsZSgndXRpbC52bScsIFtdKVxuICAuZmFjdG9yeSgnVk0nLCBmdW5jdGlvbiAoJGxvZykge1xuICAgIHJldHVybiB7XG4gICAgICB0b19qc29uOiBmdW5jdGlvbih2bSwgZmllbGRzKSB7XG4gICAgICAgIHZhciByZXQgPSB7fTtcblxuICAgICAgICBpZiAoYW5ndWxhci5pc1N0cmluZyhmaWVsZHMpKSB7XG4gICAgICAgICAgZmllbGRzID0gZmllbGRzLnNwbGl0KCcsJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZmllbGRzLmxlbmd0aCA9PT0gMSAmJiBmaWVsZHNbMF0gPT09ICcnKSB7XG4gICAgICAgICAgJGxvZy53YXJuKCfmgqjosIPnlKjmlrnms5UgVk0udG9fanNvbiDml7bvvIzmsqHmnInkvKDlhaUgZmllbGRzIOWPguaVsCcpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghYW5ndWxhci5pc0FycmF5KGZpZWxkcykpIHtcbiAgICAgICAgICAkbG9nLmVycm9yKCfmlrnms5UgVk0udG9fanNvbiDlj6rmjqXlj5flrZfnrKbkuLLmlbDnu4TmiJbpgJflj7fliIbpmpTnmoTlrZfnrKbkuLLmiJbkuIDkuKrkuI3lkKvpgJflj7fnmoTlrZfnrKbkuLInKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBmaWVsZHMubWFwKGZ1bmN0aW9uKGZpZWxkKSB7XG4gICAgICAgICAgcmV0dXJuIHJldFtmaWVsZF0gPSB2bVtmaWVsZF07XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgICB9XG4gICAgfTtcbiAgfSk7IiwiJ3VzZSBzdHJpY3QnO1xuYW5ndWxhci5tb2R1bGUoXCJuZ0xvY2FsZVwiLCBbXSwgW1wiJHByb3ZpZGVcIiwgZnVuY3Rpb24oJHByb3ZpZGUpIHtcbiAgdmFyIFBMVVJBTF9DQVRFR09SWSA9IHtcbiAgICBaRVJPOiBcInplcm9cIixcbiAgICBPTkU6IFwib25lXCIsXG4gICAgVFdPOiBcInR3b1wiLFxuICAgIEZFVzogXCJmZXdcIixcbiAgICBNQU5ZOiBcIm1hbnlcIixcbiAgICBPVEhFUjogXCJvdGhlclwiXG4gIH07XG4gICRwcm92aWRlLnZhbHVlKFwiJGxvY2FsZVwiLCB7XG4gICAgXCJEQVRFVElNRV9GT1JNQVRTXCI6IHtcbiAgICAgIFwiQU1QTVNcIjogW1xuICAgICAgICBcIlxcdTRlMGFcXHU1MzQ4XCIsXG4gICAgICAgIFwiXFx1NGUwYlxcdTUzNDhcIlxuICAgICAgXSxcbiAgICAgIFwiREFZXCI6IFtcbiAgICAgICAgXCJcXHU2NjFmXFx1NjcxZlxcdTY1ZTVcIixcbiAgICAgICAgXCJcXHU2NjFmXFx1NjcxZlxcdTRlMDBcIixcbiAgICAgICAgXCJcXHU2NjFmXFx1NjcxZlxcdTRlOGNcIixcbiAgICAgICAgXCJcXHU2NjFmXFx1NjcxZlxcdTRlMDlcIixcbiAgICAgICAgXCJcXHU2NjFmXFx1NjcxZlxcdTU2ZGJcIixcbiAgICAgICAgXCJcXHU2NjFmXFx1NjcxZlxcdTRlOTRcIixcbiAgICAgICAgXCJcXHU2NjFmXFx1NjcxZlxcdTUxNmRcIlxuICAgICAgXSxcbiAgICAgIFwiTU9OVEhcIjogW1xuICAgICAgICBcIjFcXHU2NzA4XCIsXG4gICAgICAgIFwiMlxcdTY3MDhcIixcbiAgICAgICAgXCIzXFx1NjcwOFwiLFxuICAgICAgICBcIjRcXHU2NzA4XCIsXG4gICAgICAgIFwiNVxcdTY3MDhcIixcbiAgICAgICAgXCI2XFx1NjcwOFwiLFxuICAgICAgICBcIjdcXHU2NzA4XCIsXG4gICAgICAgIFwiOFxcdTY3MDhcIixcbiAgICAgICAgXCI5XFx1NjcwOFwiLFxuICAgICAgICBcIjEwXFx1NjcwOFwiLFxuICAgICAgICBcIjExXFx1NjcwOFwiLFxuICAgICAgICBcIjEyXFx1NjcwOFwiXG4gICAgICBdLFxuICAgICAgXCJTSE9SVERBWVwiOiBbXG4gICAgICAgIFwiXFx1NTQ2OFxcdTY1ZTVcIixcbiAgICAgICAgXCJcXHU1NDY4XFx1NGUwMFwiLFxuICAgICAgICBcIlxcdTU0NjhcXHU0ZThjXCIsXG4gICAgICAgIFwiXFx1NTQ2OFxcdTRlMDlcIixcbiAgICAgICAgXCJcXHU1NDY4XFx1NTZkYlwiLFxuICAgICAgICBcIlxcdTU0NjhcXHU0ZTk0XCIsXG4gICAgICAgIFwiXFx1NTQ2OFxcdTUxNmRcIlxuICAgICAgXSxcbiAgICAgIFwiU0hPUlRNT05USFwiOiBbXG4gICAgICAgIFwiMVxcdTY3MDhcIixcbiAgICAgICAgXCIyXFx1NjcwOFwiLFxuICAgICAgICBcIjNcXHU2NzA4XCIsXG4gICAgICAgIFwiNFxcdTY3MDhcIixcbiAgICAgICAgXCI1XFx1NjcwOFwiLFxuICAgICAgICBcIjZcXHU2NzA4XCIsXG4gICAgICAgIFwiN1xcdTY3MDhcIixcbiAgICAgICAgXCI4XFx1NjcwOFwiLFxuICAgICAgICBcIjlcXHU2NzA4XCIsXG4gICAgICAgIFwiMTBcXHU2NzA4XCIsXG4gICAgICAgIFwiMTFcXHU2NzA4XCIsXG4gICAgICAgIFwiMTJcXHU2NzA4XCJcbiAgICAgIF0sXG4gICAgICBcImZ1bGxEYXRlXCI6IFwieVxcdTVlNzRNXFx1NjcwOGRcXHU2NWU1RUVFRVwiLFxuICAgICAgXCJsb25nRGF0ZVwiOiBcInlcXHU1ZTc0TVxcdTY3MDhkXFx1NjVlNVwiLFxuICAgICAgXCJtZWRpdW1cIjogXCJ5eXl5LU0tZCBhaDptbTpzc1wiLFxuICAgICAgXCJtZWRpdW1EYXRlXCI6IFwieXl5eS1NLWRcIixcbiAgICAgIFwibWVkaXVtVGltZVwiOiBcImFoOm1tOnNzXCIsXG4gICAgICBcInNob3J0XCI6IFwieXktTS1kIGFoOm1tXCIsXG4gICAgICBcInNob3J0RGF0ZVwiOiBcInl5LU0tZFwiLFxuICAgICAgXCJzaG9ydFRpbWVcIjogXCJhaDptbVwiXG4gICAgfSxcbiAgICBcIk5VTUJFUl9GT1JNQVRTXCI6IHtcbiAgICAgIFwiQ1VSUkVOQ1lfU1lNXCI6IFwiXFx1MDBhNVwiLFxuICAgICAgXCJERUNJTUFMX1NFUFwiOiBcIi5cIixcbiAgICAgIFwiR1JPVVBfU0VQXCI6IFwiLFwiLFxuICAgICAgXCJQQVRURVJOU1wiOiBbe1xuICAgICAgICBcImdTaXplXCI6IDMsXG4gICAgICAgIFwibGdTaXplXCI6IDMsXG4gICAgICAgIFwibWFjRnJhY1wiOiAwLFxuICAgICAgICBcIm1heEZyYWNcIjogMyxcbiAgICAgICAgXCJtaW5GcmFjXCI6IDAsXG4gICAgICAgIFwibWluSW50XCI6IDEsXG4gICAgICAgIFwibmVnUHJlXCI6IFwiLVwiLFxuICAgICAgICBcIm5lZ1N1ZlwiOiBcIlwiLFxuICAgICAgICBcInBvc1ByZVwiOiBcIlwiLFxuICAgICAgICBcInBvc1N1ZlwiOiBcIlwiXG4gICAgICB9LCB7XG4gICAgICAgIFwiZ1NpemVcIjogMyxcbiAgICAgICAgXCJsZ1NpemVcIjogMyxcbiAgICAgICAgXCJtYWNGcmFjXCI6IDAsXG4gICAgICAgIFwibWF4RnJhY1wiOiAyLFxuICAgICAgICBcIm1pbkZyYWNcIjogMixcbiAgICAgICAgXCJtaW5JbnRcIjogMSxcbiAgICAgICAgXCJuZWdQcmVcIjogXCIoXFx1MDBhNFwiLFxuICAgICAgICBcIm5lZ1N1ZlwiOiBcIilcIixcbiAgICAgICAgXCJwb3NQcmVcIjogXCJcXHUwMGE0XCIsXG4gICAgICAgIFwicG9zU3VmXCI6IFwiXCJcbiAgICAgIH1dXG4gICAgfSxcbiAgICBcImlkXCI6IFwiemgtY25cIixcbiAgICBcInBsdXJhbENhdFwiOiBmdW5jdGlvbihuKSB7XG4gICAgICByZXR1cm4gUExVUkFMX0NBVEVHT1JZLk9USEVSO1xuICAgIH1cbiAgfSk7XG59XSk7XG4iLCJhbmd1bGFyXG4gIC5tb2R1bGUoJ2d1bHUuaW5kZW50LmVudW1zJywgWyd1dGlsLmVudW1zJywgXSlcblxuLmZhY3RvcnkoJ0luZGVudEVudW1zJywgZnVuY3Rpb24oRW51bXMsIEluZGVudEVudW1zU3ZjLCB0b2FzdHIpIHtcbiAgcmV0dXJuIEluZGVudEVudW1zU3ZjXG4gICAgICAuZ2V0KClcbiAgICAgIC4kcHJvbWlzZVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgIHZhciBhbGxfcHJlaW5zID0gJ29yZGVyX3R5cGUgY2hhbm5lbCBicmFuZCBzZXJpZXMgbW9kZWwgc3RhdHVzIGNpdHkgaW5zcGVjdG9yIHJvbGUgZnJvbScuc3BsaXQoJyAnKTtcblxuICAgICAgICBhbGxfcHJlaW5zLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgcmVzW2tleV0udW5zaGlmdCh7XG4gICAgICAgICAgICB0ZXh0OiAn5YWo6YOoJyxcbiAgICAgICAgICAgIHZhbHVlOiBudWxsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBFbnVtcyhyZXMudG9KU09OKCkpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgdG9hc3RyLmVycm9yKHJlcy5tc2cgfHwgJ+iOt+WPluaemuS4vuWksei0pScpO1xuICAgICAgfSk7XG59KTtcbiIsImFuZ3VsYXJcbiAgLm1vZHVsZSgnZ3VsdS5pbmRlbnQuc3ZjcycsIFsnbmdSZXNvdXJjZSddKVxuXG4gIC5zZXJ2aWNlKCdJbmRlbnRFbnVtc1N2YycsIGZ1bmN0aW9uKCRyZXNvdXJjZSkge1xuICAgIHJldHVybiAkcmVzb3VyY2UoQVBJX1NFUlZFUlMudGVzdGVyICsgJy9lbnVtcycpO1xuICB9KVxuICBcbiAgLnNlcnZpY2UoJ0luZGVudHNTdmMnLCBmdW5jdGlvbiAoJHJlc291cmNlKSB7XG4gICAgcmV0dXJuICRyZXNvdXJjZShBUElfU0VSVkVSUy50ZXN0ZXIgKyAnL29yZGVycycsIHt9LCB7XG4gICAgICBxdWVyeToge1xuICAgICAgICBpc0FycmF5OiBmYWxzZVxuICAgICAgfVxuICAgIH0pO1xuICB9KVxuXG4gIC5zZXJ2aWNlKCdJbmRlbnRTdmMnLCBmdW5jdGlvbiAoJHJlc291cmNlKSB7XG4gICAgcmV0dXJuICRyZXNvdXJjZShBUElfU0VSVkVSUy50ZXN0ZXIgKyAnL29yZGVycy86aWQnLCB7XG4gICAgICBpZDogJ0BpZCdcbiAgICB9LCB7XG4gICAgICB1cGRhdGU6IHtcbiAgICAgICAgbWV0aG9kOiAnUFVUJ1xuICAgICAgfVxuICAgIH0pO1xuICB9KVxuXG4gIC5zZXJ2aWNlKCdUZXN0ZXJzU3ZjJywgZnVuY3Rpb24oJHJlc291cmNlKSB7XG4gICAgcmV0dXJuICRyZXNvdXJjZShBUElfU0VSVkVSUy50ZXN0ZXIgKyAnL3Rlc3RlcnMnLCB7fSwge1xuICAgICAgcXVlcnk6IHtcbiAgICAgICAgaXNBcnJheTogZmFsc2VcbiAgICAgIH1cbiAgICB9KTtcbiAgfSlcblxuICAuc2VydmljZSgnSW5kZW50QXBwcm92YWxTdmMnLCBmdW5jdGlvbigkcmVzb3VyY2UpIHtcbiAgICByZXR1cm4gJHJlc291cmNlKEFQSV9TRVJWRVJTLnRlc3RlciArICcvb3JkZXJzLzppZC9hcHByb3ZhbCcsIHtcbiAgICAgIGlkOiAnQGlkJ1xuICAgIH0pO1xuICB9KVxuXG4gIC5zZXJ2aWNlKCdVbnRlc3RlZEluZGVudHNTdmMnLCBmdW5jdGlvbigkcmVzb3VyY2UpIHtcbiAgICByZXR1cm4gJHJlc291cmNlKEFQSV9TRVJWRVJTLnRlc3RlciArICcvb3JkZXJzL3VudGVzdGVkJyk7XG4gIH0pXG5cbiAgLnNlcnZpY2UoJ0luZGVudENhcnNTdmMnLCBmdW5jdGlvbigkcmVzb3VyY2UpIHtcbiAgICByZXR1cm4gJHJlc291cmNlKEFQSV9TRVJWRVJTLnRlc3RlciArICcvb3JkZXJzLzpvcmRlcl9pZC9jYXInLCB7XG4gICAgICBvcmRlcl9pZDogJ0BvcmRlcl9pZCdcbiAgICB9KVxuICB9KVxuXG4gIC5zZXJ2aWNlKCdJbmRlbnRDYXJTdmMnLCBmdW5jdGlvbigkcmVzb3VyY2UpIHtcbiAgICByZXR1cm4gJHJlc291cmNlKEFQSV9TRVJWRVJTLnRlc3RlciArICcvb3JkZXJzLzpvcmRlcl9pZC9jYXIvOmNhcl9pZCcsIHtcbiAgICAgIG9yZGVyX2lkOiAnQG9yZGVyX2lkJyxcbiAgICAgIGNhcl9pZDogJ0BjYXJfaWQnXG4gICAgfSwge1xuICAgICAgdXBkYXRlOiB7XG4gICAgICAgIG1ldGhvZDogJ1BVVCdcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7IiwiLyogZ2xvYmFsIGFuZ3VsYXIgKi9cbmFuZ3VsYXJcbiAgLm1vZHVsZSgnZ3VsdS5pbmRlbnQnKVxuICBcbiAgLmNvbnRyb2xsZXIoJ0luZGVudExpc3RDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkbG9jYXRpb24sIHRvYXN0ciwgJG1vZGFsLFxuICAgIEluZGVudHNTdmMsIEluZGVudFN2YywgSW5kZW50RW51bXMpIHtcbiAgICB2YXIgdm0gPSAkc2NvcGU7XG4gICAgdmFyIHFzbyA9ICRsb2NhdGlvbi5zZWFyY2goKTtcblxuICAgIHZtLnN0YXR1c19pZCA9IHBhcnNlSW50KHFzby5zdGF0dXNfaWQpIHx8IG51bGw7XG4gICAgXG4gICAgaWYgKHZtLiRzdGF0ZS5pbmNsdWRlcygnaW5kZW50cy51bmNvbmZpcm1lZCcpKSB7XG4gICAgICB2bS5zdGF0dXNfaWQgPSA0O1xuICAgIH0gZWxzZSB7XG4gICAgICB2bS5jaXR5X2lkID0gcGFyc2VJbnQocXNvLmNpdHlfaWQpIHx8IG51bGw7XG4gICAgICB2bS5pbnNwZWN0b3JfaWQgPSBwYXJzZUludChxc28uaW5zcGVjdG9yX2lkKSB8fCBudWxsO1xuICAgICAgLy8gdm0ucm9sZV9pZCA9IHBhcnNlSW50KHFzby5yb2xlX2lkKSB8fCBudWxsO1xuICAgICAgdm0ucmVxdWVzdGVyX21vYmlsZSA9IHFzby5yZXF1ZXN0ZXJfbW9iaWxlIHx8IG51bGw7XG5cbiAgICAgIHZtLnN0YXR1cyA9IEluZGVudEVudW1zLml0ZW0oJ3N0YXR1cycsIHZtLnN0YXR1c19pZCk7XG4gICAgICB2bS5zdGF0dXNfbGlzdCA9IEluZGVudEVudW1zLmxpc3QoJ3N0YXR1cycpO1xuICAgICAgdm0uY2l0eSA9IEluZGVudEVudW1zLml0ZW0oJ2NpdHknLCB2bS5jaXR5X2lkKTtcbiAgICAgIHZtLmNpdHlfbGlzdCA9IEluZGVudEVudW1zLmxpc3QoJ2NpdHknKTtcbiAgICAgIC8vIHZtLnJvbGUgPSBJbmRlbnRFbnVtcy5pdGVtKCdyb2xlJywgdm0ucm9sZV9pZCk7XG4gICAgICAvLyB2bS5yb2xlX2xpc3QgPSBJbmRlbnRFbnVtcy5saXN0KCdyb2xlJyk7XG4gICAgICB2bS5pbnNwZWN0b3IgPSBJbmRlbnRFbnVtcy5pdGVtKCdpbnNwZWN0b3InLCB2bS5pbnNwZWN0b3JfaWQpO1xuICAgICAgdm0uaW5zcGVjdG9yX2xpc3QgPSBJbmRlbnRFbnVtcy5saXN0KCdpbnNwZWN0b3InKTtcblxuICAgICAgd2F0Y2hfbGlzdCgnc3RhdHVzJywgJ3N0YXR1c19pZCcpO1xuICAgICAgd2F0Y2hfbGlzdCgnY2l0eScsICdjaXR5X2lkJyk7XG4gICAgICAvLyB3YXRjaF9saXN0KCdyb2xlJywgJ3JvbGVfaWQnKTtcbiAgICAgIHdhdGNoX2xpc3QoJ2luc3BlY3RvcicsICdpbnNwZWN0b3JfaWQnKTtcblxuICAgICAgdm0uc2VhcmNoID0gc2VhcmNoO1xuICAgIH1cblxuICAgIHZtLnBhZ2UgPSBwYXJzZUludChxc28ucGFnZSkgfHwgMTtcbiAgICB2bS5zaXplID0gcGFyc2VJbnQocXNvLnNpemUpIHx8IDIwO1xuICAgIHZtLnNpemVzID0gSW5kZW50RW51bXMubGlzdCgnc2l6ZScpO1xuICAgIHZtLnNpemVfaXRlbSA9IEluZGVudEVudW1zLml0ZW0oJ3NpemUnLCB2bS5zaXplKTtcblxuICAgIHZtLnNpemVfY2hhbmdlID0gc2l6ZV9jaGFuZ2U7XG4gICAgdm0ucGFnZV9jaGFuZ2UgPSBwYWdlX2NoYW5nZTtcbiAgICB2bS5jYW5jZWxfb3JkZXIgPSBjYW5jZWxfb3JkZXI7XG4gICAgdm0uY29uZmlybV9vcmRlciA9IGNvbmZpcm1fb3JkZXI7XG5cbiAgICBxdWVyeSgpO1xuXG4gICAgZnVuY3Rpb24gcXVlcnkoKSB7XG4gICAgICB2YXIgcGFyYW1zID0ge1xuICAgICAgICBvcmRlcl9jaXR5X2lkOiB2bS5jaXR5X2lkLFxuICAgICAgICBub2l0ZW1zX3BhZ2U6IHZtLnNpemUsXG4gICAgICAgIHBhZ2U6IHZtLnBhZ2UsXG5cbiAgICAgICAgb3JkZXJfc3RhdHVzX2lkOiB2bS5zdGF0dXNfaWRcbiAgICAgIH07XG5cbiAgICAgIGlmICh2bS4kc3RhdGUuaW5jbHVkZXMoJ2luZGVudHMubGlzdCcpKSB7XG4gICAgICAgIGFuZ3VsYXIuZXh0ZW5kKHBhcmFtcywge1xuICAgICAgICAgIG9yZGVyX2NpdHlfaWQ6IHZtLmNpdHlfaWQsXG4gICAgICAgICAgaW5zcGVjdG9yX2lkOiB2bS5pbnNwZWN0b3JfaWQsXG4gICAgICAgICAgLy8gcm9sZV9pZDogdm0ucm9sZV9pZCxcbiAgICAgICAgICByZXF1ZXN0ZXJfbW9iaWxlOiB2bS5yZXF1ZXN0ZXJfbW9iaWxlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgXG4gICAgICAkbG9jYXRpb24uc2VhcmNoKHBhcmFtcyk7XG5cbiAgICAgIEluZGVudHNTdmNcbiAgICAgICAgLnF1ZXJ5KHBhcmFtcylcbiAgICAgICAgLiRwcm9taXNlXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJzKSB7XG4gICAgICAgICAgcnMuaXRlbXMuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICBpdGVtLnN0YXR1c190ZXh0ID0gSW5kZW50RW51bXMudGV4dCgnc3RhdHVzJywgaXRlbS5zdGF0dXMpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgdm0uaXRlbXMgPSBycy5pdGVtcztcbiAgICAgICAgICB2bS50b3RhbF9jb3VudCA9IHJzLnRvdGFsX2NvdW50O1xuXG4gICAgICAgICAgdmFyIHRtcCA9IHJzLnRvdGFsX2NvdW50IC8gdm0uc2l6ZTtcbiAgICAgICAgICB2bS5wYWdlX2NvdW50ID0gcnMudG90YWxfY291bnQgJSB2bS5zaXplID09PSAwID8gdG1wIDogKE1hdGguZmxvb3IodG1wKSArIDEpO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgdG9hc3RyLmVycm9yKHJlcy5kYXRhLm1zZyB8fCAn5p+l6K+i5aSx6LSl77yM5pyN5Yqh5Zmo5Y+R55Sf5pyq55+l6ZSZ6K+v77yM6K+36YeN6K+VJyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHdhdGNoX2xpc3QobmFtZSwgZmllbGQpIHtcbiAgICAgIHZtLiR3YXRjaChuYW1lLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIGlmICghaXRlbSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZtW2ZpZWxkXSA9IGl0ZW0udmFsdWU7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyDnoa7orqTorqLljZVcbiAgICBmdW5jdGlvbiBjb25maXJtX29yZGVyKGl0ZW0pIHtcbiAgICAgIGlmIChjb25maXJtKCfnoa7orqTmjqXlj5for6XorqLljZU/JykpIHtcbiAgICAgICAgSW5kZW50U3ZjXG4gICAgICAgICAgLnVwZGF0ZSh7XG4gICAgICAgICAgICBvcmRlcl9pZDogaXRlbS5vcmRlcl9pZFxuICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgIHN0YXR1czogNVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLiRwcm9taXNlXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICB0b2FzdHIuc3VjY2VzcyhyZXMubXNnIHx8ICfnoa7orqTorqLljZXmiJDlip8nKTtcblxuICAgICAgICAgICAgcXVlcnkoKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5jYXRjaChmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgIHRvYXN0ci5lcnJvcihyZXMubXNnIHx8ICfnoa7orqTorqLljZXlpLHotKXvvIzor7fph43or5UnKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDlj5bmtojorqLljZVcbiAgICBmdW5jdGlvbiBjYW5jZWxfb3JkZXIoaXRlbSkge1xuICAgICAgdmFyIGNhbmNlbF9vcmRlcl9pbnMgPSAkbW9kYWwub3Blbih7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnaW5kZW50L2NhbmNlbF9vcmRlci5odG0nLFxuICAgICAgICBjb250cm9sbGVyOiAnQ2FuY2VsT3JkZXJDdHJsJyxcbiAgICAgICAgYmFja2Ryb3A6ICdzdGF0aWMnLFxuICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgaW5kZW50X2luZm86IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgY2FuY2VsX29yZGVyX2lucy5yZXN1bHQudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gVE9ETzpcbiAgICAgICAgLy8g5pu05paw6aKE57qm5Y2V54q25oCBXG4gICAgICAgIHF1ZXJ5KCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyDmr4/pobXmnaHmlbDmlLnlj5hcbiAgICBmdW5jdGlvbiBzaXplX2NoYW5nZShzaXplKSB7XG4gICAgICB2bS5zaXplID0gc2l6ZTtcbiAgICAgIHZtLnBhZ2UgPSAxO1xuXG4gICAgICBxdWVyeSgpO1xuICAgIH1cblxuICAgIC8vIOe/u+mhtVxuICAgIGZ1bmN0aW9uIHBhZ2VfY2hhbmdlKHBhZ2UpIHtcbiAgICAgIHZtLnBhZ2UgPSBwYWdlO1xuXG4gICAgICBxdWVyeSgpO1xuICAgIH1cblxuICAgIC8vIOafpeivouaPkOS6pFxuICAgIGZ1bmN0aW9uIHNlYXJjaCgpIHtcbiAgICAgIHZtLnBhZ2UgPSAxO1xuXG4gICAgICBxdWVyeSgpO1xuICAgIH1cbiAgfSlcblxuICAuY29udHJvbGxlcignVW50ZXN0ZWRJbmRlbnRMaXN0Q3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJGxvY2F0aW9uLCB0b2FzdHIsICRtb2RhbCxcbiAgIFVudGVzdGVkSW5kZW50c1N2YywgSW5kZW50Q2FyU3ZjKSB7XG4gICAgdmFyIHZtID0gJHNjb3BlO1xuXG4gICAgdm0uY2FuY2VsX29yZGVyID0gY2FuY2VsX29yZGVyO1xuICAgIHZtLmRlbF9jYXIgPSBkZWxfY2FyO1xuICAgIHZtLmVkaXRfY2FyID0gZWRpdF9jYXI7XG5cbiAgICBxdWVyeSgpO1xuXG4gICAgZnVuY3Rpb24gcXVlcnkoKSB7XG4gICAgICByZXR1cm4gVW50ZXN0ZWRJbmRlbnRzU3ZjXG4gICAgICAgIC5xdWVyeSgpXG4gICAgICAgIC4kcHJvbWlzZVxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICB2bS5pdGVtcyA9IHJlcztcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIHRvYXN0ci5lcnJvcihyZXMubXNnIHx8ICfojrflj5blvoXmo4DmtYvorqLljZXlpLHotKUnKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8g5Yqg6L2mIOaIliDnvJbovpHovaZcbiAgICBmdW5jdGlvbiBlZGl0X2NhcihvcmRlcl9pZCwgY2FyKSB7XG4gICAgICB2YXIgZWRpdF9jYXJfaW5zID0gJG1vZGFsLm9wZW4oe1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2luZGVudC9lZGl0X2Nhci5odG0nLFxuICAgICAgICBjb250cm9sbGVyOiAnSW5kZW50Q2FyRWRpdEN0cmwnLFxuICAgICAgICBiYWNrZHJvcDogJ3N0YXRpYycsXG4gICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICBpbmRlbnRfaW5mbzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBvcmRlcl9pZDogb3JkZXJfaWQsXG4gICAgICAgICAgICAgIGNhcjogY2FyXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGVkaXRfY2FyX2lucy5yZXN1bHQudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgcXVlcnkoKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIOWIoOmZpOi9plxuICAgIGZ1bmN0aW9uIGRlbF9jYXIob3JkZXJfaWQsIGNhcikge1xuICAgICAgaWYgKGNvbmZpcm0oJ+ehruiupOWIoOmZpCBcIicgKyBbY2FyLmJyYW5kLCBjYXIuc2VyaWVzLCBjYXIubW9kZWxdLmpvaW4oJy0nKSArICdcIicpKSB7XG4gICAgICAgIHJldHVybiBJbmRlbnRDYXJTdmNcbiAgICAgICAgICAucmVtb3ZlKHtcbiAgICAgICAgICAgIG9yZGVyX2lkOiBvcmRlcl9pZCxcbiAgICAgICAgICAgIGNhcl9pZDogY2FyLmlkXG4gICAgICAgICAgfSlcbiAgICAgICAgICAuJHByb21pc2VcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgIHRvYXN0ci5zdWNjZXNzKHJlcy5tc2cgfHwgJ+WIoOmZpOi9puaIkOWKnycpO1xuXG4gICAgICAgICAgICBxdWVyeSgpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgdG9hc3RyLmVycm9yKHJlcy5tc2cgfHwgJ+WIoOmZpOi9puWksei0pe+8jOivt+mHjeivlScpO1xuICAgICAgICAgIH0pOyAgXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8g5Y+W5raI6K6i5Y2VXG4gICAgZnVuY3Rpb24gY2FuY2VsX29yZGVyKGl0ZW0pIHtcbiAgICAgIHZhciBjYW5jZWxfb3JkZXJfaW5zID0gJG1vZGFsLm9wZW4oe1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2luZGVudC9jYW5jZWxfb3JkZXIuaHRtJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0NhbmNlbE9yZGVyQ3RybCcsXG4gICAgICAgIGJhY2tkcm9wOiAnc3RhdGljJyxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgIGluZGVudF9pbmZvOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGNhbmNlbF9vcmRlcl9pbnMucmVzdWx0LnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIHF1ZXJ5KCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0pXG4gIFxuICAvLyDlj5bmtojorqLljZVcbiAgLmNvbnRyb2xsZXIoJ0NhbmNlbE9yZGVyQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJG1vZGFsSW5zdGFuY2UsIHRvYXN0ciwgSW5kZW50QXBwcm92YWxTdmMsIGluZGVudF9pbmZvKSB7XG4gICAgdmFyIHZtID0gJHNjb3BlO1xuXG4gICAgYW5ndWxhci5leHRlbmQodm0sIGluZGVudF9pbmZvKTtcblxuICAgIHZtLmNhbmNlbF9vcmRlciA9IGNhbmNlbF9vcmRlcjtcbiAgICB2bS5jYW5jZWwgPSBjYW5jZWw7XG5cbiAgICBmdW5jdGlvbiBjYW5jZWxfb3JkZXIoKSB7XG4gICAgICB2bS5jYW5jZWxfb3JkZXJfc3RhdHVzID0gdHJ1ZTtcblxuICAgICAgSW5kZW50QXBwcm92YWxTdmNcbiAgICAgICAgLnNhdmUoe1xuICAgICAgICAgIG9yZGVyX2lkOiBpbmRlbnRfaW5mby5vcmRlcl9pZFxuICAgICAgICB9LCB7XG4gICAgICAgICAgcmVhc29uOiB2bS5yZWFzb25cbiAgICAgICAgfSlcbiAgICAgICAgLiRwcm9taXNlXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIHRvYXN0ci5zdWNjZXNzKHJlcy5tc2cgfHwgJ+iuouWNleWPlua2iOaIkOWKnycpO1xuXG4gICAgICAgICAgJG1vZGFsSW5zdGFuY2UuY2xvc2UoKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIHZtLmNhbmNlbF9vcmRlcl9zdGF0dXMgPSBmYWxzZTtcblxuICAgICAgICAgIHRvYXN0ci5lcnJvcihyZXMubXNnIHx8ICforqLljZXlj5bmtojlpLHotKXvvIzor7fph43or5UnKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2FuY2VsKCkge1xuICAgICAgJG1vZGFsSW5zdGFuY2UuZGlzbWlzcygpO1xuICAgIH1cbiAgfSlcblxuICAvLyDliqDovaYg5oiWIOe8lui+kei9plxuICAuY29udHJvbGxlcignSW5kZW50Q2FyRWRpdEN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRtb2RhbEluc3RhbmNlLCB0b2FzdHIsIEluZGVudENhcnNTdmMsXG4gICAgSW5kZW50Q2FyU3ZjLCBJbmRlbnRFbnVtcywgaW5kZW50X2luZm8pIHtcbiAgICB2YXIgdm0gPSAkc2NvcGU7XG5cbiAgICB2bS5icmFuZF9saXN0ID0gSW5kZW50RW51bXMubGlzdCgnYnJhbmQnKTtcbiAgICB2bS5zZXJpZXNfbGlzdCA9IEluZGVudEVudW1zLmxpc3QoJ3NlcmllcycpO1xuICAgIHZtLm1vZGVsX2xpc3QgPSBJbmRlbnRFbnVtcy5saXN0KCdtb2RlbCcpO1xuXG4gICAgaWYgKGluZGVudF9pbmZvLmNhcikge1xuICAgICAgdm0udGl0bGUgPSAn57yW6L6R6L2m5L+h5oGvJztcblxuICAgICAgc2VsZWN0X2l0ZW0oJ2JyYW5kJywgaW5kZW50X2luZm8uY2FyLmJyYW5kKTtcbiAgICAgIHNlbGVjdF9pdGVtKCdzZXJpZXMnLCBpbmRlbnRfaW5mby5jYXIuc2VyaWVzKTtcbiAgICAgIHNlbGVjdF9pdGVtKCdtb2RlbCcsIGluZGVudF9pbmZvLmNhci5tb2RlbCk7ICBcbiAgICB9IGVsc2Uge1xuICAgICAgdm0udGl0bGUgPSAn5Yqg6L2mJztcbiAgICB9XG5cbiAgICB2bS5jYW5jZWwgPSBjYW5jZWw7XG4gICAgdm0uc3VibWl0ID0gc3VibWl0O1xuXG4gICAgZnVuY3Rpb24gc3VibWl0KCkge1xuICAgICAgaWYgKGluZGVudF9pbmZvLmNhcikge1xuICAgICAgICBJbmRlbnRDYXJTdmNcbiAgICAgICAgICAudXBkYXRlKHtcbiAgICAgICAgICAgIG9yZGVyX2lkOiBpbmRlbnRfaW5mby5vcmRlcl9pZCxcbiAgICAgICAgICAgIGNhcl9pZDogaW5kZW50X2luZm8uY2FyLmlkXG4gICAgICAgICAgfSwge1xuICAgICAgICAgICAgYnJhbmQ6IHZtLmJyYW5kLnZhbHVlLFxuICAgICAgICAgICAgc2VyaWVzOiB2bS5icmFuZC52YWx1ZSxcbiAgICAgICAgICAgIG1vZGVsOiB2bS5tb2RlbC52YWx1ZVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLiRwcm9taXNlXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICB0b2FzdHIuc3VjY2VzcyhyZXMubXNnIHx8ICfnvJbovpHovabovobkv6Hmga/kv53lrZjmiJDlip8nKTtcblxuICAgICAgICAgICAgJG1vZGFsSW5zdGFuY2UuY2xvc2UoKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5jYXRjaChmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgIHRvYXN0ci5lcnJvcihyZXMubXNnIHx8ICfnvJbovpHovabovobkv6Hmga/kv53lrZjlpLHotKUnKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIEluZGVudENhcnNTdmNcbiAgICAgICAgICAuc2F2ZSh7XG4gICAgICAgICAgICBvcmRlcl9pZDogaW5kZW50X2luZm8ub3JkZXJfaWRcbiAgICAgICAgICB9LCB7XG4gICAgICAgICAgICBicmFuZDogdm0uYnJhbmQudmFsdWUsXG4gICAgICAgICAgICBzZXJpZXM6IHZtLmJyYW5kLnZhbHVlLFxuICAgICAgICAgICAgbW9kZWw6IHZtLm1vZGVsLnZhbHVlXG4gICAgICAgICAgfSlcbiAgICAgICAgICAuJHByb21pc2VcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgIHRvYXN0ci5zdWNjZXNzKHJlcy5tc2cgfHwgJ+WKoOi9puS/oeaBr+S/neWtmOaIkOWKnycpO1xuXG4gICAgICAgICAgICAkbW9kYWxJbnN0YW5jZS5jbG9zZSgpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgdG9hc3RyLmVycm9yKHJlcy5tc2cgfHwgJ+WKoOi9puS/oeaBr+S/neWtmOWksei0pScpO1xuICAgICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNlbGVjdF9pdGVtKGxpc3RfbmFtZSwgdmFsdWUpIHtcbiAgICAgIHZtW2xpc3RfbmFtZV0gPSBJbmRlbnRFbnVtcy5pdGVtNHRleHQobGlzdF9uYW1lLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2FuY2VsKCkge1xuICAgICAgJG1vZGFsSW5zdGFuY2UuZGlzbWlzcygpO1xuICAgIH1cblxuICB9KTtcblxuIiwiYW5ndWxhclxuICAubW9kdWxlKCdndWx1LmxvZ2luJylcbiAgXG4gIC5jb250cm9sbGVyKCdMb2dpbkN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCAkcSwgJGxvY2F0aW9uLCAkdGltZW91dCwgdG9hc3RyLCBMb2dpblN2Yykge1xuICAgIHZhciB2bSA9ICRzY29wZTtcblxuICAgIHZtLmxvZ2luID0gbG9naW47XG5cbiAgICBmdW5jdGlvbiBsb2dpbigpIHtcbiAgICAgIHJldHVybiBMb2dpblN2Y1xuICAgICAgICAuc2F2ZSh7XG4gICAgICAgICAgam9iX25vOiB2bS5qb2Jfbm8sXG4gICAgICAgICAgcGFzc3dvcmQ6IHZtLnBhc3N3b3JkXG4gICAgICAgIH0pXG4gICAgICAgIC4kcHJvbWlzZVxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICB0b2FzdHIuc3VjY2VzcyhyZXMubXNnIHx8ICfnmbvlvZXmiJDlip/vvIzmraPlnKjkuLrkvaDot7PovawuLi4nKTtcblxuICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJGxvY2F0aW9uLnVybCgnL2luZGVudHMnKTtcbiAgICAgICAgICB9LCAyMDAwKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIHRvYXN0ci5lcnJvcihyZXMubXNnIHx8ICfnmbvlvZXlpLHotKXvvIzor7fph43or5UnKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICB9KTsiLCJhbmd1bGFyXG4gIC5tb2R1bGUoJ2d1bHUubG9naW4uc3ZjcycsIFsnbmdSZXNvdXJjZSddKVxuICAuc2VydmljZSgnTG9naW5TdmMnLCBmdW5jdGlvbiAoJHJlc291cmNlKSB7XG4gICAgcmV0dXJuICRyZXNvdXJjZShBUElfU0VSVkVSUy50ZXN0ZXIgKyAnL3VzZXIvbG9naW4nKTtcbiAgfSkiLCJhbmd1bGFyXG4gIC5tb2R1bGUoJ2d1bHUucmVwb3J0JylcblxuICAuZmFjdG9yeSgnUmVwb3J0SW5wdXRlcicsIGZ1bmN0aW9uKCRsb2csICRzdGF0ZVBhcmFtcywgJGludGVydmFsLCBWTSwgbG9jYWxTdG9yYWdlU2VydmljZSkge1xuICAgIHJldHVybiBmdW5jdGlvbih2bSwgZmllbGRzLCByZXBvcnRfdHlwZSkge1xuICAgICAgdmFyIGluZGVudF9pZCA9ICRzdGF0ZVBhcmFtcy5pbmRlbnRfaWQ7XG4gICAgICB2YXIgY2FyX2lkID0gJHN0YXRlUGFyYW1zLmNhcl9pZDtcblxuICAgICAgdmFyIHN0b3JlX2tleSA9IFtpbmRlbnRfaWQsIGNhcl9pZF0uam9pbignXycpO1xuXG4gICAgICB2YXIgaW5pdF9kYXRhID0gbG9jYWxTdG9yYWdlU2VydmljZS5nZXQoc3RvcmVfa2V5KTtcbiAgICAgIC8vIOiuvue9ruWIneWni+WMluWAvFxuICAgICAgYW5ndWxhci5leHRlbmQodm0sIGluaXRfZGF0YSAmJiBpbml0X2RhdGFbcmVwb3J0X3R5cGVdIHx8IHt9KTtcblxuICAgICAgLy8g5L+d5a2Y5YiwIGxvY2FsU3RvcmFnZVxuICAgICAgZnVuY3Rpb24gc2F2ZSgpIHtcbiAgICAgICAgdmFyIGRhdGEgPSBsb2NhbFN0b3JhZ2VTZXJ2aWNlLmdldChzdG9yZV9rZXkpIHx8IHt9O1xuICAgICAgICBkYXRhW3JlcG9ydF90eXBlXSA9IFZNLnRvX2pzb24odm0sIGZpZWxkcyk7XG5cbiAgICAgICAgbG9jYWxTdG9yYWdlU2VydmljZS5zZXQoc3RvcmVfa2V5LCBkYXRhKTtcblxuICAgICAgICAkbG9nLmxvZygn5b2V5YWl5qOA5rWL5oql5ZGKIC0gJyArIHN0b3JlX2tleSwgZGF0YVtyZXBvcnRfdHlwZV0pO1xuICAgICAgfVxuXG4gICAgICB2YXIgdGltZXIgPSAkaW50ZXJ2YWwoc2F2ZSwgMzAwMCk7XG5cbiAgICAgIC8vIOWIh+aNoumhtemdouaXtu+8jOWPlua2iOiHquWKqOS/neWtmCjmuIXpmaTlrprml7blmagpXG4gICAgICB2bS4kb24oJyRsb2NhdGlvbkNoYW5nZVN0YXJ0JywgZnVuY3Rpb24oKSB7XG4gICAgICAgICRpbnRlcnZhbC5jYW5jZWwodGltZXIpO1xuICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxuIiwiYW5ndWxhclxuICAubW9kdWxlKCdndWx1LnJlcG9ydCcpXG5cbiAgLmNvbnRyb2xsZXIoJ0lucHV0RGFzaGJvYXJkQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlUGFyYW1zLCAkdGVtcGxhdGVDYWNoZSwgbG9jYWxTdG9yYWdlU2VydmljZSkge1xuICAgIHZhciB2bSA9ICRzY29wZTtcblxuICAgIHZhciBpbmRlbnRfaWQgPSAkc3RhdGVQYXJhbXMuaW5kZW50X2lkO1xuICAgIHZhciBjYXJfaWQgPSAkc3RhdGVQYXJhbXMuY2FyX2lkO1xuICAgIHZhciBzdG9yZV9rZXkgPSBbaW5kZW50X2lkLCBjYXJfaWRdLmpvaW4oJ18nKTtcblxuICAgIHZtLnBhcnRzID0gSlNPTi5wYXJzZSgkdGVtcGxhdGVDYWNoZS5nZXQoJ3JlcG9ydC9pLmpzb24nKSk7XG4gICAgLy8g5LiN55So5bGV56S654Wn54mHXG4gICAgdm0ucGFydHMucG9wKCk7XG5cbiAgICB2bS50b2dnbGVfbmF2X29wZW4gPSB0b2dnbGVfbmF2X29wZW47XG4gICAgdm0udXBsb2FkID0gdXBsb2FkO1xuXG4gICAgZnVuY3Rpb24gdG9nZ2xlX25hdl9vcGVuKCkge1xuICAgICAgdm0udGVzdF9zdGVwX25hdl9vcGVuID0gIXZtLnRlc3Rfc3RlcF9uYXZfb3BlbjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1cGxvYWQoKSB7XG4gICAgICB2YXIgbG9jYWxfaW1nX2RhdGEgPSBsb2NhbFN0b3JhZ2VTZXJ2aWNlLmdldChzdG9yZV9rZXkpO1xuXG4gICAgICB2YXIgZmlsZVVSSSA9IGxvY2FsX2ltZ19kYXRhLnBob3RvXzEucDFpMi5pbWFnZTtcblxuICAgICAgYWxlcnQoJ2ZpbGVVUkw6XFxuJyArIGZpbGVVUkkpO1xuXG4gICAgICB2YXIgb3B0cyA9IG5ldyBGaWxlVXBsb2FkT3B0aW9ucygpO1xuICAgICAgb3B0cy5maWxlS2V5ID0gJ2ZpbGVLZXknO1xuICAgICAgb3B0cy5maWxlTmFtZSA9IGZpbGVVUkkuc3Vic3RyKGZpbGVVUkkubGFzdEluZGV4T2YoJy8nKSArIDEpO1xuXG4gICAgICB2YXIgZnQgPSBuZXcgRmlsZVRyYW5zZmVyKCk7XG4gICAgICBmdC51cGxvYWQoZmlsZVVSSSwgZW5jb2RlVVJJKCdodHRwOi8vZi5pZmRpdS5jb20nKSwgd2luLCBmYWlsLCBvcHRzKTtcblxuICAgICAgZnVuY3Rpb24gd2luKCkge1xuICAgICAgICBhbGVydCgnd2luOlxcbicgKyBKU09OLnN0cmluZ2lmeShhcmd1bWVudHMpKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gZmFpbCgpIHtcbiAgICAgICAgYWxlcnQoJ2VycjpcXG4nICsgSlNPTi5zdHJpbmdpZnkoYXJndW1lbnRzKSk7XG4gICAgICB9XG4gICAgfVxuICB9KVxuICBcbiAgLmNvbnRyb2xsZXIoJ0NyZWRlbnRpYWxSZXBvcnRFZGl0Q3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgUmVwb3J0SW5wdXRlcikge1xuICAgIHZhciB2bSA9ICRzY29wZTtcbiAgICB2YXIgZmllbGRzID0gJ25hbWUsbW9iaWxlLG1vdG9yX25vLHZpbmNvZGUsZW5naW5lX25vLGJvZHlfY29sb3IscHJvZHVjdGl2ZV90aW1lLGNhcl9hdHRyaWJ1dGVfdG8sdHJhbnNmZXJfdGltZXMsYW5udWFsX2NoZWNrX2RlYWRsaW5lLHRyYWZmaWNfaW5zdXJhbmNlX2RlYWRsaW5lLGJ1c2luZXNzX2luc3VyYW5jZV9kZWFkbGluZSxoYXNfY2FyX2ludm9pY2UsaGFzXzRzX21haW50ZW5hbmNlJztcblxuICAgIFJlcG9ydElucHV0ZXIodm0sIGZpZWxkcywgJ2NyZWRlbnRpYWwnKTtcblxuICAgIC8vIOaXpeacn+aOp+S7tuaYvuekui/pmpDol48v56aB55SoXG4gICAgdm0ub3Blbl9kYXRlcGlja2VyID0gZnVuY3Rpb24oJGV2ZW50LCBkcCkge1xuICAgICAgJGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgIGlmICh2bS5pbnB1dF9hZnRlcl9vaykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZtW2RwXSA9IHRydWU7XG4gICAgfTtcbiAgfSlcblxuICAuY29udHJvbGxlcignUGhvdG9SZXBvcnRFZGl0Q3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJGxvZywgJHN0YXRlUGFyYW1zLCAkdGVtcGxhdGVDYWNoZSwgbG9jYWxTdG9yYWdlU2VydmljZSkge1xuICAgIHZhciB2bSA9ICRzY29wZTtcblxuICAgIHZhciBjdXJyZW50X3BhcnQgPSAncGhvdG8nO1xuICAgIHZhciBpbmRlbnRfaWQgPSAkc3RhdGVQYXJhbXMuaW5kZW50X2lkO1xuICAgIHZhciBjYXJfaWQgPSAkc3RhdGVQYXJhbXMuY2FyX2lkO1xuICAgIC8vIOihqOWNlemhueaVsOaNruWtmOWCqOWIsOacrOWcsOeahCBrZXkg55qE55Sf5oiQ6KeE5YiZXG4gICAgdmFyIHN0b3JlX2tleSA9IFtpbmRlbnRfaWQsIGNhcl9pZF0uam9pbignXycpO1xuICAgIHZhciBzdG9yZV9rZXlfZXJyID0gW3N0b3JlX2tleSwgJ2VyciddLmpvaW4oJ18nKTtcbiAgICB2YXIgaW5pdF9kYXRhID0gbG9jYWxTdG9yYWdlU2VydmljZS5nZXQoc3RvcmVfa2V5KTtcblxuICAgIHZhciBwYXJ0X2pzb24gPSBKU09OLnBhcnNlKCR0ZW1wbGF0ZUNhY2hlLmdldCgncmVwb3J0L2kuanNvbicpKTtcbiAgICB2YXIgcGFyZW50X3BhcnQgPSBwYXJ0X2pzb24uZmluZChmdW5jdGlvbihwYXJ0KSB7XG4gICAgICByZXR1cm4gcGFydC5pZCA9PT0gY3VycmVudF9wYXJ0O1xuICAgIH0pO1xuICAgIHZtLnBhcnRzID0gcGFyZW50X3BhcnQgJiYgcGFyZW50X3BhcnQuY2hpbGRyZW47XG5cbiAgICB2bS5kYXRhID0ge307XG4gICAgLy8g6K6+572u5Yid5aeL5YyW5YC8XG4gICAgYW5ndWxhci5leHRlbmQodm0uZGF0YSwgaW5pdF9kYXRhICYmIGluaXRfZGF0YVtjdXJyZW50X3BhcnRdIHx8IHt9KTtcblxuICAgIHZhciBwaG90b19vZl9ncm91cCA9IGxvY2FsU3RvcmFnZVNlcnZpY2UuZ2V0KHN0b3JlX2tleV9lcnIpO1xuICAgIHZtLnBhcnRfcGhvdG9zID0gXy5tYXAocGhvdG9fb2ZfZ3JvdXAsIGZ1bmN0aW9uKGl0ZW0sIGtleSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaWQ6IGtleSxcbiAgICAgICAgbmFtZTogZ2V0X3BhcnRfbmFtZShrZXkpLFxuICAgICAgICBwaG90b3M6IGl0ZW1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHZtLnBhcnRzLmZvckVhY2goZnVuY3Rpb24ocGFydCkge1xuICAgICAgcGFydC5pdGVtcy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgdm0uZGF0YVtpdGVtLmlkXSA9IHZtLmRhdGFbaXRlbS5pZF0gfHwgeyBpbWFnZTogbnVsbCB9O1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICB2bS50YWtlX3Bob3RvID0gdGFrZV9waG90bztcbiAgICBcbiAgICBmdW5jdGlvbiBnZXRfcGFydF9uYW1lKHBhcnRfaWQpIHtcbiAgICAgIHJldHVybiBwYXJ0X2pzb24uZmluZChmdW5jdGlvbihwYXJ0KSB7IHJldHVybiBwYXJ0LmlkID09PSBwYXJ0X2lkOyB9KS5uYW1lO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRha2VfcGhvdG8ocGFydCwgaXRlbSkge1xuICAgICAgLy8gVE9ETzpcbiAgICAgIC8vIHNldCBpbWFnZSBkYXRhIHRvIGxvY2FsXG4gICAgICAvLyBpbml0X2RhdGFbcGFydC5pZF1baXRlbS5pZF0uaW1hZ2VcbiAgICAgIG5hdmlnYXRvci5jYW1lcmEuZ2V0UGljdHVyZSh0YWtlX3Bob3RvX3N1Y2Nlc3MsIHRha2VfcGhvdG9fZXJyb3IsIHtcbiAgICAgICAgcXVhbGl0eSA6IDEwMCxcbiAgICAgICAgZGVzdGluYXRpb25UeXBlIDogQ2FtZXJhLkRlc3RpbmF0aW9uVHlwZS5GSUxFX1VSSSxcbiAgICAgICAgc291cmNlVHlwZSA6IENhbWVyYS5QaWN0dXJlU291cmNlVHlwZS5DQU1FUkEsXG4gICAgICAgIGFsbG93RWRpdCA6IHRydWUsXG4gICAgICAgIGVuY29kaW5nVHlwZTogQ2FtZXJhLkVuY29kaW5nVHlwZS5QTkcsXG4gICAgICAgIC8vIHRhcmdldFdpZHRoOiAxMDAsXG4gICAgICAgIC8vIHRhcmdldEhlaWdodDogMTAwLFxuICAgICAgICBzYXZlVG9QaG90b0FsYnVtOiBmYWxzZVxuICAgICAgfSk7XG5cbiAgICAgIGZ1bmN0aW9uIHRha2VfcGhvdG9fc3VjY2VzcyhpbWd1cmwpIHtcbiAgICAgICAgdm0uZGF0YVtpdGVtLmlkXSA9IHZtLmRhdGFbaXRlbS5pZF0gfHwge307XG4gICAgICAgIHZtLmRhdGFbaXRlbS5pZF0uaW1hZ2UgPSBpbWd1cmw7XG4gICAgICAgIHZtLiRhcHBseSgpO1xuXG4gICAgICAgIGluaXRfZGF0YVtwYXJ0LmlkXSA9IGluaXRfZGF0YVtwYXJ0LmlkXSB8fCB7fTtcbiAgICAgICAgaW5pdF9kYXRhW3BhcnQuaWRdW2l0ZW0uaWRdID0gYW5ndWxhci5leHRlbmQoaW5pdF9kYXRhW3BhcnQuaWRdW2l0ZW0uaWRdIHx8IHt9LCB2bS5kYXRhW2l0ZW0uaWRdKTtcblxuICAgICAgICBsb2NhbFN0b3JhZ2VTZXJ2aWNlLnNldChzdG9yZV9rZXksIGluaXRfZGF0YSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHRha2VfcGhvdG9fZXJyb3IoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdlcnJvcicsIGFyZ3VtZW50cyk7XG4gICAgICB9XG4gICAgfVxuICB9KVxuXG4gIC5jb250cm9sbGVyKCdSZXBvcnRFZGl0Q3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJGxvZywgJHN0YXRlUGFyYW1zLCAkdGVtcGxhdGVDYWNoZSwgbG9jYWxTdG9yYWdlU2VydmljZSwgJG1vZGFsKSB7XG4gICAgdmFyIHZtID0gJHNjb3BlO1xuXG4gICAgdmFyIGN1cnJlbnRfcGFydCA9ICRzdGF0ZVBhcmFtcy5wYXJ0X2lkO1xuICAgIHZhciBpbmRlbnRfaWQgPSAkc3RhdGVQYXJhbXMuaW5kZW50X2lkO1xuICAgIHZhciBjYXJfaWQgPSAkc3RhdGVQYXJhbXMuY2FyX2lkO1xuICAgIC8vIOihqOWNlemhueaVsOaNruWtmOWCqOWIsOacrOWcsOeahCBrZXkg55qE55Sf5oiQ6KeE5YiZXG4gICAgdmFyIHN0b3JlX2tleSA9IFtpbmRlbnRfaWQsIGNhcl9pZF0uam9pbignXycpO1xuICAgIHZhciBzdG9yZV9rZXlfZXJyID0gW3N0b3JlX2tleSwgJ2VyciddLmpvaW4oJ18nKTtcbiAgICB2YXIgaW5pdF9kYXRhID0gbG9jYWxTdG9yYWdlU2VydmljZS5nZXQoc3RvcmVfa2V5KTtcblxuICAgIC8vIOiOt+WPluaKpeWRiui+k+WFpemhueaVsOaNrlxuICAgIHZhciBwYXJlbnRfcGFydCA9IEpTT04ucGFyc2UoJHRlbXBsYXRlQ2FjaGUuZ2V0KCdyZXBvcnQvaS5qc29uJykpLmZpbmQoZnVuY3Rpb24ocGFydCkgeyByZXR1cm4gcGFydC5pZCA9PT0gY3VycmVudF9wYXJ0OyB9KTtcbiAgICB2bS5wYXJ0cyA9IHBhcmVudF9wYXJ0ICYmIHBhcmVudF9wYXJ0LmNoaWxkcmVuO1xuICAgIFxuICAgIHZtLmRhdGEgPSB7fTtcbiAgICAvLyDorr7nva7liJ3lp4vljJblgLxcbiAgICBhbmd1bGFyLmV4dGVuZCh2bS5kYXRhLCBpbml0X2RhdGEgJiYgaW5pdF9kYXRhW2N1cnJlbnRfcGFydF0gfHwge30pO1xuXG4gICAgLy8gZGF0YSDmlLnlj5jliJnlsIblhbbkv53lrZjliLAgbG9jYWwgc3RvcmFnZVxuICAgIHZtLiR3YXRjaCgnZGF0YScsIGZ1bmN0aW9uKHYpIHtcbiAgICAgICRsb2cubG9nKCdmb3JtIGRhdGE6ICcsIEpTT04uc3RyaW5naWZ5KHYpKTtcblxuICAgICAgc2F2ZSgpO1xuXG4gICAgICBzYXZlX2VycigpO1xuICAgIH0sIHRydWUpO1xuXG4gICAgXG4gICAgLy8g5L+d5a2Y5YiwIGxvY2FsU3RvcmFnZVxuICAgIC8vIOaVsOaNruagvOW8j+S4uu+8mlxuICAgIC8vIHtcbiAgICAvLyAgIFwicjFcIjoge1xuICAgIC8vICAgICBcInJlc3VsdFwiOiAxLFxuICAgIC8vICAgICBcInN0YXRlXCI6IDEsXG4gICAgLy8gICAgIFwiZGVncmVlXCI6IDEsXG4gICAgLy8gICAgIFwibWVtb1wiOiBcInh4eFwiLFxuICAgIC8vICAgICBcImltYWdlXCI6IFwiXCJcbiAgICAvLyAgIH1cbiAgICAvLyB9XG4gICAgZnVuY3Rpb24gc2F2ZSgpIHtcbiAgICAgIHZhciBkYXRhID0gbG9jYWxTdG9yYWdlU2VydmljZS5nZXQoc3RvcmVfa2V5KSB8fCB7fTtcbiAgICAgIGRhdGFbY3VycmVudF9wYXJ0XSA9IHZtLmRhdGE7XG5cbiAgICAgIGxvY2FsU3RvcmFnZVNlcnZpY2Uuc2V0KHN0b3JlX2tleSwgZGF0YSk7XG5cbiAgICAgICRsb2cubG9nKCflvZXlhaXmo4DmtYvmiqXlkYogLSAnICsgc3RvcmVfa2V5LCBkYXRhW2N1cnJlbnRfcGFydF0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNhdmVfZXJyKCkge1xuICAgICAgdmFyIGRhdGEgPSBsb2NhbFN0b3JhZ2VTZXJ2aWNlLmdldChzdG9yZV9rZXlfZXJyKSB8fCB7fTtcbiAgICAgIHZhciBlcnJfaXRlbXMgPSBbXTtcblxuICAgICAgXy5lYWNoKHZtLmRhdGEsIGZ1bmN0aW9uKGl0ZW0sIGtleSkge1xuICAgICAgICBpZiAocGFyc2VJbnQoaXRlbS5yZXN1bHQpID09PSAwKSB7XG4gICAgICAgICAgaXRlbS5pZCA9IGtleTtcbiAgICAgICAgICBlcnJfaXRlbXMucHVzaChpdGVtKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGRhdGFbY3VycmVudF9wYXJ0XSA9IGVycl9pdGVtcyB8fCBbXTtcblxuICAgICAgbG9jYWxTdG9yYWdlU2VydmljZS5zZXQoc3RvcmVfa2V5X2VyciwgZGF0YSk7XG5cbiAgICAgICRsb2cubG9nKCflvZXlhaXmo4DmtYvmiqXlkYrpl67popjpobkgLSAnICsgc3RvcmVfa2V5X2VyciwgZGF0YVtjdXJyZW50X3BhcnRdKTtcbiAgICB9XG5cbiAgICB2bS5zaG93X2RldGFpbCA9IHNob3dfZGV0YWlsO1xuICAgIHZtLnNob3VsZF9jbGVhciA9IHNob3VsZF9jbGVhcjtcblxuICAgIC8vIOmBv+WFjeWxleekuuS4pOasoSBtb2RhbFxuICAgIHZhciBpc19zaG93X2RldGFpbCA9IGZhbHNlO1xuICAgIGZ1bmN0aW9uIHNob3dfZGV0YWlsKGluZGV4LCBwYXJ0LCBjaGVja19pdGVtKSB7XG4gICAgICAvLyBjaGFuZ2Ug5LqL5Lu25Y+R55Sf5ZyoIGNsaWNrIOS5i+WQjlxuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKGlzX3Nob3dfZGV0YWlsIHx8IHBhcnNlSW50KHZtLmRhdGFbY2hlY2tfaXRlbS5pZF0ucmVzdWx0KSAhPT0gMCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlzX3Nob3dfZGV0YWlsID0gdHJ1ZTtcblxuICAgICAgICB2YXIgaW5wdXRfZGV0YWlsX2lucyA9ICRtb2RhbC5vcGVuKHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3JlcG9ydC9pbnB1dF9kZXRhaWwuaHRtJyxcbiAgICAgICAgICBjb250cm9sbGVyOiAnSXRlbUlucHV0RGV0YWlsQ3RybCcsXG4gICAgICAgICAgYmFja2Ryb3A6ICdzdGF0aWMnLFxuICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgIGl0ZW1fZGV0YWlsOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGFuZ3VsYXIuZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICBwYXJ0X25hbWU6IHBhcnQubmFtZSxcbiAgICAgICAgICAgICAgICBwYXJ0X2FsaWFzOiBwYXJ0LmFsaWFzLFxuICAgICAgICAgICAgICAgIGluZGV4OiBpbmRleFxuICAgICAgICAgICAgICB9LCBjaGVja19pdGVtLCB2bS5kYXRhW2NoZWNrX2l0ZW0uaWRdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlucHV0X2RldGFpbF9pbnMucmVzdWx0LnRoZW4oXG4gICAgICAgICAgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgYW5ndWxhci5leHRlbmQodm0uZGF0YVtjaGVja19pdGVtLmlkXSwgaXRlbSwge1xuICAgICAgICAgICAgICBuYW1lOiBjaGVja19pdGVtLm5hbWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaXNfc2hvd19kZXRhaWwgPSBmYWxzZTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaXNfc2hvd19kZXRhaWwgPSBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzaG91bGRfY2xlYXIoaXRlbSkge1xuICAgICAgLy8g6Iul5qOA5rWL5peg6Zeu6aKY77yM5YiZ5riF6Zmk5LmL5YmN5aGr5YaZ55qE5o2f5Lyk5pWw5o2uXG4gICAgICBpZiAocGFyc2VJbnQodm0uZGF0YVtpdGVtLmlkXS5yZXN1bHQpICE9PSAwKSB7XG4gICAgICAgIHZtLmRhdGFbaXRlbS5pZF0uc3RhdGUgPSBudWxsO1xuICAgICAgICB2bS5kYXRhW2l0ZW0uaWRdLmRlZ3JlZSA9IG51bGw7XG4gICAgICAgIHZtLmRhdGFbaXRlbS5pZF0ubWVtbyA9IG51bGw7XG4gICAgICAgIHZtLmRhdGFbaXRlbS5pZF0uaW1hZ2UgPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgfSlcblxuICAuY29udHJvbGxlcignSXRlbUlucHV0RGV0YWlsQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJG1vZGFsSW5zdGFuY2UsIGl0ZW1fZGV0YWlsKSB7XG4gICAgdmFyIHZtID0gJHNjb3BlO1xuXG4gICAgYW5ndWxhci5leHRlbmQodm0sIGl0ZW1fZGV0YWlsKTtcblxuICAgIHZtLnN1Ym1pdCA9IHN1Ym1pdDtcbiAgICB2bS5jYW5jZWwgPSBjYW5jZWw7XG5cbiAgICBmdW5jdGlvbiBzdWJtaXQoKSB7XG4gICAgICAkbW9kYWxJbnN0YW5jZS5jbG9zZSh7XG4gICAgICAgIHN0YXRlOiB2bS5zdGF0ZSxcbiAgICAgICAgZGVncmVlOiB2bS5kZWdyZWUsXG4gICAgICAgIG1lbW86IHZtLm1lbW8sXG4gICAgICAgIC8vIFRPRE86XG4gICAgICAgIC8vIOS7jueFp+ebuOacuuiOt+WPluWbvueJh+WcsOWdgFxuICAgICAgICBpbWFnZTogJy9kL2MvYi9hLnBuZydcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNhbmNlbCgpIHtcbiAgICAgICRtb2RhbEluc3RhbmNlLmRpc21pc3MoKTtcbiAgICB9XG4gIH0pO1xuXG5cblxuXG5cbiIsImFuZ3VsYXJcbiAgLm1vZHVsZSgnZ3VsdS5yZXBvcnQuc3ZjcycsIFsnbmdSZXNvdXJjZSddKVxuXG4gIC5zZXJ2aWNlKCdSZXBvcnRzU3ZjJywgZnVuY3Rpb24oJHJlc291cmNlKSB7XG4gICAgcmV0dXJuICRyZXNvdXJjZSgnL3JlcG9ydHMnKTtcbiAgfSk7IiwiLy8gNDA0IOmhtemdolxuLy8gTW9kdWxlOiBndWx1Lm1pc3Npbmdcbi8vIERlcGVuZGVuY2llczogbmdSb3V0ZVxuXG5hbmd1bGFyXG4gIC5tb2R1bGUoJ2d1bHUubWlzc2luZycsIFsndWkucm91dGVyJ10pXG5cbiAgLy8g6YWN572uIHJvdXRlXG4gIC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXJcbiAgICAgIC5zdGF0ZSgnbWlzc2luZycsIHtcbiAgICAgICAgdXJsOiAnL21pc3NpbmcnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJzQwNC80MDQuaHRtJyxcbiAgICAgICAgY29udHJvbGxlcjogJ01pc3NpbmdDdHJsJ1xuICAgICAgfSk7XG4gIH0pXG5cbiAgLy8gNDA0IGNvbnRyb2xsZXJcbiAgLmNvbnRyb2xsZXIoJ01pc3NpbmdDdHJsJywgZnVuY3Rpb24gKCRzY29wZSkge1xuICAgIGNvbnNvbGUubG9nKCdJYG0gaGVyZScpO1xuICAgIC8vIFRPRE86XG4gICAgLy8gMS4gc2hvdyBsYXN0IHBhdGggYW5kIHBhZ2UgbmFtZVxuICB9KTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==