import docusign, {DocumentTemplate, TemplateCustomFields, TextCustomField} from "docusign-esign";
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

    initialize = async () => {
        this.docuArgs = await this.getDocuJwt()
        this.dsApiClient = new docusign.ApiClient();
        this.dsApiClient.setBasePath(this.docuArgs.basePath);
        this.dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + this.docuArgs.accessToken);
        this.API = new ZecsnExtAPI();
    }

    getEnvelope = async (customer: string) => {
        let envelope = await this.API.getValue('DocuSign Envelope', ['envelope_id', 'envelope_status'], {'customer': customer})
        if (!envelope['envelope_id']) {
            let project = await this.API.getValue('Project', 'name', {'customer': customer})
            let EnvelopesApi = new docusign.EnvelopesApi(this.dsApiClient)
            let results = await EnvelopesApi.createEnvelope(this.docuArgs.apiAccountId);
            console.log(results)
            envelope = {
                'customer': customer,
                'project': project['name'],
                'envelope_id': results.envelopeId,
                'envelope_status': 'created',
                'doctype': 'DocuSign Envelope'
            }
            console.log(envelope)
            envelope = await this.API.insert(envelope)
        }
        return envelope
    }


    getTemplate = async (template_name: string) => {
        let TemplatesApi = new docusign.TemplatesApi(this.dsApiClient)
        let results = await TemplatesApi.listTemplates(this.docuArgs.apiAccountId, {
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
        let envelope = await this.getEnvelope(customer)
        let template = await this.getTemplate(template_name)
        if (envelope['envelope_id'] && template) {
            let EnvelopesApi = new docusign.EnvelopesApi(this.dsApiClient)
            let documentTemplateList: docusign.DocumentTemplateList = {documentTemplates: [{templateId: template.templateId}]};
            try {
                let results = await EnvelopesApi.applyTemplate(this.docuArgs.apiAccountId, envelope['envelope_id'], {
                    preserveTemplateRecipient: 'false',
                    documentTemplateList: documentTemplateList
                })
                return true
            } catch (error) {
                let errorBody = error && error.response && error.response.body,
                    errorCode = errorBody && errorBody.errorCode, errorMessage = errorBody && errorBody.message;
                console.log(errorBody)
                return false
            }
        }
    }


    fillCustomFields = async (customer: string, template_name: string) => {
        let envelope = await this.getEnvelope(customer)
        let template = await this.getTemplate(template_name)
        let project = await this.API.getValue('Project', 'name', {'customer': customer})
        if (envelope['envelope_id'] && template && project['name']) {
            let EnvelopesApi = new docusign.EnvelopesApi(this.dsApiClient)
            try {
                let customFields: docusign.TemplateCustomFields = {textCustomFields: []}
                let envCustomFields = await EnvelopesApi.listCustomFields(this.docuArgs.apiAccountId, envelope['envelope_id'])
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
                let results = await EnvelopesApi.updateCustomFields(this.docuArgs.apiAccountId, envelope['envelope_id'], {
                    customFields: customFields
                })
                return true
            } catch (error) {
                let errorBody = error && error.response && error.response.body,
                    errorCode = errorBody && errorBody.errorCode, errorMessage = errorBody && errorBody.message;
                console.log(errorBody)
                return false
            }
        }
    }


    addSigner = async (customer: string, contact, template_name: string) => {
        let envelope = await this.getEnvelope(customer)
        let template = await this.getTemplate(template_name)
        console.log(contact)
        if (envelope['envelope_id'] && template) {
            try {
                let EnvelopesApi = new docusign.EnvelopesApi(this.dsApiClient)
                let continue_process = true
                let recipient = await EnvelopesApi.listRecipients(this.docuArgs.apiAccountId, envelope['envelope_id'])
                recipient.signers.forEach(signer => {
                    if (signer.email == contact['email_id'])
                        continue_process = false
                })
                if (continue_process) {
                    let accountsApi = new docusign.AccountsApi(this.dsApiClient)
                    let result = await accountsApi.getAccountIdentityVerification(this.docuArgs.apiAccountId);
                    const workflowId = result.identityVerification[0].workflowId;
                    let recipients: docusign.EnvelopeRecipients = {
                        signers: [{
                            roleName: 'Signer',
                            name: customer,
                            firstName: contact['first_name'],
                            lastName: contact['last_name'],
                            email: contact['email_id'],
                            recipientId: '1',
                            clientUserId: customer,
                            identityVerification: {'workflowId': workflowId, 'steps': null}
                        }]
                    }
                    let results = await EnvelopesApi.createRecipient(this.docuArgs.apiAccountId, envelope['envelope_id'], {
                        recipients: recipients
                    })
                }
                return true
            } catch (error) {
                let errorBody = error && error.response && error.response.body,
                    errorCode = errorBody && errorBody.errorCode, errorMessage = errorBody && errorBody.message;
                console.log(errorBody)
                return false
            }
        }
    }

    sendEnvelope = async (customer: string) => {
        let envelope = await this.getEnvelope(customer)
        // Todo Embedded Signing
        /*if (envelope['envelope_id']) {
            let EnvelopesApi = new docusign.EnvelopesApi(this.dsApiClient)
            const envelopeModification: docusign.Envelope = {
                status: 'sent'
            }
            try {
                let results = await EnvelopesApi.update(this.docuArgs.apiAccountId, envelope['envelope_id'], {
                    advancedUpdate: 'true',
                    envelope: envelopeModification
                })
            } catch (error) {
                let errorBody = error && error.response && error.response.body,
                    errorCode = errorBody && errorBody.errorCode, errorMessage = errorBody && errorBody.message;
                console.log(errorBody)
                return false
            }
        }*/
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
            process.exit();
        }
    }

}

export default ZecsnDocuSign;
