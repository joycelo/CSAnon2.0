const request = require('superagent');
const { Pool } = require('pg');

// was causing authentication errors with the connectionString for some reason
// needed the information added explicitly
const db = new Pool({
  // user: <db username>,
  // password: <db password>,
  // host: <db host>,
  // database: <database name>,
  // port: <port>,
});

const baseUrl = 'https://pokeapi.co/api/v2/';
let currentID = 1

request
  .get(`${baseUrl}pokemon?limit=1000`)
  .set('Accept', 'application/json')
  .then(async (res) => {
    res.body.results.map((pokemon) => {
      // THERE'S A WEIRD JUMP FROM 807 TO 10001
      if (currentID === 808) currentID = 10001
      pokemon.sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${currentID}.png`;
      currentID++
      return pokemon;
    });


    const pokemonList = res.body.results;
    let stars = '*'

    for (let i = 0; i < pokemonList.length; i++) {
      if (i % 25 === 0) console.log(stars += "*")
      const { sprite, name } = pokemonList[i];
      const queryString = `UPDATE users SET pic_url = '${sprite}', username = '${name}' WHERE username = '${name}';`;
      await db.query(queryString);
    }
    console.log('Pokemon added to database.');
  });
