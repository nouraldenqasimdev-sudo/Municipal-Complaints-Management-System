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
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "./src/contexts/AuthContext.tsx":
/*!**************************************!*\
  !*** ./src/contexts/AuthContext.tsx ***!
  \**************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   AuthProvider: () => (/* binding */ AuthProvider),\n/* harmony export */   useAuth: () => (/* binding */ useAuth)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/router */ \"./node_modules/next/router.js\");\n/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var react_hot_toast__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react-hot-toast */ \"react-hot-toast\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([react_hot_toast__WEBPACK_IMPORTED_MODULE_3__]);\nreact_hot_toast__WEBPACK_IMPORTED_MODULE_3__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n\n\n\n\nconst AuthContext = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_1__.createContext)(undefined);\nconst AuthProvider = ({ children })=>{\n    const [state, setState] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)({\n        user: null,\n        token: null,\n        isAuthenticated: false,\n        isLoading: true\n    });\n    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_2__.useRouter)();\n    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{\n        let token = localStorage.getItem(\"token\");\n        let userJson = localStorage.getItem(\"user\");\n        if (!token || !userJson) {\n            token = sessionStorage.getItem(\"token\");\n            userJson = sessionStorage.getItem(\"user\");\n        }\n        if (token && userJson) {\n            try {\n                const user = JSON.parse(userJson);\n                setState({\n                    token,\n                    user,\n                    isAuthenticated: true,\n                    isLoading: false\n                });\n            } catch (error) {\n                console.error(\"Error parsing user data:\", error);\n                localStorage.removeItem(\"token\");\n                localStorage.removeItem(\"user\");\n                sessionStorage.removeItem(\"token\");\n                sessionStorage.removeItem(\"user\");\n                setState((prev)=>({\n                        ...prev,\n                        isLoading: false\n                    }));\n            }\n        } else {\n            setState((prev)=>({\n                    ...prev,\n                    isLoading: false\n                }));\n        }\n    }, []);\n    const login = (token, user, rememberMe = false)=>{\n        localStorage.removeItem(\"token\");\n        localStorage.removeItem(\"user\");\n        sessionStorage.removeItem(\"token\");\n        sessionStorage.removeItem(\"user\");\n        if (rememberMe) {\n            localStorage.setItem(\"token\", token);\n            localStorage.setItem(\"user\", JSON.stringify(user));\n            console.log(\"✅ Saved login data to localStorage (remember me enabled)\");\n        } else {\n            sessionStorage.setItem(\"token\", token);\n            sessionStorage.setItem(\"user\", JSON.stringify(user));\n            console.log(\"✅ Saved login data to sessionStorage (remember me disabled)\");\n        }\n        setState({\n            token,\n            user,\n            isAuthenticated: true,\n            isLoading: false\n        });\n    };\n    const logout = ()=>{\n        localStorage.removeItem(\"token\");\n        localStorage.removeItem(\"user\");\n        sessionStorage.removeItem(\"token\");\n        sessionStorage.removeItem(\"user\");\n        setState({\n            user: null,\n            token: null,\n            isAuthenticated: false,\n            isLoading: false\n        });\n        react_hot_toast__WEBPACK_IMPORTED_MODULE_3__[\"default\"].success(\"تم تسجيل الخروج بنجاح\");\n        router.push(\"/auth/login\");\n    };\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(AuthContext.Provider, {\n        value: {\n            ...state,\n            login,\n            logout\n        },\n        children: children\n    }, void 0, false, {\n        fileName: \"C:\\\\Users\\\\HP\\\\Desktop\\\\noure alden (2)\\\\noure alden\\\\Web_final\\\\src\\\\contexts\\\\AuthContext.tsx\",\n        lineNumber: 95,\n        columnNumber: 5\n    }, undefined);\n};\nconst useAuth = ()=>{\n    const context = (0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(AuthContext);\n    if (context === undefined) {\n        throw new Error(\"useAuth must be used within an AuthProvider\");\n    }\n    return context;\n};\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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ZWItZmluYWwvLi9zcmMvY29udGV4dHMvQXV0aENvbnRleHQudHN4PzFmYTIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7IGNyZWF0ZUNvbnRleHQsIHVzZUNvbnRleHQsIHVzZVN0YXRlLCB1c2VFZmZlY3QgfSBmcm9tICdyZWFjdCc7XHJcbmltcG9ydCB7IFVzZXIsIEF1dGhTdGF0ZSwgVXNlclJvbGUgfSBmcm9tICdAL3R5cGVzJztcclxuaW1wb3J0IHsgdXNlUm91dGVyIH0gZnJvbSAnbmV4dC9yb3V0ZXInO1xyXG5pbXBvcnQgdG9hc3QgZnJvbSAncmVhY3QtaG90LXRvYXN0JztcclxuXHJcbmludGVyZmFjZSBBdXRoQ29udGV4dFR5cGUgZXh0ZW5kcyBBdXRoU3RhdGUge1xyXG4gIGxvZ2luOiAodG9rZW46IHN0cmluZywgdXNlcjogVXNlciwgcmVtZW1iZXJNZT86IGJvb2xlYW4pID0+IHZvaWQ7XHJcbiAgbG9nb3V0OiAoKSA9PiB2b2lkO1xyXG59XHJcblxyXG5jb25zdCBBdXRoQ29udGV4dCA9IGNyZWF0ZUNvbnRleHQ8QXV0aENvbnRleHRUeXBlIHwgdW5kZWZpbmVkPih1bmRlZmluZWQpO1xyXG5cclxuZXhwb3J0IGNvbnN0IEF1dGhQcm92aWRlcjogUmVhY3QuRkM8eyBjaGlsZHJlbjogUmVhY3QuUmVhY3ROb2RlIH0+ID0gKHsgY2hpbGRyZW4gfSkgPT4ge1xyXG4gIGNvbnN0IFtzdGF0ZSwgc2V0U3RhdGVdID0gdXNlU3RhdGU8QXV0aFN0YXRlPih7XHJcbiAgICB1c2VyOiBudWxsLFxyXG4gICAgdG9rZW46IG51bGwsXHJcbiAgICBpc0F1dGhlbnRpY2F0ZWQ6IGZhbHNlLFxyXG4gICAgaXNMb2FkaW5nOiB0cnVlLFxyXG4gIH0pO1xyXG4gIFxyXG4gIGNvbnN0IHJvdXRlciA9IHVzZVJvdXRlcigpO1xyXG5cclxuICB1c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgbGV0IHRva2VuID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Rva2VuJyk7XHJcbiAgICBsZXQgdXNlckpzb24gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndXNlcicpO1xyXG4gICAgXHJcbiAgICBpZiAoIXRva2VuIHx8ICF1c2VySnNvbikge1xyXG4gICAgICB0b2tlbiA9IHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oJ3Rva2VuJyk7XHJcbiAgICAgIHVzZXJKc29uID0gc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbSgndXNlcicpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpZiAodG9rZW4gJiYgdXNlckpzb24pIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCB1c2VyID0gSlNPTi5wYXJzZSh1c2VySnNvbik7XHJcbiAgICAgICAgc2V0U3RhdGUoe1xyXG4gICAgICAgICAgdG9rZW4sXHJcbiAgICAgICAgICB1c2VyLFxyXG4gICAgICAgICAgaXNBdXRoZW50aWNhdGVkOiB0cnVlLFxyXG4gICAgICAgICAgaXNMb2FkaW5nOiBmYWxzZSxcclxuICAgICAgICB9KTtcclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBwYXJzaW5nIHVzZXIgZGF0YTonLCBlcnJvcik7XHJcbiAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3Rva2VuJyk7XHJcbiAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3VzZXInKTtcclxuICAgICAgICBzZXNzaW9uU3RvcmFnZS5yZW1vdmVJdGVtKCd0b2tlbicpO1xyXG4gICAgICAgIHNlc3Npb25TdG9yYWdlLnJlbW92ZUl0ZW0oJ3VzZXInKTtcclxuICAgICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7IC4uLnByZXYsIGlzTG9hZGluZzogZmFsc2UgfSkpO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzZXRTdGF0ZShwcmV2ID0+ICh7IC4uLnByZXYsIGlzTG9hZGluZzogZmFsc2UgfSkpO1xyXG4gICAgfVxyXG4gIH0sIFtdKTtcclxuXHJcbiAgY29uc3QgbG9naW4gPSAodG9rZW46IHN0cmluZywgdXNlcjogVXNlciwgcmVtZW1iZXJNZTogYm9vbGVhbiA9IGZhbHNlKSA9PiB7XHJcbiAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgndG9rZW4nKTtcclxuICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCd1c2VyJyk7XHJcbiAgICBzZXNzaW9uU3RvcmFnZS5yZW1vdmVJdGVtKCd0b2tlbicpO1xyXG4gICAgc2Vzc2lvblN0b3JhZ2UucmVtb3ZlSXRlbSgndXNlcicpO1xyXG4gICAgXHJcbiAgICBpZiAocmVtZW1iZXJNZSkge1xyXG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndG9rZW4nLCB0b2tlbik7XHJcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCd1c2VyJywgSlNPTi5zdHJpbmdpZnkodXNlcikpO1xyXG4gICAgICBjb25zb2xlLmxvZygn4pyFIFNhdmVkIGxvZ2luIGRhdGEgdG8gbG9jYWxTdG9yYWdlIChyZW1lbWJlciBtZSBlbmFibGVkKScpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSgndG9rZW4nLCB0b2tlbik7XHJcbiAgICAgIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oJ3VzZXInLCBKU09OLnN0cmluZ2lmeSh1c2VyKSk7XHJcbiAgICAgIGNvbnNvbGUubG9nKCfinIUgU2F2ZWQgbG9naW4gZGF0YSB0byBzZXNzaW9uU3RvcmFnZSAocmVtZW1iZXIgbWUgZGlzYWJsZWQpJyk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHNldFN0YXRlKHtcclxuICAgICAgdG9rZW4sXHJcbiAgICAgIHVzZXIsXHJcbiAgICAgIGlzQXV0aGVudGljYXRlZDogdHJ1ZSxcclxuICAgICAgaXNMb2FkaW5nOiBmYWxzZSxcclxuICAgIH0pO1xyXG4gIH07XHJcblxyXG4gIGNvbnN0IGxvZ291dCA9ICgpID0+IHtcclxuICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCd0b2tlbicpO1xyXG4gICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3VzZXInKTtcclxuICAgIHNlc3Npb25TdG9yYWdlLnJlbW92ZUl0ZW0oJ3Rva2VuJyk7XHJcbiAgICBzZXNzaW9uU3RvcmFnZS5yZW1vdmVJdGVtKCd1c2VyJyk7XHJcbiAgICBcclxuICAgIHNldFN0YXRlKHtcclxuICAgICAgdXNlcjogbnVsbCxcclxuICAgICAgdG9rZW46IG51bGwsXHJcbiAgICAgIGlzQXV0aGVudGljYXRlZDogZmFsc2UsXHJcbiAgICAgIGlzTG9hZGluZzogZmFsc2UsXHJcbiAgICB9KTtcclxuICAgIHRvYXN0LnN1Y2Nlc3MoJ9iq2YUg2KrYs9is2YrZhCDYp9mE2K7YsdmI2Kwg2KjZhtis2KfYrScpO1xyXG4gICAgcm91dGVyLnB1c2goJy9hdXRoL2xvZ2luJyk7XHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIChcclxuICAgIDxBdXRoQ29udGV4dC5Qcm92aWRlciB2YWx1ZT17eyAuLi5zdGF0ZSwgbG9naW4sIGxvZ291dCB9fT5cclxuICAgICAge2NoaWxkcmVufVxyXG4gICAgPC9BdXRoQ29udGV4dC5Qcm92aWRlcj5cclxuICApO1xyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IHVzZUF1dGggPSAoKSA9PiB7XHJcbiAgY29uc3QgY29udGV4dCA9IHVzZUNvbnRleHQoQXV0aENvbnRleHQpO1xyXG4gIGlmIChjb250ZXh0ID09PSB1bmRlZmluZWQpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcigndXNlQXV0aCBtdXN0IGJlIHVzZWQgd2l0aGluIGFuIEF1dGhQcm92aWRlcicpO1xyXG4gIH1cclxuICByZXR1cm4gY29udGV4dDtcclxufTtcclxuIl0sIm5hbWVzIjpbIlJlYWN0IiwiY3JlYXRlQ29udGV4dCIsInVzZUNvbnRleHQiLCJ1c2VTdGF0ZSIsInVzZUVmZmVjdCIsInVzZVJvdXRlciIsInRvYXN0IiwiQXV0aENvbnRleHQiLCJ1bmRlZmluZWQiLCJBdXRoUHJvdmlkZXIiLCJjaGlsZHJlbiIsInN0YXRlIiwic2V0U3RhdGUiLCJ1c2VyIiwidG9rZW4iLCJpc0F1dGhlbnRpY2F0ZWQiLCJpc0xvYWRpbmciLCJyb3V0ZXIiLCJsb2NhbFN0b3JhZ2UiLCJnZXRJdGVtIiwidXNlckpzb24iLCJzZXNzaW9uU3RvcmFnZSIsIkpTT04iLCJwYXJzZSIsImVycm9yIiwiY29uc29sZSIsInJlbW92ZUl0ZW0iLCJwcmV2IiwibG9naW4iLCJyZW1lbWJlck1lIiwic2V0SXRlbSIsInN0cmluZ2lmeSIsImxvZyIsImxvZ291dCIsInN1Y2Nlc3MiLCJwdXNoIiwiUHJvdmlkZXIiLCJ2YWx1ZSIsInVzZUF1dGgiLCJjb250ZXh0IiwiRXJyb3IiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./src/contexts/AuthContext.tsx\n");

/***/ }),

/***/ "./src/pages/_app.tsx":
/*!****************************!*\
  !*** ./src/pages/_app.tsx ***!
  \****************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ App)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/styles/globals.css */ \"./src/styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _tanstack_react_query__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @tanstack/react-query */ \"@tanstack/react-query\");\n/* harmony import */ var react_hot_toast__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react-hot-toast */ \"react-hot-toast\");\n/* harmony import */ var _contexts_AuthContext__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/contexts/AuthContext */ \"./src/contexts/AuthContext.tsx\");\n/* harmony import */ var leaflet_dist_leaflet_css__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! leaflet/dist/leaflet.css */ \"./node_modules/leaflet/dist/leaflet.css\");\n/* harmony import */ var leaflet_dist_leaflet_css__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(leaflet_dist_leaflet_css__WEBPACK_IMPORTED_MODULE_5__);\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_tanstack_react_query__WEBPACK_IMPORTED_MODULE_2__, react_hot_toast__WEBPACK_IMPORTED_MODULE_3__, _contexts_AuthContext__WEBPACK_IMPORTED_MODULE_4__]);\n([_tanstack_react_query__WEBPACK_IMPORTED_MODULE_2__, react_hot_toast__WEBPACK_IMPORTED_MODULE_3__, _contexts_AuthContext__WEBPACK_IMPORTED_MODULE_4__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);\n\n\n\n\n\n\nconst queryClient = new _tanstack_react_query__WEBPACK_IMPORTED_MODULE_2__.QueryClient();\nfunction App({ Component, pageProps }) {\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_tanstack_react_query__WEBPACK_IMPORTED_MODULE_2__.QueryClientProvider, {\n        client: queryClient,\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_contexts_AuthContext__WEBPACK_IMPORTED_MODULE_4__.AuthProvider, {\n            children: [\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n                    ...pageProps\n                }, void 0, false, {\n                    fileName: \"C:\\\\Users\\\\HP\\\\Desktop\\\\noure alden (2)\\\\noure alden\\\\Web_final\\\\src\\\\pages\\\\_app.tsx\",\n                    lineNumber: 14,\n                    columnNumber: 9\n                }, this),\n                /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(react_hot_toast__WEBPACK_IMPORTED_MODULE_3__.Toaster, {\n                    position: \"top-center\",\n                    reverseOrder: false\n                }, void 0, false, {\n                    fileName: \"C:\\\\Users\\\\HP\\\\Desktop\\\\noure alden (2)\\\\noure alden\\\\Web_final\\\\src\\\\pages\\\\_app.tsx\",\n                    lineNumber: 15,\n                    columnNumber: 9\n                }, this)\n            ]\n        }, void 0, true, {\n            fileName: \"C:\\\\Users\\\\HP\\\\Desktop\\\\noure alden (2)\\\\noure alden\\\\Web_final\\\\src\\\\pages\\\\_app.tsx\",\n            lineNumber: 13,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"C:\\\\Users\\\\HP\\\\Desktop\\\\noure alden (2)\\\\noure alden\\\\Web_final\\\\src\\\\pages\\\\_app.tsx\",\n        lineNumber: 12,\n        columnNumber: 5\n    }, this);\n}\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvcGFnZXMvX2FwcC50c3giLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBOEI7QUFFMkM7QUFDL0I7QUFDWTtBQUNwQjtBQUVsQyxNQUFNSSxjQUFjLElBQUlKLDhEQUFXQTtBQUVwQixTQUFTSyxJQUFJLEVBQUVDLFNBQVMsRUFBRUMsU0FBUyxFQUFZO0lBQzVELHFCQUNFLDhEQUFDTixzRUFBbUJBO1FBQUNPLFFBQVFKO2tCQUMzQiw0RUFBQ0QsK0RBQVlBOzs4QkFDWCw4REFBQ0c7b0JBQVcsR0FBR0MsU0FBUzs7Ozs7OzhCQUN4Qiw4REFBQ0wsb0RBQU9BO29CQUFDTyxVQUFTO29CQUFhQyxjQUFjOzs7Ozs7Ozs7Ozs7Ozs7OztBQUlyRCIsInNvdXJjZXMiOlsid2VicGFjazovL3dlYi1maW5hbC8uL3NyYy9wYWdlcy9fYXBwLnRzeD9mOWQ2Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBcIkAvc3R5bGVzL2dsb2JhbHMuY3NzXCI7XHJcbmltcG9ydCB0eXBlIHsgQXBwUHJvcHMgfSBmcm9tIFwibmV4dC9hcHBcIjtcclxuaW1wb3J0IHsgUXVlcnlDbGllbnQsIFF1ZXJ5Q2xpZW50UHJvdmlkZXIgfSBmcm9tIFwiQHRhbnN0YWNrL3JlYWN0LXF1ZXJ5XCI7XHJcbmltcG9ydCB7IFRvYXN0ZXIgfSBmcm9tIFwicmVhY3QtaG90LXRvYXN0XCI7XHJcbmltcG9ydCB7IEF1dGhQcm92aWRlciB9IGZyb20gXCJAL2NvbnRleHRzL0F1dGhDb250ZXh0XCI7XHJcbmltcG9ydCBcImxlYWZsZXQvZGlzdC9sZWFmbGV0LmNzc1wiO1xyXG5cclxuY29uc3QgcXVlcnlDbGllbnQgPSBuZXcgUXVlcnlDbGllbnQoKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEFwcCh7IENvbXBvbmVudCwgcGFnZVByb3BzIH06IEFwcFByb3BzKSB7XHJcbiAgcmV0dXJuIChcclxuICAgIDxRdWVyeUNsaWVudFByb3ZpZGVyIGNsaWVudD17cXVlcnlDbGllbnR9PlxyXG4gICAgICA8QXV0aFByb3ZpZGVyPlxyXG4gICAgICAgIDxDb21wb25lbnQgey4uLnBhZ2VQcm9wc30gLz5cclxuICAgICAgICA8VG9hc3RlciBwb3NpdGlvbj1cInRvcC1jZW50ZXJcIiByZXZlcnNlT3JkZXI9e2ZhbHNlfSAvPlxyXG4gICAgICA8L0F1dGhQcm92aWRlcj5cclxuICAgIDwvUXVlcnlDbGllbnRQcm92aWRlcj5cclxuICApO1xyXG59XHJcbiJdLCJuYW1lcyI6WyJRdWVyeUNsaWVudCIsIlF1ZXJ5Q2xpZW50UHJvdmlkZXIiLCJUb2FzdGVyIiwiQXV0aFByb3ZpZGVyIiwicXVlcnlDbGllbnQiLCJBcHAiLCJDb21wb25lbnQiLCJwYWdlUHJvcHMiLCJjbGllbnQiLCJwb3NpdGlvbiIsInJldmVyc2VPcmRlciJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/pages/_app.tsx\n");

/***/ }),

/***/ "./src/styles/globals.css":
/*!********************************!*\
  !*** ./src/styles/globals.css ***!
  \********************************/
/***/ (() => {



/***/ }),

/***/ "next/dist/compiled/next-server/pages.runtime.dev.js":
/*!**********************************************************************!*\
  !*** external "next/dist/compiled/next-server/pages.runtime.dev.js" ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/pages.runtime.dev.js");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ "react-dom":
/*!****************************!*\
  !*** external "react-dom" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("react-dom");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ }),

/***/ "react/jsx-runtime":
/*!************************************!*\
  !*** external "react/jsx-runtime" ***!
  \************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-runtime");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ }),

/***/ "@tanstack/react-query":
/*!****************************************!*\
  !*** external "@tanstack/react-query" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = import("@tanstack/react-query");;

/***/ }),

/***/ "react-hot-toast":
/*!**********************************!*\
  !*** external "react-hot-toast" ***!
  \**********************************/
/***/ ((module) => {

"use strict";
module.exports = import("react-hot-toast");;

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@swc","vendor-chunks/leaflet"], () => (__webpack_exec__("./src/pages/_app.tsx")));
module.exports = __webpack_exports__;

})();