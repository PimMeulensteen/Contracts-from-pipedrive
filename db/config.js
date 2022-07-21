const knex = require('./connection');

async function createTable() {
    const tableExists = await knex.schema.hasTable('config_table');
    if (tableExists) {
        return;
    }

    await knex.schema.createTable('config_table', table => {
        table.text('key').primary();
        table.text('value');
    });
}

async function getByKey(key) {
    const user = await knex.from('config_table').select().where('key', key);
    return user;
}

async function setByKeyAndValue(key, value) {
    await knex('config_table').insert({
        key, value
    });
}

module.exports = {
    createTable,
    setByKeyAndValue,
    getByKey
};