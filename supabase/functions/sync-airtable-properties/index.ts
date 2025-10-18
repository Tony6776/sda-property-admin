import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

// Helper function to parse bedrooms/bathrooms from Amenities string
// Example: "2 Bed / 1 Bth / 1 Family / 1 Meals / 1 Storage / 1 Car Park"
function parseAmenities(amenitiesStr) {
  const bedMatch = amenitiesStr.match(/(\d+)\s*Bed/i);
  const bathMatch = amenitiesStr.match(/(\d+)\s*Bth/i);
  const parkMatch = amenitiesStr.match(/(\d+)\s*Car Park/i);

  return {
    bedrooms: bedMatch ? parseInt(bedMatch[1]) : 0,
    bathrooms: bathMatch ? parseInt(bathMatch[1]) : 0,
    parking: parkMatch ? parseInt(parkMatch[1]) : 0
  };
}

// Helper function to create a short property name from location
// "G02/8 Bond St, Ringwood Vic 3134" → "Ringwood Bond St Apartment"
function createPropertyName(location) {
  const parts = location.split(',');
  if (parts.length >= 2) {
    const streetPart = parts[0].trim();
    const suburbPart = parts[1].trim().split(' ')[0]; // Get first word (suburb name)
    const streetName = streetPart.split(' ').slice(-2).join(' '); // Get last 2 words of street
    return `${suburbPart} ${streetName}`;
  }
  return location.substring(0, 50); // Fallback
}

// Updated field mapping to match actual Airtable structure - v2.1
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    console.log('=== Starting Airtable property sync ===');

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const airtableApiKey = Deno.env.get('AIRTABLE_API_KEY');
    const airtableBaseId = 'appbKYczBetBCdJKs'; // User's Airtable base

    // Sale properties table and view
    const saleTableId = 'tbld4BiS7kMrbScBX';
    const saleViewId = 'viwBCwEQCnkOHuQkP';

    // Lease properties table and view
    const leaseTableId = 'tblu2fcyA4fUuwEZM';
    const leaseViewId = 'viwSAayw57Nh08iIE';

    if (!supabaseUrl || !supabaseServiceKey || !airtableApiKey) {
      throw new Error('Missing required environment variables');
    }

    console.log('Environment variables check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseServiceKey,
      hasAirtableKey: !!airtableApiKey,
      airtableBaseId: airtableBaseId,
      saleTableId: saleTableId,
      leaseTableId: leaseTableId
    });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    async function fetchAirtableView(tableId, viewId, propertyType) {
      console.log(`\n=== Syncing ${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)} properties ===`);
      console.log(`Table: ${tableId}, View: ${viewId}`);

      const airtableUrl = `https://api.airtable.com/v0/${airtableBaseId}/${tableId}?view=${viewId}`;
      console.log('Fetching from:', airtableUrl);

      const airtableResponse = await fetch(airtableUrl, {
        headers: {
          'Authorization': `Bearer ${airtableApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!airtableResponse.ok) {
        const errorText = await airtableResponse.text();
        console.error(`Error fetching ${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)} properties:`, errorText);
        throw new Error(`Airtable API error: ${airtableResponse.status} ${errorText}`);
      }

      const airtableData = await airtableResponse.json();
      console.log(`Fetched ${airtableData.records.length} ${propertyType} properties from Airtable`);

      const properties = airtableData.records.map((record) => {
        const fields = record.fields;

        // Parse amenities to get bedrooms, bathrooms, parking
        const amenities = fields.Amenities ? parseAmenities(fields.Amenities) : {
          bedrooms: 0,
          bathrooms: 0,
          parking: 0
        };

        // Get location (used for both name and address)
        const location = fields.Location || 'Unknown Location';
        const propertyName = createPropertyName(location);

        // Convert status to lowercase
        const status = (fields.Status || 'available').toLowerCase();

        return {
          name: propertyName,
          address: location,
          property_type: propertyType,
          price: fields.Price || null,
          weekly_rent: fields['Weekly Rent'] || null,
          bedrooms: amenities.bedrooms,
          bathrooms: amenities.bathrooms,
          parking: amenities.parking,
          features: fields.Amenities ? [fields.Amenities] : [],
          sda_category: 'High Physical Support',
          status: status,
          property_manager: null,
          rating: null,
          accessibility: {
            airtable_id: record.id,
            images: fields.Images?.map((img) => img.url) || [],
            description: fields.Description || null,
            last_synced: new Date().toISOString(),
            eoi_url: fields.EOI || null,
            ooa: fields.OOA || null
          },
          matching_status: 'active',
          updated_at: new Date().toISOString()
        };
      });

      console.log(`Transformed ${properties.length} ${propertyType} properties`);
      return properties;
    }

    // Clear existing properties by type and insert new ones
    async function syncPropertiesByType(properties, propertyType) {
      // First, get IDs of properties to be deleted
      const { data: existingProperties, error: fetchError } = await supabase
        .from('properties')
        .select('id')
        .eq('property_type', propertyType);

      if (fetchError) {
        console.error(`Error fetching existing ${propertyType} properties:`, fetchError);
        throw fetchError;
      }

      // Delete related property_access_logs first to avoid foreign key constraint
      if (existingProperties && existingProperties.length > 0) {
        const propertyIds = existingProperties.map(p => p.id);
        const { error: logsDeleteError } = await supabase
          .from('property_access_logs')
          .delete()
          .in('property_id', propertyIds);

        if (logsDeleteError) {
          console.error(`Error deleting property_access_logs:`, logsDeleteError);
          // Continue anyway - logs might not exist
        }
      }

      // Now delete properties of this type
      const { error: deleteError } = await supabase
        .from('properties')
        .delete()
        .eq('property_type', propertyType);

      if (deleteError) {
        console.error(`Error clearing existing ${propertyType} properties:`, deleteError);
        throw deleteError;
      }

      if (properties.length === 0) {
        console.log(`No ${propertyType} properties to insert`);
        return 0;
      }

      // Insert new properties
      const { data: insertedProperties, error: insertError } = await supabase
        .from('properties')
        .insert(properties);

      if (insertError) {
        console.error(`Error inserting ${propertyType} properties:`, insertError);
        throw new Error(`Database error: ${insertError.message}`);
      }

      console.log(`Successfully inserted ${properties.length} ${propertyType} properties`);
      return properties.length;
    }

    // Fetch from both Sale and Lease tables
    const saleProperties = await fetchAirtableView(saleTableId, saleViewId, 'sale');
    const leaseProperties = await fetchAirtableView(leaseTableId, leaseViewId, 'lease');

    console.log(`\n=== Syncing Sale Properties ===`);
    const saleSynced = await syncPropertiesByType(saleProperties, 'sale');

    console.log(`\n=== Syncing Lease Properties ===`);
    const leaseSynced = await syncPropertiesByType(leaseProperties, 'lease');

    const totalSynced = saleSynced + leaseSynced;

    console.log(`\n=== Sync Summary ===`);
    console.log(`Sale properties synced: ${saleSynced}`);
    console.log(`Lease properties synced: ${leaseSynced}`);
    console.log(`Total properties synced: ${totalSynced}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully synced ${totalSynced} properties from Airtable (${saleSynced} sale, ${leaseSynced} lease)`,
        total_properties_synced: totalSynced,
        sale_properties_synced: saleSynced,
        lease_properties_synced: leaseSynced,
        timestamp: new Date().toISOString()
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error in sync-airtable-properties function:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
