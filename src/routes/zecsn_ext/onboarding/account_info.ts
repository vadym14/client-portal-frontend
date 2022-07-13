/** @type {import('@sveltejs/kit').RequestHandler} */
import ZecsnApiHandler from "$lib/zecsn_ext/ZecsnApiHandler";

export async function get() {
    let jsonData = {
        "name": "C-ONP-22-00001",
        "date_of_birth": "2000-02-01",
        "ssn": "8372"
    }
    const api = new ZecsnApiHandler();
    const response = await api.postMethodApi('tarefinancial.zecsn_ext.portal.onboarding.account_info', jsonData)


    return {
        status: 200,
        headers: {
            'access-control-allow-origin': '*'
        },
        body: {'response': response}
    };
}