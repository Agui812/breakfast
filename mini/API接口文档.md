# 早餐店后台管理系统 API 接口文档

## 基础信息

| 项目 | 说明 |
|------|------|
| 基础地址 | `http://localhost:3001/api` |
| 认证方式 | 无（已关闭认证） |
| 数据格式 | JSON |

## 统一响应格式

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {}
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| code | number | 状态码：200=成功，404=不存在，500=服务器错误 |
| message | string | 提示信息 |
| data | any | 返回数据 |

---

## 1. 认证模块 `/api/auth`

### 1.1 用户登录

```
POST /api/auth/login
```

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |

**请求示例**

```json
{
  "username": "root",
  "password": "123456"
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "username": "root"
  }
}
```

---

## 2. 用户管理 `/api/users`

### 2.1 微信小程序登录

```
POST /api/users/login
```

**说明**：通过微信 openid 进行登录，如果用户不存在则自动注册。

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| openid | string | 是 | 微信用户唯一标识 |
| nickname | string | 否 | 用户昵称 |
| avatar | string | 否 | 用户头像URL |

**请求示例**

```json
{
  "openid": "oXXXXXXXXXXXXXXXXXXXXXXXX",
  "nickname": "微信用户",
  "avatar": "https://xxx.com/avatar.jpg"
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "user_id": 1,
    "nickname": "微信用户",
    "avatar": "https://xxx.com/avatar.jpg"
  }
}
```

### 2.2 获取用户信息

```
GET /api/users/:id
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 用户ID |

**响应示例**

```json
{
  "code": 200,
  "data": {
    "id": 1,
    "openid": "oXXXXXXXXXXXXXXXXXXXXXXXX",
    "nickname": "微信用户",
    "avatar": "https://xxx.com/avatar.jpg",
    "create_time": "2026-05-06T08:00:00.000Z",
    "update_time": "2026-05-06T08:00:00.000Z"
  }
}
```

### 2.3 更新用户信息

```
PUT /api/users/:id
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 用户ID |

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| nickname | string | 否 | 用户昵称 |
| avatar | string | 否 | 用户头像URL |

**响应示例**

```json
{
  "code": 200,
  "message": "更新成功"
}
```

---

## 3. 分类管理 `/api/categories`

### 3.1 获取分类列表（仅启用）

```
GET /api/categories
```

**响应示例**

```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "name": "包子类",
      "sort": 1,
      "status": 1,
      "create_time": "2026-05-06T08:00:00.000Z"
    },
    {
      "id": 2,
      "name": "粥品类",
      "sort": 2,
      "status": 1,
      "create_time": "2026-05-06T08:00:00.000Z"
    }
  ]
}
```

### 3.2 获取全部分类（包括禁用）

```
GET /api/categories/all
```

**响应示例**

```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "name": "包子类",
      "sort": 1,
      "status": 1,
      "create_time": "2026-05-06T08:00:00.000Z"
    },
    {
      "id": 2,
      "name": "粥品类",
      "sort": 2,
      "status": 0,
      "create_time": "2026-05-06T08:00:00.000Z"
    }
  ]
}
```

### 3.3 添加分类

```
POST /api/categories
```

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 分类名称 |
| sort | number | 否 | 排序，默认为0 |
| status | number | 否 | 状态 1=启用 0=禁用，默认1 |

**请求示例**

```json
{
  "name": "面食类",
  "sort": 3,
  "status": 1
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "添加成功",
  "data": {
    "id": 6
  }
}
```

### 3.4 更新分类

```
PUT /api/categories/:id
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 分类ID |

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 分类名称 |
| sort | number | 否 | 排序 |
| status | number | 否 | 状态 1=启用 0=禁用 |

**响应示例**

```json
{
  "code": 200,
  "message": "更新成功"
}
```

### 3.5 删除分类

```
DELETE /api/categories/:id
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 分类ID |

**响应示例**

```json
{
  "code": 200,
  "message": "删除成功"
}
```

---

## 4. 餐品管理 `/api/products`

### 4.1 获取餐品列表

```
GET /api/products
```

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| category_id | number | 否 | 分类ID，筛选指定分类 |

**响应示例**

```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "category_id": 1,
      "category_name": "包子类",
      "name": "肉包",
      "price": "2.50",
      "daily_stock": 300,
      "current_stock": 300,
      "image": "/uploads/1715000000000-123456789.jpg",
      "status": 1,
      "create_time": "2026-05-06T08:00:00.000Z",
      "update_time": "2026-05-06T08:00:00.000Z"
    }
  ]
}
```

### 4.2 获取餐品详情

```
GET /api/products/:id
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 餐品ID |

**响应示例**

```json
{
  "code": 200,
  "data": {
    "id": 1,
    "category_id": 1,
    "category_name": "包子类",
    "name": "肉包",
    "price": "2.50",
    "daily_stock": 300,
    "current_stock": 300,
    "image": "/uploads/1715000000000-123456789.jpg",
    "status": 1,
    "create_time": "2026-05-06T08:00:00.000Z",
    "update_time": "2026-05-06T08:00:00.000Z"
  }
}
```

### 4.3 添加餐品

```
POST /api/products
```

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| category_id | number | 否 | 分类ID |
| name | string | 是 | 餐品名称 |
| price | number | 是 | 单价 |
| daily_stock | number | 否 | 每日限量，默认0 |
| current_stock | number | 否 | 当前库存，默认0 |
| image | string | 否 | 图片地址（通过上传接口获取） |
| status | number | 否 | 状态 1=在售 0=下架，默认1 |

**请求示例**

```json
{
  "category_id": 1,
  "name": "小笼包",
  "price": 5.00,
  "daily_stock": 200,
  "current_stock": 200,
  "image": "/uploads/1715000000000-123456789.jpg",
  "status": 1
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "添加成功",
  "data": {
    "id": 5
  }
}
```

### 4.4 更新餐品

```
PUT /api/products/:id
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 餐品ID |

**请求参数**（同添加餐品）

**响应示例**

```json
{
  "code": 200,
  "message": "更新成功"
}
```

### 4.5 删除餐品

```
DELETE /api/products/:id
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 餐品ID |

**响应示例**

```json
{
  "code": 200,
  "message": "删除成功"
}
```

---

## 5. 图片上传 `/api/upload`

### 5.1 上传图片

```
POST /api/upload/image
Content-Type: multipart/form-data
```

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| image | file | 是 | 图片文件 |

**支持格式**：jpg、jpeg、png、gif、webp
**大小限制**：5MB

**响应示例**

```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "url": "/uploads/1715000000000-123456789.jpg"
  }
}
```

**说明**：图片保存在 `public/uploads/` 目录，可通过 `http://localhost:3001/uploads/xxx.jpg` 访问。

---

## 6. 订单管理 `/api/orders`

### 6.1 创建订单

```
POST /api/orders
```

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| phone | string | 是 | 顾客电话 |
| pickup_time | string | 是 | 自取时间，格式：YYYY-MM-DD HH:mm:ss 或 HH:mm:ss |
| total_amount | number/string | 是 | 订单总金额 |
| items | array | 是 | 订单明细数组 |
| items[].product_id | number | 是 | 餐品ID |
| items[].product_name | string | 是 | 餐品名称（快照） |
| items[].price | number | 是 | 下单时单价 |
| items[].quantity | number | 是 | 购买数量 |
| nickname | string | 否 | 顾客昵称 |
| user_id | number | 否 | 关联用户ID（微信小程序用户） |

**请求示例**

```json
{
  "phone": "13932786546",
  "pickup_time": "06:00:00",
  "total_amount": "7.50",
  "nickname": "张三",
  "items": [
    {
      "product_id": 1,
      "product_name": "鲜肉包",
      "price": 2.5,
      "quantity": 1
    },
    {
      "product_id": 3,
      "product_name": "豆浆",
      "price": 3.0,
      "quantity": 1
    }
  ]
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "下单成功",
  "data": {
    "order_no": "20260506090031123",
    "pickup_code": "8821"
  }
}
```

**说明**：该接口使用数据库事务，确保订单和明细的原子性，同时自动扣减对应餐品的库存，并自动记录打印日志。

### 6.2 获取订单列表

```
GET /api/orders
```

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | number | 否 | 订单状态：1=待制作 2=已完成 3=已取餐 |
| startDate | string | 否 | 开始日期，格式：YYYY-MM-DD 或 YYYY-MM-DD HH:mm:ss |
| endDate | string | 否 | 结束日期，格式同上 |
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页条数，默认10 |

**响应示例**

```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "order_no": "20260506080000001",
      "pickup_code": "8821",
      "nickname": "张三",
      "phone": "13800138000",
      "pickup_time": "2026-05-06T08:30:00.000Z",
      "total_amount": "15.50",
      "order_status": 1,
      "create_time": "2026-05-06T08:00:00.000Z",
      "update_time": "2026-05-06T08:00:00.000Z"
    }
  ],
  "total": 100
}
```

### 6.3 获取订单详情

```
GET /api/orders/:order_no
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| order_no | string | 订单编号 |

**响应示例**

```json
{
  "code": 200,
  "data": {
    "id": 1,
    "order_no": "20260506080000001",
    "pickup_code": "8821",
    "nickname": "张三",
    "phone": "13800138000",
    "pickup_time": "2026-05-06T08:30:00.000Z",
    "total_amount": "15.50",
    "order_status": 1,
    "create_time": "2026-05-06T08:00:00.000Z",
    "update_time": "2026-05-06T08:00:00.000Z",
    "items": [
      {
        "id": 1,
        "order_no": "20260506080000001",
        "product_id": 1,
        "product_name": "肉包",
        "price": "2.50",
        "quantity": 3,
        "create_time": "2026-05-06T08:00:00.000Z"
      }
    ]
  }
}
```

### 6.4 更新订单状态

```
PUT /api/orders/:id/status
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 订单ID |

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| order_status | number | 是 | 订单状态：1=待制作 2=已完成 3=已取餐 |

**请求示例**

```json
{
  "order_status": 2
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "订单状态更新成功"
}
```

---

## 7. 系统配置 `/api/config`

### 7.1 获取系统配置

```
GET /api/config
```

**响应示例**

```json
{
  "code": 200,
  "data": {
    "id": 1,
    "business_start": "06:00:00",
    "business_end": "10:00:00",
    "update_time": "2026-05-06T08:00:00.000Z"
  }
}
```

### 7.2 更新系统配置

```
PUT /api/config
```

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| business_start | string | 是 | 营业开始时间，格式：HH:mm:ss |
| business_end | string | 是 | 营业结束时间，格式：HH:mm:ss |

**请求示例**

```json
{
  "business_start": "06:00:00",
  "business_end": "10:30:00"
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "更新成功"
}
```

---

## 8. 打印日志 `/api/print-logs`

### 8.1 获取打印日志列表

```
GET /api/print-logs
```

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页条数，默认10 |

**响应示例**

```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "order_no": "20260506080000001",
      "print_time": "2026-05-06T08:05:00.000Z",
      "pickup_code": "8821",
      "total_amount": "15.50",
      "create_time": "2026-05-06T08:00:00.000Z",
      "items": [
        {
          "product_name": "肉包",
          "price": "2.50",
          "quantity": 3
        },
        {
          "product_name": "豆浆",
          "price": "3.00",
          "quantity": 2
        }
      ]
    }
  ],
  "total": 50
}
```

**说明**：创建订单时自动记录打印日志，无需手动调用打印接口。

---

## 9. 用户反馈 `/api/feedbacks`

### 9.1 获取反馈列表

```
GET /api/feedbacks
```

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | number | 否 | 处理状态：0=待处理 1=已处理 |
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页条数，默认10 |

**响应示例**

```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "user_nickname": "微信用户",
      "user_avatar": "https://xxx.com/avatar.jpg",
      "content": "包子很好吃，希望增加种类",
      "contact": "13900000000",
      "status": 0,
      "reply": null,
      "create_time": "2026-05-06T08:00:00.000Z",
      "update_time": "2026-05-06T08:00:00.000Z"
    }
  ],
  "total": 20
}
```

### 9.2 提交反馈

```
POST /api/feedbacks
```

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| user_id | number | 否 | 关联用户ID |
| content | string | 是 | 反馈内容 |
| contact | string | 否 | 联系方式（手机号/微信） |

**请求示例**

```json
{
  "user_id": 1,
  "content": "包子很好吃，希望增加种类",
  "contact": "13900000000"
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "提交成功",
  "data": {
    "id": 1
  }
}
```

### 9.3 回复反馈

```
PUT /api/feedbacks/:id/reply
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 反馈ID |

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| reply | string | 是 | 商家回复内容 |

**请求示例**

```json
{
  "reply": "感谢您的反馈，我们会考虑增加新品种！"
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "回复成功"
}
```

**说明**：调用此接口会自动将反馈状态更新为"已处理"。

### 9.4 更新反馈状态

```
PUT /api/feedbacks/:id/status
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 反馈ID |

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | number | 是 | 处理状态：0=待处理 1=已处理 |

**响应示例**

```json
{
  "code": 200,
  "message": "更新成功"
}
```

### 9.5 删除反馈

```
DELETE /api/feedbacks/:id
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 反馈ID |

**响应示例**

```json
{
  "code": 200,
  "message": "删除成功"
}
```

---

## 10. 数据统计 `/api/dashboard`

### 10.1 获取统计数据

```
GET /api/dashboard
```

**响应示例**

```json
{
  "code": 200,
  "data": {
    "productCount": 4,
    "orderCount": 128,
    "todayOrders": 35,
    "todayRevenue": "520.50",
    "pendingOrders": 12,
    "pendingFeedbacks": 3
  }
}
```

| 字段 | 说明 |
|------|------|
| productCount | 餐品总数 |
| orderCount | 订单总数 |
| todayOrders | 今日订单数 |
| todayRevenue | 今日营收金额 |
| pendingOrders | 待处理订单数 |
| pendingFeedbacks | 待处理反馈数 |

---

## 错误码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |
