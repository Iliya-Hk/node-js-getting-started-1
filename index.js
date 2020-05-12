/*
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

express()
    .use(express.static(path.join(__dirname, "/")))
    //.set('views', path.join(__dirname, 'views'))
    //.set('view engine', 'ejs')
    .get("/", (req, res) => res.send("./index.html"))
    .listen(PORT, () => console.log(`Listening on ${ PORT }`))
*/

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const port = 3000;
const app = express();
const http = require('http').Server(app);

const io = require('socket.io')(http);

const db = require('./.dbConfigs');

const connectionUrl = `mongodb+srv://${db.username}:${db.password}@${db.dbUri}`;

mongoose.connect(connectionUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (err) => {
    if (err) {
        throw err;
    }
    console.log('DB connection successful');
});

const MessageStructure = mongoose.model('messages', {
    name: String,
    text: String,
});

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.get('/messageEndpoint', (request, response) => {
    MessageStructure.find({}, (err, allMessages) => {
        if (err) {
            response.sendStatus(500);
        }
        response.send(allMessages);
    });
});

app.post('/messageEndpoint', (request, response) => {
    const messageObject = new MessageStructure(request.body);
    messageObject.save((err) => {
        if (err) {
            response.sendStatus(500);
        }
        io.emit('messageIncome', request.body);
        response.sendStatus(200);
    });
});

io.on('connection', (socket) => {
    console.log('a user connected');
});

http.listen(port, () => {
    console.log(`server is running on the port ${port}`);
});