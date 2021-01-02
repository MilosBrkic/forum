const express = require('express');
const router = express.Router();
const db = require('../db/');
const isLogged = require('../middleware');







//index page
/*router.get("/", (req, res) => {
    db.query('SELECT count(post.id) as postCount, MAX(post.date) as lastPost, thread.id as id, thread.title from post JOIN thread on post.thread = thread.id GROUP by thread.id, thread.title ORDER BY lastPost DESC',(err, result) => {
        res.render('index', {threads: result.rows});
    });   
});*/

//index page
router.get("/", async (req, res) => {
    var result = await db.query('SELECT subforum.name, count(DISTINCT thread.id) as threadcount, count(*) as postcount FROM subforum JOIN thread ON subforum.id = thread.subforum_id JOIN post ON thread.id = post.thread GROUP BY subforum.name');
    console.log(result.rows);
    res.render('index', {forums: result.rows});
});


router.get("/subforum/:name", async (req, res) => {
    console.log(req.params.name);
    var subforum =  await db.query('SELECT * FROM subforum WHERE name = $1', [req.params.name]);
    console.log(subforum.rows);
    //var result = await db.query('SELECT count(post.id) as postCount, MAX(post.date) as lastPost, thread.id as id, thread.title, subforum.name as subforum from post JOIN thread on post.thread = thread.id RIGHT JOIN subforum ON thread.subforum_id = subforum.id WHERE subforum.id = $1 GROUP by thread.id, thread.title, subforum.name  ORDER BY lastPost DESC',[req.params.id]);
    if(subforum.rows.length > 0){
        var result = await db.query('SELECT count(post.id) as postCount, MAX(post.date) as lastPost, thread.id as id, thread.title from post JOIN thread on post.thread = thread.id  WHERE thread.subforum_id = $1 GROUP by thread.id, thread.title ORDER BY lastPost DESC',[subforum.rows[0].id]);
        console.log(result.rows);
        res.render('subforum/view', {threads: result.rows, subforum: subforum.rows[0]});
    }
        //console.log(err);
    else
        res.redirect('/');    
       
    
});

//new thread view
router.get("/subforum/:name/threads/new", isLogged, async (req, res) => {
    var result = await db.query('SELECT * FROM subforum WHERE name = $1', [req.params.name]);

    if(result.rows.length > 0)
        res.render('threads/new', {subforum: result.rows[0]});
    else
        res.redirect('/');  
});

module.exports = router;