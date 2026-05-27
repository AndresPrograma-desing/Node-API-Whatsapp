import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import {Db_Responses} from '../constant/TEXT.js';
 
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL; 
const SUPABASE_KEY = process.env.SUPABASE_KEY; 
 
if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error(Db_Responses.envError);
    process.exit(1);  
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * @param {string} apiKey 
 * @returns {object|null} 
 */
export const findClientByApiKey = async (apiKey) => {
    try {
        const { data, error } = await supabase
            .from('tenants') 
            .select('id, name') 
            .eq('api_key', apiKey)
            .single(); 

        if (error) {
            if (error.code === 'PGRST116') return null;  
            // console.error(Db_Responses.findClientError, error.message);
            throw error;
        }

        return data; 
    } catch (err) {
        // console.error(Db_Responses.findClientError, err.message);
        return null;
    }
};

/**
 * @returns {Array|null}  
 */
export const getAllClients = async () => {
    try {
        const { data, error } = await supabase
            .from('tenants') 
            .select('id, name, created_at') 
            .order('created_at', { ascending: false }); 

        if (error) {
            // console.error(Db_Responses.getAllClientsError, error.message);
            throw error;
        }

        return data; 
    } catch (err) {
        // console.error(Db_Responses.getAllClientsError, err.message);
        return null;
    }
};

/**
 * @param {string} id 
 * @param {string} name 
 * @param {string} apiKey 
 */
export const createNewTenant = async (id, name, apiKey) => {
    try {
        const { data, error } = await supabase
            .from('tenants')
            .insert([
                { id: id.trim(), name: name.trim(), api_key: apiKey }
            ])
            .select();

        if (error) {
            // console.error(Db_Responses.createTenantError, error.message);
            throw error;
        }

        return data[0];
    } catch (err) {
        // console.error(Db_Responses.createTenantError, err.message);
        return null;
    }
};

/**
 * @param {string} clientId
 * @param {string} apiKey
 * @returns {boolean}
 */
export const doesApiKeyBelongToClient = async (clientId, apiKey) => {
    try {
        const { data, error } = await supabase
            .from('tenants')
            .select('id')
            .eq('id', clientId)
            .eq('api_key', apiKey)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return false;
            throw error;
        }

        return Boolean(data);
    } catch (_err) {
        return false;
    }
};