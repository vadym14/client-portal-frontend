/** @type {import('@sveltejs/kit').RequestHandler} */
import ZecsnExtAPI from "$lib/zecsn_ext/ZecsnExtAPI";

const api = new ZecsnExtAPI();

//get customer
export async function post({request}: any) {
    const data = await request.json();
    let response = {}
    const customer: any = await api.getDoc('Customer', data.name)
    if (customer) {
        response['customer'] = {
            'name': customer['name'],
            'customer_name': customer['customer_name'],
            'customer_primary_address': customer['customer_primary_address'],
            'customer_primary_contact': customer['customer_primary_contact']
        };
        if (customer['customer_primary_address']) {
            const address = await api.getDoc('Address', customer['customer_primary_address'])
            if (address)
                response['address'] = {
                    'address_line1': address['address_line1'],
                    'city': address['city'],
                    'state': address['state'],
                    'pincode': address['pincode']
                };

        }
        if (customer['customer_primary_contact']) {
            const contact = await api.getDoc('Contact', customer['customer_primary_contact'])
            if (contact)
                response['contact'] = {
                    'first_name': contact['first_name'], 'last_name': contact['last_name'], 'phone': contact['phone']
                };
        }
    }
    // const project = await api.getDoc('Project',['original_creditor','creditor_account_number','account_open','charge_off_date','unadjusted_amount'],
    //     ['customer','=',customer.name])


    // console.log(response);
    return {
        status: 200,
        headers: {
            'access-control-allow-origin': '*'
        },
        body: {'response': response}
    };
}

//update customer
// export async function put({ request }:any) {
//     const data = await request.json();
//     console.log(data);
//     const customer:any = await api.update('Customer',['name','customer_name','customer_primary_address','customer_primary_contact'],
//         ['name','=',data.name])
//     const address = await api.getDoc('Address',['address_line1','city','state','pincode','email_id','phone','phone_type'],
//         ['name','=',customer.customer_primary_address])
//     const contact = await api.getDoc('Contact',['first_name','last_name'],
//         ['name','=',customer.customer_primary_contact])
//     const response ={
//         customer: customer,
//         address: address,
//         contact: contact
//     }
//
//     console.log(response);
//     return {
//         status: 200,
//         headers: {
//             'access-control-allow-origin': '*'
//         },
//         body: {'response': response}
//     };
// }