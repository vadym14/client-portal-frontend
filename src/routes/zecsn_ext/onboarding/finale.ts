/** @type {import('@sveltejs/kit').RequestHandler} */
import ZecsnExtAPI from "$lib/zecsn_ext/ZecsnExtAPI";

// post register handler
export async function post({request}: any) {
    let status = false
    let data = {
        'message': '',
        '_server_messages': []
    }


    const rjson = await request.json();
    const api = new ZecsnExtAPI();
    if (rjson['user'] && rjson['contact']) {
        rjson['user']['name'] = ''
        const user = await api.insert(rjson['user'])
        if (user) {
            data['message'] = user['name']
            rjson['contact']['user'] = user['name']
            let contact = null
            if (rjson['contact']) {
                if (rjson['contact']['name'])
                    contact = await api.update(rjson['contact'])
                else
                    contact = await api.insert(rjson['contact'])
            }
            if (contact) {
                rjson['customer']['customer_primary_contact'] = contact['name']
                await api.update(rjson['customer'])
            }
            await api.update(rjson['contact'])
            if (rjson['project'] && rjson['project']['name']) {
                await api.update(rjson['project'])
            }
            if (rjson['address']) {
                if (rjson['address']['name'])
                    await api.update(rjson['address'])
                else
                    await api.insert(rjson['address'])
            }
            status = true
        } else {
            data['message'] = 'Error adding user, please contact support'
        }
    } else {
        data['message'] = 'Incomplete information'
    }
    data['_server_messages'] = await api.getServerMessages()
    return {
        status: 200,
        headers: {
            'access-control-allow-origin': '*'
        },
        body: {'status': status, 'data': data}
    };
}

