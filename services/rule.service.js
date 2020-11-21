'use strict';

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

const { Engine } = require('json-rules-engine');
const _ = require('lodash');

module.exports = {
	name: 'rule',

	/**
	 * Settings
	 */
	settings: {
		rules: [
			{
				conditions: {
					all: [
						{
							fact: 'code',
							operator: 'equal',
							value: '500',
						}
					]
				},
				event: {
					type: '500',
					params: {
						message: 'create job for code 500',
						payload: {
							message: 'error code 500'
						}
					}
				}
			},
			{
				conditions: {
					all: [
						{
							fact: 'code',
							operator: 'equal',
							value: '501',
						}
					]
				},
				event: {
					type: '501',
					params: {
						message: 'create job for code 501',
						payload: {
							message: 'error code 501'
						}
					}
				}
			},
			{
				conditions: {
					all: [
						{
							fact: 'code',
							operator: 'equal',
							value: '502',
						}
					]
				},
				event: {
					type: '502',
					params: {
						message: 'create job for code 502',
						payload: {
							message: 'error code 502'
						}
					}
				}
			}
		]
	},

	/**
	 * Actions
	 */
	actions: {
		classify: {
			params: {
				code: { type: 'string' }
			},	
			async handler (ctx) {
				let result = null;
				for (let i = 0; i < this.engines.length; i++) {
					try {
						result = await this.engines[i].run(ctx.params);
						if (result.events.length) break;
					} catch (error) {
						this.logger.error('ERROR', error);
					 }
				}

				return result.events.length ? result.events[0] : null;
			}
		}
	},

	/**
	 * Events
	 */
	events: {

	},

	/*
	 * Methods
	 */
	methods: {

	},

	/**
	 * Service created lifecycle event handler
	 */
	created () {
		this.engines = this.settings.rules.map(rule => {
			const engine = new Engine();
			engine.addRule(rule);
			return engine;
		});
	},

	/**
	 * Service started lifecycle event handler
	 */
	async started () {

	},

	/**
	 * Service stopped lifecycle event handler
	 */
	async stopped () {

	}
};
