"use strict";
(() => {
var exports = {};
exports.id = 291;
exports.ids = [291];
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

/***/ 9588:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ handler)
/* harmony export */ });
/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8047);

async function handler(req, res) {
    if (req.method !== "DELETE") {
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
        // 简化认证：允许删除任何问卷，不限制用户权限
        // 在实际项目中，应该从JWT token中解析用户ID并进行权限验证
        // 这里简化处理，允许删除任何问卷
        // 获取问卷ID
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
                message: "问卷不存在或无权删除"
            });
        }
        // 使用事务删除问卷及其相关问题
        await _lib_prisma__WEBPACK_IMPORTED_MODULE_0__/* .prisma.$transaction */ ._.$transaction(async (tx)=>{
            // 1. 先删除问卷的回答记录（包含引用选项的回答）
            await tx.response.deleteMany({
                where: {
                    surveyId
                }
            });
            // 2. 获取问卷的所有问题ID
            const questions = await tx.question.findMany({
                where: {
                    surveyId
                },
                select: {
                    id: true
                }
            });
            const questionIds = questions.map((q)=>q.id);
            // 3. 删除问题的选项（如果存在）
            if (questionIds.length > 0) {
                await tx.questionOption.deleteMany({
                    where: {
                        questionId: {
                            in: questionIds
                        }
                    }
                });
            }
            // 4. 删除问卷的问题
            await tx.question.deleteMany({
                where: {
                    surveyId
                }
            });
            // 5. 最后删除问卷
            await tx.survey.delete({
                where: {
                    id: surveyId
                }
            });
        });
        return res.status(200).json({
            success: true,
            message: "问卷删除成功"
        });
    } catch (error) {
        console.error("删除问卷错误:", error);
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


/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__(9588));
module.exports = __webpack_exports__;

})();