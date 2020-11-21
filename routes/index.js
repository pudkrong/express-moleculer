'use strict';

const express = require('express');
const router = express.Router();
const _ = require('lodash');

/* GET home page. */
router.get('/', async function (req, res, next) {
	try {
		const broker = req.app.locals.broker;
		const r = await broker.call('queue.createJob', { name: req.query.name, payload: { m: 'h' } });
		console.log(r);
		res.render('index', { title: 'Express' });
	} catch (error) {
		console.error(error);
		res.status(500).end();
	}
});

router.get('/load', async function (req, res) {
	try {
		const broker = req.app.locals.broker;
		const data = ['500', '501', '502'];
		for (let i = 0; i < 100; i++) {
			const index = Math.floor(Math.random() * data.length);
			const route = data[index];
			const result = await broker.call('rule.classify', { code: route });
			broker.logger.info(result);
			if (result) {
				await broker.call('queue.createJob', { name: result.type, payload: _.extend(result.params.payload, { ori_m: i })});
			}
		}
		res.json({ success: true });
	}	catch (error) {
		console.error(error);
		res.status(500).end();
	}
});

module.exports = router;
