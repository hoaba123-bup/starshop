-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: starshop
-- ------------------------------------------------------
-- Server version	8.0.44

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
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Thời trang','active','2025-12-02 16:23:03',NULL),(2,'Giày dép','active','2025-12-02 16:23:03',NULL),(3,'Phụ kiện','active','2025-12-02 16:23:03',NULL);
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orderId` int NOT NULL,
  `productId` int DEFAULT NULL,
  `productName` varchar(255) DEFAULT NULL,
  `quantity` int NOT NULL,
  `price` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `orderId` (`orderId`),
  KEY `productId` (`productId`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,6,'Áo 3 lỗ',1,40000.00),(2,2,3,'Giày sneaker trắng',1,899000.00),(3,3,4,'Tai nghe không dây',1,1299000.00),(4,4,6,'Áo 3 lỗ',2,40000.00),(5,5,6,'Áo 3 lỗ',1,40000.00),(6,6,6,'Áo 3 lỗ',1,40000.00),(7,6,3,'Giày sneaker trắng',1,899000.00);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) NOT NULL,
  `userId` int DEFAULT NULL,
  `customerName` varchar(255) DEFAULT NULL,
  `customerEmail` varchar(255) DEFAULT NULL,
  `customerPhone` varchar(50) DEFAULT NULL,
  `shippingAddress` varchar(500) DEFAULT NULL,
  `paymentMethod` varchar(50) DEFAULT 'cod',
  `status` enum('pending','approved','cancelled') DEFAULT 'pending',
  `totalAmount` decimal(12,2) DEFAULT '0.00',
  `notes` text,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `userId` (`userId`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'ORDMIOJ8MS22',2,'nguyen','nguyen@gmail.com','0393065314','sdfsdf','cod','approved',40000.00,NULL,'2025-12-02 19:06:35','2025-12-02 19:17:33'),(2,'ORDMIOJ9AWM4',2,'nguyen','sdf@gmail.com,','0393065314','sdfsdf','cod','cancelled',899000.00,NULL,'2025-12-02 19:07:07','2025-12-02 20:33:05'),(3,'ORDMIOLYJFE7',2,'nguyen','nguyen@gmail.com','0393065314','sdf','cod','approved',1299000.00,NULL,'2025-12-02 20:22:43','2025-12-02 20:36:19'),(4,'ORDMIORC1WW3',2,'nguyen','laotuyentvm@gmail.com','0393065314','abc','cod','cancelled',80000.00,NULL,'2025-12-02 22:53:14','2025-12-03 00:03:32'),(5,'ORDMIOSDUPR2',2,'nguyen','laotuyentvm@gmail.com','0393065314','abc','cod','approved',40000.00,NULL,'2025-12-02 23:22:35','2025-12-03 00:03:35'),(6,'ORDMIOU00ZP6',2,'hoa ba','bahoa12346@gmail.com','0391323123','abc','cod','approved',939000.00,NULL,'2025-12-03 00:07:50','2025-12-03 00:08:00');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `stock` int DEFAULT '0',
  `description` text,
  `imageUrl` varchar(500) DEFAULT NULL,
  `categoryId` int DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_name` (`name`),
  KEY `idx_category` (`categoryId`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Áo thun basic',199000.00,0,'Cotton 100%','https://bizweb.dktcdn.net/100/347/212/products/42f34efaa96001c1035183aea991f53560810959.jpg?v=168975303368300?text=Ao+thun',1,'active','2025-12-02 16:23:03','2025-12-02 21:50:56'),(2,'Quần jeans slim fit',499000.00,0,'Co giãn nhẹ','https://product.hstatic.net/200000370509/product/9869_5767b202c4694e6e855db90ad7fb1708_989de4484d0140d5900136c4cd6a1f4a_250efb42fc3a4258a6dc6534856b3771_master.jpg',1,'active','2025-12-02 16:23:03','2025-12-02 21:51:28'),(3,'Giày sneaker trắng',899000.00,9,'Đế cao su','https://ngockhanhstore.vn/wp-content/uploads/2022/12/giay-nam-mau-trang-2.jpg',2,'active','2025-12-02 16:23:03','2025-12-03 00:07:50'),(4,'Tai nghe không dây',1299000.00,0,'Chống ồn','https://edifier.com.vn/wp-content/uploads/2024/05/day-nghe-khong-day-W830NB.jpg',3,'active','2025-12-02 16:23:03','2025-12-02 21:50:00'),(5,'Balo laptop 15 inch',599000.00,0,'Chống nước nhẹ','https://cdn.tgdd.vn/Products/Images/7923/328646/balo-laptop-15-6-inch-togo-tgb05-den-1-750x500.jpg',3,'active','2025-12-02 16:23:03','2025-12-02 21:51:51'),(6,'Áo 3 lỗ',40000.00,995,'áo có 3 màu: trắng, đen, xám','https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRO9Mi-leBcAdew0jWwDtUtiiICbTjPqeHUk8Np58mkGh1ZmHTJb10NPYiUtyky6NwvffXZ-COkryhiW8rrwtxPZZ_T9DUlx6zKwqlVtN_OM48gOoUX2riLNo_yIMcxCANWk7Vn_WU&usqp=CAc',1,'active','2025-12-02 19:02:55','2025-12-03 00:07:50');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fullName` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` enum('user','admin','staff') DEFAULT 'user',
  `status` varchar(50) DEFAULT 'active',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'nguyen123','nguyen@gmail.com','$2b$10$ZzwJOCgzQgtHorNtN1hcEOqGQpRYT2a2jtntUa2no337XU4NN5MQ6','0393065314','user','active','2025-12-02 08:44:24','2025-12-02 20:36:36'),(2,'Administrator','admin@gmail.com','$2b$10$KvgiUrqvpJKGCx92PnJ60uARTxKnc4Fl.JRMi9FVhSsK37TTesarC',NULL,'admin','active','2025-12-02 11:17:50',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-03  0:28:52
