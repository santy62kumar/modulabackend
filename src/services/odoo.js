// server/services/odoo.js
import xmlrpc from 'xmlrpc';
import { promisify } from 'util';
import dotenv from 'dotenv';

dotenv.config();

const ODOO_CONFIG = {
  url: process.env.ODOO_URL,
  db: process.env.ODOO_DB,
  username: process.env.ODOO_USERNAME,
  password: process.env.ODOO_PASSWORD
};

// Helper to format phone numbers for Odoo search
const getPhoneFormats = (phone) => {
  const digits = phone.replace(/\D/g, '');
  const last10 = digits.slice(-10);
  
  // Format 1: 10 digits
  const format1 = last10;
  // Format 2: +91 XXXXX XXXXX
  const format2 = `+91 ${last10.slice(0, 5)} ${last10.slice(5)}`;
  
  return [format1, format2];
};

class OdooService {
  constructor() {
    this.commonClient = xmlrpc.createSecureClient({ 
      url: `${ODOO_CONFIG.url}/xmlrpc/2/common` 
    });
    this.modelsClient = xmlrpc.createSecureClient({ 
      url: `${ODOO_CONFIG.url}/xmlrpc/2/object` 
    });
    
    this.commonAuthenticate = promisify(this.commonClient.methodCall).bind(this.commonClient);
    this.modelsExecute = promisify(this.modelsClient.methodCall).bind(this.modelsClient);
    
    this.uid = null;
  }

  async authenticate() {
    try {
      this.uid = await this.commonAuthenticate('authenticate', [
        ODOO_CONFIG.db, 
        ODOO_CONFIG.username, 
        ODOO_CONFIG.password, 
        {}
      ]);
      
      if (!this.uid) {
        throw new Error('Odoo authentication failed');
      }
      
      console.log('Odoo authentication successful:', this.uid);
      return this.uid;
    } catch (error) {
      console.error('Odoo authentication error:', error);
      throw error;
    }
  }

  async searchLeadByPhone(phone) {
    try {
      if (!this.uid) {
        await this.authenticate();
      }

      const [plainFormat, indianFormat] = getPhoneFormats(phone);

      const leads = await this.modelsExecute('execute_kw', [
        ODOO_CONFIG.db,
        this.uid,
        ODOO_CONFIG.password,
        'crm.lead',
        'search_read',
        [
          [
            '|',
            ['phone', '=', plainFormat],
            ['phone', '=', indianFormat],
          ]
        ],
        {
          fields: [
            'id', 'name', 'phone', 'email_from', 'stage_id'
          ],
        }
      ]);

      return leads.length > 0 ? leads[0] : null;
    } catch (error) {
      console.error('Error searching lead by phone:', error);
      throw error;
    }
  }

  async getAllLeads() {
    try {
      if (!this.uid) {
        await this.authenticate();
      }

      const leads = await this.modelsExecute('execute_kw', [
        ODOO_CONFIG.db,
        this.uid,
        ODOO_CONFIG.password,
        'crm.lead',
        'search_read',
        [[]],
        {
          fields: [
            'id', 'name', 'phone', 'email_from', 'stage_id'
          ],
        }
      ]);

      return leads;
    } catch (error) {
      console.error('Error fetching all leads:', error);
      throw error;
    }
  }

  async getLeadById(leadId) {
    try {
      if (!this.uid) {
        await this.authenticate();
      }

      const leads = await this.modelsExecute('execute_kw', [
        ODOO_CONFIG.db,
        this.uid,
        ODOO_CONFIG.password,
        'crm.lead',
        'search_read',
        [[['id', '=', leadId]]],
        {
          fields: [
            'id', 'name', 'phone', 'email_from', 'stage_id'
          ],
        }
      ]);

      return leads.length > 0 ? leads[0] : null;
    } catch (error) {
      console.error('Error fetching lead by ID:', error);
      throw error;
    }
  }
}

export default new OdooService();