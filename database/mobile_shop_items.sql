CREATE DATABASE  IF NOT EXISTS `mobile_shop` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `mobile_shop`;
-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: mobile_shop
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `items`
--

DROP TABLE IF EXISTS `items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `sku` varchar(50) NOT NULL,
  `name` varchar(150) NOT NULL,
  `brand` varchar(100) NOT NULL,
  `category` varchar(50) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `quantity` int NOT NULL DEFAULT '0',
  `low_stock_threshold` int NOT NULL DEFAULT '5',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku` (`sku`),
  CONSTRAINT `chk_item_price` CHECK ((`price` >= 0)),
  CONSTRAINT `chk_item_quantity` CHECK ((`quantity` >= 0)),
  CONSTRAINT `chk_item_threshold` CHECK ((`low_stock_threshold` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `items`
--

LOCK TABLES `items` WRITE;
/*!40000 ALTER TABLE `items` DISABLE KEYS */;
INSERT INTO `items` VALUES (1,'DEMO-MOB-001','Galaxy A15','Samsung','Smartphone',62900.00,99,5,'2025-11-01 04:30:00'),(2,'DEMO-MOB-002','Galaxy A25','Samsung','Smartphone',89900.00,99,8,'2025-11-07 04:30:00'),(3,'DEMO-MOB-003','Galaxy S24 FE','Samsung','Smartphone',219900.00,99,10,'2025-11-13 04:30:00'),(4,'DEMO-MOB-004','iPhone 13','Apple','Smartphone',189900.00,99,12,'2025-11-19 04:30:00'),(5,'DEMO-MOB-005','iPhone 14','Apple','Smartphone',239900.00,99,5,'2025-11-25 04:30:00'),(6,'DEMO-MOB-006','iPhone 15','Apple','Smartphone',289900.00,99,8,'2025-12-01 04:30:00'),(7,'DEMO-MOB-007','Redmi Note 13','Xiaomi','Smartphone',74900.00,99,10,'2025-12-07 04:30:00'),(8,'DEMO-MOB-008','Redmi 13C','Xiaomi','Smartphone',42900.00,99,12,'2025-12-13 04:30:00'),(9,'DEMO-MOB-009','Poco X6','Xiaomi','Smartphone',109900.00,99,5,'2025-12-19 04:30:00'),(10,'DEMO-MOB-010','Oppo A60','Oppo','Smartphone',69900.00,99,8,'2025-12-25 04:30:00'),(11,'DEMO-MOB-011','Oppo Reno 11F','Oppo','Smartphone',119900.00,99,10,'2025-12-31 04:30:00'),(12,'DEMO-MOB-012','Vivo Y28','Vivo','Smartphone',64900.00,99,12,'2026-01-06 04:30:00'),(13,'DEMO-MOB-013','Vivo V30','Vivo','Smartphone',149900.00,99,5,'2026-01-12 04:30:00'),(14,'DEMO-MOB-014','OnePlus Nord CE 4','OnePlus','Smartphone',139900.00,99,8,'2026-01-18 04:30:00'),(15,'DEMO-MOB-015','OnePlus 12R','OnePlus','Smartphone',199900.00,99,10,'2026-01-24 04:30:00'),(16,'DEMO-MOB-016','Realme C67','Realme','Smartphone',59900.00,99,12,'2026-01-30 04:30:00'),(17,'DEMO-MOB-017','Realme 12 Pro','Realme','Smartphone',129900.00,99,5,'2026-02-05 04:30:00'),(18,'DEMO-MOB-018','Nokia G42','Nokia','Smartphone',57900.00,99,8,'2026-02-11 04:30:00'),(19,'DEMO-MOB-019','Moto G54','Motorola','Smartphone',79900.00,99,10,'2026-02-17 04:30:00'),(20,'DEMO-MOB-020','Galaxy Tab A9','Samsung','Tablet',89900.00,99,12,'2026-02-23 04:30:00'),(21,'DEMO-MOB-021','iPad 10th Gen','Apple','Tablet',189900.00,99,5,'2026-03-01 04:30:00'),(22,'DEMO-MOB-022','Redmi Pad SE','Xiaomi','Tablet',79900.00,99,8,'2026-03-07 04:30:00'),(23,'DEMO-MOB-023','USB-C 25W Charger','Samsung','Charger',8900.00,99,10,'2026-03-13 04:30:00'),(24,'DEMO-MOB-024','Apple 20W Adapter','Apple','Charger',11900.00,99,12,'2026-03-19 04:30:00'),(25,'DEMO-MOB-025','33W Fast Charger','Xiaomi','Charger',6500.00,99,5,'2026-03-25 04:30:00'),(26,'DEMO-MOB-026','USB-C Cable 1m','Anker','Cable',2900.00,99,8,'2026-03-31 04:30:00'),(27,'DEMO-MOB-027','Braided USB-C Cable','Anker','Cable',3900.00,99,10,'2026-04-06 04:30:00'),(28,'DEMO-MOB-028','Lightning Cable','Apple','Cable',5900.00,99,12,'2026-04-12 04:30:00'),(29,'DEMO-MOB-029','Galaxy Buds FE','Samsung','Earbuds',29900.00,99,5,'2026-04-18 04:30:00'),(30,'DEMO-MOB-030','AirPods 3','Apple','Earbuds',69900.00,99,8,'2026-04-24 04:30:00'),(31,'DEMO-MOB-031','Redmi Buds 5','Xiaomi','Earbuds',14900.00,99,10,'2026-04-30 04:30:00'),(32,'DEMO-MOB-032','Oppo Enco Buds 2','Oppo','Earbuds',11900.00,99,12,'2026-05-06 04:30:00'),(33,'DEMO-MOB-033','Silicone Case - Galaxy A15','Generic','Case',1800.00,99,5,'2026-05-12 04:30:00'),(34,'DEMO-MOB-034','Clear Case - iPhone 15','Generic','Case',2500.00,99,8,'2026-05-18 04:30:00'),(35,'DEMO-MOB-035','Rugged Case - Redmi Note 13','Generic','Case',2200.00,99,10,'2026-05-24 04:30:00'),(36,'DEMO-MOB-036','Tempered Glass - Galaxy A25','Generic','Screen Protector',1200.00,99,12,'2026-05-30 04:30:00'),(37,'DEMO-MOB-037','Privacy Glass - iPhone 14','Generic','Screen Protector',1900.00,99,5,'2026-06-05 04:30:00'),(38,'DEMO-MOB-038','PowerCore 10000','Anker','Power Bank',15900.00,99,8,'2026-06-11 04:30:00'),(39,'DEMO-MOB-039','Power Bank 20000mAh','Xiaomi','Power Bank',18900.00,99,10,'2026-06-17 04:30:00'),(40,'DEMO-MOB-040','Galaxy Fit3','Samsung','Smartwatch',24900.00,99,12,'2026-06-23 04:30:00'),(41,'DEMO-MOB-041','Apple Watch SE','Apple','Smartwatch',99900.00,99,5,'2026-06-29 04:30:00'),(42,'DEMO-MOB-042','Mi Band 8','Xiaomi','Smartwatch',15900.00,99,8,'2026-07-05 04:30:00'),(43,'DEMO-MOB-043','Bluetooth Speaker Mini','Anker','Audio',12900.00,99,10,'2026-07-11 04:30:00'),(44,'DEMO-MOB-044','Soundcore Q20i','Anker','Audio',24900.00,99,12,'2026-07-17 04:30:00'),(45,'DEMO-MOB-045','65W GaN Charger','Anker','Charger',22900.00,99,5,'2026-07-23 04:30:00'),(46,'DEMO-MOB-046','Car Charger Dual USB','Generic','Charger',4500.00,99,8,'2026-07-29 04:30:00'),(47,'DEMO-MOB-047','OTG USB-C Adapter','Generic','Cable',1500.00,99,10,'2026-08-04 04:30:00'),(48,'DEMO-MOB-048','Universal Phone Stand','Generic','Audio',3200.00,99,12,'2026-08-10 04:30:00'),(49,'DEMO-MOB-049','Wireless Charging Pad','Anker','Charger',11900.00,99,5,'2026-08-16 04:30:00'),(50,'DEMO-MOB-050','Camera Lens Protector','Generic','Screen Protector',1600.00,99,8,'2026-08-22 04:30:00');
/*!40000 ALTER TABLE `items` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-03  0:06:24
