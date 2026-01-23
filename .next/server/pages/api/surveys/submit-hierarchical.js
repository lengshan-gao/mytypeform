"use strict";
(() => {
var exports = {};
exports.id = 834;
exports.ids = [834];
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

/***/ 1715:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ handler)
/* harmony export */ });
/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8047);

async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            message: "方法不允许"
        });
    }
    try {
        // 解析请求体
        const { surveyId , userId , answers  } = req.body;
        if (!surveyId) {
            return res.status(400).json({
                success: false,
                message: "问卷ID不能为空"
            });
        }
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "用户ID不能为空"
            });
        }
        if (!answers || !Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({
                success: false,
                message: "回答不能为空"
            });
        }
        // 检查问卷是否存在且已发布
        const survey = await _lib_prisma__WEBPACK_IMPORTED_MODULE_0__/* .prisma.survey.findFirst */ ._.survey.findFirst({
            where: {
                id: surveyId,
                status: {
                    in: [
                        "PUBLISHED",
                        "active"
                    ]
                }
            }
        });
        if (!survey) {
            return res.status(404).json({
                success: false,
                message: "问卷不存在或未发布"
            });
        }
        // 检查问卷是否已过期
        if (survey.expiresAt && new Date(survey.expiresAt) < new Date()) {
            return res.status(400).json({
                success: false,
                message: "问卷已过期"
            });
        }
        // 检查是否达到最大回答数限制
        const responseCount = await _lib_prisma__WEBPACK_IMPORTED_MODULE_0__/* .prisma.response.count */ ._.response.count({
            where: {
                surveyId
            }
        });
        if (survey.maxResponses && responseCount >= survey.maxResponses) {
            return res.status(400).json({
                success: false,
                message: "问卷回答数已达到上限"
            });
        }
        // 检查用户是否已经回答过（如果问卷不允许重复回答）
        if (!survey.isAnonymous) {
            const existingResponse = await _lib_prisma__WEBPACK_IMPORTED_MODULE_0__/* .prisma.response.findFirst */ ._.response.findFirst({
                where: {
                    surveyId,
                    userId
                }
            });
            if (existingResponse) {
                return res.status(400).json({
                    success: false,
                    message: "您已经回答过此问卷"
                });
            }
        }
        // 获取问卷的所有小问题ID（排除GROUP类型的问题）
        const childQuestions = await _lib_prisma__WEBPACK_IMPORTED_MODULE_0__/* .prisma.question.findMany */ ._.question.findMany({
            where: {
                surveyId,
                type: {
                    not: "GROUP"
                }
            },
            select: {
                id: true
            }
        });
        const questionIds = childQuestions.map((q)=>q.id);
        // 验证回答的问题是否属于该问卷
        for (const answer of answers){
            if (!questionIds.includes(answer.questionId)) {
                return res.status(400).json({
                    success: false,
                    message: "回答的问题不属于该问卷"
                });
            }
        }
        // 开始事务处理，保存所有回答
        const result = await _lib_prisma__WEBPACK_IMPORTED_MODULE_0__/* .prisma.$transaction */ ._.$transaction(async (tx)=>{
            const responseResults = [];
            for (const answer of answers){
                const response = await tx.response.create({
                    data: {
                        surveyId,
                        userId,
                        questionId: answer.questionId,
                        optionId: answer.optionId || null,
                        submittedAt: new Date()
                    }
                });
                responseResults.push(response);
            }
            return responseResults;
        });
        return res.status(200).json({
            success: true,
            message: "层级问卷提交成功",
            data: {
                responseCount: result.length
            }
        });
    } catch (error) {
        console.error("提交层级问卷错误:", error);
        if (error.message.includes("Unique constraint failed")) {
            return res.status(400).json({
                success: false,
                message: "您已经回答过此问题"
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
var __webpack_exports__ = (__webpack_exec__(1715));
module.exports = __webpack_exports__;

})();