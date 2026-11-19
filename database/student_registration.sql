-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 19, 2026 at 07:41 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `student_registration`
--

-- --------------------------------------------------------

--
-- Table structure for table `levels`
--

CREATE TABLE `levels` (
  `id` int(11) NOT NULL,
  `level_name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `levels`
--

INSERT INTO `levels` (`id`, `level_name`, `description`, `created_at`) VALUES
(1, 'Level 3', 'Third level', '2026-11-10 12:24:11'),
(2, 'Level 4', 'Fourth level', '2026-11-10 12:24:11'),
(3, 'Level 5', 'Fifth level', '2026-11-10 12:24:11');

-- --------------------------------------------------------

--
-- Table structure for table `programs`
--

CREATE TABLE `programs` (
  `id` int(11) NOT NULL,
  `program_name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `programs`
--

INSERT INTO `programs` (`id`, `program_name`, `description`, `status`, `created_at`) VALUES
(1, 'Software Development', 'Software and application development', 'Active', '2026-11-10 12:24:11'),
(2, 'Networking', 'Computer networking and infrastructure', 'Active', '2026-11-10 12:24:11'),
(3, 'Computer Systems', 'Computer hardware and systems', 'Active', '2026-11-10 12:24:11'),
(4, 'Information Technology', 'General information technology', 'Active', '2026-11-10 12:24:11');

-- --------------------------------------------------------

--
-- Table structure for table `registrations`
--

CREATE TABLE `registrations` (
  `id` int(11) NOT NULL,
  `registration_number` varchar(50) NOT NULL,
  `student_id` int(11) NOT NULL,
  `registration_date` date NOT NULL,
  `academic_year` varchar(20) NOT NULL,
  `status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `registered_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `student_id` varchar(50) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `gender` enum('Male','Female','Other') NOT NULL,
  `date_of_birth` date NOT NULL,
  `phone` varchar(30) NOT NULL,
  `email` varchar(150) NOT NULL,
  `address` varchar(255) NOT NULL,
  `program` varchar(100) NOT NULL,
  `level` varchar(30) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `student_id`, `full_name`, `gender`, `date_of_birth`, `phone`, `email`, `address`, `program`, `level`, `created_at`, `updated_at`) VALUES
(1, 'S001', 'Uwase Aline', 'Female', '2007-05-15', '0780000000', 'aline@example.com', 'Kigali, Rwanda', 'Software Development', 'Level 5', '2026-11-10 12:24:11', '2026-11-10 12:24:11'),
(3, 's0003', 'uwimana anastase', 'Female', '2026-11-05', '07888844444', 'danielkwibuka@gmail.com', 'nyarugenge', 'vet', 'Level 5', '2026-11-10 12:29:44', '2026-11-10 12:29:44'),
(4, 's0001', 'ganza emanuel', 'Male', '2026-11-13', '07233366532', 'danielkwibuka4@gmail.com', 'burera', 'hgl', 'Level 5', '2026-11-11 10:16:09', '2026-11-11 10:16:09'),
(7, 'S0010', 'KWIBUKA DANIEL', 'Female', '2026-11-12', '0788123456', 'danielkwibuka00@gmail.com', 'kigali', 'Software Development', 'Level 3', '2026-11-11 14:07:10', '2026-11-11 14:07:10');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('Admin','Staff','User') DEFAULT 'User',
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `levels`
--
ALTER TABLE `levels`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `level_name` (`level_name`);

--
-- Indexes for table `programs`
--
ALTER TABLE `programs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `program_name` (`program_name`);

--
-- Indexes for table `registrations`
--
ALTER TABLE `registrations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `registration_number` (`registration_number`),
  ADD KEY `fk_registration_student` (`student_id`),
  ADD KEY `fk_registration_user` (`registered_by`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `student_id` (`student_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `levels`
--
ALTER TABLE `levels`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `programs`
--
ALTER TABLE `programs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `registrations`
--
ALTER TABLE `registrations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `registrations`
--
ALTER TABLE `registrations`
  ADD CONSTRAINT `fk_registration_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_registration_user` FOREIGN KEY (`registered_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
