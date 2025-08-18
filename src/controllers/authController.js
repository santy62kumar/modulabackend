// server/src/controllers/authController.js

import odooClient from '../services/external/odoo/odooClient.js';
import { getPhoneFormats } from '../services/utils/phoneUtils.js';
import { HIDDEN_STAGES } from '../constants/stageMapping.js';

/**
 * Get dashboard data - returns all projects for the user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getDashboard = async (req, res) => {
  try {
    const userPhone = req.user.phone; // From JWT middleware

    if (!userPhone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number required'
      });
    }

    console.log(`🔍 Fetching dashboard data for user ${userPhone}`);

    // Fetch leads from Odoo by phone number
    const odooLeads = await odooClient.fetchLeadByPhone(userPhone);

    if (!odooLeads || odooLeads.length === 0) {
      console.log(`⚠️ No leads found for phone ${userPhone}`);
      return res.status(200).json({
        success: true,
        message: 'No projects found for this phone number',
        data: {
          odooLead: null,
          projectCount: 0
        }
      });
    }

    console.log(`✅ Found ${odooLeads.length} projects for phone ${userPhone}`);

    // Return all leads for project list
    res.status(200).json({
      success: true,
      message: 'Dashboard data retrieved successfully',
      data: {
        odooLead: odooLeads, // Array of all projects
        projectCount: odooLeads.length
      }
    });

  } catch (error) {
    console.error('❌ Error in getDashboard:', error);
    
    if (error.message.includes('authenticate')) {
      return res.status(503).json({
        success: false,
        message: 'Unable to connect to project database'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
};

/**
 * Get specific project by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;
    console.log(`🔍 Fetching project by ID: ${projectId}`);
    //const userPhone = req.user.phone; // From JWT middleware

    // Validate project ID
    if (!projectId || isNaN(parseInt(projectId))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID provided'
      });
    }

    console.log(`🔍 Fetching project ${projectId} for user phone no not fetched `);

    // Fetch specific lead from Odoo
    const lead = await odooClient.fetchLeadById(parseInt(projectId));
    console.log(`🔍 Fetched project ${projectId} from Odoo:`, lead);

    if (!lead) {
      console.log(`❌ Project ${projectId} not found in Odoo`);
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Verify user has access to this project (phone number match)
    // const userPhoneFormats = getPhoneFormats(userPhone);
    // const leadPhoneFormats = getPhoneFormats(lead.phone || '');
    
    // Check if any format matches
    // const hasAccess = userPhoneFormats.some(userFormat => 
    //   leadPhoneFormats.includes(userFormat)
    // );

    // if (!hasAccess) {
    //   console.log(`❌ User  denied access to project ${projectId} (phone: ${lead.phone})`);
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Access denied to this project'
    //   });
    // }

    // Check if stage is visible
    const stageId = lead.stage_id?.[0];
    
    console.log(`✅ Project ${projectId} found. Stage: ${stageId}, Name: ${lead.name}`);

    // Return project data
    res.status(200).json({
      success: true,
      data: lead,
      meta: {
        stageVisible: !HIDDEN_STAGES.includes(stageId),
        userHasAccess: true,
        fetchedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error in getProjectById:', error);
    
    // Handle specific Odoo errors
    if (error.message.includes('authenticate')) {
      return res.status(503).json({
        success: false,
        message: 'Unable to connect to project database'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch project details'
    });
  }
};

// Export all controller methods
export default {
  getDashboard,
  getProjectById
};