const MongoClient = require('mongodb').MongoClient;

const used = ['', 'url', 'url_response'];
const mongoAddress = 'mongodb://localhost:27017';

exports.getURL = (req, res, next) => {
    var senthex = req.query.hex;
    var err = req.query.err;
    res.render('url', {hex : senthex, error : err});
};

exports.urlResponse = (req, res, next) => {
    var requestURL;
    if (!req.body.url.startsWith('http://') && !req.body.url.startsWith('https://')) {
        requestURL = 'http://' + req.body.url;
    } else {
        requestURL = req.body.url;
    }
    var db = null;
    var hex;
    var possibleUsed;
    MongoClient.connect(mongoAddress, { useNewUrlParser: true }, (err,client) => {
        db = client.db('website');
        if (req.body.custom == 'on') {
            hex = req.body.custom_url;
            if (used.indexOf(hex) == -1) {
                db.collection('url').find({ _url : hex }).toArray((err, out) => {
                    if(out.length == 0) {
                        db.collection('url').insertOne({ _url : hex, _redirect : requestURL, _date : new Date() }, () => {
                            client.close();
                        });
                        res.redirect('/url?hex=' + hex);
                    } else {
                        res.redirect('/url?err=inuse');
                        client.close();
                    }
                });
            } else {
                res.redirect('/url?err=inuse');
                client.close();
            }
        } else {
            var i = true;
            while (i) {
                hex = Math.random().toString(36).substr(2, 5);
                possibleUsed = db.collection('url').find({ _url : hex });
                if(possibleUsed.count != undefined) {
                    db.collection('url').insertOne({ _url : hex, _redirect : requestURL, _date : new Date() }, () => {
                        client.close();
                    });
                    i = false;
                    res.redirect('/url?hex=' + hex);
                }
            }
        }
    });
};

exports.incomingFilter = (req, res, next) => {
    var db = null;
    MongoClient.connect(mongoAddress, { useNewUrlParser: true }, (err,client) => {
        db = client.db('website');
        db.collection('url').find({ _url : req.url.substring(1) }).toArray((err, out) => {
            if(out.length != 0) {
                res.redirect(out[0]._redirect);
            } else {
                res.status(404).send('<h1>Page not Found</h1>');
            }
            client.close();
        });
    });
};