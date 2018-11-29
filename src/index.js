 require('dotenv').config();

const menu = require('./menu');
const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const qs = require('querystring');
//const ticket = require('./ticket');
const debug = require('debug')('slash-command-template:index');

const app = express();

/*
 * Parse application/x-www-form-urlencoded && application/json
 */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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
    console.log('req.body:',req.body);
    console.log('Command:',command);

    const N = "\n";  //maybe we could find evocative unicode name.
        var preFillTextArea = `Start Time: ${
               N}Resolution Time: ${
               N}Time to Resolution: ${
               N}Suspected root cause`;

  // check that the verification token matches expected value
  if (token === process.env.SLACK_VERIFICATION_TOKEN) {
   if (command === process.env.SLACK_POST_NEW_MESSAGE) {
    // create the dialog payload - includes the dialog structure, Slack API token,
    // and trigger ID
    console.log('Command:',command);
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
            placeholder: 'New P2 12345 : Client Website is down '
          },
           {
            label: 'post this message on',
            name: 'Channels',
            type: 'select',
            data_source: 'conversations'
            //options: menu.listOfChannelList(),
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

/*
 * Endpoint to receive the dialog submission. Checks the verification token
 * and post the message
 */
app.post('/interactive-component', (req, res) => {
  const body = JSON.parse(req.body.payload);
  console.log('req.body.payload',body);
var priority;
  // check that the verification token matches expected value
  if (body.token === process.env.SLACK_VERIFICATION_TOKEN) {
    debug(`Form submission received: ${body.submission.trigger_id}`);

    // immediately respond with a empty 200 response to let
    // Slack know the command was received
    res.send('');

    // create ticket
    //ticket.create(body.user.id, body.submission);
    if(body.submission.title.includes('P1')){
     priority = 'P1'
    console.log('priority',priority);
    }
    else
    { priority = 'P2'
    console.log('priority p2',priority);
    }

      axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
         token: process.env.SLACK_ACCESS_TOKEN,
         channel: body.submission.Channels,
         text: `*${body.submission.title}*`,
         attachments: JSON.stringify([
           {

             // Get this from the 3rd party helpdesk system
             //title_link: `@${ticket.userName}`,
             //text: body.submission.title,
             color:'#36a64f',
             fields: [
              // {
                 //title: `    We are experiencing ${body.submission.issueType} in ${body.submission.application}.We have paged ${body.submission.pagerDuty}.A ${body.submission.title} has been opened for this issue`,
                 //title : body.submission.title
             //},
               {
                 title: 'Description',
                 value: body.submission.Application,
                 short: true,
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
                 title: 'Pager Team',
                 value: body.submission.pagerDuty,
                 short: true,
               },
               {
                 title: 'Additional Information',
                 value: body.submission.description || 'None provided',
               },
             ],
               footer: `Incident posted by ${body.user.name}`,
               footer_icon: 'https://platform.slack-edge.com/img/default_application_icon.png',
               ts: 1536324349.554077
           },
         ]) ,
       })).then((result) => {
         debug('sendConfirmation: %o', result);
         console.log('result.data',result.data);
       }).catch((err) => {
         debug('sendConfirmation error: %o', err);
         console.error(err);
       });


  } else {
    debug('Token mismatch');
    res.sendStatus(500);
  }
});


app.listen(process.env.PORT, () => {
  console.log(`App listening on port ${process.env.PORT}!`);
});
