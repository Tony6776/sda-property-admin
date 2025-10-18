import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  validateContactForm, 
  checkRateLimit, 
  generateFormToken, 
  validateFormToken,
  ValidationResult 
} from '@/lib/security';

interface SecureFormState {
  data: Record<string, string>;
  errors: Record<string, string>; // Changed from string[] to match ValidationResult
  isSubmitting: boolean;
  isSubmitted: boolean;
  formToken: string;
}

interface UseSecureFormOptions {
  formType: string;
  onSubmit?: (sanitizedData: Record<string, string>) => Promise<void> | void;
  resetOnSubmit?: boolean;
  enableSusieAI?: boolean;
}

const submitToGHL = async (formData: Record<string, string>, formType: string) => {
  console.log('=== submitToGHL called ===', { formData, formType });
  
  // Map form data to GHL contact structure
  const ghlContactData = {
    firstName: formData.firstName || '',
    lastName: formData.lastName || '',
    email: formData.email || '',
    phone: formData.phone || '',
    source: "sdabyhomelander.com.au",
    tags: formType === 'consultation' 
      ? ["consultation-request", "sda-consultation"] 
      : ["website-contact", "sda-inquiry"],
    customFields: {
      inquiry_type: formData.inquiryType || formData.consultationType || 'General',
      message: formData.message || '',
      form_type: formType,
      submission_date: new Date().toISOString(),
      ...(formType === 'consultation' && {
        preferred_date: formData.preferredDate || '',
        preferred_time: formData.preferredTime || '',
        consultation_type: formData.consultationType || '',
        current_situation: formData.currentSituation || '',
        has_ndis_plan: formData.hasNdisPlan || '',
        has_sda_funding: formData.hasSdaFunding || '',
        location: formData.location || '',
        urgency: formData.urgency || ''
      })
    },
    formType
  };

  console.log('GHL contact data prepared:', ghlContactData);

  try {
    console.log('Making fetch request to Supabase edge function...');
    const response = await fetch('https://bqvptfdxnrzculgjcnjo.supabase.co/functions/v1/submit-to-ghl', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxdnB0ZmR4bnJ6Y3VsZ2pjbmpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMjY5NDAsImV4cCI6MjA2OTgwMjk0MH0.I10e1TQkVntpEm3KSXmydNJQLbhJQ3MU4SyMt1lOvOk'
      },
      body: JSON.stringify(ghlContactData)
    });

    console.log('Response received:', { status: response.status, statusText: response.statusText });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log('Error response data:', errorData);
      throw new Error(errorData.error || `GHL API responded with status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Successfully submitted to GHL:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('GHL submission failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'GHL API error' };
  }
};

const submitToSusieAI = async (formData: Record<string, string>, formType: string) => {
  const enhancedData = {
    ...formData,
    timestamp: new Date().toISOString(),
    source: "sdabyhomelander.com.au",
    formType: formType,
    fullName: `${formData.firstName || ''} ${formData.lastName || ''}`.trim()
  };

  try {
    const response = await fetch('http://localhost:8092/api/inquiries', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(enhancedData)
    });

    if (!response.ok) {
      throw new Error(`SUSIE AI responded with status: ${response.status}`);
    }

    console.log('Successfully submitted to SUSIE AI:', enhancedData);
    return { success: true, data: enhancedData };
  } catch (error) {
    console.error('SUSIE AI submission failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'SUSIE AI error' };
  }
};

const logEmailBackup = (formData: Record<string, string>, formType: string) => {
  const fullName = `${formData.firstName || ''} ${formData.lastName || ''}`.trim();
  console.log('Email backup needed for:', {
    to: 'tony@homelander.com.au',
    subject: `New Website Inquiry - ${formType} - ${fullName}`,
    data: formData
  });
};

export const useSecureForm = (options: UseSecureFormOptions) => {
  const { formType, onSubmit, resetOnSubmit = true, enableSusieAI = true } = options;
  const { toast } = useToast();
  
  const [state, setState] = useState<SecureFormState>({
    data: {},
    errors: {}, // Changed from [] to {}
    isSubmitting: false,
    isSubmitted: false,
    formToken: generateFormToken()
  });

  const updateField = useCallback((field: string, value: string) => {
    setState(prev => ({
      ...prev,
      data: { ...prev.data, [field]: value },
      // Remove error for this specific field
      errors: Object.fromEntries(
        Object.entries(prev.errors).filter(([key]) => key !== field)
      )
    }));
  }, []);

  const validateForm = useCallback((): ValidationResult => {
    // Basic validation for now - can be extended for different form types
    return validateContactForm(state.data);
  }, [state.data]);

  const submitForm = useCallback(async (e?: React.FormEvent) => {
    console.log('=== FORM SUBMISSION STARTED ===', { formType, isSubmitting: state.isSubmitting });
    
    if (e) {
      e.preventDefault();
    }

    // Check if already submitting
    if (state.isSubmitting) {
      console.log('Form already submitting, returning early');
      return;
    }

    setState(prev => ({ ...prev, isSubmitting: true, errors: {} })); // Changed from [] to {}
    console.log('Form state updated to submitting');

    try {
      // Rate limiting check
      if (!checkRateLimit(formType)) {
        throw new Error('Too many submissions. Please wait a few minutes before trying again.');
      }
      console.log('Rate limit check passed');

      // Token validation
      if (!validateFormToken(state.formToken)) {
        throw new Error('Form session expired. Please refresh the page and try again.');
      }
      console.log('Token validation passed');

      // Form validation
      const validation = validateForm();
      console.log('Form validation result:', { isValid: validation.isValid, errors: validation.errors });
      
      if (!validation.isValid) {
        setState(prev => ({ 
          ...prev, 
          errors: validation.errors,
          isSubmitting: false 
        }));
        
        toast({
          title: "Validation Error",
          description: validation.errors[0],
          variant: "destructive"
        });
        return;
      }

      console.log('=== STARTING TRIPLE SUBMISSION ===');
      // Triple submission strategy: GHL → SUSIE AI → Email backup
      let submissionSuccess = false;
      let primaryError = null;

      // 1. Primary: Submit to GoHighLevel
      console.log('Attempting GHL submission...');
      try {
        const ghlResult = await submitToGHL(validation.sanitizedData, formType);
        console.log('GHL submission result:', ghlResult);
        if (ghlResult.success) {
          submissionSuccess = true;
          console.log('Primary submission (GHL) succeeded');
        } else {
          primaryError = ghlResult.error;
          console.log('Primary submission (GHL) failed:', primaryError);
        }
      } catch (error) {
        primaryError = error instanceof Error ? error.message : 'GHL submission failed';
        console.error('Primary submission (GHL) failed:', primaryError);
      }

      // 2. Secondary: Submit to SUSIE AI if enabled and GHL failed
      if (!submissionSuccess && enableSusieAI) {
        console.log('Attempting SUSIE AI submission...');
        try {
          const susieResult = await submitToSusieAI(validation.sanitizedData, formType);
          console.log('SUSIE AI submission result:', susieResult);
          if (susieResult.success) {
            submissionSuccess = true;
            console.log('Secondary submission (SUSIE AI) succeeded');
          }
        } catch (error) {
          console.error('Secondary submission (SUSIE AI) failed:', error);
        }
      }

      // 3. Fallback: Log email backup if both primary methods failed
      if (!submissionSuccess) {
        logEmailBackup(validation.sanitizedData, formType);
        console.log('Both primary and secondary submissions failed, email backup logged');
      }

      // Call submit handler if provided
      if (onSubmit) {
        await onSubmit(validation.sanitizedData);
      }

      // Success
      setState(prev => ({
        ...prev,
        isSubmitted: true,
        isSubmitting: false,
        data: resetOnSubmit ? {} : prev.data,
        formToken: generateFormToken() // Generate new token for security
      }));

      toast({
        title: "Form Submitted Successfully",
        description: "Thank you for your submission. We'll get back to you soon.",
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      setState(prev => ({ 
        ...prev, 
        errors: { general: errorMessage }, // Changed to Record format
        isSubmitting: false 
      }));

      toast({
        title: "Submission Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [state.isSubmitting, state.formToken, formType, validateForm, onSubmit, resetOnSubmit, toast]);

  const resetForm = useCallback(() => {
    setState({
      data: {},
      errors: {}, // Changed from [] to {}
      isSubmitting: false,
      isSubmitted: false,
      formToken: generateFormToken()
    });
  }, []);

  const getFieldError = useCallback((field: string) => {
    // Direct field lookup or find any error containing the field name
    return state.errors[field] || Object.entries(state.errors).find(([key, error]) => 
      key.toLowerCase().includes(field.toLowerCase()) || 
      error.toLowerCase().includes(field.toLowerCase())
    )?.[1];
  }, [state.errors]);

  return {
    formData: state.data,
    errors: state.errors,
    isSubmitting: state.isSubmitting,
    isSubmitted: state.isSubmitted,
    formToken: state.formToken,
    updateField,
    submitForm,
    resetForm,
    getFieldError,
    hasErrors: Object.keys(state.errors).length > 0 // Changed from length to Object.keys().length
  };
};