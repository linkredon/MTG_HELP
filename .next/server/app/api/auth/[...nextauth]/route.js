"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/auth/[...nextauth]/route";
exports.ids = ["app/api/auth/[...nextauth]/route"];
exports.modules = {

/***/ "mongodb":
/*!**************************!*\
  !*** external "mongodb" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("mongodb");

/***/ }),

/***/ "mongoose":
/*!***************************!*\
  !*** external "mongoose" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("mongoose");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "../../client/components/action-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist\\client\\components\\action-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist\\client\\components\\action-async-storage.external.js");

/***/ }),

/***/ "../../client/components/request-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist\\client\\components\\request-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist\\client\\components\\request-async-storage.external.js");

/***/ }),

/***/ "../../client/components/static-generation-async-storage.external":
/*!*********************************************************************************************!*\
  !*** external "next/dist\\client\\components\\static-generation-async-storage.external.js" ***!
  \*********************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist\\client\\components\\static-generation-async-storage.external.js");

/***/ }),

/***/ "assert":
/*!*************************!*\
  !*** external "assert" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("assert");

/***/ }),

/***/ "buffer":
/*!*************************!*\
  !*** external "buffer" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("buffer");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("events");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "querystring":
/*!******************************!*\
  !*** external "querystring" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("querystring");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("stream");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=C%3A%5CUsers%5CVilarejo%5CDownloads%5Ccolecao-page-main%5CMTG_HELP%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CVilarejo%5CDownloads%5Ccolecao-page-main%5CMTG_HELP&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=C%3A%5CUsers%5CVilarejo%5CDownloads%5Ccolecao-page-main%5CMTG_HELP%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CVilarejo%5CDownloads%5Ccolecao-page-main%5CMTG_HELP&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   headerHooks: () => (/* binding */ headerHooks),\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage),\n/* harmony export */   staticGenerationBailout: () => (/* binding */ staticGenerationBailout)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_Vilarejo_Downloads_colecao_page_main_MTG_HELP_app_api_auth_nextauth_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/auth/[...nextauth]/route.ts */ \"(rsc)/./app/api/auth/[...nextauth]/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/auth/[...nextauth]/route\",\n        pathname: \"/api/auth/[...nextauth]\",\n        filename: \"route\",\n        bundlePath: \"app/api/auth/[...nextauth]/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\Vilarejo\\\\Downloads\\\\colecao-page-main\\\\MTG_HELP\\\\app\\\\api\\\\auth\\\\[...nextauth]\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_Vilarejo_Downloads_colecao_page_main_MTG_HELP_app_api_auth_nextauth_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks, headerHooks, staticGenerationBailout } = routeModule;\nconst originalPathname = \"/api/auth/[...nextauth]/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZhdXRoJTJGJTVCLi4ubmV4dGF1dGglNUQlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmF1dGglMkYlNUIuLi5uZXh0YXV0aCU1RCUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmF1dGglMkYlNUIuLi5uZXh0YXV0aCU1RCUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNWaWxhcmVqbyU1Q0Rvd25sb2FkcyU1Q2NvbGVjYW8tcGFnZS1tYWluJTVDTVRHX0hFTFAlNUNhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPUMlM0ElNUNVc2VycyU1Q1ZpbGFyZWpvJTVDRG93bmxvYWRzJTVDY29sZWNhby1wYWdlLW1haW4lNUNNVEdfSEVMUCZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBc0c7QUFDdkM7QUFDYztBQUNvRDtBQUNqSTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsZ0hBQW1CO0FBQzNDO0FBQ0EsY0FBYyx5RUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLHVHQUF1RztBQUMvRztBQUNBO0FBQ0EsV0FBVyw0RUFBVztBQUN0QjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQzZKOztBQUU3SiIsInNvdXJjZXMiOlsid2VicGFjazovL210Zy1oZWxwZXIvP2E1YTkiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwUm91dGVSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2Z1dHVyZS9yb3V0ZS1tb2R1bGVzL2FwcC1yb3V0ZS9tb2R1bGUuY29tcGlsZWRcIjtcbmltcG9ydCB7IFJvdXRlS2luZCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2Z1dHVyZS9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiQzpcXFxcVXNlcnNcXFxcVmlsYXJlam9cXFxcRG93bmxvYWRzXFxcXGNvbGVjYW8tcGFnZS1tYWluXFxcXE1UR19IRUxQXFxcXGFwcFxcXFxhcGlcXFxcYXV0aFxcXFxbLi4ubmV4dGF1dGhdXFxcXHJvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS9hdXRoL1suLi5uZXh0YXV0aF1cIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIkM6XFxcXFVzZXJzXFxcXFZpbGFyZWpvXFxcXERvd25sb2Fkc1xcXFxjb2xlY2FvLXBhZ2UtbWFpblxcXFxNVEdfSEVMUFxcXFxhcHBcXFxcYXBpXFxcXGF1dGhcXFxcWy4uLm5leHRhdXRoXVxcXFxyb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBoZWFkZXJIb29rcywgc3RhdGljR2VuZXJhdGlvbkJhaWxvdXQgfSA9IHJvdXRlTW9kdWxlO1xuY29uc3Qgb3JpZ2luYWxQYXRobmFtZSA9IFwiL2FwaS9hdXRoL1suLi5uZXh0YXV0aF0vcm91dGVcIjtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgc2VydmVySG9va3MsXG4gICAgICAgIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgaGVhZGVySG9va3MsIHN0YXRpY0dlbmVyYXRpb25CYWlsb3V0LCBvcmlnaW5hbFBhdGhuYW1lLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=C%3A%5CUsers%5CVilarejo%5CDownloads%5Ccolecao-page-main%5CMTG_HELP%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CVilarejo%5CDownloads%5Ccolecao-page-main%5CMTG_HELP&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/auth/[...nextauth]/route.ts":
/*!*********************************************!*\
  !*** ./app/api/auth/[...nextauth]/route.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ handler),\n/* harmony export */   POST: () => (/* binding */ handler)\n/* harmony export */ });\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next-auth */ \"(rsc)/./node_modules/next-auth/index.js\");\n/* harmony import */ var next_auth__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_auth__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next-auth/providers/credentials */ \"(rsc)/./node_modules/next-auth/providers/credentials.js\");\n/* harmony import */ var _next_auth_mongodb_adapter__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @next-auth/mongodb-adapter */ \"(rsc)/./node_modules/@next-auth/mongodb-adapter/dist/index.js\");\n/* harmony import */ var _lib_mongodb__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/lib/mongodb */ \"(rsc)/./lib/mongodb.js\");\n/* harmony import */ var _models_User__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/models/User */ \"(rsc)/./models/User.js\");\n/* harmony import */ var _lib_dbConnect__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/lib/dbConnect */ \"(rsc)/./lib/dbConnect.js\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! bcryptjs */ \"(rsc)/./node_modules/bcryptjs/index.js\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(bcryptjs__WEBPACK_IMPORTED_MODULE_6__);\n\n\n\n\n\n\n\nconst handler = next_auth__WEBPACK_IMPORTED_MODULE_0___default()({\n    adapter: (0,_next_auth_mongodb_adapter__WEBPACK_IMPORTED_MODULE_2__.MongoDBAdapter)(_lib_mongodb__WEBPACK_IMPORTED_MODULE_3__[\"default\"]),\n    providers: [\n        (0,next_auth_providers_credentials__WEBPACK_IMPORTED_MODULE_1__[\"default\"])({\n            name: \"Credentials\",\n            credentials: {\n                email: {\n                    label: \"Email\",\n                    type: \"email\"\n                },\n                password: {\n                    label: \"Senha\",\n                    type: \"password\"\n                }\n            },\n            async authorize (credentials) {\n                if (!credentials?.email || !credentials?.password) {\n                    return null;\n                }\n                try {\n                    await (0,_lib_dbConnect__WEBPACK_IMPORTED_MODULE_5__[\"default\"])();\n                    // Verificar email e senha\n                    const user = await _models_User__WEBPACK_IMPORTED_MODULE_4__[\"default\"].findOne({\n                        email: credentials.email\n                    }).select(\"+password\");\n                    if (!user) {\n                        throw new Error(\"Email ou senha inv\\xe1lidos\");\n                    }\n                    // Verificar se a senha corresponde\n                    const isMatch = await bcryptjs__WEBPACK_IMPORTED_MODULE_6___default().compare(credentials.password, user.password);\n                    if (!isMatch) {\n                        throw new Error(\"Email ou senha inv\\xe1lidos\");\n                    }\n                    // Retornar objeto de usuário sem a senha\n                    return {\n                        id: user._id.toString(),\n                        name: user.name,\n                        email: user.email,\n                        avatar: user.avatar,\n                        role: user.role,\n                        joinedAt: user.joinedAt,\n                        collectionsCount: user.collectionsCount,\n                        totalCards: user.totalCards,\n                        achievements: user.achievements\n                    };\n                } catch (error) {\n                    console.error(\"Erro na autentica\\xe7\\xe3o:\", error);\n                    return null;\n                }\n            }\n        })\n    ],\n    session: {\n        strategy: \"jwt\",\n        maxAge: 30 * 24 * 60 * 60\n    },\n    callbacks: {\n        async jwt ({ token, user }) {\n            if (user) {\n                token.id = user.id;\n                token.role = user.role;\n                token.avatar = user.avatar;\n                token.joinedAt = user.joinedAt;\n                token.collectionsCount = user.collectionsCount;\n                token.totalCards = user.totalCards;\n                token.achievements = user.achievements;\n            }\n            return token;\n        },\n        async session ({ session, token }) {\n            if (session.user) {\n                session.user.id = token.id;\n                session.user.role = token.role;\n                session.user.avatar = token.avatar;\n                session.user.joinedAt = token.joinedAt;\n                session.user.collectionsCount = token.collectionsCount;\n                session.user.totalCards = token.totalCards;\n                session.user.achievements = token.achievements;\n            }\n            return session;\n        }\n    },\n    pages: {\n        signIn: \"/login\",\n        error: \"/login\"\n    },\n    secret: process.env.NEXTAUTH_SECRET,\n    debug: \"development\" === \"development\"\n});\n\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFpQztBQUNpQztBQUNOO0FBQ2xCO0FBQ1Q7QUFDTztBQUNWO0FBRTlCLE1BQU1PLFVBQVVQLGdEQUFRQSxDQUFDO0lBQ3ZCUSxTQUFTTiwwRUFBY0EsQ0FBQ0Msb0RBQWFBO0lBQ3JDTSxXQUFXO1FBQ1RSLDJFQUFtQkEsQ0FBQztZQUNsQlMsTUFBTTtZQUNOQyxhQUFhO2dCQUNYQyxPQUFPO29CQUFFQyxPQUFPO29CQUFTQyxNQUFNO2dCQUFRO2dCQUN2Q0MsVUFBVTtvQkFBRUYsT0FBTztvQkFBU0MsTUFBTTtnQkFBVztZQUMvQztZQUNBLE1BQU1FLFdBQVVMLFdBQVc7Z0JBQ3pCLElBQUksQ0FBQ0EsYUFBYUMsU0FBUyxDQUFDRCxhQUFhSSxVQUFVO29CQUNqRCxPQUFPO2dCQUNUO2dCQUVBLElBQUk7b0JBQ0YsTUFBTVYsMERBQVNBO29CQUVmLDBCQUEwQjtvQkFDMUIsTUFBTVksT0FBTyxNQUFNYixvREFBSUEsQ0FBQ2MsT0FBTyxDQUFDO3dCQUFFTixPQUFPRCxZQUFZQyxLQUFLO29CQUFDLEdBQUdPLE1BQU0sQ0FBQztvQkFFckUsSUFBSSxDQUFDRixNQUFNO3dCQUNULE1BQU0sSUFBSUcsTUFBTTtvQkFDbEI7b0JBRUEsbUNBQW1DO29CQUNuQyxNQUFNQyxVQUFVLE1BQU1mLHVEQUFjLENBQUNLLFlBQVlJLFFBQVEsRUFBRUUsS0FBS0YsUUFBUTtvQkFFeEUsSUFBSSxDQUFDTSxTQUFTO3dCQUNaLE1BQU0sSUFBSUQsTUFBTTtvQkFDbEI7b0JBRUEseUNBQXlDO29CQUN6QyxPQUFPO3dCQUNMRyxJQUFJTixLQUFLTyxHQUFHLENBQUNDLFFBQVE7d0JBQ3JCZixNQUFNTyxLQUFLUCxJQUFJO3dCQUNmRSxPQUFPSyxLQUFLTCxLQUFLO3dCQUNqQmMsUUFBUVQsS0FBS1MsTUFBTTt3QkFDbkJDLE1BQU1WLEtBQUtVLElBQUk7d0JBQ2ZDLFVBQVVYLEtBQUtXLFFBQVE7d0JBQ3ZCQyxrQkFBa0JaLEtBQUtZLGdCQUFnQjt3QkFDdkNDLFlBQVliLEtBQUthLFVBQVU7d0JBQzNCQyxjQUFjZCxLQUFLYyxZQUFZO29CQUNqQztnQkFDRixFQUFFLE9BQU9DLE9BQU87b0JBQ2RDLFFBQVFELEtBQUssQ0FBQywrQkFBeUJBO29CQUN2QyxPQUFPO2dCQUNUO1lBQ0Y7UUFDRjtLQUNEO0lBQ0RFLFNBQVM7UUFDUEMsVUFBVTtRQUNWQyxRQUFRLEtBQUssS0FBSyxLQUFLO0lBQ3pCO0lBQ0FDLFdBQVc7UUFDVCxNQUFNQyxLQUFJLEVBQUVDLEtBQUssRUFBRXRCLElBQUksRUFBRTtZQUN2QixJQUFJQSxNQUFNO2dCQUNSc0IsTUFBTWhCLEVBQUUsR0FBR04sS0FBS00sRUFBRTtnQkFDbEJnQixNQUFNWixJQUFJLEdBQUdWLEtBQUtVLElBQUk7Z0JBQ3RCWSxNQUFNYixNQUFNLEdBQUdULEtBQUtTLE1BQU07Z0JBQzFCYSxNQUFNWCxRQUFRLEdBQUdYLEtBQUtXLFFBQVE7Z0JBQzlCVyxNQUFNVixnQkFBZ0IsR0FBR1osS0FBS1ksZ0JBQWdCO2dCQUM5Q1UsTUFBTVQsVUFBVSxHQUFHYixLQUFLYSxVQUFVO2dCQUNsQ1MsTUFBTVIsWUFBWSxHQUFHZCxLQUFLYyxZQUFZO1lBQ3hDO1lBQ0EsT0FBT1E7UUFDVDtRQUNBLE1BQU1MLFNBQVEsRUFBRUEsT0FBTyxFQUFFSyxLQUFLLEVBQUU7WUFDOUIsSUFBSUwsUUFBUWpCLElBQUksRUFBRTtnQkFDaEJpQixRQUFRakIsSUFBSSxDQUFDTSxFQUFFLEdBQUdnQixNQUFNaEIsRUFBRTtnQkFDMUJXLFFBQVFqQixJQUFJLENBQUNVLElBQUksR0FBR1ksTUFBTVosSUFBSTtnQkFDOUJPLFFBQVFqQixJQUFJLENBQUNTLE1BQU0sR0FBR2EsTUFBTWIsTUFBTTtnQkFDbENRLFFBQVFqQixJQUFJLENBQUNXLFFBQVEsR0FBR1csTUFBTVgsUUFBUTtnQkFDdENNLFFBQVFqQixJQUFJLENBQUNZLGdCQUFnQixHQUFHVSxNQUFNVixnQkFBZ0I7Z0JBQ3RESyxRQUFRakIsSUFBSSxDQUFDYSxVQUFVLEdBQUdTLE1BQU1ULFVBQVU7Z0JBQzFDSSxRQUFRakIsSUFBSSxDQUFDYyxZQUFZLEdBQUdRLE1BQU1SLFlBQVk7WUFDaEQ7WUFDQSxPQUFPRztRQUNUO0lBQ0Y7SUFDQU0sT0FBTztRQUNMQyxRQUFRO1FBQ1JULE9BQU87SUFDVDtJQUNBVSxRQUFRQyxRQUFRQyxHQUFHLENBQUNDLGVBQWU7SUFDbkNDLE9BQU9ILGtCQUF5QjtBQUNsQztBQUUyQyIsInNvdXJjZXMiOlsid2VicGFjazovL210Zy1oZWxwZXIvLi9hcHAvYXBpL2F1dGgvWy4uLm5leHRhdXRoXS9yb3V0ZS50cz9jOGE0Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBOZXh0QXV0aCBmcm9tICduZXh0LWF1dGgnO1xuaW1wb3J0IENyZWRlbnRpYWxzUHJvdmlkZXIgZnJvbSAnbmV4dC1hdXRoL3Byb3ZpZGVycy9jcmVkZW50aWFscyc7XG5pbXBvcnQgeyBNb25nb0RCQWRhcHRlciB9IGZyb20gJ0BuZXh0LWF1dGgvbW9uZ29kYi1hZGFwdGVyJztcbmltcG9ydCBjbGllbnRQcm9taXNlIGZyb20gJ0AvbGliL21vbmdvZGInO1xuaW1wb3J0IFVzZXIgZnJvbSAnQC9tb2RlbHMvVXNlcic7XG5pbXBvcnQgZGJDb25uZWN0IGZyb20gJ0AvbGliL2RiQ29ubmVjdCc7XG5pbXBvcnQgYmNyeXB0IGZyb20gJ2JjcnlwdGpzJztcblxuY29uc3QgaGFuZGxlciA9IE5leHRBdXRoKHtcbiAgYWRhcHRlcjogTW9uZ29EQkFkYXB0ZXIoY2xpZW50UHJvbWlzZSksXG4gIHByb3ZpZGVyczogW1xuICAgIENyZWRlbnRpYWxzUHJvdmlkZXIoe1xuICAgICAgbmFtZTogJ0NyZWRlbnRpYWxzJyxcbiAgICAgIGNyZWRlbnRpYWxzOiB7XG4gICAgICAgIGVtYWlsOiB7IGxhYmVsOiBcIkVtYWlsXCIsIHR5cGU6IFwiZW1haWxcIiB9LFxuICAgICAgICBwYXNzd29yZDogeyBsYWJlbDogXCJTZW5oYVwiLCB0eXBlOiBcInBhc3N3b3JkXCIgfVxuICAgICAgfSxcbiAgICAgIGFzeW5jIGF1dGhvcml6ZShjcmVkZW50aWFscykge1xuICAgICAgICBpZiAoIWNyZWRlbnRpYWxzPy5lbWFpbCB8fCAhY3JlZGVudGlhbHM/LnBhc3N3b3JkKSB7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgIGF3YWl0IGRiQ29ubmVjdCgpO1xuICAgICAgICAgIFxuICAgICAgICAgIC8vIFZlcmlmaWNhciBlbWFpbCBlIHNlbmhhXG4gICAgICAgICAgY29uc3QgdXNlciA9IGF3YWl0IFVzZXIuZmluZE9uZSh7IGVtYWlsOiBjcmVkZW50aWFscy5lbWFpbCB9KS5zZWxlY3QoJytwYXNzd29yZCcpO1xuICAgICAgICAgIFxuICAgICAgICAgIGlmICghdXNlcikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFbWFpbCBvdSBzZW5oYSBpbnbDoWxpZG9zJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIFxuICAgICAgICAgIC8vIFZlcmlmaWNhciBzZSBhIHNlbmhhIGNvcnJlc3BvbmRlXG4gICAgICAgICAgY29uc3QgaXNNYXRjaCA9IGF3YWl0IGJjcnlwdC5jb21wYXJlKGNyZWRlbnRpYWxzLnBhc3N3b3JkLCB1c2VyLnBhc3N3b3JkKTtcbiAgICAgICAgICBcbiAgICAgICAgICBpZiAoIWlzTWF0Y2gpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRW1haWwgb3Ugc2VuaGEgaW52w6FsaWRvcycpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBcbiAgICAgICAgICAvLyBSZXRvcm5hciBvYmpldG8gZGUgdXN1w6FyaW8gc2VtIGEgc2VuaGFcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaWQ6IHVzZXIuX2lkLnRvU3RyaW5nKCksXG4gICAgICAgICAgICBuYW1lOiB1c2VyLm5hbWUsXG4gICAgICAgICAgICBlbWFpbDogdXNlci5lbWFpbCxcbiAgICAgICAgICAgIGF2YXRhcjogdXNlci5hdmF0YXIsXG4gICAgICAgICAgICByb2xlOiB1c2VyLnJvbGUsXG4gICAgICAgICAgICBqb2luZWRBdDogdXNlci5qb2luZWRBdCxcbiAgICAgICAgICAgIGNvbGxlY3Rpb25zQ291bnQ6IHVzZXIuY29sbGVjdGlvbnNDb3VudCxcbiAgICAgICAgICAgIHRvdGFsQ2FyZHM6IHVzZXIudG90YWxDYXJkcyxcbiAgICAgICAgICAgIGFjaGlldmVtZW50czogdXNlci5hY2hpZXZlbWVudHNcbiAgICAgICAgICB9O1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm8gbmEgYXV0ZW50aWNhw6fDo286JywgZXJyb3IpO1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgXSxcbiAgc2Vzc2lvbjoge1xuICAgIHN0cmF0ZWd5OiAnand0JyxcbiAgICBtYXhBZ2U6IDMwICogMjQgKiA2MCAqIDYwLCAvLyAzMCBkaWFzXG4gIH0sXG4gIGNhbGxiYWNrczoge1xuICAgIGFzeW5jIGp3dCh7IHRva2VuLCB1c2VyIH0pIHtcbiAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgIHRva2VuLmlkID0gdXNlci5pZDtcbiAgICAgICAgdG9rZW4ucm9sZSA9IHVzZXIucm9sZTtcbiAgICAgICAgdG9rZW4uYXZhdGFyID0gdXNlci5hdmF0YXI7XG4gICAgICAgIHRva2VuLmpvaW5lZEF0ID0gdXNlci5qb2luZWRBdDtcbiAgICAgICAgdG9rZW4uY29sbGVjdGlvbnNDb3VudCA9IHVzZXIuY29sbGVjdGlvbnNDb3VudDtcbiAgICAgICAgdG9rZW4udG90YWxDYXJkcyA9IHVzZXIudG90YWxDYXJkcztcbiAgICAgICAgdG9rZW4uYWNoaWV2ZW1lbnRzID0gdXNlci5hY2hpZXZlbWVudHM7XG4gICAgICB9XG4gICAgICByZXR1cm4gdG9rZW47XG4gICAgfSxcbiAgICBhc3luYyBzZXNzaW9uKHsgc2Vzc2lvbiwgdG9rZW4gfSkge1xuICAgICAgaWYgKHNlc3Npb24udXNlcikge1xuICAgICAgICBzZXNzaW9uLnVzZXIuaWQgPSB0b2tlbi5pZDtcbiAgICAgICAgc2Vzc2lvbi51c2VyLnJvbGUgPSB0b2tlbi5yb2xlO1xuICAgICAgICBzZXNzaW9uLnVzZXIuYXZhdGFyID0gdG9rZW4uYXZhdGFyO1xuICAgICAgICBzZXNzaW9uLnVzZXIuam9pbmVkQXQgPSB0b2tlbi5qb2luZWRBdDtcbiAgICAgICAgc2Vzc2lvbi51c2VyLmNvbGxlY3Rpb25zQ291bnQgPSB0b2tlbi5jb2xsZWN0aW9uc0NvdW50O1xuICAgICAgICBzZXNzaW9uLnVzZXIudG90YWxDYXJkcyA9IHRva2VuLnRvdGFsQ2FyZHM7XG4gICAgICAgIHNlc3Npb24udXNlci5hY2hpZXZlbWVudHMgPSB0b2tlbi5hY2hpZXZlbWVudHM7XG4gICAgICB9XG4gICAgICByZXR1cm4gc2Vzc2lvbjtcbiAgICB9XG4gIH0sXG4gIHBhZ2VzOiB7XG4gICAgc2lnbkluOiAnL2xvZ2luJyxcbiAgICBlcnJvcjogJy9sb2dpbicsXG4gIH0sXG4gIHNlY3JldDogcHJvY2Vzcy5lbnYuTkVYVEFVVEhfU0VDUkVULFxuICBkZWJ1ZzogcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdkZXZlbG9wbWVudCcsXG59KTtcblxuZXhwb3J0IHsgaGFuZGxlciBhcyBHRVQsIGhhbmRsZXIgYXMgUE9TVCB9OyJdLCJuYW1lcyI6WyJOZXh0QXV0aCIsIkNyZWRlbnRpYWxzUHJvdmlkZXIiLCJNb25nb0RCQWRhcHRlciIsImNsaWVudFByb21pc2UiLCJVc2VyIiwiZGJDb25uZWN0IiwiYmNyeXB0IiwiaGFuZGxlciIsImFkYXB0ZXIiLCJwcm92aWRlcnMiLCJuYW1lIiwiY3JlZGVudGlhbHMiLCJlbWFpbCIsImxhYmVsIiwidHlwZSIsInBhc3N3b3JkIiwiYXV0aG9yaXplIiwidXNlciIsImZpbmRPbmUiLCJzZWxlY3QiLCJFcnJvciIsImlzTWF0Y2giLCJjb21wYXJlIiwiaWQiLCJfaWQiLCJ0b1N0cmluZyIsImF2YXRhciIsInJvbGUiLCJqb2luZWRBdCIsImNvbGxlY3Rpb25zQ291bnQiLCJ0b3RhbENhcmRzIiwiYWNoaWV2ZW1lbnRzIiwiZXJyb3IiLCJjb25zb2xlIiwic2Vzc2lvbiIsInN0cmF0ZWd5IiwibWF4QWdlIiwiY2FsbGJhY2tzIiwiand0IiwidG9rZW4iLCJwYWdlcyIsInNpZ25JbiIsInNlY3JldCIsInByb2Nlc3MiLCJlbnYiLCJORVhUQVVUSF9TRUNSRVQiLCJkZWJ1ZyIsIkdFVCIsIlBPU1QiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/auth/[...nextauth]/route.ts\n");

/***/ }),

/***/ "(rsc)/./lib/dbConnect.js":
/*!**************************!*\
  !*** ./lib/dbConnect.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mongoose */ \"mongoose\");\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(mongoose__WEBPACK_IMPORTED_MODULE_0__);\n\nconst MONGODB_URI = process.env.MONGODB_URI;\nif (!MONGODB_URI) {\n    throw new Error(\"Por favor, defina a vari\\xe1vel de ambiente MONGODB_URI dentro de .env.local\");\n}\n/**\n * Global é usado aqui para manter uma conexão em cache entre hot reloads\n * em desenvolvimento. Isso evita conexões crescentes sempre que\n * o servidor API é reiniciado.\n */ let cached = global.mongoose;\nif (!cached) {\n    cached = global.mongoose = {\n        conn: null,\n        promise: null\n    };\n}\nasync function dbConnect() {\n    if (cached.conn) {\n        return cached.conn;\n    }\n    if (!cached.promise) {\n        const opts = {\n            bufferCommands: false\n        };\n        cached.promise = mongoose__WEBPACK_IMPORTED_MODULE_0___default().connect(MONGODB_URI, opts).then((mongoose)=>{\n            return mongoose;\n        });\n    }\n    cached.conn = await cached.promise;\n    return cached.conn;\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (dbConnect);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvZGJDb25uZWN0LmpzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUFnQztBQUVoQyxNQUFNQyxjQUFjQyxRQUFRQyxHQUFHLENBQUNGLFdBQVc7QUFFM0MsSUFBSSxDQUFDQSxhQUFhO0lBQ2hCLE1BQU0sSUFBSUcsTUFDUjtBQUVKO0FBRUE7Ozs7Q0FJQyxHQUNELElBQUlDLFNBQVNDLE9BQU9OLFFBQVE7QUFFNUIsSUFBSSxDQUFDSyxRQUFRO0lBQ1hBLFNBQVNDLE9BQU9OLFFBQVEsR0FBRztRQUFFTyxNQUFNO1FBQU1DLFNBQVM7SUFBSztBQUN6RDtBQUVBLGVBQWVDO0lBQ2IsSUFBSUosT0FBT0UsSUFBSSxFQUFFO1FBQ2YsT0FBT0YsT0FBT0UsSUFBSTtJQUNwQjtJQUVBLElBQUksQ0FBQ0YsT0FBT0csT0FBTyxFQUFFO1FBQ25CLE1BQU1FLE9BQU87WUFDWEMsZ0JBQWdCO1FBQ2xCO1FBRUFOLE9BQU9HLE9BQU8sR0FBR1IsdURBQWdCLENBQUNDLGFBQWFTLE1BQU1HLElBQUksQ0FBQyxDQUFDYjtZQUN6RCxPQUFPQTtRQUNUO0lBQ0Y7SUFDQUssT0FBT0UsSUFBSSxHQUFHLE1BQU1GLE9BQU9HLE9BQU87SUFDbEMsT0FBT0gsT0FBT0UsSUFBSTtBQUNwQjtBQUVBLGlFQUFlRSxTQUFTQSxFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vbXRnLWhlbHBlci8uL2xpYi9kYkNvbm5lY3QuanM/MWQzYiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgbW9uZ29vc2UgZnJvbSAnbW9uZ29vc2UnO1xuXG5jb25zdCBNT05HT0RCX1VSSSA9IHByb2Nlc3MuZW52Lk1PTkdPREJfVVJJO1xuXG5pZiAoIU1PTkdPREJfVVJJKSB7XG4gIHRocm93IG5ldyBFcnJvcihcbiAgICAnUG9yIGZhdm9yLCBkZWZpbmEgYSB2YXJpw6F2ZWwgZGUgYW1iaWVudGUgTU9OR09EQl9VUkkgZGVudHJvIGRlIC5lbnYubG9jYWwnXG4gICk7XG59XG5cbi8qKlxuICogR2xvYmFsIMOpIHVzYWRvIGFxdWkgcGFyYSBtYW50ZXIgdW1hIGNvbmV4w6NvIGVtIGNhY2hlIGVudHJlIGhvdCByZWxvYWRzXG4gKiBlbSBkZXNlbnZvbHZpbWVudG8uIElzc28gZXZpdGEgY29uZXjDtWVzIGNyZXNjZW50ZXMgc2VtcHJlIHF1ZVxuICogbyBzZXJ2aWRvciBBUEkgw6kgcmVpbmljaWFkby5cbiAqL1xubGV0IGNhY2hlZCA9IGdsb2JhbC5tb25nb29zZTtcblxuaWYgKCFjYWNoZWQpIHtcbiAgY2FjaGVkID0gZ2xvYmFsLm1vbmdvb3NlID0geyBjb25uOiBudWxsLCBwcm9taXNlOiBudWxsIH07XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGRiQ29ubmVjdCgpIHtcbiAgaWYgKGNhY2hlZC5jb25uKSB7XG4gICAgcmV0dXJuIGNhY2hlZC5jb25uO1xuICB9XG5cbiAgaWYgKCFjYWNoZWQucHJvbWlzZSkge1xuICAgIGNvbnN0IG9wdHMgPSB7XG4gICAgICBidWZmZXJDb21tYW5kczogZmFsc2UsXG4gICAgfTtcblxuICAgIGNhY2hlZC5wcm9taXNlID0gbW9uZ29vc2UuY29ubmVjdChNT05HT0RCX1VSSSwgb3B0cykudGhlbigobW9uZ29vc2UpID0+IHtcbiAgICAgIHJldHVybiBtb25nb29zZTtcbiAgICB9KTtcbiAgfVxuICBjYWNoZWQuY29ubiA9IGF3YWl0IGNhY2hlZC5wcm9taXNlO1xuICByZXR1cm4gY2FjaGVkLmNvbm47XG59XG5cbmV4cG9ydCBkZWZhdWx0IGRiQ29ubmVjdDsiXSwibmFtZXMiOlsibW9uZ29vc2UiLCJNT05HT0RCX1VSSSIsInByb2Nlc3MiLCJlbnYiLCJFcnJvciIsImNhY2hlZCIsImdsb2JhbCIsImNvbm4iLCJwcm9taXNlIiwiZGJDb25uZWN0Iiwib3B0cyIsImJ1ZmZlckNvbW1hbmRzIiwiY29ubmVjdCIsInRoZW4iXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./lib/dbConnect.js\n");

/***/ }),

/***/ "(rsc)/./lib/mongodb.js":
/*!************************!*\
  !*** ./lib/mongodb.js ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var mongodb__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mongodb */ \"mongodb\");\n/* harmony import */ var mongodb__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(mongodb__WEBPACK_IMPORTED_MODULE_0__);\n\nconst uri = process.env.MONGODB_URI;\nconst options = {\n    useUnifiedTopology: true,\n    useNewUrlParser: true\n};\nlet client;\nlet clientPromise;\nif (!process.env.MONGODB_URI) {\n    throw new Error(\"Please add your MongoDB URI to .env.local\");\n}\nif (true) {\n    // In development mode, use a global variable so that the value\n    // is preserved across module reloads caused by HMR (Hot Module Replacement).\n    if (!global._mongoClientPromise) {\n        client = new mongodb__WEBPACK_IMPORTED_MODULE_0__.MongoClient(uri, options);\n        global._mongoClientPromise = client.connect();\n    }\n    clientPromise = global._mongoClientPromise;\n} else {}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (clientPromise);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9saWIvbW9uZ29kYi5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBc0M7QUFFdEMsTUFBTUMsTUFBTUMsUUFBUUMsR0FBRyxDQUFDQyxXQUFXO0FBQ25DLE1BQU1DLFVBQVU7SUFDZEMsb0JBQW9CO0lBQ3BCQyxpQkFBaUI7QUFDbkI7QUFFQSxJQUFJQztBQUNKLElBQUlDO0FBRUosSUFBSSxDQUFDUCxRQUFRQyxHQUFHLENBQUNDLFdBQVcsRUFBRTtJQUM1QixNQUFNLElBQUlNLE1BQU07QUFDbEI7QUFFQSxJQUFJUixJQUF5QixFQUFlO0lBQzFDLCtEQUErRDtJQUMvRCw2RUFBNkU7SUFDN0UsSUFBSSxDQUFDUyxPQUFPQyxtQkFBbUIsRUFBRTtRQUMvQkosU0FBUyxJQUFJUixnREFBV0EsQ0FBQ0MsS0FBS0k7UUFDOUJNLE9BQU9DLG1CQUFtQixHQUFHSixPQUFPSyxPQUFPO0lBQzdDO0lBQ0FKLGdCQUFnQkUsT0FBT0MsbUJBQW1CO0FBQzVDLE9BQU8sRUFJTjtBQUVELGlFQUFlSCxhQUFhQSxFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vbXRnLWhlbHBlci8uL2xpYi9tb25nb2RiLmpzP2Q5MjAiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTW9uZ29DbGllbnQgfSBmcm9tICdtb25nb2RiJztcblxuY29uc3QgdXJpID0gcHJvY2Vzcy5lbnYuTU9OR09EQl9VUkk7XG5jb25zdCBvcHRpb25zID0ge1xuICB1c2VVbmlmaWVkVG9wb2xvZ3k6IHRydWUsXG4gIHVzZU5ld1VybFBhcnNlcjogdHJ1ZSxcbn07XG5cbmxldCBjbGllbnQ7XG5sZXQgY2xpZW50UHJvbWlzZTtcblxuaWYgKCFwcm9jZXNzLmVudi5NT05HT0RCX1VSSSkge1xuICB0aHJvdyBuZXcgRXJyb3IoJ1BsZWFzZSBhZGQgeW91ciBNb25nb0RCIFVSSSB0byAuZW52LmxvY2FsJyk7XG59XG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50Jykge1xuICAvLyBJbiBkZXZlbG9wbWVudCBtb2RlLCB1c2UgYSBnbG9iYWwgdmFyaWFibGUgc28gdGhhdCB0aGUgdmFsdWVcbiAgLy8gaXMgcHJlc2VydmVkIGFjcm9zcyBtb2R1bGUgcmVsb2FkcyBjYXVzZWQgYnkgSE1SIChIb3QgTW9kdWxlIFJlcGxhY2VtZW50KS5cbiAgaWYgKCFnbG9iYWwuX21vbmdvQ2xpZW50UHJvbWlzZSkge1xuICAgIGNsaWVudCA9IG5ldyBNb25nb0NsaWVudCh1cmksIG9wdGlvbnMpO1xuICAgIGdsb2JhbC5fbW9uZ29DbGllbnRQcm9taXNlID0gY2xpZW50LmNvbm5lY3QoKTtcbiAgfVxuICBjbGllbnRQcm9taXNlID0gZ2xvYmFsLl9tb25nb0NsaWVudFByb21pc2U7XG59IGVsc2Uge1xuICAvLyBJbiBwcm9kdWN0aW9uIG1vZGUsIGl0J3MgYmVzdCB0byBub3QgdXNlIGEgZ2xvYmFsIHZhcmlhYmxlLlxuICBjbGllbnQgPSBuZXcgTW9uZ29DbGllbnQodXJpLCBvcHRpb25zKTtcbiAgY2xpZW50UHJvbWlzZSA9IGNsaWVudC5jb25uZWN0KCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsaWVudFByb21pc2U7Il0sIm5hbWVzIjpbIk1vbmdvQ2xpZW50IiwidXJpIiwicHJvY2VzcyIsImVudiIsIk1PTkdPREJfVVJJIiwib3B0aW9ucyIsInVzZVVuaWZpZWRUb3BvbG9neSIsInVzZU5ld1VybFBhcnNlciIsImNsaWVudCIsImNsaWVudFByb21pc2UiLCJFcnJvciIsImdsb2JhbCIsIl9tb25nb0NsaWVudFByb21pc2UiLCJjb25uZWN0Il0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./lib/mongodb.js\n");

/***/ }),

/***/ "(rsc)/./models/User.js":
/*!************************!*\
  !*** ./models/User.js ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mongoose */ \"mongoose\");\n/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(mongoose__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! bcryptjs */ \"(rsc)/./node_modules/bcryptjs/index.js\");\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(bcryptjs__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var jsonwebtoken__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! jsonwebtoken */ \"(rsc)/./node_modules/jsonwebtoken/index.js\");\n/* harmony import */ var jsonwebtoken__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(jsonwebtoken__WEBPACK_IMPORTED_MODULE_2__);\n\n\n\nconst UserSchema = new (mongoose__WEBPACK_IMPORTED_MODULE_0___default().Schema)({\n    name: {\n        type: String,\n        required: [\n            true,\n            \"Por favor, forne\\xe7a um nome\"\n        ],\n        maxlength: [\n            50,\n            \"Nome n\\xe3o pode ter mais de 50 caracteres\"\n        ]\n    },\n    email: {\n        type: String,\n        required: [\n            true,\n            \"Por favor, forne\\xe7a um email\"\n        ],\n        unique: true,\n        match: [\n            /^\\w+([\\.-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,3})+$/,\n            \"Por favor, forne\\xe7a um email v\\xe1lido\"\n        ]\n    },\n    password: {\n        type: String,\n        required: [\n            true,\n            \"Por favor, forne\\xe7a uma senha\"\n        ],\n        minlength: [\n            6,\n            \"Senha deve ter pelo menos 6 caracteres\"\n        ],\n        select: false\n    },\n    avatar: {\n        type: String,\n        default: \"\"\n    },\n    joinedAt: {\n        type: Date,\n        default: Date.now\n    },\n    collectionsCount: {\n        type: Number,\n        default: 0\n    },\n    totalCards: {\n        type: Number,\n        default: 0\n    },\n    achievements: {\n        type: Array,\n        default: []\n    },\n    role: {\n        type: String,\n        enum: [\n            \"user\",\n            \"admin\"\n        ],\n        default: \"user\"\n    },\n    resetPasswordToken: String,\n    resetPasswordExpire: Date\n}, {\n    timestamps: true\n});\n// Criptografar senha antes de salvar\nUserSchema.pre(\"save\", async function(next) {\n    if (!this.isModified(\"password\")) {\n        next();\n    }\n    const salt = await bcryptjs__WEBPACK_IMPORTED_MODULE_1___default().genSalt(10);\n    this.password = await bcryptjs__WEBPACK_IMPORTED_MODULE_1___default().hash(this.password, salt);\n});\n// Método para verificar senha\nUserSchema.methods.matchPassword = async function(enteredPassword) {\n    return await bcryptjs__WEBPACK_IMPORTED_MODULE_1___default().compare(enteredPassword, this.password);\n};\n// Método para gerar token JWT\nUserSchema.methods.getSignedJwtToken = function() {\n    return jsonwebtoken__WEBPACK_IMPORTED_MODULE_2___default().sign({\n        id: this._id\n    }, process.env.JWT_SECRET, {\n        expiresIn: process.env.JWT_EXPIRE\n    });\n};\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((mongoose__WEBPACK_IMPORTED_MODULE_0___default().models).User || mongoose__WEBPACK_IMPORTED_MODULE_0___default().model(\"User\", UserSchema));\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9tb2RlbHMvVXNlci5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQWdDO0FBQ0Y7QUFDQztBQUUvQixNQUFNRyxhQUFhLElBQUlILHdEQUFlLENBQUM7SUFDckNLLE1BQU07UUFDSkMsTUFBTUM7UUFDTkMsVUFBVTtZQUFDO1lBQU07U0FBNkI7UUFDOUNDLFdBQVc7WUFBQztZQUFJO1NBQTBDO0lBQzVEO0lBQ0FDLE9BQU87UUFDTEosTUFBTUM7UUFDTkMsVUFBVTtZQUFDO1lBQU07U0FBOEI7UUFDL0NHLFFBQVE7UUFDUkMsT0FBTztZQUNMO1lBQ0E7U0FDRDtJQUNIO0lBQ0FDLFVBQVU7UUFDUlAsTUFBTUM7UUFDTkMsVUFBVTtZQUFDO1lBQU07U0FBK0I7UUFDaERNLFdBQVc7WUFBQztZQUFHO1NBQXlDO1FBQ3hEQyxRQUFRO0lBQ1Y7SUFDQUMsUUFBUTtRQUNOVixNQUFNQztRQUNOVSxTQUFTO0lBQ1g7SUFDQUMsVUFBVTtRQUNSWixNQUFNYTtRQUNORixTQUFTRSxLQUFLQyxHQUFHO0lBQ25CO0lBQ0FDLGtCQUFrQjtRQUNoQmYsTUFBTWdCO1FBQ05MLFNBQVM7SUFDWDtJQUNBTSxZQUFZO1FBQ1ZqQixNQUFNZ0I7UUFDTkwsU0FBUztJQUNYO0lBQ0FPLGNBQWM7UUFDWmxCLE1BQU1tQjtRQUNOUixTQUFTLEVBQUU7SUFDYjtJQUNBUyxNQUFNO1FBQ0pwQixNQUFNQztRQUNOb0IsTUFBTTtZQUFDO1lBQVE7U0FBUTtRQUN2QlYsU0FBUztJQUNYO0lBQ0FXLG9CQUFvQnJCO0lBQ3BCc0IscUJBQXFCVjtBQUN2QixHQUFHO0lBQ0RXLFlBQVk7QUFDZDtBQUVBLHFDQUFxQztBQUNyQzNCLFdBQVc0QixHQUFHLENBQUMsUUFBUSxlQUFlQyxJQUFJO0lBQ3hDLElBQUksQ0FBQyxJQUFJLENBQUNDLFVBQVUsQ0FBQyxhQUFhO1FBQ2hDRDtJQUNGO0lBRUEsTUFBTUUsT0FBTyxNQUFNakMsdURBQWMsQ0FBQztJQUNsQyxJQUFJLENBQUNZLFFBQVEsR0FBRyxNQUFNWixvREFBVyxDQUFDLElBQUksQ0FBQ1ksUUFBUSxFQUFFcUI7QUFDbkQ7QUFFQSw4QkFBOEI7QUFDOUIvQixXQUFXa0MsT0FBTyxDQUFDQyxhQUFhLEdBQUcsZUFBZUMsZUFBZTtJQUMvRCxPQUFPLE1BQU10Qyx1REFBYyxDQUFDc0MsaUJBQWlCLElBQUksQ0FBQzFCLFFBQVE7QUFDNUQ7QUFFQSw4QkFBOEI7QUFDOUJWLFdBQVdrQyxPQUFPLENBQUNJLGlCQUFpQixHQUFHO0lBQ3JDLE9BQU92Qyx3REFBUSxDQUFDO1FBQUV5QyxJQUFJLElBQUksQ0FBQ0MsR0FBRztJQUFDLEdBQUdDLFFBQVFDLEdBQUcsQ0FBQ0MsVUFBVSxFQUFFO1FBQ3hEQyxXQUFXSCxRQUFRQyxHQUFHLENBQUNHLFVBQVU7SUFDbkM7QUFDRjtBQUVBLGlFQUFlakQsd0RBQWUsQ0FBQ21ELElBQUksSUFBSW5ELHFEQUFjLENBQUMsUUFBUUcsV0FBV0EsRUFBQyIsInNvdXJjZXMiOlsid2VicGFjazovL210Zy1oZWxwZXIvLi9tb2RlbHMvVXNlci5qcz83MzY3Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBtb25nb29zZSBmcm9tICdtb25nb29zZSc7XG5pbXBvcnQgYmNyeXB0IGZyb20gJ2JjcnlwdGpzJztcbmltcG9ydCBqd3QgZnJvbSAnanNvbndlYnRva2VuJztcblxuY29uc3QgVXNlclNjaGVtYSA9IG5ldyBtb25nb29zZS5TY2hlbWEoe1xuICBuYW1lOiB7XG4gICAgdHlwZTogU3RyaW5nLFxuICAgIHJlcXVpcmVkOiBbdHJ1ZSwgJ1BvciBmYXZvciwgZm9ybmXDp2EgdW0gbm9tZSddLFxuICAgIG1heGxlbmd0aDogWzUwLCAnTm9tZSBuw6NvIHBvZGUgdGVyIG1haXMgZGUgNTAgY2FyYWN0ZXJlcyddXG4gIH0sXG4gIGVtYWlsOiB7XG4gICAgdHlwZTogU3RyaW5nLFxuICAgIHJlcXVpcmVkOiBbdHJ1ZSwgJ1BvciBmYXZvciwgZm9ybmXDp2EgdW0gZW1haWwnXSxcbiAgICB1bmlxdWU6IHRydWUsXG4gICAgbWF0Y2g6IFtcbiAgICAgIC9eXFx3KyhbXFwuLV0/XFx3KykqQFxcdysoW1xcLi1dP1xcdyspKihcXC5cXHd7MiwzfSkrJC8sXG4gICAgICAnUG9yIGZhdm9yLCBmb3JuZcOnYSB1bSBlbWFpbCB2w6FsaWRvJ1xuICAgIF1cbiAgfSxcbiAgcGFzc3dvcmQ6IHtcbiAgICB0eXBlOiBTdHJpbmcsXG4gICAgcmVxdWlyZWQ6IFt0cnVlLCAnUG9yIGZhdm9yLCBmb3JuZcOnYSB1bWEgc2VuaGEnXSxcbiAgICBtaW5sZW5ndGg6IFs2LCAnU2VuaGEgZGV2ZSB0ZXIgcGVsbyBtZW5vcyA2IGNhcmFjdGVyZXMnXSxcbiAgICBzZWxlY3Q6IGZhbHNlXG4gIH0sXG4gIGF2YXRhcjoge1xuICAgIHR5cGU6IFN0cmluZyxcbiAgICBkZWZhdWx0OiAnJ1xuICB9LFxuICBqb2luZWRBdDoge1xuICAgIHR5cGU6IERhdGUsXG4gICAgZGVmYXVsdDogRGF0ZS5ub3dcbiAgfSxcbiAgY29sbGVjdGlvbnNDb3VudDoge1xuICAgIHR5cGU6IE51bWJlcixcbiAgICBkZWZhdWx0OiAwXG4gIH0sXG4gIHRvdGFsQ2FyZHM6IHtcbiAgICB0eXBlOiBOdW1iZXIsXG4gICAgZGVmYXVsdDogMFxuICB9LFxuICBhY2hpZXZlbWVudHM6IHtcbiAgICB0eXBlOiBBcnJheSxcbiAgICBkZWZhdWx0OiBbXVxuICB9LFxuICByb2xlOiB7XG4gICAgdHlwZTogU3RyaW5nLFxuICAgIGVudW06IFsndXNlcicsICdhZG1pbiddLFxuICAgIGRlZmF1bHQ6ICd1c2VyJ1xuICB9LFxuICByZXNldFBhc3N3b3JkVG9rZW46IFN0cmluZyxcbiAgcmVzZXRQYXNzd29yZEV4cGlyZTogRGF0ZVxufSwge1xuICB0aW1lc3RhbXBzOiB0cnVlXG59KTtcblxuLy8gQ3JpcHRvZ3JhZmFyIHNlbmhhIGFudGVzIGRlIHNhbHZhclxuVXNlclNjaGVtYS5wcmUoJ3NhdmUnLCBhc3luYyBmdW5jdGlvbihuZXh0KSB7XG4gIGlmICghdGhpcy5pc01vZGlmaWVkKCdwYXNzd29yZCcpKSB7XG4gICAgbmV4dCgpO1xuICB9XG4gIFxuICBjb25zdCBzYWx0ID0gYXdhaXQgYmNyeXB0LmdlblNhbHQoMTApO1xuICB0aGlzLnBhc3N3b3JkID0gYXdhaXQgYmNyeXB0Lmhhc2godGhpcy5wYXNzd29yZCwgc2FsdCk7XG59KTtcblxuLy8gTcOpdG9kbyBwYXJhIHZlcmlmaWNhciBzZW5oYVxuVXNlclNjaGVtYS5tZXRob2RzLm1hdGNoUGFzc3dvcmQgPSBhc3luYyBmdW5jdGlvbihlbnRlcmVkUGFzc3dvcmQpIHtcbiAgcmV0dXJuIGF3YWl0IGJjcnlwdC5jb21wYXJlKGVudGVyZWRQYXNzd29yZCwgdGhpcy5wYXNzd29yZCk7XG59O1xuXG4vLyBNw6l0b2RvIHBhcmEgZ2VyYXIgdG9rZW4gSldUXG5Vc2VyU2NoZW1hLm1ldGhvZHMuZ2V0U2lnbmVkSnd0VG9rZW4gPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGp3dC5zaWduKHsgaWQ6IHRoaXMuX2lkIH0sIHByb2Nlc3MuZW52LkpXVF9TRUNSRVQsIHtcbiAgICBleHBpcmVzSW46IHByb2Nlc3MuZW52LkpXVF9FWFBJUkVcbiAgfSk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBtb25nb29zZS5tb2RlbHMuVXNlciB8fCBtb25nb29zZS5tb2RlbCgnVXNlcicsIFVzZXJTY2hlbWEpOyJdLCJuYW1lcyI6WyJtb25nb29zZSIsImJjcnlwdCIsImp3dCIsIlVzZXJTY2hlbWEiLCJTY2hlbWEiLCJuYW1lIiwidHlwZSIsIlN0cmluZyIsInJlcXVpcmVkIiwibWF4bGVuZ3RoIiwiZW1haWwiLCJ1bmlxdWUiLCJtYXRjaCIsInBhc3N3b3JkIiwibWlubGVuZ3RoIiwic2VsZWN0IiwiYXZhdGFyIiwiZGVmYXVsdCIsImpvaW5lZEF0IiwiRGF0ZSIsIm5vdyIsImNvbGxlY3Rpb25zQ291bnQiLCJOdW1iZXIiLCJ0b3RhbENhcmRzIiwiYWNoaWV2ZW1lbnRzIiwiQXJyYXkiLCJyb2xlIiwiZW51bSIsInJlc2V0UGFzc3dvcmRUb2tlbiIsInJlc2V0UGFzc3dvcmRFeHBpcmUiLCJ0aW1lc3RhbXBzIiwicHJlIiwibmV4dCIsImlzTW9kaWZpZWQiLCJzYWx0IiwiZ2VuU2FsdCIsImhhc2giLCJtZXRob2RzIiwibWF0Y2hQYXNzd29yZCIsImVudGVyZWRQYXNzd29yZCIsImNvbXBhcmUiLCJnZXRTaWduZWRKd3RUb2tlbiIsInNpZ24iLCJpZCIsIl9pZCIsInByb2Nlc3MiLCJlbnYiLCJKV1RfU0VDUkVUIiwiZXhwaXJlc0luIiwiSldUX0VYUElSRSIsIm1vZGVscyIsIlVzZXIiLCJtb2RlbCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./models/User.js\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/next-auth","vendor-chunks/@babel","vendor-chunks/jose","vendor-chunks/semver","vendor-chunks/openid-client","vendor-chunks/uuid","vendor-chunks/jsonwebtoken","vendor-chunks/oauth","vendor-chunks/jws","vendor-chunks/@panva","vendor-chunks/yallist","vendor-chunks/preact-render-to-string","vendor-chunks/oidc-token-hash","vendor-chunks/ecdsa-sig-formatter","vendor-chunks/bcryptjs","vendor-chunks/safe-buffer","vendor-chunks/preact","vendor-chunks/ms","vendor-chunks/lodash.once","vendor-chunks/lodash.isstring","vendor-chunks/lodash.isplainobject","vendor-chunks/lodash.isnumber","vendor-chunks/lodash.isinteger","vendor-chunks/lodash.isboolean","vendor-chunks/lodash.includes","vendor-chunks/jwa","vendor-chunks/cookie","vendor-chunks/buffer-equal-constant-time","vendor-chunks/@next-auth"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&page=%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2F%5B...nextauth%5D%2Froute.ts&appDir=C%3A%5CUsers%5CVilarejo%5CDownloads%5Ccolecao-page-main%5CMTG_HELP%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CVilarejo%5CDownloads%5Ccolecao-page-main%5CMTG_HELP&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();