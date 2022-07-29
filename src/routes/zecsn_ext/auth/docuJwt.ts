/** @type {import('@sveltejs/kit').RequestHandler} */
import ZecsnExtAPI from "$lib/zecsn_ext/ZecsnExtAPI";
import docusign from "docusign-esign";
import fs from "fs";
import {getConsent} from '$lib/utils/docusignRequestUtils'
import jwtConfig from '$lib/config/jwtConfig.json'
const SCOPES = [
    "signature", "impersonation"
];
export async function getDocuJwt() {
    let data={},status=true
    const jwtLifeSec = 10 * 60, // requested lifetime for the JWT is 10 min
        dsApi = new docusign.ApiClient();
    dsApi.setOAuthBasePath(jwtConfig.dsOauthServer.replace('https://', '')); // it should be domain only.
    let rsaKey = fs.readFileSync(jwtConfig.privateKeyLocation);
    try {
        const results = await dsApi.requestJWTUserToken(jwtConfig.dsJWTClientId,
                jwtConfig.impersonatedUserGuid, SCOPES, rsaKey,
            jwtLifeSec);
        const accessToken = results.body.access_token;

        // get user info
        const userInfoResults = await dsApi.getUserInfo(accessToken);

        // use the default account
        let userInfo = userInfoResults.accounts.find(account =>
            account.isDefault === "true");
        return {
                    accessToken: results.body.access_token,
                    apiAccountId: userInfo.accountId,
                    basePath: `${userInfo.baseUri}/restapi`
        }
    } catch (e) {
        // console.log(e);
        let body = e.response && e.response.body;
        // Determine the source of the error
        if (body) {
            // The user needs to grant consent
            if (body.error && body.error === 'consent_required') {
                 data = getConsent()?authenticate():''
                return data
            } else {
                // Consent has been granted. Show status code for DocuSign API error
                return {
                    status: e.response.status,
                    headers: {
                        'access-control-allow-origin': '*',
                    },
                    body: {'status': status, 'data': body,error:e}
                };
            }
        }
    }

}

async function authenticate(){
    const jwtLifeSec = 10 * 60, // requested lifetime for the JWT is 10 min
        dsApi = new docusign.ApiClient();
    dsApi.setOAuthBasePath(jwtConfig.dsOauthServer.replace('https://', '')); // it should be domain only.
    let rsaKey = fs.readFileSync(jwtConfig.privateKeyLocation);
    try {
        const results = await dsApi.requestJWTUserToken(jwtConfig.dsJWTClientId,
            jwtConfig.impersonatedUserGuid, SCOPES, rsaKey,
            jwtLifeSec);
        const accessToken = results.body.access_token;

        // get user info
        const userInfoResults = await dsApi.getUserInfo(accessToken);

        // use the default account
        let userInfo = userInfoResults.accounts.find(account =>
            account.isDefault === "true");

        return {
            accessToken: results.body.access_token,
            apiAccountId: userInfo.accountId,
            basePath: `${userInfo.baseUri}/restapi`
        };
    } catch (e) {
        console.log(e);
        let body = e.response && e.response.body;
        // Determine the source of the error
        if (body) {
            // The user needs to grant consent
            if (body.error && body.error === 'consent_required') {
                if (getConsent()){ return authenticate(); };
            } else {
                // Consent has been granted. Show status code for DocuSign API error
                this._debug_log(`\nAPI problem: Status code ${e.response.status}, message body:
        ${JSON.stringify(body, null, 4)}\n\n`);
            }
        }
    }
}