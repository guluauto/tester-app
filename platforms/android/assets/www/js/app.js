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
    'chieffancypants.loadingBar',
    'util.filters',
    'util.date',
    'gulu.login',
    'gulu.client_service',
    'gulu.missing'
  ])
  .config(["$locationProvider", "$urlRouterProvider", "$stateProvider", function($locationProvider, $urlRouterProvider, $stateProvider) {
    // not use html5 history api
    // but use hashbang
    $locationProvider
      .html5Mode(false)
      .hashPrefix('!');

    // define 404
    $urlRouterProvider
      .otherwise('/login');

    // API Server
    API_SERVERS = {
      // cservice: 'http://c.guluabc.com'
      cservice: 'http://c.guluabc.com'
    };
  }])
  .run(["$rootScope", "$location", "$state", "$stateParams", function($rootScope, $location, $state, $stateParams) {
    var reg = /[\&\?]_=\d+/;

    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;

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
  .module('gulu.client_service', [
    'ui.router',
    'gulu.indent'
  ])
  .config(["$stateProvider", function($stateProvider) {
    $stateProvider
      .state('client_service', {
        abstract: true,
        url: '/indents',
        templateUrl: 'client-service/dashboard.htm',
        resolve: {
          IndentEnums: 'IndentEnums'
        }
      })
      .state('client_service.list', {
        url: '',
        templateUrl: 'indent/list.htm',
        controller: 'IndentListCtrl'
      })
      .state('client_service.approval', {
        url: '/approval',
        templateUrl: 'indent/list_approval.htm',
        controller: 'IndentApprovalListCtrl'
      })
      .state('client_service.indent', {
        url: '/{indent_id:[0-9]+}',
        templateUrl: 'indent/edit.htm',
        controller: 'IndentCtrl'
      });
  }]);

angular
  .module('gulu.indent', [
    'gulu.indent.svcs',
    'gulu.indent.enums'
  ]);

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
  .module('gulu.indent')
  
  .controller('IndentCtrl', ["$scope", "$rootScope", "$location", "$timeout", "$filter", "toastr", "DateUtil", "IndentsSvc", "IndentSvc", "IndentEnums", function ($scope, $rootScope, $location, $timeout, $filter, toastr, DateUtil, IndentsSvc, IndentSvc, IndentEnums) {
    var vm = $scope;

    var indent_id = vm.$stateParams.indent_id;

    vm.type_list = IndentEnums.list('type');
    vm.channel_list = IndentEnums.list('channel');
    // vm.brand_list = IndentEnums.list('brand');
    // vm.series_list = IndentEnums.list('series');

    vm.submit = submit;
    vm.cancel = cancel;
    vm.cancel_confirm = cancel_confirm;
    vm.open_datepicker = open_datepicker;

    function submit() {
      return IndentSvc
        .update({
          id: vm.id
        }, {
          type: vm.type.value,
          reserver: vm.reserver,
          mobile: vm.mobile.replace(/[\s\-]+/g, ''),
          test_time: vm.test_time,
          address: vm.address,
          memo: vm.memo,
          channel: vm.channel.value,
          status: 2
        })
        .$promise
        .then(function(res) {
          toastr.success(res.msg || '预约单确认并生效成功');

          $timeout(function() {
            $rootScope.back();
          }, 2000);
        })
        .catch(function(res) {
          toastr.error(res.msg || '预约单确认并生效失败，请重试');
        });
    }

    function open_datepicker($event) {
      $event.preventDefault();
      $event.stopPropagation();

      vm.test_time_open = true;
    }

    function cancel() {
      IndentSvc
        .remove({
          id: vm.id
        })
        .$promise
        .then(function(res) {
          toastr.success(res.msg || '取消预约单成功');

          $timeout(function() {
            $rootScope.back();
          }, 2000);
        })
        .catch(function(res) {
          toastr.error(res.msg || '取消预约单失败，请重试');
        });
    }

    function cancel_confirm() {
      IndentSvc
        .update({
          id: vm.id
        }, {
          status: 1
        })
        .$promise
        .then(function(res) {
          toastr.success(res.msg || '已取消确认订单');

          $rootScope.back();
        })
        .catch(function(res) {
          toastr.error(res.msg || '取消确认订单，请重试');
        });
    }

    function select_item(list_name, value) {
      vm[list_name] = IndentEnums.item(list_name, value);
    }

    function watch_test_time_part() {
      vm.$watch('test_time_before', function(test_time_before) {
        if (test_time_before && !vm.edit_form.test_time_before.$pristine) {
          vm.test_time_after = new Date(test_time_before);  
        }
      });

      vm.$watch('test_time_after', function(test_time_after) {
        if (test_time_after && !vm.edit_form.test_time_after.$pristine) {
          vm.test_time = DateUtil.toLocalTimeString(test_time_after);
        }
      });
    }

    function set_selected_item() {
      select_item('type', vm.type);
      select_item('channel', vm.channel);
      // select_item('brand', vm.car.brand);
      // select_item('series', vm.car.series);
    }

    // 新建预约单
    if (indent_id == 0) {
      return IndentsSvc
        .save()
        .$promise
        .then(function(res) {
          angular.extend(vm, res.toJSON());

          set_selected_item();
          watch_test_time_part();
        })
        .catch(function(res) {
          toastr.error(res.msg || '新建预约单失败，请刷新重试');
        });
    }

    // 若更新预约单，则获取预约单信息
    IndentSvc
      .get({
        id: indent_id
      })
      .$promise
      .then(function(res) {
        angular.extend(vm, res.toJSON());

        var test_time_sp = vm.test_time.split(' ');

        vm.test_time_before = test_time_sp[0];
        vm.test_time_after = new Date(vm.test_time);

        set_selected_item();
        watch_test_time_part();
      })
      .catch(function(res) {
        toastr.error(res.msg || '获取订单信息失败，请刷新重试');
      });
  }]);
angular
  .module('gulu.indent.enums', ['util.enums', 'gulu.indent.svcs'])

  .factory('IndentEnums', ["Enums", "IndentEnumsSvc", "toastr", function(Enums, IndentEnumsSvc, toastr) {
    return IndentEnumsSvc
      .get()
      .$promise
      .then(function(res) {
        var all_preins = 'type channel brand series status city tester role from'.split(' ');

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
    return $resource(API_SERVERS.cservice + '/enums');
  }])
  
  .service('IndentsSvc', ["$resource", function ($resource) {
    return $resource(API_SERVERS.cservice + '/orders', {}, {
      query: {
        isArray: false
      }
    });
  }])

  .service('IndentSvc', ["$resource", function ($resource) {
    return $resource(API_SERVERS.cservice + '/orders/:id', {
      id: '@id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }])

  .service('IndentTesterSvc', ["$resource", function ($resource) {
    return $resource(API_SERVERS.cservice + '/orders/:id/tester', {
      id: '@id'
    });
  }])

  .service('TestersSvc', ["$resource", function($resource) {
    return $resource(API_SERVERS.cservice + '/testers', {}, {
      query: {
        isArray: false
      }
    });
  }])

  .service('IndentApprovalSvc', ["$resource", function($resource) {
    return $resource(API_SERVERS.cservice + '/orders/:id/approval', {
      id: '@id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }]);
/* global angular */
angular
  .module('gulu.indent')
  
  .controller('IndentListCtrl', ["$scope", "$location", "$q", "toastr", "$modal", "IndentsSvc", "IndentApprovalSvc", "IndentSvc", "IndentEnums", function($scope, $location, $q, toastr, $modal,
    IndentsSvc, IndentApprovalSvc, IndentSvc, IndentEnums) {
    var vm = $scope;
    var qso = $location.search();

    vm.status_id = parseInt(qso.status_id) || null;
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

    vm.page = parseInt(qso.page) || 1;
    vm.size = parseInt(qso.size) || 20;
    vm.sizes = IndentEnums.list('size');
    vm.size_item = IndentEnums.item('size', vm.size);

    vm.size_change = size_change;
    vm.page_change = page_change;
    vm.search = search;
    vm.confirm_order = confirm_order;
    vm.dispatch_tester = dispatch_tester;
    vm.cancel_order = cancel_order;
    vm.approval = approval;

    query();

    function query() {
      var params = {
        size: vm.size,
        page: vm.page,

        status_id: vm.status_id,
        city_id: vm.city_id,
        tester_id: vm.tester_id,
        role_id: vm.role_id,
        mobile: vm.mobile
      };
      
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

    vm.$watchCollection('items', function(items) {
      vm.items = items;
    });

    watch_list('status', 'status_id');
    watch_list('city', 'city_id');
    watch_list('role', 'role_id');
    watch_list('tester', 'tester_id');

    function watch_list(name, field) {
      vm.$watch(name, function(item) {
        if (!item) {
          return;
        }

        vm[field] = item.value;
      });
    }

    function fetch_order(id) {
      return IndentSvc
        .get({
          id: id
        })
        .$promise
        .then(function(order) {
          if (order.status !== 1) {
            var index = _.findIndex(vm.items, function(item) {
              return item.id === order.id;
            });

            order = order.toJSON();

            order.status_text = IndentEnums.text('status', order.status);
            order.confirm_by_other = true;

            vm.items.splice(index, 1, order);

            return $q.reject({
              msg: '该订单已被其他客服确认'
            });
          }
        });
    }

    // 确认订单
    function confirm_order(item) {
      var _confirm_order = function() {
        return IndentSvc
          .update({
            id: item.id
          }, {
            status: 1001
          })
          .$promise;
      };

      return $q
        .when(fetch_order(item.id))
        .then(_confirm_order)
        .then(function(res) {
          toastr.success(res.msg || '已确认该订单');

          $location.url('/indents/' + item.id);
        })
        .catch(function(res) {
          toastr.error(res.msg || '确认该订单失败');
        });
    }

    // 分配检测师
    function dispatch_tester(item) {
      var _dispatch_tester = function() {
        var dispatch_tester_ins = $modal.open({
          templateUrl: 'indent/dispatch_tester.htm',
          controller: 'DispatchCtrl',
          backdrop: 'static',
          resolve: {
            indent_info: function() {
              return item;
            }
          }
        });

        dispatch_tester_ins.result.then(function(tester) {
          // TODO:
          // 更新预约单状态
          query();
        });
      }
      
      $q
        .when(fetch_order(item.id))
        .then(_dispatch_tester)
        .catch(function(res) {
          toastr.error(res.msg || '分配检测师失败');
        });

      return false;
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

    // 审核取消
    function approval(item) {
      if (confirm('确认同意取消该订单？')) {
        IndentApprovalSvc
          .update({
            id: item.id
          })
          .$promise
          .then(function(res) {
            toastr.success(res.msg || '同意取消该订单，操作成功');

            query();
          })
          .catch(function(res) {
            toastr.error(res.msg || '提交失败，请重试');
          });
      }
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
  
  // 待审批列表
  .controller('IndentApprovalListCtrl', ["$scope", "$location", "toastr", "IndentsSvc", "IndentApprovalSvc", "IndentEnums", function($scope, $location, toastr, IndentsSvc, IndentApprovalSvc, IndentEnums) {
    var vm = $scope;
    var qso = $location.search();
    
    vm.page = parseInt(qso.page) || 1;
    vm.size = parseInt(qso.size) || 20;
    vm.sizes = IndentEnums.list('size');
    vm.size_item = IndentEnums.item('size', vm.size);

    vm.size_change = size_change;
    vm.page_change = page_change;
    vm.approval = approval;

    query();

    function query() {
      var params = {
        size: vm.size,
        page: vm.page,
        status_id: 3
      };
      
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

    // 审核取消
    function approval(item) {
      if (confirm('确认同意取消该订单？')) {
        IndentApprovalSvc
          .update({
            id: item.id
          })
          .$promise
          .then(function(res) {
            toastr.success(res.msg || '同意取消该订单，操作成功');

            query();
          })
          .catch(function(res) {
            toastr.error(res.msg || '提交失败，请重试');
          });
      }
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

  }])

  // 分配检测师
  .controller('DispatchCtrl', ["$scope", "$modalInstance", "toastr", "IndentTesterSvc", "TestersSvc", "indent_info", function($scope, $modalInstance, toastr, IndentTesterSvc, TestersSvc, indent_info) {
    var vm = $scope;

    angular.extend(vm, indent_info);

    vm.page = 1;
    vm.query = query;

    vm.cancel = cancel;
    vm.dispatch = dispatch;

    query(1);

    function query(page) {
      vm.page = page;

      TestersSvc
        .query({
          time: indent_info.test_time,
          page: page
        })
        .$promise
        .then(function(res) {
          vm.items = res.items;
          vm.total_count = res.total_count;
        })
        .catch(function(res) {
          toastr.error(res.msg || '获取空档期检测师失败，请重试');
        });
    }

    function dispatch(tester) {
      vm.dispatch_status = true;

      IndentTesterSvc
        .save({
          id: indent_info.id
        }, {
          tester_id: tester.id
        })
        .$promise
        .then(function(res) {
          toastr.success(res.msg || '分配检测师成功');

          $modalInstance.close(tester);
        })
        .catch(function(res) {
          vm.dispatch_status = false;
          toastr.error(res.msg || '分配检测师失败，请重试');
        });
    }

    function cancel() {
      $modalInstance.dismiss();
    }
  }])
  
  // 取消订单
  .controller('CancelOrderCtrl', ["$scope", "$modalInstance", "toastr", "IndentSvc", "indent_info", function($scope, $modalInstance, toastr, IndentSvc, indent_info) {
    var vm = $scope;

    angular.extend(vm, indent_info);

    vm.cancel_order = cancel_order;
    vm.cancel = cancel;

    function cancel_order() {
      vm.cancel_order_status = true;

      IndentSvc
        .remove({
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
        .then(function(data) {
          toastr.success(data.msg || '登录成功，正在为你跳转...');

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImNsaWVudC1zZXJ2aWNlL2NsaWVudF9zZXJ2aWNlX21vZHVsZS5qcyIsImluZGVudC9pbmRlbnRfbW9kdWxlLmpzIiwibG9naW4vbG9naW5fbW9kdWxlLmpzIiwiNDA0LzQwNF9jdHJsLmpzIiwiY29tcG9uZW50L2N1c3RvbS1kaXJlY3RpdmUuanMiLCJjb21wb25lbnQvY3VzdG9tLWZpbHRlci5qcyIsImNvbXBvbmVudC9kYXRlLmpzIiwiY29tcG9uZW50L2VudW1zLmpzIiwiY29tcG9uZW50L2h0dHAuanMiLCJjb21wb25lbnQvemgtY24uanMiLCJpbmRlbnQvZWRpdF9jdHJsLmpzIiwiaW5kZW50L2VudW1zLmpzIiwiaW5kZW50L2luZGVudF9zdmNzLmpzIiwiaW5kZW50L2xpc3RfY3RybC5qcyIsImxvZ2luL2xvZ2luX2N0cmwuanMiLCJsb2dpbi9sb2dpbl9zdmNzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7QUFNQTtHQUNBLE9BQUEsUUFBQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTs7R0FFQSxxRUFBQSxTQUFBLG1CQUFBLG9CQUFBLGdCQUFBOzs7SUFHQTtPQUNBLFVBQUE7T0FDQSxXQUFBOzs7SUFHQTtPQUNBLFVBQUE7OztJQUdBLGNBQUE7O01BRUEsVUFBQTs7O0dBR0EsMERBQUEsU0FBQSxZQUFBLFdBQUEsUUFBQSxjQUFBO0lBQ0EsSUFBQSxNQUFBOztJQUVBLFdBQUEsU0FBQTtJQUNBLFdBQUEsZUFBQTs7O0lBR0E7T0FDQSxPQUFBLFdBQUE7UUFDQSxPQUFBLFVBQUE7U0FDQSxTQUFBLFNBQUEsS0FBQTtRQUNBLElBQUEsUUFBQSxRQUFBLEtBQUEsUUFBQSxJQUFBLFFBQUEsS0FBQSxLQUFBO1VBQ0E7OztRQUdBLFdBQUEsVUFBQTs7O0lBR0EsV0FBQSxPQUFBLFdBQUE7TUFDQSxVQUFBLElBQUEsV0FBQTs7Ozs7QUN6REE7R0FDQSxPQUFBLHVCQUFBO0lBQ0E7SUFDQTs7R0FFQSwwQkFBQSxTQUFBLGdCQUFBO0lBQ0E7T0FDQSxNQUFBLGtCQUFBO1FBQ0EsVUFBQTtRQUNBLEtBQUE7UUFDQSxhQUFBO1FBQ0EsU0FBQTtVQUNBLGFBQUE7OztPQUdBLE1BQUEsdUJBQUE7UUFDQSxLQUFBO1FBQ0EsYUFBQTtRQUNBLFlBQUE7O09BRUEsTUFBQSwyQkFBQTtRQUNBLEtBQUE7UUFDQSxhQUFBO1FBQ0EsWUFBQTs7T0FFQSxNQUFBLHlCQUFBO1FBQ0EsS0FBQTtRQUNBLGFBQUE7UUFDQSxZQUFBOzs7O0FDNUJBO0dBQ0EsT0FBQSxlQUFBO0lBQ0E7SUFDQTs7O0FDSEE7R0FDQSxPQUFBLGNBQUE7SUFDQTtJQUNBOzs7R0FHQSwwQkFBQSxTQUFBLGdCQUFBO0lBQ0E7T0FDQSxNQUFBLFNBQUE7UUFDQSxLQUFBO1FBQ0EsYUFBQTtRQUNBLFlBQUE7Ozs7Ozs7O0FDUEE7R0FDQSxPQUFBLGdCQUFBLENBQUE7OztHQUdBLDBCQUFBLFVBQUEsZ0JBQUE7SUFDQTtPQUNBLE1BQUEsV0FBQTtRQUNBLEtBQUE7UUFDQSxhQUFBO1FBQ0EsWUFBQTs7Ozs7R0FLQSxXQUFBLDBCQUFBLFVBQUEsUUFBQTtJQUNBLFFBQUEsSUFBQTs7Ozs7OztBQ2pCQTtHQUNBLE9BQUEscUJBQUE7R0FDQSxVQUFBLGdDQUFBLFNBQUEsVUFBQTtJQUNBLE9BQUE7TUFDQSxVQUFBO01BQ0EsTUFBQSxTQUFBLE9BQUEsU0FBQSxZQUFBO1FBQ0EsTUFBQSxPQUFBLFdBQUEsb0JBQUEsU0FBQSxPQUFBO1VBQ0EsUUFBQSxLQUFBLGlCQUFBLENBQUEsQ0FBQTs7Ozs7O0FDVEE7R0FDQSxPQUFBLGdCQUFBOztHQUVBLE9BQUEsVUFBQSxXQUFBO0lBQ0EsT0FBQSxTQUFBLEdBQUE7TUFDQSxJQUFBLEtBQUEsTUFBQTtRQUNBLE9BQUE7OztNQUdBLElBQUEsRUFBQSxRQUFBLFlBQUE7O01BRUEsSUFBQSxFQUFBLFNBQUEsR0FBQTtRQUNBLE9BQUE7OztNQUdBLElBQUEsS0FBQSxFQUFBLE1BQUE7O01BRUEsR0FBQSxPQUFBLEdBQUEsR0FBQTs7TUFFQSxJQUFBLEVBQUEsVUFBQSxHQUFBO1FBQ0EsR0FBQSxPQUFBLEdBQUEsR0FBQTs7O01BR0EsT0FBQSxHQUFBLEtBQUE7Ozs7QUN2QkE7R0FDQSxPQUFBLGFBQUE7R0FDQSxRQUFBLFlBQUEsWUFBQTtJQUNBLElBQUEsV0FBQSxVQUFBLE1BQUEsR0FBQTtNQUNBLE9BQUEsS0FBQSxnQkFBQSxLQUFBLEtBQUEsYUFBQSxLQUFBLElBQUEsS0FBQTs7O0lBR0EsT0FBQTtNQUNBLG1CQUFBLFVBQUEsTUFBQTtRQUNBLE9BQUEsU0FBQSxNQUFBOzs7TUFHQSxtQkFBQSxTQUFBLE1BQUE7UUFDQSxJQUFBLElBQUEsS0FBQTtRQUNBLElBQUEsSUFBQSxLQUFBOztRQUVBLElBQUEsSUFBQSxJQUFBO1VBQ0EsSUFBQSxNQUFBOzs7UUFHQSxJQUFBLElBQUEsSUFBQTtVQUNBLElBQUEsTUFBQTs7O1FBR0EsT0FBQSxDQUFBLFNBQUEsTUFBQSxNQUFBLElBQUEsTUFBQSxHQUFBLEtBQUE7Ozs7O0FDdkJBO0dBQ0EsT0FBQSxjQUFBO0dBQ0EsUUFBQSxTQUFBLFlBQUE7SUFDQSxPQUFBLFVBQUEsT0FBQTtNQUNBLE9BQUE7UUFDQSxLQUFBLFVBQUEsTUFBQSxNQUFBO1VBQ0EsT0FBQSxNQUFBLE1BQUEsS0FBQSxVQUFBLE1BQUE7WUFDQSxPQUFBLEtBQUEsU0FBQTthQUNBOztRQUVBLE1BQUEsVUFBQSxNQUFBLEtBQUE7VUFDQSxPQUFBLE1BQUEsTUFBQSxLQUFBLFVBQUEsTUFBQTtZQUNBLE9BQUEsS0FBQSxVQUFBO2FBQ0E7O1FBRUEsTUFBQSxVQUFBLE1BQUEsS0FBQTtVQUNBLE9BQUEsTUFBQSxNQUFBLEtBQUEsVUFBQSxNQUFBO1lBQ0EsT0FBQSxLQUFBLFVBQUE7OztRQUdBLE1BQUEsVUFBQSxNQUFBO1VBQ0EsT0FBQSxNQUFBOztRQUVBLE9BQUEsVUFBQSxNQUFBLE1BQUE7VUFDQSxPQUFBLE1BQUEsTUFBQSxPQUFBLFVBQUEsTUFBQTtZQUNBLE9BQUEsS0FBQSxRQUFBLEtBQUEsV0FBQSxDQUFBOzs7Ozs7QUMxQkE7R0FDQSxPQUFBLG9CQUFBOztHQUVBLHlCQUFBLFNBQUEsZUFBQTtJQUNBLGNBQUEsYUFBQSxLQUFBOzs7SUFHQSxjQUFBLFNBQUEsUUFBQSxPQUFBLHNCQUFBOzs7R0FHQSxRQUFBLHdDQUFBLFNBQUEsSUFBQSxZQUFBO0lBQ0EsT0FBQTs7TUFFQSxXQUFBLFNBQUEsUUFBQTs7UUFFQSxJQUFBLE9BQUEsSUFBQSxRQUFBLFlBQUEsQ0FBQSxLQUFBLE9BQUEsSUFBQSxRQUFBLFdBQUEsQ0FBQSxHQUFBO1VBQ0EsT0FBQTs7O1FBR0EsT0FBQSxNQUFBLE9BQUEsTUFBQSxRQUFBLElBQUEsT0FBQTs7UUFFQSxPQUFBOzs7O01BSUEsZ0JBQUEsU0FBQSxXQUFBO1FBQ0EsT0FBQSxHQUFBLE9BQUE7Ozs7Ozs7OztNQVNBLFlBQUEsU0FBQSxVQUFBOztRQUVBLElBQUEsTUFBQTs7UUFFQSxJQUFBLFFBQUEsU0FBQSxTQUFBLE9BQUE7VUFDQSxPQUFBLFNBQUEsS0FBQTtVQUNBLE9BQUEsU0FBQSxLQUFBOzs7OztVQUtBLElBQUEsU0FBQSxLQUFBO1lBQ0EsT0FBQSxHQUFBLE9BQUE7Ozs7OztVQU1BLElBQUEsUUFBQSxNQUFBO1lBQ0EsU0FBQSxPQUFBOzs7Ozs7Ozs7UUFTQSxPQUFBOzs7O01BSUEsaUJBQUEsU0FBQSxXQUFBO1FBQ0EsT0FBQSxHQUFBLE9BQUE7Ozs7QUNwRUE7QUFDQSxRQUFBLE9BQUEsWUFBQSxJQUFBLENBQUEsWUFBQSxTQUFBLFVBQUE7RUFDQSxJQUFBLGtCQUFBO0lBQ0EsTUFBQTtJQUNBLEtBQUE7SUFDQSxLQUFBO0lBQ0EsS0FBQTtJQUNBLE1BQUE7SUFDQSxPQUFBOztFQUVBLFNBQUEsTUFBQSxXQUFBO0lBQ0Esb0JBQUE7TUFDQSxTQUFBO1FBQ0E7UUFDQTs7TUFFQSxPQUFBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7O01BRUEsU0FBQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7TUFFQSxZQUFBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7O01BRUEsY0FBQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7TUFFQSxZQUFBO01BQ0EsWUFBQTtNQUNBLFVBQUE7TUFDQSxjQUFBO01BQ0EsY0FBQTtNQUNBLFNBQUE7TUFDQSxhQUFBO01BQ0EsYUFBQTs7SUFFQSxrQkFBQTtNQUNBLGdCQUFBO01BQ0EsZUFBQTtNQUNBLGFBQUE7TUFDQSxZQUFBLENBQUE7UUFDQSxTQUFBO1FBQ0EsVUFBQTtRQUNBLFdBQUE7UUFDQSxXQUFBO1FBQ0EsV0FBQTtRQUNBLFVBQUE7UUFDQSxVQUFBO1FBQ0EsVUFBQTtRQUNBLFVBQUE7UUFDQSxVQUFBO1NBQ0E7UUFDQSxTQUFBO1FBQ0EsVUFBQTtRQUNBLFdBQUE7UUFDQSxXQUFBO1FBQ0EsV0FBQTtRQUNBLFVBQUE7UUFDQSxVQUFBO1FBQ0EsVUFBQTtRQUNBLFVBQUE7UUFDQSxVQUFBOzs7SUFHQSxNQUFBO0lBQ0EsYUFBQSxTQUFBLEdBQUE7TUFDQSxPQUFBLGdCQUFBOzs7OztBQ3JHQTtHQUNBLE9BQUE7O0dBRUEsV0FBQSwySUFBQSxVQUFBLFFBQUEsWUFBQSxXQUFBLFVBQUEsU0FBQSxRQUFBLFVBQUEsWUFBQSxXQUFBLGFBQUE7SUFDQSxJQUFBLEtBQUE7O0lBRUEsSUFBQSxZQUFBLEdBQUEsYUFBQTs7SUFFQSxHQUFBLFlBQUEsWUFBQSxLQUFBO0lBQ0EsR0FBQSxlQUFBLFlBQUEsS0FBQTs7OztJQUlBLEdBQUEsU0FBQTtJQUNBLEdBQUEsU0FBQTtJQUNBLEdBQUEsaUJBQUE7SUFDQSxHQUFBLGtCQUFBOztJQUVBLFNBQUEsU0FBQTtNQUNBLE9BQUE7U0FDQSxPQUFBO1VBQ0EsSUFBQSxHQUFBO1dBQ0E7VUFDQSxNQUFBLEdBQUEsS0FBQTtVQUNBLFVBQUEsR0FBQTtVQUNBLFFBQUEsR0FBQSxPQUFBLFFBQUEsWUFBQTtVQUNBLFdBQUEsR0FBQTtVQUNBLFNBQUEsR0FBQTtVQUNBLE1BQUEsR0FBQTtVQUNBLFNBQUEsR0FBQSxRQUFBO1VBQ0EsUUFBQTs7U0FFQTtTQUNBLEtBQUEsU0FBQSxLQUFBO1VBQ0EsT0FBQSxRQUFBLElBQUEsT0FBQTs7VUFFQSxTQUFBLFdBQUE7WUFDQSxXQUFBO2FBQ0E7O1NBRUEsTUFBQSxTQUFBLEtBQUE7VUFDQSxPQUFBLE1BQUEsSUFBQSxPQUFBOzs7O0lBSUEsU0FBQSxnQkFBQSxRQUFBO01BQ0EsT0FBQTtNQUNBLE9BQUE7O01BRUEsR0FBQSxpQkFBQTs7O0lBR0EsU0FBQSxTQUFBO01BQ0E7U0FDQSxPQUFBO1VBQ0EsSUFBQSxHQUFBOztTQUVBO1NBQ0EsS0FBQSxTQUFBLEtBQUE7VUFDQSxPQUFBLFFBQUEsSUFBQSxPQUFBOztVQUVBLFNBQUEsV0FBQTtZQUNBLFdBQUE7YUFDQTs7U0FFQSxNQUFBLFNBQUEsS0FBQTtVQUNBLE9BQUEsTUFBQSxJQUFBLE9BQUE7Ozs7SUFJQSxTQUFBLGlCQUFBO01BQ0E7U0FDQSxPQUFBO1VBQ0EsSUFBQSxHQUFBO1dBQ0E7VUFDQSxRQUFBOztTQUVBO1NBQ0EsS0FBQSxTQUFBLEtBQUE7VUFDQSxPQUFBLFFBQUEsSUFBQSxPQUFBOztVQUVBLFdBQUE7O1NBRUEsTUFBQSxTQUFBLEtBQUE7VUFDQSxPQUFBLE1BQUEsSUFBQSxPQUFBOzs7O0lBSUEsU0FBQSxZQUFBLFdBQUEsT0FBQTtNQUNBLEdBQUEsYUFBQSxZQUFBLEtBQUEsV0FBQTs7O0lBR0EsU0FBQSx1QkFBQTtNQUNBLEdBQUEsT0FBQSxvQkFBQSxTQUFBLGtCQUFBO1FBQ0EsSUFBQSxvQkFBQSxDQUFBLEdBQUEsVUFBQSxpQkFBQSxXQUFBO1VBQ0EsR0FBQSxrQkFBQSxJQUFBLEtBQUE7Ozs7TUFJQSxHQUFBLE9BQUEsbUJBQUEsU0FBQSxpQkFBQTtRQUNBLElBQUEsbUJBQUEsQ0FBQSxHQUFBLFVBQUEsZ0JBQUEsV0FBQTtVQUNBLEdBQUEsWUFBQSxTQUFBLGtCQUFBOzs7OztJQUtBLFNBQUEsb0JBQUE7TUFDQSxZQUFBLFFBQUEsR0FBQTtNQUNBLFlBQUEsV0FBQSxHQUFBOzs7Ozs7SUFNQSxJQUFBLGFBQUEsR0FBQTtNQUNBLE9BQUE7U0FDQTtTQUNBO1NBQ0EsS0FBQSxTQUFBLEtBQUE7VUFDQSxRQUFBLE9BQUEsSUFBQSxJQUFBOztVQUVBO1VBQ0E7O1NBRUEsTUFBQSxTQUFBLEtBQUE7VUFDQSxPQUFBLE1BQUEsSUFBQSxPQUFBOzs7OztJQUtBO09BQ0EsSUFBQTtRQUNBLElBQUE7O09BRUE7T0FDQSxLQUFBLFNBQUEsS0FBQTtRQUNBLFFBQUEsT0FBQSxJQUFBLElBQUE7O1FBRUEsSUFBQSxlQUFBLEdBQUEsVUFBQSxNQUFBOztRQUVBLEdBQUEsbUJBQUEsYUFBQTtRQUNBLEdBQUEsa0JBQUEsSUFBQSxLQUFBLEdBQUE7O1FBRUE7UUFDQTs7T0FFQSxNQUFBLFNBQUEsS0FBQTtRQUNBLE9BQUEsTUFBQSxJQUFBLE9BQUE7OztBQ25KQTtHQUNBLE9BQUEscUJBQUEsQ0FBQSxjQUFBOztHQUVBLFFBQUEscURBQUEsU0FBQSxPQUFBLGdCQUFBLFFBQUE7SUFDQSxPQUFBO09BQ0E7T0FDQTtPQUNBLEtBQUEsU0FBQSxLQUFBO1FBQ0EsSUFBQSxhQUFBLHlEQUFBLE1BQUE7O1FBRUEsV0FBQSxRQUFBLFNBQUEsS0FBQTtVQUNBLElBQUEsS0FBQSxRQUFBO1lBQ0EsTUFBQTtZQUNBLE9BQUE7Ozs7UUFJQSxPQUFBLE1BQUEsSUFBQTs7T0FFQSxNQUFBLFNBQUEsS0FBQTtRQUNBLE9BQUEsTUFBQSxJQUFBLE9BQUE7Ozs7QUNwQkE7R0FDQSxPQUFBLG9CQUFBLENBQUE7O0dBRUEsUUFBQSxnQ0FBQSxTQUFBLFdBQUE7SUFDQSxPQUFBLFVBQUEsWUFBQSxXQUFBOzs7R0FHQSxRQUFBLDRCQUFBLFVBQUEsV0FBQTtJQUNBLE9BQUEsVUFBQSxZQUFBLFdBQUEsV0FBQSxJQUFBO01BQ0EsT0FBQTtRQUNBLFNBQUE7Ozs7O0dBS0EsUUFBQSwyQkFBQSxVQUFBLFdBQUE7SUFDQSxPQUFBLFVBQUEsWUFBQSxXQUFBLGVBQUE7TUFDQSxJQUFBO09BQ0E7TUFDQSxRQUFBO1FBQ0EsUUFBQTs7Ozs7R0FLQSxRQUFBLGlDQUFBLFVBQUEsV0FBQTtJQUNBLE9BQUEsVUFBQSxZQUFBLFdBQUEsc0JBQUE7TUFDQSxJQUFBOzs7O0dBSUEsUUFBQSw0QkFBQSxTQUFBLFdBQUE7SUFDQSxPQUFBLFVBQUEsWUFBQSxXQUFBLFlBQUEsSUFBQTtNQUNBLE9BQUE7UUFDQSxTQUFBOzs7OztHQUtBLFFBQUEsbUNBQUEsU0FBQSxXQUFBO0lBQ0EsT0FBQSxVQUFBLFlBQUEsV0FBQSx3QkFBQTtNQUNBLElBQUE7T0FDQTtNQUNBLFFBQUE7UUFDQSxRQUFBOzs7OztBQzNDQTtHQUNBLE9BQUE7O0dBRUEsV0FBQSxtSUFBQSxTQUFBLFFBQUEsV0FBQSxJQUFBLFFBQUE7SUFDQSxZQUFBLG1CQUFBLFdBQUEsYUFBQTtJQUNBLElBQUEsS0FBQTtJQUNBLElBQUEsTUFBQSxVQUFBOztJQUVBLEdBQUEsWUFBQSxTQUFBLElBQUEsY0FBQTtJQUNBLEdBQUEsVUFBQSxTQUFBLElBQUEsWUFBQTtJQUNBLEdBQUEsWUFBQSxTQUFBLElBQUEsY0FBQTtJQUNBLEdBQUEsVUFBQSxTQUFBLElBQUEsWUFBQTtJQUNBLEdBQUEsU0FBQSxJQUFBLFVBQUE7O0lBRUEsR0FBQSxTQUFBLFlBQUEsS0FBQSxVQUFBLEdBQUE7SUFDQSxHQUFBLGNBQUEsWUFBQSxLQUFBO0lBQ0EsR0FBQSxPQUFBLFlBQUEsS0FBQSxRQUFBLEdBQUE7SUFDQSxHQUFBLFlBQUEsWUFBQSxLQUFBO0lBQ0EsR0FBQSxPQUFBLFlBQUEsS0FBQSxRQUFBLEdBQUE7SUFDQSxHQUFBLFlBQUEsWUFBQSxLQUFBO0lBQ0EsR0FBQSxTQUFBLFlBQUEsS0FBQSxVQUFBLEdBQUE7SUFDQSxHQUFBLGNBQUEsWUFBQSxLQUFBOztJQUVBLEdBQUEsT0FBQSxTQUFBLElBQUEsU0FBQTtJQUNBLEdBQUEsT0FBQSxTQUFBLElBQUEsU0FBQTtJQUNBLEdBQUEsUUFBQSxZQUFBLEtBQUE7SUFDQSxHQUFBLFlBQUEsWUFBQSxLQUFBLFFBQUEsR0FBQTs7SUFFQSxHQUFBLGNBQUE7SUFDQSxHQUFBLGNBQUE7SUFDQSxHQUFBLFNBQUE7SUFDQSxHQUFBLGdCQUFBO0lBQ0EsR0FBQSxrQkFBQTtJQUNBLEdBQUEsZUFBQTtJQUNBLEdBQUEsV0FBQTs7SUFFQTs7SUFFQSxTQUFBLFFBQUE7TUFDQSxJQUFBLFNBQUE7UUFDQSxNQUFBLEdBQUE7UUFDQSxNQUFBLEdBQUE7O1FBRUEsV0FBQSxHQUFBO1FBQ0EsU0FBQSxHQUFBO1FBQ0EsV0FBQSxHQUFBO1FBQ0EsU0FBQSxHQUFBO1FBQ0EsUUFBQSxHQUFBOzs7TUFHQSxVQUFBLE9BQUE7O01BRUE7U0FDQSxNQUFBO1NBQ0E7U0FDQSxLQUFBLFNBQUEsSUFBQTtVQUNBLEdBQUEsTUFBQSxRQUFBLFNBQUEsTUFBQTtZQUNBLEtBQUEsY0FBQSxZQUFBLEtBQUEsVUFBQSxLQUFBOzs7VUFHQSxHQUFBLFFBQUEsR0FBQTtVQUNBLEdBQUEsY0FBQSxHQUFBOztVQUVBLElBQUEsTUFBQSxHQUFBLGNBQUEsR0FBQTtVQUNBLEdBQUEsYUFBQSxHQUFBLGNBQUEsR0FBQSxTQUFBLElBQUEsT0FBQSxLQUFBLE1BQUEsT0FBQTs7U0FFQSxNQUFBLFNBQUEsS0FBQTtVQUNBLE9BQUEsTUFBQSxJQUFBLEtBQUEsT0FBQTs7OztJQUlBLEdBQUEsaUJBQUEsU0FBQSxTQUFBLE9BQUE7TUFDQSxHQUFBLFFBQUE7OztJQUdBLFdBQUEsVUFBQTtJQUNBLFdBQUEsUUFBQTtJQUNBLFdBQUEsUUFBQTtJQUNBLFdBQUEsVUFBQTs7SUFFQSxTQUFBLFdBQUEsTUFBQSxPQUFBO01BQ0EsR0FBQSxPQUFBLE1BQUEsU0FBQSxNQUFBO1FBQ0EsSUFBQSxDQUFBLE1BQUE7VUFDQTs7O1FBR0EsR0FBQSxTQUFBLEtBQUE7Ozs7SUFJQSxTQUFBLFlBQUEsSUFBQTtNQUNBLE9BQUE7U0FDQSxJQUFBO1VBQ0EsSUFBQTs7U0FFQTtTQUNBLEtBQUEsU0FBQSxPQUFBO1VBQ0EsSUFBQSxNQUFBLFdBQUEsR0FBQTtZQUNBLElBQUEsUUFBQSxFQUFBLFVBQUEsR0FBQSxPQUFBLFNBQUEsTUFBQTtjQUNBLE9BQUEsS0FBQSxPQUFBLE1BQUE7OztZQUdBLFFBQUEsTUFBQTs7WUFFQSxNQUFBLGNBQUEsWUFBQSxLQUFBLFVBQUEsTUFBQTtZQUNBLE1BQUEsbUJBQUE7O1lBRUEsR0FBQSxNQUFBLE9BQUEsT0FBQSxHQUFBOztZQUVBLE9BQUEsR0FBQSxPQUFBO2NBQ0EsS0FBQTs7Ozs7OztJQU9BLFNBQUEsY0FBQSxNQUFBO01BQ0EsSUFBQSxpQkFBQSxXQUFBO1FBQ0EsT0FBQTtXQUNBLE9BQUE7WUFDQSxJQUFBLEtBQUE7YUFDQTtZQUNBLFFBQUE7O1dBRUE7OztNQUdBLE9BQUE7U0FDQSxLQUFBLFlBQUEsS0FBQTtTQUNBLEtBQUE7U0FDQSxLQUFBLFNBQUEsS0FBQTtVQUNBLE9BQUEsUUFBQSxJQUFBLE9BQUE7O1VBRUEsVUFBQSxJQUFBLGNBQUEsS0FBQTs7U0FFQSxNQUFBLFNBQUEsS0FBQTtVQUNBLE9BQUEsTUFBQSxJQUFBLE9BQUE7Ozs7O0lBS0EsU0FBQSxnQkFBQSxNQUFBO01BQ0EsSUFBQSxtQkFBQSxXQUFBO1FBQ0EsSUFBQSxzQkFBQSxPQUFBLEtBQUE7VUFDQSxhQUFBO1VBQ0EsWUFBQTtVQUNBLFVBQUE7VUFDQSxTQUFBO1lBQ0EsYUFBQSxXQUFBO2NBQ0EsT0FBQTs7Ozs7UUFLQSxvQkFBQSxPQUFBLEtBQUEsU0FBQSxRQUFBOzs7VUFHQTs7OztNQUlBO1NBQ0EsS0FBQSxZQUFBLEtBQUE7U0FDQSxLQUFBO1NBQ0EsTUFBQSxTQUFBLEtBQUE7VUFDQSxPQUFBLE1BQUEsSUFBQSxPQUFBOzs7TUFHQSxPQUFBOzs7O0lBSUEsU0FBQSxhQUFBLE1BQUE7TUFDQSxJQUFBLG1CQUFBLE9BQUEsS0FBQTtRQUNBLGFBQUE7UUFDQSxZQUFBO1FBQ0EsVUFBQTtRQUNBLFNBQUE7VUFDQSxhQUFBLFdBQUE7WUFDQSxPQUFBOzs7OztNQUtBLGlCQUFBLE9BQUEsS0FBQSxTQUFBLFFBQUE7OztRQUdBOzs7OztJQUtBLFNBQUEsU0FBQSxNQUFBO01BQ0EsSUFBQSxRQUFBLGVBQUE7UUFDQTtXQUNBLE9BQUE7WUFDQSxJQUFBLEtBQUE7O1dBRUE7V0FDQSxLQUFBLFNBQUEsS0FBQTtZQUNBLE9BQUEsUUFBQSxJQUFBLE9BQUE7O1lBRUE7O1dBRUEsTUFBQSxTQUFBLEtBQUE7WUFDQSxPQUFBLE1BQUEsSUFBQSxPQUFBOzs7Ozs7SUFNQSxTQUFBLFlBQUEsTUFBQTtNQUNBLEdBQUEsT0FBQTtNQUNBLEdBQUEsT0FBQTs7TUFFQTs7OztJQUlBLFNBQUEsWUFBQSxNQUFBO01BQ0EsR0FBQSxPQUFBOztNQUVBOzs7O0lBSUEsU0FBQSxTQUFBO01BQ0EsR0FBQSxPQUFBOztNQUVBOzs7OztHQUtBLFdBQUEsOEdBQUEsU0FBQSxRQUFBLFdBQUEsUUFBQSxZQUFBLG1CQUFBLGFBQUE7SUFDQSxJQUFBLEtBQUE7SUFDQSxJQUFBLE1BQUEsVUFBQTs7SUFFQSxHQUFBLE9BQUEsU0FBQSxJQUFBLFNBQUE7SUFDQSxHQUFBLE9BQUEsU0FBQSxJQUFBLFNBQUE7SUFDQSxHQUFBLFFBQUEsWUFBQSxLQUFBO0lBQ0EsR0FBQSxZQUFBLFlBQUEsS0FBQSxRQUFBLEdBQUE7O0lBRUEsR0FBQSxjQUFBO0lBQ0EsR0FBQSxjQUFBO0lBQ0EsR0FBQSxXQUFBOztJQUVBOztJQUVBLFNBQUEsUUFBQTtNQUNBLElBQUEsU0FBQTtRQUNBLE1BQUEsR0FBQTtRQUNBLE1BQUEsR0FBQTtRQUNBLFdBQUE7OztNQUdBLFVBQUEsT0FBQTs7TUFFQTtTQUNBLE1BQUE7U0FDQTtTQUNBLEtBQUEsU0FBQSxJQUFBO1VBQ0EsR0FBQSxNQUFBLFFBQUEsU0FBQSxNQUFBO1lBQ0EsS0FBQSxjQUFBLFlBQUEsS0FBQSxVQUFBLEtBQUE7OztVQUdBLEdBQUEsUUFBQSxHQUFBO1VBQ0EsR0FBQSxjQUFBLEdBQUE7O1VBRUEsSUFBQSxNQUFBLEdBQUEsY0FBQSxHQUFBO1VBQ0EsR0FBQSxhQUFBLEdBQUEsY0FBQSxHQUFBLFNBQUEsSUFBQSxPQUFBLEtBQUEsTUFBQSxPQUFBOztTQUVBLE1BQUEsU0FBQSxLQUFBO1VBQ0EsT0FBQSxNQUFBLElBQUEsS0FBQSxPQUFBOzs7OztJQUtBLFNBQUEsU0FBQSxNQUFBO01BQ0EsSUFBQSxRQUFBLGVBQUE7UUFDQTtXQUNBLE9BQUE7WUFDQSxJQUFBLEtBQUE7O1dBRUE7V0FDQSxLQUFBLFNBQUEsS0FBQTtZQUNBLE9BQUEsUUFBQSxJQUFBLE9BQUE7O1lBRUE7O1dBRUEsTUFBQSxTQUFBLEtBQUE7WUFDQSxPQUFBLE1BQUEsSUFBQSxPQUFBOzs7Ozs7SUFNQSxTQUFBLFlBQUEsTUFBQTtNQUNBLEdBQUEsT0FBQTtNQUNBLEdBQUEsT0FBQTs7TUFFQTs7OztJQUlBLFNBQUEsWUFBQSxNQUFBO01BQ0EsR0FBQSxPQUFBOztNQUVBOzs7Ozs7R0FNQSxXQUFBLHVHQUFBLFNBQUEsUUFBQSxnQkFBQSxRQUFBLGlCQUFBLFlBQUEsYUFBQTtJQUNBLElBQUEsS0FBQTs7SUFFQSxRQUFBLE9BQUEsSUFBQTs7SUFFQSxHQUFBLE9BQUE7SUFDQSxHQUFBLFFBQUE7O0lBRUEsR0FBQSxTQUFBO0lBQ0EsR0FBQSxXQUFBOztJQUVBLE1BQUE7O0lBRUEsU0FBQSxNQUFBLE1BQUE7TUFDQSxHQUFBLE9BQUE7O01BRUE7U0FDQSxNQUFBO1VBQ0EsTUFBQSxZQUFBO1VBQ0EsTUFBQTs7U0FFQTtTQUNBLEtBQUEsU0FBQSxLQUFBO1VBQ0EsR0FBQSxRQUFBLElBQUE7VUFDQSxHQUFBLGNBQUEsSUFBQTs7U0FFQSxNQUFBLFNBQUEsS0FBQTtVQUNBLE9BQUEsTUFBQSxJQUFBLE9BQUE7Ozs7SUFJQSxTQUFBLFNBQUEsUUFBQTtNQUNBLEdBQUEsa0JBQUE7O01BRUE7U0FDQSxLQUFBO1VBQ0EsSUFBQSxZQUFBO1dBQ0E7VUFDQSxXQUFBLE9BQUE7O1NBRUE7U0FDQSxLQUFBLFNBQUEsS0FBQTtVQUNBLE9BQUEsUUFBQSxJQUFBLE9BQUE7O1VBRUEsZUFBQSxNQUFBOztTQUVBLE1BQUEsU0FBQSxLQUFBO1VBQ0EsR0FBQSxrQkFBQTtVQUNBLE9BQUEsTUFBQSxJQUFBLE9BQUE7Ozs7SUFJQSxTQUFBLFNBQUE7TUFDQSxlQUFBOzs7OztHQUtBLFdBQUEsc0ZBQUEsU0FBQSxRQUFBLGdCQUFBLFFBQUEsV0FBQSxhQUFBO0lBQ0EsSUFBQSxLQUFBOztJQUVBLFFBQUEsT0FBQSxJQUFBOztJQUVBLEdBQUEsZUFBQTtJQUNBLEdBQUEsU0FBQTs7SUFFQSxTQUFBLGVBQUE7TUFDQSxHQUFBLHNCQUFBOztNQUVBO1NBQ0EsT0FBQTtVQUNBLElBQUEsWUFBQTtXQUNBO1VBQ0EsUUFBQSxHQUFBOztTQUVBO1NBQ0EsS0FBQSxTQUFBLEtBQUE7VUFDQSxPQUFBLFFBQUEsSUFBQSxPQUFBOztVQUVBLGVBQUE7O1NBRUEsTUFBQSxTQUFBLEtBQUE7VUFDQSxHQUFBLHNCQUFBOztVQUVBLE9BQUEsTUFBQSxJQUFBLE9BQUE7Ozs7SUFJQSxTQUFBLFNBQUE7TUFDQSxlQUFBOzs7OztBQ3JaQTtHQUNBLE9BQUE7O0dBRUEsV0FBQSw2RUFBQSxVQUFBLFFBQUEsSUFBQSxXQUFBLFVBQUEsUUFBQSxVQUFBO0lBQ0EsSUFBQSxLQUFBOztJQUVBLEdBQUEsUUFBQTs7SUFFQSxTQUFBLFFBQUE7TUFDQSxPQUFBO1NBQ0EsS0FBQTtVQUNBLFFBQUEsR0FBQTtVQUNBLFVBQUEsR0FBQTs7U0FFQTtTQUNBLEtBQUEsU0FBQSxNQUFBO1VBQ0EsT0FBQSxRQUFBLEtBQUEsT0FBQTs7VUFFQSxTQUFBLFdBQUE7WUFDQSxVQUFBLElBQUE7YUFDQTs7U0FFQSxNQUFBLFNBQUEsS0FBQTtVQUNBLE9BQUEsTUFBQSxJQUFBLE9BQUE7Ozs7QUN2QkE7R0FDQSxPQUFBLG1CQUFBLENBQUE7R0FDQSxRQUFBLDBCQUFBLFVBQUEsV0FBQTtJQUNBLE9BQUEsVUFBQSxZQUFBLFNBQUE7S0FDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyDlupTnlKjlhaXlj6Ncbi8vIE1vZHVsZTogZ3VsdVxuLy8gRGVwZW5kZW5jaWVzOlxuLy8gICAgbmdSb3V0ZSwgaHR0cEludGVyY2VwdG9ycywgZ3VsdS5taXNzaW5nXG5cbi8qIGdsb2JhbCBmYWxsYmFja0hhc2ggKi9cbmFuZ3VsYXJcbiAgLm1vZHVsZSgnZ3VsdScsIFtcbiAgICAndWkucm91dGVyJyxcbiAgICAnbmdMb2NhbGUnLFxuICAgICd0b2FzdHInLFxuICAgICd1aS5ib290c3RyYXAnLFxuICAgICdjdXN0b20uZGlyZWN0aXZlcycsXG4gICAgJ2h0dHBJbnRlcmNlcHRvcnMnLFxuICAgICdjaGllZmZhbmN5cGFudHMubG9hZGluZ0JhcicsXG4gICAgJ3V0aWwuZmlsdGVycycsXG4gICAgJ3V0aWwuZGF0ZScsXG4gICAgJ2d1bHUubG9naW4nLFxuICAgICdndWx1LmNsaWVudF9zZXJ2aWNlJyxcbiAgICAnZ3VsdS5taXNzaW5nJ1xuICBdKVxuICAuY29uZmlnKGZ1bmN0aW9uKCRsb2NhdGlvblByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIsICRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgLy8gbm90IHVzZSBodG1sNSBoaXN0b3J5IGFwaVxuICAgIC8vIGJ1dCB1c2UgaGFzaGJhbmdcbiAgICAkbG9jYXRpb25Qcm92aWRlclxuICAgICAgLmh0bWw1TW9kZShmYWxzZSlcbiAgICAgIC5oYXNoUHJlZml4KCchJyk7XG5cbiAgICAvLyBkZWZpbmUgNDA0XG4gICAgJHVybFJvdXRlclByb3ZpZGVyXG4gICAgICAub3RoZXJ3aXNlKCcvbG9naW4nKTtcblxuICAgIC8vIEFQSSBTZXJ2ZXJcbiAgICBBUElfU0VSVkVSUyA9IHtcbiAgICAgIC8vIGNzZXJ2aWNlOiAnaHR0cDovL2MuaWZkaXUuY29tJ1xuICAgICAgY3NlcnZpY2U6ICdodHRwOi8vby5kcDozMDAwJ1xuICAgIH07XG4gIH0pXG4gIC5ydW4oZnVuY3Rpb24oJHJvb3RTY29wZSwgJGxvY2F0aW9uLCAkc3RhdGUsICRzdGF0ZVBhcmFtcykge1xuICAgIHZhciByZWcgPSAvW1xcJlxcP11fPVxcZCsvO1xuXG4gICAgJHJvb3RTY29wZS4kc3RhdGUgPSAkc3RhdGU7XG4gICAgJHJvb3RTY29wZS4kc3RhdGVQYXJhbXMgPSAkc3RhdGVQYXJhbXM7XG5cbiAgICAvLyDnlKjkuo7ov5Tlm57kuIrlsYLpobXpnaJcbiAgICAkcm9vdFNjb3BlXG4gICAgICAuJHdhdGNoKGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gJGxvY2F0aW9uLnVybCgpO1xuICAgICAgfSwgZnVuY3Rpb24oY3VycmVudCwgb2xkKSB7XG4gICAgICAgIGlmIChjdXJyZW50LnJlcGxhY2UocmVnLCAnJykgPT09IG9sZC5yZXBsYWNlKHJlZywgJycpKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgJHJvb3RTY29wZS5iYWNrVXJsID0gb2xkO1xuICAgICAgfSk7XG5cbiAgICAkcm9vdFNjb3BlLmJhY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgICRsb2NhdGlvbi51cmwoJHJvb3RTY29wZS5iYWNrVXJsKTtcbiAgICB9XG4gIH0pO1xuXG4iLCJhbmd1bGFyXG4gIC5tb2R1bGUoJ2d1bHUuY2xpZW50X3NlcnZpY2UnLCBbXG4gICAgJ3VpLnJvdXRlcicsXG4gICAgJ2d1bHUuaW5kZW50J1xuICBdKVxuICAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXJcbiAgICAgIC5zdGF0ZSgnY2xpZW50X3NlcnZpY2UnLCB7XG4gICAgICAgIGFic3RyYWN0OiB0cnVlLFxuICAgICAgICB1cmw6ICcvaW5kZW50cycsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnY2xpZW50LXNlcnZpY2UvZGFzaGJvYXJkLmh0bScsXG4gICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICBJbmRlbnRFbnVtczogJ0luZGVudEVudW1zJ1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLnN0YXRlKCdjbGllbnRfc2VydmljZS5saXN0Jywge1xuICAgICAgICB1cmw6ICcnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2luZGVudC9saXN0Lmh0bScsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdJbmRlbnRMaXN0Q3RybCdcbiAgICAgIH0pXG4gICAgICAuc3RhdGUoJ2NsaWVudF9zZXJ2aWNlLmFwcHJvdmFsJywge1xuICAgICAgICB1cmw6ICcvYXBwcm92YWwnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2luZGVudC9saXN0X2FwcHJvdmFsLmh0bScsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdJbmRlbnRBcHByb3ZhbExpc3RDdHJsJ1xuICAgICAgfSlcbiAgICAgIC5zdGF0ZSgnY2xpZW50X3NlcnZpY2UuaW5kZW50Jywge1xuICAgICAgICB1cmw6ICcve2luZGVudF9pZDpbMC05XSt9JyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdpbmRlbnQvZWRpdC5odG0nLFxuICAgICAgICBjb250cm9sbGVyOiAnSW5kZW50Q3RybCdcbiAgICAgIH0pO1xuICB9KTtcbiIsImFuZ3VsYXJcbiAgLm1vZHVsZSgnZ3VsdS5pbmRlbnQnLCBbXG4gICAgJ2d1bHUuaW5kZW50LnN2Y3MnLFxuICAgICdndWx1LmluZGVudC5lbnVtcydcbiAgXSk7XG4iLCJhbmd1bGFyXG4gIC5tb2R1bGUoJ2d1bHUubG9naW4nLCBbXG4gICAgJ3VpLnJvdXRlcicsXG4gICAgJ2d1bHUubG9naW4uc3ZjcydcbiAgXSlcblxuICAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXJcbiAgICAgIC5zdGF0ZSgnbG9naW4nLCB7XG4gICAgICAgIHVybDogJy9sb2dpbicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnbG9naW4vbG9naW4uaHRtJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0xvZ2luQ3RybCdcbiAgICAgIH0pO1xuICB9KTtcbiIsIi8vIDQwNCDpobXpnaJcbi8vIE1vZHVsZTogZ3VsdS5taXNzaW5nXG4vLyBEZXBlbmRlbmNpZXM6IG5nUm91dGVcblxuYW5ndWxhclxuICAubW9kdWxlKCdndWx1Lm1pc3NpbmcnLCBbJ3VpLnJvdXRlciddKVxuXG4gIC8vIOmFjee9riByb3V0ZVxuICAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyXG4gICAgICAuc3RhdGUoJ21pc3NpbmcnLCB7XG4gICAgICAgIHVybDogJy9taXNzaW5nJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICc0MDQvNDA0Lmh0bScsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdNaXNzaW5nQ3RybCdcbiAgICAgIH0pO1xuICB9KVxuXG4gIC8vIDQwNCBjb250cm9sbGVyXG4gIC5jb250cm9sbGVyKCdNaXNzaW5nQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUpIHtcbiAgICBjb25zb2xlLmxvZygnSWBtIGhlcmUnKTtcbiAgICAvLyBUT0RPOlxuICAgIC8vIDEuIHNob3cgbGFzdCBwYXRoIGFuZCBwYWdlIG5hbWVcbiAgfSk7XG4iLCIvLyDoh6rlrprkuYkgZGlyZWN0aXZlc1xuXG5hbmd1bGFyXG4gIC5tb2R1bGUoJ2N1c3RvbS5kaXJlY3RpdmVzJywgW10pXG4gIC5kaXJlY3RpdmUoJ25nSW5kZXRlcm1pbmF0ZScsIGZ1bmN0aW9uKCRjb21waWxlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cmlidXRlcykge1xuICAgICAgICBzY29wZS4kd2F0Y2goYXR0cmlidXRlc1snbmdJbmRldGVybWluYXRlJ10sIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgZWxlbWVudC5wcm9wKCdpbmRldGVybWluYXRlJywgISF2YWx1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gIH0pO1xuIiwiYW5ndWxhclxuICAubW9kdWxlKCd1dGlsLmZpbHRlcnMnLCBbXSlcblxuICAuZmlsdGVyKCdtb2JpbGUnLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24ocykge1xuICAgICAgaWYgKHMgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgICB9XG5cbiAgICAgIHMgPSBzLnJlcGxhY2UoL1tcXHNcXC1dKy9nLCAnJyk7XG5cbiAgICAgIGlmIChzLmxlbmd0aCA8IDMpIHtcbiAgICAgICAgcmV0dXJuIHM7XG4gICAgICB9XG5cbiAgICAgIHZhciBzYSA9IHMuc3BsaXQoJycpO1xuXG4gICAgICBzYS5zcGxpY2UoMywgMCwgJy0nKTtcblxuICAgICAgaWYgKHMubGVuZ3RoID49IDcpIHtcbiAgICAgICAgc2Euc3BsaWNlKDgsIDAsICctJyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzYS5qb2luKCcnKTtcbiAgICB9O1xuICB9KTtcbiIsImFuZ3VsYXJcbiAgLm1vZHVsZSgndXRpbC5kYXRlJywgW10pXG4gIC5mYWN0b3J5KCdEYXRlVXRpbCcsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdG9TdHJpbmcgPSBmdW5jdGlvbiAoZGF0ZSwgcykge1xuICAgICAgcmV0dXJuIGRhdGUuZ2V0RnVsbFllYXIoKSArIHMgKyAoZGF0ZS5nZXRNb250aCgpICsgMSkgKyBzICsgZGF0ZS5nZXREYXRlKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHRvTG9jYWxEYXRlU3RyaW5nOiBmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgICByZXR1cm4gdG9TdHJpbmcoZGF0ZSwgJy0nKTtcbiAgICAgIH0sXG5cbiAgICAgIHRvTG9jYWxUaW1lU3RyaW5nOiBmdW5jdGlvbihkYXRlKSB7XG4gICAgICAgIHZhciBoID0gZGF0ZS5nZXRIb3VycygpO1xuICAgICAgICB2YXIgbSA9IGRhdGUuZ2V0TWludXRlcygpO1xuXG4gICAgICAgIGlmIChoIDwgMTApIHtcbiAgICAgICAgICBoID0gJzAnICsgaDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtIDwgMTApIHtcbiAgICAgICAgICBtID0gJzAnICsgbTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBbdG9TdHJpbmcoZGF0ZSwgJy0nKSwgaCArICc6JyArIG1dLmpvaW4oJyAnKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pOyIsIi8vIOaemuS4viBTZXJ2aWNlXG5hbmd1bGFyXG4gIC5tb2R1bGUoJ3V0aWwuZW51bXMnLCBbXSlcbiAgLmZhY3RvcnkoJ0VudW1zJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoRU5VTVMpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZhbDogZnVuY3Rpb24gKG5hbWUsIHRleHQpIHtcbiAgICAgICAgICByZXR1cm4gRU5VTVNbbmFtZV0uZmluZChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW0udGV4dCA9PT0gdGV4dDtcbiAgICAgICAgICB9KS52YWx1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgdGV4dDogZnVuY3Rpb24gKG5hbWUsIHZhbCkge1xuICAgICAgICAgIHJldHVybiBFTlVNU1tuYW1lXS5maW5kKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICByZXR1cm4gaXRlbS52YWx1ZSA9PT0gdmFsO1xuICAgICAgICAgIH0pLnRleHQ7XG4gICAgICAgIH0sXG4gICAgICAgIGl0ZW06IGZ1bmN0aW9uIChuYW1lLCB2YWwpIHtcbiAgICAgICAgICByZXR1cm4gRU5VTVNbbmFtZV0uZmluZChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW0udmFsdWUgPT09IHZhbDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgbGlzdDogZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgICByZXR1cm4gRU5VTVNbbmFtZV07XG4gICAgICAgIH0sXG4gICAgICAgIGl0ZW1zOiBmdW5jdGlvbiAobmFtZSwgdmFscykge1xuICAgICAgICAgIHJldHVybiBFTlVNU1tuYW1lXS5maWx0ZXIoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgIHJldHVybiB2YWxzLmluZGV4T2YoaXRlbS52YWx1ZSkgIT09IC0xO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH07XG4gIH0pOyIsImFuZ3VsYXJcbiAgLm1vZHVsZSgnaHR0cEludGVyY2VwdG9ycycsIFtdKVxuXG4gIC5jb25maWcoZnVuY3Rpb24oJGh0dHBQcm92aWRlcikge1xuICAgICRodHRwUHJvdmlkZXIuaW50ZXJjZXB0b3JzLnB1c2goJ2h0dHBJbnRlcmNlcHRvcicpO1xuICAgIFxuICAgIC8vIEFuZ3VsYXIgJGh0dHAgaXNu4oCZdCBhcHBlbmRpbmcgdGhlIGhlYWRlciBYLVJlcXVlc3RlZC1XaXRoID0gWE1MSHR0cFJlcXVlc3Qgc2luY2UgQW5ndWxhciAxLjMuMFxuICAgICRodHRwUHJvdmlkZXIuZGVmYXVsdHMuaGVhZGVycy5jb21tb25bXCJYLVJlcXVlc3RlZC1XaXRoXCJdID0gJ1hNTEh0dHBSZXF1ZXN0JztcbiAgfSlcblxuICAuZmFjdG9yeSgnaHR0cEludGVyY2VwdG9yJywgZnVuY3Rpb24oJHEsICRyb290U2NvcGUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgLy8g6K+35rGC5YmN5L+u5pS5IHJlcXVlc3Qg6YWN572uXG4gICAgICAncmVxdWVzdCc6IGZ1bmN0aW9uKGNvbmZpZykge1xuICAgICAgICAvLyDoi6Xor7fmsYLnmoTmmK/mqKHmnb/vvIzmiJblt7LliqDkuIrml7bpl7TmiLPnmoQgdXJsIOWcsOWdgO+8jOWImeS4jemcgOimgeWKoOaXtumXtOaIs1xuICAgICAgICBpZiAoY29uZmlnLnVybC5pbmRleE9mKCcuaHRtJykgIT09IC0xIHx8IGNvbmZpZy51cmwuaW5kZXhPZignP189JykgIT09IC0xKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbmZpZztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbmZpZy51cmwgPSBjb25maWcudXJsICsgJz9fPScgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuICAgICAgICByZXR1cm4gY29uZmlnO1xuICAgICAgfSxcblxuICAgICAgLy8g6K+35rGC5Ye66ZSZ77yM5Lqk57uZIGVycm9yIGNhbGxiYWNrIOWkhOeQhlxuICAgICAgJ3JlcXVlc3RFcnJvcic6IGZ1bmN0aW9uKHJlamVjdGlvbikge1xuICAgICAgICByZXR1cm4gJHEucmVqZWN0KHJlamVjdGlvbik7XG4gICAgICB9LFxuXG4gICAgICAvLyDlk43lupTmlbDmja7mjInnuqblrprlpITnkIZcbiAgICAgIC8vIHtcbiAgICAgIC8vICAgY29kZTogMjAwLCAvLyDoh6rlrprkuYnnirbmgIHnoIHvvIwyMDAg5oiQ5Yqf77yM6Z2eIDIwMCDlnYfkuI3miJDlip9cbiAgICAgIC8vICAgbXNnOiAn5pON5L2c5o+Q56S6JywgLy8g5LiN6IO95ZKMIGRhdGEg5YWx5a2YXG4gICAgICAvLyAgIGRhdGE6IHt9IC8vIOeUqOaIt+aVsOaNrlxuICAgICAgLy8gfVxuICAgICAgJ3Jlc3BvbnNlJzogZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgLy8g5pyN5Yqh56uv6L+U5Zue55qE5pyJ5pWI55So5oi35pWw5o2uXG4gICAgICAgIHZhciBkYXRhLCBjb2RlO1xuXG4gICAgICAgIGlmIChhbmd1bGFyLmlzT2JqZWN0KHJlc3BvbnNlLmRhdGEpKSB7XG4gICAgICAgICAgY29kZSA9IHJlc3BvbnNlLmRhdGEuY29kZTtcbiAgICAgICAgICBkYXRhID0gcmVzcG9uc2UuZGF0YS5kYXRhO1xuXG4gICAgICAgICAgLy8g6IulIHN0YXR1cyAyMDAsIOS4lCBjb2RlICEyMDDvvIzliJnov5Tlm57nmoTmmK/mk43kvZzplJnor6/mj5DnpLrkv6Hmga9cbiAgICAgICAgICAvLyDpgqPkuYjvvIxjYWxsYmFjayDkvJrmjqXmlLbliLDkuIvpnaLlvaLlvI/nmoTlj4LmlbDvvJpcbiAgICAgICAgICAvLyB7IGNvZGU6IDIwMDAxLCBtc2c6ICfmk43kvZzlpLHotKUnIH1cbiAgICAgICAgICBpZiAoY29kZSAhPT0gMjAwKSB7XG4gICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHJlc3BvbnNlKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDoi6XmnI3liqHnq6/ov5Tlm57nmoQgZGF0YSAhbnVsbO+8jOWImei/lOWbnueahOaYr+acieaViOWcsOeUqOaIt+aVsOaNrlxuICAgICAgICAgIC8vIOmCo+S5iO+8jGNhbGxiYWNrIOS8muaOpeaUtuWIsOS4i+mdouW9ouW8j+WPguaVsO+8mlxuICAgICAgICAgIC8vIHsgaXRlbXM6IFsuLi5dLCB0b3RhbF9jb3VudDogMTAwIH1cbiAgICAgICAgICBpZiAoZGF0YSAhPSBudWxsKSB7XG4gICAgICAgICAgICByZXNwb25zZS5kYXRhID0gZGF0YTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyDoi6XmnI3liqHnq6/ov5Tlm57nmoQgZGF0YSDlgLzkuLogbnVsbO+8jOWImei/lOWbnueahOaYr+aPkOekuuS/oeaBr1xuICAgICAgICAgIC8vIOmCo+S5iCBjYWxsYmFjayDkvJrmjqXmlLbliLDkuIvpnaLlvaLlvI/nmoTlj4LmlbDvvJpcbiAgICAgICAgICAvLyB7IGNvZGU6IDIwMCwgbXNnOiAn5pON5L2c5oiQ5YqfJyB9XG4gICAgICAgICAgLy8g6buY6K6k5Li65q2kXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICB9LFxuXG4gICAgICAvLyDlk43lupTlh7rplJnvvIzkuqTnu5kgZXJyb3IgY2FsbGJhY2sg5aSE55CGXG4gICAgICAncmVzcG9uc2VFcnJvcic6IGZ1bmN0aW9uKHJlamVjdGlvbikge1xuICAgICAgICByZXR1cm4gJHEucmVqZWN0KHJlamVjdGlvbik7XG4gICAgICB9XG4gICAgfTtcbiAgfSk7IiwiJ3VzZSBzdHJpY3QnO1xuYW5ndWxhci5tb2R1bGUoXCJuZ0xvY2FsZVwiLCBbXSwgW1wiJHByb3ZpZGVcIiwgZnVuY3Rpb24oJHByb3ZpZGUpIHtcbiAgdmFyIFBMVVJBTF9DQVRFR09SWSA9IHtcbiAgICBaRVJPOiBcInplcm9cIixcbiAgICBPTkU6IFwib25lXCIsXG4gICAgVFdPOiBcInR3b1wiLFxuICAgIEZFVzogXCJmZXdcIixcbiAgICBNQU5ZOiBcIm1hbnlcIixcbiAgICBPVEhFUjogXCJvdGhlclwiXG4gIH07XG4gICRwcm92aWRlLnZhbHVlKFwiJGxvY2FsZVwiLCB7XG4gICAgXCJEQVRFVElNRV9GT1JNQVRTXCI6IHtcbiAgICAgIFwiQU1QTVNcIjogW1xuICAgICAgICBcIlxcdTRlMGFcXHU1MzQ4XCIsXG4gICAgICAgIFwiXFx1NGUwYlxcdTUzNDhcIlxuICAgICAgXSxcbiAgICAgIFwiREFZXCI6IFtcbiAgICAgICAgXCJcXHU2NjFmXFx1NjcxZlxcdTY1ZTVcIixcbiAgICAgICAgXCJcXHU2NjFmXFx1NjcxZlxcdTRlMDBcIixcbiAgICAgICAgXCJcXHU2NjFmXFx1NjcxZlxcdTRlOGNcIixcbiAgICAgICAgXCJcXHU2NjFmXFx1NjcxZlxcdTRlMDlcIixcbiAgICAgICAgXCJcXHU2NjFmXFx1NjcxZlxcdTU2ZGJcIixcbiAgICAgICAgXCJcXHU2NjFmXFx1NjcxZlxcdTRlOTRcIixcbiAgICAgICAgXCJcXHU2NjFmXFx1NjcxZlxcdTUxNmRcIlxuICAgICAgXSxcbiAgICAgIFwiTU9OVEhcIjogW1xuICAgICAgICBcIjFcXHU2NzA4XCIsXG4gICAgICAgIFwiMlxcdTY3MDhcIixcbiAgICAgICAgXCIzXFx1NjcwOFwiLFxuICAgICAgICBcIjRcXHU2NzA4XCIsXG4gICAgICAgIFwiNVxcdTY3MDhcIixcbiAgICAgICAgXCI2XFx1NjcwOFwiLFxuICAgICAgICBcIjdcXHU2NzA4XCIsXG4gICAgICAgIFwiOFxcdTY3MDhcIixcbiAgICAgICAgXCI5XFx1NjcwOFwiLFxuICAgICAgICBcIjEwXFx1NjcwOFwiLFxuICAgICAgICBcIjExXFx1NjcwOFwiLFxuICAgICAgICBcIjEyXFx1NjcwOFwiXG4gICAgICBdLFxuICAgICAgXCJTSE9SVERBWVwiOiBbXG4gICAgICAgIFwiXFx1NTQ2OFxcdTY1ZTVcIixcbiAgICAgICAgXCJcXHU1NDY4XFx1NGUwMFwiLFxuICAgICAgICBcIlxcdTU0NjhcXHU0ZThjXCIsXG4gICAgICAgIFwiXFx1NTQ2OFxcdTRlMDlcIixcbiAgICAgICAgXCJcXHU1NDY4XFx1NTZkYlwiLFxuICAgICAgICBcIlxcdTU0NjhcXHU0ZTk0XCIsXG4gICAgICAgIFwiXFx1NTQ2OFxcdTUxNmRcIlxuICAgICAgXSxcbiAgICAgIFwiU0hPUlRNT05USFwiOiBbXG4gICAgICAgIFwiMVxcdTY3MDhcIixcbiAgICAgICAgXCIyXFx1NjcwOFwiLFxuICAgICAgICBcIjNcXHU2NzA4XCIsXG4gICAgICAgIFwiNFxcdTY3MDhcIixcbiAgICAgICAgXCI1XFx1NjcwOFwiLFxuICAgICAgICBcIjZcXHU2NzA4XCIsXG4gICAgICAgIFwiN1xcdTY3MDhcIixcbiAgICAgICAgXCI4XFx1NjcwOFwiLFxuICAgICAgICBcIjlcXHU2NzA4XCIsXG4gICAgICAgIFwiMTBcXHU2NzA4XCIsXG4gICAgICAgIFwiMTFcXHU2NzA4XCIsXG4gICAgICAgIFwiMTJcXHU2NzA4XCJcbiAgICAgIF0sXG4gICAgICBcImZ1bGxEYXRlXCI6IFwieVxcdTVlNzRNXFx1NjcwOGRcXHU2NWU1RUVFRVwiLFxuICAgICAgXCJsb25nRGF0ZVwiOiBcInlcXHU1ZTc0TVxcdTY3MDhkXFx1NjVlNVwiLFxuICAgICAgXCJtZWRpdW1cIjogXCJ5eXl5LU0tZCBhaDptbTpzc1wiLFxuICAgICAgXCJtZWRpdW1EYXRlXCI6IFwieXl5eS1NLWRcIixcbiAgICAgIFwibWVkaXVtVGltZVwiOiBcImFoOm1tOnNzXCIsXG4gICAgICBcInNob3J0XCI6IFwieXktTS1kIGFoOm1tXCIsXG4gICAgICBcInNob3J0RGF0ZVwiOiBcInl5LU0tZFwiLFxuICAgICAgXCJzaG9ydFRpbWVcIjogXCJhaDptbVwiXG4gICAgfSxcbiAgICBcIk5VTUJFUl9GT1JNQVRTXCI6IHtcbiAgICAgIFwiQ1VSUkVOQ1lfU1lNXCI6IFwiXFx1MDBhNVwiLFxuICAgICAgXCJERUNJTUFMX1NFUFwiOiBcIi5cIixcbiAgICAgIFwiR1JPVVBfU0VQXCI6IFwiLFwiLFxuICAgICAgXCJQQVRURVJOU1wiOiBbe1xuICAgICAgICBcImdTaXplXCI6IDMsXG4gICAgICAgIFwibGdTaXplXCI6IDMsXG4gICAgICAgIFwibWFjRnJhY1wiOiAwLFxuICAgICAgICBcIm1heEZyYWNcIjogMyxcbiAgICAgICAgXCJtaW5GcmFjXCI6IDAsXG4gICAgICAgIFwibWluSW50XCI6IDEsXG4gICAgICAgIFwibmVnUHJlXCI6IFwiLVwiLFxuICAgICAgICBcIm5lZ1N1ZlwiOiBcIlwiLFxuICAgICAgICBcInBvc1ByZVwiOiBcIlwiLFxuICAgICAgICBcInBvc1N1ZlwiOiBcIlwiXG4gICAgICB9LCB7XG4gICAgICAgIFwiZ1NpemVcIjogMyxcbiAgICAgICAgXCJsZ1NpemVcIjogMyxcbiAgICAgICAgXCJtYWNGcmFjXCI6IDAsXG4gICAgICAgIFwibWF4RnJhY1wiOiAyLFxuICAgICAgICBcIm1pbkZyYWNcIjogMixcbiAgICAgICAgXCJtaW5JbnRcIjogMSxcbiAgICAgICAgXCJuZWdQcmVcIjogXCIoXFx1MDBhNFwiLFxuICAgICAgICBcIm5lZ1N1ZlwiOiBcIilcIixcbiAgICAgICAgXCJwb3NQcmVcIjogXCJcXHUwMGE0XCIsXG4gICAgICAgIFwicG9zU3VmXCI6IFwiXCJcbiAgICAgIH1dXG4gICAgfSxcbiAgICBcImlkXCI6IFwiemgtY25cIixcbiAgICBcInBsdXJhbENhdFwiOiBmdW5jdGlvbihuKSB7XG4gICAgICByZXR1cm4gUExVUkFMX0NBVEVHT1JZLk9USEVSO1xuICAgIH1cbiAgfSk7XG59XSk7XG4iLCJhbmd1bGFyXG4gIC5tb2R1bGUoJ2d1bHUuaW5kZW50JylcbiAgXG4gIC5jb250cm9sbGVyKCdJbmRlbnRDdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgJHJvb3RTY29wZSwgJGxvY2F0aW9uLCAkdGltZW91dCwgJGZpbHRlciwgdG9hc3RyLCBEYXRlVXRpbCwgSW5kZW50c1N2YywgSW5kZW50U3ZjLCBJbmRlbnRFbnVtcykge1xuICAgIHZhciB2bSA9ICRzY29wZTtcblxuICAgIHZhciBpbmRlbnRfaWQgPSB2bS4kc3RhdGVQYXJhbXMuaW5kZW50X2lkO1xuXG4gICAgdm0udHlwZV9saXN0ID0gSW5kZW50RW51bXMubGlzdCgndHlwZScpO1xuICAgIHZtLmNoYW5uZWxfbGlzdCA9IEluZGVudEVudW1zLmxpc3QoJ2NoYW5uZWwnKTtcbiAgICAvLyB2bS5icmFuZF9saXN0ID0gSW5kZW50RW51bXMubGlzdCgnYnJhbmQnKTtcbiAgICAvLyB2bS5zZXJpZXNfbGlzdCA9IEluZGVudEVudW1zLmxpc3QoJ3NlcmllcycpO1xuXG4gICAgdm0uc3VibWl0ID0gc3VibWl0O1xuICAgIHZtLmNhbmNlbCA9IGNhbmNlbDtcbiAgICB2bS5jYW5jZWxfY29uZmlybSA9IGNhbmNlbF9jb25maXJtO1xuICAgIHZtLm9wZW5fZGF0ZXBpY2tlciA9IG9wZW5fZGF0ZXBpY2tlcjtcblxuICAgIGZ1bmN0aW9uIHN1Ym1pdCgpIHtcbiAgICAgIHJldHVybiBJbmRlbnRTdmNcbiAgICAgICAgLnVwZGF0ZSh7XG4gICAgICAgICAgaWQ6IHZtLmlkXG4gICAgICAgIH0sIHtcbiAgICAgICAgICB0eXBlOiB2bS50eXBlLnZhbHVlLFxuICAgICAgICAgIHJlc2VydmVyOiB2bS5yZXNlcnZlcixcbiAgICAgICAgICBtb2JpbGU6IHZtLm1vYmlsZS5yZXBsYWNlKC9bXFxzXFwtXSsvZywgJycpLFxuICAgICAgICAgIHRlc3RfdGltZTogdm0udGVzdF90aW1lLFxuICAgICAgICAgIGFkZHJlc3M6IHZtLmFkZHJlc3MsXG4gICAgICAgICAgbWVtbzogdm0ubWVtbyxcbiAgICAgICAgICBjaGFubmVsOiB2bS5jaGFubmVsLnZhbHVlLFxuICAgICAgICAgIHN0YXR1czogMlxuICAgICAgICB9KVxuICAgICAgICAuJHByb21pc2VcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgdG9hc3RyLnN1Y2Nlc3MocmVzLm1zZyB8fCAn6aKE57qm5Y2V56Gu6K6k5bm255Sf5pWI5oiQ5YqfJyk7XG5cbiAgICAgICAgICAkdGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICRyb290U2NvcGUuYmFjaygpO1xuICAgICAgICAgIH0sIDIwMDApO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgdG9hc3RyLmVycm9yKHJlcy5tc2cgfHwgJ+mihOe6puWNleehruiupOW5tueUn+aViOWksei0pe+8jOivt+mHjeivlScpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvcGVuX2RhdGVwaWNrZXIoJGV2ZW50KSB7XG4gICAgICAkZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgdm0udGVzdF90aW1lX29wZW4gPSB0cnVlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNhbmNlbCgpIHtcbiAgICAgIEluZGVudFN2Y1xuICAgICAgICAucmVtb3ZlKHtcbiAgICAgICAgICBpZDogdm0uaWRcbiAgICAgICAgfSlcbiAgICAgICAgLiRwcm9taXNlXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIHRvYXN0ci5zdWNjZXNzKHJlcy5tc2cgfHwgJ+WPlua2iOmihOe6puWNleaIkOWKnycpO1xuXG4gICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLmJhY2soKTtcbiAgICAgICAgICB9LCAyMDAwKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIHRvYXN0ci5lcnJvcihyZXMubXNnIHx8ICflj5bmtojpooTnuqbljZXlpLHotKXvvIzor7fph43or5UnKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2FuY2VsX2NvbmZpcm0oKSB7XG4gICAgICBJbmRlbnRTdmNcbiAgICAgICAgLnVwZGF0ZSh7XG4gICAgICAgICAgaWQ6IHZtLmlkXG4gICAgICAgIH0sIHtcbiAgICAgICAgICBzdGF0dXM6IDFcbiAgICAgICAgfSlcbiAgICAgICAgLiRwcm9taXNlXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIHRvYXN0ci5zdWNjZXNzKHJlcy5tc2cgfHwgJ+W3suWPlua2iOehruiupOiuouWNlScpO1xuXG4gICAgICAgICAgJHJvb3RTY29wZS5iYWNrKCk7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICB0b2FzdHIuZXJyb3IocmVzLm1zZyB8fCAn5Y+W5raI56Gu6K6k6K6i5Y2V77yM6K+36YeN6K+VJyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNlbGVjdF9pdGVtKGxpc3RfbmFtZSwgdmFsdWUpIHtcbiAgICAgIHZtW2xpc3RfbmFtZV0gPSBJbmRlbnRFbnVtcy5pdGVtKGxpc3RfbmFtZSwgdmFsdWUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHdhdGNoX3Rlc3RfdGltZV9wYXJ0KCkge1xuICAgICAgdm0uJHdhdGNoKCd0ZXN0X3RpbWVfYmVmb3JlJywgZnVuY3Rpb24odGVzdF90aW1lX2JlZm9yZSkge1xuICAgICAgICBpZiAodGVzdF90aW1lX2JlZm9yZSAmJiAhdm0uZWRpdF9mb3JtLnRlc3RfdGltZV9iZWZvcmUuJHByaXN0aW5lKSB7XG4gICAgICAgICAgdm0udGVzdF90aW1lX2FmdGVyID0gbmV3IERhdGUodGVzdF90aW1lX2JlZm9yZSk7ICBcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHZtLiR3YXRjaCgndGVzdF90aW1lX2FmdGVyJywgZnVuY3Rpb24odGVzdF90aW1lX2FmdGVyKSB7XG4gICAgICAgIGlmICh0ZXN0X3RpbWVfYWZ0ZXIgJiYgIXZtLmVkaXRfZm9ybS50ZXN0X3RpbWVfYWZ0ZXIuJHByaXN0aW5lKSB7XG4gICAgICAgICAgdm0udGVzdF90aW1lID0gRGF0ZVV0aWwudG9Mb2NhbFRpbWVTdHJpbmcodGVzdF90aW1lX2FmdGVyKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2V0X3NlbGVjdGVkX2l0ZW0oKSB7XG4gICAgICBzZWxlY3RfaXRlbSgndHlwZScsIHZtLnR5cGUpO1xuICAgICAgc2VsZWN0X2l0ZW0oJ2NoYW5uZWwnLCB2bS5jaGFubmVsKTtcbiAgICAgIC8vIHNlbGVjdF9pdGVtKCdicmFuZCcsIHZtLmNhci5icmFuZCk7XG4gICAgICAvLyBzZWxlY3RfaXRlbSgnc2VyaWVzJywgdm0uY2FyLnNlcmllcyk7XG4gICAgfVxuXG4gICAgLy8g5paw5bu66aKE57qm5Y2VXG4gICAgaWYgKGluZGVudF9pZCA9PSAwKSB7XG4gICAgICByZXR1cm4gSW5kZW50c1N2Y1xuICAgICAgICAuc2F2ZSgpXG4gICAgICAgIC4kcHJvbWlzZVxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICBhbmd1bGFyLmV4dGVuZCh2bSwgcmVzLnRvSlNPTigpKTtcblxuICAgICAgICAgIHNldF9zZWxlY3RlZF9pdGVtKCk7XG4gICAgICAgICAgd2F0Y2hfdGVzdF90aW1lX3BhcnQoKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIHRvYXN0ci5lcnJvcihyZXMubXNnIHx8ICfmlrDlu7rpooTnuqbljZXlpLHotKXvvIzor7fliLfmlrDph43or5UnKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8g6Iul5pu05paw6aKE57qm5Y2V77yM5YiZ6I635Y+W6aKE57qm5Y2V5L+h5oGvXG4gICAgSW5kZW50U3ZjXG4gICAgICAuZ2V0KHtcbiAgICAgICAgaWQ6IGluZGVudF9pZFxuICAgICAgfSlcbiAgICAgIC4kcHJvbWlzZVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgIGFuZ3VsYXIuZXh0ZW5kKHZtLCByZXMudG9KU09OKCkpO1xuXG4gICAgICAgIHZhciB0ZXN0X3RpbWVfc3AgPSB2bS50ZXN0X3RpbWUuc3BsaXQoJyAnKTtcblxuICAgICAgICB2bS50ZXN0X3RpbWVfYmVmb3JlID0gdGVzdF90aW1lX3NwWzBdO1xuICAgICAgICB2bS50ZXN0X3RpbWVfYWZ0ZXIgPSBuZXcgRGF0ZSh2bS50ZXN0X3RpbWUpO1xuXG4gICAgICAgIHNldF9zZWxlY3RlZF9pdGVtKCk7XG4gICAgICAgIHdhdGNoX3Rlc3RfdGltZV9wYXJ0KCk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICB0b2FzdHIuZXJyb3IocmVzLm1zZyB8fCAn6I635Y+W6K6i5Y2V5L+h5oGv5aSx6LSl77yM6K+35Yi35paw6YeN6K+VJyk7XG4gICAgICB9KTtcbiAgfSk7IiwiYW5ndWxhclxuICAubW9kdWxlKCdndWx1LmluZGVudC5lbnVtcycsIFsndXRpbC5lbnVtcycsICdndWx1LmluZGVudC5zdmNzJ10pXG5cbiAgLmZhY3RvcnkoJ0luZGVudEVudW1zJywgZnVuY3Rpb24oRW51bXMsIEluZGVudEVudW1zU3ZjLCB0b2FzdHIpIHtcbiAgICByZXR1cm4gSW5kZW50RW51bXNTdmNcbiAgICAgIC5nZXQoKVxuICAgICAgLiRwcm9taXNlXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgdmFyIGFsbF9wcmVpbnMgPSAndHlwZSBjaGFubmVsIGJyYW5kIHNlcmllcyBzdGF0dXMgY2l0eSB0ZXN0ZXIgcm9sZSBmcm9tJy5zcGxpdCgnICcpO1xuXG4gICAgICAgIGFsbF9wcmVpbnMuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgICByZXNba2V5XS51bnNoaWZ0KHtcbiAgICAgICAgICAgIHRleHQ6ICflhajpg6gnLFxuICAgICAgICAgICAgdmFsdWU6IG51bGxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIEVudW1zKHJlcy50b0pTT04oKSk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICB0b2FzdHIuZXJyb3IocmVzLm1zZyB8fCAn6I635Y+W5p6a5Li+5aSx6LSlJyk7XG4gICAgICB9KTtcbiAgfSk7XG4iLCJhbmd1bGFyXG4gIC5tb2R1bGUoJ2d1bHUuaW5kZW50LnN2Y3MnLCBbJ25nUmVzb3VyY2UnXSlcblxuICAuc2VydmljZSgnSW5kZW50RW51bXNTdmMnLCBmdW5jdGlvbigkcmVzb3VyY2UpIHtcbiAgICByZXR1cm4gJHJlc291cmNlKEFQSV9TRVJWRVJTLmNzZXJ2aWNlICsgJy9lbnVtcycpO1xuICB9KVxuICBcbiAgLnNlcnZpY2UoJ0luZGVudHNTdmMnLCBmdW5jdGlvbiAoJHJlc291cmNlKSB7XG4gICAgcmV0dXJuICRyZXNvdXJjZShBUElfU0VSVkVSUy5jc2VydmljZSArICcvb3JkZXJzJywge30sIHtcbiAgICAgIHF1ZXJ5OiB7XG4gICAgICAgIGlzQXJyYXk6IGZhbHNlXG4gICAgICB9XG4gICAgfSk7XG4gIH0pXG5cbiAgLnNlcnZpY2UoJ0luZGVudFN2YycsIGZ1bmN0aW9uICgkcmVzb3VyY2UpIHtcbiAgICByZXR1cm4gJHJlc291cmNlKEFQSV9TRVJWRVJTLmNzZXJ2aWNlICsgJy9vcmRlcnMvOmlkJywge1xuICAgICAgaWQ6ICdAaWQnXG4gICAgfSwge1xuICAgICAgdXBkYXRlOiB7XG4gICAgICAgIG1ldGhvZDogJ1BVVCdcbiAgICAgIH1cbiAgICB9KTtcbiAgfSlcblxuICAuc2VydmljZSgnSW5kZW50VGVzdGVyU3ZjJywgZnVuY3Rpb24gKCRyZXNvdXJjZSkge1xuICAgIHJldHVybiAkcmVzb3VyY2UoQVBJX1NFUlZFUlMuY3NlcnZpY2UgKyAnL29yZGVycy86aWQvdGVzdGVyJywge1xuICAgICAgaWQ6ICdAaWQnXG4gICAgfSk7XG4gIH0pXG5cbiAgLnNlcnZpY2UoJ1Rlc3RlcnNTdmMnLCBmdW5jdGlvbigkcmVzb3VyY2UpIHtcbiAgICByZXR1cm4gJHJlc291cmNlKEFQSV9TRVJWRVJTLmNzZXJ2aWNlICsgJy90ZXN0ZXJzJywge30sIHtcbiAgICAgIHF1ZXJ5OiB7XG4gICAgICAgIGlzQXJyYXk6IGZhbHNlXG4gICAgICB9XG4gICAgfSk7XG4gIH0pXG5cbiAgLnNlcnZpY2UoJ0luZGVudEFwcHJvdmFsU3ZjJywgZnVuY3Rpb24oJHJlc291cmNlKSB7XG4gICAgcmV0dXJuICRyZXNvdXJjZShBUElfU0VSVkVSUy5jc2VydmljZSArICcvb3JkZXJzLzppZC9hcHByb3ZhbCcsIHtcbiAgICAgIGlkOiAnQGlkJ1xuICAgIH0sIHtcbiAgICAgIHVwZGF0ZToge1xuICAgICAgICBtZXRob2Q6ICdQVVQnXG4gICAgICB9XG4gICAgfSk7XG4gIH0pOyIsIi8qIGdsb2JhbCBhbmd1bGFyICovXG5hbmd1bGFyXG4gIC5tb2R1bGUoJ2d1bHUuaW5kZW50JylcbiAgXG4gIC5jb250cm9sbGVyKCdJbmRlbnRMaXN0Q3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJGxvY2F0aW9uLCAkcSwgdG9hc3RyLCAkbW9kYWwsXG4gICAgSW5kZW50c1N2YywgSW5kZW50QXBwcm92YWxTdmMsIEluZGVudFN2YywgSW5kZW50RW51bXMpIHtcbiAgICB2YXIgdm0gPSAkc2NvcGU7XG4gICAgdmFyIHFzbyA9ICRsb2NhdGlvbi5zZWFyY2goKTtcblxuICAgIHZtLnN0YXR1c19pZCA9IHBhcnNlSW50KHFzby5zdGF0dXNfaWQpIHx8IG51bGw7XG4gICAgdm0uY2l0eV9pZCA9IHBhcnNlSW50KHFzby5jaXR5X2lkKSB8fCBudWxsO1xuICAgIHZtLnRlc3Rlcl9pZCA9IHBhcnNlSW50KHFzby50ZXN0ZXJfaWQpIHx8IG51bGw7XG4gICAgdm0ucm9sZV9pZCA9IHBhcnNlSW50KHFzby5yb2xlX2lkKSB8fCBudWxsO1xuICAgIHZtLm1vYmlsZSA9IHFzby5tb2JpbGUgfHwgbnVsbDtcblxuICAgIHZtLnN0YXR1cyA9IEluZGVudEVudW1zLml0ZW0oJ3N0YXR1cycsIHZtLnN0YXR1c19pZCk7XG4gICAgdm0uc3RhdHVzX2xpc3QgPSBJbmRlbnRFbnVtcy5saXN0KCdzdGF0dXMnKTtcbiAgICB2bS5jaXR5ID0gSW5kZW50RW51bXMuaXRlbSgnY2l0eScsIHZtLmNpdHlfaWQpO1xuICAgIHZtLmNpdHlfbGlzdCA9IEluZGVudEVudW1zLmxpc3QoJ2NpdHknKTtcbiAgICB2bS5yb2xlID0gSW5kZW50RW51bXMuaXRlbSgncm9sZScsIHZtLnJvbGVfaWQpO1xuICAgIHZtLnJvbGVfbGlzdCA9IEluZGVudEVudW1zLmxpc3QoJ3JvbGUnKTtcbiAgICB2bS50ZXN0ZXIgPSBJbmRlbnRFbnVtcy5pdGVtKCd0ZXN0ZXInLCB2bS50ZXN0ZXJfaWQpO1xuICAgIHZtLnRlc3Rlcl9saXN0ID0gSW5kZW50RW51bXMubGlzdCgndGVzdGVyJyk7XG5cbiAgICB2bS5wYWdlID0gcGFyc2VJbnQocXNvLnBhZ2UpIHx8IDE7XG4gICAgdm0uc2l6ZSA9IHBhcnNlSW50KHFzby5zaXplKSB8fCAyMDtcbiAgICB2bS5zaXplcyA9IEluZGVudEVudW1zLmxpc3QoJ3NpemUnKTtcbiAgICB2bS5zaXplX2l0ZW0gPSBJbmRlbnRFbnVtcy5pdGVtKCdzaXplJywgdm0uc2l6ZSk7XG5cbiAgICB2bS5zaXplX2NoYW5nZSA9IHNpemVfY2hhbmdlO1xuICAgIHZtLnBhZ2VfY2hhbmdlID0gcGFnZV9jaGFuZ2U7XG4gICAgdm0uc2VhcmNoID0gc2VhcmNoO1xuICAgIHZtLmNvbmZpcm1fb3JkZXIgPSBjb25maXJtX29yZGVyO1xuICAgIHZtLmRpc3BhdGNoX3Rlc3RlciA9IGRpc3BhdGNoX3Rlc3RlcjtcbiAgICB2bS5jYW5jZWxfb3JkZXIgPSBjYW5jZWxfb3JkZXI7XG4gICAgdm0uYXBwcm92YWwgPSBhcHByb3ZhbDtcblxuICAgIHF1ZXJ5KCk7XG5cbiAgICBmdW5jdGlvbiBxdWVyeSgpIHtcbiAgICAgIHZhciBwYXJhbXMgPSB7XG4gICAgICAgIHNpemU6IHZtLnNpemUsXG4gICAgICAgIHBhZ2U6IHZtLnBhZ2UsXG5cbiAgICAgICAgc3RhdHVzX2lkOiB2bS5zdGF0dXNfaWQsXG4gICAgICAgIGNpdHlfaWQ6IHZtLmNpdHlfaWQsXG4gICAgICAgIHRlc3Rlcl9pZDogdm0udGVzdGVyX2lkLFxuICAgICAgICByb2xlX2lkOiB2bS5yb2xlX2lkLFxuICAgICAgICBtb2JpbGU6IHZtLm1vYmlsZVxuICAgICAgfTtcbiAgICAgIFxuICAgICAgJGxvY2F0aW9uLnNlYXJjaChwYXJhbXMpO1xuXG4gICAgICBJbmRlbnRzU3ZjXG4gICAgICAgIC5xdWVyeShwYXJhbXMpXG4gICAgICAgIC4kcHJvbWlzZVxuICAgICAgICAudGhlbihmdW5jdGlvbihycykge1xuICAgICAgICAgIHJzLml0ZW1zLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgaXRlbS5zdGF0dXNfdGV4dCA9IEluZGVudEVudW1zLnRleHQoJ3N0YXR1cycsIGl0ZW0uc3RhdHVzKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHZtLml0ZW1zID0gcnMuaXRlbXM7XG4gICAgICAgICAgdm0udG90YWxfY291bnQgPSBycy50b3RhbF9jb3VudDtcblxuICAgICAgICAgIHZhciB0bXAgPSBycy50b3RhbF9jb3VudCAvIHZtLnNpemU7XG4gICAgICAgICAgdm0ucGFnZV9jb3VudCA9IHJzLnRvdGFsX2NvdW50ICUgdm0uc2l6ZSA9PT0gMCA/IHRtcCA6IChNYXRoLmZsb29yKHRtcCkgKyAxKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIHRvYXN0ci5lcnJvcihyZXMuZGF0YS5tc2cgfHwgJ+afpeivouWksei0pe+8jOacjeWKoeWZqOWPkeeUn+acquefpemUmeivr++8jOivt+mHjeivlScpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB2bS4kd2F0Y2hDb2xsZWN0aW9uKCdpdGVtcycsIGZ1bmN0aW9uKGl0ZW1zKSB7XG4gICAgICB2bS5pdGVtcyA9IGl0ZW1zO1xuICAgIH0pO1xuXG4gICAgd2F0Y2hfbGlzdCgnc3RhdHVzJywgJ3N0YXR1c19pZCcpO1xuICAgIHdhdGNoX2xpc3QoJ2NpdHknLCAnY2l0eV9pZCcpO1xuICAgIHdhdGNoX2xpc3QoJ3JvbGUnLCAncm9sZV9pZCcpO1xuICAgIHdhdGNoX2xpc3QoJ3Rlc3RlcicsICd0ZXN0ZXJfaWQnKTtcblxuICAgIGZ1bmN0aW9uIHdhdGNoX2xpc3QobmFtZSwgZmllbGQpIHtcbiAgICAgIHZtLiR3YXRjaChuYW1lLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIGlmICghaXRlbSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZtW2ZpZWxkXSA9IGl0ZW0udmFsdWU7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBmZXRjaF9vcmRlcihpZCkge1xuICAgICAgcmV0dXJuIEluZGVudFN2Y1xuICAgICAgICAuZ2V0KHtcbiAgICAgICAgICBpZDogaWRcbiAgICAgICAgfSlcbiAgICAgICAgLiRwcm9taXNlXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKG9yZGVyKSB7XG4gICAgICAgICAgaWYgKG9yZGVyLnN0YXR1cyAhPT0gMSkge1xuICAgICAgICAgICAgdmFyIGluZGV4ID0gXy5maW5kSW5kZXgodm0uaXRlbXMsIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGl0ZW0uaWQgPT09IG9yZGVyLmlkO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIG9yZGVyID0gb3JkZXIudG9KU09OKCk7XG5cbiAgICAgICAgICAgIG9yZGVyLnN0YXR1c190ZXh0ID0gSW5kZW50RW51bXMudGV4dCgnc3RhdHVzJywgb3JkZXIuc3RhdHVzKTtcbiAgICAgICAgICAgIG9yZGVyLmNvbmZpcm1fYnlfb3RoZXIgPSB0cnVlO1xuXG4gICAgICAgICAgICB2bS5pdGVtcy5zcGxpY2UoaW5kZXgsIDEsIG9yZGVyKTtcblxuICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCh7XG4gICAgICAgICAgICAgIG1zZzogJ+ivpeiuouWNleW3suiiq+WFtuS7luWuouacjeehruiupCdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8g56Gu6K6k6K6i5Y2VXG4gICAgZnVuY3Rpb24gY29uZmlybV9vcmRlcihpdGVtKSB7XG4gICAgICB2YXIgX2NvbmZpcm1fb3JkZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIEluZGVudFN2Y1xuICAgICAgICAgIC51cGRhdGUoe1xuICAgICAgICAgICAgaWQ6IGl0ZW0uaWRcbiAgICAgICAgICB9LCB7XG4gICAgICAgICAgICBzdGF0dXM6IDEwMDFcbiAgICAgICAgICB9KVxuICAgICAgICAgIC4kcHJvbWlzZTtcbiAgICAgIH07XG5cbiAgICAgIHJldHVybiAkcVxuICAgICAgICAud2hlbihmZXRjaF9vcmRlcihpdGVtLmlkKSlcbiAgICAgICAgLnRoZW4oX2NvbmZpcm1fb3JkZXIpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIHRvYXN0ci5zdWNjZXNzKHJlcy5tc2cgfHwgJ+W3suehruiupOivpeiuouWNlScpO1xuXG4gICAgICAgICAgJGxvY2F0aW9uLnVybCgnL2luZGVudHMvJyArIGl0ZW0uaWQpO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgdG9hc3RyLmVycm9yKHJlcy5tc2cgfHwgJ+ehruiupOivpeiuouWNleWksei0pScpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyDliIbphY3mo4DmtYvluIhcbiAgICBmdW5jdGlvbiBkaXNwYXRjaF90ZXN0ZXIoaXRlbSkge1xuICAgICAgdmFyIF9kaXNwYXRjaF90ZXN0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGRpc3BhdGNoX3Rlc3Rlcl9pbnMgPSAkbW9kYWwub3Blbih7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICdpbmRlbnQvZGlzcGF0Y2hfdGVzdGVyLmh0bScsXG4gICAgICAgICAgY29udHJvbGxlcjogJ0Rpc3BhdGNoQ3RybCcsXG4gICAgICAgICAgYmFja2Ryb3A6ICdzdGF0aWMnLFxuICAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgIGluZGVudF9pbmZvOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBkaXNwYXRjaF90ZXN0ZXJfaW5zLnJlc3VsdC50aGVuKGZ1bmN0aW9uKHRlc3Rlcikge1xuICAgICAgICAgIC8vIFRPRE86XG4gICAgICAgICAgLy8g5pu05paw6aKE57qm5Y2V54q25oCBXG4gICAgICAgICAgcXVlcnkoKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBcbiAgICAgICRxXG4gICAgICAgIC53aGVuKGZldGNoX29yZGVyKGl0ZW0uaWQpKVxuICAgICAgICAudGhlbihfZGlzcGF0Y2hfdGVzdGVyKVxuICAgICAgICAuY2F0Y2goZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgdG9hc3RyLmVycm9yKHJlcy5tc2cgfHwgJ+WIhumFjeajgOa1i+W4iOWksei0pScpO1xuICAgICAgICB9KTtcblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIOWPlua2iOiuouWNlVxuICAgIGZ1bmN0aW9uIGNhbmNlbF9vcmRlcihpdGVtKSB7XG4gICAgICB2YXIgY2FuY2VsX29yZGVyX2lucyA9ICRtb2RhbC5vcGVuKHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdpbmRlbnQvY2FuY2VsX29yZGVyLmh0bScsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdDYW5jZWxPcmRlckN0cmwnLFxuICAgICAgICBiYWNrZHJvcDogJ3N0YXRpYycsXG4gICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICBpbmRlbnRfaW5mbzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBjYW5jZWxfb3JkZXJfaW5zLnJlc3VsdC50aGVuKGZ1bmN0aW9uKHRlc3Rlcikge1xuICAgICAgICAvLyBUT0RPOlxuICAgICAgICAvLyDmm7TmlrDpooTnuqbljZXnirbmgIFcbiAgICAgICAgcXVlcnkoKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIOWuoeaguOWPlua2iFxuICAgIGZ1bmN0aW9uIGFwcHJvdmFsKGl0ZW0pIHtcbiAgICAgIGlmIChjb25maXJtKCfnoa7orqTlkIzmhI/lj5bmtojor6XorqLljZXvvJ8nKSkge1xuICAgICAgICBJbmRlbnRBcHByb3ZhbFN2Y1xuICAgICAgICAgIC51cGRhdGUoe1xuICAgICAgICAgICAgaWQ6IGl0ZW0uaWRcbiAgICAgICAgICB9KVxuICAgICAgICAgIC4kcHJvbWlzZVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgdG9hc3RyLnN1Y2Nlc3MocmVzLm1zZyB8fCAn5ZCM5oSP5Y+W5raI6K+l6K6i5Y2V77yM5pON5L2c5oiQ5YqfJyk7XG5cbiAgICAgICAgICAgIHF1ZXJ5KCk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICB0b2FzdHIuZXJyb3IocmVzLm1zZyB8fCAn5o+Q5Lqk5aSx6LSl77yM6K+36YeN6K+VJyk7XG4gICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8g5q+P6aG15p2h5pWw5pS55Y+YXG4gICAgZnVuY3Rpb24gc2l6ZV9jaGFuZ2Uoc2l6ZSkge1xuICAgICAgdm0uc2l6ZSA9IHNpemU7XG4gICAgICB2bS5wYWdlID0gMTtcblxuICAgICAgcXVlcnkoKTtcbiAgICB9XG5cbiAgICAvLyDnv7vpobVcbiAgICBmdW5jdGlvbiBwYWdlX2NoYW5nZShwYWdlKSB7XG4gICAgICB2bS5wYWdlID0gcGFnZTtcblxuICAgICAgcXVlcnkoKTtcbiAgICB9XG5cbiAgICAvLyDmn6Xor6Lmj5DkuqRcbiAgICBmdW5jdGlvbiBzZWFyY2goKSB7XG4gICAgICB2bS5wYWdlID0gMTtcblxuICAgICAgcXVlcnkoKTtcbiAgICB9XG4gIH0pXG4gIFxuICAvLyDlvoXlrqHmibnliJfooahcbiAgLmNvbnRyb2xsZXIoJ0luZGVudEFwcHJvdmFsTGlzdEN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRsb2NhdGlvbiwgdG9hc3RyLCBJbmRlbnRzU3ZjLCBJbmRlbnRBcHByb3ZhbFN2YywgSW5kZW50RW51bXMpIHtcbiAgICB2YXIgdm0gPSAkc2NvcGU7XG4gICAgdmFyIHFzbyA9ICRsb2NhdGlvbi5zZWFyY2goKTtcbiAgICBcbiAgICB2bS5wYWdlID0gcGFyc2VJbnQocXNvLnBhZ2UpIHx8IDE7XG4gICAgdm0uc2l6ZSA9IHBhcnNlSW50KHFzby5zaXplKSB8fCAyMDtcbiAgICB2bS5zaXplcyA9IEluZGVudEVudW1zLmxpc3QoJ3NpemUnKTtcbiAgICB2bS5zaXplX2l0ZW0gPSBJbmRlbnRFbnVtcy5pdGVtKCdzaXplJywgdm0uc2l6ZSk7XG5cbiAgICB2bS5zaXplX2NoYW5nZSA9IHNpemVfY2hhbmdlO1xuICAgIHZtLnBhZ2VfY2hhbmdlID0gcGFnZV9jaGFuZ2U7XG4gICAgdm0uYXBwcm92YWwgPSBhcHByb3ZhbDtcblxuICAgIHF1ZXJ5KCk7XG5cbiAgICBmdW5jdGlvbiBxdWVyeSgpIHtcbiAgICAgIHZhciBwYXJhbXMgPSB7XG4gICAgICAgIHNpemU6IHZtLnNpemUsXG4gICAgICAgIHBhZ2U6IHZtLnBhZ2UsXG4gICAgICAgIHN0YXR1c19pZDogM1xuICAgICAgfTtcbiAgICAgIFxuICAgICAgJGxvY2F0aW9uLnNlYXJjaChwYXJhbXMpO1xuXG4gICAgICBJbmRlbnRzU3ZjXG4gICAgICAgIC5xdWVyeShwYXJhbXMpXG4gICAgICAgIC4kcHJvbWlzZVxuICAgICAgICAudGhlbihmdW5jdGlvbihycykge1xuICAgICAgICAgIHJzLml0ZW1zLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgaXRlbS5zdGF0dXNfdGV4dCA9IEluZGVudEVudW1zLnRleHQoJ3N0YXR1cycsIGl0ZW0uc3RhdHVzKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHZtLml0ZW1zID0gcnMuaXRlbXM7XG4gICAgICAgICAgdm0udG90YWxfY291bnQgPSBycy50b3RhbF9jb3VudDtcblxuICAgICAgICAgIHZhciB0bXAgPSBycy50b3RhbF9jb3VudCAvIHZtLnNpemU7XG4gICAgICAgICAgdm0ucGFnZV9jb3VudCA9IHJzLnRvdGFsX2NvdW50ICUgdm0uc2l6ZSA9PT0gMCA/IHRtcCA6IChNYXRoLmZsb29yKHRtcCkgKyAxKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIHRvYXN0ci5lcnJvcihyZXMuZGF0YS5tc2cgfHwgJ+afpeivouWksei0pe+8jOacjeWKoeWZqOWPkeeUn+acquefpemUmeivr++8jOivt+mHjeivlScpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyDlrqHmoLjlj5bmtohcbiAgICBmdW5jdGlvbiBhcHByb3ZhbChpdGVtKSB7XG4gICAgICBpZiAoY29uZmlybSgn56Gu6K6k5ZCM5oSP5Y+W5raI6K+l6K6i5Y2V77yfJykpIHtcbiAgICAgICAgSW5kZW50QXBwcm92YWxTdmNcbiAgICAgICAgICAudXBkYXRlKHtcbiAgICAgICAgICAgIGlkOiBpdGVtLmlkXG4gICAgICAgICAgfSlcbiAgICAgICAgICAuJHByb21pc2VcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgIHRvYXN0ci5zdWNjZXNzKHJlcy5tc2cgfHwgJ+WQjOaEj+WPlua2iOivpeiuouWNle+8jOaTjeS9nOaIkOWKnycpO1xuXG4gICAgICAgICAgICBxdWVyeSgpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgdG9hc3RyLmVycm9yKHJlcy5tc2cgfHwgJ+aPkOS6pOWksei0pe+8jOivt+mHjeivlScpO1xuICAgICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIOavj+mhteadoeaVsOaUueWPmFxuICAgIGZ1bmN0aW9uIHNpemVfY2hhbmdlKHNpemUpIHtcbiAgICAgIHZtLnNpemUgPSBzaXplO1xuICAgICAgdm0ucGFnZSA9IDE7XG5cbiAgICAgIHF1ZXJ5KCk7XG4gICAgfVxuXG4gICAgLy8g57+76aG1XG4gICAgZnVuY3Rpb24gcGFnZV9jaGFuZ2UocGFnZSkge1xuICAgICAgdm0ucGFnZSA9IHBhZ2U7XG5cbiAgICAgIHF1ZXJ5KCk7XG4gICAgfVxuXG4gIH0pXG5cbiAgLy8g5YiG6YWN5qOA5rWL5biIXG4gIC5jb250cm9sbGVyKCdEaXNwYXRjaEN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRtb2RhbEluc3RhbmNlLCB0b2FzdHIsIEluZGVudFRlc3RlclN2YywgVGVzdGVyc1N2YywgaW5kZW50X2luZm8pIHtcbiAgICB2YXIgdm0gPSAkc2NvcGU7XG5cbiAgICBhbmd1bGFyLmV4dGVuZCh2bSwgaW5kZW50X2luZm8pO1xuXG4gICAgdm0ucGFnZSA9IDE7XG4gICAgdm0ucXVlcnkgPSBxdWVyeTtcblxuICAgIHZtLmNhbmNlbCA9IGNhbmNlbDtcbiAgICB2bS5kaXNwYXRjaCA9IGRpc3BhdGNoO1xuXG4gICAgcXVlcnkoMSk7XG5cbiAgICBmdW5jdGlvbiBxdWVyeShwYWdlKSB7XG4gICAgICB2bS5wYWdlID0gcGFnZTtcblxuICAgICAgVGVzdGVyc1N2Y1xuICAgICAgICAucXVlcnkoe1xuICAgICAgICAgIHRpbWU6IGluZGVudF9pbmZvLnRlc3RfdGltZSxcbiAgICAgICAgICBwYWdlOiBwYWdlXG4gICAgICAgIH0pXG4gICAgICAgIC4kcHJvbWlzZVxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICB2bS5pdGVtcyA9IHJlcy5pdGVtcztcbiAgICAgICAgICB2bS50b3RhbF9jb3VudCA9IHJlcy50b3RhbF9jb3VudDtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIHRvYXN0ci5lcnJvcihyZXMubXNnIHx8ICfojrflj5bnqbrmoaPmnJ/mo4DmtYvluIjlpLHotKXvvIzor7fph43or5UnKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZGlzcGF0Y2godGVzdGVyKSB7XG4gICAgICB2bS5kaXNwYXRjaF9zdGF0dXMgPSB0cnVlO1xuXG4gICAgICBJbmRlbnRUZXN0ZXJTdmNcbiAgICAgICAgLnNhdmUoe1xuICAgICAgICAgIGlkOiBpbmRlbnRfaW5mby5pZFxuICAgICAgICB9LCB7XG4gICAgICAgICAgdGVzdGVyX2lkOiB0ZXN0ZXIuaWRcbiAgICAgICAgfSlcbiAgICAgICAgLiRwcm9taXNlXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIHRvYXN0ci5zdWNjZXNzKHJlcy5tc2cgfHwgJ+WIhumFjeajgOa1i+W4iOaIkOWKnycpO1xuXG4gICAgICAgICAgJG1vZGFsSW5zdGFuY2UuY2xvc2UodGVzdGVyKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIHZtLmRpc3BhdGNoX3N0YXR1cyA9IGZhbHNlO1xuICAgICAgICAgIHRvYXN0ci5lcnJvcihyZXMubXNnIHx8ICfliIbphY3mo4DmtYvluIjlpLHotKXvvIzor7fph43or5UnKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2FuY2VsKCkge1xuICAgICAgJG1vZGFsSW5zdGFuY2UuZGlzbWlzcygpO1xuICAgIH1cbiAgfSlcbiAgXG4gIC8vIOWPlua2iOiuouWNlVxuICAuY29udHJvbGxlcignQ2FuY2VsT3JkZXJDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkbW9kYWxJbnN0YW5jZSwgdG9hc3RyLCBJbmRlbnRTdmMsIGluZGVudF9pbmZvKSB7XG4gICAgdmFyIHZtID0gJHNjb3BlO1xuXG4gICAgYW5ndWxhci5leHRlbmQodm0sIGluZGVudF9pbmZvKTtcblxuICAgIHZtLmNhbmNlbF9vcmRlciA9IGNhbmNlbF9vcmRlcjtcbiAgICB2bS5jYW5jZWwgPSBjYW5jZWw7XG5cbiAgICBmdW5jdGlvbiBjYW5jZWxfb3JkZXIoKSB7XG4gICAgICB2bS5jYW5jZWxfb3JkZXJfc3RhdHVzID0gdHJ1ZTtcblxuICAgICAgSW5kZW50U3ZjXG4gICAgICAgIC5yZW1vdmUoe1xuICAgICAgICAgIGlkOiBpbmRlbnRfaW5mby5pZFxuICAgICAgICB9LCB7XG4gICAgICAgICAgcmVhc29uOiB2bS5yZWFzb25cbiAgICAgICAgfSlcbiAgICAgICAgLiRwcm9taXNlXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIHRvYXN0ci5zdWNjZXNzKHJlcy5tc2cgfHwgJ+iuouWNleWPlua2iOaIkOWKnycpO1xuXG4gICAgICAgICAgJG1vZGFsSW5zdGFuY2UuY2xvc2UoKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIHZtLmNhbmNlbF9vcmRlcl9zdGF0dXMgPSBmYWxzZTtcblxuICAgICAgICAgIHRvYXN0ci5lcnJvcihyZXMubXNnIHx8ICforqLljZXlj5bmtojlpLHotKXvvIzor7fph43or5UnKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2FuY2VsKCkge1xuICAgICAgJG1vZGFsSW5zdGFuY2UuZGlzbWlzcygpO1xuICAgIH1cbiAgfSk7XG5cbiIsImFuZ3VsYXJcbiAgLm1vZHVsZSgnZ3VsdS5sb2dpbicpXG4gIFxuICAuY29udHJvbGxlcignTG9naW5DdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgJHEsICRsb2NhdGlvbiwgJHRpbWVvdXQsIHRvYXN0ciwgTG9naW5TdmMpIHtcbiAgICB2YXIgdm0gPSAkc2NvcGU7XG5cbiAgICB2bS5sb2dpbiA9IGxvZ2luO1xuXG4gICAgZnVuY3Rpb24gbG9naW4oKSB7XG4gICAgICByZXR1cm4gTG9naW5TdmNcbiAgICAgICAgLnNhdmUoe1xuICAgICAgICAgIGpvYl9ubzogdm0uam9iX25vLFxuICAgICAgICAgIHBhc3N3b3JkOiB2bS5wYXNzd29yZFxuICAgICAgICB9KVxuICAgICAgICAuJHByb21pc2VcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIHRvYXN0ci5zdWNjZXNzKGRhdGEubXNnIHx8ICfnmbvlvZXmiJDlip/vvIzmraPlnKjkuLrkvaDot7PovawuLi4nKTtcblxuICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJGxvY2F0aW9uLnVybCgnL2luZGVudHMnKTtcbiAgICAgICAgICB9LCAyMDAwKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIHRvYXN0ci5lcnJvcihyZXMubXNnIHx8ICfnmbvlvZXlpLHotKXvvIzor7fph43or5UnKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICB9KTsiLCJhbmd1bGFyXG4gIC5tb2R1bGUoJ2d1bHUubG9naW4uc3ZjcycsIFsnbmdSZXNvdXJjZSddKVxuICAuc2VydmljZSgnTG9naW5TdmMnLCBmdW5jdGlvbiAoJHJlc291cmNlKSB7XG4gICAgcmV0dXJuICRyZXNvdXJjZShBUElfU0VSVkVSUy50ZXN0ZXIgKyAnL3VzZXIvbG9naW4nKTtcbiAgfSkiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=