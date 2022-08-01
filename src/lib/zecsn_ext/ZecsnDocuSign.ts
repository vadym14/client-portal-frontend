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

    getEnvelopeStatus = async (customer: string) => {
       let results
        let envelope = await this.API.getValue('DocuSign Envelope', ['name','envelope_id', 'envelope_status'], {'customer': customer})
        if (envelope['envelope_status'] !== 'signed') {
            let EnvelopesApi = new docusign.EnvelopesApi(this.dsApiClient)
             results = await EnvelopesApi.getEnvelope(this.docuArgs.apiAccountId,envelope['envelope_id']);
            envelope = {
                'name': envelope['name'],
                'envelope_status': results.status,
                'doctype': 'DocuSign Envelope'
            }
            envelope = await this.API.update(envelope)
            if(envelope['envelope_status'] ==='signed'){
                await this.createIdEvidence(envelope['envelope_id'],customer)
            }
        }
        return results
    }

    getReceipentIdVerficaitonEvent = async (envelopeId:string) =>{

        const EnvelopesApi = new docusign.EnvelopesApi(this.dsApiClient)
        const recipients = await EnvelopesApi.listRecipients(this.docuArgs.apiAccountId,envelopeId)
        const recipientId :string|any = recipients.signers[0].recipientIdGuid
        const proofLink = await EnvelopesApi.createRecipientProofFileResourceToken('',this.docuArgs.apiAccountId,envelopeId,recipientId)

        const res = await fetch(`${proofLink.proofBaseURI}/api/v1/events/person/${recipientId}`, {
            method: 'GET',
            headers:  {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${proofLink.resourceToken}`, //Server Token
            },
        })
        const results = await res.json()
        return {
            "events": [
                {
                    "event_type": "IdVerificationPhotoIdSuccess",
                    "entity_type": "person",
                    "schema_version": 0,
                    "creation_date": "2020-06-24T04:06:12.2009844Z",
                    "data": {
                        "trace_uid": "a05a1aa7-XXXX-XXXX-XXXX-28afafd6e1c2",
                        "session_id": "3d79ae61-XXXX-XXXX-XXXX-e108f0ebe200",
                        "task_uid": "dc7b47a0-XXXX-XXXX-XXXX-5dd360c72737",
                        "person_id": "e1eb23a9-XXXX-XXXX-XXXX-1181796b6003",
                        "person_name": "Jasmine Price",
                        "type_of_id": "PHOTOID",
                        "country_selected_by_signer": "US",
                        "provider_name": "MITEK",
                        "id_number": "123456",
                        "expiration_date": "123456",
                    },
                    "has_media": false
                },
                {
                    "event_type": "IdVerificationPhotoIdImageSent",
                    "entity_type": "person",
                    "schema_version": 0,
                    "creation_date": "2020-06-24T04:06:11.6948346Z",
                    "data": {
                        "trace_uid": "a05a1aa7-XXXX-XXXX-XXXX-28afafd6e1c2",
                        "session_id": "3d79ae61-XXXX-XXXX-XXXX-e108f0ebe200",
                        "task_uid": "dc7b47a0-XXXX-XXXX-XXXX-5dd360c72737",
                        "copy_of_id_front": "https://proof-d.docusign.net/api/v1/events/person/e1eb23a9-XXXX-XXXX-XXXX-1181796b6003/f42d8d8d-XXXX-XXXX-XXXX-4a780140087a/media/8840a69e-XXXX-XXXX-XXXX-2b1996ec2bd7",
                        "copy_of_id_back": "https://proof-d.docusign.net/api/v1/events/person/e1eb23a9-XXXX-XXXX-XXXX-1181796b6003/f42d8d8d-XXXX-XXXX-XXXX-4a780140087a/media/14654b7b-XXXX-XXXX-XXXX-b1060dac0ff8"
                    },
                    "has_media": true
                },
                {
                    "event_type": "envelopesent",
                    "entity_type": "person",
                    "schema_version": 0,
                    "creation_date": "2020-06-24T03:44:16.5915791Z",
                    "data": {
                        "envelope_id": "dcd9f867-XXXX-XXXX-XXXX-2254008d4d9f",
                        "recipient_id": "e1eb23a9-XXXX-XXXX-XXXX-1181796b6003",
                        "recipient_name": "Jasmine Price",
                        "recipient_email": "JPrice@example.com",
                        "created_by": "Jasmine Price"
                    },
                    "has_media": false
                }
            ],
            "paging": {
                "page_index": 1,
                "page_size": 50,
                "total_items": 3,
                "total_pages": 1,
                "has_previous_page": false,
                "has_next_page": false
            }
        }
    }

    createIdEvidence = async (envelopeId:string,customer:string) =>{
        let recipientIDV = await this.getReceipentIdVerficaitonEvent(envelopeId)
        let recipientIDValue = recipientIDV.filter(item => item.event_type === 'IdVerificationPhotoIdSuccess');
        let project = await this.API.getValue('Project', 'name', {'customer': customer})
        const IdVerification = {
            'doctype': 'ID Verification',
            'verification_status':'Pass',
            'verification_provider':recipientIDValue.data.provider_name,
            'docusign_transaction_number':recipientIDValue.data.trace_uid,
            'provider_transaction_number':recipientIDValue.data.session_id,
            'id_name':recipientIDValue.data.person_name,
            'id_type':recipientIDValue.data.type_of_id,
            'id_number':recipientIDValue.data.id_number,
            'id_expiration_date':recipientIDValue.data.expiration_date,
            'customer':customer,
            'project':project['name'],
        }
        return await this.API.insert(IdVerification)
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

    sendEnvelope = async (customer: string, contact) => {
        let envelope = await this.getEnvelope(customer)
        // Todo Embedded Signing
        if (envelope['envelope_id']) {
            let EnvelopesApi = new docusign.EnvelopesApi(this.dsApiClient)
            const envelopeModification: docusign.Envelope = {
                status: 'sent'
            }
            try {
                await EnvelopesApi.update(this.docuArgs.apiAccountId, envelope['envelope_id'], {
                    advancedUpdate: 'true',
                    envelope: envelopeModification
                })
                let args: any = {
                    signerEmail: contact['email_id'],
                    signerName: customer,
                    signerClientId: customer
                }
                let viewRequest = await this.makeRecipientViewRequest(args);
                let results = await EnvelopesApi.createRecipientView(this.docuArgs.apiAccountId, envelope['envelope_id'],
                    {recipientViewRequest: viewRequest});

                return ({envelopeId: envelope['envelope_id'], redirectUrl: results.url})

            } catch (error) {
                let errorBody = error && error.response && error.response.body,
                    errorCode = errorBody && errorBody.errorCode, errorMessage = errorBody && errorBody.message;
                console.log(errorBody)
                return false
            }
        }
    }
    makeRecipientViewRequest = async (args: any) => {
        // Data for this method
        // args.dsReturnUrl
        // args.signerEmail
        // args.signerName
        // args.signerClientId
        // args.dsPingUrl

        let viewRequest = new docusign.RecipientViewRequest();

        // Set the url where you want the recipient to go once they are done signing
        // should typically be a callback route somewhere in your app.
        // The query parameter is included as an example of how
        // to save/recover state information during the redirect to
        // the DocuSign signing ceremony. It's usually better to use
        // the session mechanism of your web framework. Query parameters
        // can be changed/spoofed very easily.
        viewRequest.returnUrl = import.meta.env.VITE_DOCU_ACCOUNT_LOCAL_RETURN_URL;

        // How has your app authenticated the user? In addition to your app's
        // authentication, you can include authenticate steps from DocuSign.
        // Eg, SMS authentication
        viewRequest.authenticationMethod = 'none';

        // Recipient information must match embedded recipient info
        // we used to create the envelope.
        viewRequest.email = args.signerEmail;
        viewRequest.userName = args.signerName;
        viewRequest.clientUserId = args.signerClientId;

        // DocuSign recommends that you redirect to DocuSign for the
        // Signing Ceremony. There are multiple ways to save state.
        // To maintain your application's session, use the pingUrl
        // parameter. It causes the DocuSign Signing Ceremony web page
        // (not the DocuSign server) to send pings via AJAX to your
        // app,
        // viewRequest.pingFrequency = 600; // seconds
        // NOTE: The pings will only be sent if the pingUrl is an https address
        // viewRequest.pingUrl = args.dsPingUrl; // optional setting

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
            process.exit();
        }
    }

}

export default ZecsnDocuSign;
