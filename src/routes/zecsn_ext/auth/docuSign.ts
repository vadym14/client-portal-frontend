/** @type {import('@sveltejs/kit').RequestHandler} */
import ZecsnExtAPI from "$lib/zecsn_ext/ZecsnExtAPI";
import docusign from "docusign-esign";
import fs from "fs";
import {getConsent} from '$lib/utils/docusignRequestUtils'
import jwtConfig from '$lib/config/jwtConfig.json'
import * as cookie from "cookie";
import ZecsnDocuSign from "../../../lib/zecsn_ext/ZecsnDocuSign";

export async function post({request}: any) {
    let data={},status=true
    let rjson = request.json()
    let zDocuSign = new ZecsnDocuSign()
    await zDocuSign.initialize()
    const envelope = await zDocuSign.getEnvelopeStatus(rjson.name)
    return {
        status: 200,
        headers: {
            'access-control-allow-origin': '*'
        },
        body: {'status': status, 'data': envelope}
    };
}
