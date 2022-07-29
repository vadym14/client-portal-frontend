/** @type {import('@sveltejs/kit').RequestHandler} */
import ZecsnExtAPI from "$lib/zecsn_ext/ZecsnExtAPI";
import ZecsnDocuSign from "../../../lib/zecsn_ext/ZecsnDocuSign";

export async function post({request}: any) {
    let data: any = {
        'message': '',
        'user': '',
        '_server_messages': []
    }
    let status = false
    let cookies = []
    const rjson = await request.json();
    const api = new ZecsnExtAPI();
    const customer = await api.getDoc('Customer', rjson.name)
    if (customer) {
        const customer_contact = await api.getValue('Contact', 'user', {'name': customer['customer_primary_contact']})
        if (customer_contact['user'] == rjson['usr']) {
            const response = await api.login(rjson['usr'], rjson['pwd'])
            status = response['status']
            if (response['status']) {
                const user = await api.getDoc('User', rjson['usr'])
                Array.prototype.push.apply(cookies, ['account=' + rjson.name + '; Path=/; SameSite=Lax'])
                data['user'] = {
                    'doctype': 'User',
                    'name': user['name'],
                    'first_name': user['first_name'],
                    'last_name': user['last_name'],
                    'email': user['email'],
                };
                const contact = await api.getValue('Contact', ['name', 'first_name', 'last_name', 'email_id', 'phone'], {'name': customer['customer_primary_contact']})
                if (contact) {
                    contact['doctype'] = 'Contact';
                    data['contact'] = contact;
                    customer['doctype'] = 'Customer';
                    data['customer'] = customer;
                    const address = await api.getValue('Address', ['name', 'address_line1', 'city', 'state', 'pincode', 'email_id', 'phone'], {'name': customer['customer_primary_address']})
                    if (address) {
                        address['doctype'] = 'Address';
                        data['address'] = address;
                    }
                    let zDocuSign = new ZecsnDocuSign()
                    await zDocuSign.initialize()
                    const envelope = await zDocuSign.getEnvelope(customer['name'])
                    let continue_process = true
                    if (envelope && envelope['envelope_status']) {
                        envelope['doctype'] = 'DocuSign Envelope';
                        data['envelope'] = envelope;
                    } else {
                        Array.prototype.push.apply(data['_server_messages'], [{
                            'message': 'Envelop does not exist, please contact support.',
                            'indicator': 'red'
                        }])
                        continue_process = status = false
                    }
                    const project = await api.getValue('Project', ['name', 'territory', 'original_creditor', 'creditor_account_number', 'account_open', 'charge_off_date', 'unadjusted_amount', 'selected_plan', 'plan_1', 'plan_2', 'plan_3', 'plan_4', 'plan_5'],
                        {'customer': customer['name']})
                    if (continue_process && project) {
                        project['doctype'] = 'Project';
                        data['project'] = project;
                        if (envelope['envelope_status'] !== 'signed' || !project['selected_plan']) {
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
                                            plan['terms'].forEach(term => {
                                                discount += term['discount'] ? term['discount'] / 100 * term['invoice_portion'] : 0
                                                credit_days += term['credit_days']
                                            })
                                            let settlement_amount = data['project']['unadjusted_amount'] - (discount / 100 * data['project']['unadjusted_amount'])
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
                        } else {
                            const plan = await api.getDoc('Payment Terms Template', project['selected_plan'])
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
                                plan['terms'].forEach(term => {
                                    discount += term['discount'] ? term['discount'] / 100 * term['invoice_portion'] : 0
                                    credit_days += term['credit_days']
                                })
                                let settlement_amount = data['project']['unadjusted_amount'] - (discount / 100 * data['project']['unadjusted_amount'])
                                data['plan'] = {
                                    'doctype': 'Payment Terms Template',
                                    'name': plan['name'],
                                    'settlement_amount': settlement_amount.toFixed(2),
                                    'forgiven_percentage': discount.toFixed(),
                                    'total_terms': plan['terms'].length,
                                    'docusign_template': plan['docusign_template'],
                                    'credit_duration': credit_duration(credit_days),
                                    'total_amount':data['project']['unadjusted_amount'],
                                    'terms': plan['terms'],
                                }
                            }
                            Array.prototype.push.apply(cookies, response.data.split(';').map(cookie => {
                                return cookie + '; Path=/; SameSite=Lax';
                            }))
                            data['message'] = 'Successfully Logged In'
                            data['user'] = rjson['usr']
                            status = true
                        }
                    }

                }
            }
        } else
            Array.prototype.push.apply(data['_server_messages'], [{
                'message': 'User and account info does not match',
                'indicator': 'red'
            }])

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

