async function handler({ action }) {
  try {
    switch (action) {
      case "getMetrics": {
        // Get total pageviews
        const totalResult = await sql`
          SELECT COUNT(*) as total FROM pageviews
        `;
        const totalPageviews = totalResult[0].total;

        // Get unique visitors (counting null/anonymous as one visitor)
        const uniqueResult = await sql`
          SELECT COUNT(DISTINCT COALESCE(user_id, 0)) as unique_visitors 
          FROM pageviews
        `;
        const uniqueVisitors = uniqueResult[0].unique_visitors;

        // Get popular pages with proper path formatting
        const popularPages = await sql`
          SELECT page_path as path, COUNT(*) as views 
          FROM pageviews 
          GROUP BY page_path 
          ORDER BY views DESC 
          LIMIT 5
        `;

        // Get recent visits
        const recentVisits = await sql`
          SELECT 
            timestamp, 
            page_path, 
            CASE 
              WHEN user_id IS NULL THEN 'Anonymous'
              ELSE user_id::text
            END as user_id,
            COALESCE(referrer, 'Direct') as referrer
          FROM pageviews 
          ORDER BY timestamp DESC 
          LIMIT 10
        `;

        return {
          totalPageviews,
          uniqueVisitors,
          popularPages,
          recentVisits,
        };
      }
      default:
        return { error: "Invalid action" };
    }
  } catch (error) {
    console.error("Analytics error:", error);
    return { error: "Failed to get analytics" };
  }
}
export async function POST(request) {
  return handler(await request.json());
}