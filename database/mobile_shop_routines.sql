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
-- Dumping routines for database 'mobile_shop'
--
/*!50003 DROP PROCEDURE IF EXISTS `sp_create_item` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_create_item`(
    IN p_sku VARCHAR(50),
    IN p_name VARCHAR(150),
    IN p_brand VARCHAR(100),
    IN p_category VARCHAR(50),
    IN p_price DECIMAL(10, 2),
    IN p_quantity INT,
    IN p_low_stock_threshold INT
)
BEGIN
    INSERT INTO items (
        sku,
        name,
        brand,
        category,
        price,
        quantity,
        low_stock_threshold
    )
    VALUES (
        p_sku,
        p_name,
        p_brand,
        p_category,
        p_price,
        p_quantity,
        p_low_stock_threshold
    );

    SELECT * FROM items
    WHERE id = LAST_INSERT_ID();
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_create_sale` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_create_sale`(
    IN p_items JSON
)
BEGIN
    DECLARE v_done BOOLEAN DEFAULT FALSE;
    DECLARE v_item_id BIGINT;
    DECLARE v_quantity INT;
    DECLARE v_previous_quantity INT;
    DECLARE v_new_quantity INT;
    DECLARE v_unit_price DECIMAL(10,2);
    DECLARE v_subtotal DECIMAL(12,2);
    DECLARE v_total_amount DECIMAL(12,2) DEFAULT 0;
    DECLARE v_sale_id BIGINT;
    DECLARE v_sale_number VARCHAR(30);
    DECLARE v_sale_date DATETIME;
    DECLARE v_item_missing BOOLEAN DEFAULT FALSE;

    DECLARE item_cursor CURSOR FOR
        SELECT item_id, quantity
        FROM tmp_sale_items
        ORDER BY item_id;

    DECLARE sale_cursor CURSOR FOR
        SELECT item_id, quantity, previous_quantity, unit_price
        FROM tmp_sale_items
        ORDER BY item_id;

    DECLARE CONTINUE HANDLER FOR NOT FOUND
        SET v_done = TRUE;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        DROP TEMPORARY TABLE IF EXISTS tmp_sale_items;
        RESIGNAL;
    END;

    IF p_items IS NULL
       OR JSON_TYPE(p_items) <> 'ARRAY'
       OR JSON_LENGTH(p_items) = 0 THEN

        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Sale must contain at least one item';
    END IF;

    DROP TEMPORARY TABLE IF EXISTS tmp_sale_items;

    CREATE TEMPORARY TABLE tmp_sale_items (
        item_id BIGINT NOT NULL PRIMARY KEY,
        quantity INT NOT NULL,
        previous_quantity INT,
        unit_price DECIMAL(10,2)
    );

    IF EXISTS (
        SELECT 1
        FROM JSON_TABLE(
            p_items,
            '$[*]' COLUMNS (
                item_id BIGINT PATH '$.itemId'
                    ERROR ON EMPTY ERROR ON ERROR,
                quantity INT PATH '$.quantity'
                    ERROR ON EMPTY ERROR ON ERROR
            )
        ) AS jt
        WHERE jt.item_id IS NULL
           OR jt.item_id <= 0
           OR jt.quantity IS NULL
           OR jt.quantity <= 0
    ) THEN

        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Invalid item ID or quantity';
    END IF;

    INSERT INTO tmp_sale_items (item_id, quantity)
    SELECT item_id, quantity
    FROM JSON_TABLE(
        p_items,
        '$[*]' COLUMNS (
            item_id BIGINT PATH '$.itemId'
                ERROR ON EMPTY ERROR ON ERROR,
            quantity INT PATH '$.quantity'
                ERROR ON EMPTY ERROR ON ERROR
        )
    ) AS jt;

    START TRANSACTION;

    IF EXISTS (
        SELECT 1
        FROM tmp_sale_items t
        LEFT JOIN items i ON i.id = t.item_id
        WHERE i.id IS NULL
    ) THEN

        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'One or more items do not exist';
    END IF;

    SET v_done = FALSE;

    OPEN item_cursor;

    item_loop: LOOP

        FETCH item_cursor INTO v_item_id, v_quantity;

        IF v_done THEN
            LEAVE item_loop;
        END IF;

        SET v_item_missing = FALSE;
        SET v_previous_quantity = NULL;
        SET v_unit_price = NULL;

        BEGIN
            DECLARE CONTINUE HANDLER FOR NOT FOUND
                SET v_item_missing = TRUE;

            SELECT quantity, price
            INTO v_previous_quantity, v_unit_price
            FROM items
            WHERE id = v_item_id
            FOR UPDATE;
        END;

        IF v_item_missing THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Item not found';
        END IF;

        IF v_previous_quantity < v_quantity THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Insufficient stock for one or more items';
        END IF;

        SET v_new_quantity = v_previous_quantity - v_quantity;

        SET v_subtotal = v_quantity * v_unit_price;

        SET v_total_amount = v_total_amount + v_subtotal;

        UPDATE tmp_sale_items
        SET previous_quantity = v_previous_quantity,
            unit_price = v_unit_price
        WHERE item_id = v_item_id;

    END LOOP;

    CLOSE item_cursor;

    SET v_sale_date = NOW();

    SET v_sale_number = CONCAT('TEMP-', UUID_SHORT());

    INSERT INTO sales (
        sale_number,
        sale_date,
        total_amount
    )
    VALUES (
        v_sale_number,
        v_sale_date,
        v_total_amount
    );

    SET v_sale_id = LAST_INSERT_ID();

    SET v_sale_number = CONCAT(
        'SALE-',
        LPAD(
            CAST(v_sale_id AS CHAR),
            GREATEST(6, CHAR_LENGTH(CAST(v_sale_id AS CHAR))),
            '0'
        )
    );

    UPDATE sales
    SET sale_number = v_sale_number
    WHERE id = v_sale_id;

    SET v_done = FALSE;

    OPEN sale_cursor;

    sale_loop: LOOP

        FETCH sale_cursor
        INTO v_item_id,
             v_quantity,
             v_previous_quantity,
             v_unit_price;

        IF v_done THEN
            LEAVE sale_loop;
        END IF;

        SET v_new_quantity = v_previous_quantity - v_quantity;

        SET v_subtotal = v_quantity * v_unit_price;

        INSERT INTO sale_items (
            sale_id,
            item_id,
            quantity,
            unit_price,
            subtotal
        )
        VALUES (
            v_sale_id,
            v_item_id,
            v_quantity,
            v_unit_price,
            v_subtotal
        );

        UPDATE items
        SET quantity = v_new_quantity
        WHERE id = v_item_id;

        INSERT INTO stock_movements (
            item_id,
            previous_quantity,
            quantity_changed,
            new_quantity,
            movement_type
        )
        VALUES (
            v_item_id,
            v_previous_quantity,
            -v_quantity,
            v_new_quantity,
            'SALE'
        );

    END LOOP;

    CLOSE sale_cursor;

    COMMIT;

    DROP TEMPORARY TABLE IF EXISTS tmp_sale_items;

    SELECT
        v_sale_id AS sale_id,
        v_sale_number AS sale_number,
        v_sale_date AS sale_date,
        v_total_amount AS total_amount;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_delete_item` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_delete_item`(
    IN p_id BIGINT
)
BEGIN
    DELETE FROM items
    WHERE id = p_id;

    SELECT ROW_COUNT() AS affected_rows;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_dashboard_summary` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_dashboard_summary`(
    IN p_start_date DATE,
    IN p_end_date DATE
)
BEGIN

    SELECT

        -- Inventory statistics
        (SELECT COUNT(*) FROM items)
            AS total_items,

        (SELECT COALESCE(SUM(quantity), 0) FROM items)
            AS total_quantity,

        (SELECT COUNT(*)
         FROM items
         WHERE quantity > low_stock_threshold)
            AS healthy_stock_items,

        (SELECT COUNT(*)
         FROM items
         WHERE quantity > 0
           AND quantity <= low_stock_threshold)
            AS low_stock_items,

        (SELECT COUNT(*)
         FROM items
         WHERE quantity = 0)
            AS out_of_stock_items,

        (SELECT COALESCE(SUM(price * quantity), 0)
         FROM items)
            AS potential_stock_sales_value,

        -- Sales statistics for selected date range
        (SELECT COUNT(*)
         FROM sales
         WHERE sale_date >= p_start_date
           AND sale_date < DATE_ADD(p_end_date, INTERVAL 1 DAY))
            AS total_sales,

        (SELECT COALESCE(SUM(total_amount), 0)
         FROM sales
         WHERE sale_date >= p_start_date
           AND sale_date < DATE_ADD(p_end_date, INTERVAL 1 DAY))
            AS total_revenue,

        (SELECT COALESCE(SUM(si.quantity), 0)
         FROM sale_items si
         INNER JOIN sales s ON si.sale_id = s.id
         WHERE s.sale_date >= p_start_date
           AND s.sale_date < DATE_ADD(p_end_date, INTERVAL 1 DAY))
            AS total_units_sold;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_items` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_items`()
begin
	select
		id,
        sku,
        name,
        brand,
        category,
        price,
        quantity,
        low_stock_threshold,
        created_at
	from items
    order by id desc;
end ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_item_by_id` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_item_by_id`(
    IN p_id BIGINT
)
BEGIN
    SELECT
        id, sku, name, brand, category,
        price, quantity, low_stock_threshold, created_at
    FROM items
    WHERE id = p_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_low_stock_items` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_low_stock_items`()
begin
	select
		id,
        sku,
        name,
        brand,
        category,
        price,
        quantity,
        low_stock_threshold,
        created_at
	from items where quantity <= low_stock_threshold
    order by id desc;
end ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_sales_history` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_sales_history`()
BEGIN
    SELECT
        s.id AS sale_id,
        s.sale_number,
        s.sale_date,
        s.total_amount,
        COUNT(si.id) AS product_count,
        COALESCE(SUM(si.quantity), 0) AS total_quantity
    FROM sales s
    LEFT JOIN sale_items si
        ON s.id = si.sale_id
    GROUP BY
        s.id,
        s.sale_number,
        s.sale_date,
        s.total_amount
    ORDER BY s.sale_date DESC;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_sale_details` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_sale_details`(
    IN p_sale_id BIGINT
)
BEGIN
    SELECT
        s.id AS sale_id,
        s.sale_number,
        s.sale_date,
        s.total_amount,
        si.id AS sale_item_id,
        si.item_id,
        i.sku,
        i.name AS item_name,
        si.quantity,
        si.unit_price,
        si.subtotal
    FROM sales s
    INNER JOIN sale_items si
        ON s.id = si.sale_id
    INNER JOIN items i
        ON si.item_id = i.id
    WHERE s.id = p_sale_id
    ORDER BY si.id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_stock_movements` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_stock_movements`()
BEGIN
    SELECT
        sm.id,
        sm.item_id,
        i.name AS item_name,
        i.sku,
        sm.previous_quantity,
        sm.quantity_changed,
        sm.new_quantity,
        sm.movement_type,
        sm.created_at
    FROM stock_movements sm
    INNER JOIN items i ON sm.item_id = i.id
    ORDER BY sm.created_at DESC;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_top_selling_products` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_get_top_selling_products`(
    IN p_start_date DATE,
    IN p_end_date DATE
)
BEGIN

    SELECT
        i.id AS item_id,
        i.sku,
        i.name AS item_name,

        SUM(si.quantity) AS total_quantity_sold,

        SUM(si.subtotal) AS total_revenue

    FROM sale_items si

    INNER JOIN sales s
        ON si.sale_id = s.id

    INNER JOIN items i
        ON si.item_id = i.id

    WHERE s.sale_date >= p_start_date
      AND s.sale_date < DATE_ADD(p_end_date, INTERVAL 1 DAY)

    GROUP BY
        i.id,
        i.sku,
        i.name

    ORDER BY
        total_quantity_sold DESC,
        total_revenue DESC

    LIMIT 5;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_restock_item` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_restock_item`(
    IN p_id BIGINT,
    IN p_quantity_to_add INT
)
BEGIN
    DECLARE v_previous_quantity INT;
    DECLARE v_new_quantity INT;

    IF p_quantity_to_add <= 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Restock quantity must be greater than zero';
    END IF;

    START TRANSACTION;

    SELECT quantity
    INTO v_previous_quantity
    FROM items
    WHERE id = p_id
    FOR UPDATE;

    IF v_previous_quantity IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Item not found';
    END IF;

    SET v_new_quantity = v_previous_quantity + p_quantity_to_add;

    UPDATE items
    SET quantity = v_new_quantity
    WHERE id = p_id;

    INSERT INTO stock_movements (
        item_id,
        previous_quantity,
        quantity_changed,
        new_quantity,
        movement_type
    )
    VALUES (
        p_id,
        v_previous_quantity,
        p_quantity_to_add,
        v_new_quantity,
        'RESTOCK'
    );

    COMMIT;

    SELECT *
    FROM items
    WHERE id = p_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_update_item` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_update_item`(
    IN p_id BIGINT,
    IN p_sku VARCHAR(50),
    IN p_name VARCHAR(150),
    IN p_brand VARCHAR(100),
    IN p_category VARCHAR(50),
    IN p_price DECIMAL(10, 2),
    IN p_quantity INT,
    IN p_low_stock_threshold INT
)
BEGIN
    UPDATE items
    SET
        sku = p_sku,
        name = p_name,
        brand = p_brand,
        category = p_category,
        price = p_price,
        quantity = p_quantity,
        low_stock_threshold = p_low_stock_threshold
    WHERE id = p_id;

    SELECT
        id, sku, name, brand, category,
        price, quantity, low_stock_threshold, created_at
    FROM items
    WHERE id = p_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-03  0:06:25
