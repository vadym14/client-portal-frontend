/** @type {import('@sveltejs/kit').RequestHandler} */
import ZecsnExtAPI from "$lib/zecsn_ext/ZecsnExtAPI";
import type {ServerErrors} from "../../../lib/interfaces/error.interface";
import ZecsnDocuSign from "../../../lib/zecsn_ext/ZecsnDocuSign";

// post register handler
export async function post({request}: any) {
    let status = false
    const data: ServerErrors = {
        'message': '',
        '_server_messages': []
    }

    const rjson = await request.json();
    const api = new ZecsnExtAPI();
    if (rjson['project'] && rjson['project']['name'] && rjson['project']['selected_plan']) {
        const project = await api.update(rjson['project'])
        if (project) {
            const plan = await api.getValue('Payment Terms Template', ['name', 'docusign_template'],
                {'name': rjson['project']['selected_plan']})
            if (plan) {
                data['ptt'] = plan
            }
            status = false
            if (!rjson['docuArgs']) {
                rjson['docuArgs'] = {}
            }
            let zDocuSign = new ZecsnDocuSign()
            await zDocuSign.initialize()
            await zDocuSign.getEnvelope(rjson['customer']['name'])
            status = true
            /*let zDocuSign = new ZecsnDocuSign()
            await zDocuSign.initialize()
            let template_name = `${rjson.project.territory} - ${plan['docusign_template']} - Settlement Agreement`
            let contact = await api.getValue('Contact', ['name', 'first_name', 'last_name', 'email_id'], {'user': rjson['user']['name']})
            const apply_template = await zDocuSign.applyTemplate(rjson['customer']['name'], template_name)
            const fill_custom_fields = await zDocuSign.fillCustomFields(rjson['customer']['name'], template_name)
            const add_signer = await zDocuSign.addSigner(rjson['customer']['name'], contact, template_name)*/

        }
    } else {
        Array.prototype.push.apply(data['_server_messages'], [{
            'message': 'Incomplete information',
            'indicator': 'red'
        }])
    }
    Array.prototype.push.apply(data['_server_messages'], await api.getServerMessages())
    return {
        status: 200,
        headers: {
            'access-control-allow-origin': '*'
        },
        body: {'status': status, 'data': data}
    };
}