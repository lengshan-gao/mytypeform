"use strict";
(() => {
var exports = {};
exports.id = 669;
exports.ids = [669];
exports.modules = {

/***/ 8432:
/***/ ((module) => {

module.exports = require("bcryptjs");

/***/ }),

/***/ 9344:
/***/ ((module) => {

module.exports = require("jsonwebtoken");

/***/ }),

/***/ 9648:
/***/ ((module) => {

module.exports = import("axios");;

/***/ }),

/***/ 9559:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ handler)
/* harmony export */ });
/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4884);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_lib_auth__WEBPACK_IMPORTED_MODULE_0__]);
_lib_auth__WEBPACK_IMPORTED_MODULE_0__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];

async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({
            success: false,
            message: "方法不允许"
        });
    }
    try {
        // 生成测试token
        const testToken = (0,_lib_auth__WEBPACK_IMPORTED_MODULE_0__/* .generateToken */ .RA)({
            id: "test-user-id",
            nickname: "testuser"
        });
        // 验证token
        const decoded = (0,_lib_auth__WEBPACK_IMPORTED_MODULE_0__/* .verifyToken */ .WX)(testToken.token);
        return res.status(200).json({
            success: true,
            data: {
                generatedToken: testToken,
                decodedToken: decoded,
                isValid: !!decoded
            }
        });
    } catch (error) {
        console.error("Token测试错误:", error);
        return res.status(500).json({
            success: false,
            message: "服务器内部错误",
            error: error.message
        });
    }
}

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, [884], () => (__webpack_exec__(9559)));
module.exports = __webpack_exports__;

})();