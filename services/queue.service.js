'use strict';

const Tortoise = require('tortoise');

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

module.exports = {
	name: 'queue',

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
		}
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
		createJob: {
			timeout: 1000, // Quick return error if something wrong on rabbitmq
			params: {
				name: { type: 'string' },
				payload: { type: 'object' }
			},
			async handler (ctx) {
				return this.tortoise
					.exchange(this.settings.amqp.exchange, 'direct', { durable: true })
					.publish(ctx.params.name, ctx.params.payload);
			}
		},

		test: {
			async handler (ctx) {
				throw new Error('TEST');
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
	},

	/**
	 * Service stopped lifecycle event handler
	 */
	async stopped () {
		// await this.tortoise.destroy();
	}
};
