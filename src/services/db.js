import { openDB } from 'idb';

const DB_NAME = 'messengerDB';
const DB_VERSION = 1;
const MESSAGE_STORE_NAME = 'messages';
const CONTACT_STORE_NAME = 'contacts';

const getDb = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(MESSAGE_STORE_NAME)) {
        const messageStore = db.createObjectStore(MESSAGE_STORE_NAME, { keyPath: 'id', autoIncrement: true });
        messageStore.createIndex('recipient_unique', 'recipient_unique', { unique: false });
      }
      if (!db.objectStoreNames.contains(CONTACT_STORE_NAME)) {
        db.createObjectStore(CONTACT_STORE_NAME, { keyPath: 'unique' });
      }
    },
  });
};

export const saveMessage = async (message) => {
  const db = await getDb();
  const tx = db.transaction(MESSAGE_STORE_NAME, 'readwrite');
  await tx.store.add(message);
  await tx.done;
};

export const getMessagesByRecipient = async (recipientUnique) => {
  const db = await getDb();
  return db.getAllFromIndex(MESSAGE_STORE_NAME, 'recipient_unique', recipientUnique);
};

export const updateMessageStatus = async (id, status) => {
  const db = await getDb();
  const tx = db.transaction(MESSAGE_STORE_NAME, 'readwrite');
  const message = await tx.store.get(id);
  if (message) {
    message.status = status;
    await tx.store.put(message);
  }
  await tx.done;
};
