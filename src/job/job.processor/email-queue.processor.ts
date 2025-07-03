import axios from 'axios';
import { SandboxedJob } from 'bullmq';
export default async function (job: SandboxedJob) {
  const { test } = job.data;
  // console.log(test);
  try {
    // console.log(`📨 [${test}] Sending email...`);
  } catch (err: any) {
    console.error(`❌  ${err.message}`);
    throw err;
  }
} 