const CredentialVault = {
  open({ database, keyName }) {
    const cipher = (storageKey, iv) => ({ name: 'AES-GCM', iv, additionalData: Encoding.toUtf8(storageKey) });

    function openDatabase() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(database, 1);
        request.onupgradeneeded = () => request.result.createObjectStore('keys');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }

    async function deviceKey({ create }) {
      const generated = create && await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
      const connection = await openDatabase();
      try {
        return await new Promise((resolve, reject) => {
          const transaction = connection.transaction('keys', create ? 'readwrite' : 'readonly');
          const keys = transaction.objectStore('keys');
          const lookup = keys.get(keyName);
          let key;
          lookup.onsuccess = () => {
            key = lookup.result || generated;
            if (!lookup.result && generated) keys.put(generated, keyName);
          };
          transaction.oncomplete = () => key ? resolve(key) : reject(new Error('Browser encryption key unavailable.'));
          transaction.onabort = () => reject(transaction.error);
        });
      } finally {
        connection.close();
      }
    }

    return {
      readEntry(storageKey) {
        return JSON.parse(localStorage.getItem(storageKey) || 'null');
      },

      writeEntry(storageKey, entry) {
        localStorage.setItem(storageKey, JSON.stringify(entry));
      },

      removeEntry(storageKey) {
        localStorage.removeItem(storageKey);
      },

      async encrypt(storageKey, credentials) {
        const key = await deviceKey({ create: true });
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const data = await crypto.subtle.encrypt(cipher(storageKey, iv), key, Encoding.toUtf8(JSON.stringify(credentials)));
        return { iv: Encoding.toBase64(iv), data: Encoding.toBase64(data) };
      },

      async decrypt(storageKey, entry) {
        const key = await deviceKey({ create: false });
        const data = await crypto.subtle.decrypt(cipher(storageKey, Encoding.fromBase64(entry.iv)), key, Encoding.fromBase64(entry.data));
        return JSON.parse(Encoding.fromUtf8(data));
      },
    };
  },
};
