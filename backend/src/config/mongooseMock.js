import bcrypt from 'bcryptjs';

const dbStore = {
  User: [],
  Category: [
    {
      _id: 'cat_id_luxury',
      name: 'Luxury Getaways',
      slug: 'luxury-getaways',
      description: 'Premium hotels, business class flights, and personalized private guides.',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: 'cat_id_adventure',
      name: 'Adventure Tours',
      slug: 'adventure-tours',
      description: 'Thrills and outdoor challenges across mountains, deserts, and rivers.',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: 'cat_id_budget',
      name: 'Budget Escapes',
      slug: 'budget-escapes',
      description: 'Affordable retreats, standard boarding, and self-guided city tours.',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: 'cat_id_backpacker',
      name: 'Backpacker Specials',
      slug: 'backpacker-specials',
      description: 'Cheap hostels, shared transport, and local food experiences.',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: 'cat_id_family',
      name: 'Family Packages',
      slug: 'family-packages',
      description: 'Kid-friendly resorts, interactive theme parks, and family vacation packages.',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  Country: [],
  City: [],
  Destination: [],
  Tour: [],
  Booking: [],
  Payment: [],
  Coupon: [],
  Review: [],
  Notification: [],
  Invoice: [],
  Refund: [],
  ActivityLog: [],
  Wishlist: []
};

// Auto-generate ObjectId string
const generateId = () => 'mock_id_' + Math.random().toString(36).substr(2, 9);

// Simple match helper for Mongoose queries
const matchQuery = (item, query) => {
  if (!query || Object.keys(query).length === 0) return true;
  
  for (const [key, value] of Object.entries(query)) {
    // Handle text searches
    if (key === '$or') {
      return value.some(subQuery => matchQuery(item, subQuery));
    }
    
    const itemVal = item[key];

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if (value.$gte !== undefined && itemVal < value.$gte) return false;
      if (value.$lte !== undefined && itemVal > value.$lte) return false;
      if (value.$in !== undefined && (!Array.isArray(value.$in) || !value.$in.includes(itemVal))) return false;
      continue;
    }

    if (itemVal !== value) return false;
  }
  return true;
};

// Chainable Class mimicking Mongoose Query interface
class MockQuery {
  constructor(modelName, executeFn) {
    this.modelName = modelName;
    this.executeFn = executeFn;
    this._populates = [];
    this._sort = null;
    this._limit = null;
  }

  populate(fields) {
    this._populates.push(fields);
    return this;
  }

  sort(fields) {
    this._sort = fields;
    return this;
  }

  limit(n) {
    this._limit = n;
    return this;
  }

  select(fields) {
    return this;
  }

  async exec() {
    const result = this.executeFn();
    // Simulate populate references
    if (Array.isArray(result)) {
      return result.map(item => this.applyPopulate(item));
    } else if (result) {
      return this.applyPopulate(result);
    }
    return result;
  }

  // Thenable interface makes it awaitable directly
  then(onFulfilled, onRejected) {
    return this.exec().then(onFulfilled, onRejected);
  }

  applyPopulate(item) {
    if (!item) return item;
    const cloned = { ...item };
    
    // Quick mock populate links
    if (this.modelName === 'Tour') {
      cloned.category = dbStore.Category.find(c => c._id === cloned.category) || cloned.category;
      cloned.destinations = cloned.destinations?.map(id => 
        dbStore.Destination.find(d => d._id === id) || id
      ) || [];
    } else if (this.modelName === 'Booking') {
      cloned.tour = dbStore.Tour.find(t => t._id === cloned.tour) || cloned.tour;
      cloned.user = dbStore.User.find(u => u._id === cloned.user) || cloned.user;
    } else if (this.modelName === 'Review') {
      cloned.user = dbStore.User.find(u => u._id === cloned.user) || cloned.user;
      cloned.tour = dbStore.Tour.find(t => t._id === cloned.tour) || cloned.tour;
    } else if (this.modelName === 'Invoice') {
      cloned.booking = dbStore.Booking.find(b => b._id === cloned.booking) || cloned.booking;
      cloned.user = dbStore.User.find(u => u._id === cloned.user) || cloned.user;
    } else if (this.modelName === 'Refund') {
      cloned.user = dbStore.User.find(u => u._id === cloned.user) || cloned.user;
      cloned.booking = dbStore.Booking.find(b => b._id === cloned.booking) || cloned.booking;
    }
    return cloned;
  }
}

class Schema {
  constructor(definition, options) {
    this.definition = definition;
    this.options = options;
    this.hooks = {};
    this.methods = {};
  }

  pre(event, callback) {
    this.hooks[event] = this.hooks[event] || [];
    this.hooks[event].push(callback);
  }

  index(opts) {
    // No-op
  }
}

Schema.Types = {
  ObjectId: 'ObjectId',
};

const SchemaTypes = {
  ObjectId: 'ObjectId',
};

const mongooseMock = {
  connect: async () => {
    console.log('Database connected via local in-memory Mock Layer.');
    return { connection: { host: 'in-memory-mock' } };
  },

  Schema: Schema,
  Types: { ObjectId: (id) => id || generateId() },

  model: (modelName, schema) => {
    // Initialize collection store
    dbStore[modelName] = dbStore[modelName] || [];

    // Return Model Class implementation
    class MockModel {
      constructor(data = {}) {
        Object.assign(this, data);
        this._id = data._id || generateId();
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();

        // Bind schema methods
        if (schema && schema.methods) {
          for (const [methodName, fn] of Object.entries(schema.methods)) {
            this[methodName] = fn.bind(this);
          }
        }
      }

      isModified(field) {
        return true;
      }

      async save() {
        // Run pre-save hooks (e.g. hash password)
        if (schema && schema.hooks['save']) {
          for (const hook of schema.hooks['save']) {
            await new Promise((resolve, reject) => {
              hook.call(this, (err) => {
                if (err) reject(err);
                else resolve();
              });
            });
          }
        }

        const list = dbStore[modelName];
        const index = list.findIndex(item => item._id === this._id);
        const docJSON = JSON.parse(JSON.stringify(this));

        // Inject bound methods back to retrieved object
        if (schema && schema.methods) {
          for (const [name, fn] of Object.entries(schema.methods)) {
            docJSON[name] = fn.bind(docJSON);
          }
        }

        if (index > -1) {
          list[index] = docJSON;
        } else {
          list.push(docJSON);
        }
        return this;
      }

      async deleteOne() {
        const list = dbStore[modelName];
        const index = list.findIndex(item => item._id === this._id);
        if (index > -1) list.splice(index, 1);
        return { deletedCount: 1 };
      }

      static find(query = {}) {
        return new MockQuery(modelName, () => {
          const list = dbStore[modelName] || [];
          return list.filter(item => matchQuery(item, query));
        });
      }

      static findOne(query = {}) {
        return new MockQuery(modelName, () => {
          const list = dbStore[modelName] || [];
          return list.find(item => matchQuery(item, query)) || null;
        });
      }

      static findById(id) {
        return new MockQuery(modelName, () => {
          const list = dbStore[modelName] || [];
          return list.find(item => item._id === id || item._id.toString() === id?.toString()) || null;
        });
      }

      static async create(data) {
        if (Array.isArray(data)) {
          const results = [];
          for (const item of data) {
            const inst = new MockModel(item);
            await inst.save();
            results.push(inst);
          }
          return results;
        }
        const inst = new MockModel(data);
        await inst.save();
        return inst;
      }

      static findByIdAndUpdate(id, updates, options = {}) {
        return new MockQuery(modelName, () => {
          const list = dbStore[modelName] || [];
          const item = list.find(item => item._id === id || item._id.toString() === id?.toString());
          if (item) {
            Object.assign(item, updates);
            item.updatedAt = new Date();
          }
          return item || null;
        });
      }

      static findByIdAndDelete(id) {
        return new MockQuery(modelName, () => {
          const list = dbStore[modelName] || [];
          const index = list.findIndex(item => item._id === id || item._id.toString() === id?.toString());
          let deleted = null;
          if (index > -1) {
            deleted = list[index];
            list.splice(index, 1);
          }
          return deleted;
        });
      }

      static deleteMany(query = {}) {
        dbStore[modelName] = [];
        return { deletedCount: 0 };
      }

      static countDocuments(query = {}) {
        return new MockQuery(modelName, () => {
          const list = dbStore[modelName] || [];
          return list.filter(item => matchQuery(item, query)).length;
        });
      }

      static aggregate(pipeline = []) {
        return new MockQuery(modelName, () => {
          let list = dbStore[modelName] || [];
          
          const matchStage = pipeline.find(p => p.$match);
          if (matchStage) {
            list = list.filter(item => matchQuery(item, matchStage.$match));
          }
          
          const groupStage = pipeline.find(p => p.$group);
          if (groupStage) {
            const { _id, total, avgRating } = groupStage.$group;
            
            if (_id === '$rating') {
              const groups = {};
              list.forEach(item => {
                const key = item.rating || 5;
                groups[key] = (groups[key] || 0) + 1;
              });
              return Object.entries(groups).map(([rating, cnt]) => ({
                _id: Number(rating),
                count: cnt
              }));
            }
            
            if (_id === '$tour') {
              const groups = {};
              list.forEach(item => {
                const key = item.tour?._id || item.tour;
                groups[key] = (groups[key] || 0) + (item.numSeats || 0);
              });
              return Object.entries(groups).map(([tourId, cnt]) => ({
                _id: tourId,
                count: cnt
              }));
            }

            let totalVal = 0;
            let avgVal = 0;
            if (list.length > 0) {
              const sumAttr = total?.$sum?.replace('$', '') || 'amount';
              totalVal = list.reduce((sum, item) => sum + (Number(item[sumAttr]) || 0), 0);
              
              const avgAttr = avgRating?.$avg?.replace('$', '') || 'rating';
              const sumAvg = list.reduce((sum, item) => sum + (Number(item[avgAttr]) || 0), 0);
              avgVal = sumAvg / list.length;
            }
            
            return [{
              _id: null,
              total: totalVal,
              avgRating: avgVal,
              count: list.length
            }];
          }
          
          return list;
        });
      }
    }

    return MockModel;
  }
};

export default mongooseMock;
export { Schema, SchemaTypes };
