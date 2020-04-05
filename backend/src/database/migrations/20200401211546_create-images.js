
exports.up = function(knex) {
  return knex.schema.createTable('images', function(table) {
      table.string('id').primary();
      table.string('name').notNullable();
      table.boolean('processed').notNullable();
      table.string('path').notNullable();
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('images');
};
