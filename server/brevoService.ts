import * as brevo from '@getbrevo/brevo';

export interface BrevoContact {
  email: string;
  firstName?: string;
  lastName?: string;
  gaResourceName?: string;
}

export class BrevoService {
  private apiInstance: brevo.ContactsApi | null = null;
  private readonly listId = 15; // Brevo list #15

  constructor() {
    console.log('Initializing Brevo service...');
    console.log('BREVO_API_KEY exists:', !!process.env.BREVO_API_KEY);
    
    if (!process.env.BREVO_API_KEY) {
      console.warn('BREVO_API_KEY not found, Brevo integration will be disabled');
      return;
    }

    try {
      const defaultClient = brevo.ApiClient.instance;
      const apiKey = defaultClient.authentications['api-key'];
      apiKey.apiKey = process.env.BREVO_API_KEY;
      
      this.apiInstance = new brevo.ContactsApi();
      console.log('Brevo service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Brevo service:', error);
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

      const createContact = new brevo.CreateContact();
      createContact.email = contact.email;
      createContact.listIds = [this.listId];
      
      // Store GA resource name in FIRSTNAME field as requested
      createContact.attributes = {
        FIRSTNAME: contact.gaResourceName || contact.firstName || '',
        LASTNAME: contact.lastName || ''
      };

      const result = await this.apiInstance.createContact(createContact);
      console.log('Contact added to Brevo successfully:', result);
      
    } catch (error: any) {
      // Check if contact already exists
      if (error.status === 400 && error.response?.text?.includes('Contact already exist')) {
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
      const updateContact = new brevo.UpdateContact();
      updateContact.listIds = [this.listId];
      updateContact.attributes = {
        FIRSTNAME: contact.gaResourceName || contact.firstName || '',
        LASTNAME: contact.lastName || ''
      };

      await this.apiInstance.updateContact(contact.email, updateContact);
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
      const removeContact = new brevo.RemoveContactFromList();
      removeContact.emails = [email];

      await this.apiInstance.removeContactFromList(this.listId, removeContact);
      console.log('Contact removed from Brevo list successfully');
      
    } catch (error) {
      console.error('Error removing contact from Brevo:', error);
      throw error;
    }
  }
}

export const brevoService = new BrevoService();