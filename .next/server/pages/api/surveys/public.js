"use strict";
(() => {
var exports = {};
exports.id = 766;
exports.ids = [766];
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

/***/ 2613:
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
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        nickname: true,
                        avatar: true
                    }
                },
                _count: {
                    select: {
                        questions: true,
                        responses: true
                    }
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
        if (survey.maxResponses && survey._count.responses >= survey.maxResponses) {
            return res.status(400).json({
                success: false,
                message: "问卷回答数已达到上限"
            });
        }
        // 获取问卷的问题列表（包含层级结构和选项）
        const questions = await _lib_prisma__WEBPACK_IMPORTED_MODULE_0__/* .prisma.question.findMany */ ._.question.findMany({
            where: {
                surveyId: surveyId
            },
            include: {
                options: {
                    orderBy: {
                        order: "asc"
                    }
                },
                children: {
                    include: {
                        options: {
                            orderBy: {
                                order: "asc"
                            }
                        }
                    },
                    orderBy: {
                        order: "asc"
                    }
                }
            },
            orderBy: {
                order: "asc"
            }
        });
        return res.status(200).json({
            success: true,
            data: {
                survey,
                questions
            }
        });
    } catch (error) {
        console.error("获取公开问卷错误:", error);
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
var __webpack_exports__ = (__webpack_exec__(2613));
module.exports = __webpack_exports__;

})();