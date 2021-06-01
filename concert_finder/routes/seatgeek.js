
// axios version - simplifies above code
const express = require('express');
const router = express.Router();

const request = require('request'); // "Request" library
const client_id = 'MjEyNzEzOTh8MTU5OTgxOTQ3Ny43NzE2MjQ4'; // Your client id

  
//router.use(logger('tiny'));

router.get('/:artist/:token', (req, res) => {
    const token = req.params.token;
    // Replace whitespace with "-" (correct format for seatgeek API)
    const artistName = req.params.artist;
    const artistNameClean = artistName.replace(/\s/g, '-');
    const artistNameClean2 = artistNameClean.replace(/&/g, 'and', )
    const artistNameClean3 = artistNameClean2.replace("'", '-')

    const url = 'https://api.seatgeek.com/2/events?performers.slug=' + artistNameClean3 + '&format=json&client_id=' +  client_id;

    request.get(url, function(error, response, body) {    
        
        var obj = JSON.parse(body);
        var options = {
                message: '',
                artist_name: artistName,
                event_info: '',
                spot_token: token
        };

        if (typeof obj.status !== 'undefined') { // There was an error in the request
            options.message = obj.message;
            res.render('error-page', options);

        } else if (obj.events.length == 0) { // No events
            options.message = "There are no scheduled events for this performer";
            res.render('error-page', options);

        } else { // There are events listed
            var eventInfo = [];
            var numEvents = 0;
            for (let i = 0; i < obj.events.length; i++) { // Go through each event
                if (obj.events[i].stats.listing_count > 0) { // Tickets available for current event
                    var title = obj.events[i].title;
                    var location = obj.events[i].venue.name + ", " + obj.events[i].venue.city + " " + obj.events[i].venue.country;
                    var date = obj.events[i].datetime_local.slice(0,10);
                    var tickets = obj.events[i].stats.listing_count;
                    var price = obj.events[i].stats.lowest_price;
                    var url = obj.events[i].url;
                    var performers = [];
                    for (let j = 0; j < obj.events[i].performers.length; j++) { // Go through each event
                        var test = obj.events[i].performers[j].name
                        performers.push({performers: test, token: token});
                    }
                    eventInfo.push({title: title, location: location, date: date, tickets: tickets, price: price, url: url, test: performers});
                    numEvents ++;
                }
            }
            options.event_info = eventInfo;
            if (numEvents == 0 ){ // Artist performing but sold out
                options.message = "There are no tickets available for this artist :("
                res.render('error-page', options);
            } else { // Artist performing at minimum 1 event with available tickets
                res.render('artist-events', options);
            }
        }
    });

});


module.exports = router;




