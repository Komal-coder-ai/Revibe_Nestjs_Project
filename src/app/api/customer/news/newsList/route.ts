/**
 * @swagger
 * /api/customer/news/newsList:
 *   get:
 *     summary: Get news list from Google News RSS
 *     description: Fetches news articles from Google News RSS based on a query string.
 *     tags:
 *       - News
 *     parameters:
 *       - in: query
 *         name: encodedQuery
 *         required: true
 *         schema:
 *           type: string
 *           example: "latest+technology"
 *         description: The search query to encode and send to Google News RSS.
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Number of items per page.
 *     responses:
 *       200:
 *         description: News list fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: boolean
 *                       example: true
 *                     newsList:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                             example: "Sample News Title"
 *                           link:
 *                             type: string
 *                             example: "https://news.example.com/article"
 *                           pubDate:
 *                             type: string
 *                             example: "Mon, 01 Jan 2024 00:00:00 GMT"
 *                           description:
 *                             type: string
 *                             example: "Short description of the news article."
 *                           source:
 *                             type: string
 *                             example: "News Source"
 *                           imageUrl:
 *                             type: string
 *                             example: "https://news.example.com/image.jpg"
  */
import { NextRequest, NextResponse } from 'next/server';

// GET /api/customer/news/newsList?encodedQuery=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url!);
    const encodedQuery = searchParams.get('encodedQuery');
    if (!encodedQuery) {
      return NextResponse.json({ data: { status: false, message: 'encodedQuery is required' } }, { status: 400 });
    }
    // Parse pagination params
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const rssUrl = `https://news.google.com/rss/search?q=${encodedQuery}`;
    const response = await fetch(rssUrl);
    if (!response.ok) {
      return NextResponse.json({ data: { status: false, message: 'Failed to fetch news feed' } }, { status: 500 });
    }
    const xml = await response.text();
    // Simple XML to JSON conversion (for demo, not robust)
    const parseString = (await import('xml2js')).parseStringPromise;
    const json = await parseString(xml);
    // Extract channel image URL for fallback
    const channelImageUrl = json.rss?.channel?.[0]?.image?.[0]?.url?.[0] || '';
    const items = json.rss?.channel?.[0]?.item || [];
    const newsListAll = items.map((item: any) => {
      let imageUrl = '';
      if (item['media:content'] && item['media:content'][0]?.$.url) {
        imageUrl = item['media:content'][0].$.url;
      } else if (item.enclosure && item.enclosure[0]?.$.url) {
        imageUrl = item.enclosure[0].$.url;
      } else if (item.description?.[0]) {
        const match = item.description[0].match(/<img[^>]+src=["']([^"'>]+)["']/i);
        if (match && match[1]) imageUrl = match[1];
      }
      // Fallback to channel image if no image found
      if (!imageUrl) {
        imageUrl = channelImageUrl;
      }
      return {
        title: item.title?.[0] || '',
        link: item.link?.[0] || '',
        pubDate: item.pubDate?.[0] || '',
        description: item.description?.[0] || '',
        source: item.source?.[0]._ || '',
        imageUrl,
      };
    });
    // Pagination logic
    const total = newsListAll.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const newsList = newsListAll.slice(start, end);
    return NextResponse.json({
      data: {
        status: true,
        newsList: newsList,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching news list:', error);
    const message = (error instanceof Error) ? error.message : 'Internal server error';
    return NextResponse.json({ data: { status: false, message } }, { status: 500 });
  }
}
