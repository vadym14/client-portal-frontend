/** @type {import('@sveltejs/kit').RequestHandler} */
import ZecsnExtAPI from "$lib/zecsn_ext/ZecsnExtAPI";
import type {ServerErrors} from "$lib/interfaces/error.interface";

// post register handler
export async function post({request}: any) {
    let status = false
    const data: ServerErrors = {
        'message': '',
        '_server_messages': []
    }
    const rjson = await request.json();
    const api = new ZecsnExtAPI();
    if (rjson && rjson['name'] && rjson['start_date']) {
        const project = await api.update(rjson)
        status = true
    } else {
        Array.prototype.push.apply(data['_server_messages'], [{
            'message': 'Incomplete information',
            'indicator': 'red'
        }])
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

