package net.abhishek.bugtrackpro.service;

import net.abhishek.bugtrackpro.dto.request.ProjectRequestDTO;
import net.abhishek.bugtrackpro.dto.response.ProjectResponseDTO;

import java.util.List;

public interface ProjectService {

    ProjectResponseDTO createProject(ProjectRequestDTO project);
    List<ProjectResponseDTO> getAllProjects();

    ProjectResponseDTO assignUserToProject(Long projectId, Long userId);
}
