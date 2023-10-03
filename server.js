const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
require('dotenv').config();
const route = require("./route");

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended :true}))

app.use(cors());
app.use(express.static(path.join(__dirname, 'build')));
app.use('/movies',route)

app.listen(process.env.PORT,'0.0.0.0',()=>{
    console.log('server listening',`${process.env.PORT}`);
});
