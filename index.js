require('dotenv').config();

const express = require('express');
const { create } = require('express-handlebars');
const { knex } = require('./db');

const PORT = process.env.PORT || 3001;

const app = express();

/**
 * Handlebars setup.
 */
const hbs = create({});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Add requried middlewares like cors, helmet etc.


/**
 * App routes.
 */
app.get('/', (req, res) => {
  res.render('home');
});


/**
 * Check database connection and start the server.
 */
knex.raw('select 1+1 as result').then(() => {
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
}).catch((err) => {
  console.log(err);
  process.exit(1);
});

