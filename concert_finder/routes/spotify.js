// Required modules
const express = require('express');
const request = require('request');

const router = express.Router(); // The spotify router

const client_id = '3f70f9008ede485ab696d43075baaf5f'; // Client ID
const client_secret = 'd22304015c8541b186ed0c0f798797b3'; // Secret ID

// Routing for when related artists requested from home page
router.get('/:artist', (req, res) => {
    // Getting token from spotify
    // Authorisation Options
    var test;
    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {
        'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
        },
        form: {
        grant_type: 'client_credentials'
        },
        json: true
    };

    // Request authorisation to the Spotify API
    request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            const token = body.access_token;
            test = token;
            //----------------------------------------------------------------------------------//
            // Parameters required to access search endpoint
            var options = {
                url: 'https://api.spotify.com/v1/search/?query=' + req.params.artist + '&type=artist',
                headers: {
                'Authorization': 'Bearer ' + token
                },
                json: true
            };
            // Retrieve the search data (body) from the search endpoint
            request.get(options, function(error, response, body) {
                if (body.artists.items.length > 0) {
                    const artistID = body.artists.items[0].id;
                    if (body.artists.items[0].images.length > 0) { // Make sure artist has images
                        var artistImg = body.artists.items[0].images[0].url;
                    } else {var artistImg;}
                    const artistName = body.artists.items[0].name;
                    //------------------------------------------------------------------------------//
                    // Parameters required to access related-artists endpoint
                    var options2 = {
                        url: 'https://api.spotify.com/v1/artists/' + artistID + '/related-artists',
                        headers: {
                        'Authorization': 'Bearer ' + token
                        },
                        json: true,
                    };
                    // Retrieve the related-artists data from the related-artists endpoint
                    request.get(options2, function(error, response, body) {    
                        var artist_array = [];
                        artist_array.push({name: artistName, img: artistImg, spotify_token: token});
                        
                        for (let i = 0; i < body.artists.length -1; i++) {
                            var name = body.artists[i].name;
                            if (body.artists[i].images.length > 0) { // Make sure artist has images
                                var img = body.artists[i].images[0].url;
                            } else {
                                var img;
                            }
                            artist_array.push({name: name, img: img, spotify_token: token});
                        }
                        res.render('related-artists', {artist_array});
                    });
                    //------------------------------------------------------------------------------//
            //--------------------------------------------------------------------------------------//
                } else { // If no artist was found
                        res.redirect('/');
                }
            });
        }
    });
});

// Routing for when artist information requested from related-artists page
router.get('/:artist/artist-information/:token', (req, res) => {
    const token = req.params.token;
    const artist = req.params.artist;
    // Parameters required to access search endpoint
    var options = {
        url: 'https://api.spotify.com/v1/search/?query=' + artist + '&type=artist',
        headers: {
        'Authorization': 'Bearer ' + token
        },
        json: true
    };
    // Retrieve the search data (body) from the search endpoint
    request.get(options, function(error, response, body) {
        if (!body.error){
            
            if (body.artists.items.length > 0) {
                // Get the artist ID and Name
                artistID = body.artists.items[0].id;
                artistName = body.artists.items[0].name;
            //------------------------------------------------------------------------------//
                // // Parameters required to access top-tracks endpoint
                var options2 = {
                    url: 'https://api.spotify.com/v1/artists/' + artistID + '/top-tracks?country=AU',
                    headers: {
                    'Authorization': 'Bearer ' + token
                    },
                    json: true,
                };
                // Retrieve the data from the top-tracks endpoint
                request.get(options2, function(error, response, body) {    
                    //var name = body.artists[0].name;
                    var track_options = {
                        track_array: '',
                        artist_name2: artistName,
                        error_message: ''
                    }
                    var trackArray = [];
                    for (let i = 0; i < body.tracks.length; i++) {
                        var name = body.tracks[i].name;
                        var preview = body.tracks[i].preview_url;
                        trackArray.push({track_name: name, track_preview: preview, track_number: i+1});
                    }
                    track_options.track_array = trackArray;
                    res.render('artist-info', track_options);

                });
            //------------------------------------------------------------------------------//
        //----------------------------------------------------------------------------------//
            } else {
                res.render('error-page', {error_message: "Artist can't be found :("});
            }
        } else { // Invalid token or token expired
            res.render('error-page', {error_message: body.error.message});
        }
    });
});

module.exports = router;


