/**
 * Google Ads Connector & API Client
 */

export async function testGoogleConnection(
  customerId: string,
  developerToken?: string,
  accessToken?: string
): Promise<{ success: boolean; accountName?: string; currency?: string; error?: string }> {
  try {
    const cleanId = customerId.replace(/[^0-9]/g, '');
    if (!cleanId || cleanId.length < 10) {
      return {
        success: false,
        error: 'Identifiant client Google Ads invalide (doit contenir 10 chiffres, ex: 123-456-7890)',
      };
    }

    // In demo / test mode without dev token
    if (!developerToken || !accessToken) {
      return {
        success: true,
        accountName: `Compte Google Ads (${cleanId.slice(0, 3)}-${cleanId.slice(3, 6)}-${cleanId.slice(6)})`,
        currency: 'MAD',
      };
    }

    const url = `https://googleads.googleapis.com/v17/customers/${cleanId}`;
    const res = await fetch(url, {
      headers: {
        'developer-token': developerToken,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error?.message || `Erreur Google Ads API (${res.status})`,
      };
    }

    return {
      success: true,
      accountName: data.descriptiveName || 'Google Ads Account',
      currency: data.currencyCode || 'MAD',
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Impossible de contacter Google Ads API',
    };
  }
}
