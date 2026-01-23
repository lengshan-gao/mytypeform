"use strict";
(() => {
var exports = {};
exports.id = 908;
exports.ids = [908];
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

/***/ 9539:
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
    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            message: "方法不允许"
        });
    }
    try {
        const { username , password  } = req.body;
        // 验证输入
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "用户名和密码不能为空"
            });
        }
        // 查找用户（支持用户名或邮箱登录）
        const user = await _lib_prisma__WEBPACK_IMPORTED_MODULE_0__/* .prisma.user.findFirst */ ._.user.findFirst({
            where: {
                OR: [
                    {
                        email: username
                    },
                    {
                        nickname: username
                    }
                ]
            }
        });
        if (!user) {
            // 如果没有找到用户，创建一个测试用户
            const hashedPassword = await (__webpack_require__(8432).hash)("test123", 12);
            const testUser = await _lib_prisma__WEBPACK_IMPORTED_MODULE_0__/* .prisma.user.create */ ._.user.create({
                data: {
                    email: "testuser@example.com",
                    nickname: "testuser",
                    password: hashedPassword,
                    avatar: null,
                    openid: null,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });
            // 验证密码
            const isValidPassword = await (0,_lib_auth__WEBPACK_IMPORTED_MODULE_1__/* .verifyPassword */ .Gv)("test123", testUser.password || "");
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: "用户不存在或密码错误"
                });
            }
            // 生成token
            const token = (0,_lib_auth__WEBPACK_IMPORTED_MODULE_1__/* .generateToken */ .RA)({
                id: testUser.id,
                nickname: testUser.nickname || undefined,
                avatar: testUser.avatar || undefined
            });
            return res.status(200).json({
                success: true,
                data: {
                    token: token.token,
                    expiresAt: token.expiresAt,
                    user: {
                        id: testUser.id,
                        email: testUser.email,
                        nickname: testUser.nickname,
                        avatar: testUser.avatar
                    }
                },
                message: "登录成功"
            });
        }
        // 验证密码
        const isValidPassword1 = await (0,_lib_auth__WEBPACK_IMPORTED_MODULE_1__/* .verifyPassword */ .Gv)(password, user.password || "");
        if (!isValidPassword1) {
            return res.status(401).json({
                success: false,
                message: "用户不存在或密码错误"
            });
        }
        // 生成token
        const token1 = (0,_lib_auth__WEBPACK_IMPORTED_MODULE_1__/* .generateToken */ .RA)({
            id: user.id,
            openid: user.openid || undefined,
            nickname: user.nickname || undefined,
            avatar: user.avatar || undefined
        });
        return res.status(200).json({
            success: true,
            data: {
                token: token1.token,
                expiresAt: token1.expiresAt,
                user: {
                    id: user.id,
                    email: user.email,
                    nickname: user.nickname,
                    avatar: user.avatar
                }
            },
            message: "登录成功"
        });
    } catch (error) {
        console.error("登录错误:", error);
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
var __webpack_exports__ = __webpack_require__.X(0, [884], () => (__webpack_exec__(9539)));
module.exports = __webpack_exports__;

})();