---
id: index-optimization
title: 索引基础
sidebar_label: 索引优化
description: 学习如何设计和使用高效的索引
draft: false
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## 索引类型与特性

### 1. 常见索引类型

- **B-Tree 索引**：最常用的索引类型,适用于等值查询和范围查询
- **Hash 索引**：只适用于等值查询,查询速度快但不支持范围查询
- **全文索引**：用于全文检索
- **位图索引**：适用于低基数列的查询

### 2. 索引关键特性

- **唯一性**：确保索引列的值唯一
- **选择性**：不同值与总记录数的比率
- **覆盖性**：索引包含查询所需的所有列
- **聚集性**：数据的物理存储顺序

## 索引设计原则

### 1. 适合建立索引的场景

- WHERE 子句中经常使用的列
- 经常需要排序(ORDER BY)的列
- 经常用于连接(JOIN)的列
- 经常需要分组(GROUP BY)的列

### 2. 避免索引的场景

- 数据量很小的表
- 频繁更新的列
- 选择性很低的列(如性别)
- 字符串列建立过长的前缀索引

## 索引优化实践

### 1. 索引设计优化

<Tabs>
  <TabItem value="sqlserver" label="SQL Server" default>
    ```sql
    -- 创建复合索引
    CREATE INDEX idx_name_age ON users(name, age);
    
    -- 创建包含列的索引
    CREATE INDEX idx_name_include 
    ON users(name) INCLUDE(email, phone);
    
    -- 创建过滤索引
    CREATE INDEX idx_status 
    ON orders(status) WHERE status = 'active';
    ```
  </TabItem>
  <TabItem value="mysql" label="MySQL" >
    ```sql
    -- 创建复合索引
    CREATE INDEX idx_name_age ON users(name, age);
    
    -- 创建前缀索引
    CREATE INDEX idx_email ON users(email(10));
    
    -- 创建降序索引
    CREATE INDEX idx_create_time ON orders(create_time DESC);
    ```
  </TabItem>
  <TabItem value="dm" label="达梦">
    ```sql
    -- 创建复合索引
    CREATE INDEX idx_name_age ON users(name, age);
    
    -- 创建函数索引
    CREATE INDEX idx_upper_name 
    ON users(UPPER(name));
    
    -- 创建部分索引
    CREATE INDEX idx_status ON orders(status)
    WHERE status = 'active';
    ```
  </TabItem>
</Tabs>

### 2. 索引维护策略

<Tabs>
  <TabItem value="sqlserver" label="SQL Server" default>
    ```sql
    -- 重建索引
    ALTER INDEX ALL ON users REBUILD;
    
    -- 更新统计信息
    UPDATE STATISTICS users WITH FULLSCAN;
    
    -- 查看索引碎片情况
    SELECT * FROM sys.dm_db_index_physical_stats
    (DB_ID(), OBJECT_ID('users'), NULL, NULL, 'DETAILED');
    ```
  </TabItem>
  <TabItem value="mysql" label="MySQL" >
    ```sql
    -- 重建索引
    ALTER TABLE users DROP INDEX idx_name;
    ALTER TABLE users ADD INDEX idx_name(name);
    
    -- 更新统计信息
    ANALYZE TABLE users;
    
    -- 查看索引使用情况
    SHOW INDEX FROM users;
    ```
  </TabItem>
  <TabItem value="dm" label="达梦">
    ```sql
    -- 重建索引
    ALTER INDEX idx_name REBUILD;
    
    -- 更新统计信息
    ANALYZE TABLE users COMPUTE STATISTICS;
    
    -- 查看索引信息
    SELECT * FROM USER_INDEXES 
    WHERE TABLE_NAME = 'USERS';
    ```
  </TabItem>
</Tabs>

### 3. 索引监控与诊断

<Tabs>
  <TabItem value="sqlserver" label="SQL Server" default>
    ```sql
    -- 查看索引使用统计
    SELECT * FROM sys.dm_db_index_usage_stats;
    
    -- 查看缺失索引
    SELECT * FROM sys.dm_db_missing_index_details;
    
    -- 查看索引碎片
    SELECT * FROM sys.dm_db_index_physical_stats;
    ```
  </TabItem>
  <TabItem value="mysql" label="MySQL" >
    ```sql
    -- 查看索引使用情况
    SELECT * FROM performance_schema.table_io_waits_summary_by_index_usage;
    
    -- 查看未使用的索引
    SELECT * FROM sys.schema_unused_indexes;
    
    -- 查看重复索引
    SELECT * FROM sys.schema_redundant_indexes;
    ```
  </TabItem>
  <TabItem value="dm" label="达梦">
    ```sql
    -- 查看索引统计信息
    SELECT * FROM V$SYSSTAT 
    WHERE NAME LIKE '%index%';
    
    -- 查看索引使用情况
    SELECT * FROM V$OBJECT_USAGE;
    
    -- 查看索引碎片情况
    SELECT * FROM V$INDEX_STATS;
    ```
  </TabItem>
</Tabs>

## 参考资料

- [MySQL 索引优化官方文档](https://dev.mysql.com/doc/refman/8.0/en/optimization-indexes.html)
- [SQL Server 自动优化指南](https://learn.microsoft.com/zh-cn/sql/relational-databases/automatic-tuning/automatic-tuning)
- [达梦数据库性能优化](https://eco.dameng.com/document/dm/zh-cn/ops/performance-optimization.html)
