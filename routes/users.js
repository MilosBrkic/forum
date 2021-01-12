const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../db/');
const path = require('path');
const isLogged = require('../middleware');

//show registration page
router.get('/register', (req,res) => {
    res.render('users/register');
});

//submit registration
router.post('/register', async (req, res) => {
    if(!req.body.username || !req.body.password){
        req.flash('error','Enter username and password');
        return res.redirect('register');
    }
    if(req.body.username.match('"')){
        req.flash('error','Sign " cannot be part of username');
        return res.redirect('register');
    }

    try{
        var result = await db.query('SELECT count(*) as num FROM users WHERE username = $1', [req.body.username]);
        if(result.rows[0].num > 0){
            req.flash('error',`Username "${req.body.username}" is already in use`);
            return res.redirect('register');
        }
        
        bcrypt.hash(req.body.password, 10).then(async function(hash) {       
            await db.query('INSERT INTO users (username, password) VALUES ($1, $2)', [
                req.body.username,
                hash
            ]);
            req.flash('message','Registration was success.');                
            return res.redirect('login');           
        });
            
    }
    catch(err){
        res.redirect('register');
    }
});


//show login page
router.get('/login', (req, res) => {
    res.render('users/login');
});

//submit login
router.post('/login', passport.authenticate('local', { successRedirect: '../', failureRedirect: 'login', failureFlash : true}));

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('../');
});

/*
router.get('/image', (req, res) => {
    res.sendFile(path.resolve('../Forum/views/users/image/default.jpg'));
});*/

//show user profile
router.get('/:username/view', async (req, res) => {
    var result = await db.query('SELECT * FROM users WHERE username = $1', [req.params.username]);
    res.render('users/view', {user: result.rows[0]});
});

//submit new password
router.post('/changePassword', async (req, res) => {
          
    var result = await db.query('SELECT * FROM users WHERE username = $1', [req.user.username]);

    if(result.rows.length > 0){
        bcrypt.compare(req.body.old_password, result.rows[0].password, async function(err, isMatch) {               
            if(isMatch){
                var hash = await bcrypt.hash(req.body.new_password, 10);
                await db.query('UPDATE users SET password = $1 WHERE username = $2', [hash, req.user.username]); 
                req.flash('message','Password was successfully changed');               
            }
            else
                req.flash('error','Changeing of password failed. Make sure you enter the current  password correctly.');

            return res.render('users/view', {user: result.rows[0]});
        });  
    }
    else
        res.redirect('../'); 
});

//submit new avatar
router.post('/changeAvatar',isLogged, async (req, res) => {
    try{
        await db.query('UPDATE users SET avatar = $1 WHERE username = $2', [req.body.avatar, req.user.username]);
        req.flash('message','Avatar URL was successfully changed.');  
    }
    catch(err){
        req.flash('error','Changing of avatar failed. Max length of URL is 150 characters.');       
    }
    res.redirect(`${req.user.username}/view`);
});

//show all users
router.get('/all', async (req, res) => {
    var result = await db.query('SELECT username FROM users');
    console.log(result.rows);
    res.render('users/all', {users: result.rows});
});

module.exports = router;