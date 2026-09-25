const token = "EAAYMrrEJRYgBSqaBYRx1KZCiZBP0eh4nubJXdTZCnWckPdgRMD8C986BldZB1ttBXxHkIPA1zUxB7g82GmgUZBuj62efACFZCkJZC7gfZCsExZCgyrvJ5H2xP8tZBMdza9PbjHEdipiVHZBZC6phH1KKdiMWDpZAkoAT11yM7RrcZChEnhDfXnn3AWgiV3IxHhfKgvpenjrQZDZD";

async function testToken() {
  // 1. Inspect token permissions via /me/permissions
  try {
    const res = await fetch(`https://graph.facebook.com/v20.0/me/permissions?access_token=${token}`);
    const data = await res.json();
    console.log("TOKEN PERMISSIONS:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Perm error:", e);
  }

  // 2. Check which ad accounts this token has access to via /me/adaccounts
  try {
    const res = await fetch(`https://graph.facebook.com/v20.0/me/adaccounts?fields=id,name,account_id,account_status,currency&access_token=${token}`);
    const data = await res.json();
    console.log("ACCESSIBLE AD ACCOUNTS:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("AdAccounts error:", e);
  }

  // 3. Test the specific ID entered
  try {
    const res = await fetch(`https://graph.facebook.com/v20.0/act_27501638836175375?fields=name,currency&access_token=${token}`);
    const data = await res.json();
    console.log("SPECIFIC ID TEST:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Specific test error:", e);
  }
}

testToken();
