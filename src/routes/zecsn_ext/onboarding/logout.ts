/** @type {import('@sveltejs/kit').RequestHandler} */
import ZecsnExtAPI from "$lib/zecsn_ext/ZecsnExtAPI";
import * as cookie from "cookie";

export async function post({request}: any) {
    let data = {
        'message': '',
    }
    let cookies = request.headers.get('cookie')
    let status = false
    const api = new ZecsnExtAPI();
    await api.logout(cookies);
    cookies = request.headers.get('cookie').replaceAll('; ', ';').split(';').map(cookie => {
        return cookie + '; Path=/; SameSite=Lax; Max-Age=0';
    })
    return {
        status: 200,
        headers: {
            'access-control-allow-origin': '*',
            'set-cookie': cookies
        },
        body: {'status': true}
    };
}

