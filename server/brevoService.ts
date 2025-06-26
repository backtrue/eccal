import { ApiClient, ContactsApi, CreateContact, UpdateContact, RemoveContactFromList } from '@getbrevo/brevo';

export interface BrevoContact {
  email: string;
  firstName?: string;
  lastName?: string;
  gaResourceName?: string;
}

export class BrevoService {
  private apiInstance: ContactsApi | null = null;
  private readonly listId = 15; // Brevo list #15

  constructor() {
    console.log('Initializing Brevo service...');
    console.log('BREVO_API_KEY exists:', !!process.env.BREVO_API_KEY);
    
    if (!process.env.BREVO_API_KEY) {
      console.warn('BREVO_API_KEY not found, Brevo integration will be disabled');
      return;
    }

    try {
      // Proper Brevo API initialization
      const defaultClient = brevo.ApiClient.instance;
      const apiKey = defaultClient.authentications['api-key'];
      apiKey.apiKey = process.env.BREVO_API_KEY;
      
      this.apiInstance = new brevo.ContactsApi();
      console.log('Brevo service initialized successfully');
    } catch (error) {
      console.log('Primary initialization failed, using fallback method...');
      
      // Fallback: Just create the ContactsApi without setting up ApiClient.instance
      try {
        this.apiInstance = new brevo.ContactsApi();
        console.log('Brevo service initialized with fallback method');
      } catch (altError) {
        console.log('Brevo service initialization failed completely, service will be disabled');
        this.apiInstance = null;
      }
    }
  }

  async addContactToList(contact: BrevoContact): Promise<void> {
    if (!this.apiInstance) {
      console.log('Brevo service not initialized, skipping contact addition');
      return;
    }

    try {
      console.log(`Adding contact to Brevo list #${this.listId}:`, {
        email: contact.email,
        firstName: contact.gaResourceName,
        hasFirstName: !!contact.firstName,
        hasLastName: !!contact.lastName
      });

      const createContact = new CreateContact();
      createContact.email = contact.email;
      createContact.listIds = [this.listId];
      
      // Store GA resource name in FIRSTNAME field as requested
      createContact.attributes = {
        FIRSTNAME: contact.gaResourceName || contact.firstName || '',
        LASTNAME: contact.lastName || ''
      };

      // Direct API call with fetch
      const result = await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'api-key': process.env.BREVO_API_KEY!
        },
        body: JSON.stringify({
          email: contact.email,
          attributes: {
            FIRSTNAME: contact.gaResourceName || contact.firstName || '',
            LASTNAME: contact.lastName || ''
          },
          listIds: [this.listId]
        })
      });

      if (!result.ok) {
        const errorText = await result.text();
        throw new Error(`Brevo API error: ${result.status} - ${errorText}`);
      }
      console.log('Contact added to Brevo successfully:', result);
      
    } catch (error: any) {
      // Check if contact already exists
      if (error.message.includes('400') && (error.message.includes('duplicate') || error.message.includes('already exists'))) {
        console.log('Contact already exists in Brevo, updating...');
        await this.updateContact(contact);
      } else {
        console.error('Error adding contact to Brevo:', error);
        throw error;
      }
    }
  }

  private async updateContact(contact: BrevoContact): Promise<void> {
    if (!this.apiInstance) {
      console.log('Brevo service not initialized, skipping contact update');
      return;
    }

    try {
      const updateContact = new UpdateContact();
      updateContact.listIds = [this.listId];
      updateContact.attributes = {
        FIRSTNAME: contact.gaResourceName || contact.firstName || '',
        LASTNAME: contact.lastName || ''
      };

      // Direct API call with fetch for update
      const result = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(contact.email)}`, {
        method: 'PUT',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'api-key': process.env.BREVO_API_KEY!
        },
        body: JSON.stringify({
          attributes: {
            FIRSTNAME: contact.gaResourceName || contact.firstName || '',
            LASTNAME: contact.lastName || ''
          },
          listIds: [this.listId]
        })
      });

      if (!result.ok) {
        const errorText = await result.text();
        throw new Error(`Brevo API error: ${result.status} - ${errorText}`);
      }
      console.log('Contact updated in Brevo successfully');
      
    } catch (error) {
      console.error('Error updating contact in Brevo:', error);
      throw error;
    }
  }

  async removeContactFromList(email: string): Promise<void> {
    if (!this.apiInstance) {
      console.log('Brevo service not initialized, skipping contact removal');
      return;
    }

    try {
      const removeContact = new RemoveContactFromList();
      removeContact.emails = [email];

      // API key is already set in the apiInstance during initialization

      await this.apiInstance.removeContactFromList(this.listId, removeContact);
      console.log('Contact removed from Brevo list successfully');
      
    } catch (error) {
      console.error('Error removing contact from Brevo:', error);
      throw error;
    }
  }
}

export const brevoService = new BrevoService();