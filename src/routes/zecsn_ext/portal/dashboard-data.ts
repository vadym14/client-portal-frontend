/** @type {import('@sveltejs/kit').RequestHandler} */
import ZecsnExtAPI from "$lib/zecsn_ext/ZecsnExtAPI";
import * as cookie from "cookie";
import login from "../../login.svelte";

export async function get({request}: any) {
    let data: any = {
        'message': '',
    }
    let cookies = request.headers.get('cookie')
    let status = false
    const api = new ZecsnExtAPI();
    let res = await api.getLoggedInUser(cookies);
    const user = await api.getDoc('User', res)
    if (user) {
        data['user'] = user;
        const contact = await api.getValue('Contact', ['name','first_name','last_name','email_id','phone'], {'user': user['name']})
        if (contact) {
            contact['doctype'] = 'Contact';
            data['contact'] = contact;
            const customer = await api.getDocList('Customer', ['name','date_of_birth','customer_name','customer_primary_address','customer_primary_contact'], {'customer_primary_contact': contact['name']},0,1)
            if (customer) {
                customer[0]['doctype'] = 'Customer';
                const jsonData = {"name":customer[0]['name'], "date_of_birth":customer[0]['date_of_birth'], "ssn":""};
                const response = await api.postApi('tarefinancial.zecsn_ext.portal.onboarding.get_customer_ssn', jsonData)
                if(response){
                    customer[0]['ssn'] = response.slice(response.length-4);
                }else{
                    customer[0]['ssn'] = "****";
                }
                data['customer'] = customer[0];
                const address = await api.getDocList('Address',['name','address_line1','city','state','pincode','email_id','phone'], {'name': customer[0]['customer_primary_address']},0,1)
                if (address) {
                    address[0]['doctype'] = 'Address';
                    data['address'] = address[0];
                }
                const envelop = await api.getDocList('DocuSign Envelope',["envelope_status"],
                    {'customer':customer[0]['name']},0,1)
                if (envelop) {
                    envelop[0]['doctype'] = 'DocuSign Envelope';
                    data['envelope'] = envelop[0];
                }
                const project = await api.getDocList('Project',['name','original_creditor', 'creditor_account_number', 'account_open', 'charge_off_date', 'unadjusted_amount', 'selected_plan', 'plan_1', 'plan_2', 'plan_3', 'plan_4', 'plan_5'],
                    {'customer': customer[0]['name']},0,1)
                if (project) {
                    project[0]['doctype'] = 'Project';
                    data['project'] = project[0];
                    const plan = await api.getDoc('Payment Terms Template', project[0]['selected_plan'])
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
                        data['plan']={
                            'doctype': 'Payment Terms Template',
                            'name': plan['name'],
                            'settlement_amount': settlement_amount.toFixed(2),
                            'forgiven_percentage': discount.toFixed(),
                            'total_terms': plan['terms'].length,
                            'docusign_template': plan['docusign_template'],
                            'credit_duration': credit_duration(credit_days),
                        }
                    }
                    if(envelop[0]['envelope_status']!=='signed') {
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
                    }
                }
            }
            status = true
        }
        // else {
        //     data['message'] = 'No Contact Found.'
        // }
    }

    return {
        status: 200,
        headers: {
            'access-control-allow-origin': '*',
        },
        body: {'status': status, 'data': data}
    };
}

