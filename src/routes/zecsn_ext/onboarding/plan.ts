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
    if (rjson['project'] && rjson['project']['name'] && rjson['project']['selected_plan']) {
        const project = await api.update(rjson['project'])
        if (project) {
            const plan = await api.getValue('Payment Terms Template', ['name', 'docusign_template'],
                {'name': rjson['project']['selected_plan']})
            if(plan){
                data['ptt']=plan
            }
            status = true
        }
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

