var AWS = require('aws-sdk');
var s3 = new AWS.S3();
var pinpoint = new AWS.Pinpoint({region: 'us-west-2'});

var applicationId = process.env.PINPOINTV1;


exports.handler = function(event, context, callback) { 
    console.log(JSON.stringify(event, 4));
    
    var s3params = {
        Bucket: "polarcloud", 
        Key: "contacts/web/" + event.Id
    };    
    if (event.Id === undefined) {
        s3params.Key = event.Records[0].s3.object.key;
    }

    function S4() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
    }
     
    function createGUID() {
        return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
    }
    console.log(JSON.stringify('Environment: ' + process.env));
    console.log('s3Parms:' + JSON.stringify(s3params));
    s3.getObject(s3params, function(err, data) {
         if (err) {
            console.log("S3 get error" + err, err.stack);
             //log to cloudwatch
         }
         else {
             
             var endpoint = JSON.parse(data.Body.toString('utf-8'));
             console.log(JSON.stringify(endpoint));
             var currentDate = new Date();
             var isoEffectiveDate = currentDate.toISOString();

             var date = currentDate.getDate();
             if (date < 10) {
                 date = "0" + date;
             }
             var month = currentDate.getMonth() + 1;
             if (month < 10) {
                 month = "0" + month;
             }
             var year = currentDate.getFullYear();
             var effectiveDate = year + "" + month + "" + date;

             var params = {
                ApplicationId: applicationId,
                EndpointId: endpoint.Id,
                EndpointRequest: {
                    //Address: Contact may have multiple addresses. We submit an endpoint per address to Pinpoint.
                    //ChannelType: ^^^,
                    Demographic: {
                        AppVersion: 'Web-1.0',
                        Locale: 'NA',
                        Make: 'NA',
                        Model: 'NA',
                        ModelVersion: 'NA',
                        Platform: 'Web',
                        PlatformVersion: '1.0',
                        //Timezone: endpoint.Timezone
                    },
                    EffectiveDate: isoEffectiveDate,
                    Attributes: {
                        'Source': ['WEBSITE'],
                        'EffectiveDate': ['effectiveDate']
                    },
                    EndpointStatus: endpoint.MailingList == "true" ? "ACTIVE" : "INACTIVE",
                    Location: {
                        City: endpoint.City,
                        Country: endpoint.Counter,
                        Latitude: endpoint.Latitude,
                        Longitude: endpoint.Longitude,
                        PostalCode: endpoint.PostalCode,
                        Region: endpoint.Region
                    }
                }
             };
             
             if (endpoint.MailingList === "false") {
                 params.EndpointRequest.OptOut = "ALL"
             } else {
                params.EndpointRequest.OptOut = "NONE"
             }
             
             //TODO: add error handling
            //if contact has email and phone, create two records
            var addedEndpoint = false;
            
            if (endpoint.Email != undefined && endpoint.Email != "undefined") {
                console.log('Saving Email Endpoint');
                params.EndpointRequest.Address = endpoint.Email;
                params.EndpointRequest.ChannelType = "EMAIL";
                params.EndpointId = endpoint.Id,

                pinpoint.updateEndpoint(params, function(err, data) {
                    if (err) console.log(err, err.stack); // an error occurred
                    else     console.log(data); {
                        addedEndpoint = true;
                    }
                });
            } 
            
            if (endpoint.Phone != undefined && endpoint.Phone != "undefined") {
                console.log('Saving SMS Endpoint');
                params.EndpointRequest.Address = endpoint.Phone;
                params.EndpointRequest.ChannelType = "SMS";
                params.EndpointId = createGUID(),

                pinpoint.updateEndpoint(params, function(err, data) {
                    if (err) console.log(err, err.stack); // an error occurred
                    else     console.log(data); {
                        addedEndpoint = true
                    }
                }); 
                }
            }

            // Specify the parameters to pass to the API.
            var params = {
                ApplicationId: applicationId,
                MessageRequest: {
                Addresses: {
                    'partners@polarcloud.consulting':{
                    ChannelType: 'EMAIL'
                    }
                },
                MessageConfiguration: {
                    EmailMessage: {
                    FromAddress: 'partners@polarcloud.consulting',
                    SimpleEmail: {
                        Subject: {
                            Charset: "UTF-8",
                            Data: "New Contact: " + endpoint.FirstName + " " + endpoint.LastName
                        },
                        HtmlPart: {
                            Charset: "UTF-8",
                            Data: JSON.stringify(endpoint, null, 1)
                        },
                        TextPart: {
                            Charset: "UTF-8",
                            Data: JSON.stringify(endpoint, null, 1)
                        }
                    }
                    }
                }
                }
            };

            pinpoint.sendMessages(params, function(err, data) {
                // If something goes wrong, print an error message.
                if(err) {
                  console.log(err.message);
                } else {
                  console.log("Email sent: " + JSON.stringify(params, null, 1));
                }
              });

              
            //send SMS
            params.MessageRequest.Addresses = { '+19496271341': {ChannelType: 'SMS'} };
            delete params.MessageRequest.MessageConfiguration.SimpleEmail;
            delete params.MessageRequest.MessageConfiguration.EmailMessage;
            params.MessageRequest.MessageConfiguration.SMSMessage = {
                Body: "New Contact: " + endpoint.FirstName + " " + endpoint.LastName,
                Keyword: 'keyword_520384133655',
                MessageType: 'TRANSACTIONAL',
                OriginationNumber: '+12562697618',
                SenderId: 'polarCloud',
            };

            pinpoint.sendMessages(params, function(err, data) {
                // If something goes wrong, print an error message.
                if(err) {
                  console.log(err.message);
                } else {
                  console.log("SMS sent: " + JSON.stringify(data, null, 1));
                }
              });

            const response = {
                statusCode: 200,
                body: JSON.stringify(endpoint),
            };
            return response;
       });
};

