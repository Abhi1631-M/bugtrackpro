package net.abhishek.bugtrackpro.mapper;


import net.abhishek.bugtrackpro.dto.response.ProjectResponseDTO;
import net.abhishek.bugtrackpro.entity.Project;

public class ProjectMapper {

    public static ProjectResponseDTO toProjectResponse(Project project) {
        return ProjectResponseDTO.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .status(project.getStatus())
                .build();
    }
}
