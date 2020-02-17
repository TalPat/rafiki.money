"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const got_1 = __importDefault(require("got"));
const hydraAdminUrl = process.env.HYDRA_ADMIN_URL || 'http://localhost:9001';
let mockTlsTermination = {};
const MOCK_TLS_TERMINATION = process.env.MOCK_TLS_TERMINATION || 'true';
if (MOCK_TLS_TERMINATION === 'true') {
    mockTlsTermination = {
        'X-Forwarded-Proto': 'https'
    };
}
function get(flow, challenge) {
    const url = new URL('/oauth2/auth/requests/' + flow, hydraAdminUrl);
    url.searchParams.set(`${flow}_challenge`, challenge);
    return axios_1.default.get(url.toString(), {
        headers: mockTlsTermination,
        timeout: 5000
    }).then(res => {
        return res.data;
    });
}
function put(flow, action, challenge, body) {
    const url = new URL('/oauth2/auth/requests/' + flow + '/' + action, hydraAdminUrl);
    url.searchParams.set(`${flow}_challenge`, challenge);
    const headers = Object.assign(mockTlsTermination, { 'content-type': 'application/json' });
    return axios_1.default.put(url.toString(), body, {
        headers,
        timeout: 5000
    }).then(res => res.data);
}
exports.hydra = {
    getLoginRequest: async function (challenge) {
        return get('login', challenge);
    },
    acceptLoginRequest: async function (challenge, body) {
        return put('login', 'accept', challenge, body);
    },
    rejectLoginRequest: async function (challenge, body) {
        return put('login', 'reject', challenge, body);
    },
    getConsentRequest: async function (challenge) {
        return get('consent', challenge);
    },
    acceptConsentRequest: async function (challenge, body) {
        return put('consent', 'accept', challenge, body);
    },
    rejectConsentRequest: async function (challenge, body) {
        return put('consent', 'reject', challenge, body);
    },
    getLogoutRequest: async function (challenge) {
        return get('logout', challenge);
    },
    acceptLogoutRequest: async function (challenge) {
        return put('logout', 'accept', challenge, {});
    },
    rejectLogoutRequest: async function (challenge) {
        return put('logout', 'reject', challenge, {});
    },
    introspectToken: function (token) {
        const url = new URL('/oauth2/introspect', hydraAdminUrl);
        const headers = Object.assign({ 'Content-Type': 'application/x-www-form-urlencoded' }, mockTlsTermination);
        const body = (new URLSearchParams({ token })).toString();
        console.log('in introspect token: ', token, ' typeof token', typeof token);
        const instance = got_1.default.extend({
            hooks: {
                beforeRequest: [
                    options => {
                        console.log('headers before going out', options.headers);
                        console.log('body before going out', options.body);
                        if (options.headers) {
                            options.headers['content-type'] = 'application/x-www-form-urlencoded';
                        }
                    }
                ]
            }
        });
        return instance.post(url.toString(), { body, headers }).then(resp => JSON.parse(resp.body));
    },
    createOauthClient: async function (clientDetails) {
        const url = new URL('/clients', hydraAdminUrl);
        const headers = Object.assign({ 'Content-Type': 'application/json' }, mockTlsTermination);
        return axios_1.default.post(url.toString(), clientDetails, { headers }).then(resp => resp.data);
    }
};
//# sourceMappingURL=hydra.js.map