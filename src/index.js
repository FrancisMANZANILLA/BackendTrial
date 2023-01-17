const express = require('express');
const app = express();
const pgp = require('pg-promise')();
const db = pgp('postgres://postgres:fmanza1&@localhost:5432/SearchTest')


const QueryResultError = pgp.errors.QueryResultError;
const qrec = pgp.errors.queryResultErrorCode;


app.get('/search/:term', (req, res, next) => {
    let searchterm = req.params.term;
    if (searchterm.length < 3) {
        res.status(400)
        return res.json({ message: "Search term requires at least 3 characters" });
    }
    var request = `SELECT *, ts_rank_cd(to_tsvector(content), query,0) AS rank FROM public."Posts", phraseto_tsquery(\'${searchterm}\') query WHERE setweight(to_tsvector(title), \'A\') || setweight(to_tsvector(content:: jsonb -> \'body\'), \'B\') @@ query ORDER BY rank DESC;`
    
    db.many(request)
        .then(function (data) {
            res.status(200)
                .json({
                    data: data,
                })
        })
        .catch(function (err, e) {
            if (err instanceof QueryResultError) {

                if (err.code === qrec.noData) {
                    return res.json({ message: "No matches" });
                }
                console.log(err);
            }
            return next(err);
        });
})



app.listen(3000, () => { console.log('App running on 3000') });