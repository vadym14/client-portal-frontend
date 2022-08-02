/** @type {import('@sveltejs/kit').RequestHandler} */
import ZecsnExtAPI from "$lib/zecsn_ext/ZecsnExtAPI";
import type {UserInfo} from "../../../lib/interfaces/user.interface";

// post register handler
export async function post({request}: any) {
    let data :UserInfo = {
        'message': '',
        '_server_messages': [],
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
            'name': '',
            'original_creditor': '',
            'creditor_account_number': '',
            'account_open': '',
            'charge_off_date': '',
            'unadjusted_amount': '',
            'selected_plan': '',
            'territory': '',
            'plan_1': '',
            'plan_2': '',
            'plan_3': '',
            'plan_4': '',
            'plan_5': '',
        },
        'plans':[ {
        'name':'',
        'settlement_amount':'',
        'forgiven_percentage':'',
        'total_terms':'',
        'docusign_template':'',
        'credit_duration':'',
    }],
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
            let continue_process = true
            if (!customer['customer_primary_contact']) {
                Array.prototype.push.apply(data['_server_messages'], [{
                    'message': 'Primary contact does not exist creating new.',
                    'indicator': 'red'
                }])
            } else {
                const contact = await api.getDoc('Contact', customer['customer_primary_contact'])
                if (contact['user']) {
                    continue_process = false
                    Array.prototype.push.apply(data['_server_messages'], [{
                        'message': 'User already exist, please login.',
                        'indicator': 'red'
                    }])
                } else {
                    data['contact'] = {
                        'doctype': contact['doctype'],
                        'name': contact['name'],
                        'first_name': contact['first_name'],
                        'last_name': contact['last_name'],
                        'email_id': contact['email_id'],
                        'phone': contact['phone']
                    };
                }
            }
            if (continue_process) {
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
                    ['name','territory','original_creditor', 'creditor_account_number', 'account_open', 'charge_off_date', 'unadjusted_amount', 'selected_plan', 'plan_1', 'plan_2', 'plan_3', 'plan_4', 'plan_5'],
                    {'customer': customer['name']}, 0, 1)
                if (project) {
                    data['project'] = {
                        'doctype': "Project",
                        'name':project[0].name,
                        'territory':project[0].territory,
                        'original_creditor': project[0].original_creditor,
                        'creditor_account_number': project[0].creditor_account_number,
                        'account_open': project[0].account_open,
                        'charge_off_date': project[0].charge_off_date,
                        'unadjusted_amount': project[0].unadjusted_amount,
                        'selected_plan': project[0].selected_plan,
                        'plan_1': project[0].plan_1,
                        'plan_2': project[0].plan_2,
                        'plan_3': project[0].plan_3,
                        'plan_4': project[0].plan_4,
                        'plan_5': project[0].plan_5
                    };
                    data['plans'] = []
                    let plan_names = [data['project']['plan_1'], data['project']['plan_2'], data['project']['plan_3'], data['project']['plan_4'], data['project']['plan_5']].filter(Boolean)
                    if (plan_names) {
                        let filters = [['name', 'IN', plan_names]]
                        let plans = await api.getDocList('Payment Terms Template', ['name', 'maximum_delay', 'docusign_template'], filters)
                        if (plans) {
                            for (const p of plans) {
                                let plan = await api.getDoc('Payment Terms Template', p.name)
                                if (plan && plan['terms']) {
                                    let credit_duration = function (days) {
                                        var months = Math.floor(days / 30)
                                        var weeks = Math.floor(days / 7)
                                        if (months > 0) {
                                            return 'Pay over ' + months + ' month(s)'
                                        } else if (weeks > 0) {
                                            return 'Make payment within ' + weeks + ' week(s)'
                                        } else {
                                            return 'Make payment within ' + days + ' day(s)'
                                        }
                                    }
                                    let discount = 0
                                    let credit_days = 0
                                    plan['terms'].forEach((term:any) => {
                                        discount += term['discount'] ? term['discount'] / 100 * term['invoice_portion'] : 0
                                        credit_days += term['credit_days']
                                    })
                                    const settlement_amount = data['project']['unadjusted_amount'] - (discount / 100 * data['project']['unadjusted_amount'])
                                    data['plans'].push({
                                        'name': plan['name'],
                                        'settlement_amount': settlement_amount.toFixed(2),
                                        'forgiven_percentage': discount.toFixed(),
                                        'total_terms': plan['terms'].length,
                                        'docusign_template': plan['docusign_template'],
                                        'credit_duration': credit_duration(credit_days),
                                    })
                                }
                            }
                        }
                    }
                }
                status = true
            }

        } else {
            data['message'] = response['message']
        }
    } else
        data['message'] = 'Account does not exist'
    Array.prototype.push.apply(data['_server_messages'], await api.getServerMessages())

    return {
        status: 200,
        headers: {
            'access-control-allow-origin': '*'
        },
        body: {'status': status, 'data': data}
    };
}

