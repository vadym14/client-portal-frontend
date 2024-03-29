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
    if (rjson.project.territory && plan['docusign_template']) {
        let zDocuSign = new ZecsnDocuSign()
        await zDocuSign.initialize()
        let template_name = `${rjson.project.territory} - ${plan['docusign_template']} - Settlement Agreement`
        const apply_template = await zDocuSign.applyTemplate(rjson['customer']['name'], template_name)
        if (apply_template) {
            const fill_custom_fields = await zDocuSign.fillCustomFields(rjson['customer']['name'])
            let contact = await api.getValue('Contact', ['name', 'first_name', 'last_name', 'email_id'], {'user': rjson['user']['name']})
            if (contact) {
                const add_signer = await zDocuSign.addSigner(rjson['customer']['name'], contact)
                if (add_signer) {
                    const resultsUrl = await zDocuSign.sendEnvelope(rjson['customer']['name'], contact)
                    if (resultsUrl['redirectUrl'] !== '') {
                        status = true
                        data['message'] = resultsUrl['redirectUrl']
                    }
                }
            }
        }
        Array.prototype.push.apply(data['_server_messages'], await api.getServerMessages())
        Array.prototype.push.apply(data['_server_messages'], await zDocuSign.getServerMessages())
    } else {
        Array.prototype.push.apply(data['_server_messages'], [{
            'message': plan['docusign_template'] ? 'Territory undefined, please contact support.' : 'Template undefined, please contact support.',
            'indicator': 'red'
        }])
    }

    return {
        status: 200,
        headers: {
            'access-control-allow-origin': '*'
        },
        body: {'status': status, 'data': data}
    };
}