/** @type {import('@sveltejs/kit').RequestHandler} */
import ZecsnExtAPI from "$lib/zecsn_ext/ZecsnExtAPI";

export async function post({request}: any) {
    let status = false
    const data = {
        'message': '',
        '_server_messages': [],
    };
    const rjson = await request.json();
    const api = new ZecsnExtAPI();
    if (rjson['customer']['password'] !== '' && rjson['user']['password'] !== '') {
        const customer = await api.update(rjson['customer'])
        if (customer) {
            const user = await api.update(rjson['user'])
            if (user)
                status = true
            else
                data['message'] = 'Error updating password, please contact support'
        } else
            data['message'] = 'Error updating password, please contact support'
    } else {
        data['message'] = 'Something went wrong'
    }
    Array.prototype.push.apply(data['_server_messages'], await api.getServerMessages())
    return {
        status: 200,
        headers: {
            'access-control-allow-origin': '*'
        },
        body: {'status': status, 'data': data}
    };
}