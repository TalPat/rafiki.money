
exports.up = function(knex) {
  return knex.schema
    .createTable('invoices', function (table) {
      table.uuid('id')
      table.text('description')
      table.bigInteger('amount')
      table.string('currencyCode')
      table.bigInteger('balance')
      table.string('userId')
    })
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('invoices')
};
