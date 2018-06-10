module.exports = (profile) => {
  // THIS PART AREN'T DONE YET. YMMV.
  var FB = require('./my_fb.js').extend({'accessToken': profile.PAGE_TOKEN});

  // Handles messages events
  function handleMessage(sender_psid, received_message) {
    let response;

    // Check if the message contains text
    if (received_message.quick_reply && received_message.quick_reply.payload) {
      if (received_message.quick_reply.payload == "Yes") {
        response = {
          "attachment":{
            "type":"template",
            "payload":{
              "template_type":"generic",
              "elements":[
                 {
                  "title":"Meow!",
                  "image_url":"https://cdn.glitch.com/b22a3e7a-9de0-4f84-bfe7-50ef4a0ad00c%2Fmeow.png?1528502135300"
                 }
                ]
            }
          }
        }
        callSendAPI(sender_psid, response);
      } else if (received_message.quick_reply.payload == "No") {
        response = {
          "attachment":{
            "type":"template",
            "payload":{
              "template_type":"generic",
              "elements":[
                 {
                  "title":"You kidding me!?",
                  "image_url":"https://cdn.glitch.com/b22a3e7a-9de0-4f84-bfe7-50ef4a0ad00c%2Fnoway.png?1528502129589"
                 }
                ]
            }
          }
        }
        callSendAPI(sender_psid, response);
      } else {
        callPassThreadControl(sender_psid, INBOX_APP_ID);
      }
    } else {
      response = {
        "text": "Do you like cat",
        "quick_replies":[
          {
            "content_type":"text",
            "title":"Yes",
            "payload":"Yes"
          },
          {
            "content_type":"text",
            "title":"No",
            "payload":"No"
          },
          {
            "content_type":"text",
            "title":"I Want Human!",
            "payload":"human"
          },
        ]
      }
      callSendAPI(sender_psid, response);   
    }
  }

  // Handles messaging_postbacks events
  function handlePostback(sender_psid, received_postback) {

  }

  // Sends response messages via the Send API
  function callSendAPI(sender_psid, response) {
    // Construct the message body
    let request_body = {
      "recipient": {
        "id": sender_psid
      },
      "message": response
    }
    request({
      "uri": "https://graph.facebook.com/v2.6/me/messages",
      "qs": { "access_token": PAGE_ACCESS_TOKEN },
      "method": "POST",
      "json": request_body
    }, (err, res, body) => {
      if (!err) {
        console.log('message sent!')
      } else {
        console.error("Unable to send message:" + err);
      }
    }); 
  }

    
  function callPassThreadControl(sender_psid, app_id) {
    // Construct the message body
    let request_body = {
      "recipient": {
        "id": sender_psid
      },
      "target_app_id": app_id
    }
    request({
      "uri": "https://graph.facebook.com/v2.6/me/pass_thread_control",
      "qs": { "access_token": PAGE_ACCESS_TOKEN },
      "method": "POST",
      "json": request_body
    }, (err, res, body) => {
      if (!err) {
        console.log('message sent!')
      } else {
        console.error("Unable to send message:" + err);
      }
    }); 
  }
}
