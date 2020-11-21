'use strict';

const Tortoise = require('tortoise');

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

module.exports = {
	name: 'job',

	/**
	 * Settings
	 */
	settings: {
		amqp: {
			url: 'amqp://rabbitmq:rabbitmq@localhost/test',
			options: {
				connectRetries: -1
			},
			exchange: 'x-response',
			dead: 'x-dead-response'
		},
		jobs: [
			{
				route: '500',
				name: 'job1',
				method: 'job1'
			},
			{
				route: '501',
				name: 'job2',
				method: 'job2'
			},
			{
				route: '502',
				name: 'job3',
				method: 'job3'
			}
		]
	},

	/**
	 * Dependencies
	 */
	dependencies: [],

	/**
	 * Actions
	 */
	actions: {

		/**
		 * Say a 'Hello' action.
		 *
		 * @returns
		 */
		job1: {
			async handler (ctx) {
				this.logger.info('Processing job 1', ctx.params.msg);
				await new Promise((resolve, reject) => setTimeout(resolve, Math.random() * 5000));

				return true;
			}
		},

		job2: {
			async handler (ctx) {
				this.logger.info('Processing job 2', ctx.params.msg);
				await new Promise((resolve, reject) => setTimeout(resolve, Math.random() * 5000));

				return true;
			}
		},

		job3: {
			async handler (ctx) {
				this.logger.info('Processing job 3', ctx.params.msg);
				await new Promise((resolve, reject) => setTimeout(resolve, Math.random() * 5000));

				return true;
			}
		}
	},

	/**
	 * Events
	 */
	events: {

	},

	/**
	 * Methods
	 */
	methods: {

	},

	/**
	 * Service created lifecycle event handler
	 */
	created () {
		this.tortoise = new Tortoise(this.settings.amqp.url, this.settings.amqp.options);
	},

	/**
	 * Service started lifecycle event handler
	 */
	async started () {
		this.tortoise
			.on(Tortoise.EVENTS.CONNECTIONCLOSED, () => {
				this.logger.error('Tortoise connection is closed');
			})
			.on(Tortoise.EVENTS.CONNECTIONDISCONNECTED, (error) => {
				this.logger.error('Tortoise connection is disconnected', error);
			})
			.on(Tortoise.EVENTS.CONNECTIONERROR, (error) => {
				this.logger.error('Tortoise connection is error', error);
			});

		await Promise.all(this.settings.jobs.map((job) => {
			return this.tortoise
				.queue(job.name, { durable: true })
				.exchange(this.settings.amqp.exchange, 'direct', job.route, { durable: true })
				.prefetch(1)
				.subscribe(async (msg, ack, nack) => {
					try {
						await this.broker.call(`${this.name}.${job.method}`, { msg, ack, nack });
						ack();
					} catch (error) {
						this.logger.error('Job processing has error', error);
						nack(true);
					}
				});
		}), this);
	},

	/**
	 * Service stopped lifecycle event handler
	 */
	async stopped () {
		// await this.tortoise.destroy();
	}
};
