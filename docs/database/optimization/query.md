---
id: query-optimization
title: 查询优化基础
sidebar_label: 查询优化
description: 掌握SQL优化技巧和最佳实践
draft: false
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

### 1. 查询执行流程详解

#### 1.1 查询解析(Parser)
##### 词法分析与语法分析
- **词法分析**：将SQL语句分解成基本单元（Token）
  - 例如：`SELECT id, name FROM users WHERE age > 18`
  - 被分解为：`SELECT`、`id`、`,`、`name`、`FROM`、`users`、`WHERE`、`age`、`>`、`18`
  - 作用：确保SQL语句的基本语法正确性

- **语法分析**：
  - 检查SQL语句是否符合语法规则
  - 验证表名、字段名是否存在
  - 检查用户是否有相应的操作权限
  - 例如：检查`users`表是否存在，`id`和`name`字段是否存在

##### 语法树生成
- **抽象语法树(AST)**：
  - 将SQL转换为树形结构，便于后续优化和执行
  - 例如上述SQL会转换为：
    - 根节点：SELECT
    - 子节点：列名列表(id, name)、表名(users)、条件(age > 18)

#### 1.2 查询优化(Optimizer)
##### 逻辑优化
- **等价变换规则**：
  - WHERE条件化简：`WHERE age > 18 AND age > 20` → `WHERE age > 20`
  - 子查询转化为连接：可能将子查询转为JOIN以提升性能
  - 去除无用条件：`WHERE 1=1`这样的条件会被删除

##### 物理优化
- **访问路径评估**：
  - 决定是否使用索引
  - 例如：`WHERE age > 18`，如果age字段有索引，评估是全表扫描快还是走索引快
  
- **成本估算**：
  - I/O成本：读取数据块的成本
  - CPU成本：处理数据的计算成本
  - 例如：全表扫描可能需要读取100个数据块，而索引扫描只需要读取10个数据块

#### 1.3 执行计划生成
##### 访问方法选择
- **表扫描方式**：
  - 全表扫描：适用于需要访问表中大部分数据时
  - 索引扫描：适用于通过索引可以快速定位少量数据时
  - 例如：`SELECT * FROM users WHERE age = 20`
    - 如果age有索引，且符合条件的数据较少，选择索引扫描
    - 如果符合条件的数据量大，选择全表扫描

##### 连接算法选择
- **Nested Loop Join**：
  - 适用于小表连接或有索引的连接条件
  - 例如：`users`表和`orders`表连接，如果`orders`表的`user_id`有索引

- **Hash Join**：
  - 适用于大表连接且无合适索引时
  - 例如：两个大表在无索引字段上连接

- **Sort Merge Join**：
  - 适用于已经排序的数据集连接
  - 例如：按时间范围连接的场景

#### 1.4 查询执行(Executor)
##### 算子执行
- **扫描算子**：
  - 负责从存储层读取数据
  - 例如：从硬盘读取表数据或索引数据

- **连接算子**：
  - 负责将多个表的数据按照指定条件连接
  - 例如：将用户表和订单表按用户ID连接

- **聚合算子**：
  - 负责进行分组和聚合计算
  - 例如：`GROUP BY`和`COUNT`、`SUM`等操作

##### 结果处理
- **结果排序**：
  - 按照ORDER BY子句进行排序
  - 可能使用内存排序或磁盘排序

- **分页处理**：
  - 处理LIMIT和OFFSET
  - 返回指定范围的结果集

:::tip 优化建议
1. 合理使用索引：根据查询条件创建适当的索引
2. 避免使用SELECT *：只查询需要的字段
3. 适当使用LIMIT：限制结果集大小
4. 定期更新统计信息：确保优化器能做出正确的选择
5. 合理设置JOIN顺序：小表驱动大表
:::

### 2. SELECT语句优化示例

<Tabs>
  <TabItem value="sqlserver" label="SQL Server">
    ```sql
    -- 优化前(通用)
    SELECT * FROM Orders WHERE OrderDate > '2023-01-01';
    
    -- 优化后
    SELECT OrderId, CustomerName, OrderAmount 
    FROM Orders WITH(INDEX(IX_OrderDate))
    WHERE OrderDate > '2023-01-01';
    ```
  </TabItem>
  
  <TabItem value="mysql" label="MySQL">
    ```sql
    -- 优化前(通用)
    SELECT * FROM Orders WHERE OrderDate > '2023-01-01';
    
    -- 优化后
    SELECT OrderId, CustomerName, OrderAmount 
    FROM Orders FORCE INDEX(IX_OrderDate)
    WHERE OrderDate > '2023-01-01';
    ```
  </TabItem>
  
  <TabItem value="dm" label="达梦">
    ```sql
    -- 优化前(通用)
    SELECT * FROM Orders WHERE OrderDate > '2023-01-01';
    
    -- 优化后
    SELECT /*+ INDEX(Orders IX_OrderDate) */ 
    OrderId, CustomerName, OrderAmount
    FROM Orders 
    WHERE OrderDate > '2023-01-01';
    ```
  </TabItem>
</Tabs>

### 3. JOIN优化实例
以下是一个具体的JOIN优化案例，展示了如何通过小表驱动大表来提升查询性能：

<Tabs>
  <TabItem value="sqlserver" label="SQL Server">
    ```sql
    -- 优化前
    SELECT o.order_id, u.user_name, o.amount
    FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE o.status = 'completed';
    
    -- 优化后
    SELECT o.order_id, u.user_name, o.amount
    FROM (
        SELECT id, user_name 
        FROM users WITH(NOLOCK)
        WHERE status = 'active'
    ) u
    JOIN orders o WITH(NOLOCK) ON u.id = o.user_id
    WHERE o.status = 'completed';
    ```
  </TabItem>

  <TabItem value="mysql" label="MySQL">
    ```sql
    -- 优化前
    SELECT o.order_id, u.user_name, o.amount
    FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE o.status = 'completed';
    
    -- 优化后
    SELECT o.order_id, u.user_name, o.amount
    FROM (
        SELECT id, user_name 
        FROM users FORCE INDEX(PRIMARY)
        WHERE status = 'active'
    ) u
    JOIN orders o ON u.id = o.user_id
    WHERE o.status = 'completed';
    ```
  </TabItem>

  <TabItem value="dm" label="达梦">
    ```sql
    -- 优化前
    SELECT o.order_id, u.user_name, o.amount
    FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE o.status = 'completed';
    
    -- 优化后
    SELECT /*+ LEADING(u o) USE_NL(o) */ 
    o.order_id, u.user_name, o.amount
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
    -- 优化前(函数导致索引失效)
    SELECT * FROM Products 
    WHERE YEAR(CreateDate) = 2023;
    SELECT * FROM Orders 
    WHERE Amount * 1.1 > 1000;
    
    -- 优化后(改写为范围查询)
    SELECT * FROM Products 
    WHERE CreateDate >= '2023-01-01' 
    AND CreateDate < '2024-01-01';
    SELECT * FROM Orders 
    WHERE Amount > 1000/1.1;
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
  
  <TabItem value="dm" label="达梦">
    ```sql
    -- 优化前(函数导致索引失效)
    SELECT * FROM Products 
    WHERE YEAR(CreateDate) = 2023;
    SELECT * FROM Orders 
    WHERE Amount * 1.1 > 1000;
    
    -- 优化后(改写为范围查询)
    SELECT * FROM Products 
    WHERE CreateDate >= '2023-01-01' 
    AND CreateDate < '2024-01-01';
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
  <TabItem value="sqlserver" label="SQL Server">
    ```sql
    -- 优化前
    SELECT department_id, COUNT(*) 
    FROM employees 
    GROUP BY department_id
    ORDER BY COUNT(*) DESC;
    
    -- 优化后
    SELECT department_id, COUNT(*) 
    FROM employees WITH(NOLOCK)
    WHERE status = 'active'
    GROUP BY department_id
    OPTION (HASH GROUP);
    ```
  </TabItem>

  <TabItem value="mysql" label="MySQL">
    ```sql
    -- 优化前
    SELECT department_id, COUNT(*) 
    FROM employees 
    GROUP BY department_id
    ORDER BY COUNT(*) DESC;
    
    -- 优化后
    SELECT department_id, COUNT(*) 
    FROM employees FORCE INDEX(idx_dept)
    WHERE status = 'active'
    GROUP BY department_id WITH ROLLUP;
    ```
  </TabItem>

  <TabItem value="dm" label="达梦">
    ```sql
    -- 优化前
    SELECT department_id, COUNT(*) 
    FROM employees 
    GROUP BY department_id
    ORDER BY COUNT(*) DESC;
    
    -- 优化后
    SELECT /*+ USE_HASH_AGGREGATION */
    department_id, COUNT(*) 
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
  <TabItem value="sqlserver" label="SQL Server">
    ```sql
    -- 优化前
    SELECT * FROM orders o
    WHERE amount > (
        SELECT AVG(amount) 
        FROM orders WITH(NOLOCK)
        WHERE customer_id = o.customer_id
    );
    
    -- 优化后
    SELECT o.* 
    FROM orders o WITH(NOLOCK)
    JOIN (
        SELECT customer_id, AVG(amount) as avg_amount
        FROM orders WITH(NOLOCK)
        GROUP BY customer_id
    ) t ON o.customer_id = t.customer_id
    WHERE o.amount > t.avg_amount;
    ```
  </TabItem>

  <TabItem value="mysql" label="MySQL">
    ```sql
    -- 优化前
    SELECT * FROM orders o
    WHERE amount > (
        SELECT AVG(amount) 
        FROM orders 
        WHERE customer_id = o.customer_id
    );
    
    -- 优化后
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

  <TabItem value="dm" label="达梦">
    ```sql
    -- 优化前
    SELECT * FROM orders o
    WHERE amount > (
        SELECT AVG(amount) 
        FROM orders 
        WHERE customer_id = o.customer_id
    );
    
    -- 优化后
    SELECT /*+ USE_HASH(o t) */ o.* 
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

<Tabs>
  <TabItem value="sqlserver" label="SQL Server">
    ```sql
    -- 查看执行计划
    SET SHOWPLAN_XML ON;
    SELECT o.order_id, c.customer_name
    FROM orders o WITH(NOLOCK)
    JOIN customers c WITH(NOLOCK) ON o.customer_id = c.id
    WHERE o.status = 'completed'
    AND o.created_at > '2023-01-01';
    
    -- 优化建议：
    -- 1. 创建复合索引
    CREATE INDEX idx_status_date ON orders(status, created_at);
    -- 2. 添加覆盖索引
    CREATE INDEX idx_customer ON orders(customer_id, order_id);
    ```
  </TabItem>

  <TabItem value="mysql" label="MySQL">
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
  </TabItem>

  <TabItem value="dm" label="达梦">
    ```sql
    -- 查看执行计划
    EXPLAIN PLAN FOR
    SELECT /*+ GATHER_PLAN_STATISTICS */
    o.order_id, c.customer_name
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
  </TabItem>
</Tabs>

:::tip 执行计划分析要点
1. 关注扫描类型(type列)：避免ALL全表扫描
2. 检查索引使用情况(possible_keys和key列)
3. 注意rows扫描行数估计
4. 观察Extra列中的关键信息
:::

## 8.查询重写技巧

### 8.1 子查询优化
:::caution
避免使用相关子查询，优先考虑JOIN
:::

<Tabs>
  <TabItem value="sqlserver" label="SQL Server">
    ```sql
    -- 优化前
    SELECT * FROM users WHERE id IN (SELECT id FROM orders WHERE status = 'completed');
    
    -- 优化后
    SELECT DISTINCT u.*
    FROM users u
    INNER JOIN orders o WITH(NOLOCK) ON u.id = o.user_id 
    WHERE o.status = 'completed';
    ```
  </TabItem>
  
  <TabItem value="mysql" label="MySQL">
    ```sql
    -- 优化前
    SELECT * FROM users WHERE id IN (SELECT id FROM orders WHERE status = 'completed');
    
    -- 优化后
    SELECT u.*
    FROM users u
    INNER JOIN orders o ON u.id = o.user_id AND o.status = 'completed';
    ```
  </TabItem>
  
  <TabItem value="dm" label="达梦">
    ```sql
    -- 优化前
    SELECT * FROM users WHERE id IN (SELECT id FROM orders WHERE status = 'completed');
    
    -- 优化后
    SELECT /*+ USE_HASH(u o) */ DISTINCT u.*
    FROM users u
    INNER JOIN orders o ON u.id = o.user_id 
    WHERE o.status = 'completed';
    ```
  </TabItem>
</Tabs>

### 8.2 分页查询优化

<Tabs>
  <TabItem value="sqlserver" label="SQL Server">
    ```sql
    -- 优化前
    SELECT * FROM products
    ORDER BY created_at DESC
    OFFSET 1000000 ROWS FETCH NEXT 20 ROWS ONLY;
    
    -- 优化后
    WITH LastProduct AS (
        SELECT TOP 1 created_at, id 
        FROM products
        ORDER BY created_at DESC, id DESC
        OFFSET 1000000 ROWS
    )
    SELECT TOP 20 p.*
    FROM products p
    WHERE p.created_at <= (SELECT created_at FROM LastProduct)
    AND (p.created_at < (SELECT created_at FROM LastProduct)
         OR (p.created_at = (SELECT created_at FROM LastProduct)
             AND p.id <= (SELECT id FROM LastProduct)))
    ORDER BY p.created_at DESC, p.id DESC;
    ```
  </TabItem>
  
  <TabItem value="mysql" label="MySQL">
    ```sql
    -- 优化前
    SELECT * FROM products
    ORDER BY created_at DESC
    LIMIT 1000000, 20;
    
    -- 优化后
    SELECT p.* FROM products p
    JOIN (
        SELECT id FROM products
        WHERE created_at < @last_created_at
        ORDER BY created_at DESC
        LIMIT 20
    ) tmp ON p.id = tmp.id;
    ```
  </TabItem>
  
  <TabItem value="dm" label="达梦">
    ```sql
    -- 优化前
    SELECT * FROM products
    ORDER BY created_at DESC
    OFFSET 1000000 ROWS FETCH NEXT 20 ROWS ONLY;
    
    -- 优化后
    SELECT /*+ INDEX(p idx_created_id) */ p.*
    FROM products p
    WHERE (created_at, id) < (
        SELECT created_at, id FROM products
        ORDER BY created_at DESC, id DESC
        OFFSET 1000000 ROWS FETCH FIRST 1 ROW ONLY
    )
    ORDER BY created_at DESC, id DESC
    FETCH FIRST 20 ROWS ONLY;
    ```
  </TabItem>
</Tabs>

### 8.3 排序优化

<Tabs>
  <TabItem value="sqlserver" label="SQL Server">
    ```sql
    -- 优化前
    SELECT * FROM orders
    ORDER BY amount DESC, created_at DESC;
    
    -- 优化后
    CREATE INDEX idx_amount_date ON orders(amount DESC, created_at DESC);
    
    SELECT id, amount, created_at FROM orders WITH(INDEX(idx_amount_date))
    ORDER BY amount DESC, created_at DESC;
    ```
  </TabItem>
  
  <TabItem value="mysql" label="MySQL">
    ```sql
    -- 优化前
    SELECT * FROM orders
    ORDER BY amount DESC, created_at DESC;
    
    -- 优化后
    CREATE INDEX idx_amount_date ON orders(amount DESC, created_at DESC);
    
    SELECT id, amount, created_at FROM orders
    FORCE INDEX(idx_amount_date)
    ORDER BY amount DESC, created_at DESC;
    ```
  </TabItem>
  
  <TabItem value="dm" label="达梦">
    ```sql
    -- 优化前
    SELECT * FROM orders
    ORDER BY amount DESC, created_at DESC;
    
    -- 优化后
    CREATE INDEX idx_amount_date ON orders(amount DESC, created_at DESC);
    
    SELECT /*+ INDEX(orders idx_amount_date) */
    id, amount, created_at FROM orders
    ORDER BY amount DESC, created_at DESC;
    ```
  </TabItem>
</Tabs>

### 8.4 临时表优化

<Tabs>
  <TabItem value="sqlserver" label="SQL Server">
    ```sql
    -- 优化前
    SELECT * INTO #tmp_orders 
    FROM orders WHERE status = 'pending';
    
    -- 优化后
    WITH pending_orders AS (
        SELECT * FROM orders WITH(NOLOCK)
        WHERE status = 'pending'
    )
    SELECT * FROM pending_orders
    WHERE amount > 1000;
    ```
  </TabItem>
  
  <TabItem value="mysql" label="MySQL">
    ```sql
    -- 优化前
    CREATE TEMPORARY TABLE tmp_orders AS
    SELECT * FROM orders WHERE status = 'pending';
    
    -- 优化后
    WITH pending_orders AS (
        SELECT * FROM orders 
        WHERE status = 'pending'
    )
    SELECT * FROM pending_orders
    WHERE amount > 1000;
    ```
  </TabItem>
  
  <TabItem value="dm" label="达梦">
    ```sql
    -- 优化前
    CREATE GLOBAL TEMPORARY TABLE tmp_orders AS
    SELECT * FROM orders WHERE status = 'pending';
    
    -- 优化后
    WITH pending_orders AS (
        SELECT * FROM orders 
        WHERE status = 'pending'
    )
    SELECT * FROM pending_orders
    WHERE amount > 1000;
    ```
  </TabItem>
</Tabs>

### 8.5 缓存策略

缓存是提升查询性能的重要手段。主要有以下几种缓存策略:

#### 8.5.1 数据库查询缓存
- **查询计划缓存**: 数据库会缓存已执行过的SQL语句的执行计划,避免重复解析和优化
- **结果集缓存**: 某些数据库支持缓存查询结果集,但需要注意缓存失效问题

#### 8.5.2 应用层缓存
- **本地缓存**: 应用服务器内存中的缓存,适合小规模数据
- **分布式缓存**: 如Redis/Memcached,适合大规模数据的缓存
- **多级缓存**: 本地缓存+分布式缓存的组合使用

#### 8.5.3 缓存使用建议
1. 合理设置缓存过期时间
2. 及时清理无效缓存
3. 防止缓存穿透和缓存雪崩
4. 考虑缓存一致性问题
5. 选择合适的缓存粒度

以下示例展示了不同数据库的缓存使用方式:

<Tabs>
  <TabItem value="sqlserver" label="SQL Server">
    ```sql
    -- 1. 使用查询计划缓存
    SELECT * FROM products WITH(RECOMPILE)
    WHERE category = 'electronics';
    
    -- 2. 应用层缓存示例(伪代码)
    String cacheKey = "product:" + category;
    if (cache.exists(cacheKey)) {
        return cache.get(cacheKey);
    } else {
        results = executeQuery("SELECT * FROM products WHERE category = @category", category);
        cache.set(cacheKey, results, EXPIRE_TIME);
        return results;
    }
    ```
  </TabItem>
  
  <TabItem value="mysql" label="MySQL">
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
  </TabItem>
  
  <TabItem value="dm" label="达梦">
    ```sql
    -- 1. 使用查询缓存
    SELECT /*+ RESULT_CACHE */ * FROM products
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
  </TabItem>
</Tabs>

:::caution 缓存注意事项
1. 合理设置缓存过期时间
2. 及时更新或清除缓存
3. 防止缓存穿透和雪崩
4. 考虑数据一致性问题
:::


## 9. 性能监控与诊断

### 9.1 慢查询日志分析

<Tabs>
  <TabItem value="sqlserver" label="SQL Server">
    ```sql
    -- 开启慢查询跟踪
    EXEC sp_configure 'show advanced options', 1;
    RECONFIGURE;
    EXEC sp_configure 'blocked process threshold', 5;
    RECONFIGURE;
    
    -- 查看慢查询
    SELECT * FROM sys.dm_exec_query_stats
    CROSS APPLY sys.dm_exec_sql_text(sql_handle)
    ORDER BY total_elapsed_time DESC;
    ```
  </TabItem>
  
  <TabItem value="mysql" label="MySQL">
    ```sql
    -- 开启慢查询日志
    SET GLOBAL slow_query_log = 1;
    SET GLOBAL long_query_time = 2;
    SET GLOBAL slow_query_log_file = '/var/log/mysql/slow.log';
    
    -- 分析慢查询日志
    mysqldumpslow -s t -t 10 /var/log/mysql/slow.log
    ```
  </TabItem>
  
  <TabItem value="dm" label="达梦">
    ```sql
    -- 开启慢查询日志
    ALTER SYSTEM SET ENABLE_SLOW_SQL_LOG = TRUE;
    ALTER SYSTEM SET SLOW_SQL_THRESHOLD = 1000;
    
    -- 查看慢查询
    SELECT * FROM V$SLOW_SQL
    ORDER BY ELAPSED_TIME DESC;
    ```
  </TabItem>
</Tabs>

### 9.2 性能监控指标

1. 查询响应时间
   - 平均响应时间
   - 95th百分位响应时间
   - 最大响应时间

2. 系统资源使用
   - CPU使用率
   - 内存使用情况
   - IO等待时间
   - 连接数

3. 查询执行统计
   - 扫描行数
   - 返回行数
   - 索引使用率
   - 缓存命中率

### 9.3 常见性能问题诊断

<Tabs>
  <TabItem value="sqlserver" label="SQL Server">
    ```sql
    -- 查看阻塞情况
    SELECT * FROM sys.dm_exec_requests
    WHERE blocking_session_id != 0;
    
    -- 查看缓存命中率
    SELECT * FROM sys.dm_os_performance_counters
    WHERE counter_name = 'Buffer cache hit ratio';
    ```
  </TabItem>
  
  <TabItem value="mysql" label="MySQL">
    ```sql
    -- 查看当前连接和状态
    SHOW PROCESSLIST;
    
    -- 查看InnoDB状态
    SHOW ENGINE INNODB STATUS;
    
    -- 查看查询缓存统计
    SHOW STATUS LIKE '%Qcache%';
    ```
  </TabItem>

  <TabItem value="dm" label="达梦">
    ```sql
    -- 查看会话阻塞
    SELECT * FROM V$SESSION
    WHERE BLOCKING_SESSION IS NOT NULL;
    
    -- 查看系统性能指标
    SELECT * FROM V$SYSSTAT
    WHERE NAME LIKE '%cache%';
    ```
  </TabItem>
</Tabs>

## 10. 性能优化最佳实践

### 10.1 查询设计原则

1. 索引优化
   - 为常用查询条件创建合适索引
   - 避免过多索引影响写入性能
   - 定期维护索引统计信息
   - 删除无用索引

2. 查询编写
   - 只查询必需的列
   - 合理使用子查询和JOIN
   - 避免使用SELECT *
   - 使用批量操作代替循环

3. 数据访问
   - 控制结果集大小
   - 使用分页查询
   - 合理设置LIMIT
   - 避免大表JOIN

### 10.2 运维管理

1. 监控预警
   - 设置性能基准
     <Tabs>
       <TabItem value="sqlserver" label="SQL Server">
         ```sql
         -- 记录基准查询性能
         SELECT AVG(total_elapsed_time) as baseline
         FROM sys.dm_exec_query_stats
         WHERE creation_time > DATEADD(day, -7, GETDATE());
         ```
       </TabItem>
       <TabItem value="mysql" label="MySQL">
         ```sql
         -- 记录基准查询性能
         SELECT AVG(query_time) as baseline 
         FROM slow_log 
         WHERE start_time > DATE_SUB(NOW(), INTERVAL 7 DAY);
         ```
       </TabItem>
       <TabItem value="dm" label="达梦">
         ```sql
         -- 记录基准查询性能
         SELECT AVG(ELAPSED_TIME) as baseline
         FROM V$SQL
         WHERE FIRST_LOAD_TIME > SYSDATE - 7;
         ```
       </TabItem>
     </Tabs>

   - 配置监控告警
     <Tabs>
       <TabItem value="sqlserver" label="SQL Server">
         ```sql
         -- 设置阻塞监控
         sp_configure 'blocked process threshold', 2;
         RECONFIGURE;
         
         -- 创建告警作业
         USE msdb;
         EXEC dbo.sp_add_job @job_name = N'SlowQueryAlert';
         EXEC dbo.sp_add_jobstep @job_name = N'SlowQueryAlert',
           @step_name = N'Check Slow Queries',
           @command = N'IF (SELECT COUNT(*) FROM sys.dm_exec_requests WHERE total_elapsed_time > 10000) > 100
                       EXEC msdb.dbo.sp_send_dbmail @recipients = ''dba@company.com'',
                       @subject = ''Slow Query Alert'',
                       @body = ''Too many slow queries detected''';
         ```
       </TabItem>
       <TabItem value="mysql" label="MySQL">
         ```sql
         -- 设置慢查询阈值
         SET GLOBAL long_query_time = 2;
         
         -- 配置告警触发条件
         CREATE EVENT slow_query_alert
         ON SCHEDULE EVERY 1 HOUR
         DO BEGIN
           IF (SELECT COUNT(*) FROM slow_log WHERE query_time > 10) > 100 THEN
             CALL send_alert('Too many slow queries detected');
           END IF; 
         END;
         ```
       </TabItem>
       <TabItem value="dm" label="达梦">
         ```sql
         -- 设置慢查询阈值
         ALTER SYSTEM SET SLOW_SQL_THRESHOLD = 2000;
         
         -- 创建告警触发器
         CREATE OR REPLACE TRIGGER slow_query_alert
         AFTER INSERT ON V$SLOW_SQL
         BEGIN
           IF (SELECT COUNT(*) FROM V$SLOW_SQL WHERE ELAPSED_TIME > 10000) > 100 THEN
             SYS.SEND_ALERT('Too many slow queries detected');
           END IF;
         END;
         ```
       </TabItem>
     </Tabs>

   - 定期检查性能指标
     <Tabs>
       <TabItem value="sqlserver" label="SQL Server">
         ```sql
         -- 检查关键性能指标
         SELECT * FROM sys.dm_os_performance_counters;
         SELECT * FROM sys.dm_exec_requests;
         SELECT * FROM sys.dm_os_wait_stats;
         ```
       </TabItem>
       <TabItem value="mysql" label="MySQL">
         ```sql
         -- 检查关键性能指标
         SHOW GLOBAL STATUS LIKE 'Questions';
         SHOW GLOBAL STATUS LIKE 'Slow_queries';
         SHOW GLOBAL STATUS LIKE 'Threads_connected';
         ```
       </TabItem>
       <TabItem value="dm" label="达梦">
         ```sql
         -- 检查关键性能指标
         SELECT * FROM V$SYSSTAT;
         SELECT * FROM V$SESSION;
         SELECT * FROM V$SYSTEM_EVENT;
         ```
       </TabItem>
     </Tabs>

   - 及时处理告警事件

2. 定期优化
   - 分析慢查询日志
     <Tabs>
       <TabItem value="sqlserver" label="SQL Server">
         ```sql
         -- 查看最近的慢查询
         SELECT total_elapsed_time, text
         FROM sys.dm_exec_query_stats
         CROSS APPLY sys.dm_exec_sql_text(sql_handle)
         WHERE creation_time > DATEADD(day, -1, GETDATE())
         ORDER BY total_elapsed_time DESC;
         ```
       </TabItem>
       <TabItem value="mysql" label="MySQL">
         ```sql
         -- 查看最近的慢查询
         SELECT query_time, sql_text
         FROM mysql.slow_log
         WHERE start_time > DATE_SUB(NOW(), INTERVAL 1 DAY)
         ORDER BY query_time DESC
         LIMIT 10;
         ```
       </TabItem>
       <TabItem value="dm" label="达梦">
         ```sql
         -- 查看最近的慢查询
         SELECT ELAPSED_TIME, SQL_TEXT
         FROM V$SLOW_SQL
         WHERE START_TIME > SYSDATE - 1
         ORDER BY ELAPSED_TIME DESC;
         ```
       </TabItem>
     </Tabs>

   - 优化问题SQL
     <Tabs>
       <TabItem value="sqlserver" label="SQL Server">
         ```sql
         -- 添加缺失索引
         CREATE INDEX idx_name ON table(column);
         
         -- 更新统计信息
         UPDATE STATISTICS table_name;
         ```
       </TabItem>
       <TabItem value="mysql" label="MySQL">
         ```sql
         -- 添加缺失索引
         CREATE INDEX idx_name ON table(column);
         
         -- 更新执行计划
         ANALYZE TABLE table_name;
         ```
       </TabItem>
       <TabItem value="dm" label="达梦">
         ```sql
         -- 添加缺失索引
         CREATE INDEX idx_name ON table(column);
         
         -- 收集统计信息
         ANALYZE TABLE table_name COMPUTE STATISTICS;
         ```
       </TabItem>
     </Tabs>

   - 更新统计信息
     <Tabs>
       <TabItem value="sqlserver" label="SQL Server">
         ```sql
         -- SQL Server
         UPDATE STATISTICS table_name;
         ```
       </TabItem>
       <TabItem value="mysql" label="MySQL">
         ```sql
         -- MySQL
         ANALYZE TABLE table_name;
         ```
       </TabItem>
       <TabItem value="dm" label="达梦">
         ```sql
         -- 达梦
         ANALYZE TABLE table_name COMPUTE STATISTICS;
         ```
       </TabItem>
     </Tabs>

   - 维护数据库空间
     <Tabs>
       <TabItem value="sqlserver" label="SQL Server">
         ```sql
         -- 查看表空间使用情况
         EXEC sp_spaceused 'table_name';
         
         -- 回收空间
         DBCC SHRINKDATABASE (database_name);
         ```
       </TabItem>
       <TabItem value="mysql" label="MySQL">
         ```sql
         -- 查看表空间使用情况
         SELECT table_name, data_length, index_length
         FROM information_schema.tables
         WHERE table_schema = 'database_name'
         ORDER BY data_length DESC;
         
         -- 回收空间
         OPTIMIZE TABLE table_name;
         ```
       </TabItem>
       <TabItem value="dm" label="达梦">
         ```sql
         -- 查看表空间使用情况
         SELECT SEGMENT_NAME, BYTES/1024/1024 MB
         FROM USER_SEGMENTS
         ORDER BY BYTES DESC;
         
         -- 回收空间
         ALTER TABLE table_name SHRINK SPACE;
         ```
       </TabItem>
     </Tabs>

3. 应急处理
   - 建立应急预案
     <Tabs>
       <TabItem value="sqlserver" label="SQL Server">
         ```sql
         -- 创建临时表保存重要数据
         SELECT * INTO tmp_backup
         FROM critical_table
         WHERE update_time > DATEADD(day, -1, GETDATE());
         
         -- 终止长时间运行的查询
         SELECT session_id, start_time, sql_handle
         FROM sys.dm_exec_requests
         WHERE start_time < DATEADD(hour, -1, GETDATE());
         ```
       </TabItem>
       <TabItem value="mysql" label="MySQL">
         ```sql
         -- 创建临时表保存重要数据
         CREATE TABLE tmp_backup AS 
         SELECT * FROM critical_table
         WHERE update_time > DATE_SUB(NOW(), INTERVAL 1 DAY);
         
         -- 终止长时间运行的查询
         SELECT trx_id, trx_started
         FROM information_schema.innodb_trx
         WHERE trx_started < NOW() - INTERVAL 1 HOUR;
         ```
       </TabItem>
       <TabItem value="dm" label="达梦">
         ```sql
         -- 创建临时表保存重要数据
         CREATE TABLE tmp_backup AS
         SELECT * FROM critical_table
         WHERE update_time > SYSDATE - 1;
         
         -- 终止长时间运行的查询
         SELECT SID, SQL_TEXT, START_TIME
         FROM V$SESSION
         WHERE START_TIME < SYSDATE - 1/24;
         ```
       </TabItem>
     </Tabs>

   - 定期演练故障恢复
   - 问题快速定位工具
     <Tabs>
       <TabItem value="sqlserver" label="SQL Server">
         ```sql
         -- 查看当前连接
         SELECT * FROM sys.dm_exec_sessions;
         
         -- 查看锁等待
         SELECT * FROM sys.dm_tran_locks;
         
         -- 查看资源使用
         SELECT * FROM sys.dm_os_performance_counters;
         ```
       </TabItem>
       <TabItem value="mysql" label="MySQL">
         ```sql
         -- 查看当前连接
         SHOW PROCESSLIST;
         
         -- 查看锁等待
         SELECT * FROM sys.innodb_lock_waits;
         
         -- 查看资源使用
         SHOW ENGINE INNODB STATUS;
         ```
       </TabItem>
       <TabItem value="dm" label="达梦">
         ```sql
         -- 查看当前连接
         SELECT * FROM V$SESSION;
         
         -- 查看锁等待
         SELECT * FROM V$LOCK;
         
         -- 查看资源使用
         SELECT * FROM V$SYSSTAT;
         ```
       </TabItem>
     </Tabs>

   - 及时止损处理方案
     <Tabs>
       <TabItem value="sqlserver" label="SQL Server">
         ```sql
         -- 限制新连接
         ALTER SERVER CONFIGURATION 
         SET MAX_CONNECTIONS = 10;
         
         -- 终止问题查询
         KILL session_id;
         ```
       </TabItem>
       <TabItem value="mysql" label="MySQL">
         ```sql
         -- 紧急情况下限制新连接
         SET GLOBAL max_connections = 10;
         
         -- 终止问题查询
         KILL QUERY thread_id;
         ```
       </TabItem>
       <TabItem value="dm" label="达梦">
         ```sql
         -- 限制新连接
         ALTER SYSTEM SET MAX_SESSIONS = 10;
         
         -- 终止问题查询
         ALTER SYSTEM KILL SESSION 'sid,serial#';
         ```
       </TabItem>
     </Tabs>


## 参考资料
- [MySQL查询优化](https://dev.mysql.com/doc/refman/8.0/en/optimization-indexes.html)
- [查询性能优化](https://use-the-index-luke.com/)