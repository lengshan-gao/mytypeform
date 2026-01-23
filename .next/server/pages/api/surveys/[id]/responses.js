"use strict";
(() => {
var exports = {};
exports.id = 675;
exports.ids = [675];
exports.modules = {

/***/ 3524:
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),

/***/ 9404:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ handler)
/* harmony export */ });
/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3524);
/* harmony import */ var _prisma_client__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_prisma_client__WEBPACK_IMPORTED_MODULE_0__);

const prisma = new _prisma_client__WEBPACK_IMPORTED_MODULE_0__.PrismaClient();
async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({
            success: false,
            message: "Method not allowed"
        });
    }
    const { id  } = req.query;
    if (!id || typeof id !== "string") {
        return res.status(400).json({
            success: false,
            message: "问卷ID不能为空"
        });
    }
    try {
        // 获取问卷的所有回答记录
        const responses = await prisma.response.findMany({
            where: {
                surveyId: id
            },
            include: {
                question: {
                    include: {
                        parent: true,
                        options: true
                    }
                },
                option: true
            },
            orderBy: {
                submittedAt: "desc"
            }
        });
        // 转换数据结构，便于前端使用
        const formattedResponses = responses.map((response)=>{
            var ref;
            return {
                questionId: response.questionId,
                optionId: response.optionId,
                option: {
                    score: ((ref = response.option) === null || ref === void 0 ? void 0 : ref.score) || 0
                },
                question: {
                    content: response.question.content,
                    weight: response.question.weight,
                    parent: response.question.parent ? {
                        content: response.question.parent.content
                    } : null
                }
            };
        });
        return res.status(200).json({
            success: true,
            data: {
                responses: formattedResponses,
                total: formattedResponses.length
            }
        });
    } catch (error) {
        console.error("获取问卷回答记录错误:", error);
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
var __webpack_require__ = require("../../../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__(9404));
module.exports = __webpack_exports__;

})();