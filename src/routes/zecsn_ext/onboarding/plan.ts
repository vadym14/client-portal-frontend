/** @type {import('@sveltejs/kit').RequestHandler} */
import ZecsnExtAPI from "$lib/zecsn_ext/ZecsnExtAPI";
import type {ServerErrors} from "$lib/interfaces/error.interface";
import ZecsnDocuSign from "$lib/zecsn_ext/ZecsnDocuSign";
import Stripe from "stripe";

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
            if (!rjson['project']['bypass_docusign']) {
                if (!rjson['docuArgs']) {
                    rjson['docuArgs'] = {}
                }
                let zDocuSign = new ZecsnDocuSign()
                await zDocuSign.initialize()
                await zDocuSign.getEnvelope(rjson['customer']['name'])
            } else {
                const invoiceData = {
                    'doctype': 'Sales Invoice',
                    'naming_series': 'I-ONP-.YY.-',
                    'customer': rjson['customer']['name'],
                    'docstatus': 1,
                    'project': rjson['project']['name'],
                    'cost_center': 'Main - TFS',
                    'territory': rjson['project']['territory'],
                    'exempt_from_sales_tax': 1,
                    'payment_terms_template': rjson['project']['selected_plan'],
                    'items': [{
                        'doctype': 'Sales Invoice Item',
                        'item_code': 'Tare Financial Project',
                        'item_name': rjson['project']['project_name'],
                        'description': rjson['project']['project_name'],
                        'qty': 1,
                        'uom': 'Income',
                        'conversion_factor': 1,
                        'rate': rjson['project']['unadjusted_amount'],
                        'income_account': '',
                        'discount_account': '',
                        'cost_center': 'Main - TFS',
                        'project': rjson['project']['name'],
                    }]
                }
                const company = await api.getValue('Company', ['default_income_account', 'default_discount_account'], [])
                if (company) {
                    invoiceData['items'][0]['income_account'] = company['default_income_account']
                    invoiceData['items'][0]['discount_account'] = company['default_discount_account']
                    const response = await api.insert(invoiceData)
                    const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY)
                    const customerStripe = await stripe.customers.create({
                        name: rjson['customer']['name'],
                        description: rjson['customer']['name'],
                    });
                    if (customerStripe) {
                        const jsonData = {
                            'doctype': 'Customer',
                            'name': rjson['customer']['name'],
                            'stripe_id': customerStripe.id,
                        }
                        const customerUpdated = await api.update(jsonData)
                    }
                }
            }
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