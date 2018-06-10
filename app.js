/*
 * Starter Project for Messenger Platform Quick Start Tutorial
 *
 * Remix this as the starting point for following the Messenger Platform
 * quick start tutorial.
 *
 * https://developers.facebook.com/docs/messenger-platform/getting-started/quick-start/
 *
 */

'use strict';

// Imports dependencies and set up http server
const 
  request = require('request'),
  express = require('express'),
  body_parser = require('body-parser'),
  FB = require('./my_fb.js'),
  app = express().use(body_parser.json()).use(body_parser.urlencoded({ extended: true })); // creates express http server

if (process.argv.length > 2) {
  const profile = require('./' + process.argv[2]);
  require('./comment_bot.js')(profile);
}

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const INBOX_APP_ID = '263902037430900';

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

// Accepts POST requests at /webhook endpoint
app.post('/webhook', (req, res) => {  

  // Parse the request body from the POST
  let body = req.body;

  // Check the webhook event is from a Page subscription
  if (body.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {

      // Get the webhook event. entry.messaging is an array, but 
      // will only ever contain one event, so we get index 0
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);
      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log('Sender PSID: ' + sender_psid);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);        
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
      }
    });

    // Return a '200 OK' response to all events
    res.status(200).send('EVENT_RECEIVED');

  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});

// Accepts GET requests at the /webhook endpoint
app.get('/webhook', (req, res) => {
  
  /** UPDATE YOUR VERIFY TOKEN **/
  const VERIFY_TOKEN = "THIS_IS_ME";
  
  // Parse params from the webhook verification request
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
    
  // Check if a token and mode were sent
  if (mode && token) {
  
    // Check the mode and token sent are correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
      // Respond with 200 OK and challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);      
    }
  }
});

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/login', (req, res) => {
  var url = FB.getLoginUrl({
    scope: 'manage_pages,read_page_mailboxes,publish_pages',
    redirect_uri: 'https://it9cb.hellosam.net/login/parse',
  });
  res.render('login', { url: url });
});

app.get('/login/parse', (req, res) => {
  if (req.query.code) 
  {
    var access_token = null;
    FB.api('oauth/access_token', {
      client_id: FB.options('appId'),
      client_secret: FB.options('appSecret'),
      redirect_uri: 'https://it9cb.hellosam.net/login/parse',
      code: req.query.code
    }).then(function (fb_res) {
      return FB.api('oauth/access_token', {
        client_id: FB.options('appId'),
        client_secret: FB.options('appSecret'),
        grant_type: 'fb_exchange_token',
        fb_exchange_token: fb_res.access_token
      });
    }).then(function (fb_res) {
      var tFB = FB.extend({'accessToken': fb_res.access_token});
      access_token = fb_res.access_token;
      return tFB.api('me/accounts');
    }).then(function (fb_res) {
      res.render('pick_page', { data: fb_res.data });
    }).catch(function (error) {
      console.log(error)
      res.redirect('/login');
    });
  } else {
    res.status(500).send('No code was found');
  }
});

app.post('/login/pick_post', (req, res) => {
  if (req.body.page_token)
  {
    var page_token = req.body.page_token;
    var tFB = FB.extend({'accessToken': page_token});
    tFB.api('me/feed?limit=50').then(function (fb_res) {
      res.render('pick_post', { data: fb_res.data, page_token: page_token });
    }).catch(function (error) {
      console.log(error);
      res.redirect('/login');
    });
  } else {
    res.redirect('/login');
  }
});

app.post('/login/result', (req, res) => {
  var page_token = req.body.page_token;
  var tFB = FB.extend({'accessToken': page_token});

  tFB.api('me').then((fb_res) => {
    var config = { PAGE_TOKEN: req.body.page_token, PAGE_ID: fb_res.id, POST_ID: req.body.post_id };
    res.render('login_result', { config: config });
  }).catch(function (error) {
    console.log(error);
    res.redirect('/login');
  });
});

