const express = require('Express')

const routes = require('./routes')
const cors = require('cors');
const app = express();
const port = 8081;

app.use(cors());
app.use(express.json());
app.use(routes);
app.use(express.static('public'));


app.listen(port, () => {
    console.log('Server on at port ' + port)
})