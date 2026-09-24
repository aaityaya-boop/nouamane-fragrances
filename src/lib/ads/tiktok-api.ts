/**
 * TikTok Marketing API Client
 * Version: Business API v1.3
 */

export interface TikTokCampaign {
  campaign_id: string;
  campaign_name: string;
  operation_status: string; // ENABLE, DISABLE
  objective_type: string;
  budget?: number;
}

export interface TikTokInsight {
  campaign_id: string;
  stat_cost?: string; // spend
  impressions?: string;
  clicks?: string;
  ctr?: string;
  cpc?: string;
  conversion?: string; // purchases
  cost_per_conversion?: string; // CPA
  total_purchase_value?: string;
}

export async function testTikTokConnection(
  advertiserId: string,
  accessToken: string
): Promise<{ success: boolean; accountName?: string; currency?: string; error?: string }> {
  try {
    const url = `https://business-api.tiktok.com/open_api/v1.3/advertiser/info/?advertiser_ids=["${advertiserId}"]`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();

    if (!res.ok || data.code !== 0) {
      return {
        success: false,
        error: data.message || `Erreur TikTok API (code: ${data.code})`,
      };
    }

    const advertiser = data.data?.list?.[0];
    return {
      success: true,
      accountName: advertiser?.name || 'TikTok Business Account',
      currency: advertiser?.currency || 'USD',
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Impossible de contacter les serveurs TikTok Marketing API',
    };
  }
}

export async function fetchTikTokCampaignsAndInsights(
  advertiserId: string,
  accessToken: string,
  exchangeRateToMAD = 10.0
) {
  try {
    // 1. Fetch campaigns
    const campUrl = `https://business-api.tiktok.com/open_api/v1.3/campaign/get/?advertiser_id=${advertiserId}&page_size=100`;
    const campRes = await fetch(campUrl, {
      headers: { 'Access-Token': accessToken, 'Content-Type': 'application/json' },
    });
    const campData = await campRes.json();

    if (!campRes.ok || campData.code !== 0) {
      throw new Error(campData.message || 'Erreur lors de la récupération des campagnes TikTok');
    }

    const rawCampaigns: TikTokCampaign[] = campData.data?.list || [];

    // 2. Fetch basic integrated reporting
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const reportUrl = `https://business-api.tiktok.com/open_api/v1.3/report/integrated/get/?advertiser_id=${advertiserId}&report_type=BASIC&data_level=AUCTION_CAMPAIGN&dimensions=["campaign_id"]&metrics=["stat_cost","impressions","clicks","ctr","cpc","conversion","cost_per_conversion","total_purchase_value"]&start_date=${thirtyDaysAgo}&end_date=${today}&page_size=100`;

    const repRes = await fetch(reportUrl, {
      headers: { 'Access-Token': accessToken, 'Content-Type': 'application/json' },
    });
    const repData = await repRes.json();
    const insightsList: Array<{ dimensions: { campaign_id: string }; metrics: TikTokInsight }> =
      repData.data?.list || [];

    const insightsMap = new Map<string, TikTokInsight>();
    insightsList.forEach((row) => {
      insightsMap.set(row.dimensions.campaign_id, row.metrics);
    });

    // 3. Map into unified structure
    return rawCampaigns.map((camp) => {
      const insight = insightsMap.get(camp.campaign_id);
      const rawSpend = insight ? parseFloat(insight.stat_cost || '0') : 0;
      const spendInMAD = rawSpend * exchangeRateToMAD;

      const impressions = insight ? parseInt(insight.impressions || '0', 10) : 0;
      const clicks = insight ? parseInt(insight.clicks || '0', 10) : 0;
      const ctr = insight ? parseFloat(insight.ctr || '0') : 0;
      const rawCpc = insight ? parseFloat(insight.cpc || '0') : 0;
      const cpcInMAD = rawCpc * exchangeRateToMAD;

      const conversions = insight ? parseInt(insight.conversion || '0', 10) : 0;
      const rawRevenue = insight ? parseFloat(insight.total_purchase_value || '0') : 0;
      const revenueInMAD = rawRevenue * exchangeRateToMAD;

      const cpaInMAD = conversions > 0 ? spendInMAD / conversions : 0;
      const roas = spendInMAD > 0 && revenueInMAD > 0 ? parseFloat((revenueInMAD / spendInMAD).toFixed(2)) : 0;

      let recommendation = 'LEARNING';
      if (roas >= 3.8 && conversions >= 4) {
        recommendation = 'SCALE';
      } else if (roas >= 2.0) {
        recommendation = 'OPTIMIZE';
      } else if (spendInMAD > 200 && roas < 1.6) {
        recommendation = 'PAUSE';
      }

      return {
        externalCampaignId: camp.campaign_id,
        name: camp.campaign_name,
        status: camp.operation_status === 'ENABLE' ? 'ACTIVE' : 'PAUSED',
        objective: camp.objective_type || 'CONVERSIONS',
        dailyBudget: (camp.budget || 0) * exchangeRateToMAD,
        totalSpend: spendInMAD,
        impressions,
        clicks,
        ctr,
        cpc: cpcInMAD,
        conversions,
        conversionValue: revenueInMAD,
        cpa: cpaInMAD,
        roas,
        recommendation,
      };
    });
  } catch (err: any) {
    console.error('TikTok API fetch error:', err);
    throw err;
  }
}
