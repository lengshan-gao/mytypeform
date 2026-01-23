"use strict";
(() => {
var exports = {};
exports.id = 578;
exports.ids = [578];
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

/***/ 8400:
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
        // 获取问卷ID
        const { id: surveyId  } = req.query;
        if (!surveyId || typeof surveyId !== "string") {
            return res.status(400).json({
                success: false,
                message: "问卷ID不能为空"
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
        // 获取问卷的项目（顶级问题）
        const projectQuestions = await _lib_prisma__WEBPACK_IMPORTED_MODULE_0__/* .prisma.question.findMany */ ._.question.findMany({
            where: {
                surveyId: surveyId,
                type: "PROJECT",
                parentId: null
            },
            orderBy: {
                order: "asc"
            }
        });
        // 获取每个项目的维度
        const projects = await Promise.all(projectQuestions.map(async (project)=>{
            // 获取项目的维度（子问题）
            const dimensionQuestions = await _lib_prisma__WEBPACK_IMPORTED_MODULE_0__/* .prisma.question.findMany */ ._.question.findMany({
                where: {
                    surveyId: surveyId,
                    type: "DIMENSION",
                    parentId: project.id
                },
                orderBy: {
                    order: "asc"
                }
            });
            // 获取每个维度的选项
            const dimensions = await Promise.all(dimensionQuestions.map(async (dimension)=>{
                const options = await _lib_prisma__WEBPACK_IMPORTED_MODULE_0__/* .prisma.questionOption.findMany */ ._.questionOption.findMany({
                    where: {
                        questionId: dimension.id
                    },
                    orderBy: {
                        order: "asc"
                    }
                });
                return {
                    id: dimension.id,
                    content: dimension.content,
                    weight: dimension.weight,
                    options: options.map((option)=>({
                            id: option.id,
                            content: option.content,
                            score: option.score
                        }))
                };
            }));
            return {
                id: project.id,
                content: project.content,
                imageUrl: project.imageUrl || null,
                dimensions
            };
        }));
        return res.status(200).json({
            success: true,
            data: {
                survey,
                projects
            }
        });
    } catch (error) {
        console.error("获取权重计算问卷错误:", error);
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
var __webpack_exports__ = (__webpack_exec__(8400));
module.exports = __webpack_exports__;

})();