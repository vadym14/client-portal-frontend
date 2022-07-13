import {variables} from "$lib/utils/constants";

class ZecsnApiHandler {
    BASE_URL: string = variables.BASE_API_URI;
    API_KEY: string = variables.API_KEY;
    API_SECRET: string = variables.API_SECRET;

    headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `token ${this.API_KEY}:${this.API_SECRET}`, //Server Token
    };

    getDocList = async (docType: string): Promise<Object | Array<any>> => {
        const res = await fetch(
            `${this.BASE_URL}/api/resource/DocType/${docType}`,
            {
                method: 'GET',
                headers: this.headers,
            },
        );
        const json = await res.json();
        return this.postProcess(json);
    };

    insert_many(docs) {
        // Insert multiple documents to the remote server
        // param docs: List of dict or Document objects to be inserted in one request
        return this.post_request({
            cmd: 'frappe.client.insert_many',
            docs: docs, //frape.as_json(docs)
        });
    }

    bulk_update(self, docs) {
        // Bulk update documents remotely
        // param docs: List of dict or Document objects to be updated remotely (by `name`)'''
        return self.post_request({
            cmd: 'frappe.client.bulk_update',
            docs: JSON.stringify(docs), //json.dumps(docs)
        });
    }

    update = async doc => {
        // Update a remote document
        // :param doc: dict or Document object to be updated remotely. `name` is mandatory for this'''
        let url =
            this.BASE_URL +
            '/api/resource/' +
            doc.get('doctype') +
            '/' +
            doc.get('name');

        let res = await fetch(url, {
            method: 'PUT',
            headers: this.headers,
            body: this.preProcess(doc),
        });
        const json = await res.json();
        return this.postProcess(json);
    };

    delete(doctype, name) {
        // Delete remote document by name
        // :param doctype: `doctype` to be deleted
        // :param name: `name` of document to be deleted
        return this.post_request({
            cmd: 'frappe.client.delete',
            doctype: doctype,
            name: name,
        });
    }

    submit(doclist) {
        // Submit remote document
        // :param doc: dict or Document object to be submitted remotely
        return this.post_request({
            cmd: 'frappe.client.submit',
            doclist: JSON.stringify(doclist), //json.dumps(doclist)
        });
    }

    set_value(self, doctype, docname, fieldname, value) {
        return this.post_request({
            cmd: 'frappe.client.set_value',
            doctype: doctype,
            name: docname,
            fieldname: fieldname,
            value: value,
        });
    }

    get_value(doctype, fieldname: Array<string>, filters: string[]) {
        return this.get_request({
            cmd: 'frappe.client.get_value',
            doctype: doctype,
            fieldname: fieldname, //fieldname or 'name'
            filters: JSON.stringify(filters), //json.dumps(filters)
        });
    }

    createQueryUrl = (url, fields, filters): string => {
        let queryUrl: string = `${url}`;
        //Creating the query string Url
        if (fields !== undefined && filters !== undefined) {
            queryUrl =
                queryUrl +
                `?fields=${JSON.stringify(fields)}&filters=[${JSON.stringify(
                    filters,
                )}]`;
        } else if (fields !== undefined) {
            queryUrl = queryUrl + `?fields=${JSON.stringify(fields)}`;
        } else if (filters !== undefined) {
            queryUrl = queryUrl + `?filters=[${JSON.stringify(filters)}]`;
        }
        return queryUrl;
    };

    getDoc = async (
        docType: string,
        fields?: string[],
        filters?: string[],
    ): Promise<Object | Array<any>> => {
        let url: string = this.createQueryUrl(
            `${this.BASE_URL}/api/resource/${docType}`,
            fields,
            filters,
        );

        //hitting the Api
        const res = await fetch(url, {
            method: 'GET',
            headers: this.headers,
        });
        const json = await res.json();
        return this.postProcess(json);
    };

    rename_doc = async (doctype: string, old_name: string, new_name) => {
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

        return this.postProcess(params); //post_request(params); have to create a function for this
    };


    get_html = async (
        doctype,
        name,
        print_format = 'Standard',
        letterhead: boolean = true,
    ) => {
        let params, res;
        params = {
            doctype: doctype,
            name: name,
            format: print_format,
            no_letterhead: letterhead ? 1 : 0,
        };
        res = await fetch(`${this.BASE_URL}/api/method/${doctype}`, {
            method: 'POST',
            headers: this.headers,
            body: this.preProcess(params),
        });
        const json = await res.json();
        return this.postProcess(json);
    };


    getMethodApi = async (docType: string): Promise<any> => {
        const res = await fetch(`${this.BASE_URL}/api/method/${docType}`, {
            method: 'GET',
            headers: this.headers,
        });
        const json = await res.json();
        return this.postProcess(json);
    };

    postMethodApi = async (
        docType: string,
        data: Object,
    ): Promise<Object | Array<any>> => {
        const res = await fetch(`${this.BASE_URL}/api/method/${docType}`, {
            method: 'POST',
            headers: this.headers,
            body: this.preProcess(data),
        });
        const json = await res.json();
        return this.postProcess(json);
    };

    get_request = async (params: any) => {
        let url = new URL(this.BASE_URL);
        url.search = new URLSearchParams(params).toString();
        // @ts-ignore
        const res = await fetch(url, {
            method: 'GET',
            headers: this.headers,
        });
        const json = await res.json();
        return this.postProcess(json);
    };

    post_request = async data => {
        const res = await fetch(`${this.BASE_URL}`, {
            method: 'POST',
            headers: this.headers,
            body: this.preProcess(data),
        });
        const json = await res.json();
        return this.postProcess(json);
    };

    preProcess(data: Object): string {
        return JSON.stringify(data);
    }

    postProcess(res): Object | Array<any> {
        try {
            if ('_server_messages' in res) return res['_server_messages'];
            else if ('message' in res) return res['message'];
            else if ('exception' in res) return res['data'];
            else if ('data' in res) return res['data'];
        } catch (e) {
            return `Catch Error ${e}`;
        }
    }


}

export default ZecsnApiHandler;
