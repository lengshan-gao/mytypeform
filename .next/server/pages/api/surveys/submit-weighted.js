"use strict";
(() => {
var exports = {};
exports.id = 449;
exports.ids = [449];
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

/***/ 6222:
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
        const { surveyId , answers  } = req.body;
        // 验证必填字段
        if (!surveyId) {
            return res.status(400).json({
                success: false,
                message: "问卷ID不能为空"
            });
        }
        if (!answers || !Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({
                success: false,
                message: "请完成所有维度的评分"
            });
        }
        // 验证问卷是否存在
        const survey = await _lib_prisma__WEBPACK_IMPORTED_MODULE_0__/* .prisma.survey.findUnique */ ._.survey.findUnique({
            where: {
                id: surveyId
            },
            include: {
                questions: {
                    where: {
                        type: "DIMENSION"
                    },
                    include: {
                        options: true
                    }
                }
            }
        });
        if (!survey) {
            return res.status(404).json({
                success: false,
                message: "问卷不存在"
            });
        }
        // 检查问卷是否过期
        if (survey.expiresAt && new Date(survey.expiresAt) < new Date()) {
            return res.status(400).json({
                success: false,
                message: "问卷已过期"
            });
        }
        // 验证所有维度是否都已选择
        const allDimensions = survey.questions;
        const answeredDimensionIds = answers.map((a)=>a.dimensionId);
        const unselectedDimensions = allDimensions.filter((dim)=>!answeredDimensionIds.includes(dim.id));
        if (unselectedDimensions.length > 0) {
            return res.status(400).json({
                success: false,
                message: `请完成所有维度的评分：${unselectedDimensions.map((d)=>d.content).join("、")}`
            });
        }
        // 验证选项是否有效
        for (const answer of answers){
            const dimension = allDimensions.find((d)=>d.id === answer.dimensionId);
            if (!dimension) {
                return res.status(400).json({
                    success: false,
                    message: `无效的维度ID: ${answer.dimensionId}`
                });
            }
            const option = dimension.options.find((o)=>o.id === answer.optionId);
            if (!option) {
                return res.status(400).json({
                    success: false,
                    message: `无效的选项ID: ${answer.optionId}`
                });
            }
        }
        // 创建回答记录 - 为每个维度创建单独的Response记录
        // 为每次提交生成唯一的用户ID，避免唯一约束冲突
        const userId = `anonymous_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        // 使用事务创建所有回答记录
        const responses = await _lib_prisma__WEBPACK_IMPORTED_MODULE_0__/* .prisma.$transaction */ ._.$transaction(answers.map((answer)=>_lib_prisma__WEBPACK_IMPORTED_MODULE_0__/* .prisma.response.create */ ._.response.create({
                data: {
                    surveyId,
                    userId,
                    questionId: answer.dimensionId,
                    optionId: answer.optionId,
                    submittedAt: new Date()
                },
                include: {
                    question: true,
                    option: true
                }
            })));
        // 计算项目得分
        const projectScores = await calculateProjectScores(surveyId, answers);
        res.status(200).json({
            success: true,
            message: "问卷提交成功",
            data: {
                responseIds: responses.map((r)=>r.id),
                projectScores
            }
        });
    } catch (error) {
        console.error("提交权重问卷失败:", error);
        res.status(500).json({
            success: false,
            message: "服务器内部错误",
            error: error instanceof Error ? error.message : "未知错误"
        });
    }
}
async function calculateProjectScores(surveyId, answers) {
    // 获取问卷的项目和维度结构
    const survey = await _lib_prisma__WEBPACK_IMPORTED_MODULE_0__/* .prisma.survey.findUnique */ ._.survey.findUnique({
        where: {
            id: surveyId
        },
        include: {
            questions: {
                where: {
                    OR: [
                        {
                            type: "PROJECT"
                        },
                        {
                            type: "DIMENSION"
                        }
                    ]
                },
                include: {
                    options: true,
                    children: {
                        include: {
                            options: true
                        }
                    }
                }
            }
        }
    });
    if (!survey) return [];
    const projectScores = survey.questions.filter((q)=>q.type === "PROJECT").map((project)=>{
        const dimensions = project.children;
        let totalScore = 0;
        dimensions.forEach((dimension)=>{
            const answer = answers.find((a)=>a.dimensionId === dimension.id);
            if (answer) {
                const option = dimension.options.find((o)=>o.id === answer.optionId);
                if (option) {
                    // 计算维度得分：选项分数 × 维度权重
                    totalScore += option.score * dimension.weight;
                }
            }
        });
        return {
            projectId: project.id,
            projectName: project.content,
            score: Math.round(totalScore * 100) / 100 // 保留两位小数
        };
    });
    return projectScores;
}


/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__(6222));
module.exports = __webpack_exports__;

})();