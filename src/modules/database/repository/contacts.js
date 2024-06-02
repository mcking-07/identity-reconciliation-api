const { loggerFor } = require('../../utils');
const { pool } = require('../config');

const logger = loggerFor(module);

const create = async (contact, primary = true) => {
  const { email, phone, linkedId } = contact || {};

  const link_precedence = primary ? 'primary' : 'secondary';
  const linked_id = primary ? null : linkedId;

  let query = 'INSERT INTO contacts (email, phone_number, link_precedence, linked_id) VALUES ($1, $2, $3, $4) RETURNING *';
  const values = [email, phone, link_precedence, linked_id];

  logger.info(`creating contact with query [${query}] and values [${values}]`);

  const { rows } = await pool.query(query, values);

  return transformed(rows[0]);
};

const transformed = (contacts, isArray = false) => {
  if (isArray) {
    if (!contacts.length) {
      return [];
    }
    return contacts.map((contact) => ({
      id: contact.id, email: contact.email, phone: contact.phone_number,
      precedence: contact.link_precedence, linkedId: contact.linked_id,
      createdAt: contact.created_at, updatedAt: contact.updated_at
    }));
  }

  if (!contacts) {
    return null;
  }

  return {
    id: contacts.id, email: contacts.email, phone: contacts.phone_number,
    precedence: contacts.link_precedence, linkedId: contacts.linked_id,
    createdAt: contacts.created_at, updatedAt: contacts.updated_at
  };
};

const fetch = async (identifiers, all = true) => {
  const { email, phone } = identifiers || {};

  let query = (email || phone) ? 'SELECT * FROM contacts WHERE ' : 'SELECT * FROM contacts ';

  if (email && phone) {
    query += `email = \'${email}\' OR phone_number = \'${phone}\'`;
  } else if (email) {
    query += `email = \'${email}\'`;
  } else if (phone) {
    query += `phone_number = \'${phone}\'`;
  }

  logger.info(`fetching contacts with query [${query}].`);

  const { rows } = await pool.query(query);

  return all ? transformed(rows, true) : transformed(rows[0]);
};

const update = async (identifiers, updates) => {
  const { id } = identifiers || {};

  const { linkedId, precedence } = updates || {};

  let query = 'UPDATE contacts SET ';

  if (linkedId && precedence) {
    query += `linked_id = \'${linkedId}\', link_precedence = \'${precedence}\', updated_at = CURRENT_TIMESTAMP`;
  }

  query += ` WHERE id = \'${id}\'`;

  logger.info(`updating contact with query [${query}].`);

  const { rows } = await pool.query(query);

  return transformed(rows[0]);
};

const contacts = {
  create, fetch, update,
};

module.exports = {
  contacts,
};
