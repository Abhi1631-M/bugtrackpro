package net.abhishek.bugtrackpro.service.impl;


import lombok.RequiredArgsConstructor;
import net.abhishek.bugtrackpro.dto.request.ProjectRequestDTO;
import net.abhishek.bugtrackpro.dto.response.ProjectResponseDTO;
import net.abhishek.bugtrackpro.entity.Project;
import net.abhishek.bugtrackpro.entity.ProjectStatus;
import net.abhishek.bugtrackpro.entity.User;
import net.abhishek.bugtrackpro.exception.ResourceNotFoundException;
import net.abhishek.bugtrackpro.mapper.ProjectMapper;
import net.abhishek.bugtrackpro.repository.ProjectRepository;
import net.abhishek.bugtrackpro.repository.UserRepository;
import net.abhishek.bugtrackpro.service.ProjectService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Override
    public ProjectResponseDTO createProject(ProjectRequestDTO projectRequestDTO) {
        Project project=Project.builder()
                .name(projectRequestDTO.getName())
                .description(projectRequestDTO.getDescription())
                .status(ProjectStatus.ACTIVE)
                .startDate(LocalDateTime.now())
                .build();

        Project savedProject=projectRepository.save(project);
        return ProjectMapper.toProjectResponse(savedProject);
    }

    @Override
    public List<ProjectResponseDTO> getAllProjects() {
        return projectRepository.findAll()
                .stream()
                .map(ProjectMapper::toProjectResponse)
                .toList();
    }

    @Override
    public ProjectResponseDTO assignUserToProject(Long projectId, Long userId) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        project.getTeamMembers().add(user);

        Project saved = projectRepository.save(project);

        return ProjectMapper.toProjectResponse(saved);
    }
}
