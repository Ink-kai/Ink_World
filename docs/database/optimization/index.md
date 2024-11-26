---
id: index-optimization
title: 索引基础
sidebar_label: 索引优化
description: 数据库索引设计与优化指南
draft: true
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


### 索引类型
1. B-Tree索引
2. Hash索引
3. 全文索引
4. 位图索引

### 索引特性
- 唯一性
- 覆盖性
- 选择性
- 前缀索引

## 索引设计原则

### 1. 适合建立索引的场景
- 经常用于查询的字段
- 经常用于排序的字段
- 经常用于连接的字段

### 2. 避免索引的场景
- 更新频繁的字段
- 数据量小的表
- 选择性很低的字段

## 索引优化策略

### 1. 索引设计
:::tip 最佳实践
- 遵循最左前缀原则
- 控制索引数量
- 考虑列的选择性
:::

### 2. 索引维护
- 定期更新统计信息
- 及时清理无用索引
- 监控索引使用情况

### 3. 常见问题解决
<details>
<summary>索引失效的常见原因</summary>

- 使用函数操作索引列
- 隐式类型转换
- 使用不等于操作符
- 使用OR条件
</details>

## 性能监控与优化

### 监控指标
- 索引使用率
- 索引命中率
- 索引维护成本

### 优化工具
- EXPLAIN分析
- 索引使用统计
- 性能诊断工具

## 实战案例

<Tabs>
  <TabItem value="case1" label="案例1：多表关联优化" default>
    ```sql
    -- 优化前
    SELECT * FROM orders o 
    JOIN users u ON o.user_id = u.id
    WHERE o.status = 'pending';

    -- 优化后
    ALTER TABLE orders ADD INDEX idx_status_userid(status, user_id);
    ```
  </TabItem>
  <TabItem value="case2" label="案例2：复合索引优化">
    ```sql
    -- 优化前
    SELECT * FROM products 
    WHERE category = 'electronics' 
    AND price > 100 
    ORDER BY created_at;

    -- 优化后
    ALTER TABLE products ADD INDEX idx_cat_create(category, created_at);
    ```
  </TabItem>
</Tabs>

## 参考资料
- [MySQL索引官方文档](https://dev.mysql.com/doc/refman/8.0/en/optimization-indexes.html)
- [PostgreSQL索引类型](https://www.postgresql.org/docs/current/indexes-types.html) 
- [SQL索引优化最佳实践](https://www.percona.com/blog/sql-index-optimization-best-practices/)
- [数据库索引优化指南](https://www.databasestar.com/database-index-optimization/)