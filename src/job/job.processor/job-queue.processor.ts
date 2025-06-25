import axios from 'axios';
import { SandboxedJob } from 'bullmq';
export default async function (job: SandboxedJob) {
  const { id, endpoint, method } = job.data;
  try {
    // Dùng console.log thay vì Logger vì khi build ra .js sẽ chạy ở process riêng
    console.log(`▶️ [${id}] ${method} ${endpoint}`);
    const start = Date.now();
    const res = await axios({ method, url: endpoint });
    const duration = Date.now() - start;
    console.log(`✅ [${id}] Status: ${res.status} | Duration: ${duration}ms`);
    return { status: res.status, duration };
  } catch (err: any) {
    console.error(`❌ [${id}] Failed: ${err.message}`);
    throw err;
  }
} 