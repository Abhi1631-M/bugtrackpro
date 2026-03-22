package net.abhishek.bugtrackpro.repository;

import net.abhishek.bugtrackpro.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, Long> {

}
