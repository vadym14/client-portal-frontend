import {variables} from "$lib/utils/constants";

class ZecsnExtAPI {
    BASE_URL: string = variables.BASE_API_URI;
    API_KEY: string = variables.API_KEY;
    API_SECRET: string = variables.API_SECRET;

    headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `token ${this.API_KEY}:${this.API_SECRET}`, //Server Token
    };
    _server_messages = []

    getServerMessages = async (): Promise<any> => {
        const _server_messages = this._server_messages
        this._server_messages = []
        return _server_messages;
    };

    login = async (
        usr: string,
        pwd: Object,
    ): Promise<Object | Array<any>> => {
        const res = await fetch(`${this.BASE_URL}/api/method/login`, {
            method: 'POST',
            headers: this.headers,
            body: this.preProcess({'usr': usr, 'pwd': pwd}),
        });
        const status = await this.postProcess(res)
        if (status === 'Logged In' || status === 'No App') {
            return {'status': true, 'data': this.parseCookies(res)}
        } else {
            Array.prototype.push.apply(this._server_messages, [{'message': status, 'indicator': 'red'}])
            return {'status': false, 'data': status}
        }
    };

    getLoggedInUser = async (cookies: string): Promise<any> => {
        let headers = this.headers
        headers.cookie = cookies
        const res = await fetch(`${this.BASE_URL}/api/method/frappe.auth.get_logged_user`, {
            method: 'GET',
            credentials: 'include',
            headers: headers,
        });
        return this.postProcess(res);
    };

    logout = async (cookies: string): Promise<any> => {
        let headers = this.headers
        headers.cookie = cookies
        const res = await fetch(`${this.BASE_URL}/api/method/logout`, {
            method: 'GET',
            headers: headers,
        });
        return this.postProcess(res);
    };

    getDocList = async (docType: string, fields: String | Object = '"*"', filters = null, limit_start = 0, limit_page_length = 0, order_by = null): Promise<Object | Array<any>> => {
        let url = `${this.BASE_URL}/api/resource/${docType}`
        let params = {
            "fields": fields
        }
        if (filters)
            params["filters"] = filters
        if (limit_page_length)
            params["limit_start"] = limit_start
        params["limit_page_length"] = limit_page_length
        if (order_by)
            params['order_by'] = order_by
        url = this.paramsPreProcess(url, params)
        const res = await fetch(
            url,
            {
                method: 'GET',
                headers: this.headers,
            },
        );
        return this.postProcess(res);
    };

    insert = async doc => {
        // Insert a document to the remote server
        // :param doc: A dict or Document object to be inserted remotely
        let url = this.BASE_URL + '/api/resource/' + doc['doctype']

        let res = await fetch(url, {
            method: 'POST',
            headers: this.headers,
            body: this.preProcess(doc),
        });
        return this.postProcess(res);
    }

    insertMany(docs) {
        // Insert multiple documents to the remote server
        // param docs: List of dict or Document objects to be inserted in one request
        return this.postRequest({
            cmd: 'frappe.client.insert_many',
            docs: docs,
        });
    }

    update = async doc => {
        // Update a remote document
        // :param doc: dict or Document object to be updated remotely. `name` is mandatory for this'''
        let url = this.BASE_URL + '/api/resource/' + doc['doctype'] + '/' + doc['name'];

        let res = await fetch(url, {
            method: 'PUT',
            headers: this.headers,
            body: this.preProcess(doc),
        });
        return this.postProcess(res);
    };

    bulk_update(self, docs) {
        // Bulk update documents remotely
        // param docs: List of dict or Document objects to be updated remotely (by `name`)'''
        return self.postRequest({
            cmd: 'frappe.client.bulk_update',
            docs: docs, //json.dumps(docs)
        });
    }

    delete(doctype, name) {
        // Delete remote document by name
        // :param doctype: `doctype` to be deleted
        // :param name: `name` of document to be deleted
        return this.postRequest({
            cmd: 'frappe.client.delete',
            doctype: doctype,
            name: name,
        });
    }

    submit(doclist) {
        // Submit remote document
        // :param doc: dict or Document object to be submitted remotely
        return this.postRequest({
            cmd: 'frappe.client.submit',
            doclist: doclist,
        });
    }

    getValue(doctype, fieldname = 'name', filters: Object) {
        return this.getRequest({
            cmd: 'frappe.client.get_value',
            doctype: doctype,
            fieldname: fieldname,
            filters: filters,
        });
    }

    setValue(self, doctype, docname, fieldname, value) {
        return this.postRequest({
            cmd: 'frappe.client.set_value',
            doctype: doctype,
            name: docname,
            fieldname: fieldname,
            value: value,
        });
    }

    cancel(self, doctype, name) {
        return self.postRequest({
            'cmd': 'frappe.client.cancel',
            'doctype': doctype,
            'name': name
        })
    }

    getDoc = async (
        docType: string,
        name: string = '',
        fields?: string[],
        filters?: Object,
    ): Promise<Object | Array<any>> => {
        // Returns a single remote document
        // :param doctype: DocType of the document to be returned
        // :param name: (optional) `name` of the document to be returned
        // :param filters: (optional) Filter by this dict if name is not set
        // :param fields: (optional) Fields to be returned, will return everythign if not set
        let url = `${this.BASE_URL}/api/resource/${docType}/${name}`
        let params = {}
        if (filters)
            params["filters"] = filters
        if (fields)
            params["fields"] = fields
        url = this.paramsPreProcess(url, params)
        const res = await fetch(url, {
            method: 'GET',
            headers: this.headers,
        });
        return this.postProcess(res);
    };

    renameDoc = async (doctype: string, old_name: string, new_name) => {
        /*Rename remote document
        :param doctype: DocType of the document to be renamed
        :param old_name: Current `name` of the document to be renamed
        :param new_name: New `name` to be set*/
        let params;
        params = {
            cmd: 'frappe.client.rename_doc',
            doctype: doctype,
            old_name: old_name,
            new_name: new_name,
        };

        return this.postRequest(params);
    };


    getApi = async (docType: string): Promise<any> => {
        const res = await fetch(`${this.BASE_URL}/api/method/${docType}`, {
            method: 'GET',
            headers: this.headers,
        });
        return this.postProcess(res);
    };

    postApi = async (
        docType: string,
        params: Object,
    ): Promise<Object | Array<any>> => {
        const res = await fetch(`${this.BASE_URL}/api/method/${docType}`, {
            method: 'POST',
            headers: this.headers,
            body: this.preProcess(params),
        });
        return this.postProcess(res);
    };

    getRequest = async (params: any) => {
        let url = this.BASE_URL
        url = this.paramsPreProcess(url, params)
        // @ts-ignore
        let headers = this.headers
        headers.cookie = ''
        const res = await fetch(url, {
            method: 'GET',
            headers: headers,
        });
        return this.postProcess(res);
    };

    postRequest = async params => {
        const res = await fetch(`${this.BASE_URL}`, {
            method: 'POST',
            headers: this.headers,
            body: this.preProcess(params),
        });
        return this.postProcess(res);
    };

    paramsPreProcess(url: String, params: Object): string {
        if (Object.keys(params).length !== 0) {
            const query = Object.keys(params).map(k => {
                return typeof params[k] == 'string' ? `${k}=${params[k]}` : `${k}=${this.preProcess(params[k])}`
            }).join('&')
            url += '?' + query
        }
        return url
    }

    parseCookies(response) {
        const raw = response.headers.raw()['set-cookie'];
        return raw.map((entry) => {
            const parts = entry.split(';');
            const cookiePart = parts[0];
            return cookiePart;
        }).join(';');
    }

    preProcess(params: Object): string {
        return JSON.stringify(params);
    }

    postProcess = async (response: Response): Promise<Object | Array<any>> => {
        let rjson = null;
        try {
            rjson = await response.json()
        } catch (e) {
            throw e.toString()
        }
        if ('exc' in rjson) {
            console.log(rjson['exc'])
        }
        if ('_server_messages' in rjson) {
            let messages = JSON.parse(rjson['_server_messages'])
            Array.prototype.push.apply(this._server_messages, messages.map(m => {
                return JSON.parse(m)
            }))
        }
        if ('message' in rjson)
            return rjson['message']
        else if ('data' in rjson)
            return rjson['data']
        else
            return null
    }


}

export default ZecsnExtAPI;
