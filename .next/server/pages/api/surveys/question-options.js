"use strict";
(() => {
var exports = {};
exports.id = 685;
exports.ids = [685];
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

/***/ 5917:
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
        // 获取问题ID
        const { questionId  } = req.query;
        if (!questionId || typeof questionId !== "string") {
            return res.status(400).json({
                success: false,
                message: "问题ID不能为空"
            });
        }
        // 获取问题选项
        const options = await _lib_prisma__WEBPACK_IMPORTED_MODULE_0__/* .prisma.questionOption.findMany */ ._.questionOption.findMany({
            where: {
                questionId: questionId
            },
            orderBy: {
                order: "asc"
            }
        });
        return res.status(200).json({
            success: true,
            data: {
                options: options.map((option)=>({
                        id: option.id,
                        content: option.content,
                        order: option.order
                    }))
            }
        });
    } catch (error) {
        console.error("获取问题选项错误:", error);
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
var __webpack_exports__ = (__webpack_exec__(5917));
module.exports = __webpack_exports__;

})();