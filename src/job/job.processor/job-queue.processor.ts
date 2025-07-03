import axios from 'axios';
import { SandboxedJob } from 'bullmq';
import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import * as yaml from 'yaml';
import { CronExpressionParser } from 'cron-parser';

// Định nghĩa schema Job (tối giản cho update)
const JobSchema = new mongoose.Schema({
  rpt_last_run_ts: Date,
  rpt_last_run_duration: Number,
  rpt_running_status: String,
  rpt_last_update_endpoint: Date,
  rpt_running_count: Number,
  rpt_next_run_ts: Date,
});
const JobModel = mongoose.models.Job || mongoose.model('Job', JobSchema, 'Jobs');

function getMongoConfig() {
  try {
    const file = readFileSync('config.yaml', 'utf8');
    const config = yaml.parse(file);
    console.log('getMongoConfig', config);
    return {
      host: config.MONGO_HOST || process.env.MONGO_HOST || 'localhost',
      port: config.MONGO_PORT || process.env.MONGO_PORT || '27017',
      db: config.MONGO_DB || process.env.MONGO_DB || 'test',
      user: config.MONGO_USER || process.env.MONGO_USER,
      pass: config.MONGO_PASS || process.env.MONGO_PASS,
    };
  } catch (err) {
    // fallback env
    console.error('Error reading config.yaml:', err);
    return {
      host: process.env.MONGO_HOST || 'localhost',
      port: process.env.MONGO_PORT || '27017',
      db: process.env.MONGO_DB || 'test',
      user: process.env.MONGO_USER,
      pass: process.env.MONGO_PASS,
    };
  }
}

// Hàm kết nối MongoDB (chỉ connect 1 lần)
let isConnected = false;
async function connectMongo() {
  if (isConnected) return;
  const { host, port, db, user, pass } = getMongoConfig();
  console.log(`Connecting to MongoDB: ${host}:${port}/${db}`)
  let uri = '';
  if (user && pass) {
    uri = `mongodb://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:${port}/${db}?authSource=admin`;
  } else {
    uri = `mongodb://${host}:${port}/${db}`;
  }
  await mongoose.connect(uri, { dbName: db });
  isConnected = true;
}

const DEFAULT_TTL = 30_000; // 30 giây
const TTL_EXIT_CODE = 10;

// Hàm tiện ích tính lần chạy tiếp theo từ cron expression
function getNextRunFromCron(cronExpr: string, lastRun: Date = new Date()): Date {
  if (!cronExpr) return new Date();
  try {
    const interval = CronExpressionParser.parse(cronExpr, { currentDate: lastRun });
    return interval.next().toDate();
  } catch (e) {
    return new Date();
  }
}

// Kết nối MongoDB một lần khi khởi động process
(async () => {
  await connectMongo();
})();

export default async function (job: SandboxedJob) {
  const MAX_TTL = typeof job.data.timeout === 'number' && job.data.timeout > 0 ? job.data.timeout : DEFAULT_TTL;
  let hasCompleted = false;

  // Promise timeout
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Job timeout')), MAX_TTL)
  );

  try {
    const { id, endpoint, method } = job.data;
    await Promise.race([
      (async () => {
        try {
          console.log(`▶️ [${id}] ${method} ${endpoint}`);
          const jobData = await JobModel.findOne(
            { _id: new mongoose.Types.ObjectId(id) }
          );
          if(!jobData || jobData.rpt_running_status == 'stopped') {

            console.warn(`⚠️ [${id}] Job is  stopped status, skipping.`);
            return;
          }
          const start = Date.now();
          const res = await axios({ method, url: endpoint });
          const duration = Date.now() - start;
          console.log(`✅ [${id}] Status: ${res.status} | Duration: ${duration}ms`);
          // Tính toán next run nếu có cronExpr
          const nextRun = getNextRunFromCron(job.data.cronExpr, new Date());
          // Update trạng thái job thành công
          const updateFields: any = {
            rpt_last_run_ts: new Date(),
            rpt_last_run_duration: duration,
            rpt_running_status: 'waiting',
            rpt_last_update_endpoint: new Date(),
          };
          if (job.data.cronExpr) {
            updateFields.rpt_next_run_ts = nextRun;
          }
          await JobModel.updateOne(
            { _id: new mongoose.Types.ObjectId(id) },
            { $set: updateFields }
          );
          hasCompleted = true;
          return { status: res.status, duration };
        } catch (err) {
          console.error(`❌ [${id}] Failed: ${err.message}`);
          // Tính toán next run nếu có cronExpr
          const nextRunFail = getNextRunFromCron(job.data.cronExpr, new Date());
          const updateFieldsFail: any = {
            rpt_last_run_ts: new Date(),
            rpt_running_status: 'waiting',
            rpt_last_update_endpoint: new Date(),
          };
          if (job.data.cronExpr) {
            updateFieldsFail.rpt_next_run_ts = nextRunFail;
          }
          await JobModel.updateOne(
            { _id: new mongoose.Types.ObjectId(id) },
            { $set: updateFieldsFail }
          );
          hasCompleted = true;
          throw err;
        }
      })(),
      timeoutPromise
    ]);
  } catch (err) {
    // Nếu là timeout, cập nhật trạng thái job về waiting
    if (err.message === 'Job timeout') {
      try {
        const nextRunTimeout = getNextRunFromCron(job.data.cronExpr, new Date());
        const updateFieldsTimeout: any = {
          rpt_last_run_ts: new Date(),
          rpt_running_status: 'waiting',
          rpt_last_update_endpoint: new Date(),
        };
        if (job.data.cronExpr) {
          updateFieldsTimeout.rpt_next_run_ts = nextRunTimeout;
        }
        await JobModel.updateOne(
          { _id: new mongoose.Types.ObjectId(job.data.id) },
          { $set: updateFieldsTimeout }
        );
      } catch (e) {
        console.error('Update on timeout failed:', e);
      }
    }
    throw err;
  }
} 