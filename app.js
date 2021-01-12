const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('express-flash')
const passport = require('passport');
const bcrypt = require('bcrypt');
const localtStrategy = require('passport-local').Strategy;
const db = require('./db');


const app  = express();
const port = process.env.PORT || 3000;


app.use('/public', express.static('public'));
app.use(express.json());
app.use(require('cookie-parser')());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
    secret: "forum",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());


passport.use(new localtStrategy( async (username, password, done) => {
    var result = await db.query('SELECT * FROM users WHERE username = $1', [username]);  
    if(result.rows[0] == null)
        return done(null, false, { message: 'Pogresno korisnicko ime' });       
    bcrypt.compare(password, result.rows[0].password, function(err, isMatch) {               
        if(isMatch)
            return done(null, result.rows[0]);                 
        else
            return done(null, false, { message: 'Pogresna lozinka' });    
    });                              
}));

passport.serializeUser((user, done) => {
    return done(null, user.id);
});
passport.deserializeUser( async(id, done) => {
    var results =  await db.query('SELECT * FROM users WHERE id = $1', [id])
    return done(null, results.rows[0]);
});

//returns user to each page
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
})

//routes
app.use("/", require('./routes/index'));
app.use("/subforum", require('./routes/subforums'));
app.use("/threads", require('./routes/threads'));
app.use("/posts", require('./routes/posts'));
app.use("/users", require('./routes/users'));

app.set('view engine', 'ejs');




app.listen(port, () => {
    console.log(`Server has started on port ${port}`);
});

//npm start app.js