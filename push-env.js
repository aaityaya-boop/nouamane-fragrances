const { execSync } = require('child_process');

const envs = {
  NEXT_PUBLIC_FIREBASE_API_KEY: "AIzaSyBdfSkSz3odSimB55JVDa3_fIbzv9BakYE",
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "nay-perfumes-68f5b.firebaseapp.com",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "nay-perfumes-68f5b",
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "nay-perfumes-68f5b.firebasestorage.app",
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "350800318725",
  NEXT_PUBLIC_FIREBASE_APP_ID: "1:350800318725:web:35a87289e2ef0c7267676c",
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: "G-CZWG6R7DSX",
  FIREBASE_PROJECT_ID: "nay-perfumes-68f5b",
  FIREBASE_CLIENT_EMAIL: "firebase-adminsdk-fbsvc@nay-perfumes-68f5b.iam.gserviceaccount.com",
  FIREBASE_PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCn1C2sC3C1tGkJ\nHJ4FNeuE1VuScbBlbWi5ddbiah/ygZgQxiIv6x+QfQ8EMkUC4VGxJwjrJiGyiv9+\na987bRZhA9igFn8xb/QjNweWFfZL7KhetUdaBes6dyTF5Qm11Qkb5yuEpEzyQcsU\nploD60re0ybzkqpbdgCmZfggt8Et8z8uyStpr6+pzV1Dyoh6+o0mZXFSRwJCJYx2\nppjilNalqjGHK/7dO/UIsI3JhJ004Y1Cb9ZDNHYVSKZl5AdQZxnZaSdrIe2+MfOl\ngK2PrXZvw/31baYbVyMTBqpXm2PxAqJDV65oPurIueOFGms1Lm8lsp1FM3mfi9eq\ni/XvymoLAgMBAAECggEAFcoJtqEy8Zm0sVwnyqFk1zV5fW/ek6yQFiljIWOJ4PWh\nBTx+ynM1ATtbVxN3u5dUAIitiGoboeSYpeniF624DsHDFDXCLxb2lBkxlkjPq1fU\ncZyzi3qNPw/3lEHXmuXybXmmlW1cwsR2q1MAXis5kz3IJtjPNASuskE25SM2T31k\nJIkMwfZ18qS/huaDXdVYeUVwfSSJgh+Cv+KSWUNyghRq3WFZcyk+tMLGq1yXWWgW\nIqyt/BBBh09appKd5F22KesdU00zmw1VlvZYyPnx3ag+eXJ5S0855aqzD6GHRiaj\n/NgeNNdItlzyvQyDxlRoWQNKP7ThWl5RXQlw4rIKsQKBgQDQQkBoMYEXlO+nkUCT\n9btisOK7FWMVXd+9BAMU0jTjekN5vjfIFCY69E0M9k5XMnKSAOdUPt/uBkrKv20z\nxyVHaL1PZ8XHqCkuWJtBFGjs45GQNURmlou/wEY0opmFLZC+TTIDPjAqLIc2eQTN\nCXTWGcfzr++IBupPnjixVR1hNQKBgQDOTUcxuoCNvQ0kSaJq+PW5bw32KkkokHrb\nhVVIYFoj0wm9peLb4y3w25md4onajxjYohFdG6FdpiRe2gkD04YQOtZZb0vQeJIm\nB/V1KruoBxbDyeF6ecRZ+CwMiHsdDZoP+/X1jPBRW/FA+ZLGYbcwyFUINOm7LnQ1\nXlaUc29GPwKBgEzZpdrNKc4B783uE96Ft3hbvc87vSyNT5r4eAqe51VqMKwkPYFf\nrhvjOuulmJMk0pJ+Mt8rtIapW8Alk66ftmn7hKBgsuNScp/foqsJVQ7Vi0mj3nHc\n7AT+dunFdtFmVxticSoxMKTfeaXoUpU3AB5htR9/tOyFYMGwqUsHFahhAoGBAKY8\nXRb0KqyL3vATqZ27OP4QP9bRYhwet/D18q+cfGYLovi/mBsJZ7aCrbksl1qXHjVJ\n+uXk4tV8kCgiV0tPAeNIFfsBFL1KurGMjjy4j3gpJi3kGh2/yvmYYZ5Dx7i0giVJ\nKXuQ8wEMLk3mDWBv0tarRuGTCZg8KYXrm6aJkeuvAoGAfOG8xdPg5YS4zeuLlKlJ\nRwNatNFE2fPZ2Wfq1Y6w7dE081tC/0dRWoPsrY0KcCIvlKAosUr5Qd3xCyupzOCv\n7pVrsW/9XWk4EqKIPb6Wf6HFGRbNPxIDk6N44czKRHnZNbr6XYhsYVEBiwKyaTjh\nWzpkrLm54MOIbsvsXfRsq/Y=\n-----END PRIVATE KEY-----\n"
};

for (const [key, value] of Object.entries(envs)) {
  console.log(`Setting ${key}...`);
  try {
    // Write value to a temp file, then pipe it. This avoids quoting issues in powershell/cmd.
    require('fs').writeFileSync('temp_env_val.txt', value);
    execSync(`type temp_env_val.txt | npx vercel env add ${key} production`, { stdio: 'inherit' });
  } catch (e) {
    console.error(`Failed to set ${key}`, e.message);
  }
}
require('fs').unlinkSync('temp_env_val.txt');
console.log('Done!');
