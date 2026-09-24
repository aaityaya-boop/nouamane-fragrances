/**
 * Meta Marketing API Client (Facebook & Instagram Ads)
 * Version: Graph API v20.0
 */

export interface MetaCampaignInsight {
  campaign_id: string;
  campaign_name: string;
  spend: string;
  impressions: string;
  clicks: string;
  cpc: string;
  cpm: string;
  ctr: string;
  actions?: Array<{ action_type: string; value: string }>;
  action_values?: Array<{ action_type: string; value: string }>;
  purchase_roas?: Array<{ action_type: string; value: string }>;
}

export interface MetaCampaignDetails {
  id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'DELETED';
  objective: string;
  daily_budget?: string;
  lifetime_budget?: string;
  start_time?: string;
  stop_time?: string;
}

export async function testMetaConnection(
  accountId: string,
  accessToken: string
): Promise<{ success: boolean; accountName?: string; currency?: string; error?: string }> {
  try {
    const cleanAccountId = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
    const url = `https://graph.facebook.com/v20.0/${cleanAccountId}?fields=name,account_status,currency,amount_spent&access_token=${accessToken}`;

    const res = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' } });
    const data = await res.json();

    if (!res.ok || data.error) {
      return {
        success: false,
        error: data.error?.message || `Erreur Meta API (${res.status})`,
      };
    }

    return {
      success: true,
      accountName: data.name || 'Meta Ad Account',
      currency: data.currency || 'USD',
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Impossible de contacter les serveurs Meta Graph API',
    };
  }
}

export async function fetchMetaCampaignsAndInsights(
  accountId: string,
  accessToken: string,
  exchangeRateToMAD = 10.0,
  datePreset: 'today' | 'yesterday' | 'last_7d' | 'last_30d' | 'maximum' = 'last_30d'
) {
  try {
    const cleanAccountId = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
    
    // 1. Fetch campaigns
    const campaignsUrl = `https://graph.facebook.com/v20.0/${cleanAccountId}/campaigns?fields=id,name,status,objective,daily_budget,lifetime_budget,start_time,stop_time&limit=100&access_token=${accessToken}`;
    const campRes = await fetch(campaignsUrl);
    const campData = await campRes.json();

    if (!campRes.ok || campData.error) {
      throw new Error(campData.error?.message || 'Erreur lors de la récupération des campagnes Meta');
    }

    const rawCampaigns: MetaCampaignDetails[] = campData.data || [];

    // 2. Fetch insights
    const insightsUrl = `https://graph.facebook.com/v20.0/${cleanAccountId}/insights?level=campaign&date_preset=${datePreset}&fields=campaign_id,campaign_name,spend,impressions,clicks,cpc,cpm,ctr,actions,action_values,purchase_roas&limit=100&access_token=${accessToken}`;
    const insRes = await fetch(insightsUrl);
    const insData = await insRes.json();
    const insightsList: MetaCampaignInsight[] = insData.data || [];

    const insightsMap = new Map<string, MetaCampaignInsight>();
    insightsList.forEach((ins) => {
      insightsMap.set(ins.campaign_id, ins);
    });

    // 3. Map into unified model
    return rawCampaigns.map((camp) => {
      const insight = insightsMap.get(camp.id);
      const rawSpend = insight ? parseFloat(insight.spend || '0') : 0;
      const spendInMAD = rawSpend * exchangeRateToMAD;

      const impressions = insight ? parseInt(insight.impressions || '0', 10) : 0;
      const clicks = insight ? parseInt(insight.clicks || '0', 10) : 0;
      const ctr = insight ? parseFloat(insight.ctr || '0') : 0;
      const rawCpc = insight ? parseFloat(insight.cpc || '0') : 0;
      const cpcInMAD = rawCpc * exchangeRateToMAD;

      // Extract purchases & revenue
      let purchases = 0;
      let revenue = 0;
      let roas = 0;

      if (insight?.actions) {
        const purchaseAction = insight.actions.find(
          (a) => a.action_type === 'purchase' || a.action_type === 'omni_purchase'
        );
        if (purchaseAction) purchases = parseInt(purchaseAction.value || '0', 10);
      }

      if (insight?.action_values) {
        const purchaseValue = insight.action_values.find(
          (a) => a.action_type === 'purchase' || a.action_type === 'omni_purchase'
        );
        if (purchaseValue) {
          revenue = parseFloat(purchaseValue.value || '0') * exchangeRateToMAD;
        }
      }

      if (insight?.purchase_roas && insight.purchase_roas.length > 0) {
        roas = parseFloat(insight.purchase_roas[0].value || '0');
      } else if (spendInMAD > 0 && revenue > 0) {
        roas = parseFloat((revenue / spendInMAD).toFixed(2));
      }

      const cpaInMAD = purchases > 0 ? parseFloat((spendInMAD / purchases).toFixed(2)) : 0;

      // Smart recommendation
      let recommendation = 'LEARNING';
      if (roas >= 4.0 && purchases >= 3) {
        recommendation = 'SCALE';
      } else if (roas >= 2.2) {
        recommendation = 'OPTIMIZE';
      } else if (spendInMAD > 250 && roas < 1.8) {
        recommendation = 'PAUSE';
      }

      const rawDailyBudget = camp.daily_budget ? parseFloat(camp.daily_budget) / 100 : 0;
      const dailyBudgetMAD = rawDailyBudget * exchangeRateToMAD;

      return {
        externalCampaignId: camp.id,
        name: camp.name,
        status: camp.status === 'ACTIVE' ? 'ACTIVE' : 'PAUSED',
        objective: camp.objective || 'CONVERSIONS',
        dailyBudget: dailyBudgetMAD,
        totalSpend: spendInMAD,
        impressions,
        clicks,
        ctr,
        cpc: cpcInMAD,
        conversions: purchases,
        conversionValue: revenue,
        cpa: cpaInMAD,
        roas,
        recommendation,
        startDate: camp.start_time ? new Date(camp.start_time) : null,
      };
    });
  } catch (err: any) {
    console.error('Meta API fetch error:', err);
    throw err;
  }
}
