
exports.up = function(knex) {
  return knex.schema.createTable('imagemxitem', function(table) {
    table.increments();
    table.string('description').notNullable();
    table.string('x').notNullable();
    table.string('y').notNullable();
    table.string('color', 6).notNullable();
    table.string('imagem_id').unsigned().notNullable();
    table.foreign('imagem_id').references('images.id');
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('imagemxitem');
};
