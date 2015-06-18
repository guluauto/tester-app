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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImxvZ2luL2xvZ2luX21vZHVsZS5qcyIsImluZGVudC9pbmRlbnRfbW9kdWxlLmpzIiwicmVwb3J0L3JlcG9ydF9tb2R1bGUuanMiLCI0MDQvNDA0X2N0cmwuanMiLCJsb2dpbi9sb2dpbl9jdHJsLmpzIiwibG9naW4vbG9naW5fc3Zjcy5qcyIsImluZGVudC9lbnVtcy5qcyIsImluZGVudC9pbmRlbnRfc3Zjcy5qcyIsImluZGVudC9saXN0X2N0cmwuanMiLCJjb21wb25lbnQvY3VzdG9tLWRpcmVjdGl2ZS5qcyIsImNvbXBvbmVudC9jdXN0b20tZmlsdGVyLmpzIiwiY29tcG9uZW50L2RhdGUuanMiLCJjb21wb25lbnQvZW51bXMuanMiLCJjb21wb25lbnQvZmlsZXIuanMiLCJjb21wb25lbnQvaHR0cC5qcyIsImNvbXBvbmVudC9rZXltZ3IuanMiLCJjb21wb25lbnQvb2F1dGguanMiLCJjb21wb25lbnQvdXBsb2FkZXIuanMiLCJjb21wb25lbnQvdm0uanMiLCJjb21wb25lbnQvemgtY24uanMiLCJyZXBvcnQvaW5wdXRfcmVwb3J0LmpzIiwicmVwb3J0L3JlcG9ydF9jdHJsLmpzIiwicmVwb3J0L3JlcG9ydF9zdmNzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7QUFNQTtHQUNBLE9BQUEsUUFBQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7O0dBRUEsa0dBQUEsU0FBQSxtQkFBQSxvQkFBQSxjQUFBLDZCQUFBOzs7SUFHQTtPQUNBLFVBQUE7T0FDQSxXQUFBOzs7SUFHQTtPQUNBLFVBQUE7OztJQUdBLGFBQUEsYUFBQTs7O0lBR0E7T0FDQSxVQUFBO09BQ0EsVUFBQSxNQUFBOzs7SUFHQSxjQUFBO01BQ0EsUUFBQTs7Ozs7SUFLQSxRQUFBLFFBQUEsVUFBQSxHQUFBLGVBQUEsV0FBQTtNQUNBLFFBQUEs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U0FBQSxJQUFBLFNBQUE7SUFDQSxHQUFBLE9BQUEsU0FBQSxJQUFBLFNBQUE7SUFDQSxHQUFBLFFBQUEsWUFBQSxLQUFBO0lBQ0EsR0FBQSxZQUFBLFlBQUEsS0FBQSxRQUFBLEdBQUE7O0lBRUEsR0FBQSxjQUFBO0lBQ0EsR0FBQSxjQUFBO0lBQ0EsR0FBQSxlQUFBO0lBQ0EsR0FBQSxnQkFBQTtJQUNBLEdBQUEsYUFBQTs7SUFFQTs7SUFFQSxTQUFBLFFBQUE7TUFDQSxJQUFBLFNBQUE7UUFDQSxTQUFBLEdBQUE7UUFDQSxZQUFBLEdBQUE7UUFDQSxNQUFBLEdBQUE7O1FBRUEsV0FBQSxHQUFBOzs7TUFHQSxJQUFBLEdBQUEsT0FBQSxTQUFBLGlCQUFBO1FBQ0EsUUFBQSxPQUFBLFFBQUE7VUFDQSxTQUFBLEdBQUE7VUFDQSxjQUFBLEdBQUE7O1VBRUEsa0JBQUEsR0FBQTs7OztNQUlBLFVBQUEsT0FBQTs7TUFFQTtTQUNBLE1BQUE7U0FDQTtTQUNBLEtBQUEsU0FBQSxJQUFBO1VBQ0EsR0FBQSxNQUFBLFFBQUEsU0FBQSxNQUFBO1lBQ0EsS0FBQSxjQUFBLFlBQUEsS0FBQSxnQkFBQSxLQUFBO1lBQ0EsS0FBQSxxQkFBQSxZQUFBLEtBQUEsaUJBQUEsS0FBQTs7O1VBR0EsR0FBQSxRQUFBLEdBQUE7VUFDQSxHQUFBLGNBQUEsR0FBQTs7VUFFQSxJQUFBLE1BQUEsR0FBQSxjQUFBLEdBQUE7VUFDQSxHQUFBLGFBQUEsR0FBQSxjQUFBLEdBQUEsU0FBQSxJQUFBLE9BQUEsS0FBQSxNQUFBLE9BQUE7O1NBRUEsTUFBQSxTQUFBLEtBQUE7VUFDQSxPQUFBLE1BQUEsSUFBQSxLQUFBLE9BQUE7Ozs7SUFJQSxTQUFBLFdBQUEsTUFBQSxPQUFBO01BQ0EsR0FBQSxPQUFBLE1BQUEsU0FBQSxNQUFBO1FBQ0EsSUFBQSxDQUFBLE1BQUE7VUFDQTs7O1FBR0EsR0FBQSxTQUFBLEtBQUE7Ozs7O0lBS0EsU0FBQSxjQUFBLE1BQUE7TUFDQSxJQUFBLFFBQUEsYUFBQTtRQUNBO1dBQ0EsT0FBQTtZQUNBLElBQUEsS0FBQTs7V0FFQTtXQUNBLEtBQUEsU0FBQSxLQUFBO1lBQ0EsT0FBQSxRQUFBLElBQUEsT0FBQTs7WUFFQTs7V0FFQSxNQUFBLFNBQUEsS0FBQTtZQUNBLE9BQUEsTUFBQSxJQUFBLE9BQUE7Ozs7OztJQU1BLFNBQUEsYUFBQSxNQUFBO01BQ0EsSUFBQSxtQkFBQSxPQUFBLEtBQUE7UUFDQSxhQUFBO1FBQ0EsWUFBQTtRQUNBLFVBQUE7UUFDQSxTQUFBO1VBQ0EsYUFBQSxXQUFBO1lBQ0EsT0FBQTs7Ozs7TUFLQSxpQkFBQSxPQUFBLEtBQUEsV0FBQTs7O1FBR0E7Ozs7O0lBS0EsU0FBQSxhQUFBO01BQ0EsVUFBQSxJQUFBOzs7O0lBSUEsU0FBQSxZQUFBLE1BQUE7TUFDQSxHQUFBLE9BQUE7TUFDQSxHQUFBLE9BQUE7O01BRUE7Ozs7SUFJQSxTQUFBLFlBQUEsTUFBQTtNQUNBLEdBQUEsT0FBQTs7TUFFQTs7OztJQUlBLFNBQUEsU0FBQTtNQUNBLEdBQUEsT0FBQTs7TUFFQTs7Ozs7R0FLQSxXQUFBLDRPQUFBLFNBQUEsUUFBQSxNQUFBLFdBQUEsUUFBQSxnQkFBQTtJQUNBLE9BQUEsVUFBQSxRQUFBLHFCQUFBLG9CQUFBLGFBQUE7SUFDQSxjQUFBLFdBQUE7SUFDQSxJQUFBLEtBQUE7SUFDQSxJQUFBLFFBQUEsS0FBQSxNQUFBLGVBQUEsSUFBQTs7SUFFQSxJQUFBLFNBQUEsTUFBQSxRQUFBO01BQ0EsR0FBQSxnQkFBQSxNQUFBLEdBQUE7OztJQUdBLEdBQUEsZUFBQTtJQUNBLEdBQUEsVUFBQTtJQUNBLEdBQUEsV0FBQTtJQUNBLEdBQUEsZ0JBQUE7SUFDQSxHQUFBLGNBQUE7SUFDQSxHQUFBLFVBQUE7O0lBRUE7O0lBRUEsU0FBQSxRQUFBO01BQ0EsT0FBQTtTQUNBO1NBQ0E7U0FDQSxLQUFBLFNBQUEsS0FBQTtVQUNBLElBQUEsUUFBQSxTQUFBLE9BQUE7WUFDQSxNQUFBLHFCQUFBLFlBQUEsS0FBQSxpQkFBQSxNQUFBOztZQUVBLE1BQUEsS0FBQSxRQUFBLFNBQUEsS0FBQTtjQUNBLElBQUEsb0JBQUEsT0FBQSxPQUFBLE1BQUEsSUFBQSxJQUFBO2NBQ0EsSUFBQSxnQkFBQSxvQkFBQSxJQUFBOzs7O1VBSUEsR0FBQSxRQUFBOztTQUVBLE1BQUEsU0FBQSxLQUFBO1VBQ0EsT0FBQSxNQUFBLElBQUEsT0FBQTs7Ozs7SUFLQSxTQUFBLFNBQUEsSUFBQSxLQUFBO01BQ0EsSUFBQSxlQUFBLE9BQUEsS0FBQTtRQUNBLGFBQUE7UUFDQSxZQUFBO1FBQ0EsVUFBQTtRQUNBLFNBQUE7VUFDQSxhQUFBLFdBQUE7WUFDQSxPQUFBOztVQUVBLGFBQUEsV0FBQTtZQUNBLE9BQUE7Y0FDQSxJQUFBO2NBQ0EsS0FBQTs7Ozs7O01BTUEsYUFBQSxPQUFBLEtBQUEsV0FBQTtRQUNBOzs7OztJQUtBLFNBQUEsUUFBQSxVQUFBLEtBQUE7TUFDQSxJQUFBLFFBQUEsV0FBQSxDQUFBLElBQUEsT0FBQSxJQUFBLFFBQUEsSUFBQSxPQUFBLEtBQUEsT0FBQSxNQUFBO1FBQ0EsT0FBQTtXQUNBLE9BQUE7WUFDQSxVQUFBO1lBQ0EsUUFBQSxJQUFBOztXQUVBO1dBQ0EsS0FBQSxTQUFBLEtBQUE7WUFDQSxPQUFBLE1BQUEsVUFBQSxJQUFBOztZQUVBLE9BQUEsUUFBQSxJQUFBLE9BQUE7O1lBRUE7O1dBRUEsTUFBQSxTQUFBLEtBQUE7WUFDQSxPQUFBLE1BQUEsSUFBQSxPQUFBOzs7Ozs7SUFNQSxTQUFBLFlBQUEsVUFBQSxLQUFBO01BQ0EsT0FBQSxNQUFBLFVBQUEsSUFBQTtNQUNBLE9BQUEsUUFBQTs7OztJQUlBLFNBQUEsYUFBQSxNQUFBO01BQ0EsSUFBQSxtQkFBQSxPQUFBLEtBQUE7UUFDQSxhQUFBO1FBQ0EsWUFBQTtRQUNBLFVBQUE7UUFDQSxTQUFBO1VBQ0EsYUFBQSxXQUFBO1lBQ0EsT0FBQTs7Ozs7TUFLQSxpQkFBQSxPQUFBLEtBQUEsV0FBQTs7UUFFQSxLQUFBLEtBQUEsUUFBQSxTQUFBLEtBQUE7VUFDQSxPQUFBLE1BQUEsS0FBQSxJQUFBLElBQUE7OztRQUdBOzs7OztJQUtBLFNBQUEsUUFBQSxVQUFBLFFBQUE7TUFDQSxPQUFBO1NBQ0EsT0FBQTtVQUNBLFVBQUE7O1NBRUE7U0FDQSxLQUFBLFNBQUEsS0FBQTtVQUNBLE9BQUEsUUFBQSxJQUFBLE9BQUE7O1VBRUEsVUFBQSxJQUFBLGNBQUEsV0FBQSxVQUFBLFNBQUEsYUFBQSxHQUFBOztTQUVBLE1BQUEsU0FBQSxLQUFBO1VBQ0EsT0FBQSxNQUFBLElBQUEsT0FBQTs7Ozs7SUFLQSxTQUFBLGNBQUEsT0FBQSxLQUFBO01BQ0EsSUFBQSxXQUFBLE1BQUE7TUFDQSxJQUFBLFNBQUEsSUFBQTs7TUFFQSxJQUFBLGFBQUEsT0FBQSxPQUFBLFVBQUE7TUFDQSxJQUFBLG9CQUFBLE9BQUEsT0FBQTtNQUNBLElBQUEsY0FBQSxvQkFBQSxJQUFBOztNQUVBLEtBQUEsS0FBQSxhQUFBO01BQ0EsS0FBQSxLQUFBLGFBQUEsS0FBQSxVQUFBOztNQUVBLElBQUEsQ0FBQSxhQUFBO1FBQ0EsS0FBQSxLQUFBO1FBQ0E7OztNQUdBLElBQUEsY0FBQSxnQkFBQTtNQUNBLElBQUEsY0FBQSxZQUFBOztNQUVBLElBQUEsY0FBQTs7TUFFQSxPQUFBLEtBQUEsYUFBQSxRQUFBLFNBQUEsS0FBQTtRQUNBLFFBQUEsT0FBQSxhQUFBLFlBQUE7OztNQUdBLEtBQUEsS0FBQSxjQUFBLEtBQUEsVUFBQTs7TUFFQSxJQUFBLGVBQUE7TUFDQSxPQUFBLEtBQUEsYUFBQSxRQUFBLFNBQUEsS0FBQTtRQUNBLElBQUEsWUFBQSxLQUFBLE9BQUE7VUFDQSxhQUFBLE9BQUEsUUFBQSxPQUFBO1lBQ0EsS0FBQSxZQUFBLEtBQUE7YUFDQSxZQUFBOzs7O01BSUEsSUFBQSxTQUFBLEVBQUEsT0FBQTs7O01BR0EsSUFBQSxDQUFBLE9BQUEsUUFBQTtRQUNBOztRQUVBOzs7TUFHQSxLQUFBLEtBQUEsYUFBQSxLQUFBLFVBQUE7TUFDQSxLQUFBLEtBQUE7TUFDQSxTQUFBLE1BQUE7UUFDQSxLQUFBO1FBQ0EsYUFBQTtRQUNBLE1BQUE7UUFDQSxLQUFBO1FBQ0EsWUFBQTtRQUNBLE9BQUE7OztNQUdBLFNBQUEsV0FBQSxVQUFBOztRQUVBLEtBQUEsS0FBQSxXQUFBLFNBQUE7UUFDQSxJQUFBLGNBQUEsZ0JBQUEsU0FBQSxTQUFBLFVBQUE7UUFDQSxHQUFBOzs7TUFHQSxTQUFBLFdBQUEsT0FBQSxNQUFBOztRQUVBLE1BQUEsVUFBQSxLQUFBO1FBQ0EsS0FBQSxLQUFBLGFBQUEsS0FBQSxVQUFBOzs7TUFHQSxTQUFBLGFBQUEsT0FBQTtRQUNBLEtBQUEsS0FBQSxhQUFBLEtBQUEsVUFBQTs7O01BR0EsU0FBQSxjQUFBOzs7O1FBSUEsS0FBQSxLQUFBOzs7UUFHQSxPQUFBLFFBQUEsU0FBQSxPQUFBO1VBQ0EsWUFBQSxNQUFBLE1BQUE7OztRQUdBLEtBQUEsS0FBQTs7O1FBR0Esb0JBQUEsSUFBQSxtQkFBQTs7O1FBR0E7Ozs7Ozs7TUFPQSxTQUFBLGdCQUFBO1FBQ0EsS0FBQSxLQUFBOztRQUVBLE9BQUE7V0FDQSxLQUFBO1lBQ0EsVUFBQTtZQUNBLFFBQUE7YUFDQTtXQUNBO1dBQ0EsS0FBQSxXQUFBO1lBQ0EsS0FBQSxLQUFBOzs7WUFHQSxJQUFBLE9BQUEsUUFBQTtjQUNBLE9BQUEsUUFBQSxTQUFBLE9BQUE7Z0JBQ0EsTUFBQSxPQUFBLE1BQUE7Ozs7O1lBS0EsT0FBQSxNQUFBLFVBQUE7OztZQUdBLElBQUEsY0FBQSxnQkFBQTtZQUNBLElBQUEsY0FBQSxXQUFBOzs7O1dBSUEsTUFBQSxTQUFBLEtBQUE7WUFDQSxLQUFBLEtBQUEsZUFBQSxLQUFBLFVBQUE7WUFDQSxPQUFBLE1BQUEsSUFBQSxPQUFBOztZQUVBLElBQUEsY0FBQSxZQUFBOzs7Ozs7O0dBT0EsV0FBQSxtR0FBQSxTQUFBLFFBQUEsZ0JBQUEsUUFBQSx3QkFBQSxhQUFBO0lBQ0EsSUFBQSxLQUFBOztJQUVBLFFBQUEsT0FBQSxJQUFBOztJQUVBLEdBQUEsZUFBQTtJQUNBLEdBQUEsU0FBQTs7SUFFQSxTQUFBLGVBQUE7TUFDQSxHQUFBLHNCQUFBOztNQUVBO1NBQ0EsT0FBQTtVQUNBLElBQUEsWUFBQTtXQUNBO1VBQ0EsTUFBQSxHQUFBOztTQUVBO1NBQ0EsS0FBQSxTQUFBLEtBQUE7VUFDQSxPQUFBLFFBQUEsSUFBQSxPQUFBOztVQUVBLGVBQUE7O1NBRUEsTUFBQSxTQUFBLEtBQUE7VUFDQSxHQUFBLHNCQUFBOztVQUVBLE9BQUEsTUFBQSxJQUFBLE9BQUE7Ozs7SUFJQSxTQUFBLFNBQUE7TUFDQSxlQUFBOzs7OztHQUtBLFdBQUEsMkhBQUEsU0FBQSxRQUFBLGdCQUFBLFFBQUE7SUFDQSxjQUFBLGFBQUEsYUFBQTtJQUNBLElBQUEsS0FBQTs7SUFFQSxHQUFBLGFBQUEsWUFBQSxLQUFBO0lBQ0EsR0FBQSxjQUFBLFlBQUEsS0FBQTtJQUNBLEdBQUEsYUFBQSxZQUFBLEtBQUE7O0lBRUEsSUFBQSxZQUFBLEtBQUE7TUFDQSxHQUFBLFFBQUE7O01BRUEsWUFBQSxTQUFBLFlBQUEsSUFBQTtNQUNBLFlBQUEsVUFBQSxZQUFBLElBQUE7TUFDQSxZQUFBLFNBQUEsWUFBQSxJQUFBO1dBQ0E7TUFDQSxHQUFBLFFBQUE7OztJQUdBLEdBQUEsU0FBQTtJQUNBLEdBQUEsU0FBQTs7SUFFQSxTQUFBLFNBQUE7TUFDQSxJQUFBLFlBQUEsS0FBQTtRQUNBO1dBQ0EsT0FBQTtZQUNBLFVBQUEsWUFBQTtZQUNBLFFBQUEsWUFBQSxJQUFBO2FBQ0E7WUFDQSxPQUFBLEdBQUEsTUFBQTtZQUNBLFFBQUEsR0FBQSxNQUFBO1lBQ0EsT0FBQSxHQUFBLE1BQUE7O1dBRUE7V0FDQSxLQUFBLFNBQUEsS0FBQTtZQUNBLE9BQUEsUUFBQSxJQUFBLE9BQUE7O1lBRUEsZUFBQTs7V0FFQSxNQUFBLFNBQUEsS0FBQTtZQUNBLE9BQUEsTUFBQSxJQUFBLE9BQUE7O2FBRUE7UUFDQTtXQUNBLEtBQUE7WUFDQSxVQUFBLFlBQUE7YUFDQTtZQUNBLE9BQUEsR0FBQSxNQUFBO1lBQ0EsUUFBQSxHQUFBLE1BQUE7WUFDQSxPQUFBLEdBQUEsTUFBQTs7V0FFQTtXQUNBLEtBQUEsU0FBQSxLQUFBO1lBQ0EsT0FBQSxRQUFBLElBQUEsT0FBQTs7WUFFQSxlQUFBOztXQUVBLE1BQUEsU0FBQSxLQUFBO1lBQ0EsT0FBQSxNQUFBLElBQUEsT0FBQTs7Ozs7SUFLQSxTQUFBLFlBQUEsV0FBQSxPQUFBO01BQ0EsR0FBQSxhQUFBLFlBQUEsVUFBQSxXQUFBOzs7SUFHQSxTQUFBLFNBQUE7TUFDQSxlQUFBOzs7Ozs7O0FDMWhCQTtHQUNBLE9BQUEscUJBQUE7R0FDQSxVQUFBLGdDQUFBLFNBQUEsVUFBQTtJQUNBLE9BQUE7TUFDQSxVQUFBO01BQ0EsTUFBQSxTQUFBLE9BQUEsU0FBQSxZQUFBO1FBQ0EsTUFBQSxPQUFBLFdBQUEsb0JBQUEsU0FBQSxPQUFBO1VBQ0EsUUFBQSxLQUFBLGlCQUFBLENBQUEsQ0FBQTs7Ozs7O0FDVEE7R0FDQSxPQUFBLGdCQUFBOztHQUVBLE9BQUEsVUFBQSxXQUFBO0lBQ0EsT0FBQSxTQUFBLEdBQUE7TUFDQSxJQUFBLEtBQUEsTUFBQTtRQUNBLE9BQUE7OztNQUdBLElBQUEsRUFBQSxRQUFBLFlBQUE7O01BRUEsSUFBQSxFQUFBLFNBQUEsR0FBQTtRQUNBLE9BQUE7OztNQUdBLElBQUEsS0FBQSxFQUFBLE1BQUE7O01BRUEsR0FBQSxPQUFBLEdBQUEsR0FBQTs7TUFFQSxJQUFBLEVBQUEsVUFBQSxHQUFBO1FBQ0EsR0FBQSxPQUFBLEdBQUEsR0FBQTs7O01BR0EsT0FBQSxHQUFBLEtBQUE7Ozs7QUN2QkE7R0FDQSxPQUFBLGFBQUE7R0FDQSxRQUFBLFlBQUEsWUFBQTtJQUNBLElBQUEsV0FBQSxVQUFBLE1BQUEsR0FBQTtNQUNBLE9BQUEsS0FBQSxnQkFBQSxLQUFBLEtBQUEsYUFBQSxLQUFBLElBQUEsS0FBQTs7O0lBR0EsT0FBQTtNQUNBLG1CQUFBLFVBQUEsTUFBQTtRQUNBLE9BQUEsU0FBQSxNQUFBOzs7TUFHQSxtQkFBQSxTQUFBLE1BQUE7UUFDQSxJQUFBLElBQUEsS0FBQTtRQUNBLElBQUEsSUFBQSxLQUFBOztRQUVBLElBQUEsSUFBQSxJQUFBO1VBQ0EsSUFBQSxNQUFBOzs7UUFHQSxJQUFBLElBQUEsSUFBQTtVQUNBLElBQUEsTUFBQTs7O1FBR0EsT0FBQSxDQUFBLFNBQUEsTUFBQSxNQUFBLElBQUEsTUFBQSxHQUFBLEtBQUE7Ozs7O0FDdkJBO0dBQ0EsT0FBQSxjQUFBO0dBQ0EsUUFBQSxTQUFBLFlBQUE7SUFDQSxPQUFBLFVBQUEsT0FBQTtNQUNBLE9BQUE7UUFDQSxLQUFBLFVBQUEsTUFBQSxNQUFBO1VBQ0EsT0FBQSxNQUFBLE1BQUEsS0FBQSxVQUFBLE1BQUE7WUFDQSxPQUFBLEtBQUEsU0FBQTthQUNBOztRQUVBLE1BQUEsVUFBQSxNQUFBLEtBQUE7VUFDQSxPQUFBLE1BQUEsTUFBQSxLQUFBLFVBQUEsTUFBQTtZQUNBLE9BQUEsS0FBQSxVQUFBO2FBQ0E7O1FBRUEsTUFBQSxVQUFBLE1BQUEsS0FBQTtVQUNBLE9BQUEsTUFBQSxNQUFBLEtBQUEsVUFBQSxNQUFBO1lBQ0EsT0FBQSxLQUFBLFVBQUE7OztRQUdBLFdBQUEsU0FBQSxNQUFBLE1BQUE7VUFDQSxPQUFBLE1BQUEsTUFBQSxLQUFBLFNBQUEsTUFBQTtZQUNBLE9BQUEsS0FBQSxTQUFBOzs7UUFHQSxNQUFBLFVBQUEsTUFBQTtVQUNBLE9BQUEsTUFBQTs7UUFFQSxPQUFBLFVBQUEsTUFBQSxNQUFBO1VBQ0EsT0FBQSxNQUFBLE1BQUEsT0FBQSxVQUFBLE1BQUE7WUFDQSxPQUFBLEtBQUEsUUFBQSxLQUFBLFdBQUEsQ0FBQTs7Ozs7OztBQzlCQTtHQUNBLE9BQUEsY0FBQTtHQUNBLFFBQUEsNkJBQUEsU0FBQSxTQUFBLE1BQUE7SUFDQSxJQUFBLFFBQUE7SUFDQSxNQUFBLFNBQUEsU0FBQSxLQUFBO01BQ0EsUUFBQSwwQkFBQSxLQUFBLE1BQUEsV0FBQSxNQUFBOzs7SUFHQSxNQUFBLFlBQUEsU0FBQSxXQUFBO01BQ0EsVUFBQSxPQUFBLFdBQUE7UUFDQSxLQUFBLEtBQUEsZUFBQSxVQUFBO1NBQ0EsV0FBQTtRQUNBLEtBQUEsS0FBQSxlQUFBLFVBQUE7Ozs7SUFJQSxNQUFBLFVBQUEsU0FBQSxLQUFBO01BQ0EsS0FBQSxLQUFBLGVBQUEsS0FBQSxVQUFBLElBQUE7OztJQUdBLE9BQUE7O0FDckJBO0dBQ0EsT0FBQSxvQkFBQSxDQUFBLHNCQUFBOztHQUVBLHlCQUFBLFNBQUEsZUFBQTtJQUNBLGNBQUEsYUFBQSxLQUFBOzs7SUFHQSxjQUFBLFNBQUEsUUFBQSxPQUFBLHNCQUFBOzs7R0FHQSxRQUFBLDhEQUFBLFNBQUEsSUFBQSxZQUFBLFdBQUEsT0FBQTtJQUNBLE9BQUE7O01BRUEsV0FBQSxTQUFBLFFBQUE7UUFDQSxRQUFBLE9BQUEsT0FBQSxTQUFBLE1BQUE7OztRQUdBLElBQUEsT0FBQSxJQUFBLFFBQUEsWUFBQSxDQUFBLEtBQUEsT0FBQSxJQUFBLFFBQUEsV0FBQSxDQUFBLEdBQUE7VUFDQSxPQUFBOzs7UUFHQSxPQUFBLE1BQUEsT0FBQSxNQUFBLFFBQUEsSUFBQSxPQUFBOztRQUVBLE9BQUE7Ozs7TUFJQSxnQkFBQSxTQUFBLFdBQUE7UUFDQSxPQUFBLEdBQUEsT0FBQTs7Ozs7Ozs7O01BU0EsWUFBQSxTQUFBLFVBQUE7O1FBRUEsSUFBQSxNQUFBO1FBQ0EsSUFBQSxlQUFBLFVBQUE7O1FBRUEsSUFBQSxRQUFBLFNBQUEsU0FBQSxPQUFBOztVQUVBLElBQUEsU0FBQSxLQUFBLFFBQUEsTUFBQTtZQUNBLE9BQUE7OztVQUdBLE9BQUEsU0FBQSxLQUFBO1VBQ0EsT0FBQSxTQUFBLEtBQUE7Ozs7O1VBS0EsSUFBQSxTQUFBLEtBQUE7WUFDQSxJQUFBLFNBQUEsS0FBQTtjQUNBLE1BQUEsS0FBQTs7O1lBR0EsT0FBQSxHQUFBLE9BQUE7Ozs7OztVQU1BLElBQUEsUUFBQSxNQUFBO1lBQ0EsU0FBQSxPQUFBOzs7Ozs7Ozs7UUFTQSxPQUFBOzs7O01BSUEsaUJBQUEsU0FBQSxXQUFBO1FBQ0EsSUFBQSxlQUFBLFVBQUE7O1FBRUEsSUFBQSxVQUFBLFdBQUEsS0FBQTtVQUNBLE1BQUEsS0FBQTs7O1FBR0EsT0FBQSxHQUFBLE9BQUE7Ozs7O0FDckZBO0dBQ0EsT0FBQSxlQUFBLENBQUE7R0FDQSxRQUFBLDBDQUFBLFNBQUEsTUFBQSxxQkFBQTtJQUNBLElBQUEsU0FBQTtNQUNBLGFBQUE7O01BRUEsUUFBQSxTQUFBLFVBQUEsUUFBQTtRQUNBLElBQUEsVUFBQSxXQUFBLEdBQUE7VUFDQSxNQUFBLElBQUEsTUFBQTs7O1FBR0EsT0FBQSxDQUFBLFVBQUEsUUFBQSxLQUFBLE9BQUE7OztNQUdBLFFBQUEsU0FBQSxLQUFBLFVBQUEsUUFBQTtRQUNBLElBQUEsVUFBQSxXQUFBLEdBQUE7VUFDQSxNQUFBLElBQUEsTUFBQSxZQUFBLE1BQUE7Ozs7UUFJQSxJQUFBLFVBQUEsV0FBQSxHQUFBO1VBQ0EsT0FBQSxDQUFBLFVBQUEsS0FBQSxLQUFBLE9BQUE7OztRQUdBLE9BQUEsQ0FBQSxVQUFBLFFBQUEsS0FBQSxLQUFBLE9BQUE7Ozs7SUFJQSxRQUFBLE9BQUEsUUFBQTtNQUNBLEtBQUEsT0FBQSxPQUFBLEtBQUEsUUFBQTs7TUFFQSxRQUFBLE9BQUEsT0FBQSxLQUFBLFFBQUE7O01BRUEsUUFBQSxPQUFBLE9BQUEsS0FBQSxRQUFBOztNQUVBLE9BQUEsU0FBQSxVQUFBLFFBQUE7UUFDQSxvQkFBQSxPQUFBLE9BQUEsT0FBQSxVQUFBO1FBQ0Esb0JBQUEsT0FBQSxPQUFBLE9BQUEsVUFBQTtRQUNBLG9CQUFBLE9BQUEsT0FBQSxPQUFBLFVBQUE7UUFDQSxvQkFBQSxPQUFBLE9BQUEsSUFBQSxVQUFBOzs7O0lBSUEsT0FBQTs7O0FDM0NBO0dBQ0EsT0FBQSxjQUFBLENBQUE7R0FDQSxRQUFBLHNEQUFBLFNBQUEsTUFBQSxXQUFBLHFCQUFBO0lBQ0EsSUFBQSxrQkFBQTs7SUFFQSxJQUFBLGFBQUE7TUFDQSxXQUFBO01BQ0EsZUFBQTtNQUNBLFlBQUE7OztJQUdBLElBQUEsUUFBQTtNQUNBLE1BQUEsV0FBQTtRQUNBLE9BQUE7OztNQUdBLE1BQUEsU0FBQSxVQUFBO1FBQ0EsVUFBQSxJQUFBO1FBQ0EsVUFBQSxPQUFBLFlBQUE7OztNQUdBLFNBQUEsV0FBQTtRQUNBLElBQUEsU0FBQSxLQUFBO1FBQ0EsSUFBQSxVQUFBOztRQUVBLElBQUEsUUFBQTtVQUNBLFFBQUEsZ0JBQUEsT0FBQSxhQUFBLE1BQUEsT0FBQTs7O1FBR0EsT0FBQTs7O01BR0EsT0FBQSxTQUFBLFFBQUE7UUFDQSxJQUFBLFFBQUE7VUFDQSxvQkFBQSxJQUFBLGlCQUFBOztVQUVBLE9BQUE7OztRQUdBLE9BQUEsb0JBQUEsSUFBQTs7OztJQUlBLE9BQUE7Ozs7QUMxQ0E7R0FDQSxPQUFBLGlCQUFBO0dBQ0EsUUFBQSxtQ0FBQSxTQUFBLFlBQUEsTUFBQTtJQUNBLElBQUEsS0FBQTtJQUNBLElBQUEsT0FBQSxXQUFBOztJQUVBLElBQUEsV0FBQTs7Ozs7OztNQU9BLE9BQUEsU0FBQSxLQUFBO1FBQ0EsSUFBQSxDQUFBLElBQUEsZUFBQSxDQUFBLElBQUEsS0FBQTtVQUNBLE1BQUEsSUFBQSxNQUFBOzs7UUFHQSxJQUFBLFFBQUEsSUFBQSxZQUFBO1FBQ0EsSUFBQTtRQUNBLElBQUEsa0JBQUE7OztRQUdBLElBQUEsVUFBQSxHQUFBO1VBQ0E7OztRQUdBLElBQUEsYUFBQTtVQUNBLFdBQUE7VUFDQSxNQUFBO1VBQ0EsS0FBQTtVQUNBLE9BQUE7OztRQUdBLE1BQUEsUUFBQSxPQUFBLElBQUEsWUFBQTs7UUFFQSxJQUFBLFdBQUEsU0FBQSxZQUFBOztVQUVBLFdBQUEsV0FBQTs7VUFFQSxJQUFBLElBQUEsTUFBQSxVQUFBOztVQUVBOztVQUVBLElBQUEsV0FBQTtZQUNBLFFBQUE7WUFDQSxPQUFBO1lBQ0EsU0FBQSxTQUFBLGtCQUFBLFFBQUE7OztVQUdBLElBQUEsVUFBQSxRQUFBLEdBQUE7WUFDQSxJQUFBLEdBQUEsaUJBQUE7Y0FDQSxHQUFBLGtCQUFBO2NBQ0EsT0FBQSxHQUFBOzs7WUFHQSxJQUFBOzs7O1FBSUEsSUFBQSxjQUFBLFFBQUEsS0FBQSxJQUFBLGFBQUE7OztRQUdBLElBQUEsVUFBQSxHQUFBO1VBQ0EsUUFBQTtVQUNBLFNBQUEsSUFBQTtZQUNBLFlBQUEsSUFBQSxZQUFBO1lBQ0EsU0FBQTtZQUNBLEtBQUEsSUFBQTtZQUNBLE9BQUEsSUFBQTs7O1VBR0E7Ozs7UUFJQSxJQUFBLFFBQUEsSUFBQSxXQUFBO1VBQ0EsUUFBQSxRQUFBO1VBQ0EsS0FBQSxJQUFBLElBQUEsR0FBQSxJQUFBLE9BQUEsS0FBQTtZQUNBLFNBQUEsSUFBQTtjQUNBLFlBQUEsSUFBQSxZQUFBO2NBQ0EsU0FBQTtjQUNBLEtBQUEsSUFBQTtjQUNBLE9BQUEsSUFBQTs7OztVQUlBOzs7O1FBSUEsUUFBQSxJQUFBLFlBQUE7UUFDQSxHQUFBLGtCQUFBLElBQUE7Ozs7UUFJQSxHQUFBLGlCQUFBLG1CQUFBLFNBQUEsZ0JBQUE7O1VBRUEsSUFBQSxDQUFBLGdCQUFBO1lBQ0E7OztVQUdBLFNBQUEsSUFBQTtZQUNBLFlBQUEsSUFBQSxZQUFBLEVBQUE7WUFDQSxTQUFBO1lBQ0EsS0FBQSxJQUFBO1lBQ0EsT0FBQSxJQUFBOzs7O1FBSUEsS0FBQSxJQUFBLElBQUEsR0FBQSxJQUFBLElBQUEsV0FBQSxLQUFBO1VBQ0EsU0FBQSxJQUFBO1lBQ0EsWUFBQSxJQUFBLFlBQUE7WUFDQSxTQUFBO1lBQ0EsS0FBQSxJQUFBO1lBQ0EsT0FBQSxJQUFBOzs7O1FBSUE7Ozs7TUFJQSxLQUFBLFNBQUEsS0FBQTtRQUNBLElBQUEsQ0FBQSxJQUFBLGNBQUEsQ0FBQSxJQUFBLEtBQUE7VUFDQSxNQUFBLElBQUEsTUFBQTs7O1FBR0EsS0FBQSxNQUFBLGlCQUFBLEtBQUEsVUFBQSxJQUFBOztRQUVBLElBQUEsYUFBQTtVQUNBLFNBQUE7VUFDQSxPQUFBO1VBQ0EsU0FBQTtVQUNBLFVBQUEsSUFBQSxXQUFBLElBQUEsT0FBQSxJQUFBLFdBQUEsSUFBQSxZQUFBLE9BQUE7O1FBRUEsSUFBQSxvQkFBQSxJQUFBO1FBQ0EsTUFBQSxRQUFBLE9BQUEsSUFBQSxZQUFBO1FBQ0EsSUFBQSxhQUFBLFNBQUEsZUFBQTtVQUNBLElBQUEsY0FBQSxrQkFBQTs7WUFFQSxJQUFBLFNBQUEsY0FBQTs7WUFFQSxJQUFBLFFBQUEsY0FBQTs7WUFFQSxJQUFBLFVBQUEsU0FBQSxDQUFBLFNBQUEsU0FBQTs7WUFFQSxrQkFBQTtjQUNBLFFBQUE7Y0FDQSxPQUFBO2NBQ0EsU0FBQTs7Ozs7UUFLQSxJQUFBLFNBQUEsSUFBQTtRQUNBLE9BQUEsVUFBQSxJQUFBO1FBQ0EsT0FBQSxXQUFBLElBQUE7O1FBRUEsSUFBQSxLQUFBLElBQUE7UUFDQSxHQUFBLGFBQUEsSUFBQTtRQUNBLEdBQUE7VUFDQSxJQUFBLFdBQUE7VUFDQSxVQUFBLElBQUE7VUFDQSxJQUFBLFFBQUEsS0FBQSxVQUFBLElBQUE7VUFDQSxJQUFBLE1BQUEsS0FBQSxVQUFBLElBQUE7VUFDQTs7Ozs7SUFLQSxPQUFBOzs7O0FDNUtBO0dBQ0EsT0FBQSxXQUFBO0dBQ0EsUUFBQSxlQUFBLFVBQUEsTUFBQTtJQUNBLE9BQUE7TUFDQSxTQUFBLFNBQUEsSUFBQSxRQUFBO1FBQ0EsSUFBQSxNQUFBOztRQUVBLElBQUEsUUFBQSxTQUFBLFNBQUE7VUFDQSxTQUFBLE9BQUEsTUFBQTs7O1FBR0EsSUFBQSxPQUFBLFdBQUEsS0FBQSxPQUFBLE9BQUEsSUFBQTtVQUNBLEtBQUEsS0FBQTtVQUNBOzs7UUFHQSxJQUFBLENBQUEsUUFBQSxRQUFBLFNBQUE7VUFDQSxLQUFBLE1BQUE7VUFDQTs7O1FBR0EsT0FBQSxJQUFBLFNBQUEsT0FBQTtVQUNBLE9BQUEsSUFBQSxTQUFBLEdBQUE7OztRQUdBLE9BQUE7Ozs7QUMxQkE7QUFDQSxRQUFBLE9BQUEsWUFBQSxJQUFBLENBQUEsWUFBQSxTQUFBLFVBQUE7RUFDQSxJQUFBLGtCQUFBO0lBQ0EsTUFBQTtJQUNBLEtBQUE7SUFDQSxLQUFBO0lBQ0EsS0FBQTtJQUNBLE1BQUE7SUFDQSxPQUFBOztFQUVBLFNBQUEsTUFBQSxXQUFBO0lBQ0Esb0JBQUE7TUFDQSxTQUFBO1FBQ0E7UUFDQTs7TUFFQSxPQUFBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7O01BRUEsU0FBQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7TUFFQSxZQUFBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7O01B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QUFBLEtBQUEsS0FBQSxNQUFBLEdBQUEsS0FBQSxLQUFBLE9BQUEsRUFBQSxPQUFBOzs7Ozs7SUFNQSxHQUFBLGFBQUE7O0lBRUEsSUFBQSxpQkFBQSxvQkFBQSxJQUFBOztJQUVBLEdBQUEsY0FBQSxFQUFBLElBQUEsZ0JBQUEsU0FBQSxNQUFBLEtBQUE7TUFDQSxPQUFBO1FBQ0EsSUFBQTtRQUNBLE1BQUEsY0FBQTtRQUNBLFFBQUE7Ozs7SUFJQSxFQUFBLGdCQUFBLFNBQUEsVUFBQSxRQUFBLFNBQUEsTUFBQTtNQUNBLEdBQUEsV0FBQSxLQUFBLE1BQUE7OztJQUdBLFNBQUEsY0FBQSxTQUFBO01BQ0EsT0FBQSxVQUFBLEtBQUEsU0FBQSxNQUFBO1FBQ0EsT0FBQSxLQUFBLE1BQUE7U0FDQTs7OztJQUlBLEdBQUEsYUFBQTs7OztJQUlBLFNBQUEsV0FBQSxVQUFBLE1BQUEsTUFBQTtNQUNBLFVBQUEsT0FBQSxXQUFBLG9CQUFBLGtCQUFBO1FBQ0EsVUFBQTtRQUNBLGtCQUFBLE9BQUEsZ0JBQUE7UUFDQSxhQUFBLE9BQUEsa0JBQUE7UUFDQSxZQUFBO1FBQ0EsY0FBQSxPQUFBLGFBQUE7OztRQUdBLGtCQUFBOzs7TUFHQSxTQUFBLG1CQUFBLFFBQUE7O1FBRUEsSUFBQSxhQUFBLFFBQUE7VUFDQSxHQUFBLEtBQUEsS0FBQSxJQUFBLFFBQUE7Ozs7VUFJQSxVQUFBLGdCQUFBLEdBQUE7ZUFDQSxJQUFBLGFBQUEsU0FBQTs7VUFFQSxHQUFBLFdBQUEsS0FBQSxJQUFBLFFBQUE7OztVQUdBLElBQUEsY0FBQSxlQUFBLEtBQUEsSUFBQSxLQUFBLFNBQUEsT0FBQTtZQUNBLE9BQUEsTUFBQSxPQUFBLEtBQUE7Ozs7VUFJQSxZQUFBLFFBQUE7VUFDQSxvQkFBQSxJQUFBLGdCQUFBOzs7VUFHQSxVQUFBLEtBQUEsSUFBQSxZQUFBLElBQUEsUUFBQTs7O1FBR0Esb0JBQUEsSUFBQSxZQUFBOztRQUVBLEdBQUE7OztNQUdBLFNBQUEsbUJBQUE7UUFDQSxLQUFBLE1BQUEsZ0JBQUEsS0FBQSxPQUFBLFdBQUEsS0FBQTs7OztJQUlBLEdBQUEsYUFBQTtJQUNBLFNBQUEsV0FBQSxVQUFBLE9BQUE7TUFDQSxJQUFBLFFBQUEsR0FBQSxhQUFBLFNBQUEsU0FBQSxjQUFBLE1BQUEsSUFBQTs7TUFFQSxJQUFBLENBQUEsT0FBQTtRQUNBOzs7TUFHQSxnQkFBQSxhQUFBOzs7O0dBSUEsV0FBQSxrSEFBQSxTQUFBLFFBQUEsTUFBQSxjQUFBLGdCQUFBLFFBQUEscUJBQUEsUUFBQTtJQUNBLElBQUEsS0FBQTs7SUFFQSxJQUFBLGVBQUEsU0FBQSxhQUFBO0lBQ0EsSUFBQSxXQUFBLGFBQUE7SUFDQSxJQUFBLFNBQUEsYUFBQTs7O0lBR0EsSUFBQSxhQUFBLE9BQUEsT0FBQSxVQUFBO0lBQ0EsSUFBQSxpQkFBQSxPQUFBLElBQUE7SUFDQSxJQUFBLFlBQUEsb0JBQUEsSUFBQTs7O0lBR0EsSUFBQTtJQUNBO09BQ0EsTUFBQSxlQUFBLElBQUE7T0FDQSxLQUFBLFNBQUEsTUFBQTtRQUNBLE9BQUEsS0FBQSxPQUFBOztJQUVBLEdBQUEsUUFBQSxlQUFBLFlBQUE7OztJQUdBLElBQUEsR0FBQSxTQUFBLEdBQUEsTUFBQSxRQUFBO01BQ0EsR0FBQSxNQUFBLEdBQUEsVUFBQTs7O0lBR0EsR0FBQSxPQUFBOzs7SUFHQSxRQUFBLE9BQUEsR0FBQSxNQUFBLGFBQUEsVUFBQSxpQkFBQTs7SUFFQSxHQUFBLE1BQUEsUUFBQSxTQUFBLE1BQUE7TUFDQSxJQUFBLEtBQUEsNkJBQUEsS0FBQSwwQkFBQSxRQUFBO1FBQ0EsS0FBQSwwQkFBQSxRQUFBLFNBQUEsTUFBQTtVQUNBLEdBQUEsS0FBQSxLQUFBLE1BQUEsR0FBQSxLQUFBLEtBQUEsT0FBQTs7VUFFQSxJQUFBLEdBQUEsS0FBQSxLQUFBLElBQUEsVUFBQSxNQUFBO1lBQ0EsR0FBQSxLQUFBLEtBQUEsSUFBQSxTQUFBOzs7Ozs7O0lBT0EsR0FBQSxPQUFBLFFBQUEsU0FBQSxHQUFBO01BQ0EsS0FBQSxJQUFBLGVBQUEsS0FBQSxVQUFBOztNQUVBOztNQUVBO09BQ0E7Ozs7Ozs7Ozs7Ozs7O0lBY0EsU0FBQSxPQUFBO01BQ0EsSUFBQSxPQUFBLG9CQUFBLElBQUEsZUFBQTtNQUNBLEtBQUEsZ0JBQUEsR0FBQTs7TUFFQSxvQkFBQSxJQUFBLFlBQUE7O01BRUEsS0FBQSxJQUFBLGNBQUEsWUFBQSxLQUFBOzs7SUFHQSxTQUFBLFdBQUE7TUFDQSxJQUFBLE9BQUEsb0JBQUEsSUFBQSxtQkFBQTtNQUNBLElBQUEsWUFBQTs7O01BR0EsRUFBQSxLQUFBLEdBQUEsTUFBQSxTQUFBLE1BQUEsS0FBQTtRQUNBLElBQUEsS0FBQSxPQUFBO1VBQ0EsS0FBQSxLQUFBO1VBQ0EsVUFBQSxLQUFBOzs7OztNQUtBLElBQUEsQ0FBQSxVQUFBLFFBQUE7UUFDQTs7O01BR0EsS0FBQSxnQkFBQTs7TUFFQSxvQkFBQSxJQUFBLGdCQUFBOztNQUVBLEtBQUEsSUFBQSxpQkFBQSxnQkFBQSxLQUFBOzs7SUFHQSxHQUFBLGNBQUE7SUFDQSxHQUFBLGVBQUE7SUFDQSxHQUFBLGFBQUE7SUFDQSxHQUFBLGtCQUFBO0lBQ0EsR0FBQSxrQkFBQTtJQUNBLEdBQUEsYUFBQTs7O0lBR0EsU0FBQSxZQUFBLE9BQUEsTUFBQSxZQUFBOztNQUVBLFdBQUEsV0FBQTs7UUFFQSxJQUFBLFlBQUEsV0FBQSxTQUFBLEdBQUEsS0FBQSxXQUFBLElBQUEsWUFBQSxHQUFBO1VBQ0E7OztRQUdBLFlBQUEsVUFBQTs7UUFFQSxJQUFBLG1CQUFBLE9BQUEsS0FBQTtVQUNBLGFBQUE7VUFDQSxZQUFBO1VBQ0EsVUFBQTtVQUNBLFNBQUE7WUFDQSxhQUFBLFdBQUE7Y0FDQSxPQUFBLFFBQUEsT0FBQTtnQkFDQSxXQUFBLEtBQUE7Z0JBQ0EsWUFBQSxLQUFBO2dCQUNBLE9BQUE7aUJBQ0EsWUFBQSxHQUFBLEtBQUEsV0FBQTs7Ozs7UUFLQSxpQkFBQSxPQUFBLEtBQUEsU0FBQSxNQUFBO1VBQ0EsUUFBQSxPQUFBLEdBQUEsS0FBQSxXQUFBLEtBQUEsTUFBQTtZQUNBLE1BQUEsV0FBQTs7O1VBR0EsWUFBQSxVQUFBO1dBQ0EsV0FBQTtVQUNBLFlBQUEsVUFBQTs7Ozs7SUFLQSxZQUFBLFVBQUE7O0lBRUEsU0FBQSxhQUFBLE1BQUE7O01BRUEsSUFBQSxJQUFBLFNBQUEsR0FBQSxLQUFBLEtBQUEsSUFBQTtNQUNBLElBQUEsTUFBQSxLQUFBLE1BQUEsR0FBQTtRQUNBLFFBQUEsT0FBQSxHQUFBLEtBQUEsS0FBQSxLQUFBO1VBQ0EsT0FBQTtVQUNBLFFBQUE7VUFDQSxNQUFBO1VBQ0EsT0FBQTs7Ozs7OztJQU9BLFNBQUEsV0FBQSxPQUFBO01BQ0EsZ0JBQUEsYUFBQSxHQUFBLEtBQUEsTUFBQSxJQUFBOzs7SUFHQSxTQUFBLFdBQUEsTUFBQSxNQUFBO01BQ0EsVUFBQSxPQUFBLFdBQUEsb0JBQUEsa0JBQUE7UUFDQSxVQUFBO1FBQ0Esa0JBQUEsT0FBQSxnQkFBQTtRQUNBLGFBQUEsT0FBQSxrQkFBQTtRQUNBLFlBQUE7UUFDQSxjQUFBLE9BQUEsYUFBQTs7O1FBR0Esa0JBQUE7OztNQUdBLFNBQUEsbUJBQUEsUUFBQTtRQUNBLEdBQUEsS0FBQSxLQUFBLE1BQUEsUUFBQSxPQUFBLEdBQUEsS0FBQSxLQUFBLE9BQUEsSUFBQTtVQUNBLE9BQUE7VUFDQSxNQUFBLEtBQUE7OztRQUdBLEdBQUE7OztNQUdBLFNBQUEsbUJBQUE7UUFDQSxLQUFBLE1BQUEsZ0JBQUEsS0FBQSxPQUFBLFdBQUEsS0FBQTs7Ozs7SUFLQSxHQUFBLFlBQUE7TUFDQSxXQUFBOztJQUVBLFNBQUEsZ0JBQUEsUUFBQSxJQUFBO01BQ0EsT0FBQTtNQUNBLE9BQUE7O01BRUEsR0FBQSxVQUFBLE1BQUE7S0FDQTs7SUFFQSxTQUFBLGdCQUFBLE9BQUEsTUFBQSxZQUFBO01BQ0EsV0FBQSxXQUFBO1FBQ0EsSUFBQSxnQkFBQSxXQUFBLFNBQUEsR0FBQSxLQUFBLFdBQUEsSUFBQSxZQUFBLEdBQUE7VUFDQTs7O1FBR0EsZ0JBQUEsVUFBQTs7UUFFQSxJQUFBLG1CQUFBLE9BQUEsS0FBQTtVQUNBLGFBQUE7VUFDQSxZQUFBO1VBQ0EsVUFBQTtVQUNBLFNBQUE7WUFDQSxhQUFBLFdBQUE7Y0FDQSxPQUFBLFFBQUEsT0FBQTtnQkFDQSxXQUFBLEtBQUE7Z0JBQ0EsWUFBQSxLQUFBO2dCQUNBLE9BQUE7aUJBQ0EsWUFBQSxHQUFBLEtBQUEsV0FBQTs7Ozs7UUFLQSxpQkFBQSxPQUFBLEtBQUEsU0FBQSxNQUFBO1VBQ0EsUUFBQSxPQUFBLEdBQUEsS0FBQSxXQUFBLEtBQUEsTUFBQTtZQUNBLE1BQUEsV0FBQTs7O1VBR0EsZ0JBQUEsVUFBQTtXQUNBLFdBQUE7VUFDQSxnQkFBQSxVQUFBOzs7OztJQUtBLGdCQUFBLFVBQUE7OztHQUdBLFdBQUEsMkVBQUEsU0FBQSxRQUFBLE1BQUEsZ0JBQUEsYUFBQTtJQUNBLElBQUEsS0FBQTs7SUFFQSxRQUFBLE9BQUEsSUFBQTs7SUFFQSxHQUFBLFNBQUE7SUFDQSxHQUFBLFNBQUE7SUFDQSxHQUFBLGFBQUE7SUFDQSxHQUFBLGFBQUE7O0lBRUEsU0FBQSxTQUFBO01BQ0EsZUFBQSxNQUFBO1FBQ0EsT0FBQSxHQUFBO1FBQ0EsUUFBQSxHQUFBO1FBQ0EsTUFBQSxHQUFBO1FBQ0EsT0FBQSxHQUFBOzs7O0lBSUEsU0FBQSxTQUFBO01BQ0EsZUFBQTs7O0lBR0EsU0FBQSxXQUFBLE9BQUE7TUFDQSxJQUFBLENBQUEsT0FBQTtRQUNBOzs7TUFHQSxnQkFBQSxhQUFBOzs7SUFHQSxTQUFBLGFBQUE7TUFDQSxVQUFBLE9BQUEsV0FBQSxvQkFBQSxrQkFBQTtRQUNBLFVBQUE7UUFDQSxrQkFBQSxPQUFBLGdCQUFBO1FBQ0EsYUFBQSxPQUFBLGtCQUFBO1FBQ0EsWUFBQTtRQUNBLGNBQUEsT0FBQSxhQUFBOzs7UUFHQSxrQkFBQTs7O01BR0EsU0FBQSxtQkFBQSxRQUFBO1FBQ0EsR0FBQSxRQUFBO1FBQ0EsR0FBQTs7O01BR0EsU0FBQSxtQkFBQTtRQUNBLEtBQUEsTUFBQSxnQkFBQSxZQUFBLFlBQUEsV0FBQSxZQUFBOzs7OztHQUtBLFdBQUEseUVBQUEsU0FBQSxRQUFBLE1BQUEsZ0JBQUEsYUFBQTtNQUNBLElBQUEsS0FBQTs7TUFFQSxRQUFBLE9BQUEsSUFBQTs7TUFFQSxHQUFBLFNBQUE7TUFDQSxHQUFBLFNBQUE7TUFDQSxHQUFBLGFBQUE7TUFDQSxHQUFBLGFBQUE7O01BRUEsU0FBQSxTQUFBO1FBQ0EsZUFBQSxNQUFBO1VBQ0EsT0FBQSxHQUFBOzs7O01BSUEsU0FBQSxTQUFBO1FBQ0EsZUFBQTs7O01BR0EsU0FBQSxXQUFBLE9BQUE7UUFDQSxJQUFBLENBQUEsT0FBQTtVQUNBOzs7UUFHQSxnQkFBQSxhQUFBOzs7TUFHQSxTQUFBLGFBQUE7UUFDQSxVQUFBLE9BQUEsV0FBQSxvQkFBQSxrQkFBQTtVQUNBLFVBQUE7VUFDQSxrQkFBQSxPQUFBLGdCQUFBO1VBQ0EsYUFBQSxPQUFBLGtCQUFBO1VBQ0EsWUFBQTtVQUNBLGNBQUEsT0FBQSxhQUFBOzs7VUFHQSxrQkFBQTs7O1FBR0EsU0FBQSxtQkFBQSxRQUFBO1VBQ0EsR0FBQSxRQUFBO1VBQ0EsR0FBQTs7O1FBR0EsU0FBQSxtQkFBQTtVQUNBLEtBQUEsTUFBQSxnQkFBQSxZQUFBLFlBQUEsV0FBQSxZQUFBOzs7OztHQUtBLFdBQUEsaUZBQUEsU0FBQSxRQUFBLFdBQUEsWUFBQSxhQUFBLFFBQUE7SUFDQSxJQUFBLEtBQUE7SUFDQSxJQUFBLE1BQUEsVUFBQTs7SUFFQSxHQUFBLE9BQUEsU0FBQSxJQUFBLFNBQUE7SUFDQSxHQUFBLE9BQUEsU0FBQSxJQUFBLFNBQUE7SUFDQSxHQUFBLFFBQUEsWUFBQSxLQUFBO0lBQ0EsR0FBQSxZQUFBLFlBQUEsS0FBQSxRQUFBLEdBQUE7O0lBRUEsR0FBQSxjQUFBO0lBQ0EsR0FBQSxjQUFBOztJQUVBOztJQUVBLFNBQUEsUUFBQTtNQUNBLElBQUEsU0FBQTtRQUNBLFlBQUEsR0FBQTtRQUNBLE1BQUEsR0FBQTs7O01BR0EsVUFBQSxPQUFBOztNQUVBO1NBQ0EsTUFBQTtTQUNBO1NBQ0EsS0FBQSxTQUFBLElBQUE7VUFDQSxHQUFBLE1BQUEsUUFBQSxTQUFBLE1BQUE7WUFDQSxLQUFBLGNBQUEsWUFBQSxLQUFBLGdCQUFBLEtBQUE7OztVQUdBLEdBQUEsUUFBQSxHQUFBO1VBQ0EsR0FBQSxjQUFBLEdBQUE7O1VBRUEsSUFBQSxNQUFBLEdBQUEsY0FBQSxHQUFBO1VBQ0EsR0FBQSxhQUFBLEdBQUEsY0FBQSxHQUFBLFNBQUEsSUFBQSxPQUFBLEtBQUEsTUFBQSxPQUFBOztTQUVBLE1BQUEsU0FBQSxLQUFBO1VBQ0EsT0FBQSxNQUFBLElBQUEsT0FBQTs7Ozs7SUFLQSxTQUFBLFlBQUEsTUFBQTtNQUNBLEdBQUEsT0FBQTtNQUNBLEdBQUEsT0FBQTs7TUFFQTs7OztJQUlBLFNBQUEsWUFBQSxNQUFBO01BQ0EsR0FBQSxPQUFBOztNQUVBOzs7Ozs7Ozs7QUMvaUJBO0dBQ0EsT0FBQSxvQkFBQSxDQUFBOztHQUVBLFFBQUEsNEJBQUEsU0FBQSxXQUFBO0lBQ0EsT0FBQSxVQUFBLFlBQUEsU0FBQSxZQUFBLElBQUE7TUFDQSxPQUFBO1FBQ0EsU0FBQTs7Ozs7R0FLQSxRQUFBLDJCQUFBLFNBQUEsV0FBQTtJQUNBLE9BQUEsVUFBQSxZQUFBLFNBQUE7TUFDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyDlupTnlKjlhaXlj6Ncbi8vIE1vZHVsZTogZ3VsdVxuLy8gRGVwZW5kZW5jaWVzOlxuLy8gICAgbmdSb3V0ZSwgaHR0cEludGVyY2VwdG9ycywgZ3VsdS5taXNzaW5nXG5cbi8qIGdsb2JhbCBmYWxsYmFja0hhc2ggKi9cbmFuZ3VsYXJcbiAgLm1vZHVsZSgnZ3VsdScsIFtcbiAgICAndWkucm91dGVyJyxcbiAgICAnbmdMb2NhbGUnLFxuICAgICd0b2FzdHInLFxuICAgICd1aS5ib290c3RyYXAnLFxuICAgICdjdXN0b20uZGlyZWN0aXZlcycsXG4gICAgJ2h0dHBJbnRlcmNlcHRvcnMnLFxuICAgICdMb2NhbFN0b3JhZ2VNb2R1bGUnLFxuICAgICdjaGllZmZhbmN5cGFudHMubG9hZGluZ0JhcicsXG4gICAgJ3V0aWwuZmlsdGVycycsXG4gICAgJ3V0aWwuZGF0ZScsXG4gICAgJ3V0aWwuZmlsZXInLFxuICAgICd1dGlsLnVwbG9hZGVyJyxcbiAgICAndXRpbC5rZXltZ3InLFxuICAgICdndWx1LmluZGVudCcsXG4gICAgJ2d1bHUucmVwb3J0JyxcbiAgICAnZ3VsdS5sb2dpbicsXG4gICAgJ2d1bHUubWlzc2luZydcbiAgXSlcbiAgLmNvbmZpZyhmdW5jdGlvbigkbG9jYXRpb25Qcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyLCAkbG9nUHJvdmlkZXIsIGxvY2FsU3RvcmFnZVNlcnZpY2VQcm92aWRlcikge1xuICAgIC8vIG5vdCB1c2UgaHRtbDUgaGlzdG9yeSBhcGlcbiAgICAvLyBidXQgdXNlIGhhc2hiYW5nXG4gICAgJGxvY2F0aW9uUHJvdmlkZXJcbiAgICAgIC5odG1sNU1vZGUoZmFsc2UpXG4gICAgICAuaGFzaFByZWZpeCgnIScpO1xuXG4gICAgLy8gZGVmaW5lIDQwNFxuICAgICR1cmxSb3V0ZXJQcm92aWRlclxuICAgICAgLm90aGVyd2lzZSgnL2xvZ2luJyk7XG5cbiAgICAvLyBsb2dnZXJcbiAgICAkbG9nUHJvdmlkZXIuZGVidWdFbmFibGVkKHRydWUpO1xuXG4gICAgLy8gbG9jYWxTdG9yYWdlIHByZWZpeFxuICAgIGxvY2FsU3RvcmFnZVNlcnZpY2VQcm92aWRlclxuICAgICAgLnNldFByZWZpeCgnZ3VsdS50ZXN0ZXInKVxuICAgICAgLnNldE5vdGlmeSh0cnVlLCB0cnVlKTtcblxuICAgIC8vIEFQSSBTZXJ2ZXJcbiAgICBBUElfU0VSVkVSUyA9IHtcbiAgICAgIHRlc3RlcjogJ2h0dHA6Ly90LmlmZGl1LmNvbSdcbiAgICAgIC8vIHRlc3RlcjogJ2h0dHA6Ly9ndWx1YWJjLmNvbSdcbiAgICAgIC8vIHRlc3RlcjogJ2h0dHA6Ly9vLmRwOjMwMDAnXG4gICAgfVxuXG4gICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50KS5vbignZGV2aWNlcmVhZHknLCBmdW5jdGlvbigpIHtcbiAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudCkub24oJ2JhY2tidXR0b24nLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSlcbiAgLnJ1bihmdW5jdGlvbigkcm9vdFNjb3BlLCAkbG9jYXRpb24sICRzdGF0ZSwgJHN0YXRlUGFyYW1zKSB7XG4gICAgdmFyIHJlZyA9IC9bXFwmXFw/XV89XFxkKy87XG5cbiAgICAkcm9vdFNjb3BlLiRzdGF0ZSA9ICRzdGF0ZTtcbiAgICAkcm9vdFNjb3BlLiRzdGF0ZVBhcmFtcyA9ICRzdGF0ZVBhcmFtcztcbiAgICAkcm9vdFNjb3BlLmlzQ29sbGFwc2VkID0gdHJ1ZTtcblxuICAgIC8vIOeUqOS6jui/lOWbnuS4iuWxgumhtemdolxuICAgICRyb290U2NvcGVcbiAgICAgIC4kd2F0Y2goZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAkbG9jYXRpb24udXJsKCk7XG4gICAgICB9LCBmdW5jdGlvbihjdXJyZW50LCBvbGQpIHtcbiAgICAgICAgaWYgKGN1cnJlbnQucmVwbGFjZShyZWcsICcnKSA9PT0gb2xkLnJlcGxhY2UocmVnLCAnJykpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAkcm9vdFNjb3BlLmJhY2tVcmwgPSBvbGQ7XG4gICAgICB9KTtcblxuICAgICRyb290U2NvcGUuYmFjayA9IGZ1bmN0aW9uKCkge1xuICAgICAgJGxvY2F0aW9uLnVybCgkcm9vdFNjb3BlLmJhY2tVcmwpO1xuICAgIH1cbiAgfSk7XG5cbiIsImFuZ3VsYXJcbiAgLm1vZHVsZSgnZ3VsdS5sb2dpbicsIFtcbiAgICAndWkucm91dGVyJyxcbiAgICAndXRpbC5vYXV0aCcsXG4gICAgJ2d1bHUubG9naW4uc3ZjcydcbiAgXSlcblxuICAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXJcbiAgICAgIC5zdGF0ZSgnbG9naW4nLCB7XG4gICAgICAgIHVybDogJy9sb2dpbicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnbG9naW4vbG9naW4uaHRtJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0xvZ2luQ3RybCdcbiAgICAgIH0pO1xuICB9KTtcbiIsImFuZ3VsYXJcbiAgLm1vZHVsZSgnZ3VsdS5pbmRlbnQnLCBbXG4gICAgJ3VpLnJvdXRlcicsXG4gICAgJ3V0aWwudXBsb2FkZXInLFxuICAgICd1dGlsLmZpbGVyJyxcbiAgICAndXRpbC5rZXltZ3InLFxuICAgICdndWx1LmluZGVudC5zdmNzJyxcbiAgICAnZ3VsdS5pbmRlbnQuZW51bXMnXG4gIF0pXG4gIC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlclxuICAgICAgLnN0YXRlKCdpbmRlbnRzJywge1xuICAgICAgICBhYnN0cmFjdDogdHJ1ZSxcbiAgICAgICAgdXJsOiAnL2luZGVudHMnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2luZGVudC9kYXNoYm9hcmQuaHRtJyxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgIEluZGVudEVudW1zOiAnSW5kZW50RW51bXMnXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAuc3RhdGUoJ2luZGVudHMubGlzdCcsIHtcbiAgICAgICAgdXJsOiAnJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdpbmRlbnQvc2VhcmNoLmh0bScsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdJbmRlbnRMaXN0Q3RybCdcbiAgICAgIH0pXG4gICAgICAuc3RhdGUoJ2luZGVudHMudW5jb25maXJtZWQnLCB7XG4gICAgICAgIHVybDogJy91bmNvbmZpcm1lZCcsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnaW5kZW50L2xpc3RfdW5jb25maXJtZWQuaHRtJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0luZGVudExpc3RDdHJsJ1xuICAgICAgfSlcbiAgICAgIC5zdGF0ZSgnaW5kZW50cy51bnRlc3RlZCcsIHtcbiAgICAgICAgdXJsOiAnL3VudGVzdGVkJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdpbmRlbnQvbGlzdF91bnRlc3RlZC5odG0nLFxuICAgICAgICBjb250cm9sbGVyOiAnVW50ZXN0ZWRJbmRlbnRMaXN0Q3RybCdcbiAgICAgIH0pO1xuICB9KTtcbiIsImFuZ3VsYXJcbiAgLm1vZHVsZSgnZ3VsdS5yZXBvcnQnLCBbXG4gICAgJ3VpLnJvdXRlcicsXG4gICAgJ3V0aWwudm0nLFxuICAgICd1dGlsLmtleW1ncicsXG4gICAgJ2d1bHUucmVwb3J0LnN2Y3MnLFxuICAgICdndWx1LmluZGVudC5lbnVtcydcbiAgXSlcbiAgLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyXG4gICAgICAuc3RhdGUoJ2luZGVudHMuaW5wdXRfcmVwb3J0Jywge1xuICAgICAgICB1cmw6ICcve2luZGVudF9pZDpbMC05XSt9L2Nhci97Y2FyX2lkOlswLTldK30vcmVwb3J0JyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdyZXBvcnQvaW5wdXRfZGFzaGJvYXJkLmh0bScsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdJbnB1dERhc2hib2FyZEN0cmwnXG4gICAgICB9KVxuICAgICAgLnN0YXRlKCdpbmRlbnRzLmlucHV0X3JlcG9ydC5waG90bycsIHtcbiAgICAgICAgdXJsOiAnL3Bob3RvJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdyZXBvcnQvaW5wdXRfcGhvdG8uaHRtJyxcbiAgICAgICAgY29udHJvbGxlcjogJ1Bob3RvUmVwb3J0RWRpdEN0cmwnXG4gICAgICB9KVxuICAgICAgLnN0YXRlKCdpbmRlbnRzLmlucHV0X3JlcG9ydC5wYXJ0Jywge1xuICAgICAgICB1cmw6ICcve3BhcnRfaWQ6WzAtOWEtekEtWl0rfScsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAncmVwb3J0L2lucHV0Lmh0bScsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdSZXBvcnRFZGl0Q3RybCdcbiAgICAgIH0pXG4gICAgICAuc3RhdGUoJ2luZGVudHMucmVwb3J0cycsIHtcbiAgICAgICAgdXJsOiAnL3JlcG9ydHMnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ3JlcG9ydC9saXN0Lmh0bScsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdSZXBvcnRMaXN0Q3RybCdcbiAgICAgIH0pO1xuICB9KTtcbiIsIi8vIDQwNCDpobXpnaJcbi8vIE1vZHVsZTogZ3VsdS5taXNzaW5nXG4vLyBEZXBlbmRlbmNpZXM6IG5nUm91dGVcblxuYW5ndWxhclxuICAubW9kdWxlKCdndWx1Lm1pc3NpbmcnLCBbJ3VpLnJvdXRlciddKVxuXG4gIC8vIOmFjee9riByb3V0ZVxuICAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyXG4gICAgICAuc3RhdGUoJ21pc3NpbmcnLCB7XG4gICAgICAgIHVybDogJy9taXNzaW5nJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICc0MDQvNDA0Lmh0bScsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdNaXNzaW5nQ3RybCdcbiAgICAgIH0pO1xuICB9KVxuXG4gIC8vIDQwNCBjb250cm9sbGVyXG4gIC5jb250cm9sbGVyKCdNaXNzaW5nQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUpIHtcbiAgICBjb25zb2xlLmxvZygnSWBtIGhlcmUnKTtcbiAgICAvLyBUT0RPOlxuICAgIC8vIDEuIHNob3cgbGFzdCBwYXRoIGFuZCBwYWdlIG5hbWVcbiAgfSk7XG4iLCJhbmd1bGFyXG4gIC5tb2R1bGUoJ2d1bHUubG9naW4nKVxuICBcbiAgLmNvbnRyb2xsZXIoJ0xvZ2luQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsICRxLCAkbG9jYXRpb24sICR0aW1lb3V0LCB0b2FzdHIsIExvZ2luU3ZjLCBPQXV0aCkge1xuICAgIHZhciB2bSA9ICRzY29wZTtcblxuICAgIHZtLmxvZ2luID0gbG9naW47XG5cbiAgICBmdW5jdGlvbiBsb2dpbigpIHtcbiAgICAgIHJldHVybiBMb2dpblN2Y1xuICAgICAgICAuc2F2ZShhbmd1bGFyLmV4dGVuZChPQXV0aC5jb25mKCksIHtcbiAgICAgICAgICB1c2VybmFtZTogdm0uam9iX25vLFxuICAgICAgICAgIHBhc3N3b3JkOiB2bS5wYXNzd29yZFxuICAgICAgICB9KSlcbiAgICAgICAgLiRwcm9taXNlXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIE9BdXRoLmxvY2FsKHJlcy50b0pTT04oKSk7XG5cbiAgICAgICAgICB0b2FzdHIuc3VjY2VzcyhyZXMubXNnIHx8ICfnmbvlvZXmiJDlip/vvIzmraPlnKjkuLrkvaDot7PovawuLi4nKTtcblxuICAgICAgICAgIHZhciBxcyA9ICRsb2NhdGlvbi5zZWFyY2goKTtcbiAgICAgICAgICAkbG9jYXRpb24udXJsKHFzLnJlZGlyZWN0IHx8ICcvaW5kZW50cycpO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgdG9hc3RyLmVycm9yKHJlcy5tc2cgfHwgJ+eZu+W9leWksei0pe+8jOivt+mHjeivlScpO1xuICAgICAgICB9KTtcbiAgICB9XG4gIH0pOyIsImFuZ3VsYXJcbiAgLm1vZHVsZSgnZ3VsdS5sb2dpbi5zdmNzJywgWyduZ1Jlc291cmNlJ10pXG4gIC5zZXJ2aWNlKCdMb2dpblN2YycsIGZ1bmN0aW9uICgkcmVzb3VyY2UpIHtcbiAgICByZXR1cm4gJHJlc291cmNlKEFQSV9TRVJWRVJTLnRlc3RlciArICcvb2F1dGgyL3Rva2VuJywgbnVsbCwge1xuICAgICAgc2F2ZToge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDtjaGFyc2V0PXV0Zi04J1xuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgdHJhbnNmb3JtUmVxdWVzdDogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIHZhciBzdHIgPSBbXTtcbiAgICAgICAgICBcbiAgICAgICAgICBhbmd1bGFyLmZvckVhY2goZGF0YSwgZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgICAgICAgICAgdGhpcy5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChrZXkpICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKSk7XG4gICAgICAgICAgfSwgc3RyKTtcblxuICAgICAgICAgIHJldHVybiBzdHIuam9pbignJicpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH0pIiwiYW5ndWxhclxuICAubW9kdWxlKCdndWx1LmluZGVudC5lbnVtcycsIFsndXRpbC5lbnVtcycsIF0pXG5cbi5mYWN0b3J5KCdJbmRlbnRFbnVtcycsIGZ1bmN0aW9uKEVudW1zLCBJbmRlbnRFbnVtc1N2YywgdG9hc3RyKSB7XG4gIHJldHVybiBJbmRlbnRFbnVtc1N2Y1xuICAgICAgLmdldCgpXG4gICAgICAuJHByb21pc2VcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICB2YXIgYWxsX3ByZWlucyA9ICdvcmRlcl90eXBlIG9yZGVyX3N0YXR1cyBjaXR5IGluc3BlY3RvciB1c2VyX3R5cGUgb3JkZXJfdGhyb3VnaCcuc3BsaXQoJyAnKTtcblxuICAgICAgICBhbGxfcHJlaW5zLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgcmVzW2tleV0udW5zaGlmdCh7XG4gICAgICAgICAgICB0ZXh0OiAn5YWo6YOoJyxcbiAgICAgICAgICAgIHZhbHVlOiBudWxsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJlc1snc2l6ZSddID0gW3tcbiAgICAgICAgICB0ZXh0OiAxMCxcbiAgICAgICAgICB2YWx1ZTogMTBcbiAgICAgICAgfSwge1xuICAgICAgICAgIHRleHQ6IDE1LFxuICAgICAgICAgIHZhbHVlOiAxNVxuICAgICAgICB9LCB7XG4gICAgICAgICAgdGV4dDogMjAsXG4gICAgICAgICAgdmFsdWU6IDIwXG4gICAgICAgIH0sIHtcbiAgICAgICAgICB0ZXh0OiA1MCxcbiAgICAgICAgICB2YWx1ZTogNTBcbiAgICAgICAgfSwge1xuICAgICAgICAgIHRleHQ6IDEwMCxcbiAgICAgICAgICB2YWx1ZTogMTAwXG4gICAgICAgIH1dO1xuXG4gICAgICAgIHJldHVybiBFbnVtcyhyZXMudG9KU09OKCkpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgdG9hc3RyLmVycm9yKHJlcy5tc2cgfHwgJ+iOt+WPluaemuS4vuWksei0pScpO1xuICAgICAgfSk7XG59KTtcbiIsImFuZ3VsYXJcbiAgLm1vZHVsZSgnZ3VsdS5pbmRlbnQuc3ZjcycsIFsnbmdSZXNvdXJjZSddKVxuXG4gIC5zZXJ2aWNlKCdJbmRlbnRFbnVtc1N2YycsIGZ1bmN0aW9uKCRyZXNvdXJjZSkge1xuICAgIHJldHVybiAkcmVzb3VyY2UoQVBJX1NFUlZFUlMudGVzdGVyICsgJy9wYXJhbWV0ZXJzJyk7XG4gIH0pXG4gIFxuICAuc2VydmljZSgnSW5kZW50c1N2YycsIGZ1bmN0aW9uKCRyZXNvdXJjZSkge1xuICAgIHJldHVybiAkcmVzb3VyY2UoQVBJX1NFUlZFUlMudGVzdGVyICsgJy9vcmRlcnMnLCB7fSwge1xuICAgICAgcXVlcnk6IHtcbiAgICAgICAgaXNBcnJheTogZmFsc2VcbiAgICAgIH1cbiAgICB9KTtcbiAgfSlcblxuICAuc2VydmljZSgnSW5kZW50U3ZjJywgZnVuY3Rpb24oJHJlc291cmNlKSB7XG4gICAgcmV0dXJuICRyZXNvdXJjZShBUElfU0VSVkVSUy50ZXN0ZXIgKyAnL29yZGVyLzppZCcsIHtcbiAgICAgIGlkOiAnQGlkJ1xuICAgIH0sIHtcbiAgICAgIHVwZGF0ZToge1xuICAgICAgICBtZXRob2Q6ICdQVVQnXG4gICAgICB9XG4gICAgfSk7XG4gIH0pXG5cbiAgLnNlcnZpY2UoJ0luZGVudEFjY2VwdFN2YycsIGZ1bmN0aW9uKCRyZXNvdXJjZSkge1xuICAgIHJldHVybiAkcmVzb3VyY2UoQVBJX1NFUlZFUlMudGVzdGVyICsgJy9vcmRlci86aWQvaW5zcGVjdG9yX2FjY2VwdGVkJywge1xuICAgICAgaWQ6ICdAaWQnXG4gICAgfSwge1xuICAgICAgdXBkYXRlOiB7XG4gICAgICAgIG1ldGhvZDogJ1BVVCdcbiAgICAgIH1cbiAgICB9KTtcbiAgfSlcblxuICAuc2VydmljZSgnSW5kZW50UmV2b2tlUmVxdWVzdFN2YycsIGZ1bmN0aW9uKCRyZXNvdXJjZSkge1xuICAgIHJldHVybiAkcmVzb3VyY2UoQVBJX1NFUlZFUlMudGVzdGVyICsgJy9vcmRlci86aWQvcmV2b2tlX3JlcXVlc3RlZCcsIHtcbiAgICAgIGlkOiAnQGlkJ1xuICAgIH0sIHtcbiAgICAgIHVwZGF0ZToge1xuICAgICAgICBtZXRob2Q6ICdQVVQnXG4gICAgICB9XG4gICAgfSk7XG4gIH0pXG5cbiAgLnNlcnZpY2UoJ1Rlc3RlcnNTdmMnLCBmdW5jdGlvbigkcmVzb3VyY2UpIHtcbiAgICByZXR1cm4gJHJlc291cmNlKEFQSV9TRVJWRVJTLnRlc3RlciArICcvdGVzdGVycycsIHt9LCB7XG4gICAgICBxdWVyeToge1xuICAgICAgICBpc0FycmF5OiBmYWxzZVxuICAgICAgfVxuICAgIH0pO1xuICB9KVxuXG4gIC5zZXJ2aWNlKCdVbnRlc3RlZEluZGVudHNTdmMnLCBmdW5jdGlvbigkcmVzb3VyY2UpIHtcbiAgICByZXR1cm4gJHJlc291cmNlKEFQSV9TRVJWRVJTLnRlc3RlciArICcvb3JkZXJzL2luc3BlY3Rvcl90YXNrX3RvZGF5Jyk7XG4gIH0pXG5cbiAgLnNlcnZpY2UoJ0luZGVudEluc3BlY3RTdmMnLCBmdW5jdGlvbigkcmVzb3VyY2UpIHtcbiAgICByZXR1cm4gJHJlc291cmNlKEFQSV9TRVJWRVJTLnRlc3RlciArICcvb3JkZXIvOm9yZGVyX2lkL29uZ29pbmcnLCB7XG4gICAgICBvcmRlcl9pZDogJ0BvcmRlcl9pZCdcbiAgICB9LCB7XG4gICAgICB1cGRhdGU6IHtcbiAgICAgICAgbWV0aG9kOiAnUFVUJ1xuICAgICAgfVxuICAgIH0pO1xuICB9KVxuXG4gIC5zZXJ2aWNlKCdJbmRlbnRDYXJzU3ZjJywgZnVuY3Rpb24oJHJlc291cmNlKSB7XG4gICAgcmV0dXJuICRyZXNvdXJjZShBUElfU0VSVkVSUy50ZXN0ZXIgKyAnL29yZGVyLzpvcmRlcl9pZC9jYXInLCB7XG4gICAgICBvcmRlcl9pZDogJ0BvcmRlcl9pZCdcbiAgICB9KVxuICB9KVxuXG4gIC5zZXJ2aWNlKCdJbmRlbnRDYXJTdmMnLCBmdW5jdGlvbigkcmVzb3VyY2UpIHtcbiAgICByZXR1cm4gJHJlc291cmNlKEFQSV9TRVJWRVJTLnRlc3RlciArICcvb3JkZXIvOm9yZGVyX2lkL2Nhci86Y2FyX2lkJywge1xuICAgICAgb3JkZXJfaWQ6ICdAb3JkZXJfaWQnLFxuICAgICAgY2FyX2lkOiAnQGNhcl9pZCdcbiAgICB9LCB7XG4gICAgICB1cGRhdGU6IHtcbiAgICAgICAgbWV0aG9kOiAnUFVUJ1xuICAgICAgfVxuICAgIH0pO1xuICB9KTsiLCIvKiBnbG9iYWwgYW5ndWxhciwgY29uZmlybSwgXyAqL1xuYW5ndWxhclxuICAubW9kdWxlKCdndWx1LmluZGVudCcpXG4gIFxuICAvLyDlhajpg6jorqLljZXliJfooahcbiAgLmNvbnRyb2xsZXIoJ0luZGVudExpc3RDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkbG9jYXRpb24sIHRvYXN0ciwgJG1vZGFsLFxuICAgIEluZGVudHNTdmMsIEluZGVudFN2YywgSW5kZW50QWNjZXB0U3ZjLCBJbmRlbnRFbnVtcykge1xuICAgIHZhciB2bSA9ICRzY29wZTtcbiAgICB2YXIgcXNvID0gJGxvY2F0aW9uLnNlYXJjaCgpO1xuXG4gICAgdm0uc3RhdHVzX2lkID0gcGFyc2VJbnQocXNvLnN0YXR1c19pZCkgfHwgbnVsbDtcbiAgICBcbiAgICBpZiAodm0uJHN0YXRlLmluY2x1ZGVzKCdpbmRlbnRzLnVuY29uZmlybWVkJykpIHtcbiAgICAgIHZtLnN0YXR1c19pZCA9IDM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZtLmNpdHlfaWQgPSBwYXJzZUludChxc28uY2l0eV9pZCkgfHwgbnVsbDtcbiAgICAgIHZtLmluc3BlY3Rvcl9pZCA9IHBhcnNlSW50KHFzby5pbnNwZWN0b3JfaWQpIHx8IG51bGw7XG4gICAgICAvLyB2bS5yb2xlX2lkID0gcGFyc2VJbnQocXNvLnJvbGVfaWQpIHx8IG51bGw7XG4gICAgICB2bS5yZXF1ZXN0ZXJfbW9iaWxlID0gcXNvLnJlcXVlc3Rlcl9tb2JpbGUgfHwgbnVsbDtcblxuICAgICAgdm0uc3RhdHVzID0gSW5kZW50RW51bXMuaXRlbSgnb3JkZXJfc3RhdHVzJywgdm0uc3RhdHVzX2lkKTtcbiAgICAgIHZtLnN0YXR1c19saXN0ID0gSW5kZW50RW51bXMubGlzdCgnb3JkZXJfc3RhdHVzJyk7XG4gICAgICB2bS5jaXR5ID0gSW5kZW50RW51bXMuaXRlbSgnY2l0eScsIHZtLmNpdHlfaWQpO1xuICAgICAgdm0uY2l0eV9saXN0ID0gSW5kZW50RW51bXMubGlzdCgnY2l0eScpO1xuICAgICAgLy8gdm0ucm9sZSA9IEluZGVudEVudW1zLml0ZW0oJ3JvbGUnLCB2bS5yb2xlX2lkKTtcbiAgICAgIC8vIHZtLnJvbGVfbGlzdCA9IEluZGVudEVudW1zLmxpc3QoJ3JvbGUnKTtcbiAgICAgIHZtLmluc3BlY3RvciA9IEluZGVudEVudW1zLml0ZW0oJ2luc3BlY3RvcicsIHZtLmluc3BlY3Rvcl9pZCk7XG4gICAgICB2bS5pbnNwZWN0b3JfbGlzdCA9IEluZGVudEVudW1zLmxpc3QoJ2luc3BlY3RvcicpO1xuXG4gICAgICB3YXRjaF9saXN0KCdzdGF0dXMnLCAnc3RhdHVzX2lkJyk7XG4gICAgICB3YXRjaF9saXN0KCdjaXR5JywgJ2NpdHlfaWQnKTtcbiAgICAgIC8vIHdhdGNoX2xpc3QoJ3JvbGUnLCAncm9sZV9pZCcpO1xuICAgICAgd2F0Y2hfbGlzdCgnaW5zcGVjdG9yJywgJ2luc3BlY3Rvcl9pZCcpO1xuXG4gICAgICB2bS5zZWFyY2ggPSBzZWFyY2g7XG4gICAgfVxuXG4gICAgdm0ucGFnZSA9IHBhcnNlSW50KHFzby5wYWdlKSB8fCAxO1xuICAgIHZtLnNpemUgPSBwYXJzZUludChxc28uc2l6ZSkgfHwgMjA7XG4gICAgdm0uc2l6ZXMgPSBJbmRlbnRFbnVtcy5saXN0KCdzaXplJyk7XG4gICAgdm0uc2l6ZV9pdGVtID0gSW5kZW50RW51bXMuaXRlbSgnc2l6ZScsIHZtLnNpemUpO1xuXG4gICAgdm0uc2l6ZV9jaGFuZ2UgPSBzaXplX2NoYW5nZTtcbiAgICB2bS5wYWdlX2NoYW5nZSA9IHBhZ2VfY2hhbmdlO1xuICAgIHZtLmNhbmNlbF9vcmRlciA9IGNhbmNlbF9vcmRlcjtcbiAgICB2bS5jb25maXJtX29yZGVyID0gY29uZmlybV9vcmRlcjtcbiAgICB2bS5zdGFydF90ZXN0ID0gc3RhcnRfdGVzdDtcblxuICAgIHF1ZXJ5KCk7XG5cbiAgICBmdW5jdGlvbiBxdWVyeSgpIHtcbiAgICAgIHZhciBwYXJhbXMgPSB7XG4gICAgICAgIGNpdHlfaWQ6IHZtLmNpdHlfaWQsXG4gICAgICAgIGl0ZW1zX3BhZ2U6IHZtLnNpemUsXG4gICAgICAgIHBhZ2U6IHZtLnBhZ2UsXG5cbiAgICAgICAgc3RhdHVzX2lkOiB2bS5zdGF0dXNfaWRcbiAgICAgIH07XG5cbiAgICAgIGlmICh2bS4kc3RhdGUuaW5jbHVkZXMoJ2luZGVudHMubGlzdCcpKSB7XG4gICAgICAgIGFuZ3VsYXIuZXh0ZW5kKHBhcmFtcywge1xuICAgICAgICAgIGNpdHlfaWQ6IHZtLmNpdHlfaWQsXG4gICAgICAgICAgaW5zcGVjdG9yX2lkOiB2bS5pbnNwZWN0b3JfaWQsXG4gICAgICAgICAgLy8gcm9sZV9pZDogdm0ucm9sZV9pZCxcbiAgICAgICAgICByZXF1ZXN0ZXJfbW9iaWxlOiB2bS5yZXF1ZXN0ZXJfbW9iaWxlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgXG4gICAgICAkbG9jYXRpb24uc2VhcmNoKHBhcmFtcyk7XG5cbiAgICAgIEluZGVudHNTdmNcbiAgICAgICAgLnF1ZXJ5KHBhcmFtcylcbiAgICAgICAgLiRwcm9taXNlXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJzKSB7XG4gICAgICAgICAgcnMuaXRlbXMuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICBpdGVtLnN0YXR1c190ZXh0ID0gSW5kZW50RW51bXMudGV4dCgnb3JkZXJfc3RhdHVzJywgaXRlbS5zdGF0dXNfaWQpO1xuICAgICAgICAgICAgaXRlbS5vcmRlcl90aHJvdWdoX3RleHQgPSBJbmRlbnRFbnVtcy50ZXh0KCdvcmRlcl90aHJvdWdoJywgaXRlbS5vcmRlcl90aHJvdWdoKVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgdm0uaXRlbXMgPSBycy5pdGVtcztcbiAgICAgICAgICB2bS50b3RhbF9jb3VudCA9IHJzLnRvdGFsX2NvdW50O1xuXG4gICAgICAgICAgdmFyIHRtcCA9IHJzLnRvdGFsX2NvdW50IC8gdm0uc2l6ZTtcbiAgICAgICAgICB2bS5wYWdlX2NvdW50ID0gcnMudG90YWxfY291bnQgJSB2bS5zaXplID09PSAwID8gdG1wIDogKE1hdGguZmxvb3IodG1wKSArIDEpO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgdG9hc3RyLmVycm9yKHJlcy5kYXRhLm1zZyB8fCAn5p+l6K+i5aSx6LSl77yM5pyN5Yqh5Zmo5Y+R55Sf5pyq55+l6ZSZ6K+v77yM6K+36YeN6K+VJyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHdhdGNoX2xpc3QobmFtZSwgZmllbGQpIHtcbiAgICAgIHZtLiR3YXRjaChuYW1lLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIGlmICghaXRlbSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZtW2ZpZWxkXSA9IGl0ZW0udmFsdWU7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyDnoa7orqTorqLljZVcbiAgICBmdW5jdGlvbiBjb25maXJtX29yZGVyKGl0ZW0pIHtcbiAgICAgIGlmIChjb25maXJtKCfnoa7orqTmjqXlj5for6XorqLljZU/JykpIHtcbiAgICAgICAgSW5kZW50QWNjZXB0U3ZjXG4gICAgICAgICAgLnVwZGF0ZSh7XG4gICAgICAgICAgICBpZDogaXRlbS5pZFxuICAgICAgICAgIH0pXG4gICAgICAgICAgLiRwcm9taXNlXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICB0b2FzdHIuc3VjY2VzcyhyZXMubXNnIHx8ICfnoa7orqTorqLljZXmiJDlip8nKTtcblxuICAgICAgICAgICAgcXVlcnkoKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5jYXRjaChmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgIHRvYXN0ci5lcnJvcihyZXMubXNnIHx8ICfnoa7orqTorqLljZXlpLHotKXvvIzor7fph43or5UnKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDlj5bmtojorqLljZVcbiAgICBmdW5jdGlvbiBjYW5jZWxfb3JkZXIoaXRlbSkge1xuICAgICAgdmFyIGNhbmNlbF9vcmRlcl9pbnMgPSAkbW9kYWwub3Blbih7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnaW5kZW50L2NhbmNlbF9vcmRlci5odG0nLFxuICAgICAgICBjb250cm9sbGVyOiAnQ2FuY2VsT3JkZXJDdHJsJyxcbiAgICAgICAgYmFja2Ryb3A6ICdzdGF0aWMnLFxuICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgaW5kZW50X2luZm86IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgY2FuY2VsX29yZGVyX2lucy5yZXN1bHQudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gVE9ETzpcbiAgICAgICAgLy8g5pu05paw6aKE57qm5Y2V54q25oCBXG4gICAgICAgIHF1ZXJ5KCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyDlvIDlp4vmo4DmtYtcbiAgICBmdW5jdGlvbiBzdGFydF90ZXN0KCkge1xuICAgICAgJGxvY2F0aW9uLnVybCgnL2luZGVudHMvdW50ZXN0ZWQnKTtcbiAgICB9XG5cbiAgICAvLyDmr4/pobXmnaHmlbDmlLnlj5hcbiAgICBmdW5jdGlvbiBzaXplX2NoYW5nZShzaXplKSB7XG4gICAgICB2bS5zaXplID0gc2l6ZTtcbiAgICAgIHZtLnBhZ2UgPSAxO1xuXG4gICAgICBxdWVyeSgpO1xuICAgIH1cblxuICAgIC8vIOe/u+mhtVxuICAgIGZ1bmN0aW9uIHBhZ2VfY2hhbmdlKHBhZ2UpIHtcbiAgICAgIHZtLnBhZ2UgPSBwYWdlO1xuXG4gICAgICBxdWVyeSgpO1xuICAgIH1cblxuICAgIC8vIOafpeivouaPkOS6pFxuICAgIGZ1bmN0aW9uIHNlYXJjaCgpIHtcbiAgICAgIHZtLnBhZ2UgPSAxO1xuXG4gICAgICBxdWVyeSgpO1xuICAgIH1cbiAgfSlcbiAgXG4gIC8vIOW9k+WkqeS7u+WKoVxuICAuY29udHJvbGxlcignVW50ZXN0ZWRJbmRlbnRMaXN0Q3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJGxvZywgJGxvY2F0aW9uLCAkbW9kYWwsICR0ZW1wbGF0ZUNhY2hlLCB0b2FzdHIsXG4gICAgRmlsZXIsIFVwbG9hZGVyLCBLZXlNZ3IsIGxvY2FsU3RvcmFnZVNlcnZpY2UsIFVudGVzdGVkSW5kZW50c1N2YywgSW5kZW50RW51bXMsIEluZGVudEluc3BlY3RTdmMsXG4gICAgSW5kZW50Q2FyU3ZjLCBSZXBvcnRTdmMpIHtcbiAgICB2YXIgdm0gPSAkc2NvcGU7XG4gICAgdmFyIHBhcnRzID0gSlNPTi5wYXJzZSgkdGVtcGxhdGVDYWNoZS5nZXQoJ3JlcG9ydC9pLmpzb24nKSk7XG5cbiAgICBpZiAocGFydHMgJiYgcGFydHMubGVuZ3RoKSB7XG4gICAgICB2bS5maXJzdF9wYXJ0X2lkID0gcGFydHNbMF0uaWQ7XG4gICAgfVxuXG4gICAgdm0uY2FuY2VsX29yZGVyID0gY2FuY2VsX29yZGVyO1xuICAgIHZtLmRlbF9jYXIgPSBkZWxfY2FyO1xuICAgIHZtLmVkaXRfY2FyID0gZWRpdF9jYXI7XG4gICAgdm0udXBsb2FkX3JlcG9ydCA9IHVwbG9hZF9yZXBvcnQ7XG4gICAgdm0uY2xlYXJfbG9jYWwgPSBjbGVhcl9sb2NhbDtcbiAgICB2bS5pbnNwZWN0ID0gaW5zcGVjdDtcblxuICAgIHF1ZXJ5KCk7XG5cbiAgICBmdW5jdGlvbiBxdWVyeSgpIHtcbiAgICAgIHJldHVybiBVbnRlc3RlZEluZGVudHNTdmNcbiAgICAgICAgLnF1ZXJ5KClcbiAgICAgICAgLiRwcm9taXNlXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIHJlcy5mb3JFYWNoKGZ1bmN0aW9uKG9yZGVyKSB7XG4gICAgICAgICAgICBvcmRlci5vcmRlcl90aHJvdWdoX3RleHQgPSBJbmRlbnRFbnVtcy50ZXh0KCdvcmRlcl90aHJvdWdoJywgb3JkZXIub3JkZXJfdGhyb3VnaCk7XG5cbiAgICAgICAgICAgIG9yZGVyLmF1dG8uZm9yRWFjaChmdW5jdGlvbihjYXIpIHtcbiAgICAgICAgICAgICAgdmFyIHJlcG9ydF9zdGF0dXNfa2V5ID0gS2V5TWdyLnN0YXR1cyhvcmRlci5pZCwgY2FyLmlkKTtcbiAgICAgICAgICAgICAgY2FyLnJlcG9ydF9zdGF0dXMgPSBsb2NhbFN0b3JhZ2VTZXJ2aWNlLmdldChyZXBvcnRfc3RhdHVzX2tleSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHZtLml0ZW1zID0gcmVzO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgdG9hc3RyLmVycm9yKHJlcy5tc2cgfHwgJ+iOt+WPluW+heajgOa1i+iuouWNleWksei0pScpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyDliqDovaYg5oiWIOe8lui+kei9plxuICAgIGZ1bmN0aW9uIGVkaXRfY2FyKGlkLCBjYXIpIHtcbiAgICAgIHZhciBlZGl0X2Nhcl9pbnMgPSAkbW9kYWwub3Blbih7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnaW5kZW50L2VkaXRfY2FyLmh0bScsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdJbmRlbnRDYXJFZGl0Q3RybCcsXG4gICAgICAgIGJhY2tkcm9wOiAnc3RhdGljJyxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgIEluZGVudEVudW1zOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBJbmRlbnRFbnVtcztcbiAgICAgICAgICB9LFxuICAgICAgICAgIGluZGVudF9pbmZvOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGlkOiBpZCxcbiAgICAgICAgICAgICAgY2FyOiBjYXJcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgZWRpdF9jYXJfaW5zLnJlc3VsdC50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICBxdWVyeSgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8g5Yig6Zmk6L2mXG4gICAgZnVuY3Rpb24gZGVsX2NhcihvcmRlcl9pZCwgY2FyKSB7XG4gICAgICBpZiAoY29uZmlybSgn56Gu6K6k5Yig6ZmkIFwiJyArIFtjYXIuYnJhbmQsIGNhci5zZXJpZXMsIGNhci5tb2RlbF0uam9pbignLScpICsgJ1wiJykpIHtcbiAgICAgICAgcmV0dXJuIEluZGVudENhclN2Y1xuICAgICAgICAgIC5yZW1vdmUoe1xuICAgICAgICAgICAgb3JkZXJfaWQ6IG9yZGVyX2lkLFxuICAgICAgICAgICAgY2FyX2lkOiBjYXIuaWRcbiAgICAgICAgICB9KVxuICAgICAgICAgIC4kcHJvbWlzZVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgS2V5TWdyLmNsZWFyKG9yZGVyX2lkLCBjYXIuaWQpO1xuXG4gICAgICAgICAgICB0b2FzdHIuc3VjY2VzcyhyZXMubXNnIHx8ICfliKDpmaTovabmiJDlip8nKTtcblxuICAgICAgICAgICAgcXVlcnkoKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5jYXRjaChmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgIHRvYXN0ci5lcnJvcihyZXMubXNnIHx8ICfliKDpmaTovablpLHotKXvvIzor7fph43or5UnKTtcbiAgICAgICAgICB9KTsgIFxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIOa4hemZpGxvY2FsXG4gICAgZnVuY3Rpb24gY2xlYXJfbG9jYWwob3JkZXJfaWQsIGNhcikge1xuICAgICAgS2V5TWdyLmNsZWFyKG9yZGVyX2lkLCBjYXIuaWQpO1xuICAgICAgdG9hc3RyLnN1Y2Nlc3MoJ+a4heeQhuacrOWcsOaVsOaNruWujOaIkCcpO1xuICAgIH1cblxuICAgIC8vIOWPlua2iOiuouWNlVxuICAgIGZ1bmN0aW9uIGNhbmNlbF9vcmRlcihpdGVtKSB7XG4gICAgICB2YXIgY2FuY2VsX29yZGVyX2lucyA9ICRtb2RhbC5vcGVuKHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdpbmRlbnQvY2FuY2VsX29yZGVyLmh0bScsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdDYW5jZWxPcmRlckN0cmwnLFxuICAgICAgICBiYWNrZHJvcDogJ3N0YXRpYycsXG4gICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICBpbmRlbnRfaW5mbzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBjYW5jZWxfb3JkZXJfaW5zLnJlc3VsdC50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyDliKDpmaTmiYDmnInmnKzlnLDmiqXlkYrnm7jlhbPmlbDmja5cbiAgICAgICAgaXRlbS5hdXRvLmZvckVhY2goZnVuY3Rpb24oY2FyKSB7XG4gICAgICAgICAgS2V5TWdyLmNsZWFyKGl0ZW0uaWQsIGNhci5pZCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHF1ZXJ5KCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyDmo4DmtYtcbiAgICBmdW5jdGlvbiBpbnNwZWN0KG9yZGVyX2lkLCBjYXJfaWQpIHtcbiAgICAgIHJldHVybiBJbmRlbnRJbnNwZWN0U3ZjXG4gICAgICAgIC51cGRhdGUoe1xuICAgICAgICAgIG9yZGVyX2lkOiBvcmRlcl9pZFxuICAgICAgICB9KVxuICAgICAgICAuJHByb21pc2VcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgdG9hc3RyLnN1Y2Nlc3MocmVzLm1zZyB8fCAn5qOA5rWL5byA5aeLJyk7XG5cbiAgICAgICAgICAkbG9jYXRpb24udXJsKCcvaW5kZW50cy8nICsgb3JkZXJfaWQgKyAnL2Nhci8nICsgY2FyX2lkICsgJy9yZXBvcnQvJyArIHZtLmZpcnN0X3BhcnRfaWQpO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgdG9hc3RyLmVycm9yKHJlcy5tc2cgfHwgJ+iuouWNleWPlua2iOWksei0pe+8jOivt+mHjeivlScpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyDkuIrkvKDmiqXlkYpcbiAgICBmdW5jdGlvbiB1cGxvYWRfcmVwb3J0KG9yZGVyLCBjYXIpIHtcbiAgICAgIHZhciBvcmRlcl9pZCA9IG9yZGVyLmlkO1xuICAgICAgdmFyIGNhcl9pZCA9IGNhci5pZDtcblxuICAgICAgdmFyIHJlcG9ydF9rZXkgPSBLZXlNZ3IucmVwb3J0KG9yZGVyX2lkLCBjYXJfaWQpO1xuICAgICAgdmFyIHJlcG9ydF9zdWJtaXRfa2V5ID0gS2V5TWdyLnN1Ym1pdChyZXBvcnRfa2V5KTtcbiAgICAgIHZhciByZXBvcnRfZGF0YSA9IGxvY2FsU3RvcmFnZVNlcnZpY2UuZ2V0KHJlcG9ydF9rZXkpO1xuXG4gICAgICAkbG9nLmluZm8oJ+WHhuWkh+S4iuS8oOaKpeWRijogJyArIHJlcG9ydF9rZXkpO1xuICAgICAgJGxvZy5pbmZvKCfmiqXlkYrliIbnsbvmlbDmja46ICcgKyBKU09OLnN0cmluZ2lmeShyZXBvcnRfZGF0YSkpO1xuXG4gICAgICBpZiAoIXJlcG9ydF9kYXRhKSB7XG4gICAgICAgICRsb2cuaW5mbygn5oql5ZGK5pWw5o2u5Li656m677yM5LiN55So5LiK5LygJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY2FyLnJlcG9ydF9zdGF0dXMudXBsb2FkX3N0YXR1cyA9IDA7XG4gICAgICBjYXIucmVwb3J0X3N0YXR1cy51cGxvYWRpbmcgPSB0cnVlO1xuXG4gICAgICB2YXIgc3VibWl0X2RhdGEgPSB7fTtcblxuICAgICAgT2JqZWN0LmtleXMocmVwb3J0X2RhdGEpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgIGFuZ3VsYXIuZXh0ZW5kKHN1Ym1pdF9kYXRhLCByZXBvcnRfZGF0YVtrZXldKTtcbiAgICAgIH0pO1xuXG4gICAgICAkbG9nLmluZm8oJ+aKpeWRiuW+heaPkOS6pOaVsOaNrjogJyArIEpTT04uc3RyaW5naWZ5KHN1Ym1pdF9kYXRhKSk7XG5cbiAgICAgIHZhciBpbWFnZV9maWVsZHMgPSB7fTtcbiAgICAgIE9iamVjdC5rZXlzKHN1Ym1pdF9kYXRhKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgICAgICBpZiAoc3VibWl0X2RhdGFba2V5XS5pbWFnZSkge1xuICAgICAgICAgIGltYWdlX2ZpZWxkc1trZXldID0gYW5ndWxhci5leHRlbmQoe1xuICAgICAgICAgICAgdXJsOiBzdWJtaXRfZGF0YVtrZXldLmltYWdlXG4gICAgICAgICAgfSwgc3VibWl0X2RhdGFba2V5XSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICB2YXIgaW1hZ2VzID0gXy52YWx1ZXMoaW1hZ2VfZmllbGRzKTtcblxuICAgICAgLy8g5rKh5pyJ5Zu+54mH6ZyA6KaB5LiK5Lyg77yM55u05o6l5LiK5Lyg5oql5ZGK5YaF5a65XG4gICAgICBpZiAoIWltYWdlcy5sZW5ndGgpIHtcbiAgICAgICAgc3VibWl0X3JlcG9ydCgpO1xuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgJGxvZy5pbmZvKCfmiqXlkYrlm77niYfmlbDmja46ICcgKyBKU09OLnN0cmluZ2lmeShpbWFnZV9maWVsZHMpKTtcbiAgICAgICRsb2cuaW5mbygn5byA5aeL5LiK5Lyg54Wn54mH5pWw5o2uJyk7XG4gICAgICBVcGxvYWRlci5iYXRjaCh7XG4gICAgICAgIHVybDogJ2h0dHA6Ly9mLmlmZGl1LmNvbScsXG4gICAgICAgIGF0dGFjaG1lbnRzOiBpbWFnZXMsXG4gICAgICAgIGRvbmU6IHVwbG9hZF9kb25lLFxuICAgICAgICBvbmU6IHVwbG9hZF9vbmUsXG4gICAgICAgIG9ucHJvZ3Jlc3M6IG9ucHJvZ3Jlc3MsXG4gICAgICAgIGVycm9yOiB1cGxvYWRfZXJyb3JcbiAgICAgIH0pO1xuXG4gICAgICBmdW5jdGlvbiBvbnByb2dyZXNzKHByb2dyZXNzKSB7XG4gICAgICAgIC8vIDEuIHVwZGF0ZSBwcm9ncmVzcyBzdGF0dXMgdG8gcGFnZVxuICAgICAgICAkbG9nLmluZm8oJ+S4iuS8oOi/m+W6pjogJyArIHByb2dyZXNzLnBlcmNlbnQpO1xuICAgICAgICBjYXIucmVwb3J0X3N0YXR1cy51cGxvYWRfc3RhdHVzID0gcGFyc2VJbnQocHJvZ3Jlc3MucGVyY2VudCAqIDAuOCk7XG4gICAgICAgIHZtLiRhcHBseSgpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiB1cGxvYWRfb25lKGltYWdlLCBmaWxlKSB7XG4gICAgICAgIC8vIFlvdSBjYW4gZG8gc29tZXRoaW5nIG9uIGltYWdlIHdpdGggZmlsZSBvYmplY3RcbiAgICAgICAgaW1hZ2UuZmlsZV9pZCA9IGZpbGUuaWQ7XG4gICAgICAgICRsb2cuaW5mbygn5oiQ5Yqf5LiK5Lyg5Zu+54mHOiAnICsgSlNPTi5zdHJpbmdpZnkoaW1hZ2UpKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gdXBsb2FkX2Vycm9yKGltYWdlKSB7XG4gICAgICAgICRsb2cuaW5mbygn5LiK5Lyg5Zu+54mH5Ye66ZSZOiAnICsgSlNPTi5zdHJpbmdpZnkoaW1hZ2UpKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gdXBsb2FkX2RvbmUoKSB7XG4gICAgICAgIC8vIDEuIGNvbWJpbmUgaW1hZ2UgZmlsZWlkIHRvIHN1Ym1pdF9kYXRhXG4gICAgICAgIC8vIDIuIHN0b3JlIGltYWdlIGRhdGEgdG8gbG9jYWxzdG9yYWdlXG4gICAgICAgIC8vIDMuIHN1Ym1pdCByZXBvcnQgZGF0YVxuICAgICAgICAkbG9nLmluZm8oJ+aIkOWKn+S4iuS8oOaJgOacieWbvueJhycpO1xuXG4gICAgICAgIC8vIDFcbiAgICAgICAgaW1hZ2VzLmZvckVhY2goZnVuY3Rpb24oaW1hZ2UpIHtcbiAgICAgICAgICBzdWJtaXRfZGF0YVtpbWFnZS5pZF0gPSBpbWFnZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJGxvZy5pbmZvKCflm57lhpnlm77niYfmlbDmja7liLAgbG9jYWxzdG9yYWdlJyk7XG5cbiAgICAgICAgLy8gMlxuICAgICAgICBsb2NhbFN0b3JhZ2VTZXJ2aWNlLnNldChyZXBvcnRfc3VibWl0X2tleSwgc3VibWl0X2RhdGEpO1xuXG4gICAgICAgIC8vIDNcbiAgICAgICAgc3VibWl0X3JlcG9ydCgpO1xuICAgICAgfVxuXG4gICAgICAvLyAxLiBzdWJtaXQgcmVwb3J0IGRhdGFcbiAgICAgIC8vIDIuIHJlbW92ZSBpbWFnZSBmcm9tIGNhY2hlXG4gICAgICAvLyAzLiBjbGVhciByZXBvcnQgbG9jYWwgZGF0YVxuICAgICAgLy8gNC4gdXBkYXRlIG9yZGVyIHN0YXR1cyBcbiAgICAgIGZ1bmN0aW9uIHN1Ym1pdF9yZXBvcnQoKSB7XG4gICAgICAgICRsb2cuaW5mbygn5byA5aeL5LiK5Lyg5oql5ZGK5YaF5a65Jyk7XG4gICAgICAgIC8vIDFcbiAgICAgICAgcmV0dXJuIFJlcG9ydFN2Y1xuICAgICAgICAgIC5zYXZlKHtcbiAgICAgICAgICAgIG9yZGVyX2lkOiBvcmRlcl9pZCxcbiAgICAgICAgICAgIGNhcl9pZDogY2FyX2lkXG4gICAgICAgICAgfSwgc3VibWl0X2RhdGEpXG4gICAgICAgICAgLiRwcm9taXNlXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkbG9nLmluZm8oJ+S4iuS8oOaKpeWRiuWGheWuueaIkOWKnycpO1xuXG4gICAgICAgICAgICAvLyAyXG4gICAgICAgICAgICBpZiAoaW1hZ2VzLmxlbmd0aCkge1xuICAgICAgICAgICAgICBpbWFnZXMuZm9yRWFjaChmdW5jdGlvbihpbWFnZSkge1xuICAgICAgICAgICAgICAgIEZpbGVyLnJlbW92ZShpbWFnZS51cmwpO1xuICAgICAgICAgICAgICB9KTsgIFxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyAzXG4gICAgICAgICAgICBLZXlNZ3IuY2xlYXIob3JkZXJfaWQsIGNhcl9pZCk7XG5cbiAgICAgICAgICAgIC8vIDRcbiAgICAgICAgICAgIGNhci5yZXBvcnRfc3RhdHVzLnVwbG9hZF9zdGF0dXMgPSAxMDA7XG4gICAgICAgICAgICBjYXIucmVwb3J0X3N0YXR1cy51cGxvYWRlZCA9IHRydWU7XG5cbiAgICAgICAgICAgIC8vIHF1ZXJ5KCk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAkbG9nLmluZm8oJ+S4iuS8oOaKpeWRiuWGheWuueWksei0pTogJyArIEpTT04uc3RyaW5naWZ5KGFyZ3VtZW50cykpO1xuICAgICAgICAgICAgdG9hc3RyLmVycm9yKHJlcy5tc2cgfHwgJ+S4iuS8oOi/h+eoi+S4reWPkeeUn+mUmeivr++8jOivt+mHjeivlScpO1xuICAgICAgICAgICAgLy8gNFxuICAgICAgICAgICAgY2FyLnJlcG9ydF9zdGF0dXMudXBsb2FkaW5nID0gZmFsc2U7XG4gICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9KVxuICBcbiAgLy8g5Y+W5raI6K6i5Y2VXG4gIC5jb250cm9sbGVyKCdDYW5jZWxPcmRlckN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRtb2RhbEluc3RhbmNlLCB0b2FzdHIsIEluZGVudFJldm9rZVJlcXVlc3RTdmMsIGluZGVudF9pbmZvKSB7XG4gICAgdmFyIHZtID0gJHNjb3BlO1xuXG4gICAgYW5ndWxhci5leHRlbmQodm0sIGluZGVudF9pbmZvKTtcblxuICAgIHZtLmNhbmNlbF9vcmRlciA9IGNhbmNlbF9vcmRlcjtcbiAgICB2bS5jYW5jZWwgPSBjYW5jZWw7XG5cbiAgICBmdW5jdGlvbiBjYW5jZWxfb3JkZXIoKSB7XG4gICAgICB2bS5jYW5jZWxfb3JkZXJfc3RhdHVzID0gdHJ1ZTtcblxuICAgICAgSW5kZW50UmV2b2tlUmVxdWVzdFN2Y1xuICAgICAgICAudXBkYXRlKHtcbiAgICAgICAgICBpZDogaW5kZW50X2luZm8uaWRcbiAgICAgICAgfSwge1xuICAgICAgICAgIG1lbW86IHZtLnJlYXNvblxuICAgICAgICB9KVxuICAgICAgICAuJHByb21pc2VcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgdG9hc3RyLnN1Y2Nlc3MocmVzLm1zZyB8fCAn6K6i5Y2V5Y+W5raI5oiQ5YqfJyk7XG5cbiAgICAgICAgICAkbW9kYWxJbnN0YW5jZS5jbG9zZSgpO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgdm0uY2FuY2VsX29yZGVyX3N0YXR1cyA9IGZhbHNlO1xuXG4gICAgICAgICAgdG9hc3RyLmVycm9yKHJlcy5tc2cgfHwgJ+iuouWNleWPlua2iOWksei0pe+8jOivt+mHjeivlScpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjYW5jZWwoKSB7XG4gICAgICAkbW9kYWxJbnN0YW5jZS5kaXNtaXNzKCk7XG4gICAgfVxuICB9KVxuXG4gIC8vIOWKoOi9piDmiJYg57yW6L6R6L2mXG4gIC5jb250cm9sbGVyKCdJbmRlbnRDYXJFZGl0Q3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJG1vZGFsSW5zdGFuY2UsIHRvYXN0ciwgSW5kZW50Q2Fyc1N2YyxcbiAgICBJbmRlbnRDYXJTdmMsIEluZGVudEVudW1zLCBpbmRlbnRfaW5mbykge1xuICAgIHZhciB2bSA9ICRzY29wZTtcblxuICAgIHZtLmJyYW5kX2xpc3QgPSBJbmRlbnRFbnVtcy5saXN0KCdicmFuZCcpO1xuICAgIHZtLnNlcmllc19saXN0ID0gSW5kZW50RW51bXMubGlzdCgnc2VyaWVzJyk7XG4gICAgdm0ubW9kZWxfbGlzdCA9IEluZGVudEVudW1zLmxpc3QoJ21vZGVsJyk7XG5cbiAgICBpZiAoaW5kZW50X2luZm8uY2FyKSB7XG4gICAgICB2bS50aXRsZSA9ICfnvJbovpHovabkv6Hmga8nO1xuXG4gICAgICBzZWxlY3RfaXRlbSgnYnJhbmQnLCBpbmRlbnRfaW5mby5jYXIuYnJhbmQpO1xuICAgICAgc2VsZWN0X2l0ZW0oJ3NlcmllcycsIGluZGVudF9pbmZvLmNhci5zZXJpZXMpO1xuICAgICAgc2VsZWN0X2l0ZW0oJ21vZGVsJywgaW5kZW50X2luZm8uY2FyLm1vZGVsKTsgIFxuICAgIH0gZWxzZSB7XG4gICAgICB2bS50aXRsZSA9ICfliqDovaYnO1xuICAgIH1cblxuICAgIHZtLmNhbmNlbCA9IGNhbmNlbDtcbiAgICB2bS5zdWJtaXQgPSBzdWJtaXQ7XG5cbiAgICBmdW5jdGlvbiBzdWJtaXQoKSB7XG4gICAgICBpZiAoaW5kZW50X2luZm8uY2FyKSB7XG4gICAgICAgIEluZGVudENhclN2Y1xuICAgICAgICAgIC51cGRhdGUoe1xuICAgICAgICAgICAgb3JkZXJfaWQ6IGluZGVudF9pbmZvLmlkLFxuICAgICAgICAgICAgY2FyX2lkOiBpbmRlbnRfaW5mby5jYXIuaWRcbiAgICAgICAgICB9LCB7XG4gICAgICAgICAgICBicmFuZDogdm0uYnJhbmQudmFsdWUsXG4gICAgICAgICAgICBzZXJpZXM6IHZtLmJyYW5kLnZhbHVlLFxuICAgICAgICAgICAgbW9kZWw6IHZtLm1vZGVsLnZhbHVlXG4gICAgICAgICAgfSlcbiAgICAgICAgICAuJHByb21pc2VcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgIHRvYXN0ci5zdWNjZXNzKHJlcy5tc2cgfHwgJ+e8lui+kei9pui+huS/oeaBr+S/neWtmOaIkOWKnycpO1xuXG4gICAgICAgICAgICAkbW9kYWxJbnN0YW5jZS5jbG9zZSgpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgdG9hc3RyLmVycm9yKHJlcy5tc2cgfHwgJ+e8lui+kei9pui+huS/oeaBr+S/neWtmOWksei0pScpO1xuICAgICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgSW5kZW50Q2Fyc1N2Y1xuICAgICAgICAgIC5zYXZlKHtcbiAgICAgICAgICAgIG9yZGVyX2lkOiBpbmRlbnRfaW5mby5pZFxuICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgIGJyYW5kOiB2bS5icmFuZC52YWx1ZSxcbiAgICAgICAgICAgIHNlcmllczogdm0uYnJhbmQudmFsdWUsXG4gICAgICAgICAgICBtb2RlbDogdm0ubW9kZWwudmFsdWVcbiAgICAgICAgICB9KVxuICAgICAgICAgIC4kcHJvbWlzZVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgdG9hc3RyLnN1Y2Nlc3MocmVzLm1zZyB8fCAn5Yqg6L2m5L+h5oGv5L+d5a2Y5oiQ5YqfJyk7XG5cbiAgICAgICAgICAgICRtb2RhbEluc3RhbmNlLmNsb3NlKCk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICB0b2FzdHIuZXJyb3IocmVzLm1zZyB8fCAn5Yqg6L2m5L+h5oGv5L+d5a2Y5aSx6LSlJyk7XG4gICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2VsZWN0X2l0ZW0obGlzdF9uYW1lLCB2YWx1ZSkge1xuICAgICAgdm1bbGlzdF9uYW1lXSA9IEluZGVudEVudW1zLml0ZW00dGV4dChsaXN0X25hbWUsIHZhbHVlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjYW5jZWwoKSB7XG4gICAgICAkbW9kYWxJbnN0YW5jZS5kaXNtaXNzKCk7XG4gICAgfVxuICB9KTtcblxuIiwiLy8g6Ieq5a6a5LmJIGRpcmVjdGl2ZXNcblxuYW5ndWxhclxuICAubW9kdWxlKCdjdXN0b20uZGlyZWN0aXZlcycsIFtdKVxuICAuZGlyZWN0aXZlKCduZ0luZGV0ZXJtaW5hdGUnLCBmdW5jdGlvbigkY29tcGlsZSkge1xuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgc2NvcGUuJHdhdGNoKGF0dHJpYnV0ZXNbJ25nSW5kZXRlcm1pbmF0ZSddLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgIGVsZW1lbnQucHJvcCgnaW5kZXRlcm1pbmF0ZScsICEhdmFsdWUpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICB9KTtcbiIsImFuZ3VsYXJcbiAgLm1vZHVsZSgndXRpbC5maWx0ZXJzJywgW10pXG5cbiAgLmZpbHRlcignbW9iaWxlJywgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHMpIHtcbiAgICAgIGlmIChzID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfVxuXG4gICAgICBzID0gcy5yZXBsYWNlKC9bXFxzXFwtXSsvZywgJycpO1xuXG4gICAgICBpZiAocy5sZW5ndGggPCAzKSB7XG4gICAgICAgIHJldHVybiBzO1xuICAgICAgfVxuXG4gICAgICB2YXIgc2EgPSBzLnNwbGl0KCcnKTtcblxuICAgICAgc2Euc3BsaWNlKDMsIDAsICctJyk7XG5cbiAgICAgIGlmIChzLmxlbmd0aCA+PSA3KSB7XG4gICAgICAgIHNhLnNwbGljZSg4LCAwLCAnLScpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2Euam9pbignJyk7XG4gICAgfTtcbiAgfSk7XG4iLCJhbmd1bGFyXG4gIC5tb2R1bGUoJ3V0aWwuZGF0ZScsIFtdKVxuICAuZmFjdG9yeSgnRGF0ZVV0aWwnLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRvU3RyaW5nID0gZnVuY3Rpb24gKGRhdGUsIHMpIHtcbiAgICAgIHJldHVybiBkYXRlLmdldEZ1bGxZZWFyKCkgKyBzICsgKGRhdGUuZ2V0TW9udGgoKSArIDEpICsgcyArIGRhdGUuZ2V0RGF0ZSgpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICB0b0xvY2FsRGF0ZVN0cmluZzogZnVuY3Rpb24gKGRhdGUpIHtcbiAgICAgICAgcmV0dXJuIHRvU3RyaW5nKGRhdGUsICctJyk7XG4gICAgICB9LFxuXG4gICAgICB0b0xvY2FsVGltZVN0cmluZzogZnVuY3Rpb24oZGF0ZSkge1xuICAgICAgICB2YXIgaCA9IGRhdGUuZ2V0SG91cnMoKTtcbiAgICAgICAgdmFyIG0gPSBkYXRlLmdldE1pbnV0ZXMoKTtcblxuICAgICAgICBpZiAoaCA8IDEwKSB7XG4gICAgICAgICAgaCA9ICcwJyArIGg7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobSA8IDEwKSB7XG4gICAgICAgICAgbSA9ICcwJyArIG07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gW3RvU3RyaW5nKGRhdGUsICctJyksIGggKyAnOicgKyBtXS5qb2luKCcgJyk7XG4gICAgICB9XG4gICAgfVxuICB9KTsiLCIvLyDmnprkuL4gU2VydmljZVxuYW5ndWxhclxuICAubW9kdWxlKCd1dGlsLmVudW1zJywgW10pXG4gIC5mYWN0b3J5KCdFbnVtcycsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKEVOVU1TKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB2YWw6IGZ1bmN0aW9uIChuYW1lLCB0ZXh0KSB7XG4gICAgICAgICAgcmV0dXJuIEVOVU1TW25hbWVdLmZpbmQoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtLnRleHQgPT09IHRleHQ7XG4gICAgICAgICAgfSkudmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIHRleHQ6IGZ1bmN0aW9uIChuYW1lLCB2YWwpIHtcbiAgICAgICAgICByZXR1cm4gRU5VTVNbbmFtZV0uZmluZChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW0udmFsdWUgPT09IHZhbDtcbiAgICAgICAgICB9KS50ZXh0O1xuICAgICAgICB9LFxuICAgICAgICBpdGVtOiBmdW5jdGlvbiAobmFtZSwgdmFsKSB7XG4gICAgICAgICAgcmV0dXJuIEVOVU1TW25hbWVdLmZpbmQoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtLnZhbHVlID09PSB2YWw7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGl0ZW00dGV4dDogZnVuY3Rpb24obmFtZSwgdGV4dCkge1xuICAgICAgICAgIHJldHVybiBFTlVNU1tuYW1lXS5maW5kKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtLnRleHQgPT09IHRleHQ7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGxpc3Q6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgcmV0dXJuIEVOVU1TW25hbWVdO1xuICAgICAgICB9LFxuICAgICAgICBpdGVtczogZnVuY3Rpb24gKG5hbWUsIHZhbHMpIHtcbiAgICAgICAgICByZXR1cm4gRU5VTVNbbmFtZV0uZmlsdGVyKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFscy5pbmRleE9mKGl0ZW0udmFsdWUpICE9PSAtMTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9O1xuICB9KTsiLCIvKiBnbG9iYWwgYW5ndWxhciovXG5hbmd1bGFyXG4gIC5tb2R1bGUoJ3V0aWwuZmlsZXInLCBbXSlcbiAgLmZhY3RvcnkoJ0ZpbGVyJywgZnVuY3Rpb24oJHdpbmRvdywgJGxvZykge1xuICAgIHZhciBmaWxlciA9IHt9O1xuICAgIGZpbGVyLnJlbW92ZSA9IGZ1bmN0aW9uKHVybCkge1xuICAgICAgJHdpbmRvdy5yZXNvbHZlTG9jYWxGaWxlU3lzdGVtVVJMKHVybCwgZmlsZXIuZnNTdWNjZXNzLCBmaWxlci5mc0Vycm9yKTtcbiAgICB9O1xuXG4gICAgZmlsZXIuZnNTdWNjZXNzID0gZnVuY3Rpb24oZmlsZUVudHJ5KSB7XG4gICAgICBmaWxlRW50cnkucmVtb3ZlKGZ1bmN0aW9uKCkge1xuICAgICAgICAkbG9nLmluZm8oJ+WIoOmZpOacrOWcsOWbvueJh+aIkOWKnzogJyArIGZpbGVFbnRyeS5mdWxsUGF0aCk7XG4gICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgJGxvZy5pbmZvKCfliKDpmaTmnKzlnLDlm77niYflpLHotKU6ICcgKyBmaWxlRW50cnkuZnVsbFBhdGgpO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIGZpbGVyLmZzRXJyb3IgPSBmdW5jdGlvbihldnQpIHtcbiAgICAgICRsb2cuaW5mbygn6I635Y+W5pys5Zyw5Zu+54mH5aSx6LSlOiAnICsgSlNPTi5zdHJpbmdpZnkoZXZ0LnRhcmdldCkpO1xuICAgIH07XG5cbiAgICByZXR1cm4gZmlsZXI7XG4gIH0pOyIsImFuZ3VsYXJcbiAgLm1vZHVsZSgnaHR0cEludGVyY2VwdG9ycycsIFsnTG9jYWxTdG9yYWdlTW9kdWxlJywgJ3V0aWwub2F1dGgnXSlcblxuICAuY29uZmlnKGZ1bmN0aW9uKCRodHRwUHJvdmlkZXIpIHtcbiAgICAkaHR0cFByb3ZpZGVyLmludGVyY2VwdG9ycy5wdXNoKCdodHRwSW50ZXJjZXB0b3InKTtcbiAgICBcbiAgICAvLyBBbmd1bGFyICRodHRwIGlzbuKAmXQgYXBwZW5kaW5nIHRoZSBoZWFkZXIgWC1SZXF1ZXN0ZWQtV2l0aCA9IFhNTEh0dHBSZXF1ZXN0IHNpbmNlIEFuZ3VsYXIgMS4zLjBcbiAgICAkaHR0cFByb3ZpZGVyLmRlZmF1bHRzLmhlYWRlcnMuY29tbW9uW1wiWC1SZXF1ZXN0ZWQtV2l0aFwiXSA9ICdYTUxIdHRwUmVxdWVzdCc7XG4gIH0pXG5cbiAgLmZhY3RvcnkoJ2h0dHBJbnRlcmNlcHRvcicsIGZ1bmN0aW9uKCRxLCAkcm9vdFNjb3BlLCAkbG9jYXRpb24sIE9BdXRoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC8vIOivt+axguWJjeS/ruaUuSByZXF1ZXN0IOmFjee9rlxuICAgICAgJ3JlcXVlc3QnOiBmdW5jdGlvbihjb25maWcpIHtcbiAgICAgICAgYW5ndWxhci5leHRlbmQoY29uZmlnLmhlYWRlcnMsIE9BdXRoLmhlYWRlcnMoKSk7XG4gICAgICAgIFxuICAgICAgICAvLyDoi6Xor7fmsYLnmoTmmK/mqKHmnb/vvIzmiJblt7LliqDkuIrml7bpl7TmiLPnmoQgdXJsIOWcsOWdgO+8jOWImeS4jemcgOimgeWKoOaXtumXtOaIs1xuICAgICAgICBpZiAoY29uZmlnLnVybC5pbmRleE9mKCcuaHRtJykgIT09IC0xIHx8IGNvbmZpZy51cmwuaW5kZXhPZignP189JykgIT09IC0xKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbmZpZztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbmZpZy51cmwgPSBjb25maWcudXJsICsgJz9fPScgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuICAgICAgICByZXR1cm4gY29uZmlnO1xuICAgICAgfSxcblxuICAgICAgLy8g6K+35rGC5Ye66ZSZ77yM5Lqk57uZIGVycm9yIGNhbGxiYWNrIOWkhOeQhlxuICAgICAgJ3JlcXVlc3RFcnJvcic6IGZ1bmN0aW9uKHJlamVjdGlvbikge1xuICAgICAgICByZXR1cm4gJHEucmVqZWN0KHJlamVjdGlvbik7XG4gICAgICB9LFxuXG4gICAgICAvLyDlk43lupTmlbDmja7mjInnuqblrprlpITnkIZcbiAgICAgIC8vIHtcbiAgICAgIC8vICAgY29kZTogMjAwLCAvLyDoh6rlrprkuYnnirbmgIHnoIHvvIwyMDAg5oiQ5Yqf77yM6Z2eIDIwMCDlnYfkuI3miJDlip9cbiAgICAgIC8vICAgbXNnOiAn5pON5L2c5o+Q56S6JywgLy8g5LiN6IO95ZKMIGRhdGEg5YWx5a2YXG4gICAgICAvLyAgIGRhdGE6IHt9IC8vIOeUqOaIt+aVsOaNrlxuICAgICAgLy8gfVxuICAgICAgJ3Jlc3BvbnNlJzogZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgLy8g5pyN5Yqh56uv6L+U5Zue55qE5pyJ5pWI55So5oi35pWw5o2uXG4gICAgICAgIHZhciBkYXRhLCBjb2RlO1xuICAgICAgICB2YXIgY3VycmVudF9wYXRoID0gJGxvY2F0aW9uLnBhdGgoKTtcblxuICAgICAgICBpZiAoYW5ndWxhci5pc09iamVjdChyZXNwb25zZS5kYXRhKSkge1xuICAgICAgICAgIC8vIOiLpeWTjeW6lOaVsOaNruS4jeespuWQiOe6puWumlxuICAgICAgICAgIGlmIChyZXNwb25zZS5kYXRhLmNvZGUgPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvZGUgPSByZXNwb25zZS5kYXRhLmNvZGU7XG4gICAgICAgICAgZGF0YSA9IHJlc3BvbnNlLmRhdGEuZGF0YTtcblxuICAgICAgICAgIC8vIOiLpSBzdGF0dXMgMjAwLCDkuJQgY29kZSAhMjAw77yM5YiZ6L+U5Zue55qE5piv5pON5L2c6ZSZ6K+v5o+Q56S65L+h5oGvXG4gICAgICAgICAgLy8g6YKj5LmI77yMY2FsbGJhY2sg5Lya5o6l5pS25Yiw5LiL6Z2i5b2i5byP55qE5Y+C5pWw77yaXG4gICAgICAgICAgLy8geyBjb2RlOiAyMDAwMSwgbXNnOiAn5pON5L2c5aSx6LSlJyB9XG4gICAgICAgICAgaWYgKGNvZGUgIT09IDIwMCkge1xuICAgICAgICAgICAgaWYgKGNvZGUgPT09IDQwMSkge1xuICAgICAgICAgICAgICBPQXV0aC5yNDAxKGN1cnJlbnRfcGF0aCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3QocmVzcG9uc2UpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOiLpeacjeWKoeerr+i/lOWbnueahCBkYXRhICFudWxs77yM5YiZ6L+U5Zue55qE5piv5pyJ5pWI5Zyw55So5oi35pWw5o2uXG4gICAgICAgICAgLy8g6YKj5LmI77yMY2FsbGJhY2sg5Lya5o6l5pS25Yiw5LiL6Z2i5b2i5byP5Y+C5pWw77yaXG4gICAgICAgICAgLy8geyBpdGVtczogWy4uLl0sIHRvdGFsX2NvdW50OiAxMDAgfVxuICAgICAgICAgIGlmIChkYXRhICE9IG51bGwpIHtcbiAgICAgICAgICAgIHJlc3BvbnNlLmRhdGEgPSBkYXRhO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIOiLpeacjeWKoeerr+i/lOWbnueahCBkYXRhIOWAvOS4uiBudWxs77yM5YiZ6L+U5Zue55qE5piv5o+Q56S65L+h5oGvXG4gICAgICAgICAgLy8g6YKj5LmIIGNhbGxiYWNrIOS8muaOpeaUtuWIsOS4i+mdouW9ouW8j+eahOWPguaVsO+8mlxuICAgICAgICAgIC8vIHsgY29kZTogMjAwLCBtc2c6ICfmk43kvZzmiJDlip8nIH1cbiAgICAgICAgICAvLyDpu5jorqTkuLrmraRcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgIH0sXG5cbiAgICAgIC8vIOWTjeW6lOWHuumUme+8jOS6pOe7mSBlcnJvciBjYWxsYmFjayDlpITnkIZcbiAgICAgICdyZXNwb25zZUVycm9yJzogZnVuY3Rpb24ocmVqZWN0aW9uKSB7XG4gICAgICAgIHZhciBjdXJyZW50X3BhdGggPSAkbG9jYXRpb24ucGF0aCgpO1xuXG4gICAgICAgIGlmIChyZWplY3Rpb24uc3RhdHVzID09PSA0MDEpIHtcbiAgICAgICAgICBPQXV0aC5yNDAxKGN1cnJlbnRfcGF0aCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gJHEucmVqZWN0KHJlamVjdGlvbik7XG4gICAgICB9XG4gICAgfTtcbiAgfSk7IiwiLyogZ2xvYmFsIGFuZ3VsYXIqL1xuYW5ndWxhclxuICAubW9kdWxlKCd1dGlsLmtleW1ncicsIFsnTG9jYWxTdG9yYWdlTW9kdWxlJ10pXG4gIC5mYWN0b3J5KCdLZXlNZ3InLCBmdW5jdGlvbigkbG9nLCBsb2NhbFN0b3JhZ2VTZXJ2aWNlKSB7XG4gICAgdmFyIEtleU1nciA9IHtcbiAgICAgIF9fY29ubmVjdG9yOiAnXycsXG4gICAgICBcbiAgICAgIHJlcG9ydDogZnVuY3Rpb24ob3JkZXJfaWQsIGNhcl9pZCkge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCAhPT0gMikge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignS2V5TWdyLnJlcG9ydCgpIOWPguaVsOmdnuazlScpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFtvcmRlcl9pZCwgY2FyX2lkXS5qb2luKEtleU1nci5fX2Nvbm5lY3Rvcik7XG4gICAgICB9LFxuXG4gICAgICBfX3R5cGU6IGZ1bmN0aW9uKGZpeCwgb3JkZXJfaWQsIGNhcl9pZCkge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignS2V5TWdyLicgKyBmaXggKyAnKCkg5Y+C5pWw6Z2e5rOVJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDnrKzkuIDkuKrlj4LmlbDmmK8gcmVwb3J0IEtleU1nclxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgIHJldHVybiBbb3JkZXJfaWQsIGZpeF0uam9pbihLZXlNZ3IuX19jb25uZWN0b3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFtvcmRlcl9pZCwgY2FyX2lkLCBmaXhdLmpvaW4oS2V5TWdyLl9fY29ubmVjdG9yKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgYW5ndWxhci5leHRlbmQoS2V5TWdyLCB7XG4gICAgICBlcnI6IEtleU1nci5fX3R5cGUuYmluZChLZXlNZ3IsICdlcnInKSxcblxuICAgICAgc3RhdHVzOiBLZXlNZ3IuX190eXBlLmJpbmQoS2V5TWdyLCAnc3RhdHVzJyksXG5cbiAgICAgIHN1Ym1pdDogS2V5TWdyLl9fdHlwZS5iaW5kKEtleU1nciwgJ3N1Ym1pdCcpLFxuXG4gICAgICBjbGVhcjogZnVuY3Rpb24ob3JkZXJfaWQsIGNhcl9pZCkge1xuICAgICAgICBsb2NhbFN0b3JhZ2VTZXJ2aWNlLnJlbW92ZShLZXlNZ3IucmVwb3J0KG9yZGVyX2lkLCBjYXJfaWQpKTtcbiAgICAgICAgbG9jYWxTdG9yYWdlU2VydmljZS5yZW1vdmUoS2V5TWdyLnN0YXR1cyhvcmRlcl9pZCwgY2FyX2lkKSk7XG4gICAgICAgIGxvY2FsU3RvcmFnZVNlcnZpY2UucmVtb3ZlKEtleU1nci5zdWJtaXQob3JkZXJfaWQsIGNhcl9pZCkpO1xuICAgICAgICBsb2NhbFN0b3JhZ2VTZXJ2aWNlLnJlbW92ZShLZXlNZ3IuZXJyKG9yZGVyX2lkLCBjYXJfaWQpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICAgIFxuICAgIHJldHVybiBLZXlNZ3I7XG4gIH0pOyIsIi8qIGdsb2JhbCBhbmd1bGFyKi9cbmFuZ3VsYXJcbiAgLm1vZHVsZSgndXRpbC5vYXV0aCcsIFsnTG9jYWxTdG9yYWdlTW9kdWxlJ10pXG4gIC5mYWN0b3J5KCdPQXV0aCcsIGZ1bmN0aW9uKCRsb2csICRsb2NhdGlvbiwgbG9jYWxTdG9yYWdlU2VydmljZSkge1xuICAgIHZhciBvYXV0aF9sb2NhbF9rZXkgPSAnb2F1dGgnO1xuXG4gICAgdmFyIG9hdXRoX2NvbmYgPSB7XG4gICAgICBjbGllbnRfaWQ6ICdYZWF4Mk9NZ2VMUVBEeGZTbHJJWjNCWnF0RkhNbkJXSWhwQUtPN2FqJyxcbiAgICAgIGNsaWVudF9zZWNyZXQ6ICdxQjVmTjdLZkh5YTAwQXB6UDlwbElyM3VwQlpvUlV2aTNoYmE4RERNZjRPUzhiSFhSZkMzUTBnR0pCcU5zMVduaEZmZkZad0tWYU1hQUlzN3ZjWmg0ak16YlhFakZySklaM0lwY1Y3Y0F4UW92VzJoVVQ5cW1RS2hqTzhuQXNJTScsXG4gICAgICBncmFudF90eXBlOiAncGFzc3dvcmQnXG4gICAgfTtcblxuICAgIHZhciBPQXV0aCA9IHtcbiAgICAgIGNvbmY6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gb2F1dGhfY29uZjtcbiAgICAgIH0sXG5cbiAgICAgIHI0MDE6IGZ1bmN0aW9uKGN1cl9wYXRoKSB7XG4gICAgICAgICRsb2NhdGlvbi51cmwoJy9sb2dpbicpO1xuICAgICAgICAkbG9jYXRpb24uc2VhcmNoKCdyZWRpcmVjdCcsIGN1cl9wYXRoKTtcbiAgICAgIH0sXG5cbiAgICAgIGhlYWRlcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdG9rZW5zID0gdGhpcy5sb2NhbCgpO1xuICAgICAgICB2YXIgaGVhZGVycyA9IHt9O1xuXG4gICAgICAgIGlmICh0b2tlbnMpIHtcbiAgICAgICAgICBoZWFkZXJzLkF1dGhvcml6YXRpb24gPSB0b2tlbnMudG9rZW5fdHlwZSArICcgJyArIHRva2Vucy5hY2Nlc3NfdG9rZW47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaGVhZGVycztcbiAgICAgIH0sXG5cbiAgICAgIGxvY2FsOiBmdW5jdGlvbih0b2tlbnMpIHtcbiAgICAgICAgaWYgKHRva2Vucykge1xuICAgICAgICAgIGxvY2FsU3RvcmFnZVNlcnZpY2Uuc2V0KG9hdXRoX2xvY2FsX2tleSwgdG9rZW5zKTtcblxuICAgICAgICAgIHJldHVybiB0b2tlbnM7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbG9jYWxTdG9yYWdlU2VydmljZS5nZXQob2F1dGhfbG9jYWxfa2V5KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIE9BdXRoO1xuICB9KTsiLCIvKiBnbG9iYWwgYW5ndWxhciwgRmlsZVVwbG9hZE9wdGlvbnMsIEZpbGVUcmFuc2ZlciovXG4vLyDpmYTku7bkuIrkvKDlmahcbmFuZ3VsYXJcbiAgLm1vZHVsZSgndXRpbC51cGxvYWRlcicsIFtdKVxuICAuZmFjdG9yeSgnVXBsb2FkZXInLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkbG9nKSB7XG4gICAgdmFyIHZtID0gJHJvb3RTY29wZTtcbiAgICB2YXIgbm9vcCA9IGZ1bmN0aW9uKCkge307XG5cbiAgICB2YXIgdXBsb2FkZXIgPSB7XG4gICAgICAvLyDmibnph4/kuIrkvKDpmYTku7ZcbiAgICAgIC8vIOS+nei1liAkc2NvcGUg55qEIG9ic2VydmVyXG4gICAgICAvLyBcbiAgICAgIC8vIGF0dGFjaG1lbnRzOiDpnIDopoHkuIrkvKDnmoTpmYTku7bliJfooahcbiAgICAgIC8vIGJhbmR3aWR0aDog5ZCM5pe25LiK5Lyg55qE5pWw6YePXG4gICAgICAvLyBkb25lOiDmiYDmnInpmYTku7bkuIrkvKDlrozmiJDnmoTlm57osIPlh73mlbBcbiAgICAgIGJhdGNoOiBmdW5jdGlvbihvcHQpIHtcbiAgICAgICAgaWYgKCFvcHQuYXR0YWNobWVudHMgfHwgIW9wdC51cmwpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ+S4iuS8oOmZhOS7tue8uuWwkeWPguaVsCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGNvdW50ID0gb3B0LmF0dGFjaG1lbnRzLmxlbmd0aDtcbiAgICAgICAgdmFyIGluZGV4O1xuICAgICAgICB2YXIgY29tcGxldGVkX2NvdW50ID0gMDtcblxuICAgICAgICAvLyDmsqHmnInpmYTku7ZcbiAgICAgICAgaWYgKGNvdW50ID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGRlZmF1bHRPcHQgPSB7XG4gICAgICAgICAgYmFuZHdpZHRoOiAzLFxuICAgICAgICAgIGRvbmU6IG5vb3AsXG4gICAgICAgICAgb25lOiBub29wLFxuICAgICAgICAgIGVycm9yOiBub29wXG4gICAgICAgIH07XG5cbiAgICAgICAgb3B0ID0gYW5ndWxhci5leHRlbmQoe30sIGRlZmF1bHRPcHQsIG9wdCk7XG5cbiAgICAgICAgdmFyIGNvbXBsZXRlID0gZnVuY3Rpb24oYXR0YWNobWVudCkge1xuICAgICAgICAgIC8vIOabtOaWsCBhdHRhY2htZW50IOinpuWPkeS4i+S4gOS4quS4iuS8oFxuICAgICAgICAgIGF0dGFjaG1lbnQudXBsb2FkZWQgPSB0cnVlO1xuXG4gICAgICAgICAgb3B0Lm9uZS5hcHBseSh1cGxvYWRlciwgYXJndW1lbnRzKTtcblxuICAgICAgICAgIGNvbXBsZXRlZF9jb3VudCsrO1xuXG4gICAgICAgICAgb3B0Lm9ucHJvZ3Jlc3Moe1xuICAgICAgICAgICAgbG9hZGVkOiBjb21wbGV0ZWRfY291bnQsXG4gICAgICAgICAgICB0b3RhbDogY291bnQsXG4gICAgICAgICAgICBwZXJjZW50OiBwYXJzZUludChjb21wbGV0ZWRfY291bnQgLyBjb3VudCAqIDEwMClcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIGlmIChpbmRleCA9PT0gY291bnQgLSAxKSB7XG4gICAgICAgICAgICBpZiAodm0uX19hdHRhY2htZW50c19fKSB7XG4gICAgICAgICAgICAgIHZtLl9fYXR0YWNobWVudHNfXyA9IG51bGw7XG4gICAgICAgICAgICAgIGRlbGV0ZSB2bS5fX2F0dGFjaG1lbnRzX187XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG9wdC5kb25lKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIG9wdC5hdHRhY2htZW50cyA9IGFuZ3VsYXIuY29weShvcHQuYXR0YWNobWVudHMsIFtdKTtcblxuICAgICAgICAvLyDlj6rmnInkuIDkuKrpmYTku7ZcbiAgICAgICAgaWYgKGNvdW50ID09PSAxKSB7XG4gICAgICAgICAgaW5kZXggPSAwO1xuICAgICAgICAgIHVwbG9hZGVyLm9uZSh7XG4gICAgICAgICAgICBhdHRhY2htZW50OiBvcHQuYXR0YWNobWVudHNbMF0sXG4gICAgICAgICAgICBzdWNjZXNzOiBjb21wbGV0ZSxcbiAgICAgICAgICAgIHVybDogb3B0LnVybCxcbiAgICAgICAgICAgIGVycm9yOiBvcHQuZXJyb3JcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g6ZmE5Lu25pWw6YeP5bCR5LqO5ZCM5pe25LiK5Lyg55qE5pWw6YePXG4gICAgICAgIGlmIChjb3VudCA8IG9wdC5iYW5kd2lkdGgpIHtcbiAgICAgICAgICBpbmRleCA9IGNvdW50IC0gMTtcbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcbiAgICAgICAgICAgIHVwbG9hZGVyLm9uZSh7XG4gICAgICAgICAgICAgIGF0dGFjaG1lbnQ6IG9wdC5hdHRhY2htZW50c1tpXSxcbiAgICAgICAgICAgICAgc3VjY2VzczogY29tcGxldGUsXG4gICAgICAgICAgICAgIHVybDogb3B0LnVybCxcbiAgICAgICAgICAgICAgZXJyb3I6IG9wdC5lcnJvclxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgXG4gICAgICAgIGluZGV4ID0gb3B0LmJhbmR3aWR0aCAtIDE7XG4gICAgICAgIHZtLl9fYXR0YWNobWVudHNfXyA9IG9wdC5hdHRhY2htZW50cztcblxuICAgICAgICAvLyDkuIrkvKDlrozkuIDkuKrlkI7vvIzku44gYXR0YWNobWVudHMg5Lit5Y+W5Ye65LiL5LiA5Liq5LiK5LygXG4gICAgICAgIC8vIOWni+e7iOS/neaMgeWQjOaXtuS4iuS8oOeahOaVsOmHj+S4uiBiYW5kd2lkdGhcbiAgICAgICAgdm0uJHdhdGNoQ29sbGVjdGlvbignX19hdHRhY2htZW50c19fJywgZnVuY3Rpb24obmV3QXR0YWNobWVudHMpIHtcbiAgICAgICAgICAvLyDmibnph4/kuIrkvKDlrozmiJDvvIzkvJrliKDpmaQgX19hdHRhY2htZW50c19fXG4gICAgICAgICAgaWYgKCFuZXdBdHRhY2htZW50cykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHVwbG9hZGVyLm9uZSh7XG4gICAgICAgICAgICBhdHRhY2htZW50OiBvcHQuYXR0YWNobWVudHNbKytpbmRleF0sXG4gICAgICAgICAgICBzdWNjZXNzOiBjb21wbGV0ZSxcbiAgICAgICAgICAgIHVybDogb3B0LnVybCxcbiAgICAgICAgICAgIGVycm9yOiBvcHQuZXJyb3JcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCBvcHQuYmFuZHdpZHRoOyBrKyspIHtcbiAgICAgICAgICB1cGxvYWRlci5vbmUoe1xuICAgICAgICAgICAgYXR0YWNobWVudDogb3B0LmF0dGFjaG1lbnRzW2tdLFxuICAgICAgICAgICAgc3VjY2VzczogY29tcGxldGUsXG4gICAgICAgICAgICB1cmw6IG9wdC51cmwsXG4gICAgICAgICAgICBlcnJvcjogb3B0LmVycm9yXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm47XG4gICAgICB9LFxuXG4gICAgICAvLyDljZXkuKrkuIrkvKBcbiAgICAgIG9uZTogZnVuY3Rpb24ob3B0KSB7XG4gICAgICAgIGlmICghb3B0LmF0dGFjaG1lbnQgfHwgIW9wdC51cmwpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ+S4iuS8oOmZhOS7tue8uuWwkeWPguaVsCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgJGxvZy5kZWJ1ZygnYXR0YWNobWVudDogJyArIEpTT04uc3RyaW5naWZ5KG9wdC5hdHRhY2htZW50KSk7XG4gICAgICAgIFxuICAgICAgICB2YXIgZGVmYXVsdE9wdCA9IHtcbiAgICAgICAgICBzdWNjZXNzOiBub29wLFxuICAgICAgICAgIGVycm9yOiBub29wLFxuICAgICAgICAgIGZpbGVLZXk6ICdmaWxlS2V5JyxcbiAgICAgICAgICBmaWxlTmFtZTogb3B0LmF0dGFjaG1lbnQudXJsLnN1YnN0cihvcHQuYXR0YWNobWVudC51cmwubGFzdEluZGV4T2YoJy8nKSArIDEpXG4gICAgICAgIH07XG4gICAgICAgIHZhciBjdXN0b21fb25wcm9ncmVzcyA9IG9wdC5vbnByb2dyZXNzO1xuICAgICAgICBvcHQgPSBhbmd1bGFyLmV4dGVuZCh7fSwgZGVmYXVsdE9wdCwgb3B0KTtcbiAgICAgICAgb3B0Lm9ucHJvZ2Vyc3MgPSBmdW5jdGlvbihwcm9ncmVzc0V2ZW50KSB7XG4gICAgICAgICAgaWYgKHByb2dyZXNzRXZlbnQubGVuZ3RoQ29tcHV0YWJsZSkgeyAgXG4gICAgICAgICAgICAvL+W3sue7j+S4iuS8oCAgXG4gICAgICAgICAgICB2YXIgbG9hZGVkID0gcHJvZ3Jlc3NFdmVudC5sb2FkZWQ7ICBcbiAgICAgICAgICAgIC8v5paH5Lu25oC76ZW/5bqmICBcbiAgICAgICAgICAgIHZhciB0b3RhbCA9IHByb2dyZXNzRXZlbnQudG90YWw7ICBcbiAgICAgICAgICAgIC8v6K6h566X55m+5YiG5q+U77yM55So5LqO5pi+56S66L+b5bqm5p2hICBcbiAgICAgICAgICAgIHZhciBwZXJjZW50ID0gcGFyc2VJbnQoKGxvYWRlZCAvIHRvdGFsKSAqIDEwMCk7XG5cbiAgICAgICAgICAgIGN1c3RvbV9vbnByb2dyZXNzKHtcbiAgICAgICAgICAgICAgbG9hZGVkOiBsb2FkZWQsXG4gICAgICAgICAgICAgIHRvdGFsOiB0b3RhbCxcbiAgICAgICAgICAgICAgcGVyY2VudDogcGVyY2VudFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgdmFyIGZVT3B0cyA9IG5ldyBGaWxlVXBsb2FkT3B0aW9ucygpO1xuICAgICAgICBmVU9wdHMuZmlsZUtleSA9IG9wdC5maWxlS2V5O1xuICAgICAgICBmVU9wdHMuZmlsZU5hbWUgPSBvcHQuZmlsZU5hbWU7XG5cbiAgICAgICAgdmFyIGZ0ID0gbmV3IEZpbGVUcmFuc2ZlcigpO1xuICAgICAgICBmdC5vbnByb2dyZXNzID0gb3B0Lm9ucHJvZ3Jlc3M7XG4gICAgICAgIGZ0LnVwbG9hZChcbiAgICAgICAgICBvcHQuYXR0YWNobWVudC51cmwsXG4gICAgICAgICAgZW5jb2RlVVJJKG9wdC51cmwpLFxuICAgICAgICAgIG9wdC5zdWNjZXNzLmJpbmQodXBsb2FkZXIsIG9wdC5hdHRhY2htZW50KSxcbiAgICAgICAgICBvcHQuZXJyb3IuYmluZCh1cGxvYWRlciwgb3B0LmF0dGFjaG1lbnQpLFxuICAgICAgICAgIGZVT3B0c1xuICAgICAgICApO1xuICAgICAgfVxuICAgIH07XG4gICAgXG4gICAgcmV0dXJuIHVwbG9hZGVyOyBcbiAgfSk7XG4iLCIvLyAkc2NvcGUg5aKe5by6XG5hbmd1bGFyXG4gIC5tb2R1bGUoJ3V0aWwudm0nLCBbXSlcbiAgLmZhY3RvcnkoJ1ZNJywgZnVuY3Rpb24gKCRsb2cpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdG9fanNvbjogZnVuY3Rpb24odm0sIGZpZWxkcykge1xuICAgICAgICB2YXIgcmV0ID0ge307XG5cbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNTdHJpbmcoZmllbGRzKSkge1xuICAgICAgICAgIGZpZWxkcyA9IGZpZWxkcy5zcGxpdCgnLCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZpZWxkcy5sZW5ndGggPT09IDEgJiYgZmllbGRzWzBdID09PSAnJykge1xuICAgICAgICAgICRsb2cud2Fybign5oKo6LCD55So5pa55rOVIFZNLnRvX2pzb24g5pe277yM5rKh5pyJ5Lyg5YWlIGZpZWxkcyDlj4LmlbAnKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWFuZ3VsYXIuaXNBcnJheShmaWVsZHMpKSB7XG4gICAgICAgICAgJGxvZy5lcnJvcign5pa55rOVIFZNLnRvX2pzb24g5Y+q5o6l5Y+X5a2X56ym5Liy5pWw57uE5oiW6YCX5Y+35YiG6ZqU55qE5a2X56ym5Liy5oiW5LiA5Liq5LiN5ZCr6YCX5Y+355qE5a2X56ym5LiyJyk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZmllbGRzLm1hcChmdW5jdGlvbihmaWVsZCkge1xuICAgICAgICAgIHJldHVybiByZXRbZmllbGRdID0gdm1bZmllbGRdO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgfVxuICAgIH07XG4gIH0pOyIsIid1c2Ugc3RyaWN0JztcbmFuZ3VsYXIubW9kdWxlKFwibmdMb2NhbGVcIiwgW10sIFtcIiRwcm92aWRlXCIsIGZ1bmN0aW9uKCRwcm92aWRlKSB7XG4gIHZhciBQTFVSQUxfQ0FURUdPUlkgPSB7XG4gICAgWkVSTzogXCJ6ZXJvXCIsXG4gICAgT05FOiBcIm9uZVwiLFxuICAgIFRXTzogXCJ0d29cIixcbiAgICBGRVc6IFwiZmV3XCIsXG4gICAgTUFOWTogXCJtYW55XCIsXG4gICAgT1RIRVI6IFwib3RoZXJcIlxuICB9O1xuICAkcHJvdmlkZS52YWx1ZShcIiRsb2NhbGVcIiwge1xuICAgIFwiREFURVRJTUVfRk9STUFUU1wiOiB7XG4gICAgICBcIkFNUE1TXCI6IFtcbiAgICAgICAgXCJcXHU0ZTBhXFx1NTM0OFwiLFxuICAgICAgICBcIlxcdTRlMGJcXHU1MzQ4XCJcbiAgICAgIF0sXG4gICAgICBcIkRBWVwiOiBbXG4gICAgICAgIFwiXFx1NjYxZlxcdTY3MWZcXHU2NWU1XCIsXG4gICAgICAgIFwiXFx1NjYxZlxcdTY3MWZcXHU0ZTAwXCIsXG4gICAgICAgIFwiXFx1NjYxZlxcdTY3MWZcXHU0ZThjXCIsXG4gICAgICAgIFwiXFx1NjYxZlxcdTY3MWZcXHU0ZTA5XCIsXG4gICAgICAgIFwiXFx1NjYxZlxcdTY3MWZcXHU1NmRiXCIsXG4gICAgICAgIFwiXFx1NjYxZlxcdTY3MWZcXHU0ZTk0XCIsXG4gICAgICAgIFwiXFx1NjYxZlxcdTY3MWZcXHU1MTZkXCJcbiAgICAgIF0sXG4gICAgICBcIk1PTlRIXCI6IFtcbiAgICAgICAgXCIxXFx1NjcwOFwiLFxuICAgICAgICBcIjJcXHU2NzA4XCIsXG4gICAgICAgIFwiM1xcdTY3MDhcIixcbiAgICAgICAgXCI0XFx1NjcwOFwiLFxuICAgICAgICBcIjVcXHU2NzA4XCIsXG4gICAgICAgIFwiNlxcdTY3MDhcIixcbiAgICAgICAgXCI3XFx1NjcwOFwiLFxuICAgICAgICBcIjhcXHU2NzA4XCIsXG4gICAgICAgIFwiOVxcdTY3MDhcIixcbiAgICAgICAgXCIxMFxcdTY3MDhcIixcbiAgICAgICAgXCIxMVxcdTY3MDhcIixcbiAgICAgICAgXCIxMlxcdTY3MDhcIlxuICAgICAgXSxcbiAgICAgIFwiU0hPUlREQVlcIjogW1xuICAgICAgICBcIlxcdTU0NjhcXHU2NWU1XCIsXG4gICAgICAgIFwiXFx1NTQ2OFxcdTRlMDBcIixcbiAgICAgICAgXCJcXHU1NDY4XFx1NGU4Y1wiLFxuICAgICAgICBcIlxcdTU0NjhcXHU0ZTA5XCIsXG4gICAgICAgIFwiXFx1NTQ2OFxcdTU2ZGJcIixcbiAgICAgICAgXCJcXHU1NDY4XFx1NGU5NFwiLFxuICAgICAgICBcIlxcdTU0NjhcXHU1MTZkXCJcbiAgICAgIF0sXG4gICAgICBcIlNIT1JUTU9OVEhcIjogW1xuICAgICAgICBcIjFcXHU2NzA4XCIsXG4gICAgICAgIFwiMlxcdTY3MDhcIixcbiAgICAgICAgXCIzXFx1NjcwOFwiLFxuICAgICAgICBcIjRcXHU2NzA4XCIsXG4gICAgICAgIFwiNVxcdTY3MDhcIixcbiAgICAgICAgXCI2XFx1NjcwOFwiLFxuICAgICAgICBcIjdcXHU2NzA4XCIsXG4gICAgICAgIFwiOFxcdTY3MDhcIixcbiAgICAgICAgXCI5XFx1NjcwOFwiLFxuICAgICAgICBcIjEwXFx1NjcwOFwiLFxuICAgICAgICBcIjExXFx1NjcwOFwiLFxuICAgICAgICBcIjEyXFx1NjcwOFwiXG4gICAgICBdLFxuICAgICAgXCJmdWxsRGF0ZVwiOiBcInlcXHU1ZTc0TVxcdTY3MDhkXFx1NjVlNUVFRUVcIixcbiAgICAgIFwibG9uZ0RhdGVcIjogXCJ5XFx1NWU3NE1cXHU2NzA4ZFxcdTY1ZTVcIixcbiAgICAgIFwibWVkaXVtXCI6IFwieXl5eS1NLWQgYWg6bW06c3NcIixcbiAgICAgIFwibWVkaXVtRGF0ZVwiOiBcInl5eXktTS1kXCIsXG4gICAgICBcIm1lZGl1bVRpbWVcIjogXCJhaDptbTpzc1wiLFxuICAgICAgXCJzaG9ydFwiOiBcInl5LU0tZCBhaDptbVwiLFxuICAgICAgXCJzaG9ydERhdGVcIjogXCJ5eS1NLWRcIixcbiAgICAgIFwic2hvcnRUaW1lXCI6IFwiYWg6bW1cIlxuICAgIH0sXG4gICAgXCJOVU1CRVJfRk9STUFUU1wiOiB7XG4gICAgICBcIkNVUlJFTkNZX1NZTVwiOiBcIlxcdTAwYTVcIixcbiAgICAgIFwiREVDSU1BTF9TRVBcIjogXCIuXCIsXG4gICAgICBcIkdST1VQX1NFUFwiOiBcIixcIixcbiAgICAgIFwiUEFUVEVSTlNcIjogW3tcbiAgICAgICAgXCJnU2l6ZVwiOiAzLFxuICAgICAgICBcImxnU2l6ZVwiOiAzLFxuICAgICAgICBcIm1hY0ZyYWNcIjogMCxcbiAgICAgICAgXCJtYXhGcmFjXCI6IDMsXG4gICAgICAgIFwibWluRnJhY1wiOiAwLFxuICAgICAgICBcIm1pbkludFwiOiAxLFxuICAgICAgICBcIm5lZ1ByZVwiOiBcIi1cIixcbiAgICAgICAgXCJuZWdTdWZcIjogXCJcIixcbiAgICAgICAgXCJwb3NQcmVcIjogXCJcIixcbiAgICAgICAgXCJwb3NTdWZcIjogXCJcIlxuICAgICAgfSwge1xuICAgICAgICBcImdTaXplXCI6IDMsXG4gICAgICAgIFwibGdTaXplXCI6IDMsXG4gICAgICAgIFwibWFjRnJhY1wiOiAwLFxuICAgICAgICBcIm1heEZyYWNcIjogMixcbiAgICAgICAgXCJtaW5GcmFjXCI6IDIsXG4gICAgICAgIFwibWluSW50XCI6IDEsXG4gICAgICAgIFwibmVnUHJlXCI6IFwiKFxcdTAwYTRcIixcbiAgICAgICAgXCJuZWdTdWZcIjogXCIpXCIsXG4gICAgICAgIFwicG9zUHJlXCI6IFwiXFx1MDBhNFwiLFxuICAgICAgICBcInBvc1N1ZlwiOiBcIlwiXG4gICAgICB9XVxuICAgIH0sXG4gICAgXCJpZFwiOiBcInpoLWNuXCIsXG4gICAgXCJwbHVyYWxDYXRcIjogZnVuY3Rpb24obikge1xuICAgICAgcmV0dXJuIFBMVVJBTF9DQVRFR09SWS5PVEhFUjtcbiAgICB9XG4gIH0pO1xufV0pO1xuIiwiYW5ndWxhclxuICAubW9kdWxlKCdndWx1LnJlcG9ydCcpXG5cbiAgLmZhY3RvcnkoJ1JlcG9ydElucHV0ZXInLCBmdW5jdGlvbigkbG9nLCAkc3RhdGVQYXJhbXMsICRpbnRlcnZhbCwgVk0sIGxvY2FsU3RvcmFnZVNlcnZpY2UpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24odm0sIGZpZWxkcywgcmVwb3J0X3R5cGUpIHtcbiAgICAgIHZhciBpbmRlbnRfaWQgPSAkc3RhdGVQYXJhbXMuaW5kZW50X2lkO1xuICAgICAgdmFyIGNhcl9pZCA9ICRzdGF0ZVBhcmFtcy5jYXJfaWQ7XG5cbiAgICAgIHZhciBzdG9yZV9rZXkgPSBbaW5kZW50X2lkLCBjYXJfaWRdLmpvaW4oJ18nKTtcblxuICAgICAgdmFyIGluaXRfZGF0YSA9IGxvY2FsU3RvcmFnZVNlcnZpY2UuZ2V0KHN0b3JlX2tleSk7XG4gICAgICAvLyDorr7nva7liJ3lp4vljJblgLxcbiAgICAgIGFuZ3VsYXIuZXh0ZW5kKHZtLCBpbml0X2RhdGEgJiYgaW5pdF9kYXRhW3JlcG9ydF90eXBlXSB8fCB7fSk7XG5cbiAgICAgIC8vIOS/neWtmOWIsCBsb2NhbFN0b3JhZ2VcbiAgICAgIGZ1bmN0aW9uIHNhdmUoKSB7XG4gICAgICAgIHZhciBkYXRhID0gbG9jYWxTdG9yYWdlU2VydmljZS5nZXQoc3RvcmVfa2V5KSB8fCB7fTtcbiAgICAgICAgZGF0YVtyZXBvcnRfdHlwZV0gPSBWTS50b19qc29uKHZtLCBmaWVsZHMpO1xuXG4gICAgICAgIGxvY2FsU3RvcmFnZVNlcnZpY2Uuc2V0KHN0b3JlX2tleSwgZGF0YSk7XG5cbiAgICAgICAgJGxvZy5sb2coJ+W9leWFpeajgOa1i+aKpeWRiiAtICcgKyBzdG9yZV9rZXksIGRhdGFbcmVwb3J0X3R5cGVdKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHRpbWVyID0gJGludGVydmFsKHNhdmUsIDMwMDApO1xuXG4gICAgICAvLyDliIfmjaLpobXpnaLml7bvvIzlj5bmtojoh6rliqjkv53lrZgo5riF6Zmk5a6a5pe25ZmoKVxuICAgICAgdm0uJG9uKCckbG9jYXRpb25DaGFuZ2VTdGFydCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAkaW50ZXJ2YWwuY2FuY2VsKHRpbWVyKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG5cbiIsIi8qIGdsb2JhbCBhbmd1bGFyLCBDYW1lcmEsIF8sIEZ1bGxTY3JlZW5JbWFnZSovXG5hbmd1bGFyXG4gIC5tb2R1bGUoJ2d1bHUucmVwb3J0JylcblxuICAuY29udHJvbGxlcignSW5wdXREYXNoYm9hcmRDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGVQYXJhbXMsICRsb2NhdGlvbiwgJHRlbXBsYXRlQ2FjaGUsIGxvY2FsU3RvcmFnZVNlcnZpY2UsIEtleU1ncikge1xuICAgIHZhciB2bSA9ICRzY29wZTtcblxuICAgIHZhciBpbmRlbnRfaWQgPSAkc3RhdGVQYXJhbXMuaW5kZW50X2lkO1xuICAgIHZhciBjYXJfaWQgPSAkc3RhdGVQYXJhbXMuY2FyX2lkO1xuICAgIHZhciByZXBvcnRfc3RhdHVzX2tleSA9IEtleU1nci5zdGF0dXMoaW5kZW50X2lkLCBjYXJfaWQpO1xuXG4gICAgdm0ucGFydHMgPSBKU09OLnBhcnNlKCR0ZW1wbGF0ZUNhY2hlLmdldCgncmVwb3J0L2kuanNvbicpKTtcbiAgICBcbiAgICAvLyDkuI3nlKjlsZXnpLrnhafniYdcbiAgICB2bS5waG90b19wYXJ0ID0gdm0ucGFydHMucG9wKCk7XG4gICAgXG4gICAgLy8g6buY6K6k5bGV5byAXG4gICAgdm0udGVzdF9zdGVwX25hdl9vcGVuID0gdHJ1ZTtcbiAgICB2bS50b2dnbGVfbmF2X29wZW4gPSB0b2dnbGVfbmF2X29wZW47XG4gICAgdm0uc3VibWl0X3ByZXZpZXcgPSBzdWJtaXRfcHJldmlldztcblxuICAgIGZ1bmN0aW9uIHRvZ2dsZV9uYXZfb3BlbigpIHtcbiAgICAgIHZtLnRlc3Rfc3RlcF9uYXZfb3BlbiA9ICF2bS50ZXN0X3N0ZXBfbmF2X29wZW47XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc3VibWl0X3ByZXZpZXcoKSB7XG4gICAgICAvLyDkuLTml7bmlrnmoYhcbiAgICAgIGxvY2FsU3RvcmFnZVNlcnZpY2Uuc2V0KHJlcG9ydF9zdGF0dXNfa2V5LCB7XG4gICAgICAgIHN1Ym1pdGVkOiB0cnVlXG4gICAgICB9KTtcblxuICAgICAgJGxvY2F0aW9uLnVybCgnL2luZGVudHMvdW50ZXN0ZWQnKTtcblxuICAgICAgLy8gVE9ET1xuICAgICAgLy8gMS4g6Lez6L2s5Yiw5oql5ZGK5bGV56S66aG16Z2iKOehruiupOaPkOS6pO+8jOWPr+i/lOWbnilcbiAgICAgIC8vIDIuIOWwhuiuvue9riByZXByb3Qgc3RhdHVzIHN1Ym1pdGVkIOenu+WIsOeCueWHu+ehruiupOaPkOS6pOWQjlxuICAgICAgLy8gMy4g56Gu6K6k5o+Q5Lqk5YiZ6Lez6L2s5Yiw5b2T5aSp5Lu75Yqh55WM6Z2iXG4gICAgfVxuICB9KVxuXG4gIC5jb250cm9sbGVyKCdQaG90b1JlcG9ydEVkaXRDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkbG9nLCAkc3RhdGVQYXJhbXMsICR0ZW1wbGF0ZUNhY2hlLCBsb2NhbFN0b3JhZ2VTZXJ2aWNlLCBLZXlNZ3IpIHtcbiAgICB2YXIgdm0gPSAkc2NvcGU7XG5cbiAgICB2YXIgb3JkZXJfaWQgPSAkc3RhdGVQYXJhbXMuaW5kZW50X2lkO1xuICAgIHZhciBjYXJfaWQgPSAkc3RhdGVQYXJhbXMuY2FyX2lkO1xuICAgIC8vIOihqOWNlemhueaVsOaNruWtmOWCqOWIsOacrOWcsOeahCBrZXkg55qE55Sf5oiQ6KeE5YiZXG4gICAgdmFyIHJlcG9ydF9rZXkgPSBLZXlNZ3IucmVwb3J0KG9yZGVyX2lkLCBjYXJfaWQpO1xuICAgIHZhciByZXBvcnRfZXJyX2tleSA9IEtleU1nci5lcnIocmVwb3J0X2tleSk7XG4gICAgdmFyIGluaXRfZGF0YSA9IGxvY2FsU3RvcmFnZVNlcnZpY2UuZ2V0KHJlcG9ydF9rZXkpO1xuXG4gICAgdmFyIHBhcnRfanNvbiA9IEpTT04ucGFyc2UoJHRlbXBsYXRlQ2FjaGUuZ2V0KCdyZXBvcnQvaS5qc29uJykpO1xuICAgIC8vIOeFp+eJh+euoeeQhum7mOiupOS4uuacgOWQjuS4gOmhuVxuICAgIHZhciBwYXJlbnRfcGFydCA9IHBhcnRfanNvbltwYXJ0X2pzb24ubGVuZ3RoIC0gMV07XG4gICAgdmFyIGN1cnJlbnRfcGFydCA9IHBhcmVudF9wYXJ0LmlkO1xuXG4gICAgLy8g5b2T5YmN6aG25bGC5YiG57G75pys6Lqr5Li05pe25a2Y5YKo56m66Ze0XG4gICAgdm0uZGF0YSA9IHt9O1xuICAgIC8vIOe7meW9k+WJjemhtuWxguWIhuexu+eUs+ivtyBsb2NhbCBzdG9yYWdlIOWtmOWCqOepuumXtFxuICAgIGluaXRfZGF0YVtjdXJyZW50X3BhcnRdID0gaW5pdF9kYXRhW2N1cnJlbnRfcGFydF0gfHwge307XG4gICAgLy8g5bCG5Lul5YmN5L+d5a2Y55qE57uT5p6c5Y+W5Ye677yM5bm25YaZ5YWl5Li05pe25a2Y5YKo56m66Ze0XG4gICAgYW5ndWxhci5leHRlbmQodm0uZGF0YSwgaW5pdF9kYXRhW2N1cnJlbnRfcGFydF0pO1xuICAgIC8vIOW9k+WJjeeahOS6jOe6p+WIhuexu1xuICAgIHZtLnBhcnRzID0gcGFyZW50X3BhcnQuY2hpbGRyZW47XG5cbiAgICBpZiAodm0ucGFydHMgJiYgdm0ucGFydHMubGVuZ3RoKSB7XG4gICAgICAvLyDorr7nva7nrKzkuIDmnaHpu5jorqTlsZXlvIBcbiAgICAgIHZtLnBhcnRzWzBdLmlzX29wZW4gPSB0cnVlO1xuXG4gICAgICAvLyDliJ3lp4vljJbmi43nhafpobksIOiuvue9ruaLjeeFp+mhueS4uuacrOWcsOeFp+eJh+aIlm51bGxcbiAgICAgIHZtLnBhcnRzLmZvckVhY2goZnVuY3Rpb24ocGFydCkge1xuICAgICAgICBwYXJ0LmltYWdlLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgIHZtLmRhdGFbaXRlbS5pZF0gPSB2bS5kYXRhW2l0ZW0uaWRdIHx8IHsgaW1hZ2U6IG51bGwgfTtcbiAgICAgICAgfSk7XG4gICAgICB9KTsgIFxuICAgIH1cblxuICAgIC8vIOWFtuS7liBwYXJ0IOS4tOaXtuWtmOWCqOepuumXtFxuICAgIHZtLmRhdGFfb3RoZXIgPSB7fTtcbiAgICAvLyDlhbbku5YgcGFydCDku6XliY3kv53lrZjlnKjmnKzlnLDnmoTmlbDmja5cbiAgICB2YXIgcGhvdG9fb2ZfZ3JvdXAgPSBsb2NhbFN0b3JhZ2VTZXJ2aWNlLmdldChyZXBvcnRfZXJyX2tleSk7XG4gICAgLy8g5qC85byP5YyW5Lul5YmN5L+d5a2Y5Zyo5pys5Zyw55qE5YW25LuWIHBhcnQg5pWw5o2u77yM5pa55L6/5bGV56S6XG4gICAgdm0ucGFydF9waG90b3MgPSBfLm1hcChwaG90b19vZl9ncm91cCwgZnVuY3Rpb24oaXRlbSwga2V5KSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBpZDoga2V5LFxuICAgICAgICBuYW1lOiBnZXRfcGFydF9uYW1lKGtleSksXG4gICAgICAgIHBob3RvczogaXRlbVxuICAgICAgfTtcbiAgICB9KTtcbiAgICAvLyDlsIbku6XliY3kv53lrZjlnKjmnKzlnLDnmoTnu5Pmnpzlj5blh7rvvIzlubblhpnlhaXkuLTml7blrZjlgqjnqbrpl7RcbiAgICBfKHBob3RvX29mX2dyb3VwKS52YWx1ZXMoKS5mbGF0dGVuKCkuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICB2bS5kYXRhX290aGVyW2l0ZW0uaWRdID0gaXRlbTtcbiAgICB9KTtcbiAgICAvLyDmoLnmja7pobblsYLliIbnsbsgaWQg5p+l5om+IOmhtuWxguWIhuexu+eahCBuYW1lXG4gICAgZnVuY3Rpb24gZ2V0X3BhcnRfbmFtZShwYXJ0X2lkKSB7XG4gICAgICByZXR1cm4gcGFydF9qc29uLmZpbmQoZnVuY3Rpb24ocGFydCkge1xuICAgICAgICByZXR1cm4gcGFydC5pZCA9PSBwYXJ0X2lkO1xuICAgICAgfSkubmFtZTtcbiAgICB9XG5cbiAgICAvLyDmi43nhafmk43kvZxcbiAgICB2bS50YWtlX3Bob3RvID0gdGFrZV9waG90bztcbiAgICAvLyBjYXRlZ29yeSDljLrliIbmmK/lvZPliY3pobblsYLliIbnsbvlrZDpobnnmoTmi43nhafkuI7lhbbku5bpobblsYLliIbnsbvlrZDpobnnmoTmi43nhadcbiAgICAvLyBzZWxmOiDlvZPliY3pobblsYLliIbnsbvnmoTlrZDpoblcbiAgICAvLyBvdGhlcjog5YW25LuW6aG25bGC5YiG57G755qE5a2Q6aG5XG4gICAgZnVuY3Rpb24gdGFrZV9waG90byhjYXRlZ29yeSwgcGFydCwgaXRlbSkge1xuICAgICAgbmF2aWdhdG9yLmNhbWVyYS5nZXRQaWN0dXJlKHRha2VfcGhvdG9fc3VjY2VzcywgdGFrZV9waG90b19lcnJvciwge1xuICAgICAgICBxdWFsaXR5IDogMTAwLFxuICAgICAgICBkZXN0aW5hdGlvblR5cGUgOiBDYW1lcmEuRGVzdGluYXRpb25UeXBlLkZJTEVfVVJJLFxuICAgICAgICBzb3VyY2VUeXBlIDogQ2FtZXJhLlBpY3R1cmVTb3VyY2VUeXBlLkNBTUVSQSxcbiAgICAgICAgYWxsb3dFZGl0IDogdHJ1ZSxcbiAgICAgICAgZW5jb2RpbmdUeXBlOiBDYW1lcmEuRW5jb2RpbmdUeXBlLlBORyxcbiAgICAgICAgLy8gdGFyZ2V0V2lkdGg6IDEwMCxcbiAgICAgICAgLy8gdGFyZ2V0SGVpZ2h0OiAxMDAsXG4gICAgICAgIHNhdmVUb1Bob3RvQWxidW06IGZhbHNlXG4gICAgICB9KTtcblxuICAgICAgZnVuY3Rpb24gdGFrZV9waG90b19zdWNjZXNzKGltZ3VybCkge1xuICAgICAgICAvLyDlvZPliY3pobblsYLliIbnsbvmi43nhadcbiAgICAgICAgaWYgKGNhdGVnb3J5ID09PSAnc2VsZicpIHtcbiAgICAgICAgICB2bS5kYXRhW2l0ZW0uaWRdLmltYWdlID0gaW1ndXJsO1xuXG4gICAgICAgICAgLy8g5Li05pe25a2Y5YKo5pWw5o2u5pys5Zyw5YyW5YiwIGxvY2Fsc3RvcmFnZVxuICAgICAgICAgIC8vIOaWueS+v+S4i+asoei/m+WFpSBhcHAg5bGV56S6XG4gICAgICAgICAgaW5pdF9kYXRhW2N1cnJlbnRfcGFydF0gPSB2bS5kYXRhO1xuICAgICAgICB9IGVsc2UgaWYgKGNhdGVnb3J5ID09PSAnb3RoZXInKSB7XG4gICAgICAgICAgLy8g5YW25LuW6aG25bGC5YiG57G75ouN54WnXG4gICAgICAgICAgdm0uZGF0YV9vdGhlcltpdGVtLmlkXS5pbWFnZSA9IGltZ3VybDtcblxuICAgICAgICAgIC8vIOi/memHjOeahCBwYXJ0IOaYr+mhtuWxguWIhuexu1xuICAgICAgICAgIHZhciBleGlzdHNfaXRlbSA9IHBob3RvX29mX2dyb3VwW3BhcnQuaWRdLmZpbmQoZnVuY3Rpb24oX2l0ZW0pIHtcbiAgICAgICAgICAgIHJldHVybiBfaXRlbS5pZCA9PT0gaXRlbS5pZDtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vIOacrOWcsOWMluWIsOeFp+eJh+aAu+iniCBsb2NhbHN0b3JhZ2VcbiAgICAgICAgICBleGlzdHNfaXRlbS5pbWFnZSA9IGltZ3VybDtcbiAgICAgICAgICBsb2NhbFN0b3JhZ2VTZXJ2aWNlLnNldChyZXBvcnRfZXJyX2tleSwgcGhvdG9fb2ZfZ3JvdXApO1xuICAgICAgICAgIFxuICAgICAgICAgIC8vIOacrOWcsOWMluWIsOaKpeWRiiBsb2NhbHN0b3JhZ2VcbiAgICAgICAgICBpbml0X2RhdGFbcGFydC5pZF1bZXhpc3RzX2l0ZW0uaWRdLmltYWdlID0gaW1ndXJsO1xuICAgICAgICB9XG5cbiAgICAgICAgbG9jYWxTdG9yYWdlU2VydmljZS5zZXQocmVwb3J0X2tleSwgaW5pdF9kYXRhKTtcbiAgICAgICAgLy8g5omL5Yqo6Kem5Y+R6aG16Z2i5riy5p+TXG4gICAgICAgIHZtLiRhcHBseSgpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiB0YWtlX3Bob3RvX2Vycm9yKCkge1xuICAgICAgICAkbG9nLmVycm9yKCfmi43nhaflpLHotKUsIOWIhuexuyAtICcgKyBwYXJ0Lm5hbWUgKyAnLCDpobkgLSAnICsgaXRlbS5uYW1lKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2bS5zaG93X3Bob3RvID0gc2hvd19waG90bztcbiAgICBmdW5jdGlvbiBzaG93X3Bob3RvKGNhdGVnb3J5LCBmaWVsZCkge1xuICAgICAgdmFyIGltYWdlID0gdm1bY2F0ZWdvcnkgPT09ICdzZWxmJyA/ICdkYXRhJyA6ICdkYXRhX290aGVyJ11bZmllbGQuaWRdLmltYWdlO1xuICAgICAgXG4gICAgICBpZiAoIWltYWdlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgRnVsbFNjcmVlbkltYWdlLnNob3dJbWFnZVVSTChpbWFnZSk7XG4gICAgfVxuICB9KVxuXG4gIC5jb250cm9sbGVyKCdSZXBvcnRFZGl0Q3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJGxvZywgJHN0YXRlUGFyYW1zLCAkdGVtcGxhdGVDYWNoZSwgJG1vZGFsLCBsb2NhbFN0b3JhZ2VTZXJ2aWNlLCBLZXlNZ3IpIHtcbiAgICB2YXIgdm0gPSAkc2NvcGU7XG5cbiAgICB2YXIgY3VycmVudF9wYXJ0ID0gcGFyc2VJbnQoJHN0YXRlUGFyYW1zLnBhcnRfaWQpO1xuICAgIHZhciBvcmRlcl9pZCA9ICRzdGF0ZVBhcmFtcy5pbmRlbnRfaWQ7XG4gICAgdmFyIGNhcl9pZCA9ICRzdGF0ZVBhcmFtcy5jYXJfaWQ7XG5cbiAgICAvLyDooajljZXpobnmlbDmja7lrZjlgqjliLDmnKzlnLDnmoQga2V5IOeahOeUn+aIkOinhOWImVxuICAgIHZhciByZXBvcnRfa2V5ID0gS2V5TWdyLnJlcG9ydChvcmRlcl9pZCwgY2FyX2lkKTtcbiAgICB2YXIgcmVwb3J0X2Vycl9rZXkgPSBLZXlNZ3IuZXJyKHJlcG9ydF9rZXkpO1xuICAgIHZhciBpbml0X2RhdGEgPSBsb2NhbFN0b3JhZ2VTZXJ2aWNlLmdldChyZXBvcnRfa2V5KTtcblxuICAgIC8vIOiOt+WPluaKpeWRiui+k+WFpemhueaVsOaNrlxuICAgIHZhciBwYXJlbnRfcGFydCA9IFxuICAgIEpTT05cbiAgICAgIC5wYXJzZSgkdGVtcGxhdGVDYWNoZS5nZXQoJ3JlcG9ydC9pLmpzb24nKSlcbiAgICAgIC5maW5kKGZ1bmN0aW9uKHBhcnQpIHtcbiAgICAgICAgcmV0dXJuIHBhcnQuaWQgPT09IGN1cnJlbnRfcGFydDtcbiAgICAgIH0pO1xuICAgIHZtLnBhcnRzID0gcGFyZW50X3BhcnQgJiYgcGFyZW50X3BhcnQuY2hpbGRyZW47XG5cbiAgICAvLyDnrKzkuIDmnaHpu5jorqTlsZXlvIBcbiAgICBpZiAodm0ucGFydHMgJiYgdm0ucGFydHMubGVuZ3RoKSB7XG4gICAgICB2bS5wYXJ0c1swXS5pc19vcGVuID0gdHJ1ZTtcbiAgICB9XG5cbiAgICB2bS5kYXRhID0ge307XG5cbiAgICAvLyDorr7nva7liJ3lp4vljJblgLxcbiAgICBhbmd1bGFyLmV4dGVuZCh2bS5kYXRhLCBpbml0X2RhdGEgJiYgaW5pdF9kYXRhW2N1cnJlbnRfcGFydF0gfHwge30pO1xuXG4gICAgdm0ucGFydHMuZm9yRWFjaChmdW5jdGlvbihwYXJ0KSB7XG4gICAgICBpZiAocGFydC5yYWRpb193aXRoX3N0YXR1c19kZWdyZWVzICYmIHBhcnQucmFkaW9fd2l0aF9zdGF0dXNfZGVncmVlcy5sZW5ndGgpIHtcbiAgICAgICAgcGFydC5yYWRpb193aXRoX3N0YXR1c19kZWdyZWVzLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgIHZtLmRhdGFbaXRlbS5pZF0gPSB2bS5kYXRhW2l0ZW0uaWRdIHx8IHt9O1xuXG4gICAgICAgICAgaWYgKHZtLmRhdGFbaXRlbS5pZF0ucmVzdWx0ID09IG51bGwpIHtcbiAgICAgICAgICAgIHZtLmRhdGFbaXRlbS5pZF0ucmVzdWx0ID0gXCIxXCI7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIGRhdGEg5pS55Y+Y5YiZ5bCG5YW25L+d5a2Y5YiwIGxvY2FsIHN0b3JhZ2VcbiAgICB2bS4kd2F0Y2goJ2RhdGEnLCBmdW5jdGlvbih2KSB7XG4gICAgICAkbG9nLmxvZygnZm9ybSBkYXRhOiAnLCBKU09OLnN0cmluZ2lmeSh2KSk7XG5cbiAgICAgIHNhdmUoKTtcblxuICAgICAgc2F2ZV9lcnIoKTtcbiAgICB9LCB0cnVlKTtcblxuICAgIFxuICAgIC8vIOS/neWtmOWIsCBsb2NhbFN0b3JhZ2VcbiAgICAvLyDmlbDmja7moLzlvI/kuLrvvJpcbiAgICAvLyB7XG4gICAgLy8gICBcInIxXCI6IHtcbiAgICAvLyAgICAgXCJyZXN1bHRcIjogMSxcbiAgICAvLyAgICAgXCJzdGF0ZVwiOiAxLFxuICAgIC8vICAgICBcImRlZ3JlZVwiOiAxLFxuICAgIC8vICAgICBcIm1lbW9cIjogXCJ4eHhcIixcbiAgICAvLyAgICAgXCJpbWFnZVwiOiBcIlwiXG4gICAgLy8gICB9XG4gICAgLy8gfVxuICAgIGZ1bmN0aW9uIHNhdmUoKSB7XG4gICAgICB2YXIgZGF0YSA9IGxvY2FsU3RvcmFnZVNlcnZpY2UuZ2V0KHJlcG9ydF9rZXkpIHx8IHt9O1xuICAgICAgZGF0YVtjdXJyZW50X3BhcnRdID0gdm0uZGF0YTtcblxuICAgICAgbG9jYWxTdG9yYWdlU2VydmljZS5zZXQocmVwb3J0X2tleSwgZGF0YSk7XG5cbiAgICAgICRsb2cubG9nKCflvZXlhaXmo4DmtYvmiqXlkYogLSAnICsgcmVwb3J0X2tleSwgZGF0YVtjdXJyZW50X3BhcnRdKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzYXZlX2VycigpIHtcbiAgICAgIHZhciBkYXRhID0gbG9jYWxTdG9yYWdlU2VydmljZS5nZXQocmVwb3J0X2Vycl9rZXkpIHx8IHt9O1xuICAgICAgdmFyIGVycl9pdGVtcyA9IFtdO1xuXG4gICAgICAvLyDnrZvpgInlh7rnvLrpmbfnmoTpobnvvIzmiJbpnIDopoHmi43nhafnmoTpoblcbiAgICAgIF8uZWFjaCh2bS5kYXRhLCBmdW5jdGlvbihpdGVtLCBrZXkpIHtcbiAgICAgICAgaWYgKGl0ZW0uaW1hZ2UpIHtcbiAgICAgICAgICBpdGVtLmlkID0ga2V5O1xuICAgICAgICAgIGVycl9pdGVtcy5wdXNoKGl0ZW0pO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8g5aaC5p6c6K+lIHBhcnQg5rKh5pyJ5ouN54WnXG4gICAgICBpZiAoIWVycl9pdGVtcy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgXG4gICAgICBkYXRhW2N1cnJlbnRfcGFydF0gPSBlcnJfaXRlbXM7XG5cbiAgICAgIGxvY2FsU3RvcmFnZVNlcnZpY2Uuc2V0KHJlcG9ydF9lcnJfa2V5LCBkYXRhKTtcblxuICAgICAgJGxvZy5sb2coJ+W9leWFpeajgOa1i+aKpeWRiumXrumimOmhuSAtICcgKyByZXBvcnRfZXJyX2tleSwgZGF0YVtjdXJyZW50X3BhcnRdKTtcbiAgICB9XG5cbiAgICB2bS5zaG93X2RldGFpbCA9IHNob3dfZGV0YWlsO1xuICAgIHZtLnNob3VsZF9jbGVhciA9IHNob3VsZF9jbGVhcjtcbiAgICB2bS50YWtlX3Bob3RvID0gdGFrZV9waG90bztcbiAgICB2bS5vcGVuX2RhdGVwaWNrZXIgPSBvcGVuX2RhdGVwaWNrZXI7XG4gICAgdm0uc2hvd190YWtlX3Bob3RvID0gc2hvd190YWtlX3Bob3RvO1xuICAgIHZtLnNob3dfcGhvdG8gPSBzaG93X3Bob3RvO1xuXG4gICAgLy8g6YG/5YWN5bGV56S65Lik5qyhIG1vZGFsXG4gICAgZnVuY3Rpb24gc2hvd19kZXRhaWwoaW5kZXgsIHBhcnQsIGNoZWNrX2l0ZW0pIHtcbiAgICAgIC8vIGNoYW5nZSDkuovku7blj5HnlJ/lnKggY2xpY2sg5LmL5ZCOXG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyDlhbbku5bpgInpobnkuI3lupTor6XlvLnlh7pcbiAgICAgICAgaWYgKHNob3dfZGV0YWlsLmlzX3Nob3cgfHwgcGFyc2VJbnQodm0uZGF0YVtjaGVja19pdGVtLmlkXS5yZXN1bHQpICE9PSAyKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgc2hvd19kZXRhaWwuaXNfc2hvdyA9IHRydWU7XG5cbiAgICAgICAgdmFyIGlucHV0X2RldGFpbF9pbnMgPSAkbW9kYWwub3Blbih7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICdyZXBvcnQvaW5wdXRfZGV0YWlsLmh0bScsXG4gICAgICAgICAgY29udHJvbGxlcjogJ0l0ZW1JbnB1dERldGFpbEN0cmwnLFxuICAgICAgICAgIGJhY2tkcm9wOiAnc3RhdGljJyxcbiAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICBpdGVtX2RldGFpbDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBhbmd1bGFyLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgcGFydF9uYW1lOiBwYXJ0Lm5hbWUsXG4gICAgICAgICAgICAgICAgcGFydF9hbGlhczogcGFydC5hbGlhcyxcbiAgICAgICAgICAgICAgICBpbmRleDogaW5kZXhcbiAgICAgICAgICAgICAgfSwgY2hlY2tfaXRlbSwgdm0uZGF0YVtjaGVja19pdGVtLmlkXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpbnB1dF9kZXRhaWxfaW5zLnJlc3VsdC50aGVuKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICBhbmd1bGFyLmV4dGVuZCh2bS5kYXRhW2NoZWNrX2l0ZW0uaWRdLCBpdGVtLCB7XG4gICAgICAgICAgICBuYW1lOiBjaGVja19pdGVtLm5hbWVcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHNob3dfZGV0YWlsLmlzX3Nob3cgPSBmYWxzZTtcbiAgICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgc2hvd19kZXRhaWwuaXNfc2hvdyA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHNob3dfZGV0YWlsLmlzX3Nob3cgPSBmYWxzZTtcblxuICAgIGZ1bmN0aW9uIHNob3VsZF9jbGVhcihpdGVtKSB7XG4gICAgICAvLyDoi6Xmo4DmtYvml6Dpl67popjvvIzliJnmuIXpmaTkuYvliY3loavlhpnnmoTmjZ/kvKTmlbDmja5cbiAgICAgIHZhciByID0gcGFyc2VJbnQodm0uZGF0YVtpdGVtLmlkXS5yZXN1bHQpO1xuICAgICAgaWYgKHIgIT09IDIgfHwgciAhPT0gNSkge1xuICAgICAgICBhbmd1bGFyLmV4dGVuZCh2bS5kYXRhW2l0ZW0uaWRdLCB7XG4gICAgICAgICAgc3RhdGU6IG51bGwsXG4gICAgICAgICAgZGVncmVlOiBudWxsLFxuICAgICAgICAgIG1lbW86IG51bGwsXG4gICAgICAgICAgaW1hZ2U6IG51bGxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gVE9ET1xuICAgIC8vIOWbvueJh+mihOiniFxuICAgIGZ1bmN0aW9uIHNob3dfcGhvdG8oZmllbGQpIHtcbiAgICAgIEZ1bGxTY3JlZW5JbWFnZS5zaG93SW1hZ2VVUkwodm0uZGF0YVtmaWVsZC5pZF0uaW1hZ2UpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRha2VfcGhvdG8ocGFydCwgaXRlbSkge1xuICAgICAgbmF2aWdhdG9yLmNhbWVyYS5nZXRQaWN0dXJlKHRha2VfcGhvdG9fc3VjY2VzcywgdGFrZV9waG90b19lcnJvciwge1xuICAgICAgICBxdWFsaXR5IDogMTAwLFxuICAgICAgICBkZXN0aW5hdGlvblR5cGUgOiBDYW1lcmEuRGVzdGluYXRpb25UeXBlLkZJTEVfVVJJLFxuICAgICAgICBzb3VyY2VUeXBlIDogQ2FtZXJhLlBpY3R1cmVTb3VyY2VUeXBlLkNBTUVSQSxcbiAgICAgICAgYWxsb3dFZGl0IDogdHJ1ZSxcbiAgICAgICAgZW5jb2RpbmdUeXBlOiBDYW1lcmEuRW5jb2RpbmdUeXBlLlBORyxcbiAgICAgICAgLy8gdGFyZ2V0V2lkdGg6IDEwMCxcbiAgICAgICAgLy8gdGFyZ2V0SGVpZ2h0OiAxMDAsXG4gICAgICAgIHNhdmVUb1Bob3RvQWxidW06IGZhbHNlXG4gICAgICB9KTtcblxuICAgICAgZnVuY3Rpb24gdGFrZV9waG90b19zdWNjZXNzKGltZ3VybCkge1xuICAgICAgICB2bS5kYXRhW2l0ZW0uaWRdID0gYW5ndWxhci5leHRlbmQodm0uZGF0YVtpdGVtLmlkXSB8fCB7fSwge1xuICAgICAgICAgIGltYWdlOiBpbWd1cmwsXG4gICAgICAgICAgbmFtZTogaXRlbS5uYW1lXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZtLiRhcHBseSgpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiB0YWtlX3Bob3RvX2Vycm9yKCkge1xuICAgICAgICAkbG9nLmVycm9yKCfmi43nhaflpLHotKUsIOWIhuexuyAtICcgKyBwYXJ0Lm5hbWUgKyAnLCDpobkgLSAnICsgaXRlbS5uYW1lKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyDml6XmnJ/mjqfku7bmmL7npLov6ZqQ6JePL+emgeeUqFxuICAgIHZtLmRwX3BhcmFtcyA9IHtcbiAgICAgIHNob3dXZWVrczogZmFsc2VcbiAgICB9O1xuICAgIGZ1bmN0aW9uIG9wZW5fZGF0ZXBpY2tlcigkZXZlbnQsIGRwKSB7XG4gICAgICAkZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgdm0uZHBfcGFyYW1zW2RwXSA9IHRydWU7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIHNob3dfdGFrZV9waG90byhpbmRleCwgcGFydCwgY2hlY2tfaXRlbSkge1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHNob3dfdGFrZV9waG90by5pc19zaG93IHx8IHBhcnNlSW50KHZtLmRhdGFbY2hlY2tfaXRlbS5pZF0ucmVzdWx0KSAhPT0gNSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHNob3dfdGFrZV9waG90by5pc19zaG93ID0gdHJ1ZTtcblxuICAgICAgICB2YXIgdGFrZV9waG90b19tb2RhbCA9ICRtb2RhbC5vcGVuKHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3JlcG9ydC90YWtlX3Bob3RvX21vZGFsLmh0bScsXG4gICAgICAgICAgY29udHJvbGxlcjogJ0l0ZW1UYWtlUGhvdG9DdHJsJyxcbiAgICAgICAgICBiYWNrZHJvcDogJ3N0YXRpYycsXG4gICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgaXRlbV9kZXRhaWw6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gYW5ndWxhci5leHRlbmQoe1xuICAgICAgICAgICAgICAgIHBhcnRfbmFtZTogcGFydC5uYW1lLFxuICAgICAgICAgICAgICAgIHBhcnRfYWxpYXM6IHBhcnQuYWxpYXMsXG4gICAgICAgICAgICAgICAgaW5kZXg6IGluZGV4XG4gICAgICAgICAgICAgIH0sIGNoZWNrX2l0ZW0sIHZtLmRhdGFbY2hlY2tfaXRlbS5pZF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGFrZV9waG90b19tb2RhbC5yZXN1bHQudGhlbihmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgYW5ndWxhci5leHRlbmQodm0uZGF0YVtjaGVja19pdGVtLmlkXSwgaXRlbSwge1xuICAgICAgICAgICAgbmFtZTogY2hlY2tfaXRlbS5uYW1lXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBzaG93X3Rha2VfcGhvdG8uaXNfc2hvdyA9IGZhbHNlO1xuICAgICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBzaG93X3Rha2VfcGhvdG8uaXNfc2hvdyA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHNob3dfdGFrZV9waG90by5pc19zaG93ID0gZmFsc2U7XG4gIH0pXG5cbiAgLmNvbnRyb2xsZXIoJ0l0ZW1JbnB1dERldGFpbEN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRsb2csICRtb2RhbEluc3RhbmNlLCBpdGVtX2RldGFpbCkge1xuICAgIHZhciB2bSA9ICRzY29wZTtcblxuICAgIGFuZ3VsYXIuZXh0ZW5kKHZtLCBpdGVtX2RldGFpbCk7XG5cbiAgICB2bS5zdWJtaXQgPSBzdWJtaXQ7XG4gICAgdm0uY2FuY2VsID0gY2FuY2VsO1xuICAgIHZtLnRha2VfcGhvdG8gPSB0YWtlX3Bob3RvO1xuICAgIHZtLnNob3dfcGhvdG8gPSBzaG93X3Bob3RvO1xuXG4gICAgZnVuY3Rpb24gc3VibWl0KCkge1xuICAgICAgJG1vZGFsSW5zdGFuY2UuY2xvc2Uoe1xuICAgICAgICBzdGF0ZTogdm0uc3RhdGUsXG4gICAgICAgIGRlZ3JlZTogdm0uZGVncmVlLFxuICAgICAgICBtZW1vOiB2bS5tZW1vLFxuICAgICAgICBpbWFnZTogdm0uaW1hZ2VcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNhbmNlbCgpIHtcbiAgICAgICRtb2RhbEluc3RhbmNlLmRpc21pc3MoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzaG93X3Bob3RvKGltYWdlKSB7XG4gICAgICBpZiAoIWltYWdlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgRnVsbFNjcmVlbkltYWdlLnNob3dJbWFnZVVSTChpbWFnZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdGFrZV9waG90bygpIHtcbiAgICAgIG5hdmlnYXRvci5jYW1lcmEuZ2V0UGljdHVyZSh0YWtlX3Bob3RvX3N1Y2Nlc3MsIHRha2VfcGhvdG9fZXJyb3IsIHtcbiAgICAgICAgcXVhbGl0eSA6IDEwMCxcbiAgICAgICAgZGVzdGluYXRpb25UeXBlIDogQ2FtZXJhLkRlc3RpbmF0aW9uVHlwZS5GSUxFX1VSSSxcbiAgICAgICAgc291cmNlVHlwZSA6IENhbWVyYS5QaWN0dXJlU291cmNlVHlwZS5DQU1FUkEsXG4gICAgICAgIGFsbG93RWRpdCA6IHRydWUsXG4gICAgICAgIGVuY29kaW5nVHlwZTogQ2FtZXJhLkVuY29kaW5nVHlwZS5QTkcsXG4gICAgICAgIC8vIHRhcmdldFdpZHRoOiAxMDAsXG4gICAgICAgIC8vIHRhcmdldEhlaWdodDogMTAwLFxuICAgICAgICBzYXZlVG9QaG90b0FsYnVtOiBmYWxzZVxuICAgICAgfSk7XG5cbiAgICAgIGZ1bmN0aW9uIHRha2VfcGhvdG9fc3VjY2VzcyhpbWd1cmwpIHtcbiAgICAgICAgdm0uaW1hZ2UgPSBpbWd1cmw7XG4gICAgICAgIHZtLiRhcHBseSgpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiB0YWtlX3Bob3RvX2Vycm9yKCkge1xuICAgICAgICAkbG9nLmVycm9yKCfmi43nhaflpLHotKUsIOWIhuexuyAtICcgKyBpdGVtX2RldGFpbC5wYXJ0X25hbWUgKyAnLCDpobkgLSAnICsgaXRlbV9kZXRhaWwubmFtZSk7XG4gICAgICB9XG4gICAgfVxuICB9KVxuXG4gIC5jb250cm9sbGVyKCdJdGVtVGFrZVBob3RvQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJGxvZywgJG1vZGFsSW5zdGFuY2UsIGl0ZW1fZGV0YWlsKSB7XG4gICAgICB2YXIgdm0gPSAkc2NvcGU7XG5cbiAgICAgIGFuZ3VsYXIuZXh0ZW5kKHZtLCBpdGVtX2RldGFpbCk7XG5cbiAgICAgIHZtLnN1Ym1pdCA9IHN1Ym1pdDtcbiAgICAgIHZtLmNhbmNlbCA9IGNhbmNlbDtcbiAgICAgIHZtLnRha2VfcGhvdG8gPSB0YWtlX3Bob3RvO1xuICAgICAgdm0uc2hvd19waG90byA9IHNob3dfcGhvdG87XG5cbiAgICAgIGZ1bmN0aW9uIHN1Ym1pdCgpIHtcbiAgICAgICAgJG1vZGFsSW5zdGFuY2UuY2xvc2Uoe1xuICAgICAgICAgIGltYWdlOiB2bS5pbWFnZVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gY2FuY2VsKCkge1xuICAgICAgICAkbW9kYWxJbnN0YW5jZS5kaXNtaXNzKCk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHNob3dfcGhvdG8oaW1hZ2UpIHtcbiAgICAgICAgaWYgKCFpbWFnZSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIEZ1bGxTY3JlZW5JbWFnZS5zaG93SW1hZ2VVUkwoaW1hZ2UpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiB0YWtlX3Bob3RvKCkge1xuICAgICAgICBuYXZpZ2F0b3IuY2FtZXJhLmdldFBpY3R1cmUodGFrZV9waG90b19zdWNjZXNzLCB0YWtlX3Bob3RvX2Vycm9yLCB7XG4gICAgICAgICAgcXVhbGl0eSA6IDEwMCxcbiAgICAgICAgICBkZXN0aW5hdGlvblR5cGUgOiBDYW1lcmEuRGVzdGluYXRpb25UeXBlLkZJTEVfVVJJLFxuICAgICAgICAgIHNvdXJjZVR5cGUgOiBDYW1lcmEuUGljdHVyZVNvdXJjZVR5cGUuQ0FNRVJBLFxuICAgICAgICAgIGFsbG93RWRpdCA6IHRydWUsXG4gICAgICAgICAgZW5jb2RpbmdUeXBlOiBDYW1lcmEuRW5jb2RpbmdUeXBlLlBORyxcbiAgICAgICAgICAvLyB0YXJnZXRXaWR0aDogMTAwLFxuICAgICAgICAgIC8vIHRhcmdldEhlaWdodDogMTAwLFxuICAgICAgICAgIHNhdmVUb1Bob3RvQWxidW06IGZhbHNlXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZ1bmN0aW9uIHRha2VfcGhvdG9fc3VjY2VzcyhpbWd1cmwpIHtcbiAgICAgICAgICB2bS5pbWFnZSA9IGltZ3VybDtcbiAgICAgICAgICB2bS4kYXBwbHkoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHRha2VfcGhvdG9fZXJyb3IoKSB7XG4gICAgICAgICAgJGxvZy5lcnJvcign5ouN54Wn5aSx6LSlLCDliIbnsbsgLSAnICsgaXRlbV9kZXRhaWwucGFydF9uYW1lICsgJywg6aG5IC0gJyArIGl0ZW1fZGV0YWlsLm5hbWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gIH0pXG5cbiAgLmNvbnRyb2xsZXIoJ1JlcG9ydExpc3RDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkbG9jYXRpb24sIFJlcG9ydHNTdmMsIEluZGVudEVudW1zLCB0b2FzdHIpIHtcbiAgICB2YXIgdm0gPSAkc2NvcGU7XG4gICAgdmFyIHFzbyA9ICRsb2NhdGlvbi5zZWFyY2goKTtcblxuICAgIHZtLnBhZ2UgPSBwYXJzZUludChxc28ucGFnZSkgfHwgMTtcbiAgICB2bS5zaXplID0gcGFyc2VJbnQocXNvLnNpemUpIHx8IDIwO1xuICAgIHZtLnNpemVzID0gSW5kZW50RW51bXMubGlzdCgnc2l6ZScpO1xuICAgIHZtLnNpemVfaXRlbSA9IEluZGVudEVudW1zLml0ZW0oJ3NpemUnLCB2bS5zaXplKTtcblxuICAgIHZtLnNpemVfY2hhbmdlID0gc2l6ZV9jaGFuZ2U7XG4gICAgdm0ucGFnZV9jaGFuZ2UgPSBwYWdlX2NoYW5nZTtcblxuICAgIHF1ZXJ5KCk7XG5cbiAgICBmdW5jdGlvbiBxdWVyeSgpIHtcbiAgICAgIHZhciBwYXJhbXMgPSB7XG4gICAgICAgIGl0ZW1zX3BhZ2U6IHZtLnNpemUsXG4gICAgICAgIHBhZ2U6IHZtLnBhZ2UsXG4gICAgICB9O1xuICAgICAgXG4gICAgICAkbG9jYXRpb24uc2VhcmNoKHBhcmFtcyk7XG5cbiAgICAgIFJlcG9ydHNTdmNcbiAgICAgICAgLnF1ZXJ5KHBhcmFtcylcbiAgICAgICAgLiRwcm9taXNlXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJzKSB7XG4gICAgICAgICAgcnMuaXRlbXMuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICBpdGVtLnN0YXR1c190ZXh0ID0gSW5kZW50RW51bXMudGV4dCgnb3JkZXJfc3RhdHVzJywgaXRlbS5zdGF0dXNfaWQpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgdm0uaXRlbXMgPSBycy5pdGVtcztcbiAgICAgICAgICB2bS50b3RhbF9jb3VudCA9IHJzLnRvdGFsX2NvdW50O1xuXG4gICAgICAgICAgdmFyIHRtcCA9IHJzLnRvdGFsX2NvdW50IC8gdm0uc2l6ZTtcbiAgICAgICAgICB2bS5wYWdlX2NvdW50ID0gcnMudG90YWxfY291bnQgJSB2bS5zaXplID09PSAwID8gdG1wIDogKE1hdGguZmxvb3IodG1wKSArIDEpO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgdG9hc3RyLmVycm9yKHJlcy5tc2cgfHwgJ+afpeivouWksei0pe+8jOacjeWKoeWZqOWPkeeUn+acquefpemUmeivr++8jOivt+mHjeivlScpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyDmr4/pobXmnaHmlbDmlLnlj5hcbiAgICBmdW5jdGlvbiBzaXplX2NoYW5nZShzaXplKSB7XG4gICAgICB2bS5zaXplID0gc2l6ZTtcbiAgICAgIHZtLnBhZ2UgPSAxO1xuXG4gICAgICBxdWVyeSgpO1xuICAgIH1cblxuICAgIC8vIOe/u+mhtVxuICAgIGZ1bmN0aW9uIHBhZ2VfY2hhbmdlKHBhZ2UpIHtcbiAgICAgIHZtLnBhZ2UgPSBwYWdlO1xuXG4gICAgICBxdWVyeSgpO1xuICAgIH1cbiAgfSk7XG5cblxuXG5cblxuIiwiYW5ndWxhclxuICAubW9kdWxlKCdndWx1LnJlcG9ydC5zdmNzJywgWyduZ1Jlc291cmNlJ10pXG5cbiAgLnNlcnZpY2UoJ1JlcG9ydHNTdmMnLCBmdW5jdGlvbigkcmVzb3VyY2UpIHtcbiAgICByZXR1cm4gJHJlc291cmNlKEFQSV9TRVJWRVJTLnRlc3RlciArICcvcmVwb3J0cycsIHt9LCB7XG4gICAgICBxdWVyeToge1xuICAgICAgICBpc0FycmF5OiBmYWxzZVxuICAgICAgfVxuICAgIH0pO1xuICB9KVxuXG4gIC5zZXJ2aWNlKCdSZXBvcnRTdmMnLCBmdW5jdGlvbigkcmVzb3VyY2UpIHtcbiAgICByZXR1cm4gJHJlc291cmNlKEFQSV9TRVJWRVJTLnRlc3RlciArICcvcmVwb3J0Jyk7XG4gIH0pOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
