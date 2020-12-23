const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../db/');
const path = require('path');
const isLogged = require('../middleware');

//prikaz stranice za registraciju
router.get('/register', (req,res) => {
    res.render('users/register');
});

router.post('/register', async (req, res) => {
    if(!req.body.username || !req.body.password){
        req.flash('error','Uneti korisnicko ime i lozinku');
        return res.redirect('register');
    }
    if(req.body.username.match('"')){
        req.flash('error','Znak " nije dozvoljen');
        return res.redirect('register');
    }

    try{
        var result = await db.query('SELECT count(*) as num FROM users WHERE username = $1', [req.body.username]);
        if(result.rows[0].num > 0){
            req.flash('error','Vec postoji korisnik sa ovim korisnickim imenom');
            return res.redirect('register');
        }
        
        bcrypt.hash(req.body.password, 10).then(async function(hash) {       
            await db.query('INSERT INTO users (username, password) VALUES ($1, $2)', [
                req.body.username,
                hash
            ]);              
            return res.redirect('login');           
        });
            
    }
    catch(err){
        res.redirect('register');
    }
});

//prikaz stranice za prijavu
router.get('/login', (req, res) => {
    res.render('users/login');
});


router.post('/login', passport.authenticate('local', { successRedirect: '../', failureRedirect: 'login', failureFlash : true}));

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('../');
});


router.get('/image', (req, res) => {
    res.sendFile(path.resolve('../Forum/views/users/image/default.jpg'));
});

router.get('/:username/view', async (req, res) => {
    var result = await db.query('SELECT * FROM users WHERE username = $1', [req.params.username]);
    res.render('users/view', {user: result.rows[0]});
});

router.post('/changePassword', async (req, res) => {
          
    var result = await db.query('SELECT * FROM users WHERE username = $1', [req.user.username]);

    if(result.rows.length > 0){
        bcrypt.compare(req.body.old_password, result.rows[0].password, async function(err, isMatch) {               
            if(isMatch){
                var hash = await bcrypt.hash(req.body.new_password, 10);
                await db.query('UPDATE users SET password = $1 WHERE username = $2', [hash, req.user.username]); 
                req.flash('message','Lozinka je promenjena');               
            }
            else
                req.flash('error','Greska u promeni lozinka. Proverite da li ste ispravno uneli lozinku.');

            return res.render('users/view', {user: result.rows[0]});
        });  
    }
    else
        res.redirect('../'); 
});

router.post('/changeAvatar',isLogged, async (req, res) => {
    try{
        await db.query('UPDATE users SET avatar = $1 WHERE username = $2', [req.body.avatar, req.user.username]);
    }
    catch(err){
        req.flash('error','Greska pri promeni avatara. Max duzina URL-a je 150 karaktera.');       
    }
    res.redirect(`${req.user.username}/view`);
});


module.exports = router;