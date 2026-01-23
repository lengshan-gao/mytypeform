"use strict";
(() => {
var exports = {};
exports.id = 332;
exports.ids = [332];
exports.modules = {

/***/ 3524:
/***/ ((module) => {

module.exports = require("@prisma/client");

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

/***/ 5739:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ handler)
/* harmony export */ });
/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8047);

async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({
            success: false,
            message: "方法不允许"
        });
    }
    try {
        // 验证认证头
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "请先登录"
            });
        }
        const token = authHeader.substring(7);
        // 简化认证：直接验证token格式
        if (!token || token.length < 50) {
            return res.status(401).json({
                success: false,
                message: "请先登录"
            });
        }
        // 获取问卷ID
        const { id: surveyId  } = req.query;
        if (!surveyId || typeof surveyId !== "string") {
            return res.status(400).json({
                success: false,
                message: "问卷ID不能为空"
            });
        }
        // 检查问卷是否存在
        const survey = await _lib_prisma__WEBPACK_IMPORTED_MODULE_0__/* .prisma.survey.findFirst */ ._.survey.findFirst({
            where: {
                id: surveyId
            }
        });
        if (!survey) {
            return res.status(404).json({
                success: false,
                message: "问卷不存在"
            });
        }
        // 获取问卷的问题列表
        const questions = await _lib_prisma__WEBPACK_IMPORTED_MODULE_0__/* .prisma.question.findMany */ ._.question.findMany({
            where: {
                surveyId: surveyId
            },
            orderBy: {
                order: "asc"
            }
        });
        // 获取问卷的回答记录
        const responses = await _lib_prisma__WEBPACK_IMPORTED_MODULE_0__/* .prisma.response.findMany */ ._.response.findMany({
            where: {
                surveyId: surveyId
            },
            include: {
                question: true
            },
            orderBy: {
                submittedAt: "desc"
            }
        });
        return res.status(200).json({
            success: true,
            data: {
                survey,
                questions,
                responses
            }
        });
    } catch (error) {
        console.error("获取问卷详情错误:", error);
        return res.status(500).json({
            success: false,
            message: "服务器内部错误",
            error:  false ? 0 : undefined
        });
    }
}


/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__(5739));
module.exports = __webpack_exports__;

})();