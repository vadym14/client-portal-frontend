/** @type {import('@sveltejs/kit').RequestHandler} */
import ZecsnExtAPI from "$lib/zecsn_ext/ZecsnExtAPI";

// post register handler
export async function post({request}: any) {
    let data = {
        'message': ''
    }
    let status = false
    const rjson = await request.json();
    const api = new ZecsnExtAPI();
    // const customer = await api.getDoc('Customer', jsonData.name)
    if (true) {
        const response = await api.postApi('login', rjson)
        const res = {
            'status': true,
            'data': 'cookies'
        }
        console.log(response)

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

