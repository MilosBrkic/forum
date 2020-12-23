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



//new thread view
router.get("/new", isLogged, (req, res) => {
    res.render('threads/new');
});

const getByIdquery = 'SELECT thread.id as thread_id, thread.title, post.text, post.date, users.username as user, users.message_count, users.avatar FROM thread LEFT JOIN post ON thread.id = post.thread JOIN users ON users.id = post.user_id WHERE thread.id = $1 ORDER BY post.date';
//get first page from thread
/*router.get("/:id", (req, res) => {
    console.log("=============== get");
    
    db.query(getByIdquery, [req.params.id] ,(err, result) => {
        pagePosts = result.rows.slice(0 , 10);
        console.log(result);
        console.log(err);
        consol.log("yea");
        var lastPage = Math.ceil(result.rows.length / 10);
        res.render('threads/view', {posts : pagePosts, page : 1, lastPage: lastPage});
        //console.log(err);
    });
    
    
    console.log("==========ned");
});*/
var numPost = 10; //number of posts per page

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
router.post("/add", async (req, res) => {
    if(!req.body.text || !req.body.title || !req.user){
        req.flash('error','Greska');
        res.redirect('new');
        return;
    }
   
    try{
        var result = await db.query('INSERT INTO thread (title) VALUES ($1) returning id', [req.body.title])

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
        return;
    }
});


module.exports = router;