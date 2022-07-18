/** @type {import('@sveltejs/kit').RequestHandler} */
import ZecsnExtAPI from "$lib/zecsn_ext/ZecsnExtAPI";

export async function post({request}: any) {
    let data = {
        'message': '',
        'user': ''
    }
    let status = false
    let cookies = []
    const rjson = await request.json();
    const api = new ZecsnExtAPI();
    const customer = await api.getDoc('Customer', rjson.name)
    if (customer) {
        const response = await api.login(rjson['usr'], rjson['pwd'])
        status = response.status
        if (response.status) {
            cookies = response.data.split(';').map(cookie => {
                return cookie + '; Path=/; SameSite=Lax';
            })
            data['message'] = 'Successfully Logged In'
            data['user'] = rjson['usr']
        }
    }
    data['_server_messages'] = await api.getServerMessages()

    return {
        status: 200,
        headers: {
            'access-control-allow-origin': '*',
            'set-cookie': cookies
        },
        body: {'status': status, 'data': data}
    };
}

