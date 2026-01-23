"use strict";
(() => {
var exports = {};
exports.id = 857;
exports.ids = [857];
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

/***/ 4014:
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


// 辅助函数：验证用户身份
function authenticateUser(req) {
    const authHeader = req.headers.authorization;
    const token = (0,_lib_auth__WEBPACK_IMPORTED_MODULE_1__/* .extractTokenFromHeader */ .oA)(authHeader);
    if (!token) {
        return null;
    }
    const user = (0,_lib_auth__WEBPACK_IMPORTED_MODULE_1__/* .verifyToken */ .WX)(token);
    return user;
}
// 检查问卷所有权
async function checkSurveyOwnership(surveyId, userId) {
    const survey = await _lib_prisma__WEBPACK_IMPORTED_MODULE_0__/* .prisma.survey.findFirst */ ._.survey.findFirst({
        where: {
            id: surveyId,
            creatorId: userId
        }
    });
    return survey;
}
async function handler(req, res) {
    try {
        // 设置CORS头
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization");
        // 处理OPTIONS请求
        if (req.method === "OPTIONS") {
            return res.status(200).end();
        }
        // 验证用户身份
        const user = authenticateUser(req);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "请先登录"
            });
        }
        // 获取surveyId
        const { id: surveyId  } = req.query;
        if (!surveyId || typeof surveyId !== "string") {
            return res.status(400).json({
                success: false,
                message: "问卷ID不能为空"
            });
        }
        // GET /api/surveys/[id] - 获取问卷详情
        if (req.method === "GET") {
            // 检查问卷是否存在且属于当前用户
            const survey = await checkSurveyOwnership(surveyId, user.id);
            if (!survey) {
                return res.status(404).json({
                    success: false,
                    message: "问卷不存在或无权访问"
                });
            }
            // 获取问卷详情（包含问题和回答统计）
            const surveyWithDetails = await _lib_prisma__WEBPACK_IMPORTED_MODULE_0__/* .prisma.survey.findUnique */ ._.survey.findUnique({
                where: {
                    id: surveyId
                },
                include: {
                    questions: {
                        orderBy: {
                            order: "asc"
                        }
                    },
                    _count: {
                        select: {
                            responses: true
                        }
                    }
                }
            });
            if (!surveyWithDetails) {
                return res.status(404).json({
                    success: false,
                    message: "问卷不存在"
                });
            }
            return res.status(200).json({
                success: true,
                data: surveyWithDetails
            });
        }
        // PUT /api/surveys/[id] - 更新问卷
        if (req.method === "PUT") {
            // 检查问卷是否存在且属于当前用户
            const survey1 = await checkSurveyOwnership(surveyId, user.id);
            if (!survey1) {
                return res.status(404).json({
                    success: false,
                    message: "问卷不存在或无权访问"
                });
            }
            const { title , description , expiresAt , status  } = req.body;
            // 验证输入
            if (title !== undefined && !title.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "问卷标题不能为空"
                });
            }
            // 更新问卷
            const updatedSurvey = await _lib_prisma__WEBPACK_IMPORTED_MODULE_0__/* .prisma.survey.update */ ._.survey.update({
                where: {
                    id: surveyId
                },
                data: {
                    ...title !== undefined && {
                        title: title.trim()
                    },
                    ...description !== undefined && {
                        description: (description === null || description === void 0 ? void 0 : description.trim()) || ""
                    },
                    ...expiresAt !== undefined && {
                        expiresAt: expiresAt ? new Date(expiresAt) : null
                    },
                    ...status !== undefined && {
                        status
                    }
                }
            });
            return res.status(200).json({
                success: true,
                data: updatedSurvey,
                message: "问卷更新成功"
            });
        }
        // DELETE /api/surveys/[id] - 删除问卷
        if (req.method === "DELETE") {
            // 检查问卷是否存在且属于当前用户
            const survey2 = await checkSurveyOwnership(surveyId, user.id);
            if (!survey2) {
                return res.status(404).json({
                    success: false,
                    message: "问卷不存在或无权访问"
                });
            }
            // 删除问卷（级联删除问题和回答）
            await _lib_prisma__WEBPACK_IMPORTED_MODULE_0__/* .prisma.survey["delete"] */ ._.survey["delete"]({
                where: {
                    id: surveyId
                }
            });
            return res.status(200).json({
                success: true,
                message: "问卷删除成功"
            });
        }
        // 方法不允许
        return res.status(405).json({
            success: false,
            message: "方法不允许"
        });
    } catch (error) {
        console.error("API错误:", error);
        // 处理已知错误
        if (error.code === "P2025") {
            return res.status(404).json({
                success: false,
                message: "问卷不存在"
            });
        }
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
var __webpack_exports__ = __webpack_require__.X(0, [884], () => (__webpack_exec__(4014)));
module.exports = __webpack_exports__;

})();