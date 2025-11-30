// 这是一个独立的 Worker 脚本，需要单独部署
// 它不依赖 axios (体积大)，改用原生 fetch

export default {
  // 1. 定时任务入口 (Cron Trigger)
  async scheduled(event, env, ctx) {
    ctx.waitUntil(scrapeLogic(env));
  },

  // 2. HTTP 请求入口 (用于手动触发测试)
  async fetch(request, env, ctx) {
    const result = await scrapeLogic(env);
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

async function scrapeLogic(env) {
  const roomId = env.ROOM_ID;
  // 优先使用完整 URL，否则尝试拼接
  const roomUrl = env.ROOM_URL || `https://yktyd.ecust.edu.cn/epay/wxpage/wanxiao/eleresult?sysid=1&areaid=3&buildid=20&roomid=${roomId}`;

  if (!roomId) {
    return { success: false, error: "ROOM_ID not set" };
  }

  // 1. 初始化数据库表 (如果不存在)
  // 在 Worker 中做这个检查有点多余，最好在部署时手动初始化一次，但为了保险起见保留
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS electricity (
      timestamp TEXT,
      room_id TEXT,
      kWh REAL,
      UNIQUE(timestamp, room_id)
    );
  `).run();

  try {
    // 2. 抓取网页
    console.log(`Scraping: ${roomUrl}`);
    const response = await fetch(roomUrl, {
      headers: {
        // Cloudflare Worker 的 fetch 会自带 CF 的 UA，有时候需要伪装
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    const text = await response.text();
    // 正则支持负数
    const regex = /(-?\d+(\.\d+)?)度/;
    const match = text.match(regex);

    if (match && match[1]) {
      const kwh = parseFloat(match[1]);
      const timestamp = new Date().toISOString();

      // 3. 写入 D1 数据库
      await env.DB.prepare(
        "INSERT OR IGNORE INTO electricity (timestamp, room_id, kWh) VALUES (?, ?, ?)"
      ).bind(timestamp, roomId, kwh).run();

      return { success: true, room: roomId, kwh: kwh, time: timestamp };
    } else {
      return { success: false, error: "Parse error", raw: text.substring(0, 100) };
    }
  } catch (e) {
    return { success: false, error: e.message };
  }
}