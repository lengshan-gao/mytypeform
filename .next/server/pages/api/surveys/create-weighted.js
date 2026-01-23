"use strict";
(() => {
var exports = {};
exports.id = 250;
exports.ids = [250];
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

/***/ 1889:
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
        // 验证认证头
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "请先登录"
            });
        }
        const token = authHeader.substring(7);
        // 简化认证
        if (!token || token.length < 50) {
            return res.status(401).json({
                success: false,
                message: "请先登录"
            });
        }
        // 查找或创建默认用户
        let user = await _lib_prisma__WEBPACK_IMPORTED_MODULE_0__/* .prisma.user.findFirst */ ._.user.findFirst({
            where: {
                OR: [
                    {
                        email: "test@example.com"
                    },
                    {
                        nickname: "测试用户"
                    }
                ]
            }
        });
        // 如果用户不存在，创建默认用户
        if (!user) {
            user = await _lib_prisma__WEBPACK_IMPORTED_MODULE_0__/* .prisma.user.create */ ._.user.create({
                data: {
                    email: "test@example.com",
                    nickname: "测试用户",
                    password: "hashed_password",
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });
        }
        const userId = user.id;
        const { title , description , expiresAt , projects  } = req.body;
        // 验证必填字段
        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "问卷标题不能为空"
            });
        }
        if (!projects || !Array.isArray(projects) || projects.length === 0) {
            return res.status(400).json({
                success: false,
                message: "至少需要配置一个项目"
            });
        }
        // 验证每个项目的维度权重总和
        for (const project of projects){
            const totalWeight = project.dimensions.reduce((sum, dim)=>sum + dim.weight, 0);
            if (Math.abs(totalWeight - 1) > 0.001) {
                return res.status(400).json({
                    success: false,
                    message: `项目"${project.content}"的维度权重总和必须为1，当前为${totalWeight}`
                });
            }
        }
        // 创建权重计算问卷
        const survey = await _lib_prisma__WEBPACK_IMPORTED_MODULE_0__/* .prisma.survey.create */ ._.survey.create({
            data: {
                title: title.trim(),
                description: (description === null || description === void 0 ? void 0 : description.trim()) || null,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                creatorId: userId,
                status: "PUBLISHED",
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });
        // 创建项目、维度、选项
        for (const [projectIndex, project1] of projects.entries()){
            // 创建项目（作为顶级问题）
            const projectQuestion = await _lib_prisma__WEBPACK_IMPORTED_MODULE_0__/* .prisma.question.create */ ._.question.create({
                data: {
                    content: project1.content,
                    type: "PROJECT",
                    order: projectIndex,
                    surveyId: survey.id,
                    weight: 1,
                    imageUrl: project1.imageUrl || null,
                    createdAt: new Date()
                }
            });
            // 创建维度（作为项目的子问题）
            for (const [dimensionIndex, dimension] of project1.dimensions.entries()){
                const dimensionQuestion = await _lib_prisma__WEBPACK_IMPORTED_MODULE_0__/* .prisma.question.create */ ._.question.create({
                    data: {
                        content: dimension.content,
                        type: "DIMENSION",
                        order: dimensionIndex,
                        surveyId: survey.id,
                        parentId: projectQuestion.id,
                        weight: dimension.weight,
                        createdAt: new Date()
                    }
                });
                // 创建选项（1分、3分、9分）
                for (const option of dimension.options){
                    await _lib_prisma__WEBPACK_IMPORTED_MODULE_0__/* .prisma.questionOption.create */ ._.questionOption.create({
                        data: {
                            content: option.content,
                            score: option.score,
                            weight: 1,
                            order: option.score === 1 ? 0 : option.score === 3 ? 1 : 2,
                            questionId: dimensionQuestion.id,
                            createdAt: new Date()
                        }
                    });
                }
            }
        }
        return res.status(201).json({
            success: true,
            data: {
                survey: {
                    id: survey.id,
                    title: survey.title,
                    description: survey.description,
                    status: survey.status,
                    expiresAt: survey.expiresAt,
                    createdAt: survey.createdAt
                },
                projects: projects.length
            },
            message: "权重计算问卷创建成功"
        });
    } catch (error) {
        console.error("创建权重计算问卷错误:", error);
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
var __webpack_exports__ = (__webpack_exec__(1889));
module.exports = __webpack_exports__;

})();