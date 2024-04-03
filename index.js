import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db= new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "roberg10",
  port: 5432,
})
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function checkVisited(){
  const result= await db.query("SELECT country_code FROM visited_countries");
  // console.log(result.rows);
  let countries = [];
  result.rows.forEach( (country)=>{
    countries.push(country.country_code);
  });
  return countries;

}

app.get("/", async (req, res) => {
  const countries= await checkVisited();
  console.log(countries);
   res.render("index.ejs", {countries: countries, total: countries.length})
});

app.post("/add", async (req, res)=>{
    const country= req.body["country"];
    try{
      const result = await db.query(
        "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
        [country.toLowerCase()]);
        const data= result.rows[0];
        const countryCode= data.country_code;
        
        try{
          const vcountries= await db.query(
            "SELECT * FROM visited_countries WHERE country_code = $1",
            [countryCode]);            
          await db.query("Insert into visited_countries(country_code) values($1)",[countryCode]);
          console.log("Country added!");
          res.redirect("/");
            
          } catch(err){
            // console.log(err);
            const countries= await checkVisited();
            res.render("index.ejs", {countries: countries, total: countries.length, error: "Country already added!"}) 
          };
        }catch(err){
          // console.log(err);
          const countries= await checkVisited();
          res.render("index.ejs", {countries: countries, total: countries.length, error: "Country not found!"})
        }
    });

app.post("/remove",async (req,res)=>{
  const country = req.body["country"];
  try{
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [country.toLowerCase()]);
      const data= result.rows[0];
      const countryCode= data.country_code;

      try{
        db.query("Delete from visited_countries where country_code=$1",[countryCode]);
        res.redirect("/");
      }catch(err){
        // console.log(err);
        const countries= await checkVisited();
        res.render("index.ejs", {countries: countries, total: countries.length, error: "Country not highlighted"})
      }
  }catch(err){
    // console.log(err);
    const countries= await checkVisited();
    res.render("index.ejs", {countries: countries, total: countries.length, error: "Country not found!"})
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
