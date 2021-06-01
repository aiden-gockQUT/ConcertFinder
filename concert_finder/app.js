// Router locations
const spotifyRouter = require('./routes/spotify');
const seatgeekRouter = require('./routes/seatgeek');

// Required modules
const express = require('express');
const exphbs = require('express-handlebars');

const app = express(); // The server

const port = 3000;

app.engine('hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs',
}));
app.set('view engine', 'hbs');

app.get('/', (req, res) => {
    res.render('home.hbs');
});

// Redirect artist name to spotify router
app.get('/artist-name', function(req, res){ 
    res.redirect('/artist/'+ req.query.artist);
});


// Redirect search requests to external routers
app.use('/artist',spotifyRouter); // Spotify endpoints
app.use('/related-artists',seatgeekRouter); // Seatgeek endpoints

app.use(express.static(__dirname + '/public')); // So css file can be used

app.listen(port, function () {
    console.log(`Express app listening at http://localhost:${port}/`);
});
