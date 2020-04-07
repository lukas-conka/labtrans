
exports.up = function(knex) {
  return knex.schema.createTable('images', function(table) {
      table.string('id').primary();
      table.string('name', 50).notNullable();
      table.boolean('processed').notNullable();
      table.string('path', 150).notNullable();
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('images');
};
///renomear o nome da imagem para upload ou salvar como o id
//max para imagem
//colocar fundo colorido nos items da imagem
