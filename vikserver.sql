-- phpMyAdmin SQL Dump
-- version 4.7.3
-- https://www.phpmyadmin.net/
--
-- Servidor: 172.17.0.2:3306
-- Tiempo de generación: 13-10-2017 a las 14:49:58
-- Versión del servidor: 10.1.23-MariaDB-1~jessie
-- Versión de PHP: 7.1.10

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
('latencia', '16.6', '2017-10-13 14:48:15'),
('recursos', '{\"cpu\":[0.662109375,0.8798828125,1.0224609375],\"mem\":{\"rss\":50040832,\"heapTotal\":19005440,\"heapUsed\"', '2017-10-13 14:48:15');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `short`
--

CREATE TABLE `short` (
  `id` int(10) NOT NULL,
  `link` longtext COLLATE utf8_bin NOT NULL,
  `uid` varchar(30) COLLATE utf8_bin NOT NULL,
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
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;
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
