<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

# Job Scheduler (NestJS + Bull + MongoDB + Redis)

## Mô tả
Hệ thống Job Scheduler sử dụng NestJS, Bull queue, MongoDB và Redis để quản lý, lập lịch và thực thi các job theo cron expression.

---

## Yêu cầu hệ thống
- Node.js >= 18
- MongoDB >= 4.x
- Redis >= 5.x
- npm >= 8.x

---

## Cài đặt

### 1. Clone project
```bash
git clone <your-repo-url>
cd job-scheduler
```

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Cài đặt & chạy MongoDB, Redis
- **MongoDB:**
  - Cài bản local hoặc dùng Docker:
    ```bash
    docker run -d -p 27017:27017 mongo
    ```
- **Redis:**
  - Cài bản local hoặc dùng Docker:
    ```bash
    docker run -d -p 6379:6379 redis
    ```

### 4. Cấu hình biến môi trường
Tạo file `.env` ở thư mục gốc (nếu cần):
```env
MONGO_URI=mongodb://localhost:27017/job-scheduler
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## Chạy project

### 1. Chạy ở chế độ phát triển (hot reload)
```bash
npm run start:dev
```

### 2. Build và chạy production
```bash
npm run build
npm run start:prod
```

---

## Dashboard quản lý job (bull-board)
- Truy cập: [http://localhost:3000/admin/queues](http://localhost:3000/admin/queues)
- Xem, retry, xóa, theo dõi trạng thái các job trong queue.

---

## Thêm job mẫu vào MongoDB
- Có thể dùng MongoDB Compass hoặc script `seed-many-jobs.js`:
```bash
node seed-many-jobs.js
```
- Hoặc Insert Document thủ công với các trường như:
```json
{
  "job_id": "JOB_5S_1",
  "d_api_description": "Chạy mỗi 5 giây - 1",
  "d_endpoint": "https://httpbin.org/post",
  "d_invocation_method": "POST",
  "d_fix_cron": "*/5 * * * * *",
  "conf_inuse": true,
  "rpt_running_status": "waiting",
  "job_bean": "httpbinExecutor",
  "rpt_running_count": 0
}
```

---

## Một số lệnh hữu ích
- Chạy script seed nhiều job:
  ```bash
  node seed-many-jobs.js
  ```
- Xem log:
  ```bash
  npm run start:dev
  ```
- Build Docker image:
  ```bash
  docker build -t job-scheduler-app .
  ```
- Chạy bằng Docker:
  ```bash
  docker run -d -p 3000:3000 \
    -e MONGO_URI=mongodb://localhost:27017/job-scheduler \
    -e REDIS_HOST=localhost \
    -e REDIS_PORT=6379 \
    --name job-scheduler-app \
    job-scheduler-app
  ```

---

## Liên hệ & hỗ trợ
- Nếu gặp lỗi hoặc cần hỗ trợ, hãy tạo issue hoặc liên hệ trực tiếp với tác giả.
