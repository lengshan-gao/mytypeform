"use strict";
(() => {
var exports = {};
exports.id = 39;
exports.ids = [39];
exports.modules = {

/***/ 6705:
/***/ ((module) => {

module.exports = import("formidable");;

/***/ }),

/***/ 7147:
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ 3102:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "config": () => (/* binding */ config),
/* harmony export */   "default": () => (/* binding */ handler)
/* harmony export */ });
/* harmony import */ var formidable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6705);
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7147);
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_1__);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([formidable__WEBPACK_IMPORTED_MODULE_0__]);
formidable__WEBPACK_IMPORTED_MODULE_0__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];


const config = {
    api: {
        bodyParser: false
    }
};
async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            message: "方法不允许"
        });
    }
    try {
        var ref;
        // 解析表单数据
        const form = (0,formidable__WEBPACK_IMPORTED_MODULE_0__["default"])({
            maxFileSize: 5 * 1024 * 1024,
            filename: (name, ext, part, form)=>{
                // 生成唯一文件名
                const timestamp = Date.now();
                const random = Math.random().toString(36).substring(2, 8);
                return `image_${timestamp}_${random}${ext}`;
            }
        });
        const [fields, files] = await form.parse(req);
        const imageFile = (ref = files.image) === null || ref === void 0 ? void 0 : ref[0];
        if (!imageFile) {
            return res.status(400).json({
                success: false,
                message: "请选择要上传的图片"
            });
        }
        // 验证文件类型
        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp"
        ];
        if (!allowedTypes.includes(imageFile.mimetype || "")) {
            // 删除临时文件
            if (fs__WEBPACK_IMPORTED_MODULE_1___default().existsSync(imageFile.filepath)) {
                fs__WEBPACK_IMPORTED_MODULE_1___default().unlinkSync(imageFile.filepath);
            }
            return res.status(400).json({
                success: false,
                message: "只支持 JPG、PNG、GIF、WebP 格式的图片"
            });
        }
        // 读取文件内容并转换为Base64
        const imageBuffer = fs__WEBPACK_IMPORTED_MODULE_1___default().readFileSync(imageFile.filepath);
        const base64Image = imageBuffer.toString("base64");
        // 根据MIME类型确定data URL前缀
        const mimeType = imageFile.mimetype || "image/jpeg";
        const dataUrl = `data:${mimeType};base64,${base64Image}`;
        // 删除临时文件
        if (fs__WEBPACK_IMPORTED_MODULE_1___default().existsSync(imageFile.filepath)) {
            fs__WEBPACK_IMPORTED_MODULE_1___default().unlinkSync(imageFile.filepath);
        }
        return res.status(200).json({
            success: true,
            data: {
                imageUrl: dataUrl,
                filename: imageFile.originalFilename || "image",
                size: imageFile.size,
                mimeType: mimeType
            },
            message: "图片上传成功"
        });
    } catch (error) {
        console.error("图片上传错误:", error);
        // 清理临时文件
        try {
            if (error.filepath && fs__WEBPACK_IMPORTED_MODULE_1___default().existsSync(error.filepath)) {
                fs__WEBPACK_IMPORTED_MODULE_1___default().unlinkSync(error.filepath);
            }
        } catch (cleanupError) {
            console.error("清理临时文件失败:", cleanupError);
        }
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message: "图片大小不能超过5MB"
            });
        }
        return res.status(500).json({
            success: false,
            message: "图片上传失败",
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
var __webpack_exports__ = (__webpack_exec__(3102));
module.exports = __webpack_exports__;

})();