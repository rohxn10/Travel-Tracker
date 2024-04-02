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
  // console.log(result.rows);
   res.render("index.ejs", {countries: countries, total: countries.length})
});

app.post("/add", async (req, res)=>{
    const country= req.body["country"];
    try{
      const result = await db.query(
        "SELECT country_code FROM countries WHERE country_name = $1",
        [country]);
        const data= result.rows[0];
        const countryCode= data.country_code;
        try{
          const result= await db.query(
            "SELECT * FROM visited_countries WHERE country_code = $1",
            [countryCode])
          } catch{
            const countries= await checkVisited();
            res.render("index.ejs", {countries: countries, total: countries.length, error: "Country already added!"}) 
          };
        }catch{
          const countries= await checkVisited();
          res.render("index.ejs", {countries: countries, total: countries.length, error: "Country not found!"})
        }
    }
    

)

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
