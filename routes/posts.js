const express = require('express');
const router = express.Router();
const db = require('../db/');
const isLogged = require('../middleware');


router.post("/add", isLogged ,async (req, res) => {
    if(!req.body.text || !req.body.thread || !req.user){
        req.flash('error','Error');
        return res.redirect(`../threads/${req.body.thread}/page-0`);
    }
    if(filterText(req.body.text) == ""){
        req.flash('error','Invalid message');
        return res.redirect(`../threads/${req.body.thread}/page-0`);
    }
    
    try{
        var result = await db.query('INSERT INTO post (text, thread, user_id) VALUES($1, $2, $3)', [
            req.body.text,
            req.body.thread,
            req.user.id
        ]);
        await db.query('UPDATE users SET message_count = message_count + 1 WHERE id = $1', [req.user.id]);
        return res.redirect(`../threads/${req.body.thread}/page-0`);
    } 
    catch(err){
        console.log(err);
    }
}); 


router.get('/:id/delete', isLogged, async (req, res) => {
    try{
        var result = await db.query('SELECT * FROM post WHERE id = $1', [req.params.id]);
        var post = result.rows[0];
        //console.log(post);
        if(req.user.status == 'admin' || req.user.id == post.user_id){
            //get id of the first post of the thread
            var result = await db.query('SELECT id FROM post WHERE thread = $1 ORDER BY date LIMIT 1', [post.thread]);
            if(result.rows[0].id != req.params.id)
                await db.query('DELETE FROM post WHERE id = $1', [req.params.id]);
            else
                req.flash('error','First post of the thread cannot be deleted');
        }
        else
            req.flash('error','You do not have permission for this action');
            
        res.redirect('back');
    }
    catch(err){
        console.log(err);
        req.flash('error','Post was not removed');
        res.redirect('back');
    }
});

function filterText(text){
    return text.replace(/<b>|<\/b>|<i>|<\/i>|<u>|<\/u>/g,'').trim();
}


module.exports = router;