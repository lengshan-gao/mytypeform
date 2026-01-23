"use strict";
(() => {
var exports = {};
exports.id = 667;
exports.ids = [667];
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

/***/ 8270:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ handler)
/* harmony export */ });
/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8047);

async function handler(req, res) {
    if (req.method !== "PUT") {
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
        // 使用固定的测试用户ID（简化认证）
        const userId = "cmkm96e2o0000kq88q6njl49p";
        // 解析请求体
        const { surveyId , title , description , expiresAt , status , questions  } = req.body;
        if (!surveyId) {
            return res.status(400).json({
                success: false,
                message: "问卷ID不能为空"
            });
        }
        if (!title || title.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "问卷标题不能为空"
            });
        }
        // 检查问卷是否存在且属于当前用户
        const existingSurvey = await _lib_prisma__WEBPACK_IMPORTED_MODULE_0__/* .prisma.survey.findFirst */ ._.survey.findFirst({
            where: {
                id: surveyId,
                creatorId: userId
            }
        });
        if (!existingSurvey) {
            return res.status(404).json({
                success: false,
                message: "问卷不存在或无权编辑"
            });
        }
        // 开始事务处理
        const result = await _lib_prisma__WEBPACK_IMPORTED_MODULE_0__/* .prisma.$transaction */ ._.$transaction(async (tx)=>{
            // 更新问卷基本信息
            const updatedSurvey = await tx.survey.update({
                where: {
                    id: surveyId
                },
                data: {
                    title: title.trim(),
                    description: (description === null || description === void 0 ? void 0 : description.trim()) || "",
                    expiresAt: expiresAt ? new Date(expiresAt) : null,
                    status: status || "DRAFT",
                    updatedAt: new Date()
                }
            });
            // 获取现有的问题列表
            const existingQuestions = await tx.question.findMany({
                where: {
                    surveyId
                }
            });
            // 创建问题ID映射
            const existingQuestionMap = new Map(existingQuestions.map((q)=>[
                    q.id,
                    q
                ]));
            const incomingQuestionMap = new Map(questions.map((q)=>[
                    q.id,
                    q
                ]));
            // 处理问题更新：删除、更新、创建
            const operations = [];
            // 删除不存在于新列表中的问题
            for (const existingQuestion of existingQuestions){
                if (!incomingQuestionMap.has(existingQuestion.id)) {
                    operations.push(tx.question.delete({
                        where: {
                            id: existingQuestion.id
                        }
                    }));
                }
            }
            // 更新或创建问题
            for(let i = 0; i < questions.length; i++){
                const question = questions[i];
                if (!question.content || question.content.trim().length === 0) {
                    throw new Error(`问题 ${i + 1} 的内容不能为空`);
                }
                if (question.id && existingQuestionMap.has(question.id)) {
                    // 更新现有问题
                    operations.push(tx.question.update({
                        where: {
                            id: question.id
                        },
                        data: {
                            content: question.content.trim(),
                            type: question.type || "rating",
                            imageUrl: question.imageUrl || null,
                            order: i
                        }
                    }));
                } else {
                    // 创建新问题
                    operations.push(tx.question.create({
                        data: {
                            content: question.content.trim(),
                            type: question.type || "rating",
                            imageUrl: question.imageUrl || null,
                            order: i,
                            surveyId: surveyId,
                            createdAt: new Date()
                        }
                    }));
                }
            }
            // 执行所有数据库操作
            await Promise.all(operations);
            return {
                survey: updatedSurvey
            };
        });
        return res.status(200).json({
            success: true,
            message: "问卷更新成功",
            data: result
        });
    } catch (error) {
        console.error("更新问卷错误:", error);
        if (error.message.includes("不能为空")) {
            return res.status(400).json({
                success: false,
                message: error.message
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
var __webpack_exports__ = (__webpack_exec__(8270));
module.exports = __webpack_exports__;

})();