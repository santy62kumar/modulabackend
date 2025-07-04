// // server/src/services/external/odoo/odooClient.js

// const xmlrpc = require('xmlrpc');
// const { promisify } = require('node:util');
// const { HIDDEN_STAGES } = require('../../../constants/stageMapping');

// /**
//  * Odoo XML-RPC Client Service
//  * Handles all Odoo CRM API communications
//  */

// class OdooClient {
//   constructor() {
//     this.url = process.env.ODOO_URL;
//     this.db = process.env.ODOO_DB;
//     this.username = process.env.ODOO_USERNAME;
//     this.password = process.env.ODOO_PASSWORD;
    
//     // Create XML-RPC clients
//     this.commonClient = xmlrpc.createSecureClient({ 
//       url: `${this.url}/xmlrpc/2/common` 
//     });
//     this.modelsClient = xmlrpc.createSecureClient({ 
//       url: `${this.url}/xmlrpc/2/object` 
//     });
    
//     // Promisify methods
//     this.commonAuthenticate = promisify(this.commonClient.methodCall).bind(this.commonClient);
//     this.modelsExecute = promisify(this.modelsClient.methodCall).bind(this.modelsClient);
    
//     this.uid = null;
//   }

//   /**
//    * Authenticate with Odoo
//    * @returns {Promise<number|null>} User ID or null if failed
//    */
//   async authenticate() {
//     try {
//       this.uid = await this.commonAuthenticate('authenticate', [
//         this.db, 
//         this.username, 
//         this.password, 
//         {}
//       ]);
      
//       if (!this.uid) {
//         console.error('❌ Odoo authentication failed');
//         return null;
//       }
      
//       console.log('✅ Odoo authentication successful, UID:', this.uid);
//       return this.uid;
//     } catch (error) {
//       console.error('❌ Odoo authentication error:', error.message);
//       return null;
//     }
//   }

//   /**
//    * Fetch all leads with visible stages (not in HIDDEN_STAGES)
//    * @returns {Promise<Array>} Array of lead objects
//    */
//   async fetchVisibleLeads() {
//     try {
//       // Ensure authentication
//       if (!this.uid) {
//         await this.authenticate();
//         if (!this.uid) {
//           throw new Error('Failed to authenticate with Odoo');
//         }
//       }

//       console.log('🔍 Fetching leads with visible stages...');
      
//       const leads = await this.modelsExecute('execute_kw', [
//         this.db,
//         this.uid,
//         this.password,
//         'crm.lead',
//         'search_read',
//         [
//           [
//             ['stage_id', 'not in', HIDDEN_STAGES]  // Only visible stages
//           ]
//         ],
//         {
//           fields: ['id', 'name', 'phone', 'email_from', 'stage_id']
//         }
//       ]);

//       console.log(`📊 Fetched ${leads.length} leads with visible stages`);
//       return leads;
      
//     } catch (error) {
//       console.error('❌ Error fetching leads from Odoo:', error.message);
//       throw error;
//     }
//   }

//   /**
//    * Fetch specific lead by phone number
//    * @param {string} phoneNumber - Phone number to search
//    * @returns {Promise<Array>} Array of matching leads
//    */
//   async fetchLeadByPhone(phoneNumber) {
//     try {
//       // Ensure authentication
//       if (!this.uid) {
//         await this.authenticate();
//         if (!this.uid) {
//           throw new Error('Failed to authenticate with Odoo');
//         }
//       }

//       // Format phone number for search
//       const { getPhoneFormats } = require('../../../utils/phoneUtils');
//       const phoneFormats = getPhoneFormats(phoneNumber);

//       const leads = await this.modelsExecute('execute_kw', [
//         this.db,
//         this.uid,
//         this.password,
//         'crm.lead',
//         'search_read',
//         [
//           [
//             '|',
//             ['phone', 'in', phoneFormats],
//             ['mobile', 'in', phoneFormats]
//           ]
//         ],
//         {
//           fields: ['id', 'name', 'phone', 'email_from', 'stage_id']
//         }
//       ]);

//       return leads;
      
//     } catch (error) {
//       console.error('❌ Error fetching lead by phone:', error.message);
//       throw error;
//     }
//   }

//   /**
//    * Check Odoo connection health
//    * @returns {Promise<boolean>} Connection status
//    */
//   async checkConnection() {
//     try {
//       const uid = await this.authenticate();
//       return uid !== null;
//     } catch (error) {
//       console.error('❌ Odoo connection check failed:', error.message);
//       return false;
//     }
//   }
// }

// // Create singleton instance
// const odooClient = new OdooClient();

// module.exports = odooClient;

// server/src/services/external/odoo/odooClient.js

import xmlrpc from 'xmlrpc';
import { promisify } from 'node:util';
import { HIDDEN_STAGES } from '../../../constants/stageMapping.js';
import { getPhoneFormats } from '../../utils/phoneUtils.js';

/**
 * Odoo XML-RPC Client Service
 * Handles all Odoo CRM API communications
 */

class OdooClient {
  constructor() {
    this.url = process.env.ODOO_URL;
    this.db = process.env.ODOO_DB;
    this.username = process.env.ODOO_USERNAME;
    this.password = process.env.ODOO_PASSWORD;
    
    // Create XML-RPC clients
    this.commonClient = xmlrpc.createSecureClient({ 
      url: `${this.url}/xmlrpc/2/common` 
    });
    this.modelsClient = xmlrpc.createSecureClient({ 
      url: `${this.url}/xmlrpc/2/object` 
    });
    
    // Promisify methods
    this.commonAuthenticate = promisify(this.commonClient.methodCall).bind(this.commonClient);
    this.modelsExecute = promisify(this.modelsClient.methodCall).bind(this.modelsClient);
    
    this.uid = null;
  }

  /**
   * Authenticate with Odoo
   * @returns {Promise<number|null>} User ID or null if failed
   */
  async authenticate() {
    try {
      this.uid = await this.commonAuthenticate('authenticate', [
        this.db, 
        this.username, 
        this.password, 
        {}
      ]);
      
      if (!this.uid) {
        console.error('❌ Odoo authentication failed');
        return null;
      }
      
      console.log('✅ Odoo authentication successful, UID:', this.uid);
      return this.uid;
    } catch (error) {
      console.error('❌ Odoo authentication error:', error.message);
      return null;
    }
  }

  /**
   * Fetch all leads with visible stages (not in HIDDEN_STAGES)
   * @returns {Promise<Array>} Array of lead objects
   */
  async fetchVisibleLeads() {
    try {
      // Ensure authentication
      if (!this.uid) {
        await this.authenticate();
        if (!this.uid) {
          throw new Error('Failed to authenticate with Odoo');
        }
      }

      console.log('🔍 Fetching leads with visible stages...');
      
      const leads = await this.modelsExecute('execute_kw', [
        this.db,
        this.uid,
        this.password,
        'crm.lead',
        'search_read',
        [
          [
            ['stage_id', 'not in', HIDDEN_STAGES]  // Only visible stages
          ]
        ],
        {
          fields: ['id', 'name', 'phone', 'email_from', 'stage_id']
        }
      ]);

      console.log(`📊 Fetched ${leads.length} leads with visible stages`);
      return leads;
      
    } catch (error) {
      console.error('❌ Error fetching leads from Odoo:', error.message);
      throw error;
    }
  }

  /**
   * Fetch specific lead by phone number
   * @param {string} phoneNumber - Phone number to search
   * @returns {Promise<Array>} Array of matching leads
   */
  async fetchLeadByPhone(phoneNumber) {
    try {
      // Ensure authentication
      if (!this.uid) {
        await this.authenticate();
        if (!this.uid) {
          throw new Error('Failed to authenticate with Odoo');
        }
      }

      // Format phone number for search
      const phoneFormats = getPhoneFormats(phoneNumber);

      const leads = await this.modelsExecute('execute_kw', [
        this.db,
        this.uid,
        this.password,
        'crm.lead',
        'search_read',
        [
          [
            '|',
            ['phone', 'in', phoneFormats],
            ['mobile', 'in', phoneFormats]
          ]
        ],
        {
          fields: ['id', 'name', 'phone', 'email_from', 'stage_id']
        }
      ]);

      return leads;
      
    } catch (error) {
      console.error('❌ Error fetching lead by phone:', error.message);
      throw error;
    }
  }

  /**
   * Check Odoo connection health
   * @returns {Promise<boolean>} Connection status
   */
  async checkConnection() {
    try {
      const uid = await this.authenticate();
      return uid !== null;
    } catch (error) {
      console.error('❌ Odoo connection check failed:', error.message);
      return false;
    }
  }
}

// Create singleton instance
const odooClient = new OdooClient();

export default odooClient;
