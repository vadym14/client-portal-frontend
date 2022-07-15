/** @type {import('@sveltejs/kit').RequestHandler} */
import ZecsnExtAPI from "$lib/zecsn_ext/ZecsnExtAPI";

// post register handler
export async function post({request}: any) {
    let data = {
        'message': '',
        'customer': {
            'doctype': 'Customer',
            'name': '',
            'customer_name': '',
            'customer_primary_address': '',
            'customer_primary_contact': ''
        },
        'contact': {
            'doctype': 'Contact',
            'name': '',
            'first_name': '',
            'last_name': '',
            'email_id': '',
            'phone': ''
        },
        'address': {
            'doctype': 'Address',
            'name': '',
            'address_line1': '',
            'city': '',
            'state': '',
            'email_id': '',
            'phone': '',
            'pincode': ''
        },
        'user': {
            'doctype': 'User',
            'name': '',
            'first_name': '',
            'last_name': '',
            'email': '',
            'new_password': ''
        },
        'project': {
            'doctype': 'Project',
            'original_creditor': '',
            'creditor_account_number': '',
            'account_open': '',
            'charge_off_date': '',
            'unadjusted_amount': '',
        }
    }
    let status = false
    const rjson = await request.json();
    const {name, date_of_birth, ssn, password}: any = {...rjson};
    const jsonData = {name, date_of_birth, ssn, password};
    const api = new ZecsnExtAPI();
    const customer = await api.getDoc('Customer', jsonData.name)
    if (customer) {
        const response = await api.postApi('tarefinancial.zecsn_ext.portal.onboarding.account_info', jsonData)
        if (response['status']) {
            data['customer'] = {
                'doctype': customer['doctype'],
                'name': customer['name'],
                'customer_name': customer['customer_name'],
                'customer_primary_address': customer['customer_primary_address'],
                'customer_primary_contact': customer['customer_primary_contact']
            }
            if (customer['customer_primary_contact']) {
                const contact = await api.getDoc('Contact', customer['customer_primary_contact'])
                if (contact) {
                    if (!contact['user']) {
                        data['contact'] = {
                            'doctype': contact['doctype'],
                            'name': contact['name'],
                            'first_name': contact['first_name'],
                            'last_name': contact['last_name'],
                            'email_id': contact['email_id'],
                            'phone': contact['phone']
                        };
                        if (customer['customer_primary_address']) {
                            const address = await api.getDoc('Address', customer['customer_primary_address'])
                            if (address) {
                                data['address'] = {
                                    'doctype': address['doctype'],
                                    'name': address['name'],
                                    'address_line1': address['address_line1'],
                                    'city': address['city'],
                                    'state': address['state'],
                                    'pincode': address['pincode'],
                                    'email_id': address['email_id'],
                                    'phone': address['phone']
                                };
                            }
                        }
                        const project = await api.getDocList('Project',
                            ['original_creditor', 'creditor_account_number', 'account_open', 'charge_off_date', 'unadjusted_amount'],
                            {'customer': customer['name']}, 0, 1)
                        if (project) {
                            data['project'] = {
                                'doctype': "Project",
                                'original_creditor': project[0].original_creditor,
                                'creditor_account_number': project[0].creditor_account_number,
                                'account_open': project[0].account_open,
                                'charge_off_date': project[0].charge_off_date,
                                'unadjusted_amount': project[0].unadjusted_amount
                            };
                        }
                        status = true
                    } else {
                        data['message'] = 'User already exist, please login.'
                        console.log(await api.getDoc('User', contact['user']))
                    }
                }
            }
        } else {
            data['message'] = response['message']
        }
    } else
        data['message'] = 'Account does not exist'
    return {
        status: 200,
        headers: {
            'access-control-allow-origin': '*'
        },
        body: {'status': status, 'data': data}
    };
}

