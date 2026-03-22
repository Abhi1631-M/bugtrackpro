package net.abhishek.bugtrackpro.controller;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import net.abhishek.bugtrackpro.dto.request.ProjectRequestDTO;
import net.abhishek.bugtrackpro.dto.response.ProjectResponseDTO;
import net.abhishek.bugtrackpro.service.ProjectService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @PostMapping
    public ProjectResponseDTO createProject(@Valid @RequestBody ProjectRequestDTO dto) {
        return projectService.createProject(dto);
    }

    @GetMapping
    public List<ProjectResponseDTO> getAllProjects() {
        return projectService.getAllProjects();
    }
    @PreAuthorize("hasRole('PROJECT_ADMIN')")
    @PostMapping("/{projectId}/users/{userId}")
    public ProjectResponseDTO assignUser(
            @PathVariable Long projectId,
            @PathVariable Long userId
    ) {
        return projectService.assignUserToProject(projectId, userId);
    }
}
