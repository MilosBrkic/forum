const express = require('express');
const router = express.Router();
const db = require('../db/');
const isLogged = require('../middleware');

// get all threads
router.get("/", (req, res) => {
    db.query('SELECT * FROM thread',(err, result) => {
        res.send(result);
    });
});



const getByIdquery = 'SELECT thread.id as thread_id, thread.title, post.id, post.text, post.date, users.username as user, users.message_count, users.avatar, subforum.name as subforum ' +
 'FROM subforum JOIN thread ON subforum.id = thread.subforum_id LEFT JOIN post ON thread.id = post.thread JOIN users ON users.id = post.user_id WHERE thread.id = $1 ORDER BY post.date';

var numPost = 10; //number of posts per page

//view thread
router.get("/:id", async (req, res) => {   
    var result = await db.query(getByIdquery, [req.params.id]);
    var pagePosts = result.rows.slice(0 , numPost);
    var lastPage = Math.ceil(result.rows.length / numPost);
    res.render('threads/view', {posts : pagePosts, page : 1, lastPage: lastPage});
});

//get custom page
router.get("/:id/page-:page", async (req, res) => {   
    var result = await db.query(getByIdquery, [req.params.id]);
    var page = req.params.page;
    var lastPage = Math.ceil(result.rows.length / numPost);
    if(page > 0 && page <= lastPage){
        pagePosts = result.rows.slice(numPost * (page-1) , numPost * page);
        res.render('threads/view', {posts : pagePosts, page : page, lastPage: lastPage});
    }
    else{         
        res.redirect(`/threads/${req.params.id}/page-${lastPage}`);
    }
});


// add thread
router.post("/add", isLogged, async (req, res) => {
    if(!req.body.text || !req.body.title || !req.user || !req.body.subforum){
        req.flash('error','Error');
        return res.redirect('back');
    }
    if(req.body.text.replace(/<b>|<\/b>|<i>|<\/i>|<u>|<\/u>/g,'').trim() == ""){
        req.flash('error','Invalid message');
        return res.redirect('back');
    }


    try{
        var result = await db.query('INSERT INTO thread (title, subforum_id) VALUES ($1, $2) returning id', [req.body.title, req.body.subforum])

        await db.query('INSERT INTO post (text, thread, user_id) VALUES ($1, $2, $3)', [
            req.body.text,
            result.rows[0].id,
            req.user.id           
        ]);
        await db.query('UPDATE users SET message_count = message_count + 1 WHERE id = $1', [req.user.id]);
        return res.redirect('/threads/'+result.rows[0].id);       
    }
    catch(err){
        console.log(err);
        res.redirect('../');
    }
});

//delete thread
router.get("/:id/delete", isLogged ,async (req, res) => {    
    try{
        if(req.user.status == 'admin'){
            var result = await db.query('DELETE FROM thread WHERE id = $1 RETURNING subforum_id', [req.params.id]);
            console.log(result.rows);
            result = await db.query('SELECT name FROM subforum WHERE id = $1', [result.rows[0].subforum_id]);
            console.log(result.rows);
            res.redirect(`/subforum/${result.rows[0].name}`);
            //res.redirect(`/`);
        }
        else{
            req.flash('error','You do not have permission for this action');
            res.redirect('back');
        }
    }
    catch(err){
        console.log(err);
        req.flash('error','Thread was not removed');
        res.redirect('back');
    }
});


module.exports = router;