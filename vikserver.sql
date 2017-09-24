-- phpMyAdmin SQL Dump
-- version 4.7.3
-- https://www.phpmyadmin.net/
--
-- Servidor: 172.17.0.2:3306
-- Tiempo de generación: 24-09-2017 a las 20:54:45
-- Versión del servidor: 10.1.23-MariaDB-1~jessie
-- Versión de PHP: 7.1.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `vikserver`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `Claves`
--

CREATE TABLE `Claves` (
  `id` varchar(40) COLLATE utf8_bin NOT NULL,
  `private` longtext COLLATE utf8_bin NOT NULL,
  `public` longtext COLLATE utf8_bin NOT NULL,
  `modificado` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `misc`
--

CREATE TABLE `misc` (
  `clave` varchar(20) COLLATE utf8_bin NOT NULL,
  `valor` varchar(100) COLLATE utf8_bin NOT NULL,
  `actualizada` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Tabla de relacciones clave-valor';

--
-- Volcado de datos para la tabla `misc`
--

INSERT INTO `misc` (`clave`, `valor`, `actualizada`) VALUES
('latencia', '19', '2017-09-22 22:57:17'),
('recursos', '{\"cpu\":[0.97314453125,1.05908203125,0.9189453125],\"mem\":{\"rss\":68669440,\"heapTotal\":20209664,\"heapUs', '2017-09-22 22:57:17');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `short`
--

CREATE TABLE `short` (
  `id` int(10) NOT NULL,
  `link` longtext COLLATE utf8_bin NOT NULL,
  `uid` mediumint(30) NOT NULL,
  `usuario` varchar(30) COLLATE utf8_bin NOT NULL,
  `modificado` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `test`
--

CREATE TABLE `test` (
  `id` int(10) NOT NULL,
  `a` varchar(200) CHARACTER SET latin1 NOT NULL,
  `b` varchar(200) CHARACTER SET latin1 NOT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(5) NOT NULL,
  `nombre` varchar(30) COLLATE utf8_bin NOT NULL,
  `db` longtext COLLATE utf8_bin NOT NULL,
  `privateKey` text COLLATE utf8_bin NOT NULL,
  `publicKey` text COLLATE utf8_bin NOT NULL,
  `modificado` bigint(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `Claves`
--
ALTER TABLE `Claves`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `misc`
--
ALTER TABLE `misc`
  ADD PRIMARY KEY (`clave`);

--
-- Indices de la tabla `short`
--
ALTER TABLE `short`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `test`
--
ALTER TABLE `test`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`) USING BTREE;

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `short`
--
ALTER TABLE `short`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
--
-- AUTO_INCREMENT de la tabla `test`
--
ALTER TABLE `test`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(5) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
