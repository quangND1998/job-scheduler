const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017'; // Sửa lại nếu cần
const dbName = 'job-scheduler';
const collectionName = 'jobs';

const TOTAL_JOBS = 100; // Số lượng job muốn tạo

function randomCron() {
  // Sinh cron random: mỗi 5-60 giây, phút, giờ
  const seconds = [5, 10, 15, 20, 30, 45, 50, 55, 0][Math.floor(Math.random() * 9)];
  const minutes = [0, 5, 10, 15, 20, 30, 45, 50, 55][Math.floor(Math.random() * 9)];
  const hours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12][Math.floor(Math.random() * 13)];
  return `${seconds} ${minutes} ${hours} * * *`;
}

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const jobs = db.collection(collectionName);

  const jobsToInsert = [];

  for (let i = 0; i < TOTAL_JOBS; i++) {
    jobsToInsert.push({
      job_id: `BULK_JOB_${i}`,
      d_api_description: `Test job số ${i}`,
      d_endpoint: "https://httpbin.org/post",
      d_invocation_method: "POST",
      d_fix_cron: randomCron(),
      conf_inuse: true,
      rpt_running_status: "waiting",
      job_bean: "httpbinExecutor",
      rpt_running_count: 0
    });
  }

  const result = await jobs.insertMany(jobsToInsert);
  console.log(`Đã thêm ${result.insertedCount} job vào MongoDB!`);
  await client.close();
}

main().catch(console.error); 