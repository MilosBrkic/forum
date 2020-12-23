const express = require('express');
const router = express.Router();
const db = require('../db/');
//const isLogged = require('../app');

/*router.get("/:id", (req, res) => {
    db.query('SELECT * FROM post WHERE thread = ?', req.params.id, (err, result) => {
        res.json(result);
    });
    /*if(!req.body.title){
        res.status(400).json({ error: "Neipravan unos"});
        return;
    }

    var post = {
        title: req.body.title
    };
    db.query('INSERT INTO thread SET ?', post, (err, res) => {
        console.log("Inserted");
    });*/

 
    //res.render("index");
//}); */


router.post("/add", async (req, res) => {
    if(!req.body.text || !req.body.thread || !req.user){
        req.flash('error','Greska');
        return res.redirect(`../threads/${req.body.thread}/page-0`);
    }
    if(filterText(req.body.text) == ""){
        req.flash('error','Neispravna poruka');
        return res.redirect(`../threads/${req.body.thread}/page-0`);
    }

    
    try{
        var result = await db.query('INSERT INTO post (text, thread, user_id) VALUES($1, $2, $3)', [
            req.body.text,
            req.body.thread,
            req.user.id
        ]);
        console.log("inserted");
        await db.query('UPDATE users SET message_count = message_count + 1 WHERE id = $1', [req.user.id]);

        return res.redirect(`../threads/${req.body.thread}/page-0`);
    } 
    catch(err){
        console.log(err);
    }
}); 

function filterText(text){
    return text.replace(/<b>|<\/b>|<i>|<\/i>|<u>|<\/u>/g,'').trim();
}


module.exports = router;