"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const querystring_1 = __importDefault(require("querystring"));
const hydraUrl = process.env.HYDRA_URL || 'http://localhost:9000';
const hydraAdminUrl = process.env.HYDRA_ADMIN_URL || 'http://localhost:9001';
let mockTlsTermination = {};
const MOCK_TLS_TERMINATION = process.env.MOCK_TLS_TERMINATION || 'true';
if (MOCK_TLS_TERMINATION) {
    mockTlsTermination = {
        'X-Forwarded-Proto': 'https'
    };
}
function get(flow, challenge) {
    const url = new URL('/oauth2/auth/requests/' + flow, hydraAdminUrl);
    url.search = querystring_1.default.stringify({ [flow + '_challenge']: challenge });
    return axios_1.default.get(url.toString(), {
        headers: mockTlsTermination,
        timeout: 5000
    }).then(res => {
        return res.data;
    });
}
function put(flow, action, challenge, body) {
    const url = new URL('/oauth2/auth/requests/' + flow + '/' + action, hydraAdminUrl);
    url.search = querystring_1.default.stringify({ [flow + '_challenge']: challenge });
    const headers = Object.assign({ 'Content-Type': 'application/json' }, mockTlsTermination);
    return axios_1.default.put(url.toString(), body, {
        headers,
        timeout: 5000
    }).then(res => res.data);
}
exports.hydra = {
    getLoginRequest: function (challenge) {
        return get('login', challenge);
    },
    acceptLoginRequest: function (challenge, body) {
        return put('login', 'accept', challenge, body);
    },
    rejectLoginRequest: function (challenge, body) {
        return put('login', 'reject', challenge, body);
    },
    getConsentRequest: function (challenge) {
        return get('consent', challenge);
    },
    acceptConsentRequest: function (challenge, body) {
        return put('consent', 'accept', challenge, body);
    },
    rejectConsentRequest: function (challenge, body) {
        return put('consent', 'reject', challenge, body);
    },
    getLogoutRequest: function (challenge) {
        return get('logout', challenge);
    },
    acceptLogoutRequest: function (challenge) {
        return put('logout', 'accept', challenge, {});
    },
    rejectLogoutRequest: function (challenge) {
        return put('logout', 'reject', challenge, {});
    },
    introspectToken: function (token) {
        const url = new URL('/oauth2/introspect', hydraAdminUrl);
        const introspectParams = new URLSearchParams();
        introspectParams.set('token', token);
        const headers = Object.assign({ 'Content-Type': 'application/x-www-form-urlencoded' }, mockTlsTermination);
        return axios_1.default.post(url.href, introspectParams, { headers }).then(resp => resp.data);
    },
    createToken: function (params) {
        const url = new URL('/oauth2/token', hydraUrl);
        return axios_1.default.post(url.toString(), params, {
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            }
        }).then(resp => resp.data);
    }
};
//# sourceMappingURL=hydra.js.map