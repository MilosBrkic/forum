const express = require('express');
const router = express.Router();
const db = require('../db/');
const isLogged = require('../middleware');


//new subforum view
router.get("/new", isLogged, (req, res) => {
    if(req.user.status == 'admin')
        res.render('subforum/new');
    else
        res.redirect('/');
});

//add subforum
router.post("/add", isLogged, async (req, res) => {
    try {
        if(req.user.status == 'admin'){
            if(req.body.name){
                await db.query('INSERT INTO subforum (name, description) VALUES ($1, $2)', [req.body.name, req.body.description]);
                req.flash('message',`Subforum ${req.body.name} added`);
            }
            else{
                req.flash('error','Name is required');
            }
            res.render('subforum/new');
        }       
        else
            res.redirect('/');
    } catch (err) {
        req.flash('error',err.message);
        res.redirect('back');
    }
    
});

//view subforum page
router.get("/:name", async (req, res) => {
    var subforum =  await db.query('SELECT * FROM subforum WHERE name = $1', [req.params.name]);

    if(subforum.rows.length > 0){
        var result = await db.query('SELECT count(post.id) as postCount, MAX(post.date) as lastPost, thread.id as id, thread.title from post JOIN thread on post.thread = thread.id  WHERE thread.subforum_id = $1 GROUP by thread.id, thread.title ORDER BY lastPost DESC',[subforum.rows[0].id]);
        res.render('subforum/view', {threads: result.rows, subforum: subforum.rows[0]});
    }
    else
        res.redirect('/');      
});


//delete subforum
router.get("/:name/delete", isLogged ,async (req, res) => {    
    try{
        if(req.user.status == 'admin')
            await db.query('DELETE FROM subforum WHERE name = $1', [req.params.name]);
        else
            req.flash('error','You do not have permission for this action');
        res.redirect('back');
    }
    catch(err){
        req.flash('error',err.message);
        res.redirect('back');
    }
});



//new thread view
router.get("/:name/threads/new", isLogged, async (req, res) => {
    //console.log('subforum view');
    var result = await db.query('SELECT * FROM subforum WHERE name = $1', [req.params.name]);

    if(result.rows.length > 0)
        res.render('threads/new', {subforum: result.rows[0]});
    else
        res.redirect('/');  
});


module.exports = router;