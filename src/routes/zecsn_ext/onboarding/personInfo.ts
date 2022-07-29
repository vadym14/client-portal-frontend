/** @type {import('@sveltejs/kit').RequestHandler} */
import ZecsnExtAPI from "$lib/zecsn_ext/ZecsnExtAPI";
import ZecsnDocuSign from "../../../lib/zecsn_ext/ZecsnDocuSign";

export async function post({request}: any) {
    let status = false
    const data = {
        'message': '',
        '_server_messages': [],
    };
    const rjson = await request.json();
    const api = new ZecsnExtAPI();
    console.log(rjson)

    let contact = null
    if (rjson['contact']) {
        rjson['contact']['is_primary_contact'] = 1
        rjson['contact']['is_billing_contact'] = 1
        rjson['contact']['email_ids'] = [{
            'email_id': rjson['contact']['email_id'],
            'is_primary': 1
        }]
        rjson['contact']['phone_nos'] = [{
            'phone': rjson['contact']['phone'],
            'is_primary_phone': 1
        }]
        if (rjson['contact']['name'])
            contact = await api.update(rjson['contact'])
        else {
            rjson['contact']['links'] = [{
                'link_doctype': 'Customer',
                'link_name': rjson['customer']['name'],
                'link_title': rjson['customer']['customer_name'],
                'doctype': 'Dynamic Link'
            }]
            contact = await api.insert(rjson['contact'])
        }
    }
    if (contact) {
        rjson['customer']['customer_primary_contact'] = contact['name']
        let address = null
        if (rjson['address']) {
            rjson['address']['is_primary_address'] = 1
            rjson['address']['is_shipping_address'] = 1
            if (rjson['address']['name'])
                address = await api.getDoc('Address', rjson['address']['name'])
            else {
                rjson['address']['links'] = [{
                    'link_doctype': 'Customer',
                    'link_name': rjson['customer']['name'],
                    'link_title': rjson['customer']['customer_name'],
                    'doctype': 'Dynamic Link'
                }]
                address = await api.insert(rjson['address'])
            }
        }
        if (address)
            rjson['customer']['customer_primary_address'] = address['name']
        await api.update(rjson['customer'])
        rjson['user']['user_type'] = "Website User"
        rjson['user']['send_welcome_email'] = 0

        let zDocuSign = new ZecsnDocuSign()
        await zDocuSign.initialize()
        await zDocuSign.getEnvelope(rjson['customer']['name'])

        const user = await api.insert(rjson['user'])
        if (user)
            status = true
        else
            data['message'] = 'Error adding user, please contact support'
    } else {
        data['message'] = 'Something went wrong'
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