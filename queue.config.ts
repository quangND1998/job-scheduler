export default {
  jobQueue: {
    name: 'job-queue',
    path: '/job.processor/job-queue.processor.js',
    concurrency: 30,
    // limiter: {
    //   max: 300,
    //   duration: 1000,
    // },
  },
  emailQueue: {
    name: 'email-queue',
    path: '/job.processor/email-queue.processor.js',
    concurrency: 1,
  },
};