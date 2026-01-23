"use strict";
(() => {
var exports = {};
exports.id = 961;
exports.ids = [961];
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

/***/ 579:
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
        const { id  } = req.query;
        if (!id || typeof id !== "string") {
            return res.status(400).json({
                success: false,
                message: "问卷ID不能为空"
            });
        }
        // 获取权重问卷详情
        const survey = await _lib_prisma__WEBPACK_IMPORTED_MODULE_0__/* .prisma.survey.findUnique */ ._.survey.findUnique({
            where: {
                id
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
                    },
                    orderBy: {
                        order: "asc"
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
        // 检查问卷是否过期（只有当expiresAt不为null且早于当前时间时才认为过期）
        if (survey.expiresAt && new Date(survey.expiresAt) < new Date()) {
            return res.status(400).json({
                success: false,
                message: "问卷已过期"
            });
        }
        // 转换数据结构为项目-维度-选项层级
        const projects = survey.questions.filter((q)=>q.type === "PROJECT").map((project)=>({
                id: project.id,
                content: project.content,
                imageUrl: project.imageUrl || null,
                dimensions: project.children.map((dimension)=>({
                        id: dimension.id,
                        content: dimension.content,
                        weight: dimension.weight,
                        options: dimension.options.map((option)=>({
                                id: option.id,
                                content: option.content,
                                score: option.score
                            }))
                    }))
            }));
        const surveyData = {
            id: survey.id,
            title: survey.title,
            description: survey.description,
            expiresAt: survey.expiresAt,
            projects
        };
        res.status(200).json({
            success: true,
            data: {
                survey: surveyData
            }
        });
    } catch (error) {
        console.error("获取权重问卷详情失败:", error);
        res.status(500).json({
            success: false,
            message: "服务器内部错误",
            error: error instanceof Error ? error.message : "未知错误"
        });
    }
}


/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__(579));
module.exports = __webpack_exports__;

})();