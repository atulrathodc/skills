---
name: angularjs-app
description: Maintain and fix legacy AngularJS (1.x) apps — modules, controllers, services, $http, directives, scope.
allowed-tools: Bash, Read, Grep, Glob, Edit, Write
---

# AngularJS (1.x) App

AngularJS (1.x) is a DIFFERENT framework from Angular (2+). Spot which one the app uses first — Grep for `angular.module`, `$scope`, `ng-controller`, `ng-app`.

1. **Module + bootstrap** — `angular.module('app', [])`; the HTML has `ng-app="app"`. A missing module/dependency list breaks everything — check the module array first.
2. **Controllers + `$scope`** — `ng-controller` + `app.controller('X', function($scope, $http){...})`. Data flows through `$scope`; a template expression that doesn't render is usually a missing/typo'd `$scope` property.
3. **Services via DI** — `app.service('name', ...)` / `app.factory(...)`, injected by parameter NAME (string-match) — a renamed param breaks injection. `$http` for API calls (see `consuming-external-apis`).
4. **Directives** — `ng-if`/`ng-repeat`/`ng-show`/custom directives. A common bug: using Angular 2+ syntax (`*ngIf`) in an AngularJS template — it silently does nothing.
5. **Two-way binding** — `ng-model` mutates `$scope` live. A "state doesn't update" bug is often `ng-model` on the wrong element or a missing `$scope.$apply` after an async callback outside Angular's digest (use `$timeout`/`$http` instead of raw callbacks).
6. **Build/run** — usually no build step; serve the static files (see `make-it-run`). Fix the browser console error first (see `ui-verification`).
7. **Minimal changes** — legacy apps are fragile; change one thing, verify it still loads (see `safe-refactoring`, `minimal-change`).
