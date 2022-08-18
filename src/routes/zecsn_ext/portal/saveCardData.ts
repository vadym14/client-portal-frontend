/** @type {import('@sveltejs/kit').RequestHandler} */
import ZecsnExtAPI from "$lib/zecsn_ext/ZecsnExtAPI";

export async function post({request}: any) {
    let status = false
    const data:any = {
        'message': '',
        '_server_messages': [],
    };
    const rjson = await request.json();
    const api = new ZecsnExtAPI();

    const customer = await api.update(rjson)
    if (customer) {
        data['customer'] = customer;
        status = true
    }
    else
        data['message'] = 'Error adding Card, try again'

    Array.prototype.push.apply(data['_server_messages'], await api.getServerMessages())

    return {
        status: 200,
        headers: {
            'access-control-allow-origin': '*'
        },
        body: {'status': status, 'data': data}
    };
}