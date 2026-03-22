package net.abhishek.bugtrackpro.dto.response;

import lombok.*;
import net.abhishek.bugtrackpro.entity.ProjectStatus;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectResponseDTO {

    private Long id;
    private String name;
    private String description;
    private ProjectStatus status;
}
