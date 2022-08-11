/** @type {import('@sveltejs/kit').RequestHandler} */
import ZecsnDocuSign from "../../../lib/zecsn_ext/ZecsnDocuSign";

export async function post({request}: any) {
    let status = true
    let data = {'_server_messages': []}
    let rjson = await request.json()
    let zDocuSign = new ZecsnDocuSign()
    await zDocuSign.initialize()
    const envelope = await zDocuSign.getEnvelopeUpdate(rjson.name)
    // Array.prototype.push.apply(data['_server_messages'], await api.getServerMessages())
    return {
        status: 200,
        headers: {
            'access-control-allow-origin': '*'
        },
        body: {'status': status, 'data': envelope}
    };
}