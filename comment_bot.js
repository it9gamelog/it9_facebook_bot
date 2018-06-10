module.exports = (profile) => {
  var FB = require('./my_fb.js').extend({'accessToken': profile.PAGE_TOKEN});

  var processComment = (comment_id, reply, comment) => {
    FB.api(comment_id + '/private_replies', 'post', { message: reply })
//  TODO: Uncomment when you have publish_pages permission
//    .then(() => { return FB.api(comment_id + '/comments', 'post', { message: comment }) })
    .then(() => { console.log(`Reply: success ${comment_id}`); })
    .catch((error) => { console.warn(`Reply: unable to post to ${comment_id}: ${error}`); });
  };

  var beforeCursor = '';
  var loadComments;
  loadComments = () => {
    FB.api(profile.POST_ID + '/comments?order=reverse_chronological&total_count=50&filter=stream&before=' + beforeCursor)
    .then((fb_res) => {
      if (fb_res.data.length) {
        console.log(`Comment Bot: Got ${fb_res.data.length} comments`);
      }
      fb_res.data.forEach((val, i) => {
        if (val.from && val.from.id == profile.PAGE_ID)
          return;
        var done = false;
        profile.data.forEach((p, j) => {
          if (!done && p.match.test(val.message)) {
            processComment(val.id, p.reply || profile.reply, p.comment || profile.comment);
            done = true;
          }
        });
      });
      if (fb_res.paging)
        beforeCursor = fb_res.paging.cursors.before;
      setTimeout(loadComments, 5000);
    }).catch((error) => {
      beforeCursor = '';
      console.error(error);
      setTimeout(loadComments, 30000);
    });
  };
  loadComments();
};
