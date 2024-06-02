const { StatusCodes } = require('http-status-codes');
const { loggerFor } = require('../utils');
const { db } = require('../database/repository');

const logger = loggerFor(module);

const validate = (data) => {
  const { email, phoneNumber } = data || {};

  if (!email && !phoneNumber) {
    return false;
  }

  return true;
};

const merge = (emailContacts, phoneContacts) => {
  const contacts = new Map();

  [...emailContacts, ...phoneContacts].forEach((contact) => {
    if (!contacts.has(contact.id)) {
      contacts.set(contact.id, contact);
    }
  });

  return Array.from(contacts.values());
};

const isSearchableContact = (email, phone) => (email && !phone) || (phone && !email);

const isBothFieldsPresent = (email, phone) => email && phone;

const identify = (contacts) => {
  const primary = contacts.find((contact) => contact.primary) || contacts[0];
  const secondaries = contacts.filter((contact) => contact.id !== primary.id);

  const emails = new Set(contacts.map(({ email }) => email).filter(Boolean));
  const phones = new Set(contacts.map(({ phone }) => phone).filter(Boolean));

  return { primary, secondaries, emails, phones };
};

const reconcileIdentityUsing = async ({ email, phone }) => {
  logger.info(`processing identity request for email: ${email} and phone: ${phone}.`);

  const emailContacts = email ? await db.contacts.fetch({ email }) : [];
  const phoneContacts = phone ? await db.contacts.fetch({ phone }) : [];

  let mergedContacts = merge(emailContacts, phoneContacts);

  if (!mergedContacts.length) {
    logger.info('no contacts found. creating new primary contact.');
    const contact = await db.contacts.create({ email, phone });

    return { primary: contact, secondaries: [], emails: new Set([email]), phones: new Set([phone]) };
  }

  if (isSearchableContact(email, phone)) {
    const { email: mergedEmail, phone: mergedPhone } = mergedContacts[0] || {};
    const contact = await db.contacts.fetch({ email: email || mergedEmail, phone: phone || mergedPhone });

    mergedContacts = merge(mergedContacts, contact);
  }

  const contacts = identify(mergedContacts);

  if (isSearchableContact(email, phone)) {
    return contacts;
  }

  if (isBothFieldsPresent(email, phone)) {
    const hasConflictingPrimary = emailContacts.length && phoneContacts.length && emailContacts[0].id !== phoneContacts[0].id;
    if (hasConflictingPrimary) {
      logger.info('conflicting primary contacts found. resolving.');
      const older = emailContacts[0].createdAt < phoneContacts[0].createdAt ? emailContacts[0] : phoneContacts[0];
      const newer = emailContacts[0].createdAt >= phoneContacts[0].createdAt ? emailContacts[0] : phoneContacts[0];

      await db.contacts.update({ id: newer.id }, { linkedId: older.id, precedence: 'secondary' });

      contacts.primary = older;
      contacts.secondaries = contacts.secondaries.filter((contact) => contact.id !== newer.id);
      contacts.secondaries.push(newer);
      contacts.emails.add(newer.email);
      contacts.phones.add(newer.phone);

      return contacts;
    } else if (emailContacts.length || phoneContacts.length) {
      logger.info('no conflicting primary contacts. creating new secondary contact.');
      const contact = await db.contacts.create({ email, phone, linkedId: contacts.primary.id }, false);

      contacts.secondaries.push(contact);
      contacts.emails.add(email);
      contacts.phones.add(phone);

      return contacts;
    }
  }

  return contacts;
};

const buildResponseUsing = (contacts) => {
  const { primary, secondaries, emails, phones } = contacts || {};

  const contact = {
    primaryContactId: primary?.precedence === 'primary' ? primary?.id : primary?.linkedId,
    emails: Array.from(emails),
    phoneNumbers: Array.from(phones),
    secondaryContactIds: secondaries.length ? secondaries.map((contact) => contact?.id) : primary?.precedence === 'secondary' ? [primary?.id] : [],
  };

  logger.info(`identity request processed successfully. response: ${JSON.stringify(contact)}`);
  return { contact };
};

const identity = async (req, res) => {
  const { body } = req || {};

  if (!validate(body)) {
    logger.error('validation failed for identity request. email and phone number is missing.');
    return res.status(StatusCodes.BAD_REQUEST).json({ code: StatusCodes.BAD_REQUEST, message: 'Atleast one of email or phone number is required.' });
  }

  const { email, phoneNumber: phone } = body || {};

  try {
    const contacts = await reconcileIdentityUsing({ email, phone });
    return res.status(StatusCodes.OK).json(buildResponseUsing(contacts));
  } catch (error) {
    logger.error(`error while processing identity request: ${error.message || error}`);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ code: StatusCodes.INTERNAL_SERVER_ERROR, message: 'An error occurred while processing your request.' });
  }
};

module.exports = { identity };
