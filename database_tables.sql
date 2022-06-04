-- phpMyAdmin SQL Dump
-- version 4.8.3
-- https://www.phpmyadmin.net/
--
-- 主机： localhost
-- 生成日期： 2022-06-04 16:14:17
-- 服务器版本： 10.0.36-MariaDB-0ubuntu0.16.04.1
-- PHP 版本： 7.0.33-0ubuntu0.16.04.5

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

--
-- 数据库： `funds`
--

-- --------------------------------------------------------

--
-- 表的结构 `fund_company`
--

CREATE TABLE `fund_company` (
  `co_id` int(8) NOT NULL,
  `co_code` varchar(10) NOT NULL,
  `co_name` varchar(50) NOT NULL,
  `co_shortname` varchar(10) NOT NULL DEFAULT '''''',
  `co_start` int(8) NOT NULL,
  `co_fundcount` int(4) NOT NULL,
  `co_manager` varchar(20) NOT NULL,
  `co_star` int(4) NOT NULL,
  `co_fundsize` decimal(10,2) NOT NULL,
  `co_ranking` int(4) NOT NULL,
  `update_date` int(8) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 表的结构 `fund_data`
--

CREATE TABLE `fund_data` (
  `fund_id` varchar(6) NOT NULL,
  `date_val` int(11) NOT NULL,
  `shares_position` decimal(7,4) NOT NULL,
  `net_worth` decimal(7,4) NOT NULL,
  `ac_worth` decimal(7,4) NOT NULL,
  `equity_return` decimal(7,4) NOT NULL,
  `unit_money` decimal(7,4) NOT NULL,
  `ranking` decimal(7,4) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 表的结构 `fund_info`
--

CREATE TABLE `fund_info` (
  `fund_id` varchar(6) NOT NULL,
  `fund_name` varchar(50) NOT NULL,
  `fund_type` varchar(30) NOT NULL DEFAULT 'NA',
  `fund_managerId` varchar(8) NOT NULL DEFAULT '0',
  `fs_start` int(8) NOT NULL DEFAULT '0',
  `fund_increase` decimal(7,4) NOT NULL DEFAULT '0.0000',
  `fund_avg_increase` decimal(7,4) NOT NULL DEFAULT '0.0000',
  `fund_cur_ranking` decimal(7,4) NOT NULL DEFAULT '0.0000',
  `fund_avg_ranking` decimal(7,4) NOT NULL DEFAULT '0.0000',
  `fund_ranking_ytd` decimal(7,4) NOT NULL DEFAULT '0.0000',
  `fund_ranking_1w` decimal(7,4) NOT NULL DEFAULT '0.0000',
  `fund_ranking_1m` decimal(7,4) NOT NULL DEFAULT '0.0000',
  `fund_ranking_3m` decimal(7,4) NOT NULL DEFAULT '0.0000',
  `fund_ranking_6m` decimal(7,4) NOT NULL DEFAULT '0.0000',
  `fund_ranking_1y` decimal(7,4) NOT NULL DEFAULT '0.0000',
  `fund_ranking_2y` decimal(7,4) NOT NULL DEFAULT '0.0000',
  `fund_ranking_3y` decimal(7,4) NOT NULL DEFAULT '0.0000',
  `fund_ranking_5y` decimal(7,4) NOT NULL DEFAULT '0.0000',
  `fund_maxdrawdown` decimal(7,4) DEFAULT '0.0000',
  `fund_maxdrawdown_begin` int(8) NOT NULL DEFAULT '0',
  `fund_maxdrawdown_end` int(8) NOT NULL DEFAULT '0',
  `fund_maxincrease` decimal(7,4) NOT NULL DEFAULT '0.0000',
  `fund_maxincrease_begin` int(8) NOT NULL DEFAULT '0',
  `fund_maxincrease_end` int(8) NOT NULL DEFAULT '0',
  `fund_download` int(8) NOT NULL DEFAULT '0',
  `fund_update` int(8) NOT NULL DEFAULT '0',
  `fs_pfm_bond` decimal(7,4) NOT NULL DEFAULT '0.0000',
  `fs_pfm_profit` decimal(7,4) NOT NULL DEFAULT '0.0000',
  `fs_pfm_riskcontrol` decimal(7,4) NOT NULL DEFAULT '0.0000',
  `fs_pfm_consistency` decimal(7,4) NOT NULL DEFAULT '0.0000',
  `fs_pfm_timing` decimal(7,4) NOT NULL DEFAULT '0.0000'
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 表的结构 `fund_manager`
--

CREATE TABLE `fund_manager` (
  `mg_id` int(8) NOT NULL,
  `mg_name` varchar(20) NOT NULL,
  `mg_company` varchar(30) NOT NULL DEFAULT '',
  `mg_star` int(4) NOT NULL,
  `mg_workyear` int(2) NOT NULL,
  `mg_fundsize` decimal(10,2) NOT NULL,
  `mg_fundcount` int(4) NOT NULL,
  `update_date` int(8) NOT NULL,
  `mg_fund_avg_increase` decimal(7,4) NOT NULL DEFAULT '0.0000',
  `mg_best_fund_avg_increase` decimal(7,4) NOT NULL DEFAULT '0.0000'
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 表的结构 `fund_yearly`
--

CREATE TABLE `fund_yearly` (
  `fund_id` varchar(6) NOT NULL,
  `fund_year` int(4) NOT NULL,
  `fund_increase` decimal(7,4) NOT NULL,
  `fund_ranking` decimal(7,4) NOT NULL,
  `fund_avg_ranking` decimal(7,4) NOT NULL,
  `fund_maxdrawdown` decimal(7,4) NOT NULL,
  `fund_maxdrawdown_begin` int(8) NOT NULL,
  `fund_maxdrawdown_end` int(8) NOT NULL,
  `fund_maxincrease` decimal(7,4) NOT NULL,
  `fund_maxincrease_begin` int(8) NOT NULL,
  `fund_maxincrease_end` int(8) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- 转储表的索引
--

--
-- 表的索引 `fund_data`
--
ALTER TABLE `fund_data`
  ADD PRIMARY KEY (`fund_id`,`date_val`);

--
-- 表的索引 `fund_info`
--
ALTER TABLE `fund_info`
  ADD PRIMARY KEY (`fund_id`);
COMMIT;
