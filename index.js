require('dotenv').config();

const express = require('express');
const { create } = require('express-handlebars');
const tables = require('./constants/tables');
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
app.get('/', async (req, res) => {
  try {
    const data = await knex(tables.sites)
      .select([
        `${tables.sites}.id as site_id`,
        `${tables.sites}.title as site_title`,
        knex.raw(`(
          select array_agg(
            jsonb_build_object(
              'month', to_char(month, 'YYYY-MM'), 'avg_revenue', avg_revenue, 'deal_count', numlist
            )
          ) as deals_data from (
            select date_trunc('month', d.listing_date) as month, avg(d.revenue) as avg_revenue, count(*) as numlist
            from ${tables.deals} d
            where d.site_id = ${knex.ref(`${tables.sites}.id`)}
            and d.listing_date > '2020-10-31'
            and d.listing_date < '2021-12-1'
            group by date_trunc('month', d.listing_date)
          ) deals
        )`),
      ])
      .leftJoin(
        tables.deals,
        `${tables.sites}.id`,
        `${tables.deals}.site_id`,
      )
      .where((builder) => {
        builder
          .where(`${tables.deals}.listing_date`, '>', '2020-10-31')
          .andWhere(`${tables.deals}.listing_date`, '<', '2021-12-1');
      })
      .orderBy(`${tables.sites}.id`)
      .groupBy(`${tables.sites}.id`);

    res.render('home', {
      data: JSON.stringify(data),
    }); 
  } catch (error) {
    // TODO - send error response or render error page.
    console.error(error); 
  }
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
