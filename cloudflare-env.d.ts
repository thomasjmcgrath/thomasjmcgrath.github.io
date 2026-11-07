declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    HIPPO_SKYSCANNER_API_KEY?: string;
    HIPPO_STANDALONE?: string;
    HIPPO_MAINTENANCE_TOKEN?: string;
    HIPPO_ADMIN_USER_ID?: string;
    HIPPO_TRENDS_FEED_URL?: string;
    HIPPO_TRENDS_FEED_TOKEN?: string;
  }
}
