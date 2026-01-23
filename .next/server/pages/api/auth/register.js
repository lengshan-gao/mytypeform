"use strict";
(() => {
var exports = {};
exports.id = 7;
exports.ids = [7];
exports.modules = {

/***/ 3524:
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),

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

/***/ 8047:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "_": () => (/* binding */ prisma)
/* harmony export */ });
/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3524);
/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);

const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient();
if (false) {}


/***/ }),

/***/ 1333:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ handler)
/* harmony export */ });
/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8047);
/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4884);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_lib_auth__WEBPACK_IMPORTED_MODULE_1__]);
_lib_auth__WEBPACK_IMPORTED_MODULE_1__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];


async function handler(req, res) {
    try {
        if (req.method !== "POST") {
            return res.status(405).json({
                success: false,
                message: "方法不允许"
            });
        }
        const { email , password , name  } = req.body;
        // 验证输入
        if (!email || !password || !name) {
            return res.status(400).json({
                success: false,
                message: "邮箱、密码和用户名不能为空"
            });
        }
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "密码长度至少6位"
            });
        }
        // 检查邮箱是否已存在
        const existingUser = await _lib_prisma__WEBPACK_IMPORTED_MODULE_0__/* .prisma.user.findUnique */ ._.user.findUnique({
            where: {
                email
            }
        });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "该邮箱已被注册"
            });
        }
        // 哈希密码
        const hashedPassword = await (0,_lib_auth__WEBPACK_IMPORTED_MODULE_1__/* .hashPassword */ .c_)(password);
        // 创建用户
        const user = await _lib_prisma__WEBPACK_IMPORTED_MODULE_0__/* .prisma.user.create */ ._.user.create({
            data: {
                email,
                password: hashedPassword,
                nickname: name,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
            }
        });
        // 生成token
        const token = (0,_lib_auth__WEBPACK_IMPORTED_MODULE_1__/* .generateToken */ .RA)({
            id: user.id,
            nickname: user.nickname || undefined,
            avatar: user.avatar || undefined
        });
        return res.status(201).json({
            success: true,
            data: {
                token: token.token,
                expiresAt: token.expiresAt,
                user: {
                    id: user.id,
                    email: user.email,
                    nickname: user.nickname,
                    avatar: user.avatar
                }
            }
        });
    } catch (error) {
        console.error("注册错误:", error);
        return res.status(500).json({
            success: false,
            message: "服务器内部错误",
            error:  false ? 0 : undefined
        });
    }
}

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, [884], () => (__webpack_exec__(1333)));
module.exports = __webpack_exports__;

})();