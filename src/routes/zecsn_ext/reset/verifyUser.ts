/** @type {import('@sveltejs/kit').RequestHandler} */
import ZecsnExtAPI from "$lib/zecsn_ext/ZecsnExtAPI";

// post verify user handler
export async function post({request}: any) {
    let data = {
        'message': '',
        '_server_messages': [],
        'customer': {
            'doctype': 'Customer',
            'name': '',
            'password': '',
        },
        'user': {
            'doctype': 'User',
            'name': '',
            'new_password': ''
        },
    }

    let status = false
    const rjson = await request.json();
    const {name, date_of_birth, ssn, password}: any = {...rjson};
    const userData = {name, date_of_birth, ssn, password};
    const api = new ZecsnExtAPI();
    const customer = await api.getDoc('Customer', userData.name)
    if (customer) {
        const response = await api.postApi('tarefinancial.zecsn_ext.portal.onboarding.account_info', userData)
        if (response['status']) {
            data['customer']['name'] = customer['name']
            if (customer['customer_primary_contact']) {
                const contact = await api.getDoc('Contact', customer['customer_primary_contact'])
                if (contact['user']) {
                    const user = await api.getDoc('User', contact['user'])
                    if (user) {
                        data['user']['name'] = user.name;
                        status = true;
                    }
                }
            }
        }
    }

    if(!status){
        Array.prototype.push.apply(data['_server_messages'], [{
            'message': 'Account information does not match. Please contact support.',
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

