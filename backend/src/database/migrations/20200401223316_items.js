
exports.up = function(knex) {
    return knex.schema.createTable('items', function(table) {
        table.string('id').primary();
        table.string('description', 50).unique().notNullable();
        table.string('color', 6).notNullable();
    })
};

exports.down = function(knex) {
  return knex.schema.dropTable('items');
};
