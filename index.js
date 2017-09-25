const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const luhn = require ('luhn');
const cards = require('cards');

const app = express();
const filename = './source/cards.json';

app.use(express.static('public'));
app.use(bodyParser.json())

app.get('/', (req, res) => {
	res.send(`<!doctype html>
	<html>
		<head>
			<link rel="stylesheet" href="/style.css">
		</head>
		<body>
			<h1>Hello Smolny!</h1>
		</body>
	</html>`);
});

app.get('/error', (req, res) => {
	throw Error('Oooops!');
});

app.get('/transfer', (req, res) => {
	const {amount, from, to} = req.query;
	res.json({
		result: 'success',
		amount,
		from,
		to
	});
});


app.get ('/cards', (req, res) => {
	cards.getFile(filename, res, (cards) =>{
		res.json(cards);
	})
});

app.post('/cards', (req, res, next) => {
	cards.getFile(filename, res, next, (cards) =>{
		const balance = req.body.balance || 0;
		const cardNumber = req.body.cardNumber.toString();
		const valid = luhn.validate(cardNumber);
		if (valid){
			const addCard = {cardNumber, balance};
			console.log(addCard);
			cards.push(addCard);
			writeFile(filename, cards, next, (err) => {
				if (!err){
					res.statusCode = 200;
					res.json(addCard);
				}
			})
		}
		else {
			res.statusCode = 400;
			res.end("Card number is not Luhn-valid")
		}
	})
});

app.delete('/cards/:id', (req, res, next) =>{
	cards.getFile(filename, res, (cards) =>{
		const id = req.params.id;
		if (id < cards.length) {
			cards.splice(id, 1);
			writeFile(filename, cards, next, (err) =>{
				if (!err){
					res.statusCode = 200;
					res.end("Successfully deleted");
				}
			})

		}
		else {
			res.statusCode = 404;
			res.end("Card not found");
		}
	})
})

app.use(function(err,req,res,next) {
	console.log(err.stack);
	res.status(500).send({"Error" : err.stack});
});

app.listen(3000, () => {
	console.log('YM Node School App listening on port 3000!');
});
