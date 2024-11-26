---
id: query-optimization
title: 查询优化基础
sidebar_label: 查询优化
description: SQL查询性能优化指南
draft: true
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

### 1. 查询执行流程详解
1. 查询解析
   - SQL语句词法分析
   - 语法树生成
2. 查询优化
   - 成本估算
   - 执行路径选择
3. 执行计划生成
   - 访问方法选择
   - 连接顺序确定
4. 查询执行
   - 数据读取
   - 结果集处理

### 2. SELECT语句优化示例

<Tabs>
  <TabItem value="sqlserver" label="SQL Server">
    ```sql
    -- 优化前
    SELECT * FROM Orders WHERE OrderDate > '2023-01-01';
    
    -- 优化后
    SELECT OrderId, CustomerName, OrderAmount 
    FROM Orders WITH(INDEX(IX_OrderDate))
    WHERE OrderDate > '2023-01-01';
    ```
  </TabItem>
  
  <TabItem value="dm" label="达梦">
    ```sql
    -- 优化前
    SELECT * FROM Orders WHERE OrderDate > '2023-01-01';
    
    -- 优化后
    SELECT /*+ INDEX(Orders IX_OrderDate) */ 
    OrderId, CustomerName, OrderAmount
    FROM Orders 
    WHERE OrderDate > '2023-01-01';
    ```
  </TabItem>
  
  <TabItem value="mysql" label="MySQL">
    ```sql
    -- 优化前
    SELECT * FROM Orders WHERE OrderDate > '2023-01-01';
    
    -- 优化后
    SELECT OrderId, CustomerName, OrderAmount 
    FROM Orders FORCE INDEX(IX_OrderDate)
    WHERE OrderDate > '2023-01-01';
    ```
  </TabItem>
  
  <TabItem value="postgresql" label="PostgreSQL">
    ```sql
    -- 优化前
    SELECT * FROM Orders WHERE OrderDate > '2023-01-01';
    
    -- 优化后
    SET enable_seqscan = off;
    SELECT OrderId, CustomerName, OrderAmount 
    FROM Orders 
    WHERE OrderDate > '2023-01-01';
    ```
  </TabItem>
</Tabs>

### 3. JOIN优化实例
以下是一个具体的JOIN优化案例，展示了如何通过小表驱动大表来提升查询性能：

<Tabs>
  <TabItem value="before" label="优化前">
    ```sql
    -- 大表(orders: 100万条记录) JOIN 小表(users: 1万条记录)
    SELECT o.order_id, u.user_name, o.amount
    FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE o.status = 'completed';
    ```
  </TabItem>
  
  <TabItem value="after" label="优化后">
    ```sql
    -- 先过滤小表，再关联大表
    SELECT o.order_id, u.user_name, o.amount
    FROM (
        SELECT id, user_name 
        FROM users 
        WHERE status = 'active'
    ) u
    JOIN orders o ON u.id = o.user_id
    WHERE o.status = 'completed';
    ```
  </TabItem>
</Tabs>

:::tip 优化说明
1. 小表驱动大表：先从用户表(小表)筛选数据，减少与订单表(大表)的关联数据量
2. 使用子查询：预先过滤小表数据，避免不必要的关联
3. 索引配置：需要在orders表的user_id和status字段上建立复合索引
:::

### 4. WHERE子句优化

<Tabs>
  <TabItem value="sqlserver" label="SQL Server">
    ```sql
    -- 优化前(索引失效)
    SELECT * FROM Products 
    WHERE YEAR(CreateDate) = 2023;
    
    -- 优化后(可以使用索引)
    SELECT * FROM Products 
    WHERE CreateDate >= '2023-01-01' 
    AND CreateDate < '2024-01-01';
    ```
  </TabItem>
  
  <TabItem value="mysql" label="MySQL">
    ```sql
    -- 优化前(导致全表扫描)
    SELECT * FROM Orders 
    WHERE Amount * 1.1 > 1000;
    
    -- 优化后(可以使用索引)
    SELECT * FROM Orders 
    WHERE Amount > 1000/1.1;
    ```
  </TabItem>
</Tabs>

:::tip WHERE子句优化要点
1. 避免在索引列上使用函数或运算
2. 使用合适的操作符(=, IN, BETWEEN)
3. 注意条件顺序(高选择性条件放前面)
4. 使用复合索引时注意最左匹配原则
:::

### 5. GROUP BY优化

<Tabs>
  <TabItem value="before" label="优化前">
    ```sql
    -- 未使用索引的分组查询
    SELECT department_id, COUNT(*) 
    FROM employees 
    GROUP BY department_id
    ORDER BY COUNT(*) DESC;
    ```
  </TabItem>
  
  <TabItem value="after" label="优化后">
    ```sql
    -- 1. 添加适当的索引
    ALTER TABLE employees ADD INDEX idx_dept(department_id);
    
    -- 2. 使用WITH ROLLUP进行汇总
    SELECT department_id, COUNT(*) 
    FROM employees 
    GROUP BY department_id WITH ROLLUP;
    
    -- 3. 先过滤后分组
    SELECT department_id, COUNT(*) 
    FROM employees 
    WHERE status = 'active'
    GROUP BY department_id;
    ```
  </TabItem>
</Tabs>

:::tip GROUP BY优化要点
1. 为分组字段创建适当的索引
2. 控制分组前的数据量
3. 使用HAVING子句时注意性能
4. 考虑使用WITH ROLLUP进行汇总
:::

### 6. 子查询优化

<Tabs>
  <TabItem value="before" label="优化前">
    ```sql
    -- 相关子查询
    SELECT * FROM orders o
    WHERE amount > (
        SELECT AVG(amount) 
        FROM orders 
        WHERE customer_id = o.customer_id
    );
    ```
  </TabItem>
  
  <TabItem value="after" label="优化后">
    ```sql
    -- 使用JOIN替代子查询
    SELECT o.* 
    FROM orders o
    JOIN (
        SELECT customer_id, AVG(amount) as avg_amount
        FROM orders
        GROUP BY customer_id
    ) t ON o.customer_id = t.customer_id
    WHERE o.amount > t.avg_amount;
    ```
  </TabItem>
</Tabs>

### 7. 执行计划优化

```sql
-- 查看执行计划
EXPLAIN ANALYZE
SELECT o.order_id, c.customer_name
FROM orders o
JOIN customers c ON o.customer_id = c.id
WHERE o.status = 'completed'
AND o.created_at > '2023-01-01';

-- 优化建议：
-- 1. 创建复合索引
CREATE INDEX idx_status_date ON orders(status, created_at);
-- 2. 添加覆盖索引
CREATE INDEX idx_customer ON orders(customer_id, order_id);
```

:::tip 执行计划分析要点
1. 关注扫描类型(type列)：避免ALL全表扫描
2. 检查索引使用情况(possible_keys和key列)
3. 注意rows扫描行数估计
4. 观察Extra列中的关键信息
:::

## 执行计划分析

### 1. EXPLAIN使用
```sql
EXPLAIN SELECT * FROM users WHERE age > 20;
```

### 2. 关键指标解读
- type列
- key列
- rows列
- Extra列

### 3. 常见问题分析
<details>
<summary>性能问题排查要点</summary>

1. 扫描行数过多
2. 临时表使用
3. 文件排序
4. 索引未命中
</details>

### 1. EXPLAIN输出解读

<Tabs>
  <TabItem value="mysql" label="MySQL">
    ```sql
    EXPLAIN SELECT o.order_id, c.customer_name
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    WHERE o.status = 'pending';
    ```

    | id | select_type | table | type  | key     | rows | Extra       |
    |----|-------------|-------|-------|---------|------|-------------|
    | 1  | SIMPLE      | o     | ref   | idx_status | 100  | Using index |
    | 1  | SIMPLE      | c     | eq_ref| PRIMARY   | 1    | NULL        |

  </TabItem>
</Tabs>

:::tip 关键指标说明
1. type: 访问类型，从好到差依次是:
   - system > const > eq_ref > ref > range > index > ALL
2. key: 实际使用的索引
3. rows: 预计扫描行数
4. Extra: 额外信息
   - Using index: 使用覆盖索引
   - Using filesort: 需要额外排序
   - Using temporary: 使用临时表
:::

## 查询重写技巧

### 1. 子查询优化
:::caution
避免使用相关子查询，优先考虑JOIN
:::

```sql title="子查询优化示例"
-- 优化前
SELECT * FROM users WHERE id IN (SELECT id FROM orders WHERE status = 'completed');
-- 优化后
SELECT u.*
FROM users u
INNER JOIN orders o ON u.id = o.user_id AND o.status = 'completed';
```

### 2. 分页查询优化

```sql title="分页优化"
-- 优化前
SELECT FROM products
ORDER BY id
LIMIT 1000000, 10;
-- 优化后
SELECT p. FROM products p
JOIN (
SELECT id FROM products
ORDER BY id
LIMIT 1000000, 10
) tmp ON p.id = tmp.id;
```

### 8. 分页查询优化

<Tabs>
  <TabItem value="before" label="优化前">
    ```sql
    -- 性能较差的分页查询
    SELECT * FROM products
    ORDER BY created_at DESC
    LIMIT 1000000, 20;
    ```
  </TabItem>
  
  <TabItem value="after" label="优化后">
    ```sql
    -- 方案1: 使用主键优化
    SELECT p.* FROM products p
    JOIN (
        SELECT id FROM products
        WHERE created_at < @last_created_at
        ORDER BY created_at DESC
        LIMIT 20
    ) tmp ON p.id = tmp.id;
    
    -- 方案2: 使用游标分页
    SELECT * FROM products
    WHERE (created_at, id) < (@last_created_at, @last_id)
    ORDER BY created_at DESC, id DESC
    LIMIT 20;
    ```
  </TabItem>
</Tabs>

:::tip 分页优化要点
1. 避免使用OFFSET，大偏移量会导致性能问题
2. 利用主键或唯一索引进行范围查询
3. 使用游标分页代替传统分页
4. 合理使用覆盖索引
:::

### 9. 排序优化

<Tabs>
  <TabItem value="before" label="优化前">
    ```sql
    -- 可能导致文件排序
    SELECT * FROM orders
    ORDER BY amount DESC, created_at DESC;
    ```
  </TabItem>
  
  <TabItem value="after" label="优化后">
    ```sql
    -- 添加合适的索引
    CREATE INDEX idx_amount_date ON orders(amount DESC, created_at DESC);
    
    -- 使用索引排序
    SELECT id, amount, created_at FROM orders
    FORCE INDEX(idx_amount_date)
    ORDER BY amount DESC, created_at DESC;
    ```
  </TabItem>
</Tabs>

### 10. 临时表优化

```sql
-- 优化前：频繁创建临时表
CREATE TEMPORARY TABLE tmp_orders AS
SELECT * FROM orders WHERE status = 'pending';

-- 优化后：使用派生表或CTE
WITH pending_orders AS (
    SELECT * FROM orders 
    WHERE status = 'pending'
)
SELECT * FROM pending_orders
WHERE amount > 1000;
```

### 11. 缓存策略

```sql
-- 1. 使用查询缓存(MySQL 8.0前)
SELECT SQL_CACHE * FROM products
WHERE category = 'electronics';

-- 2. 应用层缓存示例(伪代码)
String cacheKey = "product:" + category;
if (cache.exists(cacheKey)) {
    return cache.get(cacheKey);
} else {
    results = executeQuery("SELECT * FROM products WHERE category = ?", category);
    cache.set(cacheKey, results, EXPIRE_TIME);
    return results;
}
```

:::caution 缓存注意事项
1. 合理设置缓存过期时间
2. 及时更新或清除缓存
3. 防止缓存穿透和雪崩
4. 考虑数据一致性问题
:::

## 性能监控与诊断

### 1. 慢查询日志
- 开启慢查询日志
- 设置合理的阈值
- 定期分析日志

### 2. 性能监控工具
- Performance Schema
- Slow Query Log
- MySQL Workbench

### 3. 优化建议
1. 建立性能基准
2. 定期回顾和优化
3. 保持监控和预警

## 最佳实践清单

- [ ] 使用适当的索引
- [ ] 避免全表扫描
- [ ] 控制结果集大小
- [ ] 优化JOIN操作
- [ ] 定期维护统计信息
- [ ] 监控慢查询

## 参考资料
- [MySQL查询优化](https://dev.mysql.com/doc/refman/8.0/en/optimization-indexes.html)
- [查询性能优化](https://use-the-index-luke.com/)