import mongoose from 'mongoose';
import { BufferJSON, initAuthCreds, proto } from '@whiskeysockets/baileys';

const sessionSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  data: { type: String, required: true }
}, { collection: 'auth_sessions' });

const Session = mongoose.model('Session', sessionSchema);

export const useMongoAuthState = async () => {
  const write = async (data, id) => {
    const json = JSON.stringify(data, BufferJSON.replacer);
    await Session.findByIdAndUpdate(id, { data: json }, { upsert: true });
  };

  const read = async (id) => {
    const session = await Session.findById(id);
    if (!session) return null;
    return JSON.parse(session.data, BufferJSON.reviver);
  };

  const del = async (id) => {
    await Session.findByIdAndDelete(id);
  };

  let creds = (await read('creds')) || initAuthCreds();

  return {
    state: {
      get creds() { return creds; },
      set creds(val) { creds = val; },
      keys: {
        get: async (type, ids) => {
          const data = {};
          await Promise.all(
            ids.map(async (id) => {
              let value = await read(`${type}-${id}`);
              if (type === 'app-state-sync-key' && value) {
                value = proto.Message.AppStateSyncKeyData.fromObject(value);
              }
              data[id] = value;
            })
          );
          return data;
        },
        set: async (data) => {
          const tasks = [];
          for (const category in data) {
            for (const id in data[category]) {
              const value = data[category][id];
              const key = `${category}-${id}`;
              tasks.push(value ? write(value, key) : del(key));
            }
          }
          await Promise.all(tasks);
        }
      }
    },
    saveCreds: () => write(creds, 'creds')
  };
};
