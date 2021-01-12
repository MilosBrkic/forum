const express = require('express');
const router = express.Router();
const db = require('../db/');


//index page
router.get("/", async (req, res) => {
    var result = await db.query('SELECT subforum.name, subforum.description, count(DISTINCT thread.id) as threadcount, count(post.id) as postcount FROM subforum LEFT JOIN thread ON subforum.id = thread.subforum_id LEFT JOIN post ON thread.id = post.thread GROUP BY subforum.name, subforum.description');
    //console.log(result.rows);
    res.render('index', {forums: result.rows});
});


module.exports = router;