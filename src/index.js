 require('dotenv').config();

const menu = require('./menu');
const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const qs = require('querystring');
const debug = require('debug')('slash-command-template:index');
PagerDuty = require('./PagerDuty')
const app = express();

var channelList;
var priority;
var strMsg="";
var pager, PagerDuty;
var SLACK_DIALOG_SUBMISSION='dialog_submission'
var SLACK_POST_NEW_MESSAGE='/postcriticalincident-new'
var SLACK_DIALOG_POSTMESSAGE_CALLBACK_ID='post-message'
var SLACK_DIALOG_PAGERALERT_CALLBACK_ID='pager-alert'
var SLACK_MESSAGE_ACTION='message_action'
const N = "\n";
/*
 * Parse application/x-www-form-urlencoded && application/json
 */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var pager = new PagerDuty({
               authToken: process.env.PAGERDUTY_INCIDENT_APIKEY // required
             });
app.get('/', (req, res) => {
  res.send('<h2>The Slash Command and Dialog app is running</h2> <p>Follow the' +
  ' instructions in the README to configure the Slack App and your environment variables.</p>');
});

/*
 * Endpoint to receive /postincident slash command from Slack.
 * Checks verification token and opens a dialog to capture more info.
 */

app.post('/commands', (req, res) => {
  // extract the verification token, slash command text,
  // and trigger ID from payload
  const { token, text, trigger_id,command } = req.body;

        var preFillTextArea = `Start Time: ${
               N}Resolution Time: ${
               N}Time to Resolution: ${
               N}Suspected root cause:`;

  // check that the verification token matches expected value
  if (token === process.env.SLACK_VERIFICATION_TOKEN) {
        if (command === SLACK_POST_NEW_MESSAGE) {
    // create the dialog payload - includes the dialog structure, Slack API token,
    // and trigger ID

 const dialog = {
      token: process.env.SLACK_ACCESS_TOKEN,
      trigger_id,
      dialog: JSON.stringify({
        title: 'Post a critical incident',
        callback_id: 'post-message',
        submit_label: 'Submit',
        elements: [
          {
            label: 'Title',
            type: 'text',
            name: 'title',
            value: text,
            placeholder: 'New P2 Zendesk 12345 : Client Website is down '
          },
           {
            label: 'Select Channel',
            name: 'Channels',
            type: 'select',
            data_source:'conversations',
            placeholder: 'Select an option'

            },
          {
            label: 'Application & Issue',
            name: 'Application',
            type: 'text',
            //option_groups: menu.options_group,
            value: text,
             hint: 'eg: Client Website - Registration unsuccessful , NMConnect - Search is throwing 504 GatewayError',
          },
          {
            label: 'Bridge Details',
            type: 'select',
            name: 'bridgeDetails',
            options: menu.listOfBridge(),
            optional: true,
          },
          {
            label: 'Additional Information',
            type: 'textarea',
            name: 'description',
            value: preFillTextArea,
            optional: true,
          },
        ],
      }),
    };


    // open the dialog by calling dialogs.open method and sending the payload
    axios.post('https://slack.com/api/dialog.open', qs.stringify(dialog))
      .then((result) => {
        debug('dialog.open: %o', result.data);
        console.log('dialog.open: %o', result.data);
        res.send('');
      }).catch((err) => {
        console.log('error',err);
        debug('dialog.open call failed: %o', err);
        res.sendStatus(500);
      });
  };
  } else {
        debug('Verification token mismatch');
        res.sendStatus(500);
  }
});

/**************************************************************************
 * Endpoint to receive the dialog submission. Checks the verification token
 * and post the message
 ***************************************************************************/
app.post('/interactive-component', (req, res) => {
  const body = JSON.parse(req.body.payload);

  // check that the verification token matches expected value
  if (body.token === process.env.SLACK_VERIFICATION_TOKEN) {
     //***************************`Postincident- dialog submission***********************************//
        if (body.type === SLACK_DIALOG_SUBMISSION) {
     //************************* DIALOG SUBMISSION FOR POST MESSAGE*********************************//
            if (body.callback_id === SLACK_DIALOG_POSTMESSAGE_CALLBACK_ID) {
                    debug(`Form submission received: ${body.submission.trigger_id}`);
                    // immediately respond with a empty 200 response to let
                    // Slack know the command was received
                    res.send('');

                    if(body.submission.title.includes('P1')){
                     priority = 'Priority 1'
                    }
                    else
                    { priority = 'Priority 2'
                    }

                      axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
                         token: process.env.SLACK_ACCESS_TOKEN,
                         channel: body.submission.Channels,
                         text: `*${body.submission.title}*`,
                         attachments: JSON.stringify([
                           {
                             //title_link: `@${ticket.userName}`,
                             //text: body.submission.title,
                             color:'#36a64f',
                             fields: [
                              /* {
                                 title: `    We are experiencing ${body.submission.issueType} in ${body.submission.application}.We have paged ${body.submission.pagerDuty}.A ${body.submission.title} has been opened for this issue`,
                                 title : body.submission.title
                             },*/
                               {
                                 title: 'Description',
                                 value: body.submission.Application,
                                 short: false,
                               },
                               {
                                  title: 'Priority',
                                  value: priority,
                                  short: true,
                               },
                               {
                                 title: 'Bride Details',
                                 value: body.submission.bridgeDetails,
                                 short: true,
                               },
                               {
                                 title: 'Additional Information',
                                 value: body.submission.description || 'None provided',
                               },
                             ],
                               footer: `Incident posted by ${body.user.name}`,
                               footer_icon: 'https://platform.slack-edge.com/img/default_application_icon.png',
                               ts: body.action_ts
                           },
                         ]) ,
                       })).then((result) => {
                         debug('sendConfirmation: %o', result);
                         console.log('result.data',result.data);
                       }).catch((err) => {
                         debug('sendConfirmation error: %o', err);
                         console.error(err);
                       });
     };
     //************************* DIALOG SUBMISSION FOR PAGER ALERT**********************************//
                if (body.callback_id === SLACK_DIALOG_PAGERALERT_CALLBACK_ID) {
                             res.send('');
                          //Create pager Incident
                          //https://hackathon.pagerduty.com/services/PEWAI9T
                          //https://hackathon.pagerduty.com/escalation_policies/PLNOUIR
                        var newIncident={
                            "incident": {
                                "type": "incident",
                                "title": body.submission.title,
                                "service": {
                                  "id": body.submission.PagerService,
                                  "type": "service_reference"
                                },
                                "body": {
                                  "type": "incident_body",
                                  "details": body.submission.description
                                }
                          }
                        }

                         pager.createIncident("aaravinds@gmail.com",newIncident)
                         .then(function(response) {
                             return response;
                         })
                         .then(function(response){
                                      if (response.incident_number){
                                                   axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
                                                   token: process.env.SLACK_ACCESS_TOKEN,
                                                   channel: body.channel.name,
                                                   text: `*Pager Alert Triggered*`,//`${body.submission.title}`,
                                                   attachments: JSON.stringify([
                                                    {
                                                      "title": `Pagerduty Incident# ${response.incident_number}:${body.submission.title}`,
                                                      "title_link":`https://hackathon.pagerduty.com/incidents/${response.incident_number}`,
                                                       "color": "#7CD197"
                                                     }
                                                   ]) ,
                                                 })).then((result) => {
                                                   console.log('sendConfirmation: %o', result);
                                                   debug('sendConfirmation: %o', result);
                                                 }).catch((err) => {
                                                   debug('sendConfirmation error: %o', err);
                                                   console.error(err);
                                                 });
                                         }
                         })
                         .catch(function(ex){
                            /*Error Details should be handled and post the error response to channel*/
                             console.log('Error!: '+ ex)
                         });

                         //post the response message from pager API

                    }
  };
     //*******************MESSAGE ACTION FOR PAGER CONNECT*******************************************//
        if (body.type === SLACK_MESSAGE_ACTION) {
             const parsedBody = JSON.stringify(body.message.attachments);
             const { token, text, trigger_id,command } = body
             console.log('body.message.attachments[0].fields',body.message.attachments[0]);
             //Validation is missing for attachment fields
                if(body.message.attachments[0].fields.length){
                for(var i = 0; i < body.message.attachments[0].fields.length; i++)
                   {
                     strMsg += `${N}${body.message.attachments[0].fields[i].title}: ${body.message.attachments[0].fields[i].value}`;
                   }
                 }

             const message_action_dialog = {
                   token: process.env.SLACK_ACCESS_TOKEN,
                   trigger_id,
                   dialog: JSON.stringify({
                     title: 'Send a Pager Alert',
                     callback_id: 'pager-alert',
                     submit_label: 'Send',
                     elements: [
                       {
                         label: 'Title',
                         type: 'text',
                         name: 'title',
                         value: body.message.text,
                         placeholder: 'New P2 12345 : Client Website is down '
                       },
                       {
                         label: 'Select a Pager Service',
                         type: 'select',
                         name: 'PagerService',
                         options: menu.listOfPagerDutyService(),
                         placeholder: 'Choose a PagerDuty service'
                        },
                       {
                         label: 'Incident Details',
                         type: 'textarea',
                         name: 'description',
                         value: strMsg ,
                         optional: true,
                       },
                     ],
                   }),
                 };


                 // open the dialog by calling dialogs.open method and sending the payload
                 axios.post('https://slack.com/api/dialog.open', qs.stringify(message_action_dialog))
                   .then((result) => {
                     debug('dialog.open: %o', result.data);
                     console.log('dialog.open: %o', result.data);
                     res.send('');
                   }).catch((err) => {
                     console.log('error',err);
                     debug('dialog.open call failed: %o', err);
                     res.sendStatus(500);
                   });


   };
  } else {
        debug('Token mismatch');
        res.sendStatus(500);
  }
});


app.listen(process.env.PORT, () => {
  console.log(`App listening on port ${process.env.PORT}!`);
});
