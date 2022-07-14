/** @type {import('@sveltejs/kit').RequestHandler} */
import ZecsnExtAPI from "$lib/zecsn_ext/ZecsnExtAPI";

// post register handler
export async function post({request}: any) {
    let message = {}
    let status = false
    const data = await request.json();
    console.log(data)
    const {name, date_of_birth, ssn, password}: any = {...data};
    const jsonData = {name, date_of_birth, ssn, password};
    const api = new ZecsnExtAPI();
    const customer = await api.getDoc('Customer', jsonData.name)
    if (customer) {
        const response = await api.postApi('tarefinancial.zecsn_ext.portal.onboarding.account_info', jsonData)
        console.log(response)
        status = response['status']
        message = {
            // Todo: to be continued...
        }
    } else
        message = 'Account does not exist'
    console.log(customer);
    console.log(status)
    console.log(message)
    return {
        status: 200,
        headers: {
            'access-control-allow-origin': '*'
        },
        body: {'status': status, 'message': message}
    };
}

