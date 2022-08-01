import {ServerErrors} from "../../../lib/interfaces/error.interface";
import ZecsnDocuSign from "../../../lib/zecsn_ext/ZecsnDocuSign";
import ZecsnExtAPI from "../../../lib/zecsn_ext/ZecsnExtAPI";

/** @type {import('@sveltejs/kit').RequestHandler} */

export async function post({request}: any) {
    let status = false
    const data: ServerErrors = {
        'message': '',
        '_server_messages': []
    }

    const rjson = await request.json();
    const api = new ZecsnExtAPI();
    const plan = await api.getValue('Payment Terms Template', ['name', 'docusign_template'],
        {'name': rjson['project']['selected_plan']})
    let zDocuSign = new ZecsnDocuSign()
    await zDocuSign.initialize()
    let template_name = `${rjson.project.territory} - ${plan['docusign_template']} - Settlement Agreement`
    let contact = await api.getValue('Contact', ['name', 'first_name', 'last_name', 'email_id'], {'user': rjson['user']['name']})
    const apply_template = await zDocuSign.applyTemplate(rjson['customer']['name'], template_name)
    const fill_custom_fields = await zDocuSign.fillCustomFields(rjson['customer']['name'], template_name)
    const add_signer = await zDocuSign.addSigner(rjson['customer']['name'], contact, template_name)
    const resultsUrl = await zDocuSign.sendEnvelope(rjson['customer']['name'], contact)
    if (resultsUrl.redirectUrl !== '') {
        status = true
    }
    return {
        status: 200,
        headers: {
            'access-control-allow-origin': '*'
        },
        body: {'status': status, 'data': resultsUrl}
    };
}