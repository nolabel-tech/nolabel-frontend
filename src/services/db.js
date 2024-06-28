export const initDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('messenger', 1);
  
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
  
        if (!db.objectStoreNames.contains('contacts')) {
          const contactsStore = db.createObjectStore('contacts', { keyPath: 'unique' });
          contactsStore.createIndex('unique', 'unique', { unique: true });
        }
  
        if (!db.objectStoreNames.contains('messages')) {
          const messagesStore = db.createObjectStore('messages', { keyPath: 'id' });
          messagesStore.createIndex('recipient_unique', 'recipient_unique', { unique: false });
          messagesStore.createIndex('date', 'date', { unique: false });
        }
      };
  
      request.onsuccess = (event) => {
        resolve();
      };
  
      request.onerror = (event) => {
        reject('Failed to open database');
      };
    });
  };
  
  export const saveContact = (contact) => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('messenger', 1);
  
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['contacts'], 'readwrite');
        const store = transaction.objectStore('contacts');
  
        const addRequest = store.put(contact);
  
        addRequest.onsuccess = () => {
          resolve();
        };
  
        addRequest.onerror = (event) => {
          reject('Failed to save contact');
        };
      };
  
      request.onerror = (event) => {
        reject('Failed to open database');
      };
    });
  };
  
  export const getRoomId = (contactUnique) => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('messenger', 1);
  
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['contacts'], 'readonly');
        const store = transaction.objectStore('contacts');
  
        const getRequest = store.get(contactUnique);
  
        getRequest.onsuccess = (event) => {
          const contact = event.target.result;
          if (contact) {
            resolve(contact.roomId);
          } else {
            reject('Contact not found');
          }
        };
  
        getRequest.onerror = (event) => {
          reject('Failed to get contact');
        };
      };
  
      request.onerror = (event) => {
        reject('Failed to open database');
      };
    });
  };
  
  export const saveMessage = (message) => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('messenger', 1);
  
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['messages'], 'readwrite');
        const store = transaction.objectStore('messages');
  
        const addRequest = store.put(message);
  
        addRequest.onsuccess = () => {
          resolve();
        };
  
        addRequest.onerror = (event) => {
          reject('Failed to save message');
        };
      };
  
      request.onerror = (event) => {
        reject('Failed to open database');
      };
    });
  };
  
  export const getMessagesByRecipient = (currentUnique, contactUnique) => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('messenger', 1);
  
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['messages'], 'readonly');
        const store = transaction.objectStore('messages');
  
        const getRequest = store.getAll();
  
        getRequest.onsuccess = (event) => {
          const messages = event.target.result.filter(
            (message) =>
              (message.recipient_unique === currentUnique && message.sender_unique === contactUnique) ||
              (message.recipient_unique === contactUnique && message.sender_unique === currentUnique)
          );
          messages.sort((a, b) => new Date(a.date) - new Date(b.date));  // Сортировка по дате
          resolve(messages);
        };
  
        getRequest.onerror = (event) => {
          reject('Failed to get messages');
        };
      };
  
      request.onerror = (event) => {
        reject('Failed to open database');
      };
    });
  };
  
  export const updateMessageStatus = (messageId, status) => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('messenger', 1);
  
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['messages'], 'readwrite');
        const store = transaction.objectStore('messages');
  
        const getRequest = store.get(messageId);
  
        getRequest.onsuccess = (event) => {
          const message = event.target.result;
          if (message) {
            message.status = status;
            const updateRequest = store.put(message);
  
            updateRequest.onsuccess = () => {
              resolve();
            };
  
            updateRequest.onerror = (event) => {
              reject('Failed to update message status');
            };
          } else {
            reject('Message not found');
          }
        };
  
        getRequest.onerror = (event) => {
          reject('Failed to get message');
        };
      };
  
      request.onerror = (event) => {
        reject('Failed to open database');
      };
    });
  };
  