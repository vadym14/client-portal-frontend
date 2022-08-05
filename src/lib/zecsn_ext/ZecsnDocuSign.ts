import docusign from "docusign-esign";
import fs from "fs";
import jwtConfig from '$lib/config/jwtConfig.json'
import ZecsnExtAPI from "./ZecsnExtAPI";

class ZecsnDocuSign {
    docuArgs = null
    dsApiClient = null
    API = null
    SCOPES = [
        "signature", "impersonation"
    ];
    _server_messages = []

    initialize = async () => {
        this.docuArgs = await this.getDocuJwt()
        this.dsApiClient = new docusign.ApiClient();
        this.dsApiClient.setBasePath(this.docuArgs.basePath);
        this.dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + this.docuArgs.accessToken);
        this.API = new ZecsnExtAPI();
    }

    getServerMessages = async (): Promise<any> => {
        Array.prototype.push.apply(this._server_messages, await this.API.getServerMessages())
        const _server_messages = this._server_messages
        this._server_messages = []
        return _server_messages;
    };

    getEnvelope = async (customer: string) => {
        let envelope = await this.API.getValue('DocuSign Envelope', ['name', 'envelope_id', 'envelope_status'], {'customer': customer})
        if (!envelope['envelope_id']) {
            let project = await this.API.getValue('Project', 'name', {'customer': customer})
            let envelopesApi = new docusign.EnvelopesApi(this.dsApiClient)
            let results = await envelopesApi.createEnvelope(this.docuArgs.apiAccountId);
            envelope = {
                'customer': customer,
                'project': project['name'],
                'envelope_id': results.envelopeId,
                'envelope_status': 'created',
                'doctype': 'DocuSign Envelope'
            }
            envelope = await this.API.insert(envelope)
        }
        return envelope
    }

    getEnvelopeUpdate = async (customer: string) => {
        let envelope = await this.getEnvelope(customer)
        if (envelope && envelope['envelope_status'] !== 'completed') {
            let envelopesApi = new docusign.EnvelopesApi(this.dsApiClient)
            let results = await envelopesApi.getEnvelope(this.docuArgs.apiAccountId, envelope['envelope_id']);
            envelope = {
                'name': envelope['name'],
                'envelope_id': results.envelopeId,
                'envelope_status': results.status,
                'doctype': 'DocuSign Envelope'
            }
            envelope = await this.API.update(envelope)
            if (envelope && envelope['envelope_status'] === 'completed') {
                await this.createIdEvidence(envelope['envelope_id'], customer)
                await this.createInvoice(customer)
            }
        }
        return envelope
    }

    getReceipentIdVerficaitonEvent = async (envelopeId: string) => {

        const envelopesApi = new docusign.EnvelopesApi(this.dsApiClient)
        const recipients = await envelopesApi.listRecipients(this.docuArgs.apiAccountId, envelopeId)
        const recipientId: string | any = recipients.signers[0].recipientIdGuid
        const proofLink = await envelopesApi.createRecipientProofFileResourceToken('', this.docuArgs.apiAccountId, envelopeId, recipientId)

        const res = await fetch(`${proofLink.proofBaseURI}/api/v1/events/person/${recipientId}`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${proofLink.resourceToken}`, //Server Token
            },
        })
        return await res.json()
    }

    createIdEvidence = async (envelopeId: string, customer: string) => {
        let recipientIDV = await this.getReceipentIdVerficaitonEvent(envelopeId)
        let recipientIDValue, IdVerification = null
        if (recipientIDV && recipientIDV['events'])
            recipientIDValue = recipientIDV['events'].filter(item => item.event_type === 'IdVerificationPhotoIdSuccess')[0];
        if (recipientIDValue) {
            let project = await this.API.getValue('Project', 'name', {'customer': customer})
            IdVerification = {
                'doctype': 'ID Verification',
                'verification_status': 'Pass',
                'verification_provider': recipientIDValue.data.provider_name,
                'docusign_transaction_number': recipientIDValue.data.trace_uid,
                'provider_transaction_number': recipientIDValue.data.session_id,
                'id_name': recipientIDValue.data.person_name,
                'id_type': recipientIDValue.data.type_of_id,
                'id_number': recipientIDValue.data.id_number,
                'id_expiration_date': recipientIDValue.data.expiration_date,
                'customer': customer,
                'project': project['name'],
            }
            IdVerification = await this.API.insert(IdVerification)
        }
        return IdVerification
    }

    createInvoice = async (customer: string) => {
        let response = null
        const invoiceData = {
            'doctype': 'Sales Invoice',
            'naming_series': 'I-ONP-.YY.-',
            'customer': '',
            'project': '',
            'cost_center': 'Main - TFS',
            'territory': '',
            'exempt_from_sales_tax': 1,
            'payment_terms_template': '',
            'items': [{
                'doctype': 'Sales Invoice Item',
                'item_code': 'Tare Financial Project',
                'item_name': '',
                'description': '',
                'qty': 1,
                'uom': 'Income',
                'conversion_factor': 1,
                'rate': '',
                'income_account': '',
                'discount_account': '',
                'cost_center': 'Main - TFS',
                'project': '',
            }]
        }
        invoiceData['customer'] = customer
        const project = await this.API.getValue('Project', ['name', 'project_name', 'territory', 'selected_plan', 'unadjusted_amount'],
            {'customer': customer})
        const company = await this.API.getValue('Company', ['default_income_account', 'default_discount_account'], [])
        if (project && company) {
            invoiceData['project'] = project['name']
            invoiceData['territory'] = project['territory']
            invoiceData['payment_terms_template'] = project['selected_plan']
            invoiceData['items'][0]['item_name'] = project['project_name']
            invoiceData['items'][0]['description'] = project['project_name']
            invoiceData['items'][0]['rate'] = project['unadjusted_amount']
            invoiceData['items'][0]['project'] = project['name']
            invoiceData['items'][0]['income_account'] = company['default_income_account']
            invoiceData['items'][0]['discount_account'] = company['default_discount_account']
            response = await this.API.insert(invoiceData)
        }
        return response
    }

    getTemplate = async (template_name: string) => {
        let templatesApi = new docusign.TemplatesApi(this.dsApiClient)
        let results = await templatesApi.listTemplates(this.docuArgs.apiAccountId, {
            search_text: template_name
        });
        let response = null
        results.envelopeTemplates.forEach((template) => {
            if (template.name == template_name)
                response = template
        })
        return response
    }


    applyTemplate = async (customer: string, template_name: string) => {
        let status = false
        let envelope = await this.getEnvelope(customer)
        let template = await this.getTemplate(template_name)
        if (envelope['envelope_id'] && template) {
            try {
                let envelopesApi = new docusign.EnvelopesApi(this.dsApiClient)
                let continue_process = true
                let templates = await envelopesApi.listTemplates(this.docuArgs.apiAccountId, envelope['envelope_id'])
                if (templates && templates.templates) {
                    for (const docTemplate of templates.templates) {
                        if (docTemplate.templateId == template.templateId)
                            continue_process = false
                        else
                            await envelopesApi.deleteTemplatesFromDocument(this.docuArgs.apiAccountId, envelope['envelope_id'], docTemplate.documentId, docTemplate.templateId)
                    }
                }
                if (continue_process) {
                    let documentTemplateList: docusign.DocumentTemplateList = {documentTemplates: [{templateId: template.templateId}]};
                    let results = await envelopesApi.applyTemplate(this.docuArgs.apiAccountId, envelope['envelope_id'], {
                        preserveTemplateRecipient: 'false',
                        documentTemplateList: documentTemplateList
                    })
                }
                status = true
            } catch (error) {
                let errorBody = error && error.response && error.response.body,
                    errorCode = errorBody && errorBody.errorCode, errorMessage = errorBody && errorBody.message;
                if (errorMessage) {
                    Array.prototype.push.apply(this._server_messages, [{
                        'message': errorMessage,
                        'indicator': 'red'
                    }])
                }
            }
        } else {
            Array.prototype.push.apply(this._server_messages, [{
                'message': template ? 'Envelope does not found' : 'Template does not found',
                'indicator': 'red'
            }])
        }
        return status
    }


    fillCustomFields = async (customer: string) => {
        let status = false
        let envelope = await this.getEnvelope(customer)
        let project = await this.API.getValue('Project', 'name', {'customer': customer})
        if (envelope['envelope_id'] && project['name']) {
            let envelopesApi = new docusign.EnvelopesApi(this.dsApiClient)
            try {
                let customFields: docusign.TemplateCustomFields = {textCustomFields: []}
                let envCustomFields = await envelopesApi.listCustomFields(this.docuArgs.apiAccountId, envelope['envelope_id'])
                envCustomFields.textCustomFields.forEach(field => {
                    switch (field.name) {
                        case 'Customer':
                            field.value = customer
                            customFields.textCustomFields.push(field)
                            break;
                        case 'Project':
                            field.value = project['name']
                            customFields.textCustomFields.push(field)
                            break;
                    }
                })
                let results = await envelopesApi.updateCustomFields(this.docuArgs.apiAccountId, envelope['envelope_id'], {
                    customFields: customFields
                })
                status = true
            } catch (error) {
                let errorBody = error && error.response && error.response.body,
                    errorCode = errorBody && errorBody.errorCode, errorMessage = errorBody && errorBody.message;
                if (errorMessage) {
                    Array.prototype.push.apply(this._server_messages, [{
                        'message': errorMessage,
                        'indicator': 'red'
                    }])
                }
            }
        } else {
            Array.prototype.push.apply(this._server_messages, [{
                'message': envelope ? 'Project does not found' : 'Envelope does not found',
                'indicator': 'red'
            }])
        }
        return status
    }


    addSigner = async (customer: string, contact) => {
        let status = false
        let envelope = await this.getEnvelope(customer)
        if (envelope['envelope_id']) {
            try {
                let envelopesApi = new docusign.EnvelopesApi(this.dsApiClient)
                let continue_process = true
                let recipient = await envelopesApi.listRecipients(this.docuArgs.apiAccountId, envelope['envelope_id'])
                for (const signer of recipient.signers) {
                    if (signer.email == contact['email_id'])
                        continue_process = false
                    else
                        await envelopesApi.deleteRecipient(this.docuArgs.apiAccountId, envelope['envelope_id'], signer.recipientId)
                }
                if (continue_process) {
                    let accountsApi = new docusign.AccountsApi(this.dsApiClient)
                    let result = await accountsApi.getAccountIdentityVerification(this.docuArgs.apiAccountId);
                    const workflowId = result.identityVerification[0].workflowId;
                    let recipients: docusign.EnvelopeRecipients = {
                        signers: [{
                            roleName: 'Signer',
                            name: contact['first_name'] + ' ' + contact['last_name'],
                            firstName: contact['first_name'],
                            lastName: contact['last_name'],
                            email: contact['email_id'],
                            recipientId: '1',
                            clientUserId: customer,
                            identityVerification: {'workflowId': workflowId, 'steps': null}
                        }]
                    }
                    let results = await envelopesApi.createRecipient(this.docuArgs.apiAccountId, envelope['envelope_id'], {
                        recipients: recipients
                    })
                }
                status = true
            } catch (error) {
                let errorBody = error && error.response && error.response.body,
                    errorCode = errorBody && errorBody.errorCode, errorMessage = errorBody && errorBody.message;
                if (errorMessage) {
                    Array.prototype.push.apply(this._server_messages, [{
                        'message': errorMessage,
                        'indicator': 'red'
                    }])
                }
            }
        } else {
            Array.prototype.push.apply(this._server_messages, [{
                'message': 'Envelope does not found',
                'indicator': 'red'
            }])
        }
        return status
    }

    sendEnvelope = async (customer: string, contact) => {
        let status = false
        let envelope = await this.getEnvelope(customer)
        if (envelope['envelope_id']) {
            let envelopesApi = new docusign.EnvelopesApi(this.dsApiClient)
            const envelopeModification: docusign.Envelope = {
                status: 'sent'
            }
            try {
                await envelopesApi.update(this.docuArgs.apiAccountId, envelope['envelope_id'], {
                    advancedUpdate: 'true',
                    envelope: envelopeModification
                })
                let args: any = {
                    signerEmail: contact['email_id'],
                    signerName: customer,
                    signerClientId: customer
                }
                let viewRequest = await this.makeRecipientViewRequest(args);
                let results = await envelopesApi.createRecipientView(this.docuArgs.apiAccountId, envelope['envelope_id'],
                    {recipientViewRequest: viewRequest});

                return ({envelopeId: envelope['envelope_id'], redirectUrl: results.url})

            } catch (error) {
                let errorBody = error && error.response && error.response.body,
                    errorCode = errorBody && errorBody.errorCode, errorMessage = errorBody && errorBody.message;
                if (errorMessage) {
                    Array.prototype.push.apply(this._server_messages, [{
                        'message': errorMessage,
                        'indicator': 'red'
                    }])
                }
            }
        } else {
            Array.prototype.push.apply(this._server_messages, [{
                'message': 'Envelope does not found',
                'indicator': 'red'
            }])
        }
        return status
    }


    makeRecipientViewRequest = async (args: any) => {
        // Data for this method
        // args.dsReturnUrl
        // args.signerEmail
        // args.signerName
        // args.signerClientId
        // args.dsPingUrl

        let viewRequest: docusign.RecipientViewRequest = {
            returnUrl: import.meta.env.VITE_DOCU_ACCOUNT_LOCAL_RETURN_URL,
            authenticationMethod: 'none',
            email: args.signerEmail,
            userName: args.signerName,
            clientUserId: args.signerClientId
        }
        return viewRequest
    }


    getDocuJwt = async () => {
        let data = {}, status = true
        const jwtLifeSec = 10 * 60, // requested lifetime for the JWT is 10 min
            dsApi = new docusign.ApiClient();
        dsApi.setOAuthBasePath(jwtConfig.dsOauthServer.replace('https://', '')); // it should be domain only.
        let rsaKey = fs.readFileSync(jwtConfig.privateKeyLocation);
        try {
            const results = await dsApi.requestJWTUserToken(jwtConfig.dsJWTClientId,
                jwtConfig.impersonatedUserGuid, this.SCOPES, rsaKey,
                jwtLifeSec);
            const accessToken = results.body.access_token;

            // get user info
            const userInfoResults = await dsApi.getUserInfo(accessToken);

            // use the default account
            let userInfo = userInfoResults.accounts.find(account =>
                account.isDefault === "true");
            return {
                accessToken: results.body.access_token,
                apiAccountId: userInfo.accountId,
                basePath: `${userInfo.baseUri}/restapi`
            }
        } catch (e) {
            // console.log(e);
            let body = e.response && e.response.body;
            // Determine the source of the error
            if (body) {
                // The user needs to grant consent
                if (body.error && body.error === 'consent_required') {
                    data = this.getConsent() ? this.authenticate() : ''
                    return data
                } else {
                    // Consent has been granted. Show status code for DocuSign API error
                    return {
                        status: e.response.status,
                        headers: {
                            'access-control-allow-origin': '*',
                        },
                        body: {'status': status, 'data': body, error: e}
                    };
                }
            }
        }

    }


    authenticate = async () => {
        const jwtLifeSec = 10 * 60, // requested lifetime for the JWT is 10 min
            dsApi = new docusign.ApiClient();
        dsApi.setOAuthBasePath(jwtConfig.dsOauthServer.replace('https://', '')); // it should be domain only.
        let rsaKey = fs.readFileSync(jwtConfig.privateKeyLocation);
        try {
            const results = await dsApi.requestJWTUserToken(jwtConfig.dsJWTClientId,
                jwtConfig.impersonatedUserGuid, this.SCOPES, rsaKey,
                jwtLifeSec);
            const accessToken = results.body.access_token;

            // get user info
            const userInfoResults = await dsApi.getUserInfo(accessToken);

            // use the default account
            let userInfo = userInfoResults.accounts.find(account =>
                account.isDefault === "true");

            return {
                accessToken: results.body.access_token,
                apiAccountId: userInfo.accountId,
                basePath: `${userInfo.baseUri}/restapi`
            };
        } catch (e) {
            console.log(e);
            let body = e.response && e.response.body;
            // Determine the source of the error
            if (body) {
                // The user needs to grant consent
                if (body.error && body.error === 'consent_required') {
                    if (this.getConsent()) {
                        return this.authenticate();
                    }
                } else {
                    // Consent has been granted. Show status code for DocuSign API error
                    console.log(`\nAPI problem: Status code ${e.response.status}, message body:
        ${JSON.stringify(body, null, 4)}\n\n`);
                }
            }
        }
    }


    getConsent = () => {
        var urlScopes = this.SCOPES.join('+');

        // Construct consent URL
        var redirectUri = "https://developers.docusign.com/platform/auth/consent";
        var consentUrl = `${jwtConfig.dsOauthServer}/oauth/auth?response_type=code&` +
            `scope=${urlScopes}&client_id=${jwtConfig.dsJWTClientId}&` +
            `redirect_uri=${redirectUri}`;

        console.log("Open the following URL in your browser to grant consent to the application:");
        console.log(consentUrl);
        console.log("Consent granted? \n 1)Yes \n 2)No");
        let consentGranted = prompt("");
        if (consentGranted == "1") {
            return true;
        } else {
            console.error("Please grant consent!");
            Array.prototype.push.apply(this._server_messages, [{
                'message': 'Please grant consent!',
                'indicator': 'red'
            }])
            process.exit();
        }
    }

}

export default ZecsnDocuSign;
