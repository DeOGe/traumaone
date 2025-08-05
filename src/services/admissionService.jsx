import { supabase } from '../supabaseClient'; // Adjust the import path as necessary

/**
 * Queries admissions records, left-joining patient data,
 * with optional search by patient name or hospital registration number.
 *
 * @param {Object} options - Query options.
 * @param {string} [options.searchQuery] - The search term for patient name or registration number.
 * @param {number} [options.limit=10] - The maximum number of records to return.
 * @param {number} [options.offset=0] - The number of records to skip for pagination.
 * @returns {Promise<{data: Array | null, error: Error | null}>} - The query result.
 */
async function queryAdmissionsWithPatients({ searchQuery = 'Mendoza', limit = 10, offset = 0 } = {}) {
  try {
    // Start with the 'admissions' table
    let query = supabase
  .from('admissions')
  .select(`
    id,
    patient_id,
    chief_complaint,
    nature_of_injury,
    date_of_injury,
    time_of_injury,
    place_of_injury,
    history_of_present_illness,
    past_medical_history,
    personal_social_history,
    obstetric_gynecologic_history,
    blood_pressure,
    hr,
    rr,
    spo2,
    temperature,
    physical_examination,
    imaging_findings,
    laboratory,
    diagnosis,
    initial_management,
    surgical_plan,
    created_at,
    status,
    patients (
      id,
      last_name,
      first_name,
      birthdate,
      sex,
      hospital_registration_number,
      created_at,
      blood_type,
      profile_picture
    )
  `);
    // Apply search filter if searchQuery is provided
    if (searchQuery) {
      const searchPattern = `%${searchQuery.toLowerCase()}%`; // Case-insensitive search pattern

      query = query.or(
        `
          patients.first_name.ilike.${searchPattern},
          patients.last_name.ilike.${searchPattern},
          patients.hospital_registration_number.ilike.${searchPattern}
        `
        // Note: For exact matches on hospital_registration_number, use 'eq' instead of 'ilike'
        // e.g., `patients.hospital_registration_number.eq.${searchQuery}`
      );
    }

    // Add pagination
    query = query.range(offset, offset + limit - 1);

    // Execute the query
    const { data, error } = await query;

    if (error) {
      console.error('Error querying admissions:', error.message);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error in queryAdmissionsWithPatients:', error);
    return { data: null, error: new Error('An unexpected error occurred.') };
  }
}


// Export the function for use in other modules
export { queryAdmissionsWithPatients };
