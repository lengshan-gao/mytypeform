"use strict";
exports.id = 884;
exports.ids = [884];
exports.modules = {

/***/ 8232:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
/* unused harmony exports api, ApiError, fetchApi, get, post, put, del */
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9648);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([axios__WEBPACK_IMPORTED_MODULE_0__]);
axios__WEBPACK_IMPORTED_MODULE_0__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];

const API_BASE_URL = "/api" || 0;
const api = axios__WEBPACK_IMPORTED_MODULE_0__["default"].create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json"
    }
});
// 请求拦截器
api.interceptors.request.use((config)=>{
    // 从localStorage获取token
    if (false) {}
    return config;
}, (error)=>{
    return Promise.reject(error);
});
// 响应拦截器
api.interceptors.response.use((response)=>response, (error)=>{
    if (error.response) {
        const { status , data  } = error.response;
        switch(status){
            case 401:
                // 未授权，跳转到登录页
                if (false) {}
                break;
            case 403:
                // 权限不足
                console.error("权限不足:", data.message);
                break;
            case 404:
                // 资源不存在
                console.error("资源不存在:", data.message);
                break;
            case 422:
                // 验证错误
                console.error("验证错误:", data.errors);
                break;
            case 500:
                // 服务器错误
                console.error("服务器错误:", data.message);
                break;
            default:
                console.error("请求错误:", error.message);
        }
    } else if (error.request) {
        // 请求发送成功，但没有收到响应
        console.error("网络错误，请检查网络连接");
    } else {
        // 请求配置错误
        console.error("请求配置错误:", error.message);
    }
    return Promise.reject(error);
});
// API错误类型
class ApiError extends Error {
    constructor(message, status, errors){
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.errors = errors;
    }
}
// 通用API调用函数
async function fetchApi(method, url, data) {
    try {
        const response = await api.request({
            method,
            url,
            data: method !== "GET" ? data : undefined,
            params: method === "GET" ? data : undefined
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new ApiError(error.response.data.message || "请求失败", error.response.status, error.response.data.errors);
        }
        throw error;
    }
}
// 简化的API方法
const get = (url, params)=>fetchApi("GET", url, params);
const post = (url, data)=>fetchApi("POST", url, data);
const put = (url, data)=>fetchApi("PUT", url, data);
const del = (url, data)=>fetchApi("DELETE", url, data);

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 4884:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Gv": () => (/* binding */ verifyPassword),
/* harmony export */   "RA": () => (/* binding */ generateToken),
/* harmony export */   "WX": () => (/* binding */ verifyToken),
/* harmony export */   "c_": () => (/* binding */ hashPassword),
/* harmony export */   "oA": () => (/* binding */ extractTokenFromHeader)
/* harmony export */ });
/* unused harmony exports generateAnonymousUserId, isLoggedIn, getCurrentUser, login, logout */
/* harmony import */ var jsonwebtoken__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9344);
/* harmony import */ var jsonwebtoken__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(jsonwebtoken__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(8432);
/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(bcryptjs__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _api__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(8232);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_api__WEBPACK_IMPORTED_MODULE_2__]);
_api__WEBPACK_IMPORTED_MODULE_2__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];



const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d";
// 生成JWT令牌
function generateToken(payload) {
    const expiresIn = JWT_EXPIRES_IN;
    const token = jsonwebtoken__WEBPACK_IMPORTED_MODULE_0___default().sign(payload, JWT_SECRET, {
        expiresIn
    });
    const decoded = jsonwebtoken__WEBPACK_IMPORTED_MODULE_0___default().decode(token);
    return {
        token,
        expiresAt: decoded.exp * 1000
    };
}
// 验证JWT令牌
function verifyToken(token) {
    try {
        // 使用更简单的验证方式
        const decoded = jsonwebtoken__WEBPACK_IMPORTED_MODULE_0___default().verify(token, JWT_SECRET);
        // 确保返回的对象包含必要的字段
        if (decoded && decoded.id) {
            return {
                id: decoded.id,
                openid: decoded.openid,
                nickname: decoded.nickname,
                avatar: decoded.avatar
            };
        }
        return null;
    } catch (error) {
        console.error("Token verification failed:", error);
        return null;
    }
}
// 密码哈希
async function hashPassword(password) {
    const salt = await bcryptjs__WEBPACK_IMPORTED_MODULE_1___default().genSalt(10);
    return bcryptjs__WEBPACK_IMPORTED_MODULE_1___default().hash(password, salt);
}
// 验证密码
async function verifyPassword(password, hashedPassword) {
    return bcryptjs__WEBPACK_IMPORTED_MODULE_1___default().compare(password, hashedPassword);
}
// 从请求头中提取token
function extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }
    return authHeader.substring(7);
}
// 生成匿名用户ID（用于未登录用户填写问卷）
function generateAnonymousUserId() {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 10);
    return `anonymous_${timestamp}_${randomStr}`;
}
// 检查用户是否登录（客户端）
function isLoggedIn() {
    if (true) {
        return false;
    }
    const token = localStorage.getItem("token");
    if (!token) return false;
    try {
        const decoded = verifyToken(token);
        return !!decoded;
    } catch  {
        return false;
    }
}
// 获取当前用户信息（客户端）
function getCurrentUser() {
    if (true) {
        return null;
    }
    const token = localStorage.getItem("token");
    if (!token) return null;
    return verifyToken(token);
}
// 登录（存储token到localStorage）
function login(token) {
    if (false) {}
}
// 登出（移除token）
function logout() {
    if (false) {}
}
// 重新导出ApiError


__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ })

};
;