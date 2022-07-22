/** @type {import('@sveltejs/kit').RequestHandler} */
import ZecsnExtAPI from "$lib/zecsn_ext/ZecsnExtAPI";
import * as cookie from "cookie";

// post register handler
export async function post({request}: any) {
    let status = false
    let data = {
        'message': '',
        '_server_messages': []
    }

    let cookies = request.headers.get('cookie')
    const rjson = await request.json();
    const api = new ZecsnExtAPI();
    console.log(request.headers.get('cookie'))
    let user_id = await api.getLoggedInUser(request.headers.get('cookie'))
    let contact = null

    if (user_id) {
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
            contact = await api.update(rjson['contact'])
            const user = await api.update({
                'doctype': 'User',
                'name': user_id,
                'first_name': rjson['contact']['first_name'],
                'last_name': rjson['contact']['last_name']
            })
            if (user_id !== rjson['contact']['email_id']) {
                await api.renameDoc('User', user_id, rjson['contact']['email_id'])
                Array.prototype.push.apply(data['_server_messages'], [{
                    'message': "You've changed your email. Please logout and log back in",
                    'indicator': 'blue'
                }])
            }
        }
        if (contact)
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
        const customer = await api.update(rjson['customer'])
        if (customer)
            status = true
        let processCookies = (cookie, index, array) => {
            let cookieArray = cookie.split('=')
            switch (cookieArray[0]) {
                case 'full_name':
                    cookie = cookieArray[0] + '=' + encodeURIComponent(rjson['contact']['first_name'] + ' ' + rjson['contact']['last_name'])
                    break;
                case 'user_id':
                    cookie = cookieArray[0] + '=' + encodeURIComponent(rjson['contact']['email_id'])
            }
            return cookie + '; Path=/; SameSite=Lax;';
        }
        cookies = request.headers.get('cookie').replaceAll('; ', ';').split(';').map(processCookies)
    }

    Array.prototype.push.apply(data['_server_messages'], await api.getServerMessages())
    return {
        status: 200,
        headers: {
            'access-control-allow-origin': '*',
            'set-cookie': cookies
        },
        body: {'status': status, 'data': data}
    };
}

