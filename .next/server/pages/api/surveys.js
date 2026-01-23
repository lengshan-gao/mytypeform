"use strict";
(() => {
var exports = {};
exports.id = 5;
exports.ids = [5];
exports.modules = {

/***/ 3524:
/***/ ((module) => {

module.exports = require("@prisma/client");

/***/ }),

/***/ 8432:
/***/ ((module) => {

module.exports = require("bcryptjs");

/***/ }),

/***/ 9344:
/***/ ((module) => {

module.exports = require("jsonwebtoken");

/***/ }),

/***/ 9648:
/***/ ((module) => {

module.exports = import("axios");;

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

/***/ 1207:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ handler)
/* harmony export */ });
/* harmony import */ var _lib_prisma__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8047);
/* harmony import */ var _lib_auth__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4884);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_lib_auth__WEBPACK_IMPORTED_MODULE_1__]);
_lib_auth__WEBPACK_IMPORTED_MODULE_1__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];


// 辅助函数：验证用户身份
function authenticateUser(req) {
    const authHeader = req.headers.authorization;
    const token = (0,_lib_auth__WEBPACK_IMPORTED_MODULE_1__/* .extractTokenFromHeader */ .oA)(authHeader);
    if (!token) {
        return null;
    }
    const user = (0,_lib_auth__WEBPACK_IMPORTED_MODULE_1__/* .verifyToken */ .WX)(token);
    return user;
}
async function handler(req, res) {
    try {
        // 设置CORS头
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization");
        // 处理OPTIONS请求
        if (req.method === "OPTIONS") {
            return res.status(200).end();
        }
        // 验证用户身份（除了登录注册外的所有API）
        const user = authenticateUser(req);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "请先登录"
            });
        }
        // GET /api/surveys - 获取问卷列表
        if (req.method === "GET") {
            const { status ="all" , page ="1" , limit ="10"  } = req.query;
            const pageNum = parseInt(page) || 1;
            const limitNum = parseInt(limit) || 10;
            const skip = (pageNum - 1) * limitNum;
            // 构建查询条件
            const where = {
                creatorId: user.id
            };
            if (status && status !== "all") {
                where.status = status;
            }
            // 获取问卷列表
            const [surveys, total] = await Promise.all([
                _lib_prisma__WEBPACK_IMPORTED_MODULE_0__/* .prisma.survey.findMany */ ._.survey.findMany({
                    where,
                    include: {
                        _count: {
                            select: {
                                questions: true,
                                responses: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: "desc"
                    },
                    skip,
                    take: limitNum
                }),
                _lib_prisma__WEBPACK_IMPORTED_MODULE_0__/* .prisma.survey.count */ ._.survey.count({
                    where
                }), 
            ]);
            return res.status(200).json({
                success: true,
                data: {
                    surveys,
                    pagination: {
                        page: pageNum,
                        limit: limitNum,
                        total,
                        pages: Math.ceil(total / limitNum)
                    }
                }
            });
        }
        // POST /api/surveys - 创建问卷
        if (req.method === "POST") {
            const { title , description , expiresAt , status: status1 = "DRAFT" , questions =[] , isAnonymous =false , isPublic =true , maxResponses =null ,  } = req.body;
            // 验证输入
            if (!title || !title.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "问卷标题不能为空"
                });
            }
            // 验证问题数据
            if (questions && !Array.isArray(questions)) {
                return res.status(400).json({
                    success: false,
                    message: "问题数据格式不正确"
                });
            }
            // 使用事务创建问卷和问题
            const result = await _lib_prisma__WEBPACK_IMPORTED_MODULE_0__/* .prisma.$transaction */ ._.$transaction(async (tx)=>{
                // 创建问卷
                const survey = await tx.survey.create({
                    data: {
                        title: title.trim(),
                        description: (description === null || description === void 0 ? void 0 : description.trim()) || "",
                        creatorId: user.id,
                        status: status1 || "DRAFT",
                        expiresAt: expiresAt ? new Date(expiresAt) : null,
                        isAnonymous,
                        isPublic,
                        maxResponses
                    }
                });
                // 批量创建问题（使用循环避免createMany在SQLite中的兼容性问题）
                if (questions.length > 0) {
                    for(let i = 0; i < questions.length; i++){
                        var ref, ref1;
                        const q = questions[i];
                        const qData = {
                            surveyId: survey.id,
                            content: ((ref = q.content) === null || ref === void 0 ? void 0 : ref.trim()) || "",
                            type: q.type || "RATING",
                            weight: typeof q.weight === "number" ? q.weight : 1.0,
                            imageUrl: ((ref1 = q.imageUrl) === null || ref1 === void 0 ? void 0 : ref1.trim()) || null,
                            order: typeof q.order === "number" ? q.order : i + 1
                        };
                        // 验证问题内容
                        if (!qData.content) {
                            throw new Error("问题内容不能为空");
                        }
                        await tx.question.create({
                            data: qData
                        });
                    }
                }
                // 获取创建的问题列表
                const createdQuestions = await tx.question.findMany({
                    where: {
                        surveyId: survey.id
                    },
                    orderBy: {
                        order: "asc"
                    }
                });
                return {
                    survey,
                    questions: createdQuestions
                };
            });
            return res.status(201).json({
                success: true,
                data: result,
                message: questions.length > 0 ? "问卷和问题创建成功" : "问卷创建成功"
            });
        }
        // 方法不允许
        return res.status(405).json({
            success: false,
            message: "方法不允许"
        });
    } catch (error) {
        console.error("API错误:", error);
        // 处理已知错误
        if (error.message === "问题内容不能为空") {
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

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, [884], () => (__webpack_exec__(1207)));
module.exports = __webpack_exports__;

})();